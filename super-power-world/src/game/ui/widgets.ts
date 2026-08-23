import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import { DS, C, drawFrame, drawOrnamentCorner, drawVipRibbon, drawGemBadge, drawEnergyRing } from './designSystem';

export const COLORS = {
  bg: 0x0e0e1e,
  panel: C.panel,
  panelLight: C.panelSoft,
  border: C.panelLine,
  primary: C.cyan,
  accent: C.violet,
  gold: C.gold,
  goldHex: '#fbbf24',
  danger: C.ember,
  success: C.leaf,
  text: '#ffffff',
  textDim: '#9ca3af',
  textGold: '#f6c453',
};

export function panel(
  scene: Phaser.Scene, x: number, y: number, w: number, h: number,
  color: number = C.panel,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const r = DS.radius.lg;
  g.fillStyle(C.bgDeep, DS.alpha.bg);
  g.fillRoundedRect(x - 3, y - 3, w + 6, h + 6, r + 3);
  g.fillStyle(color, DS.alpha.bg);
  g.fillRoundedRect(x, y, w, h, r);
  g.lineStyle(DS.stroke.medium, C.gold, 0.9);
  g.strokeRoundedRect(x, y, w, h, r);
  g.lineStyle(DS.stroke.hairline, 0xffffff, 0.18);
  g.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, r - 2);
  drawOrnamentCorner(g, x, y, w, h, C.gold, 1);
  return g;
}

export function button(
  scene: Phaser.Scene,
  x: number, y: number,
  w: number, h: number,
  text: string,
  onClick: () => void,
  options: {
    color?: number;
    edge?: number;
    textColor?: string;
    fontSize?: number;
    radius?: number;
    disabled?: boolean;
    variant?: 'primary' | 'gold' | 'danger' | 'flat';
    icon?: string;
  } = {},
): Phaser.GameObjects.Container {
  const variant = options.variant ?? 'primary';
  const colorMap = {
    primary: { fill: C.cyan, edge: C.cyanGlow, ink: '#0a1a3a' },
    gold: { fill: C.gold, edge: C.goldBright, ink: '#3a200a' },
    danger: { fill: C.ember, edge: 0xffb39a, ink: '#3a0a0a' },
    flat: { fill: C.panelSoft, edge: C.panelLine, ink: '#ffffff' },
  };
  const tone = colorMap[variant];
  const fill = options.color ?? tone.fill;
  const edge = options.edge ?? tone.edge;
  const radius = options.radius ?? DS.radius.md;
  const fontSize = options.fontSize ?? Math.max(18, Math.floor(h * 0.42));
  const textColor = options.textColor ?? tone.ink;

  const c = scene.add.container(x, y);

  const bg = scene.add.graphics();
  bg.fillStyle(0x050010, 0.65);
  bg.fillRoundedRect(2, 4, w, h, radius);
  bg.fillStyle(fill, options.disabled ? 0.45 : 1);
  bg.fillRoundedRect(0, 0, w, h, radius);
  bg.fillGradientStyle(0xffffff, 0xffffff, fill, fill, options.disabled ? 0.15 : 0.35);
  bg.fillRoundedRect(2, 2, w - 4, h * 0.45, radius - 2);
  bg.lineStyle(DS.stroke.medium, edge, options.disabled ? 0.5 : 1);
  bg.strokeRoundedRect(0, 0, w, h, radius);
  bg.lineStyle(DS.stroke.hairline, 0xffffff, options.disabled ? 0.1 : 0.45);
  bg.strokeRoundedRect(2, 2, w - 4, h - 4, radius - 2);

  c.add(bg);

  if (!options.disabled) {
    const hi = scene.add.graphics();
    hi.fillStyle(0xffffff, 0.5);
    hi.fillRoundedRect(6, 4, w - 12, Math.max(2, h * 0.18), radius - 3);
    c.add(hi);
  }

  const cx = w / 2 + (options.icon ? 10 : 0);
  const t = scene.add.text(cx, h / 2 + 2, text, {
    fontFamily: DS.font.display,
    fontSize: `${fontSize}px`,
    color: textColor,
    fontStyle: 'bold',
    stroke: 'rgba(0,0,0,0.35)',
    strokeThickness: options.disabled ? 0 : 2,
  }).setOrigin(0.5);
  c.add(t);

  if (options.icon) {
    const iconText = scene.add.text(w / 2 - t.width / 2 - 12, h / 2 + 2, options.icon, {
      fontFamily: DS.font.display,
      fontSize: `${fontSize + 4}px`,
      color: textColor,
    }).setOrigin(0.5);
    c.add(iconText);
  }

  drawOrnamentCorner(bg, 0, 0, w, h, edge, 0.7);

  c.setSize(w, h);
  c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

  if (!options.disabled) {
    c.on('pointerdown', () => {
      scene.tweens.add({ targets: c, scaleX: 0.94, scaleY: 0.94, duration: 60, yoyo: true });
      audio.playSfx('click');
      onClick();
    });
    c.on('pointerover', () => {
      bg.setAlpha(1.1);
      scene.tweens.add({ targets: c, scaleX: 1.04, scaleY: 1.04, duration: 120 });
    });
    c.on('pointerout', () => {
      bg.setAlpha(1);
      scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 120 });
    });
  }
  return c;
}

