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
import { HERO_MAP, HEROES } from '@/data/heroes';
import { computeStats } from '@/core/formulas';

interface Title {
  id: string;
  name: string;
  condition: string;
  owned: boolean;
}

const TITLES: Title[] = [
  { id: 't_novice', name: '初入超能', condition: '完成新手引导', owned: true },
  { id: 't_collector', name: '收藏家', condition: '收集 30 个不同英雄', owned: false },
  { id: 't_awakened', name: '觉醒者', condition: '任意英雄觉醒 5 级', owned: false },
  { id: 't_challenger', name: '挑战者', condition: '通关噩梦第 10 关', owned: false },
  { id: 't_arena_king', name: '竞技之王', condition: '竞技场前 10 名', owned: false },
  { id: 't_tower_master', name: '塔主', condition: '试炼塔 100 层', owned: false },
  { id: 't_boss_slayer', name: '屠龙者', condition: '击杀世界 BOSS', owned: false },
  { id: 't_whale', name: '海王', condition: '累计充值 1000+', owned: false },
];

export class ProfileScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];
  private tab: 'info' | 'titles' | 'achievements' = 'info';

  constructor() { super('ProfileScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'castle', { dimTop: 100, dimBottom: 40 });
    this.drawAnimatedBackground();

    drawTopNav(this, '玩家资料', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '展示你的英雄之旅',
    });

    this.drawTabs();
    this.drawContent();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(110, GAME_HEIGHT - 60);
      const col = ['#fbbf24', '#c084fc', '#5cd1ff', '#ffffff'][i % 4];
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

  private drawTabs() {
    const tabs = [
      { id: 'info', name: '基本信息', glyph: '��' },
      { id: 'titles', name: '称号', glyph: '��' },
      { id: 'achievements', name: '成就', glyph: '��' },
    ] as const;
    const w = (GAME_WIDTH - 32) / tabs.length;
    const y = 102;
    tabs.forEach((t, i) => {
      const x = 16 + i * w;
      const isActive = this.tab === t.id;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.35);
      g.fillRoundedRect(x + 3, y + 4, w - 8, 56, 12);
      if (isActive) {
        g.fillStyle(0x8a5a20, 1);
        g.fillRoundedRect(x + 2, y + 2, w - 8, 56, 12);
        g.fillStyle(0xc09030, 1);
        g.fillRoundedRect(x + 4, y + 0, w - 12, 56, 11);
        g.fillStyle(CARTOON.hexGold, 1);
        g.fillRoundedRect(x + 6, y + 2, w - 16, 52, 10);
        g.fillStyle(0xfff0a0, 0.5);
        g.fillRoundedRect(x + 8, y + 4, w - 20, 22, 8);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeRoundedRect(x + 4, y + 0, w - 12, 56, 11);
      } else {
        g.fillStyle(0x0a2a4a, 1);
        g.fillRoundedRect(x + 2, y + 2, w - 8, 56, 12);
        g.fillStyle(0x1a4a8a, 1);
        g.fillRoundedRect(x + 4, y + 4, w - 12, 52, 11);
        g.fillStyle(0xffffff, 0.12);
        g.fillRoundedRect(x + 6, y + 5, w - 16, 20, 9);
        g.lineStyle(1.5, 0x6ab8f0, 0.45);
        g.strokeRoundedRect(x + 4, y + 4, w - 12, 52, 11);
      }
      if (isActive) {
        [[x + 10, y + 6], [x + w - 14, y + 6]].forEach(([cx, cy]) => {
          g.fillStyle(0xfff0a0, 0.9);
          g.fillCircle(cx, cy, 3);
        });
      }
      this.add.text(x + w / 2, y + 18, t.glyph, { fontSize: '20px' }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 42, t.name, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: isActive ? '#fff0c0' : '#ffffff',
        fontStyle: 'bold',
        stroke: isActive ? '#5a3a0a' : '#0a2a4a',
        strokeThickness: 2,
      }).setOrigin(0.5);
      const hit = this.add.rectangle(x + w / 2, y + 28, w - 8, 56, 0xffffff, 0).setInteractive();
      hit.on('pointerdown', () => {
        audio.playSfx?.('click');
        this.tab = t.id;
        this.scene.restart();
      });
    });
  }

  private drawContent() {
    if (this.tab === 'info') this.drawInfo();
    else if (this.tab === 'titles') this.drawTitles();
    else this.drawAchievements();
  }

  private drawInfo() {
    const player = usePlayerStore();
    const heroes = useHeroStore().heroes;
    const y = 178;

    // 头部面板：头像 + 昵称
    const headPanel = drawSoftPanel(this, 12, y, GAME_WIDTH - 24, 200, {
      fill: 0x2a1840, fillAlpha: 0.95, edge: 0xffd76a, edgeAlpha: 0.7,
    });
    this.add.existing(headPanel);

    // 头像（圆 + 金边 + 高光）
    const av = this.add.graphics();
    av.fillStyle(0x000000, 0.4);
    av.fillCircle(82, y + 60 + 2, 52);
    av.fillStyle(0x5a2a8a, 1);
    av.fillCircle(80, y + 60, 50);
    av.fillStyle(0xc084fc, 1);
    av.fillCircle(80, y + 60, 46);
    av.fillStyle(0xffffff, 0.4);
    av.fillCircle(72, y + 52, 16);
    av.lineStyle(3, CARTOON.hexGold, 1);
    av.strokeCircle(80, y + 60, 50);
    av.lineStyle(1.5, 0xffffff, 0.6);
    av.strokeCircle(80, y + 60, 42);
    this.add.text(80, y + 62, player.save.nickname.slice(0, 1), {
      fontFamily: DS.font.display,
      fontSize: '44px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(40,0,80,0.7)',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Lv 徽章
    const lvBg = this.add.graphics();
    lvBg.fillStyle(0x2a8a4a, 1);
    lvBg.fillRoundedRect(54, y + 102, 52, 22, 11);
    lvBg.fillStyle(CARTOON.hexGold, 1);
    lvBg.fillRect(54, y + 102, 52, 4);
    lvBg.lineStyle(1.5, 0xffffff, 0.6);
    lvBg.strokeRoundedRect(54, y + 102, 52, 22, 11);
    this.add.text(80, y + 113, `Lv.${player.save.level}`, {
      fontFamily: DS.font.display,
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,40,0,0.6)',
      strokeThickness: 1,
    }).setOrigin(0.5);

    // 昵称
    this.add.text(160, y + 24, player.save.nickname, {
      fontFamily: DS.font.display,
      fontSize: '30px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 4,
    });
    this.add.text(160, y + 68, `Lv.${player.save.level}  ·  VIP ${player.save.vipLevel}`, {
      fontFamily: DS.font.body,
      fontSize: '16px',
      color: '#cfe6ff',
      fontStyle: 'bold',
    });
    this.add.text(160, y + 96, `注册 ${Math.floor((Date.now() - player.save.createdAt) / 86400000)} 天`, {
      fontFamily: DS.font.body,
      fontSize: '14px',
      color: '#a8d8ff',
    });
    // 战力条
    const totalPower = heroes.reduce((sum, h) => sum + computeStats(h).power, 0);
    const pBar = this.add.graphics();
    pBar.fillStyle(0x000000, 0.5);
    pBar.fillRoundedRect(160, y + 130, 540, 38, 10);
    pBar.fillStyle(0x1a0a14, 1);
    pBar.fillRoundedRect(158, y + 128, 540, 38, 10);
    pBar.fillStyle(CARTOON.hexGold, 0.2);
    pBar.fillRect(158, y + 128, 6, 38);
    pBar.lineStyle(1.5, CARTOON.hexGold, 0.7);
    pBar.strokeRoundedRect(158, y + 128, 540, 38, 10);
    this.add.text(180, y + 147, `✊`, { fontSize: '20px' }).setOrigin(0, 0.5);
    this.add.text(214, y + 147, `总战力 ${totalPower.toLocaleString()}`, {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // 数据卡片
    const stats = [
      { name: '英雄数', value: heroes.length, glyph: '��', color: 0x5cd1ff },
      { name: '最高关卡', value: player.save.highestStage, glyph: '��', color: 0x3ecf8e },
      { name: '累计钻石', value: player.save.gem.toLocaleString(), glyph: '��', color: 0xa78bfa },
      { name: 'VIP等级', value: player.save.vipLevel, glyph: '��', color: 0xffd76a },
    ];
    stats.forEach((s, i) => {
      const cx = 12 + (i % 2) * ((GAME_WIDTH - 36) / 2 + 6);
      const cy = y + 220 + Math.floor(i / 2) * 78;
      const sPanel = drawSoftPanel(this, cx, cy, (GAME_WIDTH - 36) / 2, 70, {
        fill: 0x1a2848, fillAlpha: 0.95, edge: s.color, edgeAlpha: 0.6, cornerGold: false,
      });
      this.add.existing(sPanel);

      // 图标圆
      const ig = this.add.graphics();
      ig.fillStyle(0x000000, 0.4);
      ig.fillCircle(cx + 32, cy + 35, 22);
      ig.fillStyle(s.color, 0.5);
      ig.fillCircle(cx + 30, cy + 35, 22);
      ig.lineStyle(1.5, 0xffffff, 0.6);
      ig.strokeCircle(cx + 30, cy + 35, 22);
      this.add.text(cx + 30, cy + 38, s.glyph, { fontSize: '20px' }).setOrigin(0.5);

      this.add.text(cx + 60, cy + 24, s.name, {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: '#a8d8ff',
      });
      this.add.text(cx + 60, cy + 46, `${s.value}`, {
        fontFamily: DS.font.display,
        fontSize: '20px',
        color: '#ffd76a',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.5)',
        strokeThickness: 2,
      });
    });

    // 当前称号
    const equippedTitle = (player.save as any).equippedTitle || 't_novice';
    const title = TITLES.find((t) => t.id === equippedTitle);
    const tY = y + 380;
    if (title) {
      const tPanel = drawSoftPanel(this, 12, tY, GAME_WIDTH - 24, 70, {
        fill: 0x2a1840, fillAlpha: 0.95, edge: 0xffd76a, edgeAlpha: 0.6, cornerGold: false,
      });
      this.add.existing(tPanel);
      this.add.text(28, tY + 16, '�� 当前称号', {
        fontFamily: DS.font.body,
        fontSize: '13px',
        color: '#a8d8ff',
      });
      this.add.text(28, tY + 36, `【${title.name}】`, {
        fontFamily: DS.font.display,
        fontSize: '22px',
        color: '#ffd76a',
        fontStyle: 'bold',
        stroke: 'rgba(40,20,0,0.85)',
        strokeThickness: 3,
      });
    }

    drawPolishedButton(
      this, 12, tY + 90, GAME_WIDTH - 24, 60, '修改昵称',
      {
        variant: 'blue', fontSize: '20px',
        onClick: () => {
          const name = prompt('请输入新昵称 (2-12 字符)');
          if (name && name.length >= 2 && name.length <= 12) {
            player.setNickname(name);
            this.scene.restart();
          }
        },
      },
    );
  }

  private drawTitles() {
    const player = usePlayerStore();
    const startY = 178;
    const listPanel = drawSoftPanel(this, 12, startY, GAME_WIDTH - 24, 800, {
      fill: 0x1a1030, fillAlpha: 0.92, edge: 0xffd76a, edgeAlpha: 0.6,
    });
    this.add.existing(listPanel);

    const tBg = this.add.graphics();
    tBg.fillStyle(CARTOON.hexGold, 0.85);
    tBg.fillRect(12, startY, GAME_WIDTH - 24, 3);

    this.add.text(28, startY + 22, '�� 称号收集', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 3,
    });
    TITLES.forEach((t, i) => {
      const y = startY + 60 + i * 84;
      const owned = (player.save as any).ownedTitles?.includes(t.id) || t.owned;
      const equipped = (player.save as any).equippedTitle === t.id;
      const rG = this.add.graphics();
      rG.fillStyle(0x000000, 0.3);
      rG.fillRoundedRect(24, y, GAME_WIDTH - 48, 74, 10);
      rG.fillStyle(owned ? 0x2a3868 : 0x1a1a2e, owned ? 0.92 : 1);
      rG.fillRoundedRect(24, y, GAME_WIDTH - 48, 74, 10);
      rG.fillStyle(owned ? 0xffd76a : 0x4a4a78, 0.15);
      rG.fillRoundedRect(24, y, GAME_WIDTH - 48, 74, 10);
      rG.lineStyle(1, owned ? 0xffd76a : 0x6a6a8a, 0.6);
      rG.strokeRoundedRect(24, y, GAME_WIDTH - 48, 74, 10);

      // 称号图标
      const ig = this.add.graphics();
      ig.fillStyle(0x000000, 0.4);
      ig.fillCircle(60, y + 37, 24);
      ig.fillStyle(owned ? 0xffd76a : 0x4a4a78, owned ? 0.5 : 0.4);
      ig.fillCircle(58, y + 37, 24);
      ig.fillStyle(owned ? 0xffd76a : 0x4a4a78, owned ? 1 : 0.6);
      ig.fillCircle(58, y + 37, 20);
      ig.lineStyle(1.5, 0xffffff, 0.5);
      ig.strokeCircle(58, y + 37, 20);
      this.add.text(58, y + 40, '��', { fontSize: '18px' }).setOrigin(0.5);

      this.add.text(94, y + 14, t.name, {
        fontFamily: DS.font.display,
        fontSize: '20px',
        color: owned ? '#ffd76a' : '#6a6a8a',
        fontStyle: 'bold',
        stroke: owned ? 'rgba(40,20,0,0.7)' : 'rgba(0,0,0,0.5)',
        strokeThickness: 2,
      });
      this.add.text(94, y + 44, t.condition, {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: owned ? '#a8d8ff' : '#6a6a8a',
      });

      if (equipped) {
        const checkG = this.add.graphics();
        checkG.fillStyle(0x3ecf8e, 1);
        checkG.fillRoundedRect(GAME_WIDTH - 130, y + 22, 100, 30, 8);
        checkG.fillStyle(0xffffff, 0.3);
        checkG.fillRoundedRect(GAME_WIDTH - 130, y + 24, 100, 12, 6);
        this.add.text(GAME_WIDTH - 80, y + 37, '✓ 已佩戴', {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: '#0a2a1a',
          fontStyle: 'bold',
        }).setOrigin(0.5);
      } else if (owned) {
        drawPolishedButton(
          this, GAME_WIDTH - 142, y + 22, 110, 30, '佩戴',
          {
            variant: 'blue', fontSize: '14px',
            onClick: () => {
              (player.save as any).equippedTitle = t.id;
              audio.playSfx?.('click');
              this.scene.restart();
            },
          },
        );
      } else {
        this.add.text(GAME_WIDTH - 36, y + 37, '�� 未解锁', {
          fontFamily: DS.font.body,
          fontSize: '14px',
          color: '#6a6a8a',
        }).setOrigin(1, 0.5);
      }
    });
    void HEROES;
  }

  private drawAchievements() {
    const player = usePlayerStore();
    const startY = 178;
    const listPanel = drawSoftPanel(this, 12, startY, GAME_WIDTH - 24, 800, {
      fill: 0x1a1030, fillAlpha: 0.92, edge: 0xffd76a, edgeAlpha: 0.6,
    });
    this.add.existing(listPanel);

    const tBg = this.add.graphics();
    tBg.fillStyle(CARTOON.hexGold, 0.85);
    tBg.fillRect(12, startY, GAME_WIDTH - 24, 3);

    this.add.text(28, startY + 22, '�� 成就', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(40,20,0,0.85)',
      strokeThickness: 3,
    });
    const achievements = (player.save.achievements || []) as string[];
    const allAchievements = [
      { id: 'a_first_blood', name: '初战告捷', desc: '完成第一场战斗', points: 5 },
      { id: 'a_100_heroes', name: '百人斩', desc: '收集 100 个英雄', points: 100 },
      { id: 'a_chapter_3', name: '第三章', desc: '通关第三章', points: 50 },
      { id: 'a_tower_50', name: '塔中攀登', desc: '试炼塔 50 层', points: 80 },
      { id: 'a_arena_top', name: '巅峰对决', desc: '竞技场前 100', points: 200 },
      { id: 'a_ssr_5', name: 'SSR收藏家', desc: '拥有 5 个 SSR 英雄', points: 30 },
    ];
    allAchievements.forEach((a, i) => {
      const y = startY + 60 + i * 110;
      const owned = achievements.includes(a.id);
      const rG = this.add.graphics();
      rG.fillStyle(0x000000, 0.3);
      rG.fillRoundedRect(24, y, GAME_WIDTH - 48, 100, 10);
      rG.fillStyle(owned ? 0x2a3868 : 0x1a1a2e, owned ? 0.92 : 1);
      rG.fillRoundedRect(24, y, GAME_WIDTH - 48, 100, 10);
      rG.fillStyle(owned ? 0xffd76a : 0x4a4a78, 0.15);
      rG.fillRoundedRect(24, y, GAME_WIDTH - 48, 100, 10);
      rG.lineStyle(1, owned ? 0xffd76a : 0x6a6a8a, 0.6);
      rG.strokeRoundedRect(24, y, GAME_WIDTH - 48, 100, 10);

      const ig = this.add.graphics();
      ig.fillStyle(0x000000, 0.4);
      ig.fillCircle(60, y + 36, 24);
      ig.fillStyle(owned ? 0xffd76a : 0x4a4a78, owned ? 0.5 : 0.4);
      ig.fillCircle(58, y + 36, 24);
      ig.fillStyle(owned ? 0xffd76a : 0x4a4a78, owned ? 1 : 0.6);
      ig.fillCircle(58, y + 36, 20);
      ig.lineStyle(1.5, 0xffffff, 0.5);
      ig.strokeCircle(58, y + 36, 20);
      this.add.text(58, y + 39, '��', { fontSize: '18px' }).setOrigin(0.5);

      this.add.text(94, y + 14, a.name, {
        fontFamily: DS.font.display,
        fontSize: '20px',
        color: owned ? '#ffd76a' : '#6a6a8a',
        fontStyle: 'bold',
        stroke: owned ? 'rgba(40,20,0,0.7)' : 'rgba(0,0,0,0.5)',
        strokeThickness: 2,
      });
      this.add.text(94, y + 44, a.desc, {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: owned ? '#a8d8ff' : '#6a6a8a',
      });
      // 成就点徽章
      const ptBg = this.add.graphics();
      ptBg.fillStyle(0x000000, 0.4);
      ptBg.fillRoundedRect(94, y + 66, 130, 24, 12);
      ptBg.fillStyle(0xffd76a, owned ? 0.9 : 0.3);
      ptBg.fillRoundedRect(94, y + 66, 130, 24, 12);
      ptBg.fillStyle(0xffffff, 0.4);
      ptBg.fillRoundedRect(96, y + 67, 126, 8, 6);
      ptBg.lineStyle(1, 0xffffff, 0.5);
      ptBg.strokeRoundedRect(94, y + 66, 130, 24, 12);
      this.add.text(158, y + 78, `�� 成就点 ${a.points}`, {
        fontFamily: DS.font.display,
        fontSize: '14px',
        color: owned ? '#3a2010' : '#6a6a8a',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      if (!owned) {
        drawPolishedButton(
          this, GAME_WIDTH - 142, y + 30, 110, 36, '领取',
          {
            variant: 'green', fontSize: '14px',
            onClick: () => {
              achievements.push(a.id);
              player.save.achievements = achievements;
              player.addCurrency('gem', a.points);
              audio.playSfx?.('levelup');
              this.scene.restart();
            },
          },
        );
      } else {
        this.add.text(GAME_WIDTH - 36, y + 48, '✓ 已完成', {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: '#3ecf8e',
          fontStyle: 'bold',
          stroke: 'rgba(0,0,0,0.6)',
          strokeThickness: 2,
        }).setOrigin(1, 0.5);
      }
    });
    void HERO_MAP;
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}