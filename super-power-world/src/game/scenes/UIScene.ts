import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { button } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';

export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    // 始终显示的 UI 层：调试按钮
    button(this, GAME_WIDTH - 80, 12, 64, 64, '⚙', () => {
      this.scene.start('DebugScene');
    }, { color: 0x23234a, fontSize: 32 });
    const player = usePlayerStore();
    this.add.text(GAME_WIDTH - 180, 30, `${player.save.nickname} Lv.${player.save.level}`, {
      fontSize: '16px', color: '#fbbf24',
    }).setOrigin(1, 0);
  }

  update() {
    const player = usePlayerStore();
    const nickText = this.children.list.find((c: any) => c.text?.startsWith?.(player.save.nickname.slice(0, 1))) as any;
    if (nickText) nickText.setText(`${player.save.nickname} Lv.${player.save.level}`);
  }
}