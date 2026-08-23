import type { StageDef } from '@/types';
import { HEROES } from './heroes';

function pickEnemy(idx: number, factionSeed = 0) {
  const pool = HEROES.filter((h) => true);
  return pool[(idx * 17 + 13 + factionSeed * 23) % pool.length].id;
}

function genStage(id: number, chapter: number, level: number, difficulty: number, mode: 'normal' | 'elite' | 'nightmare' = 'normal'): StageDef {
  const mul = mode === 'nightmare' ? 2.0 : mode === 'elite' ? 1.4 : 1.0;
  const enemyLv = Math.min(150, Math.max(1, Math.floor(level * 0.9 * mul)));
  const enemyStar = Math.min(8, Math.max(1, Math.floor((level * mul) / 6) + 1));
  const wavesCount = level % 5 === 0 ? 3 : 2;
  const waves = [];
  for (let w = 0; w < wavesCount; w++) {
    const count = w === wavesCount - 1 && level % 3 === 0 ? 1 : 3;
    waves.push({
      enemies: Array.from({ length: count }).map((_, i) => ({
        heroId: pickEnemy(id * 17 + w * 5 + i, difficulty),
        level: Math.floor((enemyLv + w * 0.4 * enemyLv) * mul),
        star: Math.min(8, enemyStar + Math.floor(w / 2)),
      })),
    });
  }
  const isBoss = level % 10 === 0;
  const boss = isBoss ? {
    heroId: pickEnemy(id * 31, difficulty + 1),
    level: Math.floor((enemyLv + 5) * mul),
    star: Math.min(8, enemyStar + 2),
  } : undefined;
  return {
    id: id + (mode === 'elite' ? 10000 : mode === 'nightmare' ? 20000 : 0),
    name: `第 ${chapter} 章 · 第 ${level} 关${mode === 'elite' ? '（精英）' : mode === 'nightmare' ? '（噩梦）' : ''}`,
    chapter,
    level,
    recommendedPower: Math.round((200 + level * 80 + difficulty * 50) * mul),
    rewards: {
      gold: Math.round((80 + level * 20) * mul),
      exp: Math.round((20 + level * 5) * mul),
      items: [
        { id: isBoss ? 'soul' : 'gold_small', count: isBoss ? (1 + Math.floor(level / 10)) * (mode === 'elite' ? 2 : mode === 'nightmare' ? 3 : 1) : 0 },
        { id: 'equip_random', count: isBoss ? (mode === 'nightmare' ? 3 : mode === 'elite' ? 2 : 1) : 1 },
        { id: 'awaken_stone', count: isBoss ? Math.floor(level / 20) + 1 : 0 },
      ],
    },
    waves,
    bossId: boss?.heroId,
    unlockLevel: Math.max(1, level - 3),
  };
}

export const STAGES: StageDef[] = (() => {
  const list: StageDef[] = [];
  let id = 1;
  for (let chapter = 1; chapter <= 6; chapter++) {
    for (let lvl = 1; lvl <= 6; lvl++) {
      const stageId = id++;
      list.push(genStage(stageId, chapter, (chapter - 1) * 6 + lvl, chapter, 'normal'));
      list.push(genStage(stageId, chapter, (chapter - 1) * 6 + lvl, chapter, 'elite'));
    }
  }
  return list;
})();

export const TRIAL_TOWER_STAGES: StageDef[] = (() => {
  const list: StageDef[] = [];
  for (let floor = 1; floor <= 100; floor++) {
    list.push({
      id: 30000 + floor,
      name: `试炼塔 · 第 ${floor} 层`,
      chapter: 0,
      level: floor,
      recommendedPower: 200 + floor * 100,
      rewards: {
        gold: 50 + floor * 30,
        exp: 10 + floor * 8,
        items: [
          { id: 'awaken_stone', count: Math.max(1, Math.floor(floor / 10)) },
          { id: floor % 10 === 0 ? 'soul' : 'gold_small', count: floor % 10 === 0 ? 3 : 0 },
        ],
      },
      waves: [
        {
          enemies: Array.from({ length: floor % 10 === 0 ? 1 : 3 }).map((_, i) => ({
            heroId: pickEnemy(floor * 11 + i, floor),
            level: floor * 1.2,
            star: Math.min(8, Math.floor(floor / 8) + 1),
          })),
        },
      ],
      bossId: floor % 10 === 0 ? pickEnemy(floor * 23, floor) : undefined,
    });
  }
  return list;
})();

export const SEAL_LAND_STAGES: StageDef[] = (() => {
  const list: StageDef[] = [];
  for (let i = 1; i <= 20; i++) {
    list.push({
      id: 40000 + i,
      name: `封印之地 · 第 ${i} 关`,
      chapter: 0,
      level: i,
      recommendedPower: 500 + i * 200,
      rewards: {
        gold: 200 + i * 50,
        exp: 50 + i * 10,
        items: [
          { id: 'awaken_stone', count: 2 + Math.floor(i / 3) },
          { id: 'holy_random', count: 1 },
        ],
      },
      waves: [
        {
          enemies: Array.from({ length: 3 }).map((_, j) => ({
            heroId: pickEnemy(i * 31 + j, i + 5),
            level: 30 + i * 3,
            star: Math.min(8, 3 + Math.floor(i / 3)),
          })),
        },
      ],
    });
  }
  return list;
})();

export const FACTION_TRIAL_STAGES: StageDef[] = (() => {
  const list: StageDef[] = [];
  const factions = ['celestial', 'abyss', 'spirit', 'beast', 'human', 'mecha'];
  factions.forEach((f, idx) => {
    for (let i = 1; i <= 50; i++) {
      list.push({
        id: 50000 + idx * 100 + i,
        name: `${f}阵营试炼 · 第 ${i} 层`,
        chapter: 0,
        level: i,
        recommendedPower: 300 + i * 80,
        rewards: {
          gold: 100 + i * 40,
          exp: 30 + i * 10,
          items: [{ id: 'faction_medal', count: i >= 40 ? 5 : 1 }],
        },
        waves: [
          {
            enemies: Array.from({ length: 3 }).map((_, j) => ({
              heroId: pickEnemy(idx * 100 + i * 5 + j, idx),
              level: i * 1.5,
              star: Math.min(8, 2 + Math.floor(i / 5)),
            })),
          },
        ],
      });
    }
  });
  return list;
})();

export const STAGE_MAP: Record<number, StageDef> = Object.fromEntries([...STAGES, ...TRIAL_TOWER_STAGES, ...SEAL_LAND_STAGES, ...FACTION_TRIAL_STAGES].map((s) => [s.id, s]));
export const MAX_STAGE = STAGES.length;

export function getStageType(stageId: number): 'normal' | 'elite' | 'nightmare' | 'trial' | 'seal' | 'faction' {
  if (stageId >= 50000) return 'faction';
  if (stageId >= 40000) return 'seal';
  if (stageId >= 30000) return 'trial';
  if (stageId >= 20000) return 'nightmare';
  if (stageId >= 10000) return 'elite';
  return 'normal';
}