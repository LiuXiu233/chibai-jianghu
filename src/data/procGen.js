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

// ============================================================
// 词库
// ============================================================

// --- 武学 ---
// 意境词（外/内功共用）
const MARTIAL_MOOD = [
  '凌霄', '苍穹', '裂云', '破晓', '幽冥', '寒霜', '赤焰', '雷霆',
  '天陨', '惊鸿', '傲骨', '狂澜', '残阳', '寂灭', '霸天', '流云',
  '断魂', '灭世', '修罗', '修罗', '焚天', '九幽', '八荒', '六合',
  '天机', '玄黄', '太初', '混沌', '鸿蒙', '万象', '千山', '万水',
  '落叶', '飞花', '飘雪', '惊雷', '暗涌', '狂潮', '逝水', '残月',
]

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
const ENEMY_PREFIXES = [
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
  { name: '疯狂的', buff: 'lifesteal', val: 0.08 },
  { name: '入魔的', buff: 'all_bonus', val: 0.15 },
  { name: '破境的', buff: 'all_bonus', val: 0.2 },
  { name: '天悟的', buff: 'comprehension_bonus', val: 10 },
  { name: '血债的', buff: 'damage_bonus', val: 0.15 },
]
// 敌人身份主体
const ENEMY_IDENTITIES = [
  { name: '刀客', style: 'external', weapon: 'dao' },
  { name: '剑士', style: 'internal', weapon: 'jian' },
  { name: '枪手', style: 'external', weapon: 'qiang' },
  { name: '棍僧', style: 'external', weapon: 'gun' },
  { name: '散修', style: 'mixed', weapon: null },
  { name: '武僧', style: 'external', weapon: null },
  { name: '术士', style: 'internal', weapon: 'qin' },
  { name: '老媪', style: 'unarmed', weapon: null },
  { name: '护卫', style: 'external', weapon: 'jian' },
  { name: '刺客', style: 'external', weapon: 'dao' },
  { name: '隐士', style: 'internal', weapon: 'shan' },
  { name: '宗师', style: 'mixed', weapon: null },
  { name: '门徒', style: 'mixed', weapon: null },
  { name: '弟子', style: 'mixed', weapon: null },
  { name: '长老', style: 'internal', weapon: null },
  { name: '掌门', style: 'mixed', weapon: null },
  { name: '邪修', style: 'internal', weapon: 'bi' },
  { name: '游侠', style: 'external', weapon: 'qiang' },
  { name: '书生', style: 'internal', weapon: 'shan' },
  { name: '铁匠', style: 'external', weapon: 'fu' },
  { name: '盗贼', style: 'external', weapon: 'dao' },
  { name: '山贼', style: 'external', weapon: 'dao' },
  { name: '匪首', style: 'external', weapon: 'fu' },
  { name: '血刀徒', style: 'external', weapon: 'dao' },
  { name: '阴阳师', style: 'internal', weapon: 'qin' },
]
// 敌人后缀（境界）
const ENEMY_SUFFIXES = [
  { name: '', multiplier: 1.0 }, // 无后缀
  { name: '[小成]', multiplier: 1.1 },
  { name: '[大成]', multiplier: 1.2 },
  { name: '[圆满]', multiplier: 1.35 },
  { name: '[入魔]', multiplier: 1.5, bonus: { damage_bonus: 0.2 } },
  { name: '[破境]', multiplier: 1.6, bonus: { all_bonus: 0.15 } },
  { name: '[悟道]', multiplier: 1.7, bonus: { qi_regen: 5 } },
  { name: '[天威]', multiplier: 2.0, bonus: { crit_dmg_bonus: 0.5 } },
]

// --- 武器前缀 ---
const WEAPON_PREFIXES = [
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
]

// --- 护具前缀 ---
const ARMOR_PREFIXES = [
  { name: '坚硬的', attrs: { constitution: 8, defense: 5 } },
  { name: '牢固的', attrs: { constitution: 5, defense: 8 } },
  { name: '轻便的', attrs: { agility: 5, defense: 3 } },
  { name: '厚重的', attrs: { constitution: 12, defense: 10 } },
  { name: '灵巧的', attrs: { agility: 8, dodge: 3 } },
  { name: '幸运的', attrs: { luck: 8 } },
  { name: '强化的', attrs: { constitution: 6, defense: 6, agility: 3 } },
]

// --- 地点 ---
const LOCATION_PREFIXES = [
  '荒凉的', '繁华的', '血色的', '静谧的', '残破的', '古老的',
  '神秘的', '阴森的', '苍凉的', '幽深的', '血腥的', '飘渺的',
  '破败的', '荒废的', '寂静的', '偏僻的', '幽静的', '萧瑟的',
  '破落的', '废弃的', '偏僻的',
]
const LOCATION_TERRAINS = [
  { name: '小镇', buildings: ['blacksmith', 'pharmacy', 'tavern'] },
  { name: '驿站', buildings: ['notice'] },
  { name: '古镇', buildings: ['blacksmith', 'martialHall', 'tavern'] },
  { name: '废墟', buildings: [] },
  { name: '竹林', buildings: [] },
  { name: '荒野', buildings: [] },
  { name: '山道', buildings: [] },
  { name: '古庙', buildings: ['notice'] },
  { name: '山洞', buildings: [] },
  { name: '深谷', buildings: [] },
  { name: '峡谷', buildings: [] },
  { name: '古墓', buildings: [] },
  { name: '山寨', buildings: ['blacksmith'] },
  { name: '渡口', buildings: ['notice', 'tavern'] },
  { name: '山寨', buildings: ['notice'] },
]

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

  // 随机词缀
  const affix = r(4) > 0.5 ? pick(affixes, seed + 5) : null

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
    // 用于装备掉落时的物品数据
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

  // 时间演化缩放
  const dayScale = 1 + (day - 1) / 500  // 第1天=1.0，第500天=2.0，第1000天=3.0
  const scale = rankMult * Math.min(dayScale, 3.0)

  // 随机词缀
  const hasPrefix = r(1) > 0.4
  const enemyPrefix = hasPrefix ? pick(ENEMY_PREFIXES, seed + 1) : null

  const identity = pick(ENEMY_IDENTITIES, seed + 2)

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

  // 奖励
  const gold = Math.floor(10 * finalScale)
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
  const prefix = pick(LOCATION_PREFIXES, seed + 1)
  const terrain = pick(LOCATION_TERRAINS, seed + 2)
  const name = `${prefix}${terrain.name}`
  return {
    name,
    type: terrain.name.includes('镇') ? 'town' : terrain.name.includes('村') ? 'village' : terrain.name.includes('山') ? 'mountain' : terrain.name.includes('古') ? 'dungeon' : 'wilderness',
    buildings: terrain.buildings,
    desc: `这里是${name}。`,
    proc: true,
  }
}

// ============================================================
// 随机掉落生成（基于 procMartial 的装备）
// ============================================================

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
    const weaponTypes = ['dao', 'jian', 'qiang', 'gun']
    const wtype = pick(weaponTypes, seed + 20)
    const powerBase = { tian: 40, di: 28, xuan: 18, huang: 10, wu: 5 }[rank] || 10
    return {
      type: 'weapon',
      rank,
      attrs: { power: Math.floor(powerBase * (0.8 + r(25) * 0.4)) },
      weapon_type: wtype,
    }
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
