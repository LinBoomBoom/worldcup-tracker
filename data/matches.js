/**
 * 2026世界杯完整比赛数据
 * 来源：小红书世界杯官方频道
 * 更新至：2026-06-21 21:45 CST
 */

// ======================== 已完赛数据 ========================
const completedMatches = [
  // === 第一轮 ===
  { id:"M01", date:"2026-06-12", time:"03:00", group:"A", round:1,
    home:"墨西哥", away:"南非", score:"2-0", hg:2, ag:0,
    events:"墨西哥控场碾压，南非无还手之力",
    motm:"洛萨诺", venue:"墨西哥城·阿兹特克" },
  { id:"M02", date:"2026-06-12", time:"10:00", group:"A", round:1,
    home:"韩国", away:"捷克", score:"2-1", hg:2, ag:1,
    events:"太极虎让一追二，亚洲首胜！捷克先破门后被逆转",
    motm:"孙兴慜", venue:"洛杉矶·SoFi" },
  { id:"M03", date:"2026-06-13", time:"03:00", group:"B", round:1,
    home:"加拿大", away:"波黑", score:"1-1", hg:1, ag:1,
    events:"拉林救主，加拿大拒绝开门黑",
    motm:"拉林", venue:"多伦多·BMO" },
  { id:"M04", date:"2026-06-13", time:"09:00", group:"D", round:1,
    home:"美国", away:"巴拉圭", score:"4-1", hg:4, ag:1,
    events:"巴洛贡梅开二度，美国轻取首胜",
    motm:"巴洛贡", venue:"纽约/新泽西·大都会人寿" },
  { id:"M05", date:"2026-06-14", time:"03:00", group:"B", round:1,
    home:"卡塔尔", away:"瑞士", score:"1-1", hg:1, ag:1,
    events:"补时绝平！亚洲冠军获历史首分",
    motm:"阿菲夫", venue:"温哥华·BC Place" },
  { id:"M06", date:"2026-06-14", time:"06:00", group:"C", round:1,
    home:"巴西", away:"摩洛哥", score:"1-1", hg:1, ag:1,
    events:"维尼修斯救主，巴西战平摩洛哥",
    motm:"维尼修斯", venue:"迈阿密·硬石" },
  { id:"M07", date:"2026-06-14", time:"09:00", group:"C", round:1,
    home:"海地", away:"苏格兰", score:"0-1", hg:0, ag:1,
    events:"麦金一锤定音，风笛军团首胜",
    motm:"麦金", venue:"休斯顿·NRG" },
  { id:"M08", date:"2026-06-14", time:"12:00", group:"D", round:1,
    home:"澳大利亚", away:"土耳其", score:"2-0", hg:2, ag:0,
    events:"袋鼠军团赢首胜，土耳其全场0射正",
    motm:"古德温", venue:"圣克拉拉·李维斯" },
  { id:"M09", date:"2026-06-15", time:"01:00", group:"E", round:1,
    home:"德国", away:"库拉索", score:"7-1", hg:7, ag:1,
    events:"火力全开！德国轻取库拉索，穆西亚拉2球1助",
    motm:"穆西亚拉", venue:"亚特兰大·梅赛德斯-奔驰" },
  { id:"M10", date:"2026-06-15", time:"04:00", group:"F", round:1,
    home:"荷兰", away:"日本", score:"2-2", hg:2, ag:2,
    events:"日本两度落后顽强绝平！三笘薰替补建功",
    motm:"三笘薰", venue:"费城·林肯金融" },
  { id:"M11", date:"2026-06-15", time:"07:00", group:"E", round:1,
    home:"科特迪瓦", away:"厄瓜多尔", score:"1-0", hg:1, ag:0,
    events:"阿马德一锤定音，绝杀厄瓜多尔",
    motm:"阿马德·迪亚洛", venue:"堪萨斯城·箭头" },
  { id:"M12", date:"2026-06-15", time:"10:00", group:"F", round:1,
    home:"瑞典", away:"突尼斯", score:"5-1", hg:5, ag:1,
    events:"阿亚里梅开二度，伊萨克两传一射",
    motm:"伊萨克", venue:"西雅图·流明" },
  { id:"M13", date:"2026-06-16", time:"00:00", group:"H", round:1,
    home:"西班牙", away:"佛得角", score:"0-0", hg:0, ag:0,
    events:"四旬老汉连献神扑，双方互交白卷！佛得角门将沃齐尼亚9次扑救封神",
    motm:"沃齐尼亚", venue:"瓜达拉哈拉·阿克伦" },
  { id:"M14", date:"2026-06-16", time:"03:00", group:"G", round:1,
    home:"比利时", away:"埃及", score:"1-1", hg:1, ag:1,
    events:"萨拉赫世界波，卢卡库替补22秒造乌龙救主",
    motm:"萨拉赫", venue:"蒙特雷·BBVA" },
  { id:"M15", date:"2026-06-16", time:"06:00", group:"H", round:1,
    home:"沙特阿拉伯", away:"乌拉圭", score:"1-1", hg:1, ag:1,
    events:"沙特乌拉圭握手言和",
    motm:"达瓦萨里", venue:"墨西哥城·阿兹特克" },
  { id:"M16", date:"2026-06-16", time:"09:00", group:"G", round:1,
    home:"伊朗", away:"新西兰", score:"2-2", hg:2, ag:2,
    events:"伊朗两度落后两度追平！塔雷米1球1助",
    motm:"塔雷米", venue:"洛杉矶·SoFi" },
  { id:"M17", date:"2026-06-17", time:"03:00", group:"I", round:1,
    home:"法国", away:"塞内加尔", score:"3-1", hg:3, ag:1,
    events:"姆巴佩梅开二度，法国强势开局",
    motm:"姆巴佩", venue:"达拉斯·AT&T" },
  { id:"M18", date:"2026-06-17", time:"06:00", group:"I", round:1,
    home:"伊拉克", away:"挪威", score:"1-4", hg:1, ag:4,
    events:"哈兰德帽子戏法，挪威大胜伊拉克",
    motm:"哈兰德", venue:"波士顿·吉列" },
  { id:"M19", date:"2026-06-17", time:"09:00", group:"J", round:1,
    home:"阿根廷", away:"阿尔及利亚", score:"3-0", hg:3, ag:0,
    events:"梅西传射，阿根廷轻取开门红",
    motm:"梅西", venue:"迈阿密·硬石" },
  { id:"M20", date:"2026-06-17", time:"12:00", group:"J", round:1,
    home:"奥地利", away:"约旦", score:"3-1", hg:3, ag:1,
    events:"奥地利稳扎稳打",
    motm:"萨比策", venue:"旧金山·大通中心" },
  { id:"M21", date:"2026-06-18", time:"01:00", group:"K", round:1,
    home:"葡萄牙", away:"民主刚果", score:"1-1", hg:1, ag:1,
    events:"C罗点射被扑，B费远射扳平",
    motm:"B费", venue:"纽约/新泽西·大都会人寿" },
  { id:"M22", date:"2026-06-18", time:"04:00", group:"L", round:1,
    home:"英格兰", away:"克罗地亚", score:"4-2", hg:4, ag:2,
    events:"凯恩2球，贝林厄姆1球1助，三狮火力全开",
    motm:"贝林厄姆", venue:"休斯顿·NRG" },
  { id:"M23", date:"2026-06-18", time:"07:00", group:"L", round:1,
    home:"加纳", away:"巴拿马", score:"1-0", hg:1, ag:0,
    events:"加纳小胜巴拿马",
    motm:"库杜斯", venue:"多伦多·BMO" },
  { id:"M24", date:"2026-06-18", time:"10:00", group:"K", round:1,
    home:"乌兹别克斯坦", away:"哥伦比亚", score:"1-3", hg:1, ag:3,
    events:"路易斯·迪亚斯1球1助，哥伦比亚开门红",
    motm:"路易斯·迪亚斯", venue:"温哥华·BC Place" },

  // === 第二轮 ===
  { id:"M25", date:"2026-06-19", time:"00:00", group:"A", round:2,
    home:"捷克", away:"南非", score:"1-1", hg:1, ag:1,
    events:"捷克南非握手言和，双方出线形势均不乐观",
    motm:"绍切克", venue:"瓜达拉哈拉·阿克伦" },
  { id:"M26", date:"2026-06-19", time:"03:00", group:"B", round:2,
    home:"瑞士", away:"波黑", score:"4-1", hg:4, ag:1,
    events:"瑞士4-1大胜波黑，恩博洛双响",
    motm:"恩博洛", venue:"蒙特雷·BBVA" },
  { id:"M27", date:"2026-06-19", time:"06:00", group:"B", round:2,
    home:"加拿大", away:"卡塔尔", score:"6-0", hg:6, ag:0,
    events:"加拿大6-0血洗卡塔尔！戴维斯2球1助",
    motm:"阿方索·戴维斯", venue:"多伦多·BMO" },
  { id:"M28", date:"2026-06-19", time:"09:00", group:"A", round:2,
    home:"墨西哥", away:"韩国", score:"1-0", hg:1, ag:0,
    events:"墨西哥1-0小胜韩国，两连胜提前出线",
    motm:"奥乔亚", venue:"墨西哥城·阿兹特克" },
  { id:"M29", date:"2026-06-20", time:"03:00", group:"D", round:2,
    home:"美国", away:"澳大利亚", score:"2-0", hg:2, ag:0,
    events:"普利西奇1球1助，美国两连胜提前出线",
    motm:"普利西奇", venue:"纽约/新泽西·大都会人寿" },
  { id:"M30", date:"2026-06-20", time:"06:00", group:"C", round:2,
    home:"苏格兰", away:"摩洛哥", score:"0-1", hg:0, ag:1,
    events:"摩洛哥小胜苏格兰，北非雄狮稳扎稳打",
    motm:"阿什拉夫", venue:"费城·林肯金融" },
  { id:"M31", date:"2026-06-20", time:"08:30", group:"C", round:2,
    home:"巴西", away:"海地", score:"3-0", hg:3, ag:0,
    events:"罗德里戈2球，巴西3-0海地",
    motm:"罗德里戈", venue:"迈阿密·硬石" },
  { id:"M32", date:"2026-06-20", time:"11:00", group:"D", round:2,
    home:"土耳其", away:"巴拉圭", score:"0-1", hg:0, ag:1,
    events:"巴拉圭小胜土耳其，保留出线希望",
    motm:"阿尔米隆", venue:"圣克拉拉·李维斯" },
  { id:"M33", date:"2026-06-21", time:"01:00", group:"F", round:2,
    home:"荷兰", away:"瑞典", score:"5-1", hg:5, ag:1,
    events:"加克波帽子戏法！荷兰5-1大胜瑞典",
    motm:"加克波", venue:"亚特兰大·梅赛德斯-奔驰" },
  { id:"M34", date:"2026-06-21", time:"04:00", group:"E", round:2,
    home:"德国", away:"科特迪瓦", score:"2-1", hg:2, ag:1,
    events:"维尔茨绝杀，德国2-1科特迪瓦提前出线",
    motm:"维尔茨", venue:"堪萨斯城·箭头" },
  { id:"M35", date:"2026-06-21", time:"08:00", group:"E", round:2,
    home:"厄瓜多尔", away:"库拉索", score:"0-0", hg:0, ag:0,
    events:"马宁执法亮6黄！库拉索获队史世界杯首分",
    motm:"马宁(裁判)", venue:"西雅图·流明" },
  { id:"M36", date:"2026-06-21", time:"12:00", group:"F", round:2,
    home:"突尼斯", away:"日本", score:"0-4", hg:0, ag:4,
    events:"日本4-0突尼斯获世界杯史上最大胜！三笘薰2球1助，突尼斯提前出局",
    motm:"三笘薰", venue:"洛杉矶·SoFi" },
];

