// =========================================================
// 战斗与养成相关公式 (V2 - 含阵营克制与伤害类型)
// =========================================================

import type { HeroBase, HeroInstance, EquipmentDef, RuneSetDef, ArtifactDef, Currency, HeroFaction, Position, DamageType, FactionCounter, FactionSynergy, AwakenBonus } from '@/types';
import { HERO_MAP } from '@/data/heroes';
import { EQUIP_MAP } from '@/data/equipment';
import { clamp } from './rng';

const RARITY_LEVEL_CAP: Record<string, number> = {
  N: 30, R: 60, SR: 80, SSR: 100, UR: 120, LR: 140, MRC: 160,
};

export function levelCap(hero: HeroBase): number {
  return RARITY_LEVEL_CAP[hero.rarity] ?? 100;
}

export function starCap(hero: HeroBase): number {
  if (hero.rarity === 'MRC') return 8;
  if (hero.rarity === 'LR') return 8;
  return 6;
}

const STAR_GROWTH = [1, 1.0, 1.25, 1.55, 1.95, 2.5, 3.2, 4.1];
const BREAK_GROWTH = [1, 1.0, 1.1, 1.25, 1.45];
const AWAKEN_GROWTH = [0, 0.05, 0.1, 0.18, 0.28, 0.4];

// 阵营克制矩阵：a 攻击 b 时，A克制B 则 +30% 伤害
export const FACTION_COUNTER: FactionCounter = {
  celestial: 'abyss',     // 天界克深渊
  abyss: 'spirit',        // 深渊克幻灵
  spirit: 'beast',        // 幻灵克荒野
  beast: 'human',         // 荒野克人族
  human: 'mecha',         // 人族克机枢
  mecha: 'celestial',     // 机枢克天界
};

export function counterBonus(attacker: HeroFaction, target: HeroFaction): number {
  return FACTION_COUNTER[attacker] === target ? 0.3 : 0;
}

export const FACTION_SYNERGIES: FactionSynergy[] = [
  { count: 2, bonus: { atk: 0.05 }, description: '2 阵营：攻击 +5%' },
  { count: 3, bonus: { atk: 0.1, hp: 0.05 }, description: '3 阵营：攻击 +10%, 生命 +5%' },
  { count: 4, bonus: { atk: 0.15, hp: 0.1, crit: 5 }, description: '4 阵营：攻击 +15%, 生命 +10%, 暴击 +5%' },
  { count: 5, bonus: { atk: 0.2, hp: 0.15, def: 0.1, crit: 10 }, description: '5 阵营：全属性大幅提升' },
  { count: 6, bonus: { atk: 0.3, hp: 0.25, def: 0.15, crit: 15, speed: 10 }, description: '6 阵营：终极羁绊' },
];

export function getFactionSynergy(factionCounts: Record<HeroFaction, number>): FactionSynergy | null {
  const max = Math.max(0, ...Object.values(factionCounts));
  if (max < 2) return null;
  return FACTION_SYNERGIES.find((s) => s.count === max) || null;
}

export const CLASS_POSITION: Record<string, Position> = {
  tank: 'front',
  warrior: 'front',
  assassin: 'back',
  ranger: 'back',
  mage: 'mid',
  support: 'mid',
};

export const POSITION_DEF_BONUS: Record<Position, number> = {
  front: 0.30,
  mid: 0.15,
  back: 0.0,
};

export const POSITION_DMG_BONUS: Record<Position, number> = {
  front: 1.10,
  mid: 1.05,
  back: 1.20,
};

// 觉醒加成
export const AWAKEN_BONUSES: AwakenBonus[] = [
  { level: 1, name: '初醒', description: '生命 +5%', effects: [{ stat: 'hp', value: 0.05 }] },
  { level: 2, name: '再醒', description: '攻击 +5%', effects: [{ stat: 'atk', value: 0.05 }] },
  { level: 3, name: '真醒', description: '解锁觉醒技', effects: [{ type: 'unlock_skill' }] },
  { level: 4, name: '极醒', description: '全属性 +10%, 真实伤害 +5%', effects: [{ stat: 'all', value: 0.1 }, { stat: 'trueDmg', value: 0.05 }] },
  { level: 5, name: '超醒', description: '暴击 +15%, 异常伤害 +15%', effects: [{ stat: 'crit', value: 15 }, { stat: 'anomalyDmg', value: 0.15 }] },
];

