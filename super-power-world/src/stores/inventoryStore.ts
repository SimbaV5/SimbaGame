import { defineStore } from 'pinia';
import { EQUIPMENTS, EQUIP_MAP } from '@/data/equipment';
import { uuid, weightedChoice } from '@/core/rng';
import { usePlayerStore } from './playerStore';
import { bus, BusEvents } from '@/core/eventBus';

export interface EquipmentInstance {
  uid: string;
  equipId: string;
  level: number;
  refine: number;
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: {} as Record<string, number>,
    equipment: [] as EquipmentInstance[],
  }),
  getters: {
    getItem: (s) => (id: string) => s.items[id] || 0,
    equipByUid: (s) => (uid: string) => s.equipment.find((e) => e.uid === uid),
  },
  actions: {
    hydrate(items: Record<string, number>, equipment: Record<string, { count: number; level: number; refine: number }>) {
      this.items = { ...items };
      this.equipment = Object.entries(equipment).map(([uid, info]) => ({ uid, equipId: Object.keys(info).length ? '' : '', level: info.level, refine: info.refine })).filter((x) => x.equipId);
      // 实际结构改造：
      this.equipment = Object.entries(equipment).map(([uid, info]) => ({
        uid,
        equipId: EQUIPMENTS[(parseInt(uid.replace(/\D/g, '')) || 0) % EQUIPMENTS.length].id,
        level: info.level,
        refine: info.refine,
      }));
    },
    addItem(id: string, count = 1) {
      this.items[id] = (this.items[id] || 0) + count;
      bus.emit(BusEvents.CurrencyChanged, { type: 'item', id, count });
    },
    spendItem(id: string, count: number): boolean {
      if ((this.items[id] || 0) < count) return false;
      this.items[id] -= count;
      bus.emit(BusEvents.CurrencyChanged, { type: 'item', id, count: -count });
      return true;
    },
    addEquipment(rarity?: string): EquipmentInstance {
      const pool = rarity ? EQUIPMENTS.filter((e) => e.rarity === rarity) : EQUIPMENTS;
      const picked = weightedChoice(pool.map((e) => ({ value: e.id, weight: pool.length > 60 ? 1 : 2 })));
      const inst: EquipmentInstance = {
        uid: uuid(),
        equipId: picked,
        level: 1,
        refine: 0,
      };
      this.equipment.push(inst);
      return inst;
    },
    salvage(uid: string) {
      const eq = EQUIP_MAP[this.equipment.find((e) => e.uid === uid)?.equipId || ''];
      const idx = this.equipment.findIndex((e) => e.uid === uid);
      if (idx < 0) return;
      this.equipment.splice(idx, 1);
      if (eq) {
        const player = usePlayerStore();
        player.addCurrency('gold', 200 + this.equipment.length);
      }
    },
    refineEquipment(uid: string): boolean {
      const eq = this.equipment.find((e) => e.uid === uid);
      if (!eq || eq.refine >= 10) return false;
      const player = usePlayerStore();
      const cost = 500 + eq.refine * 300;
      if (player.gold < cost) return false;
      player.addCurrency('gold', -cost);
      eq.refine += 1;
      return true;
    },
  },
});