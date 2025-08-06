// 指定キャラクターのバフ・デバフ取得API（Next.js 15対応）
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const characterId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const eidolonLevel = parseInt(searchParams.get('eidolon') || '0');

    // キャラクター基本情報取得
    const characterResult = await query(`
      SELECT id, name, element, path
      FROM characters
      WHERE id = $1
    `, [characterId]);

    if (characterResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'キャラクターが見つかりません' },
        { status: 404 }
      );
    }

    const character = characterResult.rows[0];

    // バフ・デバフ情報取得
    const buffsResult = await query(`
      SELECT 
        s.skill_type,
        s.skill_name,
        bd.effect_name,
        bd.target_type,
        bd.stat_affected,
        bd.value_expression,
        bd.duration,
        bd.condition,
        bd.is_stackable,
        bd.max_stacks
      FROM skills s
      JOIN buffs_debuffs bd ON s.id = bd.skill_id
      WHERE s.character_id = $1
      ORDER BY 
        CASE s.skill_type 
          WHEN '戦闘スキル' THEN 1
          WHEN '必殺技' THEN 2
          WHEN '天賦' THEN 3
          WHEN '追加効果1' THEN 4
          WHEN '追加効果2' THEN 5
          WHEN '追加効果3' THEN 6
          ELSE 7
        END
    `, [characterId]);

    // 星魂強化情報取得（指定レベル以下）
    const eidolonResult = await query(`
      SELECT 
        ee.eidolon_level,
        ee.enhancement_type,
        ee.enhanced_value,
        bd.effect_name,
        bd.target_type,
        bd.stat_affected,
        s.skill_type
      FROM eidolon_enhancements ee
      JOIN buffs_debuffs bd ON ee.buff_debuff_id = bd.id
      JOIN skills s ON bd.skill_id = s.id
      WHERE s.character_id = $1 AND ee.eidolon_level <= $2
      ORDER BY ee.eidolon_level
    `, [characterId, eidolonLevel]);

    // レスポンス形式に変換
    const buffsDebuffs = buffsResult.rows.map(row => ({
      skill: row.skill_type,
      name: row.effect_name,
      duration: row.duration,
      target: row.target_type,
      stat: row.stat_affected,
      value: row.value_expression,
      note: row.condition || ''
    }));

    // 星魂による追加バフ・デバフ
    const eidolonBuffs = eidolonResult.rows
      .filter(row => row.enhancement_type === 'new_effect')
      .map(row => ({
        skill: `星魂${row.eidolon_level}`,
        name: row.effect_name,
        duration: row.enhanced_value?.includes('中') ? row.enhanced_value : '永続',
        target: row.target_type,
        stat: row.stat_affected,
        value: row.enhanced_value || '',
        note: `星魂${row.eidolon_level}で追加`
      }));

    return NextResponse.json({
      success: true,
      character,
      eidolon_level: eidolonLevel,
      buffs_debuffs: [...buffsDebuffs, ...eidolonBuffs]
    });

  } catch (error) {
    console.error('バフ・デバフ取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'バフ・デバフ取得に失敗しました' },
      { status: 500 }
    );
  }
}