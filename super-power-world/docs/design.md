# 超能世界 · Super Power World — 设计文档

> 一款基于浏览器的卡牌合并 + 挂机战斗手游完整复刻，单机本地版。
> 技术栈：**Vite + TypeScript + Phaser 3 + Pinia + GSAP + IndexedDB**，Canvas 程序化生成 Q 版美术。

---

## 1. 项目概述

| 项目 | 内容 |
| --- | --- |
| 名称 | 超能世界 · Super Power World |
| 类型 | 单机 H5 卡牌合并 + 挂机战斗手游 |
| 目标平台 | 现代浏览器（移动端竖屏 9:16 优先，PC 浏览器兼容） |
| 玩法核心 | 卡牌合并升星 + 全自动挂机战斗 + 三层抽卡 + 多线养成 |
| 内容规模 | 100+ 英雄 / 6 阵营 / 6 元素 / 6 职业 / 36 关卡 / 30 天活动周期 |

---

## 2. 技术选型

| 层 | 选型 | 理由 |
| --- | --- | --- |
| 构建 | Vite 8 + TypeScript 7 | 启动快，HMR 体验好 |
| 游戏引擎 | Phaser 3 | 2D Canvas/Sprite/动画/场景管理成熟 |
| 状态管理 | Pinia（可独立于 Vue） | 轻量、响应式、可在 Phaser 之外统一管理游戏数据 |
| 动画辅助 | GSAP | Tween 之外补充序列动画 |
| 持久化 | IndexedDB（idb 封装） | 海量数据、事务化、无网络依赖 |
| 美术 | Canvas 程序化生成 | 无需外部美术资源，启动即可玩 |

---

## 3. 项目结构

```
super-power-world/
├── index.html                    # 入口 HTML
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 依赖
├── public/                       # 静态资源
├── docs/
│   └── design.md                 # 本文档
└── src/
    ├── main.ts                   # 启动入口（初始化 Pinia + Phaser）
    ├── style.css                 # 全局样式
    ├── vite-env.d.ts             # 环境声明
    ├── types/
    │   └── index.ts              # 全局类型定义
    ├── core/
    │   ├── rng.ts                # 随机数 / 工具
    │   ├── eventBus.ts           # 全局事件总线
    │   ├── db.ts                 # IndexedDB 封装
    │   ├── persistence.ts        # 存档序列化
    │   ├── formulas.ts           # 战斗 / 养成 / 抽卡公式
    │   ├── assetGen.ts           # 程序化生成 Q 版立绘
    │   └── audio.ts              # Web Audio 程序化音效与 BGM
    ├── data/
    │   ├── skills.ts             # 技能定义
    │   ├── heroes.ts             # 英雄定义（自动生成 100+）
    │   ├── equipment.ts          # 装备 / 符文 / 神器
    │   ├── stages.ts             # 36 关卡（含 BOSS）
    │   └── activities.ts         # 卡池 / 活动 / 道具定义
    ├── stores/
    │   ├── playerStore.ts        # 玩家货币 / VIP / 编队
    │   ├── heroStore.ts          # 英雄实例 / 升星 / 突破 / 天赋
    │   ├── inventoryStore.ts     # 物品 / 装备实例
    │   ├── gachaStore.ts         # 三层抽卡 + Pity
    │   ├── battleStore.ts        # 战斗状态机 + AI + Buff/Debuff
    │   ├── mergeStore.ts         # 合成网格
    │   ├── shopStore.ts          # 商城 / VIP 经验
    │   └── activityStore.ts      # 活动进度 / 奖励领取
    └── game/
        ├── Game.ts               # Phaser 配置
        ├── ui/widgets.ts         # UI 通用组件
        └── scenes/
            ├── BootScene.ts      # 启动加载 / 存档恢复
            ├── MainScene.ts      # 主界面
            ├── StageScene.ts     # 关卡选择
            ├── BattleScene.ts    # 自动战斗 / 实时日志
            ├── HeroScene.ts      # 英雄列表 / 编队 / 详情
            ├── MergeScene.ts     # 合成合并玩法
            ├── GachaScene.ts     # 召唤大厅（含动画）
            ├── ShopScene.ts      # 商城
            ├── ActivityScene.ts  # 活动中心
            ├── DebugScene.ts     # 完整调试工具
            └── UIScene.ts        # 顶层 UI 浮层
```

