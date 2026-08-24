import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import { DS, CARTOON } from '../ui/designSystem';
import { usePlayerStore } from '@/stores/playerStore';

export class UIScene extends Phaser.Scene {
  private nickText!: Phaser.GameObjects.Text;

  constructor() { super('UIScene'); }

  create() {
    // 始终显示的 UI 层：调试按钮（精致圆形）
    const btnX = GAME_WIDTH - 60;
    const btnY = 56;
    const btn = this.add.container(btnX, btnY);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.45);
    bg.fillCircle(2, 4, 30);
    bg.fillStyle(0x0a2a4a, 1);
    bg.fillCircle(0, 0, 30);
    bg.fillStyle(0x2a6fb5, 1);
    bg.fillCircle(0, 0, 26);
    bg.fillStyle(0x3a8fd5, 0.95);
    bg.fillCircle(0, 0, 22);
    bg.fillStyle(0x6ab8f0, 0.5);
    bg.fillCircle(-3, -4, 12);
    bg.fillStyle(CARTOON.hexGold, 1);
    bg.fillCircle(-18, -18, 4);
    bg.fillStyle(0xfff0a0, 0.85);
    bg.fillCircle(-19, -19, 2);
    bg.lineStyle(2, 0xffffff, 0.7);
    bg.strokeCircle(0, 0, 26);
    btn.add(bg);

    const t = this.add.text(0, 2, '⚙', {
      fontFamily: DS.font.display,
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.6)',
      strokeThickness: 2,
    }).setOrigin(0.5);
    btn.add(t);

    btn.setSize(60, 60);
    btn.setInteractive(new Phaser.Geom.Rectangle(-30, -30, 60, 60), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', () => {
      this.tweens.add({ targets: btn, scaleX: 0.9, scaleY: 0.9, duration: 60, yoyo: true });
      audio.playSfx?.('click');
      this.scene.start('DebugScene');
    });

    // 玩家昵称 + Lv（精致徽章）
    const player = usePlayerStore();
    const nickBg = this.add.graphics();
    nickBg.fillStyle(0x000000, 0.4);
    nickBg.fillRoundedRect(8, 18, 220, 36, 18);
    nickBg.fillStyle(0x0a2a4a, 0.92);
    nickBg.fillRoundedRect(6, 16, 220, 36, 18);
    nickBg.fillStyle(0x2a6fb5, 0.9);
    nickBg.fillRoundedRect(8, 18, 216, 32, 16);
    nickBg.fillStyle(0xffffff, 0.18);
    nickBg.fillRoundedRect(10, 19, 212, 14, 12);
    nickBg.fillStyle(0xffd76a, 1);
    nickBg.fillCircle(22, 34, 4);
    nickBg.lineStyle(1.5, 0xffd76a, 0.7);
    nickBg.strokeRoundedRect(6, 16, 220, 36, 18);
    this.nickText = this.add.text(28, 34, `${player.save.nickname} Lv.${player.save.level}`, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,30,60,0.85)',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);
  }

  update() {
    const player = usePlayerStore();
    if (this.nickText) {
      this.nickText.setText(`${player.save.nickname} Lv.${player.save.level}`);
    }
  }
}
