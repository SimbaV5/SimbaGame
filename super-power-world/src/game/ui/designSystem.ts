import Phaser from 'phaser';

export const DS = {
  color: {
    bgDeep: '#070418',
    bgNight: '#100929',
    bgMid: '#1a1140',
    bgWarm: '#2a1840',

    gold: '#f6c453',
    goldBright: '#ffd76a',
    goldDeep: '#a67520',
    goldSoft: '#7a5618',

    magenta: '#e64ba8',
    magentaDeep: '#8a2470',
    magentaGlow: '#ff7ec5',

    cyan: '#5cd1ff',
    cyanDeep: '#1f7da8',
    cyanGlow: '#9fe7ff',

    violet: '#9d6cff',
    violetDeep: '#5e3aa6',

    ember: '#ff6a3d',
    emberDeep: '#a83a1f',

    leaf: '#3ecf8e',
    leafDeep: '#1d6a48',

    ink: '#f4ecd0',
    inkDim: '#c5b8a0',
    inkMute: '#7a6f5e',

    panel: '#1a1030',
    panelSoft: '#241642',
    panelDeep: '#0d0822',
    panelEdge: '#3b245e',
    panelLine: '#6d4ba8',
    panelLineSoft: '#4a3270',
  },

  rarity: {
    N: { fill: '#5a6470', edge: '#8b95a0', glow: 'rgba(170,180,190,0.4)', label: '普通' },
    R: { fill: '#3aa0d4', edge: '#7cd0ff', glow: 'rgba(120,200,255,0.6)', label: '稀有' },
    SR: { fill: '#a060e0', edge: '#d59cff', glow: 'rgba(200,140,255,0.7)', label: '史诗' },
    SSR: { fill: '#f6c453', edge: '#ffe48a', glow: 'rgba(255,215,106,0.9)', label: '传说' },
    UR: { fill: '#ff6a8a', edge: '#ffb0c0', glow: 'rgba(255,140,170,1.0)', label: '神话' },
  },

  font: {
    display: 'Cinzel, "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif',
    body: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    mono: '"JetBrains Mono", "Consolas", monospace',
  },

  size: {
    micro: 14,
    sm: 18,
    base: 22,
    md: 28,
    lg: 36,
    xl: 48,
    xxl: 64,
    hero: 96,
  },

  weight: {
    thin: '300',
    reg: '500',
    bold: '700',
    black: '900',
  },

  space: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    huge: 96,
  },

  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 32,
  },

  alpha: {
    bg: 0.92,
    glass: 0.6,
    overlay: 0.78,
    edge: 0.5,
    ink: 1,
    inkDim: 0.85,
    inkMute: 0.55,
    glow: 0.7,
  },

  depth: {
    bg: 0,
    stars: 1,
    orb: 2,
    panel: 10,
    panelEdge: 11,
    content: 20,
    icon: 25,
    floating: 30,
    fx: 35,
    toast: 50,
    modal: 80,
    modalEdge: 81,
    curtain: 100,
  },

  shadow: {
    soft: '0 4px 14px rgba(0,0,0,0.35)',
    deep: '0 10px 30px rgba(0,0,0,0.55)',
    glow: '0 0 24px rgba(246,196,83,0.45)',
    gem: '0 0 18px rgba(92,209,255,0.55)',
    ember: '0 0 22px rgba(230,75,168,0.55)',
  },

  stroke: {
    hairline: 1.5,
    thin: 2,
    medium: 3,
    thick: 5,
    bold: 8,
  },
} as const;

export type DesignTokens = typeof DS;

function hex2num(h: string): number {
  return parseInt(h.replace('#', ''), 16);
}

