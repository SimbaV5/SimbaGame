import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { loadAllStores, startAutoSave } from '@/core/persistence';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { useActivityStore } from '@/stores/activityStore';
import { useShopStore } from '@/stores/shopStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { audio } from '@/core/audio';
import { DS, C, drawOrnamentDivider, drawStarStuddedBackground } from '../ui/designSystem';

export class BootScene extends Phaser.Scene {
  private stage!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressFill!: Phaser.GameObjects.Graphics;
  private loaderLabel!: Phaser.GameObjects.Text;
  private tipLabel!: Phaser.GameObjects.Text;

  constructor() { super('BootScene'); }

  create() {
    this.drawBackdrop();
    this.drawBrand();
    this.drawProgress();
    this.startSequence();
  }

  private drawBackdrop() {
    this.cameras.main.setBackgroundColor(DS.color.bgDeep);

    const g = this.add.graphics();
    // 全屏分层渐变替代 fillGradientStyle
    const bootL = 10;
    const bootTop = [0x10, 0x00, 0x20];
    const bootMid = [0x30, 0x10, 0x50];
    const bootBot = [0x50, 0x20, 0x60];
    for (let i = 0; i < bootL; i++) {
      const t = i / bootL;
      let r, gg, b;
      if (t < 0.5) {
        const tt = t / 0.5;
        r = Math.floor(bootTop[0] + (bootMid[0] - bootTop[0]) * tt);
        gg = Math.floor(bootTop[1] + (bootMid[1] - bootTop[1]) * tt);
        b = Math.floor(bootTop[2] + (bootMid[2] - bootTop[2]) * tt);
      } else {
        const tt = (t - 0.5) / 0.5;
        r = Math.floor(bootMid[0] + (bootBot[0] - bootMid[0]) * tt);
        gg = Math.floor(bootMid[1] + (bootBot[1] - bootMid[1]) * tt);
        b = Math.floor(bootMid[2] + (bootBot[2] - bootMid[2]) * tt);
      }
      g.fillStyle((r << 16) | (gg << 8) | b, 1);
      g.fillRect(0, (GAME_HEIGHT / bootL) * i, GAME_WIDTH, (GAME_HEIGHT / bootL) + 1);
    }

    drawStarStuddedBackground(this, GAME_WIDTH, GAME_HEIGHT, 0.0008).setAlpha(0.7);

    for (let i = 0; i < 4; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(120, 220),
        [C.magenta, C.gold, C.violet, C.cyan][i],
        0.08,
      );
      this.tweens.add({
        targets: orb,
        alpha: 0.18, scaleX: 1.15, scaleY: 1.15,
        duration: Phaser.Math.Between(4500, 7500),
        yoyo: true, repeat: -1,
        delay: i * 700,
      });
    }

    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.55);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  private drawBrand() {
    this.stage = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);

    const eyebrow = this.add.text(0, -160, '— CHRONICLES OF —', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: DS.color.magentaGlow,
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    this.stage.add(eyebrow);

    const dividerTop = this.add.graphics();
    drawOrnamentDivider(dividerTop, -120, -120, 240, C.gold, 0.8);
    this.stage.add(dividerTop);
    this.tweens.add({ targets: dividerTop, alpha: { from: 0, to: 1 }, duration: 700, delay: 250 });

    const titleShadow = this.add.text(4, 6, '超能世界', {
      fontFamily: DS.font.display,
      fontSize: '120px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
    this.stage.add(titleShadow);

    const titleStroke = this.add.text(0, 0, '超能世界', {
      fontFamily: DS.font.display,
      fontSize: '120px',
      color: DS.color.magentaDeep,
      fontStyle: 'bold',
      stroke: DS.color.magentaDeep,
      strokeThickness: 12,
    }).setOrigin(0.5).setAlpha(0).setScale(0.4);
    this.stage.add(titleStroke);

    const title = this.add.text(0, 0, '超能世界', {
      fontFamily: DS.font.display,
      fontSize: '120px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
      stroke: DS.color.magentaDeep,
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffd76a', blur: 24, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.4);
    this.stage.add(title);

    this.tweens.add({
      targets: [titleShadow, titleStroke, title],
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 1100, ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: title,
      scaleX: 1.04, scaleY: 1.04,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: 1200,
    });

    const sub = this.add.text(0, 80, 'SUPER  POWER  WORLD', {
      fontFamily: DS.font.display,
      fontSize: '28px',
      color: DS.color.cyanGlow,
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setLetterSpacing(8);
    this.stage.add(sub);

    const tagline = this.add.text(0, 120, '「 召唤你的超能英雄 」', {
      fontFamily: DS.font.body,
      fontSize: '20px',
      color: DS.color.inkDim,
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);
    this.stage.add(tagline);

    this.tweens.add({
      targets: [sub, tagline, eyebrow],
      alpha: 1, duration: 700, delay: 700,
    });

    const sideLeft = this.add.graphics();
    drawOrnamentDivider(sideLeft, -GAME_WIDTH / 2 + 40, -GAME_HEIGHT / 2 + 80, 60, C.magenta, 0.6);
    this.add.container(0, 0).add(sideLeft);

    const sideRight = this.add.graphics();
    drawOrnamentDivider(sideRight, GAME_WIDTH / 2 - 100, -GAME_HEIGHT / 2 + 80, 60, C.magenta, 0.6);
    this.add.container(0, 0).add(sideRight);
  }

  private drawProgress() {
    const w = 420, h = 18;
    const x = GAME_WIDTH / 2 - w / 2;
    const y = GAME_HEIGHT - 220;

    const frame = this.add.graphics();
    frame.fillStyle(0x000000, 0.65);
    frame.fillRoundedRect(x - 6, y - 6, w + 12, h + 12, 12);
    frame.lineStyle(2, C.gold, 0.85);
    frame.strokeRoundedRect(x, y, w, h, 8);

    this.progressBar = this.add.graphics();
    this.progressFill = this.add.graphics();

    this.loaderLabel = this.add.text(GAME_WIDTH / 2, y - 30, '召唤世界 0%', {
      fontFamily: DS.font.display,
      fontSize: '22px',
      color: DS.color.goldBright,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tipLabel = this.add.text(GAME_WIDTH / 2, y + 50, 'TIP  合成碎片可以提升稀有度', {
      fontFamily: DS.font.body,
      fontSize: '18px',
      color: DS.color.inkDim,
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 2400, loop: true,
      callback: () => {
        const tips = [
          'TIP  合成碎片可以提升稀有度',
          'TIP  阵营克制：循环克制，相邻阵营优势',
          'TIP  前排坦克吸收伤害，后排输出更安全',
          'TIP  每日召唤有保底，积少成多必出UR',
          'TIP  觉醒需要重复英雄与金币',
          'TIP  试炼之塔每10层有强力BOSS',
          'TIP  公会讨伐可获稀有材料',
          'TIP  装备强化可大幅提升战力',
        ];
        this.tipLabel.setText(tips[Math.floor(Math.random() * tips.length)]);
      },
    });
  }

  private async startSequence() {
    const updateProgress = (p: number, label: string) => {
      this.progressFill.clear();
      const fillW = (p) * 420;
      this.progressFill.fillStyle(C.gold, 1);
      this.progressFill.fillRoundedRect(GAME_WIDTH / 2 - 210, GAME_HEIGHT - 220, fillW, 18, 8);
      this.progressFill.fillStyle(C.goldBright, 0.7);
      this.progressFill.fillRoundedRect(GAME_WIDTH / 2 - 210 + 2, GAME_HEIGHT - 220 + 2, fillW - 4, 5, 6);
      this.loaderLabel.setText(`${label}  ${Math.round(p * 100)}%`);
    };

    updateProgress(0.08, '读取存档');
    await delay(220);

    await loadAllStores();
    updateProgress(0.45, '召唤英雄');

    usePlayerStore().recoverStamina();
    useShopStore().dailyReset();
    void useActivityStore().dayIndex;
    void useHeroStore();
    void useInventoryStore();
    updateProgress(0.85, '点亮星辰');

    audio.startBgm();
    startAutoSave();
    updateProgress(1, '进入世界');

    await delay(700);

    this.tweens.add({
      targets: [this.stage, this.progressBar, this.progressFill, this.loaderLabel, this.tipLabel],
      alpha: 0, y: '-=30',
      duration: 600,
      onComplete: () => {
        this.scene.start('MainScene');
        document.getElementById('loading')?.remove();
      },
    });
  }
}

function hex2n(h: string): number { return parseInt(h.replace('#', ''), 16); }
function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }