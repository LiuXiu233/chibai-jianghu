// 过程化任务生成系统 (Procedural Quest Generation)
import { QUALITY_PREFIXES } from './procGen.js'
import { generateProcEnemy, generateProcLocation, generateProcMartial } from './procGen.js'

// ============================================================
// 工具函数
// ============================================================
function seededRand (seed) {
  return Math.abs(Math.sin(seed * 13337 + seed * 7))
}

function pick (arr, seed) {
  return arr[Math.abs(Math.sin(seed * 9999 + 1) * 10000) % arr.length]
}

function range (min, max, seed) {
  return min + Math.floor(seededRand(seed) * (max - min + 1))
}

// ============================================================
// 任务等阶配置
// ============================================================
const QUEST_TIER_CONFIG = {
  tian:  { chance: 0.01, minDay: 700 },
  di:    { chance: 0.05, minDay: 400 },
  xuan:  { chance: 0.15, minDay: 150 },
  huang: { chance: 0.30, minDay: 0 },
  wu:    { chance: 0.49, minDay: 0 },
}

const TIER_LABEL = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const TIER_COLOR = { tian: 'tian', di: 'di', xuan: 'xuan', huang: 'huang', wu: 'wu' }

const KILL_COUNT = { tian: 1, di: 2, xuan: 3, huang: 4, wu: 5 }
const GOLD_REWARD = { tian: 800, di: 400, xuan: 200, huang: 100, wu: 50 }
const EXP_REWARD = { tian: 500, di: 250, xuan: 120, huang: 60, wu: 30 }
const EXPIRE_HOURS = { tian: 96, di: 72, xuan: 48, huang: 36, wu: 24 }
const FAIL_PENALTY = {
  tian: { type: 'attr_damage', desc: '属性永久受损', attrs: { power: -3, qi: -3 } },
  di:   { type: 'gold_loss', desc: '扣除碎银500两', gold: 500 },
  xuan: { type: 'time_loss', desc: '扣除24小时寿命', hours: 24 },
  huang: { type: 'gold_loss', desc: '扣除碎银100两', gold: 100 },
  wu:    { type: 'none', desc: '无额外惩罚', gold: 0 },
}

// ============================================================
// 任务描述词库
// ============================================================
const COMBAT_THEMES = [
  { prefix: '之灾', suffix: '降临', mood: '灾厄' },
  { prefix: '之乱', suffix: '作乱', mood: '混乱' },
  { prefix: '之劫', suffix: '难逃', mood: '浩劫' },
  { prefix: '之祸', suffix: '为患', mood: '祸患' },
  { prefix: '之怒', suffix: '滔天', mood: '狂怒' },
  { prefix: '之乱', suffix: '不平', mood: '纷争' },
]

const SCAVENGE_ITEMS = [
  '千年灵芝草', '天外玄铁', '九天息壤', '龙涎香', '五色矿石',
  '蛊虫王', '千年古藤', '天山雪莲', '麒麟血', '凤凰羽',
  '古玉碎片', '青铜古镜', '玉髓心', '赤朱砂', '幽冥水',
]

const DELIVERY_TYPES = ['密信', '血书', '令旗', '玉佩', '丹药', '骨灰盒']
const MYSTERY_HOOKS = [
  '酒馆传闻', '古籍记载', '梦中神人托付', '无名剑客遗言',
  '石碑碑文', '壁画指示', '老农口述', '商旅秘闻',
]

const REGION_NAMES = {
  zhongyuan: '中原', xiyu: '西域', nanjiang: '南疆', beihan: '北寒', donghai: '东海',
}

// ============================================================
// 世界效果（蝴蝶效应）
// ============================================================
function generateWorldEffect (tier, seed) {
  const r = seededRand(seed)
  if (tier === 'tian' && r > 0.5) {
    return {
      type: 'area_clear',
      duration_hours: 100,
      effect: 'no_encounter',
      desc: '该区域100小时内不再有敌人出没',
    }
  }
  if (tier === 'di' && r > 0.6) {
    const factions = ['pharmacy', 'blacksmith', 'tavern']
    const faction = factions[Math.floor(r * 10 * factions.length) % factions.length]
    return {
      type: 'faction_hostile',
      faction,
      duration_hours: 72,
      desc: `${faction === 'pharmacy' ? '药铺' : faction === 'blacksmith' ? '铁匠铺' : '酒馆'}对你产生敌意，拒绝为你服务`,
    }
  }
  return null
}

