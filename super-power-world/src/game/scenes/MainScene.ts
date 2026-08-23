import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { button, tabBar } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

export class MainScene extends Phaser.Scene {
  private headerTimer?: Phaser.Time.TimerEvent;
  private bgStars: Phaser.GameObjects.Text[] = [];
  private bgOrbs: Phaser.GameObjects.Arc[] = [];
  private currencyTexts: { [k: string]: Phaser.GameObjects.Text } = {};

  constructor() { super('MainScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
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
      this.bgStars.forEach((s) => s.destroy());
      this.bgOrbs.forEach((o) => o.destroy());
    });
  }

  private drawAnimatedBackground() {
    // 渐变背景
    const g = this.add.graphics();
    g.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x2a1a4e, 0x2a1a4e, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // 大光球（背景氛围）
    for (let i = 0; i < 3; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(100, GAME_WIDTH - 100),
        Phaser.Math.Between(150, GAME_HEIGHT - 200),
        Phaser.Math.Between(80, 150),
        [0x6ad1ff, 0xc084fc, 0xfbbf24][i],
        0.08,
      );
      this.bgOrbs.push(orb);
      this.tweens.add({
        targets: orb,
        alpha: 0.15,
        scaleX: 1.2, scaleY: 1.2,
        duration: Phaser.Math.Between(4000, 7000),
        yoyo: true,
        repeat: -1,
      });
    }
    // 闪烁小星
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 16)}px`,
        color: '#ffffff',
      }).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.1, 0.4));
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.05, 0.4),
        y: y - 30,
        duration: Phaser.Math.Between(3000, 7000),
        yoyo: true,
        repeat: -1,
      });
    }
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
    this.tweens.add({ targets: avatar, scaleX: 1.05, scaleY: 1.05, duration: 1200, yoyo: true, repeat: -1 });
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
      this.currencyTexts[r.name] = this.add.text(cx, cy, `${r.name}：${r.value}`, { fontSize: '22px', color: r.color });
    });
  }

  private drawHud() {
    const hero = useHeroStore();
    const slot = hero.heroes[0];
    if (!slot) return;
    const portrait = getHeroPortrait(HERO_MAP[slot.heroId]);
    const key = 'h_portrait_' + slot.uid;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
    const sprite = this.add.image(GAME_WIDTH - 100, 100, key);
    sprite.setDisplaySize(140, 140);
    // 旋转入场
    sprite.setAlpha(0);
    sprite.setScale(0.3);
    sprite.setRotation(Math.PI);
    this.tweens.add({
      targets: sprite,
      alpha: 1, scaleX: 1, scaleY: 1, rotation: 0,
      duration: 600, ease: 'Back.easeOut',
    });
    // 持续旋转
    this.tweens.add({
      targets: sprite,
      rotation: 0.05, duration: 2000, yoyo: true, repeat: -1,
    });
    // 装饰圆环
    const ring = this.add.circle(GAME_WIDTH - 100, 100, 75, 0xfbbf24, 0).setStrokeStyle(2, 0xfbbf24, 0.6);
    this.tweens.add({ targets: ring, scaleX: 1.1, scaleY: 1.1, alpha: 0.3, duration: 1500, yoyo: true, repeat: -1 });
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
      const btn = button(this, x, y, cellW, cellH, it.name, it.onClick, {
        color: it.color, fontSize: 32, radius: 16, textColor: '#fff',
      });
      // 入场动画
      btn.setAlpha(0);
      btn.setScale(0.5);
      this.tweens.add({
        targets: btn,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 500, delay: 200 + i * 80, ease: 'Back.easeOut',
      });
      this.add.text(x + cellW / 2, y + 110, it.desc, {
        fontSize: '18px', color: '#ffffffcc',
      }).setOrigin(0.5);
      // 持续发光
      this.tweens.add({
        targets: btn,
        scaleX: 1.02, scaleY: 1.02, duration: 1200 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: 1000 + i * 80,
      });
    });
  }

  private openMore() {
    // 不做处理，更多入口在 Tab 中
  }

  update() {
    const player = usePlayerStore();
    if (this.currencyTexts['金币']) this.currencyTexts['金币'].setText(`金币：${player.save.gold}`);
    if (this.currencyTexts['钻石']) this.currencyTexts['钻石'].setText(`钻石：${player.save.gem}`);
    if (this.currencyTexts['体力']) this.currencyTexts['体力'].setText(`体力：${player.save.stamina}`);
    if (this.currencyTexts['英魂']) this.currencyTexts['英魂'].setText(`英魂：${player.save.soul}`);
  }
}