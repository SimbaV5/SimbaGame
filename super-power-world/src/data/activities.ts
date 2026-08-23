import type { GachaPool, ActivityDef } from '@/types';

export const GACHA_POOLS: GachaPool[] = [
  {
    type: 'standard',
    name: '命运之轮',
    description: '常驻英雄池，包含所有 UR 及以下英雄，概率稳定。',
    costCurrency: 'gem',
    costAmount: 270,
    costMultiple: 10,
  },
  {
    type: 'up',
    name: '星辰召唤',
    description: 'UP 池：当期 SSR 概率提升，含 80 抽小保底、200 抽大保底。',
    costCurrency: 'gem',
    costAmount: 300,
    costMultiple: 10,
    featured: [],
    rateUp: 0.5,
  },
  {
    type: 'collab',
    name: '幻影联动',
    description: '联动限定池：含专属联动 SSR，活动结束下架。',
    costCurrency: 'gem',
    costAmount: 300,
    costMultiple: 10,
    featured: [],
    rateUp: 0.6,
    collabName: '幻影异闻录',
    startDay: 1,
    endDay: 14,
  },
];

export const ACTIVITIES: ActivityDef[] = [
  {
    id: 'act_login',
    dayStart: 1,
    dayEnd: 30,
    name: '30 日登录',
    type: 'login',
    description: '连续登录 30 天可获得稀有奖励',
    rewards: Array.from({ length: 30 }).map((_, i) => ({
      day: i + 1,
      items: [
        { id: i % 7 === 0 ? 'gem' : 'gold', count: i % 7 === 0 ? 200 + i * 10 : 1000 + i * 200 },
        { id: i === 29 ? 'ticket_up' : i % 7 === 0 ? 'ticket_std' : 'stamina_small', count: i === 29 ? 30 : 1 },
      ],
    })),
  },
  {
    id: 'act_fund',
    dayStart: 1,
    dayEnd: 30,
    name: '成长基金',
    type: 'fund',
    description: '购买基金后每天可领奖励，全部领完总计可获 10000 钻石',
    rewards: Array.from({ length: 30 }).map((_, i) => ({
      day: i + 1,
      items: [{ id: 'gem', count: 100 + i * 30 }],
    })),
  },
  {
    id: 'act_shop',
    dayStart: 1,
    dayEnd: 30,
    name: '商城折扣',
    type: 'shop_discount',
    description: '活动期间商城部分商品 5 折',
  },
  {
    id: 'act_consume',
    dayStart: 1,
    dayEnd: 30,
    name: '消费返还',
    type: 'consume_return',
    description: '活动期间累计消费可获返还',
    rewards: [
      { items: [{ id: 'gem', count: 200 }] },
      { items: [{ id: 'gem', count: 500 }] },
      { items: [{ id: 'gem', count: 1000 }] },
      { items: [{ id: 'ticket_up', count: 10 }] },
    ],
  },
  {
    id: 'act_task',
    dayStart: 1,
    dayEnd: 30,
    name: '七日任务',
    type: 'limited_task',
    description: '完成每日任务领取额外奖励',
    rewards: Array.from({ length: 7 }).map((_, i) => ({
      day: i + 1,
      items: [
        { id: 'gem', count: 100 + i * 50 },
        { id: i === 6 ? 'ticket_up' : 'equip_random', count: i === 6 ? 5 : 1 },
      ],
    })),
  },
  {
    id: 'act_boss',
    dayStart: 1,
    dayEnd: 30,
    name: '首领入侵',
    type: 'boss_rush',
    description: '挑战强力 BOSS 获得稀有装备',
  },
];

export const ITEM_NAMES: Record<string, string> = {
  gold_small: '金币袋',
  soul: '英雄之魂',
  ticket_std: '普通召唤券',
  ticket_up: 'UP 召唤券',
  stamina_small: '体力药水',
  equip_random: '随机装备',
};