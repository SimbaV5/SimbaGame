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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '超能世界', {
      fontSize: '52px', color: '#fbbf24', fontStyle: 'bold',
    }).setOrigin(0.5);
    const bar = this.add.graphics();
    bar.fillStyle(0x23234a, 1);
    bar.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 20, 300, 16, 8);
    const fill = this.add.graphics();
    fill.fillStyle(0x6ad1ff, 1);
    fill.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 20, 0, 16, 8);

    const loaderFill = document.getElementById('loading-fill');
    const updateProgress = (p: number) => {
      if (loaderFill) loaderFill.style.width = `${Math.round(p * 100)}%`;
      fill.clear();
      fill.fillStyle(0x6ad1ff, 1);
      fill.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 + 20, 300 * p, 16, 8);
    };

    updateProgress(0.1);
    // 初始化 stores
    await loadAllStores();
    updateProgress(0.5);
    usePlayerStore().recoverStamina();
    useShopStore().dailyReset();
    useActivityStore().dayIndex;
    // 这里可以补充预热数据
    void useHeroStore();
    void useInventoryStore();
    updateProgress(1);

    startAutoSave();

    this.time.delayedCall(400, () => {
      this.scene.start('MainScene');
      document.getElementById('loading')?.remove();
    });
  }
}