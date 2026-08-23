import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP, HEROES } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
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
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '👤 玩家资料', () => this.scene.start('MainScene'));
    this.drawTabs();
    this.drawContent();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#fbbf24',
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

  private drawTabs() {
    const tabs = [
      { id: 'info', name: '基本信息' },
      { id: 'titles', name: '称号' },
      { id: 'achievements', name: '成就' },
    ] as const;
    const w = (GAME_WIDTH - 24) / tabs.length;
    tabs.forEach((t, i) => {
      const x = 12 + i * w;
      const y = 100;
      const isActive = this.tab === t.id;
      panel(this, x + 4, y, w - 8, 50, isActive ? 0xfbbf24 : 0x23234a);
      this.add.text(x + w / 2, y + 25, t.name, {
        fontSize: '18px', color: isActive ? '#1a1a2e' : '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);
      const bg = this.add.rectangle(x + w / 2, y + 25, w - 8, 50, 0x00000000).setInteractive();
      bg.on('pointerdown', () => { this.tab = t.id; this.scene.restart(); });
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
    const y = 170;

    // 头像 + 昵称
    panel(this, 12, y, GAME_WIDTH - 24, 200, 0x1f2937);
    const avatar = this.add.circle(80, y + 60, 50, 0xc084fc).setStrokeStyle(3, 0xfbbf24);
    this.add.text(80, y + 60, player.save.nickname.slice(0, 2), { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(160, y + 24, player.save.nickname, { fontSize: '28px', color: '#fbbf24', fontStyle: 'bold' });
    this.add.text(160, y + 64, `Lv.${player.save.level}  ·  VIP ${player.save.vipLevel}`, { fontSize: '18px', color: '#fff' });
    this.add.text(160, y + 92, `注册 ${Math.floor((Date.now() - player.save.createdAt) / 86400000)} 天`, { fontSize: '14px', color: '#9ca3af' });

    // 数据
    const totalPower = heroes.reduce((sum, h) => sum + computeStats(h).power, 0);
    const stats = [
      { name: '总战力', value: totalPower.toLocaleString(), color: '#fbbf24' },
      { name: '英雄数', value: heroes.length, color: '#6ad1ff' },
      { name: '最高关卡', value: player.save.highestStage, color: '#10b981' },
      { name: '累计钻石', value: player.save.gem.toLocaleString(), color: '#a78bfa' },
    ];
    stats.forEach((s, i) => {
      const cx = 24 + (i % 2) * ((GAME_WIDTH - 48) / 2);
      const cy = y + 130 + Math.floor(i / 2) * 35;
      this.add.text(cx, cy, `${s.name}：${s.value}`, { fontSize: '18px', color: s.color });
    });

    // 称号显示
    const equippedTitle = (player.save as any).equippedTitle || 't_novice';
    const title = TITLES.find((t) => t.id === equippedTitle);
    if (title) {
      panel(this, 12, y + 220, GAME_WIDTH - 24, 80, 0x23234a);
      this.add.text(24, y + 230, '🏷 当前称号', { fontSize: '14px', color: '#9ca3af' });
      this.add.text(24, y + 252, `【${title.name}】`, { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });
    }

    // 修改昵称按钮
    button(this, 12, y + 320, GAME_WIDTH - 24, 50, '修改昵称', () => {
      const name = prompt('请输入新昵称 (2-12 字符)');
      if (name && name.length >= 2 && name.length <= 12) {
        player.setNickname(name);
        this.scene.restart();
      }
    }, { fontSize: 20, color: 0x6ad1ff });
  }

  private drawTitles() {
    const player = usePlayerStore();
    const startY = 170;
    panel(this, 12, startY, GAME_WIDTH - 24, 720, 0x12122a);
    this.add.text(24, startY + 16, '🏷 称号收集', { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });
    TITLES.forEach((t, i) => {
      const y = startY + 60 + i * 80;
      const owned = (player.save as any).ownedTitles?.includes(t.id) || t.owned;
      const equipped = (player.save as any).equippedTitle === t.id;
      panel(this, 24, y, GAME_WIDTH - 48, 70, owned ? 0x23234a : 0x1a1a2e);
      this.add.text(34, y + 12, t.name, { fontSize: '20px', color: owned ? '#fbbf24' : '#6a6a8a', fontStyle: 'bold' });
      this.add.text(34, y + 42, t.condition, { fontSize: '14px', color: '#9ca3af' });
      if (equipped) {
        this.add.text(GAME_WIDTH - 36, y + 35, '✓ 已佩戴', { fontSize: '14px', color: '#10b981' }).setOrigin(1, 0.5);
      } else if (owned) {
        button(this, GAME_WIDTH - 130, y + 18, 90, 38, '佩戴', () => {
          (player.save as any).equippedTitle = t.id;
          this.scene.restart();
        }, { fontSize: 16, color: 0x6ad1ff });
      } else {
        this.add.text(GAME_WIDTH - 36, y + 35, '未解锁', { fontSize: '14px', color: '#6a6a8a' }).setOrigin(1, 0.5);
      }
    });
    void HEROES;
  }

  private drawAchievements() {
    const player = usePlayerStore();
    const startY = 170;
    panel(this, 12, startY, GAME_WIDTH - 24, 720, 0x12122a);
    this.add.text(24, startY + 16, '🏆 成就', { fontSize: '22px', color: '#fbbf24', fontStyle: 'bold' });
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
      const y = startY + 60 + i * 100;
      const owned = achievements.includes(a.id);
      panel(this, 24, y, GAME_WIDTH - 48, 90, owned ? 0x23234a : 0x1a1a2e);
      this.add.text(34, y + 12, a.name, { fontSize: '20px', color: owned ? '#fbbf24' : '#6a6a8a', fontStyle: 'bold' });
      this.add.text(34, y + 42, a.desc, { fontSize: '14px', color: '#9ca3af' });
      this.add.text(34, y + 66, `成就点：${a.points}`, { fontSize: '14px', color: owned ? '#10b981' : '#6a6a8a' });
      if (!owned) {
        button(this, GAME_WIDTH - 130, y + 24, 90, 40, '领取', () => {
          achievements.push(a.id);
          player.save.achievements = achievements;
          player.addCurrency('gem', a.points);
          this.scene.restart();
        }, { fontSize: 16, color: 0x10b981 });
      } else {
        this.add.text(GAME_WIDTH - 36, y + 45, '✓ 已完成', { fontSize: '14px', color: '#10b981' }).setOrigin(1, 0.5);
      }
    });
    void getHeroPortrait;
    void HERO_MAP;
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}