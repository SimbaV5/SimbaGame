import { defineStore } from 'pinia';
import type { Currency, HeroRarity, GachaPoolType } from '@/types';
import { EQUIPMENTS } from '@/data/equipment';
import { weightedChoice } from '@/core/rng';
import { usePlayerStore } from './playerStore';
import { useInventoryStore } from './inventoryStore';
import { useGachaStore } from './gachaStore';
import { audio } from '@/core/audio';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: { currency: Currency; amount: number; originalAmount?: number };
  type: 'gold_pack' | 'gem_pack' | 'stamina_pack' | 'soul_pack' | 'ticket_pack' | 'equip_box' | 'monthly_card' | 'first_charge' | 'fund' | 'gift_pack';
  rarity?: HeroRarity;
  ticketPool?: GachaPoolType;
  count?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
}

export const SHOP_CATALOG: ShopItem[] = [
  { id: 'gold_1', name: '金币袋', description: '获得 5000 金币', price: { currency: 'gem', amount: 30 }, type: 'gold_pack', count: 5000, dailyLimit: 5 },
  { id: 'gold_2', name: '金币箱', description: '获得 30000 金币', price: { currency: 'gem', amount: 150 }, type: 'gold_pack', count: 30000, dailyLimit: 2 },
  { id: 'gem_1', name: '钻石袋', description: '获得 300 钻石', price: { currency: 'gem', amount: 0 }, type: 'gem_pack', count: 300 },
  { id: 'gem_2', name: '钻石箱', description: '获得 1888 钻石', price: { currency: 'gem', amount: 0 }, type: 'gem_pack', count: 1888 },
  { id: 'stam_1', name: '体力药水', description: '恢复 60 体力', price: { currency: 'gem', amount: 50 }, type: 'stamina_pack', count: 60, dailyLimit: 3 },
  { id: 'soul_1', name: '英魂袋', description: '获得 100 英魂', price: { currency: 'gem', amount: 80 }, type: 'soul_pack', count: 100 },
  { id: 'ticket_std_1', name: '普通召唤券', description: '可用于常驻池', price: { currency: 'gem', amount: 270 }, type: 'ticket_pack', ticketPool: 'standard', count: 1 },
  { id: 'ticket_up_1', name: 'UP 召唤券', description: '可用于 UP 池', price: { currency: 'gem', amount: 300 }, type: 'ticket_pack', ticketPool: 'up', count: 1 },
  { id: 'equip_box_r', name: '稀有装备箱', description: '随机开出 R 级装备', price: { currency: 'gem', amount: 200 }, type: 'equip_box', rarity: 'R' },
  { id: 'equip_box_sr', name: '史诗装备箱', description: '随机开出 SR 级装备', price: { currency: 'gem', amount: 500 }, type: 'equip_box', rarity: 'SR' },
  { id: 'equip_box_ssr', name: '传说装备箱', description: '随机开出 SSR 级装备', price: { currency: 'gem', amount: 1500 }, type: 'equip_box', rarity: 'SSR' },
  { id: 'first_charge', name: '首充礼包', description: '充值任意金额获得超值奖励（模拟）', price: { currency: 'gem', amount: 1, originalAmount: 1 }, type: 'first_charge' },
  { id: 'monthly_card', name: '月卡', description: '30 天每日领取 200 钻石', price: { currency: 'gem', amount: 980 }, type: 'monthly_card' },
  { id: 'fund', name: '成长基金', description: '30 天累计可获 10000 钻石', price: { currency: 'gem', amount: 680 }, type: 'fund' },
  { id: 'gift_a', name: '新手礼包', description: '10 张 UP 券 + 5000 金币', price: { currency: 'gem', amount: 1, originalAmount: 3280 }, type: 'gift_pack' },
  { id: 'gift_b', name: '豪华礼包', description: '5 张 SSR 自选 + 大量资源', price: { currency: 'gem', amount: 3280, originalAmount: 8888 }, type: 'gift_pack' },
];

export const useShopStore = defineStore('shop', {
  state: () => ({
    catalog: SHOP_CATALOG,
  }),
  actions: {
    buy(itemId: string) {
      const player = usePlayerStore();
      const inventory = useInventoryStore();
      const gacha = useGachaStore();
      const item = this.catalog.find((x) => x.id === itemId);
      if (!item) return { ok: false, reason: 'no_item' };
      if (player.gem < item.price.amount) return { ok: false, reason: 'no_money' };
      const limit = this.limitKey(item);
      if (limit) {
        const used = player.save.purchases.find((p) => p.id === itemId)?.count || 0;
        if (item.dailyLimit && used >= item.dailyLimit && limit === 'd') return { ok: false, reason: 'limit' };
      }
      player.addCurrency('gem', -item.price.amount);
      switch (item.type) {
        case 'gold_pack':
          player.addCurrency('gold', item.count ?? 0);
          break;
        case 'gem_pack':
          player.addCurrency('gem', item.count ?? 0);
          break;
        case 'stamina_pack':
          player.grantStamina(item.count ?? 0);
          break;
        case 'soul_pack':
          player.addCurrency('soul', item.count ?? 0);
          break;
        case 'ticket_pack':
          player.addTicket(item.ticketPool ?? 'standard', item.count ?? 1);
          break;
        case 'equip_box': {
          const pool = EQUIPMENTS.filter((e) => !item.rarity || e.rarity === item.rarity);
          const picked = pool.length ? weightedChoice(pool.map((p) => ({ value: p.id, weight: 1 }))) : EQUIPMENTS[0].id;
          inventory.addItem(picked, 1);
          break;
        }
        case 'first_charge': {
          if (player.save.firstChargeClaimed) return { ok: false, reason: 'already' };
          player.save.firstChargeClaimed = true;
          player.addCurrency('gem', 1888);
          player.addCurrency('gold', 100000);
          player.addTicket('up', 20);
          break;
        }
        case 'monthly_card': {
          player.save.monthlyCardExpiresAt = Date.now() + 30 * 86400000;
          break;
        }
        case 'fund': {
          if (player.save.activitiesProgress['act_fund_bought']) return { ok: false, reason: 'already' };
          player.save.activitiesProgress['act_fund_bought'] = 1;
          break;
        }
        case 'gift_pack': {
          if (item.id === 'gift_a') {
            player.addTicket('up', 10);
            player.addCurrency('gold', 5000);
          } else {
            player.addTicket('up', 5);
            player.addCurrency('gem', 1888);
            player.addCurrency('gold', 50000);
          }
          break;
        }
      }
      const ex = player.save.purchases.find((p) => p.id === itemId);
      if (ex) ex.count += 1;
      else player.save.purchases.push({ id: itemId, count: 1, claimedAt: Date.now() });
      player.addVipExp(item.price.amount);
      audio.playSfx('purchase');
      void gacha;
      return { ok: true };
    },
    limitKey(item: ShopItem) {
      if (item.dailyLimit) return 'd';
      if (item.weeklyLimit) return 'w';
      if (item.monthlyLimit) return 'm';
      return '';
    },
    dailyReset(now = Date.now()) {
      const player = usePlayerStore();
      const lastReset = player.save.activitiesProgress['__daily_reset'] || 0;
      if (now - lastReset > 86400000) {
        player.save.purchases = [];
        player.save.activitiesProgress['__daily_reset'] = now;
      }
    },
  },
});