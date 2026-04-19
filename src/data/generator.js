// 统一随机生成模块
// 整合武学、心法、敌人、任务、地点、物品的随机生成，供 useGame.js 和其他模块统一调用
import { MARTIAL_ARTS, XINFA } from './martialArts.js'
import { ENEMY_TEMPLATES, spawnEnemy } from './enemies.js'
import { generateQuest } from './questTemplates.js'
import { discoverHiddenLocation } from './regions.js'
import { ITEMS } from './items.js'
import {
  generateProcMartial, generateProcXinfa,
  getProcEnemy, generateProcDrop, generateProcLocation,
  generateProcShopWeapon, generateProcShopArmor,
  generateProcShopAccessory, generateProcShopDrug,
} from './procGen.js'

// ---- 随机种子工具 ----
function seededRand (seed) {
  return Math.abs(Math.sin(seed * 9999)) // deterministic pseudo-random
}
function pick (arr, seed) {
  return arr[Math.floor(seededRand(seed) * arr.length)]
}
function pickN (arr, n, seed) {
  const copy = [...arr].sort(() => seededRand(seed + arr.length) - 0.5)
  return copy.slice(0, Math.min(n, copy.length))
}

// ---- 武学生成 ----
// regionDiff: 1-5，生成适合该区域的随机武学
export function generateMartial (regionDiff = 1, seed = Date.now(), useProc = false) {
  if (useProc) {
    const rankPool = []
    for (let i = 1; i <= Math.min(regionDiff + 1, 5); i++) {
      const rankMap = { 1: 'wu', 2: 'huang', 3: 'xuan', 4: 'di', 5: 'tian' }
      rankPool.push(rankMap[i])
    }
    const rank = pick(rankPool, seed)
    return generateProcMartial(rank, seed)
  }
  const rankPool = []
  for (let i = 1; i <= Math.min(regionDiff + 1, 5); i++) {
    const rankMap = { 1: 'wu', 2: 'huang', 3: 'xuan', 4: 'di', 5: 'tian' }
    rankPool.push(rankMap[i])
  }
  const possible = MARTIAL_ARTS.filter(m => rankPool.includes(m.rank))
  const pool = possible.length > 0 ? possible : MARTIAL_ARTS
  const idx = Math.floor(seededRand(seed) * pool.length)
  return pool[idx] || MARTIAL_ARTS[0]
}

// ---- 生成多个武学（用于武馆展示） ----
export function generateMartialsForHall (regionDiff = 1, count = 3, seed = Date.now()) {
  const result = []
  let s = seed
  for (let i = 0; i < count * 3; i++) {
    const m = generateMartial(regionDiff, s + i * 7, true)
    if (!result.find(r => r.id === m.id) && (m.proc || !result.length)) {
      result.push(m)
    }
    if (result.length >= count) break
  }
  return result.slice(0, count)
}

// ---- 心法生成 ----
// comprehension: 玩家悟性，过滤悟性门槛以下的
export function generateXinfa (comprehension = 10, seed = Date.now(), useProc = false) {
  if (useProc) {
    const possible = XINFA.filter(x => (x.learn_req?.comprehension ?? 0) <= comprehension)
    const pool = possible.length > 0 ? possible : XINFA
    const rank = pick(pool.map(x => x.rank), seed)
    return generateProcXinfa(rank, seed)
  }
  const possible = XINFA.filter(x => (x.learn_req?.comprehension ?? 0) <= comprehension)
  const pool = possible.length > 0 ? possible : XINFA
  const idx = Math.floor(seededRand(seed) * pool.length)
  return pool[idx] || XINFA[0]
}

