import type { HeroBase, HeroClass, HeroElement, HeroFaction, HeroRarity } from '@/types';

const NAMES_M = ['曜', '曦', '凌', '玄', '曜', '渊', '祁', '司', '凛', '枫', '寒', '墨', '言', '祁', '砚', '砚', '霄', '鸿', '鳞', '烛', '昀', '岚', '叙', '尘', '霁'];
const NAMES_F = ['璃', '萤', '笙', '颜', '若', '微', '清', '弦', '蕊', '柒', '晴', '瑶', '歆', '黛', '宛', '绮', '霏', '沁', '苒', '昭', '湄', '毓', '冉', '杳', '漪'];

const SURNAMES = ['司', '赫', '凛', '凌', '霓', '凤', '白', '夜', '青', '墨', '霜', '玄', '云', '幽', '霜', '羽', '龙', '白', '雪', '银', '金', '紫', '蓝', '红', '赤'];

function pickName(classType: HeroClass, idx: number) {
  const surname = SURNAMES[idx % SURNAMES.length];
  const given = classType === 'support' || classType === 'mage'
    ? NAMES_F[idx % NAMES_F.length]
    : NAMES_M[idx % NAMES_M.length];
  return surname + given;
}

const CLASS_RARITY: Record<HeroClass, HeroRarity[]> = {
  tank: ['N', 'R', 'SR', 'SSR'],
  warrior: ['N', 'R', 'SR', 'SSR', 'UR'],
  assassin: ['R', 'SR', 'SSR', 'UR'],
  ranger: ['N', 'R', 'SR', 'SSR', 'UR'],
  mage: ['R', 'SR', 'SSR', 'UR', 'LR'],
  support: ['R', 'SR', 'SSR', 'UR', 'LR', 'MRC'],
};

const CLASSES: HeroClass[] = ['tank', 'warrior', 'assassin', 'ranger', 'mage', 'support'];
const ELEMENTS: HeroElement[] = ['fire', 'water', 'wind', 'thunder', 'light', 'dark'];
const FACTIONS: HeroFaction[] = ['celestial', 'abyss', 'mecha', 'beast', 'spirit', 'human'];

const RARITY_BASE: Record<HeroRarity, { hp: number; atk: number; def: number; spd: number }> = {
  N: { hp: 800, atk: 60, def: 30, spd: 60 },
  R: { hp: 1200, atk: 90, def: 50, spd: 75 },
  SR: { hp: 1800, atk: 140, def: 80, spd: 90 },
  SSR: { hp: 2600, atk: 200, def: 120, spd: 110 },
  UR: { hp: 3600, atk: 280, def: 170, spd: 130 },
  LR: { hp: 4800, atk: 360, def: 220, spd: 150 },
  MRC: { hp: 6000, atk: 460, def: 280, spd: 170 },
};

const CLASS_SKILLS: Record<HeroClass, string[]> = {
  tank: ['sk_taunt', 'sk_shield', 'sk_buff_team'],
  warrior: ['sk_row_cleave', 'sk_buff_atk', 'sk_ultimate_sunder'],
  assassin: ['sk_strike_single', 'sk_poison', 'sk_ultimate_annihilate'],
  ranger: ['sk_strike_single', 'sk_burn', 'sk_ultimate_eclipse'],
  mage: ['sk_aoe_blast', 'sk_freeze', 'sk_ultimate_eclipse'],
  support: ['sk_heal_single', 'sk_heal_team', 'sk_ultimate_rebirth'],
};

function buildHero(idx: number, classType: HeroClass, element: HeroElement, faction: HeroFaction): HeroBase {
  const rarity = CLASS_RARITY[classType][Math.floor(idx / 6) % CLASS_RARITY[classType].length] || 'R';
  const base = RARITY_BASE[rarity];
  const clsMod = classType === 'tank'
    ? { hp: 1.4, atk: 0.7, def: 1.5, spd: 0.85 }
    : classType === 'warrior'
      ? { hp: 1.15, atk: 1.15, def: 1.0, spd: 1.0 }
      : classType === 'assassin'
        ? { hp: 0.85, atk: 1.35, def: 0.7, spd: 1.3 }
        : classType === 'ranger'
          ? { hp: 0.9, atk: 1.2, def: 0.7, spd: 1.2 }
          : classType === 'mage'
            ? { hp: 0.85, atk: 1.4, def: 0.65, spd: 1.1 }
            : { hp: 1.0, atk: 0.9, def: 0.9, spd: 1.1 };

  const id = `h_${classType}_${element}_${faction}_${idx}`;
  const skills = CLASS_SKILLS[classType];
  const desc = `${cnElement(element)}系${cnFaction(faction)}的${cnClass(classType)}，拥有${rarity} 级别战力。`;

  return {
    id,
    name: pickName(classType, idx),
    class: classType,
    element,
    faction,
    rarity,
    description: desc,
    baseHp: Math.round(base.hp * clsMod.hp),
    baseAtk: Math.round(base.atk * clsMod.atk),
    baseDef: Math.round(base.def * clsMod.def),
    baseSpd: Math.round(base.spd * clsMod.spd),
    skillIds: skills,
  };
}

function cnClass(c: HeroClass) {
  return { tank: '守护者', warrior: '战士', assassin: '刺客', ranger: '游侠', mage: '法师', support: '辅助' }[c];
}
function cnElement(e: HeroElement) {
  return { fire: '炽焰', water: '深海', wind: '疾风', thunder: '雷霆', light: '圣光', dark: '幽冥' }[e];
}
function cnFaction(f: HeroFaction) {
  return { celestial: '天界', abyss: '深渊', mecha: '机枢', beast: '荒野', spirit: '幻灵', human: '人族' }[f];
}

export const HEROES: HeroBase[] = (() => {
  const list: HeroBase[] = [];
  let idx = 0;
  // 为每个 class × element × faction 组合创建多个英雄，确保达到 100+
  for (const c of CLASSES) {
    for (const e of ELEMENTS) {
      for (const f of FACTIONS) {
        // 每个组合创建 3-5 个英雄
        const count = 3 + ((idx % 3));
        for (let k = 0; k < count; k++) {
          list.push(buildHero(idx, c, e, f));
          idx++;
        }
      }
    }
  }
  // 兜底：再补 12 个，确保 100+
  while (list.length < 120) {
    const c = CLASSES[list.length % CLASSES.length];
    const e = ELEMENTS[(list.length * 3) % ELEMENTS.length];
    const f = FACTIONS[(list.length * 7) % FACTIONS.length];
    list.push(buildHero(list.length, c, e, f));
  }
  return list;
})();

export const HERO_MAP: Record<string, HeroBase> = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function classLabel(c: HeroClass) {
  return cnClass(c);
}
export function elementLabel(e: HeroElement) {
  return cnElement(e);
}
export function factionLabel(f: HeroFaction) {
  return cnFaction(f);
}
export function rarityColor(r: HeroRarity) {
  return {
    N: '#9ca3af',
    R: '#60a5fa',
    SR: '#a78bfa',
    SSR: '#fbbf24',
    UR: '#f97316',
    LR: '#ef4444',
    MRC: '#ec4899',
  }[r];
}