// 世界区域与地点数据
// connections: 每个地点四个方向的邻居（null = 无路可走）
// travelTo: 可传送至哪些大区域（传送门地点）

export const REGION_IDS = ['zhongyuan', 'xiyu', 'nanjiang', 'beihan', 'donghai']

// 地点连接配置（每个区域内部的有向图）
const ZHONGYUAN_CONNECTIONS = {
  qingyun:    { north: 'luoxia',   south: 'tiejiang', east: 'luoyang',  west: 'hantan' },
  luoxia:     { north: 'kuye',    south: 'qingyun',  east: 'songlin',  west: null },
  tiejiang:   { north: 'qingyun', south: 'luofeng',  east: 'longquan', west: null },
  kuye:       { north: 'baihua',  south: 'luoxia',   east: 'wanxiang',west: 'hantan' },
  baihua:     { north: null,     south: 'kuye',     east: 'qingcheng',west: null },
  qingcheng:  { north: 'feilai',  south: 'songlin',  east: 'mingyue',  west: 'baihua' },
  feilai:     { north: null,     south: 'qingcheng', east: null,       west: null },
  songlin:    { north: 'qingcheng', south: 'luofeng', east: 'luoyang',  west: 'luoxia' },
  luoyang:    { north: 'mingyue', south: 'yunmeng',  east: 'huarong',  west: 'songlin' },
  mingyue:    { north: 'guangming', south: 'luoyang', east: 'tianchang', west: 'qingcheng' },
  guangming:  { north: null,     south: 'mingyue',  east: null,       west: null },
  tianchang:  { north: null,     south: 'huarong',   east: 'qingshui', west: 'mingyue' },
  huarong:    { north: 'tianchang', south: 'yunmeng', east: 'luofeng',  west: 'luoyang', travel: ['xiyu', 'beihan'] },
  luofeng:    { north: 'yunmeng',  south: 'linglong', east: null,       west: 'huarong' },
  yunmeng:    { north: 'luoyang',  south: 'luofeng',  east: 'xuanwu',   west: null },
  qingshui:   { north: null,     south: 'longquan',  east: 'taiyi',    west: 'tianchang' },
  longquan:   { north: 'qingshui', south: 'linglong', east: 'taiyi',    west: 'tiejiang' },
  linglong:   { north: 'luofeng',  south: 'taoyuan',  east: null,       west: 'qiankun' },
  taoyuan:    { north: 'linglong', south: 'xuanwu',   east: null,       west: null },
  xuanwu:     { north: 'yunmeng',  south: 'qiankun',  east: null,       west: 'taoyuan' },
  taiyi:      { north: null,     south: 'taiyuan',  east: null,       west: 'qingshui' },
  qiankun:    { north: 'xuanwu',   south: null,       east: null,       west: null },
  taiyuan:    { north: 'taiyi',   south: 'huarong',   east: null,       west: null, travel: ['donghai'] },
  wanxiang:   { north: null,     south: 'guangming', east: 'guangming', west: 'kuye' },
}

const XIYU_CONNECTIONS = {
  liusha:     { north: 'huoyan',  south: 'baituo',   east: 'yushi',    west: null },
  huoyan:     { north: null,     south: 'liusha',   east: 'yushi',    west: null },
  baituo:     { north: 'liusha',  south: 'mozhou',   east: 'lianhua',  west: null },
  yushi:      { north: 'huoyan',  south: 'mozhou',   east: 'gulang',   west: 'liusha', travel: ['zhongyuan', 'nanjiang'] },
  mozhou:     { north: 'yushi',   south: 'xiyang',   east: 'shatuo',   west: 'baituo' },
  lianhua:    { north: null,     south: 'xiyang',   east: 'gualu',    west: 'mozhou' },
  guangyun:   { north: null,     south: 'qixing',   east: null,       west: null },
  gulang:     { north: null,     south: 'jinshan',  east: 'qianjin',  west: 'yushi' },
  jinshan:    { north: 'gulang',  south: null,       east: 'hanzhou',  west: null },
  qianjin:    { north: null,     south: 'shatuo',   east: null,       west: 'gulang' },
  shatuo:     { north: 'qianjin', south: null,       east: 'mingu',    west: 'mozhou' },
  xiyu_ming:  { north: null,     south: null,       east: null,       west: 'xiyang', travel: ['nanjiang', 'beihan'] },
  xiyang:     { north: 'lianhua', south: 'xiyu_ming', east: 'shatuo',  west: 'mozhou' },
  mingu:      { north: null,     south: 'heigu',    east: null,       west: 'shatuo' },
  heigu:      { north: 'mangu',   south: 'simao',    east: null,       west: null },
  Gualu:     { north: null,     south: 'guangyun', east: 'qixing',   west: 'lianhua' },
  hanhai:     { north: null,     south: null,        east: 'guangyun', west: null },
  qixing:     { north: 'guangyun', south: null,      east: 'heigu',    west: 'guangyun' },
  simao:      { north: 'heigu',   south: null,       east: null,       west: null },
  longtan:    { north: null,     south: 'xuegu',    east: null,       west: null },
  xuegu:      { north: 'longtan', south: null,       east: null,       west: null },
  mangu:      { north: null,     south: 'heigu',    east: null,       west: null },
  hanzhou:    { north: null,     south: null,        east: null,       west: 'jinshan' },
}

