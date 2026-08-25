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
import { TRIAL_TOWER_STAGES, STAGE_MAP } from '@/data/stages';
import { usePlayerStore } from '@/stores/playerStore';
import { useBattleStore } from '@/stores/battleStore';

export class TrialTowerScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('TrialTowerScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'celestial', { dimTop: 100, dimBottom: 120 });
    this.drawAnimatedBackground();

    drawTopNav(this, '试炼之塔', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '每日 5 次挑战',
    });

    this.drawTower();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 60);
      const col = ['#c084fc', '#fbbf24', '#5cd1ff', '#ffffff'][i % 4];
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(10, 18)}px`,
        color: col,
      }).setOrigin(0.5).setAlpha(0.3);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: 0.6,
        y: y - 40,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawTower() {
    const player = usePlayerStore();
    const towerHighest = (player.save as any).towerHighest || 1;
    const startY = 110;
    const cellW = GAME_WIDTH - 24;

    // 顶部当前最高层
    const topPanel = drawSoftPanel(this, 12, startY, cellW, 110, {
      fill: 0x2a1840, fillAlpha: 0.92, edge: 0xc084fc, edgeAlpha: 0.7,
    });
    this.add.existing(topPanel);

    // 大金色数字
    this.add.text(40, startY + 30, '当前最高层', {
      fontFamily: DS.font.body,
      fontSize: '18px',
      color: '#cfe6ff',
    });
    this.add.text(40, startY + 55, `${towerHighest}`, {
      fontFamily: DS.font.display,
      fontSize: '48px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 4,
    });
    this.add.text(108, startY + 80, '/ 100', {
      fontFamily: DS.font.body,
      fontSize: '20px',
      color: '#a8d8ff',
    });

    // 右上奖励文字
    this.add.text(GAME_WIDTH - 32, startY + 38, '每日 5 次', {
      fontFamily: DS.font.display,
      fontSize: '20px',
      color: '#c084fc',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.7)',
      strokeThickness: 2,
    }).setOrigin(1, 0);
    this.add.text(GAME_WIDTH - 32, startY + 70, '通关有惊喜', {
      fontFamily: DS.font.body,
      fontSize: '15px',
      color: '#a8d8ff',
    }).setOrigin(1, 0);

    let y = startY + 130;
    const showCount = 5;
    for (let i = 0; i < showCount; i++) {
      const floor = towerHighest - i;
      if (floor < 1) break;
      const stage = STAGE_MAP[30000 + floor];
      if (!stage) break;
      const isCleared = floor < towerHighest;
      const isCurrent = floor === towerHighest;
      const isBoss = floor % 10 === 0;

      const rowPanel = drawSoftPanel(this, 12, y, cellW, 78, {
        fill: isCurrent ? 0x2a3868 : 0x1a1030,
        fillAlpha: 0.92,
        edge: isCurrent ? 0xc084fc : (isCleared ? 0x3ecf8e : 0x6d4ba8),
        edgeAlpha: 0.7,
      });
      this.add.existing(rowPanel);

      // 楼层号徽章
      const numBg = this.add.graphics();
      numBg.fillStyle(0x000000, 0.4);
      numBg.fillRoundedRect(28, y + 18, 44, 44, 10);
      numBg.fillStyle(isBoss ? 0xef4444 : (isCurrent ? 0xc084fc : 0xffd76a), 1);
      numBg.fillRoundedRect(26, y + 16, 44, 44, 10);
      numBg.fillStyle(0xffffff, 0.4);
      numBg.fillRoundedRect(28, y + 18, 40, 16, 8);
      numBg.lineStyle(1.5, 0xffffff, 0.6);
      numBg.strokeRoundedRect(26, y + 16, 44, 44, 10);
      this.add.text(48, y + 38, `${floor}`, {
        fontFamily: DS.font.display,
        fontSize: '22px',
        color: isBoss ? '#ffffff' : '#3a2010',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.4)',
        strokeThickness: 1,
      }).setOrigin(0.5);

      // BOSS 角标
      if (isBoss) {
        const tagG = this.add.graphics();
        tagG.fillStyle(0x000000, 0.5);
        tagG.fillRoundedRect(80, y + 14, 64, 22, 6);
        tagG.fillStyle(0xef4444, 1);
        tagG.fillRoundedRect(78, y + 12, 64, 22, 6);
        tagG.lineStyle(1, 0xff9a50, 0.8);
        tagG.strokeRoundedRect(78, y + 12, 64, 22, 6);
        this.add.text(110, y + 23, '⚠ BOSS', {
          fontFamily: DS.font.display,
          fontSize: '13px',
          color: '#fff0c0',
          fontStyle: 'bold',
        }).setOrigin(0.5);
      }

      this.add.text(80, y + 44, `推荐战力 ${stage.recommendedPower.toLocaleString()}`, {
        fontFamily: DS.font.body,
        fontSize: '15px',
        color: '#a8d8ff',
      });

      if (isCleared) {
        const checkG = this.add.graphics();
        checkG.fillStyle(0x3ecf8e, 1);
        checkG.fillCircle(GAME_WIDTH - 220, y + 39, 12);
        checkG.fillStyle(0xffffff, 0.5);
        checkG.fillCircle(GAME_WIDTH - 222, y + 37, 5);
        checkG.lineStyle(2, 0xffffff, 1);
        checkG.strokeCircle(GAME_WIDTH - 220, y + 39, 12);
        this.add.text(GAME_WIDTH - 220, y + 39, '✓', {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: '#0a2a4a',
          fontStyle: 'bold',
        }).setOrigin(0.5);
      }

      drawPolishedButton(
        this, GAME_WIDTH - 200, y + 22, 160, 38,
        isCleared ? '重打' : '挑战',
        {
          variant: isCurrent ? 'violet' : (isCleared ? 'blue' : 'gold'),
          fontSize: '16px',
          onClick: () => this.startStage(30000 + floor),
        },
      );
      y += 88;
    }

    if (y < GAME_HEIGHT - 130) {
      this.add.text(GAME_WIDTH / 2, y + 16, '（仅显示最近 5 层）', {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: '#9ca3af',
        fontStyle: 'italic',
      }).setOrigin(0.5);
    }

    drawPolishedButton(
      this, 20, GAME_HEIGHT - 110, 220, 70, '一键扫荡',
      {
        variant: 'green', fontSize: '22px',
        onClick: () => {
          const reward = Math.round(towerHighest * 80);
          player.addCurrency('gold', reward);
          this.showToast(`扫荡 ${towerHighest} 层获得 ${reward} 金币`);
          audio.playSfx?.('coin');
        },
      },
    );
    drawPolishedButton(
      this, GAME_WIDTH - 240, GAME_HEIGHT - 110, 220, 70, '查看奖励',
      {
        variant: 'blue', fontSize: '22px',
        onClick: () => this.showToast('每 10 层奖励翻倍'),
      },
    );
    void TRIAL_TOWER_STAGES;
  }

  private startStage(stageId: number) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    const stage = STAGE_MAP[stageId];
    if (!stage) return;
    battle.init(stage, player.save.formation.slots);
    audio.playSfx?.('click');
    this.scene.start('BattleScene');
  }

  private showToast(text: string) {
    const bg = this.add.graphics();
    const w = Math.min(GAME_WIDTH - 40, text.length * 20 + 36);
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.lineStyle(2, 0xffd76a, 0.85);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.setDepth(80);
    const t = this.add.text(GAME_WIDTH / 2, 82, text, {
      fontFamily: DS.font.display,
      fontSize: '18px',
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
