import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { BattleScene } from './scenes/BattleScene';
import { MergeScene } from './scenes/MergeScene';
import { HeroScene } from './scenes/HeroScene';
import { GachaScene } from './scenes/GachaScene';
import { ShopScene } from './scenes/ShopScene';
import { StageScene } from './scenes/StageScene';
import { ActivityScene } from './scenes/ActivityScene';
import { DebugScene } from './scenes/DebugScene';
import { UIScene } from './scenes/UIScene';
import { TrialTowerScene } from './scenes/TrialTowerScene';
import { ArenaScene } from './scenes/ArenaScene';
import { GuildScene } from './scenes/GuildScene';
import { WorldBossScene } from './scenes/WorldBossScene';
import { ProfileScene } from './scenes/ProfileScene';
import { CodexScene } from './scenes/CodexScene';
import { bus, BusEvents } from '@/core/eventBus';

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export function createGame(parent: HTMLElement) {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1a1a2e',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: true,
    },
    fps: {
      target: 60,
      min: 30,
      forceSetTimeOut: false,
    },
    scene: [BootScene, MainScene, MergeScene, HeroScene, BattleScene, GachaScene, ShopScene, StageScene, ActivityScene, TrialTowerScene, GuildScene, WorldBossScene, ArenaScene, ProfileScene, CodexScene, DebugScene, UIScene],
    banner: false,
  };
  const g = new Phaser.Game(config);
  (window as any).__PHASER_GAME__ = g;
  bus.on(BusEvents.OpenUI, (name: string) => {
    const scene = g.scene.getScene(name);
    if (scene && !scene.scene.isActive()) {
      scene.scene.start();
    }
  });
  return g;
}