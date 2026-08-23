import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useBattleStore } from '@/stores/battleStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

export class BattleScene extends Phaser.Scene {
  private battleTimer?: Phaser.Time.TimerEvent;
  private sprites = new Map<string, Phaser.GameObjects.Container>();
  private logTexts: Phaser.GameObjects.Text[] = [];

  constructor() { super('BattleScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    const battle = useBattleStore();
    backBar(this, battle.stage ? `${battle.stage.name} (Lv.${battle.stage.level})` : '战斗', () => this.exit());

    this.drawField();
    this.drawControls();
    this.drawLog();

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

  private drawField() {
    const g = this.add.graphics();
    g.fillStyle(0x23234a, 1);
    g.fillRoundedRect(12, 90, GAME_WIDTH - 24, 600, 16);
    g.lineStyle(2, 0x4a4a8a, 1);
    g.strokeRoundedRect(12, 90, GAME_WIDTH - 24, 600, 16);
    // 中央分割
    g.lineBetween(12, 390, GAME_WIDTH - 12, 390);
    // 玩家与敌方标签
    this.add.text(80, 100, '我方', { fontSize: '20px', color: '#10b981', fontStyle: 'bold' });
    this.add.text(GAME_WIDTH - 80, 400, '敌方', { fontSize: '20px', color: '#ef4444', fontStyle: 'bold' }).setOrigin(1, 0);
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
    bg.fillStyle(0x12122a, 1);
    bg.fillRoundedRect(12, 700, GAME_WIDTH - 24, GAME_HEIGHT - 940, 12);
    this.add.text(24, 712, '战斗日志', { fontSize: '18px', color: '#fbbf24' });
  }

  private renderUnits() {
    const battle = useBattleStore();
    const fieldX = 24;
    const fieldY = 140;
    const cellW = (GAME_WIDTH - 48 - 30) / 3;
    const cellH = 220;
    battle.units.forEach((u) => {
      let sprite = this.sprites.get(u.uid);
      const col = u.pos % 3;
      const row = Math.floor(u.pos / 3);
      const x = fieldX + col * (cellW + 5);
      const y = u.side === 'enemy' ? fieldY + row * cellH : fieldY + 230 + row * cellH;
      if (!sprite) {
        const base = HERO_MAP[u.heroId];
        const portrait = getHeroPortrait(base);
        const key = 'btl_' + u.uid;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        sprite = this.add.container(x + cellW / 2, y);
        const img = this.add.image(0, 0, key).setDisplaySize(cellW - 12, cellH - 50);
        const name = this.add.text(0, -cellH / 2 + 12, base.name, { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        const hpBg = this.add.graphics();
        hpBg.fillStyle(0x4a4a8a, 1);
        hpBg.fillRoundedRect(-cellW / 2 + 8, cellH / 2 - 32, cellW - 16, 16, 6);
        const hpBar = this.add.graphics();
        const energyText = this.add.text(0, cellH / 2 - 12, '0', { fontSize: '12px', color: '#fbbf24' }).setOrigin(0.5);
        sprite.add([img, name, hpBg, hpBar, energyText]);
        sprite.setData('hpBar', hpBar);
        sprite.setData('hpBg', hpBg);
        sprite.setData('energyText', energyText);
        sprite.setData('name', name);
        sprite.setData('img', img);
        this.sprites.set(u.uid, sprite);
      }
      sprite.setPosition(x + cellW / 2, y);
      const hpPct = Math.max(0, u.hp / u.maxHp);
      const hpBar = sprite.getData('hpBar') as Phaser.GameObjects.Graphics;
      hpBar.clear();
      hpBar.fillStyle(0xef4444, 1);
      hpBar.fillRoundedRect(-cellW / 2 + 8, cellH / 2 - 32, (cellW - 16) * hpPct, 16, 6);
      const energyText = sprite.getData('energyText') as Phaser.GameObjects.Text;
      energyText.setText(`${u.energy}/100`);
      if (!u.alive) {
        sprite.setAlpha(0.4);
      } else {
        sprite.setAlpha(1);
        sprite.y = y + (Math.sin(this.time.now / 200 + u.pos) * 2);
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
      this.logTexts.push(t);
    });
  }

  private showResult(result: 'win' | 'lose') {
    const battle = useBattleStore();
    const player = usePlayerStore();
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x00000088);
    overlay.setDepth(100);
    const color = result === 'win' ? 0x10b981 : 0xef4444;
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, result === 'win' ? '胜利！' : '失败', { fontSize: '64px', color: result === 'win' ? '#10b981' : '#ef4444', fontStyle: 'bold' }).setOrigin(0.5).setDepth(101);
    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, result === 'win' ? '继续推图' : '调整阵容再战', { fontSize: '24px', color: '#fff' }).setOrigin(0.5).setDepth(101);
    button(this, GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + 70, 180, 60, '返回', () => this.exit(), { fontSize: 24 }).setDepth(101);
    button(this, GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 + 70, 180, 60, '下一关', () => {
      if (result === 'win') {
        const nextId = Math.min(player.save.currentStage, 36);
        const stage = battle.stage;
        if (stage) {
          const nextStage = (window as any).__nextStage ?? null;
          void nextStage;
          battle.reset();
          this.scene.start('StageScene');
        }
      } else {
        this.exit();
      }
    }, { fontSize: 24, color: 0x10b981, disabled: result !== 'win' }).setDepth(101);
    void t;
    void sub;
  }

  shutdown() {
    this.battleTimer?.remove();
    this.sprites.forEach((s) => s.destroy());
    this.sprites.clear();
    this.logTexts.forEach((t) => t.destroy());
  }
}