import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  drawSceneBackdrop,
  drawTopNav,
  drawSoftPanel,
  drawPolishedButton,
  setGameRefSize,
  CARTOON,
  DS,
} from '../ui/designSystem';
import { useMergeStore } from '@/stores/mergeStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { burst, ringPulse, starBurst, floatingText } from '../effects/particles';

const RARITY_COLORS: Record<string, { col: number; glow: string }> = {
  N:   { col: 0x5a6470, glow: '#d1d5db' },
  R:   { col: 0x3aa0d4, glow: '#7cd0ff' },
  SR:  { col: 0xa060e0, glow: '#d59cff' },
  SSR: { col: 0xf0c040, glow: '#ffe48a' },
  UR:  { col: 0xff6a8a, glow: '#ffb0c0' },
  LR:  { col: 0xef4444, glow: '#fca5a5' },
  MRC: { col: 0xec4899, glow: '#f9a8d4' },
};

export class MergeScene extends Phaser.Scene {
  private fromIndex: number | null = null;
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('MergeScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'cosmic', { dimTop: 100, dimBottom: 80 });
    this.drawAnimatedBackground();

    drawTopNav(this, '英雄合成', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '同星同英雄拖拽合成升级',
    });

    this.draw();

    drawPolishedButton(
      this, 20, GAME_HEIGHT - 110, 220, 70, '召唤新卡',
      { variant: 'blue', fontSize: '22px', onClick: () => this.summonToGrid() },
    );
    drawPolishedButton(
      this, 250, GAME_HEIGHT - 110, 220, 70, '一键收集',
      { variant: 'gold', fontSize: '22px', onClick: () => this.collectAll() },
    );
    drawPolishedButton(
      this, 480, GAME_HEIGHT - 110, 200, 70, '清空',
      { variant: 'red', fontSize: '22px', onClick: () => { useMergeStore().clearAll(); this.scene.restart(); } },
    );
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 28; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 140);
      const col = ['#a78bfa', '#fbbf24', '#5cd1ff', '#ff7ec5'][i % 4];
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(10, 18)}px`,
        color: col,
      }).setOrigin(0.5).setAlpha(0.25);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        y: y - 60,
        alpha: 0.55,
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
      const cell = merge.grid[i];

      // 面板
      const panel = drawSoftPanel(this, x, y, cellW, cellH, {
        fill: 0x1a1030, fillAlpha: 0.85, edge: 0x6d4ba8, edgeAlpha: 0.6, cornerGold: false,
      });
      this.add.existing(panel);

      if (cell) {
        const base = HERO_MAP[cell.heroId];
        const rarity = base.rarity;
        const rc = RARITY_COLORS[rarity] ?? RARITY_COLORS.N;

        // 稀有度边框
        const frameG = this.add.graphics();
        frameG.lineStyle(2, rc.col, 0.95);
        frameG.strokeRoundedRect(x + 3, y + 3, cellW - 6, cellH - 6, 12);
        frameG.fillStyle(rc.col, 0.18);
        frameG.fillRect(x + 3, y + 3, cellW - 6, 16);

        // 顶部稀有条
        const rarBar = this.add.graphics();
        rarBar.fillStyle(rc.col, 1);
        rarBar.fillRoundedRect(x + 4, y + 4, cellW - 8, 16, 8);
        rarBar.fillStyle(0xffffff, 0.4);
        rarBar.fillRoundedRect(x + 6, y + 5, cellW - 12, 6, 4);
        this.add.text(x + cellW / 2, y + 12, rarity, {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.7)',
          strokeThickness: 2,
        }).setOrigin(0.5);

        // 肖像
        const portrait = getHeroPortrait(base);
        const key = 'merge_' + cell.uid;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        const img = this.add.image(x + cellW / 2, y + 80, key).setDisplaySize(cellW - 16, 96);
        img.setScale(0.6);
        img.setAlpha(0);
        this.tweens.add({
          targets: img,
          scaleX: 1, scaleY: 1, alpha: 1,
          duration: 400, ease: 'Back.easeOut',
        });

        // 选中高亮
        if (this.fromIndex === i) {
          const selG = this.add.graphics();
          selG.lineStyle(3, 0xfff0a0, 1);
          selG.strokeRoundedRect(x + 2, y + 2, cellW - 4, cellH - 4, 12);
          selG.fillStyle(0xfff0a0, 0.12);
          selG.fillRoundedRect(x + 2, y + 2, cellW - 4, cellH - 4, 12);
          this.tweens.add({ targets: selG, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
        }

        // 星级
        const starsText = '★'.repeat(Math.min(8, cell.star));
        this.add.text(x + cellW / 2, y + 158, starsText, {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: '#ffd76a',
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.7)',
          strokeThickness: 2,
        }).setOrigin(0.5);

        // 高星辉光
        if (cell.star >= 4) {
          const glow = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0xfbbf24, 0.18);
          this.tweens.add({ targets: glow, alpha: 0, duration: 1200, yoyo: true, repeat: -1 });
        }
      } else {
        // 空格子
        const plus = this.add.text(x + cellW / 2, y + cellH / 2, '+', {
          fontFamily: DS.font.display,
          fontSize: '60px',
          color: '#6d4ba8',
          fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0.6);
      }

      const idx = i;
      const bg = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0xffffff, 0).setInteractive();
      bg.on('pointerdown', () => this.onCellTap(idx));
    }
  }

  private onCellTap(idx: number) {
    const merge = useMergeStore();
    const cell = merge.grid[idx];
    if (!cell) {
      this.fromIndex = null;
      this.scene.restart();
      return;
    }
    if (this.fromIndex === null) {
      this.fromIndex = idx;
      this.showToast(`已选择 ${HERO_MAP[cell.heroId].name}，点击目标合并`);
      this.scene.restart();
      return;
    }
    if (this.fromIndex === idx) {
      this.fromIndex = null;
      this.scene.restart();
      return;
    }
    const result = merge.move(this.fromIndex, idx);
    const cellW = (GAME_WIDTH - 60) / 3;
    const toX = 12 + (idx % 3) * (cellW + 6) + cellW / 2;
    const toY = 110 + Math.floor(idx / 3) * 190 + 90;
    this.fromIndex = null;
    if (!result.ok) {
      if (result.reason === 'mismatch') this.showToast('必须是同星同英雄');
      else if (result.reason === 'max_star') this.showToast('已达最高星级');
      else if (result.reason === 'empty') this.showToast('源位为空');
      this.scene.restart();
      return;
    }
    audio.playSfx?.(result.merged ? 'merge' : 'click');
    if (result.merged) {
      this.showToast('✦ 合并成功！');
      ringPulse(this, toX, toY, 0xfbbf24, 180, 700);
      starBurst(this, toX, toY, 0xfbbf24, 12);
      burst(this, { x: toX, y: toY, count: 30, color: 0xfbbf24, color2: 0xc084fc, speed: 250, size: 6, life: 800 });
      floatingText(this, toX, toY - 50, '+1 ★', '#fbbf24', 36);
    } else {
      this.showToast('已移动');
      burst(this, { x: toX, y: toY, count: 8, color: 0x6ad1ff, speed: 120, size: 4, life: 400 });
    }
    this.scene.restart();
  }

  private summonToGrid() {
    const merge = useMergeStore();
    const heroes = useHeroStore().heroes;
    if (heroes.length === 0) {
      this.showToast('请先召唤英雄');
      return;
    }
    const inst = heroes[Math.floor(Math.random() * heroes.length)];
    const cell = merge.addCell(inst.heroId, inst.star, inst.level);
    if (!cell) {
      this.showToast('格子已满，请先合并或收集');
      return;
    }
    this.showToast(`已召唤 ${HERO_MAP[inst.heroId].name}`);
    audio.playSfx?.('gacha');
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
    this.showToast(`已收集 ${added} 个英雄`);
    audio.playSfx?.('levelup');
    this.scene.restart();
  }

  private showToast(text: string) {
    const bg = this.add.graphics();
    const w = text.length * 24 + 40;
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 48, 12);
    bg.lineStyle(2, 0xffd76a, 0.85);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 48, 12);
    bg.fillStyle(0xffd76a, 0.5);
    bg.fillRoundedRect(GAME_WIDTH / 2 - w / 2 + 4, 64, w - 8, 6, 6);
    bg.setDepth(80);
    const t = this.add.text(GAME_WIDTH / 2, 86, text, {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.8)',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(80);
    this.tweens.add({
      targets: [t, bg], alpha: 0, duration: 800, delay: 1200,
      onComplete: () => { t.destroy(); bg.destroy(); },
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}
