// =========================================================
// IndexedDB 存档封装 (基于 idb)
// =========================================================

import { openDB, type IDBPDatabase } from 'idb';
import type { PlayerSave } from '@/types';

const DB_NAME = 'spw_save';
const DB_VERSION = 1;
const STORE = 'saves';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function savePlayer(save: PlayerSave) {
  const db = await getDB();
  await db.put(STORE, save, 'player');
}

export async function loadPlayer(): Promise<PlayerSave | null> {
  const db = await getDB();
  const data = (await db.get(STORE, 'player')) as PlayerSave | undefined;
  return data ?? null;
}

export async function clearPlayer() {
  const db = await getDB();
  await db.delete(STORE, 'player');
}

export async function exportPlayer(): Promise<string> {
  const data = await loadPlayer();
  return JSON.stringify(data ?? {});
}

export async function importPlayer(json: string): Promise<PlayerSave | null> {
  try {
    const data = JSON.parse(json) as PlayerSave;
    await savePlayer(data);
    return data;
  } catch (e) {
    console.error('[DB] import failed', e);
    return null;
  }
}