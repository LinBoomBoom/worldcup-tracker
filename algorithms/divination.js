/**
 * 六爻预测 · 世界杯比分占卜 v2.3
 * 基于 iching-shifa 专业排盘库
 * 
 * 优势：
 *   1. 每场独立起卦 — threeNumberQiGua 编码队伍+时间
 *   2. 专业纳甲排盘 — 六亲/六兽/世应/星宿/纳音全自动
 *   3. 六亲足球映射 — 世=主队 应=客队 财=进球 官=防守
 *   4. 旺衰评分 — 月建+日辰双重加权
 * 
 * v2.1 优化（2026-06-24复盘后）：
 *   ① 应爻零旺度→铁桶阵识别（防误判闷平）
 *   ② 卦名警告→置信度修正（无妄/否/困等13卦自动降信）
 *   ③ ELO大差距非线性放大（>150分差距启动平方项）
 *   ④ 比分尾部加厚·崩盘模式（大差距+强倾向时二阶段泊松）
 *
 * v2.3 优化（2026-06-25复盘后）：
 *   ⑤ 轮次感知·平局概率修正 — 小组赛末轮平局概率砍至30%，前两轮70%
 *   ⑥ altScores智能选优 — 非平局优先逻辑，top1平局时自动降级到非平局备选
 */

const { threeNumberQiGua, decodeGua, solarToLunar, BAGUA_XIANG } = require('iching-shifa');

// ======================= 五行生克 =======================
const WX_SHENG = {'金':'水','水':'木','木':'火','火':'土','土':'金'};
const WX_KE    = {'金':'木','木':'土','土':'水','水':'火','火':'金'};
const ZHI_WX   = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
const GAN_WX   = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};

// ======================= 八卦符号 =======================
const GUA_SYMBOLS = {
  '乾':'☰','兑':'☱','离':'☲','震':'☳','巽':'☴','坎':'☵','艮':'☶','坤':'☷'
};

// ======================= ELO实力分（模块级，全局复用） =======================
const TEAM_ELO = { "阿根廷":1920, "法国":1900, "西班牙":1880, "巴西":1865, "英格兰":1855,
  "德国":1840, "荷兰":1830, "葡萄牙":1820, "比利时":1815, "乌拉圭":1790,
  "哥伦比亚":1780, "墨西哥":1775, "美国":1770, "摩洛哥":1755, "日本":1740,
  "塞内加尔":1750, "挪威":1745, "瑞士":1735, "奥地利":1725, "韩国":1720,
  "瑞典":1715, "克罗地亚":1710, "科特迪瓦":1700, "埃及":1695, "加拿大":1690,
  "澳大利亚":1685, "伊朗":1680, "苏格兰":1675, "捷克":1670, "加纳":1665,
  "民主刚果":1655, "巴拉圭":1650, "沙特阿拉伯":1645, "卡塔尔":1640,
  "土耳其":1635, "突尼斯":1630, "南非":1625, "波黑":1620, "乌兹别克斯坦":1615,
  "厄瓜多尔":1610, "约旦":1605, "巴拿马":1600, "阿尔及利亚":1595,
  "新西兰":1590, "库拉索":1580, "海地":1575, "佛得角":1570,
  "伊拉克":1565 };

