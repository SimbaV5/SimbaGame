import Phaser from 'phaser';

export interface BurstOptions {
  x: number;
  y: number;
  count?: number;
  color?: number;
  color2?: number;
  speed?: number;
  size?: number;
  size2?: number;
  life?: number;
  gravity?: number;
  spread?: number;
  shape?: 'circle' | 'star' | 'spark' | 'square';
}

export function burst(scene: Phaser.Scene, opts: BurstOptions) {
  const count = opts.count ?? 18;
  const color = opts.color ?? 0xfbbf24;
  const color2 = opts.color2 ?? color;
  const speed = opts.speed ?? 220;
  const size = opts.size ?? 6;
  const size2 = opts.size2 ?? size;
  const life = opts.life ?? 600;
  const gravity = opts.gravity ?? 200;
  const spread = opts.spread ?? Math.PI * 2;
  const shape = opts.shape ?? 'circle';

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const vx = Math.cos(angle) * (speed * (0.6 + Math.random() * 0.6));
    const vy = Math.sin(angle) * (speed * (0.6 + Math.random() * 0.6));
    const c = Phaser.Math.RND.pick([color, color2]);
    const s = Phaser.Math.RND.between(size, size2);
    const obj: Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text = shape === 'star'
      ? scene.add.text(opts.x, opts.y, '✦', { fontSize: `${s}px`, color: hex(c) }).setOrigin(0.5)
      : shape === 'spark'
        ? scene.add.text(opts.x, opts.y, '✦', { fontSize: `${s}px`, color: hex(c) }).setOrigin(0.5)
        : shape === 'square'
          ? scene.add.rectangle(opts.x, opts.y, s, s, c)
          : scene.add.circle(opts.x, opts.y, s / 2, c);
    scene.tweens.add({
      targets: obj,
      x: opts.x + vx * (life / 1000),
      y: opts.y + vy * (life / 1000) + 0.5 * gravity * Math.pow(life / 1000, 2),
      alpha: 0,
      scale: 0.3,
      duration: life,
      ease: 'Cubic.easeOut',
      onUpdate: () => {},
      onComplete: () => obj.destroy(),
    });
  }
}

function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

export function floatingText(scene: Phaser.Scene, x: number, y: number, text: string, color = '#fbbf24', size = 28) {
  const t = scene.add.text(x, y, text, {
    fontSize: `${size}px`,
    color,
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4,
  }).setOrigin(0.5).setDepth(50);
  scene.tweens.add({
    targets: t,
    y: y - 60,
    alpha: 0,
    duration: 1100,
    ease: 'Cubic.easeOut',
    onComplete: () => t.destroy(),
  });
  return t;
}

export function ringPulse(scene: Phaser.Scene, x: number, y: number, color = 0xfbbf24, maxRadius = 200, duration = 600) {
  const g = scene.add.circle(x, y, 10, color, 0.7);
  scene.tweens.add({
    targets: g,
    radius: maxRadius,
    alpha: 0,
    duration,
    ease: 'Cubic.easeOut',
    onComplete: () => g.destroy(),
  });
}

export function starBurst(scene: Phaser.Scene, x: number, y: number, color = 0xfbbf24, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = 120;
    const s = scene.add.text(x, y, '✦', { fontSize: '24px', color: hex(color) }).setOrigin(0.5);
    scene.tweens.add({
      targets: s,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      scale: 0.3,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => s.destroy(),
    });
  }
}

export function floatingSparkles(scene: Phaser.Scene, x: number, y: number, count = 6) {
  for (let i = 0; i < count; i++) {
    const sx = x + (Math.random() - 0.5) * 80;
    const sy = y + (Math.random() - 0.5) * 80;
    const s = scene.add.text(sx, sy, '✦', {
      fontSize: `${12 + Math.random() * 12}px`,
      color: '#fde68a',
    }).setOrigin(0.5).setAlpha(0);
    scene.tweens.add({
      targets: s,
      alpha: 1,
      y: sy - 40,
      duration: 300,
      yoyo: true,
      delay: i * 80,
      onComplete: () => s.destroy(),
    });
  }
}

export function shakeTarget(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, magnitude = 8) {
  const x0 = (target as any).x;
  const y0 = (target as any).y;
  scene.tweens.add({
    targets: target,
    x: x0 + magnitude,
    y: y0 - magnitude * 0.5,
    duration: 50,
    yoyo: true,
    repeat: 5,
    onComplete: () => {
      (target as any).x = x0;
      (target as any).y = y0;
    },
  });
}

export function flashWhite(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, duration = 200) {
  const tintable = target as any;
  const original = tintable.tintTopLeft ?? 0xffffff;
  tintable.setTint(0xffffff);
  scene.time.delayedCall(duration, () => {
    if (original === undefined || original === null) tintable.clearTint();
    else tintable.setTint(original);
  });
}