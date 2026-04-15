// 命途问答数据（5道，每道4个选项）

export const FATE_QUESTIONS = [
  {
    id: 'q1',
    question: '你出生之日，天象异动。抬头仰望，你认为那是？',
    options: [
      { text: '烈日当空，万丈光芒', effect: { 力量: 3, 耐力: 2 }, hint: '你注定力大无穷' },
      { text: '寒星点点，清冷孤高', effect: { 气海: 3, 悟性: 2 }, hint: '你天生内功深厚' },
      { text: '云淡风轻，宁静致远', effect: { 根骨: 3, 耐力: 2 }, hint: '你根基稳固，不易倒下' },
      { text: '雷电交加，风雨欲来', effect: { 身法: 3, 幸运: 3 }, hint: '你身手敏捷，运气不凡' },
    ]
  },
  {
    id: 'q2',
    question: '幼时在后山嬉戏，你在地上捡到了一本？',
    options: [
      { text: '泛黄的武学拳谱', effect: { 力量: 4 }, hint: '你的外功天赋极高' },
      { text: '奇异的内功残卷', effect: { 气海: 4 }, hint: '你的内功资质不凡' },
      { text: '绝代神医的笔记', effect: { 幸运: 5 }, hint: '你与机缘极为有缘' },
      { text: '一本无字的空白书册', effect: { 悟性: 5 }, hint: '你天资卓绝，可自创武学' },
    ]
  },
  {
    id: 'q3',
    question: '师父第一次见你，问你：「你为何习武？」你答：',
    options: [
      { text: '为报家仇，血债血偿', effect: { 力量: 3, 幸运: -1 }, hint: '你的复仇心让你更强，但有时也会鲁莽' },
      { text: '为强身健体，延年益寿', effect: { 根骨: 4 }, hint: '你注重根基，身体强健' },
      { text: '为行走江湖，快意恩仇', effect: { 身法: 3, 悟性: 2 }, hint: '你轻功卓越，悟性极高' },
      { text: '为除暴安良，济世救人', effect: { 气海: 2, 幸运: 3 }, hint: '你的正义感会引来更多机缘' },
    ]
  },
  {
    id: 'q4',
    question: '江湖险恶，你的第一次生死抉择：敌人刀锋已至，你选择：',
    options: [
      { text: '正面硬接，以力破力', effect: { 力量: 5, 根骨: 1 }, hint: '你臂力过人，善于正面交锋' },
      { text: '以柔克刚，卸力反击', effect: { 气海: 3, 悟性: 3 }, hint: '你善于借力，悟性非凡' },
      { text: '闪身躲避，寻隙反攻', effect: { 身法: 5 }, hint: '你身法绝伦，来去如风' },
      { text: '以命换命，同归于尽', effect: { 力量: 3, 耐力: 3, 幸运: 1 }, hint: '你悍不畏死，极为耐打' },
    ]
  },
  {
    id: 'q5',
    question: '多年后，你回首往事，觉得自己的命运是：',
    options: [
      { text: '一把未出鞘的利剑', effect: { 气海: 5 }, hint: '内力内敛，一发惊人' },
      { text: '一棵扎根深山的老松', effect: { 根骨: 5 }, hint: '根基深厚，难以撼动' },
      { text: '一阵飘忽不定的清风', effect: { 身法: 5 }, hint: '来无影去无踪，无人能挡' },
      { text: '一轮明月照大江', effect: { 悟性: 5 }, hint: '心如明镜，洞察万物' },
    ]
  },
]

// 根据seed选取固定5道题（从题库随机抽取）
export function getRandomQuestions (seed = Date.now()) {
  const shuffled = [...FATE_QUESTIONS].sort((a, b) => {
    const sa = (seed * (a.id.charCodeAt(1) || 1)) % 1000
    const sb = (seed * (b.id.charCodeAt(1) || 1)) % 1000
    return sa - sb
  })
  return shuffled.slice(0, 5)
}

// 初始属性（不计问答加成）
export const BASE_ATTRS = {
  力量: 10,
  气海: 10,
  身法: 10,
  耐力: 10,
  根骨: 10,
  悟性: 10,
  幸运: 10,
}

export const BASE_HP = 100
export const BASE_QI = 80
export const BASE_STAMINA = 100
