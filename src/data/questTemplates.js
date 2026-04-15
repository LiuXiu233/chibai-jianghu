// 任务模板
// placeholders: {enemy}, {location}, {item}, {count}, {gold}, {martial_rank}

export const QUEST_TEMPLATES = [
  // ===== 单次任务 =====
  {
    id: 'qt_defeat',
    name: '击败敌人',
    desc: '据说【{location}】附近有【{enemy}】出没，去将其击败。',
    type: 'defeat',
    goals: [{ type: 'kill', target: '{enemy}', count: 1 }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 50 }],
    expire_days: 3,
  },
  {
    id: 'qt_deliver',
    name: '传递物品',
    desc: '有人托你将一封密信送往【{location}】的某人手中。',
    type: 'deliver',
    goals: [{ type: 'deliver', target: '{location}' }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 40 }],
    expire_days: 2,
  },
  {
    id: 'qt_collect',
    name: '采集材料',
    desc: '【{location}】附近生长着【{item}】，需要你去采集一些回来。',
    type: 'collect',
    goals: [{ type: 'collect', target: '{item}', count: '{count}' }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 35 }],
    expire_days: 5,
  },
  {
    id: 'qt_explore',
    name: '探索地点',
    desc: '有传闻说【{location}】里藏着前人留下的宝贝，去探索一番。',
    type: 'explore',
    goals: [{ type: 'explore', target: '{location}' }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 60 }, { type: 'random_item', rank: '{martial_rank}' }],
    expire_days: 4,
  },
  {
    id: 'qt_guard',
    name: '护送任务',
    desc: '商队需要一名高手护送他们穿过【{location}】的危险地带。',
    type: 'guard',
    goals: [{ type: 'guard', target: '{location}', count: 1 }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 80 }],
    expire_days: 2,
  },
  {
    id: 'qt_hunt',
    name: '狩猎任务',
    desc: '猎人公会悬赏：前往【{location}】猎杀{count}只【{enemy}】。',
    type: 'hunt',
    goals: [{ type: 'kill', target: '{enemy}', count: '{count}' }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 70 }],
    expire_days: 5,
  },
  {
    id: 'qt_speak',
    name: '打听消息',
    desc: '去【{location}】的酒馆，向某位神秘客打听最近江湖上的消息。',
    type: 'talk',
    goals: [{ type: 'talk', target: '{location}' }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 30 }, { type: 'hint', val: '传闻' }],
    expire_days: 2,
  },
  // ===== 连环任务（第一环）=====
  {
    id: 'qt_series_1',
    name: '连环任务·起',
    desc: '【{location}】的【{enemy}】最近行为异常，你决定先去调查此事。（连环任务①）',
    type: 'series',
    series: 'investigation',
    series_index: 1,
    goals: [{ type: 'kill', target: '{enemy}', count: 1 }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 60 }],
    expire_days: 3,
  },
  {
    id: 'qt_series_2',
    name: '连环任务·承',
    desc: '击败【{enemy}】后，你发现了幕后黑手的线索。（连环任务②）',
    type: 'series',
    series: 'investigation',
    series_index: 2,
    goals: [{ type: 'kill', target: '{enemy}', count: 2 }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 100 }, { type: 'martial', rank: '{martial_rank}' }],
    expire_days: 5,
  },
  {
    id: 'qt_series_3',
    name: '连环任务·转',
    desc: '真相即将大白，你需要深入【{location}】的核心区域。（连环任务③）',
    type: 'series',
    series: 'investigation',
    series_index: 3,
    goals: [{ type: 'kill', target: '{enemy}', count: 3 }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 150 }, { type: 'martial', rank: '{martial_rank}' }],
    expire_days: 5,
  },
  {
    id: 'qt_series_4',
    name: '连环任务·合',
    desc: '最终对决：你需要击败幕后主使【{enemy}】。（连环任务④）',
    type: 'series',
    series: 'investigation',
    series_index: 4,
    goals: [{ type: 'kill', target: '{enemy}', count: 1, boss: true }],
    rewards: [{ type: 'gold', val: '{gold}' }, { type: 'exp', val: 300 }, { type: 'martial', rank: 'di' }, { type: 'title', val: '侠义之士' }],
    expire_days: 7,
  },
]

