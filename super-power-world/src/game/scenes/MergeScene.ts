import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useMergeStore } from '@/stores/mergeStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

export class MergeScene extends Phaser.Scene {
  private fromIndex: number | null = null;

  constructor() { super('MergeScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '英雄合成', () => this.scene.start('MainScene'));
    this.draw();
    button(this, 20, GAME_HEIGHT - 100, 200, 60, '召唤新卡', () => this.summonToGrid(), { fontSize: 22 });
    button(this, 240, GAME_HEIGHT - 100, 200, 60, '一键收集', () => this.collectAll(), { fontSize: 22 });
    button(this, 460, GAME_HEIGHT - 100, 200, 60, '清空', () => { useMergeStore().clearAll(); this.scene.restart(); }, { fontSize: 22 });
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
      const cell = merge.grid[i];
      if (cell) {
        const base = HERO_MAP[cell.heroId];
        const portrait = getHeroPortrait(base);
        const key = 'merge_' + cell.uid;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        this.add.image(x + cellW / 2, y + 70, key).setDisplaySize(cellW - 12, 100);
        this.add.text(x + cellW / 2, y + 130, base.name, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
        this.add.text(x + cellW / 2, y + 150, `${cell.star}★ Lv${cell.level}`, { fontSize: '14px', color: '#fbbf24' }).setOrigin(0.5);
      }
      // 槽位背景交互
      const idx = i;
      const bg = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0x00000000).setInteractive();
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
    this.fromIndex = null;
    if (!result.ok) {
      if (result.reason === 'mismatch') toast(this, '必须是同星同英雄');
      else if (result.reason === 'max_star') toast(this, '已达最高星级');
      else if (result.reason === 'empty') toast(this, '源位为空');
    } else {
      toast(this, result.merged ? '合并成功！' : '已移动');
    }
    this.scene.restart();
  }

  private summonToGrid() {
    const merge = useMergeStore();
    const heroes = useHeroStore().heroes;
    if (heroes.length === 0) return toast(this, '请先召唤英雄');
    // 把第一个英雄复制到 merge grid
    const inst = heroes[Math.floor(Math.random() * heroes.length)];
    if (!merge.addCell(inst.heroId, inst.star, inst.level)) {
      toast(this, '格子已满，请先合并或收集');
      return;
    }
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
}