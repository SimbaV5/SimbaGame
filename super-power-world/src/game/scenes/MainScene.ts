import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { button, tabBar, giantGemResource, drawFrame } from '../ui/widgets';
import {
  DS, C, drawOrnamentDivider, drawVipRibbon,
  drawStarStuddedBackground, drawFactionSymbol,
} from '../ui/designSystem';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { expToLevel } from '@/core/formulas';

export class MainScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];
  private bgOrbs: Phaser.GameObjects.Arc[] = [];
  private currencyTexts: { [k: string]: Phaser.GameObjects.Text } = {};
  private levelText!: Phaser.GameObjects.Text;
  private expFill!: Phaser.GameObjects.Graphics;
  private powerText!: Phaser.GameObjects.Text;

  constructor() { super('MainScene'); }

  create() {
    this.cameras.main.setBackgroundColor(DS.color.bgDeep);
    this.drawBackdrop();
    this.drawHeroSpotlight();
    this.drawTopBar();
    this.drawMidSection();
    this.drawMainGrid();
    tabBar(this, [
      { name: '主页', onClick: () => this.scene.restart(), active: true, glyph: '⌂' },
      { name: '英雄', onClick: () => this.scene.start('HeroScene'), glyph: '♛' },
      { name: '冒险', onClick: () => this.scene.start('StageScene'), glyph: '⚔' },
      { name: '召唤', onClick: () => this.scene.start('GachaScene'), glyph: '✦' },
      { name: '更多', onClick: () => this.openMore(), glyph: '☰' },
    ]);
    this.events.on('shutdown', () => {
      this.bgStars.forEach(s => s.destroy());
      this.bgOrbs.forEach(o => o.destroy());
    });
  }

  private drawBackdrop() {
    const g = this.add.graphics();
    g.fillGradientStyle(
      hex2n(DS.color.bgDeep), hex2n(DS.color.bgDeep),
      hex2n(DS.color.bgWarm), hex2n(DS.color.magentaDeep),
      1,
    );
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawStarStuddedBackground(this, GAME_WIDTH, GAME_HEIGHT, 0.00045).setAlpha(0.6);

    for (let i = 0; i < 3; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(80, GAME_WIDTH - 80),
        Phaser.Math.Between(420, GAME_HEIGHT - 240),
        Phaser.Math.Between(80, 140),
        [C.magenta, C.gold, C.violet][i],
        0.07,
      );
      this.bgOrbs.push(orb);
      this.tweens.add({
        targets: orb,
        alpha: 0.16, scaleX: 1.18, scaleY: 1.18,
        duration: Phaser.Math.Between(4000, 7000),
        yoyo: true, repeat: -1, delay: i * 500,
      });
    }

    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(200, GAME_HEIGHT - 220);
      const star = this.add.text(x, y, '✦', {
        fontFamily: DS.font.display,
        fontSize: `${Phaser.Math.Between(10, 18)}px`,
        color: DS.color.goldBright,
      }).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.15, 0.5));
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.6),
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(5000, 10000),
        repeat: -1,
      });
    }
  }

  private drawHeroSpotlight() {
    const hero = useHeroStore().heroes;
    const slot = hero[0];
    const stageW = GAME_WIDTH - 32;
    const x = 16, y = 16;
    const h = 280;

    const frame = drawFrame(this, x, y, stageW, h, {
      fill: C.bgMid,
      fillAlpha: 0.78,
      edge: C.gold,
      edgeAlpha: 0.95,
      radius: DS.radius.lg,
      ornament: true,
      glow: 0.25,
      glowColor: C.magenta,
    });

    const player = usePlayerStore();

    const avBg = this.add.graphics();
    avBg.fillStyle(0x050010, 0.9);
    avBg.fillCircle(x + 76, y + 76, 48);
    avBg.fillStyle(C.bgWarm, 1);
    avBg.fillCircle(x + 72, y + 72, 44);
    avBg.lineStyle(3, C.gold, 1);
    avBg.strokeCircle(x + 72, y + 72, 44);
    avBg.lineStyle(1, 0xffffff, 0.35);
    avBg.strokeCircle(x + 72, y + 72, 38);

    this.add.text(x + 72, y + 72, player.save.nickname.slice(0, 1), {
      fontFamily: DS.font.display,
      fontSize: '46px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: avBg,
      scaleX: 1.04, scaleY: 1.04,
      duration: 1500, yoyo: true, repeat: -1,
    });

    const nameText = this.add.text(x + 144, y + 38, player.save.nickname, {
      fontFamily: DS.font.display,
      fontSize: '34px',
      color: DS.color.ink,
      fontStyle: 'bold',
    });
    this.levelText = this.add.text(x + 144 + nameText.width + 12, y + 50, `Lv.${player.save.level}`, {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: DS.color.cyanGlow,
      fontStyle: 'bold',
    });

    const equippedTitle = (player.save as any).equippedTitle || 't_novice';
    const titleMap: Record<string, string> = {
      t_novice: '初入超能',
      t_challenger: '挑战者',
      t_collector: '收藏家',
      t_pillager: '掠夺者',
      t_champion: '冠军',
      t_legend: '传说英雄',
      t_mythic: '神话领主',
      t_god: '超能之神',
    };
    const titleName = titleMap[equippedTitle] || '初入超能';

    const titlePlate = this.add.graphics();
    titlePlate.fillStyle(0x050010, 0.85);
    titlePlate.fillRoundedRect(x + 144, y + 86, 220, 30, 6);
    titlePlate.fillStyle(C.magenta, 1);
    titlePlate.fillRoundedRect(x + 144, y + 86, 8, 30, 3);
    titlePlate.lineStyle(1, C.magenta, 0.7);
    titlePlate.strokeRoundedRect(x + 144, y + 86, 220, 30, 6);

    this.add.text(x + 156, y + 101, `◈ ${titleName}`, {
      fontFamily: DS.font.body,
      fontSize: '20px',
      color: DS.color.magentaGlow,
      fontStyle: 'bold',
    });

    const expLabel = this.add.text(x + 144, y + 130, '经验', {
      fontFamily: DS.font.body,
      fontSize: '18px',
      color: DS.color.inkMute,
    });
    this.expFill = this.add.graphics();
    this.drawExpBar(x + 144, y + 156, 220);

    const powerLabel = this.add.text(x + 144, y + 184, '战力', {
      fontFamily: DS.font.body,
      fontSize: '18px',
      color: DS.color.inkMute,
    });
    this.powerText = this.add.text(x + 144 + 70, y + 184, '1,280', {
      fontFamily: DS.font.display,
      fontSize: '26px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });

    drawVipRibbon(this, x + stageW - 90, y + 30, 'VIP', 5).setDepth(12);

    if (slot) {
      const portrait = getHeroPortrait(HERO_MAP[slot.heroId]);
      const key = 'h_portrait_' + slot.uid;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);

      const showcaseW = 200, showcaseH = 240;
      const sx = x + stageW - showcaseW - 18;
      const sy = y + 30;

      const platform = this.add.graphics();
      platform.fillStyle(0x050010, 0.9);
      platform.fillEllipse(sx + showcaseW / 2, sy + showcaseH - 8, 180, 22);
      platform.fillStyle(C.magenta, 0.45);
      platform.fillEllipse(sx + showcaseW / 2, sy + showcaseH - 4, 160, 16);

      const ring = this.add.graphics();
      ring.lineStyle(3, C.gold, 0.85);
      ring.strokeCircle(sx + showcaseW / 2, sy + showcaseH / 2, 96);
      ring.fillStyle(C.magenta, 0.18);
      ring.fillCircle(sx + showcaseW / 2, sy + showcaseH / 2, 96);

      this.tweens.add({
        targets: ring,
        scaleX: 1.08, scaleY: 1.08,
        duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      const sprite = this.add.image(sx + showcaseW / 2, sy + showcaseH / 2, key);
      sprite.setDisplaySize(180, 180);
      sprite.setAlpha(0).setScale(0.4);

      this.tweens.add({
        targets: sprite,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 800, ease: 'Back.easeOut', delay: 200,
      });

      this.tweens.add({
        targets: sprite,
        y: sprite.y - 8,
        duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      const baseHero = HERO_MAP[slot.heroId];
      const heroNamePlate = this.add.graphics();
      heroNamePlate.fillStyle(0x050010, 0.95);
      heroNamePlate.fillRoundedRect(sx + 16, sy + 16, 168, 26, 4);
      heroNamePlate.fillStyle(C.gold, 1);
      heroNamePlate.fillRect(sx + 16, sy + 16, 4, 26);
      this.add.text(sx + 100, sy + 29, baseHero.name, {
        fontFamily: DS.font.display,
        fontSize: '20px',
        color: DS.color.goldBright,
        fontStyle: 'bold',
      }).setOrigin(0.5);

      const rarityColor = rarity2n(baseHero.rarity);
      const rarityBadge = this.add.graphics();
      rarityBadge.fillStyle(rarityColor, 1);
      rarityBadge.fillRoundedRect(sx + 16, sy + showcaseH - 42, 60, 22, 4);
      rarityBadge.lineStyle(1, 0xffffff, 0.6);
      rarityBadge.strokeRoundedRect(sx + 16, sy + showcaseH - 42, 60, 22, 4);
      this.add.text(sx + 46, sy + showcaseH - 31, baseHero.rarity, {
        fontFamily: DS.font.display,
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      drawFactionSymbol(this, sx + showcaseW - 32, sy + showcaseH - 32, baseHero.faction, 28);
    }
  }

  private drawExpBar(x: number, y: number, w: number) {
    this.expFill.clear();
    const player = usePlayerStore();
    const need = expToLevel(player.save.level);
    const ratio = Math.min(1, player.save.exp / Math.max(1, need));
    this.expFill.fillStyle(0x050010, 0.8);
    this.expFill.fillRoundedRect(x - 2, y - 2, w + 4, 14, 7);
    this.expFill.lineStyle(1, 0xffffff, 0.2);
    this.expFill.strokeRoundedRect(x, y, w, 10, 5);
    this.expFill.fillStyle(C.cyan, 1);
    this.expFill.fillRoundedRect(x, y, w * ratio, 10, 5);
    this.expFill.fillStyle(0xffffff, 0.4);
    this.expFill.fillRoundedRect(x + 2, y + 1, w * ratio - 4, 3, 3);
    this.add.text(x + w + 8, y + 4, `${player.save.exp}/${need}`, {
      fontFamily: DS.font.body,
      fontSize: '14px',
      color: DS.color.inkDim,
    });
  }

  private drawTopBar() {
    const player = usePlayerStore();
    const y = 310;

    const resources = [
      { glyph: '◈', value: player.save.gold, color: C.gold, edge: C.goldBright },
      { glyph: '✦', value: player.save.gem, color: C.cyan, edge: C.cyanGlow },
      { glyph: '⚡', value: player.save.stamina, color: C.leaf, edge: 0x9fe5b8 },
      { glyph: '☽', value: player.save.soul, color: C.violet, edge: 0xc7a9ff },
    ];
    const totalW = GAME_WIDTH - 32;
    const cellW = (totalW - 12) / resources.length;
    resources.forEach((r, i) => {
      const rx = 16 + i * (cellW + 4);
      const chip = giantGemResource(this, rx, y, cellW, r.glyph, format(r.value), r.color, r.edge);
      chip.setDepth(DS.depth.panel);
    });
    this.currencyTexts = resources.map((r, i) => {
      const rx = 16 + i * (cellW + 4);
      return {
        [r.glyph]: this.add.text(rx + cellW / 2 + 14, y + 30, format(r.value), {
          fontFamily: DS.font.display,
          fontSize: '26px',
          color: '#ffffff',
          fontStyle: 'bold',
        }).setOrigin(0.5),
      };
    }).reduce((acc, cur) => ({ ...acc, ...cur }), {} as any);
  }

  private drawMidSection() {
    const y = 400;
    const w = GAME_WIDTH - 32;
    const h = 64;

    const plate = this.add.graphics();
    plate.fillStyle(C.bgDeep, 0.85);
    plate.fillRoundedRect(16, y, w, h, DS.radius.md);
    plate.lineStyle(2, C.gold, 0.7);
    plate.strokeRoundedRect(16, y, w, h, DS.radius.md);
    plate.fillStyle(C.magenta, 0.25);
    plate.fillRect(16, y, 6, h);

    const bannerTitle = this.add.text(32, y + 12, '每日签到', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });

    const bannerDesc = this.add.text(32, y + 38, '登录7天赠送传说英雄碎片', {
      fontFamily: DS.font.body,
      fontSize: '16px',
      color: DS.color.inkDim,
    });

    const reward = this.add.graphics();
    reward.fillStyle(C.gold, 1);
    reward.fillRoundedRect(w - 80, y + 12, 60, 40, 8);
    reward.lineStyle(2, C.goldBright, 1);
    reward.strokeRoundedRect(w - 80, y + 12, 60, 40, 8);
    reward.fillStyle(0xffffff, 0.4);
    reward.fillRoundedRect(w - 78, y + 14, 56, 10, 6);
    this.add.text(w - 50, y + 32, 'GO', {
      fontFamily: DS.font.display,
      fontSize: '20px',
      color: '#3a200a',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    plate.setInteractive(new Phaser.Geom.Rectangle(16, y, w, h), Phaser.Geom.Rectangle.Contains);
    plate.on('pointerdown', () => {
      this.scene.start('ActivityScene');
      audio.playSfx?.('click');
    });

    const dividerG = this.add.graphics();
    drawOrnamentDivider(dividerG, 16, y + h + 6, GAME_WIDTH - 32, C.gold, 0.6);
    dividerG.setAlpha(0.5);
  }

  private drawMainGrid() {
    const gridY = 490;
    const items = [
      { name: '召唤', sub: '抽卡大厅', color: C.magenta, edge: C.magentaGlow, onClick: () => this.scene.start('GachaScene') },
      { name: '关卡', sub: '主线推图', color: C.leaf, edge: 0x9fe5b8, onClick: () => this.scene.start('StageScene') },
      { name: '英雄', sub: '管理队伍', color: C.gold, edge: C.goldBright, onClick: () => this.scene.start('HeroScene') },
      { name: '合成', sub: '合并升级', color: C.cyan, edge: C.cyanGlow, onClick: () => this.scene.start('MergeScene') },
      { name: '试炼', sub: '爬塔挑战', color: C.ember, edge: 0xffb39a, onClick: () => this.scene.start('TrialTowerScene') },
      { name: '竞技', sub: '天梯对战', color: C.violet, edge: 0xc7a9ff, onClick: () => this.scene.start('ArenaScene') },
    ];
    const cols = 3;
    const cellW = (GAME_WIDTH - 40) / cols;
    const cellH = 168;
    items.forEach((it, i) => {
      const x = 16 + (i % cols) * (cellW + 4);
      const y = gridY + Math.floor(i / cols) * (cellH + 12);

      const g = this.add.graphics();
      g.fillStyle(0x050010, 0.85);
      g.fillRoundedRect(x + 4, y + 6, cellW, cellH, DS.radius.lg);
      g.fillStyle(it.color, 1);
      g.fillRoundedRect(x, y, cellW, cellH, DS.radius.lg);
      g.fillGradientStyle(0xffffff, 0xffffff, it.color, it.color, 0.3);
      g.fillRoundedRect(x + 2, y + 2, cellW - 4, cellH * 0.45, DS.radius.lg - 2);
      g.lineStyle(2.5, it.edge, 1);
      g.strokeRoundedRect(x, y, cellW, cellH, DS.radius.lg);
      g.lineStyle(1, 0xffffff, 0.45);
      g.strokeRoundedRect(x + 3, y + 3, cellW - 6, cellH - 6, DS.radius.lg - 3);

      const iconG = this.add.graphics();
      iconG.fillStyle(0x050010, 0.7);
      iconG.fillCircle(x + cellW / 2, y + 70, 36);
      iconG.fillStyle(it.edge, 0.3);
      iconG.fillCircle(x + cellW / 2, y + 70, 32);

      const icon = this.add.text(x + cellW / 2, y + 70, getGlyph(it.name), {
        fontFamily: DS.font.display,
        fontSize: '52px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 0, color: '#' + it.edge.toString(16).padStart(6, '0'), blur: 18, fill: true },
      }).setOrigin(0.5);

      const nameT = this.add.text(x + cellW / 2, y + 122, it.name, {
        fontFamily: DS.font.display,
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      const subT = this.add.text(x + cellW / 2, y + 148, it.sub, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#ffffffcc',
      }).setOrigin(0.5);

      const c = this.add.container(x, y);
      [g, iconG, icon, nameT, subT].forEach(o => c.add(o));
      c.setSize(cellW, cellH);
      c.setAlpha(0).setScale(0.5);

      this.tweens.add({
        targets: c,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 500, delay: 250 + i * 70, ease: 'Back.easeOut',
      });

      this.tweens.add({
        targets: c,
        scaleX: 1.025, scaleY: 1.025,
        duration: 1400 + i * 80, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut', delay: 1100 + i * 80,
      });

      c.setInteractive(new Phaser.Geom.Rectangle(0, 0, cellW, cellH), Phaser.Geom.Rectangle.Contains);
      c.on('pointerdown', () => {
        this.tweens.add({ targets: c, scaleX: 0.93, scaleY: 0.93, duration: 60, yoyo: true });
        it.onClick();
      });
    });

    const gridY2 = gridY + (Math.ceil(items.length / cols)) * (cellH + 12);
    const items2 = [
      { name: '公会', sub: '异兽讨伐', color: C.leaf, onClick: () => this.scene.start('GuildScene') },
      { name: '世界BOSS', sub: '虚空之龙', color: C.ember, onClick: () => this.scene.start('WorldBossScene') },
      { name: '商城', sub: '购买资源', color: C.violet, onClick: () => this.scene.start('ShopScene') },
      { name: '活动', sub: '每日福利', color: C.gold, onClick: () => this.scene.start('ActivityScene') },
      { name: '图鉴', sub: '收集奖励', color: C.cyan, onClick: () => this.scene.start('CodexScene') },
      { name: '资料', sub: '称号成就', color: C.magenta, onClick: () => this.scene.start('ProfileScene') },
    ];
    items2.forEach((it, i) => {
      const x = 16 + (i % cols) * (cellW + 4);
      const y = gridY2 + Math.floor(i / cols) * 100;

      const g = this.add.graphics();
      g.fillStyle(0x050010, 0.85);
      g.fillRoundedRect(x + 3, y + 5, cellW, 92, DS.radius.md);
      g.fillStyle(it.color, 0.85);
      g.fillRoundedRect(x, y, cellW, 92, DS.radius.md);
      g.fillStyle(0xffffff, 0.2);
      g.fillRect(x + 4, y + 4, 6, 84);
      g.lineStyle(2, 0xffffff, 0.4);
      g.strokeRoundedRect(x, y, cellW, 92, DS.radius.md);

      const iconBg = this.add.graphics();
      iconBg.fillStyle(0x050010, 0.6);
      iconBg.fillCircle(x + 38, y + 46, 26);
      iconBg.fillStyle(it.color, 1);
      iconBg.fillCircle(x + 36, y + 46, 24);

      const icon = this.add.text(x + 36, y + 46, getGlyph(it.name), {
        fontFamily: DS.font.display,
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      const nameT = this.add.text(x + 76, y + 36, it.name, {
        fontFamily: DS.font.display,
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      const subT = this.add.text(x + 76, y + 64, it.sub, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: '#ffffffcc',
      });

      const c = this.add.container(x, y);
      [g, iconBg, icon, nameT, subT].forEach(o => c.add(o));
      c.setSize(cellW, 92);
      c.setAlpha(0).setScale(0.5);
      this.tweens.add({
        targets: c,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 500, delay: 700 + i * 50, ease: 'Back.easeOut',
      });
      c.setInteractive(new Phaser.Geom.Rectangle(0, 0, cellW, 92), Phaser.Geom.Rectangle.Contains);
      c.on('pointerdown', () => {
        this.tweens.add({ targets: c, scaleX: 0.95, scaleY: 0.95, duration: 60, yoyo: true });
        it.onClick();
      });
    });
  }

  private openMore() {}

  update() {
    const player = usePlayerStore();
    const hero = useHeroStore().heroes;
    const slot = hero[0];
    if (slot && this.powerText) {
      const baseHero = HERO_MAP[slot.heroId];
      const power = (baseHero.baseAtk + slot.level * 8) * (1 + slot.star * 0.4 + slot.awaken * 0.5);
      this.powerText.setText(format(Math.floor(power)));
    }
    if (this.currencyTexts['◈']) this.currencyTexts['◈'].setText(format(player.save.gold));
    if (this.currencyTexts['✦']) this.currencyTexts['✦'].setText(format(player.save.gem));
    if (this.currencyTexts['⚡']) this.currencyTexts['⚡'].setText(`${player.save.stamina}/240`);
    if (this.currencyTexts['☽']) this.currencyTexts['☽'].setText(format(player.save.soul));
    if (this.levelText) this.levelText.setText(`Lv.${player.save.level}`);
    this.drawExpBar(160, 472, 220);
  }
}

function hex2n(h: string): number { return parseInt(h.replace('#', ''), 16); }
function format(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
  return n.toString();
}

const GLYPH_MAP: Record<string, string> = {
  召唤: '✦', 关卡: '⚔', 英雄: '♛', 合成: '✿',
  试炼: '⚡', 竞技: '⚞', 公会: '☖', 世界BOSS: '☠',
  商城: '◊', 活动: '☀', 图鉴: '✚', 资料: '☰',
};
function getGlyph(name: string): string { return GLYPH_MAP[name] || '✧'; }

function rarity2n(r: string): number {
  const m: Record<string, number> = { N: 0x808080, R: 0x4090d0, SR: 0xa060e0, SSR: 0xf6c453, UR: 0xff6a8a };
  return m[r] || 0x808080;
}

const audio = { playSfx: (_: string) => {} };