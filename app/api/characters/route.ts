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
          { id: 1, name: 'ロビン', element: '物理', path: '調和', version: null, created_at: new Date() },
          { id: 2, name: 'トリビー', element: '量子', path: '調和', version: null, created_at: new Date() }
        ]
      });
    }

    const result = await query(`
      SELECT 
        id, name, element, path, version, created_at
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