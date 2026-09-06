import type { HeroBase, HeroClass, HeroElement, HeroFaction, HeroRarity } from '@/types';

// 本地化中文名 - 按职业 × 元素 × 阵营 风格命名
const NAMES_BY_CLASS = {
  tank: [
    '玄武', '磐石', '苍岩', '铁壁', '坚盾', '渊盾', '圣盾', '永壁', '凛盾', '银卫',
    '神铸', '镇岳', '天柱', '海礁', '烛龙', '岳神', '铁卫', '玄武', '苍盾', '岩心',
  ],
  warrior: [
    '龙煞', '屠龙者', '狂战', '剑魔', '剑圣', '炽刃', '雷斧', '裂空', '赤焰', '黑锋',
    '霜牙', '龙裔', '武姬', '血刃', '魔镰', '幽镰', '裂魂', '霸者', '弑神', '赤霄',
  ],
  assassin: [
    '影刃', '虚空游神', '暗刺', '放逐之影', '幽鬼', '紫电', '暗夜魔女', '环刃贵族', '刺客', '虚空',
    '界', '暗影', '无影', '灵刃', '暗翼', '虚空之刃', '鬼面', '潜行', '幻刺', '幽刺',
  ],
  ranger: [
    '弓魂', '圣锋游侠', '银箭', '鹰眼', '风语', '羽弦', '追星', '炽羽', '苍羽', '寒羽',
    '玉弓', '游侠', '风行者', '神射', '破晓', '轻羽', '苍牙', '光翎', '金翎', '银翎',
  ],
  mage: [
    '永恒古树', '铃兰鹿灵', '万花', '法汞', '冰魂', '雷法师', '噬魂之弓', '虚空虫皇', '炎灵', '雷鸣',
    '霜语', '时光', '占星', '织梦', '渊语', '魔导', '奥术', '雷火', '炽炎', '冰心',
  ],
  support: [
    '怜悯树灵', '祈愿', '圣光', '萤火', '铃兰', '吟游诗人', '净魂', '垂枝之镰', '圣者', '灵祈',
    '治愈', '圣使', '光辉', '回春', '祈愿者', '怜悯', '神恩', '圣泉', '微光', '永夜皇后',
  ],
};

const SURNAMES_BY_FACTION = {
  celestial: ['天', '圣', '光', '炽', '曜', '曦', '云', '宙'],
  abyss: ['渊', '暗', '幽', '冥', '夜', '魇', '噬', '虚'],
  mecha: ['机', '械', '铁', '钢', '钛', '铜', '合', '芯'],
  beast: ['狼', '虎', '熊', '鹰', '豹', '龙', '凤', '麒'],
  spirit: ['灵', '幻', '仙', '精', '魂', '魄', '星', '月'],
  human: ['龙', '王', '侯', '萧', '林', '司', '白', '凌'],
};

function pickName(classType: HeroClass, faction: HeroFaction, idx: number) {
  const surname = SURNAMES_BY_FACTION[faction][idx % SURNAMES_BY_FACTION[faction].length];
  const given = NAMES_BY_CLASS[classType][idx % NAMES_BY_CLASS[classType].length];
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
  const desc = `${cnElement(element)}系${cnFaction(faction)}的${cnClass(classType)}，拥有${rarity} 级战力。觉醒后可解锁终极技能。`;

  return {
    id,
    name: pickName(classType, faction, idx),
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
  for (const c of CLASSES) {
    for (const e of ELEMENTS) {
      for (const f of FACTIONS) {
        const count = 4;
        for (let k = 0; k < count; k++) {
          list.push(buildHero(idx, c, e, f));
          idx++;
        }
      }
    }
  }
  return list;
})();

export const HERO_MAP: Record<string, HeroBase> = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function classLabel(c: HeroClass) { return cnClass(c); }
export function elementLabel(e: HeroElement) { return cnElement(e); }
export function factionLabel(f: HeroFaction) { return cnFaction(f); }
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