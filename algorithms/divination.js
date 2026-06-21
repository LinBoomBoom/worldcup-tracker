/**
 * 奇门遁甲 + 大六壬 · 世界杯比分占卜预测
 * 
 * 双术数体系，基于真实专业排盘：
 *   - 奇门遁甲：时日生克 + 八门吉凶 + 星神组合
 *   - 大六壬：四课三传 + 十二天将 + 课体解读
 */

const { Solar, Lunar } = require('lunar-typescript');

// ======================= 基础工具 =======================
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const GAN_WX = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
const ZHI_WX = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
const GONG_WX = { '坎':'水','坤':'土','震':'木','巽':'木','乾':'金','兑':'金','艮':'土','离':'火' };
const GONG_NAMES = ['','坎1','坤2','震3','巽4','中5','乾6','兑7','艮8','离9'];
const STAR = ['','天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英'];
const DOOR = ['','休门','死门','伤门','杜门','开门','惊门','生门','景门'];
const GOD = ['','值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'];
const YUE_JIANG = ['','登明','河魁','从魁','传送','小吉','胜光','太乙','天罡','太冲','功曹','大吉','神后'];
const TIAN_JIANG = ['贵人','螣蛇','朱雀','六合','勾陈','青龙','天空','白虎','太常','玄武','太阴','天后'];

const WU_XING = { '水':1,'火':2,'木':3,'金':4,'土':5 };
const KE = { '水':'火','火':'金','金':'木','木':'土','土':'水' };
const SHENG = { '水':'木','木':'火','火':'土','土':'金','金':'水' };

