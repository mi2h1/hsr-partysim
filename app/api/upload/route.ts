// CSV アップロード API
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CSVAnalyzer } from '@/lib/csvAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'CSVファイルが選択されていません' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const analyzer = new CSVAnalyzer();
    
    // CSV解析
    const characterData = analyzer.parseCSV(csvContent);
    
    // トランザクション開始
    await query('BEGIN');
    
    try {
      // キャラクター情報を保存
      const characterResult = await query(`
        INSERT INTO characters (name, element, path)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          element = EXCLUDED.element,
          path = EXCLUDED.path
        RETURNING id
      `, [characterData.name, characterData.element, characterData.path]);
      
      const characterId = characterResult.rows[0].id;
      
      // 既存のスキルデータを削除
      await query('DELETE FROM skills WHERE character_id = $1', [characterId]);
      
      // スキル情報を保存
      for (const skill of characterData.skills) {
        const skillResult = await query(`
          INSERT INTO skills (character_id, skill_type, skill_name, description)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [characterId, skill.type, skill.name, skill.description]);
        
        const skillId = skillResult.rows[0].id;
        
        // バフ・デバフ解析と保存
        const buffsDebuffs = analyzer.analyzeBuffsDebuffs(skill.type, skill.description);
        
        for (const buff of buffsDebuffs) {
          const buffResult = await query(`
            INSERT INTO buffs_debuffs 
            (skill_id, effect_name, target_type, stat_affected, value_expression, 
             duration, condition, is_stackable, max_stacks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
          `, [
            skillId, buff.effectName, buff.targetType, buff.statAffected,
            buff.valueExpression, buff.duration, buff.condition,
            buff.isStackable, buff.maxStacks
          ]);
          
          // 星魂強化の処理
          if (skill.type.startsWith('星魂')) {
            const eidolonLevel = parseInt(skill.type.replace('星魂', ''));
            if (!isNaN(eidolonLevel)) {
              await query(`
                INSERT INTO eidolon_enhancements
                (buff_debuff_id, eidolon_level, enhancement_type, enhanced_value)
                VALUES ($1, $2, $3, $4)
              `, [
                buffResult.rows[0].id,
                eidolonLevel,
                'new_effect',
                buff.valueExpression
              ]);
            }
          }
        }
      }
      
      // トランザクションコミット
      await query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: `キャラクター「${characterData.name}」のデータを正常にアップロードしました`,
        character: {
          id: characterId,
          name: characterData.name,
          element: characterData.element,
          path: characterData.path,
          skills_count: characterData.skills.length
        }
      });
      
    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError;
    }
    
  } catch (error) {
    console.error('CSV アップロードエラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'CSV アップロードに失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}