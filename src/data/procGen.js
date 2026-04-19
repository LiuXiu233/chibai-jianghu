// 过程化随机生成引擎 (Procedural Generation Engine)
// 生成：武学名称/数值、心法名称/数值、敌人名称/配置、地点名称

// ============================================================
// 工具函数
// ============================================================
function pick (arr, seed) {
  return arr[Math.abs(Math.sin(seed * 9999 + 1) * 10000) % arr.length]
}

function pickN (arr, n, seed) {
  const copy = [...arr].sort(() => Math.abs(Math.sin(seed + copy.length)) - 0.5)
  return copy.slice(0, Math.min(n, copy.length))
}

function seededRand (seed) {
  return Math.abs(Math.sin(seed * 13337 + seed * 7))
}

function range (min, max, seed) {
  return min + Math.floor(seededRand(seed) * (max - min + 1))
}

// ---- 防重历史记录（最近 N 个已使用的词）----
const _LOC_PREFIX_HISTORY = []
const _ENEMY_PREFIX_HISTORY = []

// ---- 非线性敌人数值缩放（替代线性 1+(day-1)/500）----
function getEnemyScaling (day) {
  // 分段缩放：day 1-100 前期线性，day 100-300 对数中期，day 300-700 后期线性，day 700+ 渐近上限
  const t = Math.min(1, (day - 1) / 700)
  if (t < 0.14) return t / 0.14 * 0.2
  if (t < 0.43) return 0.2 + (t - 0.14) / 0.29 * 0.3
  if (t < 1.0) return 0.5 + (t - 0.43) / 0.57 * 0.3
  return 0.8 + Math.log(1 + (day - 700) * 0.005) * 0.08
}

// ---- 武学品质下限校验（天/地阶）----
function validateMartialQuality (martial) {
  const floor = { tian: { mult: 2.0, effectChance: 0.6 }, di: { mult: 1.6, effectChance: 0.5 } }
  const cfg = floor[martial.rank]
  if (!cfg) return true
  const multOk = (martial.effects?.[0]?.mult || 0) >= cfg.mult
  const effectOk = martial.combat_effects && Object.keys(martial.combat_effects).length > 0
  return multOk || effectOk
}

// ============================================================
// 词库
// ============================================================

// ============================================================
// 5 阶品质前缀池（武器/护具/武学统一等阶前缀）
// ============================================================
export const QUALITY_PREFIXES = {
  tian:  ['寂灭', '弑神', '破天', '造化', '太初', '万劫', '归墟', '红莲', '赤皇', '天罚'],
  di:    ['镇岳', '焚城', '乾坤', '九幽', '惊雷', '碎星', '狂澜', '至尊', '金刚', '霸绝'],
  xuan:  ['嗜血', '锋锐', '洗髓', '御风', '流光', '缠绕', '蚀骨', '寒芒', '紫极', '破军'],
  huang: ['坚实', '精炼', '稍快', '厚重', '寻常', '平庸', '蓝纹', '疾走', '耐用', '铁壁'],
  wu:    ['锈蚀', '断裂', '凡铁', '朽烂', '无名', '残缺', '轻薄', '廉价', '钝刃', '朽木'],
}

// --- 武学意境词（红白美学）---
// 红色系（杀伐、阳刚、业报）
const MARTIAL_MOOD_RED = [
  '朱砂', '残阳', '赤地', '屠戮', '胭脂', '烈火', '断肢', '红枭',
  '贪狼', '罪孽', '业火', '杜鹃', '血月', '枯血', '噬魂', '炼狱',
  '寂灭', '弑神', '破天', '霸天', '焚天', '断魂', '灭世', '修罗',
]
// 白色系（空灵、阴柔、虚无）
const MARTIAL_MOOD_WHITE = [
  '霜雪', '浮云', '无相', '苍白', '枯骨', '月魄', '虚无', '忘川',
  '寒鸦', '般若', '涅槃', '浮生', '洗礼', '尘埃', '轮回', '幽冥',
  '苍穹', '鸿蒙', '太初', '混沌', '万象', '九幽', '八荒', '六合',
]
const MARTIAL_MOOD = [...MARTIAL_MOOD_RED, ...MARTIAL_MOOD_WHITE]

// 分类动词
const EXTERNAL_VERBS = ['刀', '枪', '斧', '棍', '剑', '鞭', '钩', '戟', '锤', '戟']
const INTERNAL_VERBS = ['剑', '扇', '琴', '笔', '掌', '指', '心', '气', '意', '神']
const UNARMED_VERBS = ['拳', '掌', '腿', '指', '肘', '膝', '摔', '擒', '截', '劈']

// 武学后缀
const MARTIAL_SUFFIX_EXTERNAL = [
  '之怒', '之狂', '之裂', '之斩', '之破', '之势', '之击', '之诀',
  '绝杀', '必杀', '一式', '二式', '三击', '连环', '八方', '无双',
  '夺命', '追魂', '索命', '裂魄', '碎骨', '断筋', '削骨', '穿心',
]
const MARTIAL_SUFFIX_INTERNAL = [
  '之寂', '之韵', '之寂灭', '之寂灭', '之幻', '之殇', '之寂灭', '之虚',
  '无痕', '无形', '无声', '无息', '化境', '通神', '归元', '合一',
  '经脉诀', '气海诀', '内息诀', '真元诀', '意境', '幻象', '意境',
]
const MARTIAL_SUFFIX_UNARMED = [
  '之刚', '之柔', '之刚柔', '之威', '之猛', '之暴', '之刚猛', '之霸道',
  '无敌', '无匹', '无双', '万变', '千化', '一决', '百变', '制敌',
]