// ======================= 奇门遁甲 =======================
function qimenPan(year, month, day, hour, minute) {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = Lunar.fromSolar(solar);

  // 节气判定 + 局数
  const jieQi = lunar.getPrevJieQi();
  const nextJieQi = lunar.getNextJieQi();
  const jieQiName = jieQi ? jieQi.getName() : '未知';

  // 阴遁/阳遁判定 (冬至后阳遁, 夏至后阴遁)
  const yangDunJieQi = ['冬至','小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种'];
  const isYangDun = jieQiName ? yangDunJieQi.includes(jieQiName) : true;

  // 日干支
  const riGanZhi = lunar.getDayInGanZhi();
  const riGan = riGanZhi[0];
  const riZhi = riGanZhi[1];

  // 时干支
  const shiGanZhi = lunar.getTimeInGanZhi();
  const shiGan = shiGanZhi[0];
  const shiZhi = shiGanZhi[1];

  // 上中下元 → 局数
  // 日干支序号 mod 3: 甲子戊辰...=上元, 己卯...=中元, 甲午...=下元
  // 简化：用日干支的地支序号定元
  const ganzhi60 = [
    '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
    '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
    '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
    '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
    '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
    '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
  ];
  const riIdx = ganzhi60.indexOf(riGanZhi);
  const yuanIdx = Math.floor(riIdx / 10); // 0=甲子旬, 1=甲戌旬, ..., 5=甲寅旬
  const yuanOrder = yuanIdx % 3; // 0=上元, 1=中元, 2=下元

  // 芒种阳遁: 上元6,中元3,下元9
  // 冬至阳遁: 上元1,中元7,下元4
  // 其他节气类推...简化：芒种=阳遁6/3/9
  const juTable = {
    '芒种': isYangDun ? [6,3,9] : [6,3,9],
    '夏至': [9,3,6],
    '小暑': [8,2,5],
    '大暑': [7,1,4],
    '立秋': [2,5,8],
    '处暑': [1,4,7],
    '白露': [9,3,6],
    '秋分': [7,1,4],
    '寒露': [6,9,3],
    '霜降': [5,8,2],
    '立冬': [6,9,3],
    '小雪': [5,8,2],
    '大雪': [4,7,1],
    '冬至': [1,7,4],
    '小寒': [2,5,8],
    '大寒': [3,6,9],
    '立春': [8,5,2],
    '雨水': [9,6,3],
    '惊蛰': [1,7,4],
    '春分': [3,9,6],
    '清明': [4,1,7],
    '谷雨': [5,2,8],
    '立夏': [4,1,7],
    '小满': [5,2,8],
  };

  const juNum = (juTable[jieQiName] || (isYangDun ? [1,7,4] : [9,3,6]))[yuanOrder];

  // 地盘排布
  const dipan = {};
  for (let i = 0; i < 9; i++) {
    const gong = isYangDun
      ? ((juNum - 1 + i) % 9) + 1
      : ((juNum - 1 - i + 9) % 9) + 1;
    dipan[gong] = i + 1; // 1=戊 2=己 ... 9=壬 10=癸 (甲隐)
  }

  // 旬首
  const xunIdx = Math.floor(riIdx / 10) * 10;
  const xunShou = ganzhi60[xunIdx];
  const xunShouGanNum = GAN.indexOf(xunShou[0]) + 1; // 1-10

  // 值符星: 旬首地盘宫对应的星
  const starBaseGong = [1,2,3,4,2,6,7,8,9]; // 天蓬=坎1...天英=离9, 天禽寄坤2
  // 简化：旬首干在地盘哪个宫，该宫原星就是值符
  let zhiFuGong = 0;
  for (let g = 1; g <= 9; g++) {
    if (dipan[g] === xunShouGanNum) { zhiFuGong = g; break; }
  }
  if (zhiFuGong === 5) zhiFuGong = 2; // 中5寄坤2
  const zhiFuStarIdx = starBaseGong[zhiFuGong - 1];

  // 值使门: 值符星本宫对应的门
  const zhiShiDoorIdx = zhiFuStarIdx; // 星->门对应

  // 时干落宫 = 值符星落宫
  const shiGanNum = GAN.indexOf(shiGan) + 1;
  let shiGanGong = 0;
  for (let g = 1; g <= 9; g++) {
    if (dipan[g] === shiGanNum) { shiGanGong = g; break; }
  }

  // 天盘: 值符落时干宫, 其他星顺/逆排
  const tianpan = {};
  for (let i = 0; i < 9; i++) {
    const starIdx = i + 1;
    const offset = starIdx - zhiFuStarIdx;
    let gong;
    if (isYangDun) {
      gong = shiGanGong + offset;
      while (gong > 9) gong -= 9;
      while (gong < 1) gong += 9;
    } else {
      gong = shiGanGong - offset;
      while (gong < 1) gong += 9;
      while (gong > 9) gong -= 9;
    }
    if (gong === 5 && starIdx !== 5) continue;
    tianpan[gong] = starIdx;
  }

  // 八门: 值使门随时支
  const shiZhiNum = ZHI.indexOf(shiZhi) + 1;
  let doorGong = zhiFuGong;
  for (let i = 1; i < shiZhiNum; i++) {
    if (isYangDun) {
      doorGong++;
      if (doorGong === 5) doorGong++;
      if (doorGong > 9) doorGong = 1;
    } else {
      doorGong--;
      if (doorGong === 5) doorGong--;
      if (doorGong < 1) doorGong = 9;
    }
  }

  const bamen = {};
  const doorOrder = [1,2,3,4,6,7,8,9]; // 休死伤杜开惊生景 (跳过5)
  const doorOrderFull = [1,2,3,4,0,6,7,8,9];
  for (let i = 0; i < 9; i++) {
    const gong = isYangDun
      ? ((doorGong - 1 + i) % 9) + 1
      : ((doorGong - 1 - i + 9) % 9) + 1;
    if (gong === 5) continue;
    const di = i % 8;
    const dIdx = doorOrder[di];
    if (dIdx) bamen[gong] = dIdx;
  }

  // 八神: 值符带头, 阳顺阴逆
  const bashen = {};
  for (let i = 0; i < 8; i++) {
    const gong = isYangDun
      ? ((shiGanGong - 1 + i) % 9) + 1
      : ((shiGanGong - 1 - i + 9) % 9) + 1;
    if (gong === 5) continue;
    bashen[gong] = i + 1;
  }

  // 日干宫(主/左队) vs 时干宫(客/右队)
  const riGanNum = GAN.indexOf(riGan) + 1;
  let riGanGong = 0;
  for (let g = 1; g <= 9; g++) {
    if (dipan[g] === riGanNum) { riGanGong = g; break; }
  }
  if (riGanGong === 5) riGanGong = 2;

  // 结果: 分析日干宫 vs 时干宫
  const riWx = GONG_WX[GONG_NAMES[riGanGong].slice(0,1)];
  const shiWx = GONG_WX[GONG_NAMES[shiGanGong].slice(0,1)];

  let result = '', advantage = '', scoreHint = '';
  if (SHENG[riWx] === shiWx) { result = '日生时'; advantage = '客队(右队)有利'; scoreHint = '客队占优,净胜1-2球'; }
  else if (SHENG[shiWx] === riWx) { result = '时生日'; advantage = '主队(左队)有利'; scoreHint = '主队占优,净胜1-2球'; }
  else if (KE[riWx] === shiWx) { result = '日克时'; advantage = '主队克制客队'; scoreHint = '主队胜,1球小胜'; }
  else if (KE[shiWx] === riWx) { result = '时克日'; advantage = '客队克制主队'; scoreHint = '客队胜,1球小胜'; }
  else { result = '比和'; advantage = '势均力敌'; scoreHint = '平局或1球胜负'; }

  // 时干宫门判断
  const doorIdx = bamen[shiGanGong] || 0;
  const doorName = DOOR[doorIdx];
  const jimen = ['休门','开门','生门'];
  const xiongmen = ['死门','惊门','伤门'];
  const doorJiXiong = jimen.includes(doorName) ? '吉' : xiongmen.includes(doorName) ? '凶' : '平';

  // 时干宫神判断
  const shenIdx = bashen[shiGanGong] || 0;
  const shenName = GOD[shenIdx];

  return {
    method: '奇门遁甲',
    isYangDun, juNum,
    jieQi: jieQiName,
    riGanZhi, shiGanZhi,
    riGanGong: GONG_NAMES[riGanGong],
    shiGanGong: GONG_NAMES[shiGanGong],
    zhiFuStar: STAR[zhiFuStarIdx],
    zhiShiDoor: DOOR[zhiShiDoorIdx],
    riWx, shiWx,
    shengKe: result,
    advantage,
    scoreHint,
    doorName, doorJiXiong,
    shenName,
    dipan: Object.entries(dipan).slice(0, 9).map(([g,n]) => `${GONG_NAMES[+g]}:${GAN[n]}`),
    analysis: `${GONG_NAMES[riGanGong]}宫(${riWx})${result}${GONG_NAMES[shiGanGong]}宫(${shiWx}), ${advantage}。时干宫${doorName}(${doorJiXiong}), 神${shenName}。${scoreHint}。`
  };
}

