import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel } from '../ui/widgets';
import { useBattleStore } from '@/stores/battleStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';
import { burst, floatingText, ringPulse, shakeTarget, starBurst, floatingSparkles } from '../effects/particles';
import { DS, C, drawFrame, drawEnergyRing, drawOrnamentDivider, drawStarStuddedBackground } from '../ui/designSystem';

interface BattleSprite {
  uid: string;
  container: Phaser.GameObjects.Container;
  img: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  hpBg: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Graphics;
  hpText: Phaser.GameObjects.Text;
  energyText: Phaser.GameObjects.Text;
  energyRing?: Phaser.GameObjects.Container;
  cardBg: Phaser.GameObjects.Graphics;
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
    this.cameras.main.setBackgroundColor(DS.color.bgDeep);
    const battle = useBattleStore();
    backBar(this, battle.stage ? `${battle.stage.name} (Lv.${battle.stage.level})` : '战斗', () => this.exit());

    this.drawStageBackdrop();
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

  private drawStageBackdrop() {
    const g = this.add.graphics();
    // 全屏分层渐变替代 fillGradientStyle（战斗背景：深紫到深蓝）
    const batL = 10;
    const batTop = [0x10, 0x00, 0x20];
    const batMid = [0x30, 0x08, 0x50];
    const batBot = [0x50, 0x20, 0x60];
    for (let i = 0; i < batL; i++) {
      const t = i / batL;
      let r, gg, b;
      if (t < 0.5) {
        const tt = t / 0.5;
        r = Math.floor(batTop[0] + (batMid[0] - batTop[0]) * tt);
        gg = Math.floor(batTop[1] + (batMid[1] - batTop[1]) * tt);
        b = Math.floor(batTop[2] + (batMid[2] - batTop[2]) * tt);
      } else {
        const tt = (t - 0.5) / 0.5;
        r = Math.floor(batMid[0] + (batBot[0] - batMid[0]) * tt);
        gg = Math.floor(batMid[1] + (batBot[1] - batMid[1]) * tt);
        b = Math.floor(batMid[2] + (batBot[2] - batMid[2]) * tt);
      }
      g.fillStyle((r << 16) | (gg << 8) | b, 1);
      g.fillRect(0, (GAME_HEIGHT / batL) * i, GAME_WIDTH, (GAME_HEIGHT / batL) + 1);
    }

    drawStarStuddedBackground(this, GAME_WIDTH, GAME_HEIGHT, 0.00035).setAlpha(0.6);

    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 200);
      const star = this.add.text(x, y, '✦', {
        fontFamily: DS.font.display,
        fontSize: `${Phaser.Math.Between(8, 16)}px`,
        color: DS.color.cyanGlow,
      }).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.1, 0.4));
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.05, 0.3),
        y: y - 30,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(3000, 8000),
        repeat: -1,
      });
    }
  }

  private drawField() {
    const fieldX = 16, fieldY = 110;
    const fieldW = GAME_WIDTH - 32;
    const fieldH = 580;

    drawFrame(this, fieldX, fieldY, fieldW, fieldH, {
      fill: C.bgMid,
      fillAlpha: 0.55,
      edge: C.gold,
      edgeAlpha: 0.7,
      ornament: true,
      glow: 0.18,
      glowColor: C.magenta,
    });

    const g = this.add.graphics();
    g.fillStyle(C.magentaDeep, 0.4);
    g.fillRect(fieldX + 6, fieldY + 250, fieldW - 12, 4);
    g.fillStyle(0xffffff, 0.18);
    g.fillRect(fieldX + 6, fieldY + 250, fieldW - 12, 1);

    const pLabel = this.add.text(fieldX + 20, fieldY + 8, '我  方', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: DS.color.leaf,
      fontStyle: 'bold',
    });
    pLabel.setStroke('#000000', 4);
    const eLabel = this.add.text(fieldX + fieldW - 20, fieldY + 250 + 12, '敌  方', {
      fontFamily: DS.font.display,
      fontSize: '24px',
      color: DS.color.ember,
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    eLabel.setStroke('#000000', 4);

    this.tweens.add({ targets: pLabel, alpha: { from: 0.7, to: 1 }, duration: 800, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: eLabel, alpha: { from: 0.7, to: 1 }, duration: 800, yoyo: true, repeat: -1 });

    const divG1 = this.add.graphics();
    drawOrnamentDivider(divG1, fieldX + 60, fieldY + 30, 200, C.leaf, 0.4);
    divG1.setAlpha(0.5);
    const divG2 = this.add.graphics();
    drawOrnamentDivider(divG2, fieldX + fieldW - 260, fieldY + 280, 200, C.ember, 0.4);
    divG2.setAlpha(0.5);
  }

  private drawControls() {
    const battle = useBattleStore();
    const y = GAME_HEIGHT - 230;

    const frame = drawFrame(this, 16, y, GAME_WIDTH - 32, 220, {
      fill: C.bgDeep,
      fillAlpha: 0.92,
      edge: C.gold,
      edgeAlpha: 0.85,
      radius: DS.radius.lg,
      ornament: true,
    });

    const speedPlate = this.add.graphics();
    speedPlate.fillStyle(C.bgMid, 0.85);
    speedPlate.fillRoundedRect(28, y + 16, 230, 50, 10);
    speedPlate.lineStyle(2, C.gold, 0.7);
    speedPlate.strokeRoundedRect(28, y + 16, 230, 50, 10);
    this.add.text(38, y + 28, '⚡ 倍速', {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });
    [1, 2, 3].forEach((s, i) => {
      const x = 100 + i * 56;
      const isActive = battle.speed === s;
      const c = button(this, x, y + 26, 50, 32, `${s}x`, () => battle.setSpeed(s), {
        fontSize: 16,
        color: isActive ? C.gold : C.panelSoft,
        edge: isActive ? C.goldBright : C.panelLine,
        variant: 'flat',
      });
      if (isActive) {
        this.tweens.add({ targets: c, scaleX: 1.05, scaleY: 1.05, duration: 600, yoyo: true, repeat: -1 });
      }
    });

    const ctrlPlate = this.add.graphics();
    ctrlPlate.fillStyle(C.bgMid, 0.85);
    ctrlPlate.fillRoundedRect(28, y + 78, 230, 50, 10);
    ctrlPlate.lineStyle(2, C.gold, 0.7);
    ctrlPlate.strokeRoundedRect(28, y + 78, 230, 50, 10);

    const pauseBtn = button(this, 40, y + 88, 100, 32, battle.running ? '⏸ 暂停' : '▶ 继续', () => {
      if (battle.running) battle.pause();
      else battle.start();
    }, {
      fontSize: 16, color: C.cyan, edge: C.cyanGlow, variant: 'flat',
    });
    void pauseBtn;

    const skipBtn = button(this, 152, y + 88, 100, 32, '⏭ 跳过', () => {
      while (battle.result === 'running') battle.step();
    }, {
      fontSize: 16, color: C.violet, edge: 0xc7a9ff, variant: 'flat',
    });
    void skipBtn;

    const statusPlate = this.add.graphics();
    statusPlate.fillStyle(C.bgMid, 0.85);
    statusPlate.fillRoundedRect(28, y + 138, 230, 64, 10);
    statusPlate.lineStyle(2, C.gold, 0.7);
    statusPlate.strokeRoundedRect(28, y + 138, 230, 64, 10);
    this.add.text(40, y + 148, '◈ 状态', {
      fontFamily: DS.font.display,
      fontSize: '14px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });
    this.add.text(40, y + 170, `⏱ 已用时 ${Math.floor(battle.elapsedMs / 1000)}s`, {
      fontFamily: DS.font.body,
      fontSize: '14px',
      color: DS.color.ink,
    });
    this.add.text(40, y + 190, `◈ ${battle.result === 'running' ? '战斗中…' : battle.result === 'win' ? '胜利' : '失败'}`, {
      fontFamily: DS.font.body,
      fontSize: '14px',
      color: battle.result === 'win' ? DS.color.leaf : battle.result === 'lose' ? DS.color.ember : DS.color.cyanGlow,
    });

    const tipPlate = this.add.graphics();
    tipPlate.fillStyle(C.bgMid, 0.85);
    tipPlate.fillRoundedRect(270, y + 16, GAME_WIDTH - 32 - 286, 186, 10);
    tipPlate.lineStyle(2, C.gold, 0.7);
    tipPlate.strokeRoundedRect(270, y + 16, GAME_WIDTH - 32 - 286, 186, 10);
    this.add.text(286, y + 26, '⚔ 战斗日志', {
      fontFamily: DS.font.display,
      fontSize: '16px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    });

    const exitBtn = button(this, GAME_WIDTH - 130, y + 138, 110, 64, '✕ 退  出', () => this.exit(), {
      fontSize: 18, variant: 'danger',
    });
    void exitBtn;
  }

  private drawLog() {
    const y = GAME_HEIGHT - 230 + 36;
    const logH = 158;
    const bg = this.add.graphics();
    bg.fillStyle(0x050010, 0.4);
    bg.fillRoundedRect(282, y + 20, GAME_WIDTH - 32 - 312, logH - 30, 6);
    void bg;
  }

  private renderUnits() {
    const battle = useBattleStore();
    const fieldX = 24;
    const fieldY = 160;
    const cellW = (GAME_WIDTH - 48 - 30) / 3;
    const cellH = 230;

    battle.units.forEach((u) => {
      const col = u.pos % 3;
      const row = Math.floor(u.pos / 3);
      const x = fieldX + col * (cellW + 5);
      const y = u.side === 'enemy' ? fieldY + row * cellH : fieldY + 250 + row * cellH;
      let sprite = this.sprites.get(u.uid);
      if (!sprite) {
        const base = HERO_MAP[u.heroId];
        const portrait = getHeroPortrait(base);
        const key = 'btl_' + u.uid;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        const container = this.add.container(x + cellW / 2, y);
        const cardBg = this.add.graphics();
        const rarityColor = rarity2n(base.rarity);

        cardBg.fillStyle(0x050010, 0.85);
        cardBg.fillRoundedRect(-cellW / 2 + 4, -cellH / 2 + 6, cellW - 8, cellH - 12, DS.radius.md);
        cardBg.fillStyle(rarityColor, 0.25);
        cardBg.fillRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, DS.radius.md);
        cardBg.lineStyle(2, rarityColor, 1);
        cardBg.strokeRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, DS.radius.md);
        cardBg.lineStyle(1, 0xffffff, 0.18);
        cardBg.strokeRoundedRect(-cellW / 2 + 3, -cellH / 2 + 3, cellW - 6, cellH - 6, DS.radius.md - 2);
        container.add(cardBg);

        const img = this.add.image(0, 12, key).setDisplaySize(cellW - 24, cellH - 70);

        const namePlate = this.add.graphics();
        namePlate.fillStyle(0x050010, 0.95);
        namePlate.fillRoundedRect(-cellW / 2 + 8, -cellH / 2 + 8, cellW - 16, 28, 6);
        namePlate.fillStyle(u.side === 'enemy' ? C.ember : C.leaf, 1);
        namePlate.fillRect(-cellW / 2 + 8, -cellH / 2 + 8, 4, 28);
        container.add(namePlate);

        const name = this.add.text(0, -cellH / 2 + 22, base.name, {
          fontFamily: DS.font.display,
          fontSize: '18px',
          color: DS.color.goldBright,
          fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(name);

        const hpBg = this.add.graphics();
        hpBg.fillStyle(0x050010, 0.85);
        hpBg.fillRoundedRect(-cellW / 2 + 8, cellH / 2 - 38, cellW - 16, 24, 6);
        hpBg.lineStyle(1, 0xffffff, 0.3);
        hpBg.strokeRoundedRect(-cellW / 2 + 8, cellH / 2 - 38, cellW - 16, 24, 6);
        container.add(hpBg);

        const hpBar = this.add.graphics();
        container.add(hpBar);

        const hpText = this.add.text(0, cellH / 2 - 26, `${u.hp}/${u.maxHp}`, {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);
        container.add(hpText);

        const energyText = this.add.text(0, cellH / 2 - 70, '⚡ 0', {
          fontFamily: DS.font.display,
          fontSize: '14px',
          color: DS.color.goldBright,
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);
        container.add(energyText);

        container.setScale(0);
        this.tweens.add({
          targets: container,
          scaleX: 1, scaleY: 1,
          duration: 500,
          ease: 'Back.easeOut',
        });

        this.tweens.add({
          targets: container,
          scaleY: 1.025,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: 500 + (u.pos * 80),
        });

        sprite = {
          uid: u.uid, container, img, name, hpBg, hpBar, hpText,
          energyText, cardBg, side: u.side, pos: u.pos,
          baseX: x + cellW / 2, baseY: y, cellW, cellH,
        };
        this.sprites.set(u.uid, sprite);
      }

      sprite.container.setPosition(sprite.baseX, sprite.baseY);

      const hpPct = Math.max(0, u.hp / u.maxHp);
      const hpColor = hpPct > 0.5 ? C.leaf : hpPct > 0.25 ? C.gold : C.ember;
      sprite.hpBar.clear();
      sprite.hpBar.fillStyle(hpColor, 1);
      sprite.hpBar.fillRoundedRect(-sprite.cellW / 2 + 10, sprite.cellH / 2 - 36, (sprite.cellW - 20) * hpPct, 20, 5);
      sprite.hpBar.fillStyle(0xffffff, 0.35);
      sprite.hpBar.fillRoundedRect(-sprite.cellW / 2 + 12, sprite.cellH / 2 - 35, (sprite.cellW - 24) * hpPct, 5, 3);

      sprite.hpText.setText(`${Math.floor(u.hp)}/${u.maxHp}`);

      const energyPct = u.energy / 100;
      const isReady = u.energy >= 100;
      sprite.energyText.setText(`⚡ ${Math.floor(u.energy)}`);
      sprite.energyText.setColor(isReady ? DS.color.goldBright : DS.color.cyanGlow);

      if (!sprite.energyRing) {
        sprite.energyRing = drawEnergyRing(this, sprite.baseX + sprite.cellW / 2 - 18, sprite.baseY - sprite.cellH / 2 + 18, 14, 0, {
          track: C.panelSoft, fill: C.cyan, tick: C.goldBright,
        }).setDepth(20);
      }
      sprite.energyRing.setPosition(sprite.baseX + sprite.cellW / 2 - 18, sprite.baseY - sprite.cellH / 2 + 18);

      if (isReady) {
        sprite.energyText.setText('⚡ 必杀！');
        this.tweens.add({
          targets: sprite.energyRing,
          scaleX: 1.15, scaleY: 1.15,
          duration: 600, yoyo: true, repeat: -1,
        });
      } else {
        sprite.energyRing.setScale(1);
      }

      sprite.cardBg.clear();
      const rarityColor = rarity2n(HERO_MAP[u.heroId].rarity);
      sprite.cardBg.fillStyle(0x050010, 0.85);
      sprite.cardBg.fillRoundedRect(-sprite.cellW / 2 + 4, -sprite.cellH / 2 + 6, sprite.cellW - 8, sprite.cellH - 12, DS.radius.md);
      sprite.cardBg.fillStyle(rarityColor, 0.25);
      sprite.cardBg.fillRoundedRect(-sprite.cellW / 2, -sprite.cellH / 2, sprite.cellW, sprite.cellH, DS.radius.md);
      sprite.cardBg.lineStyle(2, rarityColor, 1);
      sprite.cardBg.strokeRoundedRect(-sprite.cellW / 2, -sprite.cellH / 2, sprite.cellW, sprite.cellH, DS.radius.md);
      sprite.cardBg.lineStyle(1, 0xffffff, 0.18);
      sprite.cardBg.strokeRoundedRect(-sprite.cellW / 2 + 3, -sprite.cellH / 2 + 3, sprite.cellW - 6, sprite.cellH - 6, DS.radius.md - 2);

      if (!u.alive) {
        sprite.container.setAlpha(0.4);
        sprite.img.setTint(0x666666);
        sprite.img.setRotation(0.3);
        sprite.img.y = 28;
        if (sprite.energyRing) sprite.energyRing.setVisible(false);
      } else {
        sprite.container.setAlpha(1);
        sprite.img.clearTint();
        sprite.img.rotation = 0;
        sprite.img.y = 12;
        if (sprite.energyRing) sprite.energyRing.setVisible(true);
        if ((u as any).hitAt && this.time.now - (u as any).hitAt < 250) {
          sprite.img.x = Math.sin(this.time.now / 30) * 6;
        } else {
          sprite.img.x = 0;
        }
      }
    });

    battle.units.forEach((u) => {
      if ((u as any)._lastHp !== undefined && u.hp < (u as any)._lastHp) {
        const delta = (u as any)._lastHp - u.hp;
        const sp = this.sprites.get(u.uid);
        if (sp) {
          floatingText(this, sp.baseX, sp.baseY - sp.cellH / 2 + 30, `-${Math.floor(delta)}`, '#ef4444', 32);
          shakeTarget(this, sp.img, 8);
          burst(this, { x: sp.baseX, y: sp.baseY, count: 8, color: 0xef4444, color2: 0xfbbf24, speed: 120, size: 4, life: 400, shape: 'spark' });
          (u as any).hitAt = this.time.now;
        }
      }
      (u as any)._lastHp = u.hp;
    });

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
    const x0 = 286, y0 = GAME_HEIGHT - 230 + 56;
    log.forEach((l, i) => {
      const colorMap: Record<string, string> = {
        death: DS.color.ember, heal: DS.color.leaf, skill: DS.color.goldBright,
        crit: DS.color.magentaGlow, dodge: DS.color.cyanGlow,
      };
      const t = this.add.text(x0, y0 + i * 18, l.text, {
        fontFamily: DS.font.body,
        fontSize: '14px',
        color: colorMap[l.kind] || DS.color.inkDim,
      });
      t.setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      this.logTexts.push(t);
    });

    const lastSkillLog = log.filter((l) => l.kind === 'skill').slice(-1)[0];
    if (lastSkillLog && !(lastSkillLog as any)._fxDone && lastSkillLog.source) {
      (lastSkillLog as any)._fxDone = true;
      const sp = this.sprites.get(lastSkillLog.source);
      if (sp) {
        ringPulse(this, sp.baseX, sp.baseY, 0xfbbf24, 220, 800);
        starBurst(this, sp.baseX, sp.baseY, 0xfbbf24, 10);
        floatingSparkles(this, sp.baseX, sp.baseY, 8);
        floatingText(this, sp.baseX, sp.baseY - 60, '必杀！', DS.color.goldBright, 36);
      }
    }
  }

  private showResult(result: 'win' | 'lose') {
    const battle = useBattleStore();
    const player = usePlayerStore();
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x00000088).setDepth(100);

    const resultColor = result === 'win' ? C.gold : C.ember;
    const resultFrame = drawFrame(this, GAME_WIDTH / 2 - 240, GAME_HEIGHT / 2 - 160, 480, 280, {
      fill: C.bgDeep, fillAlpha: 0.95, edge: resultColor,
      edgeAlpha: 1, ornament: true, glow: 0.45, glowColor: resultColor,
    }).setDepth(101);

    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, result === 'win' ? '✦  胜  利  ✦' : '✕  失  败  ✕', {
      fontFamily: DS.font.display,
      fontSize: '56px',
      color: result === 'win' ? DS.color.goldBright : DS.color.ember,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: result === 'win' ? '#ffd76a' : '#ff6a3d', blur: 24, fill: true },
    }).setOrigin(0.5).setDepth(102).setScale(0);
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 700, ease: 'Back.easeOut' });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, result === 'win' ? '继续推图，挑战下一关！' : '调整阵容，再来一次！', {
      fontFamily: DS.font.body,
      fontSize: '22px',
      color: DS.color.ink,
    }).setOrigin(0.5).setDepth(102);

    if (result === 'win') {
      this.time.delayedCall(300, () => {
        for (let i = 0; i < 6; i++) {
          this.time.delayedCall(i * 200, () => {
            starBurst(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(300, GAME_HEIGHT - 400), 0xfbbf24, 8);
          });
        }
      });
    }

    button(this, GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + 50, 180, 60, '返  回', () => this.exit(), {
      fontSize: 24, variant: 'flat',
    }).setDepth(102);
    button(this, GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 + 50, 180, 60, '下一关 →', () => {
      if (result === 'win') {
        battle.reset();
        this.scene.start('StageScene');
      } else {
        this.exit();
      }
    }, { fontSize: 24, variant: 'gold', disabled: result !== 'win' }).setDepth(102);

    void player;
    void resultFrame;
  }

  shutdown() {
    this.battleTimer?.remove();
    this.sprites.forEach((s) => {
      s.energyRing?.destroy();
      s.container.destroy();
    });
    this.sprites.clear();
    this.logTexts.forEach((t) => t.destroy());
    this.bgStars.forEach((s) => s.destroy());
  }
}

function hex2n(h: string): number { return parseInt(h.replace('#', ''), 16); }
function rarity2n(r: string): number {
  const m: Record<string, number> = { N: 0x5a6470, R: 0x3aa0d4, SR: 0xa060e0, SSR: 0xf6c453, UR: 0xff6a8a };
  return m[r] || 0x5a6470;
}