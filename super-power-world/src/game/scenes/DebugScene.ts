import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { audio } from '@/core/audio';
import {
  drawSceneBackdrop,
  drawTopNav,
  drawSoftPanel,
  drawPolishedButton,
  setGameRefSize,
  CARTOON,
  DS,
} from '../ui/designSystem';
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
    setGameRefSize(GAME_WIDTH, GAME_HEIGHT);
    drawSceneBackdrop(this, GAME_WIDTH, GAME_HEIGHT, 'night', { dimTop: 100, dimBottom: 40 });

    drawTopNav(this, '调试工具', {
      back: () => { audio.playSfx?.('click'); this.scene.start('MainScene'); },
      subtitle: '开发与测试专用',
    });

    this.drawTabs();
    this.drawContent();
  }

  private drawTabs() {
    const tabs = [
      { id: 'resource', name: '资源', glyph: '��' },
      { id: 'hero', name: '英雄', glyph: '��' },
      { id: 'battle', name: '战斗', glyph: '⚔' },
      { id: 'event', name: '事件', glyph: '✨' },
    ] as const;
    const w = (GAME_WIDTH - 32) / tabs.length;
    const y = 102;
    tabs.forEach((t, i) => {
      const x = 16 + i * w;
      const isActive = this.tab === t.id;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.35);
      g.fillRoundedRect(x + 3, y + 4, w - 8, 56, 12);
      if (isActive) {
        g.fillStyle(0x8a5a20, 1);
        g.fillRoundedRect(x + 2, y + 2, w - 8, 56, 12);
        g.fillStyle(0xc09030, 1);
        g.fillRoundedRect(x + 4, y + 0, w - 12, 56, 11);
        g.fillStyle(CARTOON.hexGold, 1);
        g.fillRoundedRect(x + 6, y + 2, w - 16, 52, 10);
        g.fillStyle(0xfff0a0, 0.5);
        g.fillRoundedRect(x + 8, y + 4, w - 20, 22, 8);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeRoundedRect(x + 4, y + 0, w - 12, 56, 11);
      } else {
        g.fillStyle(0x0a2a4a, 1);
        g.fillRoundedRect(x + 2, y + 2, w - 8, 56, 12);
        g.fillStyle(0x1a4a8a, 1);
        g.fillRoundedRect(x + 4, y + 4, w - 12, 52, 11);
        g.fillStyle(0xffffff, 0.12);
        g.fillRoundedRect(x + 6, y + 5, w - 16, 20, 9);
        g.lineStyle(1.5, 0x6ab8f0, 0.45);
        g.strokeRoundedRect(x + 4, y + 4, w - 12, 52, 11);
      }
      if (isActive) {
        [[x + 10, y + 6], [x + w - 14, y + 6]].forEach(([cx, cy]) => {
          g.fillStyle(0xfff0a0, 0.9);
          g.fillCircle(cx, cy, 3);
        });
      }
      this.add.text(x + w / 2, y + 18, t.glyph, { fontSize: '20px' }).setOrigin(0.5);
      this.add.text(x + w / 2, y + 42, t.name, {
        fontFamily: DS.font.body,
        fontSize: '16px',
        color: isActive ? '#fff0c0' : '#ffffff',
        fontStyle: 'bold',
        stroke: isActive ? '#5a3a0a' : '#0a2a4a',
        strokeThickness: 2,
      }).setOrigin(0.5);
      const hit = this.add.rectangle(x + w / 2, y + 28, w - 8, 56, 0xffffff, 0).setInteractive();
      hit.on('pointerdown', () => {
        audio.playSfx?.('click');
        this.tab = t.id;
        this.scene.restart();
      });
    });
  }

  private drawContent() {
    const y = 178;
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
        { name: '导出存档', do: async () => { const json = await exportPlayer(); navigator.clipboard?.writeText(json); this.showToast('已复制到剪贴板'); } },
        { name: '导入存档', do: async () => { const json = prompt('请粘贴 JSON'); if (json) { const data = await importPlayer(json); if (data) this.showToast('导入成功'); else this.showToast('格式错误'); } } },
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
    const cellH = 56;
    items.forEach((it, i) => {
      const y = startY + i * (cellH + 8);
      drawPolishedButton(
        this, 12, y, cellW, cellH, it.name,
        { variant: 'blue', fontSize: '18px', onClick: it.do },
      );
    });
  }

  private showToast(text: string) {
    const bg = this.add.graphics();
    const w = Math.min(GAME_WIDTH - 40, text.length * 20 + 36);
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.lineStyle(2, 0xffd76a, 0.85);
    bg.strokeRoundedRect(GAME_WIDTH / 2 - w / 2, 60, w, 44, 10);
    bg.setDepth(80);
    const t = this.add.text(GAME_WIDTH / 2, 82, text, {
      fontFamily: DS.font.display,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0,0,0,0.8)',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(80);
    this.tweens.add({
      targets: [t, bg], alpha: 0, duration: 800, delay: 1200,
      onComplete: () => { t.destroy(); bg.destroy(); },
    });
  }
}