export const C = {
  bgDeep: hex2num(DS.color.bgDeep),
  bgNight: hex2num(DS.color.bgNight),
  bgMid: hex2num(DS.color.bgMid),
  bgWarm: hex2num(DS.color.bgWarm),

  gold: hex2num(DS.color.gold),
  goldBright: hex2num(DS.color.goldBright),
  goldDeep: hex2num(DS.color.goldDeep),
  goldSoft: hex2num(DS.color.goldSoft),

  magenta: hex2num(DS.color.magenta),
  magentaDeep: hex2num(DS.color.magentaDeep),
  magentaGlow: hex2num(DS.color.magentaGlow),

  cyan: hex2num(DS.color.cyan),
  cyanDeep: hex2num(DS.color.cyanDeep),
  cyanGlow: hex2num(DS.color.cyanGlow),

  violet: hex2num(DS.color.violet),
  violetDeep: hex2num(DS.color.violetDeep),

  ember: hex2num(DS.color.ember),
  emberDeep: hex2num(DS.color.emberDeep),

  leaf: hex2num(DS.color.leaf),
  leafDeep: hex2num(DS.color.leafDeep),

  panel: hex2num(DS.color.panel),
  panelSoft: hex2num(DS.color.panelSoft),
  panelDeep: hex2num(DS.color.panelDeep),
  panelEdge: hex2num(DS.color.panelEdge),
  panelLine: hex2num(DS.color.panelLine),
  panelLineSoft: hex2num(DS.color.panelLineSoft),
};

export function drawOrnamentCorner(
  g: Phaser.GameObjects.Graphics,
  x: number, y: number, w: number, h: number,
  accent = C.gold, scale = 1,
) {
  const t = DS.stroke.medium * scale;
  const o = 12 * scale;
  g.lineStyle(t, accent, 1);
  g.beginPath();
  g.moveTo(x, y + o); g.lineTo(x, y); g.lineTo(x + o, y);
  g.strokePath();
  g.beginPath();
  g.moveTo(x + w - o, y); g.lineTo(x + w, y); g.lineTo(x + w, y + o);
  g.strokePath();
  g.beginPath();
  g.moveTo(x + w, y + h - o); g.lineTo(x + w, y + h); g.lineTo(x + w - o, y + h);
  g.strokePath();
  g.beginPath();
  g.moveTo(x + o, y + h); g.lineTo(x, y + h); g.lineTo(x, y + h - o);
  g.strokePath();
  g.fillStyle(accent, 1);
  g.fillCircle(x + o - 2 * scale, y + o - 2 * scale, 2 * scale);
  g.fillCircle(x + w - o + 2 * scale, y + o - 2 * scale, 2 * scale);
  g.fillCircle(x + w - o + 2 * scale, y + h - o + 2 * scale, 2 * scale);
  g.fillCircle(x + o - 2 * scale, y + h - o + 2 * scale, 2 * scale);
}

export function drawOrnamentDivider(
  g: Phaser.GameObjects.Graphics,
  x: number, y: number, w: number, accent = C.gold, scale = 1,
) {
  const cx = x + w / 2;
  g.lineStyle(DS.stroke.thin * scale, accent, 0.85);
  g.lineBetween(x, y, cx - 12 * scale, y);
  g.lineBetween(cx + 12 * scale, y, x + w, y);
  g.fillStyle(accent, 1);
  g.fillCircle(cx, y, 3 * scale);
  g.lineStyle(DS.stroke.hairline * scale, accent, 1);
  g.strokeCircle(cx, y, 6 * scale);
  g.fillStyle(accent, 0.9);
  g.fillTriangle(cx - 4 * scale, y - 4 * scale, cx + 4 * scale, y - 4 * scale, cx, y - 10 * scale);
}

