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

// =============================================
// 卡通明亮场景配色（超能世界截图风格）
// =============================================
export const CARTOON = {
  skyTop: 0x8fd4ff,
  skyBottom: 0xc8ecff,
  sunGlow: 0xffe9a0,

  grassLight: 0x7ac94a,
  grassMid: 0x5aad32,
  grassDark: 0x3f8a25,
  grassShadow: 0x2d6a1a,

  roadLight: 0xe8c788,
  roadMid: 0xd4a958,
  roadDark: 0xa88038,

  riverLight: 0x9cdcff,
  riverMid: 0x5cb3ea,
  riverDeep: 0x2f7eb5,
  riverFoam: 0xffffff,

  rockLight: 0xb8b8b8,
  rockMid: 0x8a8a8a,
  rockDark: 0x5a5a5a,

  treeLight: 0x5fb84a,
  treeMid: 0x3a8a32,
  treeDark: 0x206025,
  trunk: 0x7a4a20,
  trunkLight: 0x9a6a3a,

  castleStone: 0xd8c8a8,
  castleShade: 0xa09078,
  castleRoof: 0x3a78b8,

  bannerPink: 0xff9ec7,
  bannerPinkDark: 0xe070a0,
  bannerBlue: 0x3a8ad0,
  bannerBlueDark: 0x206098,

  tabBlue: 0x2a6fb5,
  tabBlueDark: 0x1a4f85,
  tabBlueLight: 0x4a95d5,

  hexPurple: 0xb06fe0,
  hexPurpleDark: 0x7040a8,
  hexGold: 0xf0c040,
};

export const FACTION_COLORS: Record<string, number> = {
  celestial: CARTOON.hexGold,
  abyss: 0x9060e0,
  spirit: 0x5cb3ea,
  beast: CARTOON.grassMid,
  human: 0xe06090,
  mecha: 0xe07040,
};

// =============================================
// 草地冒险地图背景（弯曲土路 + 河流 + 树木石头）
// =============================================
export function drawGrasslandMap(
  scene: Phaser.Scene,
  w: number, h: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  // 天空（分层填充模拟 skyTop → skyBottom）
  const skyL5 = 6;
  const skyColorsTop = [0x88, 0xc8, 0xf8]; // skyTop '#88c8f8'
  const skyColorsBot = [0xb8, 0xe0, 0xff]; // skyBottom '#b8e0ff'
  for (let i = 0; i < skyL5; i++) {
    const t = i / skyL5;
    const r = Math.floor(skyColorsTop[0] + (skyColorsBot[0] - skyColorsTop[0]) * t);
    const gg = Math.floor(skyColorsTop[1] + (skyColorsBot[1] - skyColorsTop[1]) * t);
    const b = Math.floor(skyColorsTop[2] + (skyColorsBot[2] - skyColorsTop[2]) * t);
    g.fillStyle((r << 16) | (gg << 8) | b, 1);
    g.fillRect(0, (h * 0.35 / skyL5) * i, w, (h * 0.35 / skyL5) + 1);
  }

  // 太阳光晕
  const sunX = w - 120, sunY = 90;
  for (let i = 6; i > 0; i--) {
    g.fillStyle(CARTOON.sunGlow, 0.08);
    g.fillCircle(sunX, sunY, 30 + i * 14);
  }
  g.fillStyle(0xfff6c8, 1);
  g.fillCircle(sunX, sunY, 34);

  // 远山
  for (let layer = 0; layer < 3; layer++) {
    const baseY = h * (0.22 + layer * 0.05);
    const color = [0x6fb0e0, 0x5aa0c8, 0x4a8fb0][layer];
    g.fillStyle(color, 0.8 - layer * 0.2);
    g.beginPath();
    g.moveTo(0, baseY + 60);
    const peaks = 7 + layer;
    for (let i = 0; i <= peaks; i++) {
      const px = (w / peaks) * i;
      const py = baseY - Math.sin(i * 1.3 + layer) * (30 - layer * 6) - (i % 2) * 18;
      g.lineTo(px, py);
    }
    g.lineTo(w, baseY + 60);
    g.closePath();
    g.fillPath();
  }

  // 草地（下半部分，分层填充 grassLight → grassMid → grassDark）
  const grassY = h * 0.3;
  const grassH = h * 0.7;
  const grassL5 = 7;
  for (let i = 0; i < grassL5; i++) {
    const t = i / grassL5;
    // grassLight '#a8e870', grassMid '#68c048', grassDark '#3a8830'
    //   light (t=0) → mid (t=0.5) → dark (t=1) 分段插值
    let r, gg, b;
    if (t < 0.5) {
      const tt = t / 0.5;
      r = Math.floor(0xa8 + (0x68 - 0xa8) * tt);
      gg = Math.floor(0xe8 + (0xc0 - 0xe8) * tt);
      b = Math.floor(0x70 + (0x48 - 0x70) * tt);
    } else {
      const tt = (t - 0.5) / 0.5;
      r = Math.floor(0x68 + (0x3a - 0x68) * tt);
      gg = Math.floor(0xc0 + (0x88 - 0xc0) * tt);
      b = Math.floor(0x48 + (0x30 - 0x48) * tt);
    }
    g.fillStyle((r << 16) | (gg << 8) | b, 1);
    g.fillRect(0, grassY + (grassH / grassL5) * i, w, (grassH / grassL5) + 1);
  }

  // 草地纹理（深浅斑块）
  for (let i = 0; i < 40; i++) {
    const px = Math.random() * w;
    const py = h * 0.32 + Math.random() * h * 0.66;
    const pr = 20 + Math.random() * 60;
    g.fillStyle(Math.random() > 0.5 ? CARTOON.grassMid : CARTOON.grassLight, 0.35);
    g.fillEllipse(px, py, pr, pr * 0.6);
  }

  return g;
}

// 绘制弯曲的道路路径（返回路径点数组用于放置关卡）
export function drawWindingRoad(
  scene: Phaser.Scene,
  w: number, h: number,
): { points: { x: number; y: number }[]; g: Phaser.GameObjects.Graphics } {
  const g = scene.add.graphics();

  // 定义路径控制点（从下往上S形）
  const pts: { x: number; y: number }[] = [];
  const startY = h - 180;
  const nodes = [
    { x: w * 0.5, y: startY },
    { x: w * 0.3, y: startY - 120 },
    { x: w * 0.25, y: startY - 240 },
    { x: w * 0.55, y: startY - 360 },
    { x: w * 0.7, y: startY - 480 },
    { x: w * 0.45, y: startY - 600 },
    { x: w * 0.3, y: startY - 720 },
    { x: w * 0.55, y: startY - 840 },
  ];

  // 生成平滑曲线路径
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    for (let t = 0; t <= 1; t += 0.08) {
      const x = Phaser.Math.Linear(a.x, b.x, t) + (Math.random() - 0.5) * 2;
      const y = Phaser.Math.Linear(a.y, b.y, t);
      pts.push({ x, y });
    }
  }
  pts.push(nodes[nodes.length - 1]);

  // 画道路阴影
  g.lineStyle(68, CARTOON.roadDark, 0.4);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y + 4);
  pts.forEach(p => g.lineTo(p.x, p.y + 4));
  g.strokePath();

  // 画道路主体
  g.lineStyle(60, CARTOON.roadMid, 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();

  // 画道路亮色中线
  g.lineStyle(50, CARTOON.roadLight, 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();

  // 小圆点（路径标记）
  const markerPts: { x: number; y: number }[] = [];
  for (let i = 2; i < pts.length - 1; i += 3) {
    if (Math.random() > 0.2) {
      markerPts.push(pts[i]);
      g.fillStyle(CARTOON.riverLight, 0.7);
      g.fillCircle(pts[i].x, pts[i].y, 7);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(pts[i].x - 1.5, pts[i].y - 1.5, 3);
    }
  }

  return { points: markerPts.concat(nodes), g };
}

// 画河流
export function drawRiver(
  scene: Phaser.Scene,
  x1: number, y1: number, x2: number, y2: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const midX = (x1 + x2) / 2 + 60;
  const midY = (y1 + y2) / 2;

  // 生成二次贝塞尔曲线上的点（Phaser Graphics 没有 quadraticCurveTo，用多点 lineTo 模拟）
  const bezier = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * x1 + 2 * u * t * midX + t * t * x2,
      y: u * u * y1 + 2 * u * t * midY + t * t * y2,
    };
  };
  const steps = 40;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(bezier(i / steps));
  }

  // 河流主体
  g.lineStyle(70, CARTOON.riverDeep, 0.9);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();

  g.lineStyle(56, CARTOON.riverMid, 1);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();

  g.lineStyle(40, CARTOON.riverLight, 0.85);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();

  // 水波高光
  for (let i = 0; i < 8; i++) {
    const p = bezier(i / 8);
    g.fillStyle(CARTOON.riverFoam, 0.5);
    g.fillEllipse(p.x - 8, p.y, 16, 4);
  }

  return g;
}

// 画针叶树
export function drawPineTree(
  scene: Phaser.Scene,
  x: number, y: number, scale = 1,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();

  // 阴影
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(4 * scale, 4 * scale, 36 * scale, 10 * scale);

  // 树干
  g.fillStyle(CARTOON.trunk, 1);
  g.fillRect(-6 * scale, -10 * scale, 12 * scale, 28 * scale);
  g.fillStyle(CARTOON.trunkLight, 1);
  g.fillRect(-6 * scale, -10 * scale, 4 * scale, 28 * scale);

  // 三层树冠
  const layers = [
    { w: 50, h: 44, y: -80, c1: CARTOON.treeLight, c2: CARTOON.treeMid },
    { w: 42, h: 40, y: -52, c1: CARTOON.treeLight, c2: CARTOON.treeMid },
    { w: 34, h: 36, y: -26, c1: CARTOON.treeMid, c2: CARTOON.treeDark },
  ];
  layers.forEach((L, idx) => {
    g.fillStyle(L.c2, 1);
    g.beginPath();
    g.moveTo(0, (L.y - L.h) * scale);
    g.lineTo((L.w / 2) * scale, L.y * scale);
    g.lineTo((-L.w / 2) * scale, L.y * scale);
    g.closePath();
    g.fillPath();

    g.fillStyle(L.c1, 1);
    g.beginPath();
    g.moveTo(-4 * scale, (L.y - L.h + 6) * scale);
    g.lineTo((L.w / 2 - 8) * scale, (L.y - 4) * scale);
    g.lineTo((-L.w / 2 + 12) * scale, (L.y - 4) * scale);
    g.closePath();
    g.fillPath();
  });

  c.add(g);
  return c;
}

// 画圆叶树
export function drawRoundTree(
  scene: Phaser.Scene,
  x: number, y: number, scale = 1,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();

  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(4 * scale, 4 * scale, 44 * scale, 12 * scale);

  g.fillStyle(CARTOON.trunk, 1);
  g.fillRect(-7 * scale, -6 * scale, 14 * scale, 30 * scale);

  // 多个圆形组成树冠
  const leafs = [
    { x: 0, y: -60, r: 36, c: CARTOON.treeDark },
    { x: -26, y: -46, r: 28, c: CARTOON.treeMid },
    { x: 26, y: -42, r: 30, c: CARTOON.treeMid },
    { x: 0, y: -30, r: 32, c: CARTOON.treeLight },
    { x: -14, y: -64, r: 20, c: CARTOON.treeLight },
  ];
  leafs.forEach(L => {
    g.fillStyle(L.c, 1);
    g.fillCircle(L.x * scale, L.y * scale, L.r * scale);
  });

  c.add(g);
  return c;
}

// 画石头
export function drawRock(
  scene: Phaser.Scene,
  x: number, y: number, scale = 1,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(x + 3 * scale, y + 3 * scale, 40 * scale, 12 * scale);

  g.fillStyle(CARTOON.rockDark, 1);
  g.beginPath();
  g.moveTo(x - 28 * scale, y);
  g.lineTo(x - 22 * scale, y - 20 * scale);
  g.lineTo(x - 4 * scale, y - 28 * scale);
  g.lineTo(x + 18 * scale, y - 22 * scale);
  g.lineTo(x + 28 * scale, y - 6 * scale);
  g.lineTo(x + 24 * scale, y + 6 * scale);
  g.lineTo(x - 20 * scale, y + 8 * scale);
  g.closePath();
  g.fillPath();

  g.fillStyle(CARTOON.rockMid, 1);
  g.beginPath();
  g.moveTo(x - 22 * scale, y - 4 * scale);
  g.lineTo(x - 18 * scale, y - 18 * scale);
  g.lineTo(x - 2 * scale, y - 24 * scale);
  g.lineTo(x + 14 * scale, y - 18 * scale);
  g.lineTo(x + 22 * scale, y - 4 * scale);
  g.lineTo(x + 16 * scale, y);
  g.lineTo(x - 14 * scale, y + 2 * scale);
  g.closePath();
  g.fillPath();

  g.fillStyle(CARTOON.rockLight, 0.8);
  g.beginPath();
  g.moveTo(x - 14 * scale, y - 14 * scale);
  g.lineTo(x - 6 * scale, y - 20 * scale);
  g.lineTo(x + 4 * scale, y - 16 * scale);
  g.lineTo(x - 2 * scale, y - 8 * scale);
  g.closePath();
  g.fillPath();
  return g;
}

// 画木桥
export function drawWoodBridge(
  scene: Phaser.Scene,
  x: number, y: number, w: number,
): Phaser.GameObjects.Container {
  const cont = scene.add.container(x, y);
  const g = scene.add.graphics();
  const h = 46; // 桥总高
  const plankAngle = -0.22; // 桥面倾斜角度（右上斜）
  const halfW = w / 2;

  // 辅助：点旋转
  const rot = (px: number, py: number): [number, number] => {
    const cos = Math.cos(plankAngle), sin = Math.sin(plankAngle);
    return [px * cos - py * sin, px * sin + py * cos];
  };
  // 辅助：画旋转后的矩形
  const fillRectRot = (rx: number, ry: number, rw: number, rh: number) => {
    const [x1, y1] = rot(rx, ry);
    const [x2, y2] = rot(rx + rw, ry);
    const [x3, y3] = rot(rx + rw, ry + rh);
    const [x4, y4] = rot(rx, ry + rh);
    g.beginPath();
    g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4);
    g.closePath(); g.fillPath();
  };
  // 辅助：画旋转后的圆角矩形（直切角近似圆角）
  const fillRRectRot = (rx: number, ry: number, rw: number, rh: number, _radius: number) => {
    const [x1, y1] = rot(rx + _radius, ry);
    const [x2, y2] = rot(rx + rw - _radius, ry);
    const [x3, y3] = rot(rx + rw, ry + _radius);
    const [x4, y4] = rot(rx + rw, ry + rh - _radius);
    const [x5, y5] = rot(rx + rw - _radius, ry + rh);
    const [x6, y6] = rot(rx + _radius, ry + rh);
    const [x7, y7] = rot(rx, ry + rh - _radius);
    const [x8, y8] = rot(rx, ry + _radius);
    g.beginPath();
    g.moveTo(x1, y1); g.lineTo(x2, y2);
    g.lineTo(x3, y3); g.lineTo(x4, y4);
    g.lineTo(x5, y5); g.lineTo(x6, y6);
    g.lineTo(x7, y7); g.lineTo(x8, y8);
    g.closePath(); g.fillPath();
  };
  // 画线
  const lineBetweenRot = (ax: number, ay: number, bx: number, by: number) => {
    const [aax, aay] = rot(ax, ay);
    const [bbx, bby] = rot(bx, by);
    g.lineBetween(aax, aay, bbx, bby);
  };

  // ==== 两端石砌桥墩（桥台）====
  const abutmentW = 42, abutmentH = 54;
  // 左桥台（略低，在河左岸）
  g.fillStyle(0x4a4a4a, 1);
  g.fillRoundedRect(-halfW - abutmentW + 2, y + 4 - y, abutmentW, abutmentH, 6);
  g.fillStyle(0x7a7a7a, 1);
  g.fillRoundedRect(-halfW - abutmentW, y - y, abutmentW, abutmentH, 6);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      const rx = -halfW - abutmentW + 4 + c * 12 + (r % 2) * 6;
      const ry = 4 + r * 10;
      g.fillStyle([0x8a8a8a, 0x9a9a9a, 0x7a7a7a][(r + c) % 3], 1);
      g.fillRoundedRect(rx, ry, 10, 8, 2);
      g.lineStyle(1, 0x5a5a5a, 0.7);
      g.strokeRoundedRect(rx, ry, 10, 8, 2);
    }
  }
  // 右桥台（略高，在河右岸）
  g.fillStyle(0x4a4a4a, 1);
  g.fillRoundedRect(halfW - 2, -abutmentH + 8, abutmentW, abutmentH, 6);
  g.fillStyle(0x7a7a7a, 1);
  g.fillRoundedRect(halfW, -abutmentH + 4, abutmentW, abutmentH, 6);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      const rx = halfW + 4 + c * 12 + (r % 2) * 6;
      const ry = -abutmentH + 8 + r * 10;
      g.fillStyle([0x8a8a8a, 0x9a9a9a, 0x7a7a7a][(r + c + 1) % 3], 1);
      g.fillRoundedRect(rx, ry, 10, 8, 2);
      g.lineStyle(1, 0x5a5a5a, 0.7);
      g.strokeRoundedRect(rx, ry, 10, 8, 2);
    }
  }

  // ==== 桥面大阴影（在河面上）====
  g.fillStyle(0x000000, 0.22);
  // 手动旋转矩形
  {
    const rx = -halfW + 4, ry = -h / 2 + 4 + 10;
    const rw = w, rh = h;
    const [x1, y1] = rot(rx, ry);
    const [x2, y2] = rot(rx + rw, ry);
    const [x3, y3] = rot(rx + rw, ry + rh);
    const [x4, y4] = rot(rx, ry + rh);
    g.beginPath();
    g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4);
    g.closePath(); g.fillPath();
  }

  // ==== 桥面底层（大型厚木板结构）====
  // 底部主梁（深色粗木）
  g.fillStyle(0x5a3a18, 1);
  fillRectRot(-halfW, -h / 2 + 8, w, h - 4);
  // 中部主色
  g.fillStyle(0x7a5028, 1);
  fillRectRot(-halfW + 2, -h / 2 + 6, w - 4, h - 10);

  // ==== 横向木板（垂直于桥长方向，逐块排）====
  const plankCount = Math.floor(w / 14);
  const plankW = w / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const px = -halfW + i * plankW;
    const tone = (i * 37) % 4;
    const plankCol = [0x8a5a2a, 0xa06a30, 0x7a5028, 0x956532][tone];
    const plankHi = [0xb88a50, 0xc89860, 0xa88048, 0xbe8e56][tone];
    // 板底阴影
    g.fillStyle(0x3a2408, 0.6);
    fillRectRot(px + 1, -h / 2 + 9, plankW - 2, h - 8);
    // 板主色
    g.fillStyle(plankCol, 1);
    fillRectRot(px + 1, -h / 2 + 7, plankW - 2, h - 12);
    // 板高光（上半弧）
    g.fillStyle(plankHi, 0.55);
    fillRectRot(px + 2, -h / 2 + 8, plankW - 4, 5);
    // 木纹纵线
    g.lineStyle(1, 0x4a2a0a, 0.35);
    lineBetweenRot(px + plankW / 3, -h / 2 + 9, px + plankW / 3, -h / 2 + h - 8);
    lineBetweenRot(px + plankW * 2 / 3, -h / 2 + 9, px + plankW * 2 / 3, -h / 2 + h - 8);
    // 板两端铁钉（小圆）
    const nailPts = [
      [px + 4, -h / 2 + 12],
      [px + plankW - 5, -h / 2 + 12],
      [px + 4, h / 2 - 8],
      [px + plankW - 5, h / 2 - 8],
    ];
    nailPts.forEach(np => {
      const [nx, ny] = rot(np[0], np[1]);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(nx, ny, 1.5);
      g.fillStyle(0x8a8a8a, 0.9);
      g.fillCircle(nx - 0.5, ny - 0.5, 0.8);
    });
  }

  // ==== 两侧纵向大梁（粗木）====
  const beamH = 12;
  // 外侧（深色）
  g.fillStyle(0x4a3010, 1);
  fillRectRot(-halfW - 4, -h / 2 - beamH + 2, w + 8, beamH);
  fillRectRot(-halfW - 4, h / 2 - 6, w + 8, beamH);
  // 内侧主色
  g.fillStyle(0x6a4418, 1);
  fillRectRot(-halfW - 2, -h / 2 - beamH + 4, w + 4, beamH - 4);
  fillRectRot(-halfW - 2, h / 2 - 4, w + 4, beamH - 4);
  // 大梁高光
  g.fillStyle(0x9a7438, 0.45);
  fillRectRot(-halfW, -h / 2 - beamH + 5, w, 2);
  fillRectRot(-halfW, h / 2 - 3, w, 2);
  // 大梁铆钉（每侧一排）
  for (let i = 0; i < 8; i++) {
    const bx = -halfW + 8 + i * ((w - 16) / 7);
    const beamTop = -h / 2 - beamH / 2 + 2;
    const beamBot = h / 2 + beamH / 2 - 2;
    [[bx, beamTop], [bx, beamBot]].forEach(np => {
      const [nx, ny] = rot(np[0], np[1]);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(nx, ny, 2);
      g.fillStyle(0x9a9a9a, 0.9);
      g.fillCircle(nx - 0.5, ny - 0.5, 1);
    });
  }

  // ==== 桥面顶部防滑横条（细木条，交错）====
  g.fillStyle(0x5a3a18, 0.65);
  for (let i = 0; i < plankCount; i += 2) {
    fillRectRot(-halfW + i * plankW + 2, -h / 2 + 6, plankW - 4, 2);
  }

  cont.add(g);
  cont.setScrollFactor(1);
  return cont;
}

