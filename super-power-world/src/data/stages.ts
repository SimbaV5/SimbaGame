import type { StageDef } from '@/types';
import { HEROES } from './heroes';

function pickEnemy(idx: number) {
  return HEROES[(idx * 7 + 13) % HEROES.length].id;
}

function genStage(id: number, chapter: number, level: number, difficulty: number): StageDef {
  const enemyLv = Math.min(120, Math.max(1, Math.floor(level * 0.9)));
  const enemyStar = Math.min(8, Math.max(1, Math.floor(level / 6) + 1));
  const wavesCount = level % 5 === 0 ? 3 : 2;
  const waves = [];
  for (let w = 0; w < wavesCount; w++) {
    const count = w === wavesCount - 1 && level % 3 === 0 ? 1 : 3;
    waves.push({
      enemies: Array.from({ length: count }).map((_, i) => ({
        heroId: pickEnemy(id * 17 + w * 5 + i),
        level: enemyLv + Math.floor(w * 0.4 * enemyLv),
        star: Math.min(8, enemyStar + Math.floor(w / 2)),
      })),
    });
  }
  const isBoss = level % 10 === 0;
  const boss = isBoss ? { heroId: pickEnemy(id * 31), level: enemyLv + 5, star: Math.min(8, enemyStar + 2) } : undefined;
  return {
    id,
    name: `第 ${chapter} 章 · 第 ${level} 关`,
    chapter,
    level,
    recommendedPower: 200 + level * 80 + difficulty * 50,
    rewards: {
      gold: 80 + level * 20,
      exp: 20 + level * 5,
      items: [
        { id: isBoss ? 'soul' : 'gold_small', count: isBoss ? 1 + Math.floor(level / 10) : 0 },
        { id: 'equip_random', count: isBoss ? 2 : 1 },
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
      list.push(genStage(stageId, chapter, (chapter - 1) * 6 + lvl, chapter));
    }
  }
  return list;
})();

export const STAGE_MAP: Record<number, StageDef> = Object.fromEntries(STAGES.map((s) => [s.id, s]));

export const MAX_STAGE = STAGES.length;