// ============================================================
// 奖励生成
// ============================================================
function generateRewards (tier, seed, count = 1) {
  const rewards = [
    { type: 'gold', val: GOLD_REWARD[tier] * count },
    { type: 'exp', val: EXP_REWARD[tier] * count },
  ]
  // 天/地级：随机武学
  if (['tian', 'di'].includes(tier)) {
    const martialRank = tier === 'tian' ? 'tian' : 'di'
    const martial = generateProcMartial(martialRank, seed + 7)
    rewards.push({ type: 'proc_martial', val: martial.id, martialName: martial.name, martialData: martial })
  }
  // 玄/黄级：随机物品
  if (tier === 'xuan' || tier === 'huang') {
    rewards.push({ type: 'random_item', val: tier, desc: `${TIER_LABEL[tier]}级随机物品` })
  }
  return rewards
}

// ============================================================
// 任务生成器
// ============================================================

// 讨伐类
function generateCombatQuest (tier, regionId, day, seed) {
  const r = (offset) => seededRand(seed + offset)
  const regionName = REGION_NAMES[regionId] || '中原'
  const enemy = generateProcEnemy(tier, day, seed)
  const location = generateProcLocation('wild', seed + 1)
  const count = KILL_COUNT[tier]
  const theme = pick(COMBAT_THEMES, seed + 5)
  const qualityName = pick(QUALITY_PREFIXES[tier], seed + 3)
  const enemyFullName = `${qualityName}·${enemy.name}`

  const name = `${enemyFullName}${theme.prefix}`
  const desc = `${REGION_NAMES[regionId] || ''}【${location.name}】出现${enemyFullName}，${theme.suffix}。`
  const rewardDesc = `${GOLD_REWARD[tier] * count}两银子、${EXP_REWARD[tier] * count}经验`
  const extraReward = ['tian', 'di'].includes(tier)
    ? `、随机${TIER_LABEL[tier]}武学`
    : tier === 'xuan' || tier === 'huang' ? `、随机${TIER_LABEL[tier]}物品` : ''

  return {
    id: `quest_${Date.now()}_${Math.abs(seed % 99999)}`,
    template_id: 'qt_combat',
    name: `[${TIER_LABEL[tier]}·${tier}] ${name}`,
    desc,
    type: 'defeat',
    tier,
    goals: [{
      type: 'kill',
      target: enemy.id,
      enemyData: enemy,
      enemyName: enemyFullName,
      locationName: location.name,
      count,
      current: 0,
      completed: false,
    }],
    rewards: generateRewards(tier, seed, count),
    rewardDesc: `${rewardDesc}${extraReward}`,
    failPenalty: FAIL_PENALTY[tier],
    expire_hours: EXPIRE_HOURS[tier],
    created_turn: 0,
    completed: false,
    claimed: false,
    expired: false,
    chain: null,
    worldEffect: generateWorldEffect(tier, seed + 9),
    tierColor: TIER_COLOR[tier],
  }
}

// 搜寻类
function generateScavengeQuest (tier, regionId, day, seed) {
  const r = seededRand(seed + 2)
  const regionName = REGION_NAMES[regionId] || '中原'
  const item = pick(SCAVENGE_ITEMS, seed + 4)
  const location = generateProcLocation('wild', seed + 5)
  const qualityName = pick(QUALITY_PREFIXES[tier], seed + 6)
  const itemFullName = `${qualityName}·${item}`
  const count = tier === 'tian' ? 1 : tier === 'di' ? 2 : tier === 'xuan' ? 3 : 5

  const name = `[${TIER_LABEL[tier]}·${tier}] 寻找${itemFullName}`
  const desc = `${regionName}传闻【${location.name}】藏有${itemFullName}，需前往采集${count}份。`

  return {
    id: `quest_${Date.now()}_${Math.abs(seed % 99999)}`,
    template_id: 'qt_scavenge',
    name,
    desc,
    type: 'collect',
    tier,
    goals: [{
      type: 'collect',
      target: item,
      locationName: location.name,
      count,
      current: 0,
      completed: false,
    }],
    rewards: generateRewards(tier, seed, Math.ceil(count / 3)),
    rewardDesc: `${GOLD_REWARD[tier] * Math.ceil(count / 3)}两银子、${EXP_REWARD[tier] * Math.ceil(count / 3)}经验`,
    failPenalty: FAIL_PENALTY[tier],
    expire_hours: EXPIRE_HOURS[tier] + 12,
    created_turn: 0,
    completed: false,
    claimed: false,
    expired: false,
    chain: null,
    worldEffect: null,
    tierColor: TIER_COLOR[tier],
  }
}