// 外功随机词缀（外功特效）
const EXTERNAL_AFFIXES = [
  { name: '锋利', desc: '伤害+5%', effect: { damage_bonus: 0.05 } },
  { name: '重击', desc: '伤害+10%', effect: { damage_bonus: 0.10 } },
  { name: '流血', desc: '造成持续伤害', effect: { dot: true } },
  { name: '破甲', desc: '无视15%防御', effect: { pierce: 0.15 } },
  { name: '粉碎', desc: '伤害+15%', effect: { damage_bonus: 0.15 } },
  { name: '连环', desc: '攻击2次', effect: { multi: 2 } },
  { name: '三连', desc: '攻击3次', effect: { multi: 3 } },
]
// 内功随机词缀
const INTERNAL_AFFIXES = [
  { name: '灼烧', desc: '内功附加灼烧', effect: { dot: true, attr: 'qi' } },
  { name: '寒霜', desc: '降低敌人闪避', effect: { debuff_dodge: 10 } },
  { name: '经脉紊乱', desc: '敌人内伤', effect: { inner_wound: true } },
  { name: '内伤', desc: '持续损失生命', effect: { dot: true, attr: 'qi' } },
  { name: '封脉', desc: '减少敌人内力回复', effect: { silence: true } },
  { name: '噬魂', desc: '内功伤害+20%', effect: { qi_damage_bonus: 0.2 } },
]
// 空手随机词缀
const UNARMED_AFFIXES = [
  { name: '连击', desc: '连击2次', effect: { multi: 2 } },
  { name: '点穴', desc: '敌人无法行动1回合', effect: { paralyze: 1 } },
  { name: '震穴', desc: '造成内伤', effect: { inner_wound: true } },
  { name: '破防', desc: '无视防御', effect: { pierce: 0.2 } },
  { name: '三击', desc: '攻击3次', effect: { multi: 3 } },
  { name: '万钧', desc: '伤害大幅提升', effect: { damage_bonus: 0.25 } },
]

// 武学消耗类型
const EXTERNAL_CONSUME = { type: 'stamina', base: 15 }
const INTERNAL_CONSUME = { type: 'qi', base: 20 }
const UNARMED_CONSUME = { type: 'stamina', base: 12 }

// --- 心法 ---
// 前缀（意境·属性倾向）
const XINFA_PREFIXES = [
  // 力量倾向
  { name: '烈阳', element: 'yang', primary: 'power', desc: '至阳刚烈' },
  { name: '摧山', element: 'yang', primary: 'power', desc: '山崩地裂' },
  { name: '霸道', element: 'yang', primary: 'power', desc: '唯我独尊' },
  { name: '金刚', element: 'heavy', primary: 'constitution', desc: '金刚不坏' },
  { name: '巨灵', element: 'heavy', primary: 'constitution', desc: '力可擎天' },
  // 气海倾向
  { name: '归墟', element: 'yin', primary: 'qi', desc: '万气归墟' },
  { name: '玄冥', element: 'yin', primary: 'qi', desc: '玄冥之气' },
  { name: '太虚', element: 'neutral', primary: 'qi', desc: '太虚无形' },
  { name: '紫霄', element: 'light', primary: 'qi', desc: '紫霄雷霆' },
  { name: '九幽', element: 'yin', primary: 'qi', desc: '九幽玄天' },
  { name: '碧海', element: 'yin', primary: 'qi', desc: '碧海潮生' },
  // 身法倾向
  { name: '凌波', element: 'light', primary: 'agility', desc: '凌波微步' },
  { name: '无痕', element: 'light', primary: 'agility', desc: '来去无痕' },
  { name: '幻影', element: 'light', primary: 'agility', desc: '如影随形' },
  { name: '惊鸿', element: 'light', primary: 'agility', desc: '翩若惊鸿' },
  { name: '流光', element: 'light', primary: 'agility', desc: '流光掠影' },
  // 根骨/悟性倾向
  { name: '浩然', element: 'neutral', primary: 'constitution', desc: '正气浩然' },
  { name: '纯阳', element: 'yang', primary: 'constitution', desc: '纯阳无极' },
  { name: '太阴', element: 'yin', primary: 'comprehension', desc: '太阴幽光' },
  { name: '混元', element: 'neutral', primary: 'comprehension', desc: '混元一气' },
  { name: '天机', element: 'neutral', primary: 'comprehension', desc: '天机不可泄' },
  { name: '天璇', element: 'neutral', primary: 'comprehension', desc: '天璇灵枢' },
  { name: '贪狼', element: 'yin', primary: 'luck', desc: '贪狼噬月' },
  { name: '七杀', element: 'yang', primary: 'luck', desc: '七杀临凡' },
]
// 主体（载体·基础量级）
const XINFA_BODIES = [
  { name: '功', tier_boost: 1.0 },
  { name: '经', tier_boost: 1.1 },
  { name: '诀', tier_boost: 0.9 },
  { name: '录', tier_boost: 0.95 },
  { name: '典', tier_boost: 1.15 },
  { name: '卷', tier_boost: 0.85 },
  { name: '志', tier_boost: 1.0 },
  { name: '法', tier_boost: 1.05 },
  { name: '道', tier_boost: 1.2 },
  { name: '气', tier_boost: 0.9 },
]
// 后缀（奥义·特殊效果）
const XINFA_SUFFIXES_NORMAL = [
  { name: '之悟', combat: { comprehension_bonus: 5 }, desc: '悟性永久提升5点' },
  { name: '之护', combat: { damage_reduction: 0.1 }, desc: '受到伤害-10%' },
  { name: '之盾', combat: { damage_reduction: 0.15 }, desc: '受到伤害-15%' },
  { name: '之息', combat: { qi_regen: 3 }, desc: '每刻回复3点内力' },
  { name: '之愈', combat: { hp_regen: 2 }, desc: '每刻回复2%最大生命' },
  { name: '之怒', combat: { damage_bonus: 0.1 }, desc: '伤害+10%' },
  { name: '之柔', combat: { dodge_bonus: 8 }, desc: '闪避+8%' },
  { name: '之刚', combat: { defense_bonus: 15 }, desc: '防御+15' },
  { name: '之快', combat: { agility_bonus: 8 }, desc: '身法+8' },
  { name: '之命', combat: { luck_bonus: 5 }, desc: '幸运+5' },
]
const XINFA_SUFFIXES_ELITE = [
  { name: '之反震', combat: { counter_chance: 0.2, counter_dmg: 0.15 }, desc: '被攻击时20%概率反击15%伤害' },
  { name: '之连绵', combat: { cost_reduction: 0.1 }, desc: '所有招式消耗-10%' },
  { name: '之空灵', combat: { unarmed_bonus: 0.15 }, desc: '徒手时全属性+15%' },
  { name: '之破甲', combat: { pierce: 0.15 }, desc: '外功无视15%防御' },
  { name: '之吸血', combat: { lifesteal: 0.1 }, desc: '造成伤害的10%转化为生命' },
  { name: '之噬魂', combat: { qi_drain: 5 }, desc: '攻击时吸取敌人5点内力' },
  { name: '之惊鸿', combat: { agility_bonus: 15, dodge_bonus: 5 }, desc: '身法+15，闪避+5%' },
  { name: '之金刚', combat: { defense_bonus: 30, damage_reduction: 0.1 }, desc: '防御+30，受到伤害-10%' },
  { name: '之天威', combat: { crit_dmg_bonus: 0.3 }, desc: '暴击伤害+30%' },
  { name: '之不灭', combat: { lethal_resist: true }, desc: '死亡时复活（30%HP）' },
]