---

## 4. 数据模型

### 4.1 核心类型（src/types/index.ts）

- `HeroClass`：`tank | warrior | assassin | ranger | mage | support`
- `HeroElement`：`fire | water | wind | thunder | light | dark`
- `HeroFaction`：`celestial | abyss | mecha | beast | spirit | human`
- `HeroRarity`：`N | R | SR | SSR | UR | LR | MRC`
- `EquipSlot`：`weapon | armor | helmet | boots | ring | amulet`
- `GachaPoolType`：`standard | up | collab`
- `Currency`：`gold | gem | soul | stamina | ticket`

### 4.2 玩家存档（PlayerSave）

包含昵称、等级、经验、VIP、金币、钻石、英魂、体力、召唤券、英雄实例、物品库存、装备实例、阵容、当前关卡、已通关列表、Pity、抽卡历史、月卡到期、首充标记、累计消费、成就、活动进度、解锁英雄、调试选项、登录时间、累计在线、创建时间、schema 版本。

### 4.3 英雄实例（HeroInstance）

`uid / heroId / level / star / breakthrough / exp / talentPoints(hp,atk,def,spd) / awaken / equipment(6 槽) / runeSet / artifactId / locked`

---

## 5. 数值体系

### 5.1 养成公式

```
属性 = 基础属性 × 星级倍率[star] × 突破倍率[break] × 等级倍率[1 + (level-1)*0.08]
       + 天赋加成 + 装备加成
```

- 星级倍率：`[1, 1.0, 1.25, 1.55, 1.95, 2.5, 3.2, 4.1]`
- 突破倍率：`[1, 1.0, 1.1, 1.25, 1.45]`（最高 5 阶）
- 升级所需经验：`50 * level * (1 + level * 0.15)`
- 升星所需狗粮：`star` 个同星级本体
- 突破所需：`gold = star*2000, soul = star*5`
- 天赋加点：`gold = 1000 + n*100`，上限 50

### 5.2 战斗公式

```
伤害 = max(1, (atk + atk*scaling) × 100 / (100 + max(0, def - atk*0.2)))
暴击伤害 = 伤害 × (1 + crit%/100)
DoT = maxHp × 比例
```

- 暴击率：基础 5% + 装备加成
- 闪避率：基础 5% + 装备加成
- 嘲讽、眩晕、沉默、冻结、中毒、灼烧、流血：状态机驱动
- 行动顺序：按 `spd` 降序
- 技能触发：能量 100 时释放终极技能

### 5.3 抽卡概率

| 稀有度 | 常驻 | UP 池 | 联动 |
| --- | --- | --- | --- |
| N | 45% | 45% | 39% |
| R | 30% | 30% | 30% |
| SR | 15% | 15% | 15% |
| SSR | 7% | 12% | 15% |
| UR | 2.5% | 3.5% | 4.5% |
| LR | 0.4% | 0.4% | 0.6% |
| MRC | 0.1% | 0.1% | 0.1% |

**Pity 保底**：
- 常驻池：80 抽必出 UR
- UP 池：80 抽必出 SSR
- 联动池：60 抽必出 UR

### 5.4 英雄生成

每个 `职业 × 元素 × 阵营` 组合 3-5 个英雄 → 共 108+ 兜底至 120+，符合"接近原版规模"。

---

## 6. 系统设计

### 6.1 战斗系统（battleStore）

- **入场**：根据玩家阵容 + 关卡敌方阵容构建 `BattleUnit[]`
- **状态机**：每 tick 按 `spd` 排序行动，能量满时释放大招
- **Buff/Debuff**：每回合衰减，DoT 结算，致死判定
- **胜负**：任意一侧全灭即结束，发放奖励
- **速度**：1x / 2x / 3x，可暂停 / 跳过
- **日志**：实时滚动最近 6 条
- **调试**：`invincible` / `damageMultiplier` / `acceleratedTime` / `skipStage`

### 6.2 合成系统（mergeStore）

