import { defineStore } from 'pinia';
import type { BattleLog, HeroBase, HeroInstance, StageDef, BattleEffect, BattleLogKind } from '@/types';
import { HERO_MAP } from '@/data/heroes';
import { SKILL_MAP } from '@/data/skills';
import { computeStats } from '@/core/formulas';
import { clamp, randInt, chance } from '@/core/rng';
import { useHeroStore } from './heroStore';
import { usePlayerStore } from './playerStore';
import { useInventoryStore } from './inventoryStore';
import { useGachaStore } from './gachaStore';
import { bus, BusEvents } from '@/core/eventBus';
import { audio } from '@/core/audio';

interface BattleUnit {
  uid: string;
  heroId: string;
  name: string;
  side: 'player' | 'enemy';
  pos: number;
  level: number;
  star: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  dodge: number;
  energy: number;
  skillIds: string[];
  shield: number;
  buffs: { type: string; value: number; duration: number }[];
  debuffs: { type: string; value: number; duration: number }[];
  alive: boolean;
  taunt: number;
}

function buildUnit(heroId: string, level: number, star: number, side: 'player' | 'enemy', pos: number, inst?: HeroInstance): BattleUnit {
  const base = HERO_MAP[heroId];
  const stats = inst ? computeStats(inst) : {
    hp: Math.round((base?.baseHp ?? 1000) * (1 + (level - 1) * 0.08)),
    atk: Math.round((base?.baseAtk ?? 100) * (1 + (level - 1) * 0.08)),
    def: Math.round((base?.baseDef ?? 50) * (1 + (level - 1) * 0.08)),
    spd: base?.baseSpd ?? 100,
    crit: 5,
    dodge: 5,
    power: 0,
  };
  return {
    uid: inst?.uid ?? `enemy_${pos}_${side}`,
    heroId,
    name: base?.name ?? '???',
    side,
    pos,
    level,
    star,
    hp: stats.hp,
    maxHp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    spd: stats.spd,
    crit: stats.crit,
    dodge: stats.dodge,
    energy: 0,
    skillIds: base?.skillIds ?? ['sk_atk_basic'],
    shield: 0,
    buffs: [],
    debuffs: [],
    alive: true,
    taunt: 0,
  };
}