// --- 敌人 ---
// 敌人词缀（Buff/Debuff）
// 敌人名号词缀（PRD 扩充版）
const ENEMY_PREFIXES = [
  // 原有保留
  { name: '嗜血的', buff: 'lifesteal', val: 0.05 },
  { name: '疯狂的', buff: 'damage_bonus', val: 0.1 },
  { name: '冷静的', buff: 'defense_bonus', val: 0.1 },
  { name: '中毒的', buff: 'dot', val: 5 },
  { name: '狂暴的', buff: 'crit_bonus', val: 10 },
  { name: '残废的', buff: 'speed_bonus', val: 0.15 },
  { name: '愚钝的', buff: 'hp_bonus', val: 0.2 },
  { name: '狡诈的', buff: 'dodge_bonus', val: 0.1 },
  { name: '强壮的', buff: 'hp_bonus', val: 0.3 },
  { name: '迅捷的', buff: 'speed_bonus', val: 0.2 },
  { name: '入魔的', buff: 'all_bonus', val: 0.15 },
  { name: '破境的', buff: 'all_bonus', val: 0.2 },
  { name: '天悟的', buff: 'comprehension_bonus', val: 10 },
  { name: '血债的', buff: 'damage_bonus', val: 0.15 },
  // PRD 新增
  { name: '瞎眼的', buff: 'accuracy_down', val: 0.2 },
  { name: '双持的', buff: 'double_strike', val: 0.2 },
  { name: '垂死的', buff: 'hp_bonus', val: 0.5, danger: true },
  { name: '金色的', buff: 'gold_bonus', val: 3.0 },
  { name: '无头的', buff: 'speed_bonus', val: 0.25 },
  { name: '痊愈的', buff: 'hp_regen', val: 3 },
  { name: '灵体的', buff: 'dodge_bonus', val: 0.25 },
  { name: '天魔的', buff: 'all_bonus', val: 0.3 },
  { name: '妖化的', buff: 'crit_dmg_bonus', val: 0.3 },
  { name: '尸变的', buff: 'hp_bonus', val: 0.4 },
  { name: '亡灵的', buff: 'speed_bonus', val: 0.15, dodge_bonus: 0.15 },
]

// 敌人身份主体 — 按等级分档（PRD 扩充版）
const ENEMY_IDENTITIES = {
  low: [
    { name: '乞丐', style: 'unarmed', weapon: null },
    { name: '流寇', style: 'external', weapon: 'dao' },
    { name: '山贼', style: 'external', weapon: 'fu' },
    { name: '野狗', style: 'unarmed', weapon: null },
    { name: '杂役', style: 'unarmed', weapon: null },
    { name: '逃兵', style: 'external', weapon: 'qiang' },
    { name: '喽啰', style: 'external', weapon: 'dao' },
    { name: '盗匪', style: 'external', weapon: 'dao' },
    { name: '恶霸', style: 'external', weapon: 'gun' },
  ],
  mid: [
    { name: '刀客', style: 'external', weapon: 'dao' },
    { name: '剑士', style: 'internal', weapon: 'jian' },
    { name: '枪手', style: 'external', weapon: 'qiang' },
    { name: '棍僧', style: 'external', weapon: 'gun' },
    { name: '散修', style: 'mixed', weapon: null },
    { name: '武僧', style: 'external', weapon: null },
    { name: '术士', style: 'internal', weapon: 'qin' },
    { name: '护卫', style: 'external', weapon: 'jian' },
    { name: '刺客', style: 'external', weapon: 'dao' },
    { name: '隐士', style: 'internal', weapon: 'shan' },
    { name: '门徒', style: 'mixed', weapon: null },
    { name: '弟子', style: 'mixed', weapon: null },
    { name: '执事', style: 'internal', weapon: null },
    { name: '镖师', style: 'external', weapon: 'qiang' },
    { name: '死士', style: 'external', weapon: 'dao' },
    { name: '书生', style: 'internal', weapon: 'shan' },
    { name: '阴阳师', style: 'internal', weapon: 'qin' },
    { name: '邪修', style: 'internal', weapon: 'bi' },
    { name: '长老', style: 'internal', weapon: null },
    { name: '萨满', style: 'internal', weapon: null },
  ],
  high: [
    { name: '宗师', style: 'mixed', weapon: null },
    { name: '剑圣', style: 'internal', weapon: 'jian' },
    { name: '魔头', style: 'internal', weapon: null },
    { name: '隐士', style: 'internal', weapon: 'shan' },
    { name: '剑冢守卫', style: 'external', weapon: 'jian' },
    { name: '不知名骸骨', style: 'unarmed', weapon: null },
    { name: '大萨满', style: 'internal', weapon: null },
    { name: '圣僧', style: 'internal', weapon: null },
    { name: '邪帝', style: 'internal', weapon: null },
    { name: '妖后', style: 'internal', weapon: 'qin' },
    { name: '剑魔', style: 'external', weapon: 'jian' },
    { name: '掌门', style: 'mixed', weapon: null },
  ],
}

// 等阶 → 身份档位映射
const RANK_IDENTITY_MAP = {
  wu:   { tier: 'low', prefixChance: 0.3 },
  huang: { tier: 'low', prefixChance: 0.4 },
  xuan:  { tier: 'mid', prefixChance: 0.5 },
  di:    { tier: 'mid', prefixChance: 0.6 },
  tian:  { tier: 'high', prefixChance: 0.8 },
}

// 敌人后缀（境界）
const ENEMY_SUFFIXES = [
  { name: '', multiplier: 1.0 },
  { name: '[小成]', multiplier: 1.1 },
  { name: '[大成]', multiplier: 1.2 },
  { name: '[圆满]', multiplier: 1.35 },
  { name: '[入魔]', multiplier: 1.5, bonus: { damage_bonus: 0.2 } },
  { name: '[破境]', multiplier: 1.6, bonus: { all_bonus: 0.15 } },
  { name: '[悟道]', multiplier: 1.7, bonus: { qi_regen: 5 } },
  { name: '[天威]', multiplier: 2.0, bonus: { crit_dmg_bonus: 0.5 } },
]

