# 过程化生成系统

## procGen.js — 核心词库与生成器

### 设计原则

确定性伪随机：所有生成函数接受 `seed` 参数，使用 `Math.abs(Math.sin(seed * 13337))` 计算随机值。相同 seed 始终产生相同结果，支持存档回放和战斗复现。

### 品质前缀池（QUALITY_PREFIXES）

五阶统一前缀，应用于武器前缀、护具前缀、武学意境词：

```js
const QUALITY_PREFIXES = {
  tian:  ['寂灭', '弑神', '破天', '造化', '太初', '万劫', '归墟', '红莲', '赤皇', '天罚'],
  di:    ['镇岳', '焚城', '乾坤', '九幽', '惊雷', '碎星', '狂澜', '至尊', '金刚', '霸绝'],
  xuan:  ['嗜血', '锋锐', '洗髓', '御风', '流光', '缠绕', '蚀骨', '寒芒', '紫极', '破军'],
  huang: ['坚实', '精炼', '稍快', '厚重', '寻常', '平庸', '蓝纹', '疾走', '耐用', '铁壁'],
  wu:    ['锈蚀', '断裂', '凡铁', '朽烂', '无名', '残缺', '轻薄', '廉价', '钝刃', '朽木'],
}
```

---

### 过程化武学生成（generateProcMartial）

**格式**：`[品质前缀] + [意境词] + [武器/拳掌] + [动作/姿态]`

```
寂灭 · 红莲 · 剑 · 穿云
镇岳 · 寒芒 · 刀 · 横扫
```

**意境词库**（红白美学，48 个）：
- 红系（杀伐）：朱砂、残阳、赤地、屠戮、烈火、断肢、血月、噬魂、炼狱...
- 白系（空灵）：霜雪、浮云、无相、苍白、枯骨、月魄、虚无、忘川、幽冥...

**武器/身体**：jian/dao/qiang/gun/fu/shan/qin/bi/null（徒手）

**动作/姿态**：穿云、横扫、千重、破阵、无痕、归一等

**武学效果**：武学随机附带 `effect`（dot/shield/heal/buff），决定战斗特殊效果。

---

### 过程化心法生成（generateProcXinfa）

**格式**：`[意境前缀] + [心法体] + [后缀]`

```
太虚 · 寒冰诀 · 归元
```

**意境前缀**（5 阶）：继承 QUALITY_PREFIXES

**心法体**（18 个）：寒冰诀、烈焰诀、阴阳册、风云录、厚土经等

**后缀**：归元、通幽、合一、大成等

---

### 过程化敌人生成（generateProcEnemy）

**身份分级**：

| 档位 | 适用等阶 | 身份列表 |
|------|----------|----------|
| low | 无/黄 | 乞丐、流寇、山贼、野狗、杂役、逃兵、喽啰、盗匪、恶霸 |
| mid | 玄/地 | 刀客、剑士、枪手、散修、武僧、术士、刺客、隐士、执事、镖师、死士、长老、萨满... |
| high | 天 | 宗师、剑圣、魔头、剑冢守卫、不知名骸骨、大萨满、圣僧、邪帝、妖后、剑魔、掌门 |

**等阶→身份映射**（RANK_IDENTITY_MAP）：

```js
{ wu: {tier:'low', prefixChance:0.3}, huang:{tier:'low', prefixChance:0.4},
  xuan:{tier:'mid', prefixChance:0.5}, di:{tier:'mid',prefixChance:0.6},
  tian:{tier:'high',prefixChance:0.8} }
```

**词缀系统**（26 个前缀）：
- 瞎眼的 — 精准 -20%
- 双持的 — 20% 双击
- 金色的 — 掉落 ×3
- 痊愈的 — 每回合回复
- 灵体的 — 闪避 +25%
- 尸变的 — 死后复活一次（hp × 0.3）
- 亡灵的 — 暴击 +15%
- 天魔的 / 妖化的 — 攻速 +20%

**境界后缀**（敌人境界，随游戏天数增加出现概率）：
- 入魔 — 攻速 +15%
- 破境 — 属性 +20%
- 天威 — 全属性 +40%

**生成格式**：`[词缀] · [身份] · [境界后缀]`
```
金色的 · 刀客 · [入魔]
痊愈的 · 宗师 · [天威]
```

---

### 过程化地点生成（generateProcLocation）

