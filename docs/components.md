# UI 组件说明

## 视图组件职责

### HomeView — 首页
入口页面，提供「开始新游戏」和「继续游戏」两个按钮。检测 `localStorage` 中是否有存档。

### FateView — 命格创建
5 道选择题，每题 4 个选项，通过 `game.selectFateAnswer(index)` 记录答案。选择完成后调用 `createCharacter()` 生成角色并跳转。

### GameView — 游戏主容器
包含 `StatusBar`（顶部）和 `BottomNav`（底部），中间显示当前路由的子视图。

### ExploreView — 探索界面
核心交互界面：
- 顶部：区域/地点名称
- 中部：事件日志（最近 30 条）
- 下方：方向移动按钮（↑↓←→）
- 底部：「探索附近」主按钮 + 建筑入口网格 + 跨区域传送

### CombatView — 战斗界面
- 顶部：敌人状态（名称/等级/生命条/描述）
- 中部：战斗日志（自动滚动至底部）
- 中下：玩家三项状态（HP/内力/体力进度条）
- 底部：动作按钮（普通攻击/武学/防御/道具/逃跑）
- 武学列表：点击「武学」后展开，显示所有已学武学及冷却状态

### NoticeView — 告示栏（任务界面）
显示 `state.quests` 中所有未领取的任务，按等阶配色。每张卡片显示：
- 等阶徽章（天/地/玄/黄/无）
- 任务名称与描述
- 目标进度
- 时限倒计时
- 失败惩罚
- 蝴蝶效应提示
- 领取奖励按钮

「查看新任务」按钮每次消耗 1 回合，生成最多 3 条新任务。

### BlacksmithView — 铁匠铺
三个 Tab：
- **购买装备** — 按区域难度显示对应等阶的武器/防具/饰品
- **出售物品** — 出售背包物品和已装备物品（回收 40%）
- **强化装备** — 消耗银两强化装备，随机提升属性

### PharmacyView — 药铺
显示当前区域随机药品，按 `priceMultipliers` 调整价格。检查 `factionHostility` 决定是否拒绝服务。

### TavernView — 酒馆
- 30% 概率发现隐藏地点（显示名称和描述）
- 70% 概率显示随机传闻
- 酒馆是唯一发现隐藏地点的途径

### MartialHallView — 武馆
展示 3 门武学（静态库 + 过程化混合），点击学习后调用 `learnAtMartialHall()`，消耗银两和体力。

### MartialView — 武学与心法
- 已装备武学列表（主武学/备用武学）
- 心法槽位（主心法 + 两个辅助心法）
- 心法共鸣效果显示
- 武学熟练度进度

### InventoryView — 背包
分类显示所有物品，支持装备/使用/出售操作。

### CharacterView — 角色属性
展示所有属性值、装备情况、等级进度。

### MapView — 世界地图
显示 5 大区域，按探索进度高亮当前位置。可点击区域名查看该区域地点列表。

### EndingView — 结局
根据 `state.endingType`（`'death'` 或 `'time'`）显示不同结局画面。

---

## 共享组件

### StatusBar
显示：生命条 / 内力条 / 体力条 / 游戏天数 / 区域名
固定在 GameView 顶部，不随子视图变化。

### BottomNav
5 个导航项：探索 / 背包 / 武学 / 任务 / 角色
当前路由高亮。点击跳转对应路由。

---

## 样式规范

所有视图组件均使用 `scoped` 样式，通过 CSS Variables 引用全局颜色：

```css
/* 按钮 */
.btn, .btn-red, .btn-ghost, .btn-sm, .btn-lg

/* 等级标签 */
.rank-tag.rank-tian / rank-di / rank-xuan / rank-huang / rank-wu

/* 文本色 */
.text-red, .text-gold, .text-purple, .text-blue, .text-gray

/* 进度条 */
.bar-wrap / .bar-fill / .bar-hp / .bar-qi / .bar-stamina
```

布局规范：
- 视图容器使用 `height: 100%; display: flex; flex-direction: column`
- 内容区使用 `flex: 1; overflow-y: auto`
- 固定头部/尾部使用 `flex-shrink: 0`
