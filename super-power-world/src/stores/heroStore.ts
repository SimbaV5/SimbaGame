import { defineStore } from 'pinia';
import type { HeroInstance, HeroBase } from '@/types';
import { HERO_MAP, HEROES } from '@/data/heroes';
import { uuid, randChoice } from '@/core/rng';
import { computeStats, levelCap, levelUpCost, breakthroughCost, starUpCost } from '@/core/formulas';
import { usePlayerStore } from './playerStore';
import { bus, BusEvents } from '@/core/eventBus';

export { newInstance };

function newInstance(heroId: string, level = 1, star = 1): HeroInstance {
  return {
    uid: uuid(),
    heroId,
    level,
    star,
    breakthrough: 0,
    exp: 0,
    talentPoints: { hp: 0, atk: 0, def: 0, spd: 0 },
    awaken: 0,
    equipment: {},
    locked: false,
  };
}

export const useHeroStore = defineStore('hero', {
  state: () => ({ heroes: [] as HeroInstance[] }),
  getters: {
    byId: (s) => (uid: string) => s.heroes.find((h) => h.uid === uid),
    byBaseId: (s) => (heroId: string) => s.heroes.filter((h) => h.heroId === heroId),
    base: () => (uid: string) => HERO_MAP[HEROES.find(() => true)?.id ?? ''] || null,
    ownedBases: (s) => Array.from(new Set(s.heroes.map((h) => h.heroId))),
  },
  actions: {
    hydrate(list: HeroInstance[]) {
      this.heroes = list;
    },
    add(heroId: string, level = 1, star = 1): HeroInstance {
      const inst = newInstance(heroId, level, star);
      this.heroes.push(inst);
      bus.emit(BusEvents.HeroAdded, inst);
      return inst;
    },
    remove(uid: string) {
      this.heroes = this.heroes.filter((h) => h.uid !== uid);
      bus.emit(BusEvents.HeroUpdated, null);
    },
    addBulk(heroId: string, count: number) {
      const added: HeroInstance[] = [];
      for (let i = 0; i < count; i++) added.push(this.add(heroId));
      return added;
    },
    update(uid: string, patch: Partial<HeroInstance>) {
      const h = this.heroes.find((x) => x.uid === uid);
      if (!h) return;
      Object.assign(h, patch);
      bus.emit(BusEvents.HeroUpdated, h);
    },
    gainExp(uid: string, exp: number) {
      const h = this.heroes.find((x) => x.uid === uid);
      if (!h) return;
      const cap = levelCap(HERO_MAP[h.heroId]);
      if (h.level >= cap) return;
      h.exp += exp;
      const player = usePlayerStore();
      let total = exp;
      let levels = 0;
      while (h.exp >= levelUpCost(h.level, h.level + 1) && h.level < cap) {
        const cost = levelUpCost(h.level, h.level + 1);
        h.exp -= cost;
        h.level += 1;
        levels++;
      }
      if (levels > 0) {
        player.addCurrency('gold', -0);
        bus.emit(BusEvents.HeroUpdated, h);
      }
      player.addCurrency('exp', total - levels);
    },
    breakThrough(uid: string): boolean {
      const h = this.heroes.find((x) => x.uid === uid);
      if (!h) return false;
      const cost = breakthroughCost(h.breakthrough + 1);
      const player = usePlayerStore();
      if (player.gold < cost.gold || player.soul < cost.soul) return false;
      player.addCurrency('gold', -cost.gold);
      player.addCurrency('soul', -cost.soul);
      h.breakthrough = Math.min(5, h.breakthrough + 1);
      bus.emit(BusEvents.HeroUpdated, h);
      return true;
    },
    starUp(uid: string): boolean {
      const h = this.heroes.find((x) => x.uid === uid);
      if (!h) return false;
      const cost = starUpCost(h.star);
      const player = usePlayerStore();
      const dups = this.byBaseId(h.heroId).filter((x) => x.uid !== uid && x.star === h.star && !x.locked);
      if (dups.length < cost.dupCount) return false;
      if (player.gold < cost.gold || player.soul < cost.soul) return false;
      player.addCurrency('gold', -cost.gold);
      player.addCurrency('soul', -cost.soul);
      // 消耗狗粮
      const toRemove = dups.slice(0, cost.dupCount).map((d) => d.uid);
      this.heroes = this.heroes.filter((x) => !toRemove.includes(x.uid));
      h.star = Math.min(8, h.star + 1);
      bus.emit(BusEvents.HeroUpdated, h);
      return true;
    },
    addTalent(uid: string, key: 'hp' | 'atk' | 'def' | 'spd'): boolean {
      const h = this.heroes.find((x) => x.uid === uid);
      if (!h) return false;
      if (h.talentPoints[key] >= 50) return false;
      const cost = 1000 + h.talentPoints[key] * 100;
      const player = usePlayerStore();
      if (player.gold < cost) return false;
      player.addCurrency('gold', -cost);
      h.talentPoints[key] += 1;
      bus.emit(BusEvents.HeroUpdated, h);
      return true;
    },
    equip(uid: string, slot: string, equipId: string | null) {
      const h = this.heroes.find((x) => x.uid === uid);
      if (!h) return;
      const key = slot as keyof typeof h.equipment;
      if (equipId) h.equipment[key] = equipId;
      else delete h.equipment[key];
      bus.emit(BusEvents.HeroUpdated, h);
    },
    giveStarter() {
      const startIds = ['h_warrior_fire_celestial_0', 'h_mage_water_abyss_0', 'h_support_light_spirit_0'];
      const ids = Array.from(new Set([...startIds, ...HEROES.slice(0, 3).map((h) => h.id)]));
      ids.forEach((id) => {
        if (!HERO_MAP[id]) return;
        this.add(id, 10, 1);
      });
      const player = usePlayerStore();
      player.save.formation.slots[0] = this.heroes[0]?.uid ?? null;
      player.save.formation.slots[1] = this.heroes[1]?.uid ?? null;
      player.save.formation.slots[2] = this.heroes[2]?.uid ?? null;
    },
    pickRandomHeroByRarity(rarities: string[]): HeroBase {
      const candidates = HEROES.filter((h) => rarities.includes(h.rarity));
      return randChoice(candidates);
    },
  },
});