// 画关卡旗帜（超能世界截图风格：盾形徽章+石底座）
export function drawStageFlag(
  scene: Phaser.Scene,
  x: number, y: number,
  stageNum: number | string,
  opts: { cleared?: boolean; locked?: boolean; current?: boolean; stars?: number } = {},
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const { cleared = false, locked = false, current = false, stars = 0 } = opts;

  // 当前关卡：金色光环（多层 + 脉动准备）
  if (current) {
    for (let i = 6; i > 0; i--) {
      g.fillStyle(0xfff080, 0.07 + (6 - i) * 0.025);
      g.fillCircle(0, -10, 50 + i * 10);
    }
    // 闪烁的金边圈
    g.lineStyle(4, 0xffe880, 0.85);
    g.strokeCircle(0, -10, 58);
    g.lineStyle(2, 0xffffff, 0.75);
    g.strokeCircle(0, -10, 52);
  }

  // 底座阴影
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(3, 26, 44, 10);

  // 旗杆底座（大圆形石基 - 三层）
  g.fillStyle(0x4a4a4a, 1);
  g.fillEllipse(0, 22, 30, 10);
  g.fillStyle(0x7a7a7a, 1);
  g.fillEllipse(-1, 20, 27, 8);
  g.fillStyle(0x9a9a9a, 1);
  g.fillEllipse(-2, 18, 24, 6);
  g.fillStyle(0xb8b8b8, 0.85);
  g.fillEllipse(-3, 17, 8, 2);
  // 底座边缘铆钉
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const ex = Math.cos(ang) * 22;
    const ey = 20 + Math.sin(ang) * 6;
    g.fillStyle(0x6a6a6a, 1);
    g.fillCircle(ex, ey, 2);
    g.fillStyle(0x9a9a9a, 0.9);
    g.fillCircle(ex - 0.5, ey - 0.5, 1);
  }

  // 旗杆（粗壮木头）
  g.fillStyle(0x5a3a1a, 1);
  g.fillRect(-3, -48, 6, 70);
  g.fillStyle(0x7a5a3a, 1);
  g.fillRect(-3, -48, 2, 70);
  // 木纹
  g.lineStyle(1, 0x4a2a0a, 0.4);
  g.lineBetween(-1, -48, -1, 22);
  // 顶帽金珠
  g.fillStyle(0x8a6a20, 1);
  g.fillCircle(0, -50, 5);
  g.fillStyle(CARTOON.hexGold, 1);
  g.fillCircle(0, -50, 4);
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(-1, -51, 1.5);

  // 盾牌主体颜色
  let shieldDark = 0x4a4a50, shieldMain = 0x6a6a70, shieldLight = 0x8a8a90, shieldEdge = 0x2a2a30, numColor = '#f0f0f0';
  if (cleared) {
    shieldDark = 0x1a5a3a; shieldMain = 0x2a8a52; shieldLight = 0x4aba72; shieldEdge = 0x0a3a20; numColor = '#ffffff';
  } else if (current) {
    shieldDark = 0x0e5a9a; shieldMain = 0x2a8ada; shieldLight = 0x5ac0fa; shieldEdge = 0x0a3a6a; numColor = '#ffffff';
  } else if (!locked) {
    shieldDark = 0x5a4a20; shieldMain = 0x8a7038; shieldLight = 0xbaa058; shieldEdge = 0x3a2a0a; numColor = '#ffffff';
  }

  // 盾牌尺寸
  const sw = 56, sh = 72;
  const sx = 4, sy = -50; // 左上锚点，盾牌挂在旗杆右侧

  // ==== 盾形路径：上方圆+两侧微收+底部V形收尖 ====
  const shieldPath = (gfx: Phaser.GameObjects.Graphics, px: number, py: number, pw: number, ph: number) => {
    const topR = pw * 0.44;          // 顶部圆角半径
    const vStartY = py + ph * 0.72;  // 底部V形起点Y
    gfx.beginPath();
    // 左上圆角
    gfx.moveTo(px + topR, py);
    // 顶边（直）
    gfx.lineTo(px + pw - topR, py);
    // 右上圆弧
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      const ang = -Math.PI / 2 + (Math.PI / 2) * t;
      const cx = px + pw - topR, cy = py + topR;
      gfx.lineTo(cx + Math.cos(ang) * topR, cy + Math.sin(ang) * topR);
    }
    // 右侧直边（略带内收）
    gfx.lineTo(px + pw * 0.94, vStartY);
    // 右下 → 底尖
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      const xr = px + pw * 0.94 - (pw * 0.44) * t;
      const yr = vStartY + (ph - (vStartY - py)) * t;
      gfx.lineTo(xr, yr);
    }
    // 底尖 → 左下
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      const xl = px + pw * 0.5 - (pw * 0.44) * (1 - t);
      const yl = py + ph - (ph - (vStartY - py)) * (1 - t);
      gfx.lineTo(xl, yl);
    }
    // 左侧直边
    gfx.lineTo(px + pw * 0.06, vStartY);
    // 左上圆弧
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      const ang = -Math.PI - (Math.PI / 2) * t;
      const cx = px + topR, cy = py + topR;
      gfx.lineTo(cx + Math.cos(ang) * topR, cy + Math.sin(ang) * topR);
    }
    gfx.closePath();
  };

  // 最外深描边
  g.fillStyle(shieldEdge, 1);
  shieldPath(g, sx - 3, sy - 3, sw + 6, sh + 6);
  g.fillPath();

  // 深色层
  g.fillStyle(shieldDark, 1);
  shieldPath(g, sx, sy, sw, sh);
  g.fillPath();

  // 主色层
  g.fillStyle(shieldMain, 1);
  shieldPath(g, sx + 3, sy + 3, sw - 6, sh - 6);
  g.fillPath();

  // 内层浅色高光
  g.fillStyle(shieldLight, 1);
  shieldPath(g, sx + 5, sy + 5, sw - 10, (sh - 10) * 0.45);
  g.fillPath();
  // 高光渐变感（再缩一点）
  g.fillStyle(0xffffff, 0.18);
  shieldPath(g, sx + 7, sy + 7, sw - 14, (sh - 14) * 0.25);
  g.fillPath();

  // 盾牌内描边（亮色金边或银边）
  g.lineStyle(1.5, current ? 0xffe080 : 0xffffff, current ? 0.8 : 0.45);
  shieldPath(g, sx + 3, sy + 3, sw - 6, sh - 6);
  g.strokePath();

  // 盾牌装饰顶部金铆钉
  const studs = [sx + sw * 0.25, sx + sw * 0.5, sx + sw * 0.75];
  studs.forEach(sx2 => {
    g.fillStyle(shieldEdge, 1);
    g.fillCircle(sx2, sy + 10, 2.5);
    g.fillStyle(current ? CARTOON.hexGold : 0xc0c0c0, 1);
    g.fillCircle(sx2, sy + 10, 2);
  });

  // 中心内容：锁/过关勾/数字
  const cx = sx + sw / 2;
  const cy = sy + sh / 2 - 2;
  if (locked) {
    const lock = scene.add.text(cx, cy, '🔒', { fontSize: '26px' }).setOrigin(0.5);
    c.add(lock);
  } else if (cleared) {
    // 绿色勾徽章（带盾牌内圆）
    g.fillStyle(0x3aaa5a, 0.95);
    g.fillCircle(cx, cy, 14);
    g.lineStyle(2, 0x9cff9c, 0.95);
    g.strokeCircle(cx, cy, 14);
    const check = scene.add.text(cx, cy, '✔', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: '#fffeb0',
      fontStyle: 'bold',
      stroke: '#0a4a20',
      strokeThickness: 2,
    }).setOrigin(0.5);
    c.add(check);
  } else {
    // 关卡号（黑色底框+描边白字）
    g.fillStyle(0x0a0a14, 0.45);
    g.fillCircle(cx, cy, 18);
    const num = scene.add.text(cx, cy, String(stageNum), {
      fontFamily: DS.font.display,
      fontSize: current ? '36px' : '32px',
      color: numColor,
      fontStyle: 'bold',
      stroke: current ? '#0a3a6a' : '#000000',
      strokeThickness: current ? 4 : 3,
    }).setOrigin(0.5);
    c.add(num);
  }

  // 星级（下方靠近尖端）
  if (!locked && stars > 0) {
    const starY = sy + sh - 12;
    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const stX = sx + sw * 0.28 + i * sw * 0.22;
      scene.add.text(stX, starY, '★', {
        fontFamily: DS.font.display,
        fontSize: '16px',
        color: filled ? '#ffd76a' : '#4a4a50',
        fontStyle: 'bold',
        stroke: filled ? '#4a2a00' : '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5);
    }
  }

  // 顶部皇冠/面具装饰（BOSS关 / 解锁关）
  if (typeof stageNum === 'number' && stageNum % 5 === 0 && !locked) {
    // 顶冠
    const cy2 = sy - 10;
    g.fillStyle(0x8a6a20, 1);
    g.fillRoundedRect(cx - 16, cy2 - 14, 32, 20, 4);
    g.fillStyle(CARTOON.hexGold, 1);
    g.fillRoundedRect(cx - 14, cy2 - 12, 28, 16, 3);
    // 冠齿
    [cx - 10, cx - 2, cx + 6, cx + 14].forEach((cx2, idx) => {
      g.fillStyle(idx === 1 ? CARTOON.hexGold : (idx === 2 ? 0xff6a8a : 0x5cb3ea), 1);
      g.beginPath();
      g.moveTo(cx2 - 3, cy2 - 12);
      g.lineTo(cx2, cy2 - 22);
      g.lineTo(cx2 + 3, cy2 - 12);
      g.closePath(); g.fillPath();
    });
    scene.add.text(cx, cy2 - 2, '👑', { fontSize: '20px' }).setOrigin(0.5);
  }
  // 特殊：8关和12关带魔王面具
  if (typeof stageNum === 'number' && (stageNum === 8 || stageNum === 12) && !locked) {
    scene.add.text(cx, sy - 14, '👹', { fontSize: '22px' }).setOrigin(0.5);
  }

  c.add(g);
  return c;
}