// ---- 敌人生成 ----
// regionDiff: 1-5; day: 游戏天数(1-1000); useProc: 是否优先使用过程化生成
export function generateEnemy (regionDiff = 1, seed = Date.now(), day = 1, useProc = false) {
  // 过程化敌人生成（带天数演化缩放）
  if (useProc) {
    // 根据区域难度和天数决定敌人等阶
    const rankMap = { 1: ['wu', 'huang'], 2: ['huang'], 3: ['huang', 'xuan'], 4: ['xuan', 'di'], 5: ['di', 'tian'] }
    const possible = rankMap[Math.min(regionDiff, 5)] || ['huang']
    const rank = possible[Math.floor(seededRand(seed + day) * possible.length)]
    return getProcEnemy(rank, day, seed)
  }
  // 回退到模板敌人生成
  const filtered = ENEMY_TEMPLATES.filter(e => {
    const rv = { wu: 1, huang: 2, xuan: 3, di: 4, tian: 5 }[e.rank] || 1
    return rv <= regionDiff + 1
  })
  const pool = filtered.length > 0 ? filtered : ENEMY_TEMPLATES
  const idx = Math.floor(seededRand(seed) * pool.length)
  const base = pool[idx]
  return spawnEnemy(base, regionDiff, seed)
}

// ---- 任务生成 ----
export function generateQuestForRegion (regionId, difficulty = 1, seed = Date.now()) {
  return generateQuest(regionId, difficulty, seed)
}

// ---- 隐藏地点生成 ----
export function generateHiddenLocation (regionId, seed = Date.now()) {
  return discoverHiddenLocation(regionId, seed)
}

// ---- 武学残卷生成 ----
// 基于区域难度，返回 { itemId, martialId, name, rank }
export const SCROLL_MARTIALS = [
  // 黄级
  { itemId: 'scroll_ma_huang_1', martialId: 'kuangfeng', name: '狂风刀法残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_2', martialId: 'xuezhanfang', name: '血战八方残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_3', martialId: 'luanshi', name: '乱世枪残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_4', martialId: 'tiejin', name: '铁棍破风残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_5', martialId: 'qingsong', name: '青松剑法残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_6', martialId: 'luoyan', name: '落雁扇残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_7', martialId: 'moshui', name: '墨舞飞扬残卷', rank: 'huang' },
  { itemId: 'scroll_ma_huang_8', martialId: 'suanguniang', name: '酸丫头乱披风拳残卷', rank: 'huang' },
  // 玄级
  { itemId: 'scroll_ma_xuan_1', martialId: 'duanhun', name: '断魂三斩残卷', rank: 'xuan' },
  { itemId: 'scroll_ma_xuan_2', martialId: 'bingqiang', name: '冰魄枪残卷', rank: 'xuan' },
  { itemId: 'scroll_ma_xuan_3', martialId: 'luoxia', name: '落霞孤鹜剑残卷', rank: 'xuan' },
  { itemId: 'scroll_ma_xuan_4', martialId: 'tianxia', name: '天下无扇残卷', rank: 'xuan' },
  { itemId: 'scroll_ma_xuan_5', martialId: 'longyin', name: '龙吟铁砂掌残卷', rank: 'xuan' },
  { itemId: 'scroll_ma_xuan_6', martialId: 'tiandi', name: '天地连环腿残卷', rank: 'xuan' },
  // 地级
  { itemId: 'scroll_ma_di_1', martialId: 'xuanyuan', name: '轩辕刀法残卷', rank: 'di' },
  { itemId: 'scroll_ma_di_2', martialId: 'longwei', name: '龙威心法残卷', rank: 'di' },
  { itemId: 'scroll_ma_di_3', martialId: 'suanni', name: '碎骨震天拳残卷', rank: 'di' },
  { itemId: 'scroll_ma_di_4', martialId: 'tianlao', name: '天劳破云掌残卷', rank: 'di' },
  // 天级
  { itemId: 'scroll_ma_tian_1', martialId: 'badao', name: '霸刀九式残卷', rank: 'tian' },
  { itemId: 'scroll_ma_tian_2', martialId: 'chongyue', name: '冲岳九剑残卷', rank: 'tian' },
]

