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
  private scrollY = 0;

  constructor() { super('StageScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '关卡选择', () => this.scene.start('MainScene'));

    this.drawChapterTabs();
    this.drawStages();

    // 立即战斗按钮
    const player = usePlayerStore();
    const battle = useBattleStore();
    button(this, GAME_WIDTH - 220, GAME_HEIGHT - 130, 200, 80, '前往战斗', () => {
      const stage = STAGES.find((s) => s.id === Math.min(player.save.currentStage, MAX_STAGE)) || STAGES[0];
      battle.init(stage, player.save.formation.slots);
      this.scene.start('BattleScene');
    }, { color: 0x10b981, fontSize: 24 });

    button(this, 20, GAME_HEIGHT - 130, 200, 80, '挂机收益', () => this.claimIdle(), { color: 0x6ad1ff, fontSize: 24 });
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
      if (s.bossId) this.add.text(x + cellW - 12, y + cellH - 12, 'BOSS', { fontSize: '16px', color: '#ef4444' }).setOrigin(1, 1);
      const b = button(this, x + 16, y + cellH - 50, cellW - 32, 38, cleared ? '重打' : '挑战', () => this.startStage(s.id), { fontSize: 18 });
    });
  }

  private startStage(id: number) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    const hero = useHeroStore();
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
    void hero;
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
}