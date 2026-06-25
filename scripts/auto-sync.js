/**
 * 赛程自动同步模块 v2.0
 * 
 * 功能：
 *   1. 服务启动时静默抓取小红书 HTML → 提取 __INITIAL_STATE__ 中的赛程数据
 *   2. /api/sync POST — 手动推送数据
 *   3. /api/sync/status GET — 查看同步状态
 * 
 * 原理：小红书世界杯页面是SSR，HTML中直接包含完整的 window.__INITIAL_STATE__ JSON
 *       worldCupMatchSchedule.data._rawValue.matches[] = 全部104场比赛
 *       不需要浏览器渲染，纯 HTTP fetch 即可获取
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const MATCHES_PATH = path.join(__dirname, '..', 'data', 'matches.js');
const RESULTS_PATH = path.join(__dirname, '..', 'data', 'all-results.json');

const XHS_URL = 'https://www.xiaohongshu.com/worldcup26?wcup_source=web_sidebar_entry';

// 同步状态
const syncState = {
  lastSync: null,
  lastSource: null,
  lastMatches: 0,
  lastError: null,
  startupChecked: false,
};

// ==================== 小红书数据抓取 ====================

/**
 * 从小红书 HTML 中提取 __INITIAL_STATE__ 并解析赛程数据
 * 纯 HTTP fetch，不打开浏览器，不影响用户
 */
function fetchFromXiaohongshu() {
  return new Promise((resolve, reject) => {
    const req = https.get(XHS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        try {
          // 提取 window.__INITIAL_STATE__ = {...}
          const idx = html.indexOf('window.__INITIAL_STATE__=');
          if (idx === -1) { reject(new Error('未找到 __INITIAL_STATE__')); return; }

          const start = html.indexOf('{', idx);
          let depth = 0, end = start;
          let inString = false, escape = false;
          for (let i = start; i < html.length; i++) {
            const c = html[i];
            if (escape) { escape = false; continue; }
            if (c === '\\') { escape = true; continue; }
            if (c === '"') { inString = !inString; continue; }
            if (inString) continue;
            if (c === '{') depth++;
            else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
          }

          const jsonStr = html.substring(start, end);
          // 净化非标准JSON（undefined → null）
          const sanitized = jsonStr.replace(/:undefined/g, ':null');
          const state = JSON.parse(sanitized);
          const schedule = state?.worldCupMatchSchedule?.data;
          if (!schedule || !schedule.matches) {
            reject(new Error('未找到 worldCupMatchSchedule.matches'));
            return;
          }
          resolve(schedule);
        } catch (e) {
          reject(new Error('解析失败: ' + e.message));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * 将小红书数据格式转换为项目标准格式
 */
function normalizeMatchData(schedule) {
  const matches = [];
  const items = schedule?.matches || [];

  for (const item of items) {
    const m = item.match;
    if (!m) continue;

    // matchTime 是秒级Unix时间戳
    const ts = m.matchTime ? new Date(m.matchTime * 1000) : null;
    const date = ts ? ts.toISOString().slice(0, 10) : '';
    const time = m.matchTimeLabel || (ts ? ts.toTimeString().slice(0, 5) : '');

    // 中文轮次映射
    const roundMap = { '小组赛': m.roundNum || 1 };
    const round = roundMap[m.roundStage] || m.roundNum || 0;

    // 比分判断
    const hasScore = m.homeScore != null && m.awayScore != null && m.statusDesc === '完场';

    // venue可能在liveInfo里
    let venue = '';
    try { if (m.liveInfo) venue = JSON.parse(m.liveInfo)?.venue || ''; } catch (e) {}

    matches.push({
      date,
      time,
      group: m.groupLabel || '',
      round,
      home: m.homeTeamName || '',
      away: m.awayTeamName || '',
      score: hasScore ? `${m.homeScore}-${m.awayScore}` : 'upcoming',
      hg: hasScore ? m.homeScore : undefined,
      ag: hasScore ? m.awayScore : undefined,
      status: m.statusDesc || '',
      venue,
      matchId: m.matchId || '',
    });
  }

  return matches;
}

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
        hg: m.hg != null ? m.hg : (m.score && m.score !== 'upcoming' ? parseInt(m.score.split('-')[0]) : undefined),
        ag: m.ag != null ? m.ag : (m.score && m.score !== 'upcoming' ? parseInt(m.score.split('-')[1]) : undefined),
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
    // 清除Node.js模块缓存，确保下次require返回新数据
    delete require.cache[require.resolve(MATCHES_PATH)];
    console.log(`  📝 [AutoSync] matches.js: ${matchCount} 场已更新（缓存已清除）`);
  }

  return matchCount;
}

// ==================== 服务启动自动同步 ====================

function startupCheck() {
  if (syncState.startupChecked) return;
  syncState.startupChecked = true;

  console.log('🔍 [AutoSync] 启动时静默获取小红书赛程...');

  fetchFromXiaohongshu()
    .then(schedule => {
      const matches = normalizeMatchData(schedule);
      const completed = matches.filter(m => m.score !== 'upcoming');
      const upcoming = matches.filter(m => m.score === 'upcoming');

      console.log(`   ✅ 获取成功: ${matches.length}场 (${completed.length}完赛 + ${upcoming.length}待赛)`);
      console.log(`   📅 日期范围: ${matches[0]?.date || '?'} ~ ${matches[matches.length-1]?.date || '?'}`);

      // 更新本地文件
      const result = ingestMatchResults({ date: 'auto', matches: completed, source: 'xiaohongshu-ssr' });
      if (result.added + result.updated > 0) {
        console.log(`   📝 更新: +${result.added}新增 ${result.updated}更新`);
      } else {
        console.log(`   ✅ 数据已最新，无需更新`);
      }
    })
    .catch(err => {
      console.log(`   ⚠️ 小红书抓取失败: ${err.message}，使用本地缓存`);
      // Fallback: 检查本地数据统计
      try {
        const allResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
        const completed = allResults.filter(r => r.score && r.score !== 'upcoming');
        console.log(`   📦 本地缓存: ${completed.length}场完赛`);
      } catch (e) {
        console.log('   ⚠️ 本地数据也读取失败');
      }
    });
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

  // GET /api/sync — 触发一次静默同步（从接口拉取）
  app.get('/api/sync', (req, res) => {
    console.log('🔄 [AutoSync] GET /api/sync 触发手动同步...');
    fetchFromXiaohongshu()
      .then(schedule => {
        const matches = normalizeMatchData(schedule);
        const completed = matches.filter(m => m.score !== 'upcoming');
        const result = ingestMatchResults({ date: 'manual', matches: completed, source: 'xiaohongshu-api' });
        res.json({
          success: true,
          source: 'xiaohongshu-ssr',
          totalMatches: matches.length,
          completedCount: completed.length,
          updated: result.updated,
          added: result.added,
          dateRange: matches[0]?.date + ' ~ ' + matches[matches.length-1]?.date,
        });
      })
      .catch(err => {
        syncState.lastError = err.message;
        res.status(502).json({ success: false, error: err.message, hint: '小红书页面可能暂时不可达' });
      });
  });

  // POST /api/sync — 接收浏览器提取的赛程数据（保留兼容）
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
  fetchFromXiaohongshu,
  normalizeMatchData,
  ingestMatchResults,
  syncState,
};