// ======================= 大六壬 =======================
function liurenPan(year, month, day, hour, minute) {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = Lunar.fromSolar(solar);

  const riGanZhi = lunar.getDayInGanZhi();
  const riGan = riGanZhi[0];
  const riZhi = riGanZhi[1];

  const shiGanZhi = lunar.getTimeInGanZhi();
  const zhanZhi = shiGanZhi[1];

  // 月将
  const ganJiGong = { '甲':'寅','乙':'辰','丙':'巳','丁':'未','戊':'巳','己':'未','庚':'申','辛':'戌','壬':'亥','癸':'丑' };
  const yueJiangZhi = ganJiGong[riGan] || '子';

  // 天盘
  const tianPan = {};
  const yjIdx = ZHI.indexOf(yueJiangZhi);
  const zzIdx = ZHI.indexOf(zhanZhi);
  for (let i = 0; i < 12; i++) {
    const tianZhi = ZHI[(yjIdx + i) % 12];
    const diZhi = ZHI[(zzIdx + i) % 12];
    tianPan[diZhi] = tianZhi;
  }

  // 四课
  const riGanGong = ganJiGong[riGan] || '子';
  const ke1_s = tianPan[riGanGong]; // 干阳
  const ke2_s = tianPan[ke1_s]; // 干阴
  const ke3_s = tianPan[riZhi]; // 支阳
  const ke4_s = tianPan[ke3_s]; // 支阴

  const siKe = [
    { label:'干阳', shang:ke1_s, xia:riGanGong },
    { label:'干阴', shang:ke2_s, xia:ke1_s },
    { label:'支阳', shang:ke3_s, xia:riZhi },
    { label:'支阴', shang:ke4_s, xia:ke3_s },
  ];

  // 三传 (取贼克法, 简化: 取第一课发用)
  // 若四课中有下贼上或上克下, 取发用
  let chuChuan = null, zhongChuan = null, moChuan = null;

  // 简化三传: 若有克则发用, 否则用昴星
  const hasKe = (shang, xia) => {
    const sx = ZHI_WX[shang] || '';
    const xx = ZHI_WX[xia] || '';
    return KE[sx] === xx || KE[xx] === sx;
  };

  // 找贼克
  let faYongKe = null;
  for (const ke of siKe) {
    const sx = ZHI_WX[ke.shang], xx = ZHI_WX[ke.xia];
    if (KE[xx] === sx) { faYongKe = ke; break; } // 下贼上优先
  }
  if (!faYongKe) {
    for (const ke of siKe) {
      const sx = ZHI_WX[ke.shang], xx = ZHI_WX[ke.xia];
      if (KE[sx] === xx) { faYongKe = ke; break; } // 上克下
    }
  }

  if (faYongKe) {
    chuChuan = faYongKe.shang;
    zhongChuan = tianPan[chuChuan];
    moChuan = tianPan[zhongChuan];
  } else {
    // 无克, 用昴星: 日取干上神, 辰取支上神
    const ganYang = tianPan[riGanGong];
    const zhiYang = tianPan[riZhi];
    const isYang = GAN.indexOf(riGan) % 2 === 0; // 甲丙戊庚壬=阳
    chuChuan = isYang ? tianPan[ganYang] : tianPan[riGanGong];
    zhongChuan = tianPan[chuChuan];
    moChuan = tianPan[zhongChuan];
  }

  const sanChuan = { chu: chuChuan, zhong: zhongChuan, mo: moChuan };

  // 十二天将 (贵人)
  const guiRenZhi = { '甲':'丑','戊':'丑','庚':'丑', '乙':'子','己':'子', '丙':'亥','丁':'酉','辛':'午','壬':'巳','癸':'卯' };
  const grZhi = ZHI.indexOf(guiRenZhi[riGan] || '丑');
  const isDay = (hour >= 6 && hour < 18);
  const tianJiangMap = {};
  for (let i = 0; i < 12; i++) {
    const offset = isDay ? i : -i;
    const tjIdx = ((grZhi + offset) % 12 + 12) % 12;
    tianJiangMap[ZHI[tjIdx]] = TIAN_JIANG[i];
  }

  // 解读
  const chuWx = ZHI_WX[chuChuan], zhongWx = ZHI_WX[zhongChuan], moWx = ZHI_WX[moChuan];
  const riWx = ZHI_WX[riGanGong];

  // 初传 vs 日干 => 上半场
  let firstHalf = '';
  if (SHENG[chuWx] === riWx) firstHalf = '初传生日干→上半场主队有利';
  else if (SHENG[riWx] === chuWx) firstHalf = '初传泄日干→上半场客队有利';
  else if (KE[chuWx] === riWx) firstHalf = '初传克日干→上半场客队压制';
  else if (KE[riWx] === chuWx) firstHalf = '日干克初传→上半场主队压制';
  else firstHalf = '初传与日干比和→上半场均势';

  // 末传 vs 日干 => 下半场/终局
  let secondHalf = '';
  if (SHENG[moWx] === riWx) secondHalf = '末传生日干→下半场主队优势';
  else if (SHENG[riWx] === moWx) secondHalf = '末传泄日干→下半场客队优势';
  else if (KE[moWx] === riWx) secondHalf = '末传克日干→终局客队有利';
  else if (KE[riWx] === moWx) secondHalf = '日干克末传→终局主队有利';
  else secondHalf = '末传与日干比和→终局均势';

  // 中传决定比赛走势
  let trend = '';
  if (SHENG[zhongWx] === riWx) trend = '中传生日干→比赛中段主队转优';
  else if (KE[zhongWx] === riWx) trend = '中传克日干→比赛中段客队压制';

  return {
    method: '大六壬',
    riGanZhi, shiGanZhi,
    yueJiang: yueJiangZhi,
    zhanShi: zhanZhi,
    siKe: siKe.map(k => `${k.label}: ${k.shang}(${ZHI_WX[k.shang]})↓${k.xia}(${ZHI_WX[k.xia]})`),
    sanChuan: { chu: chuChuan, zhong: zhongChuan, mo: moChuan },
    tianJiang: Object.entries(tianJiangMap).slice(0,6).map(([z,j]) => `${z}:${j}`),
    chuWx, zhongWx, moWx, riWx,
    firstHalf, trend, secondHalf,
    analysis: `四课干阳${ke1_s}↓${riGanGong}，支阳${ke3_s}↓${riZhi}。三传: ${chuChuan}(${chuWx})→${zhongChuan}(${zhongWx})→${moChuan}(${moWx})。${firstHalf}；${trend ? trend + '；':''}${secondHalf}。`,
  };
}