**格式**：`[前缀] + [主体名] + [后缀]`

```
血染的 · 枯骨 · 冢
迷雾的 · 幽暗 · 林
```

**前缀**（47 个）：荒凉的、繁华的、血色的、静谧的、残破的、血染的、白骨的、瘟疫的...

**后缀（野外）**（14 个）：冢、林、关、驿、墟、洞、潭、荒原、深谷、绝壁、秘径...

**后缀（城镇）**（8 个）：镇、城、寨、堡、宫、阁、观、庙

60% 概率生成野外地点，40% 概率生成城镇地点。

---

### 品质下限校验

天/地阶武学生成后进行品质校验，不满足下限则重新生成（最多 3 次）：

- 天阶：damage mult ≥ 2.0，或有额外战斗效果
- 地阶：damage mult ≥ 1.6，或有额外战斗效果

同时，天/地阶的词缀触发概率分别提升至 85% 和 75%（普通为 50%）。

### 防重历史记录

地点前缀和敌人前缀使用最近 5 个历史记录进行防重，生成时最多尝试 8 次避免重复：

- `_LOC_PREFIX_HISTORY` — 最近生成的 5 个地点前缀
- `_ENEMY_PREFIX_HISTORY` — 最近生成的 5 个敌人词缀前缀

`procGen.js` 使用模块级缓存 `_martialCache` / `_xinfaCache` / `_enemyCache`，避免同一 ID 重复生成不同数据：

```js
const _martialCache = {}
const _xinfaCache = {}
const _enemyCache = {}

export function generateProcMartial (rank, seed) {
  const id = `proc_martial_${rank}_${seed}`
  if (_martialCache[id]) return _martialCache[id]
  const data = buildMartial(rank, seed)
  _martialCache[id] = data
  return data
}
```

`useGame.js` 额外维护 `PROC_MARTIAL_CACHE` / `PROC_XINFA_CACHE` 作为备份，在存档恢复后填充，确保战斗时能查到完整武学数据。

### 过程化商店物品

铁匠铺和药铺同时出售静态物品和过程化物品：

- **铁匠铺**：`generateProcShopWeapon`（武器）/ `generateProcShopArmor`（防具）/ `generateProcShopAccessory`（饰品）
- **药铺**：`generateProcShopDrug`（消耗品）

生成格式：`[品质前缀] + [物品名]`，如「弑神 · 寒月刀」「寂灭 · 大还丹」。

商店物品数量根据区域难度（1~5）动态调整：高难度区域出售更多高阶 proc 物品（1~3 件）。

`generator.js` 的 `getBlacksmithShopItems(diff, seed)` 和 `getPharmacyShopItems(diff, seed)` 混合静态 + proc 物品，返回完整物品对象（含 `id`、`name`、`cost`、`attrs`/`effect`）。

proc 物品购买后通过 `PROC_ITEM_CACHE` 缓存，确保 `useItem()` / `sellItem()` / `equipItem()` 能正常解析。

---

## questGen.js — 过程化任务生成

### 等阶概率系统

根据游戏天数动态调整可用等阶池：

```
day >= 700 → 天阶可用（1% 概率）
day >= 400 → 地阶可用（5% 概率）
day >= 150 → 玄阶可用（15% 概率）
所有天数 → 黄阶（30%）+ 无阶（49%）
```

### 四种任务类型

| 类型 | 描述 | 目标结构 |
|------|------|----------|
| defeat | 讨伐类 | kill N 只特定敌人 |
| collect | 搜寻类 | 采集 N 份物品 |
| deliver | 护送类 | 穿行 N 次危险区 |
| explore | 奇遇类 | 探索某地（仅玄+） |

### 奖励结构

- 金/经验：固定金额 × 击杀数量
- proc_martial：过程化武学（天地阶独有）
- random_item：随机等阶物品（玄黄阶）

### 蝴蝶效应生成

完成天阶任务 50% 概率触发「区域清理」；完成地阶任务 40% 概率触发「建筑敌意」。

---

## 存档中的 proc 数据

过程化武学以 `proc_martial_{rank}_{seed}` 格式存储 ID，战斗时通过 `PROC_MARTIAL_CACHE[id]` 或 `state.procKnownMartials` 查找完整数据。

`explore()` 方法将武学完整 data 对象存入 `procKnownMartials`，确保存档恢复后即使缓存为空也能正常显示。
