// キャラクターの基本スキル情報取得API
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

    // スキル情報取得
    const skillsResult = await query(`
      SELECT 
        skill_type,
        skill_name,
        description
      FROM skills
      WHERE character_id = $1
      ORDER BY 
        CASE skill_type 
          WHEN '通常攻撃' THEN 1
          WHEN '戦闘スキル' THEN 2
          WHEN '必殺技' THEN 3
          WHEN '天賦' THEN 4
          WHEN '秘技' THEN 5
          WHEN '追加効果1' THEN 6
          WHEN '追加効果2' THEN 7
          WHEN '追加効果3' THEN 8
          WHEN '星魂1' THEN 9
          WHEN '星魂2' THEN 10
          WHEN '星魂3' THEN 11
          WHEN '星魂4' THEN 12
          WHEN '星魂5' THEN 13
          WHEN '星魂6' THEN 14
          ELSE 15
        END
    `, [characterId]);

    // スキルをカテゴリ別に分類
    const combatSkills = skillsResult.rows.filter(row => 
      ['通常攻撃', '戦闘スキル', '必殺技', '天賦', '秘技'].includes(row.skill_type)
    );

    const additionalEffects = skillsResult.rows.filter(row => 
      ['追加効果1', '追加効果2', '追加効果3'].includes(row.skill_type)
    );

    const eidolons = skillsResult.rows.filter(row => 
      row.skill_type.startsWith('星魂')
    );

    return NextResponse.json({
      success: true,
      character,
      combat_skills: combatSkills.map(skill => ({
        type: skill.skill_type,
        name: skill.skill_name,
        description: skill.description
      })),
      additional_effects: additionalEffects.map(skill => ({
        type: skill.skill_type,
        name: skill.skill_name,
        description: skill.description
      })),
      eidolons: eidolons.map(skill => ({
        type: skill.skill_type,
        name: skill.skill_name,
        description: skill.description
      }))
    });

  } catch (error) {
    console.error('スキル情報取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'スキル情報取得に失敗しました' },
      { status: 500 }
    );
  }
}