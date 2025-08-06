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
    
    // CSV解析（新フォーマット対応）
    const parsedData = analyzer.parseCSV(csvContent);
    const { buffsDebuffs, eidolonEnhancements, ...characterData } = parsedData;
    
    // トランザクション開始
    await query('BEGIN');
    
    try {
      // キャラクター情報を保存
      const characterResult = await query(`
        INSERT INTO characters (name, element, path, version)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET
          element = EXCLUDED.element,
          path = EXCLUDED.path,
          version = COALESCE(EXCLUDED.version, characters.version)
        RETURNING id
      `, [characterData.name, characterData.element, characterData.path, characterData.version]);
      
      const characterId = characterResult.rows[0].id;
      
      // 既存のスキルデータを削除
      await query('DELETE FROM skills WHERE character_id = $1', [characterId]);
      
      // スキル情報を保存
      const skillIdMap = new Map<string, number>();
      
      for (const skill of characterData.skills) {
        const skillResult = await query(`
          INSERT INTO skills (character_id, skill_type, skill_name, description)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [characterId, skill.type, skill.name, skill.description]);
        
        const skillId = skillResult.rows[0].id;
        skillIdMap.set(skill.type, skillId);
      }
      
      // 構造化されたバフ・デバフ情報を保存
      for (const buff of buffsDebuffs) {
        const skillId = skillIdMap.get(buff.skillType || '');
        if (!skillId) continue;
        
        const buffResult = await query(`
          INSERT INTO buffs_debuffs 
          (skill_id, effect_name, buff_type, target_type, stat_affected, value_expression, 
           duration, condition, is_stackable, max_stacks)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `, [
          skillId, buff.effectName, buff.buffType, buff.targetType, buff.statAffected,
          buff.valueExpression, buff.duration, buff.condition,
          buff.isStackable, buff.maxStacks
        ]);
      }
      
      // 星魂強化情報を保存
      for (const enhancement of eidolonEnhancements) {
        // 対応するバフ・デバフを見つける
        const matchingBuff = buffsDebuffs.find(buff => 
          buff.skillType === `星魂${enhancement.eidolonLevel}`
        );
        
        if (matchingBuff) {
          const skillId = skillIdMap.get(matchingBuff.skillType || '');
          if (skillId) {
            // バフ・デバフIDを取得
            const buffResult = await query(`
              SELECT id FROM buffs_debuffs 
              WHERE skill_id = $1 AND effect_name = $2
              LIMIT 1
            `, [skillId, matchingBuff.effectName]);
            
            if (buffResult.rows.length > 0) {
              await query(`
                INSERT INTO eidolon_enhancements
                (buff_debuff_id, eidolon_level, enhancement_type, enhanced_value)
                VALUES ($1, $2, $3, $4)
              `, [
                buffResult.rows[0].id,
                enhancement.eidolonLevel,
                enhancement.enhancementType,
                enhancement.enhancedValue
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