// --- 武器前缀（含品质等阶前缀）---
const WEAPON_PREFIXES = [
  // 原有保留
  // 外功
  { name: '沉重的', attrs: { power: 8 }, type: 'external' },
  { name: '锯齿的', attrs: { power: 5 }, special: 'lifesteal', special_val: 0.08, type: 'external' },
  { name: '百炼的', attrs: { power: 12 }, type: 'external' },
  { name: '寒铁的', attrs: { power: 10, agility: 3 }, type: 'external' },
  { name: '血染的', attrs: { power: 8, luck: 3 }, special: 'lifesteal', special_val: 0.1, type: 'external' },
  { name: '霸道的', attrs: { power: 15 }, type: 'external' },
  // 内功
  { name: '附灵的', attrs: { qi: 10 }, type: 'internal' },
  { name: '共鸣的', attrs: { qi: 8, comprehension: 3 }, type: 'internal' },
  { name: '温润的', attrs: { qi: 12, qi_regen: 2 }, type: 'internal' },
  { name: '寒月的', attrs: { qi: 15, agility: 5 }, type: 'internal' },
  { name: '玄冰的', attrs: { qi: 10, constitution: 5 }, type: 'internal' },
  { name: '紫电的', attrs: { qi: 18, agility: 8 }, type: 'internal' },
  // PRD 品质前缀（天/地/玄/黄/无 统一前缀，插入到词库供随机抽取）
  ...QUALITY_PREFIXES.tian.map(n => ({ name: `${n}的`, attrs: { power: 22, qi: 22 }, special: 'lifesteal', special_val: 0.15, type: 'external' })),
  ...QUALITY_PREFIXES.di.map(n => ({ name: `${n}的`, attrs: { power: 16, qi: 16 }, special: 'lifesteal', special_val: 0.1, type: 'external' })),
  ...QUALITY_PREFIXES.xuan.map(n => ({ name: `${n}的`, attrs: { power: 10, qi: 10 }, type: 'external' })),
  ...QUALITY_PREFIXES.huang.map(n => ({ name: `${n}的`, attrs: { power: 5 }, type: 'external' })),
  ...QUALITY_PREFIXES.wu.map(n => ({ name: `${n}的`, attrs: { power: 2 }, type: 'external' })),
]

// --- 护具前缀（含品质等阶前缀）---
const ARMOR_PREFIXES = [
  // 原有保留
  { name: '坚硬的', attrs: { constitution: 8, defense: 5 } },
  { name: '牢固的', attrs: { constitution: 5, defense: 8 } },
  { name: '轻便的', attrs: { agility: 5, defense: 3 } },
  { name: '厚重的', attrs: { constitution: 12, defense: 10 } },
  { name: '灵巧的', attrs: { agility: 8, dodge: 3 } },
  { name: '幸运的', attrs: { luck: 8 } },
  { name: '强化的', attrs: { constitution: 6, defense: 6, agility: 3 } },
  // PRD 品质前缀
  ...QUALITY_PREFIXES.tian.map(n => ({ name: `${n}的`, attrs: { constitution: 18, defense: 15 } })),
  ...QUALITY_PREFIXES.di.map(n => ({ name: `${n}的`, attrs: { constitution: 12, defense: 10 } })),
  ...QUALITY_PREFIXES.xuan.map(n => ({ name: `${n}的`, attrs: { constitution: 8, defense: 6 } })),
  ...QUALITY_PREFIXES.huang.map(n => ({ name: `${n}的`, attrs: { constitution: 4, defense: 3 } })),
  ...QUALITY_PREFIXES.wu.map(n => ({ name: `${n}的`, attrs: { constitution: 1, defense: 1 } })),
]

// --- 地点 ---
const LOCATION_PREFIXES = [
  // 原有保留
  '荒凉的', '繁华的', '血色的', '静谧的', '残破的', '古老的',
  '神秘的', '阴森的', '苍凉的', '幽深的', '血腥的', '飘渺的',
  '破败的', '荒废的', '寂静的', '偏僻的', '幽静的', '萧瑟的',
  '破落的', '废弃的', '偏僻的',
  // PRD 新增
  '血染的', '迷雾的', '神魔的', '极寒的', '极热的', '极干的',
  '鬼哭的', '磷火的', '白骨的', '落日的', '残月的', '雷霆的',
  '瘟疫的', '封印的', '禁忌的', '不归的', '万丈的', '千仞的',
  '枯骨的', '亡魂的', '诅咒的', '遗弃的', '沦陷的', '湮灭的',
]
// 地形/主体分类
const LOCATION_TERRAINS = {
  town: [
    { name: '镇', buildings: ['blacksmith', 'pharmacy', 'tavern'] },
    { name: '城', buildings: ['blacksmith', 'pharmacy', 'tavern', 'martialHall'] },
    { name: '寨', buildings: ['blacksmith', 'notice'] },
    { name: '堡', buildings: ['notice', 'blacksmith'] },
    { name: '宫', buildings: ['martialHall', 'notice'] },
    { name: '阁', buildings: ['notice'] },
    { name: '观', buildings: ['notice'] },
    { name: '庙', buildings: ['notice'] },
  ],
  wild: [
    { name: '冢', buildings: [] },
    { name: '林', buildings: [] },
    { name: '关', buildings: ['notice'] },
    { name: '驿', buildings: ['notice', 'tavern'] },
    { name: '墟', buildings: [] },
    { name: '荒原', buildings: [] },
    { name: '古战场', buildings: [] },
    { name: '乱葬岗', buildings: [] },
    { name: '矿脉', buildings: [] },
    { name: '祭坛', buildings: [] },
    { name: '石碑林', buildings: [] },
    { name: '残殿', buildings: [] },
    { name: '驿站', buildings: ['notice', 'tavern'] },
  ],
}
// 兼容旧格式：展平为数组供 pick() 使用
const _flatTerrains = [...LOCATION_TERRAINS.town, ...LOCATION_TERRAINS.wild]

// --- 随机心法描述模板 ---
const XINFA_DESCRIPTIONS = [
  '传闻此功书写于白骨之上，字迹如干涸血迹。修炼者气海如深渊，内功伤害大幅提升。',
  '一卷记载了极端追求速度的残篇，白色的书页上只有红色的小人奔跑。',
  '此功源自上古宗门，修炼者举手投足间有风雷相伴，威势惊人。',
  '一篇晦涩难懂的口诀，只有极高悟性之人方能窥见其中奥妙。',
  '据说此功是一位陨落宗师临终前以血书写，字字珠玑，蕴含毕生心血。',
  '古籍残卷，边缘已烧毁大半，只余核心心法口诀尚可辨认。',
  '一位云游僧人遗落的禅定之法，修炼后可大幅提升根基。',
  '刻于山壁上的古老文字，岁月侵蚀已难辨认，需极高悟性方能参悟。',
]

