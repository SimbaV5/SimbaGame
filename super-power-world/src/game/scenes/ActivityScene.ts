import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useActivityStore } from '@/stores/activityStore';
import { usePlayerStore } from '@/stores/playerStore';

export class ActivityScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('ActivityScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '🎁 活动中心', () => this.scene.start('MainScene'));
    this.drawActivities();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#ef4444',
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

  private drawActivities() {
    const activities = useActivityStore().activities;
    const cellH = 220;
    const cellW = GAME_WIDTH - 24;
    let y = 100;
    activities.forEach((act, idx) => {
      const x = 12;
      const p = panel(this, x, y, cellW, cellH, 0x23234a);
      // 入场动画
      p.setAlpha(0);
      p.x = x - 20;
      this.tweens.add({
        targets: p,
        alpha: 1, x: x,
        duration: 400, delay: idx * 80, ease: 'Cubic.easeOut',
      });
      this.add.text(x + 12, y + 14, act.name, { fontSize: '24px', color: '#fbbf24', fontStyle: 'bold' });
      this.add.text(x + 12, y + 50, act.description, { fontSize: '16px', color: '#ffffffcc', wordWrap: { width: cellW - 200 } });
      const player = usePlayerStore();
      if (act.type === 'login') {
        const claimed = !!player.save.activitiesProgress[`act_login_${useActivityStore().dayIndex}`];
        button(this, x + cellW - 200, y + 30, 180, 50, claimed ? '已领取' : '立即领取', () => {
          if (useActivityStore().claimLogin()) toast(this, '已领取');
          else toast(this, '已领取过');
          this.scene.restart();
        }, { fontSize: 18, color: claimed ? 0x4a4a8a : 0x10b981, disabled: claimed });
      } else if (act.type === 'fund') {
        const bought = !!player.save.activitiesProgress['act_fund_bought'];
        if (!bought) {
          button(this, x + cellW - 200, y + 30, 180, 50, '购买 680 钻', () => {
            if (useActivityStore().buyFund()) toast(this, '已购买');
            else toast(this, '钻石不足');
            this.scene.restart();
          }, { fontSize: 18, color: 0xfbbf24 });
        } else {
          const dayIdx = useActivityStore().dayIndex;
          const claimed = !!player.save.activitiesProgress[`act_fund_${dayIdx}`];
          button(this, x + cellW - 200, y + 30, 180, 50, claimed ? '已领取' : '领取今日', () => {
            if (useActivityStore().claimTask('act_fund')) toast(this, '已领取');
            else toast(this, '已领取过');
            this.scene.restart();
          }, { fontSize: 18, color: claimed ? 0x4a4a8a : 0x10b981, disabled: claimed });
        }
      } else if (act.type === 'limited_task') {
        const dayIdx = useActivityStore().dayIndex;
        const claimed = !!player.save.activitiesProgress[`act_task_${dayIdx}`];
        button(this, x + cellW - 200, y + 30, 180, 50, claimed ? '已完成' : '领取奖励', () => {
          if (useActivityStore().claimTask('act_task')) toast(this, '已领取');
          else toast(this, '已完成');
          this.scene.restart();
        }, { fontSize: 18, color: claimed ? 0x4a4a8a : 0x10b981, disabled: claimed });
      } else if (act.type === 'consume_return') {
        const total = player.save.activitiesProgress['act_consume'] || 0;
        const tiers = [500, 1500, 3000, 6000];
        const claimedKey = `act_consume_t${tiers.findIndex((t) => total >= t)}`;
        const claimed = !!player.save.activitiesProgress[claimedKey];
        this.add.text(x + 12, y + cellH - 30, `累计 ${total} 钻`, { fontSize: '14px', color: '#6ad1ff' });
      } else if (act.type === 'shop_discount') {
        this.add.text(x + 12, y + cellH - 30, '商城部分商品 5 折', { fontSize: '14px', color: '#fbbf24' });
      } else if (act.type === 'boss_rush') {
        this.add.text(x + 12, y + cellH - 30, '前往战斗界面参与', { fontSize: '14px', color: '#ef4444' });
      }
      y += cellH + 10;
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}