// ======================= 攻防系数（近10场国家队数据） =======================
const TEAM_ATT_DEF = {
  "阿根廷":{att:2.4,def:0.6}, "法国":{att:2.3,def:0.7}, "西班牙":{att:2.2,def:0.5},
  "巴西":{att:2.2,def:0.7}, "英格兰":{att:2.1,def:0.7}, "德国":{att:2.5,def:1.0},
  "荷兰":{att:2.3,def:0.8}, "葡萄牙":{att:2.0,def:0.8}, "比利时":{att:1.8,def:0.9},
  "乌拉圭":{att:1.8,def:0.8}, "哥伦比亚":{att:1.7,def:0.7}, "墨西哥":{att:1.5,def:0.5},
  "美国":{att:2.0,def:0.6}, "摩洛哥":{att:1.4,def:0.5}, "日本":{att:2.0,def:0.8},
  "瑞士":{att:1.6,def:0.8}, "奥地利":{att:1.7,def:0.9}, "韩国":{att:1.5,def:0.9},
  "瑞典":{att:1.8,def:1.0}, "克罗地亚":{att:1.6,def:0.9}, "科特迪瓦":{att:1.3,def:1.0},
  "埃及":{att:1.3,def:0.9}, "加拿大":{att:2.0,def:0.9}, "澳大利亚":{att:1.3,def:0.8},
  "伊朗":{att:1.5,def:1.0}, "苏格兰":{att:1.1,def:0.8}, "捷克":{att:1.2,def:1.2},
  "加纳":{att:1.1,def:1.0}, "民主刚果":{att:1.0,def:1.2}, "巴拉圭":{att:1.0,def:1.0},
  "沙特阿拉伯":{att:1.1,def:1.3}, "卡塔尔":{att:1.0,def:1.5}, "土耳其":{att:1.0,def:1.1},
  "突尼斯":{att:0.8,def:1.5}, "南非":{att:0.8,def:1.2}, "波黑":{att:1.0,def:1.5},
  "乌兹别克斯坦":{att:1.0,def:1.3}, "厄瓜多尔":{att:0.9,def:1.0},
  "约旦":{att:0.8,def:1.4}, "巴拿马":{att:0.7,def:1.5}, "阿尔及利亚":{att:0.8,def:1.5},
  "新西兰":{att:1.2,def:1.4}, "库拉索":{att:0.7,def:1.6}, "海地":{att:0.5,def:1.5},
  "佛得角":{att:0.6,def:0.9}, "伊拉克":{att:0.8,def:1.6},
  "塞内加尔":{att:1.4,def:1.0}, "挪威":{att:2.0,def:0.8},
};

// ======================= 警告卦名（卦辞含"难/险/阻/困/变/意外"） =======================
const WARNING_GUA = new Set([
  '无妄', // unexpected / 意外之卦
  '明夷', // darkness / 明入地中
  '困',   // trapped / 泽无水
  '否',   // blocked / 天地不交
  '剥',   // peeling away / 不利有攸往
  '蹇',   // difficulty / 险在前
  '坎',   // danger / 重险
  '未济', // unfinished / 事未成
  '讼',   // conflict / 争讼
  '师',   // army / 行险
  '旅',   // wandering / 不安定
  '涣',   // dispersion / 离散
  '大过', // excess / 栋桡
]);

// 八卦从yaoString推 (6/8=阴, 7/9=阳)
function yaoStrToGua(yaoStr) {
  const nums = yaoStr.split('').map(Number);
  const toYinYang = n => (n === 6 || n === 8) ? 0 : 1;
  const lower = [toYinYang(nums[0]), toYinYang(nums[1]), toYinYang(nums[2])];
  const upper = [toYinYang(nums[3]), toYinYang(nums[4]), toYinYang(nums[5])];
  const trigramMap = {
    '111':'乾','110':'兑','101':'离','100':'震',
    '011':'巽','010':'坎','001':'艮','000':'坤'
  };
  return {
    xiaGua: trigramMap[lower.join('')] || '?',
    xiaSymbol: GUA_SYMBOLS[trigramMap[lower.join('')]] || '?',
    shangGua: trigramMap[upper.join('')] || '?',
    shangSymbol: GUA_SYMBOLS[trigramMap[upper.join('')]] || '?',
  };
}

// ======================= 旺衰评分 =======================
function yaoWangShuai(yaoWx, yueZhi, riZhi) {
  const yueWx = ZHI_WX[yueZhi] || '';
  const riWx = ZHI_WX[riZhi] || '';
  let score = 0;

  // 月建
  if (yaoWx === yueWx) score += 1.5;
  else if (WX_SHENG[yueWx] === yaoWx) score += 1;
  else if (WX_KE[yueWx] === yaoWx) score -= 1.5;
  else if (WX_SHENG[yaoWx] === yueWx) score -= 0.5;

  // 日辰
  if (yaoWx === riWx) score += 1;
  else if (WX_SHENG[riWx] === yaoWx) score += 0.5;
  else if (WX_KE[riWx] === yaoWx) score -= 1;
  else if (WX_SHENG[yaoWx] === riWx) score -= 0.3;

  return score;
}

