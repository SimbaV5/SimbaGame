import { defineStore } from 'pinia';
import type { GachaPoolType, HeroRarity } from '@/types';
import { GACHA_POOLS } from '@/data/activities';
import { HEROES } from '@/data/heroes';
import { weightedChoice, randChoice, chance } from '@/core/rng';
import { RARITY_GACHA_RATE } from '@/core/formulas';
import { useHeroStore } from './heroStore';
import { usePlayerStore } from './playerStore';
import { audio } from '@/core/audio';

export interface PullResult {
  heroId: string;
  rarity: HeroRarity;
  isNew: boolean;
  isFeatured: boolean;
}

export const useGachaStore = defineStore('gacha', {
  state: () => ({
    pools: GACHA_POOLS,
  }),
  actions: {
    pickRarity(poolType: GachaPoolType, pity: { count: number; guaranteedRarity: HeroRarity | null; featuredPity: number }): HeroRarity {
      // Pity: 80 抽必出 SSR，200 抽必出 UP SSR（仅 up 池）/必出 LR（standard）
      if (poolType === 'standard' && pity.count >= 80 && !pity.guaranteedRarity) {
        return 'UR';
      }
      if (poolType === 'up' && pity.count >= 80 && !pity.guaranteedRarity) {
        return 'SSR';
      }
      if (poolType === 'collab' && pity.count >= 60) {
        return 'UR';
      }
      const rates: Record<HeroRarity, number> = {
        N: RARITY_GACHA_RATE.N ?? 0,
        R: RARITY_GACHA_RATE.R ?? 0,
        SR: RARITY_GACHA_RATE.SR ?? 0,
        SSR: RARITY_GACHA_RATE.SSR ?? 0,
        UR: RARITY_GACHA_RATE.UR ?? 0,
        LR: RARITY_GACHA_RATE.LR ?? 0,
        MRC: RARITY_GACHA_RATE.MRC ?? 0,
      };
      if (poolType === 'up') {
        rates.SSR = (rates.SSR || 0) + 0.05;
        rates.UR = (rates.UR || 0) + 0.01;
      }
      if (poolType === 'collab') {
        rates.SSR = (rates.SSR || 0) + 0.08;
        rates.UR = (rates.UR || 0) + 0.02;
      }
      const items = (Object.entries(rates) as [HeroRarity, number][]).map(([value, weight]) => ({ value, weight }));
      return weightedChoice(items);
    },
    rollOne(poolType: GachaPoolType): PullResult {
      const player = usePlayerStore();
      const hero = useHeroStore();
      const pity = player.save.pity[poolType];
      const rarity = this.pickRarity(poolType, pity);
      pity.count += 1;
      let isFeatured = false;
      let picked: { id: string; rarity: HeroRarity };

      if (poolType === 'standard') {
        const pool = HEROES.filter((h) => h.rarity === rarity);
        picked = pool.length ? randChoice(pool) : randChoice(HEROES);
      } else if (poolType === 'up') {
        const upPool = HEROES.filter((h) => h.rarity === rarity && h.rarity === 'SSR');
        const allPool = HEROES.filter((h) => h.rarity === rarity);
        const useUp = chance(0.5) && upPool.length > 0;
        picked = useUp ? randChoice(upPool) : randChoice(allPool);
        isFeatured = useUp;
        if (rarity === 'SSR' && pity.count >= 80) {
          picked = upPool.length ? randChoice(upPool) : picked;
          isFeatured = true;
          pity.count = 0;
        }
      } else {
        const pool = HEROES.filter((h) => h.rarity === rarity);
        picked = pool.length ? randChoice(pool) : randChoice(HEROES);
        isFeatured = rarity === 'UR' || rarity === 'LR';
      }

      // 触发必出逻辑
      if (pity.guaranteedRarity === rarity) {
        pity.guaranteedRarity = null;
        pity.count = 0;
      } else if (rarity === 'UR' || rarity === 'LR' || rarity === 'MRC') {
        pity.guaranteedRarity = null;
        pity.count = 0;
      } else {
        pity.guaranteedRarity = pity.guaranteedRarity;
      }

      const isNew = !hero.byBaseId(picked.id).length;
      const inst = hero.add(picked.id, 1, 1);
      const result: PullResult = { heroId: picked.id, rarity: picked.rarity, isNew, isFeatured };
      player.save.gachaHistory.unshift({ type: poolType, heroId: picked.id, isFeatured, at: Date.now() });
      player.save.gachaHistory = player.save.gachaHistory.slice(0, 200);
      void inst;
      return result;
    },
    pull(poolType: GachaPoolType, count: number, useTicket = false) {
      const player = usePlayerStore();
      const pool = this.pools.find((p) => p.type === poolType)!;
      const ticket = player.save.tickets[poolType] || 0;
      const needTickets = Math.min(ticket, count);
      const rest = count - needTickets;
      const cost = useTicket ? 0 : rest * (rest >= 10 ? pool.costAmount * (pool.costMultiple ?? 10) : pool.costAmount);
      void cost;
      // 消耗
      if (needTickets > 0) player.save.tickets[poolType] -= needTickets;
      const actualPay = rest - (rest >= 10 ? Math.floor(rest * 0.9) : 0);
      if (!useTicket && actualPay > 0) {
        if (!player.spend('gem', actualPay * pool.costAmount)) return [];
      }
      const results: PullResult[] = [];
      for (let i = 0; i < count; i++) results.push(this.rollOne(poolType));
      return results;
    },
  },
});