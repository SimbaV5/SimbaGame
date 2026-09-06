// =========================================================
// 存档读取/保存管理器
// =========================================================

import { loadPlayer, savePlayer, clearPlayer, exportPlayer, importPlayer } from '@/core/db';
import type { PlayerSave } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useActivityStore } from '@/stores/activityStore';
import { newInstance } from '@/stores/heroStore';

let saveTimer: number | null = null;

export async function loadAllStores() {
  const data = await loadPlayer();
  const player = usePlayerStore();
  const hero = useHeroStore();
  const inv = useInventoryStore();
  const act = useActivityStore();
  if (!data) {
    player.resetSave();
    hero.giveStarter();
    await saveAll();
    return false;
  }
  player.setSave(data);
  hero.hydrate(data.heroes || []);
  inv.hydrate(data.inventory || {}, (data as any).equipmentInventory || {});
  act.hydrate(data);
  return true;
}

export async function saveAll() {
  const player = usePlayerStore();
  const hero = useHeroStore();
  const inv = useInventoryStore();
  const save: PlayerSave = JSON.parse(JSON.stringify({
    ...player.save,
    heroes: hero.heroes,
    inventory: inv.items,
    equipmentInventory: inv.equipment.reduce<Record<string, { count: number; level: number; refine: number }>>((acc, e) => {
      acc[e.uid] = { count: 1, level: e.level, refine: e.refine };
      return acc;
    }, {}),
    lastLoginAt: Date.now(),
  }));
  await savePlayer(save);
  player.markClean();
}

let autoSaveInterval: number | null = null;
export function startAutoSave() {
  if (autoSaveInterval) return;
  autoSaveInterval = window.setInterval(() => {
    saveAll().catch((e) => console.error('autosave failed', e));
  }, 30000);
  window.addEventListener('beforeunload', () => {
    saveAll();
  });
}

export function stopAutoSave() {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = null;
}

export async function wipeSave() {
  await clearPlayer();
  await loadAllStores();
}

export { exportPlayer, importPlayer };
void newInstance;