// ======================= 阶乘 =======================
function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }

// ======================= 泊松概率 =======================
function poissonProb(lambda, k) {
  return Math.exp(-lambda) * Math.pow(lambda, k) / fact(k);
}

// ======================= 比分分布采样（支持崩盘模式） =======================
function sampleScores(xH, xA, blowoutMode) {
  const scoreProbs = [];
  for (let hg = 0; hg <= 7; hg++) {
    for (let ag = 0; ag <= 7; ag++) {
      let p;
      if (blowoutMode) {
        // 崩盘模式：弱队进球概率坍缩 + 强队λ放大
        const weakLambda = Math.min(xA, xH) * 0.15;   // 弱队进攻坍缩至15%
        const strongLambda = Math.max(xA, xH) * 2.0;  // 强队火力翻倍
        if (xH >= xA) {
          p = poissonProb(strongLambda, hg) * poissonProb(weakLambda, ag);
        } else {
          p = poissonProb(weakLambda, hg) * poissonProb(strongLambda, ag);
        }
      } else {
        p = poissonProb(xH, hg) * poissonProb(xA, ag);
      }
      scoreProbs.push({ score: `${hg}-${ag}`, hg, ag, p });
    }
  }
  scoreProbs.sort((a, b) => b.p - a.p);
  return scoreProbs;
}

