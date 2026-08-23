import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { STAGES, MAX_STAGE } from '@/data/stages';
import { usePlayerStore } from '@/stores/playerStore';
import { useBattleStore } from '@/stores/battleStore';
import { useHeroStore } from '@/stores/heroStore';
import { computeStats } from '@/core/formulas';

export class StageScene extends Phaser.Scene {
  private currentChapter = 1;
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('StageScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '⚔ 关卡选择', () => this.scene.start('MainScene'));

    this.drawChapterTabs();
    this.drawStages();

    const player = usePlayerStore();
    const battle = useBattleStore();
    button(this, GAME_WIDTH - 220, GAME_HEIGHT - 130, 200, 80, '前往战斗', () => {
      const stage = STAGES.find((s) => s.id === Math.min(player.save.currentStage, MAX_STAGE)) || STAGES[0];
      battle.init(stage, player.save.formation.slots);
      this.scene.start('BattleScene');
    }, { color: 0x10b981, fontSize: 24 });

    button(this, 20, GAME_HEIGHT - 130, 200, 80, '挂机收益', () => this.claimIdle(), { color: 0x6ad1ff, fontSize: 24 });
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#10b981',
      }).setOrigin(0.5).setAlpha(0.15);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        y: y - 30,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawChapterTabs() {
    const y = 90;
    const chapters = [1, 2, 3, 4, 5, 6];
    const w = (GAME_WIDTH - 24) / chapters.length;
    chapters.forEach((c, i) => {
      const x = 12 + i * w;
      const isActive = this.currentChapter === c;
      const bg = this.add.graphics();
      bg.fillStyle(isActive ? 0xfbbf24 : 0x23234a, 1);
      bg.fillRoundedRect(x + 4, y, w - 8, 50, 10);
      this.add.text(x + w / 2, y + 25, `第${c}章`, {
        fontSize: '18px',
        color: isActive ? '#1a1a2e' : '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.setInteractive(new Phaser.Geom.Rectangle(x + 4, y, w - 8, 50), Phaser.Geom.Rectangle.Contains);
      bg.on('pointerdown', () => {
        this.currentChapter = c;
        this.scene.restart();
      });
      // 选中发光
      if (isActive) {
        this.tweens.add({
          targets: bg,
          alpha: 0.8, duration: 800, yoyo: true, repeat: -1,
        });
      }
    });
  }

  private drawStages() {
    const startY = 170;
    const stages = STAGES.filter((s) => s.chapter === this.currentChapter);
    const cellH = 130;
    const cellW = (GAME_WIDTH - 36) / 2;
    stages.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 12 + col * (cellW + 12);
      const y = startY + row * (cellH + 10);
      const player = usePlayerStore();
      const cleared = player.save.clearedStages.includes(s.id);
      const isCurrent = player.save.currentStage === s.id;
      panel(this, x, y, cellW, cellH, isCurrent ? 0x1f3a8a : 0x23234a);
      this.add.text(x + 12, y + 12, `第${s.level % 6 || 6}关`, { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });
      this.add.text(x + 12, y + 44, `推荐战力 ${s.recommendedPower}`, { fontSize: '16px', color: '#9ca3af' });
      if (cleared) this.add.text(x + cellW - 12, y + 12, '✓', { fontSize: '24px', color: '#10b981' }).setOrigin(1, 0);
      if (s.bossId) {
        const bossLabel = this.add.text(x + cellW - 12, y + cellH - 12, '⚠ BOSS', { fontSize: '16px', color: '#ef4444', fontStyle: 'bold' }).setOrigin(1, 1);
        this.tweens.add({ targets: bossLabel, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
      }
      button(this, x + 16, y + cellH - 50, cellW - 32, 38, cleared ? '重打' : '挑战', () => this.startStage(s.id), { fontSize: 18 });
      // 入场动画
      const cell = this.add.rectangle(x, y, 0, cellH, 0x00000000);
      void cell;
    });
  }

  private startStage(id: number) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    const team = player.save.formation.slots.filter((u) => u !== null);
    if (team.length === 0) {
      toast(this, '请先在英雄界面配置阵容');
      this.scene.start('HeroScene');
      return;
    }
    const stage = STAGES.find((s) => s.id === id);
    if (!stage) return;
    battle.init(stage, player.save.formation.slots);
    void computeStats;
    void useHeroStore;
    this.scene.start('BattleScene');
  }

  private claimIdle() {
    const player = usePlayerStore();
    const gold = Math.round(player.save.highestStage * 240);
    const exp = Math.round(player.save.highestStage * 60);
    if (gold <= 0) {
      toast(this, '请先通关任意关卡');
      return;
    }
    player.addCurrency('gold', gold);
    player.addCurrency('exp', exp);
    toast(this, `领取挂机收益 金币+${gold} 经验+${exp}`);
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}