// ======================== 6月22日对阵 ========================
const june22Matches = [
  { id:"M37", date:"2026-06-22", time:"00:00", group:"H", round:2,
    home:"西班牙", away:"沙特阿拉伯", status:"upcoming" },
  { id:"M38", date:"2026-06-22", time:"03:00", group:"G", round:2,
    home:"比利时", away:"伊朗", status:"upcoming" },
  { id:"M39", date:"2026-06-22", time:"06:00", group:"H", round:2,
    home:"乌拉圭", away:"佛得角", status:"upcoming" },
  { id:"M40", date:"2026-06-22", time:"09:00", group:"G", round:2,
    home:"新西兰", away:"埃及", status:"upcoming" },
];

// ======================== 积分榜 ========================
function buildStandings() {
  const groups = {};
  const initGroup = (g) => {
    if (!groups[g]) groups[g] = {};
  };

  for (const m of completedMatches) {
    initGroup(m.group);
    // home
    if (!groups[m.group][m.home]) {
      groups[m.group][m.home] = { team:m.home, p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0 };
    }
    if (!groups[m.group][m.away]) {
      groups[m.group][m.away] = { team:m.away, p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0 };
    }
    const ht = groups[m.group][m.home];
    const at = groups[m.group][m.away];
    ht.p++; at.p++;
    ht.gf += m.hg; ht.ga += m.ag;
    at.gf += m.ag; at.ga += m.hg;
    if (m.hg > m.ag) { ht.w++; at.l++; ht.pts+=3; }
    else if (m.hg < m.ag) { at.w++; ht.l++; at.pts+=3; }
    else { ht.d++; at.d++; ht.pts+=1; at.pts+=1; }
    ht.gd = ht.gf - ht.ga;
    at.gd = at.gf - at.ga;
  }

  const result = {};
  for (const [g, teams] of Object.entries(groups)) {
    result[g] = Object.values(teams).sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
  }
  return result;
}

