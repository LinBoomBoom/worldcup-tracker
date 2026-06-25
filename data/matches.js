/**
 * 2026世界杯完整比赛数据
 * 数据来源：小红书世界杯官方频道 / Baidu Baike / FIFA官方赛程
 * 时间：北京时间（GMT+8）
 * 最后更新：2026-06-23 19:45 CST
 */

// ======================== 已完赛数据 ========================
const completedMatches = [
  // === 第一轮 ===
  // 6月12日
  { id:"M01", date:"2026-06-12", time:"03:00", group:"A", round:1,
    home:"墨西哥", away:"南非", score:"2-0", hg:2, ag:0,
    events:"墨西哥控场碾压，南非无还手之力",
    motm:"洛萨诺", venue:"墨西哥城·阿兹特克" },
  { id:"M02", date:"2026-06-12", time:"10:00", group:"A", round:1,
    home:"韩国", away:"捷克", score:"2-1", hg:2, ag:1,
    events:"太极虎让一追二，亚洲首胜！捷克先破门后被逆转",
    motm:"孙兴慜", venue:"洛杉矶·SoFi" },
  // 6月13日
  { id:"M03", date:"2026-06-13", time:"03:00", group:"B", round:1,
    home:"加拿大", away:"波黑", score:"1-1", hg:1, ag:1,
    events:"拉林救主，加拿大拒绝开门黑",
    motm:"拉林", venue:"多伦多·BMO" },
  { id:"M04", date:"2026-06-13", time:"09:00", group:"D", round:1,
    home:"美国", away:"巴拉圭", score:"4-1", hg:4, ag:1,
    events:"巴洛贡梅开二度，美国轻取首胜",
    motm:"巴洛贡", venue:"纽约/新泽西·大都会人寿" },
  // 6月14日
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
  // 6月15日
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
  // 6月16日
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
  // 6月17日
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
  // 6月18日
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
  // 6月19日
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
  // 6月20日
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
  // 6月21日
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

  // === 6月22日 ===
  { id:"M37", date:"2026-06-22", time:"00:00", group:"H", round:2,
    home:"西班牙", away:"沙特阿拉伯", score:"4-0", hg:4, ag:0,
    events:"亚马尔世界杯首球！奥亚萨瓦尔独中两元，西班牙取本届首胜",
    motm:"奥亚萨瓦尔", venue:"亚特兰大·梅赛德斯-奔驰" },
  { id:"M38", date:"2026-06-22", time:"03:00", group:"G", round:2,
    home:"比利时", away:"伊朗", score:"0-0", hg:0, ag:0,
    events:"伊朗任意球VAR判无效，比利时恩戈伊染红，十人苦守平局",
    motm:"贝兰万德(伊朗)", venue:"洛杉矶·SoFi" },
  { id:"M39", date:"2026-06-22", time:"06:00", group:"H", round:2,
    home:"乌拉圭", away:"佛得角", score:"2-2", hg:2, ag:2,
    events:"佛得角两度落后两度追平！凯文·皮纳队史首球，瓦雷拉抢断破门",
    motm:"凯文·皮纳", venue:"墨西哥城·阿兹特克" },
  { id:"M40", date:"2026-06-22", time:"09:00", group:"G", round:2,
    home:"新西兰", away:"埃及", score:"1-3", hg:1, ag:3,
    events:"埃及92年世界杯首胜！萨拉赫传射，济科+特雷泽盖头球逆转",
    motm:"萨拉赫", venue:"蒙特雷·BBVA" },

  // === 6月23日 ===
  { id:"M41", date:"2026-06-23", time:"01:00", group:"J", round:2,
    home:"阿根廷", away:"奥地利", score:"2-0", hg:2, ag:0,
    events:"梅西传射，阿根廷两连胜锁定小组第一！6分提前出线",
    motm:"梅西", venue:"波士顿·吉列" },
  { id:"M42", date:"2026-06-23", time:"05:00", group:"I", round:2,
    home:"法国", away:"伊拉克", score:"3-0", hg:3, ag:0,
    events:"姆巴佩2球，法国轻取伊拉克两连胜出线",
    motm:"姆巴佩", venue:"达拉斯·AT&T" },
  { id:"M43", date:"2026-06-23", time:"08:00", group:"I", round:2,
    home:"挪威", away:"塞内加尔", score:"3-2", hg:3, ag:2,
    events:"哈兰德双响绝杀！挪威3-2逆转塞内加尔，6分出线",
    motm:"哈兰德", venue:"旧金山·大通中心" },
  { id:"M44", date:"2026-06-23", time:"11:00", group:"J", round:2,
    home:"约旦", away:"阿尔及利亚", score:"1-2", hg:1, ag:2,
    events:"阿尔及利亚2-1逆转约旦取首胜，约旦提前出局",
    motm:"马赫雷斯", venue:"洛杉矶·SoFi" },
];

