import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel } from '../ui/widgets';
import { useBattleStore } from '@/stores/battleStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { burst, floatingText, ringPulse, shakeTarget, starBurst, floatingSparkles } from '../effects/particles';

interface BattleSprite {
  uid: string;
  container: Phaser.GameObjects.Container;
  img: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  hpBg: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Graphics;
  energyText: Phaser.GameObjects.Text;
  side: 'player' | 'enemy';
  pos: number;
  baseX: number;
  baseY: number;
  cellW: number;
  cellH: number;
}

export class BattleScene extends Phaser.Scene {
  private battleTimer?: Phaser.Time.TimerEvent;
  private sprites = new Map<string, BattleSprite>();
  private logTexts: Phaser.GameObjects.Text[] = [];
  private effectLayer!: Phaser.GameObjects.Container;
  private bgStars: Phaser.GameObjects.Text[] = [];

  constructor() { super('BattleScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    const battle = useBattleStore();
    backBar(this, battle.stage ? `${battle.stage.name} (Lv.${battle.stage.level})` : '战斗', () => this.exit());

    this.drawAnimatedBackground();
    this.drawField();
    this.drawControls();
    this.drawLog();
    this.effectLayer = this.add.container(0, 0);

    battle.start();
    this.battleTimer = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        battle.loop(100);
        this.renderUnits();
        this.renderLog();
        if (battle.result === 'win' || battle.result === 'lose') {
          this.battleTimer?.remove();
          this.showResult(battle.result as 'win' | 'lose');
        }
      },
    });
  }

  private exit() {
    const battle = useBattleStore();
    battle.reset();
    this.scene.start('MainScene');
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 16)}px`,
        color: '#ffffff',
      }).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.1, 0.4));
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.05, 0.3),
        y: y - 30,
        duration: Phaser.Math.Between(3000, 8000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawField() {
    const g = this.add.graphics();
    g.fillStyle(0x23234a, 0.6);
    g.fillRoundedRect(12, 90, GAME_WIDTH - 24, 600, 16);
    g.lineStyle(2, 0x4a4a8a, 1);
    g.strokeRoundedRect(12, 90, GAME_WIDTH - 24, 600, 16);
    g.lineBetween(12, 390, GAME_WIDTH - 12, 390);
    // 玩家与敌方标签
    const pLabel = this.add.text(40, 110, '我方', { fontSize: '24px', color: '#10b981', fontStyle: 'bold' });
    const eLabel = this.add.text(GAME_WIDTH - 40, 410, '敌方', { fontSize: '24px', color: '#ef4444', fontStyle: 'bold' }).setOrigin(1, 0);
    this.tweens.add({ targets: pLabel, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: eLabel, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
  }

  private drawControls() {
    const battle = useBattleStore();
    button(this, 20, GAME_HEIGHT - 220, 130, 50, '1x', () => battle.setSpeed(1), { fontSize: 20, color: battle.speed === 1 ? 0xfbbf24 : 0x4a4a8a });
    button(this, 160, GAME_HEIGHT - 220, 130, 50, '2x', () => battle.setSpeed(2), { fontSize: 20, color: battle.speed === 2 ? 0xfbbf24 : 0x4a4a8a });
    button(this, 300, GAME_HEIGHT - 220, 130, 50, '3x', () => battle.setSpeed(3), { fontSize: 20, color: battle.speed === 3 ? 0xfbbf24 : 0x4a4a8a });
    button(this, 440, GAME_HEIGHT - 220, 200, 50, '暂停/继续', () => {
      if (battle.running) battle.pause();
      else battle.start();
    }, { fontSize: 22 });
    button(this, 20, GAME_HEIGHT - 160, 200, 50, '跳过战斗', () => {
      while (battle.result === 'running') battle.step();
    }, { fontSize: 22, color: 0xa78bfa });
    button(this, 240, GAME_HEIGHT - 160, 200, 50, '退出', () => this.exit(), { fontSize: 22, color: 0xef4444 });
  }

  private drawLog() {
    const bg = this.add.graphics();
    bg.fillStyle(0x12122a, 0.85);
    bg.fillRoundedRect(12, 700, GAME_WIDTH - 24, GAME_HEIGHT - 940, 12);
    this.add.text(24, 712, '⚔ 战斗日志', { fontSize: '20px', color: '#fbbf24', fontStyle: 'bold' });
  }

  private renderUnits() {
    const battle = useBattleStore();
    const fieldX = 24;
    const fieldY = 140;
    const cellW = (GAME_WIDTH - 48 - 30) / 3;
    const cellH = 220;

    battle.units.forEach((u) => {
      const col = u.pos % 3;
      const row = Math.floor(u.pos / 3);
      const x = fieldX + col * (cellW + 5);
      const y = u.side === 'enemy' ? fieldY + row * cellH : fieldY + 230 + row * cellH;
      let sprite = this.sprites.get(u.uid);
      if (!sprite) {
        const base = HERO_MAP[u.heroId];
        const portrait = getHeroPortrait(base);
        const key = 'btl_' + u.uid;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        const container = this.add.container(x + cellW / 2, y);
        const img = this.add.image(0, 0, key).setDisplaySize(cellW - 12, cellH - 50);
        const name = this.add.text(0, -cellH / 2 + 14, base.name, { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        const hpBg = this.add.graphics();
        hpBg.fillStyle(0x4a4a8a, 1);
        hpBg.fillRoundedRect(-cellW / 2 + 8, cellH / 2 - 32, cellW - 16, 18, 6);
        const hpBar = this.add.graphics();
        const energyText = this.add.text(0, cellH / 2 - 12, '0', { fontSize: '14px', color: '#fbbf24' }).setOrigin(0.5);
        container.add([img, name, hpBg, hpBar, energyText]);
        // 入场动画
        container.setScale(0);
        this.tweens.add({
          targets: container,
          scaleX: 1, scaleY: 1,
          duration: 400,
          ease: 'Back.easeOut',
        });
        // 待机呼吸
        this.tweens.add({
          targets: container,
          scaleY: 1.02,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: 400 + (u.pos * 80),
        });
        sprite = { uid: u.uid, container, img, name, hpBg, hpBar, energyText, side: u.side, pos: u.pos, baseX: x + cellW / 2, baseY: y, cellW, cellH };
        this.sprites.set(u.uid, sprite);
      }
      sprite.container.setPosition(sprite.baseX, sprite.baseY);
      const hpPct = Math.max(0, u.hp / u.maxHp);
      const hpColor = hpPct > 0.5 ? 0x10b981 : hpPct > 0.25 ? 0xfbbf24 : 0xef4444;
      sprite.hpBar.clear();
      sprite.hpBar.fillStyle(hpColor, 1);
      sprite.hpBar.fillRoundedRect(-sprite.cellW / 2 + 8, sprite.cellH / 2 - 32, (sprite.cellW - 16) * hpPct, 18, 6);
      sprite.energyText.setText(`⚡ ${u.energy}/100`);
      if (u.energy >= 100) {
        sprite.energyText.setColor('#fbbf24');
      } else {
        sprite.energyText.setColor('#9ca3af');
      }
      // 死亡处理
      if (!u.alive) {
        sprite.container.setAlpha(0.35);
        sprite.img.setTint(0x666666);
        sprite.img.setRotation(0.3);
        sprite.img.y = 20;
      } else {
        sprite.container.setAlpha(1);
        sprite.img.clearTint();
        sprite.img.rotation = 0;
        sprite.img.y = 0;
        // 命中摇晃
        if ((u as any).hitAt && this.time.now - (u as any).hitAt < 250) {
          sprite.img.x = Math.sin(this.time.now / 30) * 6;
        } else {
          sprite.img.x = 0;
        }
      }
    });

    // 检测伤害事件，触发飘字和命中
    battle.units.forEach((u) => {
      if ((u as any)._lastHp !== undefined && u.hp < (u as any)._lastHp) {
        const delta = (u as any)._lastHp - u.hp;
        const sp = this.sprites.get(u.uid);
        if (sp) {
          floatingText(this, sp.baseX, sp.baseY - sp.cellH / 2, `-${delta}`, '#ef4444', 32);
          shakeTarget(this, sp.img, 8);
          burst(this, { x: sp.baseX, y: sp.baseY, count: 8, color: 0xef4444, color2: 0xfbbf24, speed: 120, size: 4, life: 400, shape: 'spark' });
          (u as any).hitAt = this.time.now;
        }
      }
      (u as any)._lastHp = u.hp;
    });

    // 检测敌方死亡
    battle.units.filter((u) => !u.alive && u.side === 'enemy').forEach((u) => {
      const sp = this.sprites.get(u.uid);
      if (sp && !(u as any)._deathDone) {
        (u as any)._deathDone = true;
        ringPulse(this, sp.baseX, sp.baseY, 0xef4444, 180, 700);
        burst(this, { x: sp.baseX, y: sp.baseY, count: 24, color: 0xef4444, color2: 0xfbbf24, speed: 220, size: 6, life: 800 });
      }
    });
  }

  private renderLog() {
    const battle = useBattleStore();
    const log = battle.log.slice(-6);
    if (this.logTexts.length) this.logTexts.forEach((t) => t.destroy());
    this.logTexts = [];
    log.forEach((l, i) => {
      const t = this.add.text(24, 740 + i * 22, l.text, {
        fontSize: '16px',
        color: l.kind === 'death' ? '#ef4444' : l.kind === 'heal' ? '#10b981' : l.kind === 'skill' ? '#fbbf24' : '#ffffffcc',
      });
      t.setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      this.logTexts.push(t);
    });

    // 检测技能施放，触发特效
    const lastSkillLog = log.filter((l) => l.kind === 'skill').slice(-1)[0];
    if (lastSkillLog && !(lastSkillLog as any)._fxDone && lastSkillLog.source) {
      (lastSkillLog as any)._fxDone = true;
      const sp = this.sprites.get(lastSkillLog.source);
      if (sp) {
        ringPulse(this, sp.baseX, sp.baseY, 0xfbbf24, 220, 800);
        starBurst(this, sp.baseX, sp.baseY, 0xfbbf24, 10);
        floatingSparkles(this, sp.baseX, sp.baseY, 8);
      }
    }
  }

  private showResult(result: 'win' | 'lose') {
    const battle = useBattleStore();
    const player = usePlayerStore();
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x00000088).setDepth(100);
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, result === 'win' ? '胜利！' : '失败', {
      fontSize: '72px',
      color: result === 'win' ? '#fbbf24' : '#ef4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(101).setScale(0);
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 600, ease: 'Back.easeOut' });

    // 胜利撒花
    if (result === 'win') {
      this.time.delayedCall(300, () => {
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 200, () => {
            starBurst(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(300, GAME_HEIGHT - 400), 0xfbbf24, 8);
          });
        }
      });
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, result === 'win' ? '继续推图' : '调整阵容再战', { fontSize: '24px', color: '#fff' }).setOrigin(0.5).setDepth(101);
    button(this, GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + 70, 180, 60, '返回', () => this.exit(), { fontSize: 24 }).setDepth(101);
    button(this, GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 + 70, 180, 60, '下一关', () => {
      if (result === 'win') {
        battle.reset();
        this.scene.start('StageScene');
      } else {
        this.exit();
      }
    }, { fontSize: 24, color: 0x10b981, disabled: result !== 'win' }).setDepth(101);
    void player;
  }

  shutdown() {
    this.battleTimer?.remove();
    this.sprites.forEach((s) => s.container.destroy());
    this.sprites.clear();
    this.logTexts.forEach((t) => t.destroy());
    this.bgStars.forEach((s) => s.destroy());
  }
}