import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useGachaStore } from '@/stores/gachaStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import type { GachaPoolType } from '@/types';

export class GachaScene extends Phaser.Scene {
  private currentPool: GachaPoolType = 'standard';
  private animating = false;

  constructor() { super('GachaScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '召唤大厅', () => this.scene.start('MainScene'));
    this.drawPools();
    this.drawPulls();
    this.drawHistory();
  }

  private drawPools() {
    const pools = useGachaStore().pools;
    const w = (GAME_WIDTH - 36) / 3;
    pools.forEach((p, i) => {
      const x = 12 + i * (w + 6);
      const y = 100;
      const isActive = this.currentPool === p.type;
      panel(this, x, y, w, 150, isActive ? 0xfbbf24 : 0x23234a);
      this.add.text(x + w / 2, y + 30, p.name, { fontSize: '22px', color: isActive ? '#1a1a2e' : '#fbbf24', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 70, p.description.slice(0, 28) + '...', { fontSize: '14px', color: isActive ? '#1a1a2e' : '#ffffffcc', align: 'center', wordWrap: { width: w - 16 } }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 130, `${p.costAmount} 钻石/次`, { fontSize: '16px', color: isActive ? '#1a1a2e' : '#6ad1ff' }).setOrigin(0.5);
      const bg = this.add.rectangle(x + w / 2, y + 75, w, 150, 0x00000000).setInteractive();
      bg.on('pointerdown', () => {
        this.currentPool = p.type;
        this.scene.restart();
      });
    });
  }

  private drawPulls() {
    const y = 280;
    const pool = useGachaStore().pools.find((p) => p.type === this.currentPool)!;
    const player = usePlayerStore();
    const ticket = player.save.tickets[this.currentPool] || 0;
    panel(this, 12, y, GAME_WIDTH - 24, 200, 0x1a1a2e);
    this.add.text(24, y + 16, `${pool.name}`, { fontSize: '24px', color: '#fbbf24' });
    this.add.text(24, y + 50, `保底进度：${player.save.pity[this.currentPool].count} / 80`, { fontSize: '18px', color: '#a78bfa' });
    this.add.text(24, y + 80, `召唤券：${ticket} 张`, { fontSize: '18px', color: '#fff' });
    this.add.text(24, y + 110, `钻石：${player.save.gem}`, { fontSize: '18px', color: '#6ad1ff' });

    button(this, 24, y + 150, 160, 40, '召唤1次', () => this.pull(1), { fontSize: 18 });
    button(this, 200, y + 150, 160, 40, '召唤10次', () => this.pull(10), { fontSize: 18 });
    button(this, 376, y + 150, 160, 40, '召唤50次', () => this.pull(50), { fontSize: 18 });
    button(this, 552, y + 150, 144, 40, '用券1次', () => this.pullWithTicket(1), { fontSize: 18 });
  }

  private drawHistory() {
    const player = usePlayerStore();
    const y = 500;
    panel(this, 12, y, GAME_WIDTH - 24, 700, 0x12122a);
    this.add.text(24, y + 12, '召唤记录', { fontSize: '22px', color: '#fbbf24' });
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
    this.playAnimation(results);
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
    this.playAnimation(results);
  }

  private playAnimation(results: { heroId: string; rarity: string; isNew: boolean; isFeatured: boolean }[]) {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000cc).setDepth(200);
    const base = HERO_MAP[results[0].heroId];
    const portrait = getHeroPortrait(base);
    const key = 'gacha_anim_' + base.id;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
    const card = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, key).setDisplaySize(280, 280).setDepth(201).setScale(0);
    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, base.name, { fontSize: '36px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(0.5).setDepth(201).setAlpha(0);
    const info = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, `${base.rarity}  ${base.id}`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(201).setAlpha(0);
    this.tweens.add({
      targets: card,
      scaleX: 1, scaleY: 1,
      duration: 400, ease: 'Back.out',
    });
    this.tweens.add({
      targets: [name, info],
      alpha: 1,
      duration: 400,
      delay: 300,
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: [card, name, info, overlay],
            alpha: 0,
            duration: 300,
            onComplete: () => {
              [card, name, info, overlay].forEach((o) => o.destroy());
              this.animating = false;
              this.scene.restart();
            },
          });
        });
      },
    });
  }
}