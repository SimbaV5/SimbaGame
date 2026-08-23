import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useGachaStore } from '@/stores/gachaStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import type { GachaPoolType } from '@/types';
import { burst, ringPulse, starBurst, floatingSparkles, floatingText } from '../effects/particles';
import { DS, C, drawFrame, drawStarStuddedBackground, drawOrnamentDivider } from '../ui/designSystem';

export class GachaScene extends Phaser.Scene {
  private currentPool: GachaPoolType = 'standard';
  private animating = false;
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('GachaScene'); }

  create() {
    this.cameras.main.setBackgroundColor(DS.color.bgDeep);
    this.drawStageBackdrop();
    backBar(this, '召唤大厅', () => this.scene.start('MainScene'));
    this.drawAnimatedBackground();
    this.drawPools();
    this.drawPulls();
    this.drawHistory();
  }

  private drawStageBackdrop() {
    const g = this.add.graphics();
    g.fillGradientStyle(
      hex2n(DS.color.bgDeep), hex2n(DS.color.bgDeep),
      hex2n(DS.color.magentaDeep), hex2n(DS.color.bgWarm),
      1,
    );
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const beam = this.add.graphics();
    const colors = [C.magenta, C.gold, C.violet, C.cyan];
    for (let i = 0; i < 6; i++) {
      const color = colors[i % colors.length];
      beam.fillStyle(color, 0.06);
      beam.fillTriangle(
        GAME_WIDTH * (i / 6) - 100, 0,
        GAME_WIDTH * (i / 6) + 100, 0,
        GAME_WIDTH * (i / 6) + (i - 3) * 200, GAME_HEIGHT,
      );
    }
    beam.setBlendMode(Phaser.BlendModes.ADD);

    drawStarStuddedBackground(this, GAME_WIDTH, GAME_HEIGHT, 0.0004).setAlpha(0.7);
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 28; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const c = [DS.color.goldBright, DS.color.magentaGlow, DS.color.cyanGlow][i % 3];
      const star = this.add.text(x, y, '✦', {
        fontFamily: DS.font.display,
        fontSize: `${Phaser.Math.Between(8, 16)}px`,
        color: c,
      }).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.15, 0.4));
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        y: y - 40,
        alpha: Phaser.Math.FloatBetween(0.1, 0.5),
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(5000, 9000),
        repeat: -1,
      });
    }
  }

  private drawPools() {
    const pools = useGachaStore().pools;
    const w = (GAME_WIDTH - 48) / 3;
    pools.forEach((p, i) => {
      const x = 16 + i * (w + 8);
      const y = 110;
      const isActive = this.currentPool === p.type;
      const color = p.type === 'standard' ? C.cyan : p.type === 'up' ? C.magenta : C.gold;
      const edge = p.type === 'standard' ? C.cyanGlow : p.type === 'up' ? C.magentaGlow : C.goldBright;

      const g = drawFrame(this, x, y, w, 170, {
        fill: isActive ? color : C.panel,
        fillAlpha: isActive ? 0.4 : 0.92,
        edge: edge,
        edgeAlpha: isActive ? 1 : 0.6,
        radius: DS.radius.lg,
        ornament: true,
        glow: isActive ? 0.45 : 0,
        glowColor: edge,
      });

      const crownG = this.add.graphics();
      crownG.fillStyle(edge, 1);
      crownG.fillRoundedRect(x + 4, y - 8, w - 8, 8, 4);
      crownG.fillStyle(0xffffff, 0.4);
      crownG.fillRoundedRect(x + 8, y - 6, w - 16, 2, 2);

      const iconG = this.add.graphics();
      iconG.fillStyle(0x050010, 0.6);
      iconG.fillCircle(x + w / 2, y + 50, 30);
      iconG.fillStyle(edge, 0.4);
      iconG.fillCircle(x + w / 2, y + 50, 26);

      const iconMap: Record<string, string> = { standard: '✦', up: '♛', collab: '✿' };
      this.add.text(x + w / 2, y + 50, iconMap[p.type] || '✧', {
        fontFamily: DS.font.display,
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 0, color: '#' + edge.toString(16).padStart(6, '0'), blur: 16, fill: true },
      }).setOrigin(0.5);

      this.add.text(x + w / 2, y + 96, p.name, {
        fontFamily: DS.font.display,
        fontSize: '24px',
        color: isActive ? DS.color.ink : DS.color.goldBright,
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(x + w / 2, y + 126, p.description.slice(0, 18) + '…', {
        fontFamily: DS.font.body,
        fontSize: '15px',
        color: isActive ? DS.color.ink : DS.color.inkDim,
        align: 'center',
        wordWrap: { width: w - 24 },
      }).setOrigin(0.5);

      const costText = this.add.graphics();
      costText.fillStyle(0x050010, 0.85);
      costText.fillRoundedRect(x + w / 2 - 70, y + 148, 140, 18, 9);
      costText.lineStyle(1, edge, 0.6);
      costText.strokeRoundedRect(x + w / 2 - 70, y + 148, 140, 18, 9);
      this.add.text(x + w / 2, y + 157, `${p.costAmount} 钻石 / 次`, {
        fontFamily: DS.font.display,
        fontSize: '14px',
        color: '#' + edge.toString(16).padStart(6, '0'),
        fontStyle: 'bold',
      }).setOrigin(0.5);

      if (isActive) {
        this.tweens.add({
          targets: [g, crownG],
          alpha: { from: 0.85, to: 1 }, duration: 800, yoyo: true, repeat: -1,
        });
      }

      const hit = this.add.rectangle(x + w / 2, y + 85, w, 170, 0x00000000).setInteractive();
      hit.on('pointerdown', () => {
        this.currentPool = p.type;
        this.scene.restart();
      });
    });
  }

  private drawPulls() {
    const y = 290;
    const pool = useGachaStore().pools.find((p) => p.type === this.currentPool)!;
    const player = usePlayerStore();
    const ticket = player.save.tickets[this.currentPool] || 0;
    const pity = player.save.pity[this.currentPool];

    const frame = drawFrame(this, 16, y, GAME_WIDTH - 32, 220, {
      fill: C.panel,
      edge: C.gold,
      glow: 0.2, glowColor: C.gold,
      ornament: true,
    });

    this.add.text(40, y + 18, `✦  ${pool.name}`, {
      fontFamily: DS.font.display,
      fontSize: '28px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });

    const pityPlate = this.add.graphics();
    pityPlate.fillStyle(0x050010, 0.85);
    pityPlate.fillRoundedRect(40, y + 56, 220, 26, 6);
    pityPlate.fillStyle(C.violet, 0.4);
    pityPlate.fillRect(40, y + 56, 4, 26);
    pityPlate.lineStyle(1, C.violet, 0.6);
    pityPlate.strokeRoundedRect(40, y + 56, 220, 26, 6);
    this.add.text(54, y + 64, `保底进度：${pity.count} / 80`, {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: DS.color.violet,
      fontStyle: 'bold',
    });

    const ticketPlate = this.add.graphics();
    ticketPlate.fillStyle(0x050010, 0.85);
    ticketPlate.fillRoundedRect(40, y + 90, 220, 26, 6);
    ticketPlate.fillStyle(C.cyan, 0.4);
    ticketPlate.fillRect(40, y + 90, 4, 26);
    ticketPlate.lineStyle(1, C.cyan, 0.6);
    ticketPlate.strokeRoundedRect(40, y + 90, 220, 26, 6);
    this.add.text(54, y + 98, `召唤券：${ticket} 张`, {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: DS.color.cyanGlow,
      fontStyle: 'bold',
    });

    const gemPlate = this.add.graphics();
    gemPlate.fillStyle(0x050010, 0.85);
    gemPlate.fillRoundedRect(40, y + 124, 220, 26, 6);
    gemPlate.fillStyle(C.cyan, 0.4);
    gemPlate.fillRect(40, y + 124, 4, 26);
    gemPlate.lineStyle(1, C.cyan, 0.6);
    gemPlate.strokeRoundedRect(40, y + 124, 220, 26, 6);
    this.add.text(54, y + 132, `💎 钻石：${player.save.gem}`, {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: DS.color.cyanGlow,
      fontStyle: 'bold',
    });

    this.drawPullButton(290, y + 28, 132, 64, '✦ 召唤1次', C.cyan, C.cyanGlow, () => this.pull(1));
    this.drawPullButton(290, y + 100, 132, 64, '✦✦ 召唤10次', C.magenta, C.magentaGlow, () => this.pull(10));
    this.drawPullButton(430, y + 28, 132, 64, '✦✦✦ 召唤50次', C.gold, C.goldBright, () => this.pull(50));
    this.drawPullButton(430, y + 100, 132, 64, '◈ 召唤券 1次', C.leaf, 0x9fe5b8, () => this.pullWithTicket(1));

    const tip = this.add.text(GAME_WIDTH / 2, y + 200, '✧ 召唤10次必有至少1位稀有英雄 ✧', {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: DS.color.inkMute,
    }).setOrigin(0.5);
    this.tweens.add({ targets: tip, alpha: 0.5, duration: 1200, yoyo: true, repeat: -1 });
  }

  private drawPullButton(
    x: number, y: number, w: number, h: number,
    text: string, color: number, edge: number, onClick: () => void,
  ) {
    const c = button(this, x, y, w, h, text, onClick, { color, edge, fontSize: 22, variant: 'flat' });
    const bg = (c.list[0] as any);
    if (bg && bg.setStrokeStyle) {
      bg.lineStyle(3, edge, 1);
      bg.strokeRoundedRect(0, 0, w, h, DS.radius.md);
    }
    this.tweens.add({
      targets: c,
      scaleX: 1.04, scaleY: 1.04, duration: 1100, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut', delay: Phaser.Math.Between(0, 400),
    });
    return c;
  }

  private drawHistory() {
    const player = usePlayerStore();
    const y = 528;
    const hFrame = GAME_HEIGHT - y - 110;
    const frame = drawFrame(this, 16, y, GAME_WIDTH - 32, hFrame, {
      fill: C.panelDeep,
      edge: C.goldDeep,
      ornament: true,
    });

    const head = this.add.graphics();
    head.fillStyle(C.bgMid, 0.85);
    head.fillRoundedRect(20, y + 8, GAME_WIDTH - 40, 36, 8);
    head.fillStyle(C.gold, 1);
    head.fillRect(20, y + 8, 6, 36);
    this.add.text(36, y + 26, '◈ 召唤记录', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });

    const divG = this.add.graphics();
    drawOrnamentDivider(divG, 16, y + 52, GAME_WIDTH - 32, C.gold, 0.5);
    divG.setAlpha(0.5);

    const recent = player.save.gachaHistory.slice(0, 30);
    const cols = 6;
    const cellW = (GAME_WIDTH - 56) / cols;
    const cellH = cellW + 26;
    const startY = y + 60;
    recent.forEach((entry, i) => {
      const base = HERO_MAP[entry.heroId];
      if (!base) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 24 + col * (cellW + 4);
      const yy = startY + row * (cellH + 6);
      if (yy + cellH > y + hFrame - 8) return;

      const rarityColor = DS.rarity[base.rarity as keyof typeof DS.rarity]?.edge || C.gold;
      const rarityNum = hex2n(rarityColor);
      const isHigh = ['SSR', 'UR'].includes(base.rarity);

      const g = this.add.graphics();
      g.fillStyle(0x050010, 0.85);
      g.fillRoundedRect(x + 2, y + 4, cellW, cellH, DS.radius.md);
      g.fillStyle(rarityNum, 0.2);
      g.fillRoundedRect(x, y, cellW, cellH, DS.radius.md);
      g.lineStyle(2, rarityNum, isHigh ? 1 : 0.5);
      g.strokeRoundedRect(x, y, cellW, cellH, DS.radius.md);

      const portrait = getHeroPortrait(base);
      const key = 'gh_' + entry.heroId + '_' + i;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
      const img = this.add.image(x + cellW / 2, yy + cellW / 2 - 4, key);
      img.setDisplaySize(cellW - 12, cellW - 12);

      this.add.text(x + cellW / 2, yy + cellW + 12, base.name, {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: entry.isFeatured ? DS.color.goldBright : DS.color.ink,
        fontStyle: 'bold',
      }).setOrigin(0.5);

      if (isHigh) {
        const glow = this.add.rectangle(x + cellW / 2, yy + cellW / 2, cellW, cellW, rarityNum, 0.15);
        this.tweens.add({ targets: glow, alpha: 0, duration: 1000, yoyo: true, repeat: -1 });
      }
    });
  }

  private pull(count: number) {
    const player = usePlayerStore();
    if (this.animating) return;
    if (player.gem < count * 270 && count > 1) return toast(this, '钻石不足');
    if (player.gem < 270 && count === 1) return toast(this, '钻石不足');
    this.animating = true;
    const results = useGachaStore().pull(this.currentPool, count);
    if (results.length === 0) {
      this.animating = false;
      return;
    }
    if (count === 1) {
      this.playSingleAnimation(results[0]);
    } else {
      this.playMultiAnimation(results);
    }
  }

  private pullWithTicket(count: number) {
    const player = usePlayerStore();
    if (player.save.tickets[this.currentPool] < count) return toast(this, '召唤券不足');
    if (this.animating) return;
    this.animating = true;
    const results = useGachaStore().pull(this.currentPool, count, true);
    if (results.length === 0) {
      this.animating = false;
      return;
    }
    if (count === 1) {
      this.playSingleAnimation(results[0]);
    } else {
      this.playMultiAnimation(results);
    }
  }

  private playSingleAnimation(result: { heroId: string; rarity: string; isNew: boolean; isFeatured: boolean }) {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85).setDepth(200);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });

    const base = HERO_MAP[result.heroId];
    const portrait = getHeroPortrait(base);
    const key = 'gacha_anim_' + base.id;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);

    const rarityColor = DS.rarity[base.rarity as keyof typeof DS.rarity]?.edge || C.gold;
    const rarityNum = hex2n(rarityColor);
    const isHigh = ['SSR', 'UR'].includes(base.rarity);

    const beams: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const beam = this.add.graphics();
      beam.fillStyle(rarityNum, 0.3);
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2 - 80;
      beam.fillTriangle(
        cx, cy,
        cx + Math.cos(ang) * 50, cy + Math.sin(ang) * 50,
        cx + Math.cos(ang + 0.05) * 600, cy + Math.sin(ang + 0.05) * 600,
      );
      beam.setDepth(201).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      beams.push(beam);
      this.tweens.add({
        targets: beam, alpha: { from: 0, to: 0.7 }, duration: 500,
      });
    }

    const lightBeam = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 40, 800, rarityNum, 0.6).setDepth(201).setAlpha(0);
    this.tweens.add({
      targets: lightBeam, alpha: 0.6, scaleX: 5, duration: 600,
    });

    const cardGlow = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 360, 360, rarityNum, 0.3).setDepth(201).setScale(0);
    const card = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, key).setDisplaySize(300, 300).setDepth(202).setScale(0).setAlpha(0);

    const namePlate = this.add.graphics();
    namePlate.fillStyle(0x050010, 0.95);
    namePlate.fillRoundedRect(GAME_WIDTH / 2 - 130, GAME_HEIGHT / 2 + 100, 260, 50, 10);
    namePlate.lineStyle(2, rarityNum, 1);
    namePlate.strokeRoundedRect(GAME_WIDTH / 2 - 130, GAME_HEIGHT / 2 + 100, 260, 50, 10);
    namePlate.setDepth(202).setAlpha(0);
    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 116, base.name, {
      fontFamily: DS.font.display,
      fontSize: '36px',
      color: rarityColor,
      fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(203).setAlpha(0);
    const info = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 144, `${base.rarity}  ${base.faction}`, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(203).setAlpha(0);

    this.tweens.add({
      targets: [card, cardGlow],
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 700, ease: 'Back.easeOut', delay: 300,
    });
    this.tweens.add({
      targets: [name, info, namePlate],
      alpha: 1, duration: 400, delay: 800,
    });

    if (isHigh) {
      this.time.delayedCall(900, () => {
        ringPulse(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, rarityNum, 400, 1200);
        starBurst(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, rarityNum, 16);
        burst(this, { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 - 80, count: 40, color: rarityNum, color2: 0xffffff, speed: 280, size: 8, life: 1000 });
        floatingSparkles(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 20);
        floatingText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, base.rarity, rarityColor, 48);
      });
    }

    this.time.delayedCall(2800, () => {
      this.tweens.add({
        targets: [card, cardGlow, name, info, namePlate, overlay, lightBeam, ...beams],
        alpha: 0, duration: 400,
        onComplete: () => {
          [card, cardGlow, name, info, namePlate, overlay, lightBeam, ...beams].forEach((o) => o && o.destroy());
          this.animating = false;
          this.scene.restart();
        },
      });
    });
  }

  private playMultiAnimation(results: { heroId: string; rarity: string; isNew: boolean; isFeatured: boolean }[]) {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85).setDepth(200);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });

    const cellW = (GAME_WIDTH - 80) / 5;
    const cellH = 220;
    const startX = 40;
    const startY = 290;

    const beams: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const beam = this.add.graphics();
      beam.fillStyle(C.gold, 0.3);
      const cx = GAME_WIDTH / 2;
      beam.fillTriangle(
        cx, GAME_HEIGHT / 2,
        cx + Math.cos(ang) * 80, GAME_HEIGHT / 2 + Math.sin(ang) * 80,
        cx + Math.cos(ang + 0.04) * 800, GAME_HEIGHT / 2 + Math.sin(ang + 0.04) * 800,
      );
      beam.setDepth(201).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      beams.push(beam);
      this.tweens.add({ targets: beam, alpha: 0.5, duration: 600 });
    }

    const title = this.add.text(GAME_WIDTH / 2, 200, `✦  ${results.length} 连召唤  ✦`, {
      fontFamily: DS.font.display,
      fontSize: '40px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
      stroke: '#000', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffd76a', blur: 24, fill: true },
    }).setOrigin(0.5).setDepth(203).setAlpha(0).setScale(0);
    this.tweens.add({ targets: title, alpha: 1, scaleX: 1, scaleY: 1, duration: 600, ease: 'Back.easeOut' });
    this.tweens.add({ targets: title, y: 200 - 6, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    results.forEach((r, i) => {
      const base = HERO_MAP[r.heroId];
      const portrait = getHeroPortrait(base);
      const key = 'gacha_multi_' + base.id + '_' + i;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = startX + col * (cellW + 6);
      const y = startY + row * (cellH + 10);

      const rarityColor = DS.rarity[base.rarity as keyof typeof DS.rarity]?.edge || C.gold;
      const rarityNum = hex2n(rarityColor);
      const isHigh = ['SSR', 'UR'].includes(base.rarity);

      const cardG = this.add.graphics();
      cardG.fillStyle(0x050010, 0.9);
      cardG.fillRoundedRect(x + 3, y + 5, cellW, cellH, DS.radius.md);
      cardG.fillStyle(rarityNum, 0.4);
      cardG.fillRoundedRect(x, y, cellW, cellH, DS.radius.md);
      cardG.lineStyle(2, rarityNum, 1);
      cardG.strokeRoundedRect(x, y, cellW, cellH, DS.radius.md);
      cardG.setDepth(201).setAlpha(0);

      const card = this.add.image(x + cellW / 2, -100, key).setDisplaySize(cellW - 8, cellH - 36).setDepth(202);

      const name = this.add.text(x + cellW / 2, y + cellH - 14, base.name, {
        fontFamily: DS.font.display,
        fontSize: '16px',
        color: r.isFeatured ? DS.color.goldBright : DS.color.ink,
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(203).setAlpha(0);

      const rarityTag = this.add.text(x + 18, y + 14, base.rarity, {
        fontFamily: DS.font.display,
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(203).setAlpha(0);

      const rarityBg = this.add.graphics();
      rarityBg.fillStyle(rarityNum, 1);
      rarityBg.fillRoundedRect(x + 6, y + 6, 32, 18, 4);
      rarityBg.setDepth(202).setAlpha(0);

      this.tweens.add({
        targets: [card, cardG],
        y: y + cellH / 2,
        alpha: 1,
        duration: 700, delay: 400 + i * 100,
        ease: 'Bounce.easeOut',
      });

      this.tweens.add({
        targets: [name, rarityTag, rarityBg],
        alpha: 1, duration: 300, delay: 600 + i * 100,
      });

      if (isHigh) {
        const glow = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, rarityNum, 0).setDepth(200);
        this.time.delayedCall(700 + i * 100, () => {
          this.tweens.add({ targets: glow, alpha: 0.45, duration: 300, yoyo: true, repeat: 3 });
          ringPulse(this, x + cellW / 2, y + cellH / 2, rarityNum, 80, 600);
        });
      }
    });

    const btn = button(this, GAME_WIDTH / 2 - 100, GAME_HEIGHT - 110, 200, 60, '继  续', () => {
      [overlay, title, btn, ...beams].forEach((o) => o && o.destroy());
      this.scene.restart();
    }, { fontSize: 26, variant: 'gold' });
    btn.setDepth(203).setAlpha(0);
    this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: results.length * 100 + 1100 });

    this.time.delayedCall(results.length * 100 + 1200, () => {
      starBurst(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, C.gold, 24);
      burst(this, { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, count: 80, color: C.gold, color2: 0xffffff, speed: 240, size: 6, life: 1500 });
      floatingSparkles(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 40);
      this.animating = false;
    });
  }

  shutdown() {}
}

function hex2n(h: string): number { return parseInt(h.replace('#', ''), 16); }