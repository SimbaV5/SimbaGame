import type { EquipmentDef, RuneSetDef, ArtifactDef, HeroRarity } from '@/types';

const RARITIES: HeroRarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'LR', 'MRC'];

const STAT_BY_SLOT: Record<string, { hp: number; atk: number; def: number; spd: number; crit: number; dodge: number }> = {
  weapon: { hp: 0, atk: 1, def: 0, spd: 0, crit: 0, dodge: 0 },
  armor: { hp: 1, atk: 0, def: 1, spd: 0, crit: 0, dodge: 0 },
  helmet: { hp: 1, atk: 0, def: 1, spd: 0, crit: 0, dodge: 0 },
  boots: { hp: 0, atk: 0, def: 0, spd: 1, crit: 0, dodge: 1 },
  ring: { hp: 0, atk: 1, def: 0, spd: 0, crit: 1, dodge: 0 },
  amulet: { hp: 1, atk: 0, def: 0, spd: 0, crit: 1, dodge: 1 },
};

const SLOT_NAMES: Record<string, string> = {
  weapon: '武器',
  armor: '战甲',
  helmet: '头盔',
  boots: '战靴',
  ring: '戒指',
  amulet: '护符',
};

const SET_PREFIX = ['幽冥', '炽焰', '深海', '疾风', '雷霆', '圣光', '天机', '不朽', '苍穹', '深渊'];

function makeEquip(prefix: string, slot: string, rarity: HeroRarity, idx: number): EquipmentDef {
  const base = STAT_BY_SLOT[slot];
  const lv = RARITIES.indexOf(rarity);
  const mul = 1 + lv * 0.6;
  const stats: EquipmentDef['stats'] = {};
  (['hp', 'atk', 'def', 'spd', 'crit', 'dodge'] as const).forEach((k) => {
    const v = Math.round(base[k] * (lv + 1) * 4 * mul);
    if (v > 0) stats[k] = v;
  });
  return {
    id: `eq_${slot}_${rarity}_${idx}`,
    name: `${prefix}${SLOT_NAMES[slot]}·${rarity}`,
    slot: slot as EquipmentDef['slot'],
    rarity,
    set: `${prefix}套装`,
    stats,
    description: `${rarity} 级${SLOT_NAMES[slot]}，属于【${prefix}套装】。`,
  };
}

export const EQUIPMENTS: EquipmentDef[] = (() => {
  const list: EquipmentDef[] = [];
  let idx = 0;
  const slots = Object.keys(SLOT_NAMES);
  for (const prefix of SET_PREFIX) {
    for (const slot of slots) {
      for (const rarity of RARITIES) {
        list.push(makeEquip(prefix, slot, rarity, idx++));
      }
    }
  }
  return list;
})();

export const EQUIP_MAP: Record<string, EquipmentDef> = Object.fromEntries(EQUIPMENTS.map((e) => [e.id, e]));

export const RUNE_SETS: RuneSetDef[] = SET_PREFIX.map((name) => ({
  id: `rs_${name}`,
  name: `${name}符文`,
  pieceBonus: [
    { count: 2, stat: 'atk', value: 0.1, description: `攻击 +${(0.1 * 100).toFixed(0)}%` },
    { count: 4, stat: 'hp', value: 0.15, description: `生命 +${(0.15 * 100).toFixed(0)}%` },
  ],
}));

export const ARTIFACTS: ArtifactDef[] = [
  {
    id: 'af_blade',
    name: '破晓之刃',
    rarity: 'SSR',
    passive: '攻击+15%，暴击+10%',
    effects: [{ type: 'buff_atk', value: 0.15, duration: 99 }],
  },
  {
    id: 'af_shield',
    name: '不朽神盾',
    rarity: 'SSR',
    passive: '生命+20%，防御+15%',
    effects: [{ type: 'buff_def', value: 0.15, duration: 99 }],
  },
  {
    id: 'af_orb',
    name: '湮灭宝珠',
    rarity: 'UR',
    passive: '技能伤害+25%',
    effects: [{ type: 'buff_atk', value: 0.25, duration: 99 }],
  },
  {
    id: 'af_phoenix',
    name: '凤凰之心',
    rarity: 'LR',
    passive: '首次致命时保留 1 HP',
    effects: [{ type: 'shield', value: 1, duration: 99 }],
  },
  {
    id: 'af_shadow',
    name: '暗影斗篷',
    rarity: 'UR',
    passive: '速度+20%，闪避+15%',
    effects: [{ type: 'buff_spd', value: 0.2, duration: 99 }],
  },
];