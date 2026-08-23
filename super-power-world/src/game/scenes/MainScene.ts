import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { button, tabBar, toast } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { useBattleStore } from '@/stores/battleStore';
import { computeStats } from '@/core/formulas';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

export class MainScene extends Phaser.Scene {
  private ui!: Phaser.GameObjects.Container;
  private headerTimer?: Phaser.Time.TimerEvent;

  constructor() { super('MainScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    // 背景渐变
    const g = this.add.graphics();
    g.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x2a1a4e, 0x2a1a4e, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // 装饰星点
    for (let i = 0; i < 40; i++) {
      this.add.circle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT), Phaser.Math.Between(1, 2), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.7));
    }

    this.ui = this.add.container(0, 0);
    this.drawHeader();
    this.drawHud();
    this.drawMain();
    tabBar(this, [
      { name: '主页', onClick: () => this.scene.restart(), active: true },
      { name: '英雄', onClick: () => this.scene.start('HeroScene') },
      { name: '合成', onClick: () => this.scene.start('MergeScene') },
      { name: '战斗', onClick: () => this.scene.start('StageScene') },
      { name: '更多', onClick: () => this.openMore() },
    ]);
    this.events.on('shutdown', () => {
      this.headerTimer?.remove();
      this.ui.destroy();
    });
  }

  private drawHeader() {
    const player = usePlayerStore();
    const w = GAME_WIDTH - 24;
    const h = 200;
    const x = 12, y = 12;
    const g = this.add.graphics();
    g.fillStyle(0x23234a, 1);
    g.fillRoundedRect(x, y, w, h, 18);
    g.lineStyle(2, 0x4a4a8a, 1);
    g.strokeRoundedRect(x, y, w, h, 18);
    // 玩家头像装饰
    const avatar = this.add.circle(x + 60, y + 50, 38, 0xc084fc);
    this.add.text(x + 60, y + 50, player.save.nickname.slice(0, 2), { fontSize: '24px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x + 120, y + 30, `${player.save.nickname}`, { fontSize: '28px', color: '#fff', fontStyle: 'bold' });
    this.add.text(x + 120, y + 62, `Lv.${player.save.level}  ·  VIP ${player.save.vipLevel}`, { fontSize: '18px', color: '#fbbf24' });

    // 资源行
    const res = [
      { name: '金币', value: player.save.gold, color: '#fbbf24' },
      { name: '钻石', value: player.save.gem, color: '#6ad1ff' },
      { name: '体力', value: player.save.stamina, color: '#10b981' },
      { name: '英魂', value: player.save.soul, color: '#a78bfa' },
    ];
    res.forEach((r, i) => {
      const cx = x + 20 + (i % 2) * (w / 2);
      const cy = y + 110 + Math.floor(i / 2) * 36;
      this.add.text(cx, cy, `${r.name}：${r.value}`, { fontSize: '22px', color: r.color });
    });
  }

  private drawHud() {
    const player = usePlayerStore();
    const hero = useHeroStore();
    const slot = hero.heroes[0];
    if (!slot) return;
    const portrait = getHeroPortrait(HERO_MAP[slot.heroId]);
    const key = 'h_portrait_' + slot.uid;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
    const sprite = this.add.image(GAME_WIDTH - 100, 100, key);
    sprite.setDisplaySize(140, 140);
    void player;
  }

  private drawMain() {
    const mainY = 240;
    const items = [
      { name: '召唤', desc: '前往抽卡', color: 0xa78bfa, onClick: () => this.scene.start('GachaScene') },
      { name: '关卡', desc: '推图闯关', color: 0x10b981, onClick: () => this.scene.start('StageScene') },
      { name: '英雄', desc: '管理队伍', color: 0xfbbf24, onClick: () => this.scene.start('HeroScene') },
      { name: '合成', desc: '合并升级', color: 0x6ad1ff, onClick: () => this.scene.start('MergeScene') },
      { name: '商城', desc: '购买资源', color: 0xf97316, onClick: () => this.scene.start('ShopScene') },
      { name: '活动', desc: '每日奖励', color: 0xef4444, onClick: () => this.scene.start('ActivityScene') },
    ];
    const cols = 3;
    const cellW = (GAME_WIDTH - 36) / cols;
    const cellH = 200;
    items.forEach((it, i) => {
      const x = 12 + (i % cols) * (cellW + 6);
      const y = mainY + Math.floor(i / cols) * (cellH + 12);
      button(this, x, y, cellW, cellH, it.name, it.onClick, {
        color: it.color, fontSize: 32, radius: 16, textColor: '#fff',
      });
      this.add.text(x + cellW / 2, y + 110, it.desc, {
        fontSize: '18px', color: '#ffffffcc',
      }).setOrigin(0.5);
    });
  }

  private openMore() {
    toast(this, '请使用下方 Tab 切换');
  }

  update() {
    // 头部刷新
    const player = usePlayerStore();
    this.children.list
      .filter((c: any) => c.type === 'Text' && c.text.startsWith('金币：'))
      .forEach((t: any) => t.setText(`金币：${player.save.gold}`));
    this.children.list
      .filter((c: any) => c.type === 'Text' && c.text.startsWith('钻石：'))
      .forEach((t: any) => t.setText(`钻石：${player.save.gem}`));
    this.children.list
      .filter((c: any) => c.type === 'Text' && c.text.startsWith('体力：'))
      .forEach((t: any) => t.setText(`体力：${player.save.stamina}`));
    this.children.list
      .filter((c: any) => c.type === 'Text' && c.text.startsWith('英魂：'))
      .forEach((t: any) => t.setText(`英魂：${player.save.soul}`));
    void computeStats;
  }
}