// ======================= 综合占卜预测 =======================
function divineMatch(match) {
  // 解析比赛时间
  const [year, month, day] = match.date.split('-').map(Number);
  const [hour, minute] = match.time.split(':').map(Number);

  const qimen = qimenPan(year, month, day, hour, minute || 0);
  const liuren = liurenPan(year, month, day, hour, minute || 0);

  // 综合: 奇门主胜负, 六壬主进程
  const qAdvantage = qimen.advantage;
  const qLabel = qAdvantage.includes('主队') || qAdvantage.includes('克制客') ? 'home' :
                  qAdvantage.includes('客队') || qAdvantage.includes('克制主') ? 'away' : 'draw';

  const lFirst = liuren.firstHalf;
  const lFinal = liuren.secondHalf;
  const lLabel = lFinal.includes('主队') ? 'home' :
                  lFinal.includes('客队') ? 'away' : 'draw';

  // 综合判定
  let verdict, winner, score;
  if (qLabel === lLabel && qLabel !== 'draw') {
    verdict = qLabel;
    winner = qLabel === 'home' ? match.home : match.away;
    score = qLabel === 'home' ? `2-1` : `1-2`;
  } else if (qLabel === 'home' && lLabel === 'home') {
    verdict = 'home'; winner = match.home; score = '2-1';
  } else if (qLabel === 'away' && lLabel === 'away') {
    verdict = 'away'; winner = match.away; score = '1-2';
  } else if (qLabel === 'home' || lLabel === 'home') {
    verdict = 'home'; winner = match.home; score = '1-0';
  } else if (qLabel === 'away' || lLabel === 'away') {
    verdict = 'away'; winner = match.away; score = '0-1';
  } else {
    verdict = 'draw'; winner = '平局'; score = '1-1';
  }

  // 进球数预测
  let goals;
  if (score === '2-1' || score === '1-2') goals = 3;
  else if (score === '1-0' || score === '0-1') goals = 1;
  else goals = 2;

  return {
    match: { home: match.home, away: match.away, date: match.date, time: match.time, group: match.group },
    verdict, winner, score, goals,
    qimen: {
      ju: `${qimen.isYangDun?'阳遁':'阴遁'}${qimen.juNum}局`,
      jieQi: qimen.jieQi,
      riGanGong: qimen.riGanGong,
      shiGanGong: qimen.shiGanGong,
      shengKe: qimen.shengKe,
      advantage: qimen.advantage,
      doorName: qimen.doorName,
      doorJiXiong: qimen.doorJiXiong,
      shenName: qimen.shenName,
      zhiFuStar: qimen.zhiFuStar,
      juNum: qimen.juNum,
      analysis: qimen.analysis,
    },
    liuren: {
      sanChuan: liuren.sanChuan,
      firstHalf: liuren.firstHalf,
      secondHalf: liuren.secondHalf,
      trend: liuren.trend,
      siKe: liuren.siKe.slice(0, 3),
      analysis: liuren.analysis,
    },
    summary: `【奇门】${qimen.analysis}\n【六壬】${liuren.analysis}\n综合: ${verdict==='home'?match.home+'胜':verdict==='away'?match.away+'胜':'平局'} ${score}`,
  };
}

module.exports = { divineMatch, qimenPan, liurenPan };
