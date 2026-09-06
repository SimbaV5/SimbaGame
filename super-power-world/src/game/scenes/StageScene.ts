import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  drawGrasslandMap,
  drawWindingRoad,
  drawRiver,
  drawWoodBridge,
  drawPineTree,
  drawRoundTree,
  drawRock,
  drawStageFlag,
  drawCartoonTabBar,
  setGameRefSize,
  CARTOON,
  DS,
} from '../ui/designSystem';
import { HERO_MAP } from '@/data/heroes';
import { useHeroStore } from '@/stores/heroStore';
import { getHeroPortrait } from '@/core/assetGen';
import { STAGES, STAGE_MAP } from '@/data/stages';
import { usePlayerStore } from '@/stores/playerStore';
import { useBattleStore } from '@/stores/battleStore';

export class StageScene extends Phaser.Scene {
  private currentStage = 2; // 当前是第2关
  private currentChapter = 1;
  private chapterLocked = [false, true, true, true, true];

  constructor() { super('StageScene'); }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);

    // 地图总高度（比屏幕高，做滚动）
    const MAP_H = 1800;

    // 1. 天空+草地背景（填满地图）
    this.drawScrollingBackground(MAP_H);

    // 2. 河流（左上蜿蜒向下）
    drawRiver(this, GAME_WIDTH * 0.12, 160, GAME_WIDTH * 0.88, MAP_H - 200);

    // 3. 木桥（跨河点）
    drawWoodBridge(this, GAME_WIDTH * 0.48, MAP_H - 760, 180);

    // 4. 弯曲道路（S形，返回路径点放关卡）
    const { points } = drawWindingRoad(this, GAME_WIDTH, MAP_H);

    // 5. 环境：两旁的树和石头
    this.drawEnvironmentDecor(MAP_H);

    // 6. 关卡旗帜（1~12，按路径点分布）
    this.placeStageFlags(points, MAP_H);

    // 7. 章节解锁提示标签
    this.drawUnlockTags();

    // 8. 蓝色顶部横幅"拯救狗狗"
    this.drawChapterBanner();

    // 9. 左上角反馈按钮
    this.drawFeedbackButton();

    // 10. 左下角Q版角色+对话气泡
    this.drawChibiWithBubble(MAP_H);

    // 11. 顶部关卡解锁显示 12 和"2-3解锁"
    this.drawTopLevelTags(MAP_H);

    // 12. 设置相机滚动（聚焦在当前关卡附近）
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, MAP_H);
    const startCamY = Math.max(0, MAP_H - GAME_HEIGHT - 100);
    this.cameras.main.setScroll(0, startCamY);

    // 支持上下拖动
    let isDown = false, startY = 0, scrollStart = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y < GAME_HEIGHT - 120) { isDown = true; startY = p.y; scrollStart = this.cameras.main.scrollY; }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!isDown) return;
      const dy = startY - p.y;
      const ny = Phaser.Math.Clamp(scrollStart + dy, 0, MAP_H - GAME_HEIGHT);
      this.cameras.main.setScroll(0, ny);
    });
    this.input.on('pointerup', () => { isDown = false; });

    // 13. 固定UI（不随相机滚）：底部Tab Bar + 章节选择Tab
    this.drawFixedBottomUI(MAP_H);
  }

  private drawScrollingBackground(mapH: number) {
    const g = this.add.graphics();

    // 天空（分层模拟渐变，避免 fillGradientStyle 兼容问题）
    const skyLayers = 12;
    const skyH = mapH * 0.3;
    for (let i = 0; i < skyLayers; i++) {
      const t = i / skyLayers;
      const r = Math.floor(0x8f + (0xd8 - 0x8f) * t);
      const gc = Math.floor(0xd4 + (0xf0 - 0xd4) * t);
      const b = Math.floor(0xff + (0xff - 0xff) * t);
      const col = (r << 16) | (gc << 8) | b;
      g.fillStyle(col, 1);
      g.fillRect(0, (skyH / skyLayers) * i, GAME_WIDTH, (skyH / skyLayers) + 1);
    }

    // 太阳光晕
    const sunX = GAME_WIDTH - 130, sunY = 120;
    for (let i = 6; i > 0; i--) {
      g.fillStyle(0xffe9a0, 0.08);
      g.fillCircle(sunX, sunY, 36 + i * 16);
    }
    g.fillStyle(0xfff6c8, 1);
    g.fillCircle(sunX, sunY, 40);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(sunX - 8, sunY - 8, 12);

    // 远山（每段重复，分层颜色）
    for (let seg = 0; seg < 3; seg++) {
      const baseY = mapH * 0.18 + seg * (mapH * 0.3);
      for (let layer = 0; layer < 3; layer++) {
        const col = [0x9ccce8, 0x8ac0d8, 0x78b4c8][layer];
        g.fillStyle(col, 0.85 - layer * 0.15);
        g.beginPath();
        g.moveTo(0, baseY + 60 + layer * 20);
        for (let i = 0; i <= 8; i++) {
          const px = (GAME_WIDTH / 8) * i;
          const py = baseY - Math.sin(i * 1.2 + layer + seg) * (36 - layer * 8) - (i % 2) * 22;
          g.lineTo(px, py);
        }
        g.lineTo(GAME_WIDTH, baseY + 80);
        g.closePath();
        g.fillPath();
      }
    }

    // 草地（分层渐变，下半部分）
    const grassStart = mapH * 0.25;
    const grassEnd = mapH;
    const grassLayers = 14;
    for (let i = 0; i < grassLayers; i++) {
      const t = i / grassLayers;
      const r = Math.floor(0x7a + (0x3f - 0x7a) * t);
      const gc = Math.floor(0xc9 + (0x8a - 0xc9) * t);
      const b = Math.floor(0x4a + (0x25 - 0x4a) * t);
      const col = (r << 16) | (gc << 8) | b;
      g.fillStyle(col, 1);
      const y0 = grassStart + ((grassEnd - grassStart) / grassLayers) * i;
      g.fillRect(0, y0, GAME_WIDTH, ((grassEnd - grassStart) / grassLayers) + 1);
    }

    // 草地斑块（亮色+暗色点缀）
    for (let i = 0; i < 80; i++) {
      const px = Math.random() * GAME_WIDTH;
      const py = mapH * 0.28 + Math.random() * mapH * 0.7;
      const pr = 24 + Math.random() * 80;
      g.fillStyle(Math.random() > 0.5 ? 0x5aad32 : 0x7ac94a, 0.35);
      g.fillEllipse(px, py, pr, pr * 0.55);
    }

    // 小装饰（小白花/彩点）
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = mapH * 0.32 + Math.random() * mapH * 0.65;
      const col = [0xffffff, 0xfff0a0, 0xff8aa0, 0xb0e8ff][Math.floor(Math.random() * 4)];
      g.fillStyle(col, 1);
      g.fillCircle(x, y, 3);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x - 1, y - 1, 1);
    }

    g.setScrollFactor(1);
  }

  private drawEnvironmentDecor(mapH: number) {
    // 随机撒树和石头
    const leftXs = [40, 70, 100, 50, 80, 130, 90];
    const rightXs = [GAME_WIDTH - 40, GAME_WIDTH - 70, GAME_WIDTH - 100, GAME_WIDTH - 50, GAME_WIDTH - 130, GAME_WIDTH - 90];
    for (let i = 0; i < 10; i++) {
      const y = 240 + i * (mapH / 12) + Math.random() * 60;
      const lx = leftXs[i % leftXs.length] + (Math.random() - 0.5) * 30;
      const rx = rightXs[i % rightXs.length] + (Math.random() - 0.5) * 30;
      if (i % 2 === 0) drawPineTree(this, lx, y, 0.8 + Math.random() * 0.4);
      else drawRoundTree(this, lx, y, 0.8 + Math.random() * 0.4);
      drawRoundTree(this, rx, y, 0.85 + Math.random() * 0.35);
      if (i % 3 === 0) drawRock(this, lx + 40, y + 10, 0.7 + Math.random() * 0.6);
      if (i % 2 === 0) drawRock(this, rx - 40, y - 5, 0.8 + Math.random() * 0.5);
    }
    // 额外的小蘑菇/花（简单用圆）
    const decor = this.add.graphics();
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = mapH * 0.32 + Math.random() * mapH * 0.65;
      const col = [0xffffff, 0xfff0a0, 0xff8aa0, 0xb0e8ff][Math.floor(Math.random() * 4)];
      decor.fillStyle(col, 1);
      decor.fillCircle(x, y, 3);
      decor.fillStyle(0xffffff, 0.8);
      decor.fillCircle(x - 1, y - 1, 1);
    }
    decor.setScrollFactor(1);
  }

  private placeStageFlags(roadPts: { x: number; y: number }[], mapH: number) {
    // 取12个点沿路放关卡旗帜（从下往上：1->12）
    const picked: { x: number; y: number }[] = [];
    const targetN = 12;
    for (let i = 0; i < targetN; i++) {
      const idx = Math.floor(roadPts.length - 2 - i * ((roadPts.length - 4) / targetN));
      const p = roadPts[Math.max(0, idx)];
      // 稍微偏离路中间让旗帜立在路旁
      picked.push({ x: p.x + (i % 2 === 0 ? -10 : 14), y: p.y - 30 });
    }
    // 当前通关
    const current = this.currentStage;
    picked.forEach((p, i) => {
      const stageNum = i + 1;
      const isLocked = stageNum > current;
      const isCleared = stageNum < current;
      const isCurrent = stageNum === current;
      const stars = isCleared ? (stageNum % 3 === 0 ? 3 : stageNum % 2 === 0 ? 2 : 3) : 0;
      drawStageFlag(this, p.x, p.y, stageNum, {
        locked: isLocked, cleared: isCleared, current: isCurrent, stars,
      }).setScrollFactor(1);

      // 透明命中矩形（覆盖旗子视觉区域）
      const hit = this.add.rectangle(p.x, p.y - 10, 80, 90, 0xffffff, 0)
        .setScrollFactor(1)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => {
        if (!isLocked) this.input.setDefaultCursor('pointer');
      });
      hit.on('pointerout', () => this.input.setDefaultCursor('default'));
      hit.on('pointerdown', () => {
        if (isLocked) {
          this.showToast(`第 ${stageNum} 关尚未解锁`);
          audio.playSfx?.('deny');
          return;
        }
        audio.playSfx?.('stage_start');
        this.startStage(stageNum);
      });

      if (isCurrent) {
        // 手指指引
        const hand = this.add.text(p.x + 60, p.y - 20, '👆', { fontSize: '52px' }).setOrigin(0.5).setScrollFactor(1);
        this.tweens.add({
          targets: hand, x: p.x + 52, y: p.y - 10,
          duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
    });
  }

  private startStage(stageNum: number) {
    const player = usePlayerStore();
    const battle = useBattleStore();
    // 关卡 1-12 对应章节 1 的第 stageNum 个关卡（即 STAGES 数组的 stageNum-1 索引）
    const stage = STAGES[stageNum - 1];
    if (!stage) {
      this.showToast('关卡数据缺失');
      return;
    }
    if (player.save.formation.slots.filter(Boolean).length === 0) {
      this.showToast('请先到「英雄」界面编队');
      audio.playSfx?.('deny');
      return;
    }
    battle.init(stage, player.save.formation.slots);
    this.scene.start('BattleScene');
  }

  private showToast(text: string) {
    const bg = this.add.graphics();
    const w = Math.min(GAME_WIDTH - 40, text.length * 22 + 36);
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.lineStyle(2, 0xffd76a, 0.85);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.setDepth(200).setScrollFactor(0);
    const t = this.add.text(GAME_WIDTH / 2, 82, text, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.8)',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
    this.time.delayedCall(1500, () => { bg.destroy(); t.destroy(); audio.playSfx?.('toast'); });
  }

  private drawUnlockTags() {
    const tags = [
      { x: GAME_WIDTH * 0.46, y: 1640, label: '1-2解锁' },
      { x: GAME_WIDTH * 0.68, y: 1200, label: '1-5解锁' },
      { x: GAME_WIDTH * 0.52, y: 260, label: '2-3解锁' },
    ];
    tags.forEach(t => {
      const g = this.add.graphics();
      g.fillStyle(0x0a0a18, 0.88);
      g.fillRoundedRect(t.x - 60, t.y - 18, 120, 36, 10);
      g.lineStyle(1.5, 0xffffff, 0.45);
      g.strokeRoundedRect(t.x - 60, t.y - 18, 120, 36, 10);
      this.add.text(t.x, t.y, t.label, {
        fontFamily: DS.font.body,
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(1);
      g.setScrollFactor(1);
    });
  }

  private drawChapterBanner() {
    // 蓝色飘带形横幅"拯救狗狗"
    const y = 90, w = 460;
    const x = GAME_WIDTH / 2;
    const g = this.add.graphics();
    g.setScrollFactor(0);
    // 阴影
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(x - w / 2 + 4, y + 6, w, 70, 12);
    // 深色底
    g.fillStyle(CARTOON.bannerBlueDark, 1);
    const tails = 18;
    g.beginPath();
    g.moveTo(x - w / 2, y);
    g.lineTo(x + w / 2, y);
    g.lineTo(x + w / 2 - tails, y + 35);
    g.lineTo(x + w / 2, y + 70);
    g.lineTo(x - w / 2, y + 70);
    g.lineTo(x - w / 2 + tails, y + 35);
    g.closePath();
    g.fillPath();
    // 主色
    g.fillStyle(CARTOON.bannerBlue, 1);
    g.beginPath();
    g.moveTo(x - w / 2 + 4, y + 4);
    g.lineTo(x + w / 2 - 4, y + 4);
    g.lineTo(x + w / 2 - tails - 2, y + 35);
    g.lineTo(x + w / 2 - 4, y + 66);
    g.lineTo(x - w / 2 + 4, y + 66);
    g.lineTo(x - w / 2 + tails + 2, y + 35);
    g.closePath();
    g.fillPath();
    // 高光
    g.fillStyle(0xffffff, 0.25);
    g.beginPath();
    g.moveTo(x - w / 2 + 6, y + 6);
    g.lineTo(x + w / 2 - 6, y + 6);
    g.lineTo(x + w / 2 - tails - 4, y + 35);
    g.lineTo(x - w / 2 + tails + 4, y + 35);
    g.closePath();
    g.fillPath();
    // 边缘描边
    g.lineStyle(2, 0xffffff, 0.55);
    g.beginPath();
    g.moveTo(x - w / 2 + 4, y + 4);
    g.lineTo(x + w / 2 - 4, y + 4);
    g.lineTo(x + w / 2 - tails - 2, y + 35);
    g.lineTo(x + w / 2 - 4, y + 66);
    g.lineTo(x - w / 2 + 4, y + 66);
    g.lineTo(x - w / 2 + tails + 2, y + 35);
    g.closePath();
    g.strokePath();

    this.add.text(x, y + 35, '拯救狗狗', {
      fontFamily: DS.font.display,
      fontSize: '38px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#10305a',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0);
  }

  private drawFeedbackButton() {
    const g = this.add.graphics();
    g.setScrollFactor(0);
    g.fillStyle(0x1a5a98, 0.9);
    g.fillRoundedRect(16, 26, 70, 58, 14);
    g.lineStyle(1.5, 0xffffff, 0.5);
    g.strokeRoundedRect(16, 26, 70, 58, 14);
    this.add.text(51, 44, '❗', { fontSize: '26px' }).setOrigin(0.5).setScrollFactor(0);
    this.add.text(51, 70, '反馈', {
      fontFamily: DS.font.body,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0);
  }

  private drawChibiWithBubble(mapH: number) {
    const hero = useHeroStore().heroes[0];
    const cx = 110;
    const cy = mapH - 240;
    if (hero) {
      const baseHero = HERO_MAP[hero.heroId];
      const key = 'stage_chibi_' + hero.uid;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, getHeroPortrait(baseHero));
      const sp = this.add.image(cx, cy, key).setDisplaySize(300, 300).setScrollFactor(1);
      this.tweens.add({
        targets: sp, y: cy - 10, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      // 阴影
      this.add.graphics().fillStyle(0x000000, 0.28).fillEllipse(cx, cy + 140, 130, 24).setScrollFactor(1);
    }
    // 气泡
    const bb = this.add.graphics();
    bb.setScrollFactor(1);
    const bw = 500, bh = 110;
    const bx = cx + 80, by = cy - 140;
    bb.fillStyle(0xffffff, 1);
    bb.fillRoundedRect(bx, by, bw, bh, 26);
    bb.lineStyle(2, 0x3a8ada, 0.9);
    bb.strokeRoundedRect(bx, by, bw, bh, 26);
    bb.fillStyle(0xffffff, 1);
    bb.beginPath();
    bb.moveTo(bx + 20, by + bh);
    bb.lineTo(bx + 4, by + bh + 28);
    bb.lineTo(bx + 60, by + bh);
    bb.closePath(); bb.fillPath();
    bb.lineStyle(2, 0x3a8ada, 0.9);
    bb.beginPath();
    bb.moveTo(bx + 20, by + bh);
    bb.lineTo(bx + 4, by + bh + 28);
    bb.lineTo(bx + 60, by + bh);
    bb.strokePath();
    this.add.text(bx + 24, by + 24, '【拯救狗狗】并不简单，旅行者大人快\n帮帮奥迪那破解谜题吧', {
      fontFamily: DS.font.body,
      fontSize: '22px',
      color: '#1a4a8a',
      fontStyle: 'bold',
      lineSpacing: 8,
    }).setScrollFactor(1);
  }

  private drawTopLevelTags(mapH: number) {
    // 最顶部关卡 12 和解锁提示
    // 关卡 12 已经被旗子绘制，这里加"皇冠"顶部标签
    // "2-3解锁"在 drawUnlockTags 中已经画了
  }

  private drawFixedBottomUI(mapH: number) {
    // 章节Tab（苍翠草原/碧蓝海湾/边塞裂谷/极地雪原...）
    const tabs = [
      { name: '苍翠草原', glyph: '🌿', active: true, locked: false },
      { name: '碧蓝海湾', glyph: '🔒', active: false, locked: true },
      { name: '边塞裂谷', glyph: '🔒', active: false, locked: true },
      { name: '极地雪原', glyph: '🔒', active: false, locked: true },
      { name: '寂...', glyph: '🔒', active: false, locked: true },
    ];
    // 章节Tab背景
    const g = this.add.graphics();
    g.setScrollFactor(0);
    // 用三层填充模拟渐变（tabBlue → tabBlueDark）
    const tabY = GAME_HEIGHT - 220;
    const tabH = 108;
    const tabLayers = 4;
    for (let i = 0; i < tabLayers; i++) {
      // tabBlue = '#2a6faa' (int 0x2a6faa), tabBlueDark = '#10304a' (int 0x10304a)
      const t = i / tabLayers;
      const r1 = (0x2a6faa >> 16) & 0xff;
      const g1 = (0x2a6faa >> 8) & 0xff;
      const b1 = 0x2a6faa & 0xff;
      const r2 = (0x10304a >> 16) & 0xff;
      const g2 = (0x10304a >> 8) & 0xff;
      const b2 = 0x10304a & 0xff;
      const cr = Math.floor(r1 + (r2 - r1) * t);
      const cg = Math.floor(g1 + (g2 - g1) * t);
      const cb = Math.floor(b1 + (b2 - b1) * t);
      g.fillStyle((cr << 16) | (cg << 8) | cb, 1);
      g.fillRect(0, tabY + (tabH / tabLayers) * i, GAME_WIDTH, (tabH / tabLayers) + 1);
    }
    g.fillStyle(CARTOON.tabBlueLight, 0.6);
    g.fillRect(0, GAME_HEIGHT - 220, GAME_WIDTH, 3);

    const tabsW = GAME_WIDTH / tabs.length;
    tabs.forEach((t, i) => {
      const cx = i * tabsW + tabsW / 2;
      const cy = GAME_HEIGHT - 220 + 54;
      if (t.active) {
        const ag = this.add.graphics().setScrollFactor(0);
        ag.fillStyle(CARTOON.tabBlueLight, 0.35);
        ag.fillRoundedRect(i * tabsW + 4, GAME_HEIGHT - 214, tabsW - 8, 96, 16);
        ag.lineStyle(2, 0x9cdcff, 0.85);
        ag.strokeRoundedRect(i * tabsW + 4, GAME_HEIGHT - 214, tabsW - 8, 96, 16);
        ag.fillStyle(CARTOON.hexGold, 1);
        ag.fillRect(i * tabsW + 10, GAME_HEIGHT - 214, tabsW - 20, 3);
      }
      this.add.text(cx, cy - 14, t.glyph, {
        fontSize: '30px',
      }).setOrigin(0.5).setScrollFactor(0);
      this.add.text(cx, cy + 24, t.name, {
        fontFamily: DS.font.body,
        fontSize: '18px',
        color: t.active ? '#ffd76a' : (t.locked ? '#5a7aa0' : '#ffffff'),
        fontStyle: t.active ? 'bold' : '500',
        stroke: 'rgba(0,30,60,0.7)',
        strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0);

      // 章节切换点击区
      const tabHit = this.add.rectangle(cx, cy, tabsW - 4, 100, 0xffffff, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: !t.locked });
      tabHit.on('pointerover', () => { if (!t.locked) this.input.setDefaultCursor('pointer'); });
      tabHit.on('pointerout', () => this.input.setDefaultCursor('default'));
      tabHit.on('pointerdown', () => {
        if (t.locked) {
          this.showToast(`「${t.name}」尚未解锁`);
          audio.playSfx?.('deny');
          return;
        }
        if (t.active) return;
        audio.playSfx?.('click');
        this.switchChapter(i);
      });
    });

    // 返回按钮（左上）
    const back = this.add.graphics();
    back.setScrollFactor(0);
    back.fillStyle(CARTOON.tabBlue, 0.92);
    back.fillRoundedRect(10, GAME_HEIGHT - 116, 72, 72, 18);
    back.lineStyle(2, 0xffffff, 0.55);
    back.strokeRoundedRect(10, GAME_HEIGHT - 116, 72, 72, 18);
    this.add.text(46, GAME_HEIGHT - 80, '←', {
      fontFamily: DS.font.display,
      fontSize: '44px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.5)',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setInteractive()
      .on('pointerdown', () => { this.scene.start('MainScene'); audio.playSfx?.('click'); });

    // 底部Tab Bar（和主界面一致，只是当前激活"拯救狗狗"）
    drawCartoonTabBar(this, [
      { name: '主城', glyph: '🏰', onClick: () => this.scene.start('MainScene') },
      { name: '野外', glyph: '🌀', onClick: () => this.scene.start('GachaScene') },
      { name: '联盟', glyph: '🛡️', onClick: () => {} },
      { name: '冒险', glyph: '⚔️', onClick: () => {} },
      { name: '拯救狗狗', glyph: '🐶', onClick: () => {}, active: true },
      { name: '英雄', glyph: '🛡', onClick: () => this.scene.start('HeroScene') },
      { name: '赛季', glyph: '🔒', onClick: () => {}, locked: true },
    ]);

    // 最下方的奖励按钮（30/30/12/16，对应步数奖励）
    const bonus = [
      { idx: 4, val: 30, color: 0x5cb3ea, icon: '🔵', kind: 'gold' as const },
      { idx: 8, val: 30, color: 0x5cb3ea, icon: '🔵', kind: 'gold' as const },
      { idx: 12, val: 12, color: 0xb06fe0, icon: '🎁', kind: 'gem' as const },
      { idx: 16, val: 16, color: 0xc09030, icon: '🔭', kind: 'ticket' as const },
    ];
    const barY = GAME_HEIGHT - 260;
    // 进度条
    const progBg = this.add.graphics().setScrollFactor(0);
    progBg.fillStyle(0x0a2a4a, 0.9);
    progBg.fillRoundedRect(0, barY, GAME_WIDTH, 44, 0);
    progBg.fillStyle(CARTOON.hexGold, 0.15);
    progBg.fillRect(0, barY, GAME_WIDTH, 2);
    // 每个节点
    bonus.forEach(b => {
      const bx = (GAME_WIDTH / 5) * (b.idx / 4);
      progBg.fillStyle(0x1a5a98, 0.95);
      progBg.fillRoundedRect(bx - 38, barY + 2, 76, 40, 12);
      progBg.fillStyle(b.color, 0.3);
      progBg.fillRoundedRect(bx - 36, barY + 4, 72, 36, 11);
      progBg.lineStyle(1.5, 0xffffff, 0.5);
      progBg.strokeRoundedRect(bx - 36, barY + 4, 72, 36, 11);
      this.add.text(bx - 14, barY + 22, b.icon, { fontSize: '20px' }).setOrigin(0, 0.5).setScrollFactor(0);
      this.add.text(bx + 18, barY + 22, String(b.val), {
        fontFamily: DS.font.display,
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.5)',
        strokeThickness: 2,
      }).setOrigin(0, 0.5).setScrollFactor(0);
      this.add.text(bx, barY + 54, String(b.idx), {
        fontFamily: DS.font.body,
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0,0,0,0.6)',
        strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0);

      // 奖励领取点击区
      const bonusHit = this.add.rectangle(bx, barY + 22, 80, 50, 0xffffff, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      bonusHit.on('pointerover', () => this.input.setDefaultCursor('pointer'));
      bonusHit.on('pointerout', () => this.input.setDefaultCursor('default'));
      bonusHit.on('pointerdown', () => {
        this.claimBonus(b.idx, b.kind, b.val);
      });
    });
  }

  private switchChapter(chapterIndex: number) {
    this.currentChapter = chapterIndex + 1;
    this.currentStage = 1;
    this.showToast(`已切换到第 ${this.currentChapter} 章`);
    // 重新创建场景（简单做法：start 自身）
    this.scene.restart();
  }

  private claimBonus(milestone: number, kind: 'gold' | 'gem' | 'ticket', amount: number) {
    const player = usePlayerStore();
    if (this.currentStage < milestone) {
      this.showToast(`通关至第 ${milestone} 关后可领取`);
      audio.playSfx?.('deny');
      return;
    }
    if (kind === 'gold') player.addCurrency('gold', amount);
    else if (kind === 'gem') player.addCurrency('gem', amount);
    else {
      // 召唤券存在 save.tickets.standard 上，单独处理
      player.save.tickets.standard = (player.save.tickets.standard ?? 0) + amount;
      player.dirty = true;
    }
    this.showToast(`领取成功：${kind === 'gold' ? '金币' : kind === 'gem' ? '钻石' : '召唤券'} × ${amount}`);
    audio.playSfx?.('coin');
  }
}