// ======================== 6月24日 ========================
// 第二轮收尾：K组、L组
const june24Matches = [
  { id:"M45", date:"2026-06-24", time:"01:00", group:"K", round:2,
    home:"葡萄牙", away:"乌兹别克斯坦", score:"5-0", hg:5, ag:0,
    events:"C罗梅开二度连续6届世界杯破门！B费2助攻，葡萄牙提前出线",
    motm:"C罗", venue:"纽约/新泽西·大都会人寿" },
  { id:"M46", date:"2026-06-24", time:"04:00", group:"L", round:2,
    home:"英格兰", away:"加纳", score:"0-0", hg:0, ag:0,
    events:"凯恩失空门！奥赖利头球中框，英格兰狂攻无果闷平加纳",
    motm:"加纳门将阿蒂-齐吉", venue:"休斯顿·NRG" },
  { id:"M47", date:"2026-06-24", time:"07:00", group:"L", round:2,
    home:"巴拿马", away:"克罗地亚", score:"0-1", hg:0, ag:1,
    events:"莫德里奇助攻格瓦迪奥尔头球破门，克罗地亚稳取3分",
    motm:"莫德里奇", venue:"多伦多·BMO" },
  { id:"M48", date:"2026-06-24", time:"10:00", group:"K", round:2,
    home:"哥伦比亚", away:"民主刚果", score:"1-0", hg:1, ag:0,
    events:"穆尼奥斯连场破门，哥伦比亚两连胜提前出线",
    motm:"穆尼奥斯", venue:"温哥华·BC Place" },
];

// ======================== 6月25日 ========================
// 第三轮：A/B/C组（同组同时开赛）
const june25Matches = [
  // B组 03:00
  { id:"M49", date:"2026-06-25", time:"03:00", group:"B", round:3,
    home:"瑞士", away:"加拿大", score:"2-1", hg:2, ag:1,
    events:"曼赞比传射建功，瑞士头名出线",
    motm:"曼赞比", venue:"温哥华·BC Place" },
  { id:"M50", date:"2026-06-25", time:"03:00", group:"B", round:3,
    home:"波黑", away:"卡塔尔", score:"3-1", hg:3, ag:1,
    events:"卡塔尔一平两负小组出局",
    motm:"马赫米奇", venue:"多伦多·BMO" },
  // C组 06:00
  { id:"M51", date:"2026-06-25", time:"06:00", group:"C", round:3,
    home:"苏格兰", away:"巴西", score:"0-3", hg:0, ag:3,
    events:"维尼修斯双响，内马尔迎本届首秀，桑巴军团头名出线",
    motm:"维尼修斯", venue:"迈阿密·硬石" },
  { id:"M52", date:"2026-06-25", time:"06:00", group:"C", round:3,
    home:"摩洛哥", away:"海地", score:"4-2", hg:4, ag:2,
    events:"阿什拉夫传射建功，摩洛哥携手巴西晋级32强",
    motm:"阿什拉夫", venue:"费城·林肯金融" },
  // A组 09:00
  { id:"M53", date:"2026-06-25", time:"09:00", group:"A", round:3,
    home:"捷克", away:"墨西哥", score:"0-3", hg:0, ag:3,
    events:"墨西哥全胜出线，捷克垫底出局",
    motm:"基尼奥内斯", venue:"墨西哥城·阿兹特克" },
  { id:"M54", date:"2026-06-25", time:"09:00", group:"A", round:3,
    home:"南非", away:"韩国", score:"1-0", hg:1, ag:0,
    events:"马塞科一击制胜，南非首次晋级淘汰赛！韩国第三恐出局",
    motm:"马塞科", venue:"洛杉矶·SoFi" },
];

