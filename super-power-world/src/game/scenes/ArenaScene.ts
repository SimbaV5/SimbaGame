import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
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
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '⚔ 竞技场', () => this.scene.start('MainScene'));
    this.drawInfo();
    this.drawOpponents();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#f97316',
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

    panel(this, 12, 100, GAME_WIDTH - 24, 110, 0x1f2937);
    this.add.text(24, 116, `${this.player.name}`, { fontSize: '24px', color: '#fbbf24', fontStyle: 'bold' });
    this.add.text(24, 152, `当前段位：${this.getRankName(this.player.rank)}`, { fontSize: '16px', color: '#fff' });
    this.add.text(GAME_WIDTH - 24, 116, `战力 ${this.player.power}`, { fontSize: '18px', color: '#6ad1ff' }).setOrigin(1, 0);
    this.add.text(GAME_WIDTH - 24, 152, `排名 #${this.player.rank}`, { fontSize: '18px', color: '#a78bfa' }).setOrigin(1, 0);
  }

  private getRankName(rank: number): string {
    if (rank <= 10) return '🌟 传奇组';
    if (rank <= 100) return '💎 王者组';
    if (rank <= 500) return '🥇 钻石组';
    if (rank <= 1000) return '🥈 铂金组';
    if (rank <= 2000) return '🥉 黄金组';
    return '⚪ 白银组';
  }

  private drawOpponents() {
    const startY = 230;
    const cellH = 160;
    const opponents = [genBot(this.player.rank - 1), genBot(this.player.rank - 5), genBot(this.player.rank - 10)];
    opponents.forEach((opp, i) => {
      const x = 12 + i * (((GAME_WIDTH - 24) - 10) / 3 + 5);
      const y = startY;
      panel(this, x, y, ((GAME_WIDTH - 24) - 10) / 3, cellH, 0x23234a);
      this.add.text(x + 10, y + 12, `#${opp.rank}`, { fontSize: '20px', color: '#fbbf24', fontStyle: 'bold' });
      this.add.text(x + 10, y + 40, opp.name, { fontSize: '16px', color: '#fff' });
      this.add.text(x + 10, y + 62, `战力 ${opp.power}`, { fontSize: '14px', color: '#9ca3af' });
      // 阵容预览
      const team = opp.formation.slice(0, 3);
      team.forEach((heroId, idx) => {
        const base = HERO_MAP[heroId];
        if (!base) return;
        const portrait = getHeroPortrait(base);
        const key = `arena_${opp.rank}_${idx}`;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        const img = this.add.image(x + 20 + idx * 50, y + 110, key).setDisplaySize(40, 50);
      });
      button(this, x + 10, y + cellH - 30, ((GAME_WIDTH - 24) - 10) / 3 - 20, 26, '挑战', () => this.fight(opp), { fontSize: 16, color: 0xef4444 });
    });

    // 奖励预览
    const rewardY = 420;
    panel(this, 12, rewardY, GAME_WIDTH - 24, 280, 0x12122a);
    this.add.text(24, rewardY + 12, '🏆 段位奖励', { fontSize: '20px', color: '#fbbf24', fontStyle: 'bold' });
    const rewards = [
      { rank: '传奇组 (1-10)', prize: '5000 钻 + 50 UP券', color: '#ef4444' },
      { rank: '王者组 (11-100)', prize: '2000 钻 + 20 UP券', color: '#f97316' },
      { rank: '钻石组 (101-500)', prize: '800 钻 + 10 UP券', color: '#fbbf24' },
      { rank: '铂金组 (501-1000)', prize: '300 钻 + 5 UP券', color: '#a78bfa' },
    ];
    rewards.forEach((r, i) => {
      this.add.text(24, rewardY + 50 + i * 50, r.rank, { fontSize: '16px', color: r.color, fontStyle: 'bold' });
      this.add.text(24, rewardY + 70 + i * 50, r.prize, { fontSize: '14px', color: '#fff' });
    });
  }

  private fight(opp: ArenaPlayer) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    const playerFormation = player.save.formation.slots;
    if (playerFormation.filter(Boolean).length === 0) {
      toast(this, '请先在英雄界面配置阵容');
      this.scene.start('HeroScene');
      return;
    }
    // 模拟对手数据
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
    this.scene.start('BattleScene');
    void opp;
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}