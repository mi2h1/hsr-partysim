// 崩壊スターレイル パーティシミュレーター 型定義

export interface Character {
  id: number;
  name: string;
  element: string;
  path: string;
  version: string;
  created_at: string;
}

export interface Skill {
  id: number;
  character_id: number;
  skill_type: string;
  skill_name: string;
  description: string;
}

export interface BuffDebuff {
  id: number;
  skill_id: number;
  effect_name: string;
  target_type: string;
  stat_affected: string;
  value_expression: string;
  duration: string;
  condition?: string;
  is_stackable: boolean;
  max_stacks?: number;
}

export interface EidolonEnhancement {
  id: number;
  buff_debuff_id: number;
  eidolon_level: number;
  enhancement_type: string;
  enhanced_value?: string;
}

// フロントエンド表示用の型
export interface CharacterWithBuffs {
  character: Character;
  skills: Skill[];
  buffs: BuffDebuff[];
  eidolons: EidolonEnhancement[];
}

export interface PartyBuffDisplay {
  skill: string;
  name: string;
  duration: string;
  target: string;
  stat: string;
  value: string;
  note: string;
}

// CSV解析用の型
export interface CSVCharacterData {
  name: string;
  element: string;
  path: string;
  version: string;
  skills: {
    type: string;
    name: string;
    description: string;
  }[];
}