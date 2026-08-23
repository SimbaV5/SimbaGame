import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  drawMainCityBackground,
  drawFloatingSideIcon,
  drawCartoonTabBar,
  setGameRefSize,
  drawStageFlag,
  drawStonePlatform,
  CARTOON,
  DS,
} from '../ui/designSystem';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

export class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);

    // 1. 主城/冒险风景画背景
    drawMainCityBackground(this, GAME_WIDTH, GAME_HEIGHT);

    // 2. 顶部玩家栏（头像+名字+战力+VIP）
    this.drawTopPlayerBar();

    // 3. 顶部资源栏（钻石+金币）
    this.drawTopResourceBar();

    // 4. 左侧浮动图标列
    this.drawLeftSideIcons();

    // 5. 右侧浮动图标列
    this.drawRightSideIcons();

    // 6. 中间关卡路径上的旗帜
    this.drawStageMarkers();

    // 7. 左下角Q版角色立绘
    this.drawChibiHero();

    // 8. 中央下方的"最新章节"大金按钮
    this.drawLatestChapterButton();

    // 9. 右下角快速挂机
    this.drawQuickIdleButton();

    // 10. 底部蓝色Tab Bar
    this.drawBottomTabBar();

    // 11. 弹出的任务提示气泡
    this.time.delayedCall(400, () => this.drawQuestBubble());
  }

  private drawTopPlayerBar() {
    const player = usePlayerStore();
    const y = 24;

    // 背景（半透明蓝色条）
    const g = this.add.graphics();
    g.fillStyle(0x1a5a98, 0.7);
    g.fillRoundedRect(16, y, GAME_WIDTH - 32, 92, 18);
    g.fillStyle(0x2a7fc8, 0.6);
    g.fillRoundedRect(18, y + 2, GAME_WIDTH - 36, 88, 17);
    g.fillStyle(0x2a7fc8, 0.4);
    g.fillRoundedRect(20, y + 4, GAME_WIDTH - 40, 40, 15);
    g.lineStyle(1.5, 0xffffff, 0.45);
    g.strokeRoundedRect(18, y + 2, GAME_WIDTH - 36, 88, 17);

    // 头像（圆形带金边）
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
    // 首字头像
    this.add.text(avX, avY + 2, player.save.nickname.slice(0, 1), {
      fontFamily: DS.font.display,
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    // 等级标签
    const lvBg = this.add.graphics();
    lvBg.fillStyle(0x2a8a4a, 1);
    lvBg.fillRoundedRect(avX - 22, avY + 22, 44, 18, 9);
    lvBg.lineStyle(1.5, CARTOON.hexGold, 1);
    lvBg.strokeRoundedRect(avX - 22, avY + 22, 44, 18, 9);
    this.add.text(avX, avY + 31, `Lv.${player.save.level}`, {
      fontFamily: DS.font.body,
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 玩家名字
    this.add.text(avX + 52, avY - 18, player.save.nickname, {
      fontFamily: DS.font.display,
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.8)',
      strokeThickness: 3,
    });

    // 战力
    const powerBg = this.add.graphics();
    powerBg.fillStyle(0x0a2a4a, 0.8);
    powerBg.fillRoundedRect(avX + 52, avY + 10, 220, 34, 12);
    powerBg.fillStyle(CARTOON.hexGold, 0.18);
    powerBg.fillRect(avX + 52, avY + 10, 6, 34);
    powerBg.lineStyle(1, CARTOON.hexGold, 0.6);
    powerBg.strokeRoundedRect(avX + 52, avY + 10, 220, 34, 12);
    this.add.text(avX + 68, avY + 27, '✊', { fontSize: '20px' }).setOrigin(0, 0.5);
    this.add.text(avX + 96, avY + 27, this.calcPower(), {
      fontFamily: DS.font.display,
      fontSize: '26px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // VIP标签
    const vipBg = this.add.graphics();
    vipBg.fillStyle(0xc09030, 1);
    vipBg.fillRoundedRect(GAME_WIDTH - 180, y + 14, 108, 36, 8);
    vipBg.fillStyle(CARTOON.hexGold, 1);
    vipBg.fillRoundedRect(GAME_WIDTH - 178, y + 16, 104, 32, 7);
    vipBg.fillStyle(0xfff0a0, 0.5);
    vipBg.fillRoundedRect(GAME_WIDTH - 176, y + 18, 100, 14, 6);
    vipBg.lineStyle(2, 0xffffff, 0.5);
    vipBg.strokeRoundedRect(GAME_WIDTH - 178, y + 16, 104, 32, 7);
    this.add.text(GAME_WIDTH - 126, y + 32, 'VIP0', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: '#7a4a0a',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    // VIP红点
    const redDot = this.add.graphics();
    redDot.fillStyle(0xff4a4a, 1);
    redDot.fillCircle(GAME_WIDTH - 76, y + 18, 7);
    redDot.lineStyle(1.5, 0xffffff, 1);
    redDot.strokeCircle(GAME_WIDTH - 76, y + 18, 7);
  }

  private drawTopResourceBar() {
    const player = usePlayerStore();
    const y = 130;
    const resources = [
      { glyph: '💎', value: player.save.gem, color: 0x5cb3ea, add: true },
      { glyph: '🪙', value: player.save.gold, color: CARTOON.hexGold, add: true },
    ];
    const totalW = GAME_WIDTH - 320;
    const cellW = totalW / resources.length;
    resources.forEach((r, i) => {
      const x = 160 + i * (cellW + 4);
      const g = this.add.graphics();
      // 阴影
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(x + 2, y + 4, cellW - 4, 52, 26);
      // 主体
      g.fillStyle(0x1a5a98, 0.85);
      g.fillRoundedRect(x, y, cellW - 4, 52, 26);
      g.fillStyle(r.color, 0.35);
      g.fillRoundedRect(x + 2, y + 2, cellW - 8, 48, 24);
      g.fillStyle(0xffffff, 0.25);
      g.fillRoundedRect(x + 4, y + 4, cellW - 12, 20, 22);
      g.lineStyle(1.5, 0xffffff, 0.45);
      g.strokeRoundedRect(x + 2, y + 2, cellW - 8, 48, 24);
      // 图标圆底
      g.fillStyle(0x0a2a4a, 0.7);
      g.fillCircle(x + 30, y + 26, 20);
      g.fillStyle(r.color, 0.3);
      g.fillCircle(x + 30, y + 26, 17);
      const icon = this.add.text(x + 30, y + 26, r.glyph, { fontSize: '22px' }).setOrigin(0.5);
      // 数值
      this.add.text(x + 56, y + 26, this.format(r.value), {
        fontFamily: DS.font.display,
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.5)',
        strokeThickness: 2,
      }).setOrigin(0, 0.5);
      // +按钮
      if (r.add) {
        const bx = x + cellW - 46;
        const bgBtn = this.add.graphics();
        bgBtn.fillStyle(0x3a8a3a, 1);
        bgBtn.fillRoundedRect(bx, y + 8, 36, 36, 18);
        bgBtn.fillStyle(0x5aba5a, 1);
        bgBtn.fillRoundedRect(bx + 1, y + 9, 34, 34, 17);
        bgBtn.fillStyle(0x9cff9c, 0.5);
        bgBtn.fillRoundedRect(bx + 2, y + 10, 32, 14, 16);
        bgBtn.lineStyle(1.5, 0xffffff, 0.5);
        bgBtn.strokeRoundedRect(bx + 1, y + 9, 34, 34, 17);
        const plus = this.add.text(bx + 18, y + 26, '+', {
          fontFamily: DS.font.display,
          fontSize: '28px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: 'rgba(0,60,0,0.6)',
          strokeThickness: 2,
        }).setOrigin(0.5);
        // 红点
        if (i === 1) {
          const rd = this.add.graphics();
          rd.fillStyle(0xff4a4a, 1);
          rd.fillCircle(bx + 34, y + 8, 6);
          rd.lineStyle(1, 0xffffff, 1);
          rd.strokeCircle(bx + 34, y + 8, 6);
        }
      }
    });
  }

  private drawLeftSideIcons() {
    const icons = [
      { glyph: '🎁', label: '福利', badge: true },
      { glyph: '📨', label: '邀请好礼', badge: true },
      { glyph: '🧰', label: '限时活', badge: true, sub: '' },
      { glyph: '⚒️', label: '英雄进阶', badge: true, sub: '礼包' },
      { glyph: '⚙️', label: '时光秘宝', badge: true },
      { glyph: '💎', label: '好友助力', badge: true },
    ];
    const startY = 250;
    icons.forEach((ic, i) => {
      drawFloatingSideIcon(
        this,
        22, startY + i * 122, 54,
        ic.glyph, ic.label,
        0x2a7fc8,
        () => audio.playSfx?.('click'),
        { badge: ic.badge, subLabel: ic.sub },
      );
    });
    // 折叠箭头
    const up = this.add.graphics();
    up.fillStyle(0x2a7fc8, 0.9);
    up.fillRoundedRect(34, 204, 44, 34, 12);
    up.lineStyle(1.5, 0xffffff, 0.55);
    up.strokeRoundedRect(34, 204, 44, 34, 12);
    this.add.text(56, 221, '⌃', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private drawRightSideIcons() {
    const icons = [
      { glyph: '🗺️', label: '世界地图', badge: false },
      { glyph: '🧭', label: '任务', badge: true },
      { glyph: '✉️', label: '邮件', badge: true },
      { glyph: '🎒', label: '背包', badge: false },
      { glyph: '💬', label: '游戏圈', badge: true },
      { glyph: '😸', label: '聊天', badge: true },
      { glyph: '⏳', label: '快速挂机', badge: false },
    ];
    const startY = 250;
    icons.forEach((ic, i) => {
      drawFloatingSideIcon(
        this,
        GAME_WIDTH - 96, startY + i * 116, 54,
        ic.glyph, ic.label,
        0x2a7fc8,
        () => audio.playSfx?.('click'),
        { badge: ic.badge },
      );
    });
    // 折叠箭头（朝上）
    const up = this.add.graphics();
    up.fillStyle(0x2a7fc8, 0.9);
    up.fillRoundedRect(GAME_WIDTH - 88, 204, 44, 34, 12);
    up.lineStyle(1.5, 0xffffff, 0.55);
    up.strokeRoundedRect(GAME_WIDTH - 88, 204, 44, 34, 12);
    this.add.text(GAME_WIDTH - 66, 221, '⌃', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private drawStageMarkers() {
    // 沿着小路放3个关卡旗帜
    const stagePts = [
      { x: GAME_WIDTH * 0.5, y: GAME_HEIGHT * 0.52, num: 13, stars: 2, cleared: false, current: false },
      { x: GAME_WIDTH * 0.54, y: GAME_HEIGHT * 0.66, num: 12, stars: 2, cleared: false, current: true },
      { x: GAME_WIDTH * 0.6, y: GAME_HEIGHT * 0.80, num: 11, stars: 3, cleared: false, current: false },
    ];
    stagePts.forEach(p => {
      drawStageFlag(this, p.x, p.y, p.num, {
        stars: p.stars, cleared: p.cleared, current: p.current,
      });
      if (p.current) {
        // 指引手指
        const hand = this.add.text(p.x + 54, p.y - 12, '👆', { fontSize: '44px' }).setOrigin(0.5);
        this.tweens.add({
          targets: hand, x: p.x + 48, y: p.y - 6,
          duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
    });
  }

  private drawChibiHero() {
    const hero = useHeroStore().heroes[0];
    if (!hero) return;
    const baseHero = HERO_MAP[hero.heroId];
    const key = 'chibi_main_' + hero.uid;
    if (!this.textures.exists(key)) {
      const p = getHeroPortrait(baseHero);
      this.textures.addCanvas(key, p);
    }
    // 立绘容器
    const cx = 110, cy = GAME_HEIGHT * 0.58;
    const sprite = this.add.image(cx, cy, key);
    sprite.setDisplaySize(280, 280);
    sprite.setAlpha(0).setScale(0.3);
    this.tweens.add({
      targets: sprite, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 600, ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: sprite, y: cy - 8,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    // 阴影
    const sh = this.add.graphics();
    sh.fillStyle(0x000000, 0.28);
    sh.fillEllipse(cx, cy + 130, 120, 22);
    // 名字气泡
    this.time.delayedCall(800, () => {
      const bb = this.add.graphics();
      const bw = 200, bh = 70;
      bb.fillStyle(0x0a2a4a, 0.9);
      bb.fillRoundedRect(cx + 110, cy - 110, bw, bh, 14);
      bb.fillStyle(0x5cb3ea, 0.2);
      bb.fillRect(cx + 110, cy - 110, 6, bh);
      bb.lineStyle(1.5, 0x5cb3ea, 0.8);
      bb.strokeRoundedRect(cx + 110, cy - 110, bw, bh, 14);
      // 小三角
      bb.fillStyle(0x0a2a4a, 0.9);
      bb.beginPath();
      bb.moveTo(cx + 110, cy - 90);
      bb.lineTo(cx + 96, cy - 82);
      bb.lineTo(cx + 110, cy - 74);
      bb.closePath(); bb.fillPath();
      this.add.text(cx + 124, cy - 88, `月常任务开启，完成所有任务即可\n获得S+英雄`, {
        fontFamily: DS.font.body,
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.6)',
        strokeThickness: 2,
      });
    });
  }

  private drawLatestChapterButton() {
    // 金币堆+大按钮
    const bx = GAME_WIDTH / 2;
    const by = GAME_HEIGHT - 290;

    // 金币堆（怪物+金币+宝石）
    const pileG = this.add.graphics();
    // 阴影
    pileG.fillStyle(0x000000, 0.3);
    pileG.fillEllipse(bx + 4, by + 64, 280, 28);
    // 宝石（蓝色）
    const gems = [
      { x: bx - 90, y: by + 30, s: 1 }, { x: bx - 40, y: by + 50, s: 0.7 },
      { x: bx + 20, y: by + 40, s: 0.9 }, { x: bx + 70, y: by + 56, s: 0.6 },
    ];
    gems.forEach(ge => {
      pileG.fillStyle(0x2f7eb5, 1);
      pileG.beginPath();
      pileG.moveTo(ge.x, ge.y - 14 * ge.s);
      pileG.lineTo(ge.x + 12 * ge.s, ge.y);
      pileG.lineTo(ge.x, ge.y + 14 * ge.s);
      pileG.lineTo(ge.x - 12 * ge.s, ge.y);
      pileG.closePath(); pileG.fillPath();
      pileG.fillStyle(0x5cb3ea, 1);
      pileG.beginPath();
      pileG.moveTo(ge.x - 4, ge.y - 10 * ge.s);
      pileG.lineTo(ge.x + 6 * ge.s, ge.y - 2);
      pileG.lineTo(ge.x - 2, ge.y);
      pileG.closePath(); pileG.fillPath();
    });
    // 金币（多圈）
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * Math.PI * 2;
      const rad = 100 + (i % 3) * 12;
      const gx = bx + Math.cos(ang) * rad;
      const gy = by + 30 + Math.sin(ang) * 20 + (i % 4) * 6;
      pileG.fillStyle(0x000000, 0.25);
      pileG.fillCircle(gx + 2, gy + 2, 16);
      pileG.fillStyle(0xc09030, 1);
      pileG.fillCircle(gx, gy, 16);
      pileG.fillStyle(CARTOON.hexGold, 1);
      pileG.fillCircle(gx - 1, gy - 1, 14);
      pileG.fillStyle(0xfff0a0, 0.7);
      pileG.fillCircle(gx - 4, gy - 4, 6);
      pileG.lineStyle(1, 0xffffff, 0.4);
      pileG.strokeCircle(gx - 1, gy - 1, 14);
      pileG.fillStyle(0x8a5a20, 1);
      pileG.fillRect(gx - 5, gy - 2, 10, 4);
    }
    // 红色大怪物（睡在金币堆上）
    const monster = this.add.graphics();
    // 身体
    monster.fillStyle(0x000000, 0.25);
    monster.fillEllipse(bx + 4, by - 2, 160, 60);
    monster.fillStyle(0xa02020, 1);
    monster.fillEllipse(bx, by - 10, 150, 60);
    monster.fillStyle(0xc03030, 1);
    monster.fillEllipse(bx - 10, by - 20, 130, 46);
    monster.fillStyle(0xf8e8d8, 1);
    monster.fillEllipse(bx - 30, by - 20, 90, 34);
    // 背部火刺
    const spikes = [
      { x: bx - 80, y: by - 40 }, { x: bx - 50, y: by - 50 }, { x: bx - 20, y: by - 54 },
      { x: bx + 10, y: by - 50 }, { x: bx + 36, y: by - 44 }, { x: bx + 60, y: by - 36 },
    ];
    spikes.forEach(s => {
      monster.fillStyle(0xe04020, 1);
      monster.beginPath();
      monster.moveTo(s.x - 10, s.y + 10);
      monster.lineTo(s.x, s.y - 16);
      monster.lineTo(s.x + 10, s.y + 10);
      monster.closePath(); monster.fillPath();
      monster.fillStyle(0xff6030, 1);
      monster.beginPath();
      monster.moveTo(s.x - 6, s.y + 8);
      monster.lineTo(s.x - 2, s.y - 10);
      monster.lineTo(s.x + 2, s.y + 6);
      monster.closePath(); monster.fillPath();
    });
    // 肚子
    monster.fillStyle(0xffffff, 0.2);
    monster.fillEllipse(bx - 30, by, 60, 20);
    // ZZZ（睡觉）
    for (let i = 0; i < 3; i++) {
      this.add.text(bx + 60 + i * 16, by - 80 - i * 14, 'Z', {
        fontFamily: DS.font.display,
        fontSize: `${22 - i * 4}px`,
        color: '#5cb3ea',
        fontStyle: 'bold',
      }).setAlpha(0.9 - i * 0.25);
    }

    // "最新章节"大金按钮
    const btnW = 280, btnH = 92;
    const btnX = bx, btnY = by + 60;
    const btn = this.add.container(btnX, btnY);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(-btnW / 2 + 4, 6, btnW, btnH, 22);
    bg.fillStyle(0x8a5a20, 1);
    bg.fillRoundedRect(-btnW / 2, 2, btnW, btnH, 22);
    bg.fillStyle(0xc09030, 1);
    bg.fillRoundedRect(-btnW / 2, 0, btnW, btnH, 22);
    bg.fillStyle(CARTOON.hexGold, 1);
    bg.fillRoundedRect(-btnW / 2 + 3, 3, btnW - 6, btnH - 6, 20);
    bg.fillStyle(0xfff0a0, 0.55);
    bg.fillRoundedRect(-btnW / 2 + 5, 5, btnW - 10, btnH * 0.45, 18);
    bg.lineStyle(3, 0xffffff, 0.55);
    bg.strokeRoundedRect(-btnW / 2 + 3, 3, btnW - 6, btnH - 6, 20);
    // 边角装饰
    const corners = [[-btnW / 2 + 12, 12], [btnW / 2 - 12, 12], [-btnW / 2 + 12, btnH - 12], [btnW / 2 - 12, btnH - 12]];
    corners.forEach(([cx, cy]) => {
      bg.fillStyle(0xfff0a0, 0.8);
      bg.fillCircle(cx, cy, 5);
    });
    btn.add(bg);

    const label = this.add.text(0, btnH / 2, '最新章节', {
      fontFamily: DS.font.display,
      fontSize: '40px',
      color: '#7a4010',
      fontStyle: 'bold',
      stroke: '#fff0a0',
      strokeThickness: 2,
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(btnW, btnH);
    btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, 0, btnW, btnH), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', () => {
      this.tweens.add({ targets: btn, scaleX: 0.94, scaleY: 0.94, duration: 60, yoyo: true });
      this.scene.start('StageScene');
      audio.playSfx?.('click');
    });
    this.tweens.add({
      targets: btn, scaleX: 1.03, scaleY: 1.03,
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // 按钮上方悬浮章节进度
    const prog = this.add.graphics();
    prog.fillStyle(0x0a2a4a, 0.7);
    prog.fillRoundedRect(btnX - 60, by - 20, 120, 28, 14);
    prog.lineStyle(1, CARTOON.hexGold, 0.6);
    prog.strokeRoundedRect(btnX - 60, by - 20, 120, 28, 14);
    // 星
    this.add.text(btnX - 36, by - 6, '★★☆', {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: '#ffd76a',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private drawQuickIdleButton() {
    const bx = GAME_WIDTH - 96;
    const by = GAME_HEIGHT - 300;
    // 金币堆小
    const pile = this.add.graphics();
    pile.fillStyle(0x000000, 0.28);
    pile.fillEllipse(bx + 3, by + 3, 90, 18);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const gx = bx + Math.cos(ang) * 32;
      const gy = by + Math.sin(ang) * 8 + (i % 3) * 4;
      pile.fillStyle(0xc09030, 1);
      pile.fillCircle(gx, gy, 12);
      pile.fillStyle(CARTOON.hexGold, 1);
      pile.fillCircle(gx - 1, gy - 1, 10);
      pile.fillStyle(0xfff0a0, 0.7);
      pile.fillCircle(gx - 3, gy - 3, 4);
    }
    // 宝石
    pile.fillStyle(0x2f7eb5, 1);
    pile.beginPath();
    pile.moveTo(bx - 20, by - 8);
    pile.lineTo(bx - 10, by - 16);
    pile.lineTo(bx, by - 8);
    pile.lineTo(bx - 10, by);
    pile.closePath(); pile.fillPath();
    pile.fillStyle(0x5cb3ea, 1);
    pile.beginPath();
    pile.moveTo(bx - 17, by - 10);
    pile.lineTo(bx - 12, by - 13);
    pile.lineTo(bx - 14, by - 8);
    pile.closePath(); pile.fillPath();
    // 红点
    const rd = this.add.graphics();
    rd.fillStyle(0xff4a4a, 1);
    rd.fillCircle(bx + 56, by - 10, 8);
    rd.lineStyle(1.5, 0xffffff, 1);
    rd.strokeCircle(bx + 56, by - 10, 8);
    // 倒计时条
    const cdownBg = this.add.graphics();
    cdownBg.fillStyle(0x0a2a4a, 0.92);
    cdownBg.fillRoundedRect(bx - 50, by + 14, 130, 38, 14);
    cdownBg.fillStyle(CARTOON.hexGold, 0.2);
    cdownBg.fillRect(bx - 50, by + 14, 6, 38);
    cdownBg.lineStyle(1.5, CARTOON.hexGold, 0.8);
    cdownBg.strokeRoundedRect(bx - 50, by + 14, 130, 38, 14);
    this.add.text(bx + 15, by + 33, '18:00:00', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: '#ffd76a',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private drawQuestBubble() {
    return; // 已在角色气泡里画
  }

  private drawBottomTabBar() {
    drawCartoonTabBar(this, [
      { name: '主城', glyph: '🏰', onClick: () => {}, active: true },
      { name: '野外', glyph: '🌀', onClick: () => this.scene.start('GachaScene'), active: false },
      { name: '联盟', glyph: '🛡️', onClick: () => this.scene.start('GuildScene'), active: false },
      { name: '冒险', glyph: '⚔️', onClick: () => this.scene.start('StageScene'), active: false },
      { name: '拯救狗狗', glyph: '🐶', onClick: () => this.scene.start('StageScene'), active: false },
      { name: '英雄', glyph: '🛡', onClick: () => this.scene.start('HeroScene'), active: false },
      { name: '赛季', glyph: '🔒', onClick: () => {}, active: false, locked: true },
    ]);

    // 左下角英雄进度槽
    const slotBg = this.add.graphics();
    slotBg.fillStyle(0x0a0a18, 0.95);
    slotBg.fillRoundedRect(16, GAME_HEIGHT - 196, 124, 96, 14);
    slotBg.lineStyle(2, CARTOON.hexGold, 0.8);
    slotBg.strokeRoundedRect(16, GAME_HEIGHT - 196, 124, 96, 14);
    const hero = useHeroStore().heroes[0];
    if (hero) {
      const baseHero = HERO_MAP[hero.heroId];
      const key = 'slot_hero_' + hero.uid;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, getHeroPortrait(baseHero));
      const sp = this.add.image(78, GAME_HEIGHT - 164, key);
      sp.setDisplaySize(70, 70);
    }
    this.add.text(78, GAME_HEIGHT - 116, '0/6', {
      fontFamily: DS.font.display,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.6)',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private format(n: number): string {
    if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  private calcPower(): string {
    const heroes = useHeroStore().heroes;
    let total = 0;
    heroes.forEach(slot => {
      const b = HERO_MAP[slot.heroId];
      if (b) total += (b.baseAtk + slot.level * 10) * (1 + slot.star * 0.4 + slot.awaken * 0.5);
    });
    if (total === 0) total = 77948;
    return this.format(Math.floor(total));
  }
}

// 临时 audio stub（如果未导出则忽略）
const _audioStub = audio || { playSfx: () => {} };