// ======================= 综合预测 =======================
function liuYaoPredict(match) {
  const [year, month, day] = match.date.split('-').map(Number);
  const [hour, minute] = match.time.split(':').map(Number);

  // 1. 确定性起卦（队伍编码+时间 → 每场独立）
  const hc = match.home.charCodeAt(0) || 0;
  const ac = match.away.charCodeAt(0) || 0;
  const n1 = year + month + day + hc;
  const n2 = year + month + day + hour + ac;
  const n3 = year + month + day + hour + hc + ac;
  const yaoStr = threeNumberQiGua(n1, n2, n3);

  // 2. 专业排盘
  const lunar = solarToLunar(year, month, day, hour);
  const gua = decodeGua(yaoStr, lunar.dayGanZhi);

  // 3. 八卦符号
  const symbols = yaoStrToGua(yaoStr);

  // 4. 提取关键爻
  const yaoList = gua.yaoList;
  const shiYao = yaoList.find(y => y.shiYing === '世');
  const yingYao = yaoList.find(y => y.shiYing === '应');
  const dongYaos = yaoList.filter(y => y.isMoving);

  // 月令日辰
  const yueZhi = (lunar.monthGanZhi?.gz || '午')[1] || '午';
  const riZhi = (lunar.dayGanZhi?.gz || '寅')[1] || '寅';

  // 5. 旺衰计算
  const shiWang = yaoWangShuai(shiYao?.wuXing || '', yueZhi, riZhi);
  const yingWang = yaoWangShuai(yingYao?.wuXing || '', yueZhi, riZhi);
  const yaoWithWang = yaoList.map(y => ({
    ...y,
    wangScore: +yaoWangShuai(y.wuXing || '', yueZhi, riZhi).toFixed(1),
  }));

  // 6. 六亲足球映射
  const caiYaos = yaoWithWang.filter(y => y.liuQin === '妻财');
  const guanYaos = yaoWithWang.filter(y => y.liuQin === '官鬼');
  const sunYaos = yaoWithWang.filter(y => y.liuQin === '子孙');
  const fuYaos = yaoWithWang.filter(y => y.liuQin === '父母');

  // 7. 胜负分析
  let homeAdv = 0, awayAdv = 0;
  const reasons = [];
  const strategyNotes = []; // 战术级别的注释

  // ====== 优化①: 应爻零旺度→铁桶阵识别（v2.2: 加ELO校验防强队误判） ======
  let parkBus = false;
  let parkBusSide = null; // 'home' | 'away'
  const eloH_pb = TEAM_ELO[match.home] || 1600;
  const eloA_pb = TEAM_ELO[match.away] || 1600;
  if (yingWang <= 0.2 && shiWang >= 1.0) {
    if (eloA_pb < eloH_pb + 50) {  // 客队弱/接近→铁桶合理
      parkBus = true;
      parkBusSide = 'away';
      strategyNotes.push('应爻零旺+客队弱势→客队铁桶阵死守');
      reasons.push('⚠️应爻零旺+客队弱势→死守求平，破密集难度↑');
      homeAdv -= 1.0;
    } else {
      reasons.push('应爻零旺但客队实力强→非铁桶，状态波动信号');
    }
  } else if (shiWang <= 0.2 && yingWang >= 1.0) {
    if (eloH_pb < eloA_pb + 50) {  // 主队弱/接近→铁桶合理
      parkBus = true;
      parkBusSide = 'home';
      strategyNotes.push('世爻零旺+主队弱势→主队摆大巴求平');
      reasons.push('⚠️世爻零旺+主队弱势→主队摆大巴全力死守');
      awayAdv -= 1.0;
    } else {
      reasons.push('世爻零旺但主队实力强→非铁桶，状态波动信号');
    }
  }

  const shiYingDiff = shiWang - yingWang;
  if (!parkBus) { // 铁桶阵时不发标准旺衰信号，已在上面处理
    if (shiYingDiff >= 1.5) { homeAdv += 2; reasons.push('世爻旺于应爻→主队占优'); }
    else if (shiYingDiff >= 0.5) { homeAdv += 1; reasons.push('世爻略旺→主队小优'); }
    else if (shiYingDiff <= -1.5) { awayAdv += 2; reasons.push('应爻旺于世爻→客队占优'); }
    else if (shiYingDiff <= -0.5) { awayAdv += 1; reasons.push('应爻略旺→客队小优'); }
    else { reasons.push('世应均势→实力接近'); }
  }

  // 动爻分析
  const dangerSignals = [];
  for (const dy of dongYaos) {
    const dyWx = dy.wuXing || '';
    const shiWx = shiYao?.wuXing || '';
    const yingWx = yingYao?.wuXing || '';

    if (WX_SHENG[dyWx] === shiWx) { homeAdv += 1.5; reasons.push(`动爻${dy.liuQin}(${dy.naJia})生世→主队有利`); }
    if (WX_SHENG[dyWx] === yingWx) { awayAdv += 1.5; reasons.push(`动爻${dy.liuQin}(${dy.naJia})生应→客队有利`); }
    if (WX_KE[dyWx] === shiWx) { awayAdv += 2; reasons.push(`动爻${dy.liuQin}(${dy.naJia})克世→⚠️主队受压`); }
    if (WX_KE[dyWx] === yingWx) { homeAdv += 2; reasons.push(`动爻${dy.liuQin}(${dy.naJia})克应→⚠️客队受压`); }

    if (dy.liuQin === '妻财') reasons.push('财爻发动→进球机会多');
    if (dy.liuQin === '官鬼') { reasons.push('官鬼发动→⚠️防守压力/裁判因素'); }
    if (dy.liuQin === '子孙') reasons.push('子孙发动→创造力释放');

    // 六兽警示
    if (dy.liuShou === '白虎' && dy.liuQin === '官鬼') dangerSignals.push('官鬼临白虎→⚠️红牌/点球/冲突风险');
    if (dy.liuShou === '玄武' && dy.liuQin === '官鬼') dangerSignals.push('官鬼临玄武→⚠️争议判罚/暗算');
    if (dy.liuShou === '青龙' && dy.liuQin === '妻财') dangerSignals.push('财爻临青龙→🍀进球盛宴信号');
  }

  // 月破/日破
  const CHONG = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  for (const y of yaoList) {
    const zhi = (y.naJia || '')[1];
    if (zhi === CHONG[yueZhi] && y.isMoving) dangerSignals.push(`${y.liuQin}${y.naJia}月破→力量减半`);
    if (zhi === CHONG[riZhi]) dangerSignals.push(`${y.liuQin}${y.naJia}日破→当日无力`);
  }

  // 8. 火力计算
  const caiScore = caiYaos.reduce((s, c) => s + c.wangScore, 0);
  const sunScore = sunYaos.reduce((s, c) => s + c.wangScore, 0);
  const guanScore = guanYaos.reduce((s, c) => s + c.wangScore, 0);
  const diff = homeAdv - awayAdv;
  const totalFirepower = caiScore + sunScore * 0.5 - guanScore * 0.3;

  // 9. ELO 实力差（复用模块级 TEAM_ELO）
  const eloH = TEAM_ELO[match.home] || 1600;
  const eloA = TEAM_ELO[match.away] || 1600;
  const eloDiff = (eloH - eloA) / 200;
  const absEloDiff = Math.abs(eloDiff);

  // ====== 优化③: ELO大差距非线性放大 ======
  let eloBoost = 0;
  if (absEloDiff > 0.75) { // ELO差>150分
    const excess = absEloDiff - 0.75;
    eloBoost = excess * absEloDiff * 0.8; // 平方项放大
    if (absEloDiff > 1.25) { // ELO差>250分
      eloBoost += (absEloDiff - 1.25) * absEloDiff * 0.4; // 再加一次
    }
  }
  const eloSign = eloDiff >= 0 ? 1 : -1;

  // 比赛轮次
  const matchRound = match.round || 1;

  // 基础进球（v2.3调高基准: 1.5→2.0, ELO系数0.8→1.2, 均场目标~2.85球）
  let baseH = 2.0 + eloDiff * 1.2 + eloSign * eloBoost + totalFirepower * 0.2 + diff * 0.15;
  let baseA = 2.0 - eloDiff * 1.2 - eloSign * eloBoost - totalFirepower * 0.2 - diff * 0.15;

  // ====== 优化⑦: 小组赛末轮进球通胀 (v2.3) ======
  // 第三轮双方全力以赴，进球数天然偏高（本届R3场均3.17球 vs 总体2.85球）
  if (matchRound === 3) {
    baseH *= 1.25;
    baseA *= 1.25;
  }

  // ====== 优化①续: 铁桶阵→降低强队预期进球 ======
  if (parkBus) {
    if (parkBusSide === 'away') {
      baseH *= 0.75;  // 破密集预期进球打7.5折
      baseA = Math.max(0.1, baseA * 0.3);  // 客队死守→几乎不攻
    } else {
      baseA *= 0.75;
      baseH = Math.max(0.1, baseH * 0.3);  // 主队死守→几乎不攻
    }
  }

  // 动爻扰动
  const yaoJitter = dongYaos.reduce((s, dy) => {
    const dWx = dy.wuXing || '';
    if (WX_SHENG[dWx] === (shiYao?.wuXing || '')) return s + 0.3;
    if (WX_KE[dWx] === (shiYao?.wuXing || '')) return s - 0.3;
    return s;
  }, 0);

  // 钳制
  const clamp = (v) => Math.max(0.05, Math.min(7, v));
  let xH = clamp(baseH + yaoJitter);
  let xA = clamp(baseA - yaoJitter);

  // ====== 优化④: 比分尾部加厚·崩盘模式 ======
  // 触发条件: (六爻强倾向) 或 (ELO碾压) 或 (火力+倾向联合) 且 无铁桶阵
  const advAbs = Math.abs(diff);
  const blowoutSignal = !parkBus && (
    (absEloDiff > 0.5 && advAbs > 2) ||        // 六爻+ELO共识
    (absEloDiff > 1.0) ||                        // ELO碾压(>200分)单独触发
    (absEloDiff > 0.7 && totalFirepower > 0.5 && advAbs > 0.5) // 火力+倾向
  );
  let blowoutMode = false;
  let blowoutProb = 0;

  if (blowoutSignal) {
    blowoutProb = Math.min(0.45, 0.12 + absEloDiff * 0.2 + advAbs * 0.05);
    blowoutMode = true;
  }

  // 混合采样：(1-blowoutProb)*正常 + blowoutProb*崩盘
  const normalScores = sampleScores(xH, xA, false);
  const blowoutScores = blowoutMode ? sampleScores(xH, xA, true) : [];

  const scoreProbs = [];
  for (let hg = 0; hg <= 7; hg++) {
    for (let ag = 0; ag <= 7; ag++) {
      const np = normalScores.find(s => s.hg === hg && s.ag === ag)?.p || 0;
      let bp = 0;
      if (blowoutMode) {
        bp = blowoutScores.find(s => s.hg === hg && s.ag === ag)?.p || 0;
      }
      const p = np * (1 - blowoutProb) + bp * blowoutProb;
      scoreProbs.push({ score: `${hg}-${ag}`, hg, ag, p });
    }
  }

  // 铁桶阵→0-0及平局适度加权（避免过拟合回测数据）
  if (parkBus) {
    for (const sp of scoreProbs) {
      if (sp.hg === 0 && sp.ag === 0) sp.p *= 1.8;  // 0-0加权
      else if (sp.hg === sp.ag && sp.hg <= 1) sp.p *= 1.3; // 1-1小加权
    }
  }

  scoreProbs.sort((a, b) => b.p - a.p);

  // ====== 优化⑤: 轮次感知 · 平局概率修正 (v2.3) ======
  // 小组赛第三轮(round=3)是出线生死战，平局对双方都没意义
  // 淘汰赛(round>=4)有加时但常规时间平局仍常见
  if (matchRound === 3) {
    // 小组赛末轮：平局概率极低（历史数据<15%，本届0/6=0%）
    for (const sp of scoreProbs) {
      if (sp.hg === sp.ag) {
        sp.p *= 0.30;            // 平局概率砍至30%
      } else if (Math.abs(sp.hg - sp.ag) >= 2) {
        sp.p *= 1.25;            // 大比分胜负加权
      } else {
        sp.p *= 1.10;            // 小分胜负轻微加权
      }
    }
    scoreProbs.sort((a, b) => b.p - a.p);
  } else if (matchRound >= 4) {
    // 淘汰赛：平局可能→加时，常规时间平局概率略降
    for (const sp of scoreProbs) {
      if (sp.hg === sp.ag) sp.p *= 0.65;
    }
    scoreProbs.sort((a, b) => b.p - a.p);
  } else {
    // 小组赛前两轮：平局实际发生率~28%，但模型偏高
    for (const sp of scoreProbs) {
      if (sp.hg === sp.ag) sp.p *= 0.70;
    }
    scoreProbs.sort((a, b) => b.p - a.p);
  }

  // ====== 优化⑥: altScores智能选优 · 非平局优先逻辑 (v2.3) ======
  // 核心洞察：6/25实测altScores方向命中5/6(83%)，但Picked全选平局(16%)
  // 修复：若top1是平局且top2/3有非平局在合理概率范围内→选用非平局
  let topScore = scoreProbs[0];
  const top3 = scoreProbs.slice(0, 3);

  if (topScore.hg === topScore.ag) {
    // 找top3中最优非平局：综合概率+ELO合理性
    const nonDraws = top3.filter(s => s.hg !== s.ag);

    // 条件1: 存在非平局备选
    // 条件2: 概率 ≥ topScore的55%（小组赛）/ 65%（前两轮）
    const probThreshold = matchRound === 3 ? 0.55 : 0.65;
    const viableNonDraw = nonDraws.find(s => s.p >= topScore.p * probThreshold);

    if (viableNonDraw) {
      topScore = viableNonDraw;
    } else if (nonDraws.length > 0 && matchRound === 3 && nonDraws[0].p >= topScore.p * 0.40) {
      // 末轮降门槛：40%即可
      topScore = nonDraws[0];
    } else if (parkBus && topScore.hg === 0 && topScore.ag === 0) {
      // 铁桶阵→0-0保持原判（大巴确实可能闷平）
      // 不变
    }
  }

  const altScores = scoreProbs.slice(0, 3).map(s => ({
    score: s.score,
    prob: +(s.p * 100).toFixed(1)
  }));

  // 胜负判定
  let verdict, winner, score, goalRange, totalGoals;
  if (topScore.hg > topScore.ag) {
    verdict = 'home'; winner = match.home;
  } else if (topScore.hg < topScore.ag) {
    verdict = 'away'; winner = match.away;
  } else {
    verdict = 'draw'; winner = '平局';
  }

  score = topScore.score;
  totalGoals = topScore.hg + topScore.ag;

  // ========== 把握度计算 ==========
  const shiYingGap = Math.abs(shiWang - yingWang);
  const gapScore = Math.min(1, shiYingGap / 3);

  const dongScore = Math.min(1, dongYaos.length * 0.3 +
    (dongYaos.some(d => d.liuQin === '妻财' || d.liuQin === '官鬼') ? 0.2 : 0));

  const probConcentration = topScore.p * 64;
  const probScore = Math.min(1, probConcentration * 1.5);

  const poBreakPenalty = dangerSignals.filter(s => s.includes('月破') || s.includes('日破')).length * 0.15;

  // ====== 优化②: 卦名警告→置信度修正 ======
  const guaWarningPenalty = WARNING_GUA.has(gua.guaName) ? 0.18 : 0;
  if (guaWarningPenalty > 0) {
    reasons.push(`⚠️卦名「${gua.guaName}」→隐含变数/阻力，置信度下调`);
  }

  // ====== 优化①续: 铁桶阵→置信度下调 ======
  const parkBusPenalty = parkBus ? 0.12 : 0;

  let rawConf = gapScore * 0.4 + dongScore * 0.3 + probScore * 0.3
                - poBreakPenalty - guaWarningPenalty - parkBusPenalty;

  // ====== 优化④续: 崩盘模式→置信度额外下调（尾部厚=不确定） ======
  if (blowoutMode) {
    rawConf -= 0.08;
  }

  const confidence = Math.max(12, Math.min(95, Math.round(rawConf * 100)));
  const confLevel = confidence >= 70 ? '🟢 高把握' : confidence >= 45 ? '🟡 中把握' : '🔴 低把握';

  // 进球范围描述
  if (totalGoals >= 7) goalRange = `超大比分·进球盛宴(${totalGoals}球)`;
  else if (totalGoals >= 5) goalRange = `大球局·${totalGoals}球总进球`;
  else if (totalGoals >= 3) goalRange = `中等比分·${totalGoals}球`;
  else if (totalGoals >= 1) goalRange = `小球局·${totalGoals}球`;
  else goalRange = '沉闷互交白卷';

  // 崩盘模式标签
  if (blowoutMode) {
    goalRange += ' ⚡崩盘风险';
    strategyNotes.push(`崩盘概率${(blowoutProb*100).toFixed(0)}%: ELO差${Math.round(absEloDiff*200)}分+六爻强倾向`);
  }

  return {
    match: { home: match.home, away: match.away, date: match.date, time: match.time, group: match.group },
    liuYaoPrediction: { verdict, winner, score, goalRange, confidence, confLevel, altScores, blowoutMode, blowoutProb },
    verdict, winner, score, goalRange, confidence, confLevel, altScores, blowoutMode, blowoutProb,
    gua: {
      name: gua.guaName,
      isWarning: WARNING_GUA.has(gua.guaName),
      shangGua: symbols.shangGua, xiaGua: symbols.xiaGua,
      shangSymbol: symbols.shangSymbol, xiaSymbol: symbols.xiaSymbol,
      dongYao: dongYaos.length > 0 ? dongYaos[0].position : 0,
      gong: gua.palace, gongWx: gua.palaceWuXing,
      guaCi: gua.guaCi || '',
    },
    pan: {
      yao: yaoWithWang.map(y => ({
        pos: y.position,
        zhi: y.naJia || '',
        wx: y.wuXing || '',
        liuQin: y.liuQin || '',
        liuQinCls: ({妻财:'cai',官鬼:'guan',子孙:'sun',兄弟:'xiong',父母:'fu'})[y.liuQin] || '',
        liuShou: y.liuShou || '',
        isDong: !!y.isMoving,
        isShi: y.shiYing === '世',
        isYing: y.shiYing === '应',
        wangScore: y.wangScore,
        xingXiu: y.xingXiu || '',
        naYin: y.naYin || '',
      })),
      yueZhi, riZhi,
      parkBus, parkBusSide,
    },
    analysis: {
      shiYao: `${shiYao?.liuQin || ''}${shiYao?.naJia || ''}(${shiYao?.wuXing || ''})` + (shiYao?.isMoving ? '·发动' : ''),
      yingYao: `${yingYao?.liuQin || ''}${yingYao?.naJia || ''}(${yingYao?.wuXing || ''})` + (yingYao?.isMoving ? '·发动' : ''),
      shiWang: +shiWang.toFixed(1),
      yingWang: +yingWang.toFixed(1),
      homeAdv: +diff.toFixed(1),
      totalFirepower: +totalFirepower.toFixed(1),
      eloBoost: +eloBoost.toFixed(2),
      reasons: reasons.slice(0, 8),
      strategyNotes,
      dangerSignals,
    },
  };
}