export const SCROLL_XINFAS = [
  { itemId: 'scroll_xf_tuna', xinfaId: 'tuna', name: '吐纳法残卷', rank: 'wu' },
  { itemId: 'scroll_xf_changchun', xinfaId: 'changchun', name: '长春功残卷', rank: 'huang' },
  { itemId: 'scroll_xf_taiyi', xinfaId: 'taiyi', name: '太乙心法残卷', rank: 'huang' },
  { itemId: 'scroll_xf_jinshan', xinfaId: 'jinshan', name: '金身心法残卷', rank: 'xuan' },
  { itemId: 'scroll_xf_jinghong', xinfaId: 'jinghong', name: '惊鸿步法残卷', rank: 'xuan' },
  { itemId: 'scroll_xf_yijin', xinfaId: 'yijin', name: '易筋经残卷', rank: 'di' },
  { itemId: 'scroll_xf_jiuyang', xinfaId: 'jiuyang', name: '九阳神功残卷', rank: 'di' },
  { itemId: 'scroll_xf_taiji', xinfaId: 'taiji', name: '太极拳经残卷', rank: 'di' },
  { itemId: 'scroll_xf_taiji_wuji', xinfaId: 'taiji_wuji', name: '太初无极功残卷', rank: 'tian' },
  { itemId: 'scroll_xf_chunyang', xinfaId: 'chunyang', name: '纯阳真气残卷', rank: 'tian' },
]

// 根据难度过滤可获得的武学残卷
function getScrollsForDiff (regionDiff) {
  const diffMap = { 1: ['huang'], 2: ['huang', 'xuan'], 3: ['xuan', 'di'], 4: ['di', 'tian'], 5: ['tian'] }
  const ranks = diffMap[Math.min(regionDiff, 5)] || ['huang']
  return SCROLL_MARTIALS.filter(s => ranks.includes(s.rank))
}

export function generateMartialScroll (regionDiff = 1, seed = Date.now()) {
  const pool = getScrollsForDiff(regionDiff)
  if (!pool.length) return SCROLL_MARTIALS[0]
  const idx = Math.floor(seededRand(seed) * pool.length)
  return pool[idx]
}

export function generateXinfaScroll (comprehension = 10, seed = Date.now()) {
  // 心法残卷按悟性过滤
  const possible = SCROLL_XINFAS.filter(s => {
    const xf = XINFA.find(x => x.id === s.xinfaId)
    return xf && (xf.learn_req?.comprehension ?? 0) <= comprehension
  })
  const pool = possible.length > 0 ? possible : SCROLL_XINFAS
  const idx = Math.floor(seededRand(seed) * pool.length)
  return pool[idx]
}

// ---- 野外探索综合事件 ----
// 返回: { type: 'martial_scroll'|'xinfa_scroll'|'enemy'|'item'|'location'|'nothing', data }
export function generateExploreEvent (player, regionDiff = 1, seed = Date.now(), day = 1) {
  const roll = seededRand(seed)
  const comprehension = player?.attrs?.悟性 || 10

  if (roll < 0.03) {
    // 3% 过程化武学残卷
    const rankMap = { 1: 'huang', 2: 'huang', 3: 'xuan', 4: 'di', 5: 'tian' }
    const rank = rankMap[Math.min(regionDiff, 5)] || 'huang'
    const m = generateProcMartial(rank, seed)
    return { type: 'martial_scroll', data: { itemId: m.id, martialId: m.id, name: m.name + '残卷', rank: m.rank, proc: true } }
  } else if (roll < 0.05) {
    // 2% 过程化心法残卷
    const rankMap2 = { 1: 'wu', 2: 'huang', 3: 'xuan', 4: 'di', 5: 'tian' }
    const rank = rankMap2[Math.min(regionDiff, 5)] || 'huang'
    const xf = generateProcXinfa(rank, seed + 1)
    return { type: 'xinfa_scroll', data: { itemId: xf.id, xinfaId: xf.id, name: xf.name + '残卷', rank: xf.rank, proc: true } }
  } else if (roll < 0.10) {
    // 5% 敌人（过程化，带天数缩放）
    const enemy = generateEnemy(regionDiff, seed + 2, day, true)
    return { type: 'enemy', data: enemy }
  } else if (roll < 0.18) {
    // 8% 物品（过程化掉落）
    const drop = generateProcDrop(regionDiff > 2 ? 'xuan' : 'huang', seed + 5)
    return { type: 'item', data: drop }
  } else if (roll < 0.22) {
    // 4% 过程化地点发现（传闻）
    const regionId = player?.regionId || 'zhongyuan'
    const loc = generateProcLocation(regionId, seed + 99)
    return { type: 'location', data: loc }
  }
  return { type: 'nothing', data: null }
}