const NANJIANG_CONNECTIONS = {
  wudu:       { north: 'zhutian', south: 'yinshe',   east: 'manyun',   west: null },
  zhangqi:    { north: null,     south: 'wudu',     east: 'guashi',   west: null },
  guashi:     { north: 'zhutian', south: 'baiman',  east: 'xueteng',  west: 'zhangqi' },
  yinshe:     { north: 'wudu',   south: null,       east: 'manyun',   west: null },
  xueteng:    { north: null,     south: 'baiman',   east: null,       west: 'guashi' },
  zhutian:    { north: 'manyun', south: 'wudu',     east: 'tianyu',   west: 'huaxue' },
  manyun:     { north: 'baiman', south: 'zhutian',  east: 'gupo',     west: 'yinshe', travel: ['zhongyuan', 'donghai'] },
  baiman:     { north: 'yufeng', south: 'manyun',    east: 'gujin',    west: 'xueteng' },
  yufeng:     { north: 'xishan', south: 'baiman',    east: null,       west: null },
  xishan:     { north: null,    south: 'yufeng',    east: null,       west: null },
  liuyuan:    { north: 'canglang', south: 'tianyu', east: 'hongshan',  west: null },
  gujin:      { north: null,    south: 'tianyu',    east: 'hongshan',  west: 'baiman' },
  hongshan:   { north: 'longshe', south: 'xiangyun', east: null,      west: 'liuyuan' },
  longshe:    { north: null,    south: 'hongshan',  east: null,       west: null },
  xiangyun:   { north: 'hongshan', south: null,      east: 'luoyue',   west: 'tianyu' },
  tianyu:     { north: 'liuyuan', south: 'luoyue',   east: 'xiangyun', west: 'manyun' },
  luoyue:     { north: 'tianyu',  south: null,       east: null,       west: 'xiangyun' },
  canglang:   { north: null,    south: 'liuyuan',   east: 'gupo',     west: null },
  gupo:       { north: null,    south: null,        east: 'longshe',  west: 'manyun' },
  muyu:       { north: 'baiman', south: null,        east: null,       west: null },
  nanjiang_ming: { north: null, south: 'zhutian',  east: 'moshen',   west: null },
  moshen:     { north: null,    south: null,        east: null,       west: 'nanjiang_ming' },
  bailian:    { north: 'luoyue', south: null,        east: null,       west: null },
}

const BEIHAN_CONNECTIONS = {
  bingfeng:   { north: 'bailiang', south: 'wumei',   east: 'chunhua',  west: 'hanlin', travel: ['zhongyuan', 'xiyu'] },
  bailiang:   { north: 'hanxue',  south: 'bingfeng', east: 'tianchi',  west: null },
  xuelang:    { north: null,     south: 'hanlin',   east: 'bingfeng', west: 'guangnei' },
  hanlin:     { north: 'xuelang', south: 'dongguan', east: 'bingfeng', west: null },
  wumei:      { north: 'bingfeng', south: 'beijiang', east: 'guangnei', west: 'dongguan' },
  dongguan:   { north: 'hanlin',  south: null,       east: 'lengshan', west: 'wumei' },
  guangnei:   { north: null,     south: 'wumei',    east: null,       west: 'xuelang' },
  chunhua:    { north: 'tianchi', south: 'guangnei', east: null,       west: 'bingfeng' },
  tianchi:    { north: null,     south: 'chunhua',  east: null,       west: 'bailiang' },
  hanxue:     { north: null,     south: 'bailiang', east: null,       west: null },
  jiguang:    { north: null,     south: 'bailiang', east: 'xueshan',  west: null },
  baihua_lin: { north: null,     south: null,        east: 'jiguang',  west: null },
  xueshan:    { north: null,     south: null,        east: 'baihua_lin', west: 'jiguang', travel: ['donghai'] },
  hanhai:     { north: null,     south: null,        east: 'lengshan',  west: null },
  lengshan:   { north: 'hanhai', south: null,        east: 'bingshi',   west: 'dongguan' },
  bingshi:    { north: null,     south: null,        east: 'guangsi',  west: 'lengshan' },
  guangsi:    { north: null,     south: null,        east: null,       west: 'bingshi' },
  beijiang:   { north: 'wumei',  south: null,        east: null,       west: null },
  tianlang:   { north: null,     south: null,        east: null,       west: null },
  bingxue:    { north: null,     south: null,        east: null,       west: null },
}