export function iconButton(
  scene: Phaser.Scene,
  x: number, y: number, size: number, glyph: string, onClick: () => void,
  color: number = C.cyan,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x050010, 0.7);
  g.fillCircle(size / 2 + 2, size / 2 + 4, size / 2);
  g.fillStyle(color, 1);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.lineStyle(DS.stroke.medium, 0xffffff, 0.5);
  g.strokeCircle(size / 2, size / 2, size / 2);
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(size / 2, size / 2 - size * 0.15, size * 0.18);
  c.add(g);

  const t = scene.add.text(size / 2, size / 2 + 2, glyph, {
    fontFamily: DS.font.display,
    fontSize: `${Math.floor(size * 0.5)}px`,
    color: '#ffffff',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(t);

  c.setSize(size, size);
  c.setInteractive(new Phaser.Geom.Rectangle(0, 0, size, size), Phaser.Geom.Rectangle.Contains);
  c.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.9, scaleY: 0.9, duration: 60, yoyo: true });
    audio.playSfx('click');
    onClick();
  });
  return c;
}

export function backBar(scene: Phaser.Scene, title: string, onBack?: () => void) {
  const g = scene.add.graphics();
  g.fillStyle(C.bgDeep, 0.94);
  g.fillRect(0, 0, GAME_WIDTH, 96);
  g.fillStyle(C.gold, 0.65);
  g.fillRect(0, 94, GAME_WIDTH, 2);
  g.fillStyle(0x000000, 0.5);
  g.fillRect(0, 96, GAME_WIDTH, 6);

  if (onBack) {
    const back = iconButton(scene, 16, 18, 60, '‹', () => onBack(), C.panelSoft);
    back.setDepth(10);
    const bg = scene.add.graphics();
    bg.fillStyle(C.gold, 1);
    bg.fillCircle(46, 48, 22);
    bg.lineStyle(2, C.gold, 1);
    bg.strokeCircle(46, 48, 26);
  }

  const plate = scene.add.graphics();
  plate.fillStyle(C.bgDeep, 0.85);
  plate.fillRoundedRect(GAME_WIDTH / 2 - 180, 18, 360, 60, 30);
  plate.lineStyle(2, C.gold, 0.9);
  plate.strokeRoundedRect(GAME_WIDTH / 2 - 180, 18, 360, 60, 30);
  plate.fillStyle(0xffffff, 0.08);
  plate.fillRoundedRect(GAME_WIDTH / 2 - 178, 22, 356, 22, 28);

  scene.add.text(GAME_WIDTH / 2, 50, title, {
    fontFamily: DS.font.display,
    fontSize: '32px',
    color: DS.color.goldBright,
    fontStyle: 'bold',
  }).setOrigin(0.5);

  drawVipRibbon(scene, GAME_WIDTH - 60, 48, 'VIP', 2).setDepth(11);
}

