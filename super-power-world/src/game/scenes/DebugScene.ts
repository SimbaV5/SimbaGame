import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { usePlayerStore } from '@/stores/playerStore';
import { useHeroStore } from '@/stores/heroStore';
import { useBattleStore } from '@/stores/battleStore';
import { useShopStore } from '@/stores/shopStore';
import { useGachaStore } from '@/stores/gachaStore';
import { useActivityStore } from '@/stores/activityStore';
import { useMergeStore } from '@/stores/mergeStore';
import { HEROES, HERO_MAP } from '@/data/heroes';
import { STAGES } from '@/data/stages';
import { wipeSave, exportPlayer, importPlayer } from '@/core/persistence';

export class DebugScene extends Phaser.Scene {
  private tab: 'resource' | 'hero' | 'battle' | 'event' = 'resource';

  constructor() { super('DebugScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '调试工具', () => this.scene.start('MainScene'));
    this.drawTabs();
    this.drawContent();
  }

  private drawTabs() {
    const tabs = [
      { id: 'resource', name: '资源' },
      { id: 'hero', name: '英雄' },
      { id: 'battle', name: '战斗' },
      { id: 'event', name: '事件' },
    ] as const;
    const w = (GAME_WIDTH - 24) / tabs.length;
    tabs.forEach((t, i) => {
      const x = 12 + i * w;
      const y = 100;
      const isActive = this.tab === t.id;
      panel(this, x + 4, y, w - 8, 50, isActive ? 0xfbbf24 : 0x23234a);
      this.add.text(x + w / 2, y + 25, t.name, {
        fontSize: '18px', color: isActive ? '#1a1a2e' : '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);
      const bg = this.add.rectangle(x + w / 2, y + 25, w - 8, 50, 0xffffff, 0).setInteractive();
      bg.on('pointerdown', () => { this.tab = t.id; this.scene.restart(); });
    });
  }

  private drawContent() {
    const y = 170;
    const player = usePlayerStore();
    if (this.tab === 'resource') {
      const items = [
        { name: '+10000 金币', do: () => { player.addCurrency('gold', 10000); this.scene.restart(); } },
        { name: '+1000 钻石', do: () => { player.addCurrency('gem', 1000); this.scene.restart(); } },
        { name: '+200 英魂', do: () => { player.addCurrency('soul', 200); this.scene.restart(); } },
        { name: '+120 体力', do: () => { player.grantStamina(120); this.scene.restart(); } },
        { name: '+10 UP 券', do: () => { player.addTicket('up', 10); this.scene.restart(); } },
        { name: '+10 普通券', do: () => { player.addTicket('standard', 10); this.scene.restart(); } },
        { name: 'VIP 经验 +500', do: () => { player.addVipExp(500); this.scene.restart(); } },
        { name: '解锁所有英雄', do: () => { HEROES.forEach((h) => { if (!useHeroStore().byBaseId(h.id).length) useHeroStore().add(h.id); }); this.scene.restart(); } },
      ];
      this.addColumn(y, items);
    } else if (this.tab === 'hero') {
      const items = [
        { name: '选中英雄 升 1 级', do: () => { const h = useHeroStore().heroes[0]; if (h) useHeroStore().gainExp(h.uid, 99999); this.scene.restart(); } },
        { name: '选中英雄 升 1 星', do: () => { const h = useHeroStore().heroes[0]; if (h) useHeroStore().starUp(h.uid); this.scene.restart(); } },
        { name: '选中英雄 突破', do: () => { const h = useHeroStore().heroes[0]; if (h) useHeroStore().breakThrough(h.uid); this.scene.restart(); } },
        { name: '解锁 LR 英雄', do: () => { HEROES.filter((h) => h.rarity === 'LR').slice(0, 3).forEach((h) => useHeroStore().add(h.id)); this.scene.restart(); } },
        { name: '解锁 MRC 英雄', do: () => { HEROES.filter((h) => h.rarity === 'MRC').slice(0, 3).forEach((h) => useHeroStore().add(h.id)); this.scene.restart(); } },
        { name: '一键满级天赋', do: () => { useHeroStore().heroes.forEach((h) => { h.talentPoints = { hp: 50, atk: 50, def: 50, spd: 50 }; }); this.scene.restart(); } },
      ];
      this.addColumn(y, items);
    } else if (this.tab === 'battle') {
      const items = [
        { name: '跳到第 36 关', do: () => { player.save.currentStage = 36; player.save.highestStage = 36; this.scene.restart(); } },
        { name: '开启无敌模式', do: () => { player.setDebug({ invincible: !player.save.debug.invincible }); this.scene.restart(); } },
        { name: '伤害 x10', do: () => { player.setDebug({ damageMultiplier: 10 }); this.scene.restart(); } },
        { name: '开启加速时间', do: () => { player.setDebug({ acceleratedTime: !player.save.debug.acceleratedTime }); this.scene.restart(); } },
        { name: '跳过当前关卡', do: () => { useBattleStore().step(); this.scene.restart(); } },
        { name: '直接胜利', do: () => { useBattleStore().endBattle('win'); this.scene.restart(); } },
        { name: '导出存档', do: async () => { const json = await exportPlayer(); navigator.clipboard?.writeText(json); toast(this, '已复制到剪贴板'); } },
        { name: '导入存档', do: async () => { const json = prompt('请粘贴 JSON'); if (json) { const data = await importPlayer(json); if (data) toast(this, '导入成功'); else toast(this, '格式错误'); } } },
        { name: '清空存档', do: async () => { if (confirm('确认清空存档？')) { await wipeSave(); this.scene.start('BootScene'); } } },
      ];
      this.addColumn(y, items);
    } else if (this.tab === 'event') {
      const items = [
        { name: '模拟抽卡 x10', do: () => { useGachaStore().pull('up', 10); this.scene.restart(); } },
        { name: '模拟购买月卡', do: () => { useShopStore().buy('monthly_card'); this.scene.restart(); } },
        { name: '模拟领取登录', do: () => { useActivityStore().claimLogin(); this.scene.restart(); } },
        { name: '模拟购买基金', do: () => { useActivityStore().buyFund(); this.scene.restart(); } },
        { name: '测试合成网格', do: () => { const h = HEROES[0]; useMergeStore().addCell(h.id, 1, 1); this.scene.restart(); } },
        { name: '显示玩家数据', do: () => { alert(JSON.stringify({ gold: player.gold, gem: player.gem, heroes: useHeroStore().heroes.length, formation: player.save.formation }, null, 2)); } },
        { name: '显示关卡进度', do: () => { alert(JSON.stringify({ current: player.save.currentStage, cleared: player.save.clearedStages.length, highest: player.save.highestStage, total: STAGES.length }, null, 2)); } },
      ];
      this.addColumn(y, items);
    }
    void HERO_MAP;
  }

  private addColumn(startY: number, items: { name: string; do: () => void }[]) {
    const cellW = GAME_WIDTH - 24;
    const cellH = 60;
    items.forEach((it, i) => {
      const y = startY + i * (cellH + 8);
      panel(this, 12, y, cellW, cellH, 0x23234a);
      button(this, 24, y + 8, cellW - 24, cellH - 16, it.name, it.do, { fontSize: 20, color: 0x6ad1ff });
    });
  }
}