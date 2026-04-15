# 数据模块参考

## items.js — 物品数据库（139 件）

所有物品均为静态导出，通过 `getItemById(id)` 查找。

```js
// 武器
{ id, name, type: 'weapon', rank, weaponType, damage, attrs: { power, defense, ... }, cost }

// 防具
{ id, name, type: 'armor', rank, attrs: { defense, hp, ... }, cost }

// 饰品
{ id, name, type: 'accessory', rank, attrs: { luck, dodge, ... }, cost }

// 消耗品
{ id, name, type: 'consumable', rank, effect: { heal_hp, heal_qi, heal_stamina, cure_poison, ... }, cost }

// 材料
{ id, name, type: 'material', rank, cost }

// 残卷
{ id, name, type: 'scroll', rank, scrollType: 'martial'|'xinfa', learnFrom: '...' }
```

`type` 字段是判断物品类别的唯一依据。消耗品 effect 支持多效果叠加。

---

## martialArts.js — 武学与心法

### 武学结构

```js
{
  id: string,
  name: string,
  type: 'external' | 'internal' | 'unarmed',
  weapon: 'dao' | 'jian' | 'qiang' | 'gun' | 'fu' | 'shan' | 'qin' | 'bi' | null,
  rank: 'tian' | 'di' | 'xuan' | 'huang' | 'wu',
  damage: number,           // 伤害倍率（基础伤害 × damage）
  cooldown: number,         // 冷却回合
  staminaCost: number,
  qiCost: number,
  effect: {                 // 可选：额外效果
    type: 'dot',            // dot | shield | heal | buff
    turns?: number,
    damage?: number,
    value?: number,
  },
  mastery: [                // 熟练度加成
    { level: 1, bonus: { crit_rate: 0.05 } },
    { level: 5, bonus: { power: 3 } },
  ],
  requirements?: { level?: number, attrs?: { [key]: number } },
}
```

### 心法结构

```js
{
  id: string,
  name: string,
  rank: 'tian' | 'di' | 'xuan' | 'huang' | 'wu',
  element: 'fire' | 'ice' | 'yin' | 'yang' | 'wind' | 'earth',
  effect: { type: 'resonance', bonus: { damage: 0.2 } },
}
```

### 心法共鸣系统

配对同元素的心法可触发共鸣效果：

| 元素 | 共鸣名 | 效果 |
|------|--------|------|
| fire + fire | 灼热 | 攻击伤害 +20% |
| ice + ice | 寒彻 | 敌方攻速 -15% |
| yin + yang | 阴阳交汇 | 所有属性 +5% |
| wind + wind | 轻灵 | 闪避 +15% |
| earth + earth | 厚重 | 防御 +15% |
| 中正 | 中正平和 | 每回合回复 3 点生命 |

---

## enemies.js — 敌人模板（31 种）

```js
{
  id: string,
  name: string,
  rank: 'tian' | 'di' | 'xuan' | 'huang' | 'wu',
  hp: [min, max],           // 生成时随机范围
  power: [min, max],
  qi: [min, max],
  agility: [min, max],
  gold: [min, max],         // 击杀掉落
  exp: [min, max],          // 击杀经验
  skill?: {                 // 特殊技能
    name: string,
    damage: number,
    chance: number,         // 触发概率 0~1
    effect?: { ... },
  },
}
```

敌人按区域难度生成，低难度区域只生成低阶敌人。

---

## regions.js — 区域与地点（5 区 × 24 地点）

```js
{
  id: string,               // 'zhongyuan' | 'xiyu' | 'nanjiang' | 'beihan' | 'donghai'
  name: string,
  difficulty: number,       // 1~3，影响敌人/物品等级
  locations: [ ... ],       // 24 个地点
}

location = {
  id: string,
  name: string,             // 过程化生成，如 "荒凉的枯骨冢"
  type: string,             // town | city | village | mountain | dungeon | wilderness ...
  connections: { north?, south?, east?, west? },
  buildings: string[],       // ['notice', 'tavern', ...]
  difficulty: number,        // 独立于区域的难度修正
  travelTo?: string[],       // 可跨区域传送的目标区域
  hidden?: {                 // 隐藏地点发现条件
    condition: string,
    desc: string,
  },
}
```

---

## fateQuestions.js — 命格创建

