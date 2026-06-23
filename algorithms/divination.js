/**
 * 六爻预测 · 世界杯比分占卜 v2.0
 * 基于 iching-shifa 专业排盘库
 * 
 * 优势：
 *   1. 每场独立起卦 — threeNumberQiGua 编码队伍+时间
 *   2. 专业纳甲排盘 — 六亲/六兽/世应/星宿/纳音全自动
 *   3. 六亲足球映射 — 世=主队 应=客队 财=进球 官=防守
 *   4. 旺衰评分 — 月建+日辰双重加权
 */

const { threeNumberQiGua, decodeGua, solarToLunar, BAGUA_XIANG } = require('iching-shifa');

// ======================= 五行生克 =======================
const WX_SHENG = {'金':'水','水':'木','木':'火','火':'土','土':'金'};
const WX_KE    = {'金':'木','木':'土','土':'水','水':'火','火':'金'};
const ZHI_WX   = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};
const GAN_WX   = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};

// 八卦符号映射
const GUA_SYMBOLS = {
  '乾':'☰','兑':'☱','离':'☲','震':'☳','巽':'☴','坎':'☵','艮':'☶','坤':'☷'
};

// 八卦从yaoString推 (6/8=阴, 7/9=阳)
function yaoStrToGua(yaoStr) {
  const nums = yaoStr.split('').map(Number);
  const toYinYang = n => (n === 6 || n === 8) ? 0 : 1;
  // 下卦: 位置0-2 (初爻到三爻), 上卦: 位置3-5 (四爻到上爻)
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
  else if (WX_SHENG[yueWx] === yaoWx) score += 1;   // 月生
  else if (WX_KE[yueWx] === yaoWx) score -= 1.5;     // 月克
  else if (WX_SHENG[yaoWx] === yueWx) score -= 0.5;  // 泄

  // 日辰
  if (yaoWx === riWx) score += 1;
  else if (WX_SHENG[riWx] === yaoWx) score += 0.5;
  else if (WX_KE[riWx] === yaoWx) score -= 1;
  else if (WX_SHENG[yaoWx] === riWx) score -= 0.3;

  return score;
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

  const shiYingDiff = shiWang - yingWang;
  if (shiYingDiff >= 1.5) { homeAdv += 2; reasons.push('世爻旺于应爻→主队占优'); }
  else if (shiYingDiff >= 0.5) { homeAdv += 1; reasons.push('世爻略旺→主队小优'); }
  else if (shiYingDiff <= -1.5) { awayAdv += 2; reasons.push('应爻旺于世爻→客队占优'); }
  else if (shiYingDiff <= -0.5) { awayAdv += 1; reasons.push('应爻略旺→客队小优'); }
  else { reasons.push('世应均势→实力接近'); }

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

  // 8. 火力 = 财爻旺度 + 子孙*0.5 - 官鬼*0.3
  const caiScore = caiYaos.reduce((s, c) => s + c.wangScore, 0);
  const sunScore = sunYaos.reduce((s, c) => s + c.wangScore, 0);
  const guanScore = guanYaos.reduce((s, c) => s + c.wangScore, 0);
  const diff = homeAdv - awayAdv;
  const totalFirepower = caiScore + sunScore * 0.5 - guanScore * 0.3;

  // 9. 比分推断
  let verdict, winner, score, goalRange;
  if (diff >= 3) {
    verdict = 'home'; winner = match.home;
    if (totalFirepower >= 3) { score = '3-1'; goalRange = '主队大胜·3~5球'; }
    else if (totalFirepower >= 1) { score = '2-1'; goalRange = '主队胜·2~3球'; }
    else { score = '1-0'; goalRange = '主队小胜·1~2球'; }
  } else if (diff >= 1.5) {
    verdict = 'home'; winner = match.home;
    if (totalFirepower >= 2) { score = '2-1'; goalRange = '主队胜·2~3球'; }
    else { score = '1-0'; goalRange = '主队小胜·1~2球'; }
  } else if (diff <= -3) {
    verdict = 'away'; winner = match.away;
    if (totalFirepower >= 3) { score = '1-3'; goalRange = '客队大胜·3~5球'; }
    else if (totalFirepower >= 1) { score = '1-2'; goalRange = '客队胜·2~3球'; }
    else { score = '0-1'; goalRange = '客队小胜·1~2球'; }
  } else if (diff <= -1.5) {
    verdict = 'away'; winner = match.away;
    if (totalFirepower >= 2) { score = '1-2'; goalRange = '客队胜·2~3球'; }
    else { score = '0-1'; goalRange = '客队小胜·1~2球'; }
  } else {
    verdict = 'draw'; winner = '平局';
    if (totalFirepower >= 2) { score = '2-2 / 1-1'; goalRange = '进球平局·2~4球'; }
    else if (totalFirepower >= 0) { score = '1-1'; goalRange = '平局·1~2球'; }
    else { score = '0-0 / 1-1'; goalRange = '沉闷平局·0~1球'; }
  }

  return {
    match: { home: match.home, away: match.away, date: match.date, time: match.time, group: match.group },
    liuYaoPrediction: { verdict, winner, score, goalRange },
    verdict, winner, score, goalRange,
    gua: {
      name: gua.guaName,
      shangGua: symbols.shangGua, xiaGua: symbols.xiaGua,
      shangSymbol: symbols.shangSymbol, xiaSymbol: symbols.xiaSymbol,
      dongYao: dongYaos.length > 0 ? dongYaos[0].position : 0,
      gong: gua.palace, gongWx: gua.palaceWuXing,
      guaCi: gua.guaCi || '',
    },
    pan: {
      yao: yaoWithWang.map(y => ({
        pos: y.position,
        zhi: y.naJia || '',       // 纳甲干支
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
    },
    analysis: {
      shiYao: `${shiYao?.liuQin || ''}${shiYao?.naJia || ''}(${shiYao?.wuXing || ''})` + (shiYao?.isMoving ? '·发动' : ''),
      yingYao: `${yingYao?.liuQin || ''}${yingYao?.naJia || ''}(${yingYao?.wuXing || ''})` + (yingYao?.isMoving ? '·发动' : ''),
      shiWang: +shiWang.toFixed(1),
      yingWang: +yingWang.toFixed(1),
      homeAdv: +diff.toFixed(1),
      totalFirepower: +totalFirepower.toFixed(1),
      reasons: reasons.slice(0, 6),
      dangerSignals,
    },
  };
}

module.exports = { liuYaoPredict };
