import { defineStore } from 'pinia';
import type { Currency, PlayerSave, GachaPoolType } from '@/types';
import { uuid, clamp } from '@/core/rng';
import { bus, BusEvents } from '@/core/eventBus';

const SCHEMA = 1;

function newSave(): PlayerSave {
  return {
    uid: uuid(),
    nickname: '小超能',
    level: 1,
    exp: 0,
    vipLevel: 0,
    vipExp: 0,
    gold: 5000,
    gem: 1500,
    soul: 50,
    stamina: 120,
    staminaUpdatedAt: Date.now(),
    tickets: { standard: 5, up: 0, collab: 0 },
    heroes: [],
    inventory: {},
    equipmentInventory: {},
    formation: { slots: [null, null, null, null, null, null] },
    currentStage: 1,
    clearedStages: [],
    highestStage: 0,
    pity: {
      standard: { count: 0, guaranteedRarity: null, featuredPity: 0 },
      up: { count: 0, guaranteedRarity: null, featuredPity: 0 },
      collab: { count: 0, guaranteedRarity: null, featuredPity: 0 },
    },
    gachaHistory: [],
    monthlyCardExpiresAt: 0,
    firstChargeClaimed: false,
    purchases: [],
    achievements: [],
    activitiesProgress: {},
    unlockedHeroes: [],
    debug: { invincible: false, damageMultiplier: 1, skipStage: false, acceleratedTime: false },
    lastLoginAt: Date.now(),
    totalPlayTime: 0,
    createdAt: Date.now(),
    schemaVersion: SCHEMA,
  };
}

export const usePlayerStore = defineStore('player', {
  state: () => ({ save: newSave() as PlayerSave, dirty: false }),
  getters: {
    gold: (s) => s.save.gold,
    gem: (s) => s.save.gem,
    soul: (s) => s.save.soul,
    stamina: (s) => s.save.stamina,
    vip: (s) => s.save.vipLevel,
    highestStage: (s) => s.save.highestStage,
    formation: (s) => s.save.formation,
    nickname: (s) => s.save.nickname,
  },
  actions: {
    setSave(save: PlayerSave) {
      this.save = { ...newSave(), ...save, debug: { ...newSave().debug, ...(save.debug || {}) } };
      this.dirty = true;
    },
    markClean() {
      this.dirty = false;
    },
    addCurrency(type: Currency | 'exp', amount: number) {
      const v = (this.save as any)[type];
      if (typeof v === 'number') {
        (this.save as any)[type] = clamp((v as number) + amount, 0, 99999999);
        bus.emit(BusEvents.CurrencyChanged, { type, amount });
      }
    },
    spend(type: Currency, amount: number): boolean {
      const v = (this.save as any)[type];
      if (typeof v !== 'number' || v < amount) return false;
      (this.save as any)[type] = v - amount;
      bus.emit(BusEvents.CurrencyChanged, { type, amount: -amount });
      return true;
    },
    addTicket(pool: GachaPoolType, count = 1) {
      this.save.tickets[pool] = (this.save.tickets[pool] || 0) + count;
      bus.emit(BusEvents.CurrencyChanged, { type: 'ticket', amount: count });
    },
    setNickname(name: string) {
      this.save.nickname = name.slice(0, 12);
    },
    addVipExp(v: number) {
      this.save.vipExp += v;
      this.save.vipLevel = Math.floor(this.save.vipExp / 100);
    },
    setDebug(opts: Partial<PlayerSave['debug']>) {
      this.save.debug = { ...this.save.debug, ...opts };
    },
    grantStamina(value: number) {
      this.save.stamina = clamp(this.save.stamina + value, 0, 240);
      bus.emit(BusEvents.CurrencyChanged, { type: 'stamina', amount: value });
    },
    consumeStamina(value: number): boolean {
      if (this.save.stamina < value) return false;
      this.save.stamina -= value;
      bus.emit(BusEvents.CurrencyChanged, { type: 'stamina', amount: -value });
      return true;
    },
    recoverStamina(now = Date.now()) {
      const last = this.save.staminaUpdatedAt || now;
      const mins = Math.floor((now - last) / 60000);
      if (mins <= 0) return;
      const recover = Math.floor(mins / 5);
      if (recover > 0) {
        this.save.stamina = clamp(this.save.stamina + recover, 0, 240);
        this.save.staminaUpdatedAt = last + recover * 5 * 60000;
        bus.emit(BusEvents.CurrencyChanged, { type: 'stamina', amount: recover });
      }
    },
    recordClearedStage(stageId: number) {
      if (!this.save.clearedStages.includes(stageId)) {
        this.save.clearedStages.push(stageId);
      }
      if (stageId > this.save.highestStage) this.save.highestStage = stageId;
      if (stageId >= this.save.currentStage) this.save.currentStage = Math.min(stageId + 1, 99);
    },
    resetSave() {
      this.save = newSave();
    },
  },
});