import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useMergeStore } from '@/stores/mergeStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { burst, ringPulse, starBurst, floatingText } from '../effects/particles';

export class MergeScene extends Phaser.Scene {
  private fromIndex: number | null = null;
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('MergeScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '✦ 英雄合成', () => this.scene.start('MainScene'));
    this.drawAnimatedBackground();
    this.draw();
    button(this, 20, GAME_HEIGHT - 100, 200, 60, '召唤新卡', () => this.summonToGrid(), { fontSize: 22 });
    button(this, 240, GAME_HEIGHT - 100, 200, 60, '一键收集', () => this.collectAll(), { fontSize: 22 });
    button(this, 460, GAME_HEIGHT - 100, 200, 60, '清空', () => { useMergeStore().clearAll(); this.scene.restart(); }, { fontSize: 22 });
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#a78bfa',
      }).setOrigin(0.5).setAlpha(0.2);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        y: y - 40,
        alpha: 0.4,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private draw() {
    const merge = useMergeStore();
    const cellW = (GAME_WIDTH - 60) / 3;
    const cellH = 180;
    for (let i = 0; i < merge.maxSlots; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 12 + col * (cellW + 6);
      const y = 110 + row * (cellH + 10);
      panel(this, x, y, cellW, cellH, 0x1f2937);
      // 网格线
      const grid = this.add.graphics();
      grid.lineStyle(1, 0x4a4a8a, 0.4);
      grid.strokeRoundedRect(x + 4, y + 4, cellW - 8, cellH - 8, 10);
      const cell = merge.grid[i];
      if (cell) {
        const base = HERO_MAP[cell.heroId];
        const portrait = getHeroPortrait(base);
        const key = 'merge_' + cell.uid;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        const img = this.add.image(x + cellW / 2, y + 70, key).setDisplaySize(cellW - 12, 100);
        // 入场动画
        img.setScale(0.6);
        img.setAlpha(0);
        this.tweens.add({
          targets: img,
          scaleX: 1, scaleY: 1, alpha: 1,
          duration: 400, ease: 'Back.easeOut',
        });
        // 星级闪烁
        if (cell.star >= 4) {
          const glow = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0xfbbf24, 0.15);
          this.tweens.add({ targets: glow, alpha: 0, duration: 1200, yoyo: true, repeat: -1 });
        }
        // 星级标识
        const starsText = '★'.repeat(cell.star);
        this.add.text(x + cellW / 2, y + 150, starsText, { fontSize: '16px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(x + cellW / 2, y + 130, base.name, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
      } else {
        this.add.text(x + cellW / 2, y + cellH / 2, '+', { fontSize: '48px', color: '#4a4a8a' }).setOrigin(0.5);
      }
      const idx = i;
      const bg = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0xffffff, 0).setInteractive();
      bg.on('pointerdown', () => this.onCellTap(idx));
    }
  }

  private onCellTap(idx: number) {
    const merge = useMergeStore();
    const cell = merge.grid[idx];
    if (!cell) return;
    if (this.fromIndex === null) {
      this.fromIndex = idx;
      toast(this, `已选择 ${HERO_MAP[cell.heroId].name}，点击目标合并`);
      return;
    }
    if (this.fromIndex === idx) {
      this.fromIndex = null;
      return;
    }
    const result = merge.move(this.fromIndex, idx);
    const fromX = 12 + (this.fromIndex % 3) * ((GAME_WIDTH - 60) / 3 + 6) + ((GAME_WIDTH - 60) / 3) / 2;
    const fromY = 110 + Math.floor(this.fromIndex / 3) * 190 + 90;
    const toX = 12 + (idx % 3) * ((GAME_WIDTH - 60) / 3 + 6) + ((GAME_WIDTH - 60) / 3) / 2;
    const toY = 110 + Math.floor(idx / 3) * 190 + 90;
    this.fromIndex = null;
    if (!result.ok) {
      if (result.reason === 'mismatch') toast(this, '必须是同星同英雄');
      else if (result.reason === 'max_star') toast(this, '已达最高星级');
      else if (result.reason === 'empty') toast(this, '源位为空');
      return;
    }
    if (result.merged) {
      toast(this, '✦ 合并成功！');
      // 合并特效
      ringPulse(this, toX, toY, 0xfbbf24, 180, 700);
      starBurst(this, toX, toY, 0xfbbf24, 12);
      burst(this, { x: toX, y: toY, count: 30, color: 0xfbbf24, color2: 0xc084fc, speed: 250, size: 6, life: 800 });
      floatingText(this, toX, toY - 50, '+1 ★', '#fbbf24', 36);
    } else {
      toast(this, '已移动');
      burst(this, { x: toX, y: toY, count: 8, color: 0x6ad1ff, speed: 120, size: 4, life: 400 });
    }
    void fromX;
    void fromY;
    this.scene.restart();
  }

  private summonToGrid() {
    const merge = useMergeStore();
    const heroes = useHeroStore().heroes;
    if (heroes.length === 0) return toast(this, '请先召唤英雄');
    const inst = heroes[Math.floor(Math.random() * heroes.length)];
    const cell = merge.addCell(inst.heroId, inst.star, inst.level);
    if (!cell) {
      toast(this, '格子已满，请先合并或收集');
      return;
    }
    toast(this, `已召唤 ${HERO_MAP[inst.heroId].name}`);
    this.scene.restart();
  }

  private collectAll() {
    const merge = useMergeStore();
    const hero = useHeroStore();
    let added = 0;
    merge.grid.forEach((cell) => {
      if (!cell) return;
      hero.add(cell.heroId, cell.level, cell.star);
      added++;
    });
    merge.clearAll();
    toast(this, `已收集 ${added} 个英雄`);
    this.scene.restart();
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}