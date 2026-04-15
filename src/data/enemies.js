// 敌人数据库

export const ENEMY_TEMPLATES = [
  // ===== 无级（wu） =====
  { id: 'sh bandit', name: '山贼喽啰', rank: 'wu', hp: 30, power: 5, qi: 0, agility: 6, constitution: 4, luck: 3, reward_gold: 5, reward_exp: 8, martial_id: null, desc: '占山为王的小喽啰，只有些蛮力。' },
  { id: 'beggar', name: '江湖散人', rank: 'wu', hp: 35, power: 6, qi: 0, agility: 7, constitution: 5, luck: 4, reward_gold: 8, reward_exp: 10, martial_id: null, desc: '流落江湖的无名之辈，偶有一技傍身。' },
  { id: 'farmer', name: '农夫', rank: 'wu', hp: 20, power: 3, qi: 0, agility: 4, constitution: 6, luck: 5, reward_gold: 2, reward_exp: 3, martial_id: null, desc: '普通农夫，手中锄头便是武器。' },
  { id: 'runner', name: '跑腿伙计', rank: 'wu', hp: 25, power: 4, qi: 0, agility: 10, constitution: 3, luck: 5, reward_gold: 5, reward_exp: 6, martial_id: null, desc: '在镖局跑腿的伙计，身手倒还敏捷。' },
  { id: 'thief', name: '小毛贼', rank: 'wu', hp: 28, power: 5, qi: 0, agility: 12, constitution: 3, luck: 8, reward_gold: 15, reward_exp: 7, martial_id: null, desc: '偷鸡摸狗之徒，身法灵活。' },

  // ===== 黄级（huang）=====
  { id: 'disciple_1', name: '铁剑门弟子', rank: 'huang', hp: 80, power: 15, qi: 0, agility: 12, constitution: 10, luck: 5, reward_gold: 30, reward_exp: 35, martial_id: 'jianfa', desc: '铁剑门入门弟子，剑法已有小成。' },
  { id: 'bandit_2', name: '山贼头目', rank: 'huang', hp: 100, power: 20, qi: 0, agility: 10, constitution: 14, luck: 6, reward_gold: 50, reward_exp: 40, martial_id: 'h_dao_1', desc: '山贼中的头目，手下喽啰不少。' },
  { id: 'qing_disciple', name: '青城派俗家弟子', rank: 'huang', hp: 85, power: 16, qi: 0, agility: 14, constitution: 11, luck: 7, reward_gold: 40, reward_exp: 38, martial_id: 'qingsong', desc: '青城派的俗家弟子，剑走轻灵。' },
  { id: 'hengshan_dis', name: '衡山派弟子', rank: 'huang', hp: 75, power: 14, qi: 10, agility: 16, constitution: 9, luck: 8, reward_gold: 45, reward_exp: 42, martial_id: 'feihua', desc: '衡山派弟子，轻功了得。' },
  { id: 'xueshan_guard', name: '雪山派守卫', rank: 'huang', hp: 110, power: 18, qi: 15, agility: 10, constitution: 16, luck: 5, reward_gold: 55, reward_exp: 45, martial_id: 'luohan', desc: '雪山派山门守卫，经验丰富。' },
  { id: 'jianghu_mercenary', name: '江湖佣兵', rank: 'huang', hp: 95, power: 19, qi: 0, agility: 13, constitution: 12, luck: 7, reward_gold: 60, reward_exp: 48, martial_id: 'luanshi', desc: '以命换钱的佣兵，实战经验丰富。' },
  { id: 'huashan_dis', name: '华山派俗家弟子', rank: 'huang', hp: 88, power: 17, qi: 12, agility: 15, constitution: 10, luck: 8, reward_gold: 48, reward_exp: 44, martial_id: 'wuji', desc: '华山派俗家弟子，剑法已有章法。' },
  { id: 'taoist_apprentice', name: '道观学徒', rank: 'huang', hp: 70, power: 12, qi: 20, agility: 11, constitution: 8, luck: 10, reward_gold: 35, reward_exp: 36, martial_id: 'tianlu', desc: '道观的学徒，兼修一些内功心法。' },

  // ===== 玄级（xuan）=====
  { id: 'blood_blade', name: '血刀门杀手', rank: 'xuan', hp: 200, power: 32, qi: 0, agility: 22, constitution: 18, luck: 10, reward_gold: 120, reward_exp: 90, martial_id: 'x_dao_1', desc: '血刀门精锐杀手，刀法阴狠毒辣。' },
  { id: 'riyue_guard', name: '日月神教护法', rank: 'xuan', hp: 230, power: 28, qi: 35, agility: 18, constitution: 22, luck: 12, reward_gold: 150, reward_exp: 100, martial_id: 'xiayou', desc: '日月神教护法，内力深厚。' },
  { id: 'jinlun_monk', name: '金轮寺武僧', rank: 'xuan', hp: 250, power: 35, qi: 20, agility: 14, constitution: 30, luck: 8, reward_gold: 130, reward_exp: 95, martial_id: 'longyin', desc: '金轮寺武僧，硬气功极为厉害。' },
  { id: 'heiyi_senior', name: '黑翼堂高手', rank: 'xuan', hp: 200, power: 30, qi: 25, agility: 25, constitution: 15, luck: 15, reward_gold: 140, reward_exp: 98, martial_id: 'longwei', desc: '黑翼堂精英，来去如风。' },
  { id: 'shaolin_elite', name: '少林罗汉堂武僧', rank: 'xuan', hp: 280, power: 38, qi: 0, agility: 16, constitution: 28, luck: 8, reward_gold: 160, reward_exp: 110, martial_id: 'suanni', desc: '少林罗汉堂精锐武僧，拳法登峰造极。' },
  { id: 'wudang_senior', name: '武当派资深弟子', rank: 'xuan', hp: 220, power: 22, qi: 45, agility: 20, constitution: 20, luck: 12, reward_gold: 145, reward_exp: 105, martial_id: 'taiji', desc: '武当派资深弟子，太极剑法已有火候。' },
  { id: 'mojiao_elite', name: '魔教执事', rank: 'xuan', hp: 210, power: 26, qi: 40, agility: 20, constitution: 18, luck: 14, reward_gold: 155, reward_exp: 108, martial_id: 'jiuyin', desc: '魔教执事，手段毒辣。' },
  { id: 'gaibang_elite', name: '丐帮九袋长老', rank: 'xuan', hp: 240, power: 34, qi: 30, agility: 18, constitution: 22, luck: 10, reward_gold: 135, reward_exp: 102, martial_id: 'posui', desc: '丐帮九袋长老，打狗棒法精湛。' },

  // ===== 地级（di）=====
  { id: 'shaolin_head', name: '少林罗汉堂首座', rank: 'di', hp: 500, power: 55, qi: 40, agility: 25, constitution: 50, luck: 15, reward_gold: 400, reward_exp: 280, martial_id: 'dashuai', desc: '少林罗汉堂首座，一套韦陀棍打遍天下。' },
  { id: 'wudang_master', name: '武当太极真人', rank: 'di', hp: 480, power: 40, qi: 80, agility: 30, constitution: 45, luck: 18, reward_gold: 420, reward_exp: 300, martial_id: 'taiji', desc: '武当山太极真人，道法武功均入化境。' },
  { id: 'wuyue_master', name: '五岳剑派掌门', rank: 'di', hp: 520, power: 60, qi: 50, agility: 28, constitution: 48, luck: 20, reward_gold: 450, reward_exp: 320, martial_id: 'biyu', desc: '五岳剑派盟主，一套五岳剑法独步天下。' },
  { id: 'mingjiao_master', name: '明教法王', rank: 'di', hp: 550, power: 65, qi: 60, agility: 22, constitution: 55, luck: 12, reward_gold: 480, reward_exp: 340, martial_id: 'honglian', desc: '明教四大法王之一，乾坤大挪移已至大成。' },
  { id: 'kuangdao_master', name: '狂刀门门主', rank: 'di', hp: 510, power: 70, qi: 0, agility: 30, constitution: 40, luck: 15, reward_gold: 460, reward_exp: 310, martial_id: 'badao', desc: '狂刀门门主，霸刀九式无人能敌。' },
  { id: 'riyue_emperor', name: '日月神教副教主', rank: 'di', hp: 540, power: 50, qi: 90, agility: 26, constitution: 52, luck: 20, reward_gold: 500, reward_exp: 350, martial_id: 'guqin', desc: '日月神教副教主，吸星大法炉火纯青。' },

  // ===== 天级（tian）=====
  { id: 'saodi', name: '扫地神僧', rank: 'tian', hp: 800, power: 80, qi: 120, agility: 40, constitution: 80, luck: 30, reward_gold: 1000, reward_exp: 600, martial_id: 'duzun', desc: '少林藏经阁扫地僧，武功已入化境，深不可测。', boss: true },
  { id: 'dugu', name: '独孤求败', rank: 'tian', hp: 850, power: 100, qi: 80, agility: 50, constitution: 70, luck: 40, reward_gold: 1200, reward_exp: 700, martial_id: 'chongyue', desc: '剑魔独孤求败，一生求一败而不可得。', boss: true },
  { id: 'xiaoyao_master', name: '逍遥派掌门', rank: 'tian', hp: 780, power: 60, qi: 150, agility: 45, constitution: 65, luck: 35, reward_gold: 1100, reward_exp: 650, martial_id: 'yijin', desc: '逍遥派掌门，天山折梅手已练至化境。', boss: true },
  { id: 'tianxia_no1', name: '武林至尊', rank: 'tian', hp: 1000, power: 90, qi: 130, agility: 42, constitution: 90, luck: 50, reward_gold: 2000, reward_exp: 1000, martial_id: 'xiatian', desc: '天下第一人，武林至尊，其存在本身便是传说。', boss: true },
]

