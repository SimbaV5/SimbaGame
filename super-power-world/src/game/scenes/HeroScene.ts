import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  setGameRefSize,
  drawCartoonTabBar,
  drawPinkBanner,
  drawOrnateHeroCard,
  CARTOON,
  DS,
  C,
  FACTION_COLORS,
} from '../ui/designSystem';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { HEROES, HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

const FACTION_LIST = [
  { id: 'all', name: 'ALL', glyph: '◉' },
  { id: 'abyss', name: '', glyph: '🦇' },
  { id: 'human', name: '', glyph: '🏰' },
  { id: 'beast', name: '', glyph: '🐾' },
  { id: 'spirit', name: '', glyph: '🍃' },
  { id: 'celestial', name: '', glyph: '👁' },
  { id: 'mecha', name: '', glyph: '☀' },
] as const;

const RARITY_RANK: Record<string, number> = {
  N: 0, R: 1, SR: 2, SSR: 3, UR: 4, LR: 5, MRC: 6,
};

export class HeroScene extends Phaser.Scene {
  private subTab: 'hero' | 'codex' = 'codex';
  private filter: string = 'all';
  private contentScrollY = 0;
  private isDragging = false;
  private dragStartY = 0;
  private dragStartScroll = 0;

  constructor() { super('HeroScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);

    // 浅蓝色背景（图鉴风格）- 分层渐变替代 fillGradientStyle
    const bg = this.add.graphics();
    const bgLayers = 10;
    for (let i = 0; i < bgLayers; i++) {
      const t = i / bgLayers;
      const r = Math.floor(0xbf + (0x80 - 0xbf) * t);
      const gc = Math.floor(0xe0 + (0xb8 - 0xe0) * t);
      const b = Math.floor(0xf5 + (0xd8 - 0xf5) * t);
      const col = (r << 16) | (gc << 8) | b;
      bg.fillStyle(col, 1);
      bg.fillRect(0, (GAME_HEIGHT / bgLayers) * i, GAME_WIDTH, (GAME_HEIGHT / bgLayers) + 1);
    }
    // 淡云
    for (let i = 0; i < 6; i++) {
      const cx = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const cy = Phaser.Math.Between(100, 400);
      const s = 0.7 + Math.random() * 0.6;
      for (let j = 0; j < 4; j++) {
        bg.fillStyle(0xffffff, 0.5 - j * 0.1);
        bg.fillEllipse(cx + (j - 2) * 18 * s, cy + (j % 2) * 6 * s, 30 * s, 16 * s);
      }
    }

    // 1. 顶部玩家栏
    this.drawTopPlayerBar();
    // 2. 顶部资源栏
    this.drawTopResourceBar();

    // 3. 内容区（可滚动）
    this.drawContent();

    // 4. 底部阵营筛选 + 图鉴属性按钮
    this.drawFactionFilters();

    // 5. 英雄/图鉴 双Tab
    this.drawHeroCodexTabs();

    // 6. 最底部蓝色 Tab Bar
    this.drawBottomTabBar();

    // 滚动支持
    this.setupScroll();
  }

  // ===================== 顶部玩家栏 =====================
  private drawTopPlayerBar() {
    const player = usePlayerStore();
    const y = 24;
    const g = this.add.graphics();
    g.fillStyle(0x1a5a98, 0.72);
    g.fillRoundedRect(16, y, GAME_WIDTH - 32, 92, 18);
    g.fillStyle(0x2a7fc8, 0.6);
    g.fillRoundedRect(18, y + 2, GAME_WIDTH - 36, 88, 17);
    g.fillStyle(0x2a7fc8, 0.4);
    g.fillRoundedRect(20, y + 4, GAME_WIDTH - 40, 40, 15);
    g.lineStyle(1.5, 0xffffff, 0.45);
    g.strokeRoundedRect(18, y + 2, GAME_WIDTH - 36, 88, 17);

    const avX = 64, avY = y + 46;
    const av = this.add.graphics();
    av.fillStyle(0x000000, 0.4);
    av.fillCircle(avX + 2, avY + 2, 36);
    av.fillStyle(0x8a5a3a, 1);
    av.fillCircle(avX, avY, 34);
    av.lineStyle(3, CARTOON.hexGold, 1);
    av.strokeCircle(avX, avY, 34);
    av.lineStyle(1.5, 0xffffff, 0.6);
    av.strokeCircle(avX, avY, 28);
    this.add.text(avX, avY + 2, player.save.nickname.slice(0, 1), {
      fontFamily: DS.font.display, fontSize: '36px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const lvBg = this.add.graphics();
    lvBg.fillStyle(0x2a8a4a, 1);
    lvBg.fillRoundedRect(avX - 22, avY + 22, 44, 18, 9);
    lvBg.lineStyle(1.5, CARTOON.hexGold, 1);
    lvBg.strokeRoundedRect(avX - 22, avY + 22, 44, 18, 9);
    this.add.text(avX, avY + 31, `Lv.${player.save.level}`, {
      fontFamily: DS.font.body, fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(avX + 52, avY - 18, player.save.nickname, {
      fontFamily: DS.font.display, fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.8)', strokeThickness: 3,
    });

    const powerBg = this.add.graphics();
    powerBg.fillStyle(0x0a2a4a, 0.8);
    powerBg.fillRoundedRect(avX + 52, avY + 10, 220, 34, 12);
    powerBg.fillStyle(CARTOON.hexGold, 0.18);
    powerBg.fillRect(avX + 52, avY + 10, 6, 34);
    powerBg.lineStyle(1, CARTOON.hexGold, 0.6);
    powerBg.strokeRoundedRect(avX + 52, avY + 10, 220, 34, 12);
    this.add.text(avX + 68, avY + 27, '✊', { fontSize: '20px' }).setOrigin(0, 0.5);
    this.add.text(avX + 96, avY + 27, this.calcPower(), {
      fontFamily: DS.font.display, fontSize: '26px', color: '#ffd76a', fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)', strokeThickness: 2,
    }).setOrigin(0, 0.5);

    const vipBg = this.add.graphics();
    vipBg.fillStyle(0xc09030, 1);
    vipBg.fillRoundedRect(GAME_WIDTH - 180, y + 14, 108, 36, 8);
    vipBg.fillStyle(CARTOON.hexGold, 1);
    vipBg.fillRoundedRect(GAME_WIDTH - 178, y + 16, 104, 32, 7);
    vipBg.lineStyle(2, 0xffffff, 0.5);
    vipBg.strokeRoundedRect(GAME_WIDTH - 178, y + 16, 104, 32, 7);
    this.add.text(GAME_WIDTH - 126, y + 32, 'VIP0', {
      fontFamily: DS.font.display, fontSize: '22px', color: '#7a4a0a', fontStyle: 'bold',
    }).setOrigin(0.5);
    const redDot = this.add.graphics();
    redDot.fillStyle(0xff4a4a, 1);
    redDot.fillCircle(GAME_WIDTH - 76, y + 18, 7);
    redDot.lineStyle(1.5, 0xffffff, 1);
    redDot.strokeCircle(GAME_WIDTH - 76, y + 18, 7);
  }

  // ===================== 顶部资源栏 =====================
  private drawTopResourceBar() {
    const player = usePlayerStore();
    const y = 130;
    const resources = [
      { glyph: '💎', value: player.save.gem, color: 0x5cb3ea },
      { glyph: '🪙', value: player.save.gold, color: CARTOON.hexGold },
    ];
    const totalW = GAME_WIDTH - 32;
    const cellW = totalW / resources.length - 4;
    resources.forEach((r, i) => {
      const x = 16 + i * (cellW + 8);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(x + 2, y + 4, cellW, 52, 26);
      g.fillStyle(0x1a5a98, 0.85);
      g.fillRoundedRect(x, y, cellW, 52, 26);
      g.fillStyle(r.color, 0.35);
      g.fillRoundedRect(x + 2, y + 2, cellW - 4, 48, 24);
      g.lineStyle(1.5, 0xffffff, 0.45);
      g.strokeRoundedRect(x + 2, y + 2, cellW - 4, 48, 24);
      g.fillStyle(0x0a2a4a, 0.7);
      g.fillCircle(x + 30, y + 26, 20);
      this.add.text(x + 30, y + 26, r.glyph, { fontSize: '22px' }).setOrigin(0.5);
      this.add.text(x + 56, y + 26, this.format(r.value), {
        fontFamily: DS.font.display, fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.5)', strokeThickness: 2,
      }).setOrigin(0, 0.5);
      const bx = x + cellW - 46;
      const bgBtn = this.add.graphics();
      bgBtn.fillStyle(0x3a8a3a, 1);
      bgBtn.fillRoundedRect(bx, y + 6, 36, 40, 18);
      bgBtn.lineStyle(1.5, 0xffffff, 0.5);
      bgBtn.strokeRoundedRect(bx, y + 6, 36, 40, 18);
      this.add.text(bx + 18, y + 26, '+', {
        fontFamily: DS.font.display, fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  // ===================== 内容区：横幅 + 英雄卡片 =====================
  private contentContainer: Phaser.GameObjects.Container | null = null;

  private drawContent() {
    if (this.contentContainer) {
      this.contentContainer.destroy();
    }
    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setDepth(10);

    // 稀有度分组（从高到低）
    const groups: { title: string; heroes: typeof HEROES; rarityKey: any }[] = [];
    const byRarity = new Map<string, typeof HEROES>();
    const ownedIds = new Set(useHeroStore().heroes.map(h => h.heroId));
    // 子 Tab 过滤：「英雄」= 只显示已拥有；「图鉴」= 全部
    const sourcePool = this.subTab === 'hero'
      ? HEROES.filter(h => ownedIds.has(h.id))
      : HEROES;
    sourcePool.forEach(h => {
      const k = h.rarity;
      if (!byRarity.has(k)) byRarity.set(k, [] as any);
      (byRarity.get(k) as any).push(h);
    });
    const rarityOrder = ['MRC', 'LR', 'UR', 'SSR', 'SR', 'R', 'N'];
    rarityOrder.forEach(r => {
      if (byRarity.has(r) && (byRarity.get(r) as any).length > 0) {
        groups.push({
          title: r === 'UR' ? '神话级英雄（S+）' :
                 r === 'SSR' ? '传说级英雄（S）' :
                 r === 'SR' ? '史诗级英雄（A）' :
                 r === 'R' ? '稀有级英雄（B）' :
                 r === 'LR' ? '限时英雄（LR）' :
                 r === 'MRC' ? '奇迹英雄' : '普通英雄',
          heroes: byRarity.get(r) as any,
          rarityKey: r,
        });
      }
    });

    let currentY = 200;

    groups.forEach(group => {
      // 过滤阵营
      let heroes = group.heroes;
      if (this.filter !== 'all') {
        heroes = heroes.filter(h => h.faction === this.filter);
      }
      if (heroes.length === 0) return;

      // 粉色横幅
      const banner = drawPinkBanner(this, GAME_WIDTH / 2, currentY, 340, group.title);
      this.contentContainer!.add(banner);
      currentY += 54;

      // 竖版华丽镜框卡片网格（每列5个）
      const cols = 5;
      const gapX = 4;
      const gapY = 12;
      const cellW = (GAME_WIDTH - 24 - (cols - 1) * gapX) / cols;
      const cellH = cellW * 1.82;

      heroes.forEach((hero, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 12 + col * (cellW + gapX) + cellW / 2;
        const y = currentY + row * (cellH + gapY) + cellH / 2;
        const owned = ownedIds.has(hero.id);

        // 生成头像纹理
        const portrait = getHeroPortrait(hero);
        const key = `hero_card_${hero.id}_${this.subTab}`;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);

        let rarity = (hero.rarity || 'SR') as any;
        if (rarity === 'UR' || rarity === 'LR' || rarity === 'MRC') rarity = 'SPLUS';

        const card = drawOrnateHeroCard(this, x, y, cellW, cellH, rarity, {
          owned, portraitKey: key, name: owned ? hero.name : undefined,
        });
        this.contentContainer!.add(card);

        const hit = this.add.rectangle(x, y, cellW, cellH, 0xffffff, 0).setInteractive();
        this.contentContainer!.add(hit);
        hit.on('pointerdown', () => {
          if (owned) {
            const inst = useHeroStore().heroes.find(h => h.heroId === hero.id);
            if (inst) {
              this.tweens.add({ targets: card, scaleX: 0.92, scaleY: 0.92, duration: 80, yoyo: true });
              this.scene.start('CodexScene', { heroUid: inst.uid });
            }
          }
        });
      });

      currentY += Math.ceil(heroes.length / cols) * (cellH + gapY) + 16;
    });
  }

  // ===================== 滚动处理 =====================
  private setupScroll() {
    const hit = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT - 360, 0xffffff, 0);
    hit.setDepth(15);
    hit.setInteractive();

    hit.on('pointerdown', (p: any) => {
      this.isDragging = true;
      this.dragStartY = p.y;
      this.dragStartScroll = this.contentScrollY;
    });
    hit.on('pointermove', (p: any) => {
      if (!this.isDragging) return;
      const dy = this.dragStartY - p.y;
      const maxScroll = Math.max(0, (this.contentContainer?.y || 0) + 400);
      this.contentScrollY = Phaser.Math.Clamp(this.dragStartScroll + dy, -400, maxScroll);
      if (this.contentContainer) this.contentContainer.y = -this.contentScrollY;
    });
    hit.on('pointerup', () => { this.isDragging = false; });
    hit.on('pointerupoutside', () => { this.isDragging = false; });
  }

  // ===================== 底部阵营筛选 =====================
  private drawFactionFilters() {
    const barY = GAME_HEIGHT - 330;
    const bg = this.add.graphics();
    bg.fillStyle(0x0e3a6a, 0.88);
    bg.fillRoundedRect(12, barY, GAME_WIDTH - 24, 72, 18);
    bg.fillStyle(0x286098, 0.6);
    bg.fillRoundedRect(14, barY + 2, GAME_WIDTH - 28, 68, 17);
    bg.lineStyle(1.5, 0xffffff, 0.35);
    bg.strokeRoundedRect(14, barY + 2, GAME_WIDTH - 28, 68, 17);

    const btnSize = 54;
    const totalIconW = btnSize * FACTION_LIST.length;
    const pad = (GAME_WIDTH - 28 - totalIconW - 80) / (FACTION_LIST.length + 1);

    FACTION_LIST.forEach((f, i) => {
      const cx = 28 + pad + i * (btnSize + pad);
      const cy = barY + 36;
      const isActive = this.filter === f.id;

      const g = this.add.graphics();
      if (isActive) {
        g.fillStyle(0xffe080, 0.3);
        g.fillCircle(cx, cy, btnSize / 2 + 4);
        g.lineStyle(3, 0xffd76a, 1);
      } else {
        g.lineStyle(2, 0xffffff, 0.6);
      }
      g.fillStyle(isActive ? 0xffd76a : (FACTION_COLORS[f.id] || 0x5a8ac0), isActive ? 0.9 : 0.8);
      g.fillCircle(cx, cy, btnSize / 2);
      g.strokeCircle(cx, cy, btnSize / 2);
      this.add.text(cx, cy, f.id === 'all' ? 'ALL' : f.glyph, {
        fontFamily: DS.font.display,
        fontSize: f.id === 'all' ? '20px' : '26px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,30,60,0.7)',
        strokeThickness: 2,
      }).setOrigin(0.5);

      const hit = this.add.rectangle(cx, cy, btnSize, btnSize, 0xffffff, 0).setInteractive();
      hit.on('pointerdown', () => {
        this.filter = f.id;
        this.drawContent();
      });
    });

    // 图鉴属性按钮
    const bx = GAME_WIDTH - 60;
    const by = barY + 36;
    const btn = this.add.graphics();
    btn.fillStyle(0xffffff, 0.95);
    btn.fillRoundedRect(bx - 28, by - 30, 56, 60, 12);
    btn.lineStyle(2, 0x5aa0d8, 1);
    btn.strokeRoundedRect(bx - 28, by - 30, 56, 60, 12);
    this.add.text(bx, by - 10, '📖', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(bx, by + 14, '图鉴属性', {
      fontFamily: DS.font.body, fontSize: '12px', color: '#1a5a98', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  // ===================== 英雄/图鉴 双Tab =====================
  private drawHeroCodexTabs() {
    const ty = GAME_HEIGHT - 240;
    const tw = GAME_WIDTH / 2 - 4;
    // 左侧英雄
    this.drawSubTab(16, ty, tw, 66, '英雄', this.subTab === 'hero', () => {
      this.subTab = 'hero';
      this.drawHeroCodexTabs();
      this.drawContent();
    });
    // 右侧图鉴（带红点提示可升级）
    this.drawSubTab(GAME_WIDTH / 2 - 8, ty, tw, 66, '图鉴', this.subTab === 'codex', () => {
      this.subTab = 'codex';
      this.drawHeroCodexTabs();
      this.drawContent();
    }, true);

    // 升级提示条（覆盖在底部）
    this.time.delayedCall(600, () => {
      const tipY = GAME_HEIGHT - 340;
      const tip = this.add.graphics();
      tip.fillStyle(0x5aa0d8, 0.85);
      tip.fillRoundedRect(20, tipY, GAME_WIDTH - 40, 96, 14);
      tip.fillStyle(0x9cd4f5, 0.5);
      tip.fillRoundedRect(22, tipY + 2, GAME_WIDTH - 44, 60, 12);
      tip.lineStyle(2, 0xffffff, 0.6);
      tip.strokeRoundedRect(22, tipY + 2, GAME_WIDTH - 44, 92, 13);

      // 小头像框
      tip.fillStyle(0xffffff, 1);
      tip.fillRoundedRect(GAME_WIDTH / 2 - 30, tipY + 10, 60, 60, 10);
      tip.lineStyle(3, 0xb06fe0, 1);
      tip.strokeRoundedRect(GAME_WIDTH / 2 - 30, tipY + 10, 60, 60, 10);
      tip.fillStyle(0xffcc80, 1);
      tip.fillCircle(GAME_WIDTH / 2, tipY + 40, 22);

      this.add.text(GAME_WIDTH / 2, tipY + 78, '以上英雄图鉴可升级', {
        fontFamily: DS.font.body, fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
        stroke: 'rgba(0,30,60,0.7)', strokeThickness: 2,
      }).setOrigin(0.5);

      // 关闭按钮
      const cx = this.add.graphics();
      cx.fillStyle(0xffffff, 1);
      cx.fillCircle(GAME_WIDTH - 40, tipY + 20, 16);
      cx.lineStyle(2, 0xff4a4a, 1);
      cx.strokeCircle(GAME_WIDTH - 40, tipY + 20, 16);
      this.add.text(GAME_WIDTH - 40, tipY + 20, '×', {
        fontFamily: DS.font.display, fontSize: '22px', color: '#ff4a4a', fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  private drawSubTab(x: number, y: number, w: number, h: number, label: string, active: boolean, onClick: () => void, badge?: boolean) {
    const g = this.add.graphics();
    if (active) {
      g.fillStyle(CARTOON.tabBlueLight, 0.95);
      g.fillRoundedRect(x, y - 8, w, h + 8, 16);
      g.fillStyle(0x50a868, 1);
      g.fillRoundedRect(x + w / 2 - 40, y + h - 8, 80, 16, 8);
      this.add.text(x + w / 2, y + h, '可升级', {
        fontFamily: DS.font.body, fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
    } else {
      g.fillStyle(0x0e2a4a, 0.9);
      g.fillRoundedRect(x, y, w, h, 16);
    }
    g.lineStyle(2, 0xffffff, active ? 0.7 : 0.25);
    g.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 14);

    this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: DS.font.display, fontSize: '26px',
      color: active ? '#ffd76a' : '#7aa0c0', fontStyle: 'bold',
      stroke: active ? 'rgba(0,30,60,0.6)' : 'rgba(0,0,0,0)',
      strokeThickness: active ? 2 : 0,
    }).setOrigin(0.5);

    if (badge) {
      const rd = this.add.graphics();
      rd.fillStyle(0xff4a4a, 1);
      rd.fillCircle(x + w - 20, y + 14, 8);
      rd.lineStyle(1.5, 0xffffff, 1);
      rd.strokeCircle(x + w - 20, y + 14, 8);
    }

    const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0).setInteractive();
    hit.on('pointerdown', () => {
      this.tweens.add({ targets: hit, scaleX: 0.95, scaleY: 0.95, duration: 60, yoyo: true });
      onClick();
      audio.playSfx?.('click');
    });
  }

  // ===================== 底部蓝色 Tab Bar =====================
  private drawBottomTabBar() {
    drawCartoonTabBar(this, [
      { name: '主城', glyph: '🏰', onClick: () => this.scene.start('MainScene'), active: false },
      { name: '野外', glyph: '🌀', onClick: () => this.scene.start('GachaScene'), active: false },
      { name: '联盟', glyph: '🛡️', onClick: () => this.scene.start('GuildScene'), active: false },
      { name: '冒险', glyph: '⚔️', onClick: () => this.scene.start('StageScene'), active: false },
      { name: '拯救狗狗', glyph: '🐶', onClick: () => this.scene.start('StageScene'), active: false },
      { name: '英雄', glyph: '🛡', onClick: () => {}, active: true },
      { name: '赛季', glyph: '🔒', onClick: () => {}, active: false, locked: true },
    ]);
  }

  // ===================== 辅助方法 =====================
  private format(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 10_000) return (n / 10_000).toFixed(1) + '万';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  }
  private calcPower() {
    const heroes = useHeroStore().heroes;
    let total = 0;
    heroes.forEach(h => {
      const base = HERO_MAP[h.heroId];
      if (!base) return;
      total += Math.floor(base.baseHp * (1 + h.level * 0.05) + base.baseAtk * (1 + h.level * 0.04));
    });
    return this.format(total);
  }
}