// =============================================
// 六边形/菱形英雄卡片（图鉴风格，竖长切角）
// =============================================
export function drawHexHeroCard(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  rarity: keyof typeof DS.rarity | 'SPLUS' = 'SSR',
  opts: { owned?: boolean; portraitKey?: string; name?: string } = {},
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const { owned = true } = opts;

  // 稀有度颜色
  const rarMap: Record<string, { bg: number; bgDark: number; edge: number; glow: number }> = {
    N: { bg: 0x708090, bgDark: 0x4a5560, edge: 0xa0aab0, glow: 0xc0c8cc },
    R: { bg: 0x4090d0, bgDark: 0x2070a0, edge: 0x7cc0ff, glow: 0xa0d4ff },
    SR: { bg: 0xa060e0, bgDark: 0x7040a8, edge: 0xd59cff, glow: 0xe8bfff },
    SSR: { bg: CARTOON.hexGold, bgDark: 0xc09030, edge: 0xffd76a, glow: 0xffe8a0 },
    UR: { bg: 0xff6a8a, bgDark: 0xd04060, edge: 0xffb0c0, glow: 0xffd0dc },
    SPLUS: { bg: CARTOON.hexPurple, bgDark: CARTOON.hexPurpleDark, edge: 0xd59fff, glow: 0xe8c0ff },
  };
  const r = rarMap[rarity] || rarMap.SR;

  const g = scene.add.graphics();

  // 光晕
  if (owned) {
    for (let i = 3; i > 0; i--) {
      g.fillStyle(r.glow, 0.08 * i);
      g.fillRoundedRect(-6 - i * 4, -6 - i * 4, w + 12 + i * 8, h + 12 + i * 8, 16 + i * 4);
    }
  }

  // 六边形路径（竖长，上下切角）
  function hexPath(gfx: Phaser.GameObjects.Graphics, px: number, py: number, pw: number, ph: number) {
    const cutTop = ph * 0.08;
    const cutBot = ph * 0.12;
    gfx.beginPath();
    gfx.moveTo(px + pw * 0.5, py);                 // 上中
    gfx.lineTo(px + pw, py + cutTop);              // 右上切角
    gfx.lineTo(px + pw, py + ph - cutBot);         // 右下切角
    gfx.lineTo(px + pw * 0.5, py + ph);            // 下中
    gfx.lineTo(px, py + ph - cutBot);              // 左下切角
    gfx.lineTo(px, py + cutTop);                   // 左上切角
    gfx.closePath();
  }

  // 外层边
  g.fillStyle(r.edge, 0.8);
  hexPath(g, -4, -4, w + 8, h + 8);
  g.fillPath();

  // 深色内层
  g.fillStyle(r.bgDark, 1);
  hexPath(g, 0, 0, w, h);
  g.fillPath();

  // 主色层（稍小一圈，制造边框感）
  g.fillStyle(r.bg, 1);
  hexPath(g, 3, 3, w - 6, h - 6);
  g.fillPath();

  // 内部渐变/花纹层（未获得则加黑遮罩）
  g.fillStyle(owned ? 0xffffff : 0x000000, owned ? 0.12 : 0.55);
  hexPath(g, 5, 5, w - 10, h - 10);
  g.fillPath();

  // 顶部切角高光边
  g.lineStyle(2, 0xffffff, owned ? 0.55 : 0.15);
  g.beginPath();
  g.moveTo(w * 0.5, 4);
  g.lineTo(w - 5, 4 + h * 0.08);
  g.strokePath();

  // 底部品质宝石底座
  const gemW = w * 0.36, gemH = 18;
  const gx = w / 2 - gemW / 2;
  const gy = h - gemH - 10;
  g.fillStyle(0x000000, 0.45);
  g.fillRoundedRect(gx - 1, gy + 2, gemW + 2, gemH, 4);
  g.fillStyle(r.bg, 1);
  g.fillRoundedRect(gx, gy, gemW, gemH, 4);
  g.lineStyle(1.5, r.edge, 1);
  g.strokeRoundedRect(gx, gy, gemW, gemH, 4);
  // 宝石高光
  g.fillStyle(0xffffff, 0.35);
  g.fillRoundedRect(gx + 2, gy + 2, gemW - 4, 5, 3);
  // 宝石切面
  g.lineStyle(1, 0xffffff, 0.4);
  g.beginPath();
  g.moveTo(gx + gemW / 2, gy + 2);
  g.lineTo(gx + gemW / 2, gy + gemH - 2);
  g.moveTo(gx + 2, gy + gemH / 2);
  g.lineTo(gx + gemW - 2, gy + gemH / 2);
  g.strokePath();

  // "未获得"文字
  if (!owned) {
    const maskG = scene.add.graphics();
    hexPath(maskG, 5, 5, w - 10, h - 10);
    maskG.fillPath();
    maskG.setAlpha(0);
    c.add(maskG);

    const mask = maskG.createGeometryMask();
    c.add(g);

    const label = scene.add.text(w / 2, h / 2 - 10, '未获得', {
      fontFamily: DS.font.body,
      fontSize: `${Math.floor(w * 0.22)}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    label.setMask(mask);
    c.add(label);
  } else if (opts.portraitKey) {
    // 英雄头像（用 mask 裁剪到六边形内）
    const maskG = scene.add.graphics();
    hexPath(maskG, 5, 5, w - 10, h - 10);
    maskG.fillPath();
    const mask = maskG.createGeometryMask();
    c.add(g);
    c.add(maskG.setAlpha(0));

    const portrait = scene.add.image(w / 2, h / 2 - 14, opts.portraitKey);
    portrait.setDisplaySize(w * 1.1, h * 0.75);
    portrait.setMask(mask);
    c.add(portrait);
  } else {
    c.add(g);
  }

  // 名字条
  if (opts.name) {
    const nameBg = scene.add.graphics();
    nameBg.fillStyle(0x000000, 0.65);
    nameBg.fillRoundedRect(6, h * 0.52, w - 12, 22, 4);
    nameBg.fillStyle(r.edge, 0.9);
    nameBg.fillRect(6, h * 0.52, 3, 22);
    c.add(nameBg);
    const nt = scene.add.text(w / 2, h * 0.52 + 11, opts.name, {
      fontFamily: DS.font.display,
      fontSize: `${Math.floor(w * 0.18)}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    c.add(nt);
  }

  c.setSize(w, h);
  return c;
}

// =============================================
// 主城/冒险背景（远景风车+城堡+小路）
// =============================================
export function drawMainCityBackground(
  scene: Phaser.Scene,
  w: number, h: number,
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);
  const g = scene.add.graphics();
  container.add(g);

  // ========== 0. AI 生成主城背景大图（最底层） ==========
  if (scene.textures.exists('main_city_bg')) {
    const bgImg = scene.add.image(w / 2, h / 2, 'main_city_bg');
    // 拉伸覆盖整屏（保留比例，盖满）
    const tex = scene.textures.get('main_city_bg');
    const srcImg = tex.getSourceImage();
    const imgW = srcImg ? srcImg.width : 720;
    const imgH = srcImg ? srcImg.height : 1280;
    const scale = Math.max(w / imgW, h / imgH);
    bgImg.setScale(scale);
    bgImg.setDepth(-100);
    container.add(bgImg);
    // 顶部轻微暗化（让顶部状态栏更易读）
    const topShade = scene.add.graphics();
    topShade.fillStyle(0x000000, 0.18);
    topShade.fillRect(0, 0, w, 140);
    topShade.setDepth(-99);
    container.add(topShade);
    // 底部暗化（让底部 TabBar 突出）
    const botShade = scene.add.graphics();
    botShade.fillStyle(0x000000, 0.22);
    botShade.fillRect(0, h - 160, w, 160);
    botShade.setDepth(-99);
    container.add(botShade);
  }

  // ========== 1. 明亮天空（上45%） ==========
  // 不用 fillGradientStyle 兼容问题，用分层渐变模拟
  const skyLayers = 12;
  for (let i = 0; i < skyLayers; i++) {
    const t = i / skyLayers;
    // 从亮蓝 #8fd4ff 过渡到浅蓝 #d8f0ff
    const r = Math.floor(0x8f + (0xd8 - 0x8f) * t);
    const gr = Math.floor(0xd4 + (0xf0 - 0xd4) * t);
    const b = Math.floor(0xff + (0xff - 0xff) * t);
    const col = (r << 16) | (gr << 8) | b;
    g.fillStyle(col, 1);
    g.fillRect(0, (h * 0.45 / skyLayers) * i, w, (h * 0.45 / skyLayers) + 1);
  }

  // 太阳光晕（右上）
  const sunX = w - 120, sunY = 90;
  for (let i = 8; i > 0; i--) {
    g.fillStyle(0xffe9a0, 0.06 + (8 - i) * 0.01);
    g.fillCircle(sunX, sunY, 24 + i * 18);
  }
  g.fillStyle(0xfff6c8, 1);
  g.fillCircle(sunX, sunY, 34);
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(sunX - 8, sunY - 8, 10);

  // ========== 2. 云朵 ==========
  const drawCloud = (cx: number, cy: number, s: number) => {
    const ellipses = [
      { dx: -28, dy: 0, rx: 26, ry: 16 },
      { dx: -8, dy: -8, rx: 28, ry: 20 },
      { dx: 14, dy: -4, rx: 24, ry: 16 },
      { dx: 30, dy: 2, rx: 22, ry: 14 },
      { dx: -14, dy: 4, rx: 22, ry: 14 },
    ];
    for (let i = 0; i < 3; i++) {
      ellipses.forEach(e => {
        g.fillStyle(0xffffff, 0.85 - i * 0.2);
        g.fillEllipse(cx + e.dx * s, cy + e.dy * s + i * 2, e.rx * s, e.ry * s);
      });
    }
  };
  drawCloud(90, 70, 1);
  drawCloud(w - 160, 50, 0.9);
  drawCloud(w * 0.45, 120, 0.7);
  drawCloud(w * 0.7, 150, 0.55);
  drawCloud(w * 0.2, 160, 0.5);

  // ========== 3. 三层远山（背景） ==========
  // 最远层：淡蓝灰山
  const drawMountainRange = (baseY: number, amp: number, lightCol: number, darkCol: number, alpha: number) => {
    g.fillStyle(lightCol, alpha);
    g.beginPath();
    g.moveTo(0, baseY + 40);
    const peaks = 10;
    for (let i = 0; i <= peaks; i++) {
      const px = (w / peaks) * i;
      const py = baseY - Math.abs(Math.sin(i * 1.1 + baseY)) * amp - (i % 2) * 14;
      g.lineTo(px, py);
    }
    g.lineTo(w, baseY + 40);
    g.closePath();
    g.fillPath();
  };
  drawMountainRange(h * 0.30, 30, 0x9ccce8, 0x7ab0d8, 0.85);
  drawMountainRange(h * 0.34, 26, 0x8ac0d8, 0x6aa0c0, 0.9);
  drawMountainRange(h * 0.38, 20, 0x78b4c8, 0x5890b0, 0.95);

  // ========== 4. 中景城堡 ==========
  const castleX = w * 0.5, castleY = h * 0.33;
  // 城堡主体石色
  g.fillStyle(0xd8c8a8, 0.95);
  g.fillRect(castleX - 72, castleY - 10, 144, 58);
  g.fillRect(castleX - 84, castleY - 32, 34, 80);
  g.fillRect(castleX + 50, castleY - 32, 34, 80);
  g.fillRect(castleX - 22, castleY - 56, 44, 104);
  // 城堡窗
  g.fillStyle(0x5a7aa0, 1);
  for (let i = 0; i < 3; i++) {
    g.fillRect(castleX - 48 + i * 30, castleY + 10, 10, 16);
  }
  g.fillRect(castleX - 78, castleY - 10, 8, 12);
  g.fillRect(castleX + 70, castleY - 10, 8, 12);
  g.fillRect(castleX - 16, castleY - 38, 10, 16);
  // 尖塔屋顶（蓝色）
  g.fillStyle(0x3a78b8, 1);
  // 左塔尖
  g.beginPath();
  g.moveTo(castleX - 84, castleY - 32);
  g.lineTo(castleX - 67, castleY - 68);
  g.lineTo(castleX - 50, castleY - 32);
  g.closePath(); g.fillPath();
  // 右塔尖
  g.beginPath();
  g.moveTo(castleX + 50, castleY - 32);
  g.lineTo(castleX + 67, castleY - 68);
  g.lineTo(castleX + 84, castleY - 32);
  g.closePath(); g.fillPath();
  // 中塔尖
  g.beginPath();
  g.moveTo(castleX - 22, castleY - 56);
  g.lineTo(castleX, castleY - 108);
  g.lineTo(castleX + 22, castleY - 56);
  g.closePath(); g.fillPath();
  // 塔尖金色旗帜
  g.fillStyle(0xf0c040, 1);
  g.fillRect(castleX - 1, castleY - 118, 2, 14);
  g.beginPath();
  g.moveTo(castleX + 1, castleY - 118);
  g.lineTo(castleX + 14, castleY - 112);
  g.lineTo(castleX + 1, castleY - 106);
  g.closePath(); g.fillPath();

  // ========== 5. 风车（左右各一） ==========
  drawWindmillOnG(g, w * 0.18, h * 0.36, 1);
  drawWindmillOnG(g, w * 0.82, h * 0.34, 0.8);

  // ========== 6. 中层青绿丘（在城堡前） ==========
  const hillY1 = h * 0.46;
  g.fillStyle(0x6ab858, 1);
  g.beginPath();
  g.moveTo(0, hillY1 + 20);
  for (let i = 0; i <= 10; i++) {
    const px = (w / 10) * i;
    const py = hillY1 - Math.sin(i * 0.8 + 2) * 26 - (i % 3) * 12;
    g.lineTo(px, py);
  }
  g.lineTo(w, hillY1 + 20);
  g.closePath();
  g.fillPath();

  // 亮草高光边
  g.fillStyle(0x84cc68, 0.6);
  g.beginPath();
  g.moveTo(0, hillY1 + 8);
  for (let i = 0; i <= 10; i++) {
    const px = (w / 10) * i;
    const py = hillY1 - 6 - Math.sin(i * 0.8 + 2) * 22 - (i % 3) * 10;
    g.lineTo(px, py);
  }
  g.lineTo(w, hillY1 + 8);
  g.closePath();
  g.fillPath();

  // ========== 7. 横向河流（穿过中间） ==========
  const riverY = h * 0.52;
  g.fillStyle(0x2f7eb5, 1);
  g.fillRect(0, riverY - 6, w, 64);
  g.fillStyle(0x5cb3ea, 1);
  g.fillRect(0, riverY, w, 52);
  g.fillStyle(0x9cdcff, 1);
  g.fillRect(0, riverY + 2, w, 22);
  // 河面波纹高光
  for (let i = 0; i < 16; i++) {
    const rx = 20 + i * (w / 16) + (i % 2) * 20;
    const ry = riverY + 14 + (i % 3) * 14;
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(rx, ry, 24, 4);
  }

  // ========== 8. 木桥（跨河中间） ==========
  const bridgeX = w * 0.5, bridgeY = riverY + 26;
  // 桥面阴影
  g.fillStyle(0x5a3a10, 1);
  g.fillRoundedRect(bridgeX - 130, bridgeY - 2, 260, 34, 4);
  // 桥面木板
  g.fillStyle(0xa06a30, 1);
  g.fillRoundedRect(bridgeX - 128, bridgeY - 10, 256, 32, 4);
  g.fillStyle(0xc08a50, 1);
  g.fillRoundedRect(bridgeX - 126, bridgeY - 8, 252, 22, 3);
  // 木板竖缝
  g.lineStyle(1.5, 0x7a4a20, 0.7);
  for (let i = -10; i <= 10; i++) {
    const bx = bridgeX + i * 12;
    g.lineBetween(bx, bridgeY - 8, bx, bridgeY + 14);
  }
  // 桥两侧栏杆柱
  g.fillStyle(0x7a4a20, 1);
  for (let i = -4; i <= 4; i++) {
    const px = bridgeX + i * 28;
    g.fillRect(px - 3, bridgeY - 22, 6, 18);
    g.fillRect(px - 4, bridgeY - 24, 8, 4);
  }
  // 横杆
  g.fillStyle(0x8a5a2a, 1);
  g.fillRect(bridgeX - 128, bridgeY - 20, 256, 4);
  g.fillRect(bridgeX - 128, bridgeY - 12, 256, 3);

  // ========== 9. 栅栏（两侧） ==========
  drawFenceOnG(g, w * 0.14, h * 0.48);
  drawFenceOnG(g, w * 0.14 + 30, h * 0.48);
  drawFenceOnG(g, w * 0.14 + 60, h * 0.48);
  drawFenceOnG(g, w * 0.86, h * 0.49);
  drawFenceOnG(g, w * 0.86 - 30, h * 0.49);

  // ========== 10. 前台大青丘 ==========
  const hillY2 = h * 0.66;
  g.fillStyle(0x5aad32, 1);
  g.beginPath();
  g.moveTo(0, hillY2 + 30);
  for (let i = 0; i <= 8; i++) {
    const px = (w / 8) * i;
    const py = hillY2 - Math.sin(i * 0.9 + 1.3) * 34 - (i % 2) * 18;
    g.lineTo(px, py);
  }
  g.lineTo(w, hillY2 + 30);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x7ac94a, 0.55);
  g.beginPath();
  g.moveTo(0, hillY2 + 12);
  for (let i = 0; i <= 8; i++) {
    const px = (w / 8) * i;
    const py = hillY2 - 10 - Math.sin(i * 0.9 + 1.3) * 30 - (i % 2) * 16;
    g.lineTo(px, py);
  }
  g.lineTo(w, hillY2 + 12);
  g.closePath();
  g.fillPath();

  // ========== 11. 弯曲小路（台阶通道，从河岸向下延伸） ==========
  const rx0 = w * 0.5, ry0 = riverY + 60;
  const rx1 = w * 0.44, ry1 = h * 0.78;
  const rx2 = w * 0.62, ry2 = h - 140;
  const roadBezier = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * rx0 + 2 * u * t * rx1 + t * t * rx2,
      y: u * u * ry0 + 2 * u * t * ry1 + t * t * ry2,
    };
  };
  const roadSteps = 44;
  const roadPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= roadSteps; i++) roadPts.push(roadBezier(i / roadSteps));

  // 路阴影
  g.lineStyle(78, 0x8a6a2a, 0.35);
  g.beginPath();
  g.moveTo(roadPts[0].x + 4, roadPts[0].y + 6);
  roadPts.forEach(p => g.lineTo(p.x + 4, p.y + 6));
  g.strokePath();
  // 路深边
  g.lineStyle(70, 0xa88038, 1);
  g.beginPath();
  g.moveTo(roadPts[0].x, roadPts[0].y);
  roadPts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();
  // 路中色
  g.lineStyle(60, 0xd4a958, 1);
  g.beginPath();
  g.moveTo(roadPts[0].x, roadPts[0].y);
  roadPts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();
  // 路亮边
  g.lineStyle(46, 0xe8c788, 1);
  g.beginPath();
  g.moveTo(roadPts[0].x, roadPts[0].y);
  roadPts.forEach(p => g.lineTo(p.x, p.y));
  g.strokePath();
  // 路径上的小石子
  for (let i = 0; i < 18; i++) {
    const pt = roadPts[4 + i * 2];
    g.fillStyle(0xc09a5a, 0.55);
    g.fillCircle(pt.x + (i % 2 ? -12 : 14), pt.y + (i % 3) * 4, 2 + (i % 3));
  }

  // 石阶（在小路靠下部分铺几级）
  for (let i = 0; i < 5; i++) {
    const t = 0.5 + i * 0.09;
    const p = roadBezier(t);
    const nextP = roadBezier(t + 0.04);
    g.fillStyle(0x9a8060, 1);
    g.fillEllipse((p.x + nextP.x) / 2, (p.y + nextP.y) / 2, 60, 10);
    g.fillStyle(0xc0a880, 0.8);
    g.fillEllipse((p.x + nextP.x) / 2 - 1, (p.y + nextP.y) / 2 - 2, 54, 5);
  }

  // ========== 11b. 左侧石头遗迹（立柱+拱门+爬藤） ==========
  const ruinX = w * 0.18, ruinY = h * 0.76;
  // 遗迹阴影
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(ruinX + 4, ruinY + 6, 70, 14);
  // 遗迹石台基
  g.fillStyle(0x6a6a5a, 1);
  g.fillRoundedRect(ruinX - 36, ruinY - 10, 72, 30, 4);
  g.fillStyle(0x8a8a7a, 1);
  g.fillRoundedRect(ruinX - 34, ruinY - 12, 68, 26, 3);
  // 石砖缝
  g.lineStyle(1, 0x5a5a4a, 0.6);
  for (let i = 0; i < 3; i++) {
    g.lineBetween(ruinX - 34, ruinY - 6 + i * 9, ruinX + 34, ruinY - 6 + i * 9);
  }
  // 左侧断柱
  const colLX = ruinX - 18;
  g.fillStyle(0x9a9a8a, 1);
  g.fillRect(colLX - 6, ruinY - 70, 12, 60);
  g.fillStyle(0xb0b0a0, 1);
  g.fillRect(colLX - 8, ruinY - 74, 16, 6);
  g.fillRect(colLX - 8, ruinY - 14, 16, 6);
  // 断口（不规则）
  g.fillStyle(0x7a7a6a, 1);
  g.beginPath();
  g.moveTo(colLX - 7, ruinY - 74);
  g.lineTo(colLX - 3, ruinY - 80);
  g.lineTo(colLX + 2, ruinY - 76);
  g.lineTo(colLX + 8, ruinY - 82);
  g.lineTo(colLX + 7, ruinY - 74);
  g.closePath(); g.fillPath();
  // 右侧完整柱
  const colRX = ruinX + 18;
  g.fillStyle(0x9a9a8a, 1);
  g.fillRect(colRX - 6, ruinY - 110, 12, 100);
  g.fillStyle(0xb0b0a0, 1);
  g.fillRect(colRX - 10, ruinY - 116, 20, 8);
  g.fillRect(colRX - 10, ruinY - 14, 20, 6);
  // 柱头（科林斯式简单）
  g.fillStyle(0xc0c0b0, 1);
  g.fillRect(colRX - 12, ruinY - 120, 24, 6);
  g.fillStyle(0x9a9a8a, 0.7);
  g.fillEllipse(colRX, ruinY - 118, 14, 4);
  // 横梁（残破）
  g.fillStyle(0x8a8a7a, 1);
  g.fillRect(colLX - 8, ruinY - 116, 22, 8);
  g.beginPath();
  g.moveTo(colLX + 14, ruinY - 116);
  g.lineTo(colLX + 28, ruinY - 108);
  g.lineTo(colLX + 14, ruinY - 100);
  g.closePath(); g.fillPath();
  // 爬藤（深绿色缠绕藤蔓）
  g.fillStyle(0x2a6a2a, 0.9);
  for (let v = 0; v < 3; v++) {
    const vineX = colRX + 2 + v * 2;
    let vy = ruinY - 116;
    while (vy < ruinY - 10) {
      const sway = Math.sin((vy + ruinY) * 0.08) * 3;
      g.fillCircle(vineX + sway, vy, 1.8);
      if (v === 1 && Math.random() > 0.6) {
        // 叶子
        g.fillStyle(0x4a9a4a, 0.9);
        g.fillEllipse(vineX + sway + 5, vy, 4, 2.5);
        g.fillStyle(0x2a6a2a, 0.9);
      }
      vy += 4;
    }
  }
  // 石柱上的藤叶（左断柱）
  g.fillStyle(0x4a9a4a, 0.9);
  g.fillEllipse(colLX - 4, ruinY - 40, 6, 3);
  g.fillEllipse(colLX + 6, ruinY - 28, 5, 2.8);

  // ========== 11c. 右侧石塔（带红色瓦片屋顶） ==========
  const towerX = w * 0.74, towerY = h * 0.58;
  // 塔阴影
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(towerX + 5, towerY + 60, 44, 10);
  // 塔身（灰色石砌，上窄下宽）
  g.fillStyle(0x706a5a, 1);
  g.beginPath();
  g.moveTo(towerX - 30, towerY + 60);
  g.lineTo(towerX - 22, towerY - 40);
  g.lineTo(towerX + 22, towerY - 40);
  g.lineTo(towerX + 30, towerY + 60);
  g.closePath(); g.fillPath();
  g.fillStyle(0x8a8472, 1);
  g.beginPath();
  g.moveTo(towerX - 26, towerY + 58);
  g.lineTo(towerX - 20, towerY - 38);
  g.lineTo(towerX + 0, towerY - 38);
  g.lineTo(towerX + 0, towerY + 58);
  g.closePath(); g.fillPath();
  // 石砖纹
  g.lineStyle(1, 0x5a5448, 0.6);
  for (let ry = 0; ry < 10; ry++) {
    const yL = towerY - 36 + ry * 10;
    const insL = (1 - (towerY + 60 - yL) / 100) * 26;
    g.lineBetween(towerX - insL, yL, towerX + insL, yL);
    if (ry % 2 === 0) {
      g.lineBetween(towerX, yL, towerX, yL + 10);
    } else {
      g.lineBetween(towerX - insL * 0.5, yL, towerX - insL * 0.5, yL + 10);
      g.lineBetween(towerX + insL * 0.5, yL, towerX + insL * 0.5, yL + 10);
    }
  }
  // 塔窗
  g.fillStyle(0x1a2a3a, 0.95);
  g.beginPath();
  g.moveTo(towerX - 6, towerY - 10);
  g.lineTo(towerX + 6, towerY - 10);
  g.lineTo(towerX + 6, towerY + 12);
  g.lineTo(towerX, towerY + 22);
  g.lineTo(towerX - 6, towerY + 12);
  g.closePath(); g.fillPath();
  g.lineStyle(1.5, 0x3a4a5a, 1);
  g.lineBetween(towerX, towerY - 10, towerX, towerY + 20);
  // 屋檐
  g.fillStyle(0x4a3a2a, 1);
  g.fillRect(towerX - 28, towerY - 48, 56, 8);
  g.fillStyle(0x6a5a4a, 0.85);
  g.beginPath();
  g.moveTo(towerX - 34, towerY - 40);
  g.lineTo(towerX - 28, towerY - 48);
  g.lineTo(towerX + 28, towerY - 48);
  g.lineTo(towerX + 34, towerY - 40);
  g.closePath(); g.fillPath();
  // 红瓦屋顶（锥形+瓦片纹）
  const roofH = 72;
  g.fillStyle(0x7a2020, 1);
  g.beginPath();
  g.moveTo(towerX - 28, towerY - 48);
  g.lineTo(towerX, towerY - 48 - roofH);
  g.lineTo(towerX + 28, towerY - 48);
  g.closePath(); g.fillPath();
  // 瓦片层
  const tileRows = 8;
  for (let tr = 0; tr < tileRows; tr++) {
    const prog = tr / tileRows;
    const tY = towerY - 48 - roofH * (1 - prog * 0.92);
    const tW = 28 * (0.2 + prog * 0.8);
    const tileCol = tr % 2 === 0 ? 0xa83030 : 0x8a2828;
    g.fillStyle(tileCol, 1);
    g.fillRect(towerX - tW, tY, tW * 2, roofH / tileRows + 2);
    // 瓦片弧（手动贝塞尔）
    g.lineStyle(1, 0x5a1010, 0.7);
    const tileN = Math.max(2, Math.floor(tW / 8));
    for (let ti = 0; ti < tileN; ti++) {
      const tx = towerX - tW + 2 + ti * ((tW * 2 - 4) / tileN);
      const p0x = tx, p0y = tY + 2;
      const p1x = tx + 4, p1y = tY + 6;
      const p2x = tx + 8, p2y = tY + 2;
      g.beginPath();
      g.moveTo(p0x, p0y);
      for (let bt = 1; bt <= 6; bt++) {
        const tt = bt / 6;
        const bx = (1 - tt) * (1 - tt) * p0x + 2 * (1 - tt) * tt * p1x + tt * tt * p2x;
        const by = (1 - tt) * (1 - tt) * p0y + 2 * (1 - tt) * tt * p1y + tt * tt * p2y;
        g.lineTo(bx, by);
      }
      g.strokePath();
    }
  }
  // 屋顶尖小旗
  g.fillStyle(0x5a5a5a, 1);
  g.fillRect(towerX - 1, towerY - 48 - roofH - 12, 2, 14);
  g.fillStyle(0xf0c040, 1);
  g.beginPath();
  g.moveTo(towerX + 1, towerY - 48 - roofH - 12);
  g.lineTo(towerX + 12, towerY - 48 - roofH - 8);
  g.lineTo(towerX + 1, towerY - 48 - roofH - 4);
  g.closePath(); g.fillPath();

  // ========== 11d. 中景小木屋（带红屋顶） ==========
  const houseX = w * 0.60, houseY = h * 0.50;
  // 屋身
  g.fillStyle(0xf0e0c0, 1);
  g.fillRoundedRect(houseX - 26, houseY - 8, 52, 40, 3);
  g.fillStyle(0xe0d0b0, 1);
  g.fillRect(houseX + 0, houseY - 8, 26, 40);
  // 墙木线
  g.lineStyle(1, 0xb09870, 0.7);
  for (let wy = 0; wy < 4; wy++) {
    g.lineBetween(houseX - 26, houseY + wy * 10, houseX + 26, houseY + wy * 10);
  }
  // 小窗
  g.fillStyle(0x8adfff, 1);
  g.fillRect(houseX + 8, houseY, 10, 12);
  g.lineStyle(1.5, 0x7a5a3a, 1);
  g.strokeRect(houseX + 8, houseY, 10, 12);
  g.lineBetween(houseX + 13, houseY, houseX + 13, houseY + 12);
  g.lineBetween(houseX + 8, houseY + 6, houseX + 18, houseY + 6);
  // 门
  g.fillStyle(0x6a4a20, 1);
  g.fillRoundedRect(houseX - 16, houseY + 14, 12, 18, 6);
  g.lineStyle(1.5, 0x4a2a10, 1);
  g.strokeRoundedRect(houseX - 16, houseY + 14, 12, 18, 6);
  g.fillStyle(CARTOON.hexGold, 1);
  g.fillCircle(houseX - 7, houseY + 24, 1.2);
  // 屋顶（三角+瓦片）
  g.fillStyle(0x8a2020, 1);
  g.beginPath();
  g.moveTo(houseX - 34, houseY - 8);
  g.lineTo(houseX, houseY - 46);
  g.lineTo(houseX + 34, houseY - 8);
  g.closePath(); g.fillPath();
  // 瓦片
  for (let tr = 0; tr < 6; tr++) {
    const prog = tr / 6;
    const tY = houseY - 8 - 38 * (1 - prog * 0.92);
    const tW = 34 * (0.2 + prog * 0.8);
    g.fillStyle(tr % 2 === 0 ? 0xb03030 : 0x902828, 1);
    g.fillRect(houseX - tW, tY, tW * 2, 7);
  }
  // 烟囱
  g.fillStyle(0x6a4a3a, 1);
  g.fillRect(houseX + 12, houseY - 42, 10, 20);
  g.fillStyle(0x8a6a5a, 1);
  g.fillRect(houseX + 10, houseY - 44, 14, 4);
  // 烟囱冒烟
  g.fillStyle(0xffffff, 0.35);
  for (let sk = 0; sk < 4; sk++) {
    g.fillEllipse(houseX + 17 + sk * 3, houseY - 56 - sk * 8, 6 - sk, 6 - sk);
  }

  // 增强城堡：周围城墙+防御塔
  drawCastleWallsOnG(g, castleX, castleY - 10, w, h);

  // ========== V2 光影增强：云投影 + 明暗分层 + 暗角 ==========
  // 12.1 云在地面/山坡上的投影（淡灰色椭圆，分布于 hill1/hill2 区域）
  const cloudShadowPositions = [
    [w * 0.20, h * 0.44, 68, 14],
    [w * 0.48, h * 0.42, 58, 12],
    [w * 0.72, h * 0.45, 72, 16],
    [w * 0.88, h * 0.50, 56, 12],
    [w * 0.12, h * 0.60, 88, 18],
    [w * 0.36, h * 0.66, 76, 16],
    [w * 0.60, h * 0.62, 66, 14],
    [w * 0.82, h * 0.68, 72, 16],
  ];
  cloudShadowPositions.forEach(([cx, cy, crx, cry]) => {
    g.fillStyle(0x000000, 0.08);
    g.fillEllipse(cx, cy, crx, cry);
    g.fillStyle(0x000000, 0.04);
    g.fillEllipse(cx + 6, cy + 4, crx * 0.7, cry * 0.6);
  });

  // 12.2 山/丘的"向阳面vs背阳面"明暗分块（右上太阳，所以左下偏暗）
  // 远山暗化（左侧）
  g.fillStyle(0x000000, 0.07);
  g.beginPath();
  g.moveTo(0, h * 0.30);
  g.lineTo(w * 0.45, h * 0.30);
  g.lineTo(0, h * 0.38);
  g.closePath();
  g.fillPath();
  // 中丘阴影（左下暗区）
  g.fillStyle(0x000000, 0.08);
  g.beginPath();
  g.moveTo(0, hillY1 + 20);
  g.lineTo(w * 0.35, hillY1 + 20);
  for (let i = 0; i <= 4; i++) {
    const px = (w / 8) * i;
    const py = hillY1 - Math.sin(i * 0.8 + 2) * 26 - (i % 3) * 12;
    g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
  // 前台大丘阴影
  g.fillStyle(0x000000, 0.10);
  g.beginPath();
  g.moveTo(0, hillY2 + 30);
  g.lineTo(w * 0.4, hillY2 + 30);
  for (let i = 0; i <= 4; i++) {
    const px = (w / 8) * i;
    const py = hillY2 - Math.sin(i * 0.9 + 1.3) * 34 - (i % 2) * 18;
    g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
  // 前台大丘高光（右上向阳）
  g.fillStyle(0xffffff, 0.05);
  g.beginPath();
  g.moveTo(w * 0.55, hillY2 + 30);
  g.lineTo(w, hillY2 + 30);
  for (let i = 8; i >= 4; i--) {
    const px = (w / 8) * i;
    const py = hillY2 - 10 - Math.sin(i * 0.9 + 1.3) * 30 - (i % 2) * 16;
    g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();

  // 12.3 草丛簇（细密短草，成片分布）
  for (let ci = 0; ci < 80; ci++) {
    const bx = Math.random() * w;
    const by = h * 0.63 + Math.random() * (h * 0.33);
    const bladeCount = 4 + Math.floor(Math.random() * 4);
    for (let bb = 0; bb < bladeCount; bb++) {
      const bx2 = bx + (bb - bladeCount / 2) * 2 + (Math.random() - 0.5);
      const hh = 4 + Math.random() * 5;
      const curl = (Math.random() - 0.5) * 2;
      g.lineStyle(1.2, Math.random() > 0.5 ? 0x3a8a32 : 0x4aaa42, 0.9);
      g.beginPath();
      g.moveTo(bx2, by);
      // 6段贝塞尔向上+微弯
      for (let st = 1; st <= 6; st++) {
        const tt = st / 6;
        g.lineTo(bx2 + curl * tt * 2, by - hh * tt);
      }
      g.strokePath();
    }
  }

  // 12.4 路边零散金币（模拟原版路径奖励）
  for (let ci = 0; ci < 12; ci++) {
    const idx = 6 + ci * 3;
    if (idx >= roadPts.length) break;
    const pt = roadPts[idx];
    const offX = (ci % 2 ? -26 : 26) + (Math.random() - 0.5) * 4;
    const gy = pt.y + 4;
    // 金币阴影
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(pt.x + offX + 1, gy + 4, 6, 2.2);
    // 金币外圈
    g.fillStyle(0x7a5a10, 1);
    g.fillCircle(pt.x + offX, gy, 5.2);
    g.fillStyle(0xd4a030, 1);
    g.fillCircle(pt.x + offX, gy, 4.4);
    g.fillStyle(0xf4d060, 1);
    g.fillCircle(pt.x + offX, gy, 3.4);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(pt.x + offX - 1.4, gy - 1.4, 1.2);
    // ¢ 或者星符号
    g.lineStyle(1, 0x7a5a10, 1);
    g.beginPath();
    g.moveTo(pt.x + offX, gy - 1.8);
    g.lineTo(pt.x + offX, gy + 1.8);
    g.strokePath();
  }

  // 12.5 太阳方向的柔和光晕覆盖整个右上天空（白色+淡黄，增加通透感）
  for (let rr = 0; rr < 10; rr++) {
    g.fillStyle(0xffffff, (0.04 - rr * 0.003));
    g.fillCircle(sunX - 30, sunY + 10, 220 - rr * 14);
  }
  for (let rr = 0; rr < 6; rr++) {
    g.fillStyle(0xffe9a0, (0.025 - rr * 0.003));
    g.fillCircle(sunX, sunY, 260 - rr * 22);
  }

  // 12.6 画面四角暗角（vignette，增加"戏剧感"聚焦）
  const vignetteLay = 6;
  for (let v = 0; v < vignetteLay; v++) {
    const t = v / vignetteLay;
    g.fillStyle(0x000000, 0.04 + t * 0.04);
    const vx = 8 + v * 12, vy = 8 + v * 14, vw = w - 16 - v * 24, vh = h - 16 - v * 28;
    // 上暗条
    g.fillRect(0, 0, w, vy);
    // 下暗条
    g.fillRect(0, h - vy, w, vy);
    // 左
    g.fillRect(0, vy, vx, vh);
    // 右
    g.fillRect(w - vx, vy, vx, vh);
  }

  // ========== V3 高级地形增强：草地精细化 + 远景雾山 + 石板路 + 路灯 ==========
  drawDistantFogMountains(g, w, h, sunX, sunY);
  drawHotAirBalloon(g, w * 0.78, h * 0.18, 1);
  drawHotAirBalloon(g, w * 0.22, h * 0.10, 0.7);
  drawDetailedGrasslands(g, w, h);
  drawCobblestonePath(g, roadPts, w, h);
  drawRoadTorches(g, roadPts, h);
  drawSignPosts(g, w, h);

  // 把 graphics 也加入容器
  container.add(g);
  return container;
}

function drawWindmillOnG(g: Phaser.GameObjects.Graphics, x: number, y: number, s = 1) {
  // 塔
  g.fillStyle(0xd8c89a, 1);
  g.beginPath();
  g.moveTo(x - 16 * s, y + 80 * s);
  g.lineTo(x - 10 * s, y - 20 * s);
  g.lineTo(x + 10 * s, y - 20 * s);
  g.lineTo(x + 16 * s, y + 80 * s);
  g.closePath(); g.fillPath();
  g.fillStyle(0x8a5a2a, 1);
  g.fillRect(x - 6 * s, y + 20 * s, 12 * s, 26 * s);
  // 屋顶
  g.fillStyle(CARTOON.castleRoof, 1);
  g.beginPath();
  g.moveTo(x - 12 * s, y - 20 * s);
  g.lineTo(x, y - 36 * s);
  g.lineTo(x + 12 * s, y - 20 * s);
  g.closePath(); g.fillPath();
  // 十字风叶
  g.lineStyle(4 * s, 0xfaf0e0, 1);
  g.lineBetween(x, y - 28 * s, x - 40 * s, y - 48 * s);
  g.lineBetween(x, y - 28 * s, x + 40 * s, y - 8 * s);
  g.lineBetween(x, y - 28 * s, x - 8 * s, y + 14 * s);
  g.fillStyle(0x7a5a3a, 1);
  g.fillCircle(x, y - 28 * s, 4 * s);
  // 风叶挡板
  const blades = [
    { bx: -40, by: -48, r: -0.6 },
    { bx: 40, by: -8, r: 0.4 },
    { bx: -8, by: 14, r: 1.57 },
  ];
  g.save();
  blades.forEach(B => {
    g.translateCanvas(x, y - 28 * s);
    g.rotateCanvas(B.r);
    g.fillStyle(0xfaf0e0, 0.9);
    g.fillRect(4 * s, -30 * s, 30 * s, 8 * s);
    g.fillStyle(0x8a5a2a, 1);
    g.fillRect(2 * s, -32 * s, 4 * s, 12 * s);
    g.rotateCanvas(-B.r);
    g.translateCanvas(-x, -(y - 28 * s));
  });
  g.restore();
}

function drawFenceOnG(g: Phaser.GameObjects.Graphics, x: number, y: number) {
  g.fillStyle(0x8a5a2a, 1);
  g.fillRect(x, y - 20, 4, 24);
  g.fillRect(x + 10, y - 24, 4, 28);
  g.fillRect(x + 20, y - 20, 4, 24);
  g.fillStyle(0xa06a30, 1);
  g.fillRect(x - 2, y - 14, 28, 3);
  g.fillRect(x - 2, y - 5, 28, 3);
  // 尖头
  g.fillStyle(0x8a5a2a, 1);
  g.beginPath();
  g.moveTo(x, y - 20); g.lineTo(x + 2, y - 26); g.lineTo(x + 4, y - 20);
  g.closePath(); g.fillPath();
  g.beginPath();
  g.moveTo(x + 10, y - 24); g.lineTo(x + 12, y - 32); g.lineTo(x + 14, y - 24);
  g.closePath(); g.fillPath();
  g.beginPath();
  g.moveTo(x + 20, y - 20); g.lineTo(x + 22, y - 26); g.lineTo(x + 24, y - 20);
  g.closePath(); g.fillPath();
}

// 城堡城墙（环绕中心城堡主体）
function drawCastleWallsOnG(g: Phaser.GameObjects.Graphics, castleX: number, castleY: number, _w: number, _h: number) {
  // 外围城墙（带城垛齿）
  const wallL = castleX - 160, wallR = castleX + 160;
  const wallY = castleY + 36;
  // 墙主体
  g.fillStyle(0xc8b898, 1);
  g.fillRect(wallL, wallY - 6, wallR - wallL, 30);
  g.fillStyle(0xd8c8a8, 0.9);
  g.fillRect(wallL + 2, wallY - 4, wallR - wallL - 4, 26);
  // 城垛（顶部齿）
  const merlonN = 16;
  for (let i = 0; i < merlonN; i++) {
    if (i % 2 === 0) {
      const mx = wallL + i * ((wallR - wallL) / merlonN);
      g.fillStyle(0xc8b898, 1);
      g.fillRect(mx, wallY - 14, (wallR - wallL) / merlonN, 10);
      g.fillStyle(0xd8c8a8, 0.9);
      g.fillRect(mx + 1, wallY - 13, (wallR - wallL) / merlonN - 2, 8);
    }
  }
  // 城墙底阴影
  g.fillStyle(0x7a6a4a, 1);
  g.fillRect(wallL, wallY + 22, wallR - wallL, 4);
  // 城墙石砖纹
  g.lineStyle(1, 0x9a8a6a, 0.55);
  const brickRows = 3;
  for (let br = 0; br < brickRows; br++) {
    const by = wallY + 2 + br * 9;
    g.lineBetween(wallL + 2, by, wallR - 2, by);
    const cols = 8;
    for (let bc = 0; bc < cols; bc++) {
      const off = (br % 2 === 0 ? 0 : (wallR - wallL) / cols / 2);
      g.lineBetween(wallL + off + bc * ((wallR - wallL) / cols), by, wallL + off + bc * ((wallR - wallL) / cols), by + 9);
    }
  }
  // 防御塔（左右两端塔）
  const towers = [wallL - 10, wallR + 10];
  towers.forEach((tx, ti) => {
    const side = ti === 0 ? -1 : 1;
    // 塔身
    g.fillStyle(0xb8a888, 1);
    g.fillRect(tx - 16, wallY - 50, 32, 74);
    g.fillStyle(0xc8b898, 0.9);
    g.fillRect(tx - 14 + side * 1, wallY - 48, 28, 70);
    // 城垛（塔顶齿）
    for (let mi = 0; mi < 4; mi++) {
      g.fillStyle(0xb8a888, 1);
      g.fillRect(tx - 16 + mi * 9, wallY - 58, 6, 10);
    }
    // 小窗
    g.fillStyle(0x1a2a3a, 0.95);
    g.fillRoundedRect(tx - 5, wallY - 28, 10, 14, 4);
    g.lineStyle(1.5, 0x5a4a2a, 1);
    g.strokeRoundedRect(tx - 5, wallY - 28, 10, 14, 4);
    // 塔底加固
    g.fillStyle(0x9a8a6a, 0.9);
    g.fillRect(tx - 20, wallY + 18, 40, 8);
  });
}

// =============================================
// 精致矢量图标（代替 emoji，风格贴合原版金属/宝石质感）
// 所有函数在给定 Graphics 上局部坐标系 (0..1) 中绘制，调用方负责平移/缩放
// =============================================

// 通用工具：将一组 0..1 坐标点按 scale 缩放并平移 (ox,oy)，fill 或 stroke
function polyPath(g: Phaser.GameObjects.Graphics, pts: [number, number][], ox: number, oy: number, s: number) {
  g.beginPath();
  g.moveTo(ox + pts[0][0] * s, oy + pts[0][1] * s);
  for (let i = 1; i < pts.length; i++) g.lineTo(ox + pts[i][0] * s, oy + pts[i][1] * s);
  g.closePath();
}

/** 宝箱图标：金属带扣+木身 */
function drawIconChest(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number) {
  const s = size;
  const ox = cx - s / 2;
  const oy = cy - s / 2;
  // 阴影
  g.fillStyle(0x5a3a12, 1);
  g.fillRoundedRect(ox + s * 0.06, oy + s * 0.22, s * 0.88, s * 0.7, s * 0.1);
  // 木身体（深棕→棕分层）
  g.fillStyle(0x6b3e15, 1); g.fillRoundedRect(ox + s * 0.08, oy + s * 0.34, s * 0.84, s * 0.56, s * 0.08);
  g.fillStyle(0x8a5420, 1); g.fillRoundedRect(ox + s * 0.1,  oy + s * 0.36, s * 0.8,  s * 0.3,  s * 0.08);
  // 金属横梁
  g.fillStyle(0xc89638, 1); g.fillRect(ox + s * 0.08, oy + s * 0.5, s * 0.84, s * 0.08);
  g.fillStyle(0xfbe18a, 1); g.fillRect(ox + s * 0.08, oy + s * 0.5, s * 0.84, s * 0.02);
  g.fillStyle(0x7a5a14, 1); g.fillRect(ox + s * 0.08, oy + s * 0.56, s * 0.84, s * 0.02);
  // 箱子顶盖（弧形）
  g.fillStyle(0x6b3e15, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.08, oy + s * 0.34);
  g.lineTo(ox + s * 0.08, oy + s * 0.28);
  g.arc(ox + s * 0.5, oy + s * 0.28, s * 0.42, Math.PI, 0, false);
  g.lineTo(ox + s * 0.92, oy + s * 0.34);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x8a5420, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.12, oy + s * 0.33);
  g.lineTo(ox + s * 0.12, oy + s * 0.29);
  g.arc(ox + s * 0.5, oy + s * 0.29, s * 0.38, Math.PI, 0, false);
  g.lineTo(ox + s * 0.88, oy + s * 0.33);
  g.closePath();
  g.fillPath();
  // 金属顶盖箍
  g.fillStyle(0xc89638, 1);
  g.fillRect(ox + s * 0.08, oy + s * 0.3, s * 0.84, s * 0.04);
  g.fillStyle(0xfbe18a, 1);
  g.fillRect(ox + s * 0.08, oy + s * 0.3, s * 0.84, s * 0.01);
  // 金属锁扣
  g.fillStyle(0xc89638, 1); g.fillRect(ox + s * 0.42, oy + s * 0.42, s * 0.16, s * 0.24);
  g.fillStyle(0xfbe18a, 1); g.fillRect(ox + s * 0.42, oy + s * 0.42, s * 0.16, s * 0.03);
  g.fillStyle(0x5a3a0a, 1); g.fillRect(ox + s * 0.42, oy + s * 0.63, s * 0.16, s * 0.03);
  g.fillStyle(0x2a1a0a, 1); g.fillRect(ox + s * 0.47, oy + s * 0.52, s * 0.06, s * 0.08);
  // 宝石点缀
  g.fillStyle(0x2ac9a0, 1); g.fillCircle(ox + s * 0.22, oy + s * 0.55, s * 0.04);
  g.fillStyle(0x6affd0, 0.9); g.fillCircle(ox + s * 0.21, oy + s * 0.54, s * 0.015);
  g.fillStyle(0x2ac9a0, 1); g.fillCircle(ox + s * 0.78, oy + s * 0.55, s * 0.04);
  g.fillStyle(0x6affd0, 0.9); g.fillCircle(ox + s * 0.77, oy + s * 0.54, s * 0.015);
  // 高光
  g.fillStyle(0xffffff, 0.18);
  g.fillRoundedRect(ox + s * 0.12, oy + s * 0.36, s * 0.76, s * 0.08, s * 0.04);
}

/** 信封图标（邮件/邀请） */
function drawIconEnvelope(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, style: 'mail'|'invite'='mail') {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  // 主体
  g.fillStyle(0xf3dca0, 1);
  g.fillRoundedRect(ox + s * 0.08, oy + s * 0.26, s * 0.84, s * 0.58, s * 0.06);
  g.fillStyle(0xfff4d0, 1);
  g.fillRoundedRect(ox + s * 0.1, oy + s * 0.28, s * 0.8, s * 0.3, s * 0.04);
  // 翻盖三角
  g.fillStyle(style === 'invite' ? 0xd05a3a : 0xe0bc74, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.08, oy + s * 0.26);
  g.lineTo(ox + s * 0.5, oy + s * 0.6);
  g.lineTo(ox + s * 0.92, oy + s * 0.26);
  g.closePath();
  g.fillPath();
  // 翻盖边缘高光
  g.lineStyle(1.5, 0xffffff, 0.4);
  g.beginPath();
  g.moveTo(ox + s * 0.08, oy + s * 0.26);
  g.lineTo(ox + s * 0.5, oy + s * 0.6);
  g.lineTo(ox + s * 0.92, oy + s * 0.26);
  g.strokePath();
  // 邀请：火漆印章
  if (style === 'invite') {
    g.fillStyle(0xb02020, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.58, s * 0.13);
    g.fillStyle(0xe0402a, 1); g.fillCircle(ox + s * 0.495, oy + s * 0.575, s * 0.1);
    g.fillStyle(0xff8060, 0.7); g.fillCircle(ox + s * 0.47, oy + s * 0.55, s * 0.03);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(ox + s * 0.5, oy + s * 0.58, s * 0.02);
    // 印章丝带
    g.fillStyle(0x701010, 1);
    g.fillRect(ox + s * 0.36, oy + s * 0.64, s * 0.28, s * 0.04);
  } else {
    // 普通邮件：蓝色封扣
    g.fillStyle(0x1a6ec0, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.58, s * 0.1);
    g.fillStyle(0x5ab0ff, 1); g.fillCircle(ox + s * 0.495, oy + s * 0.575, s * 0.07);
    g.lineStyle(2, 0xffffff, 0.8);
    g.beginPath();
    g.moveTo(ox + s * 0.46, oy + s * 0.58);
    g.lineTo(ox + s * 0.5, oy + s * 0.54);
    g.lineTo(ox + s * 0.55, oy + s * 0.6);
    g.strokePath();
  }
  // 信封边缘
  g.lineStyle(1.2, 0x8a6a20, 0.7);
  g.strokeRoundedRect(ox + s * 0.08, oy + s * 0.26, s * 0.84, s * 0.58, s * 0.06);
}

/** 背包/工具箱（限时/背包） */
function drawIconBag(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, kind: 'bag'|'kit'='bag') {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  // 包身
  g.fillStyle(kind === 'bag' ? 0x7a4ec0 : 0x5a6a7a, 1);
  g.fillRoundedRect(ox + s * 0.14, oy + s * 0.34, s * 0.72, s * 0.54, s * 0.1);
  g.fillStyle(kind === 'bag' ? 0x9a6ee0 : 0x7a8a9a, 1);
  g.fillRoundedRect(ox + s * 0.16, oy + s * 0.36, s * 0.68, s * 0.3, s * 0.09);
  // 翻盖
  g.fillStyle(kind === 'bag' ? 0x4a2e80 : 0x3a4a5a, 1);
  g.fillRoundedRect(ox + s * 0.1, oy + s * 0.22, s * 0.8, s * 0.22, s * 0.08);
  // 金属带
  g.fillStyle(0xc89638, 1); g.fillRect(ox + s * 0.46, oy + s * 0.26, s * 0.08, s * 0.38);
  g.fillStyle(0xfbe18a, 1); g.fillRect(ox + s * 0.46, oy + s * 0.26, s * 0.08, s * 0.03);
  g.fillStyle(0xc89638, 1); g.fillRoundedRect(ox + s * 0.38, oy + s * 0.52, s * 0.24, s * 0.08, s * 0.02);
  g.fillStyle(0xfbe18a, 1); g.fillRect(ox + s * 0.38, oy + s * 0.52, s * 0.24, s * 0.02);
  g.fillStyle(0x2a1a0a, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.56, s * 0.02);
  // 工具箱特定：锤子/齿轮
  if (kind === 'kit') {
    g.fillStyle(0xb0b0c0, 1);
    g.fillRect(ox + s * 0.22, oy + s * 0.66, s * 0.14, s * 0.08);
    g.fillStyle(0x8a5420, 1);
    g.fillRect(ox + s * 0.2, oy + s * 0.72, s * 0.18, s * 0.1);
    // 齿轮
    g.fillStyle(0xe0d050, 1);
    g.beginPath();
    const tcx = ox + s * 0.74, tcy = oy + s * 0.72, r = s * 0.1;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      g.moveTo(tcx, tcy);
      g.lineTo(tcx + Math.cos(a) * r * 1.3, tcy + Math.sin(a) * r * 1.3);
      g.lineTo(tcx + Math.cos(a + Math.PI / 8) * r, tcy + Math.sin(a + Math.PI / 8) * r);
    }
    g.closePath();
    g.fillPath();
    g.fillStyle(0x5a3a0a, 1); g.fillCircle(tcx, tcy, s * 0.03);
  } else {
    // 背包：口袋
    g.fillStyle(kind === 'bag' ? 0x4a2e80 : 0x3a4a5a, 1);
    g.fillRoundedRect(ox + s * 0.22, oy + s * 0.66, s * 0.56, s * 0.16, s * 0.04);
    g.fillStyle(0xffffff, 0.15);
    g.fillRoundedRect(ox + s * 0.24, oy + s * 0.68, s * 0.52, s * 0.04, s * 0.02);
  }
  // 高光
  g.fillStyle(0xffffff, 0.18);
  g.fillRoundedRect(ox + s * 0.16, oy + s * 0.24, s * 0.68, s * 0.08, s * 0.04);
}

