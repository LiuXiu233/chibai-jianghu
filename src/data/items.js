// 物品数据库

export const WEAPON_TYPES = ['dao', 'jian', 'qiang', 'gun', 'fu', 'shan', 'qin', 'bi', 'fist']

// ===== 武学残卷 =====
const MARTIAL_SCROLLS = [
  // 黄级
  { id: 'scroll_ma_huang_1', name: '狂风刀法残卷', type: 'martial_scroll', martial_id: 'kuangfeng', rank: 'huang', cost: 150, desc: '记载着狂风刀法招式与口诀的残页，习武者梦寐以求。' },
  { id: 'scroll_ma_huang_2', name: '血战八方残卷', type: 'martial_scroll', martial_id: 'xuezhanfang', rank: 'huang', cost: 150, desc: '置之死地而后生，刀刀见血。残卷已残，威力犹存。' },
  { id: 'scroll_ma_huang_3', name: '乱世枪残卷', type: 'martial_scroll', martial_id: 'luanshi', rank: 'huang', cost: 140, desc: '乱世求存的枪法，快准狠。' },
  { id: 'scroll_ma_huang_4', name: '铁棍破风残卷', type: 'martial_scroll', martial_id: 'tiejin', rank: 'huang', cost: 130, desc: '棍风如雷，中者筋断骨折。' },
  { id: 'scroll_ma_huang_5', name: '青松剑法残卷', type: 'martial_scroll', martial_id: 'qingsong', rank: 'huang', cost: 130, desc: '如青松挺立，剑势沉稳。' },
  { id: 'scroll_ma_huang_6', name: '落雁扇残卷', type: 'martial_scroll', martial_id: 'luoyan', rank: 'huang', cost: 120, desc: '落雁于天，扇出如风。' },
  { id: 'scroll_ma_huang_7', name: '墨舞飞扬残卷', type: 'martial_scroll', martial_id: 'moshui', rank: 'huang', cost: 120, desc: '以笔代剑，墨迹所至，皆是杀招。' },
  { id: 'scroll_ma_huang_8', name: '酸丫头乱披风拳残卷', type: 'martial_scroll', martial_id: 'suanguniang', rank: 'huang', cost: 120, desc: '看似杂乱无章，实则拳拳有章法。' },
  // 玄级
  { id: 'scroll_ma_xuan_1', name: '断魂三斩残卷', type: 'martial_scroll', martial_id: 'duanhun', rank: 'xuan', cost: 350, desc: '三斩断魂，刀刀夺命。' },
  { id: 'scroll_ma_xuan_2', name: '冰魄枪残卷', type: 'martial_scroll', martial_id: 'bingqiang', rank: 'xuan', cost: 350, desc: '枪尖附寒冰之气，中者血脉冻结。' },
  { id: 'scroll_ma_xuan_3', name: '落霞孤鹜剑残卷', type: 'martial_scroll', martial_id: 'luoxia', rank: 'xuan', cost: 380, desc: '晚霞与孤雁齐飞，剑光与夕阳一色。' },
  { id: 'scroll_ma_xuan_4', name: '天下无扇残卷', type: 'martial_scroll', martial_id: 'tianxia', rank: 'xuan', cost: 360, desc: '一把折扇，可平天下不平事。' },
  { id: 'scroll_ma_xuan_5', name: '龙吟铁砂掌残卷', type: 'martial_scroll', martial_id: 'longyin', rank: 'xuan', cost: 340, desc: '铁砂中修炼而成，掌力如龙吟。' },
  { id: 'scroll_ma_xuan_6', name: '天地连环腿残卷', type: 'martial_scroll', martial_id: 'tiandi', rank: 'xuan', cost: 340, desc: '天地之间，腿无处不到。' },
  // 地级
  { id: 'scroll_ma_di_1', name: '轩辕刀法残卷', type: 'martial_scroll', martial_id: 'xuanyuan', rank: 'di', cost: 800, desc: '上古轩辕氏所创，刀意浩然。' },
  { id: 'scroll_ma_di_2', name: '龙尾枪法残卷', type: 'martial_scroll', martial_id: 'longwei_gun', rank: 'di', cost: 800, desc: '枪身如龙尾，摆动间取敌首级。' },
  { id: 'scroll_ma_di_3', name: '碎骨震天拳残卷', type: 'martial_scroll', martial_id: 'suanni', rank: 'di', cost: 820, desc: '拳可碎骨，势可震天。' },
  { id: 'scroll_ma_di_4', name: '天劳破云掌残卷', type: 'martial_scroll', martial_id: 'tianlao', rank: 'di', cost: 820, desc: '一掌可破云裂天，霸道绝伦。' },
  // 天级
  { id: 'scroll_ma_tian_1', name: '霸刀九式残卷', type: 'martial_scroll', martial_id: 'badao', rank: 'tian', cost: 2000, desc: '刀中之霸，一刀劈出，天地变色。' },
  { id: 'scroll_ma_tian_2', name: '冲岳九剑残卷', type: 'martial_scroll', martial_id: 'chongyue', rank: 'tian', cost: 2200, desc: '九剑齐出，可冲山岳，剑意惊天。' },
]