// ============================================================
// 武学生成
// ============================================================

export function generateProcMartial (rank = 'huang', seed = Date.now()) {
  // 品质校验：天/地阶最多重新生成 3 次
  let martial = null
  let attempts = 0
  do {
    martial = _buildProcMartial(rank, seed + attempts * 7777)
    attempts++
  } while (!validateMartialQuality(martial) && attempts < 3)
  return martial
}

function _buildProcMartial (rank, seed) {
  const r = (offset = 0) => seededRand(seed + offset)
  const rankMult = { tian: 2.0, di: 1.6, xuan: 1.3, huang: 1.0, wu: 0.7 }[rank] || 1.0
  const typeRoll = r(0)
  let type, verbs, suffixes, affixes, consume

  if (typeRoll < 0.45) {
    type = 'external'; verbs = EXTERNAL_VERBS; suffixes = MARTIAL_SUFFIX_EXTERNAL; affixes = EXTERNAL_AFFIXES; consume = EXTERNAL_CONSUME
  } else if (typeRoll < 0.8) {
    type = 'internal'; verbs = INTERNAL_VERBS; suffixes = MARTIAL_SUFFIX_INTERNAL; affixes = INTERNAL_AFFIXES; consume = INTERNAL_CONSUME
  } else {
    type = 'unarmed'; verbs = UNARMED_VERBS; suffixes = MARTIAL_SUFFIX_UNARMED; affixes = UNARMED_AFFIXES; consume = UNARMED_CONSUME
  }

  const mood = pick(MARTIAL_MOOD, seed + 1)
  const verb = pick(verbs, seed + 2)
  const suffix = pick(suffixes, seed + 3)
  const name = `【${mood}】${verb}${suffix}`

  // 随机词缀：天/地阶提高触发概率
  const effectChance = rank === 'tian' ? 0.85 : rank === 'di' ? 0.75 : 0.5
  const affix = r(4) > (1 - effectChance) ? pick(affixes, seed + 5) : null

  // 基础属性
  const power_base = Math.floor(10 * rankMult)
  const qi_base = Math.floor(8 * rankMult)
  const attrVal = type === 'external' ? { power: power_base } : type === 'internal' ? { qi: qi_base } : { power: Math.floor(8 * rankMult), constitution: Math.floor(5 * rankMult) }

  // 消耗
  const consumeBase = consume.base * rankMult
  const consumeType = consume.type
  const consumeVal = type === 'unarmed' ? Math.floor(consumeBase * 0.8) : Math.floor(consumeBase)

  // 效果计算
  const mult = { tian: 2.5, di: 2.0, xuan: 1.7, huang: 1.4, wu: 1.1 }[rank] || 1.4
  const useAttr = type === 'external' ? 'power' : 'qi'

  const effects = []
  let martialEffect = { type: 'damage', attr: useAttr, mult, consume: { [consumeType]: consumeVal } }
  if (affix) {
    if (affix.effect.dot) {
      martialEffect.dot = { dmg: Math.floor(5 * rankMult), dur: 3 }
    }
    if (affix.effect.pierce) martialEffect.pierce = affix.effect.pierce
    if (affix.effect.multi) martialEffect.multi = affix.effect.multi
    if (affix.effect.paralyze) martialEffect.paralyze = affix.effect.paralyze
    if (affix.effect.inner_wound) martialEffect.debuff = 'inner_wound'
  }
  effects.push(martialEffect)

  // 描述
  const descTemplates = [
    `${mood}意境下的${verb}绝学，${suffix}，威势惊人。`,
    `一招${suffix}，有${mood}之势，非同凡响。`,
    `${mood}之中蕴含的${verb}之道，一击必杀。`,
  ]
  const desc = pick(descTemplates, seed + 10)

  return {
    id: `proc_ma_${seed}_${Math.abs(seed % 99999)}`,
    name,
    rank,
    type: type === 'external' ? 'external' : type === 'internal' ? 'internal' : 'unarmed',
    weapon: type === 'external' ? (pick(['dao', 'qiang', 'gun', 'fu'], seed + 6)) : type === 'internal' ? (pick(['jian', 'shan', 'qin', 'bi'], seed + 6)) : null,
    unarmedMult: type === 'unarmed' ? 1.3 + r(7) * 0.4 : 1,
    attrs: attrVal,
    effects,
    desc,
    passive: affix ? `${affix.name}：${affix.desc}` : null,
    combat_effects: affix ? affix.effect : {},
    learn_req: { comprehension: { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }[rank] || 10 },
    proc: true,
    itemData: {
      rank,
      attrs: attrVal,
      special: affix?.name === '流血' ? 'lifesteal' : affix?.name === '破甲' ? 'pierce' : null,
      special_val: affix?.name === '流血' ? 0.1 : affix?.name === '破甲' ? 0.15 : null,
    },
  }
}

// ============================================================
// 心法生成
// ============================================================

export function generateProcXinfa (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)

  const prefix = pick(XINFA_PREFIXES, seed + 1)
  const body = pick(XINFA_BODIES, seed + 2)

  // 根据等阶决定后缀数量
  const suffixCount = rank === 'tian' ? 2 : rank === 'di' ? 1 : rank === 'xuan' ? 1 : 0
  const allSuffixes = [...XINFA_SUFFIXES_NORMAL, ...XINFA_SUFFIXES_ELITE]
  const usedSuffixes = []
  const suffixes = []
  for (let i = 0; i < suffixCount; i++) {
    let s = pick(allSuffixes, seed + 3 + i)
    while (usedSuffixes.includes(s.name)) s = pick(allSuffixes, seed + 3 + i + 100)
    usedSuffixes.push(s.name)
    suffixes.push(s)
  }

  // 名称
  const suffixText = suffixes.map(s => s.name).join('')
  const name = `【${prefix.name}】【${body.name}】${suffixText}`
  const element = prefix.element

  // 视觉
  const visualMap = { tian: 'glow-red', di: 'gold-title', xuan: 'purple', huang: 'blue', wu: 'normal' }
  const visual = visualMap[rank]

  // 分类
  const catMap = { power: 'combat', qi: 'combat', constitution: 'foundation', agility: 'survival', comprehension: 'foundation', luck: 'survival' }
  const category = catMap[prefix.primary] || 'foundation'

  // 属性
  const base = { tian: 1.0, di: 0.8, xuan: 0.6, huang: 0.4, wu: 0.2 }[rank] || 0.4
  const attrs = {}
  attrs[prefix.primary] = Math.floor(10 * base * body.tier_boost)
  if (r(20) > 0.5) {
    const secondary = { power: 'qi', qi: 'power', constitution: 'power', agility: 'constitution', comprehension: 'qi', luck: 'constitution' }[prefix.primary]
    if (secondary) attrs[secondary] = Math.floor(5 * base * body.tier_boost)
  }
  // 生命/内力加成
  if (prefix.primary === 'constitution' || prefix.primary === 'power') attrs.hp = Math.floor(80 * base * body.tier_boost)
  if (prefix.primary === 'qi') attrs.qi = Math.floor(60 * base * body.tier_boost)

  // 战斗效果
  const combat_effects = {}
  for (const s of suffixes) {
    Object.assign(combat_effects, s.combat)
  }

  // 描述
  const descTpl = pick(XINFA_DESCRIPTIONS, seed + 30)
  const desc = `「${name}」${descTpl}`

  return {
    id: `proc_xf_${seed}_${Math.abs(seed % 99999)}`,
    name,
    rank,
    element,
    visual,
    category,
    attrs,
    passive: suffixes.map(s => `${s.name}：${s.desc}`).join('；'),
    combat_effects,
    learn_req: { comprehension: { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }[rank] || 10 },
    desc,
    proc: true,
  }
}

