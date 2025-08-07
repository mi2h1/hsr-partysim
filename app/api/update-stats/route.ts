// キャラクターステータス専用更新API
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csvFile') as File || formData.get('csv') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'CSVファイルが選択されていません' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    
    // CSVヘッダーの検証
    if (lines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSVファイルが空です' },
        { status: 400 }
      );
    }
    
    // 期待するヘッダー形式
    const expectedHeader = 'キャラクター名,HP,攻撃力,防御力,速度,EP,ステータスブースト1種別,ステータスブースト1数値,ステータスブースト2種別,ステータスブースト2数値,ステータスブースト3種別,ステータスブースト3数値';
    const actualHeader = lines[0];
    
    if (actualHeader !== expectedHeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'CSVヘッダーが正しくありません',
          details: `期待: ${expectedHeader}\n実際: ${actualHeader}`
        },
        { status: 400 }
      );
    }

    // トランザクション開始
    await query('BEGIN');
    
    try {
      const updateResults = [];
      const notFoundCharacters = [];
      
      // データ行を処理（ヘッダー行をスキップ）
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',').map(part => part.trim());
        
        if (parts.length !== 12) {
          console.warn(`行${i + 1}をスキップ: カラム数が正しくありません (${parts.length}/12)`);
          continue;
        }
        
        const [
          characterName,
          hp,
          attack,
          defense,
          speed,
          ep,
          statBoost1Type,
          statBoost1Value,
          statBoost2Type,
          statBoost2Value,
          statBoost3Type,
          statBoost3Value
        ] = parts;
        
        // キャラクター存在確認
        const characterCheck = await query(
          'SELECT id, name FROM characters WHERE name = $1',
          [characterName]
        );
        
        if (characterCheck.rows.length === 0) {
          notFoundCharacters.push(characterName);
          continue;
        }
        
        const characterId = characterCheck.rows[0].id;
        
        // ステータス更新
        const updateResult = await query(`
          UPDATE characters 
          SET hp = $2,
              attack = $3,
              defense = $4,
              speed = $5,
              ep = $6,
              stat_boost_1_type = NULLIF($7, ''),
              stat_boost_1_value = CASE WHEN $8 = '' THEN NULL ELSE $8::numeric END,
              stat_boost_2_type = NULLIF($9, ''),
              stat_boost_2_value = CASE WHEN $10 = '' THEN NULL ELSE $10::numeric END,
              stat_boost_3_type = NULLIF($11, ''),
              stat_boost_3_value = CASE WHEN $12 = '' THEN NULL ELSE $12::numeric END
          WHERE id = $1
          RETURNING name
        `, [
          characterId,
          hp === '' ? null : parseInt(hp),
          attack === '' ? null : parseInt(attack),
          defense === '' ? null : parseInt(defense),
          speed === '' ? null : parseInt(speed),
          ep === '' ? null : parseInt(ep),
          statBoost1Type,
          statBoost1Value,
          statBoost2Type,
          statBoost2Value,
          statBoost3Type,
          statBoost3Value
        ]);
        
        if ((updateResult as any).rowCount > 0) {
          updateResults.push(characterName);
        }
      }
      
      // トランザクションコミット
      await query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: `${updateResults.length}人のキャラクターのステータスを更新しました`,
        updated_characters: updateResults,
        not_found_characters: notFoundCharacters.length > 0 ? notFoundCharacters : undefined
      });
      
    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError;
    }
    
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'ステータス更新に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}