// ===== 心法残卷 =====
const XINFA_SCROLLS = [
  { id: 'scroll_xf_tuna', name: '吐纳法残卷', type: 'xinfa_scroll', xinfa_id: 'tuna', rank: 'wu', cost: 60, desc: '基础呼吸吐纳之法，是修习其他心法的根基。' },
  { id: 'scroll_xf_changchun', name: '长春功残卷', type: 'xinfa_scroll', xinfa_id: 'changchun', rank: 'huang', cost: 140, desc: '延年益寿之功，每次移动后有概率回复体力。' },
  { id: 'scroll_xf_taiyi', name: '太乙心法残卷', type: 'xinfa_scroll', xinfa_id: 'taiyi', rank: 'huang', cost: 140, desc: '太乙门镇派心法，每刻回复内力和体力。' },
  { id: 'scroll_xf_jinshan', name: '金身心法残卷', type: 'xinfa_scroll', xinfa_id: 'jinshan', rank: 'xuan', cost: 350, desc: '防御属性转化为攻击力，每1点防御增加0.5点攻击。' },
  { id: 'scroll_xf_jinghong', name: '惊鸿步法残卷', type: 'xinfa_scroll', xinfa_id: 'jinghong', rank: 'xuan', cost: 380, desc: '战斗开始时身法临时提升50%，持续3回合。' },
  { id: 'scroll_xf_yijin', name: '易筋经残卷', type: 'xinfa_scroll', xinfa_id: 'yijin', rank: 'di', cost: 800, desc: '少林至宝，洗髓伐骨，每刻回复5%最大生命值。' },
  { id: 'scroll_xf_jiuyang', name: '九阳神功残卷', type: 'xinfa_scroll', xinfa_id: 'jiuyang', rank: 'di', cost: 850, desc: '九阴真经阳刚篇，内力生生不息。' },
  { id: 'scroll_xf_taiji', name: '太极拳经残卷', type: 'xinfa_scroll', xinfa_id: 'taiji', rank: 'di', cost: 850, desc: '以柔克刚，后发先至，受到伤害减少20%，闪避率+15%。' },
  { id: 'scroll_xf_taiji_wuji', name: '太初无极功残卷', type: 'xinfa_scroll', xinfa_id: 'taiji_wuji', rank: 'tian', cost: 2000, desc: '太初之始，无极而生，暴击伤害大幅提升，死亡时复活。' },
  { id: 'scroll_xf_chunyang', name: '纯阳真气残卷', type: 'xinfa_scroll', xinfa_id: 'chunyang', rank: 'tian', cost: 2200, desc: '至阳内功，气海属性对内功的加成系数额外提升。' },
]