// ============================================================
// 敌人生成（动态）
// ============================================================

export function generateProcEnemy (rank = 'huang', day = 1, seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const rankMult = { tian: 2.0, di: 1.6, xuan: 1.3, huang: 1.0, wu: 0.7 }[rank] || 1.0

  // 非线性时间演化缩放
  const dayScale = 1 + getEnemyScaling(day)
  const scale = rankMult * Math.min(dayScale, 2.8)

  // 随机词缀（按等阶映射表决定前缀出现概率）+ 防重
  const rankCfg = RANK_IDENTITY_MAP[rank] || { tier: 'low', prefixChance: 0.4 }
  const hasPrefix = r(1) > (1 - rankCfg.prefixChance)
  let enemyPrefix = null
  if (hasPrefix) {
    let attempts = 0
    do {
      enemyPrefix = pick(ENEMY_PREFIXES, seed + 1 + attempts * 3)
      attempts++
    } while (_ENEMY_PREFIX_HISTORY.includes(enemyPrefix.name) && attempts < 8)
    _ENEMY_PREFIX_HISTORY.push(enemyPrefix.name)
    if (_ENEMY_PREFIX_HISTORY.length > 5) _ENEMY_PREFIX_HISTORY.shift()
  }

  // 从对应档位抽取身份
  const identityTier = ENEMY_IDENTITIES[rankCfg.tier]
  const identity = pick(identityTier, seed + 2)

  const hasSuffix = r(3) > 0.3
  const enemySuffix = hasSuffix ? pick(ENEMY_SUFFIXES, seed + 3) : { name: '', multiplier: 1.0 }

  const finalScale = scale * enemySuffix.multiplier

  // 基础属性（按身份风格）
  const style = identity.style
  const baseHP = { external: 80, internal: 60, unarmed: 70, mixed: 70 }[style] || 70
  const basePower = { external: 15, internal: 8, unarmed: 12, mixed: 10 }[style] || 10
  const baseQi = { external: 0, internal: 20, unarmed: 10, mixed: 10 }[style] || 10
  const baseAgility = { external: 12, internal: 15, unarmed: 18, mixed: 14 }[style] || 14
  const baseConst = { external: 10, internal: 8, unarmed: 14, mixed: 10 }[style] || 10

  const hp = Math.floor(baseHP * finalScale * (0.9 + r(4) * 0.2))
  const power = Math.floor(basePower * finalScale * (0.9 + r(5) * 0.2))
  const qi = Math.floor(baseQi * finalScale * (0.9 + r(6) * 0.2))
  const agility = Math.floor(baseAgility * finalScale * (0.9 + r(7) * 0.2))
  const constitution = Math.floor(baseConst * finalScale * (0.9 + r(8) * 0.2))

  // 奖励（受前缀影响：金色的敌人击杀掉落 ×3）
  const goldMult = enemyPrefix?.buff === 'gold_bonus' ? enemyPrefix.val : 1.0
  const gold = Math.floor(10 * finalScale * goldMult)
  const exp = Math.floor(20 * finalScale)

  // 名称
  const prefixText = enemyPrefix ? enemyPrefix.name : ''
  const suffixText = enemySuffix.name
  const fullName = `${prefixText}${identity.name}${suffixText}`

  // 描述
  const descTpl = [
    `${fullName}，${rank === 'tian' ? '威压惊人，令人窒息' : rank === 'di' ? '气势不凡，绝非等闲' : rank === 'xuan' ? '目光如炬，修为不低' : '平平无奇，不足为惧'}`,
    `${identity.name}，${enemySuffix.name ? '修为已至' + enemySuffix.name.replace(/[\[\]]/g, '') : '江湖中的普通' + identity.name}`,
  ]

  // 生成 procMartial 作为敌人的武学（1-2个）
  const martialCount = { tian: 3, di: 2, xuan: 2, huang: 1, wu: 1 }[rank] || 1
  const martialRankMap = { tian: ['tian', 'di'], di: ['di', 'xuan'], xuan: ['xuan', 'huang'], huang: ['huang', 'wu'], wu: ['wu'] }
  const martialRanks = martialRankMap[rank] || ['huang']
  const martialIds = []
  for (let i = 0; i < Math.min(martialCount, 2); i++) {
    const mRank = martialRanks[Math.floor(r(i * 7) * martialRanks.length)]
    const m = generateProcMartial(mRank, seed + 100 + i * 500)
    martialIds.push(m.id)
  }

  // 生成 procXinfa（地级以上）
  let xinfaId = null
  if (['tian', 'di', 'xuan'].includes(rank)) {
    const xinfaRank = rank === 'tian' ? 'di' : rank === 'di' ? 'xuan' : 'huang'
    const xf = generateProcXinfa(xinfaRank, seed + 200)
    xinfaId = xf.id
  }

  return {
    id: `proc_enemy_${seed}_${Math.abs(seed % 99999)}`,
    name: fullName,
    rank,
    hp,
    power,
    qi,
    agility,
    constitution,
    luck: Math.floor(5 * finalScale),
    current_hp: hp,
    max_hp: hp,
    reward_gold: gold,
    reward_exp: exp,
    desc: pick(descTpl, seed + 20),
    martial_id: martialIds[0],
    style: identity.style,
    weapon: identity.weapon,
    // 额外属性
    _extraMartials: martialIds.slice(1),
    _extraXinfaId: xinfaId,
    _buff: enemyPrefix ? { buff: enemyPrefix.buff, val: enemyPrefix.val } : null,
    _suffixBonus: enemySuffix.bonus || null,
    boss: rank === 'tian',
    // 多阶段血条（天阶敌人）
    phases: rank === 'tian' ? [
      { threshold: 1.0, desc: '', speed_mult: 1.0, multi_attack: false },
      { threshold: 0.5, desc: '浑身浴血，威势不减', speed_mult: 1.3, multi_attack: false },
      { threshold: 0.2, desc: '濒死狂化，不死不休', speed_mult: 1.5, multi_attack: true },
    ] : null,
    proc: true,
  }
}

