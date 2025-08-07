import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = parseInt(params.id);
    
    if (isNaN(characterId)) {
      return NextResponse.json({ error: '無効なキャラクターIDです' }, { status: 400 });
    }

    // トランザクション開始
    await query('BEGIN');

    try {
      // バフ・デバフデータを削除
      await query(
        'DELETE FROM buffs_debuffs WHERE character_id = $1',
        [characterId]
      );

      // スキルデータを削除
      await query(
        'DELETE FROM skills WHERE character_id = $1',
        [characterId]
      );

      // キャラクター基本情報を削除
      const deleteResult = await query(
        'DELETE FROM characters WHERE id = $1',
        [characterId]
      );

      if (deleteResult.rowCount === 0) {
        await query('ROLLBACK');
        return NextResponse.json({ error: 'キャラクターが見つかりません' }, { status: 404 });
      }

      // トランザクションをコミット
      await query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'キャラクターデータを削除しました',
        deletedCharacterId: characterId
      });

    } catch (error) {
      // エラー時はロールバック
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('キャラクター削除エラー:', error);
    return NextResponse.json({ 
      error: 'キャラクターデータの削除に失敗しました: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}