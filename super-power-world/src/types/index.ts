// =========================================================
// 核心类型定义
// =========================================================

export type HeroClass = 'tank' | 'warrior' | 'assassin' | 'ranger' | 'mage' | 'support';
export type HeroElement = 'fire' | 'water' | 'wind' | 'thunder' | 'light' | 'dark';
export type HeroFaction = 'celestial' | 'abyss' | 'mecha' | 'beast' | 'spirit' | 'human';
export type HeroRarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'LR' | 'MRC';
export type EquipSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'amulet';

export type GachaPoolType = 'standard' | 'up' | 'collab';

export type Currency = 'gold' | 'gem' | 'soul' | 'stamina' | 'ticket';

export type BattleLogKind = 'attack' | 'skill' | 'damage' | 'heal' | 'buff' | 'debuff' | 'death' | 'system';

export interface HeroBase {
  id: string;
  name: string;
  class: HeroClass;
  element: HeroElement;
  faction: HeroFaction;
  rarity: HeroRarity;
  description: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  skillIds: string[];
  portraitUrl?: string;
}

export interface HeroInstance {
  uid: string;
  heroId: string;
  level: number;
  star: number;
  breakthrough: number;
  exp: number;
  talentPoints: { hp: number; atk: number; def: number; spd: number };
  awaken: number;
  equipment: Partial<Record<EquipSlot, string>>;
  runeSet?: string;
  artifactId?: string;
  locked: boolean;
}

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  energyCost: number;
  scaling: { hp?: number; atk?: number; def?: number };
  targets: 'self' | 'enemy' | 'enemy_row' | 'enemy_all' | 'ally_lowest' | 'ally_all';
  effects: BattleEffect[];
}

export interface BattleEffect {
  type: 'damage' | 'heal' | 'shield' | 'buff_atk' | 'buff_def' | 'buff_spd' | 'taunt' | 'stun' | 'silence' | 'poison' | 'burn' | 'freeze' | 'bleed';
  value: number | { min: number; max: number };
  duration: number;
  chance?: number;
}

export interface StageDef {
  id: number;
  name: string;
  chapter: number;
  level: number;
  recommendedPower: number;
  rewards: { gold?: number; exp?: number; items?: { id: string; count: number }[] };
  waves: WaveDef[];
  bossId?: string;
  unlockLevel?: number;
}

export interface WaveDef {
  enemies: { heroId: string; level: number; star?: number }[];
}

export interface EquipmentDef {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: HeroRarity;
  set?: string;
  stats: Partial<Record<'hp' | 'atk' | 'def' | 'spd' | 'crit' | 'dodge', number>>;
  description: string;
}

export interface RuneSetDef {
  id: string;
  name: string;
  pieceBonus: { count: number; stat: string; value: number; description: string }[];
}

export interface ArtifactDef {
  id: string;
  name: string;
  rarity: HeroRarity;
  passive: string;
  effects: BattleEffect[];
}

export interface GachaPool {
  type: GachaPoolType;
  name: string;
  description: string;
  costCurrency: Currency;
  costAmount: number;
  costMultiple?: number;
  featured?: string[];
  rateUp?: number;
  startDay?: number;
  endDay?: number;
  collabName?: string;
}

export interface BattleLog {
  t: number;
  kind: BattleLogKind;
  source?: string;
  target?: string;
  text: string;
  value?: number;
}

export interface IdleReward {
  gold: number;
  exp: number;
  items: { id: string; count: number }[];
  computedAt: number;
}

export interface ActivityDef {
  id: string;
  dayStart: number;
  dayEnd: number;
  name: string;
  type: 'login' | 'fund' | 'shop_discount' | 'consume_return' | 'limited_task' | 'boss_rush';
  rewards?: { day?: number; items: { id: string; count: number }[] }[];
  description: string;
}

export interface DebugOptions {
  invincible: boolean;
  damageMultiplier: number;
  skipStage: boolean;
  acceleratedTime: boolean;
}

export interface PlayerSave {
  uid: string;
  nickname: string;
  level: number;
  exp: number;
  vipLevel: number;
  vipExp: number;
  gold: number;
  gem: number;
  soul: number;
  stamina: number;
  staminaUpdatedAt: number;
  tickets: Record<GachaPoolType, number>;
  heroes: HeroInstance[];
  inventory: Record<string, number>;
  equipmentInventory: Record<string, { count: number; level: number; refine: number }>;
  formation: { slots: (string | null)[] };
  currentStage: number;
  clearedStages: number[];
  highestStage: number;
  pity: Record<GachaPoolType, { count: number; guaranteedRarity: HeroRarity | null; featuredPity: number }>;
  gachaHistory: { type: GachaPoolType; heroId: string; isFeatured: boolean; at: number }[];
  monthlyCardExpiresAt: number;
  firstChargeClaimed: boolean;
  purchases: { id: string; count: number; claimedAt: number }[];
  achievements: string[];
  activitiesProgress: Record<string, number>;
  unlockedHeroes: string[];
  debug: DebugOptions;
  lastLoginAt: number;
  totalPlayTime: number;
  createdAt: number;
  schemaVersion: number;
}