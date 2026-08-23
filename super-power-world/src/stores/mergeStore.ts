import { defineStore } from 'pinia';
import type { HeroInstance } from '@/types';
import { uuid } from '@/core/rng';
import { usePlayerStore } from './playerStore';
import { bus, BusEvents } from '@/core/eventBus';
import { audio } from '@/core/audio';

export interface MergeCell {
  uid: string;
  heroId: string;
  star: number;
  level: number;
  dragging?: boolean;
}

const GRID_SIZE = 9;

export const useMergeStore = defineStore('merge', {
  state: () => ({
    grid: Array.from({ length: GRID_SIZE }).map(() => null) as (MergeCell | null)[],
    maxSlots: GRID_SIZE,
    selectedUid: null as string | null,
    busy: false,
  }),
  getters: {
    findByUid: (s) => (uid: string) => s.grid.find((c) => c && c.uid === uid),
  },
  actions: {
    hydrate() {
      // 不从存档恢复 merge grid（玩家必须先召唤），可选择性接入
      this.grid = Array.from({ length: GRID_SIZE }).map(() => null);
    },
    addCell(heroId: string, star = 1, level = 1): MergeCell | null {
      const idx = this.grid.findIndex((c) => c === null);
      if (idx < 0) return null;
      const cell: MergeCell = { uid: uuid(), heroId, star, level };
      this.grid[idx] = cell;
      return cell;
    },
    move(from: number, to: number) {
      if (from === to) return { ok: false, reason: 'same' as const };
      const a = this.grid[from];
      const b = this.grid[to];
      if (!a) return { ok: false, reason: 'empty' as const };
      if (b && (b.heroId !== a.heroId || b.star !== a.star)) {
        return { ok: false, reason: 'mismatch' as const };
      }
      if (b && b.star >= 8) {
        return { ok: false, reason: 'max_star' as const };
      }
      if (!b) {
        this.grid[to] = a;
        this.grid[from] = null;
        return { ok: true, merged: false };
      }
      // 合并
      const newStar = Math.min(8, a.star + 1);
      const newLevel = Math.max(a.level, b.level);
      this.grid[to] = { uid: uuid(), heroId: a.heroId, star: newStar, level: newLevel };
      this.grid[from] = null;
      bus.emit(BusEvents.HeroUpdated, null);
      audio.playSfx('merge');
      return { ok: true, merged: true };
    },
    collectToInventory(toHeroStore: (uid: string) => HeroInstance | undefined) {
      const player = usePlayerStore();
      // 把 grid 中可收集的英雄送入英雄列表
      for (let i = 0; i < this.grid.length; i++) {
        const cell = this.grid[i];
        if (!cell) continue;
        // 调用 heroStore 的能力需要外部传入（避免循环引用）
        // 这里只做收集动作；具体加入 heroStore 由 UI 层组合
      }
      void player;
      void toHeroStore;
    },
    removeAt(idx: number) {
      this.grid[idx] = null;
    },
    select(uid: string | null) {
      this.selectedUid = uid;
    },
    clearAll() {
      this.grid = Array.from({ length: GRID_SIZE }).map(() => null);
    },
  },
});