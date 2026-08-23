// =========================================================
// 战斗与养成相关公式
// =========================================================

import type { HeroBase, HeroInstance, EquipmentDef, RuneSetDef, ArtifactDef, Currency } from '@/types';
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

export function computeStats(hero: HeroInstance) {
  const base = HERO_MAP[hero.heroId];
  if (!base) return { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, dodge: 0, power: 0 };
  const starMul = STAR_GROWTH[hero.star] ?? 1;
  const breakMul = BREAK_GROWTH[hero.breakthrough] ?? 1;
  const lvlMul = 1 + (hero.level - 1) * 0.08;

  const hp = Math.round(base.baseHp * starMul * breakMul * lvlMul);
  const atk = Math.round(base.baseAtk * starMul * breakMul * lvlMul);
  const def = Math.round(base.baseDef * starMul * breakMul * lvlMul);
  const spd = base.baseSpd;

  const talent = hero.talentPoints;
  const talentHp = hp * (talent.hp * 0.02);
  const talentAtk = atk * (talent.atk * 0.02);
  const talentDef = def * (talent.def * 0.02);
  const talentSpd = spd * (talent.spd * 0.015);

  let equipHp = 0, equipAtk = 0, equipDef = 0, equipSpd = 0, crit = 5, dodge = 5;
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

  const finalHp = Math.round(hp + talentHp + equipHp);
  const finalAtk = Math.round(atk + talentAtk + equipAtk);
  const finalDef = Math.round(def + talentDef + equipDef);
  const finalSpd = Math.round(spd + talentSpd + equipSpd);
  const finalCrit = clamp(crit, 0, 100);
  const finalDodge = clamp(dodge, 0, 80);

  const power = Math.round(finalHp * 0.3 + finalAtk * 1.5 + finalDef * 0.8 + finalSpd * 5);
  return {
    hp: finalHp, atk: finalAtk, def: finalDef, spd: finalSpd,
    crit: finalCrit, dodge: finalDodge, power,
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

export function formationPower(slots: (string | null)[]): number {
  return slots.reduce((sum, uid) => {
    if (!uid) return sum;
    return sum + 0; // power 计算依赖 store
  }, 0);
}

export function applySkillDamage(
  baseAtk: number,
  scaling: { hp?: number; atk?: number; def?: number },
  attackerHp: number,
  attackerAtk: number,
  attackerDef: number,
  targetDef: number,
  critRate: number,
  critPct: number,
  isCrit: boolean,
): number {
  const s = scaling.atk ?? 0;
  const base = baseAtk + attackerAtk * s;
  const reduction = 100 / (100 + Math.max(0, targetDef - attackerDef * 0.2));
  let dmg = base * reduction;
  if (isCrit) dmg *= 1 + critPct / 100;
  return Math.max(1, Math.round(dmg));
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