import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  drawSceneBackdrop,
  drawTopNav,
  drawSectionHeader,
  drawSoftPanel,
  drawPolishedButton,
  setGameRefSize,
  CARTOON,
  DS,
} from '../ui/designSystem';
import { useShopStore, SHOP_CATALOG } from '@/stores/shopStore';
import { usePlayerStore } from '@/stores/playerStore';

export class ShopScene extends Phaser.Scene {
  private tab: 'gem' | 'fund' | 'gift' | 'consume' = 'gem';

  constructor() { super('ShopScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'city', { dimTop: 100, dimBottom: 40 });

    drawTopNav(this, '神秘商城', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      right: () => audio.playSfx?.('click'),
      rightGlyph: '?',
    });

    this.drawTabs();
    this.drawGoods();
  }

  private drawTabs() {
    const tabs = [
      { id: 'gem', name: '资源', glyph: '��' },
      { id: 'fund', name: '基金月卡', glyph: '��' },
      { id: 'gift', name: '礼包', glyph: '��' },
      { id: 'consume', name: '消费返还', glyph: '��' },
    ] as const;
    const w = (GAME_WIDTH - 32) / tabs.length;
    const y = 102;
    tabs.forEach((t, i) => {
      const x = 16 + i * w;
      const isActive = this.tab === t.id;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.35);
      g.fillRoundedRect(x + 3, y + 4, w - 8, 56, 12);
      if (isActive) {
        g.fillStyle(0x8a5a20, 1);
        g.fillRoundedRect(x + 2, y + 2, w - 8, 56, 12);
        g.fillStyle(0xc09030, 1);
        g.fillRoundedRect(x + 4, y + 0, w - 12, 56, 11);
        g.fillStyle(CARTOON.hexGold, 1);
        g.fillRoundedRect(x + 6, y + 2, w - 16, 52, 10);
        g.fillStyle(0xfff0a0, 0.5);
        g.fillRoundedRect(x + 8, y + 4, w - 20, 22, 8);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeRoundedRect(x + 4, y + 0, w - 12, 56, 11);
      } else {
        g.fillStyle(0x0a2a4a, 1);
        g.fillRoundedRect(x + 2, y + 2, w - 8, 56, 12);
        g.fillStyle(0x1a4a8a, 1);
        g.fillRoundedRect(x + 4, y + 4, w - 12, 52, 11);
        g.fillStyle(0xffffff, 0.12);
        g.fillRoundedRect(x + 6, y + 5, w - 16, 20, 9);
        g.lineStyle(1.5, 0x6ab8f0, 0.45);
        g.strokeRoundedRect(x + 4, y + 4, w - 12, 52, 11);
      }
      // 角金点
      if (isActive) {
        [[x + 10, y + 6], [x + w - 14, y + 6]].forEach(([cx, cy]) => {
          g.fillStyle(0xfff0a0, 0.9);
          g.fillCircle(cx, cy, 3);
        });
      }
      this.add.text(x + w / 2, y + 18, t.glyph, { fontSize: '20px' }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 42, t.name, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: isActive ? '#fff0c0' : '#ffffff',
        fontStyle: 'bold',
        stroke: isActive ? '#5a3a0a' : '#0a2a4a',
        strokeThickness: 2,
      }).setOrigin(0.5);
      const hit = this.add.rectangle(x + w / 2, y + 28, w - 8, 56, 0xffffff, 0).setInteractive();
      hit.on('pointerdown', () => {
        audio.playSfx?.('click');
        this.tab = t.id;
        this.scene.restart();
      });
    });
  }

  private drawGoods() {
    const startY = 180;
    const cellH = 130;
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
      const panel = drawSoftPanel(this, x, y, cellW, cellH, {
        fill: 0x1a2848, fillAlpha: 0.95, edge: 0x6ab8f0, edgeAlpha: 0.5,
      });
      this.add.existing(panel);

      // 左侧图标圆（带渐变）
      const icon = this.add.graphics();
      icon.fillStyle(0x000000, 0.4);
      icon.fillCircle(x + 70, y + cellH / 2 + 2, 48);
      const colMap: Record<string, number> = {
        gold_pack: 0xf0c040, gem_pack: 0x5cb3ea, stamina_pack: 0x3ecf8e,
        soul_pack: 0xb06fe0, ticket_pack: 0xff8aa0, equip_box: 0xff9a50,
        monthly_card: 0xf0c040, fund: 0xffd76a, first_charge: 0xff5a5a,
        gift_pack: 0xe64ba8,
      };
      const col = colMap[item.type] ?? 0xffffff;
      icon.fillStyle(col, 0.4);
      icon.fillCircle(x + 70, y + cellH / 2, 46);
      icon.fillStyle(col, 0.95);
      icon.fillCircle(x + 70, y + cellH / 2, 40);
      icon.fillStyle(0xffffff, 0.4);
      icon.fillCircle(x + 64, y + cellH / 2 - 6, 16);
      icon.lineStyle(2, 0xffffff, 0.6);
      icon.strokeCircle(x + 70, y + cellH / 2, 40);

      const glyphMap: Record<string, string> = {
        gold_pack: '��', gem_pack: '��', stamina_pack: '⚡', soul_pack: '��',
        ticket_pack: '��️', equip_box: '��', monthly_card: '��', fund: '��',
        first_charge: '⚡', gift_pack: '��',
      };
      this.add.text(x + 70, y + cellH / 2, glyphMap[item.type] ?? '��', { fontSize: '38px' }).setOrigin(0.5);

      // 名称 + 描述
      this.add.text(x + 130, y + 20, item.name, {
        fontFamily: DS.font.display,
        fontSize: '24px',
        color: '#ffe48a',
        fontStyle: 'bold',
        stroke: '#3a2010',
        strokeThickness: 3,
      });
      this.add.text(x + 130, y + 56, item.description, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#cfe6ff',
        wordWrap: { width: cellW - 280 },
      });

      // 右上角稀有标签
      if (item.rarity) {
        const rarMap: Record<string, { col: number; txt: string }> = {
          N: { col: 0x5a6470, txt: '#ffffff' },
          R: { col: 0x3aa0d4, txt: '#ffffff' },
          SR: { col: 0xa060e0, txt: '#ffffff' },
          SSR: { col: 0xf0c040, txt: '#3a2010' },
          UR: { col: 0xff6a8a, txt: '#ffffff' },
        };
        const rc = rarMap[item.rarity] ?? rarMap.SSR;
        const rbg = this.add.graphics();
        rbg.fillStyle(0x000000, 0.4);
        rbg.fillRoundedRect(x + cellW - 246, y + 14, 56, 22, 8);
        rbg.fillStyle(rc.col, 1);
        rbg.fillRoundedRect(x + cellW - 248, y + 12, 56, 22, 8);
        rbg.fillStyle(0xffffff, 0.4);
        rbg.fillRoundedRect(x + cellW - 246, y + 13, 52, 8, 6);
        rbg.lineStyle(1, 0xfff0a0, 0.8);
        rbg.strokeRoundedRect(x + cellW - 248, y + 12, 56, 22, 8);
        this.add.text(x + cellW - 220, y + 23, item.rarity, {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: rc.txt,
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.6)',
          strokeThickness: 2,
        }).setOrigin(0.5);
      }

      // 购买按钮
      drawPolishedButton(
        this,
        x + cellW - 200, y + cellH / 2 - 28, 184, 56,
        item.price.amount === 0 ? '免费' : `${item.price.amount} ��`,
        {
          variant: item.price.amount === 0 ? 'green' : 'gold',
          fontSize: '20px',
          onClick: () => {
            const r = shop.buy(item.id);
            if (!r.ok) {
              this.showToast(r.reason === 'no_money' ? '钻石不足' : '已达上限');
            } else {
              this.showToast('购买成功');
            }
            audio.playSfx?.('purchase');
            this.scene.restart();
          },
        },
      );

      const used = player.save.purchases.find((p) => p.id === item.id)?.count || 0;
      if (item.dailyLimit) {
        this.add.text(x + 130, y + cellH - 22, `今日 ${used}/${item.dailyLimit}`, {
          fontFamily: DS.font.body,
          fontSize: '15px',
          color: '#ffd76a',
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.6)',
          strokeThickness: 2,
        });
      } else if (item.weeklyLimit) {
        this.add.text(x + 130, y + cellH - 22, `本周 ${used}/${item.weeklyLimit}`, {
          fontFamily: DS.font.body,
          fontSize: '15px',
          color: '#ffd76a',
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.6)',
          strokeThickness: 2,
        });
      } else if (item.type === 'monthly_card') {
        this.add.text(x + 130, y + cellH - 22, '购买后立即生效 30 天', {
          fontFamily: DS.font.body,
          fontSize: '15px',
          color: '#a8d8ff',
        });
      } else if (item.type === 'first_charge') {
        this.add.text(x + 130, y + cellH - 22, '首充双倍返利', {
          fontFamily: DS.font.body,
          fontSize: '15px',
          color: '#ff8080',
          fontStyle: 'bold',
        });
      }
    });

    if (this.tab === 'consume') {
      const consumed = player.save.activitiesProgress['act_consume'] || 0;
      const panel = drawSoftPanel(this, 12, startY + 80, cellW, 220, {
        fill: 0x2a1840, edge: 0xe64ba8, edgeAlpha: 0.7,
      });
      this.add.existing(panel);

      this.add.text(GAME_WIDTH / 2, startY + 130, `累计消费 ${consumed} 钻`, {
        fontFamily: DS.font.display,
        fontSize: '30px',
        color: '#ffd76a',
        fontStyle: 'bold',
        stroke: 'rgba(40,20,0,0.8)',
        strokeThickness: 3,
      }).setOrigin(0.5);

      drawPolishedButton(
        this,
        GAME_WIDTH / 2 - 110, startY + 170, 220, 60,
        '模拟消费 100',
        { variant: 'violet', fontSize: '22px', onClick: () => {
          shop.buy('gold_1');
          this.scene.restart();
        } },
      );
    }
  }

  private showToast(text: string) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, text, {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.8)',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(GAME_WIDTH / 2 - text.length * 12 - 20, GAME_HEIGHT - 102, text.length * 24 + 40, 44, 12);
    bg.lineStyle(1.5, 0xffd76a, 0.8);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - text.length * 12 - 20, GAME_HEIGHT - 102, text.length * 24 + 40, 44, 12);
    bg.setDepth(-1);
    this.tweens.add({
      targets: [t, bg], alpha: 0, duration: 800, delay: 1000,
      onComplete: () => { t.destroy(); bg.destroy(); },
    });
  }
}