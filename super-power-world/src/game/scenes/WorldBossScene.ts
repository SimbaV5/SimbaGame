import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';
import { useBattleStore } from '@/stores/battleStore';
import { HERO_MAP, HEROES } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { computeStats } from '@/core/formulas';
import { useHeroStore } from '@/stores/heroStore';

const WORLD_BOSS = {
  id: 'worldboss_void_dragon',
  name: '虚空之龙·尼德霍格',
  description: '穿越异世界的远古巨龙，传说能撕裂时空本身。',
  hp: 1000000,
  maxHp: 1000000,
  level: 100,
  rarity: 'MRC' as const,
  faction: 'abyss' as const,
};

export class WorldBossScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private dmgNumbers: { x: number; y: number; text: string; timer: number }[] = [];
  private bossCurrentHp = WORLD_BOSS.hp;

  constructor() { super('WorldBossScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '🐲 世界 BOSS', () => this.scene.start('MainScene'));
    this.drawBoss();
    this.drawRanking();
    this.startBattle();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#ef4444',
      }).setOrigin(0.5).setAlpha(0.2);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: 0.4,
        y: y - 30,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawBoss() {
    const y = 100;
    panel(this, 12, y, GAME_WIDTH - 24, 350, 0x1f2937);

    const portrait = getHeroPortrait({
      id: WORLD_BOSS.id,
      name: WORLD_BOSS.name,
      class: 'warrior',
      element: 'dark',
      faction: WORLD_BOSS.faction,
      rarity: WORLD_BOSS.rarity,
      description: WORLD_BOSS.description,
      baseHp: WORLD_BOSS.hp,
      baseAtk: 999,
      baseDef: 500,
      baseSpd: 100,
      skillIds: [],
    });
    const key = 'worldboss';
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
    const img = this.add.image(GAME_WIDTH / 2, y + 110, key).setDisplaySize(160, 160);
    img.setAlpha(0);
    img.setScale(0.5);
    this.tweens.add({
      targets: img,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 600, ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: img,
      rotation: 0.1, duration: 2000, yoyo: true, repeat: -1,
    });

    this.add.text(GAME_WIDTH / 2, y + 200, WORLD_BOSS.name, { fontSize: '24px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, y + 232, `${WORLD_BOSS.rarity}  Lv.${WORLD_BOSS.level}`, { fontSize: '16px', color: '#a78bfa' }).setOrigin(0.5);

    // BOSS 血条
    this.bossHpBar = this.add.graphics();
    this.updateBossHpBar();
    this.add.text(24, y + 290, `BOSS HP：${this.bossCurrentHp.toLocaleString()} / ${WORLD_BOSS.maxHp.toLocaleString()}`, { fontSize: '16px', color: '#fff' });
  }

  private updateBossHpBar() {
    if (!this.bossHpBar) return;
    this.bossHpBar.clear();
    const pct = Math.max(0, this.bossCurrentHp / WORLD_BOSS.maxHp);
    this.bossHpBar.fillStyle(0x4a4a8a, 1);
    this.bossHpBar.fillRoundedRect(24, 320, GAME_WIDTH - 48, 20, 6);
    this.bossHpBar.fillStyle(0xef4444, 1);
    this.bossHpBar.fillRoundedRect(24, 320, (GAME_WIDTH - 48) * pct, 20, 6);
  }

  private drawRanking() {
    const y = 470;
    panel(this, 12, y, GAME_WIDTH - 24, 280, 0x12122a);
    this.add.text(24, y + 16, '🏆 公会伤害榜', { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });

    const player = usePlayerStore();
    const myContribution = (player.save as any).bossContribution || 0;

    const ranks = [
      { rank: 1, name: '剑魔无双', damage: 1245000, avatar: '⚔' },
      { rank: 2, name: '星耀·龙腾', damage: 980000, avatar: '🌟' },
      { rank: 3, name: '深渊主宰', damage: 750000, avatar: '👁' },
      { rank: 4, name: '虚空行者', damage: 520000, avatar: '🌀' },
      { rank: 5, name: '雷霆之怒', damage: 380000, avatar: '⚡' },
    ];
    ranks.forEach((r, i) => {
      const y2 = y + 56 + i * 40;
      this.add.text(24, y2, `#${r.rank}`, { fontSize: '18px', color: r.rank <= 3 ? '#fbbf24' : '#fff', fontStyle: 'bold' });
      this.add.text(60, y2, `${r.avatar} ${r.name}`, { fontSize: '16px', color: '#fff' });
      this.add.text(GAME_WIDTH - 24, y2, `${r.damage.toLocaleString()}`, { fontSize: '16px', color: '#fbbf24' }).setOrigin(1, 0);
    });
    // 我的贡献
    this.add.text(24, y + 240, `我的累计伤害：${myContribution.toLocaleString()}`, { fontSize: '16px', color: '#6ad1ff', fontStyle: 'bold' });
  }

  private startBattle() {
    const player = usePlayerStore();
    const heroes = useHeroStore().heroes;
    const playerFormation = player.save.formation.slots;
    const team = playerFormation.filter(Boolean);
    if (team.length === 0) {
      toast(this, '请先配置阵容');
      return;
    }

    const totalPower = team.reduce((sum, uid) => {
      const inst = heroes.find((h) => h.uid === uid);
      return sum + (inst ? computeStats(inst).power : 0);
    }, 0);
    const dmgPerTick = Math.round(totalPower * 0.05);

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (this.bossCurrentHp <= 0) return;
        const dmg = dmgPerTick * (0.8 + Math.random() * 0.4);
        this.bossCurrentHp = Math.max(0, this.bossCurrentHp - dmg);
        this.updateBossHpBar();
        // 飘字
        const x = GAME_WIDTH / 2 + (Math.random() - 0.5) * 200;
        const y = 200 + (Math.random() - 0.5) * 80;
        const t = this.add.text(x, y, `-${Math.round(dmg)}`, { fontSize: '24px', color: '#fbbf24', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
        this.tweens.add({
          targets: t,
          y: y - 60, alpha: 0, duration: 800,
          onComplete: () => t.destroy(),
        });
        // 累计贡献
        player.save.bossContribution = (player.save.bossContribution || 0) + dmg;
        if (this.bossCurrentHp <= 0) {
          toast(this, `🎉 BOSS 已击败！累计 ${player.save.bossContribution.toLocaleString()} 伤害`);
        }
      },
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
    this.dmgNumbers = [];
    void HERO_MAP;
    void HEROES;
  }
}