// ---- 武馆刷新冷却 ----
// 检查玩家当前是否可以免费刷新武馆
export function canFreeRefresh (player) {
  const lastRefresh = player?.lastMartialHallRefresh || 0
  const clock = player?._clock || 0
  // 每24刻（6小时）可免费刷新一次
  return clock - lastRefresh >= 24
}

// ---- 武学修炼费用计算 ----
export function calcPracticeCost (martialRank = 'wu') {
  const rankCost = { tian: 200, di: 150, xuan: 100, huang: 60, wu: 30 }
  return rankCost[martialRank] || 60
}

// ---- 武学修习悟性门槛 ----
export function getMartialReq (rank) {
  const reqMap = { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }
  return reqMap[rank] || 10
}

// ---- 铁匠铺商店物品（静态 + 过程化） ----
// 返回: [{ ...item, proc?: true }]
export function getBlacksmithShopItems (regionDiff = 1, seed = Date.now()) {
  const maxRankIdx = Math.min(regionDiff - 1, 4)
  const rankOrder = ['wu', 'huang', 'xuan', 'di', 'tian']
  const allowedRanks = rankOrder.slice(0, maxRankIdx + 1)

  // 静态物品
  const staticItems = ITEMS.filter(i => {
    if (i.type !== 'weapon' && i.type !== 'armor' && i.type !== 'accessory') return false
    return allowedRanks.includes(i.rank)
  }).slice(0, 8)

  // 过程化物品（各类型 1~2 件）
  const procItems = []
  const PROC_COUNT = regionDiff >= 4 ? 3 : regionDiff >= 2 ? 2 : 1
  for (let i = 0; i < PROC_COUNT; i++) {
    const rank = allowedRanks[Math.floor(seededRand(seed + i * 7) * allowedRanks.length)]
    const roll = seededRand(seed + i * 13 + 50)
    if (roll < 0.35) {
      procItems.push({ ...generateProcShopWeapon(rank, seed + i * 17 + 50), _proc: true })
    } else if (roll < 0.65) {
      procItems.push({ ...generateProcShopArmor(rank, seed + i * 19 + 70), _proc: true })
    } else {
      procItems.push({ ...generateProcShopAccessory(rank, seed + i * 23 + 90), _proc: true })
    }
  }

  return [...staticItems, ...procItems]
}

// ---- 药铺商店物品（静态 + 过程化） ----
export function getPharmacyShopItems (regionDiff = 1, seed = Date.now()) {
  const maxRankIdx = Math.min(regionDiff - 1, 4)
  const rankOrder = ['wu', 'huang', 'xuan', 'di', 'tian']
  const allowedRanks = rankOrder.slice(0, maxRankIdx + 1)

  // 静态消耗品
  const staticDrugs = ITEMS.filter(i => i.type === 'consumable' && allowedRanks.includes(i.rank)).slice(0, 5)

  // 过程化消耗品（各等阶 1 件）
  const PROC_COUNT = Math.min(regionDiff, 3)
  const procDrugs = []
  for (let i = 0; i < PROC_COUNT; i++) {
    const rank = allowedRanks[Math.floor(seededRand(seed + i * 11) * allowedRanks.length)]
    procDrugs.push({ ...generateProcShopDrug(rank, seed + i * 31 + 200), _proc: true })
  }

  return [...staticDrugs, ...procDrugs]
}

