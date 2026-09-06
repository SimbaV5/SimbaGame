// =========================================================
// 全局事件总线 (Phaser 场景与 Pinia store 之间的桥梁)
// =========================================================

type Handler<T = unknown> = (payload: T) => void;

class EventBus {
  private listeners = new Map<string, Set<Handler>>();

  on<T = unknown>(event: string, fn: Handler<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as Handler);
    return () => this.off(event, fn);
  }

  off<T = unknown>(event: string, fn: Handler<T>) {
    this.listeners.get(event)?.delete(fn as Handler);
  }

  emit<T = unknown>(event: string, payload?: T) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error('[EventBus]', event, e);
      }
    });
  }

  clear() {
    this.listeners.clear();
  }
}

export const bus = new EventBus();
export const BusEvents = {
  SceneReady: 'scene:ready',
  SceneClosed: 'scene:closed',
  CurrencyChanged: 'currency:changed',
  HeroAdded: 'hero:added',
  HeroUpdated: 'hero:updated',
  StageCleared: 'stage:cleared',
  BattleStart: 'battle:start',
  BattleEnd: 'battle:end',
  GachaPull: 'gacha:pull',
  SaveRequested: 'save:requested',
  Toast: 'ui:toast',
  OpenUI: 'ui:open',
  CloseUI: 'ui:close',
  RefreshUI: 'ui:refresh',
} as const;