// 生成 procMartial/procXinfa 缓存（避免战斗重复生成）
const _martialCache = {}
const _xinfaCache = {}
const _enemyCache = {}

export function getProcMartial (rank, seed) {
  const key = `${rank}_${seed}`
  if (!_martialCache[key]) _martialCache[key] = generateProcMartial(rank, seed)
  return _martialCache[key]
}

export function getProcXinfa (rank, seed) {
  const key = `${rank}_${seed}`
  if (!_xinfaCache[key]) _xinfaCache[key] = generateProcXinfa(rank, seed)
  return _xinfaCache[key]
}

export function getProcEnemy (rank, day, seed) {
  const key = `${rank}_${day}_${seed}`
  if (!_enemyCache[key]) _enemyCache[key] = generateProcEnemy(rank, day, seed)
  return _enemyCache[key]
}

// ============================================================
// 武器随机前缀生成
// ============================================================

export function generateProcWeapon (baseWeaponId, rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const prefixPool = WEAPON_PREFIXES.filter(p => r(offset + 99) > 0.3)
  if (!prefixPool.length) return null
  const prefix = pick(prefixPool, seed + 99)
  return prefix
}

// ============================================================
// 护具随机前缀生成
// ============================================================

export function generateProcArmor (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const prefix = pick(ARMOR_PREFIXES, seed + 88)
  const baseDefense = { tian: 40, di: 28, xuan: 18, huang: 10, wu: 5 }[rank] || 10
  return {
    prefix,
    defense: Math.floor(baseDefense * (0.8 + r(77) * 0.4)),
  }
}

// ============================================================
// 地点随机生成
// ============================================================

export function generateProcLocation (regionId = 'zhongyuan', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  // 防重：最多尝试 8 次避免与历史重复
  let prefix = null
  let attempts = 0
  do {
    prefix = pick(LOCATION_PREFIXES, seed + 1 + attempts * 7)
    attempts++
  } while (_LOC_PREFIX_HISTORY.includes(prefix) && attempts < 8)
  _LOC_PREFIX_HISTORY.push(prefix)
  if (_LOC_PREFIX_HISTORY.length > 5) _LOC_PREFIX_HISTORY.shift()

  // 野外/城镇比例约 6:4
  const terrainPool = r(88) > 0.4 ? _flatTerrains : LOCATION_TERRAINS.wild
  const terrain = pick(terrainPool, seed + 2)
  const name = `${prefix}${terrain.name}`
  const townTypes = ['镇', '城', '寨', '堡', '宫', '阁', '观', '庙', '驿']
  const isTown = townTypes.some(t => terrain.name.includes(t))
  return {
    name,
    type: isTown ? 'town' : terrain.name.includes('山') ? 'mountain' : terrain.name.includes('古') || terrain.name.includes('冢') ? 'dungeon' : 'wilderness',
    buildings: terrain.buildings,
    desc: `这里是${name}。`,
    proc: true,
  }
}

// ============================================================
// 随机掉落生成（基于 procMartial 的装备）
// ============================================================

// 武器类型词库（procGen 内置，不依赖 items.js 避免循环依赖）
const WEAPON_NAMES = {
  dao: ['狂刀', '烈刀', '血刀', '寒月刀', '玄冰刀'],
  jian: ['霜剑', '寒剑', '碧剑', '银剑', '青锋剑'],
  qiang: ['银枪', '寒铁枪', '霸王枪', '龙胆枪'],
  gun:  ['伏魔棍', '玄铁棍', '盘龙棍'],
  shan: ['折扇', '玉骨折扇', '月华扇'],
  qin:  ['焦尾琴', '古琴', '绿绮琴'],
  bi:   ['判官笔', '铁骨笔', '朱砂笔'],
}
const ACCESSORY_NAMES = ['护腕', '玉佩', '戒指', '项链', '腰带', '护符']
const DRUG_NAMES = {
  hp:    { tian: '九转灵童', di: '大还丹', xuan: '续命丹', huang: '上等金创药', wu: '金创药' },
  qi:    { tian: '九转神元丹', di: '太虚丹', xuan: '上品回气散', huang: '回气散', wu: '下品回气散' },
  stamina:{ tian: '千年灵芝', di: '百年灵芝', xuan: '精制体力丸', huang: '体力丸', wu: '体力散' },
  cure:  { tian: '万毒解', di: '解毒丹', xuan: '解毒丸', huang: '解毒散', wu: '草药' },
}
const DRUG_COST_BASE = { tian: 600, di: 350, xuan: 180, huang: 80, wu: 30 }

// 生成过程化武器（完整物品对象，用于商店）
export function generateProcShopWeapon (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const types = ['dao', 'jian', 'qiang', 'gun', 'shan', 'qin', 'bi']
  const wtype = pick(types, seed + 20)
  const prefixes = QUALITY_PREFIXES[rank] || QUALITY_PREFIXES.huang
  const prefix = pick(prefixes, seed + 33)
  const baseName = pick(WEAPON_NAMES[wtype] || ['长刀'], seed + 44)
  const powerBase = { tian: 45, di: 30, xuan: 18, huang: 10, wu: 5 }[rank] || 10
  const qiBase = { tian: 35, di: 20, xuan: 12, huang: 5, wu: 0 }[rank] || 5
  const attrCount = rank === 'tian' ? 3 : rank === 'di' ? 2 : 1
  const attrs = {}
  if (attrCount >= 1) attrs.power = Math.floor(powerBase * (0.8 + r(50) * 0.4))
  if (attrCount >= 2 && r(60) > 0.5) attrs.qi = Math.floor(qiBase * (0.6 + r(65) * 0.8))
  if (attrCount >= 3) attrs.luck = Math.floor(5 + r(70) * 15)
  const costBase = { tian: 800, di: 400, xuan: 200, huang: 80, wu: 20 }[rank] || 80
  const cost = Math.floor(costBase * (0.8 + r(80) * 0.4))
  const itemId = `proc_wpn_${rank}_${Math.abs(seed % 999983)}`
  return {
    id: itemId,
    name: `${prefix} · ${baseName}`,
    type: 'weapon',
    rank,
    weapon_type: wtype,
    attrs,
    cost,
    desc: `过程锻造，蕴含${prefix}意境的神兵利器。`,
    proc: true,
  }
}

