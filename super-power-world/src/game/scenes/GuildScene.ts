import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  drawSceneBackdrop,
  drawTopNav,
  drawSectionHeader,
  drawSoftPanel,
  drawPolishedButton,
  setGameRefSize,
  CARTOON,
  DS,
} from '../ui/designSystem';
import { usePlayerStore } from '@/stores/playerStore';

export class GuildScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('GuildScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'castle', { dimTop: 100, dimBottom: 40 });
    this.drawAnimatedBackground();

    drawTopNav(this, '公会联盟', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '与战友并肩作战',
    });

    this.drawGuild();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 60);
      const col = ['#3ecf8e', '#fbbf24', '#5cd1ff', '#ffffff'][i % 4];
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: col,
      }).setOrigin(0.5).setAlpha(0.25);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: 0.55,
        y: y - 30,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawGuild() {
    const player = usePlayerStore();
    const myGuild = (player.save as any).guild || null;
    const y0 = 108;

    if (!myGuild) {
      // 未加入公会：精致面板
      const introPanel = drawSoftPanel(this, 12, y0, GAME_WIDTH - 24, 280, {
        fill: 0x1a2848, fillAlpha: 0.92, edge: 0x3ecf8e, edgeAlpha: 0.7,
      });
      this.add.existing(introPanel);

      // 大图标
      const iconG = this.add.graphics();
      iconG.fillStyle(0x000000, 0.4);
      iconG.fillCircle(GAME_WIDTH / 2 + 3, y0 + 60 + 3, 46);
      iconG.fillStyle(0x3ecf8e, 0.4);
      iconG.fillCircle(GAME_WIDTH / 2, y0 + 60, 44);
      iconG.fillStyle(0x3ecf8e, 1);
      iconG.fillCircle(GAME_WIDTH / 2, y0 + 60, 38);
      iconG.fillStyle(0xffffff, 0.4);
      iconG.fillCircle(GAME_WIDTH / 2 - 8, y0 + 52, 14);
      iconG.lineStyle(2, 0xffffff, 0.6);
      iconG.strokeCircle(GAME_WIDTH / 2, y0 + 60, 38);
      this.add.text(GAME_WIDTH / 2, y0 + 65, '��', { fontSize: '40px' }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, y0 + 130, '你还没有加入公会', {
        fontFamily: DS.font.display,
        fontSize: '26px',
        color: '#ffe48a',
        fontStyle: 'bold',
        stroke: 'rgba(40,20,0,0.8)',
        strokeThickness: 3,
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, y0 + 170, '加入公会可参与异兽讨伐、公会战\n获得公会币与限定奖励', {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#cfe6ff',
        align: 'center',
        lineSpacing: 6,
      }).setOrigin(0.5);

      drawPolishedButton(
        this, GAME_WIDTH / 2 - 200, y0 + 215, 180, 56, '创建公会',
        {
          variant: 'green', fontSize: '20px',
          onClick: () => {
            const p = usePlayerStore();
            if (p.gem < 500) return this.showToast('钻石不足 500');
            p.addCurrency('gem', -500);
            (p.save as any).guild = { name: p.save.nickname + '的公会', level: 1, members: 1, contribution: 0 };
            this.showToast('公会已创建！');
            audio.playSfx?.('levelup');
            this.scene.restart();
          },
        },
      );
      drawPolishedButton(
        this, GAME_WIDTH / 2 + 20, y0 + 215, 180, 56, '加入公会',
        {
          variant: 'blue', fontSize: '20px',
          onClick: () => {
            const p = usePlayerStore();
            (p.save as any).guild = { name: '星河旅者', level: 5, members: 38, contribution: 0 };
            this.showToast('已加入 星河旅者 公会');
            audio.playSfx?.('levelup');
            this.scene.restart();
          },
        },
      );
    } else {
      // 已有公会信息
      const info = drawSoftPanel(this, 12, y0, GAME_WIDTH - 24, 230, {
        fill: 0x1a2848, fillAlpha: 0.95, edge: 0xffd76a, edgeAlpha: 0.7,
      });
      this.add.existing(info);

      // 公会头像
      const head = this.add.graphics();
      head.fillStyle(0x000000, 0.4);
      head.fillCircle(78, y0 + 60 + 2, 46);
      head.fillStyle(0x8a5a20, 1);
      head.fillCircle(76, y0 + 60, 44);
      head.fillStyle(0xc09030, 1);
      head.fillCircle(76, y0 + 60, 40);
      head.fillStyle(0xffd76a, 1);
      head.fillCircle(76, y0 + 60, 36);
      head.fillStyle(0xffffff, 0.4);
      head.fillCircle(68, y0 + 52, 14);
      head.lineStyle(2, 0xffffff, 0.5);
      head.strokeCircle(76, y0 + 60, 36);
      this.add.text(76, y0 + 60, '��', { fontSize: '36px' }).setOrigin(0.5);

      this.add.text(132, y0 + 24, myGuild.name, {
        fontFamily: DS.font.display,
        fontSize: '28px',
        color: '#ffe48a',
        fontStyle: 'bold',
        stroke: 'rgba(40,20,0,0.8)',
        strokeThickness: 3,
      });
      this.add.text(132, y0 + 64, `Lv.${myGuild.level}  ·  成员 ${myGuild.members}/100`, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#cfe6ff',
      });
      this.add.text(132, y0 + 90, `我的贡献：${myGuild.contribution || 0}`, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#a78bfa',
        fontStyle: 'bold',
      });

      drawPolishedButton(
        this, GAME_WIDTH - 220, y0 + 30, 200, 56, '捐赠 100 钻',
        {
          variant: 'gold', fontSize: '18px',
          onClick: () => {
            const p = usePlayerStore();
            if (p.gem < 100) return this.showToast('钻石不足');
            p.addCurrency('gem', -100);
            myGuild.contribution += 100;
            p.addCurrency('gold', 5000);
            this.showToast('捐赠成功，金币 +5000');
            audio.playSfx?.('purchase');
          },
        },
      );
      drawPolishedButton(
        this, GAME_WIDTH - 220, y0 + 100, 200, 56, '领取奖励',
        {
          variant: 'green', fontSize: '18px',
          onClick: () => this.showToast('暂无新奖励'),
        },
      );
    }

    // 公会活动列表
    const ay = myGuild ? 360 : 412;
    const listPanel = drawSoftPanel(this, 12, ay, GAME_WIDTH - 24, 470, {
      fill: 0x1a1030, fillAlpha: 0.9, edge: 0x6d4ba8, edgeAlpha: 0.7,
    });
    this.add.existing(listPanel);

    const header = drawSectionHeader(this, 24, ay + 8, GAME_WIDTH - 48, 38, '�� 公会活动', {
      right: '查看全部 >',
    });
    this.add.existing(header);

    const acts = [
      { name: '异兽讨伐', desc: '每日 3 次，与公会成员协同击败世界 BOSS', icon: '��', color: 0xff6a3d, onClick: () => this.scene.start('WorldBossScene') },
      { name: '云顶之战', desc: '跨服公会战，争夺要塞归属', icon: '��', color: 0x9d6cff, onClick: () => this.showToast('云顶之战即将开放') },
      { name: '公会商店', desc: '用公会币兑换英雄碎片与圣物', icon: '��', color: 0xffd76a, onClick: () => this.scene.start('ShopScene') },
      { name: '公会任务', desc: '完成日常任务获得大量公会币', icon: '��', color: 0x3ecf8e, onClick: () => this.showToast('公会任务进行中') },
    ];
    acts.forEach((act, i) => {
      const y = ay + 60 + i * 100;
      const itemPanel = drawSoftPanel(this, 24, y, GAME_WIDTH - 48, 90, {
        fill: 0x2a1840, fillAlpha: 0.9, edge: act.color, edgeAlpha: 0.5, cornerGold: false,
      });
      this.add.existing(itemPanel);

      // 图标圆
      const ig = this.add.graphics();
      ig.fillStyle(0x000000, 0.4);
      ig.fillCircle(64, y + 45, 32);
      ig.fillStyle(act.color, 0.4);
      ig.fillCircle(62, y + 45, 30);
      ig.fillStyle(act.color, 1);
      ig.fillCircle(62, y + 45, 26);
      ig.fillStyle(0xffffff, 0.4);
      ig.fillCircle(56, y + 40, 10);
      ig.lineStyle(1.5, 0xffffff, 0.5);
      ig.strokeCircle(62, y + 45, 26);
      this.add.text(62, y + 48, act.icon, { fontSize: '26px' }).setOrigin(0.5);

      this.add.text(108, y + 18, act.name, {
        fontFamily: DS.font.display,
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.7)',
        strokeThickness: 2,
      });
      this.add.text(108, y + 52, act.desc, {
        fontFamily: DS.font.body,
        fontSize: '15px',
        color: '#cfe6ff',
      });

      drawPolishedButton(
        this, GAME_WIDTH - 142, y + 22, 100, 46, '前往',
        { variant: 'blue', fontSize: '16px', onClick: act.onClick },
      );
    });
  }

  private showToast(text: string) {
    const bg = this.add.graphics();
    const w = text.length * 22 + 36;
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.lineStyle(2, 0xffd76a, 0.85);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.setDepth(80);
    const t = this.add.text(GAME_WIDTH / 2, 82, text, {
      fontFamily: DS.font.display,
      fontSize: '20px',
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