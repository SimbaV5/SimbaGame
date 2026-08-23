import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Game';
import { backBar, button, panel } from '../ui/widgets';
import { useHeroStore } from '@/stores/heroStore';
import { usePlayerStore } from '@/stores/playerStore';
import { HEROES, HERO_MAP } from '@/data/heroes';
import { getHeroPortrait } from '@/core/assetGen';

export class CodexScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Text[] = [];
  private filter: string = 'all';

  constructor() { super('CodexScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0e0e1e');
    this.drawAnimatedBackground();
    backBar(this, '📖 英雄图鉴', () => this.scene.start('MainScene'));
    this.drawSummary();
    this.drawFilters();
    this.drawCodex();
  }

  private drawAnimatedBackground() {
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#6ad1ff',
      }).setOrigin(0.5).setAlpha(0.15);
      this.bgStars.push(star);
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        y: y - 30,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private drawSummary() {
    const player = usePlayerStore();
    const owned = useHeroStore().heroes;
    const ownedIds = new Set(owned.map((h) => h.heroId));
    const totalCollected = ownedIds.size;
    const totalAll = HEROES.length;
    const pct = Math.round((totalCollected / totalAll) * 100);

    panel(this, 12, 100, GAME_WIDTH - 24, 100, 0x1f2937);
    this.add.text(24, 116, '📖 收集进度', { fontSize: '20px', color: '#fbbf24', fontStyle: 'bold' });
    this.add.text(24, 152, `${totalCollected} / ${totalAll}  (${pct}%)`, { fontSize: '24px', color: '#fff' });

    // 收集奖励
    const rewards = [
      { count: 10, prize: '100 钻', claimed: (player.save as any).codexClaimed10 },
      { count: 30, prize: '500 钻', claimed: (player.save as any).codexClaimed30 },
      { count: 60, prize: '5 张 UP券', claimed: (player.save as any).codexClaimed60 },
      { count: 100, prize: '限定头像框', claimed: (player.save as any).codexClaimed100 },
    ];
    const target = rewards.filter((r) => totalCollected >= r.count && !r.claimed)[0];
    if (target) {
      this.add.text(GAME_WIDTH - 24, 116, `🎁 可领：${target.prize}`, { fontSize: '14px', color: '#10b981' }).setOrigin(1, 0);
      button(this, GAME_WIDTH - 130, 142, 100, 36, '领取', () => {
        const k = target.count === 10 ? 'codexClaimed10' : target.count === 30 ? 'codexClaimed30' : target.count === 60 ? 'codexClaimed60' : 'codexClaimed100';
        (player.save as any)[k] = true;
        if (target.prize.includes('钻')) {
          const n = parseInt(target.prize);
          player.addCurrency('gem', n);
        } else if (target.prize.includes('UP')) {
          player.addTicket('up', 5);
        }
        this.scene.restart();
      }, { fontSize: 16, color: 0x10b981 });
    }
  }

  private drawFilters() {
    const filters = [
      { id: 'all', name: '全部' },
      { id: 'SSR', name: 'SSR+' },
      { id: 'celestial', name: '天界' },
      { id: 'abyss', name: '深渊' },
      { id: 'mecha', name: '机枢' },
      { id: 'beast', name: '荒野' },
      { id: 'spirit', name: '幻灵' },
      { id: 'human', name: '人族' },
    ];
    const w = (GAME_WIDTH - 24) / filters.length;
    filters.forEach((f, i) => {
      const x = 12 + i * w;
      const y = 220;
      const isActive = this.filter === f.id;
      panel(this, x + 2, y, w - 4, 40, isActive ? 0xfbbf24 : 0x23234a);
      this.add.text(x + w / 2, y + 20, f.name, {
        fontSize: '14px', color: isActive ? '#1a1a2e' : '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);
      const bg = this.add.rectangle(x + w / 2, y + 20, w - 4, 40, 0x00000000).setInteractive();
      bg.on('pointerdown', () => { this.filter = f.id; this.scene.restart(); });
    });
  }

  private drawCodex() {
    const ownedIds = new Set(useHeroStore().heroes.map((h) => h.heroId));
    let heroes = HEROES;
    if (this.filter === 'SSR') heroes = heroes.filter((h) => ['SSR', 'UR', 'LR', 'MRC'].includes(h.rarity));
    else if (['celestial', 'abyss', 'mecha', 'beast', 'spirit', 'human'].includes(this.filter)) {
      heroes = heroes.filter((h) => h.faction === this.filter);
    }

    const startY = 280;
    const cellW = (GAME_WIDTH - 48 - 18) / 4;
    const cellH = 110;
    heroes.slice(0, 32).forEach((hero, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 24 + col * (cellW + 6);
      const y = startY + row * (cellH + 8);
      const owned = ownedIds.has(hero.id);
      panel(this, x, y, cellW, cellH, owned ? 0x23234a : 0x12122a);
      if (owned) {
        const portrait = getHeroPortrait(hero);
        const key = `codex_${hero.id}`;
        if (!this.textures.exists(key)) this.textures.addCanvas(key, portrait);
        this.add.image(x + cellW / 2, y + 45, key).setDisplaySize(cellW - 12, 60);
      } else {
        this.add.text(x + cellW / 2, y + cellH / 2, '?', { fontSize: '40px', color: '#4a4a8a' }).setOrigin(0.5);
      }
      this.add.text(x + cellW / 2, y + cellH - 12, owned ? hero.name : '未解锁', {
        fontSize: '12px', color: owned ? '#fbbf24' : '#4a4a8a',
      }).setOrigin(0.5);
    });
    void HERO_MAP;
  }

  shutdown() {
    this.bgStars.forEach((s) => s.destroy());
  }
}