/** 世界地图图标 */
function drawIconMap(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number) {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  // 折叠地图纸
  g.fillStyle(0xd8b878, 1);
  g.fillRoundedRect(ox + s * 0.08, oy + s * 0.18, s * 0.84, s * 0.7, s * 0.04);
  g.fillStyle(0xf0dcac, 1);
  g.fillRoundedRect(ox + s * 0.1, oy + s * 0.2, s * 0.8, s * 0.34, s * 0.03);
  // 地图折痕
  g.lineStyle(1, 0x6a4a20, 0.5);
  g.beginPath();
  g.moveTo(ox + s * 0.36, oy + s * 0.2); g.lineTo(ox + s * 0.36, oy + s * 0.88);
  g.moveTo(ox + s * 0.62, oy + s * 0.2); g.lineTo(ox + s * 0.62, oy + s * 0.88);
  g.strokePath();
  // 陆地色块（绿岛）
  g.fillStyle(0x6ab040, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.18, oy + s * 0.4);
  g.lineTo(ox + s * 0.3,  oy + s * 0.34);
  g.lineTo(ox + s * 0.34, oy + s * 0.52);
  g.lineTo(ox + s * 0.2,  oy + s * 0.58);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x5aa030, 0.8);
  g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.08);
  g.fillStyle(0x5aa030, 0.8);
  g.beginPath();
  g.moveTo(ox + s * 0.68, oy + s * 0.34);
  g.lineTo(ox + s * 0.84, oy + s * 0.42);
  g.lineTo(ox + s * 0.78, oy + s * 0.64);
  g.closePath();
  g.fillPath();
  // 海洋
  g.fillStyle(0x3a8ee6, 0.55);
  g.fillRect(ox + s * 0.42, oy + s * 0.62, s * 0.14, s * 0.04);
  g.fillRect(ox + s * 0.14, oy + s * 0.68, s * 0.14, s * 0.04);
  // 山脉三角
  g.fillStyle(0x7a5a3a, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.74, oy + s * 0.74);
  g.lineTo(ox + s * 0.78, oy + s * 0.6);
  g.lineTo(ox + s * 0.82, oy + s * 0.74);
  g.closePath();
  g.fillPath();
  g.fillStyle(0xffffff, 0.9);
  g.beginPath();
  g.moveTo(ox + s * 0.77, oy + s * 0.64);
  g.lineTo(ox + s * 0.78, oy + s * 0.6);
  g.lineTo(ox + s * 0.79, oy + s * 0.64);
  g.closePath();
  g.fillPath();
  // 红色图钉
  g.fillStyle(0xd03030, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.05);
  g.fillStyle(0xff7060, 0.9); g.fillCircle(ox + s * 0.49, oy + s * 0.49, s * 0.02);
  // 罗盘
  g.fillStyle(0xc89638, 1); g.fillCircle(ox + s * 0.88, oy + s * 0.22, s * 0.07);
  g.fillStyle(0xfbe18a, 1); g.fillCircle(ox + s * 0.88, oy + s * 0.22, s * 0.05);
  g.fillStyle(0xd03030, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.88, oy + s * 0.17);
  g.lineTo(ox + s * 0.86, oy + s * 0.22);
  g.lineTo(ox + s * 0.88, oy + s * 0.27);
  g.lineTo(ox + s * 0.9,  oy + s * 0.22);
  g.closePath();
  g.fillPath();
  // 边框阴影
  g.lineStyle(1.2, 0x6a4a20, 0.7);
  g.strokeRoundedRect(ox + s * 0.08, oy + s * 0.18, s * 0.84, s * 0.7, s * 0.04);
}

