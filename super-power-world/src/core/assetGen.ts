// =========================================================
// 程序化生成 Q 版立绘与 UI 资源
// 使用 Canvas 绘制，最终输出 data URL 或 ImageBitmap
// =========================================================

import type { HeroBase, HeroClass, HeroElement, HeroFaction, HeroRarity } from '@/types';

const ELEMENT_COLOR: Record<HeroElement, { main: string; glow: string; bg: string }> = {
  fire: { main: '#ff6b35', glow: '#ffa552', bg: 'linear-gradient(135deg,#3a1010,#5a1c1c)' },
  water: { main: '#3a8ee6', glow: '#6ad1ff', bg: 'linear-gradient(135deg,#0d1b2a,#1b3a52)' },
  wind: { main: '#7ed957', glow: '#bef264', bg: 'linear-gradient(135deg,#1a2e15,#28471d)' },
  thunder: { main: '#facc15', glow: '#fef08a', bg: 'linear-gradient(135deg,#2e2a0d,#473b15)' },
  light: { main: '#fde68a', glow: '#ffffff', bg: 'linear-gradient(135deg,#3a331a,#5a4d1f)' },
  dark: { main: '#a78bfa', glow: '#c4b5fd', bg: 'linear-gradient(135deg,#160a2e,#2e1058)' },
};

const FACTION_DECOR: Record<HeroFaction, (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void> = {
  celestial: (ctx, x, y, size) => {
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.55, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
  },
  abyss: (ctx, x, y, size) => {
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, y - size * 0.55);
    ctx.lineTo(x, y - size * 0.65);
    ctx.lineTo(x + size * 0.08, y - size * 0.55);
    ctx.closePath();
    ctx.fill();
  },
  mecha: (ctx, x, y, size) => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12, y - size * 0.55);
    ctx.lineTo(x + size * 0.12, y - size * 0.55);
    ctx.stroke();
  },
  beast: (ctx, x, y, size) => {
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, y - size * 0.62);
    ctx.lineTo(x, y - size * 0.5);
    ctx.lineTo(x + size * 0.08, y - size * 0.62);
    ctx.closePath();
    ctx.fill();
  },
  spirit: (ctx, x, y, size) => {
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.55, size * 0.1, size * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  },
  human: (ctx, x, y, size) => {
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(x - size * 0.06, y - size * 0.6, size * 0.12, size * 0.05);
  },
};

const RARITY_BORDER: Record<HeroRarity, string> = {
  N: '#9ca3af',
  R: '#60a5fa',
  SR: '#a78bfa',
  SSR: '#fbbf24',
  UR: '#f97316',
  LR: '#ef4444',
  MRC: '#ec4899',
};

const CLASS_SHAPE: Record<HeroClass, (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => void> = {
  tank: (ctx, x, y, s, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x - s * 0.45, y + s * 0.2, s * 0.9, s * 0.4);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - s * 0.45, y + s * 0.2, s * 0.9, s * 0.08);
  },
  warrior: (ctx, x, y, s, c) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y + s * 0.5);
    ctx.lineTo(x, y + s * 0.1);
    ctx.lineTo(x + s * 0.45, y + s * 0.5);
    ctx.closePath();
    ctx.fill();
  },
  assassin: (ctx, x, y, s, c) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.4, s * 0.35, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - s * 0.04, y + s * 0.15, s * 0.08, s * 0.45);
  },
  ranger: (ctx, x, y, s, c) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y + s * 0.4, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.3, y + s * 0.3);
    ctx.lineTo(x + s * 0.7, y + s * 0.0);
    ctx.stroke();
  },
  mage: (ctx, x, y, s, c) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y + s * 0.55);
    ctx.lineTo(x + s * 0.5, y + s * 0.55);
    ctx.lineTo(x, y + s * 0.15);
    ctx.closePath();
    ctx.fill();
  },
  support: (ctx, x, y, s, c) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y + s * 0.4, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef9c3';
    ctx.font = `${s * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', x, y + s * 0.4);
  },
};

export function drawHeroPortrait(canvas: HTMLCanvasElement, hero: HeroBase) {
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const colors = ELEMENT_COLOR[hero.element];
  const bg = ctx.createLinearGradient(0, 0, size, size);
  if (colors.bg.includes('linear')) {
    const m = colors.bg.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    if (m) {
      bg.addColorStop(0, m[2]);
      bg.addColorStop(1, m[3]);
    }
  } else {
    bg.addColorStop(0, '#1a1a2e');
    bg.addColorStop(1, '#2a2a4e');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 装饰光环
  const cx = size / 2;
  const cy = size * 0.55;
  const ringR = size * 0.4;
  const ringGrad = ctx.createRadialGradient(cx, cy, ringR * 0.6, cx, cy, ringR);
  ringGrad.addColorStop(0, colors.glow + '88');
  ringGrad.addColorStop(1, colors.glow + '00');
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx.fill();

  // 阵营装饰
  FACTION_DECOR[hero.faction](ctx, cx, cy, size);

  // 角色身体（Q 版头大身小）
  const headR = size * 0.22;
  const headY = cy - size * 0.05;
  ctx.fillStyle = '#fde7d3';
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  // 头发
  ctx.fillStyle = colors.main;
  ctx.beginPath();
  ctx.arc(cx, headY - headR * 0.3, headR * 1.05, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - headR, headY - headR * 0.3, headR * 2, headR * 0.3);

  // 眼睛
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.35, headY, headR * 0.13, 0, Math.PI * 2);
  ctx.arc(cx + headR * 0.35, headY, headR * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // 高光
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.3, headY - headR * 0.05, headR * 0.04, 0, Math.PI * 2);
  ctx.arc(cx + headR * 0.4, headY - headR * 0.05, headR * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // 嘴
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, headY + headR * 0.2, headR * 0.2, 0, Math.PI);
  ctx.stroke();

  // 职业身体
  CLASS_SHAPE[hero.class](ctx, cx, cy, size, colors.main);

  // 阵营徽记
  ctx.fillStyle = colors.glow;
  ctx.font = `bold ${size * 0.18}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hero.rarity, cx, size - size * 0.08);

  // 边框
  ctx.strokeStyle = RARITY_BORDER[hero.rarity];
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);
}

const cache = new Map<string, HTMLCanvasElement>();

export function getHeroPortrait(hero: HeroBase): HTMLCanvasElement {
  if (cache.has(hero.id)) return cache.get(hero.id)!;
  const canvas = document.createElement('canvas');
  drawHeroPortrait(canvas, hero);
  cache.set(hero.id, canvas);
  return canvas;
}

export function drawIcon(key: string, size: number, color: string, glyph?: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph ?? key, size / 2, size / 2 + 4);
  return canvas;
}

const iconCache = new Map<string, HTMLCanvasElement>();
export function getIcon(key: string, color = '#fbbf24', glyph?: string): HTMLCanvasElement {
  const k = `${key}_${color}_${glyph ?? ''}`;
  if (iconCache.has(k)) return iconCache.get(k)!;
  const c = drawIcon(key, 64, color, glyph);
  iconCache.set(k, c);
  return c;
}