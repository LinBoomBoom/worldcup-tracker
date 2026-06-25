/**
 * 赛程自动同步模块 v1.0
 * 
 * 功能：
 *   1. 服务启动时自动检查赛程更新
 *   2. /api/sync POST — 接收浏览器抓取的赛程数据
 *   3. /api/sync/status GET — 查看同步状态
 * 
 * 流程：浏览器打开小红书 → 提取数据 → POST /api/sync → 自动更新 matches.js
 */

const fs = require('fs');
const path = require('path');
const MATCHES_PATH = path.join(__dirname, '..', 'data', 'matches.js');
const RESULTS_PATH = path.join(__dirname, '..', 'data', 'all-results.json');

// 同步状态
const syncState = {
  lastSync: null,
  lastSource: null,
  lastMatches: 0,
  lastError: null,
  startupChecked: false,
};

// ==================== 赛程更新处理 ====================

/**
 * 接收外部传入的比赛数据，更新本地文件
 * @param {Object} payload - { date, matches: [{home,away,score,hg,ag,events,motm,group,round,time}], source }
 */
function ingestMatchResults(payload) {
  const { date, matches, source } = payload;
  if (!date || !Array.isArray(matches) || matches.length === 0) {
    throw new Error('需要提供 date 和 matches 数组');
  }

  // 1. 更新 all-results.json
  let allResults = [];
  try {
    allResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  } catch (e) { /* 首次运行 */ }

  let updated = 0, added = 0;
  for (const m of matches) {
    const key = `${m.home}-${m.away}`;
    const existing = allResults.find(r =>
      r.date === m.date && r.home === m.home && r.away === m.away
    );
    if (existing && existing.score && existing.score !== 'upcoming') {
      // 已有完赛数据，跳过
      continue;
    }
    if (existing) {
      // 更新比分
      Object.assign(existing, m);
      updated++;
    } else {
      allResults.push({
        date: m.date,
        time: m.time || '',
        group: m.group || '',
        round: m.round || 0,
        home: m.home,
        away: m.away,
        score: m.score || 'upcoming',
        hg: m.hg,
        ag: m.ag,
        events: m.events || '',
        motm: m.motm || '',
        venue: m.venue || '',
      });
      added++;
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(allResults, null, 2), 'utf8');

  // 2. 更新 matches.js（替换 upcoming 状态为完赛数据）
  updateMatchesJS(matches);

  // 3. 更新同步状态
  syncState.lastSync = new Date().toISOString();
  syncState.lastSource = source || 'api';
  syncState.lastMatches = matches.length;

  return { updated, added, total: matches.length };
}

/**
 * 更新 matches.js 中对应比赛的比分
 * 匹配规则：日期 + 主队 + 客队一致 → 替换 status 和 score
 */
function updateMatchesJS(matches) {
  let content = fs.readFileSync(MATCHES_PATH, 'utf8');
  let matchCount = 0;

  for (const m of matches) {
    if (!m.score || m.score === 'upcoming') continue;

    const hg = m.hg ?? parseInt(m.score.split('-')[0]);
    const ag = m.ag ?? parseInt(m.score.split('-')[1]);
    const venue = m.venue || '待定';

    // 严格匹配: 日期 + 时间 + home + away + status:"upcoming"
    // 正则: 在一行内包含 date+home，后续行包含 away+status:"upcoming"
    const escapedHome = m.home.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedAway = m.away.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 构建模式: date:"..." 后面跟着的包含特定 home/away 且 status:"upcoming" 的块
    const blockPattern = new RegExp(
      `(date:"${m.date}"[, \\S]*?home:"${escapedHome}"[, \\S]*?away:"${escapedAway}"[^}]*?)status:"upcoming"`,
      's'
    );

    const newScoreBlock = `score:"${m.score}", hg:${hg}, ag:${ag},\n    events:"${m.events || ''}", motm:"${m.motm || ''}", venue:"${venue}"`;

    if (blockPattern.test(content)) {
      content = content.replace(blockPattern, (match, prefix) => {
        matchCount++;
        return `${prefix}${newScoreBlock}`;
      });
    }
  }

  if (matchCount > 0) {
    fs.writeFileSync(MATCHES_PATH, content, 'utf8');
    console.log(`  📝 [AutoSync] matches.js: ${matchCount} 场已更新`);
  }

  return matchCount;
}

// ==================== 服务启动自动检查 ====================

function startupCheck() {
  if (syncState.startupChecked) return;
  syncState.startupChecked = true;

  console.log('🔍 [AutoSync] 启动时检查赛程更新...');

  // 检查 all-results.json 中是否有未记录的比赛
  try {
    const allResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
    const upcoming = allResults.filter(r => !r.score || r.score === 'upcoming');
    const completed = allResults.filter(r => r.score && r.score !== 'upcoming');

    console.log(`   ✅ 完赛场次: ${completed.length} | 待比赛: ${upcoming.length}`);
    console.log(`   📅 最新日期: ${completed.length > 0 ? completed[completed.length-1].date : '无数据'}`);
  } catch (e) {
    console.log('   ⚠️ all-results.json 不存在或无权限读取');
  }
}

// ==================== 路由注册 ====================

function registerRoutes(app) {
  // GET /api/sync/status — 查看同步状态
  app.get('/api/sync/status', (req, res) => {
    try {
      const allResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
      const dates = [...new Set(allResults.map(r => r.date))].sort();
      res.json({
        ...syncState,
        dataStats: {
          totalMatches: allResults.length,
          completedMatches: allResults.filter(r => r.score && r.score !== 'upcoming').length,
          upcomingMatches: allResults.filter(r => !r.score || r.score === 'upcoming').length,
          dateRange: dates.length > 0 ? `${dates[0]} ~ ${dates[dates.length-1]}` : '无数据',
        },
      });
    } catch (e) {
      res.json({ ...syncState, error: e.message });
    }
  });

  // POST /api/sync — 接收浏览器提取的赛程数据
  app.post('/api/sync', (req, res) => {
    try {
      const result = ingestMatchResults(req.body);
      console.log(`🔄 [AutoSync] ${req.body.source || 'api'}: +${result.added} 更新${result.updated}/${result.total} 场 (${req.body.date})`);
      res.json({ success: true, ...result });
    } catch (e) {
      syncState.lastError = e.message;
      console.error('❌ [AutoSync] 同步失败:', e.message);
      res.status(400).json({ success: false, error: e.message });
    }
  });

  console.log('✅ [AutoSync] 路由已注册: GET /api/sync/status, POST /api/sync');
}

module.exports = {
  registerRoutes,
  startupCheck,
  ingestMatchResults,
  syncState,
};
