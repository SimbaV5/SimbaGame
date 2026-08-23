import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';

export class GuildScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('GuildScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '🛡 公会联盟', () => this.scene.start('MainScene'));
    this.drawGuild();
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

  private drawGuild() {
    const player = usePlayerStore();
    const myGuild = (player.save as any).guild || null;
    const y0 = 100;

    if (!myGuild) {
      panel(this, 12, y0, GAME_WIDTH - 24, 240, 0x23234a);
      this.add.text(GAME_WIDTH / 2, y0 + 30, '你还没有加入公会', { fontSize: '24px', color: '#fbbf24' }).setOrigin(0.5);
      this.add.text(GAME_WIDTH / 2, y0 + 70, '加入公会可参与异兽讨伐、公会战，\n获得公会币与限定奖励', { fontSize: '16px', color: '#fffcc', align: 'center' }).setOrigin(0.5);
      button(this, GAME_WIDTH / 2 - 200, y0 + 140, 180, 60, '创建公会', () => {
        const player = usePlayerStore();
        if (player.gem < 500) return toast(this, '钻石不足 500');
        player.addCurrency('gem', -500);
        (player.save as any).guild = { name: player.save.nickname + '的公会', level: 1, members: 1, contribution: 0 };
        toast(this, '公会已创建！');
        this.scene.restart();
      }, { fontSize: 22, color: 0x10b981 });
      button(this, GAME_WIDTH / 2 + 20, y0 + 140, 180, 60, '加入公会', () => {
        const player = usePlayerStore();
        (player.save as any).guild = { name: '星河旅者', level: 5, members: 38, contribution: 0 };
        toast(this, '已加入 星河旅者 公会');
        this.scene.restart();
      }, { fontSize: 22, color: 0x6ad1ff });
    } else {
      panel(this, 12, y0, GAME_WIDTH - 24, 200, 0x1f2937);
      this.add.text(24, y0 + 16, `🏰 ${myGuild.name}`, { fontSize: '24px', color: '#fbbf24', fontStyle: 'bold' });
      this.add.text(24, y0 + 56, `Lv.${myGuild.level}  ·  成员 ${myGuild.members}/100`, { fontSize: '16px', color: '#fff' });
      this.add.text(24, y0 + 84, `我的贡献：${myGuild.contribution || 0}`, { fontSize: '16px', color: '#a78bfa' });
      button(this, GAME_WIDTH - 200, y0 + 30, 180, 50, '捐赠 100 钻', () => {
        const player = usePlayerStore();
        if (player.gem < 100) return toast(this, '钻石不足');
        player.addCurrency('gem', -100);
        myGuild.contribution += 100;
        player.addCurrency('gold', 5000);
        toast(this, '捐赠成功，金币 +5000');
      }, { fontSize: 18, color: 0xfbbf24 });
      button(this, GAME_WIDTH - 200, y0 + 90, 180, 50, '领取奖励', () => {
        toast(this, '暂无新奖励');
      }, { fontSize: 18, color: 0x10b981 });
    }

    // 公会活动
    let ay = 360;
    panel(this, 12, ay, GAME_WIDTH - 24, 460, 0x12122a);
    this.add.text(24, ay + 16, '📋 公会活动', { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });

    const acts = [
      { name: '异兽讨伐', desc: '每日 3 次，与公会成员协同击败世界 BOSS', icon: '🐲', onClick: () => this.scene.start('WorldBossScene') },
      { name: '云顶之战', desc: '跨服公会战，争夺要塞归属', icon: '🏯', onClick: () => toast(this, '云顶之战即将开放') },
      { name: '公会商店', desc: '用公会币兑换英雄碎片与圣物', icon: '🏪', onClick: () => this.scene.start('ShopScene') },
      { name: '公会任务', desc: '完成日常任务获得大量公会币', icon: '📜', onClick: () => toast(this, '公会任务进行中') },
    ];
    acts.forEach((act, i) => {
      const y = ay + 60 + i * 100;
      panel(this, 24, y, GAME_WIDTH - 48, 90, 0x23234a);
      this.add.text(34, y + 12, `${act.icon} ${act.name}`, { fontSize: '20px', color: '#fff', fontStyle: 'bold' });
      this.add.text(34, y + 44, act.desc, { fontSize: '14px', color: '#9ca3af' });
      button(this, GAME_WIDTH - 130, y + 18, 90, 50, '前往', act.onClick, { fontSize: 18, color: 0x6ad1ff });
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}