// 护送/传递类
function generateDeliveryQuest (tier, regionId, day, seed) {
  const r = seededRand(seed + 3)
  const regionName = REGION_NAMES[regionId] || '中原'
  const deliveryType = pick(DELIVERY_TYPES, seed + 7)
  const destLocation = generateProcLocation('town', seed + 8)
  const travelRisk = tier === 'tian' ? 3 : tier === 'di' ? 2 : 1
  const name = `[${TIER_LABEL[tier]}·${tier}] 护送${deliveryType}`

  const desc = `${regionName}有人托你将一封${deliveryType}送往【${destLocation.name}】，据说沿途危险重重，需${travelRisk}次穿行危险区域。`

  return {
    id: `quest_${Date.now()}_${Math.abs(seed % 99999)}`,
    template_id: 'qt_delivery',
    name,
    desc,
    type: 'deliver',
    tier,
    goals: [{
      type: 'guard',
      target: deliveryType,
      destLocation: destLocation.name,
      count: travelRisk,
      current: 0,
      completed: false,
    }],
    rewards: generateRewards(tier, seed, 1),
    rewardDesc: `${GOLD_REWARD[tier]}两银子、${EXP_REWARD[tier]}经验`,
    failPenalty: FAIL_PENALTY[tier],
    expire_hours: EXPIRE_HOURS[tier] + 24,
    created_turn: 0,
    completed: false,
    claimed: false,
    expired: false,
    chain: null,
    worldEffect: null,
    tierColor: TIER_COLOR[tier],
  }
}

// 奇遇类（仅玄级以上）
function generateMysteryQuest (tier, regionId, day, seed) {
  const r = seededRand(seed + 4)
  const regionName = REGION_NAMES[regionId] || '中原'
  const hook = pick(MYSTERY_HOOKS, seed + 9)
  const targetLocation = generateProcLocation('wild', seed + 10)
  const qualityName = pick(QUALITY_PREFIXES[tier], seed + 11)
  const martial = generateProcMartial(tier, seed + 12)
  const martialName = `${qualityName}·${martial.name}`

  const name = `[${TIER_LABEL[tier]}·${tier}] 奇遇：${martialName}`
  const desc = `${regionName}传闻：${hook}——【${targetLocation.name}】中有${martialName}的线索，前去探索。`

  return {
    id: `quest_${Date.now()}_${Math.abs(seed % 99999)}`,
    template_id: 'qt_mystery',
    name,
    desc,
    type: 'explore',
    tier,
    goals: [{
      type: 'explore',
      target: targetLocation.name,
      count: 1,
      current: 0,
      completed: false,
    }],
    rewards: generateRewards(tier, seed, 1),
    rewardDesc: `${GOLD_REWARD[tier]}两银子、${EXP_REWARD[tier]}经验`,
    failPenalty: FAIL_PENALTY[tier],
    expire_hours: EXPIRE_HOURS[tier] + 48,
    created_turn: 0,
    completed: false,
    claimed: false,
    expired: false,
    chain: null,
    worldEffect: tier === 'tian' ? generateWorldEffect(tier, seed + 20) : null,
    tierColor: TIER_COLOR[tier],
  }
}

// ============================================================
// 主生成函数
// ============================================================
let questIdCounter = 10000

