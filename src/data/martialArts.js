// 武学数据库
// type: 'external'(外功) | 'internal'(内功) | 'unarmed'(空手)
// rank: 'tian'|'di'|'xuan'|'huang'|'wu'

export const MARTIAL_RANKS = ['tian', 'di', 'xuan', 'huang', 'wu']

export const MARTIAL_ARTS = [
  // ========== 外功·刀 ==========
  { id: 'badao', name: '霸刀九式', type: 'external', weapon: 'dao', rank: 'tian', desc: '刀中之霸，一刀劈出，天地变色。', attrs: { power: 25, agility: 5 }, masteryBonus: { power: 3.0, agility: 0.3 }, effects: [{ type: 'damage', attr: 'power', mult: 2.5, consume: { stamina: 30 } }] },
  { id: 'xuanyuan', name: '轩辕刀法', type: 'external', weapon: 'dao', rank: 'di', desc: '上古轩辕氏所创，刀意浩然。', attrs: { power: 20, constitution: 8 }, masteryBonus: { power: 2.5, constitution: 1.0 }, effects: [{ type: 'damage', attr: 'power', mult: 2.2, consume: { stamina: 25 } }] },
  { id: 'kuangfeng', name: '狂风刀法', type: 'external', weapon: 'dao', rank: 'huang', desc: '刀势如狂风，连绵不绝。', attrs: { power: 12, agility: 4 }, masteryBonus: { power: 1.5, agility: 0.5 }, effects: [{ type: 'damage', attr: 'power', mult: 1.6, consume: { stamina: 15 } }] },
  { id: 'xue Zhanfang', name: '血战八方', type: 'external', weapon: 'dao', rank: 'huang', desc: '置之死地而后生，刀刀见血。', attrs: { power: 14, constitution: 2 }, masteryBonus: { power: 1.8 }, effects: [{ type: 'damage', attr: 'power', mult: 1.7, consume: { stamina: 18 } }] },
  { id: 'duanhun', name: '断魂三斩', type: 'external', weapon: 'dao', rank: 'xuan', desc: '三斩断魂，刀刀夺命。', attrs: { power: 17, luck: 3 }, masteryBonus: { power: 2.0, luck: 0.3 }, effects: [{ type: 'damage', attr: 'power', mult: 1.9, consume: { stamina: 20 }, critBonus: 0.1 }] },
  { id: 'huanian', name: '连环刀', type: 'external', weapon: 'dao', rank: 'wu', desc: '简单实用，适合新手修习。', attrs: { power: 6 }, masteryBonus: { power: 0.8 }, effects: [{ type: 'damage', attr: 'power', mult: 1.2, consume: { stamina: 8 } }] },

  // ========== 外功·枪 ==========
  { id: 'tyrant', name: '霸王枪', type: 'external', weapon: 'qiang', rank: 'tian', desc: '一枪刺出，如霸王再世，无人可挡。', attrs: { power: 28, constitution: 5 }, masteryBonus: { power: 3.2, constitution: 0.5 }, effects: [{ type: 'damage', attr: 'power', mult: 2.6, consume: { stamina: 32 } }] },
  { id: 'longwei', name: '龙尾枪法', type: 'external', weapon: 'qiang', rank: 'di', desc: '枪身如龙尾，摆动间取敌首级。', attrs: { power: 18, agility: 8 }, masteryBonus: { power: 2.2, agility: 1.0 }, effects: [{ type: 'damage', attr: 'power', mult: 2.0, consume: { stamina: 22 } }] },
  { id: 'bingqiang', name: '冰魄枪', type: 'external', weapon: 'qiang', rank: 'xuan', desc: '枪尖附寒冰之气，中者血脉冻结。', attrs: { power: 16, qi: 6 }, masteryBonus: { power: 2.0, qi: 0.5 }, effects: [{ type: 'damage', attr: 'power', mult: 1.8, consume: { stamina: 20 }, debuff: 'frozen' }] },
  { id: 'luanshi', name: '乱世枪', type: 'external', weapon: 'qiang', rank: 'huang', desc: '乱世间求存的一套枪法，快准狠。', attrs: { power: 12, agility: 5 }, masteryBonus: { power: 1.5, agility: 0.6 }, effects: [{ type: 'damage', attr: 'power', mult: 1.5, consume: { stamina: 14 } }] },
  { id: 'changqiang', name: '长枪术', type: 'external', weapon: 'qiang', rank: 'wu', desc: '基础枪法，易学难精。', attrs: { power: 7 }, masteryBonus: { power: 0.9 }, effects: [{ type: 'damage', attr: 'power', mult: 1.3, consume: { stamina: 10 } }] },

  // ========== 外功·斧 ==========
  { id: 'pangu', name: '盘古开天斧', type: 'external', weapon: 'fu', rank: 'tian', desc: '开天辟地之力，斧落山崩。', attrs: { power: 30, constitution: 8 }, masteryBonus: { power: 3.5, constitution: 1.0 }, effects: [{ type: 'damage', attr: 'power', mult: 3.0, consume: { stamina: 40 } }] },
  { id: 'tianjiang', name: '天降斧', type: 'external', weapon: 'fu', rank: 'di', desc: '如天外飞仙般的一斧，势不可挡。', attrs: { power: 22, luck: 5 }, masteryBonus: { power: 2.6, luck: 0.5 }, effects: [{ type: 'damage', attr: 'power', mult: 2.4, consume: { stamina: 28 }, critBonus: 0.15 }] },
  { id: 'bimofengkuang', name: '碧魔疯狂斧', type: 'external', weapon: 'fu', rank: 'xuan', desc: '入魔之后方能发挥全部威力。', attrs: { power: 18, power_loss: 5 }, masteryBonus: { power: 2.2 }, effects: [{ type: 'damage', attr: 'power', mult: 2.0, consume: { stamina: 24 } }] },
  { id: 'shengfu', name: '剩斧术', type: 'external', weapon: 'fu', rank: 'huang', desc: '战场剩将所用，大巧若拙。', attrs: { power: 13 }, masteryBonus: { power: 1.6 }, effects: [{ type: 'damage', attr: 'power', mult: 1.6, consume: { stamina: 16 } }] },
  { id: 'shuangfu', name: '双斧流', type: 'external', weapon: 'fu', rank: 'wu', desc: '双斧交替，攻守兼备。', attrs: { power: 8, agility: 2 }, masteryBonus: { power: 1.0, agility: 0.2 }, effects: [{ type: 'damage', attr: 'power', mult: 1.3, consume: { stamina: 12 } }] },

  // ========== 外功·棍 ==========
  { id: 'xiitian', name: '西天伏魔棍', type: 'external', weapon: 'gun', rank: 'tian', desc: '取经路上的护法之棍，威力无穷。', attrs: { power: 22, qi: 15, constitution: 5 }, masteryBonus: { power: 2.8, qi: 1.5, constitution: 0.5 }, effects: [{ type: 'damage', attr: 'power', mult: 2.5, consume: { stamina: 28 }, buff: { type: 'defense', val: 20, dur: 2 } }] },
  { id: 'weituo', name: '韦陀棍', type: 'external', weapon: 'gun', rank: 'di', desc: '少林护法神功，攻守兼备。', attrs: { power: 18, constitution: 8 }, masteryBonus: { power: 2.0, constitution: 1.0 }, effects: [{ type: 'damage', attr: 'power', mult: 1.9, consume: { stamina: 22 } }] },
  { id: 'tiejin', name: '铁棍破风', type: 'external', weapon: 'gun', rank: 'xuan', desc: '棍风如雷，中者筋断骨折。', attrs: { power: 15, agility: 5 }, masteryBonus: { power: 1.8, agility: 0.5 }, effects: [{ type: 'damage', attr: 'power', mult: 1.7, consume: { stamina: 18 } }] },
  { id: 'luohan', name: '罗汉棍', type: 'external', weapon: 'gun', rank: 'huang', desc: '少林入门武学，扎实根基。', attrs: { power: 11, constitution: 3 }, masteryBonus: { power: 1.4, constitution: 0.3 }, effects: [{ type: 'damage', attr: 'power', mult: 1.4, consume: { stamina: 14 } }] },
  { id: 'gunfa', name: '基础棍法', type: 'external', weapon: 'gun', rank: 'wu', desc: '江湖把式，人人都会几手。', attrs: { power: 5 }, masteryBonus: { power: 0.6 }, effects: [{ type: 'damage', attr: 'power', mult: 1.1, consume: { stamina: 8 } }] },

  // ========== 内功·剑 ==========
  { id: 'chongyue', name: '冲岳九剑', type: 'internal', weapon: 'jian', rank: 'tian', desc: '九剑齐出，可冲山岳，剑意惊天。', attrs: { qi: 30, power: 10, luck: 5 }, masteryBonus: { qi: 3.5, power: 1.0, luck: 0.5 }, effects: [{ type: 'damage', attr: 'qi', mult: 3.0, consume: { qi: 40 } }] },
  { id: 'biyu', name: '碧海潮生剑', type: 'internal', weapon: 'jian', rank: 'di', desc: '剑势如潮，一浪高过一浪，生生不息。', attrs: { qi: 25, agility: 10 }, masteryBonus: { qi: 3.0, agility: 1.2 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.5, consume: { qi: 32 } }] },
  { id: 'jiuyou', name: '九幽玄天剑', type: 'internal', weapon: 'jian', rank: 'di', desc: '出自九幽之地，剑意阴寒彻骨。', attrs: { qi: 22, luck: 8 }, masteryBonus: { qi: 2.8, luck: 0.8 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.3, consume: { qi: 30 }, debuff: 'frozen' }] },
  { id: 'luoxia', name: '落霞孤鹜剑', type: 'internal', weapon: 'jian', rank: 'xuan', desc: '晚霞与孤雁齐飞，剑光与夕阳一色。', attrs: { qi: 18, agility: 6 }, masteryBonus: { qi: 2.2, agility: 0.7 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.0, consume: { qi: 24 } }] },
  { id: 'qiankun', name: '乾坤一剑', type: 'internal', weapon: 'jian', rank: 'xuan', desc: '凝聚乾坤之力于一剑，天地变色。', attrs: { qi: 20, power: 5 }, masteryBonus: { qi: 2.4, power: 0.6 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.1, consume: { qi: 26 } }] },
  { id: 'qingsong', name: '青松剑法', type: 'internal', weapon: 'jian', rank: 'huang', desc: '如青松挺立，剑势沉稳。', attrs: { qi: 12, constitution: 4 }, masteryBonus: { qi: 1.5, constitution: 0.4 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.5, consume: { qi: 16 } }] },
  { id: 'wuji', name: '无极剑道', type: 'internal', weapon: 'jian', rank: 'huang', desc: '剑道无极限，进无止境。', attrs: { qi: 10, agility: 5 }, masteryBonus: { qi: 1.2, agility: 0.6 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.4, consume: { qi: 14 } }] },
  { id: 'jianfa', name: '基础剑法', type: 'internal', weapon: 'jian', rank: 'wu', desc: '江湖中最为流传的剑法，入门之基。', attrs: { qi: 6 }, masteryBonus: { qi: 0.7 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.0, consume: { qi: 10 } }] },

  // ========== 内功·扇 ==========
  { id: 'yuehua', name: '月华流影扇', type: 'internal', weapon: 'shan', rank: 'di', desc: '扇如月华，流光溢彩，中者神魂颠倒。', attrs: { qi: 22, luck: 12 }, masteryBonus: { qi: 2.6, luck: 1.2 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.2, consume: { qi: 28 }, debuff: 'confused' }] },
  { id: 'tianxia', name: '天下无扇', type: 'internal', weapon: 'shan', rank: 'xuan', desc: '一把折扇，可平天下不平事。', attrs: { qi: 16, agility: 8 }, masteryBonus: { qi: 2.0, agility: 0.8 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.7, consume: { qi: 20 }, buff: { type: 'dodge', val: 15, dur: 2 } }] },
  { id: 'luoyan', name: '落雁扇', type: 'internal', weapon: 'shan', rank: 'huang', desc: '落雁于天，扇出如风。', attrs: { qi: 11, agility: 5 }, masteryBonus: { qi: 1.3, agility: 0.6 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.3, consume: { qi: 14 } }] },
  { id: 'shanfa', name: '基础扇法', type: 'internal', weapon: 'shan', rank: 'wu', desc: '文人雅士的防身之技。', attrs: { qi: 5 }, masteryBonus: { qi: 0.6 }, effects: [{ type: 'damage', attr: 'qi', mult: 0.9, consume: { qi: 8 } }] },

  // ========== 内功·琴 ==========
  { id: 'guqin', name: '高山流水琴', type: 'internal', weapon: 'qin', rank: 'di', desc: '知音难觅，琴声杀人。知音之人可退敌，无知音则伤人。', attrs: { qi: 25, luck: 10, comprehension: 5 }, masteryBonus: { qi: 3.0, luck: 1.0, comprehension: 0.5 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.5, consume: { qi: 35 }, debuff: 'silence' }, { type: 'heal', attr: 'qi', mult: 0.5, consume: { qi: 15 } }] },
  { id: 'xiayou', name: '夏呦曲', type: 'internal', weapon: 'qin', rank: 'xuan', desc: '以蝉鸣夏为音，扰乱心神。', attrs: { qi: 18, luck: 6 }, masteryBonus: { qi: 2.2, luck: 0.6 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.9, consume: { qi: 22 }, debuff: 'confused' }] },
  { id: 'tianlu', name: '天籁音', type: 'internal', weapon: 'qin', rank: 'huang', desc: '如闻天籁，令人沉醉其中。', attrs: { qi: 12 }, masteryBonus: { qi: 1.4 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.4, consume: { qi: 16 }, healSelf: { hp: 10 } }] },
  { id: 'qinpu', name: '基础琴法', type: 'internal', weapon: 'qin', rank: 'wu', desc: '书香门第的必修功课。', attrs: { qi: 5 }, masteryBonus: { qi: 0.5 }, effects: [{ type: 'damage', attr: 'qi', mult: 0.8, consume: { qi: 8 } }] },

  // ========== 内功·笔 ==========
  { id: 'tieshi', name: '铁石心肠笔', type: 'internal', weapon: 'bi', rank: 'di', desc: '笔走龙蛇，字字如刀，杀人于笔墨之间。', attrs: { qi: 20, power: 8, comprehension: 6 }, masteryBonus: { qi: 2.5, power: 1.0, comprehension: 0.6 }, effects: [{ type: 'damage', attr: 'qi', mult: 2.2, consume: { qi: 26 } }] },
  { id: 'longmen', name: '龙门墨客笔', type: 'internal', weapon: 'bi', rank: 'xuan', desc: '墨迹如龙出海，气势恢宏。', attrs: { qi: 15, power: 6 }, masteryBonus: { qi: 1.8, power: 0.7 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.7, consume: { qi: 18 } }] },
  { id: 'moshui', name: '墨舞飞扬', type: 'internal', weapon: 'bi', rank: 'huang', desc: '以笔代剑，墨迹所至，皆是杀招。', attrs: { qi: 10, agility: 4 }, masteryBonus: { qi: 1.2, agility: 0.5 }, effects: [{ type: 'damage', attr: 'qi', mult: 1.3, consume: { qi: 14 } }] },
  { id: 'bifa', name: '基础笔法', type: 'internal', weapon: 'bi', rank: 'wu', desc: '书生防身之术，点到为止。', attrs: { qi: 5 }, masteryBonus: { qi: 0.5 }, effects: [{ type: 'damage', attr: 'qi', mult: 0.8, consume: { qi: 8 } }] },

  // ========== 空手·拳 ==========
  { id: 'suanni', name: '碎骨震天拳', type: 'unarmed', weapon: null, rank: 'di', desc: '拳可碎骨，势可震天，一拳开山裂石。', attrs: { power: 25, constitution: 10 }, masteryBonus: { power: 3.0, constitution: 1.2 }, unarmedMult: 1.5, effects: [{ type: 'damage', attr: 'power', mult: 2.4, consume: { stamina: 28 } }] },
  { id: 'dashuai', name: '大摔碑手', type: 'unarmed', weapon: null, rank: 'di', desc: '可将石碑连人一起摔出，威猛无匹。', attrs: { power: 20, constitution: 12 }, masteryBonus: { power: 2.5, constitution: 1.5 }, unarmedMult: 1.5, effects: [{ type: 'damage', attr: 'power', mult: 2.2, consume: { stamina: 30 } }] },
  { id: 'longyin', name: '龙吟铁砂掌', type: 'unarmed', weapon: null, rank: 'xuan', desc: '铁砂中修炼而成，掌力如龙吟。', attrs: { power: 16, constitution: 8 }, masteryBonus: { power: 2.0, constitution: 1.0 }, unarmedMult: 1.4, effects: [{ type: 'damage', attr: 'power', mult: 1.8, consume: { stamina: 22 } }] },
  { id: 'posui', name: '破碑拳', type: 'unarmed', weapon: null, rank: 'huang', desc: '专门为破碑而创，却也适合实战。', attrs: { power: 12, constitution: 4 }, masteryBonus: { power: 1.5, constitution: 0.5 }, unarmedMult: 1.3, effects: [{ type: 'damage', attr: 'power', mult: 1.5, consume: { stamina: 16 } }] },
  { id: 'suanguniang', name: '酸丫头乱披风拳', type: 'unarmed', weapon: null, rank: 'huang', desc: '看似杂乱无章，实则拳拳有章法。', attrs: { power: 10, agility: 6 }, masteryBonus: { power: 1.3, agility: 0.7 }, unarmedMult: 1.3, effects: [{ type: 'damage', attr: 'power', mult: 1.4, consume: { stamina: 14 } }] },
  { id: 'quanji', name: '基础拳法', type: 'unarmed', weapon: null, rank: 'wu', desc: '江湖把式，强身健体。', attrs: { power: 5, constitution: 2 }, masteryBonus: { power: 0.6, constitution: 0.2 }, unarmedMult: 1.2, effects: [{ type: 'damage', attr: 'power', mult: 1.0, consume: { stamina: 10 } }] },

  // ========== 空手·腿 ==========
  { id: 'xuanyuan', name: '旋风无影腿', type: 'unarmed', weapon: null, rank: 'di', desc: '腿如旋风，来无影去无踪，连环踢出。', attrs: { power: 22, agility: 15, luck: 3 }, masteryBonus: { power: 2.8, agility: 1.8, luck: 0.3 }, unarmedMult: 1.5, effects: [{ type: 'damage', attr: 'power', mult: 2.3, consume: { stamina: 26 }, multi: 2 }] },
  { id: 'tiandi', name: '天地连环腿', type: 'unarmed', weapon: null, rank: 'xuan', desc: '天地之间，腿无处不到，连环十八踢。', attrs: { power: 16, agility: 10 }, masteryBonus: { power: 2.0, agility: 1.2 }, unarmedMult: 1.4, effects: [{ type: 'damage', attr: 'power', mult: 1.8, consume: { stamina: 20 }, multi: 1.5 }] },
  { id: 'feihua', name: '飞花落叶腿', type: 'unarmed', weapon: null, rank: 'huang', desc: '腿如飞花落叶，轻盈灵动。', attrs: { power: 11, agility: 8 }, masteryBonus: { power: 1.4, agility: 1.0 }, unarmedMult: 1.3, effects: [{ type: 'damage', attr: 'power', mult: 1.4, consume: { stamina: 14 }, dodgeBonus: 5 }] },
  { id: 'tuiji', name: '基础腿法', type: 'unarmed', weapon: null, rank: 'wu', desc: '练武之人必学的基本功。', attrs: { power: 6, agility: 3 }, masteryBonus: { power: 0.7, agility: 0.4 }, unarmedMult: 1.2, effects: [{ type: 'damage', attr: 'power', mult: 1.1, consume: { stamina: 10 } }] },

  // ========== 空手·掌 ==========
  { id: 'tianlao', name: '天劳破云掌', type: 'unarmed', weapon: null, rank: 'di', desc: '一掌可破云裂天，霸道绝伦。', attrs: { power: 24, qi: 8, constitution: 6 }, masteryBonus: { power: 3.0, qi: 0.8, constitution: 0.6 }, unarmedMult: 1.5, effects: [{ type: 'damage', attr: 'power', mult: 2.5, consume: { stamina: 30 } }] },
  { id: 'honglian', name: '红莲烈焰掌', type: 'unarmed', weapon: null, rank: 'xuan', desc: '掌力如红莲业火，中者五内俱焚。', attrs: { power: 18, qi: 10 }, masteryBonus: { power: 2.2, qi: 1.2 }, unarmedMult: 1.4, effects: [{ type: 'damage', attr: 'power', mult: 2.0, consume: { stamina: 24 }, dot: { dmg: 8, dur: 3 } }] },
  { id: 'baihua', name: '百花羞掌', type: 'unarmed', weapon: null, rank: 'huang', desc: '掌法柔美，却暗藏杀机。', attrs: { power: 12, agility: 5 }, masteryBonus: { power: 1.5, agility: 0.6 }, unarmedMult: 1.3, effects: [{ type: 'damage', attr: 'power', mult: 1.5, consume: { stamina: 16 } }] },
  { id: 'zhangfa', name: '基础掌法', type: 'unarmed', weapon: null, rank: 'wu', desc: '江湖常见的掌法，攻防兼备。', attrs: { power: 6, constitution: 2 }, masteryBonus: { power: 0.7, constitution: 0.2 }, unarmedMult: 1.2, effects: [{ type: 'damage', attr: 'power', mult: 1.0, consume: { stamina: 10 } }] },

  // ========== 空手·指 ==========
  { id: 'duzun', name: '毒尊点穴手', type: 'unarmed', weapon: null, rank: 'di', desc: '点穴认穴分毫不差，一指点下，生死立判。', attrs: { power: 18, qi: 15, comprehension: 8 }, masteryBonus: { power: 2.2, qi: 1.8, comprehension: 1.0 }, unarmedMult: 1.5, effects: [{ type: 'damage', attr: 'qi', mult: 2.0, consume: { stamina: 20, qi: 10 }, debuff: 'paralyze' }] },
  { id: 'tianxian', name: '天仙拈花指', type: 'unarmed', weapon: null, rank: 'xuan', desc: '佛祖拈花一笑，以此指法传世。', attrs: { power: 14, qi: 12 }, masteryBonus: { power: 1.8, qi: 1.4 }, unarmedMult: 1.4, effects: [{ type: 'damage', attr: 'qi', mult: 1.7, consume: { qi: 18 }, debuff: 'weak' }] },
  { id: 'yizh', name: '一阳指', type: 'unarmed', weapon: null, rank: 'huang', desc: '大理段氏绝学，指劲纯阳。', attrs: { power: 12, qi: 8 }, masteryBonus: { power: 1.5, qi: 1.0 }, unarmedMult: 1.3, effects: [{ type: 'damage', attr: 'qi', mult: 1.5, consume: { qi: 14 }, healSelf: { hp: 5 } }] },
  { id: 'zhifa', name: '基础指法', type: 'unarmed', weapon: null, rank: 'wu', desc: '点穴的基本指法，需长期练习。', attrs: { qi: 5 }, masteryBonus: { qi: 0.6 }, unarmedMult: 1.2, effects: [{ type: 'damage', attr: 'qi', mult: 0.9, consume: { qi: 10 } }] },
]

