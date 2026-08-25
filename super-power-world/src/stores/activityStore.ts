import { defineStore } from 'pinia';
import type { ActivityDef, PlayerSave } from '@/types';
import { ACTIVITIES } from '@/data/activities';
import { usePlayerStore } from './playerStore';
import { useInventoryStore } from './inventoryStore';

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: ACTIVITIES,
    dayIndex: 1,
  }),
  actions: {
    hydrate(save: PlayerSave) {
      this.dayIndex = Math.max(1, Math.min(30, Math.floor((Date.now() - save.createdAt) / 86400000) + 1));
    },
    progress(id: string, amount = 1) {
      const player = usePlayerStore();
      player.save.activitiesProgress[id] = (player.save.activitiesProgress[id] || 0) + amount;
    },
    claimLogin() {
      const player = usePlayerStore();
      const inventory = useInventoryStore();
      const act = this.activities.find((a) => a.id === 'act_login')!;
      const reward = act.rewards?.[this.dayIndex - 1];
      if (!reward) return false;
      const claimedKey = `act_login_${this.dayIndex}`;
      if (player.save.activitiesProgress[claimedKey]) return false;
      player.save.activitiesProgress[claimedKey] = 1;
      reward.items.forEach((it) => {
        if (it.id === 'gem' || it.id === 'gold' || it.id === 'stamina' || it.id === 'exp') {
          player.addCurrency(it.id as any, it.count);
        } else if (it.id === 'ticket_std' || it.id === 'ticket_up') {
          player.addTicket(it.id === 'ticket_std' ? 'standard' : 'up', it.count);
        } else {
          inventory.addItem(it.id, it.count);
        }
      });
      return true;
    },
    claimTask(actId: string) {
      const player = usePlayerStore();
      const inventory = useInventoryStore();
      const act = this.activities.find((a) => a.id === actId);
      if (!act || !act.rewards) return false;
      const claimedKey = `${actId}_${this.dayIndex}`;
      if (player.save.activitiesProgress[claimedKey]) return false;
      const reward = act.rewards.find((r) => (r.day ?? 0) === this.dayIndex) || act.rewards[0];
      player.save.activitiesProgress[claimedKey] = 1;
      reward.items.forEach((it) => {
        if (it.id === 'gem' || it.id === 'gold' || it.id === 'stamina' || it.id === 'exp') {
          player.addCurrency(it.id as any, it.count);
        } else if (it.id === 'ticket_std' || it.id === 'ticket_up') {
          player.addTicket(it.id === 'ticket_std' ? 'standard' : 'up', it.count);
        } else {
          inventory.addItem(it.id, it.count);
        }
      });
      return true;
    },
    buyFund() {
      const player = usePlayerStore();
      if (player.save.activitiesProgress['act_fund_bought']) return false;
      if (player.save.gem < 680) return false;
      player.addCurrency('gem', -680);
      player.save.activitiesProgress['act_fund_bought'] = 1;
      return true;
    },
    consumeReturn(cost: number) {
      const player = usePlayerStore();
      if (player.save.gem < cost) return false;
      player.addCurrency('gem', -cost);
      this.progress('act_consume', cost);
      const total = player.save.activitiesProgress['act_consume'] || 0;
      const tiers = [500, 1500, 3000, 6000];
      tiers.forEach((tier, idx) => {
        const key = `act_consume_t${idx}`;
        if (total >= tier && !player.save.activitiesProgress[key]) {
          player.save.activitiesProgress[key] = 1;
          player.addCurrency('gem', [200, 500, 1000, 300][idx]);
        }
      });
      return true;
    },
  },
});