export function computeStats(hero: HeroInstance) {
  const base = HERO_MAP[hero.heroId];
  if (!base) return { hp: 0, atk: 0, def: 0, spd: 0, crit: 5, dodge: 5, breakArmor: 0, anomalyDmg: 0, trueDmg: 0, dmgReduce: 0, power: 0, position: 'mid' as Position };
  const starMul = STAR_GROWTH[hero.star] ?? 1;
  const breakMul = BREAK_GROWTH[hero.breakthrough] ?? 1;
  const awakenMul = AWAKEN_GROWTH[hero.awaken] ?? 1;
  const lvlMul = 1 + (hero.level - 1) * 0.08;

  const hp = Math.round(base.baseHp * starMul * breakMul * lvlMul * (1 + awakenMul));
  const atk = Math.round(base.baseAtk * starMul * breakMul * lvlMul * (1 + awakenMul));
  const def = Math.round(base.baseDef * starMul * breakMul * lvlMul * (1 + awakenMul));
  const spd = base.baseSpd;

  const talent = hero.talentPoints;
  const talentHp = hp * (talent.hp * 0.02);
  const talentAtk = atk * (talent.atk * 0.02);
  const talentDef = def * (talent.def * 0.02);
  const talentSpd = spd * (talent.spd * 0.015);

  let equipHp = 0, equipAtk = 0, equipDef = 0, equipSpd = 0, crit = 5, dodge = 5;
  let breakArmor = 0, anomalyDmg = 0, trueDmg = 0, dmgReduce = 0;
  (Object.values(hero.equipment) as (string | undefined)[]).forEach((id) => {
    if (!id) return;
    const e = EQUIP_MAP[id];
    if (!e) return;
    equipHp += e.stats.hp ?? 0;
    equipAtk += e.stats.atk ?? 0;
    equipDef += e.stats.def ?? 0;
    equipSpd += e.stats.spd ?? 0;
    crit += e.stats.crit ?? 0;
    dodge += e.stats.dodge ?? 0;
  });

  // 觉醒加成
  if (hero.awaken >= 4) {
    trueDmg += 0.05;
  }
  if (hero.awaken >= 5) {
    anomalyDmg += 0.15;
    crit += 15;
  }

  const finalHp = Math.round(hp + talentHp + equipHp);
  const finalAtk = Math.round(atk + talentAtk + equipAtk);
  const finalDef = Math.round(def + talentDef + equipDef);
  const finalSpd = Math.round(spd + talentSpd + equipSpd);
  const finalCrit = clamp(crit, 0, 100);
  const finalDodge = clamp(dodge, 0, 80);

  const power = Math.round(finalHp * 0.3 + finalAtk * 1.5 + finalDef * 0.8 + finalSpd * 5);
  return {
    hp: finalHp, atk: finalAtk, def: finalDef, spd: finalSpd,
    crit: finalCrit, dodge: finalDodge,
    breakArmor, anomalyDmg, trueDmg, dmgReduce,
    power, position: CLASS_POSITION[base.class] || 'mid',
  };
}

export function expToLevel(level: number): number {
  return Math.round(50 * level * (1 + level * 0.15));
}

export function levelUpCost(from: number, to: number): number {
  let cost = 0;
  for (let l = from; l < to; l++) cost += expToLevel(l);
  return cost;
}

export function breakthroughCost(star: number): { gold: number; soul: number } {
  const base = star * 2000;
  return { gold: base, soul: Math.ceil(star * 5) };
}

export function starUpCost(star: number): { gold: number; soul: number; dupCount: number } {
  const baseGold = star * 1000;
  return { gold: baseGold, soul: Math.ceil(star * 2), dupCount: star };
}

export function awakenCost(awakenLevel: number): { gold: number; soul: number; awakenStone: number } {
  const lv = awakenLevel + 1;
  return {
    gold: lv * 5000,
    soul: lv * 10,
    awakenStone: lv * 5,
  };
}

export function equipEnhanceCost(currentLevel: number): { gold: number } {
  return { gold: Math.round(100 * Math.pow(1.5, currentLevel)) };
}

export interface DamageResult {
  amount: number;
  type: DamageType;
  isCrit: boolean;
  counter: boolean;
  mitigated: number;
}

export function computeDamage(
  attacker: ReturnType<typeof computeStats>,
  target: ReturnType<typeof computeStats>,
  baseSkillScaling: { atk?: number; hp?: number; def?: number },
  attackerHero: HeroBase,
  targetHero: HeroBase,
  isCrit: boolean,
  rngCrit: number,
): DamageResult {
  const s = baseSkillScaling.atk ?? 1;
  let raw = attacker.atk * s;
  // 阵营克制
  const counter = counterBonus(attackerHero.faction, targetHero.faction);
  raw *= 1 + counter;
  // 站位加成
  raw *= POSITION_DMG_BONUS[attacker.position] ?? 1;
  // 防御减免
  const defMitigation = target.def - attacker.atk * 0.2;
  const reduction = 100 / (100 + Math.max(0, defMitigation));
  let dmg = raw * reduction;
  // 暴击
  let actualCrit = isCrit || rngCrit < attacker.crit / 100;
  if (actualCrit) dmg *= 1.5;
  // 真实伤害（无视防御）
  if (attacker.trueDmg > 0) {
    const trueDmgAmount = raw * attacker.trueDmg;
    dmg = Math.max(dmg, trueDmgAmount);
  }
  // 异常伤害（无视部分防御）
  if (attacker.anomalyDmg > 0) {
    dmg *= 1 + attacker.anomalyDmg * 0.5;
  }
  // 免伤
  dmg *= 1 - target.dmgReduce;
  const finalAmount = Math.max(1, Math.round(dmg));
  return {
    amount: finalAmount,
    type: actualCrit ? 'crit' : 'normal',
    isCrit: actualCrit,
    counter: counter > 0,
    mitigated: Math.round(raw - finalAmount),
  };
}

export const RARITY_GACHA_RATE: Record<string, number> = {
  N: 0.45, R: 0.30, SR: 0.15, SSR: 0.07, UR: 0.025, LR: 0.004, MRC: 0.001,
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  gold: '金币',
  gem: '钻石',
  soul: '英魂',
  stamina: '体力',
  ticket: '召唤券',
};