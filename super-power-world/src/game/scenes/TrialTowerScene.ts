import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { TRIAL_TOWER_STAGES, STAGE_MAP } from '@/data/stages';
import { usePlayerStore } from '@/stores/playerStore';
import { useBattleStore } from '@/stores/battleStore';

export class TrialTowerScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('TrialTowerScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '🗼 试炼之塔', () => this.scene.start('MainScene'));
    this.drawTower();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#c084fc',
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

  private drawTower() {
    const player = usePlayerStore();
    const towerHighest = (player.save as any).towerHighest || 1;
    const startY = 100;
    const cellH = 90;
    const cellW = GAME_WIDTH - 24;

    panel(this, 12, startY, cellW, 100, 0x1f2937);
    this.add.text(24, startY + 16, '当前最高层', { fontSize: '20px', color: '#fbbf24', fontStyle: 'bold' });
    this.add.text(24, startY + 50, `${towerHighest} / 100`, { fontSize: '32px', color: '#fff', fontStyle: 'bold' });
    this.add.text(GAME_WIDTH - 24, startY + 50, '每日 5 次挑战', { fontSize: '16px', color: '#6ad1ff' }).setOrigin(1, 0);

    let y = startY + 120;
    const showCount = 6;
    for (let i = 0; i < showCount; i++) {
      const floor = towerHighest - i;
      if (floor < 1) break;
      const stage = STAGE_MAP[30000 + floor];
      if (!stage) break;
      const isCleared = floor < towerHighest;
      const isCurrent = floor === towerHighest;
      const isBoss = floor % 10 === 0;
      panel(this, 12, y, cellW, 80, isCurrent ? 0x1f3a8a : 0x23234a);
      this.add.text(24, y + 12, `${floor}层${isBoss ? ' ⚠ BOSS' : ''}`, { fontSize: '24px', color: isBoss ? '#ef4444' : '#fbbf24', fontStyle: 'bold' });
      this.add.text(24, y + 44, `推荐战力 ${stage.recommendedPower}`, { fontSize: '16px', color: '#9ca3af' });
      if (isCleared) this.add.text(GAME_WIDTH - 24, y + 24, '✓', { fontSize: '20px', color: '#10b981' }).setOrigin(1, 0);
      const stageId = 30000 + floor;
      button(this, GAME_WIDTH - 200, y + 20, 160, 40, isCleared ? '重打' : '挑战', () => this.startStage(stageId), { fontSize: 18 });
      y += 90;
    }

    if (y < GAME_HEIGHT - 130) {
      this.add.text(GAME_WIDTH / 2, y + 20, '（仅显示最近 6 层）', { fontSize: '16px', color: '#9ca3af' }).setOrigin(0.5);
    }

    button(this, 20, GAME_HEIGHT - 100, 200, 60, '一键扫荡', () => {
      const reward = Math.round(towerHighest * 80);
      player.addCurrency('gold', reward);
      toast(this, `扫荡 ${towerHighest} 层获得 ${reward} 金币`);
    }, { fontSize: 22, color: 0x10b981 });
    button(this, GAME_WIDTH - 220, GAME_HEIGHT - 100, 200, 60, '查看奖励', () => {
      toast(this, '每 10 层奖励翻倍');
    }, { fontSize: 22, color: 0x6ad1ff });
    void TRIAL_TOWER_STAGES;
  }

  private startStage(stageId: number) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    const stage = STAGE_MAP[stageId];
    if (!stage) return;
    battle.init(stage, player.save.formation.slots);
    this.scene.start('BattleScene');
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}