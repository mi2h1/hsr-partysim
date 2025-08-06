// CSV解析機能 - 今まで作った解析ロジックをTypeScript化
import Papa from 'papaparse';
import { CSVCharacterData, BuffDebuff } from '@/types';

interface ParsedBuffDebuff {
  effectName: string;
  targetType: string;
  statAffected: string;
  valueExpression: string;
  duration: string;
  condition?: string;
  isStackable: boolean;
  maxStacks?: number;
}

export class CSVAnalyzer {
  private gameKnowledge = {
    '与ダメージ': 'dmg_bonus',
    '会心ダメージ': 'crit_dmg',
    '会心率': 'crit_rate',
    '攻撃力': 'atk',
    '速度': 'speed',
    '防御力': 'def',
    'HP': 'hp',
    '全属性耐性貫通': 'res_pen',
    '効果抵抗': 'effect_res',
    '防御無視': 'def_ignore'
  };

  parseCSV(csvContent: string): CSVCharacterData {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    
    // 基本情報抽出
    const characterData: CSVCharacterData = {
      name: this.extractValue(lines[0]),
      element: this.extractValue(lines[1]),
      path: this.extractValue(lines[2]),
      skills: []
    };

    // スキル情報抽出
    const skillTypes = [
      '通常攻撃', '戦闘スキル', '必殺技', '天賦', '秘技',
      '追加効果1', '追加効果2', '追加効果3'
    ];

    for (let i = 3; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 3) {
        const skillType = parts[0].trim();
        const skillName = parts[1].trim();
        const description = parts[2].trim();

        if (skillTypes.includes(skillType) || skillType.startsWith('星魂')) {
          characterData.skills.push({
            type: skillType,
            name: skillName,
            description: description
          });
        }
      }
    }

    return characterData;
  }

  analyzeBuffsDebuffs(skillType: string, description: string): ParsedBuffDebuff[] {
    const effects: ParsedBuffDebuff[] = [];

    // 戦闘スキルの解析
    if (skillType === '戦闘スキル') {
      // 与ダメージバフ検出
      const dmgMatch = description.match(/与ダメージ\+(\d+)%/);
      if (dmgMatch) {
        effects.push({
          effectName: '与ダメージ増加',
          targetType: this.extractTarget(description),
          statAffected: '与ダメージ',
          valueExpression: `+${dmgMatch[1]}%`,
          duration: this.extractDuration(description),
          isStackable: false
        });
      }

      // 全属性耐性貫通検出
      const resMatch = description.match(/全属性耐性貫通\+\s*(\d+)%/);
      if (resMatch) {
        effects.push({
          effectName: '全属性耐性貫通',
          targetType: this.extractTarget(description),
          statAffected: '全属性耐性貫通',
          valueExpression: `+${resMatch[1]}%`,
          duration: this.extractDuration(description),
          condition: this.extractCondition(description),
          isStackable: false
        });
      }
    }

    // 必殺技の解析
    if (skillType === '必殺技') {
      // 敵被ダメージ増加検出
      const enemyDmgMatch = description.match(/受けるダメージ\+\s*(\d+)%/);
      if (enemyDmgMatch) {
        effects.push({
          effectName: '敵被ダメージ増加',
          targetType: '敵全体',
          statAffected: '受けるダメージ',
          valueExpression: `+${enemyDmgMatch[1]}%`,
          duration: this.extractDuration(description),
          condition: this.extractCondition(description),
          isStackable: false
        });
      }

      // 攻撃力バフ検出（複雑な式）
      const atkBuffMatch = description.match(/攻撃力.*?(\d+)%.*?\+(\d+)/);
      if (atkBuffMatch) {
        effects.push({
          effectName: '攻撃力増加',
          targetType: this.extractTarget(description),
          statAffected: '攻撃力',
          valueExpression: `+${atkBuffMatch[2]} + 攻撃力×${atkBuffMatch[1]}%`,
          duration: this.extractDuration(description),
          condition: this.extractCondition(description),
          isStackable: false
        });
      }
    }

    // 天賦の解析
    if (skillType === '天賦') {
      // 会心ダメージバフ検出
      const critMatch = description.match(/会心ダメージ\+(\d+)%/);
      if (critMatch) {
        effects.push({
          effectName: '会心ダメージ増加',
          targetType: this.extractTarget(description),
          statAffected: '会心ダメージ',
          valueExpression: `+${critMatch[1]}%`,
          duration: '永続',
          isStackable: false
        });
      }
    }

    // 追加効果の解析
    if (skillType.startsWith('追加効果')) {
      // 累積バフ検出
      const stackMatch = description.match(/与ダメージ\+\s*(\d+)%.*?最大.*?(\d+)\s*層/);
      if (stackMatch) {
        effects.push({
          effectName: '与ダメージ増加（累積）',
          targetType: this.extractTarget(description),
          statAffected: '与ダメージ',
          valueExpression: `+${stackMatch[1]}%`,
          duration: this.extractDuration(description),
          isStackable: true,
          maxStacks: parseInt(stackMatch[2])
        });
      }

      // HP増加検出
      const hpMatch = description.match(/最大HP.*?(\d+)%/);
      if (hpMatch) {
        effects.push({
          effectName: '最大HP増加',
          targetType: this.extractTarget(description),
          statAffected: '最大HP',
          valueExpression: `+味方全体HP合計×${hpMatch[1]}%`,
          duration: this.extractDuration(description),
          isStackable: false
        });
      }
    }

    // 星魂効果の解析（4凸の防御無視など）
    if (skillType.startsWith('星魂') && skillType.includes('4')) {
      const defIgnoreMatch = description.match(/防御力.*?(\d+)%.*?無視/);
      if (defIgnoreMatch) {
        effects.push({
          effectName: '防御無視',
          targetType: '味方全体',
          statAffected: '防御無視',
          valueExpression: `${defIgnoreMatch[1]}%`,
          duration: this.extractDuration(description),
          condition: this.extractCondition(description),
          isStackable: false
        });
      }
    }

    return effects;
  }

  private extractValue(line: string): string {
    const parts = line.split(',');
    return parts.length >= 2 ? parts[1].trim() : '';
  }

  private extractTarget(description: string): string {
    if (description.includes('味方全体')) return '味方全体';
    if (description.includes('味方単体')) return '味方単体';
    if (description.includes('敵全体')) return '敵全体';
    if (description.includes('敵単体')) return '敵単体';
    if (description.includes('自身')) return '自身';
    return '不明';
  }

  private extractDuration(description: string): string {
    const turnMatch = description.match(/(\d+)\s*ターン/);
    if (turnMatch) return `${turnMatch[1]}ターン`;
    if (description.includes('永続')) return '永続';
    if (description.includes('協奏') || description.includes('結界')) {
      return description.includes('協奏') ? '協奏状態中' : '結界展開中';
    }
    return '即座';
  }

  private extractCondition(description: string): string | undefined {
    const conditions = [
      '神の啓示状態中',
      '協奏状態中',
      '結界展開中',
      'SP消費時',
      '追加攻撃後',
      '味方攻撃後',
      '味方必殺技後'
    ];

    for (const condition of conditions) {
      if (description.includes(condition.replace('状態中', '').replace('時', ''))) {
        return condition;
      }
    }
    return undefined;
  }
}