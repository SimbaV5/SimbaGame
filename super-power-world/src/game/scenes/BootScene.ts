import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { loadAllStores, startAutoSave } from '@/core/persistence';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { useActivityStore } from '@/stores/activityStore';
import { useShopStore } from '@/stores/shopStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { audio } from '@/core/audio';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  async create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    // 标题
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, '超能世界', {
      fontSize: '64px', color: '#fbbf24', fontStyle: 'bold',
      stroke: '#c084fc', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setScale(0.3);

    this.tweens.add({
      targets: title,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 800, ease: 'Back.easeOut',
    });

    // 副标题
    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Super Power World', {
      fontSize: '24px', color: '#6ad1ff', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 400 });

    // 加载条
    const bar = this.add.graphics();
    bar.fillStyle(0x23234a, 1);
    bar.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 20, 300, 16, 8);
    const fill = this.add.graphics();

    // 旋转图标
    const spinner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, '✦', {
      fontSize: '32px', color: '#fbbf24',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: spinner,
      rotation: Math.PI * 2,
      duration: 1500,
      repeat: -1,
      ease: 'Linear',
    });

    const loaderFill = document.getElementById('loading-fill');
    const updateProgress = (p: number) => {
      if (loaderFill) loaderFill.style.width = `${Math.round(p * 100)}%`;
      fill.clear();
      fill.fillStyle(0x6ad1ff, 1);
      fill.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 20, 300 * p, 16, 8);
    };

    updateProgress(0.1);
    await loadAllStores();
    updateProgress(0.5);
    usePlayerStore().recoverStamina();
    useShopStore().dailyReset();
    useActivityStore().dayIndex;
    void useHeroStore();
    void useInventoryStore();
    updateProgress(1);

    startAutoSave();
    audio.startBgm();

    this.time.delayedCall(800, () => {
      this.tweens.add({
        targets: [title, sub, bar, fill, spinner],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.scene.start('MainScene');
          document.getElementById('loading')?.remove();
        },
      });
    });
  }
}