// ======================== 小组历史对阵 ========================
function buildGroupHistory() {
  const groups = {};
  for (const m of completedMatches) {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  }
  return groups;
}

// ======================== 伤病与替补 ========================
const injuries = [
  { team:"西班牙", player:"佩德里", status:"赛前轻伤·出战成疑", detail:"肌肉疲劳，首轮打满90分钟", update:"2026-06-20" },
  { team:"比利时", player:"库尔图瓦", status:"因伤缺阵", detail:"膝盖伤势未愈，已离开训练营", update:"2026-06-18" },
  { team:"比利时", player:"阿扎尔", status:"退役·已退出国家队", detail:"2024年宣布退役", update:"—" },
  { team:"伊朗", player:"贾汉巴赫什", status:"轻伤·大概率出战", detail:"脚踝轻微扭伤，训练中单独恢复", update:"2026-06-20" },
  { team:"乌拉圭", player:"阿劳霍", status:"黄牌累积风险", detail:"已有一张黄牌，再得牌将停赛", update:"2026-06-16" },
  { team:"佛得角", player:"沃齐尼亚", status:"体能恢复中", detail:"首轮9次扑救消耗巨大，41岁老将", update:"2026-06-16" },
  { team:"新西兰", player:"托马斯", status:"伤愈复出", detail:"中场核心伤愈，本场有望首发", update:"2026-06-20" },
  { team:"埃及", player:"埃尔内尼", status:"体能存疑", detail:"首轮打满全场跑动13.2km", update:"2026-06-17" },
  { team:"阿根廷", player:"迪马利亚", status:"最后一届世界杯", detail:"确认世界杯后退出国家队", update:"2026-06-11" },
  { team:"巴西", player:"内马尔", status:"伤缺", detail:"十字韧带重伤，无缘本届世界杯", update:"2026-05-01" },
  { team:"葡萄牙", player:"C罗", status:"最后一届世界杯", detail:"41岁老将，确认世界杯后退役", update:"2026-06-10" },
];

// ======================== 导出 ========================
function getAllMatches() {
  return { completed: completedMatches, upcoming: june22Matches };
}

function getStandings() {
  return buildStandings();
}

function getGroupHistory() {
  return buildGroupHistory();
}

function getInjuries() {
  return injuries;
}

module.exports = { getAllMatches, getStandings, getGroupHistory, getInjuries };
