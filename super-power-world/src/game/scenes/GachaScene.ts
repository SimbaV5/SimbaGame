import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useGachaStore } from '@/stores/gachaStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import type { GachaPoolType } from '@/types';
import { burst, ringPulse, starBurst, floatingSparkles, floatingText } from '../effects/particles';

export class GachaScene extends Phaser.Scene {
  private currentPool: GachaPoolType = 'standard';
  private animating = false;
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('GachaScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '召唤大厅', () => this.scene.start('MainScene'));
    this.drawAnimatedBackground();
    this.drawPools();
    this.drawPulls();
    this.drawHistory();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#fde68a',
      }).setOrigin(0.5).setAlpha(0.2);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        y: y - 40,
        alpha: Phaser.Math.FloatBetween(0.05, 0.3),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawPools() {
    const pools = useGachaStore().pools;
    const w = (GAME_WIDTH - 36) / 3;
    pools.forEach((p, i) => {
      const x = 12 + i * (w + 6);
      const y = 100;
      const isActive = this.currentPool === p.type;
      panel(this, x, y, w, 150, isActive ? 0xfbbf24 : 0x23234a);
      // 顶部装饰条
      const deco = this.add.graphics();
      deco.fillStyle(isActive ? 0xfde68a : 0x4a4a8a, 1);
      deco.fillRoundedRect(x + 4, y - 4, w - 8, 8, 4);
      this.add.text(x + w / 2, y + 30, p.name, {
        fontSize: '22px', color: isActive ? '#1a1a2e' : '#fbbf24', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 70, p.description.slice(0, 28) + '...', {
        fontSize: '14px', color: isActive ? '#1a1a2e' : '#ffffffcc', align: 'center', wordWrap: { width: w - 16 },
      }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 130, `${p.costAmount} 钻石/次`, {
        fontSize: '16px', color: isActive ? '#1a1a2e' : '#6ad1ff',
      }).setOrigin(0.5);
      const bg = this.add.rectangle(x + w / 2, y + 75, w, 150, 0x00000000).setInteractive();
      bg.on('pointerdown', () => {
        this.currentPool = p.type;
        this.scene.restart();
      });
      // 选中发光
      if (isActive) {
        this.tweens.add({
          targets: deco,
          alpha: 0.5, duration: 800, yoyo: true, repeat: -1,
        });
      }
      void deco;
    });
  }

  private drawPulls() {
    const y = 280;
    const pool = useGachaStore().pools.find((p) => p.type === this.currentPool)!;
    const player = usePlayerStore();
    const ticket = player.save.tickets[this.currentPool] || 0;
    panel(this, 12, y, GAME_WIDTH - 24, 200, 0x1a1a2e);
    this.add.text(24, y + 16, `✦ ${pool.name}`, { fontSize: '24px', color: '#fbbf24', fontStyle: 'bold' });
    this.add.text(24, y + 50, `保底进度：${player.save.pity[this.currentPool].count} / 80`, { fontSize: '18px', color: '#a78bfa' });
    this.add.text(24, y + 80, `召唤券：${ticket} 张`, { fontSize: '18px', color: '#fff' });
    this.add.text(24, y + 110, `💎 钻石：${player.save.gem}`, { fontSize: '18px', color: '#6ad1ff' });

    // 大按钮（更醒目）
    this.drawPullButton(24, y + 150, 200, 40, '召唤1次', 0x6ad1ff, () => this.pull(1));
    this.drawPullButton(232, y + 150, 200, 40, '召唤10次', 0xc084fc, () => this.pull(10));
    this.drawPullButton(440, y + 150, 200, 40, '召唤50次', 0xfbbf24, () => this.pull(50));
    this.drawPullButton(24, y + 195, 280, 0, '召唤券 1 次', 0x10b981, () => this.pullWithTicket(1));
  }

  private drawPullButton(x: number, y: number, w: number, h: number, text: string, color: number, onClick: () => void) {
    if (h === 0) h = 40;
    const c = button(this, x, y + 195, w, h, text, onClick, { fontSize: 18, color });
    this.tweens.add({
      targets: c,
      scaleX: 1.04, scaleY: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    return c;
  }

  private drawHistory() {
    const player = usePlayerStore();
    const y = 500;
    panel(this, 12, y, GAME_WIDTH - 24, 700, 0x12122a);
    this.add.text(24, y + 12, '📜 召唤记录', { fontSize: '22px', color: '#fbbf24' });
    const recent = player.save.gachaHistory.slice(0, 30);
    const cols = 5;
    const cellW = (GAME_WIDTH - 48 - 30) / cols;
    recent.forEach((h, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 24 + col * (cellW + 6);
      const yy = y + 50 + row * (cellW + 6);
      const base = HERO_MAP[h.heroId];
      if (!base) return;
      panel(this, x, yy, cellW, cellW, 0x23234a);
      const portrait = getHeroPortrait(base);
      const key = 'gh_' + h.heroId + '_' + i;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
      this.add.image(x + cellW / 2, yy + cellW / 2 - 8, key).setDisplaySize(cellW - 12, cellW - 28);
      this.add.text(x + cellW / 2, yy + cellW - 10, base.name, { fontSize: '12px', color: h.isFeatured ? '#fbbf24' : '#fff' }).setOrigin(0.5);
      // 高稀有度闪烁
      if (h.isFeatured || base.rarity === 'SSR' || base.rarity === 'UR' || base.rarity === 'LR' || base.rarity === 'MRC') {
        const glow = this.add.rectangle(x + cellW / 2, yy + cellW / 2, cellW, cellW, 0xfbbf24, 0.15);
        this.tweens.add({ targets: glow, alpha: 0, duration: 1000, yoyo: true, repeat: -1 });
      }
    });
  }

  private pull(count: number) {
    const player = usePlayerStore();
    if (this.animating) return;
    if (player.gem < count * 270 && count > 1) return toast(this, '钻石不足');
    if (player.gem < 270 && count === 1) return toast(this, '钻石不足');
    this.animating = true;
    const results = useGachaStore().pull(this.currentPool, count);
    if (results.length === 0) {
      this.animating = false;
      return;
    }
    if (count === 1) {
      this.playSingleAnimation(results[0]);
    } else {
      this.playMultiAnimation(results);
    }
  }

  private pullWithTicket(count: number) {
    const player = usePlayerStore();
    if (player.save.tickets[this.currentPool] < count) return toast(this, '召唤券不足');
    if (this.animating) return;
    this.animating = true;
    const results = useGachaStore().pull(this.currentPool, count, true);
    if (results.length === 0) {
      this.animating = false;
      return;
    }
    if (count === 1) {
      this.playSingleAnimation(results[0]);
    } else {
      this.playMultiAnimation(results);
    }
  }

  private playSingleAnimation(result: { heroId: string; rarity: string; isNew: boolean; isFeatured: boolean }) {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000cc).setDepth(200);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });

    const base = HERO_MAP[result.heroId];
    const portrait = getHeroPortrait(base);
    const key = 'gacha_anim_' + base.id;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);

    // 光柱
    const lightBeam = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 40, 600, 0xfbbf24, 0.6).setDepth(201).setAlpha(0);
    this.tweens.add({
      targets: lightBeam,
      alpha: 0.6, scaleX: 6, duration: 500, yoyo: true,
    });

    const card = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, key).setDisplaySize(280, 280).setDepth(202).setScale(0).setAlpha(0);
    const cardGlow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 320, 320, 0xfbbf24, 0.3).setDepth(201).setScale(0);
    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, base.name, { fontSize: '40px', color: '#fbbf24', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setDepth(202).setAlpha(0);
    const info = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, `${base.rarity}  ${base.id}`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(202).setAlpha(0);

    // 入场
    this.tweens.add({
      targets: [card, cardGlow],
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 600, ease: 'Back.easeOut',
      delay: 300,
    });

    // 高稀有度额外爆发
    if (['SSR', 'UR', 'LR', 'MRC'].includes(base.rarity)) {
      this.time.delayedCall(900, () => {
        ringPulse(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 0xfbbf24, 400, 1200);
        starBurst(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 0xfbbf24, 16);
        burst(this, { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 - 80, count: 40, color: 0xfbbf24, color2: 0xfde68a, speed: 280, size: 8, life: 1000 });
        floatingSparkles(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 20);
        floatingText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, base.rarity, '#fbbf24', 48);
      });
    }

    this.tweens.add({
      targets: [name, info],
      alpha: 1, duration: 400, delay: 700,
    });

    this.time.delayedCall(2500, () => {
      this.tweens.add({
        targets: [card, cardGlow, name, info, overlay, lightBeam],
        alpha: 0, duration: 300,
        onComplete: () => {
          [card, cardGlow, name, info, overlay, lightBeam].forEach((o) => o.destroy());
          this.animating = false;
          this.scene.restart();
        },
      });
    });
  }

  private playMultiAnimation(results: { heroId: string; rarity: string; isNew: boolean; isFeatured: boolean }[]) {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000cc).setDepth(200);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });

    const cellW = (GAME_WIDTH - 80 - 30) / 5;
    const cellH = 200;
    const startX = 40;
    const startY = 280;

    // 全部从天而降
    results.forEach((r, i) => {
      const base = HERO_MAP[r.heroId];
      const portrait = getHeroPortrait(base);
      const key = 'gacha_multi_' + base.id + '_' + i;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = startX + col * (cellW + 6);
      const y = startY + row * (cellH + 10);

      const card = this.add.image(x + cellW / 2, -100, key).setDisplaySize(cellW - 8, cellH - 30).setDepth(201);
      this.tweens.add({
        targets: card,
        y: y + cellH / 2,
        duration: 600,
        delay: i * 100,
        ease: 'Bounce.easeOut',
      });

      const name = this.add.text(x + cellW / 2, y + cellH - 8, base.name, {
        fontSize: '14px', color: r.isFeatured ? '#fbbf24' : '#fff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(202).setAlpha(0);
      this.tweens.add({ targets: name, alpha: 1, duration: 300, delay: i * 100 + 400 });

      // 高稀有度闪光
      if (['SSR', 'UR', 'LR', 'MRC'].includes(r.rarity)) {
        const glow = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0xfbbf24, 0).setDepth(200);
        this.tweens.add({
          targets: glow, alpha: 0.5, duration: 300, delay: i * 100 + 600, yoyo: true, repeat: 2,
        });
      }
    });

    // 顶部 10 连标题
    const title = this.add.text(GAME_WIDTH / 2, 180, `✦ ${results.length} 召唤 ✦`, {
      fontSize: '40px', color: '#fbbf24', fontStyle: 'bold', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(203).setAlpha(0).setScale(0);
    this.tweens.add({ targets: title, alpha: 1, scaleX: 1, scaleY: 1, duration: 600, ease: 'Back.easeOut' });

    const btn = button(this, GAME_WIDTH / 2 - 100, 920, 200, 60, '继续', () => {
      [overlay, title, btn].forEach((o) => o && o.destroy());
      this.scene.restart();
    }, { fontSize: 26, color: 0xfbbf24 });
    btn.setDepth(203).setAlpha(0);
    this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: results.length * 100 + 800 });

    // 整批完成时额外撒花
    this.time.delayedCall(results.length * 100 + 1000, () => {
      starBurst(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 0xfbbf24, 20);
      this.animating = false;
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}