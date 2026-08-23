import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  setGameRefSize,
  drawCartoonTabBar,
  drawCastleBackground,
  drawStonePlatformTiled,
  drawEquipmentSlot,
  CARTOON,
  DS,
} from '../ui/designSystem';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { computeStats, levelCap } from '@/core/formulas';
import { getHeroPortrait } from '@/core/assetGen';

interface SceneData {
  heroUid?: string;
}

const FACTION_CLASS_LABEL: Record<string, string> = {
  tank: '守护', warrior: '战士', assassin: '刺客', ranger: '游侠', mage: '法师', support: '辅助',
  celestial: '天界', abyss: '深渊', mecha: '机枢', beast: '荒野', spirit: '幻灵', human: '人族',
};

export class CodexScene extends Phaser.Scene {
  private heroUid: string | null = null;

  constructor() { super('CodexScene'); }

  init(data: SceneData) {
    this.heroUid = data?.heroUid || useHeroStore().heroes[0]?.uid || null;
  }

  create() {
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);

    if (!this.heroUid) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '无英雄数据，请先召唤', {
        fontSize: '24px', color: '#ffffff',
      }).setOrigin(0.5);
      const back = this.add.text(40, 60, '← 返回', {
        fontSize: '20px', color: '#ffd76a', fontStyle: 'bold',
      }).setInteractive();
      back.on('pointerdown', () => this.scene.start('HeroScene'));
      return;
    }

    // 1. 城堡背景
    drawCastleBackground(this, GAME_WIDTH, GAME_HEIGHT);

    const inst = useHeroStore().byId(this.heroUid!);
    if (!inst) return;
    const base = HERO_MAP[inst.heroId];
    if (!base) return;
    const stats = computeStats(inst);

    // 2. 左上角：S+品质标识 + 英雄称号/名字
    this.drawHeroTitle(base, inst);

    // 3. 顶部3个圆形装饰按钮（职业/稀有度/阵营）
    this.drawTopOrnaments(base);

    // 4. 石砌圆形平台 + 英雄立绘
    const platformY = GAME_HEIGHT * 0.56;
    drawStonePlatformTiled(this, GAME_WIDTH / 2, platformY, 160);
    this.drawHeroPortrait(base, inst, platformY - 80);

    // 5. 左右装备槽（各3个）
    this.drawEquipmentSlots();

    // 6. 左下角天赋按钮
    this.drawTalentButton();

    // 7. 底部战力横幅 + 属性面板 + 操作按钮
    this.drawBottomStatBar(base, inst, stats);

    // 8. 觉醒/英雄/技能/强化 底部功能Tab
    this.drawAwakenSkillTabs();

    // 9. 最底部蓝色 Tab Bar（含返回按钮）
    this.drawBottomTabBar();

    // 10. 右侧切换按钮（上下一位英雄）
    this.drawNavButtons();

    // 11. 右上角 攻略 / 皮肤 按钮
    this.drawTopRightButtons();
  }

  // ===================== S+标识 + 英雄称号和名字 =====================
  private drawHeroTitle(base: any, inst: any) {
    const g = this.add.graphics();
    // S+ 大标识
    g.fillStyle(0xc09030, 1);
    g.fillRoundedRect(20, 68, 60, 48, 10);
    g.fillStyle(CARTOON.hexGold, 1);
    g.fillRoundedRect(22, 70, 56, 44, 9);
    g.lineStyle(2, 0xffffff, 0.55);
    g.strokeRoundedRect(22, 70, 56, 44, 9);
    this.add.text(50, 94, 'S+', {
      fontFamily: DS.font.display,
      fontSize: '38px',
      color: '#ff6a3d',
      fontStyle: 'bold',
      stroke: '#7a4a0a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // 称号
    this.add.text(100, 68, `${FACTION_CLASS_LABEL[base.class] || base.class}之影`, {
      fontFamily: DS.font.display,
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.8)',
      strokeThickness: 3,
    });

    // 名字（紫色）
    this.add.text(100, 104, base.name, {
      fontFamily: DS.font.display,
      fontSize: '28px',
      color: '#c060ff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)',
      strokeThickness: 2,
    });

    // 品质标签 "卓越"
    this.add.text(GAME_WIDTH / 2, 154, '卓越', {
      fontFamily: DS.font.display,
      fontSize: '26px',
      color: '#ff80d0',
      fontStyle: 'bold',
      stroke: 'rgba(60,0,60,0.6)',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  // ===================== 顶部3个圆形装饰按钮 =====================
  private drawTopOrnaments(base: any) {
    const cy = 88;
    const cx = GAME_WIDTH / 2;

    // 职业图标（左）
    const classGlyph: Record<string, string> = {
      tank: '🛡', warrior: '⚔', assassin: '🗡', ranger: '🏹', mage: '🔮', support: '✨',
    };
    this.drawOrnamentCircle(cx - 110, cy, classGlyph[base.class] || '✦', 0xb060e0);

    // 中间：大宝石
    this.drawRarityJewel(cx, cy - 4, base.rarity);

    // 阵营图标（右）
    const factionGlyph: Record<string, string> = {
      celestial: '☀', abyss: '☾', spirit: '✦', beast: '✿', human: '♛', mecha: '⌬',
    };
    this.drawOrnamentCircle(cx + 110, cy, factionGlyph[base.faction] || '✦', 0x3a8ab8);
  }

  private drawOrnamentCircle(x: number, y: number, glyph: string, fill: number) {
    const g = this.add.graphics();
    // 光束连接
    g.fillStyle(0xffd76a, 0.4);
    g.fillRect(x, y - 4, GAME_WIDTH / 2 - Math.abs(GAME_WIDTH / 2 - x), 2);
    g.fillStyle(CARTOON.hexGold, 0.15);
    g.fillCircle(x, y, 46);
    g.fillStyle(0x0a2a4a, 0.9);
    g.fillCircle(x, y, 36);
    g.fillStyle(fill, 0.85);
    g.fillCircle(x, y, 30);
    g.lineStyle(2, 0xffffff, 0.6);
    g.strokeCircle(x, y, 30);
    this.add.text(x, y, glyph, {
      fontFamily: DS.font.display, fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.5)', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private drawRarityJewel(x: number, y: number, rarity: string) {
    const g = this.add.graphics();
    // 外圈金色装饰
    g.fillStyle(CARTOON.hexGold, 0.25);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const px = x + Math.cos(ang) * 56;
      const py = y + Math.sin(ang) * 56;
      g.fillCircle(px, py, 4);
    }
    // 光束
    g.lineStyle(2, 0xffd76a, 0.6);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(x + Math.cos(ang) * 48, y + Math.sin(ang) * 48);
      g.lineTo(x + Math.cos(ang) * 62, y + Math.sin(ang) * 62);
      g.strokePath();
    }
    // 金色外框
    g.fillStyle(0xc09030, 1);
    g.fillCircle(x, y, 42);
    g.fillStyle(CARTOON.hexGold, 1);
    g.fillCircle(x, y, 38);
    // 稀有度紫色宝石
    const col = (rarity === 'UR' || rarity === 'LR' || rarity === 'MRC') ? 0xb060e0 : 0xd8a040;
    g.fillStyle(col, 1);
    g.fillCircle(x, y, 28);
    g.lineStyle(2, 0xffffff, 0.75);
    g.strokeCircle(x, y, 28);
    // 宝石切面高光
    g.fillStyle(0xffffff, 0.35);
    g.beginPath();
    g.moveTo(x, y - 24);
    g.lineTo(x - 10, y - 8);
    g.lineTo(x + 10, y - 8);
    g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 0.2);
    g.fillEllipse(x - 8, y - 2, 6, 10);
    // 十字切痕
    g.lineStyle(1, 0xffffff, 0.5);
    g.beginPath();
    g.moveTo(x, y - 26); g.lineTo(x, y + 26);
    g.moveTo(x - 24, y); g.lineTo(x + 24, y);
    g.strokePath();
  }

  // ===================== 英雄立绘展示 =====================
  private drawHeroPortrait(base: any, inst: any, centerY: number) {
    const portrait = getHeroPortrait(base);
    const key = `codex_full_${inst.uid}`;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);

    const img = this.add.image(GAME_WIDTH / 2, centerY, key);
    img.setDisplaySize(300, 420);
    img.setAlpha(0).setScale(0.6);
    this.tweens.add({
      targets: img, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 700, ease: 'Back.easeOut',
    });
    // 持续呼吸
    this.tweens.add({
      targets: img, scaleY: 1.03,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    // 光环
    const halo = this.add.graphics();
    halo.lineStyle(3, 0xb060e0, 0.35);
    halo.strokeCircle(GAME_WIDTH / 2, centerY + 50, 170);
    halo.lineStyle(2, 0xe8c0ff, 0.25);
    halo.strokeCircle(GAME_WIDTH / 2, centerY + 50, 200);
    this.tweens.add({
      targets: halo, rotation: Math.PI * 2,
      duration: 18000, repeat: -1, ease: 'Linear',
    });
    // 紫色飘带光效
    const aura = this.add.graphics();
    aura.lineStyle(6, 0xe8a0ff, 0.55);
    aura.beginPath();
    const cx = GAME_WIDTH / 2, cy = centerY;
    for (let t = 0; t <= 1; t += 0.01) {
      const ang = t * Math.PI * 2;
      const rr = 110 + Math.sin(t * 8) * 18;
      const px = cx + Math.cos(ang) * rr;
      const py = cy + Math.sin(ang) * rr * 1.3;
      if (t === 0) aura.moveTo(px, py);
      else aura.lineTo(px, py);
    }
    aura.strokePath();
    this.tweens.add({
      targets: aura, rotation: -Math.PI * 2,
      duration: 24000, repeat: -1, ease: 'Linear',
    });
  }

  // ===================== 装备槽（左3 + 右3） =====================
  private drawEquipmentSlots() {
    const slotSize = 68;
    const leftX = 54;
    const rightX = GAME_WIDTH - 54;
    const topY = 340;
    const gap = 118;

    // 左列（武器带SSR星，头盔，锁）
    drawEquipmentSlot(this, leftX, topY, slotSize, 'weapon', {
      icon: '⚔', rarity: 'SSR', name: '利刃',
    });
    drawEquipmentSlot(this, leftX, topY + gap, slotSize, 'helmet', {
      icon: '⛑', rarity: 'R', name: '头盔',
    });
    drawEquipmentSlot(this, leftX, topY + gap * 2, slotSize, 'locked');

    // 右列（铠甲，靴子，锁）
    drawEquipmentSlot(this, rightX, topY, slotSize, 'armor', {
      icon: '🛡', rarity: 'R', name: '铠甲',
    });
    drawEquipmentSlot(this, rightX, topY + gap, slotSize, 'boots', {
      icon: '👢', rarity: 'R', name: '战靴',
    });
    drawEquipmentSlot(this, rightX, topY + gap * 2, slotSize, 'locked');
  }

  // ===================== 左下角天赋按钮 =====================
  private drawTalentButton() {
    const x = 70, y = GAME_HEIGHT * 0.66;
    const g = this.add.graphics();
    // 阴影
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(x + 3, y + 3, 50);
    // 蓝色圆形底座
    g.fillStyle(0x1a5a98, 1);
    g.fillCircle(x, y, 50);
    g.fillStyle(0x3a8ae8, 1);
    g.fillCircle(x, y, 46);
    // 星空渐变
    g.fillStyle(0x0a1040, 1);
    g.fillCircle(x, y, 38);
    // 星点
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rr = 10 + Math.random() * 20;
      g.fillStyle(0x9cdcff, 0.7);
      g.fillCircle(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, 1 + Math.random() * 1.5);
    }
    // 波形线
    g.lineStyle(2, 0x5cb3ea, 1);
    g.beginPath();
    for (let t = 0; t <= 1; t += 0.04) {
      const xx = x - 24 + t * 48;
      const yy = y + Math.sin(t * Math.PI * 3) * 6;
      if (t === 0) g.moveTo(xx, yy);
      else g.lineTo(xx, yy);
    }
    g.strokePath();
    // 白色翅膀
    g.fillStyle(0xffffff, 1);
    // 左翼
    g.beginPath();
    g.moveTo(x - 30, y - 6);
    g.lineTo(x - 60, y - 24);
    g.lineTo(x - 58, y - 12);
    g.lineTo(x - 64, y);
    g.lineTo(x - 56, y + 6);
    g.lineTo(x - 50, y + 12);
    g.lineTo(x - 30, y + 4);
    g.closePath(); g.fillPath();
    // 右翼
    g.beginPath();
    g.moveTo(x + 30, y - 6);
    g.lineTo(x + 60, y - 24);
    g.lineTo(x + 58, y - 12);
    g.lineTo(x + 64, y);
    g.lineTo(x + 56, y + 6);
    g.lineTo(x + 50, y + 12);
    g.lineTo(x + 30, y + 4);
    g.closePath(); g.fillPath();
    g.lineStyle(1, 0xa0c0e0, 1);
    g.strokePath();
    // 下方蓝色横幅
    const banner = this.add.graphics();
    banner.fillStyle(0x1a5a98, 1);
    banner.fillRoundedRect(x - 36, y + 40, 72, 32, 10);
    banner.lineStyle(2, 0xffd76a, 1);
    banner.strokeRoundedRect(x - 36, y + 40, 72, 32, 10);
    this.add.text(x, y + 56, '天赋', {
      fontFamily: DS.font.display, fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.7)', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  // ===================== 底部战力横幅 + 属性 + 按钮 =====================
  private drawBottomStatBar(base: any, inst: any, stats: any) {
    const barY = GAME_HEIGHT - 330;

    // 战力横幅（金色飘带）
    const banner = this.add.graphics();
    const w = 360;
    banner.fillStyle(0x7a5a20, 1);
    banner.beginPath();
    banner.moveTo(GAME_WIDTH / 2 - w / 2, barY);
    banner.lineTo(GAME_WIDTH / 2 + w / 2, barY);
    banner.lineTo(GAME_WIDTH / 2 + w / 2 - 18, barY + 22);
    banner.lineTo(GAME_WIDTH / 2 + w / 2, barY + 44);
    banner.lineTo(GAME_WIDTH / 2 - w / 2, barY + 44);
    banner.lineTo(GAME_WIDTH / 2 - w / 2 + 18, barY + 22);
    banner.closePath();
    banner.fillPath();
    banner.fillStyle(CARTOON.hexGold, 1);
    banner.beginPath();
    banner.moveTo(GAME_WIDTH / 2 - w / 2 + 4, barY + 4);
    banner.lineTo(GAME_WIDTH / 2 + w / 2 - 4, barY + 4);
    banner.lineTo(GAME_WIDTH / 2 + w / 2 - 20, barY + 22);
    banner.lineTo(GAME_WIDTH / 2 + w / 2 - 4, barY + 40);
    banner.lineTo(GAME_WIDTH / 2 - w / 2 + 4, barY + 40);
    banner.lineTo(GAME_WIDTH / 2 - w / 2 + 20, barY + 22);
    banner.closePath();
    banner.fillPath();
    banner.fillStyle(0xffffff, 0.3);
    banner.fillRect(GAME_WIDTH / 2 - w / 2 + 10, barY + 6, w - 20, 4);
    // 战力数字
    this.add.text(GAME_WIDTH / 2 - 60, barY + 22, '✊', {
      fontSize: '28px',
    }).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH / 2 - 20, barY + 22, this.formatBig(stats.power), {
      fontFamily: DS.font.display, fontSize: '34px', color: '#6a3a10', fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // 信息按钮（i）
    const infoX = GAME_WIDTH / 2 + w / 2 + 18;
    const ig = this.add.graphics();
    ig.fillStyle(0x8a6a20, 1);
    ig.fillCircle(infoX, barY + 22, 18);
    ig.fillStyle(CARTOON.hexGold, 1);
    ig.fillCircle(infoX, barY + 22, 16);
    ig.lineStyle(1.5, 0xffffff, 0.55);
    ig.strokeCircle(infoX, barY + 22, 16);
    this.add.text(infoX, barY + 22, 'ℹ', {
      fontFamily: DS.font.display, fontSize: '22px', color: '#6a3a10', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ==== 属性面板 ====
    const attrY = barY + 58;
    const attrBg = this.add.graphics();
    // 用三层填充模拟深色渐变
    const attrH = GAME_HEIGHT - attrY - 240;
    const attrL = 4;
    for (let i = 0; i < attrL; i++) {
      const t = i / attrL;
      const r = Math.floor(0x10 + (0x0a - 0x10) * t);
      const gg = Math.floor(0x18 + (0x0f - 0x18) * t);
      const b = Math.floor(0x28 + (0x1a - 0x28) * t);
      attrBg.fillStyle((r << 16) | (gg << 8) | b, 1);
      attrBg.fillRect(0, attrY + (attrH / attrL) * i, GAME_WIDTH, (attrH / attrL) + 1);
    }
    attrBg.fillStyle(0xffffff, 0.06);
    attrBg.fillRect(0, attrY, GAME_WIDTH, 1);

    // 等级
    this.add.text(24, attrY + 14, 'LV', {
      fontFamily: DS.font.display, fontSize: '18px', color: '#ffd76a', fontStyle: 'bold',
    });
    this.add.text(72, attrY + 14, `${inst.level}`, {
      fontFamily: DS.font.display, fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // HP / 攻击 / 防御
    const statList = [
      { x: GAME_WIDTH * 0.32, glyph: '❤', label: 'HP', value: this.formatBig(Math.floor(stats.hp)), col: '#ff6a8a' },
      { x: GAME_WIDTH * 0.60, glyph: '⚔', label: 'ATK', value: this.formatBig(Math.floor(stats.atk)), col: '#ffd76a' },
      { x: GAME_WIDTH * 0.84, glyph: '🛡', label: 'DEF', value: this.formatBig(Math.floor(stats.def)), col: '#9cdcff' },
    ];
    statList.forEach(s => {
      this.add.text(s.x, attrY + 8, s.glyph, { fontSize: '24px', color: s.col }).setOrigin(0.5);
      this.add.text(s.x, attrY + 40, s.value, {
        fontFamily: DS.font.display, fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
    });

    // ==== 升级资源显示 ====
    const resY = attrY + 66;
    // 绿色经验
    const exG = this.add.graphics();
    exG.fillStyle(0x1a4a2a, 0.9);
    exG.fillRoundedRect(220, resY, 200, 42, 14);
    exG.fillStyle(0x3aaa5a, 0.18);
    exG.fillRect(220, resY, 6, 42);
    exG.lineStyle(1.5, 0x5aba6a, 0.7);
    exG.strokeRoundedRect(220, resY, 200, 42, 14);
    this.add.text(236, resY + 21, '🌀', { fontSize: '26px' }).setOrigin(0, 0.5);
    this.add.text(272, resY + 21, `426K/10K`, {
      fontFamily: DS.font.display, fontSize: '20px', color: '#a0ffa0', fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    // 金币
    const gdG = this.add.graphics();
    gdG.fillStyle(0x4a3a10, 0.9);
    gdG.fillRoundedRect(GAME_WIDTH - 300, resY, 200, 42, 14);
    gdG.fillStyle(CARTOON.hexGold, 0.18);
    gdG.fillRect(GAME_WIDTH - 300, resY, 6, 42);
    gdG.lineStyle(1.5, CARTOON.hexGold, 0.7);
    gdG.strokeRoundedRect(GAME_WIDTH - 300, resY, 200, 42, 14);
    this.add.text(GAME_WIDTH - 284, resY + 21, '🪙', { fontSize: '26px' }).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH - 248, resY + 21, `2185K/27K`, {
      fontFamily: DS.font.display, fontSize: '20px', color: '#ffd76a', fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    // 红点升级按钮上
    const rd = this.add.graphics();
    rd.fillStyle(0xff4a4a, 1);
    rd.fillCircle(GAME_WIDTH - 100, resY - 2, 7);
    rd.lineStyle(1.5, 0xffffff, 1);
    rd.strokeCircle(GAME_WIDTH - 100, resY - 2, 7);

    // ==== 操作按钮：重置 / 脱装 / 升级 / 一键穿装 ====
    const btnY = resY + 60;
    // 重置（左小）
    this.drawActionButton(14, btnY, 110, 52, '重置', 0x2a6fa0, '#ffffff', () => {});
    // 脱装
    this.drawActionButton(130, btnY, 140, 52, '脱装', 0x2a6fa0, '#ffffff', () => {});
    // 升级（大金色，中间）
    this.drawActionButton(GAME_WIDTH / 2 - 100, btnY - 6, 200, 64, '升 级', 0xd8a020, '#5a3a00', () => {
      const p = usePlayerStore();
      if (p.save.gem < 50) return;
      p.addCurrency('gem', -50);
      useHeroStore().gainExp(this.heroUid!, 100);
      this.scene.restart();
    }, true);
    // 加成总览
    this.drawActionButton(GAME_WIDTH - 244, btnY, 140, 52, '加成总览', 0x2a6fa0, '#ffffff', () => {});
    // 一键穿装
    this.drawActionButton(GAME_WIDTH - 124, btnY, 110, 52, '一键穿装', 0x2a6fa0, '#ffffff', () => {});
  }

  private drawActionButton(x: number, y: number, w: number, h: number, label: string, bg: number, textColor: string, onClick: () => void, isGold = false) {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(x + 2, y + 4, w, h, 12);
    if (isGold) {
      // 金色渐变按钮
      g.fillStyle(0x8a5a10, 1);
      g.fillRoundedRect(x, y, w, h, 14);
      g.fillStyle(CARTOON.hexGold, 1);
      g.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 13);
      g.fillStyle(0xfff0a0, 0.6);
      g.fillRoundedRect(x + 4, y + 4, w - 8, (h - 8) * 0.45, 11);
      g.lineStyle(2, 0xffffff, 0.6);
      g.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 13);
    } else {
      g.fillStyle(0x0a2a4a, 1);
      g.fillRoundedRect(x, y, w, h, 14);
      g.fillStyle(bg, 1);
      g.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 13);
      g.fillStyle(0x6ab8f0, 0.4);
      g.fillRoundedRect(x + 4, y + 4, w - 8, (h - 8) * 0.45, 11);
      g.lineStyle(1.5, 0xffffff, 0.45);
      g.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 13);
    }
    this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: DS.font.display,
      fontSize: isGold ? '30px' : `${Math.floor(h * 0.42)}px`,
      color: textColor,
      fontStyle: 'bold',
      stroke: isGold ? 'rgba(120,70,0,0.6)' : 'rgba(0,20,40,0.7)',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0).setInteractive();
    hit.on('pointerdown', () => {
      this.tweens.add({ targets: hit, scaleX: 0.94, scaleY: 0.94, duration: 60, yoyo: true });
      onClick();
      audio.playSfx?.('click');
    });
  }

  // ===================== 觉醒/英雄/技能/强化 Tab =====================
  private drawAwakenSkillTabs() {
    const barY = GAME_HEIGHT - 232;
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1420, 1);
    bg.fillRect(0, barY, GAME_WIDTH, 120);
    bg.fillStyle(0xffffff, 0.06);
    bg.fillRect(0, barY, GAME_WIDTH, 1);

    const tabs = [
      { name: '觉醒', glyph: '🧸' },
      { name: '英雄', glyph: '🦸' },
      { name: '技能', glyph: '⚔' },
      { name: '强化', glyph: '🔨' },
    ];
    const tw = GAME_WIDTH / tabs.length;
    tabs.forEach((t, i) => {
      const cx = i * tw + tw / 2;
      const cy = barY + 54;

      // 菱形蓝色按钮
      const btn = this.add.graphics();
      const size = 72;
      btn.save();
      btn.translateCanvas(cx, cy);
      btn.rotateCanvas(Math.PI / 4);
      btn.fillStyle(0x1a4a7a, 1);
      btn.fillRoundedRect(-size / 2, -size / 2, size, size, 14);
      btn.fillStyle(0x2a6faa, 1);
      btn.fillRoundedRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6, 12);
      btn.fillStyle(0x6ab8f0, 0.35);
      btn.fillRoundedRect(-size / 2 + 5, -size / 2 + 5, size - 10, (size - 10) * 0.5, 10);
      btn.lineStyle(1.5, 0xffffff, 0.45);
      btn.strokeRoundedRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6, 12);
      btn.restore();

      this.add.text(cx, cy - 2, t.glyph, {
        fontSize: '26px',
      }).setOrigin(0.5);

      this.add.text(cx, barY + 108, t.name, {
        fontFamily: DS.font.body,
        fontSize: '20px',
        color: '#7aa0d0',
        fontStyle: 'bold',
        stroke: 'rgba(0,10,30,0.8)',
        strokeThickness: 2,
      }).setOrigin(0.5);
    });
  }

  // ===================== 右上角按钮（攻略/皮肤） =====================
  private drawTopRightButtons() {
    const btnY = 90;
    ['攻略', '皮肤'].forEach((label, i) => {
      const x = GAME_WIDTH - 50 - i * 90;
      const g = this.add.graphics();
      g.fillStyle(0x1a5a98, 0.92);
      g.fillRoundedRect(x - 38, btnY - 32, 76, 64, 14);
      g.fillStyle(0x3a8ae8, 0.6);
      g.fillRoundedRect(x - 36, btnY - 30, 72, 60, 13);
      g.lineStyle(1.5, 0xffffff, 0.5);
      g.strokeRoundedRect(x - 36, btnY - 30, 72, 60, 13);
      const glyph = i === 0 ? '🃏' : '👕';
      this.add.text(x, btnY - 10, glyph, { fontSize: '24px' }).setOrigin(0.5);
      this.add.text(x, btnY + 18, label, {
        fontFamily: DS.font.body, fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
        stroke: 'rgba(0,30,60,0.7)', strokeThickness: 2,
      }).setOrigin(0.5);
      if (i === 0) {
        const rd = this.add.graphics();
        rd.fillStyle(0xff4a4a, 1);
        rd.fillCircle(x + 26, btnY - 26, 6);
        rd.lineStyle(1, 0xffffff, 1);
        rd.strokeCircle(x + 26, btnY - 26, 6);
      }
    });
  }

  // ===================== 左右切换导航按钮 =====================
  private drawNavButtons() {
    const y = GAME_HEIGHT * 0.55;
    [-1, 1].forEach(dir => {
      const x = dir < 0 ? 20 : GAME_WIDTH - 20;
      const g = this.add.graphics();
      g.fillStyle(0xffd76a, 0.2);
      g.fillCircle(x, y, 30);
      g.fillStyle(0x8a6a20, 0.9);
      g.fillCircle(x, y, 26);
      g.fillStyle(CARTOON.hexGold, 1);
      g.fillCircle(x, y, 24);
      g.lineStyle(1.5, 0xffffff, 0.55);
      g.strokeCircle(x, y, 24);
      this.add.text(x, y, dir < 0 ? '❮' : '❯', {
        fontFamily: DS.font.display, fontSize: '28px', color: '#6a3a10', fontStyle: 'bold',
      }).setOrigin(0.5);
      const hit = this.add.circle(x, y, 28, 0xffffff, 0).setInteractive();
      hit.on('pointerdown', () => {
        const all = useHeroStore().heroes;
        const idx = all.findIndex(h => h.uid === this.heroUid);
        if (idx < 0) return;
        const nidx = (idx + dir + all.length) % all.length;
        this.heroUid = all[nidx].uid;
        this.scene.restart({ heroUid: this.heroUid });
      });
    });
  }

  // ===================== 底部蓝色 Tab Bar =====================
  private drawBottomTabBar() {
    // 先画返回按钮（覆盖在Tab Bar左边）
    const y = GAME_HEIGHT - 116;
    const back = this.add.graphics();
    back.fillStyle(0x0a2a4a, 0.95);
    back.fillRoundedRect(10, y, 78, 72, 18);
    back.fillStyle(CARTOON.tabBlue, 1);
    back.fillRoundedRect(12, y + 2, 74, 68, 17);
    back.fillStyle(CARTOON.tabBlueLight, 0.5);
    back.fillRoundedRect(14, y + 4, 70, 30, 15);
    back.lineStyle(2, 0xffffff, 0.55);
    back.strokeRoundedRect(12, y + 2, 74, 68, 17);
    this.add.text(49, y + 36, '←', {
      fontFamily: DS.font.display, fontSize: '34px', color: '#ffffff', fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.6)', strokeThickness: 2,
    }).setOrigin(0.5);
    const hit = this.add.rectangle(49, y + 36, 74, 68, 0xffffff, 0).setInteractive();
    hit.on('pointerdown', () => {
      this.tweens.add({ targets: back, scaleX: 0.92, scaleY: 0.92, duration: 60, yoyo: true });
      this.scene.start('HeroScene');
    });

    drawCartoonTabBar(this, [
      { name: '主城', glyph: '🏰', onClick: () => this.scene.start('MainScene'), active: false },
      { name: '野外', glyph: '🌀', onClick: () => this.scene.start('GachaScene'), active: false },
      { name: '联盟', glyph: '🛡️', onClick: () => this.scene.start('GuildScene'), active: false },
      { name: '冒险', glyph: '⚔️', onClick: () => this.scene.start('StageScene'), active: false },
      { name: '拯救狗狗', glyph: '🐶', onClick: () => this.scene.start('StageScene'), active: false },
      { name: '英雄', glyph: '🛡', onClick: () => this.scene.start('HeroScene'), active: true },
      { name: '赛季', glyph: '🔒', onClick: () => {}, active: false, locked: true },
    ]);
  }

  // ===================== 辅助方法 =====================
  private formatBig(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 10_000) return (n / 10_000).toFixed(1) + '万';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(Math.floor(n));
  }
}