export function generateQuest (regionId, difficulty = 1, day = 1, seed = Date.now()) {
  const r = (offset) => seededRand(seed + offset)

  // 根据天数决定可用等阶池
  const availableTiers = Object.entries(QUEST_TIER_CONFIG)
    .filter(([, cfg]) => day >= cfg.minDay)
    .map(([tier]) => tier)

  // 按概率 roll 等阶
  let tier = 'huang'
  const roll = r(99)
  let cum = 0
  for (const [tierName, cfg] of Object.entries(QUEST_TIER_CONFIG)) {
    cum += cfg.chance
    if (roll < cum && availableTiers.includes(tierName)) {
      tier = tierName
      break
    }
  }

  // 按类型选择生成器（40%讨伐/20%搜寻/20%护送/20%奇遇）
  const typeRoll = r(999)
  if (typeRoll < 0.4) {
    return generateCombatQuest(tier, regionId, day, seed)
  } else if (typeRoll < 0.6) {
    return generateScavengeQuest(tier, regionId, day, seed)
  } else if (typeRoll < 0.8) {
    return generateDeliveryQuest(tier, regionId, day, seed)
  } else if (!['wu', 'huang'].includes(tier)) {
    return generateMysteryQuest(tier, regionId, day, seed)
  }
  return generateCombatQuest(tier, regionId, day, seed)
}

// ============================================================
// 连环任务生成
// ============================================================
const CHAIN_QUESTS = {
  investigation: [
    {
      nameFn: (tier, seed) => `[${TIER_LABEL[tier]}·${tier}] 连环·起`,
      descFn: (data) => `【${data.location}】出现${data.enemyName}，你决定先去调查此事。`,
      goalType: 'kill', count: 1,
    },
    {
      nameFn: (tier, seed) => `[${TIER_LABEL[tier]}·${tier}] 连环·承`,
      descFn: (data) => `击败${data.enemyName}后，你发现了幕后黑手的线索。`,
      goalType: 'kill', count: 2,
    },
    {
      nameFn: (tier, seed) => `[${TIER_LABEL[tier]}·${tier}] 连环·转`,
      descFn: (data) => `真相即将大白，深入【${data.location}】核心区域。`,
      goalType: 'kill', count: 3,
    },
    {
      nameFn: (tier, seed) => `[${TIER_LABEL[tier]}·${tier}] 连环·合`,
      descFn: (data) => `最终对决：击败幕后主使${data.enemyName}！`,
      goalType: 'kill', count: 1, boss: true,
    },
  ],
}

export function generateChainQuest (tier, regionId, day, seed) {
  const baseEnemy = generateProcEnemy(tier, day, seed)
  const baseLocation = generateProcLocation('wild', seed + 50)
  const qualityName = pick(QUALITY_PREFIXES[tier], seed + 51)
  const baseEnemyName = `${qualityName}·${baseEnemy.name}`

  const data = { enemy: baseEnemy, enemyName: baseEnemyName, location: baseLocation.name }

  const chainIdx = Math.floor(seededRand(seed + 52) * 4)
  const template = CHAIN_QUESTS.investigation[chainIdx]

  return {
    id: `quest_${Date.now()}_${Math.abs(seed % 99999)}`,
    template_id: `qt_chain_${chainIdx}`,
    name: template.nameFn(tier, seed),
    desc: template.descFn(data),
    type: 'defeat',
    tier,
    goals: [{
      type: template.goalType,
      target: baseEnemy.id,
      enemyData: baseEnemy,
      enemyName: baseEnemyName,
      locationName: baseLocation.name,
      count: template.count,
      boss: !!template.boss,
      current: 0,
      completed: false,
    }],
    rewards: generateRewards(tier, seed, template.count),
    rewardDesc: `${GOLD_REWARD[tier] * template.count}两银子、${EXP_REWARD[tier] * template.count}经验`,
    failPenalty: FAIL_PENALTY[tier],
    expire_hours: EXPIRE_HOURS[tier] + chainIdx * 12,
    created_turn: 0,
    completed: false,
    claimed: false,
    expired: false,
    chain: { series: 'investigation', index: chainIdx },
    worldEffect: chainIdx === 3 ? generateWorldEffect(tier, seed + 60) : null,
    tierColor: TIER_COLOR[tier],
  }
}

// ============================================================
// 批量生成（告示栏用）
// ============================================================
export function generateQuestBatch (regionId, difficulty, day, count = 3, seed = Date.now()) {
  const quests = []
  for (let i = 0; i < count; i++) {
    const s = seed + i * 7777
    const q = generateQuest(regionId, difficulty, day, s)
    quests.push(q)
  }
  // 确保最多只有一种等阶的任务（混合更好玩）
  return quests
}

export { TIER_LABEL, TIER_COLOR, QUEST_TIER_CONFIG }