const DONGHAI_CONNECTIONS = {
  bibo:       { north: 'longxishui', south: 'yuhuo',  east: 'longmen',  west: null },
  yuhuo:     { north: 'bibo',       south: 'binhao',  east: 'longzhong',west: null },
  bibo_ming:  { north: 'haitang',   south: 'longmen',  east: null,       west: 'yuhuo', travel: ['zhongyuan', 'nanjiang'] },
  longmen:    { north: 'bibo_ming', south: 'feilai2', east: 'shanhu',   west: 'bibo', travel: ['xiyu'] },
  shanhu:     { north: null,       south: null,       east: null,       west: 'longmen' },
  longxishui: { north: 'tufei',    south: 'bibo',     east: 'moyan',   west: null },
  tufei:      { north: 'yupao',   south: 'longxishui', east: 'cike',    west: null },
  cike:       { north: null,      south: null,         east: null,       west: 'tufei' },
  yupao:      { north: null,      south: 'tufei',      east: 'qianzhuang', west: null },
  feilai2:    { north: 'longmen',  south: 'moyan',    east: null,       west: null },
  moyan:      { north: 'feilai2',  south: null,        east: null,       west: null },
  qianzhuang: { north: null,      south: 'haitang',   east: 'cike',     west: 'yupao' },
  binhao:     { north: 'yuhuo',   south: 'longzhong', east: null,       west: null },
  longzhong:  { north: 'binhao',  south: null,        east: null,       west: 'yuhuo' },
  qingshan:   { north: null,      south: 'longzhong', east: null,       west: 'moyan' },
  xuanji:     { north: null,      south: 'guixu',     east: null,       west: null },
  haiyue:     { north: null,      south: null,        east: null,       west: 'longmen', travel: ['beihan'] },
  guixu:      { north: 'xuanji',  south: null,        east: null,       west: null },
 haitang:    { north: 'qianzhuang', south: 'mingshan', east: null,       west: null },
  mingshan:   { north: 'haitang',  south: null,        east: null,       west: null },
  xiuxiguan:  { north: null,      south: 'qianzhuang', east: 'cike',    west: null },
  xiwan:      { north: null,      south: null,         east: 'xiuxiguan', west: 'haitang' },
  langya:     { north: 'guixu',   south: null,         east: null,       west: null },
}

const REGION_CONNECTIONS = {
  zhongyuan: ZHONGYUAN_CONNECTIONS,
  xiyu: XIYU_CONNECTIONS,
  nanjiang: NANJIANG_CONNECTIONS,
  beihan: BEIHAN_CONNECTIONS,
  donghai: DONGHAI_CONNECTIONS,
}

// 填充缺失的 connections（双向补全）
function buildBidirectional (regionId) {
  const region = REGIONS.find(r => r.id === regionId)
  if (!region) return
  const conns = REGION_CONNECTIONS[regionId] || {}
  for (const loc of region.locations) {
    const c = conns[loc.id] || {}
    loc.connections = c
    loc.travelTo = c.travel || []
    // 清理
    delete loc.travel
  }
}