- 3×3 网格
- 拖拽：同 baseId + 同 star 合并 → star+1（上限 8）
- 不匹配：提示"必须是同星同英雄"
- 一键收集：把 grid 中的卡片送入英雄列表

### 6.3 抽卡系统（gachaStore）

- **三层卡池**：常驻 / UP / 联动
- **保底**：Pity 计数器；80 抽必出；UP 池 80 抽保底出 UP SSR
- **动画**：抽中后放大卡片 + 命名 + 稀有度
- **消耗**：钻石 / 召唤券

### 6.4 商城系统（shopStore）

- 资源类（金币袋/钻石/体力/英魂/装备箱）
- 抽卡券类
- 礼包类（首充/月卡/基金/新手/豪华）
- 日 / 周 / 月限购
- 模拟付费：所有商品以钻石结算，无需真支付

### 6.5 活动系统（activityStore）

30 天周期：
- 每日登录
- 成长基金
- 商城折扣
- 累计消费返还（500/1500/3000/6000 四档）
- 七日任务
- 首领入侵入口

### 6.6 养成系统

- **等级**：经验升级，N~MRC 等级上限 30~160
- **星级**：1-8 星，消耗同星狗粮
- **突破**：1-5 阶，金币 + 英魂
- **天赋**：4 维度，每点金币递增
- **装备**：6 槽位，10 套套装，N~MRC 7 档稀有度
- **神器**：5 个传说级被动
- **符文**：10 套 2 件/4 件加成

---

## 7. 美术与音频

### 7.1 程序化美术（assetGen.ts）

- 256×256 Canvas，**Q 版头大身小**造型
- 元素主色 + 阵营徽记 + 职业轮廓
- 稀有度边框颜色（N~MRC）
- 缓存：以 `heroId` 为 key 复用

### 7.2 程序化音频（audio.ts）

- Web Audio API
- BGM：随机 8 度音阶循环 + 自动重排
- 音效：click / merge / gacha / battle_hit / battle_skill / victory / defeat / levelup / purchase / coin

---

## 8. 存档与恢复

- `idb` 封装 IndexedDB
- 启动时加载 `player` 记录，反序列化到所有 store
- 每 30 秒自动保存 + `beforeunload` 触发保存
- 提供导出 JSON / 导入 JSON / 清空存档（调试面板内）

---

## 9. 调试工具

`DebugScene` 提供 4 个分页：
- **资源**：金币/钻石/英魂/体力/召唤券/VIP 经验/解锁全部英雄
- **英雄**：升级/升星/突破/解锁 LR/MRC/一键满级天赋
- **战斗**：跳关 / 无敌 / 伤害倍率 / 加速时间 / 跳过 / 直接胜利 / 导入导出
- **事件**：模拟抽卡 / 模拟购买 / 模拟领取 / 显示玩家数据

---

## 10. 启动与运行

```bash
cd super-power-world
npm install
npm run dev   # http://localhost:5173/
```

或构建生产产物：

```bash
npm run build
npm run preview
```

---

## 11. UI 规格

- **画布**：720×1280（9:16 竖屏）
- **响应式**：浏览器任意比例下保持 9:16 黑边
- **触摸**：禁用双指缩放 / 文本选择
- **字体**：PingFang SC / Microsoft YaHei fallback
- **配色**：深空蓝 (`#0e0e1e`) + 主色 `#6ad1ff` + 强调 `#c084fc` + 金 `#fbbf24`

---

## 12. 扩展方向

- PvP / 公会：当前仅做接口骨架，可加 `pvpStore.ts`
- 真支付：把 `shopStore.buy` 中模拟支付部分替换为接 SDK
- 国际化：`playerStore.locale` + 多语言资源文件
- 远程资源：把 `assetGen` 替换为加载 CDN 资源

---

## 13. 注意事项

- **音频自动播放限制**：首次需用户交互后才能播放（点击按钮触发 `audio.resume()`）
- **IndexedDB**：隐私模式下不可用，UI 需要降级提示
- **Phaser 性能**：超过 200 渲染对象需开启对象池
- **iOS Safari**：触摸事件与音频上下文需要延迟初始化