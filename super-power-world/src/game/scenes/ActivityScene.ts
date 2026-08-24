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
import { useActivityStore } from '@/stores/activityStore';
import { usePlayerStore } from '@/stores/playerStore';

export class ActivityScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('ActivityScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'city', { dimTop: 100, dimBottom: 40 });
    this.drawAnimatedBackground();

    drawTopNav(this, '活动中心', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '登录有礼，每日福利',
    });

    this.drawActivities();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 60);
      const col = ['#ef4444', '#fbbf24', '#e64ba8', '#ffffff'][i % 4];
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(10, 16)}px`,
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

  private drawActivities() {
    const activities = useActivityStore().activities;
    const cellH = 230;
    const cellW = GAME_WIDTH - 24;
    let y = 110;
    const palette = [0xef4444, 0xffd76a, 0xe64ba8, 0x5cd1ff, 0x9d6cff, 0x3ecf8e];

    activities.forEach((act, idx) => {
      const x = 12;
      const accent = palette[idx % palette.length];

      const p = drawSoftPanel(this, x, y, cellW, cellH, {
        fill: 0x1a1030, fillAlpha: 0.92, edge: accent, edgeAlpha: 0.7, cornerGold: false,
      });
      const container = this.add.container(x, y, [p]);
      container.setAlpha(0);
      container.x = x - 30;
      this.tweens.add({
        targets: container,
        alpha: 1, x: x,
        duration: 400, delay: idx * 80, ease: 'Cubic.easeOut',
      });

      // 顶部色带
      const barG = this.add.graphics();
      barG.fillStyle(accent, 0.6);
      barG.fillRect(2, 2, cellW - 4, 56);
      barG.fillStyle(0xffffff, 0.18);
      barG.fillRect(4, 4, cellW - 8, 22);
      barG.lineStyle(1.5, accent, 0.9);
      barG.strokeRect(2, 2, cellW - 4, 56);

      // 类型小标签
      const typeMap: Record<string, { text: string; col: number }> = {
        login: { text: '登录', col: 0x3ecf8e },
        fund: { text: '基金', col: 0xffd76a },
        shop_discount: { text: '折扣', col: 0xef4444 },
        consume_return: { text: '返利', col: 0xff9a50 },
        limited_task: { text: '任务', col: 0x5cd1ff },
        boss_rush: { text: '讨伐', col: 0x9d6cff },
      };
      const tag = typeMap[act.type] ?? { text: '活动', col: accent };
      const tagBg = this.add.graphics();
      tagBg.fillStyle(0x000000, 0.5);
      tagBg.fillRoundedRect(x + 14, y + 14, 64, 28, 6);
      tagBg.fillStyle(tag.col, 1);
      tagBg.fillRoundedRect(x + 12, y + 12, 64, 28, 6);
      tagBg.fillStyle(0xffffff, 0.4);
      tagBg.fillRoundedRect(x + 14, y + 13, 60, 8, 4);
      tagBg.lineStyle(1, 0xffffff, 0.6);
      tagBg.strokeRoundedRect(x + 12, y + 12, 64, 28, 6);
      this.add.text(x + 44, y + 26, tag.text, {
        fontFamily: DS.font.display,
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.6)',
        strokeThickness: 2,
      }).setOrigin(0.5);

      // 名称
      this.add.text(x + 92, y + 28, act.name, {
        fontFamily: DS.font.display,
        fontSize: '24px',
        color: '#ffd76a',
        fontStyle: 'bold',
        stroke: 'rgba(40,20,0,0.85)',
        strokeThickness: 3,
      });

      // 描述
      this.add.text(x + 14, y + 76, act.description, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#cfe6ff',
        wordWrap: { width: cellW - 220 },
      });

      // 进度条 + 底部信息
      const player = usePlayerStore();
      if (act.type === 'login') {
        const claimed = !!player.save.activitiesProgress[`act_login_${useActivityStore().dayIndex}`];
        this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, `当前第 ${useActivityStore().dayIndex} 天`, claimed ? 1 : 0.6, accent);
        drawPolishedButton(
          this, x + cellW - 200, y + cellH - 70, 180, 56,
          claimed ? '已领取' : '立即领取',
          {
            variant: claimed ? 'blue' : 'green',
            fontSize: '18px',
            disabled: claimed,
            onClick: () => {
              if (useActivityStore().claimLogin()) {
                this.showToast('已领取');
                audio.playSfx?.('levelup');
              } else {
                this.showToast('已领取过');
              }
              this.scene.restart();
            },
          },
        );
      } else if (act.type === 'fund') {
        const bought = !!player.save.activitiesProgress['act_fund_bought'];
        if (!bought) {
          this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, '未购买', 0, accent);
          drawPolishedButton(
            this, x + cellW - 200, y + cellH - 70, 180, 56, '购买 680 钻',
            {
              variant: 'gold', fontSize: '18px',
              onClick: () => {
                if (useActivityStore().buyFund()) {
                  this.showToast('已购买');
                  audio.playSfx?.('purchase');
                } else {
                  this.showToast('钻石不足');
                }
                this.scene.restart();
              },
            },
          );
        } else {
          const dayIdx = useActivityStore().dayIndex;
          const claimed = !!player.save.activitiesProgress[`act_fund_${dayIdx}`];
          this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, `第 ${dayIdx}/30 天`, dayIdx / 30, accent);
          drawPolishedButton(
            this, x + cellW - 200, y + cellH - 70, 180, 56,
            claimed ? '已领取' : '领取今日',
            {
              variant: claimed ? 'blue' : 'green',
              fontSize: '18px',
              disabled: claimed,
              onClick: () => {
                if (useActivityStore().claimTask('act_fund')) {
                  this.showToast('已领取');
                  audio.playSfx?.('levelup');
                } else {
                  this.showToast('已领取过');
                }
                this.scene.restart();
              },
            },
          );
        }
      } else if (act.type === 'limited_task') {
        const dayIdx = useActivityStore().dayIndex;
        const claimed = !!player.save.activitiesProgress[`act_task_${dayIdx}`];
        this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, `任务 ${dayIdx}/30`, Math.min(1, dayIdx / 30), accent);
        drawPolishedButton(
          this, x + cellW - 200, y + cellH - 70, 180, 56,
          claimed ? '已完成' : '领取奖励',
          {
            variant: claimed ? 'blue' : 'green',
            fontSize: '18px',
            disabled: claimed,
            onClick: () => {
              if (useActivityStore().claimTask('act_task')) {
                this.showToast('已领取');
                audio.playSfx?.('levelup');
              } else {
                this.showToast('已完成');
              }
              this.scene.restart();
            },
          },
        );
      } else if (act.type === 'consume_return') {
        const total = player.save.activitiesProgress['act_consume'] || 0;
        const tiers = [500, 1500, 3000, 6000];
        const tIdx = tiers.findIndex((t) => total >= t);
        const claimedKey = `act_consume_t${tIdx}`;
        const claimed = !!player.save.activitiesProgress[claimedKey];
        this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, `累计 ${total}/6000 钻`, Math.min(1, total / 6000), accent);
        drawPolishedButton(
          this, x + cellW - 200, y + cellH - 70, 180, 56,
          tIdx === -1 ? '未达成' : (claimed ? '已领取' : `领取 T${tIdx + 1}`),
          {
            variant: tIdx === -1 ? 'blue' : (claimed ? 'blue' : 'gold'),
            fontSize: '18px',
            disabled: tIdx === -1 || claimed,
          },
        );
      } else if (act.type === 'shop_discount') {
        this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, '商城部分商品 5 折', 0.5, accent);
        drawPolishedButton(
          this, x + cellW - 200, y + cellH - 70, 180, 56, '前往商城',
          { variant: 'gold', fontSize: '18px', onClick: () => this.scene.start('ShopScene') },
        );
      } else if (act.type === 'boss_rush') {
        this.drawProgressBar(x + 14, y + cellH - 80, cellW - 28, '前往战斗界面参与', 0.5, accent);
        drawPolishedButton(
          this, x + cellW - 200, y + cellH - 70, 180, 56, '前往战斗',
          { variant: 'red', fontSize: '18px', onClick: () => this.scene.start('WorldBossScene') },
        );
      }
      y += cellH + 10;
    });
  }

  private drawProgressBar(x: number, y: number, w: number, label: string, pct: number, col: number) {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(x + 2, y + 4, w, 22, 8);
    bg.fillStyle(0x0a2a4a, 1);
    bg.fillRoundedRect(x, y, w, 22, 8);
    bg.fillStyle(col, 0.15);
    bg.fillRect(x, y, 6, 22);
    bg.lineStyle(1, col, 0.5);
    bg.strokeRoundedRect(x, y, w, 22, 8);

    if (pct > 0) {
      const fg = this.add.graphics();
      fg.fillStyle(col, 1);
      fg.fillRoundedRect(x + 2, y + 2, (w - 4) * pct, 18, 6);
      fg.fillStyle(0xffffff, 0.25);
      fg.fillRoundedRect(x + 4, y + 3, (w - 8) * pct, 6, 4);
    }
    this.add.text(x + w / 2, y + 11, label, {
      fontFamily: DS.font.body,
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.7)',
      strokeThickness: 2,
    }).setOrigin(0.5);
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
