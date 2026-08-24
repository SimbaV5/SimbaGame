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
  private bossHpBarBg!: Phaser.GameObjects.Graphics;
  private dmgNumbers: { x: number; y: number; text: string; timer: number }[] = [];
  private bossCurrentHp = WORLD_BOSS.hp;
  private hpTextObj!: Phaser.GameObjects.Text;

  constructor() { super('WorldBossScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'volcanic', { dimTop: 100, dimBottom: 40 });
    this.drawAnimatedBackground();

    drawTopNav(this, '世界 BOSS', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '虚空之龙 · 尼德霍格',
    });

    this.drawBoss();
    this.drawRanking();
    this.startBattle();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 26; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 60);
      const col = ['#ef4444', '#fbbf24', '#ff9a50', '#ffffff'][i % 4];
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(10, 16)}px`,
        color: col,
      }).setOrigin(0.5).setAlpha(0.25);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: 0.55,
        y: y - 40,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawBoss() {
    const y = 108;
    const bossPanel = drawSoftPanel(this, 12, y, GAME_WIDTH - 24, 360, {
      fill: 0x1a0820, fillAlpha: 0.92, edge: 0xef4444, edgeAlpha: 0.8,
    });
    this.add.existing(bossPanel);

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
    const img = this.add.image(GAME_WIDTH / 2, y + 120, key).setDisplaySize(170, 170);
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

    // 名字
    this.add.text(GAME_WIDTH / 2, y + 218, WORLD_BOSS.name, {
      fontFamily: DS.font.display,
      fontSize: '28px',
      color: '#ff6a3d',
      fontStyle: 'bold',
      stroke: 'rgba(40,0,0,0.85)',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 等级条
    const lvBg = this.add.graphics();
    const lvW = 200;
    lvBg.fillStyle(0x000000, 0.4);
    lvBg.fillRoundedRect(GAME_WIDTH / 2 - lvW / 2 + 2, y + 252, lvW, 28, 14);
    lvBg.fillStyle(0x6a0a0a, 1);
    lvBg.fillRoundedRect(GAME_WIDTH / 2 - lvW / 2, y + 250, lvW, 28, 14);
    lvBg.fillStyle(0xef4444, 0.6);
    lvBg.fillRoundedRect(GAME_WIDTH / 2 - lvW / 2 + 2, y + 252, lvW - 4, 24, 12);
    lvBg.lineStyle(1.5, 0xff9a50, 0.7);
    lvBg.strokeRoundedRect(GAME_WIDTH / 2 - lvW / 2, y + 250, lvW, 28, 14);
    this.add.text(GAME_WIDTH / 2, y + 264, `${WORLD_BOSS.rarity}  Lv.${WORLD_BOSS.level}`, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#fff0c0',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.7)',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // BOSS 血条
    this.bossHpBarBg = this.add.graphics();
    this.bossHpBar = this.add.graphics();
    this.updateBossHpBar();
    this.hpTextObj = this.add.text(GAME_WIDTH / 2, y + 322, '', {
      fontFamily: DS.font.display,
      fontSize: '15px',
      color: '#ffe48a',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.8)',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.updateHpText();
  }

  private updateBossHpBar() {
    if (!this.bossHpBar) return;
    const y = 108;
    const w = GAME_WIDTH - 48;
    const x = 24;
    const barY = y + 300;

    this.bossHpBarBg.clear();
    this.bossHpBarBg.fillStyle(0x000000, 0.5);
    this.bossHpBarBg.fillRoundedRect(x + 2, barY + 4, w, 18, 8);
    this.bossHpBarBg.fillStyle(0x1a0a14, 1);
    this.bossHpBarBg.fillRoundedRect(x, barY, w, 18, 8);
    this.bossHpBarBg.lineStyle(1.5, 0xef4444, 0.7);
    this.bossHpBarBg.strokeRoundedRect(x, barY, w, 18, 8);

    this.bossHpBar.clear();
    const pct = Math.max(0, this.bossCurrentHp / WORLD_BOSS.maxHp);
    if (pct > 0) {
      // 渐变血量
      const segs = 24;
      for (let i = 0; i < segs; i++) {
        const t = i / segs;
        if (t > pct) break;
        const r = Math.floor(0xff - 0x40 * (1 - t));
        const g = Math.floor(0x40 + 0x20 * t);
        const b = 0x30;
        const col = (r << 16) | (g << 8) | b;
        this.bossHpBar.fillStyle(col, 1);
        this.bossHpBar.fillRect(x + 2 + i * (w / segs), barY + 3, (w / segs) - 1, 12);
      }
      this.bossHpBar.fillStyle(0xffffff, 0.25);
      this.bossHpBar.fillRect(x + 2, barY + 3, (w - 4) * pct, 4);
    }
  }

  private updateHpText() {
    this.hpTextObj.setText(`BOSS HP: ${this.bossCurrentHp.toLocaleString()} / ${WORLD_BOSS.maxHp.toLocaleString()}`);
  }

  private drawRanking() {
    const y = 488;
    const rankPanel = drawSoftPanel(this, 12, y, GAME_WIDTH - 24, 360, {
      fill: 0x1a1030, fillAlpha: 0.92, edge: 0xffd76a, edgeAlpha: 0.7,
    });
    this.add.existing(rankPanel);

    // 标题
    const titleG = this.add.graphics();
    titleG.fillStyle(CARTOON.hexGold, 0.85);
    titleG.fillRect(12, y, GAME_WIDTH - 24, 3);
    this.add.text(28, y + 22, '�� 公会伤害榜', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 3,
    });

    const player = usePlayerStore();
    const myContribution = (player.save as any).bossContribution || 0;

    const ranks = [
      { rank: 1, name: '剑魔无双', damage: 1245000, avatar: '⚔' },
      { rank: 2, name: '星耀·龙腾', damage: 980000, avatar: '��' },
      { rank: 3, name: '深渊主宰', damage: 750000, avatar: '��' },
      { rank: 4, name: '虚空行者', damage: 520000, avatar: '��' },
      { rank: 5, name: '雷霆之怒', damage: 380000, avatar: '⚡' },
    ];
    ranks.forEach((r, i) => {
      const y2 = y + 64 + i * 44;
      // 排名条
      const rowG = this.add.graphics();
      rowG.fillStyle(0x000000, 0.3);
      rowG.fillRoundedRect(28, y2, GAME_WIDTH - 56, 38, 8);
      if (r.rank <= 3) {
        const gradCol = [0xffd76a, 0xc0c0c0, 0xcd7f32][r.rank - 1];
        rowG.fillStyle(gradCol, 0.15);
        rowG.fillRoundedRect(28, y2, GAME_WIDTH - 56, 38, 8);
      }
      rowG.lineStyle(1, r.rank <= 3 ? 0xffd76a : 0x6d4ba8, 0.6);
      rowG.strokeRoundedRect(28, y2, GAME_WIDTH - 56, 38, 8);

      // 排名数字
      const rankBg = this.add.graphics();
      rankBg.fillStyle(r.rank === 1 ? 0xffd76a : (r.rank === 2 ? 0xc0c0c0 : (r.rank === 3 ? 0xcd7f32 : 0x4a5a78)), 1);
      rankBg.fillCircle(50, y2 + 19, 13);
      rankBg.fillStyle(0xffffff, 0.4);
      rankBg.fillCircle(48, y2 + 17, 6);
      this.add.text(50, y2 + 19, `#${r.rank}`, {
        fontFamily: DS.font.display,
        fontSize: '14px',
        color: r.rank <= 3 ? '#3a2010' : '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.4)',
        strokeThickness: 1,
      }).setOrigin(0.5);

      this.add.text(74, y2 + 19, `${r.avatar} ${r.name}`, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      this.add.text(GAME_WIDTH - 38, y2 + 19, r.damage.toLocaleString(), {
        fontFamily: DS.font.display,
        fontSize: '18px',
        color: '#ffd76a',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.6)',
        strokeThickness: 2,
      }).setOrigin(1, 0.5);
    });
    // 我的贡献
    this.add.text(28, y + 308, `我的累计伤害：${myContribution.toLocaleString()}`, {
      fontFamily: DS.font.display,
      fontSize: '17px',
      color: '#5cd1ff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.6)',
      strokeThickness: 2,
    });
  }

  private startBattle() {
    const player = usePlayerStore();
    const heroes = useHeroStore().heroes;
    const playerFormation = player.save.formation.slots;
    const team = playerFormation.filter(Boolean);
    if (team.length === 0) {
      this.showToast('请先配置阵容');
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
        this.updateHpText();
        // 飘字
        const x = GAME_WIDTH / 2 + (Math.random() - 0.5) * 200;
        const yy = 228 + (Math.random() - 0.5) * 80;
        const t = this.add.text(x, yy, `-${Math.round(dmg)}`, {
          fontFamily: DS.font.display,
          fontSize: '28px',
          color: '#ffd76a',
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.85)',
          strokeThickness: 4,
        }).setOrigin(0.5);
        this.tweens.add({
          targets: t,
          y: yy - 60, alpha: 0, duration: 800,
          onComplete: () => t.destroy(),
        });
        // 累计贡献
        player.save.bossContribution = (player.save.bossContribution || 0) + dmg;
        audio.playSfx?.('battle_hit');
        if (this.bossCurrentHp <= 0) {
          this.showToast(`�� BOSS 已击败！累计 ${Math.floor(player.save.bossContribution).toLocaleString()} 伤害`);
          audio.playSfx?.('victory');
        }
      },
    });
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
      targets: [t, bg], alpha: 0, duration: 800, delay: 1500,
      onComplete: () => { t.destroy(); bg.destroy(); },
    });
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
    this.dmgNumbers = [];
    void HERO_MAP;
    void HEROES;
  }
}