// 生成过程化防具
export function generateProcShopArmor (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const names = ['锁子甲', '皮甲', '软甲', '战袍', '护胸']
  const prefix = pick(QUALITY_PREFIXES[rank] || QUALITY_PREFIXES.huang, seed + 100)
  const baseName = pick(names, seed + 111)
  const defBase = { tian: 40, di: 25, xuan: 15, huang: 8, wu: 4 }[rank] || 8
  const attrs = { defense: Math.floor(defBase * (0.8 + r(120) * 0.4)) }
  if (r(130) > 0.4) attrs.constitution = Math.floor(5 + r(135) * 10)
  if (rank === 'tian' || (rank === 'di' && r(140) > 0.5)) attrs.hp = Math.floor(50 + r(145) * 100)
  const costBase = { tian: 600, di: 300, xuan: 150, huang: 60, wu: 15 }[rank] || 60
  const cost = Math.floor(costBase * (0.8 + r(150) * 0.4))
  const itemId = `proc_arm_${rank}_${Math.abs(seed % 999983)}`
  return {
    id: itemId,
    name: `${prefix} · ${baseName}`,
    type: 'armor',
    rank,
    attrs,
    cost,
    desc: `铁匠精心打造，${prefix}意境护甲。`,
    proc: true,
  }
}

// 生成过程化饰品
export function generateProcShopAccessory (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const accName = pick(ACCESSORY_NAMES, seed + 200)
  const prefix = pick(QUALITY_PREFIXES[rank] || QUALITY_PREFIXES.huang, seed + 211)
  const attrTypes = ['luck', 'power', 'qi', 'agility', 'constitution', 'comprehension']
  const pickAttr = () => pick(attrTypes, seed + r(220) * 1000 + 220)
  const valBase = { tian: 20, di: 12, xuan: 7, huang: 4, wu: 2 }[rank] || 4
  const attrs = {}
  const attr1 = pickAttr()
  attrs[attr1] = Math.floor(valBase * (0.6 + r(230) * 0.8))
  if (rank !== 'wu') {
    const attr2 = pickAttr()
    if (attr2 !== attr1) attrs[attr2] = Math.floor(valBase * 0.5 * (0.6 + r(240) * 0.8))
  }
  const costBase = { tian: 500, di: 250, xuan: 120, huang: 50, wu: 15 }[rank] || 50
  const cost = Math.floor(costBase * (0.8 + r(250) * 0.4))
  const itemId = `proc_acc_${rank}_${Math.abs(seed % 999983)}`
  return {
    id: itemId,
    name: `${prefix} · ${accName}`,
    type: 'accessory',
    rank,
    attrs,
    cost,
    desc: `工匠巧制，${prefix}意境饰品，属性随机。`,
    proc: true,
  }
}

// 生成过程化消耗品（药品）
export function generateProcShopDrug (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const roll = r(300)
  let effectType = 'hp'
  if (roll < 0.3) effectType = 'qi'
  else if (roll < 0.5) effectType = 'stamina'
  else if (roll < 0.6) effectType = 'cure'
  const names = DRUG_NAMES[effectType] || DRUG_NAMES.hp
  const prefix = pick(QUALITY_PREFIXES[rank] || QUALITY_PREFIXES.huang, seed + 311)
  const baseName = names[rank] || names.huang
  const effectBase = { tian: { hp: 2000, qi: 500, stamina: 200 }, di: { hp: 800, qi: 200, stamina: 100 }, xuan: { hp: 300, qi: 120, stamina: 60 }, huang: { hp: 100, qi: 50, stamina: 30 }, wu: { hp: 40, qi: 20, stamina: 15 } }[rank] || { hp: 100, qi: 50, stamina: 30 }
  const effect = {}
  if (effectType === 'cure') {
    effect.cure = 'poison'
  } else {
    effect[effectType] = Math.floor((effectBase[effectType] || 100) * (0.7 + r(320) * 0.6))
  }
  const costBase = DRUG_COST_BASE[rank] || 80
  const cost = Math.floor(costBase * (0.7 + r(330) * 0.6))
  const itemId = `proc_drg_${rank}_${Math.abs(seed % 999983)}`
  return {
    id: itemId,
    name: `${prefix} · ${baseName}`,
    type: 'consumable',
    rank,
    effect,
    cost,
    desc: `药铺精心配制，${prefix}意境${effectType === 'hp' ? '疗伤药' : effectType === 'qi' ? '回气丹' : effectType === 'stamina' ? '体力丹' : '解毒丹'}。`,
    proc: true,
  }
}

// 原有掉落生成（保留兼容）
export function generateProcDrop (rank = 'huang', seed = Date.now()) {
  const r = (offset = 0) => seededRand(seed + offset)
  const roll = r(1)
  if (roll < 0.4) {
    // 武学残卷
    const m = getProcMartial(rank, seed + 10)
    return {
      type: 'martial_scroll',
      itemId: `scroll_ma_${rank}_${Math.abs(seed % 9999)}`,
      name: `${m.name}残卷`,
      martialId: m.id,
      rank,
      desc: `记载着${m.name}招式与口诀的残页，习武者梦寐以求。`,
      value: { gold: Math.floor(50 * { tian: 4, di: 2.5, xuan: 1.5, huang: 1, wu: 0.5 }[rank] || 1) },
    }
  } else if (roll < 0.6) {
    // 武器
    return { ...generateProcWeapon(rank, seed), type: 'weapon' }
  } else {
    // 心法残卷
    const xf = getProcXinfa(rank, seed + 30)
    return {
      type: 'xinfa_scroll',
      itemId: `scroll_xf_${rank}_${Math.abs(seed % 9999)}`,
      name: `${xf.name}残卷`,
      xinfaId: xf.id,
      rank,
      desc: `一卷残破的${xf.name}心法，极为珍贵。`,
      value: { gold: Math.floor(80 * { tian: 4, di: 2.5, xuan: 1.5, huang: 1, wu: 0.5 }[rank] || 1) },
    }
  }
}
