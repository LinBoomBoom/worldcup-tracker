const express = require('express');
const path = require('path');
const { getAllMatches, getStandings, getGroupHistory, getInjuries } = require('./data/matches');
const { predictMatch, predictDay, getAlgorithmInfo, compositePredict } = require('./algorithms/predictor');
const { divineMatch } = require('./algorithms/divination');

// 预测历史缓存
const predictionCache = {};
const divinationCache = {};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: 获取全部比赛
app.get('/api/matches', (req, res) => {
  res.json(getAllMatches());
});

// API: 获取积分榜
app.get('/api/standings', (req, res) => {
  res.json(getStandings());
});

// API: 获取小组历史对阵
app.get('/api/group-history', (req, res) => {
  res.json(getGroupHistory());
});

// API: 获取伤病/替补信息
app.get('/api/injuries', (req, res) => {
  res.json(getInjuries());
});

// API: 预测单场比赛
app.get('/api/predict/:matchId', (req, res) => {
  const prediction = predictMatch(req.params.matchId);
  if (!prediction) return res.status(404).json({ error: 'Match not found' });
  res.json(prediction);
});

// API: 预测某日所有比赛
app.get('/api/predict-day', (req, res) => {
  const date = req.query.date || '2026-06-22';
  res.json(predictDay(date));
});

// API: 算法说明
app.get('/api/algorithms', (req, res) => {
  res.json(getAlgorithmInfo());
});

// API: 奇门+六壬占卜预测
app.get('/api/divination', (req, res) => {
  try {
    const date = req.query.date || '2026-06-22';
    const { upcoming } = getAllMatches();
    const dayMatches = upcoming.filter(m => m.date === date);
    const results = dayMatches.map(m => divineMatch(m));
    res.json({ date, count: results.length, results });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack?.split('\n').slice(0,3) });
  }
});

// API: 全部日期预测历史（统计+占卜）
app.get('/api/predictions-history', (req, res) => {
  try {
    const { upcoming } = getAllMatches();
    // 按日期分组
    const dates = [...new Set(upcoming.map(m => m.date))].sort();
    const history = dates.map(date => {
      const dayMatches = upcoming.filter(m => m.date === date);
      if (!predictionCache[date]) {
        predictionCache[date] = dayMatches.map(m => ({
          match: { home: m.home, away: m.away, time: m.time, group: m.group, round: m.round },
          prediction: compositePredict(m.home, m.away)
        }));
      }
      if (!divinationCache[date]) {
        divinationCache[date] = dayMatches.map(m => divineMatch(m));
      }
      return {
        date,
        matches: dayMatches.length,
        statistical: predictionCache[date],
        divination: divinationCache[date],
        isToday: date === '2026-06-22',
      };
    });
    res.json({ history, serverTime: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🏆 World Cup Tracker running on http://localhost:${PORT}`);
});
