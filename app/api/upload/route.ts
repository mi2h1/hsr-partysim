// CSV アップロード API
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CSVAnalyzer } from '@/lib/csvAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csvFile') as File || formData.get('csv') as File;
    const replaceCharacterId = formData.get('replaceCharacterId') as string;
    
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
      let characterId: number;

      if (replaceCharacterId) {
        // 既存キャラクターIDが指定された場合（再取り込み）
        characterId = parseInt(replaceCharacterId);
        console.log('再取り込みモード: キャラクターID', characterId);
        
        // 既存データを正しい順序で削除（外部キー制約を考慮）
        // 1. 星魂強化データを削除（buffs_debuffsを参照している）
        const deleteEidolonEnhancementsResult = await query(`
          DELETE FROM eidolon_enhancements 
          WHERE buff_debuff_id IN (
            SELECT bd.id FROM buffs_debuffs bd
            JOIN skills s ON bd.skill_id = s.id
            WHERE s.character_id = $1
          )
        `, [characterId]);
        
        // 2. バフ・デバフデータを削除
        const deleteBuffsResult = await query(`
          DELETE FROM buffs_debuffs 
          WHERE skill_id IN (SELECT id FROM skills WHERE character_id = $1)
        `, [characterId]);
        
        // 3. スキルデータを削除
        const deleteSkillsResult = await query('DELETE FROM skills WHERE character_id = $1', [characterId]);
        
        console.log('削除結果 - 星魂強化:', (deleteEidolonEnhancementsResult as any).rowCount || 0, 'バフ/デバフ:', (deleteBuffsResult as any).rowCount || 0, 'スキル:', (deleteSkillsResult as any).rowCount || 0);
        
        // キャラクター基本情報を更新
        const updateResult = await query(`
          UPDATE characters 
          SET name = $1, element = $2, path = $3, version = COALESCE($4, version)
          WHERE id = $5
        `, [characterData.name, characterData.element, characterData.path, characterData.version, characterId]);
        
        if ((updateResult as any).rowCount === 0) {
          throw new Error(`キャラクターID ${characterId} が見つかりません`);
        }
        console.log('キャラクター情報更新完了:', characterData.name);
        
      } else {
        // 通常の新規登録
        const characterResult = await query(`
          INSERT INTO characters (name, element, path, version)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO UPDATE SET
            element = EXCLUDED.element,
            path = EXCLUDED.path,
            version = COALESCE(EXCLUDED.version, characters.version)
          RETURNING id
        `, [characterData.name, characterData.element, characterData.path, characterData.version]);
        
        characterId = characterResult.rows[0].id;

        // 既存データを正しい順序で削除（通常の更新時）
        // 1. 星魂強化データを削除
        await query(`
          DELETE FROM eidolon_enhancements 
          WHERE buff_debuff_id IN (
            SELECT bd.id FROM buffs_debuffs bd
            JOIN skills s ON bd.skill_id = s.id
            WHERE s.character_id = $1
          )
        `, [characterId]);
        
        // 2. バフ・デバフデータを削除
        await query(`
          DELETE FROM buffs_debuffs 
          WHERE skill_id IN (SELECT id FROM skills WHERE character_id = $1)
        `, [characterId]);
        
        // 3. スキルデータを削除
        await query('DELETE FROM skills WHERE character_id = $1', [characterId]);
      }
      
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