// ======================== 后续赛程（数据来源：小红书 2026-06-25）========================
const futureMatches = [

  // === 6月26日 ===
  // E组 04:00
  { id:"M55", date:"2026-06-26", time:"04:00", group:"E", round:3,
    home:"厄瓜多尔", away:"德国", status:"upcoming" },
  { id:"M56", date:"2026-06-26", time:"04:00", group:"E", round:3,
    home:"库拉索", away:"科特迪瓦", status:"upcoming" },
  // F组 07:00
  { id:"M57", date:"2026-06-26", time:"07:00", group:"F", round:3,
    home:"突尼斯", away:"荷兰", status:"upcoming" },
  { id:"M58", date:"2026-06-26", time:"07:00", group:"F", round:3,
    home:"日本", away:"瑞典", status:"upcoming" },
  // D组 10:00
  { id:"M59", date:"2026-06-26", time:"10:00", group:"D", round:3,
    home:"土耳其", away:"美国", status:"upcoming" },
  { id:"M60", date:"2026-06-26", time:"10:00", group:"D", round:3,
    home:"巴拉圭", away:"澳大利亚", status:"upcoming" },

  // === 6月27日 ===
  // I组 03:00
  { id:"M61", date:"2026-06-27", time:"03:00", group:"I", round:3,
    home:"挪威", away:"法国", status:"upcoming" },
  { id:"M62", date:"2026-06-27", time:"03:00", group:"I", round:3,
    home:"塞内加尔", away:"伊拉克", status:"upcoming" },
  // H组 08:00
  { id:"M63", date:"2026-06-27", time:"08:00", group:"H", round:3,
    home:"乌拉圭", away:"西班牙", status:"upcoming" },
  { id:"M64", date:"2026-06-27", time:"08:00", group:"H", round:3,
    home:"佛得角", away:"沙特阿拉伯", status:"upcoming" },
  // G组 11:00
  { id:"M65", date:"2026-06-27", time:"11:00", group:"G", round:3,
    home:"新西兰", away:"比利时", status:"upcoming" },
  { id:"M66", date:"2026-06-27", time:"11:00", group:"G", round:3,
    home:"埃及", away:"伊朗", status:"upcoming" },

  // === 6月28日 ===
  // L组 05:00
  { id:"M67", date:"2026-06-28", time:"05:00", group:"L", round:3,
    home:"巴拿马", away:"英格兰", status:"upcoming" },
  { id:"M68", date:"2026-06-28", time:"05:00", group:"L", round:3,
    home:"克罗地亚", away:"加纳", status:"upcoming" },
  // K组 07:30
  { id:"M69", date:"2026-06-28", time:"07:30", group:"K", round:3,
    home:"哥伦比亚", away:"葡萄牙", status:"upcoming" },
  { id:"M70", date:"2026-06-28", time:"07:30", group:"K", round:3,
    home:"民主刚果", away:"乌兹别克斯坦", status:"upcoming" },
  // J组 10:00
  { id:"M71", date:"2026-06-28", time:"10:00", group:"J", round:3,
    home:"约旦", away:"阿根廷", status:"upcoming" },
  { id:"M72", date:"2026-06-28", time:"10:00", group:"J", round:3,
    home:"阿尔及利亚", away:"奥地利", status:"upcoming" },
];

// ======================== 积分榜 ========================
function buildStandings() {
  const groups = {};
  const initGroup = (g) => {
    if (!groups[g]) groups[g] = {};
  };

  const allCompleted = [...completedMatches, ...june24Matches, ...june25Matches];
  for (const m of allCompleted) {
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
  const allCompleted = [...completedMatches, ...june24Matches, ...june25Matches];
  for (const m of allCompleted) {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  }
  return groups;
}

// ======================== 伤病与停赛 ========================
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
  { team:"葡萄牙", player:"莱奥", status:"轻伤·出战成疑", detail:"肌肉不适，第二轮替补未出场", update:"2026-06-22" },
  { team:"英格兰", player:"卢克·肖", status:"黄牌累积风险", detail:"已有一张黄牌，再得牌将停赛淘汰赛首场", update:"2026-06-18" },
  { team:"英格兰", player:"萨卡", status:"赛前轻伤·出战成疑", detail:"脚踝轻微扭伤，训练中单独恢复", update:"2026-06-22" },
  { team:"克罗地亚", player:"莫德里奇", status:"最后一届世界杯", detail:"39岁中场大师，确认世界杯后退出国家队", update:"2026-06-10" },
  { team:"克罗地亚", player:"格瓦迪奥尔", status:"黄牌累积风险", detail:"已有一张黄牌", update:"2026-06-18" },
  { team:"哥伦比亚", player:"路易斯·迪亚斯", status:"体能存疑", detail:"首轮打满90分钟跑动12.8km", update:"2026-06-22" },
  { team:"民主刚果", player:"巴坎布", status:"轻伤·大概率出战", detail:"首轮被换下，赛后检查无大碍", update:"2026-06-20" },
  { team:"加纳", player:"托马斯·帕尔特伊", status:"黄牌累积风险", detail:"首轮吃黄牌", update:"2026-06-18" },
  { team:"阿根廷", player:"梅西", status:"6分提前出线待轮换", detail:"小组赛两连胜锁定第一，第三轮可能轮休", update:"2026-06-23" },
  { team:"挪威", player:"哈兰德", status:"连续两场双响", detail:"2场5球位居射手榜首位", update:"2026-06-23" },
  { team:"约旦", player:"约旦全队", status:"提前出局", detail:"两战全败，小组垫底", update:"2026-06-23" },
  { team:"伊拉克", player:"伊拉克全队", status:"提前出局", detail:"两战全败，I组垫底", update:"2026-06-23" },
];

// ======================== 导出 ========================
function getAllMatches() {
  return { completed: [...completedMatches, ...june24Matches], upcoming: futureMatches };
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