/** 指南针（任务） */
function drawIconCompass(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number) {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  // 外圈金属
  g.fillStyle(0x8a6a3a, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.38);
  g.fillStyle(0xc89638, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.34);
  g.fillStyle(0xfbe18a, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.3);
  // 刻度
  g.fillStyle(0x5a3a0a, 1);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const x1 = ox + s * 0.5 + Math.cos(a) * s * 0.26;
    const y1 = oy + s * 0.5 + Math.sin(a) * s * 0.26;
    const x2 = ox + s * 0.5 + Math.cos(a) * s * 0.3;
    const y2 = oy + s * 0.5 + Math.sin(a) * s * 0.3;
    g.lineStyle(2, 0x5a3a0a, 1);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
  }
  // 指针（红色N）
  g.fillStyle(0xd03030, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.5, oy + s * 0.22);
  g.lineTo(ox + s * 0.44, oy + s * 0.5);
  g.lineTo(ox + s * 0.5, oy + s * 0.54);
  g.lineTo(ox + s * 0.56, oy + s * 0.5);
  g.closePath();
  g.fillPath();
  // 指针（银灰色S）
  g.fillStyle(0xc0c8d0, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.5, oy + s * 0.78);
  g.lineTo(ox + s * 0.44, oy + s * 0.5);
  g.lineTo(ox + s * 0.5, oy + s * 0.46);
  g.lineTo(ox + s * 0.56, oy + s * 0.5);
  g.closePath();
  g.fillPath();
  // 中心铆钉
  g.fillStyle(0x5a3a0a, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.05);
  g.fillStyle(0x8a6a3a, 1); g.fillCircle(ox + s * 0.5, oy + s * 0.5, s * 0.03);
  // N字母
  g.fillStyle(0x5a3a0a, 1);
  const ctx: any = g;
  if (ctx.scene && ctx.scene.add) {
    // 留到外部scene.add.text去画
  }
}

/** 聊天（对话框+笑脸） */
function drawIconChat(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, kind: 'chat'|'circle'='chat') {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  if (kind === 'circle') {
    // 聊天：两个头像圈
    g.fillStyle(0x3a8ee6, 1); g.fillCircle(ox + s * 0.38, oy + s * 0.4, s * 0.22);
    g.fillStyle(0x6ab0f0, 1); g.fillCircle(ox + s * 0.38, oy + s * 0.4, s * 0.17);
    g.fillStyle(0x2ac9a0, 1); g.fillCircle(ox + s * 0.64, oy + s * 0.54, s * 0.22);
    g.fillStyle(0x6affd0, 1); g.fillCircle(ox + s * 0.64, oy + s * 0.54, s * 0.17);
    // 脸
    g.fillStyle(0xffffff, 1);
    // 眼
    g.fillCircle(ox + s * 0.34, oy + s * 0.38, s * 0.025);
    g.fillCircle(ox + s * 0.42, oy + s * 0.38, s * 0.025);
    g.fillCircle(ox + s * 0.6,  oy + s * 0.52, s * 0.025);
    g.fillCircle(ox + s * 0.68, oy + s * 0.52, s * 0.025);
    // 嘴（微笑弧）
    g.lineStyle(2, 0xffffff, 1);
    g.beginPath();
    g.arc(ox + s * 0.38, oy + s * 0.44, s * 0.06, 0.15 * Math.PI, 0.85 * Math.PI, false);
    g.strokePath();
    g.beginPath();
    g.arc(ox + s * 0.64, oy + s * 0.58, s * 0.06, 0.15 * Math.PI, 0.85 * Math.PI, false);
    g.strokePath();
  } else {
    // 对话框气泡
    g.fillStyle(0x3a8ee6, 1);
    g.fillRoundedRect(ox + s * 0.12, oy + s * 0.18, s * 0.76, s * 0.54, s * 0.12);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(ox + s * 0.15, oy + s * 0.22, s * 0.7, s * 0.46, s * 0.1);
    // 气泡尾巴
    g.fillStyle(0x3a8ee6, 1);
    g.beginPath();
    g.moveTo(ox + s * 0.28, oy + s * 0.72);
    g.lineTo(ox + s * 0.22, oy + s * 0.86);
    g.lineTo(ox + s * 0.4,  oy + s * 0.72);
    g.closePath();
    g.fillPath();
    // 三个点（省略号）
    g.fillStyle(0x3a8ee6, 1);
    g.fillCircle(ox + s * 0.32, oy + s * 0.48, s * 0.04);
    g.fillCircle(ox + s * 0.5,  oy + s * 0.48, s * 0.04);
    g.fillCircle(ox + s * 0.68, oy + s * 0.48, s * 0.04);
  }
}

/** 沙漏（挂机） */
function drawIconHourglass(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number) {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  // 顶部金属条
  g.fillStyle(0xc89638, 1);
  g.fillRoundedRect(ox + s * 0.14, oy + s * 0.18, s * 0.72, s * 0.08, s * 0.02);
  g.fillStyle(0xfbe18a, 1); g.fillRect(ox + s * 0.14, oy + s * 0.18, s * 0.72, s * 0.02);
  g.fillStyle(0x7a5a14, 1); g.fillRect(ox + s * 0.14, oy + s * 0.24, s * 0.72, s * 0.02);
  // 底部金属条
  g.fillStyle(0xc89638, 1);
  g.fillRoundedRect(ox + s * 0.14, oy + s * 0.74, s * 0.72, s * 0.08, s * 0.02);
  g.fillStyle(0xfbe18a, 1); g.fillRect(ox + s * 0.14, oy + s * 0.74, s * 0.72, s * 0.02);
  g.fillStyle(0x7a5a14, 1); g.fillRect(ox + s * 0.14, oy + s * 0.8,  s * 0.72, s * 0.02);
  // 玻璃沙漏上半
  g.fillStyle(0xaee6ff, 0.55);
  g.beginPath();
  g.moveTo(ox + s * 0.2, oy + s * 0.26);
  g.lineTo(ox + s * 0.8, oy + s * 0.26);
  g.lineTo(ox + s * 0.54, oy + s * 0.48);
  g.closePath();
  g.fillPath();
  // 玻璃沙漏下半
  g.fillStyle(0xaee6ff, 0.45);
  g.beginPath();
  g.moveTo(ox + s * 0.46, oy + s * 0.52);
  g.lineTo(ox + s * 0.8,  oy + s * 0.74);
  g.lineTo(ox + s * 0.2,  oy + s * 0.74);
  g.closePath();
  g.fillPath();
  // 细颈
  g.fillStyle(0xc89638, 1);
  g.fillRect(ox + s * 0.46, oy + s * 0.48, s * 0.08, s * 0.04);
  // 沙子（上方残留+下方堆积）
  g.fillStyle(0xe0c070, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.28, oy + s * 0.28);
  g.lineTo(ox + s * 0.72, oy + s * 0.28);
  g.lineTo(ox + s * 0.52, oy + s * 0.44);
  g.closePath();
  g.fillPath();
  g.fillStyle(0xe0c070, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.32, oy + s * 0.7);
  g.lineTo(ox + s * 0.5,  oy + s * 0.56);
  g.lineTo(ox + s * 0.68, oy + s * 0.7);
  g.closePath();
  g.fillPath();
  // 落下的沙粒
  g.fillStyle(0xe0c070, 1);
  g.fillCircle(ox + s * 0.5, oy + s * 0.6, s * 0.01);
  g.fillCircle(ox + s * 0.5, oy + s * 0.64, s * 0.01);
  // 边框
  g.lineStyle(1.2, 0x4a80a0, 0.7);
  g.beginPath();
  g.moveTo(ox + s * 0.2, oy + s * 0.26);
  g.lineTo(ox + s * 0.8, oy + s * 0.26);
  g.lineTo(ox + s * 0.54, oy + s * 0.48);
  g.moveTo(ox + s * 0.46, oy + s * 0.52);
  g.lineTo(ox + s * 0.8, oy + s * 0.74);
  g.lineTo(ox + s * 0.2, oy + s * 0.74);
  g.closePath();
  g.strokePath();
}

/** 宝石（好友助力 / 时光秘宝，带光芒） */
function drawIconGem(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number, hue: 'pink'|'orange'|'blue'='pink') {
  const s = size; const ox = cx - s / 2; const oy = cy - s / 2;
  const hueMap = {
    pink:   [0xb020a0, 0xe060d0, 0xffa0f0, 0xffffff, 0x4a0040],
    orange: [0xd06020, 0xf0a040, 0xffd080, 0xffffff, 0x4a1a00],
    blue:   [0x2060d0, 0x50a0ff, 0x90d0ff, 0xffffff, 0x001a4a],
  } as const;
  const [c1, c2, c3, c4, cd] = hueMap[hue];
  // 八边形宝石
  const pts: [number, number][] = [
    [0.3, 0.14], [0.7, 0.14], [0.86, 0.3], [0.86, 0.7],
    [0.7, 0.86], [0.3, 0.86], [0.14, 0.7], [0.14, 0.3],
  ];
  polyPath(g, pts, ox, oy, s);
  g.fillStyle(c1, 1); g.fillPath();
  // 内部亮色区
  const inPts: [number, number][] = [
    [0.34, 0.2], [0.66, 0.2], [0.8, 0.34], [0.8, 0.6],
    [0.6, 0.78], [0.34, 0.78], [0.2, 0.6], [0.2, 0.34],
  ];
  polyPath(g, inPts, ox, oy, s);
  g.fillStyle(c2, 1); g.fillPath();
  // 上半亮面
  g.fillStyle(c3, 1);
  g.beginPath();
  g.moveTo(ox + s * 0.34, oy + s * 0.2);
  g.lineTo(ox + s * 0.66, oy + s * 0.2);
  g.lineTo(ox + s * 0.8, oy + s * 0.34);
  g.lineTo(ox + s * 0.5, oy + s * 0.5);
  g.lineTo(ox + s * 0.2, oy + s * 0.34);
  g.closePath();
  g.fillPath();
  // 高光三角形
  g.fillStyle(c4, 0.95);
  g.beginPath();
  g.moveTo(ox + s * 0.36, oy + s * 0.24);
  g.lineTo(ox + s * 0.5, oy + s * 0.28);
  g.lineTo(ox + s * 0.4, oy + s * 0.42);
  g.closePath();
  g.fillPath();
  // 宝石外发光
  g.lineStyle(2, c3, 0.7);
  polyPath(g, pts, ox, oy, s);
  g.strokePath();
  g.lineStyle(1, cd, 0.9);
  polyPath(g, inPts, ox, oy, s);
  g.strokePath();
  // 光芒线
  g.lineStyle(1.2, c3, 0.7);
  const rays = 4;
  for (let i = 0; i < rays; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const r1 = s * 0.44, r2 = s * 0.48;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    g.strokePath();
  }
}

/** 英雄进阶礼包（宝箱+进阶徽章组合） */
function drawIconAdvanceKit(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number) {
  const s = size;
  drawIconChest(g, cx, cy, s);
  // 左上角进阶徽章
  const bx = cx - s * 0.42, by = cy - s * 0.4;
  g.fillStyle(0xd0a030, 1); g.fillCircle(bx, by, s * 0.12);
  g.fillStyle(0xfbe18a, 1); g.fillCircle(bx, by, s * 0.08);
  // 箭头向上
  g.fillStyle(0x4a1a00, 1);
  g.beginPath();
  g.moveTo(bx, by - s * 0.04);
  g.lineTo(bx - s * 0.05, by + s * 0.02);
  g.lineTo(bx + s * 0.05, by + s * 0.02);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x4a1a00, 1);
  g.fillRect(bx - s * 0.015, by - s * 0.02, s * 0.03, s * 0.06);
}

/**
 * 根据 iconKey 选择绘制哪个精致矢量图标
 */
export type IconKey = 'chest' | 'invite' | 'mail' | 'kit' | 'advance' | 'gem_pink' | 'gem_orange' | 'map' | 'compass' | 'bag' | 'chat' | 'circle_chat' | 'hourglass' | 'gift';

export function drawPolishedIcon(
  scene: Phaser.Scene,
  iconKey: IconKey,
  cx: number, cy: number, size: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  // 所有图标函数签名：draw*(g, cx, cy, size)
  switch (iconKey) {
    case 'chest': drawIconChest(g, cx, cy, size); break;
    case 'gift':
    case 'invite': drawIconEnvelope(g, cx, cy, size, 'invite'); break;
    case 'mail': drawIconEnvelope(g, cx, cy, size, 'mail'); break;
    case 'kit': drawIconBag(g, cx, cy, size, 'kit'); break;
    case 'bag': drawIconBag(g, cx, cy, size, 'bag'); break;
    case 'advance': drawIconAdvanceKit(g, cx, cy, size); break;
    case 'gem_pink': drawIconGem(g, cx, cy, size, 'pink'); break;
    case 'gem_orange': drawIconGem(g, cx, cy, size, 'orange'); break;
    case 'map': drawIconMap(g, cx, cy, size); break;
    case 'compass': drawIconCompass(g, cx, cy, size); break;
    case 'chat': drawIconChat(g, cx, cy, size, 'chat'); break;
    case 'circle_chat': drawIconChat(g, cx, cy, size, 'circle'); break;
    case 'hourglass': drawIconHourglass(g, cx, cy, size); break;
  }
  return g;
}