// 生成具体任务
const ENEMY_NAMES = ['山贼喽啰', '铁剑门弟子', '青城派俗家弟子', '血刀门杀手', '日月神教护法', '金轮寺武僧', '少林罗汉堂武僧', '武当派资深弟子', '明教法王', '狂刀门门主']
const ITEM_NAMES = ['灵芝草', '千年古玉', '天山雪莲', '蛊虫王', '玄铁', '五色矿石', '千年古藤', '龙涎香']
const REGION_LOCS = {
  zhongyuan: ['青云镇', '落霞村', '铁匠岭', '寒潭谷', '枯叶寺', '青城山', '松林镇', '洛阳城', '明月山庄', '天长镇'],
  xiyu: ['流沙堡', '白驼寨', '玉石城', '魔域镇', '莲花池', '夕阳关', '古浪寺', '千金楼', '玄冥谷', '星月城'],
  nanjiang: ['五毒谷', '蛊师寨', '银蛇洞', '血藤岛', '竹教总坛', '蛮云寨', '白曼谷', '柳园镇', '香云谷', '天羽镇'],
  beihan: ['冰封城', '雪狼窝', '冻土镇', '极光寨', '白桦岭', '寒雪宫', '血雨峰', '广寒镇', '七星岭', '天狼峰'],
  donghai: ['碧波镇', '渔火岛', '珊瑚礁', '海月城', '秃鹫帮', '龙门港', '玄机岛', '青山岛', '鱼骨庙', '海棠岛'],
}
const MARTIAL_RANKS = ['huang', 'xuan', 'di', 'tian']
const MARTIAL_RANK_NAMES = { huang: '黄', xuan: '玄', di: '地', tian: '天' }

let questIdCounter = 1000
export function generateQuest (regionId, difficulty = 1, seed = Date.now()) {
  const s = seed
  const locs = REGION_LOCS[regionId] || REGION_LOCS.zhongyuan
  const location = locs[Math.abs(s) % locs.length]
  const enemy = ENEMY_NAMES[Math.abs(s >> 4) % ENEMY_NAMES.length]
  const item = ITEM_NAMES[Math.abs(s >> 8) % ITEM_NAMES.length]
  const rankIdx = Math.min(Math.floor((difficulty - 1) / 1.5), MARTIAL_RANKS.length - 1)
  const mr = MARTIAL_RANKS[Math.max(0, rankIdx)]
  const martialRankName = MARTIAL_RANK_NAMES[mr]
  const count = (difficulty <= 1 ? 2 : difficulty <= 2 ? 3 : 5)
  const gold = (difficulty <= 1 ? 50 : difficulty <= 2 ? 120 : difficulty <= 3 ? 250 : 500)

  // 只选非连环任务的第一环
  const templates = QUEST_TEMPLATES.filter(t => !t.series || t.series_index === 1)
  const template = templates[Math.abs(s) % templates.length]

  const fills = { '{location}': location, '{enemy}': enemy, '{item}': item, '{count}': count, '{gold}': gold, '{martial_rank}': mr }

  function fill (str) {
    let result = str
    for (const [k, v] of Object.entries(fills)) {
      result = result.split(k).join(String(v))
    }
    return result
  }

  const quest = {
    id: 'quest_' + (questIdCounter++),
    template_id: template.id,
    name: fill(template.name),
    desc: fill(template.desc),
    type: template.type,
    goals: template.goals.map(g => ({
      ...g,
      target: typeof g.target === 'string' ? fill(g.target) : g.target,
      count: typeof g.count === 'string' ? parseInt(fill(g.count)) : g.count,
      current: 0,
      completed: false,
    })),
    rewards: template.rewards.map(r => ({
      ...r,
      val: typeof r.val === 'string' ? fill(r.val) : r.val,
    })),
    expire_days: template.expire_days,
    created_turn: 0,
    completed: false,
    claimed: false,
  }

  return quest
}
