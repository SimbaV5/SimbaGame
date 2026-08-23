import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel, toast } from '../ui/widgets';
import { useHeroStore } from '@/stores/heroStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HERO_MAP } from '@/data/heroes';
import { computeStats, levelCap, breakthroughCost, starUpCost } from '@/core/formulas';
import { getHeroPortrait } from '@/core/assetGen';

export class HeroScene extends Phaser.Scene {
  private selectedUid: string | null = null;
  private mode: 'list' | 'detail' | 'formation' = 'list';

  constructor() { super('HeroScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    backBar(this, '英雄管理', () => this.scene.start('MainScene'));
    button(this, 20, 90, 200, 50, '编队', () => this.toggleMode('formation'), { fontSize: 20 });
    button(this, 240, 90, 200, 50, '英雄列表', () => this.toggleMode('list'), { fontSize: 20 });
    this.refresh();
  }

  private toggleMode(m: 'list' | 'formation') {
    this.mode = m;
    this.refresh();
  }

  private refresh() {
    this.children.removeAll();
    backBar(this, '英雄管理', () => this.scene.start('MainScene'));
    button(this, 20, 90, 200, 50, '编队', () => this.toggleMode('formation'), { fontSize: 20 });
    button(this, 240, 90, 200, 50, '英雄列表', () => this.toggleMode('list'), { fontSize: 20 });

    if (this.mode === 'list') this.drawList();
    else this.drawFormation();

    if (this.selectedUid) this.drawDetail();
  }

  private drawList() {
    const heroes = useHeroStore().heroes;
    if (!heroes.length) {
      this.add.text(GAME_WIDTH / 2, 400, '尚未拥有英雄\n前往召唤获得第一位英雄', {
        fontSize: '24px', color: '#9ca3af', align: 'center',
      }).setOrigin(0.5);
      return;
    }
    const startY = 160;
    const cellW = 140;
    const cellH = 170;
    const cols = Math.floor((GAME_WIDTH - 24) / (cellW + 8));
    heroes.forEach((h, i) => {
      const x = 12 + (i % cols) * (cellW + 8);
      const y = startY + Math.floor(i / cols) * (cellH + 12);
      const base = HERO_MAP[h.heroId];
      if (!base) return;
      const portrait = getHeroPortrait(base);
      const key = 'hero_portrait_' + h.uid;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
      const img = this.add.image(x + cellW / 2, y + 70, key).setDisplaySize(cellW - 8, 100);
      const g = this.add.graphics();
      g.fillStyle(0x23234a, 1);
      g.fillRoundedRect(x, y, cellW, cellH, 12);
      img.setDepth(2);
      this.add.text(x + cellW / 2, y + 130, base.name, { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(x + 8, y + 152, `${base.rarity} Lv${h.level}`, { fontSize: '14px', color: '#fbbf24' });
      g.setInteractive(new Phaser.Geom.Rectangle(x, y, cellW, cellH), Phaser.Geom.Rectangle.Contains);
      g.on('pointerdown', () => {
        this.selectedUid = h.uid;
        this.refresh();
      });
    });
  }

  private drawFormation() {
    const player = usePlayerStore();
    const heroes = useHeroStore().heroes;
    const slots = player.save.formation.slots;
    const cellW = (GAME_WIDTH - 36) / 3;
    const cellH = 200;
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 12 + col * (cellW + 6);
      const y = 160 + row * (cellH + 10);
      panel(this, x, y, cellW, cellH);
      const uid = slots[i];
      if (uid) {
        const inst = useHeroStore().byId(uid);
        if (inst) {
          const base = HERO_MAP[inst.heroId];
          const portrait = getHeroPortrait(base);
          const key = 'form_' + uid;
          if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
          this.add.image(x + cellW / 2, y + 80, key).setDisplaySize(cellW - 20, 100);
          this.add.text(x + cellW / 2, y + 145, base.name, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
        }
      } else {
        this.add.text(x + cellW / 2, y + cellH / 2, '空位', { fontSize: '22px', color: '#4a4a8a' }).setOrigin(0.5);
      }
      // 点击切换
      const slotIdx = i;
      const bg = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH, 0x00000000).setInteractive();
      bg.on('pointerdown', () => {
        const next = heroes[(heroes.findIndex((h) => h.uid === slots[slotIdx]) + 1 + heroes.length) % heroes.length];
        slots[slotIdx] = slots[slotIdx] ? next?.uid ?? null : next?.uid ?? null;
        this.refresh();
      });
    }
  }

  private drawDetail() {
    const heroStore = useHeroStore();
    const player = usePlayerStore();
    const inst = heroStore.byId(this.selectedUid!);
    if (!inst) return;
    const base = HERO_MAP[inst.heroId];
    const stats = computeStats(inst);
    const x = 12, y = 580, w = GAME_WIDTH - 24, h = GAME_HEIGHT - 600;
    panel(this, x, y, w, h, 0x1a1a2e);

    const portrait = getHeroPortrait(base);
    const key = 'detail_' + inst.uid;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
    this.add.image(x + 100, y + 100, key).setDisplaySize(160, 160);

    this.add.text(x + 200, y + 30, base.name, { fontSize: '28px', color: '#fbbf24', fontStyle: 'bold' });
    this.add.text(x + 200, y + 66, `${base.rarity}  ${cn(base.class)}  ${cn(base.element)}  ${cn(base.faction)}`, { fontSize: '16px', color: '#9ca3af' });
    this.add.text(x + 200, y + 90, `战力 ${stats.power}`, { fontSize: '18px', color: '#fff' });
    this.add.text(x + 16, y + 170, `等级 ${inst.level}/${levelCap(base)}  经验 ${inst.exp}`, { fontSize: '18px', color: '#fff' });
    this.add.text(x + 16, y + 200, `星级 ${inst.star}★  突破 ${inst.breakthrough}`, { fontSize: '18px', color: '#fff' });

    // 操作按钮
    const bY = y + 240;
    button(this, x + 12, bY, 160, 50, '升级', () => {
      if (player.gem < 50) return toast(this, '钻石不足');
      player.addCurrency('gem', -50);
      heroStore.gainExp(inst.uid, 100);
      this.refresh();
    }, { fontSize: 18 });
    button(this, x + 180, bY, 160, 50, '突破', () => {
      if (!heroStore.breakThrough(inst.uid)) toast(this, '资源不足');
      this.refresh();
    }, { fontSize: 18 });
    button(this, x + 348, bY, 160, 50, '升星', () => {
      if (!heroStore.starUp(inst.uid)) toast(this, '需要同星狗粮');
      this.refresh();
    }, { fontSize: 18 });

    const tY = bY + 60;
    this.add.text(x + 16, tY, `天赋：生命 ${inst.talentPoints.hp}  攻击 ${inst.talentPoints.atk}  防御 ${inst.talentPoints.def}  速度 ${inst.talentPoints.spd}`, {
      fontSize: '16px', color: '#a78bfa',
    });

    // 关闭按钮
    button(this, x + w - 80, y + 12, 64, 40, '✕', () => { this.selectedUid = null; this.refresh(); }, { color: 0xef4444, fontSize: 22 });
    void base;
    void starUpCost;
    void breakthroughCost;
  }
}

function cn(c: string) {
  return ({ tank: '守护', warrior: '战士', assassin: '刺客', ranger: '游侠', mage: '法师', support: '辅助',
    fire: '火', water: '水', wind: '风', thunder: '雷', light: '光', dark: '暗',
    celestial: '天界', abyss: '深渊', mecha: '机枢', beast: '荒野', spirit: '幻灵', human: '人族' } as any)[c] || c;
}