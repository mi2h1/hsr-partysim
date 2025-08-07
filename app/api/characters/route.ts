// キャラクター一覧取得API（改善版）
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // DATABASE_URLがない場合はモックデータを返す
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        characters: [
          { 
            id: 1, name: 'ロビン', element: '物理', path: '調和', version: null, created_at: new Date(),
            hp: null, attack: null, defense: null, speed: null, ep: null,
            stat_boost_1_type: null, stat_boost_1_value: null,
            stat_boost_2_type: null, stat_boost_2_value: null,
            stat_boost_3_type: null, stat_boost_3_value: null
          },
          { 
            id: 2, name: 'トリビー', element: '量子', path: '調和', version: null, created_at: new Date(),
            hp: null, attack: null, defense: null, speed: null, ep: null,
            stat_boost_1_type: null, stat_boost_1_value: null,
            stat_boost_2_type: null, stat_boost_2_value: null,
            stat_boost_3_type: null, stat_boost_3_value: null
          }
        ]
      });
    }

    const result = await query(`
      SELECT 
        id, name, element, path, version, created_at,
        hp, attack, defense, speed, ep,
        stat_boost_1_type, stat_boost_1_value,
        stat_boost_2_type, stat_boost_2_value,
        stat_boost_3_type, stat_boost_3_value
      FROM characters
      ORDER BY version DESC NULLS LAST, id ASC
    `);

    return NextResponse.json({
      success: true,
      characters: result.rows
    });
  } catch (error) {
    console.error('キャラクター取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'キャラクター取得に失敗しました',
        characters: [] // フォールバック
      },
      { status: 500 }
    );
  }
}