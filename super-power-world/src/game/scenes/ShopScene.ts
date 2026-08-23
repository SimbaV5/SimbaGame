import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useShopStore, SHOP_CATALOG } from '@/stores/shopStore';
import { usePlayerStore } from '@/stores/playerStore';

export class ShopScene extends Phaser.Scene {
  private tab: 'gem' | 'fund' | 'gift' | 'consume' = 'gem';

  constructor() { super('ShopScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '商城', () => this.scene.start('MainScene'));
    this.drawTabs();
    this.drawGoods();
  }

  private drawTabs() {
    const tabs = [
      { id: 'gem', name: '资源' },
      { id: 'fund', name: '基金月卡' },
      { id: 'gift', name: '礼包' },
      { id: 'consume', name: '消费返还' },
    ] as const;
    const w = (GAME_WIDTH - 24) / tabs.length;
    tabs.forEach((t, i) => {
      const x = 12 + i * w;
      const y = 100;
      const isActive = this.tab === t.id;
      panel(this, x + 4, y, w - 8, 50, isActive ? 0xfbbf24 : 0x23234a);
      this.add.text(x + w / 2, y + 25, t.name, {
        fontSize: '20px',
        color: isActive ? '#1a1a2e' : '#fff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      const bg = this.add.rectangle(x + w / 2, y + 25, w - 8, 50, 0xffffff, 0).setInteractive();
      bg.on('pointerdown', () => {
        this.tab = t.id;
        this.scene.restart();
      });
    });
  }

  private drawGoods() {
    const startY = 170;
    const cellH = 120;
    const cellW = GAME_WIDTH - 24;
    const player = usePlayerStore();
    const shop = useShopStore();

    const filtered = this.tab === 'gem'
      ? shop.catalog.filter((x) => ['gold_pack', 'gem_pack', 'stamina_pack', 'soul_pack', 'ticket_pack', 'equip_box'].includes(x.type))
      : this.tab === 'fund'
        ? shop.catalog.filter((x) => ['monthly_card', 'fund', 'first_charge'].includes(x.type))
        : this.tab === 'gift'
          ? shop.catalog.filter((x) => x.type === 'gift_pack')
          : SHOP_CATALOG.filter((x) => x.id === 'consume_return');

    filtered.forEach((item, i) => {
      const x = 12;
      const y = startY + i * (cellH + 10);
      panel(this, x, y, cellW, cellH, 0x23234a);
      this.add.text(x + 12, y + 14, item.name, { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });
      this.add.text(x + 12, y + 50, item.description, { fontSize: '16px', color: '#ffffffcc' });
      const label = item.price.amount === 0 ? '免费' : `${item.price.amount} 钻石`;
      button(this, x + cellW - 200, y + cellH / 2 - 25, 180, 50, label, () => {
        const r = shop.buy(item.id);
        if (!r.ok) toast(this, r.reason === 'no_money' ? '钻石不足' : '已达上限');
        else toast(this, '购买成功');
        this.scene.restart();
      }, { fontSize: 20 });
      const used = player.save.purchases.find((p) => p.id === item.id)?.count || 0;
      if (item.dailyLimit) this.add.text(x + 12, y + cellH - 30, `今日 ${used}/${item.dailyLimit}`, { fontSize: '14px', color: '#9ca3af' });
    });

    // 消费返还面板
    if (this.tab === 'consume') {
      const consumed = player.save.activitiesProgress['act_consume'] || 0;
      this.add.text(GAME_WIDTH / 2, startY + 60, `累计消费 ${consumed} 钻`, { fontSize: '24px', color: '#fbbf24' }).setOrigin(0.5);
      button(this, GAME_WIDTH / 2 - 100, startY + 100, 200, 60, '模拟消费 100', () => {
        shop.buy('gold_1');
        this.scene.restart();
      }, { fontSize: 20 });
    }
  }
}