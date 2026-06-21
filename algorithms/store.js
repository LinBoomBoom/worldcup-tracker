/**
 * 预测持久化存储
 * 每天只预测下一日比赛，结果写入文件永不改变
 */
const fs = require('fs');
const path = require('path');
const { compositePredict } = require('./predictor');
const { divineMatch } = require('./divination');

const STORE_PATH = path.join(__dirname, '..', 'data', 'predictions-store.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch (e) { /* ignore */ }
  return { statistical: {}, divination: {} };
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * 获取指定日期的预测。如果缓存中没有，只对下一日进行计算。
 * @param {Date} now 当前北京时间
 * @returns {object} { date, statistical, divination, frozen }
 */
function getTodayPredictions(now) {
  const store = loadStore();
  const bj = new Date(now.getTime() + 8 * 3600000);
  const today = bj.toISOString().slice(0, 10);

  // 从数据模块获取所有待赛
  const { getAllMatches } = require('../data/matches');
  const { upcoming } = getAllMatches();
  const allDates = [...new Set(upcoming.map(m => m.date))].sort();

  // 找第一个未预测的日期（只预测今天及未来，不补历史）
  let nextDate = null;
  for (const d of allDates) {
    if (d < today) continue; // 过去的日期不补预测
    if (!store.statistical[d] || !store.divination[d]) {
      nextDate = d;
      break;
    }
  }

  // 如果需要预测且存在，执行预测
  if (nextDate) {
    const dayMatches = upcoming.filter(m => m.date === nextDate);
    if (dayMatches.length > 0) {
      store.statistical[nextDate] = dayMatches.map(m => ({
        match: { home: m.home, away: m.away, time: m.time, group: m.group, round: m.round },
        prediction: compositePredict(m.home, m.away),
        generatedAt: now.toISOString()
      }));
      store.divination[nextDate] = dayMatches.map(m => ({
        ...divineMatch(m),
        generatedAt: now.toISOString()
      }));
      saveStore(store);
      console.log(`✅ 已生成 ${nextDate} 的预测 (${dayMatches.length}场)`);
    }
  }

  // 只返回已预测的日期（不超前展示未来未预测的）
  const history = [];
  for (const d of allDates) {
    if (!store.statistical[d] && !store.divination[d]) break; // 遇到第一个未预测的即停止
    history.push({
        date: d,
        matches: (store.statistical[d] || store.divination[d] || []).length,
        statistical: store.statistical[d] || [],
        divination: store.divination[d] || [],
        frozen: true
      });
    }
  }

  return { history, today };
}

module.exports = { getTodayPredictions };
