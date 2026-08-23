// =========================================================
// 程序化生成 Q 版立绘与 UI 资源 (V2 - 增强版)
// =========================================================

import type { HeroBase, HeroClass, HeroElement, HeroFaction, HeroRarity } from '@/types';

const ELEMENT_COLOR: Record<HeroElement, { main: string; glow: string; light: string; dark: string }> = {
  fire: { main: '#ff6b35', glow: '#ffa552', light: '#ffd9a3', dark: '#7a1c0a' },
  water: { main: '#3a8ee6', glow: '#6ad1ff', light: '#bfe1ff', dark: '#0d2a4a' },
  wind: { main: '#7ed957', glow: '#bef264', light: '#dff5b8', dark: '#1f3d12' },
  thunder: { main: '#facc15', glow: '#fef08a', light: '#fff7c0', dark: '#5a4a0a' },
  light: { main: '#fde68a', glow: '#ffffff', light: '#fff8d8', dark: '#7a6a1a' },
  dark: { main: '#a78bfa', glow: '#c4b5fd', light: '#ddd1ff', dark: '#2a1a5e' },
};

const RARITY_FRAME: Record<HeroRarity, { border: string; glow: string; corner: string }> = {
  N: { border: '#9ca3af', glow: '#d1d5db', corner: '#9ca3af' },
  R: { border: '#60a5fa', glow: '#93c5fd', corner: '#3b82f6' },
  SR: { border: '#a78bfa', glow: '#c4b5fd', corner: '#8b5cf6' },
  SSR: { border: '#fbbf24', glow: '#fde68a', corner: '#f59e0b' },
  UR: { border: '#f97316', glow: '#fdba74', corner: '#ea580c' },
  LR: { border: '#ef4444', glow: '#fca5a5', corner: '#dc2626' },
  MRC: { border: '#ec4899', glow: '#f9a8d4', corner: '#db2777' },
};

const FACTION_GLYPH: Record<HeroFaction, string> = {
  celestial: '☀',
  abyss: '☾',
  mecha: '⚙',
  beast: '⚔',
  spirit: '✦',
  human: '★',
};

const CLASS_GLYPH: Record<HeroClass, string> = {
  tank: '🛡',
  warrior: '⚔',
  assassin: '🗡',
  ranger: '🏹',
  mage: '✦',
  support: '♥',
};

export function drawHeroPortrait(canvas: HTMLCanvasElement, hero: HeroBase) {
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = ELEMENT_COLOR[hero.element];
  const f = RARITY_FRAME[hero.rarity];

  // 背景渐变
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, c.dark);
  bg.addColorStop(0.5, '#1a1a2e');
  bg.addColorStop(1, c.dark);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 装饰点
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.4;
    ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = size / 2;
  const cy = size * 0.5;

  // 元素光环多层
  for (let i = 0; i < 3; i++) {
    const ringR = size * 0.46 - i * 12;
    const ringGrad = ctx.createRadialGradient(cx, cy, ringR * 0.5, cx, cy, ringR);
    ringGrad.addColorStop(0, c.glow + Math.round(0.5 * 255).toString(16).padStart(2, '0'));
    ringGrad.addColorStop(1, c.glow + '00');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 阵营徽记 (顶部)
  ctx.save();
  ctx.font = `bold ${size * 0.16}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = c.glow;
  ctx.shadowColor = c.glow;
  ctx.shadowBlur = 12;
  ctx.fillText(FACTION_GLYPH[hero.faction], cx, cy - size * 0.42);
  ctx.restore();

  // 星座圈（稀有度）
  ctx.save();
  ctx.translate(cx, cy);
  const starCount = hero.rarity === 'MRC' ? 8 : hero.rarity === 'LR' ? 6 : hero.rarity === 'UR' ? 5 : 4;
  ctx.strokeStyle = f.border + '88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < starCount; i++) {
    const a = (i / starCount) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * size * 0.42;
    const y = Math.sin(a) * size * 0.42;
    ctx.fillStyle = f.glow;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 角色身体
  const headR = size * 0.22;
  const headY = cy - size * 0.05;

  // 身体轮廓
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.18, headR * 1.4, headR * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // 身体高光
  const bodyGrad = ctx.createLinearGradient(cx - headR, cy + size * 0.1, cx + headR, cy + size * 0.3);
  bodyGrad.addColorStop(0, c.light);
  bodyGrad.addColorStop(0.5, c.main);
  bodyGrad.addColorStop(1, c.dark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.18, headR * 1.4, headR * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 头
  ctx.fillStyle = '#fde7d3';
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  // 头阴影
  ctx.strokeStyle = '#d4a890';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 头发
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(cx, headY - headR * 0.3, headR * 1.05, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - headR, headY - headR * 0.3, headR * 2, headR * 0.3);
  // 头发高光
  ctx.fillStyle = c.light;
  ctx.beginPath();
  ctx.arc(cx - headR * 0.4, headY - headR * 0.15, headR * 0.3, 0, Math.PI);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.35, headY, headR * 0.13, 0, Math.PI * 2);
  ctx.arc(cx + headR * 0.35, headY, headR * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // 眼睛高光
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.3, headY - headR * 0.05, headR * 0.05, 0, Math.PI * 2);
  ctx.arc(cx + headR * 0.4, headY - headR * 0.05, headR * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // 腮红
  ctx.fillStyle = '#fda4afaa';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.55, headY + headR * 0.15, headR * 0.15, 0, Math.PI * 2);
  ctx.arc(cx + headR * 0.55, headY + headR * 0.15, headR * 0.15, 0, Math.PI * 2);
  ctx.fill();
  // 嘴
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, headY + headR * 0.2, headR * 0.2, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // 职业图标 (胸章)
  ctx.font = `${size * 0.12}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(cx, cy + size * 0.2, size * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a';
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.fillText(CLASS_GLYPH[hero.class], cx, cy + size * 0.2);

  // 稀有度标签
  ctx.font = `bold ${size * 0.12}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = f.border;
  ctx.shadowColor = f.glow;
  ctx.shadowBlur = 10;
  ctx.fillText(hero.rarity, cx, size - size * 0.08);
  ctx.shadowBlur = 0;

  // 边框 (多层稀有度光环)
  ctx.strokeStyle = f.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, size - 6, size - 6);
  ctx.strokeStyle = f.corner;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  // 角装饰
  ctx.fillStyle = f.corner;
  const corners: [number, number][] = [[0, 0], [size, 0], [0, size], [size, size]];
  corners.forEach(([x, y], i) => {
    ctx.save();
    ctx.translate(x, y);
    if (i === 1) ctx.rotate(Math.PI / 2);
    if (i === 2) ctx.rotate(-Math.PI / 2);
    if (i === 3) ctx.rotate(Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 20);
    ctx.closePath();
    ctx.fillStyle = f.corner;
    ctx.fill();
    ctx.restore();
  });
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