export const useBattleStore = defineStore('battle', {
  state: () => ({
    running: false,
    stage: null as StageDef | null,
    units: [] as BattleUnit[],
    log: [] as BattleLog[],
    tick: 0,
    result: 'idle' as 'idle' | 'win' | 'lose' | 'running',
    speed: 1,
    autoResume: false,
    elapsedMs: 0,
  }),
  actions: {
    init(stage: StageDef, formation: (string | null)[]) {
      this.stage = stage;
      this.tick = 0;
      this.log = [];
      this.units = [];
      this.result = 'idle';
      this.elapsedMs = 0;

      const heroStore = useHeroStore();
      // 玩家
      formation.forEach((uid, i) => {
        if (!uid) return;
        const inst = heroStore.byId(uid);
        if (!inst) return;
        this.units.push(buildUnit(inst.heroId, inst.level, inst.star, 'player', i, inst));
      });
      // 敌方
      let pos = 0;
      stage.waves.forEach((wave) => {
        wave.enemies.forEach((e) => {
          this.units.push(buildUnit(e.heroId, e.level, e.star || 1, 'enemy', pos++));
        });
      });
    },
    start() {
      this.running = true;
      this.result = 'running';
      bus.emit(BusEvents.BattleStart, this.stage);
    },
    setSpeed(s: number) {
      this.speed = s;
    },
    pause() {
      this.running = false;
    },
    pushLog(kind: BattleLogKind, text: string, source?: string, target?: string, value?: number) {
      this.log.push({ t: this.tick, kind, source, target, text, value });
      if (this.log.length > 200) this.log.shift();
    },
    alive(side: 'player' | 'enemy') {
      return this.units.filter((u) => u.side === side && u.alive);
    },
    pickTarget(attacker: BattleUnit): BattleUnit | null {
      const enemies = this.alive(attacker.side === 'player' ? 'enemy' : 'player');
      if (enemies.length === 0) return null;
      // 嘲讽优先级
      const taunter = enemies.find((e) => e.taunt > 0);
      if (taunter) return taunter;
      // 前排 vs 后排：pos 0-2 前排，3-5 后排
      const front = enemies.filter((e) => e.pos % 6 < 3);
      const pool = front.length ? front : enemies;
      return pool[Math.floor(Math.random() * pool.length)];
    },
    applyDamage(attacker: BattleUnit, target: BattleUnit, amount: number, isCrit = false) {
      let dmg = Math.max(1, Math.round(amount));
      if (target.shield > 0) {
        const absorbed = Math.min(target.shield, dmg);
        target.shield -= absorbed;
        dmg -= absorbed;
      }
      if (dmg <= 0) return 0;
      target.hp -= dmg;
      this.pushLog('damage', `${attacker.name} 对 ${target.name} 造成 ${dmg} 伤害${isCrit ? '（暴击！）' : ''}`, attacker.uid, target.uid, dmg);
      if (target.hp <= 0) {
        target.alive = false;
        target.hp = 0;
        this.pushLog('death', `${target.name} 倒下了`, target.uid, undefined, undefined);
      }
      return dmg;
    },
    applyHeal(target: BattleUnit, amount: number) {
      const before = target.hp;
      target.hp = clamp(target.hp + amount, 0, target.maxHp);
      const real = target.hp - before;
      if (real > 0) this.pushLog('heal', `${target.name} 恢复 ${real} 生命`, undefined, target.uid, real);
    },
    castSkill(unit: BattleUnit, skillId: string) {
      const skill = SKILL_MAP[skillId];
      if (!skill) return;
      unit.energy = Math.max(0, unit.energy - 100);
      audio.playSfx('battle_skill');
      this.pushLog('skill', `${unit.name} 施放【${skill.name}】`, unit.uid, undefined, undefined);
      const targets = this.resolveTargets(unit, skill);
      const scaling = skill.scaling;
      targets.forEach((t) => {
        skill.effects.forEach((eff) => {
          this.applyEffect(unit, t, eff, scaling);
        });
      });
    },
    resolveTargets(attacker: BattleUnit, skill: any): BattleUnit[] {
      const enemy = attacker.side === 'player' ? 'enemy' : 'player';
      const ally = attacker.side;
      const allEnemy = this.alive(enemy);
      const allAlly = this.alive(ally);
      switch (skill.targets) {
        case 'self':
          return [attacker];
        case 'enemy': {
          const t = this.pickTarget(attacker);
          return t ? [t] : [];
        }
        case 'enemy_all':
          return allEnemy;
        case 'enemy_row':
          return allEnemy.filter((e) => e.pos % 6 < 3);
        case 'ally_all':
          return allAlly;
        case 'ally_lowest': {
          if (!allAlly.length) return [];
          return [allAlly.reduce((a, b) => (a.hp / a.maxHp < b.hp / b.maxHp ? a : b))];
        }
        default:
          return [];
      }
    },
    applyEffect(attacker: BattleUnit, target: BattleUnit, eff: BattleEffect, scaling: { hp?: number; atk?: number; def?: number }) {
      if (!target.alive) return;
      const chanceOk = eff.chance == null || chance(eff.chance);
      if (!chanceOk) return;
      const val = typeof eff.value === 'number'
        ? eff.value
        : randInt(eff.value.min * 100, eff.value.max * 100) / 100;
      switch (eff.type) {
        case 'damage': {
          const raw = attacker.atk * (scaling.atk ?? 1) + (scaling.hp ?? 0) * attacker.maxHp * 0.05 + (scaling.def ?? 0) * attacker.def * 0.5;
          const isCrit = chance(attacker.crit / 100);
          this.applyDamage(attacker, target, raw, isCrit);
          break;
        }
        case 'heal': {
          const amt = attacker.maxHp * val;
          this.applyHeal(target, Math.round(amt));
          break;
        }
        case 'shield': {
          const amt = Math.round(target.maxHp * val);
          target.shield += amt;
          this.pushLog('buff', `${target.name} 获得 ${amt} 护盾`, undefined, target.uid, amt);
          break;
        }
        case 'buff_atk':
        case 'buff_def':
        case 'buff_spd': {
          target.buffs.push({ type: eff.type, value: val, duration: eff.duration });
          this.pushLog('buff', `${target.name} 获得 ${(val * 100).toFixed(0)}% ${eff.type.replace('buff_', '')} 加成`, undefined, target.uid, val);
          break;
        }
        case 'taunt': {
          target.taunt = eff.duration;
          this.pushLog('buff', `${target.name} 进入嘲讽`, undefined, target.uid, eff.duration);
          break;
        }
        case 'stun':
        case 'silence':
        case 'freeze': {
          target.debuffs.push({ type: eff.type, value: 1, duration: eff.duration });
          this.pushLog('debuff', `${target.name} 被${eff.type === 'stun' ? '眩晕' : eff.type === 'silence' ? '沉默' : '冻结'} ${eff.duration} 回合`, undefined, target.uid, eff.duration);
          break;
        }
        case 'poison':
        case 'burn':
        case 'bleed': {
          target.debuffs.push({ type: eff.type, value: val, duration: eff.duration });
          this.pushLog('debuff', `${target.name} 中了 ${eff.type}，持续 ${eff.duration} 回合`, undefined, target.uid, val);
          break;
        }
      }
    },
    tickBuffs(unit: BattleUnit) {
      unit.buffs = unit.buffs.map((b) => ({ ...b, duration: b.duration - 1 })).filter((b) => b.duration > 0);
      unit.debuffs = unit.debuffs.map((d) => ({ ...d, duration: d.duration - 1 })).filter((d) => d.duration > 0);
      unit.taunt = Math.max(0, unit.taunt - 1);
      // DoT
      unit.debuffs.forEach((d) => {
        if (d.type === 'poison' || d.type === 'burn' || d.type === 'bleed') {
          const dmg = Math.round(unit.maxHp * d.value);
          unit.hp -= dmg;
          this.pushLog('damage', `${unit.name} 受到 ${dmg} 点 ${d.type} 伤害`, undefined, unit.uid, dmg);
          if (unit.hp <= 0) {
            unit.alive = false;
            unit.hp = 0;
            this.pushLog('death', `${unit.name} 倒下了`, unit.uid);
          }
        }
      });
    },
    performAction(unit: BattleUnit) {
      if (!unit.alive) return;
      if (unit.debuffs.some((d) => d.type === 'stun' || d.type === 'freeze')) {
        this.pushLog('system', `${unit.name} 无法行动`);
        return;
      }
      unit.energy = Math.min(100, unit.energy + 25);
      // 选择技能（仅大招，且不在沉默中）
      const ult = unit.skillIds.find((id) => id.includes('ultimate'));
      if (ult && unit.energy >= 100 && !unit.debuffs.some((d) => d.type === 'silence')) {
        this.castSkill(unit, ult);
        return;
      }
      // 其它技能：低能量消耗
      const cycle = unit.skillIds.filter((id) => !id.includes('ultimate'));
      const idx = Math.floor(Math.random() * cycle.length);
      const skillId = cycle[idx] ?? 'sk_atk_basic';
      this.castSkill(unit, skillId);
    },
    step() {
      if (!this.running || this.result !== 'running') return;
      this.tick++;
      // 行动顺序：按速度排序
      const order = this.units.filter((u) => u.alive).slice().sort((a, b) => b.spd - a.spd);
      order.forEach((u) => this.performAction(u));
      // buff 衰减与 DoT
      this.units.filter((u) => u.alive).forEach((u) => this.tickBuffs(u));
      // 胜负判定
      const playerAlive = this.alive('player').length;
      const enemyAlive = this.alive('enemy').length;
      if (playerAlive === 0 && enemyAlive === 0) {
        this.endBattle('win');
      } else if (playerAlive === 0) {
        this.endBattle('lose');
      } else if (enemyAlive === 0) {
        this.endBattle('win');
      }
    },
    endBattle(result: 'win' | 'lose') {
      this.running = false;
      this.result = result;
      const player = usePlayerStore();
      const inventory = useInventoryStore();
      const gacha = useGachaStore();
      audio.playSfx(result === 'win' ? 'victory' : 'defeat');
      if (result === 'win' && this.stage) {
        player.recordClearedStage(this.stage.id);
        const rewards = this.stage.rewards;
        if (rewards.gold) player.addCurrency('gold', rewards.gold);
        if (rewards.exp) player.addCurrency('exp', rewards.exp);
        rewards.items?.forEach((it) => {
          if (it.count <= 0) return;
          if (it.id === 'soul') player.addCurrency('soul', it.count);
          else if (it.id === 'equip_random') inventory.addEquipment();
          else inventory.addItem(it.id, it.count);
        });
        // 玩家英雄获得经验
        const exp = (rewards.exp ?? 0) * 2;
        const heroStore = useHeroStore();
        this.units.filter((u) => u.side === 'player' && u.uid.startsWith('h_') === false).forEach((u) => {
          const inst = heroStore.byId(u.uid);
          if (inst) heroStore.gainExp(inst.uid, exp);
        });
      }
      bus.emit(BusEvents.BattleEnd, result);
      void gacha;
    },
    loop(deltaMs: number) {
      if (!this.running) return;
      this.elapsedMs += deltaMs * this.speed;
      const tickMs = 600;
      while (this.elapsedMs >= tickMs) {
        this.elapsedMs -= tickMs;
        this.step();
      }
    },
    reset() {
      this.running = false;
      this.stage = null;
      this.units = [];
      this.log = [];
      this.tick = 0;
      this.result = 'idle';
      this.elapsedMs = 0;
    },
  },
});