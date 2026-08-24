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
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { useBattleStore } from '@/stores/battleStore';
import { HEROES, HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { computeStats } from '@/core/formulas';

interface ArenaPlayer {
  rank: number;
  name: string;
  power: number;
  formation: string[];
}

function genBot(rank: number): ArenaPlayer {
  const powerBase = 1500 + rank * 200;
  const formationCount = 6;
  const formation: string[] = [];
  for (let i = 0; i < formationCount; i++) {
    formation.push(HEROES[(rank * 7 + i * 3) % HEROES.length].id);
  }
  return {
    rank,
    name: `对手 #${rank}`,
    power: powerBase,
    formation,
  };
}

export class ArenaScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];
  private player: ArenaPlayer = { rank: 1000, name: '我', power: 0, formation: [] };

  constructor() { super('ArenaScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'volcanic', { dimTop: 100, dimBottom: 40 });
    this.drawAnimatedBackground();

    drawTopNav(this, '竞技场', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '跨服巅峰对决',
    });

    this.drawInfo();
    this.drawOpponents();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 24; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 60);
      const col = ['#f97316', '#fbbf24', '#ef4444', '#ffffff'][i % 4];
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

  private drawInfo() {
    const player = usePlayerStore();
    const heroes = useHeroStore().heroes;
    const playerFormation = player.save.formation.slots;
    const power = playerFormation.reduce((sum, uid) => {
      if (!uid) return sum;
      const inst = heroes.find((h) => h.uid === uid);
      if (!inst) return sum;
      return sum + computeStats(inst).power;
    }, 0);
    this.player = { rank: (player.save as any).arenaRank || 1000, name: player.save.nickname, power, formation: playerFormation.filter(Boolean) as string[] };

    const panel = drawSoftPanel(this, 12, 108, GAME_WIDTH - 24, 110, {
      fill: 0x2a1840, fillAlpha: 0.95, edge: 0xf97316, edgeAlpha: 0.8,
    });
    this.add.existing(panel);

    this.add.text(28, 124, this.player.name, {
      fontFamily: DS.font.display,
      fontSize: '26px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 3,
    });
    this.add.text(28, 168, `当前段位：${this.getRankName(this.player.rank)}`, {
      fontFamily: DS.font.body,
      fontSize: '16px',
      color: '#cfe6ff',
    });
    // 战力 + 排名徽章
    const powBg = this.add.graphics();
    powBg.fillStyle(0x000000, 0.5);
    powBg.fillRoundedRect(GAME_WIDTH - 200, 122, 170, 36, 8);
    powBg.fillStyle(0x1a0a14, 1);
    powBg.fillRoundedRect(GAME_WIDTH - 202, 120, 170, 36, 8);
    powBg.fillStyle(0x5cd1ff, 0.2);
    powBg.fillRoundedRect(GAME_WIDTH - 200, 122, 6, 32, 4);
    powBg.lineStyle(1.5, 0x5cd1ff, 0.7);
    powBg.strokeRoundedRect(GAME_WIDTH - 202, 120, 170, 36, 8);
    this.add.text(GAME_WIDTH - 30, 138, `战力 ${this.player.power.toLocaleString()}`, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#5cd1ff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)',
      strokeThickness: 2,
    }).setOrigin(1, 0.5);

    const rnBg = this.add.graphics();
    rnBg.fillStyle(0x000000, 0.5);
    rnBg.fillRoundedRect(GAME_WIDTH - 200, 170, 170, 36, 8);
    rnBg.fillStyle(0x2a1840, 1);
    rnBg.fillRoundedRect(GAME_WIDTH - 202, 168, 170, 36, 8);
    rnBg.fillStyle(0xa78bfa, 0.25);
    rnBg.fillRoundedRect(GAME_WIDTH - 200, 170, 6, 32, 4);
    rnBg.lineStyle(1.5, 0xa78bfa, 0.7);
    rnBg.strokeRoundedRect(GAME_WIDTH - 202, 168, 170, 36, 8);
    this.add.text(GAME_WIDTH - 30, 186, `排名 #${this.player.rank}`, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#c084fc',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)',
      strokeThickness: 2,
    }).setOrigin(1, 0.5);
  }

  private getRankName(rank: number): string {
    if (rank <= 10) return '�� 传奇组';
    if (rank <= 100) return '�� 王者组';
    if (rank <= 500) return '�� 钻石组';
    if (rank <= 1000) return '�� 铂金组';
    if (rank <= 2000) return '�� 黄金组';
    return '⚪ 白银组';
  }

  private drawOpponents() {
    const startY = 240;
    const cellH = 170;
    const cellW = (GAME_WIDTH - 24 - 20) / 3;
    const opponents = [genBot(Math.max(1, this.player.rank - 1)), genBot(Math.max(2, this.player.rank - 5)), genBot(Math.max(3, this.player.rank - 10))];
    opponents.forEach((opp, i) => {
      const x = 12 + i * (cellW + 10);
      const y = startY;
      const oppPanel = drawSoftPanel(this, x, y, cellW, cellH, {
        fill: 0x1a1030, fillAlpha: 0.92, edge: 0xef4444, edgeAlpha: 0.7,
      });
      this.add.existing(oppPanel);

      // 顶部排名条
      const hG = this.add.graphics();
      hG.fillStyle(0xef4444, 0.7);
      hG.fillRect(x + 4, y + 4, cellW - 8, 36);
      hG.fillStyle(0xffffff, 0.15);
      hG.fillRect(x + 6, y + 6, cellW - 12, 14);
      hG.lineStyle(1, 0xff9a50, 0.8);
      hG.strokeRect(x + 4, y + 4, cellW - 8, 36);

      this.add.text(x + cellW / 2, y + 22, `#${opp.rank}`, {
        fontFamily: DS.font.display,
        fontSize: '22px',
        color: '#fff0c0',
        fontStyle: 'bold',
        stroke: 'rgba(40,0,0,0.85)',
        strokeThickness: 3,
      }).setOrigin(0.5);

      this.add.text(x + cellW / 2, y + 52, opp.name, {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: '#cfe6ff',
      }).setOrigin(0.5);
      this.add.text(x + cellW / 2, y + 70, `战力 ${opp.power.toLocaleString()}`, {
        fontFamily: DS.font.body,
        fontSize: '13px',
        color: '#a8d8ff',
      }).setOrigin(0.5);

      // 阵容预览（3 个头像圆）
      const team = opp.formation.slice(0, 3);
      const slotW = 44, slotGap = 8;
      const totalW = team.length * slotW + (team.length - 1) * slotGap;
      const startX = x + (cellW - totalW) / 2;
      team.forEach((heroId, idx) => {
        const base = HERO_MAP[heroId];
        if (!base) return;
        const portrait = getHeroPortrait(base);
        const key = `arena_${opp.rank}_${idx}`;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        const sx = startX + idx * (slotW + slotGap);
        const sy = y + 90;
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x000000, 0.5);
        slotBg.fillRoundedRect(sx + 2, sy + 2, slotW, 50, 8);
        slotBg.fillStyle(0x2a1840, 1);
        slotBg.fillRoundedRect(sx, sy, slotW, 50, 8);
        slotBg.lineStyle(1.5, 0xffd76a, 0.5);
        slotBg.strokeRoundedRect(sx, sy, slotW, 50, 8);
        const img = this.add.image(sx + slotW / 2, sy + 18, key).setDisplaySize(36, 36);
      });

      drawPolishedButton(
        this, x + 16, y + cellH - 38, cellW - 32, 32, '挑战',
        { variant: 'red', fontSize: '15px', onClick: () => this.fight(opp) },
      );
    });

    // 奖励预览
    const rewardY = 440;
    const rewardsPanel = drawSoftPanel(this, 12, rewardY, GAME_WIDTH - 24, 320, {
      fill: 0x1a1030, fillAlpha: 0.92, edge: 0xffd76a, edgeAlpha: 0.6,
    });
    this.add.existing(rewardsPanel);

    // 标题
    const tBg = this.add.graphics();
    tBg.fillStyle(CARTOON.hexGold, 0.85);
    tBg.fillRect(12, rewardY, GAME_WIDTH - 24, 3);
    this.add.text(28, rewardY + 22, '�� 段位奖励', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 3,
    });
    const rewards = [
      { rank: '传奇组 (1-10)', prize: '5000 钻 + 50 UP券', color: 0xef4444 },
      { rank: '王者组 (11-100)', prize: '2000 钻 + 20 UP券', color: 0xf97316 },
      { rank: '钻石组 (101-500)', prize: '800 钻 + 10 UP券', color: 0xffd76a },
      { rank: '铂金组 (501-1000)', prize: '300 钻 + 5 UP券', color: 0xa78bfa },
    ];
    rewards.forEach((r, i) => {
      const y2 = rewardY + 70 + i * 56;
      // 行底色条
      const rG = this.add.graphics();
      rG.fillStyle(0x000000, 0.3);
      rG.fillRoundedRect(28, y2, GAME_WIDTH - 56, 44, 8);
      rG.fillStyle(r.color, 0.12);
      rG.fillRoundedRect(28, y2, GAME_WIDTH - 56, 44, 8);
      rG.fillStyle(r.color, 1);
      rG.fillRect(28, y2, 6, 44);
      rG.lineStyle(1, r.color, 0.5);
      rG.strokeRoundedRect(28, y2, GAME_WIDTH - 56, 44, 8);

      this.add.text(46, y2 + 22, r.rank, {
        fontFamily: DS.font.display,
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      this.add.text(GAME_WIDTH - 38, y2 + 22, r.prize, {
        fontFamily: DS.font.body,
        fontSize: '15px',
        color: '#ffd76a',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.6)',
        strokeThickness: 1,
      }).setOrigin(1, 0.5);
    });
  }

  private fight(opp: ArenaPlayer) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    const playerFormation = player.save.formation.slots;
    if (playerFormation.filter(Boolean).length === 0) {
      this.showToast('请先在英雄界面配置阵容');
      audio.playSfx?.('defeat');
      this.scene.start('HeroScene');
      return;
    }
    const fakeStage: any = {
      id: 999000 + opp.rank,
      name: `竞技场 #${opp.rank}`,
      chapter: 0,
      level: 1,
      recommendedPower: opp.power,
      rewards: { gold: 200, exp: 50, items: [{ id: 'gem', count: 100 }] },
      waves: [{ enemies: opp.formation.map((heroId) => ({ heroId, level: 10, star: 1 })) }],
    };
    battle.init(fakeStage, playerFormation);
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
      targets: [t, bg], alpha: 0, duration: 800,
      onComplete: () => { t.destroy(); bg.destroy(); },
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}