5 道选择题，每题 4 个选项，每个选项指定属性增减。题目在 `FATE_QUESTIONS` 数组中定义，`BASE_ATTRS` 决定初始值（均为 10）。

---

## procGen.js — 过程化生成引擎

### 词库

- **QUALITY_PREFIXES** — 五阶品质前缀（武器/护具/武学共用）
- **MARTIAL_MOOD_RED / MARTIAL_MOOD_WHITE** — 红白意境词库（48 个）
- **ENEMY_IDENTITIES** — 分 tier 的敌人身份词（low/mid/high）
- **ENEMY_PREFIXES** — 敌人名号词缀（26 个，含 buff 效果）
- **LOCATION_PREFIXES** — 地点前缀（47 个）
- **LOCATION_TERRAINS** — 地点后缀（town 8 个 / wild 14 个）

### 核心函数

| 函数 | 说明 |
|------|------|
| `generateProcMartial(rank, seed)` | 生成过程化武学，存入内部缓存 |
| `generateProcXinfa(rank, seed)` | 生成过程化心法，存入内部缓存 |
| `generateProcEnemy(rank, day, seed)` | 生成过程化敌人（身份 + 词缀） |
| `generateProcLocation(type, seed)` | 生成过程化地点名称 |
| `getProcMartial(id)` | 从缓存获取武学数据 |

所有函数使用 `Math.abs(Math.sin(seed * 13337))` 确定性伪随机，同一种子始终返回相同结果。

---

## questGen.js — 过程化任务系统

### 任务等阶

```js
const QUEST_TIER_CONFIG = {
  tian:  { chance: 0.01, minDay: 700 },
  di:    { chance: 0.05, minDay: 400 },
  xuan:  { chance: 0.15, minDay: 150 },
  huang: { chance: 0.30, minDay: 0 },
  wu:    { chance: 0.49, minDay: 0 },
}
```

### 任务类型

| 类型 | 生成器 | 说明 |
|------|--------|------|
| combat | `generateCombatQuest` | 讨伐敌人，击杀 N 只 |
| scavenge | `generateScavengeQuest` | 采集物品 N 份 |
| delivery | `generateDeliveryQuest` | 护送/传递，穿行 N 次危险区 |
| mystery | `generateMysteryQuest` | 探索（仅玄级以上），触发奇遇 |

### 任务结构

```js
{
  id: string,
  name: string,              // 显示名称，含等阶标签
  desc: string,              // 完整描述
  type: 'defeat' | 'collect' | 'deliver' | 'explore',
  tier: 'tian' | 'di' | 'xuan' | 'huang' | 'wu',
  goals: [{
    type: 'kill' | 'collect' | 'guard' | 'explore',
    target: string,          // 敌人ID/物品名/地点名
    enemyData?: object,      // procGen 生成的敌人数据
    enemyName?: string,
    locationName?: string,
    count: number,
    current: number,
    completed: boolean,
  }],
  rewards: [                 // 奖励列表
    { type: 'gold', val: number },
    { type: 'exp', val: number },
    { type: 'proc_martial', val: id, martialName, martialData },
    { type: 'random_item', val: rank },
  ],
  failPenalty: { type, desc, ... },
  expire_hours: number,
  created_turn: number,
  completed: boolean,
  claimed: boolean,
  expired: boolean,
  chain: { series, index } | null,
  worldEffect: { type, ... } | null,
}
```

### 蝴蝶效应

完成高阶任务后触发世界状态变化：

| 类型 | 效果 |
|------|------|
| `area_clear` | 指定区域 100 小时内不遇敌 |
| `faction_hostile` | 药铺/铁匠铺/酒馆拒绝服务 72 小时 |

---

## generator.js — 统一随机生成接口

对 `procGen.js` 和静态数据库的统一封装，屏蔽 proc/static 差异。

| 函数 | 说明 |
|------|------|
| `generateMartial(diff, seed, useProc)` | 生成武学（proc 或 static） |
| `generateMartialsForHall(diff, count, seed)` | 生成武馆展示武学 |
| `generateXinfa(diff, seed)` | 生成心法 |
| `generateEnemy(regionDiff, seed)` | 生成敌人 |
| `generateQuestForRegion(regionId, seed)` | 在区域内生成任务（静态模板） |
| `generateHiddenLocation(seed)` | 生成隐藏地点 |

`useGame.js` 战斗系统调用 `generator.js`，不直接依赖 `procGen.js`。