// 心法（被动）
export const XINFA = [
  { id: 'yijin', name: '易筋经', rank: 'di', desc: '少林至宝，洗髓伐骨，提升生命值与根骨。', attrs: { hp: 200, constitution: 15, hp_regen: 5 }, effects: [{ type: 'passive', desc: '每回合回复5%生命值' }] },
  { id: 'xiayin', name: '吸星大法', rank: 'xuan', desc: '北冥神功分支，可吸取他人内力。', attrs: { qi: 100, qi_absorb: 0.1 }, effects: [{ type: 'passive', desc: '每回合吸收敌人10%内力' }] },
  { id: 'jiuyang', name: '九阳神功', rank: 'di', desc: '九阴真经阳刚篇，内力生生不息。', attrs: { qi: 150, stamina_max: 50, qi_regen: 8 }, effects: [{ type: 'passive', desc: '每回合额外回复8点内力' }] },
  { id: 'jiuyin', name: '九阴真经', rank: 'di', desc: '天下武学总纲，包罗万象。', attrs: { qi: 120, power: 8, agility: 8, luck: 5 }, effects: [{ type: 'passive', desc: '所有武学伤害+10%' }] },
  { id: 'taiji', name: '太极拳经', rank: 'xuan', desc: '以柔克刚，后发先至。', attrs: { constitution: 12, dodge: 10, qi: 80 }, effects: [{ type: 'passive', desc: '受到伤害-15%，闪避+10%' }] },
  { id: 'yijing', name: '意境心法', rank: 'huang', desc: '提升武学意境，增强伤害。', attrs: { qi: 50, power: 5 }, effects: [{ type: 'passive', desc: '武学伤害+5%' }] },
  { id: 'zhenshan', name: '镇山心法', rank: 'huang', desc: '沉稳如山，步步为营。', attrs: { constitution: 8, hp: 80 }, effects: [{ type: 'passive', desc: '生命值+80' }] },
  { id: 'jinshan', name: '金身心法', rank: 'xuan', desc: '金钟罩的进阶版，防御惊人。', attrs: { constitution: 15, defense: 20 }, effects: [{ type: 'passive', desc: '防御力+20' }] },
]

export function getMartialByRank (rank) {
  return MARTIAL_ARTS.filter(m => m.rank === rank)
}

export function getMartialByType (type) {
  return MARTIAL_ARTS.filter(m => m.type === type)
}

export function getRandomMartial (rank = null, type = null, seed = Date.now()) {
  let pool = [...MARTIAL_ARTS]
  if (rank) pool = pool.filter(m => m.rank === rank)
  if (type) pool = pool.filter(m => m.type === type)
  const idx = seed % pool.length
  return pool[Math.abs(idx)]
}
