import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';

export const COLORS = {
  bg: 0x0e0e1e,
  panel: 0x1a1a2e,
  panelLight: 0x23234a,
  border: 0x4a4a8a,
  primary: 0x6ad1ff,
  accent: 0xc084fc,
  gold: 0xfbbf24,
  goldHex: '#fbbf24',
  danger: 0xef4444,
  success: 0x10b981,
  text: '#ffffff',
  textDim: '#9ca3af',
  textGold: '#fbbf24',
};

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, color = COLORS.panel) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(x, y, w, h, 16);
  g.lineStyle(2, COLORS.border, 1);
  g.strokeRoundedRect(x, y, w, h, 16);
  return g;
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  onClick: () => void,
  options: { color?: number; textColor?: string; fontSize?: number; radius?: number; disabled?: boolean } = {},
): Phaser.GameObjects.Container {
  const color = options.color ?? COLORS.primary;
  const radius = options.radius ?? 12;
  const fontSize = options.fontSize ?? 22;
  const c = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.fillStyle(color, options.disabled ? 0.4 : 1);
  bg.fillRoundedRect(0, 0, w, h, radius);
  c.add(bg);
  const t = scene.add.text(w / 2, h / 2, text, {
    fontSize: `${fontSize}px`,
    color: options.textColor ?? '#0e0e1e',
    fontFamily: 'sans-serif',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(t);
  c.setSize(w, h);
  c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
  if (!options.disabled) {
    c.on('pointerdown', () => {
      scene.tweens.add({ targets: c, scaleX: 0.95, scaleY: 0.95, duration: 60, yoyo: true });
      audio.playSfx('click');
      onClick();
    });
    c.on('pointerover', () => bg.setAlpha(0.85));
    c.on('pointerout', () => bg.setAlpha(1));
  }
  return c;
}

export function iconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  glyph: string,
  onClick: () => void,
  color = COLORS.primary,
) {
  return button(scene, x, y, size, size, glyph, onClick, { color, fontSize: Math.floor(size * 0.45), radius: size / 4 });
}

export function backBar(scene: Phaser.Scene, title: string, onBack?: () => void) {
  const g = scene.add.graphics();
  g.fillStyle(0x0e0e1e, 0.8);
  g.fillRect(0, 0, GAME_WIDTH, 80);
  g.lineStyle(2, COLORS.border, 1);
  g.lineBetween(0, 80, GAME_WIDTH, 80);
  if (onBack) iconButton(scene, 12, 12, 56, '‹', () => onBack(), COLORS.panelLight).setX(12);
  scene.add.text(GAME_WIDTH / 2, 40, title, {
    fontSize: '28px',
    color: COLORS.text,
    fontStyle: 'bold',
  }).setOrigin(0.5);
}

export function tabBar(scene: Phaser.Scene, tabs: { name: string; onClick: () => void; active?: boolean }[]) {
  const w = GAME_WIDTH / tabs.length;
  const h = 80;
  const g = scene.add.graphics();
  g.fillStyle(0x12122a, 1);
  g.fillRect(0, GAME_HEIGHT - h, GAME_WIDTH, h);
  tabs.forEach((t, i) => {
    const x = i * w;
    const bg = scene.add.rectangle(x + w / 2, GAME_HEIGHT - h / 2, w, h, t.active ? COLORS.panelLight : 0x00000000).setOrigin(0.5).setInteractive();
    bg.on('pointerdown', t.onClick);
    scene.add.text(x + w / 2, GAME_HEIGHT - h / 2, t.name, {
      fontSize: '20px',
      color: t.active ? COLORS.goldHex : COLORS.textDim,
      fontStyle: t.active ? 'bold' : 'normal',
    }).setOrigin(0.5);
  });
}

export function topBar(scene: Phaser.Scene) {
  return topBarWith(scene, () => {});
}

export function topBarWith(scene: Phaser.Scene, refresh: () => void) {
  const y = 0;
  const g = scene.add.graphics();
  g.fillStyle(0x12122a, 0.95);
  g.fillRect(0, y, GAME_WIDTH, 80);
  g.lineStyle(2, COLORS.border, 1);
  g.lineBetween(0, 80, GAME_WIDTH, 80);
  return g;
}

export function toast(scene: Phaser.Scene, text: string, color: number = COLORS.accent) {
  const t = scene.add.text(GAME_WIDTH / 2, 120, text, {
    fontSize: '22px',
    color: '#ffffff',
    fontStyle: 'bold',
    backgroundColor: color === COLORS.accent ? '#7c3aed' : color === COLORS.success ? '#059669' : '#dc2626',
    padding: { left: 20, right: 20, top: 10, bottom: 10 },
  }).setOrigin(0.5).setAlpha(0);
  scene.tweens.add({
    targets: t, alpha: 1, y: 140, duration: 200, hold: 1200,
    onComplete: () => scene.tweens.add({ targets: t, alpha: 0, y: 100, duration: 300, onComplete: () => t.destroy() }),
  });
}