// =============================================
// 浮动侧边图标（带红点提示） — V2 polished 版
// =============================================
export function drawFloatingSideIcon(
  scene: Phaser.Scene,
  x: number, y: number, size: number,
  iconGlyphOrKey: string | IconKey, label: string,
  color: number,
  onClick: () => void,
  opts: { badge?: boolean; subLabel?: string } = {},
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();

  // 阴影
  g.fillStyle(0x000000, 0.3);
  g.fillCircle(size / 2 + 3, size / 2 + 5, size / 2);

  // 蓝色外框（多层递进，金属质感）
  const panelSize = size + 10;
  // 最深阴影底
  g.fillStyle(0x0f3a68, 1);
  g.fillRoundedRect(-2, 2, panelSize, panelSize, 15);
  // 主框底层
  g.fillStyle(0x16508f, 1);
  g.fillRoundedRect(-1, 0, panelSize - 2, panelSize - 2, 14);
  // 主框上层（主色）
  g.fillStyle(0x2a7fc8, 1);
  g.fillRoundedRect(0, -2, panelSize - 4, panelSize - 4, 13);
  // 内深蓝环
  g.fillStyle(0x1a68a8, 1);
  g.fillRoundedRect(2, 0, panelSize - 8, panelSize - 8, 12);
  // 顶部高光弧
  g.fillStyle(0x6ab8f0, 0.6);
  g.fillRoundedRect(3, 1, panelSize - 10, (panelSize - 10) * 0.45, 11);
  g.fillStyle(0xb8e2ff, 0.4);
  g.fillRoundedRect(4, 2, panelSize - 12, (panelSize - 12) * 0.22, 10);
  // 外描边（白边高光+深蓝边两层）
  g.lineStyle(1, 0x0a2a4a, 0.85);
  g.strokeRoundedRect(0, -2, panelSize - 4, panelSize - 4, 13);
  g.lineStyle(1.5, 0xffffff, 0.6);
  g.strokeRoundedRect(2, 0, panelSize - 8, panelSize - 8, 12);
  // 金属金色角花（左上/右上两点）
  g.fillStyle(0xf0c24c, 1);
  g.fillCircle(4, 2, 2); g.fillCircle(panelSize - 6, 2, 2);
  g.fillStyle(0xf0c24c, 0.8);
  g.fillRect(3, 0, 3, 1); g.fillRect(panelSize - 7, 0, 3, 1);

  c.add(g);

  // ===== 图标：优先 PNG → 次选 polished 矢量 → 末选 emoji =====
  const iconKeys: Record<string, IconKey> = {
    '🎁': 'gift', '📨': 'invite', '✉️': 'mail', '🧰': 'kit',
    '⚒️': 'advance', '⚙️': 'gem_pink', '💎': 'gem_orange',
    '🗺️': 'map', '🧭': 'compass', '🎒': 'bag',
    '💬': 'chat', '😸': 'circle_chat', '⏳': 'hourglass',
  };
  // IconKey → Phaser texture key (预加载的 PNG 资源)
  const pngTextureMap: Partial<Record<IconKey, string>> = {
    gift:       'icon_chest',
    invite:     'icon_invite',
    mail:       'icon_mail',
    kit:        'icon_kit',
    advance:    'icon_advance',
    gem_pink:   'icon_gem_pink',
    gem_orange: 'icon_gem_pink',
    map:        'icon_map',
    compass:    'icon_compass',
    bag:        'icon_bag',
    chat:       'icon_chat_guild',
    circle_chat:'icon_chat_friend',
    hourglass:  'icon_hourglass',
  };
  const resolvedKey: IconKey | undefined =
    typeof iconGlyphOrKey === 'string' && (iconGlyphOrKey.length > 4)
      ? (iconGlyphOrKey as IconKey)
      : iconKeys[iconGlyphOrKey as string];

  const iconCx = panelSize / 2 - 2;
  const iconCy = panelSize / 2 - 2;
  const iconSize = size * 0.9;

  if (resolvedKey) {
    const texKey = pngTextureMap[resolvedKey];
    // —— 1. 优先 PNG 图标（从 BootScene 预加载的纹理） ——
    if (texKey && scene.textures.exists(texKey)) {
      const maskG = scene.add.graphics();
      maskG.setVisible(false);
      maskG.fillStyle(0xffffff, 1);
      maskG.fillCircle(iconCx, iconCy, iconSize * 0.52);
      const mask = new Phaser.Display.Masks.GeometryMask(scene, maskG);

      const img = scene.add.image(iconCx, iconCy, texKey);
      img.setDisplaySize(iconSize * 1.05, iconSize * 1.05);
      img.setMask(mask);

      // 微高光顶弧（增强质感）
      const hl = scene.add.graphics();
      hl.fillStyle(0xffffff, 0.12);
      hl.beginPath();
      hl.arc(iconCx, iconCy - iconSize * 0.15, iconSize * 0.42, Math.PI * 1.1, Math.PI * 1.9);
      hl.closePath(); hl.fillPath();

      c.add([img, hl]);
      // maskG 作为 mask 的数据源需要保留在 scene 中，不要销毁
    } else {
      // —— 2. fallback: polished 矢量图标 ——
      const ig = drawPolishedIcon(scene, resolvedKey, iconCx, iconCy, iconSize);
      c.add(ig);
    }
  } else {
    // —— 3. 最终 fallback: emoji ——
    const icon = scene.add.text(iconCx, iconCy - 2, iconGlyphOrKey as string, {
      fontFamily: DS.font.display,
      fontSize: `${Math.floor(size * 0.55)}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,40,80,0.5)',
      strokeThickness: 2,
    }).setOrigin(0.5);
    c.add(icon);
  }

  // 文字标签
  const labelT = scene.add.text(panelSize / 2 - 2, panelSize + 14, label, {
    fontFamily: DS.font.body,
    fontSize: '16px',
    color: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2,
  }).setOrigin(0.5);
  // 标签外框（蓝色底条）
  const labelBg = scene.add.graphics();
  const labelW = Math.max(64, label.length * 18);
  labelBg.fillStyle(0x0a2a4a, 0.7);
  labelBg.fillRoundedRect(panelSize / 2 - 2 - labelW / 2, panelSize + 4, labelW, 22, 11);
  labelBg.lineStyle(1, 0x6ab8f0, 0.6);
  labelBg.strokeRoundedRect(panelSize / 2 - 2 - labelW / 2, panelSize + 4, labelW, 22, 11);
  c.add(labelBg);
  labelT.setDepth(1);
  c.add(labelT);

  if (opts.subLabel) {
    const subBg = scene.add.graphics();
    const sw = Math.max(50, opts.subLabel.length * 14 + 20);
    subBg.fillStyle(0x7a5a14, 0.9);
    subBg.fillRoundedRect(panelSize / 2 - 2 - sw / 2, panelSize + 26, sw, 18, 9);
    subBg.lineStyle(1, 0xf0c24c, 0.9);
    subBg.strokeRoundedRect(panelSize / 2 - 2 - sw / 2, panelSize + 26, sw, 18, 9);
    c.add(subBg);
    const sub = scene.add.text(panelSize / 2 - 2, panelSize + 35, opts.subLabel, {
      fontFamily: DS.font.body,
      fontSize: '13px',
      color: '#ffe08a',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1);
    c.add(sub);
  }

  // 红点提示（多层）
  if (opts.badge) {
    const bd = scene.add.graphics();
    bd.fillStyle(0x600010, 1);
    bd.fillCircle(panelSize - 5, 5, 8);
    bd.fillStyle(0xff4a4a, 1);
    bd.fillCircle(panelSize - 6, 4, 7);
    bd.fillStyle(0xffb0b0, 0.9);
    bd.fillCircle(panelSize - 8, 2, 2.2);
    bd.lineStyle(1.5, 0xffffff, 1);
    bd.strokeCircle(panelSize - 6, 4, 7);
    c.add(bd);
  }

  c.setSize(panelSize, panelSize + (opts.subLabel ? 46 : 28));
  c.setInteractive(new Phaser.Geom.Rectangle(0, 0, panelSize, panelSize), Phaser.Geom.Rectangle.Contains);
  c.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.92, scaleY: 0.92, duration: 60, yoyo: true });
    onClick();
  });
  return c;
}

// =============================================
// 底部蓝色 Tab Bar（截图风格：圆角蓝色菱形按钮）
// =============================================
export function drawCartoonTabBar(
  scene: Phaser.Scene,
  tabs: { name: string; glyph: string; onClick: () => void; active?: boolean; locked?: boolean }[],
  containerY?: number,
) {
  const h = 112;
  const y = containerY ?? GAME_HEIGHT_REF - h;
  const pad = 8;
  const tw = (GAME_WIDTH_REF - pad * 2) / tabs.length;

  const bg = scene.add.graphics();
  // 底部渐变蓝（分层避免兼容问题）
  const tabLayers = 6;
  for (let i = 0; i < tabLayers; i++) {
    const t = i / tabLayers;
    const r = Math.floor(0x2a + (0x1a - 0x2a) * t);
    const gc = Math.floor(0x6f + (0x4f - 0x6f) * t);
    const b = Math.floor(0xb5 + (0x85 - 0xb5) * t);
    const col = (r << 16) | (gc << 8) | b;
    bg.fillStyle(col, 1);
    const y0 = y + (h / tabLayers) * i;
    bg.fillRect(0, y0, GAME_WIDTH_REF, (h / tabLayers) + 1);
  }
  // 顶部亮色边
  bg.fillStyle(CARTOON.tabBlueLight, 0.7);
  bg.fillRect(0, y, GAME_WIDTH_REF, 3);
  bg.fillStyle(0xffffff, 0.12);
  bg.fillRect(0, y + 4, GAME_WIDTH_REF, 2);

  tabs.forEach((t, i) => {
    const cx = pad + i * tw + tw / 2;
    const cy = y + h / 2 - 2;

    // 激活态高亮框
    if (t.active) {
      const ag = scene.add.graphics();
      ag.fillStyle(CARTOON.tabBlueLight, 0.35);
      ag.fillRoundedRect(cx - tw / 2 + 4, y + 6, tw - 8, h - 14, 14);
      ag.lineStyle(2, 0x9cdcff, 0.8);
      ag.strokeRoundedRect(cx - tw / 2 + 4, y + 6, tw - 8, h - 14, 14);
      ag.fillStyle(CARTOON.hexGold, 1);
      ag.fillRect(cx - tw / 2 + 10, y + 6, tw - 20, 3);
    }

    const iconY = cy - 14;
    const glyphT = scene.add.text(cx, iconY, t.glyph, {
      fontFamily: DS.font.display,
      fontSize: '30px',
      color: t.active ? '#ffd76a' : (t.locked ? '#5a7aa0' : '#ffffff'),
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.6)',
      strokeThickness: 2,
    }).setOrigin(0.5);

    if (t.locked) {
      const lk = scene.add.text(cx + 14, iconY - 14, '🔒', { fontSize: '14px' }).setOrigin(0.5);
    }

    scene.add.text(cx, cy + 32, t.name, {
      fontFamily: DS.font.body,
      fontSize: '17px',
      color: t.active ? '#ffd76a' : (t.locked ? '#5a7aa0' : '#ffffff'),
      fontStyle: t.active ? 'bold' : '500',
      stroke: 'rgba(0,30,60,0.7)',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // 点击区
    const hit = scene.add.rectangle(cx, cy, tw - 4, h - 8, 0xffffff, 0).setInteractive();
    hit.on('pointerdown', () => {
      if (!t.locked) t.onClick();
    });
  });
}

// 全局 GAME_WIDTH/GAME_HEIGHT 引用（widgets.ts 会导出）
let GAME_WIDTH_REF = 450;
let GAME_HEIGHT_REF = 800;
export function setGameRefSize(w: number, h: number) {
  GAME_WIDTH_REF = w;
  GAME_HEIGHT_REF = h;
}

// =============================================
// 城堡背景（英雄详情页）
// =============================================
export function drawCastleBackground(
  scene: Phaser.Scene,
  w: number, h: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  // 天空（分层替代 fillGradientStyle）
  const skyL = 12;
  for (let i = 0; i < skyL; i++) {
    const t = i / skyL;
    const r = Math.floor(0x9f + (0xe8 - 0x9f) * t);
    const gc = Math.floor(0xd8 + (0xf8 - 0xd8) * t);
    const b = Math.floor(0xff + (0xff - 0xff) * t);
    const col = (r << 16) | (gc << 8) | b;
    g.fillStyle(col, 1);
    g.fillRect(0, (h / skyL) * i, w, (h / skyL) + 1);
  }

  // 远处云朵
  for (let i = 0; i < 4; i++) {
    const cx = 60 + i * (w / 4);
    const cy = 60 + (i % 2) * 50;
    for (let j = 0; j < 4; j++) {
      g.fillStyle(0xffffff, 0.75 - j * 0.12);
      g.fillEllipse(cx + (j - 2) * 18, cy + (j % 2) * 5, 32, 18);
    }
  }

  // 背景远山
  g.fillStyle(0x8ab8d8, 0.7);
  g.beginPath();
  g.moveTo(0, h * 0.45);
  g.lineTo(w * 0.2, h * 0.32);
  g.lineTo(w * 0.4, h * 0.42);
  g.lineTo(w * 0.6, h * 0.30);
  g.lineTo(w * 0.85, h * 0.40);
  g.lineTo(w, h * 0.36);
  g.lineTo(w, h * 0.5);
  g.lineTo(0, h * 0.5);
  g.closePath(); g.fillPath();

  // 主城堡（背景）
  const cx = w / 2, cy = h * 0.42;
  g.fillStyle(CARTOON.castleShade, 0.6);
  g.fillRect(cx - 90, cy, 180, 60);
  g.fillRect(cx - 110, cy - 30, 40, 90);
  g.fillRect(cx + 70, cy - 30, 40, 90);
  g.fillRect(cx - 25, cy - 60, 50, 120);
  g.fillStyle(CARTOON.castleStone, 0.7);
  g.fillRect(cx - 88, cy + 2, 176, 56);
  g.fillRect(cx - 108, cy - 28, 36, 86);
  g.fillRect(cx + 72, cy - 28, 36, 86);
  g.fillRect(cx - 23, cy - 58, 46, 116);
  // 屋顶
  g.fillStyle(CARTOON.castleRoof, 0.85);
  for (const [tx, tw, th] of [[cx - 110, 40, 30], [cx + 70, 40, 30], [cx - 25, 50, 50]] as const) {
    g.beginPath();
    g.moveTo(tx, cy - 30 + (th === 50 ? -30 : 0));
    g.lineTo(tx + tw / 2, cy - 30 - th + (th === 50 ? -30 : 0));
    g.lineTo(tx + tw, cy - 30 + (th === 50 ? -30 : 0));
    g.closePath(); g.fillPath();
  }
  // 窗
  g.fillStyle(0x6080a0, 0.7);
  for (let wi = 0; wi < 4; wi++) {
    g.fillRect(cx - 70 + wi * 40, cy + 15, 16, 22);
  }

  // 左右小房子
  for (const side of [-1, 1]) {
    const hx = cx + side * (w * 0.38);
    const hy = h * 0.52;
    g.fillStyle(0xe8d8b8, 0.85);
    g.fillRect(hx - 36, hy, 72, 50);
    g.fillStyle(CARTOON.castleRoof, 0.9);
    g.beginPath();
    g.moveTo(hx - 42, hy);
    g.lineTo(hx, hy - 32);
    g.lineTo(hx + 42, hy);
    g.closePath(); g.fillPath();
    g.fillStyle(0x60a0e0, 0.7);
    g.fillRect(hx - 20, hy + 14, 14, 18);
    g.fillRect(hx + 6, hy + 14, 14, 18);
    g.fillStyle(0x8a5a2a, 0.9);
    g.fillRect(hx - 8, hy + 26, 16, 24);
  }

  // 石砌平台地面（下半部分，分层渐变替代 fillGradientStyle）
  const platY = h * 0.62;
  const platH = h * 0.38;
  const platL = 8;
  for (let i = 0; i < platL; i++) {
    const t = i / platL;
    const r = Math.floor(0xd8 + (0x88 - 0xd8) * t);
    const gc = Math.floor(0xc8 + (0x78 - 0xc8) * t);
    const b = Math.floor(0xa8 + (0x58 - 0xa8) * t);
    const col = (r << 16) | (gc << 8) | b;
    g.fillStyle(col, 1);
    const y0 = platY + (platH / platL) * i;
    g.fillRect(0, y0, w, (platH / platL) + 1);
  }

  // 石头地面砖缝
  g.lineStyle(1.5, 0x8a7a5a, 0.55);
  const stoneRows = 5;
  for (let r = 0; r < stoneRows; r++) {
    const ry = h * 0.62 + r * ((h * 0.38) / stoneRows);
    g.beginPath();
    g.moveTo(0, ry);
    for (let x = 0; x <= w; x += 60) {
      const yOff = Math.sin(x * 0.02 + r) * 2;
      g.lineTo(x, ry + yOff);
    }
    g.strokePath();
  }
  for (let r = 0; r < stoneRows; r++) {
    const ry = h * 0.62 + r * ((h * 0.38) / stoneRows);
    for (let x = (r % 2) * 30; x < w; x += 60) {
      g.beginPath();
      g.moveTo(x, ry);
      g.lineTo(x, ry + ((h * 0.38) / stoneRows));
      g.strokePath();
    }
  }

  return g;
}

// =============================================
// 石砌圆形展示台（英雄展示）
// =============================================
export function drawStonePlatform(
  scene: Phaser.Scene,
  x: number, y: number, r: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  // 阴影
  g.fillStyle(0x000000, 0.28);
  g.fillEllipse(x + 4, y + r * 0.4 + 4, r * 2.1, r * 0.45);

  // 下层（大）
  g.fillStyle(0x8a7a5a, 1);
  g.fillEllipse(x, y + r * 0.38, r * 2, r * 0.42);
  g.fillStyle(0xa89878, 1);
  g.fillEllipse(x, y + r * 0.32, r * 1.94, r * 0.38);

  // 中层
  g.fillStyle(0x8a7a5a, 1);
  g.fillEllipse(x, y + r * 0.12, r * 1.7, r * 0.34);
  g.fillStyle(0xb8a888, 1);
  g.fillEllipse(x, y + r * 0.06, r * 1.64, r * 0.3);

  // 顶层
  g.fillStyle(0x9a8a6a, 1);
  g.fillEllipse(x, y - r * 0.18, r * 1.3, r * 0.28);
  g.fillStyle(0xc8b898, 1);
  g.fillEllipse(x, y - r * 0.22, r * 1.24, r * 0.24);

  // 顶层高光
  g.fillStyle(0xe8d8b8, 0.65);
  g.fillEllipse(x - r * 0.15, y - r * 0.28, r * 0.5, r * 0.07);

  // 石砖缝
  g.lineStyle(1.5, 0x6a5a3a, 0.7);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r * 1.24, y - r * 0.22);
    g.lineTo(x + Math.cos(a) * r * 1.94, y + r * 0.32);
    g.strokePath();
  }

  return g;
}

// 装备槽（超能世界图鉴风格：多层蓝框+圆角+内发光）
export function drawEquipmentSlot(
  scene: Phaser.Scene,
  x: number, y: number, size: number,
  slotType: 'weapon' | 'helmet' | 'armor' | 'boots' | 'locked',
  item?: { icon?: string; rarity?: string; name?: string },
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const pad = 0;
  const radius = 16;

  // 稀有度颜色（装备本身的品质色）
  const rarityColors: Record<string, { bg: number; edge: number; glow: number }> = {
    N:   { bg: 0x505a66, edge: 0x8a95a0, glow: 0xa0aab0 },
    R:   { bg: 0x2a6ea0, edge: 0x5cb0e8, glow: 0x7cd0ff },
    SR:  { bg: 0x703aaa, edge: 0xb878ff, glow: 0xd59cff },
    SSR: { bg: 0xb08a20, edge: 0xffd76a, glow: 0xffe8a0 },
  };

  if (slotType === 'locked') {
    // === 锁定槽：深色圆角方 + 粗蓝边 ===
    // 外蓝框厚底
    g.fillStyle(0x0a2040, 1);
    g.fillRoundedRect(pad, pad, size - pad * 2, size - pad * 2, radius);
    // 内层蓝边框
    g.fillStyle(0x1a4a80, 1);
    g.fillRoundedRect(pad + 3, pad + 3, size - pad * 2 - 6, size - pad * 2 - 6, radius - 3);
    // 内暗
    g.fillStyle(0x101828, 0.96);
    g.fillRoundedRect(pad + 5, pad + 5, size - pad * 2 - 10, size - pad * 2 - 10, radius - 5);
    // 蓝框亮边描线
    g.lineStyle(2, 0x5aa0d8, 0.9);
    g.strokeRoundedRect(pad + 3, pad + 3, size - pad * 2 - 6, size - pad * 2 - 6, radius - 3);
    g.lineStyle(1, 0x9cdcff, 0.5);
    g.strokeRoundedRect(pad + 1, pad + 1, size - pad * 2 - 2, size - pad * 2 - 2, radius - 1);
    // 锁
    const lk = scene.add.text(size / 2, size / 2, '🔒', { fontSize: `${size * 0.42}px` }).setOrigin(0.5);
    c.add(g); c.add(lk);
    c.setSize(size, size);
    return c;
  }

  const typeMap: Record<string, { glyph: string }> = {
    weapon: { glyph: '⚔' },
    helmet: { glyph: '⛑' },
    armor:  { glyph: '🛡' },
    boots:  { glyph: '👢' },
  };

  // === 空槽 OR 有装备：通用多层粗蓝外框 ===
  // 1. 最外深边（蓝框底座）
  g.fillStyle(0x0a2040, 1);
  g.fillRoundedRect(pad, pad, size - pad * 2, size - pad * 2, radius);
  // 2. 深蓝第二层
  g.fillStyle(0x1e5ea8, 1);
  g.fillRoundedRect(pad + 2, pad + 2, size - pad * 2 - 4, size - pad * 2 - 4, radius - 2);
  // 3. 主蓝第三层（亮蓝）
  g.fillStyle(0x3a8ae8, 1);
  g.fillRoundedRect(pad + 4, pad + 4, size - pad * 2 - 8, size - pad * 2 - 8, radius - 4);
  // 4. 亮蓝高光弧
  g.fillStyle(0x7ac0ff, 0.75);
  g.fillRoundedRect(pad + 5, pad + 5, size - pad * 2 - 10, (size - pad * 2 - 10) * 0.45, radius - 5);
  // 5. 最内暗底（放装备内容）
  g.fillStyle(0x081428, 0.96);
  g.fillRoundedRect(pad + 6, pad + 6, size - pad * 2 - 12, size - pad * 2 - 12, radius - 6);
  // 6. 蓝框金边高光描线
  g.lineStyle(2.2, 0x9cdcff, 0.95);
  g.strokeRoundedRect(pad + 2, pad + 2, size - pad * 2 - 4, size - pad * 2 - 4, radius - 2);
  g.lineStyle(1.2, 0xffffff, 0.55);
  g.strokeRoundedRect(pad + 6, pad + 6, size - pad * 2 - 12, size - pad * 2 - 12, radius - 6);

  if (!item) {
    // === 空槽：中央显示类型图标 ===
    const type = typeMap[slotType];
    // 空槽背景色（浅蓝底）
    g.fillStyle(0x1a5a98, 0.35);
    g.fillRoundedRect(pad + 8, pad + 8, size - pad * 2 - 16, size - pad * 2 - 16, radius - 8);
    const glyph = scene.add.text(size / 2, size / 2, type.glyph, {
      fontFamily: DS.font.display,
      fontSize: `${size * 0.48}px`,
      color: '#9cdcff',
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.8)',
      strokeThickness: 3,
    }).setOrigin(0.5);
    c.add(g); c.add(glyph);
  } else {
    // === 有装备：稀有度色框 + 图标 + 星级 ===
    const rc = rarityColors[item.rarity || 'N'] || rarityColors.N;
    // 稀有度内框（替代最内暗底的一部分）
    const innerPad = 8;
    // 稀有度外发光
    for (let i = 3; i > 0; i--) {
      g.fillStyle(rc.glow, 0.08 * i);
      g.fillRoundedRect(innerPad - i, innerPad - i, size - innerPad * 2 + i * 2, size - innerPad * 2 + i * 2, radius - innerPad + i);
    }
    // 稀有度深边
    g.fillStyle(rc.edge, 0.2);
    g.fillRoundedRect(innerPad, innerPad, size - innerPad * 2, size - innerPad * 2, radius - innerPad);
    // 稀有度主色
    g.fillStyle(rc.bg, 0.9);
    g.fillRoundedRect(innerPad + 2, innerPad + 2, size - innerPad * 2 - 4, size - innerPad * 2 - 4, radius - innerPad - 2);
    // 稀有度顶部高光
    g.fillStyle(0xffffff, 0.22);
    g.fillRoundedRect(innerPad + 3, innerPad + 3, size - innerPad * 2 - 6, (size - innerPad * 2 - 6) * 0.45, radius - innerPad - 3);
    // 稀有度描边
    g.lineStyle(2, rc.edge, 1);
    g.strokeRoundedRect(innerPad + 1, innerPad + 1, size - innerPad * 2 - 2, size - innerPad * 2 - 2, radius - innerPad - 1);
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokeRoundedRect(innerPad + 3, innerPad + 3, size - innerPad * 2 - 6, size - innerPad * 2 - 6, radius - innerPad - 3);

    // 装备图标
    const glyph = scene.add.text(size / 2, size / 2, item.icon || '✦', {
      fontFamily: DS.font.display,
      fontSize: `${size * 0.5}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.85)',
      strokeThickness: 3,
    }).setOrigin(0.5);
    c.add(glyph);

    // SSR稀有度：3星在底部
    if (item.rarity === 'SSR') {
      for (let i = 0; i < 3; i++) {
        const sx = size / 2 - 14 + i * 14;
        const sy = size - 10;
        scene.add.text(sx, sy + 1, '★', {
          fontSize: '12px', color: '#5a3a08', stroke: '#000000', strokeThickness: 1,
        }).setOrigin(0.5);
        scene.add.text(sx, sy, '★', {
          fontSize: '12px', color: '#ffd76a',
        }).setOrigin(0.5);
      }
    }
    c.add(g);
  }
  c.setSize(size, size);
  return c;
}