export function tabBar(
  scene: Phaser.Scene,
  tabs: { name: string; onClick: () => void; active?: boolean; glyph?: string }[],
) {
  const w = GAME_WIDTH / tabs.length;
  const h = 96;
  const g = scene.add.graphics();
  g.fillStyle(C.bgDeep, 0.96);
  g.fillRect(0, GAME_HEIGHT - h, GAME_WIDTH, h);
  g.fillStyle(C.gold, 0.7);
  g.fillRect(0, GAME_HEIGHT - h, GAME_WIDTH, 2);

  tabs.forEach((t, i) => {
    const x = i * w;
    if (t.active) {
      const tabG = scene.add.graphics();
      tabG.fillStyle(C.gold, 0.2);
      tabG.fillRect(x, GAME_HEIGHT - h, w, h);
      tabG.fillStyle(C.gold, 1);
      tabG.fillRect(x + w / 2 - 24, GAME_HEIGHT - h - 4, 48, 4);
      tabG.fillStyle(C.goldBright, 1);
      tabG.fillCircle(x + w / 2, GAME_HEIGHT - h - 6, 3);
    }
    const bg = scene.add.rectangle(x + w / 2, GAME_HEIGHT - h / 2, w, h, 0x00000000).setOrigin(0.5).setInteractive();
    bg.on('pointerdown', () => {
      audio.playSfx('click');
      t.onClick();
    });

    if (t.glyph) {
      scene.add.text(x + w / 2, GAME_HEIGHT - h / 2 + 6, t.glyph, {
        fontFamily: DS.font.display,
        fontSize: '28px',
        color: t.active ? DS.color.goldBright : DS.color.inkDim,
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
    scene.add.text(x + w / 2, GAME_HEIGHT - h / 2 + 38, t.name, {
      fontFamily: DS.font.body,
      fontSize: '18px',
      color: t.active ? DS.color.goldBright : DS.color.inkDim,
      fontStyle: t.active ? 'bold' : '500',
    }).setOrigin(0.5);
  });
}

export function topBar(scene: Phaser.Scene) {
  return topBarWith(scene, () => {});
}

export function topBarWith(scene: Phaser.Scene, refresh: () => void) {
  const y = 0;
  const g = scene.add.graphics();
  g.fillStyle(C.bgDeep, 0.94);
  g.fillRect(0, y, GAME_WIDTH, 100);
  g.fillStyle(C.gold, 0.5);
  g.fillRect(0, 100, GAME_WIDTH, 2);
  return g;
}

export function toast(
  scene: Phaser.Scene, text: string, color: number = C.violet,
) {
  const w = Math.max(240, text.length * 28 + 60);
  const c = scene.add.container(GAME_WIDTH / 2, -100);

  const g = scene.add.graphics();
  g.fillStyle(0x050010, 0.9);
  g.fillRoundedRect(-w / 2 + 4, 0 + 6, w, 64, 32);
  g.fillStyle(color, 1);
  g.fillRoundedRect(-w / 2, 0, w, 64, 32);
  g.fillGradientStyle(0xffffff, 0xffffff, color, color, 0.3);
  g.fillRoundedRect(-w / 2 + 4, 4, w - 8, 24, 28);
  g.lineStyle(2, 0xffffff, 0.7);
  g.strokeRoundedRect(-w / 2, 0, w, 64, 32);

  c.add(g);

  const t = scene.add.text(0, 32, text, {
    fontFamily: DS.font.display,
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2,
  }).setOrigin(0.5);
  c.add(t);

  c.setDepth(DS.depth.toast);

  scene.tweens.add({
    targets: c, y: 130, duration: 350, ease: 'Back.easeOut',
    onComplete: () => scene.tweens.add({
      targets: c, y: -100, alpha: 0, duration: 400, delay: 1400,
      onComplete: () => c.destroy(),
    }),
  });
}

export function resourceChip(
  scene: Phaser.Scene,
  x: number, y: number, w: number, glyph: string, label: string,
  color: number, value: string | number,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x050010, 0.85);
  g.fillRoundedRect(2, 4, w, 44, 22);
  g.fillStyle(color, 1);
  g.fillRoundedRect(0, 0, w, 44, 22);
  g.fillGradientStyle(0xffffff, 0xffffff, color, color, 0.3);
  g.fillRoundedRect(2, 2, w - 4, 18, 20);
  g.lineStyle(2, 0xffffff, 0.45);
  g.strokeRoundedRect(0, 0, w, 44, 22);
  c.add(g);

  const ico = scene.add.circle(22, 22, 14, 0x050010, 0.4);
  ico.setStrokeStyle(1, 0xffffff, 0.5);
  c.add(ico);

  const glyphText = scene.add.text(22, 23, glyph, {
    fontFamily: DS.font.display,
    fontSize: '22px',
    color: '#ffffff',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(glyphText);

  const valText = scene.add.text(46, 22, value.toString(), {
    fontFamily: DS.font.display,
    fontSize: '22px',
    color: '#ffffff',
    fontStyle: 'bold',
  }).setOrigin(0, 0.5);
  c.add(valText);

  c.setSize(w, 44);
  return c;
}

export function giantGemResource(
  scene: Phaser.Scene,
  x: number, y: number, w: number, glyph: string,
  value: string | number, color: number, edge = C.gold,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const h = 60;

  const g = scene.add.graphics();
  g.fillStyle(0x050010, 0.9);
  g.fillRoundedRect(2, 6, w, h, 30);
  g.fillStyle(color, 1);
  g.fillRoundedRect(0, 0, w, h, 30);
  g.fillGradientStyle(0xffffff, 0xffffff, color, color, 0.35);
  g.fillRoundedRect(2, 2, w - 4, 24, 28);
  g.lineStyle(2.5, edge, 1);
  g.strokeRoundedRect(0, 0, w, h, 30);
  g.fillStyle(0xffffff, 0.5);
  g.fillRoundedRect(4, 4, w - 8, 4, 4);
  c.add(g);

  drawGemBadge(scene, 30, h / 2, 40, glyph, color, edge).setX(30);
  const gem = drawGemBadge(scene, 30, h / 2, 40, glyph, color, edge);
  c.add(gem);

  const t = scene.add.text(w / 2 + 14, h / 2, value.toString(), {
    fontFamily: DS.font.display,
    fontSize: '26px',
    color: '#ffffff',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(t);

  c.setSize(w, h);
  return c;
}

export { drawFrame, drawVipRibbon, drawGemBadge, drawEnergyRing } from './designSystem';