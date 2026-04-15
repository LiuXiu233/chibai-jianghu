# 赤白江湖 (Chibai Jianghu)

一款基于 Vue 3 + Vite 构建的武侠文字冒险游戏。玩家在 1000 天（96000 刻）的旅途内，通过探索、战斗、任务、武学修炼，成长为一代宗师。

---

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问 http://localhost:5173

**生产构建：**
```bash
npm run build
npm run preview
```

---

## 游戏内容

### 核心玩法
- **探索** — 在 5 大区域、120+ 地点中移动探索，触发随机战斗或发现隐藏地点
- **战斗** — 回合制战斗，支持普通攻击、武学、内力防御、道具、逃跑
- **任务** — 告示栏随机生成讨伐/搜寻/护送/奇遇任务，含等阶系统和蝴蝶效应
- **武学修炼** — 学习刀/剑/枪/棍/拳等外功及心法，触发共鸣效果
- **装备系统** — 武器/防具/饰品，支持强化升级

### 五阶品质体系
| 等阶 | 颜色 | 说明 |
|------|------|------|
| 天 | 红 | 最强等阶，需游戏内 700+ 天解锁 |
| 地 | 金 | 高级，需 400+ 天 |
| 玄 | 紫 | 中级，需 150+ 天 |
| 黄 | 蓝 | 初级，默认全开 |
| 无 | 灰 | 最低，基础敌人/物品 |

### 世界事件
- **红潮日** — 2% 概率触发，黑市价格减半，遇敌率翻倍
- **物价波动** — 区域商品价格 20% 涨跌
- **建筑敌意** — 完成任务后可导致药铺/铁匠铺对你关闭服务

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 路由 | Vue Router 4 (Hash History) |
| 构建 | Vite 5 |
| 样式 | 原生 CSS（CSS Variables，无框架） |
| 状态 | Vue `reactive()` 单例（无 Pinia/Vuex） |
| 持久化 | localStorage + Base64 存档码 |

---

## 项目结构

```
src/
├── main.js                 # Vue 应用入口
├── App.vue                 # 根组件（含页面过渡动画）
├── style.css               # 全局样式、按钮、进度条、动画
├── router/
│   └── index.js           # 路由配置（Hash History）
├── composables/
│   └── useGame.js          # 全局游戏状态（核心，~1600 行）
├── components/
│   ├── StatusBar.vue       # 顶部状态栏（HP/内力/体力/时钟）
│   └── BottomNav.vue        # 底部导航
├── views/                  # 页面组件（共 20 个）
│   ├── HomeView.vue        # 首页
│   ├── FateView.vue        # 命格创建（5 道选择题）
│   ├── GameView.vue        # 游戏主容器
│   ├── ExploreView.vue     # 探索界面
│   ├── CombatView.vue      # 战斗界面
│   ├── CharacterView.vue   # 角色属性
│   ├── InventoryView.vue   # 背包
│   ├── MartialView.vue     # 武学/心法
│   ├── NoticeView.vue      # 告示栏（任务）
│   ├── MapView.vue         # 世界地图
│   ├── BlacksmithView.vue  # 铁匠铺
│   ├── PharmacyView.vue    # 药铺
│   ├── TavernView.vue      # 酒馆
│   ├── MartialHallView.vue # 武馆
│   └── EndingView.vue      # 结局
└── data/                   # 静态数据（无 API 调用）
    ├── items.js            # 139 件物品
    ├── martialArts.js      # 50 门武学 + 18 套心法
    ├── enemies.js          # 31 种敌人
    ├── regions.js          # 5 大区域 × 24 地点
    ├── fateQuestions.js    # 命格问题配置
    ├── procGen.js          # 过程化生成引擎（词库扩充）
    ├── questGen.js         # 过程化任务生成系统
    ├── generator.js        # 统一随机生成接口
    └── questTemplates.js   # 固定任务模板（兼容）
```

---

## 存档系统

- **自动存档** — 每次游戏阶段切换时自动保存至 `localStorage`
- **手动导出/导入** — 32 位短码 + 4 位校验和，便于分享
- **管理员存档** — 自定义武学/物品独立存储于 `chibai_admin_v1`

---

## 二次开发

### 添加新武学

在 `src/data/martialArts.js` 中添加对象：

```js
{
  id: 'custom_skill',
  name: '名称',
  type: 'external',       // external | internal | unarmed
  weapon: 'jian',          // dao | jian | qiang | gun | fu | shan | qin | bi | null
  rank: 'xuan',            // tian | di | xuan | huang | wu
  damage: 1.5,
  cooldown: 5,
  staminaCost: 15,
  qiCost: 10,
  effect: { type: 'dot', turns: 3, damage: 5 }, // 可选
  mastery: [
    { level: 1, bonus: { power: 2 } },
    { level: 5, bonus: { crit_rate: 0.1 } },
  ],
}
```

### 添加新物品

在 `src/data/items.js` 中添加对象：

```js
{
  id: 'custom_item',
  name: '物品名',
  type: 'consumable',     // weapon | armor | accessory | consumable | material | scroll
  rank: 'huang',
  cost: 200,
  attrs: { power: 5 },    // 仅装备类
  effect: { heal_hp: 30 }, // 仅消耗品类
}
```

### 添加新区域/地点

在 `src/data/regions.js` 的 `REGIONS` 数组中添加区域，在 `generateLocations()` 函数中添加地点生成逻辑。

### 修改世界事件触发逻辑

在 `src/composables/useGame.js` 的 `checkWorldEvents()` 方法中调整概率或添加新事件类型。

---

## 等阶颜色规范（PRD）

所有 UI 中的等阶显示必须严格遵循以下颜色映射：

```
天阶 → #FF0000 (红)     用于：敌人名称、装备标签、武学标签、任务卡片边框
地阶 → #B8860B (金)     用于：奖励显示、边框高亮
玄阶 → #6B238E (紫)     用于：玄级物品标记
黄阶 → #1E3A8A (蓝)     用于：黄级物品标记
无阶 → #888888 (灰)     用于：最低级物品/敌人
```