export const REGIONS = [
  {
    id: 'zhongyuan',
    name: '中原',
    desc: '华夏腹地，武林正道之源，门派林立，高手如云。',
    atmosphere: ['古道西风', '夕阳残照', '落英缤纷', '薄雾笼罩', '风雪初歇'],
    difficulty: 1,
    locations: [
      { id: 'qingyun', name: '青云镇', type: 'town', desc: '青石板路，酒旗斜挂，镇口有一棵百年老槐。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern', 'martialHall'] },
      { id: 'luoxia', name: '落霞村', type: 'village', desc: '村舍炊烟，霞光满天，民风淳朴。', buildings: ['notice', 'pharmacy'] },
      { id: 'tiejiang', name: '铁匠岭', type: 'town', desc: '叮当锤声不绝于耳，满山尽是铁矿。', buildings: ['blacksmith', 'tavern'] },
      { id: 'hantan', name: '寒潭谷', type: 'dungeon', desc: '深谷幽潭，寒气逼人，潭底传闻有异宝。', buildings: [] },
      { id: 'kuye', name: '枯叶寺', type: 'temple', desc: '古刹残钟，落叶满阶，香火稀落。', buildings: ['notice', 'martialHall'] },
      { id: 'baihua', name: '百花谷', type: 'wilderness', desc: '四季花开，毒瘴弥漫，误入者多迷失其中。', buildings: [] },
      { id: 'qingcheng', name: '青城山', type: 'mountain', desc: '道教名山，青城剑法名震江湖。', buildings: ['notice', 'martialHall'] },
      { id: 'feilai', name: '飞来峰', type: 'mountain', desc: '孤峰插云，不知从何飞来，峰顶有座破败庙宇。', buildings: [] },
      { id: 'songlin', name: '松林镇', type: 'town', desc: '万棵古松环绕，镇民多以采药为生。', buildings: ['notice', 'pharmacy', 'tavern'] },
      { id: 'luoyang', name: '洛阳城', type: 'city', desc: '十三朝古都，繁华鼎盛，江湖豪客汇聚之地。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern', 'martialHall'] },
      { id: 'mingyue', name: '明月山庄', type: 'sect', desc: '中原名门，正道领袖，庄主武功卓绝。', buildings: ['notice', 'martialHall'] },
      { id: 'guangming', name: '光明顶', type: 'mountain', desc: '明教总坛，山顶终年云雾缭绕。', buildings: ['notice'] },
      { id: 'tianchang', name: '天长镇', type: 'town', desc: '商旅要道，来往客商络绎不绝。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'huarong', name: '华容道', type: 'pass', desc: '一夫当关，万夫莫开的险要关隘。', buildings: ['notice', 'tavern'], travelTo: ['xiyu', 'beihan'] },
      { id: 'luofeng', name: '落凤坡', type: 'wilderness', desc: '传说有凤凰陨落于此，坡下埋藏着古老的秘密。', buildings: [] },
      { id: 'yunmeng', name: '云梦泽', type: 'wilderness', desc: '烟波浩渺，芦苇丛生，水寇出没。', buildings: [] },
      { id: 'qingshui', name: '清水镇', type: 'town', desc: '清溪穿镇而过，水质清冽，酿酒极佳。', buildings: ['notice', 'tavern', 'blacksmith'] },
      { id: 'longquan', name: '龙泉镇', type: 'town', desc: '以铸剑闻名天下，剑铺林立。', buildings: ['blacksmith', 'notice', 'tavern'] },
      { id: 'linglong', name: '玲珑塔', type: 'dungeon', desc: '古塔高耸，内部层层机关，据说藏着上古秘籍。', buildings: [] },
      { id: 'taoyuan', name: '桃花源', type: 'secret', desc: '世外桃源，入口隐秘，误入者皆有缘人。', buildings: [] },
      { id: 'xuanwu', name: '玄武湖', type: 'wilderness', desc: '湖水漆黑，深不见底，湖底有庞大的地下暗河。', buildings: [] },
      { id: 'taiyi', name: '太乙镇', type: 'town', desc: '道家圣地，镇民多习太乙神数。', buildings: ['notice', 'tavern', 'martialHall'] },
      { id: 'qiankun', name: '乾坤洞', type: 'dungeon', desc: '洞中分阴阳两界，走入者往往迷失方向。', buildings: [] },
      { id: 'taiyuan', name: '太原府', type: 'city', desc: '北方重镇，驻军严明，市集热闹。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern', 'martialHall'], travelTo: ['donghai'] },
      { id: 'wanxiang', name: '万相寺', type: 'temple', desc: '千手千眼佛，香火鼎盛，求签问卦者众多。', buildings: ['notice', 'pharmacy'] },
    ]
  },
  {
    id: 'xiyu',
    name: '西域',
    desc: '黄沙万里，商旅不绝，魔道高手多出此处。',
    atmosphere: ['烈日如火', '风沙漫天', '驼铃声远', '星河满天', '月冷沙寒'],
    difficulty: 2,
    locations: [
      { id: 'liusha', name: '流沙堡', type: 'fort', desc: '沙海中的孤城，堡主是沙漠一霸。', buildings: ['notice', 'tavern'] },
      { id: 'huoyan', name: '火焰山', type: 'mountain', desc: '山体赤红，热浪滚滚，常人难以靠近。', buildings: [] },
      { id: 'baituo', name: '白驼寨', type: 'village', desc: '善使毒蛊的邪派山寨，外人不敢轻易靠近。', buildings: ['notice'] },
      { id: 'yushi', name: '玉石城', type: 'city', desc: '以玉石交易闻名，富商云集，也藏污纳垢。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern'], travelTo: ['zhongyuan', 'nanjiang'] },
      { id: 'mozhou', name: '魔域镇', type: 'town', desc: '西域最接近中原的小镇，鱼龙混杂。', buildings: ['notice', 'tavern', 'blacksmith'] },
      { id: 'lianhua', name: '莲花池', type: 'oasis', desc: '沙漠绿洲，莲花盛开，水源丰沛。', buildings: ['pharmacy'] },
      { id: 'gulang', name: '古浪寺', type: 'temple', desc: '密宗古刹，僧人习武，金刚法相威严。', buildings: ['notice', 'martialHall'] },
      { id: 'qianjin', name: '千金楼', type: 'brothel', desc: '沙漠中的销金窟，达官贵人的秘密聚集地。', buildings: ['tavern'] },
      { id: 'shatuo', name: '沙陀国', type: 'city', desc: '西域古国遗址，残垣断壁间埋藏着无数宝藏。', buildings: ['notice'] },
      { id: 'jinshan', name: '金山寺', type: 'temple', desc: '金顶辉煌，寺中武僧个个身手不凡。', buildings: ['notice', 'martialHall', 'blacksmith'] },
      { id: 'hanzhou', name: '寒沙镇', type: 'town', desc: '黄沙中的小镇，商旅必经之地。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'xiyang', name: '夕阳关', type: 'pass', desc: '日落时分，关隘被染成金色，壮丽而诡异。', buildings: ['notice', 'tavern'] },
      { id: 'xiyu_ming', name: '星月城', type: 'city', desc: '沙漠中的繁华都市，夜市热闹非凡。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern', 'martialHall'], travelTo: ['nanjiang', 'beihan'] },
      { id: 'mingu', name: '明谷', type: 'oasis', desc: '明教在西域的秘密据点，教徒众多。', buildings: ['notice', 'tavern'] },
      { id: 'guangyun', name: '光晕镇', type: 'town', desc: '因海市蜃楼而闻名，常有奇异现象。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'heigu', name: '黑谷', type: 'dungeon', desc: '谷中漆黑，伸手不见五指，暗处有危险生物。', buildings: [] },
      { id: 'gualu', name: '挂绿洲', type: 'oasis', desc: '胡杨林立，清泉流淌，是沙漠中的生命之源。', buildings: ['pharmacy', 'tavern'] },
      { id: 'qixing', name: '七星庙', type: 'temple', desc: '七座小庙按北斗七星排列，机关重重。', buildings: [] },
      { id: 'huanhai', name: '寒海', type: 'wilderness', desc: '万里盐湖，白茫茫一片，方向难辨。', buildings: [] },
      { id: 'simao', name: '死漠', type: 'wilderness', desc: '无水无草，踏入者九死一生。', buildings: [] },
      { id: 'longtan', name: '龙潭', type: 'dungeon', desc: '沙漠中的神秘水潭，深不见底。', buildings: [] },
      { id: 'xuegu', name: '血谷', type: 'dungeon', desc: '遍地红石，传说是上古战场，冤魂不散。', buildings: [] },
      { id: 'mangu', name: '蛮谷', type: 'valley', desc: '蛮族聚居之地，民风彪悍。', buildings: ['notice', 'tavern'] },
      { id: 'hanzhou2', name: '旱漠镇', type: 'town', desc: '沙漠边缘的小镇，水源珍贵。', buildings: ['pharmacy', 'notice'] },
    ]
  },
  {
    id: 'nanjiang',
    name: '南疆',
    desc: '瘴气弥漫，蛊毒盛行，异域武学独树一帜。',
    atmosphere: ['瘴气弥漫', '毒虫遍地', '雨林潮湿', '藤蔓缠绕', '竹楼隐约'],
    difficulty: 2,
    locations: [
      { id: 'wudu', name: '五毒谷', type: 'valley', desc: '五毒教总坛所在，擅用天下至毒之物。', buildings: ['notice'] },
      { id: 'zhangqi', name: '瘴气林', type: 'wilderness', desc: '林中瘴气浓重，外人进入往往中毒身亡。', buildings: [] },
      { id: 'guashi', name: '蛊师寨', type: 'village', desc: '苗疆山寨，蛊术盛行，以蛊会友也以蛊为敌。', buildings: ['notice', 'pharmacy'] },
      { id: 'yinshe', name: '银蛇洞', type: 'dungeon', desc: '洞中银蛇无数，蛇毒是炼制蛊药的上品。', buildings: [] },
      { id: 'xueteng', name: '血藤岛', type: 'island', desc: '岛上遍布血色藤蔓，一旦缠上便无法挣脱。', buildings: [] },
      { id: 'zhutian', name: '竹天寨', type: 'village', desc: '全寨以竹建造，竹叶飞刀独步天下。', buildings: ['notice', 'blacksmith'] },
      { id: 'manyun', name: '蛮云寨', type: 'village', desc: '南疆土著聚居，民风彪悍。', buildings: ['notice', 'tavern'], travelTo: ['zhongyuan', 'donghai'] },
      { id: 'baiman', name: '白曼谷', type: 'valley', desc: '谷中生长着珍贵的白曼陀罗，是解毒圣药。', buildings: ['pharmacy'] },
      { id: 'yufeng', name: '雨凤镇', type: 'town', desc: '一年四季烟雨蒙蒙，镇民生活闲适。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'xishan', name: '西山村', type: 'village', desc: '隐于群山之中，与世隔绝。', buildings: ['notice', 'pharmacy'] },
      { id: 'liuyuan', name: '柳园镇', type: 'town', desc: '镇上以种植草药为主，是药材集散地。', buildings: ['notice', 'pharmacy', 'tavern'] },
      { id: 'gujin', name: '古井村', type: 'village', desc: '村中有一口古井，井水甘甜，据说有奇效。', buildings: ['pharmacy'] },
      { id: 'hongshan', name: '红山', type: 'mountain', desc: '山体殷红如血，山顶有座废弃的古寺。', buildings: [] },
      { id: 'longshe', name: '龙蛇岛', type: 'island', desc: '岛上巨蟒与蛟龙出没，凶险异常。', buildings: [] },
      { id: 'xiangyun', name: '香云谷', type: 'valley', desc: '谷中香气袭人，却暗藏致幻之毒。', buildings: ['pharmacy'] },
      { id: 'tianyu', name: '天羽镇', type: 'town', desc: '以羽毛工艺闻名，也贩卖各种珍禽异兽。', buildings: ['notice', 'tavern', 'blacksmith'] },
      { id: 'luoyue', name: '落月谷', type: 'valley', desc: '月亮落在谷中，谷底终年不见天日。', buildings: [] },
      { id: 'canglang', name: '沧浪洞', type: 'dungeon', desc: '洞中有暗河，水流湍急，探险者多葬身于此。', buildings: [] },
      { id: 'gupo', name: '古坡', type: 'wilderness', desc: '古战场遗址，埋藏着前朝的大量兵器。', buildings: [] },
      { id: 'muyu', name: '木鱼寺', type: 'temple', desc: '寺中僧人敲木鱼念经，声传十里。', buildings: ['notice', 'martialHall'] },
      { id: 'huaxue', name: '花雪岭', type: 'mountain', desc: '岭上常年飘雪，山花却在雪中盛开。', buildings: [] },
      { id: 'nanjiang_ming', name: '魔神庙', type: 'temple', desc: '供奉上古魔神的邪祠，庙中机关诡异。', buildings: [] },
      { id: 'moshen', name: '冥神窟', type: 'dungeon', desc: '黑石洞窟，深不见底。', buildings: [] },
      { id: 'bailian', name: '白莲湖', type: 'wilderness', desc: '湖面开满白莲，湖底却暗藏杀机。', buildings: [] },
    ]
  },
  {
    id: 'beihan',
    name: '北寒',
    desc: '冰天雪地，民风豪迈，北方武林以刚猛著称。',
    atmosphere: ['冰封万里', '雪虐风饕', '极光隐现', '寒夜漫长', '雾凇晶莹'],
    difficulty: 3,
    locations: [
      { id: 'bingfeng', name: '冰封城', type: 'city', desc: '北境最大城池，城墙以冰块筑成，终年不化。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern', 'martialHall'], travelTo: ['zhongyuan', 'xiyu'] },
      { id: 'xuelang', name: '雪狼窝', type: 'village', desc: '猎户村落，人与雪狼共居，民风剽悍。', buildings: ['notice', 'tavern'] },
      { id: 'hanlin', name: '寒林', type: 'wilderness', desc: '千里冰封的针叶林，动物稀少，气候恶劣。', buildings: [] },
      { id: 'wumei', name: '乌煤镇', type: 'town', desc: '煤矿小镇，镇民多从事采矿工作。', buildings: ['notice', 'tavern', 'blacksmith'] },
      { id: 'dongguan', name: '冬关', type: 'pass', desc: '北境入关要道，常年风雪，守军严密。', buildings: ['notice', 'tavern', 'blacksmith'] },
      { id: 'guangnei', name: '广寒镇', type: 'town', desc: '以制冰工艺闻名，冰雕精美绝伦。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'chunhua', name: '春花谷', type: 'valley', desc: '谷中有一处温泉，四季如春，花开不败。', buildings: ['pharmacy'] },
      { id: 'bailiang', name: '白狼山', type: 'mountain', desc: '白狼群居之地，登山者需有足够实力。', buildings: [] },
      { id: 'tianchi', name: '天池', type: 'wilderness', desc: '火山口湖，湖水蔚蓝，传说有蛟龙栖息。', buildings: [] },
      { id: 'hanxue', name: '寒雪宫', type: 'sect', desc: '冰系武学最高殿堂，弟子皆以寒冰真气著称。', buildings: ['notice', 'martialHall'] },
      { id: 'jiguang', name: '极光寨', type: 'village', desc: '每当极光出现，寨中便有异事发生。', buildings: ['notice'] },
      { id: 'baihua_lin', name: '白桦岭', type: 'mountain', desc: '白桦林海，冬季极寒，是苦修者的圣地。', buildings: [] },
      { id: 'xueshan', name: '雪山派', type: 'sect', desc: '以雪山剑法闻名武林，弟子行侠仗义。', buildings: ['notice', 'martialHall'], travelTo: ['donghai'] },
      { id: 'hanhai', name: '寒海冰原', type: 'wilderness', desc: '一望无际的冰原，偶尔可见冰原巨兽。', buildings: [] },
      { id: 'lengshan', name: '冷山镇', type: 'town', desc: '群山环抱的小镇，以伐木和狩猎为生。', buildings: ['notice', 'blacksmith', 'tavern'] },
      { id: 'bingshi', name: '冰室遗迹', type: 'dungeon', desc: '上古文明遗迹，以冰块为建筑材料，精巧绝伦。', buildings: [] },
      { id: 'guangsi', name: '光寺', type: 'temple', desc: '极光照耀下的古寺，僧人修习光明禅法。', buildings: ['notice', 'martialHall'] },
      { id: 'beijiang', name: '北江镇', type: 'town', desc: '沿江而建，冬季江面结冰，可步行过江。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'tianlang', name: '天狼峰', type: 'mountain', desc: '群狼朝拜之地，山顶有上古天狼一族的传说。', buildings: [] },
      { id: 'bingxue', name: '冰雪洞', type: 'dungeon', desc: '冰晶构成的地下洞穴，美轮美奂却暗藏危险。', buildings: [] },
      { id: 'wumei2', name: '雾隐村', type: 'village', desc: '常年大雾笼罩，外人极难找到入口。', buildings: ['notice'] },
      { id: 'hanlin2', name: '寒岭', type: 'mountain', desc: '终年积雪的山岭，寒风刺骨。', buildings: [] },
      { id: 'hailu', name: '海路关', type: 'pass', desc: '通往东海的要道。', buildings: ['notice', 'tavern'] },
      { id: 'xueyu', name: '血雨峰', type: 'mountain', desc: '峰顶终年被血色云雾笼罩，诡异莫名。', buildings: [] },
    ]
  },
  {
    id: 'donghai',
    name: '东海',
    desc: '碧波万顷，海岛众多，海贼与海盗势力盘踞于此。',
    atmosphere: ['碧波荡漾', '海风咸腥', '渔火点点', '台风过后', '晨雾蒙蒙'],
    difficulty: 2,
    locations: [
      { id: 'bibo', name: '碧波镇', type: 'town', desc: '东海最大渔镇，海鲜闻名，每日鱼市热闹。', buildings: ['notice', 'tavern', 'pharmacy', 'blacksmith'] },
      { id: 'yuhuo', name: '渔火岛', type: 'island', desc: '夜间岛上千家渔火，如同繁星落入海中。', buildings: ['notice', 'tavern'] },
      { id: 'longmen', name: '龙门港', type: 'port', desc: '天然良港，来往商船必经之地。', buildings: ['notice', 'tavern', 'blacksmith', 'pharmacy'], travelTo: ['xiyu'] },
      { id: 'longzhong', name: '龙众岛', type: 'island', desc: '信奉海龙的渔民聚居地，有独特的祭祀仪式。', buildings: ['notice', 'pharmacy'] },
      { id: 'longxishui', name: '龙吸水', type: 'sea', desc: '海面龙吸水频发，相传是海中蛟龙在修炼。', buildings: [] },
      { id: 'tufei', name: '秃鹫帮', type: 'pirate', desc: '东海最大海贼帮派，占据数座海岛。', buildings: ['notice'] },
      { id: 'cike', name: '刺客岛', type: 'secret', desc: '杀手组织总部所在，外人踏入必死无疑。', buildings: [] },
      { id: 'yupao', name: '渔炮台', type: 'fort', desc: '明代海防遗址，现被海盗占据。', buildings: ['notice'] },
      { id: 'qianzhuang', name: '钱庄岛', type: 'island', desc: '海盗洗钱之地，岛上银行林立。', buildings: ['notice', 'tavern'] },
      { id: 'feilai2', name: '飞莱岛', type: 'island', desc: '传说此岛会随潮汐移动，从不固定。', buildings: [] },
      { id: 'moyan', name: '魔焰岛', type: 'volcano', desc: '活火山岛，岛上常有熔岩流动，极度危险。', buildings: [] },
      { id: 'binhao', name: '滨海镇', type: 'town', desc: '沿海小镇，居民以晒盐为生。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'shanhu', name: '珊瑚礁', type: 'reef', desc: '七彩珊瑚密布，水下宝物众多，但也危机四伏。', buildings: [] },
      { id: 'qingshan', name: '青山岛', type: 'island', desc: '林木葱郁的小岛，是海盗的秘密休整地。', buildings: ['tavern'] },
      { id: 'xuanji', name: '玄机岛', type: 'island', desc: '岛上有机关大师隐居，岛上机关重重。', buildings: ['notice', 'blacksmith'] },
      { id: 'guixu', name: '鬼墟', type: 'dungeon', desc: '沉没古城的遗址，阴气森森，常有鬼魂出没。', buildings: [] },
      { id: 'haitang', name: '海棠岛', type: 'island', desc: '岛上开满海棠花，是东海最美的小岛。', buildings: ['notice', 'tavern', 'pharmacy'] },
      { id: 'mingshan', name: '明山岛', type: 'island', desc: '岛上有一座灯塔，是航海者的指引。', buildings: ['notice', 'tavern'] },
      { id: 'haiyue', name: '海月城', type: 'city', desc: '东海最繁华的港口城市，商会林立。', buildings: ['notice', 'blacksmith', 'pharmacy', 'tavern', 'martialHall'], travelTo: ['beihan'] },
      { id: 'yugong', name: '鱼骨庙', type: 'temple', desc: '以巨鱼骸骨建造的神庙，渔民常来祭祀。', buildings: ['notice'] },
      { id: 'changling', name: '长陵岛', type: 'island', desc: '岛屿形如长陵，据传是前朝皇陵所在。', buildings: [] },
      { id: 'xiyang2', name: '西洋楼', type: 'mansion', desc: '欧式风格的建筑，据说是海外传教士所建。', buildings: ['notice', 'tavern'] },
      { id: 'feicui', name: '翡翠湾', type: 'bay', desc: '海湾水质清澈，如翡翠般碧绿。', buildings: ['pharmacy'] },
      { id: 'fuhai', name: '福海镇', type: 'town', desc: '东海沿岸富庶小镇，渔业发达。', buildings: ['notice', 'tavern', 'blacksmith'] },
    ]
  }
]

// 初始化地点连接
REGIONS.forEach(r => buildBidirectional(r.id))

// 隐藏地点（通过酒馆传闻触发）
export const HIDDEN_LOCATIONS = [
  { id: 'mijing_1', name: '秘径·幽谷', regionId: 'zhongyuan', desc: '隐藏在山壁之后的秘密山谷，据说藏有前朝宝藏。' },
  { id: 'mijing_2', name: '古墓入口', regionId: 'xiyu', desc: '沙海之下埋藏着一座古墓，入口极为隐秘。' },
  { id: 'mijing_3', name: '蛊神密窟', regionId: 'nanjiang', desc: '五毒谷深处有一间蛊神密窟，藏有失传的蛊术秘籍。' },
  { id: 'mijing_4', name: '冰晶龙宫', regionId: 'beihan', desc: '寒海冰原之下，沉睡着一座冰晶龙宫，内有蛟龙守护。' },
  { id: 'mijing_5', name: '沉没古城', regionId: 'donghai', desc: '东海某处有一座因海啸而沉没的古城，遗址中宝物无数。' },
  { id: 'mijing_6', name: '剑冢', regionId: 'zhongyuan', desc: '华山之巅有一处剑冢，历代剑客将毕生佩剑埋于此地。' },
  { id: 'mijing_7', name: '魔教秘库', regionId: 'xiyu', desc: '明教在西域的一处秘密仓库，存有大量奇珍异宝。' },
]

export function discoverHiddenLocation (regionId, seed = Date.now()) {
  const candidates = HIDDEN_LOCATIONS.filter(l => l.regionId === regionId)
  if (!candidates.length) return null
  const idx = Math.abs(seed) % candidates.length
  return candidates[idx]
}

// 区域入口地点映射
export const REGION_ENTRY_LOCATIONS = {
  zhongyuan: 'qingyun',
  xiyu: 'yushi',
  nanjiang: 'manyun',
  beihan: 'bingfeng',
  donghai: 'longmen',
}

// 获取某区域的入口地点
export function getRegionEntry (regionId) {
  return REGION_ENTRY_LOCATIONS[regionId] || REGIONS.find(r => r.id === regionId)?.locations[0]?.id
}

// 获取某地点在指定方向的邻居
export function getNeighborLocation (regionId, locationId, direction) {
  const region = REGIONS.find(r => r.id === regionId)
  if (!region) return null
  const loc = region.locations.find(l => l.id === locationId)
  if (!loc) return null
  const neighborId = loc.connections?.[direction]
  if (!neighborId) return null
  return region.locations.find(l => l.id === neighborId) || null
}

// 获取某区域的所有地点
export function getLocationsInRegion (regionId) {
  const region = REGIONS.find(r => r.id === regionId)
  return region ? region.locations : []
}