// =============================================
// 竖版华丽镜框英雄卡片（超能世界图鉴截图风格）
// - 顶部：哥特式尖拱
// - 底部：尖拱向下
// - 多层金色华丽边框
// - 卡底紫色/金色按稀有度
// - 底部正中八角宝石
// =============================================
export function drawOrnateHeroCard(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  rarity: keyof typeof DS.rarity | 'SPLUS' = 'SSR',
  opts: { owned?: boolean; portraitKey?: string; name?: string } = {},
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const { owned = true } = opts;

  // 稀有度颜色
  const rarMap: Record<string, {
    bg: number; bgInner: number; bgDark: number;
    edge: number; edgeBright: number; glow: number;
  }> = {
    N:     { bg: 0x708090, bgInner: 0x5a6470, bgDark: 0x3a4450, edge: 0xa0aab0, edgeBright: 0xd0d8dc, glow: 0xc0c8cc },
    R:     { bg: 0x4090d0, bgInner: 0x3080c0, bgDark: 0x1a5a90, edge: 0x7cc0ff, edgeBright: 0xb8e0ff, glow: 0xa0d4ff },
    SR:    { bg: 0xa060e0, bgInner: 0x8a50c8, bgDark: 0x5a3090, edge: 0xd59cff, edgeBright: 0xecc0ff, glow: 0xe8bfff },
    SSR:   { bg: CARTOON.hexGold, bgInner: 0xe0b030, bgDark: 0x906010, edge: 0xffd76a, edgeBright: 0xffecb0, glow: 0xffe8a0 },
    UR:    { bg: 0xff6a8a, bgInner: 0xe85070, bgDark: 0xa83050, edge: 0xffb0c0, edgeBright: 0xffd8dc, glow: 0xffd0dc },
    SPLUS: { bg: CARTOON.hexPurple, bgInner: 0x9858c8, bgDark: CARTOON.hexPurpleDark, edge: 0xd59fff, edgeBright: 0xecc0ff, glow: 0xe8c0ff },
  };
  const r = rarMap[rarity] || rarMap.SR;

  const g = scene.add.graphics();

  // 外发光
  if (owned) {
    for (let i = 3; i > 0; i--) {
      g.fillStyle(r.glow, 0.08 * i);
      this_ornateFramePath(g, -6 - i * 4, -6 - i * 4, w + 12 + i * 8, h + 12 + i * 8);
      g.fillPath();
    }
  }

  // 最外层金边（粗）
  g.fillStyle(r.edgeBright, 0.9);
  this_ornateFramePath(g, -3, -3, w + 6, h + 6);
  g.fillPath();

  // 次层（深色描边）
  g.fillStyle(r.bgDark, 1);
  this_ornateFramePath(g, 0, 0, w, h);
  g.fillPath();

  // 主色层
  g.fillStyle(r.edge, 1);
  this_ornateFramePath(g, 3, 3, w - 6, h - 6);
  g.fillPath();

  // 深色内层（制造边框感）
  g.fillStyle(r.bgDark, 1);
  this_ornateFramePath(g, 6, 6, w - 12, h - 12);
  g.fillPath();

  // 内层稀有度底色（卡片内部展示区）
  g.fillStyle(r.bgInner, 1);
  this_ornateFramePath(g, 9, 9, w - 18, h - 18);
  g.fillPath();

  // 内部上层：深色阴影渐变感（多层）
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const shade = owned ? 0.18 + t * 0.15 : 0.55 + t * 0.1;
    g.fillStyle(0x000000, shade);
    const insetX = 9 + i * 1.5;
    const insetY = 9 + i * 1.5;
    this_ornateFramePath(g, insetX, insetY + i * 2, w - insetX * 2, (h - insetY * 2) * 0.55);
    g.fillPath();
  }

  // 顶部金色装饰（4颗小圆金珠）
  const beads = [w * 0.18, w * 0.38, w * 0.62, w * 0.82];
  beads.forEach(bx => {
    g.fillStyle(r.edgeBright, 1);
    g.fillCircle(bx, h * 0.11, 3.5);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(bx - 1, h * 0.11 - 1, 1.4);
  });

  // 侧边装饰点
  for (let i = 0; i < 5; i++) {
    const sy = h * 0.2 + i * (h * 0.13);
    [w * 0.06, w * 0.94].forEach(sx => {
      g.fillStyle(r.edge, 0.85);
      g.fillCircle(sx, sy, 2.2);
    });
  }

  // ==== 底部稀有度宝石（八角形） ====
  const gemR = w * 0.16;
  const gx = w / 2;
  const gy = h - h * 0.09;
  // 宝石外圈金边
  g.fillStyle(r.edgeBright, 0.9);
  this_fillOctagon(g, gx, gy, gemR + 4);
  g.fillPath();
  g.fillStyle(r.bgDark, 1);
  this_fillOctagon(g, gx, gy, gemR + 2);
  g.fillPath();
  // 宝石本体
  g.fillStyle(r.bg, 1);
  this_fillOctagon(g, gx, gy, gemR);
  g.fillPath();
  g.fillStyle(r.edge, 0.9);
  this_fillOctagon(g, gx, gy, gemR - 3);
  g.fillPath();
  // 宝石切面高光
  g.fillStyle(0xffffff, 0.5);
  g.beginPath();
  g.moveTo(gx - gemR * 0.4, gy - gemR * 0.4);
  g.lineTo(gx, gy - gemR * 0.6);
  g.lineTo(gx + gemR * 0.15, gy - gemR * 0.25);
  g.lineTo(gx - gemR * 0.2, gy);
  g.closePath();
  g.fillPath();
  // 宝石十字切痕
  g.lineStyle(1, 0xffffff, 0.45);
  g.beginPath();
  g.moveTo(gx, gy - gemR * 0.6); g.lineTo(gx, gy + gemR * 0.6);
  g.moveTo(gx - gemR * 0.6, gy); g.lineTo(gx + gemR * 0.6, gy);
  g.strokePath();

  // ===== 头像 / 未获得遮罩（V2：剪影代替粗黑大字） =====
  if (!owned) {
    // 先加边框graphics到容器
    c.add(g);

    // 内部mask区域
    const maskG = scene.add.graphics();
    this_ornateFramePath(maskG, 10, 10, w - 20, h - 20);
    maskG.fillPath();
    maskG.setAlpha(0);
    c.add(maskG);
    const mask = maskG.createGeometryMask();

    // 1) 背景：暗紫色叠层（稀有度色，带微妙分层渐变）
    const bgDim = scene.add.graphics();
    this_ornateFramePath(bgDim, 10, 10, w - 20, h - 20);
    bgDim.fillPath();
    bgDim.setMask(mask);
    c.add(bgDim);
    // 再加一层深紫暗化
    const bgDarkOverlay = scene.add.graphics();
    const layerCount = 5;
    for (let i = 0; i < layerCount; i++) {
      const t = i / layerCount;
      // 越往下越深
      const rr = Math.floor(0x3a - 0x2a * t);
      const gg = Math.floor(0x1a - 0x10 * t);
      const bb = Math.floor(0x5a - 0x30 * t);
      bgDarkOverlay.fillStyle((rr << 16) | (gg << 8) | bb, 0.55 + t * 0.35);
      const y0 = 10 + ((h - 20) / layerCount) * i;
      bgDarkOverlay.fillRect(10, y0, w - 20, (h - 20) / layerCount + 1);
    }
    bgDarkOverlay.setMask(mask);
    c.add(bgDarkOverlay);

    // 2) 人物剪影（居中）：头+肩+披风轮廓，颜色随稀有度调暗
    const silhouette = scene.add.graphics();
    const scx = w / 2;
    const scy = h * 0.44;
    const scale = Math.min(w, h) * 0.006; // 剪影单位比例
    // 披风（外轮廓）
    silhouette.fillStyle(r.bgDark, 0.9);
    silhouette.beginPath();
    silhouette.moveTo(scx - w * 0.32, scy + h * 0.18);
    silhouette.lineTo(scx - w * 0.26, scy - h * 0.02);
    silhouette.lineTo(scx - w * 0.14, scy - h * 0.12);
    silhouette.lineTo(scx, scy - h * 0.24);
    silhouette.lineTo(scx + w * 0.14, scy - h * 0.12);
    silhouette.lineTo(scx + w * 0.26, scy - h * 0.02);
    silhouette.lineTo(scx + w * 0.32, scy + h * 0.18);
    silhouette.closePath();
    silhouette.fillPath();
    // 肩铠亮色边
    silhouette.fillStyle(r.edge, 0.55);
    silhouette.beginPath();
    silhouette.moveTo(scx - w * 0.3, scy + h * 0.18);
    silhouette.lineTo(scx - w * 0.22, scy + h * 0.06);
    silhouette.lineTo(scx - w * 0.12, scy + h * 0.12);
    silhouette.lineTo(scx - w * 0.18, scy + h * 0.22);
    silhouette.closePath();
    silhouette.fillPath();
    silhouette.beginPath();
    silhouette.moveTo(scx + w * 0.3, scy + h * 0.18);
    silhouette.lineTo(scx + w * 0.22, scy + h * 0.06);
    silhouette.lineTo(scx + w * 0.12, scy + h * 0.12);
    silhouette.lineTo(scx + w * 0.18, scy + h * 0.22);
    silhouette.closePath();
    silhouette.fillPath();
    // 头部（圆）
    silhouette.fillStyle(r.bgInner, 0.95);
    silhouette.fillCircle(scx, scy - h * 0.16, Math.min(w, h) * 0.09);
    // 头盔尖顶（可选，根据稀有度装饰，用字符串数组比较避免 TS 收窄问题）
    silhouette.fillStyle(r.edge, 0.8);
    const helmetRarities = ['SSR', 'SPLUS', 'UR', 'LR', 'MRC'];
    if (helmetRarities.includes(rarity as string)) {
      silhouette.beginPath();
      silhouette.moveTo(scx - w * 0.06, scy - h * 0.22);
      silhouette.lineTo(scx, scy - h * 0.34);
      silhouette.lineTo(scx + w * 0.06, scy - h * 0.22);
      silhouette.closePath();
      silhouette.fillPath();
      // 宝石点缀
      silhouette.fillStyle(r.glow, 0.9);
      silhouette.fillCircle(scx, scy - h * 0.22, Math.min(w, h) * 0.018);
    }
    // 颈/锁骨剪影装饰边
    silhouette.fillStyle(r.bgDark, 1);
    silhouette.fillRoundedRect(scx - w * 0.14, scy - h * 0.06, w * 0.28, h * 0.04, 4);

    silhouette.setMask(mask);
    c.add(silhouette);

    // 3) 扫描线暗纹
    const scanLines = scene.add.graphics();
    for (let yy = 14; yy < h - 14; yy += 3) {
      scanLines.fillStyle(0x000000, yy % 6 === 0 ? 0.09 : 0.04);
      scanLines.fillRect(10, yy, w - 20, 1);
    }
    scanLines.setMask(mask);
    c.add(scanLines);

    // 4) 稀有度微光辐射（中心径向淡光）
    const vignette = scene.add.graphics();
    vignette.fillStyle(r.glow, 0.08);
    vignette.fillCircle(scx, scy, Math.min(w, h) * 0.3);
    vignette.fillStyle(r.glow, 0.06);
    vignette.fillCircle(scx, scy, Math.min(w, h) * 0.18);
    vignette.setMask(mask);
    c.add(vignette);

    // 5) "未获得"小字（底部金色小字条，代替原来居中的粗黑大字）
    const tagBg = scene.add.graphics();
    const tagW = w * 0.6;
    const tagH = 22;
    const tagY = h * 0.66;
    tagBg.fillStyle(0x000000, 0.55);
    tagBg.fillRoundedRect(w / 2 - tagW / 2, tagY - tagH / 2, tagW, tagH, tagH / 2);
    tagBg.lineStyle(1.2, r.edgeBright, 0.8);
    tagBg.strokeRoundedRect(w / 2 - tagW / 2, tagY - tagH / 2, tagW, tagH, tagH / 2);
    // 挂锁符号（左侧）
    tagBg.fillStyle(r.edgeBright, 1);
    tagBg.fillRect(w / 2 - tagW / 2 + 10, tagY - 3, 8, 6);
    tagBg.lineStyle(1.5, r.edgeBright, 1);
    tagBg.beginPath();
    tagBg.arc(w / 2 - tagW / 2 + 14, tagY - 3, 3, Math.PI, 0, false);
    tagBg.strokePath();
    tagBg.setMask(mask);
    c.add(tagBg);
    const label = scene.add.text(w / 2 + 6, tagY, '未获得', {
      fontFamily: DS.font.body,
      fontSize: `${Math.floor(Math.min(w, h) * 0.11)}px`,
      color: '#fce5a0',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    label.setMask(mask);
    c.add(label);

  } else if (opts.portraitKey) {
    // 已获得：头像
    c.add(g);

    const maskG = scene.add.graphics();
    this_ornateFramePath(maskG, 10, 10, w - 20, h - 20);
    maskG.fillPath();
    maskG.setAlpha(0);
    c.add(maskG);
    const mask = maskG.createGeometryMask();

    const portrait = scene.add.image(w / 2, h * 0.42, opts.portraitKey);
    portrait.setDisplaySize(w * 1.15, h * 0.7);
    portrait.setMask(mask);
    c.add(portrait);

    // 内部高光边（左上）
    const highlight = scene.add.graphics();
    highlight.fillStyle(0xffffff, 0.18);
    this_ornateFramePath(highlight, 10, 10, w - 20, (h - 20) * 0.3);
    highlight.fillPath();
    highlight.setMask(mask);
    c.add(highlight);
  } else {
    c.add(g);
  }

  // 名字条（如果有名字，在卡片底部上方）
  if (opts.name && owned) {
    const nameY = h * 0.76;
    const nameBg = scene.add.graphics();
    nameBg.fillStyle(0x000000, 0.62);
    nameBg.fillRoundedRect(w * 0.12, nameY - 12, w * 0.76, 24, 5);
    nameBg.fillStyle(r.edge, 0.95);
    nameBg.fillRect(w * 0.12, nameY - 12, 3, 24);
    nameBg.fillRect(w * 0.88 - 3, nameY - 12, 3, 24);
    c.add(nameBg);
    const nt = scene.add.text(w / 2, nameY, opts.name, {
      fontFamily: DS.font.display,
      fontSize: `${Math.floor(w * 0.2)}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    c.add(nt);
  }

  return c;
}

// 辅助：绘制华丽镜框形状路径（不fill/stroke，只设path）
function this_ornateFramePath(gfx: Phaser.GameObjects.Graphics, px: number, py: number, pw: number, ph: number) {
  // 顶部哥特尖拱控制点
  const topArchH = ph * 0.14;         // 顶部拱高
  const topShoulder = ph * 0.18;       // 肩部位置
  // 底部尖拱控制点
  const botArchH = ph * 0.1;           // 底部拱高（向下尖）
  const botShoulder = ph * 0.9 - ph * 0.1; // 底部肩部
  const sideInset = pw * 0.01;         // 侧边微内收

  gfx.beginPath();
  // 起点：顶部拱尖
  gfx.moveTo(px + pw / 2, py);
  // 右上曲线（拱顶 → 右肩）- 用分段模拟贝塞尔
  const steps = 12;
  // 右半拱：x 从 pw/2 → pw（线性），y 从 0 → topArchH（抛物线）
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = pw / 2 + (pw / 2 - sideInset) * t;
    const y = topArchH * (1 - (1 - t) * (1 - t)); // 缓出曲线
    gfx.lineTo(px + x, py + y);
  }
  // 右侧直边（微向内）
  gfx.lineTo(px + pw - sideInset, py + botShoulder);
  // 右下：到底部尖拱（右肩 → 底尖）
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = pw - sideInset - (pw / 2 - sideInset) * t;
    const baseY = botShoulder;
    const archDown = botArchH * (t * t); // 加速向下到尖点
    gfx.lineTo(px + x, py + baseY + archDown);
  }
  // 底尖 → 左底肩
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = pw / 2 - (pw / 2 - sideInset) * t;
    const baseY = botShoulder + botArchH;
    const archUp = -botArchH * (1 - (1 - t) * (1 - t)); // 缓出向上
    gfx.lineTo(px + x, py + baseY + archUp);
  }
  // 左边直边（微向内收）
  gfx.lineTo(px + sideInset, py + topArchH);
  // 左上：回到顶部拱尖（左肩 → 顶拱）
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = sideInset + (pw / 2 - sideInset) * (1 - t);
    const y = topArchH - topArchH * ((1 - t) * (1 - t)); // 缓入向上到尖
    gfx.lineTo(px + x, py + y);
  }
  gfx.closePath();
}

// 辅助：填充正八边形
function this_fillOctagon(gfx: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number) {
  gfx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 - Math.PI / 8;
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;
    if (i === 0) gfx.moveTo(px, py);
    else gfx.lineTo(px, py);
  }
  gfx.closePath();
}

// =============================================
// 增强版：不规则多边形石砖砌圆形平台（英雄详情页）
// =============================================
export function drawStonePlatformTiled(
  scene: Phaser.Scene,
  x: number, y: number, r: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  // 阴影
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(x + 5, y + r * 0.42 + 5, r * 2.15, r * 0.48);

  // 三层圆盘（从上往下越来越大）
  const layers = [
    { yOff: -r * 0.22, rx: r * 1.3, ry: r * 0.28, light: 0xc8b898, mid: 0xb8a888, dark: 0x8a7a5a },
    { yOff:  r * 0.06, rx: r * 1.7, ry: r * 0.34, light: 0xb8a888, mid: 0xa89878, dark: 0x7a6a4a },
    { yOff:  r * 0.32, rx: r * 2.0, ry: r * 0.42, light: 0xa89878, mid: 0x9a8a6a, dark: 0x6a5a3a },
  ];
  layers.forEach((L, li) => {
    // 圆盘阴影边
    g.fillStyle(L.dark, 1);
    g.fillEllipse(x, y + L.yOff + L.ry * 0.2, L.rx, L.ry);
    // 圆盘主色
    g.fillStyle(L.mid, 1);
    g.fillEllipse(x, y + L.yOff, L.rx, L.ry);
    // 圆盘亮面
    g.fillStyle(L.light, 0.95);
    g.fillEllipse(x - L.rx * 0.08, y + L.yOff - L.ry * 0.15, L.rx * 0.88, L.ry * 0.7);
  });

  // ==== 顶层：不规则多边形石砖纹理（mosaic） ====
  const tilesTopY = y + layers[0].yOff;
  const tilesRX = layers[0].rx * 0.96;
  const tilesRY = layers[0].ry * 0.9;

  // 在椭圆区域内生成不规则多边形砖
  const seedTiles: { pts: { x: number; y: number }[]; fill: number; edge: number }[] = [];

  // 先做圆心
  const rows = 5;
  const cols = 7;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 网格中心点（含错位）
      const rowOff = (row % 2) * (tilesRX / cols);
      const cx = -tilesRX + rowOff + col * ((tilesRX * 2) / cols) + (tilesRX / cols);
      const cy = -tilesRY + row * ((tilesRY * 2) / rows) + (tilesRY / rows);
      // 跳过椭圆外的点
      const dist = (cx * cx) / (tilesRX * tilesRX) + (cy * cy) / (tilesRY * tilesRY);
      if (dist > 0.95) continue;

      // 生成不规则六边形（每边随机抖动）
      const polyR = (tilesRX / cols) * 0.72;
      const sides = 5 + Math.floor(Math.random() * 3); // 5~7边
      const pts: { x: number; y: number }[] = [];
      for (let si = 0; si < sides; si++) {
        const ang = (si / sides) * Math.PI * 2 + Math.random() * 0.3;
        const rr = polyR * (0.8 + Math.random() * 0.35);
        pts.push({
          x: cx + Math.cos(ang) * rr,
          y: cy + Math.sin(ang) * rr * 0.75,
        });
      }
      // 砖颜色（3种基调随机）
      const tone = Math.random();
      let fill: number, edge: number;
      if (tone < 0.33) { fill = 0xd8c89e; edge = 0x8a7a58; }
      else if (tone < 0.66) { fill = 0xc8b888; edge = 0x7a6a48; }
      else { fill = 0xe0d0a8; edge = 0x9a8a68; }
      seedTiles.push({ pts, fill, edge });
    }
  }

  // 用椭圆裁剪：先画完整遮罩在临时canvas，直接画每个多边形（在椭圆内的话）
  seedTiles.forEach(tile => {
    // 检查多边形中心点是否在椭圆内（粗略）
    const cxD = tile.pts.reduce((s, p) => s + p.x, 0) / tile.pts.length;
    const cyD = tile.pts.reduce((s, p) => s + p.y, 0) / tile.pts.length;
    const dist = (cxD * cxD) / (tilesRX * tilesRX) + (cyD * cyD) / (tilesRY * tilesRY);
    if (dist > 1.02) return;

    // 砖阴影
    g.fillStyle(0x000000, 0.22);
    g.beginPath();
    tile.pts.forEach((p, i) => {
      const px = x + p.x + 1.5;
      const py = tilesTopY + p.y + 1.5;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
    g.closePath();
    g.fillPath();

    // 砖主色
    g.fillStyle(tile.fill, 1);
    g.beginPath();
    tile.pts.forEach((p, i) => {
      const px = x + p.x;
      const py = tilesTopY + p.y;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
    g.closePath();
    g.fillPath();

    // 砖高光（上半小弧）
    g.fillStyle(0xffffff, 0.14);
    g.beginPath();
    tile.pts.forEach((p, i) => {
      const px = x + p.x;
      const py = tilesTopY + p.y - (Math.abs(p.y) < tilesRY * 0.4 ? 1.5 : 0);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
    g.closePath();
    g.fillPath();

    // 砖边
    g.lineStyle(1.2, tile.edge, 0.85);
    g.beginPath();
    tile.pts.forEach((p, i) => {
      const px = x + p.x;
      const py = tilesTopY + p.y;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
    g.closePath();
    g.strokePath();
  });

  // 顶层椭圆边（描一圈金边，手动椭圆路径）
  g.lineStyle(2, CARTOON.hexGold, 0.35);
  g.beginPath();
  const eSegs = 40;
  for (let ei = 0; ei <= eSegs; ei++) {
    const ea = (ei / eSegs) * Math.PI * 2;
    const eex = x + Math.cos(ea) * tilesRX;
    const eey = tilesTopY + Math.sin(ea) * tilesRY;
    if (ei === 0) g.moveTo(eex, eey);
    else g.lineTo(eex, eey);
  }
  g.strokePath();

  return g;
}

// 粉色横幅（图鉴分类标题）
export function drawPinkBanner(
  scene: Phaser.Scene,
  x: number, y: number, w: number, text: string,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const h = 36;

  // 飘带尾
  const tail = 10;
  g.fillStyle(CARTOON.bannerPinkDark, 1);
  g.beginPath();
  g.moveTo(-w / 2, 0);
  g.lineTo(w / 2, 0);
  g.lineTo(w / 2 - tail, h / 2);
  g.lineTo(w / 2, h);
  g.lineTo(-w / 2, h);
  g.lineTo(-w / 2 + tail, h / 2);
  g.closePath();
  g.fillPath();

  g.fillStyle(CARTOON.bannerPink, 1);
  g.beginPath();
  g.moveTo(-w / 2 + 2, 4);
  g.lineTo(w / 2 - 2, 4);
  g.lineTo(w / 2 - tail - 1, h / 2);
  g.lineTo(w / 2 - 2, h - 4);
  g.lineTo(-w / 2 + 2, h - 4);
  g.lineTo(-w / 2 + tail + 1, h / 2);
  g.closePath();
  g.fillPath();

  // 高光
  g.fillStyle(0xffffff, 0.3);
  g.beginPath();
  g.moveTo(-w / 2 + 4, 6);
  g.lineTo(w / 2 - 4, 6);
  g.lineTo(w / 2 - tail - 2, h / 2 - 4);
  g.lineTo(-w / 2 + tail + 2, h / 2 - 4);
  g.closePath();
  g.fillPath();

  c.add(g);

  const t = scene.add.text(0, h / 2, text, {
    fontFamily: DS.font.display,
    fontSize: '22px',
    color: '#ffffff',
    fontStyle: 'bold',
    stroke: '#8a2050',
    strokeThickness: 2,
  }).setOrigin(0.5);
  c.add(t);
  return c;
}

// =============================================
// V3 高级地形增强：草地精细化（多色草丛+花朵+泥点+质感）
// =============================================
function drawDetailedGrasslands(
  g: Phaser.GameObjects.Graphics,
  w: number, h: number,
) {
  const topY = h * 0.62;
  const botY = h;

  // A. 草地色块肌理（短斜笔触）
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * w;
    const y = topY + Math.random() * (botY - topY);
    const len = 3 + Math.random() * 6;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    const r = Math.random();
    let col = 0x4a9a2e;
    if (r < 0.32) col = 0x6aba40;
    else if (r < 0.62) col = 0x4a9a2e;
    else if (r < 0.85) col = 0x357a20;
    else col = 0x7fd050;
    g.lineStyle(1, col, 0.55);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x2, y2);
    g.strokePath();
  }

  // B. 花朵簇
  const flowerColors = [0xfff0c0, 0xff8a4a, 0xffd76a, 0xe84a8a, 0xc0a0ff, 0xffffff];
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * w;
    const y = topY + 30 + Math.random() * (botY - topY - 60);
    const c = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const s = 0.7 + Math.random() * 0.8;
    g.lineStyle(1, 0x3a7a22, 0.85);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x, y + 6 + Math.random() * 4);
    g.strokePath();
    g.fillStyle(0xffe880, 0.95);
    g.fillCircle(x, y, 1.8 * s);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      const px = x + Math.cos(a) * 2.2 * s;
      const py = y + Math.sin(a) * 2.2 * s;
      g.fillStyle(c, 0.92);
      g.fillCircle(px, py, 1.6 * s);
    }
  }

  // C. 泥点/鹅卵石
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w;
    const y = topY + Math.random() * (botY - topY);
    if (x > w * 0.36 && x < w * 0.68 && y > h * 0.5) continue;
    const r = 1.2 + Math.random() * 2.2;
    g.fillStyle(0x6a5a3a, 0.55);
    g.fillEllipse(x, y, r * 1.4, r * 0.8);
    g.fillStyle(0xa08868, 0.7);
    g.fillEllipse(x - 0.4, y - 0.4, r * 1.1, r * 0.6);
  }

  // D. 草丛簇团
  for (let i = 0; i < 22; i++) {
    const cx = Math.random() * w;
    const cy = topY + 40 + Math.random() * (botY - topY - 80);
    if (cx > w * 0.36 && cx < w * 0.68 && cy > h * 0.5) continue;
    for (let blade = 0; blade < 14; blade++) {
      const bx = cx + (Math.random() - 0.5) * 22;
      const bh = 4 + Math.random() * 8;
      const curl = (Math.random() - 0.5) * 3;
      const gr = Math.random() > 0.4 ? 0x3a8a32 : 0x5aaa42;
      g.lineStyle(1.4, gr, 0.92);
      g.beginPath();
      g.moveTo(bx, cy);
      for (let st = 1; st <= 5; st++) {
        const t = st / 5;
        g.lineTo(bx + curl * t, cy - bh * t);
      }
      g.strokePath();
    }
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(cx, cy + 2, 16, 4);
  }

  // E. 远处稀树
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * w;
    const y = h * 0.65 + Math.random() * (h * 0.20);
    if (x > w * 0.32 && x < w * 0.72) continue;
    const s = 4 + Math.random() * 6;
    g.fillStyle(0x2a6a1a, 0.7);
    g.beginPath();
    g.moveTo(x, y - s);
    g.lineTo(x - s * 0.6, y);
    g.lineTo(x + s * 0.6, y);
    g.closePath(); g.fillPath();
    g.fillStyle(0x1a4a10, 0.8);
    g.fillRect(x - 1.5, y, 3, 3);
  }
}

// =============================================
// V3 远景雾山（增加地平线深度）
// =============================================
function drawDistantFogMountains(
  g: Phaser.GameObjects.Graphics,
  w: number, h: number,
  _sunX: number, _sunY: number,
) {
  const baseY = h * 0.26;
  g.fillStyle(0xb8d8e8, 0.5);
  g.beginPath();
  g.moveTo(0, baseY + 40);
  for (let i = 0; i <= 12; i++) {
    const px = (w / 12) * i;
    const py = baseY - Math.abs(Math.sin(i * 0.9 + 0.3)) * 36 - (i % 3) * 10;
    g.lineTo(px, py);
  }
  g.lineTo(w, baseY + 40);
  g.closePath(); g.fillPath();

  g.fillStyle(0xffffff, 0.18);
  g.beginPath();
  g.moveTo(0, baseY - 10);
  for (let i = 0; i <= 12; i++) {
    const px = (w / 12) * i;
    const py = baseY - Math.abs(Math.sin(i * 0.9 + 0.3)) * 36 - (i % 3) * 10;
    g.lineTo(px, py + 4);
  }
  g.lineTo(w, baseY - 10);
  g.closePath(); g.fillPath();

  g.fillStyle(0xd8e8f4, 0.55);
  g.fillRect(0, baseY + 8, w, 10);

  // 雪顶
  for (let i = 0; i < 12; i++) {
    const px = (w / 12) * i + (w / 24);
    const py = baseY - Math.abs(Math.sin(i * 0.9 + 0.3)) * 36 - (i % 3) * 10;
    if (py < baseY - 24) {
      g.fillStyle(0xffffff, 0.7);
      g.beginPath();
      g.moveTo(px - 8, py + 6);
      g.lineTo(px, py);
      g.lineTo(px + 8, py + 6);
      g.closePath(); g.fillPath();
    }
  }
}

// =============================================
// V3 热气球（丰富天空中景）
// =============================================
function drawHotAirBalloon(
  g: Phaser.GameObjects.Graphics, x: number, y: number, s: number,
) {
  g.fillStyle(0x000000, 0.1);
  g.fillEllipse(x + 2, y + 2, 36 * s, 40 * s);
  g.fillStyle(0xc04030, 1);
  g.beginPath();
  g.arc(x, y, 18 * s, Math.PI, 0, false);
  g.lineTo(x + 18 * s, y);
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const px = x + 18 * s * (1 - 2 * t);
    const py = y + Math.sin(t * Math.PI) * (-2 * s);
    g.lineTo(px, py);
  }
  g.closePath(); g.fillPath();
  for (let i = 0; i < 3; i++) {
    g.fillStyle(0xf0c040, 1);
    g.fillRect(x - 18 * s + i * 12 * s, y - 14 * s, 3 * s, 14 * s);
  }
  g.fillStyle(0x8a5a2a, 1);
  g.fillRect(x - 6 * s, y + 18 * s, 12 * s, 8 * s);
  g.lineStyle(0.8, 0x3a2a18, 0.85);
  g.lineBetween(x - 14 * s, y + 4 * s, x - 6 * s, y + 18 * s);
  g.lineBetween(x + 14 * s, y + 4 * s, x + 6 * s, y + 18 * s);
  g.fillStyle(0xffffff, 0.35);
  g.fillEllipse(x - 6 * s, y - 8 * s, 6 * s, 10 * s);
}

// =============================================
// V3 石板路（沿原路径叠加石板纹理）
// =============================================
function drawCobblestonePath(
  g: Phaser.GameObjects.Graphics,
  roadPts: { x: number; y: number }[], w: number, h: number,
) {
  for (let i = 1; i < roadPts.length - 1; i += 2) {
    const p = roadPts[i];
    const next = roadPts[i + 1] || p;
    const dx = next.x - p.x;
    const dy = next.y - p.y;
    const ang = Math.atan2(dy, dx);
    g.save();
    g.translateCanvas(p.x, p.y);
    g.rotateCanvas(ang);
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(0, 3, 36, 9);
    g.fillStyle(0xb89060, 1);
    g.fillEllipse(0, 0, 32, 7);
    g.fillStyle(0xd4b888, 0.85);
    g.fillEllipse(-1, -1, 28, 4);
    g.lineStyle(0.5, 0x6a4828, 0.7);
    g.strokeEllipse(0, 0, 32, 7);
    g.rotateCanvas(-ang);
    g.translateCanvas(-p.x, -p.y);
    g.restore();
  }

  for (let i = 8; i < roadPts.length - 4; i += 10) {
    const p = roadPts[i];
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(p.x + 1, p.y + 18, 4, 1.5);
  }
}

// =============================================
// V3 路灯/火把（沿路径增加温馨感）
// =============================================
function drawRoadTorches(
  g: Phaser.GameObjects.Graphics,
  roadPts: { x: number; y: number }[], h: number,
) {
  const indices = [6, 16, 26, 36];
  indices.forEach((idx, k) => {
    if (idx >= roadPts.length) return;
    const p = roadPts[idx];
    const offsetX = (k % 2 === 0) ? -52 : 52;
    const tx = p.x + offsetX;
    const ty = p.y + 14;

    g.fillStyle(0x000000, 0.25);
    g.fillRect(tx - 1, ty - 24, 3, 28);
    g.fillStyle(0x6a4828, 1);
    g.fillRect(tx - 1.5, ty - 26, 2.5, 28);
    g.fillStyle(0x8a6840, 1);
    g.fillRect(tx - 1, ty - 25, 1, 26);

    g.fillStyle(0x8a6420, 1);
    g.fillRect(tx - 4, ty - 30, 8, 4);
    g.fillStyle(0xc08840, 1);
    g.fillRect(tx - 4, ty - 30, 8, 2);

    g.fillStyle(0xfff080, 0.95);
    g.fillCircle(tx, ty - 32, 4);
    g.fillStyle(0xffa030, 0.9);
    g.fillCircle(tx, ty - 31, 3);
    g.fillStyle(0xff5a10, 0.85);
    g.fillCircle(tx, ty - 30, 1.8);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(tx - 0.8, ty - 33, 1.2);

    for (let rr = 0; rr < 4; rr++) {
      g.fillStyle(0xffc060, 0.12 - rr * 0.025);
      g.fillCircle(tx, ty - 32, 14 + rr * 6);
    }
  });
}

// =============================================
// V3 告示牌（增加村庄感）
// =============================================
function drawSignPosts(
  g: Phaser.GameObjects.Graphics, w: number, h: number,
) {
  const positions = [
    { x: w * 0.18, y: h * 0.55, dir: 'left' as const },
    { x: w * 0.85, y: h * 0.62, dir: 'right' as const },
  ];
  positions.forEach(({ x, y, dir }) => {
    g.fillStyle(0x000000, 0.28);
    g.fillRect(x - 1, y - 2, 3, 32);
    g.fillStyle(0x6a4828, 1);
    g.fillRect(x - 1.5, y - 4, 2.5, 32);
    g.fillStyle(0x9a7048, 1);
    if (dir === 'left') g.fillRect(x - 24, y - 14, 22, 16);
    else g.fillRect(x + 2, y - 14, 22, 16);
    g.fillStyle(0xc08850, 0.85);
    if (dir === 'left') g.fillRect(x - 24, y - 15, 20, 5);
    else g.fillRect(x + 2, y - 15, 20, 5);
    g.lineStyle(0.5, 0x5a3818, 0.7);
    if (dir === 'left') {
      g.lineBetween(x - 24, y - 8, x - 4, y - 8);
      g.lineBetween(x - 24, y - 4, x - 4, y - 4);
    } else {
      g.lineBetween(x + 2, y - 8, x + 22, y - 8);
      g.lineBetween(x + 2, y - 4, x + 22, y - 4);
    }
    g.fillStyle(0x6a4828, 1);
    if (dir === 'left') {
      g.beginPath();
      g.moveTo(x - 25, y - 16); g.lineTo(x - 14, y - 22); g.lineTo(x - 3, y - 16);
      g.closePath(); g.fillPath();
    } else {
      g.beginPath();
      g.moveTo(x + 1, y - 16); g.lineTo(x + 12, y - 22); g.lineTo(x + 23, y - 16);
      g.closePath(); g.fillPath();
    }
  });
}