export function drawFrame(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  opts: {
    fill?: number;
    fillAlpha?: number;
    edge?: number;
    edgeAlpha?: number;
    radius?: number;
    ornament?: boolean;
    glow?: number;
    glowColor?: number;
    depth?: number;
  } = {},
): Phaser.GameObjects.Graphics {
  const {
    fill = C.panel,
    fillAlpha = DS.alpha.bg,
    edge = C.gold,
    edgeAlpha = 0.9,
    radius = DS.radius.lg,
    ornament = true,
    glow,
    glowColor = C.gold,
    depth = DS.depth.panel,
  } = opts;

  const g = scene.add.graphics();
  g.setDepth(depth);

  if (glow) {
    g.fillStyle(glowColor, glow);
    const exp = 18;
    g.fillRoundedRect(x - exp, y - exp, w + exp * 2, h + exp * 2, radius + exp);
  }

  g.fillStyle(fill, fillAlpha);
  g.fillRoundedRect(x, y, w, h, radius);

  g.lineStyle(DS.stroke.medium, edge, edgeAlpha);
  g.strokeRoundedRect(x, y, w, h, radius);

  g.lineStyle(DS.stroke.hairline, 0xffffff, 0.18);
  g.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, radius - 2);

  if (ornament) {
    drawOrnamentCorner(g, x, y, w, h, edge, 1);
  }

  return g;
}

export function drawVipRibbon(
  scene: Phaser.Scene,
  x: number, y: number, label: string, level = 0,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const w = 96, h = 28;
  const g = scene.add.graphics();
  g.fillStyle(0x0e0721, 0.6);
  g.fillRoundedRect(0, 0, w, h, 4);
  g.lineStyle(1, C.gold, 1);
  g.strokeRoundedRect(0, 0, w, h, 4);
  g.fillStyle(C.gold, 0.18);
  g.fillRoundedRect(2, 2, w - 4, h - 4, 3);
  c.add(g);
  const t = scene.add.text(w / 2, h / 2, label, {
    fontFamily: DS.font.display,
    fontSize: '16px',
    color: DS.color.goldBright,
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(t);
  for (let i = 0; i < level; i++) {
    const dot = scene.add.circle(10 + i * 8, h / 2, 2, C.goldBright);
    c.add(dot);
  }
  return c;
}

export function drawGemBadge(
  scene: Phaser.Scene,
  x: number, y: number, size: number,
  glyph: string, color: number, edge = C.gold,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(edge, 0.4);
  g.fillCircle(0, 0, size * 0.55);
  g.fillStyle(color, 1);
  g.fillCircle(0, 0, size * 0.42);
  g.lineStyle(1.5, edge, 1);
  g.strokeCircle(0, 0, size * 0.42);
  g.fillStyle(0xffffff, 0.6);
  g.fillCircle(-size * 0.12, -size * 0.18, size * 0.08);
  c.add(g);
  const t = scene.add.text(0, 0, glyph, {
    fontFamily: DS.font.display,
    fontSize: `${Math.floor(size * 0.42)}px`,
    color: '#ffffff',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(t);
  return c;
}

export function drawRarityCard(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  rarity: keyof typeof DS.rarity,
): Phaser.GameObjects.Container {
  const r = DS.rarity[rarity];
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(hex2num(r.fill), 0.18);
  g.fillRoundedRect(0, 0, w, h, DS.radius.md);
  g.lineStyle(DS.stroke.medium, hex2num(r.edge), 1);
  g.strokeRoundedRect(0, 0, w, h, DS.radius.md);
  g.lineStyle(DS.stroke.hairline, 0xffffff, 0.35);
  g.strokeRoundedRect(2, 2, w - 4, h - 4, DS.radius.md - 2);
  c.add(g);
  return c;
}

export function drawOrnateTitle(
  scene: Phaser.Scene,
  x: number, y: number, text: string,
  opts: { size?: number; accent?: number; ink?: string; width?: number } = {},
): Phaser.GameObjects.Container {
  const { size = DS.size.lg, accent = C.gold, ink = DS.color.ink, width = 240 } = opts;
  const c = scene.add.container(x, y);

  const backW = width, backH = size + 28;
  const g = scene.add.graphics();
  g.fillStyle(C.bgDeep, DS.alpha.bg);
  g.fillRoundedRect(-backW / 2, -backH / 2, backW, backH, backH / 2);

  g.lineStyle(DS.stroke.medium, accent, 1);
  g.strokeRoundedRect(-backW / 2, -backH / 2, backW, backH, backH / 2);

  g.lineStyle(DS.stroke.hairline, 0xffffff, 0.25);
  g.strokeRoundedRect(-backW / 2 + 2, -backH / 2 + 2, backW - 4, backH - 4, backH / 2 - 2);

  c.add(g);

  const dotL = scene.add.circle(-backW / 2 + 14, 0, 3, accent);
  const dotR = scene.add.circle(backW / 2 - 14, 0, 3, accent);
  c.add([dotL, dotR]);

  const t = scene.add.text(0, 0, text, {
    fontFamily: DS.font.display,
    fontSize: `${size}px`,
    color: ink,
    fontStyle: 'bold',
  }).setOrigin(0.5);
  c.add(t);

  c.setSize(backW, backH);
  return c;
}

export function drawCrestBanner(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  fill: number, edge: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const tail = 14;
  g.fillStyle(fill, 1);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w, y);
  g.lineTo(x + w - tail, y + h / 2);
  g.lineTo(x + w, y + h);
  g.lineTo(x, y + h);
  g.lineTo(x + tail, y + h / 2);
  g.closePath();
  g.fillPath();
  g.lineStyle(DS.stroke.medium, edge, 1);
  g.strokePath();
  g.fillStyle(0xffffff, 0.18);
  g.fillRect(x + tail + 2, y + 4, w - tail * 2 - 4, 3);
  return g;
}

export function drawEnergyRing(
  scene: Phaser.Scene,
  x: number, y: number, r: number,
  progress: number,
  opts: { track?: number; fill?: number; tick?: number } = {},
): Phaser.GameObjects.Container {
  const { track = C.panelSoft, fill = C.cyan, tick = C.goldBright } = opts;
  const c = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.lineStyle(6, track, 1);
  bg.strokeCircle(0, 0, r);
  c.add(bg);

  const fg = scene.add.graphics();
  fg.lineStyle(6, fill, 1);
  fg.beginPath();
  fg.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, progress)), false);
  fg.strokePath();
  c.add(fg);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = Math.cos(a) * (r - 6);
    const y1 = Math.sin(a) * (r - 6);
    const x2 = Math.cos(a) * (r + 6);
    const y2 = Math.sin(a) * (r + 6);
    fg.lineStyle(1, tick, 0.6);
    fg.lineBetween(x1, y1, x2, y2);
  }
  return c;
}