export const ITEMS = [
  // 武学残卷
  ...MARTIAL_SCROLLS,
  // 心法残卷
  ...XINFA_SCROLLS,

  // ===== 武器 =====

  // 黄级刀
  { id: 'blade_1', name: '铁刀', type: 'weapon', rank: 'huang', weapon_type: 'dao', attrs: { power: 8 }, cost: 50, desc: '普通的铁制朴刀，江湖常见。' },
  { id: 'blade_2', name: '青铜偃月刀', type: 'weapon', rank: 'huang', weapon_type: 'dao', attrs: { power: 14 }, cost: 120, desc: '刀身修长，颇有些分量。' },
  // 玄级刀
  { id: 'blade_3', name: '寒月刀', type: 'weapon', rank: 'xuan', weapon_type: 'dao', attrs: { power: 22, agility: 5 }, cost: 300, desc: '刀身如寒月，削铁如泥。' },
  { id: 'blade_4', name: '血刀', type: 'weapon', rank: 'xuan', weapon_type: 'dao', attrs: { power: 20, luck: 8 }, cost: 350, special: 'lifesteal', special_val: 0.1, desc: '刀刃如血，吸血续命。' },
  // 地级刀
  { id: 'blade_5', name: '霸刀', type: 'weapon', rank: 'di', weapon_type: 'dao', attrs: { power: 35, constitution: 10 }, cost: 800, desc: '刀中之霸，一刀劈出天地变色。' },
  // 天级刀
  { id: 'blade_6', name: '轩辕刀', type: 'weapon', rank: 'tian', weapon_type: 'dao', attrs: { power: 50, qi: 30, power_scale: 0.2 }, cost: 2000, desc: '上古轩辕氏佩刀，刀意浩然。' },

  // 剑
  { id: 'sword_1', name: '铁剑', type: 'weapon', rank: 'huang', weapon_type: 'jian', attrs: { power: 6, qi: 5 }, cost: 60, desc: '普通铁剑，习剑者最常用的武器。' },
  { id: 'sword_2', name: '青钢剑', type: 'weapon', rank: 'huang', weapon_type: 'jian', attrs: { power: 10, qi: 8 }, cost: 130, desc: '青钢所铸，剑身清亮。' },
  { id: 'sword_3', name: '碧海剑', type: 'weapon', rank: 'xuan', weapon_type: 'jian', attrs: { power: 16, qi: 18 }, cost: 320, desc: '如碧海之深，剑气内敛。' },
  { id: 'sword_4', name: '九幽冥剑', type: 'weapon', rank: 'xuan', weapon_type: 'jian', attrs: { power: 18, qi: 20, luck: 5 }, cost: 380, desc: '出自九幽，剑意阴寒。' },
  { id: 'sword_5', name: '太极剑', type: 'weapon', rank: 'di', weapon_type: 'jian', attrs: { power: 25, qi: 30, constitution: 12 }, cost: 900, special: 'defense', special_val: 15, desc: '武当至宝，以柔克刚。' },
  { id: 'sword_6', name: '倚天剑', type: 'weapon', rank: 'tian', weapon_type: 'jian', attrs: { power: 45, qi: 40, power_scale: 0.2 }, cost: 2200, desc: '武林至尊宝剑，削铁如泥。' },

  // 枪
  { id: 'spear_1', name: '长枪', type: 'weapon', rank: 'huang', weapon_type: 'qiang', attrs: { power: 12 }, cost: 80, desc: '普通长枪，一寸长一寸强。' },
  { id: 'spear_2', name: '寒铁枪', type: 'weapon', rank: 'huang', weapon_type: 'qiang', attrs: { power: 16, agility: 4 }, cost: 150, desc: '寒铁打造，枪尖泛着寒光。' },
  { id: 'spear_3', name: '龙胆枪', type: 'weapon', rank: 'xuan', weapon_type: 'qiang', attrs: { power: 24, agility: 8 }, cost: 340, desc: '形如龙胆，一枪刺出如龙出渊。' },
  { id: 'spear_4', name: '霸王枪', type: 'weapon', rank: 'di', weapon_type: 'qiang', attrs: { power: 38, constitution: 8 }, cost: 850, desc: '霸王所使用的长枪，重而不滞。' },

  // 棍
  { id: 'staff_1', name: '木棍', type: 'weapon', rank: 'wu', weapon_type: 'gun', attrs: { power: 4 }, cost: 15, desc: '普通木棍，便宜实用。' },
  { id: 'staff_2', name: '铁棍', type: 'weapon', rank: 'huang', weapon_type: 'gun', attrs: { power: 12, constitution: 5 }, cost: 100, desc: '铁制长棍，挥舞间虎虎生风。' },
  { id: 'staff_3', name: '伏魔棍', type: 'weapon', rank: 'xuan', weapon_type: 'gun', attrs: { power: 20, constitution: 10 }, cost: 300, desc: '少林伏魔之棍，重逾百斤。' },
  { id: 'staff_4', name: '西天棍', type: 'weapon', rank: 'di', weapon_type: 'gun', attrs: { power: 30, qi: 20, constitution: 15 }, cost: 750, desc: '取经路上的护法之棍，有莫大威能。' },

  // 扇
  { id: 'fan_1', name: '竹骨折扇', type: 'weapon', rank: 'wu', weapon_type: 'shan', attrs: { qi: 8 }, cost: 30, desc: '书生常备，看似无用实有杀机。' },
  { id: 'fan_2', name: '玉骨扇', type: 'weapon', rank: 'huang', weapon_type: 'shan', attrs: { qi: 14, agility: 5 }, cost: 120, desc: '玉骨折扇，内藏利刃。' },
  { id: 'fan_3', name: '月华扇', type: 'weapon', rank: 'xuan', weapon_type: 'shan', attrs: { qi: 24, luck: 8 }, cost: 350, desc: '扇面绘有月华，摇动间有月华真气溢出。' },
  { id: 'fan_4', name: '流影扇', type: 'weapon', rank: 'di', weapon_type: 'shan', attrs: { qi: 35, agility: 12, luck: 10 }, cost: 800, special: 'dodge', special_val: 10, desc: '摇扇间身法骤增，令敌无从捉摸。' },

  // 琴
  { id: 'zither_1', name: '古琴', type: 'weapon', rank: 'huang', weapon_type: 'qin', attrs: { qi: 15, luck: 3 }, cost: 100, desc: '普通古琴，音色尚可。' },
  { id: 'zither_2', name: '焦尾琴', type: 'weapon', rank: 'xuan', weapon_type: 'qin', attrs: { qi: 28, comprehension: 8 }, cost: 320, desc: '名贵古琴，相传为蔡邕所制。' },
  { id: 'zither_3', name: '高山流水琴', type: 'weapon', rank: 'di', weapon_type: 'qin', attrs: { qi: 45, qi_regen: 5 }, cost: 880, desc: '知音难觅，琴声杀人亦救人。' },

  // 笔
  { id: 'brush_1', name: '狼毫笔', type: 'weapon', rank: 'wu', weapon_type: 'bi', attrs: { qi: 6 }, cost: 20, desc: '普通毛笔，聊胜于无。' },
  { id: 'brush_2', name: '铁骨折扇', type: 'weapon', rank: 'huang', weapon_type: 'bi', attrs: { qi: 12, power: 5 }, cost: 80, desc: '以铁为骨，是书生的防身利器。' },
  { id: 'brush_3', name: '判官笔', type: 'weapon', rank: 'xuan', weapon_type: 'bi', attrs: { qi: 22, comprehension: 10 }, cost: 280, desc: '笔走龙蛇，点穴认穴，胜似判官。' },
  { id: 'brush_4', name: '龙骨墨笔', type: 'weapon', rank: 'di', weapon_type: 'bi', attrs: { qi: 36, power: 10, comprehension: 12 }, cost: 780, desc: '以龙骨为杆，墨迹如龙出海。' },

  // ===== 防具 =====
  { id: 'armor_1', name: '布衣', type: 'armor', rank: 'wu', attrs: { defense: 3 }, cost: 20, desc: '普通布衣，聊胜于无。' },
  { id: 'armor_2', name: '皮甲', type: 'armor', rank: 'huang', attrs: { defense: 8, agility: -2 }, cost: 80, desc: '皮革所制，轻便但防御一般。' },
  { id: 'armor_3', name: '锁子甲', type: 'armor', rank: 'huang', attrs: { defense: 15, constitution: 5 }, cost: 180, desc: '铁环相扣而成，防护力不错。' },
  { id: 'armor_4', name: '软猬甲', type: 'armor', rank: 'xuan', attrs: { defense: 20, constitution: 10, dodge: 5 }, cost: 400, desc: '以软猬之皮所制，刀枪不入。' },
  { id: 'armor_5', name: '金丝甲', type: 'armor', rank: 'di', attrs: { defense: 30, constitution: 15, agility: 5 }, cost: 900, desc: '金丝编织，轻如无物却刀枪难入。' },
  { id: 'armor_6', name: '天蚕宝甲', type: 'armor', rank: 'tian', attrs: { defense: 50, constitution: 25, hp: 100 }, cost: 2000, desc: '天蚕丝所织，传说是仙人之物。' },

  // ===== 饰品 =====
  { id: 'acc_1', name: '铜戒指', type: 'accessory', rank: 'wu', attrs: { luck: 3 }, cost: 30, desc: '普通铜戒，可小量提升运气。' },
  { id: 'acc_2', name: '玉佩', type: 'accessory', rank: 'huang', attrs: { qi: 20, qi_regen: 2 }, cost: 120, desc: '随身玉佩，可小幅提升内力上限与回复。' },
  { id: 'acc_3', name: '护腕', type: 'accessory', rank: 'huang', attrs: { power: 5, agility: 3 }, cost: 150, desc: '习武之人常备。' },
  { id: 'acc_4', name: '银项链', type: 'accessory', rank: 'xuan', attrs: { luck: 12, constitution: 8 }, cost: 350, desc: '银质项链，佩之可避邪挡灾。' },
  { id: 'acc_5', name: '玉如意', type: 'accessory', rank: 'xuan', attrs: { qi: 40, hp: 50, qi_regen: 5 }, cost: 500, desc: '和田玉如意，内含灵韵。' },
  { id: 'acc_6', name: '龙凤佩', type: 'accessory', rank: 'di', attrs: { luck: 20, qi: 60, constitution: 15 }, cost: 1000, desc: '龙凤呈祥之玉佩，极为罕见。' },
  { id: 'acc_7', name: '天珠', type: 'accessory', rank: 'tian', attrs: { luck: 30, power: 20, qi: 50, constitution: 20, agility: 15 }, cost: 3000, desc: '神僧遗珠，内蕴无穷力量。' },

  // ===== 消耗品 =====
  { id: 'drug_1', name: '金创药', type: 'consumable', rank: 'huang', effect: { hp: 50 }, cost: 20, desc: '江湖行走必备，可回复50点生命。' },
  { id: 'drug_2', name: '上等金创药', type: 'consumable', rank: 'huang', effect: { hp: 120 }, cost: 60, desc: '药效更好的金创药。' },
  { id: 'drug_3', name: '玄级金创药', type: 'consumable', rank: 'xuan', effect: { hp: 250 }, cost: 150, desc: '玄门秘方，疗效显著。' },
  { id: 'drug_4', name: '回气散', type: 'consumable', rank: 'huang', effect: { qi: 50 }, cost: 30, desc: '回复50点内力。' },
  { id: 'drug_5', name: '上品回气散', type: 'consumable', rank: 'xuan', effect: { qi: 120 }, cost: 100, desc: '内功深厚者调制，疗效显著。' },
  { id: 'drug_6', name: '体力丸', type: 'consumable', rank: 'huang', effect: { stamina: 30 }, cost: 25, desc: '恢复30点体力。' },
  { id: 'drug_7', name: '解毒丸', type: 'consumable', rank: 'huang', effect: { cure: 'poison' }, cost: 40, desc: '可解一般毒素。' },
  { id: 'drug_8', name: '续命丹', type: 'consumable', rank: 'xuan', effect: { hp: 500, qi: 100 }, cost: 400, desc: '珍稀丹药，危难时刻可救命。' },
  { id: 'drug_9', name: '大还丹', type: 'consumable', rank: 'di', effect: { hp: 800, qi: 200, buff: { 属性: '根骨', 值: 10, 回合: 10 } }, cost: 800, desc: '少林秘宝，服之可大增修为。' },
  { id: 'drug_10', name: '九转灵童', type: 'consumable', rank: 'tian', effect: { hp: 2000, qi: 500, buff: { 属性: '气海', 值: 30, 回合: 15 } }, cost: 3000, desc: '传说可生死人肉白骨的仙丹。' },

  // ===== 材料 =====
  { id: 'mat_1', name: '玄铁', type: 'material', rank: 'xuan', cost: 200, desc: '炼制神兵的上等材料。' },
  { id: 'mat_2', name: '千年古玉', type: 'material', rank: 'di', cost: 500, desc: '蕴含灵气的古玉，可镶嵌在武器上。' },
  { id: 'mat_3', name: '天山雪莲', type: 'material', rank: 'di', cost: 600, desc: '天山峰顶所产，可入药或直接服用。' },
  { id: 'mat_4', name: '蛊虫王', type: 'material', rank: 'xuan', cost: 300, desc: '南疆蛊师所养的蛊中之王。' },
  { id: 'mat_5', name: '龙鳞', type: 'material', rank: 'tian', cost: 2000, desc: '蛟龙之鳞片，坚硬无比。' },
]

export function getItemsByRank (rank) {
  return ITEMS.filter(i => i.rank === rank)
}

export function getItemsByType (type) {
  return ITEMS.filter(i => i.type === type)
}

export function getItemById (id) {
  return ITEMS.find(i => i.id === id) || null
}

// 获取背包中的武学残卷
export function getMartialScrollsFromInventory (inventory) {
  return (inventory || []).map(inv => {
    const item = getItemById(inv.item_id)
    if (!item || item.type !== 'martial_scroll') return null
    return { ...item, quantity: inv.quantity }
  }).filter(Boolean)
}

// 获取背包中的心法残卷
export function getXinfaScrollsFromInventory (inventory) {
  return (inventory || []).map(inv => {
    const item = getItemById(inv.item_id)
    if (!item || item.type !== 'xinfa_scroll') return null
    return { ...item, quantity: inv.quantity }
  }).filter(Boolean)
}