module.exports = { liuYaoPredict, statsSupplement };

// ======================= 统计模型补充 (v1.0) =======================
// 纯ELO+泊松，不含任何术数成分，作为六爻预测的独立对照参考
function statsSupplement(match) {
  const eloH = TEAM_ELO[match.home] || 1600;
  const eloA = TEAM_ELO[match.away] || 1600;
  const eloDiff = (eloH - eloA) / 200;
  const homeAdv = 0.25; // 主场ELO加成转进球
  const adjDiff = eloDiff + homeAdv;

  // ELO胜率
  const expectedHome = 1 / (1 + Math.pow(10, -adjDiff * 2));
  const eloGap = Math.abs(adjDiff);
  const drawProb = Math.max(0.10, 0.30 - eloGap * 0.20);
  const hProb = expectedHome * (1 - drawProb);
  const aProb = (1 - expectedHome) * (1 - drawProb);

  // 攻防系数
  const hAtt = (TEAM_ATT_DEF[match.home] || {att:1.0,def:1.2}).att;
  const hDef = (TEAM_ATT_DEF[match.home] || {att:1.0,def:1.2}).def;
  const aAtt = (TEAM_ATT_DEF[match.away] || {att:1.0,def:1.2}).att;
  const aDef = (TEAM_ATT_DEF[match.away] || {att:1.0,def:1.2}).def;

  // 预期进球
  let xH = hAtt * (aDef / 1.2) * 1.15;
  let xA = aAtt * (hDef / 1.2);

  // 泊松最高概率比分
  function poissonP(lambda, k) {
    let p = Math.exp(-lambda);
    for (let i = 1; i <= k; i++) p *= lambda / i;
    return p;
  }
  let bestScore = '?', bestP = 0;
  const top3 = [];
  for (let hg = 0; hg <= 6; hg++) {
    for (let ag = 0; ag <= 6; ag++) {
      const p = poissonP(xH, hg) * poissonP(xA, ag);
      if (p > bestP) { bestP = p; bestScore = hg+'-'+ag; }
      top3.push({ score: hg+'-'+ag, prob: +(p*100).toFixed(1) });
    }
  }
  top3.sort((a,b) => b.prob - a.prob);

  // 方向判定
  const dirLabel = hProb > aProb + 0.1 ? '主胜倾向' :
    aProb > hProb + 0.1 ? '客胜倾向' : '均衡';

  // 进球范围（取概率最高的相邻区间覆盖≥50%）
  const totalGoals = xH + xA;
  const low = Math.max(0, Math.floor(totalGoals - 1.2));
  const high = Math.ceil(totalGoals + 1.2);

  return {
    eloDiff: +(eloDiff * 200).toFixed(0),
    xGoals: { home: +xH.toFixed(1), away: +xA.toFixed(1), total: +(xH+xA).toFixed(1) },
    direction: {
      home: +(hProb * 100).toFixed(1),
      draw: +(drawProb * 100).toFixed(1),
      away: +(aProb * 100).toFixed(1),
      label: dirLabel,
    },
    goalRange: `${low}-${high}球`,
    mostLikely: bestScore,
    altScores: top3.slice(0, 3),
  };
}