export function getEnemyByRank (rank) {
  return ENEMY_TEMPLATES.filter(e => e.rank === rank)
}

export function getRandomEnemy (rank = null, regionDifficulty = 1, seed = Date.now()) {
  let pool = [...ENEMY_TEMPLATES]
  if (rank) pool = pool.filter(e => e.rank === rank)
  const filtered = pool.filter(e => {
    const rankVal = { wu: 1, huang: 2, xuan: 3, di: 4, tian: 5 }[e.rank] || 1
    return rankVal <= regionDifficulty + 1
  })
  const src = filtered.length > 0 ? filtered : pool
  const idx = Math.abs(seed) % src.length
  return JSON.parse(JSON.stringify(src[idx]))
}

export function spawnEnemy (baseEnemy, regionDifficulty = 1, seed = Date.now()) {
  const diff = regionDifficulty || 1
  const scale = 1 + (diff - 1) * 0.3
  const v = ((seed % 20) - 10) / 100 // ±10%
  const hp = Math.floor(baseEnemy.hp * scale * (1 + v))
  const power = Math.floor(baseEnemy.power * scale * (1 + v * 0.5))
  const qi = Math.floor(baseEnemy.qi * scale * (1 + v * 0.5))
  const agility = Math.floor(baseEnemy.agility * (1 + v * 0.3))
  const constitution = Math.floor(baseEnemy.constitution * scale * (1 + v * 0.3))
  return {
    ...JSON.parse(JSON.stringify(baseEnemy)),
    id: baseEnemy.id + '_' + Date.now(),
    current_hp: hp,
    max_hp: hp,
    power, qi, agility, constitution,
    reward_gold: Math.floor(baseEnemy.reward_gold * scale),
    reward_exp: Math.floor(baseEnemy.reward_exp * scale),
  }
}
