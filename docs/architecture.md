# 架构设计

## 状态管理：单例 Reactive

整个游戏状态是一个挂载在模块顶层（`useGame.js` 第 31 行）的 Vue `reactive({})` 对象。所有视图通过 `useGame()` 导入并直接读写 `state`：

```js
// src/composables/useGame.js
const state = reactive({})

export function useGame () {
  return {
    state: readonly(state),   // 视图只读
    computed: { ... },         // 派生计算值
    // 核心方法（状态修改入口）
    move, explore, playerAction,
    learnMartial, equipItem, claimQuestReward, ...
  }
}
```

**为什么不用 Pinia/Vuex？** 项目设计时有意选择了零依赖方案，Vue 3 的 `reactive` + 模块级单例完全满足需求，且更轻量。

### computed 计算属性

`useGame.js` 导出一个 `computed` 对象，包含所有派生状态：

| 属性 | 说明 |
|------|------|
| `currentRegion` | 当前所在区域 |
| `currentLocation` | 当前所在地点 |
| `currentDay` | 游戏内天数（clock / 96 + 1） |
| `maxHP / maxQi / maxStamina` | 属性决定的各项上限 |
| `availableMartial` | 可学习的武学（未学会且满足条件） |
| `playerMartials` | 已装备武学 |

---

## 游戏阶段（Game Phases）

`state.phase` 驱动整个游戏的视图切换：

```
init ──→ fate ──→ main ──┬── combat
                         ├── building
                         └── (ending)
```

| 阶段 | 说明 |
|------|------|
| `init` | 首页，选择开始或继续 |
| `fate` | 命格创建，5 道选择题决定初始属性 |
| `main` | 探索/主界面 |
| `combat` | 战斗中（进入 CombatView） |
| `building` | 建筑交互（告示栏/铁匠铺/药铺/酒馆/武馆） |
| `ending` | 死亡或时间耗尽，结局展示 |

每个阶段的切换都触发 `saveToStorage()` 自动存档。

---

## 路由设计（Hash History）

使用 Vue Router Hash History，所有路径以 `#` 开头，适配静态文件部署：

```
/                  → HomeView（首页）
/fate              → FateView（命格创建）
/game/explore      → ExploreView（探索主界面）
/game/combat       → CombatView（战斗）
/game/notice       → NoticeView（告示栏）
/game/blacksmith   → BlacksmithView
/game/pharmacy     → PharmacyView
/game/tavern       → TavernView
/game/martialHall  → MartialHallView
/game/inventory    → InventoryView
/game/martial      → MartialView
/game/character    → CharacterView
/game/map          → MapView
/ending            → EndingView
/admin-login        → AdminLoginView
/admin             → AdminView
```

建筑页面通过 `ExploreView.goToBuilding(type)` 导航，设置 `state.building.type` 后路由跳转。

---

### 自动存档（防抖）

`useGame.js` 内置防抖自动存档（800ms），在以下时机调用 `debouncedSave()`：

- `advanceTurn()` — 每回合推进
- `learnMartial()` / `learnProcMartial()` / `learnXinfa()` — 学会武学/心法
- `equipItem()` / `unequipItem()` — 装备变更
- `claimQuestReward()` — 领取任务奖励
- `move()` — 成功移动（非遭遇战触发，`advanceTurn` 已覆盖）

手动存档：调用 `game.saveGame()` 或 `game.forceSave()`（忽略防抖）。

### 存档字段

```js
// 防抖自动存档
{ phase, player, clock, quests, eventLog, worldEffects, factionHostility, priceMultipliers }

// 精简导出码（32位 + 版本前缀）
SAVE_VERSION = 'v2|'
// 导入时自动迁移 v1 → v2，补全缺失世界字段
```

### 存档版本兼容

存档码以 `v2|` 为版本前缀。旧格式存档（无版本号）导入时自动补全 `factionHostility` 和 `priceMultipliers` 字段。

每次阶段切换时调用 `saveToStorage()`，保存完整 `state` 至 `localStorage['chibai_save_v1']`。

### 导出/导入存档码

`exportSaveCode()` 和 `importSaveCode()` 将存档压缩为 32 位 Base64 短码：

```
[32位内容] + [4位校验和]
```

校验和 = 内容字符码点之和 % 10000

### 存档字段

```js
{
  n: name,           // 角色名
  l: level,          // 等级
  e: exp,            // 经验
  g: gold,           // 银两
  a: attrs,          // 属性
  eq: equipment,     // 装备
  inv: inventory,    // 背包
  ma: martial_arts,  // 已学武学
  c: clock,          // 游戏时钟
  qs: quests,        // 任务进度
  we: worldEffects,  // 世界效果
  fh: factionHostility, // 建筑敌意
  pm: priceMultipliers, // 物价倍率
}
```

### 管理员存档

`localStorage['chibai_admin_v1']` 存储自定义武学/物品，与玩家存档独立。

---

## 模块间依赖关系

```
useGame.js (状态中枢)
  ├── regions.js        — 地点/区域数据
  ├── martialArts.js    — 武学/心法数据库
  ├── enemies.js        — 敌人模板
  ├── items.js          — 物品数据库
  ├── questGen.js       — 过程化任务生成
  ├── procGen.js        — 过程化武学/敌人/地点生成
  ├── generator.js      — 统一随机生成接口
  └── fateQuestions.js  — 命格问题

Views (展示层)
  └── useGame() → state / computed / methods
```

`useGame.js` 不依赖任何 Vue 组件，可独立测试。数据模块之间相互独立，无循环依赖。