export function drawStarStuddedBackground(
  scene: Phaser.Scene, w: number, h: number, density = 0.0004,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const count = Math.floor(w * h * density);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.4 + 0.3;
    const a = Math.random() * 0.6 + 0.15;
    g.fillStyle(0xffffff, a);
    g.fillCircle(x, y, r);
    if (Math.random() > 0.85) {
      const r2 = r * 3;
      g.fillStyle(0xffffff, a * 0.3);
      g.fillCircle(x, y, r2);
    }
  }
  return g;
}

export function drawFactionSymbol(
  scene: Phaser.Scene,
  x: number, y: number, faction: string, size = 32,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const map: Record<string, { glyph: string; color: number }> = {
    celestial: { glyph: '☀', color: C.gold },
    abyss: { glyph: '☾', color: C.violet },
    spirit: { glyph: '✦', color: C.cyan },
    beast: { glyph: '✿', color: C.leaf },
    human: { glyph: '♛', color: C.magenta },
    mecha: { glyph: '⌬', color: C.ember },
  };
  const def = map[faction] || { glyph: '✧', color: C.gold };
  const g = scene.add.graphics();
  g.fillStyle(def.color, 0.18);
  g.fillCircle(0, 0, size * 0.55);
  g.lineStyle(2, def.color, 1);
  g.strokeCircle(0, 0, size * 0.55);
  c.add(g);
  const t = scene.add.text(0, 0, def.glyph, {
    fontFamily: DS.font.display,
    fontSize: `${size * 0.7}px`,
    color: '#ffffff',
  }).setOrigin(0.5);
  c.add(t);
  return c;
}