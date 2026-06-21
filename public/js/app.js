/**
 * 2026 World Cup Tracker - Frontend App
 */

const API = {
  matches: '/api/matches',
  standings: '/api/standings',
  groupHistory: '/api/group-history',
  injuries: '/api/injuries',
  predictDay: '/api/predict-day',
  algorithms: '/api/algorithms',
};

let allData = {};
let currentTab = 'scores';
let scoreSortOrder = 'desc'; // desc=最新在前, asc=最早在前

// ========== Init ==========
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  await loadAllData();
  renderTab('scores');
});

async function loadAllData() {
  try {
    const [matches, standings, history, injuries, algorithms] = await Promise.all([
      fetch(API.matches).then(r => r.json()),
      fetch(API.standings).then(r => r.json()),
      fetch(API.groupHistory).then(r => r.json()),
      fetch(API.injuries).then(r => r.json()),
      fetch(API.algorithms).then(r => r.json()),
    ]);
    allData = { matches, standings, history, injuries, algorithms };
    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').innerHTML = '<p style="color:#e74c3c">❌ 数据加载失败，请刷新页面</p>';
  }
}

// ========== Tabs ==========
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      renderTab(currentTab);
    });
  });
}

async function renderTab(tab) {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  switch (tab) {
    case 'scores': renderScores(main); break;
    case 'standings': renderStandings(main); break;
    case 'predictions': await renderPredictions(main); break;
    case 'injuries': renderInjuries(main); break;
    case 'algorithms': renderAlgorithms(main); break;
    case 'divination': await renderDivination(main); break;
  }
}

// ========== Scores Tab ==========
function renderScores(container) {
  const { completed, upcoming } = allData.matches || { completed:[], upcoming:[] };

  const html = [];

  // 排序按钮 + 标题
  const sortIcon = scoreSortOrder === 'desc' ? '↓ 最新在前' : '↑ 最早在前';
  html.push(`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <h2 class="section-title" style="margin-bottom:0;border-bottom:none;padding-bottom:0">📅 6月22日赛程预告</h2>
      <button class="sort-toggle-btn" onclick="toggleScoreSort()" title="切换排序">${sortIcon}</button>
    </div>`);

  // 预告（始终在顶部）
  upcoming.forEach(m => {
    html.push(`
      <div class="card match-card upcoming-match">
        <div class="match-date"><strong>${m.date.slice(5)}</strong><br><span class="time">${m.time}</span></div>
        <div class="match-teams">
          <div class="vs-row">
            <span class="team-name home">${m.home}</span>
            <span class="score upcoming">VS</span>
            <span class="team-name away">${m.away}</span>
          </div>
        </div>
        <div class="match-info">
          <span class="group-tag ${m.group}">${m.group}组</span>
          <span>第${m.round}轮</span>
        </div>
      </div>`);
  });

  // 按轮次分组已完赛比赛
  const rounds = {};
  completed.forEach(m => {
    const key = `第${m.round}轮`;
    if (!rounds[key]) rounds[key] = [];
    rounds[key].push(m);
  });

  // 轮次排序：按轮号
  const sortedRounds = Object.entries(rounds)
    .sort((a,b) => parseInt(b[0].replace(/\D/g,'')) - parseInt(a[0].replace(/\D/g,'')));

  // 根据排序模式决定遍历方向
  const roundList = scoreSortOrder === 'desc' ? sortedRounds : [...sortedRounds].reverse();

  for (const [round, matches] of roundList) {
    html.push(`<div class="round-title">✅ ${round}（已完成）</div>`);
    // 每轮内部按日期时间排序
    const sortedMatches = [...matches].sort((a,b) => {
      const da = a.date + a.time;
      const db = b.date + b.time;
      return scoreSortOrder === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
    });
    sortedMatches.forEach(m => {
      html.push(`
        <div class="card match-card">
          <div class="match-date">${m.date.slice(5)}<br><span class="time">${m.time}</span></div>
          <div class="match-teams">
            <div class="vs-row">
              <span class="team-name home">${m.home}</span>
              <span class="score">${m.score}</span>
              <span class="team-name away">${m.away}</span>
            </div>
          </div>
          <div class="match-events">
            <span class="group-tag ${m.group}">${m.group}组</span>
            <div style="font-size:0.7rem;margin-top:2px">🏅 ${m.motm}</div>
          </div>
        </div>`);
    });
  }

  container.innerHTML = html.join('');
}

// 切换排序
function toggleScoreSort() {
  scoreSortOrder = scoreSortOrder === 'desc' ? 'asc' : 'desc';
  renderScores(document.getElementById('main-content'));
}

// ========== Standings Tab ==========
function renderStandings(container) {
  const standings = allData.standings || {};
  const html = [];

  // 出线状态判定
  function getStatus(team, group) {
    const g = standings[group];
    if (!g) return '';
    const idx = g.findIndex(t => t.team === team);
    const pts = g[idx]?.pts || 0;
    const p = g[idx]?.p || 1;
    const gd = g[idx]?.gd || 0;
    // 2轮后6分+已锁定出线，0分+净胜球极差已淘汰
    if (pts >= 6) return 'q';
    if (p >= 2 && pts === 0 && gd <= -3) return 'out';
    return '';
  }

  const groupOrder = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  for (const g of groupOrder) {
    const teams = standings[g];
    if (!teams || teams.length === 0) continue;

    html.push(`<div class="standings-group card"><h3 class="section-title">🅰️ ${g}组</h3>`);
    html.push(`<table class="standings-table">
      <thead><tr>
        <th>#</th><th class="team-col">球队</th><th>赛</th><th>胜</th><th>平</th><th>负</th><th>进球</th><th>失球</th><th>净胜</th><th class="pts-col">分</th>
      </tr></thead><tbody>`);

    teams.forEach((t, i) => {
      const status = getStatus(t.team, g);
      const badge = status === 'q' ? '<span class="qual-badge q">出线</span>' :
                    status === 'out' ? '<span class="qual-badge out">出局</span>' : '';
      const rowClass = status === 'q' ? 'qualified' : status === 'out' ? 'eliminated' : '';
      html.push(`<tr class="${rowClass}">
        <td>${i+1}</td>
        <td class="team-col">${t.team} ${badge}</td>
        <td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
        <td>${t.gf}</td><td>${t.ga}</td><td>${t.gd>0?'+':''}${t.gd}</td>
        <td class="pts-col">${t.pts}</td>
      </tr>`);
    });

    html.push('</tbody></table></div>');
  }

  container.innerHTML = html.join('');
}

// ========== Predictions Tab ==========
async function renderPredictions(container) {
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>加载预测数据...</p></div>';

  try {
    const data = await fetch('/api/predictions-history').then(r => r.json());
    if (!data.history || data.history.length === 0) {
      container.innerHTML = '<p style="color:var(--gold);text-align:center;padding:40px">暂无预测数据，每天系统自动生成次日预测</p>';
      return;
    }

    let html = ['<h2 class="section-title">🔮 每日预测记录（锁定 · 不重复生成）</h2>'];
    html.push('<p style="color:var(--text-secondary);font-size:0.7rem;margin-bottom:12px">📌 每天仅预测下一日比赛，预测结果永久锁定不变</p>');

    const now = new Date();
    const bj = new Date(now.getTime() + 8*3600000);
    const today = bj.toISOString().slice(0,10);
    const hour = bj.getUTCHours();

    data.history.forEach(day => {
      const isToday = day.date === today;
      const isPast = day.date < today || (isToday && hour >= 18);
      const label = isToday ? '📅 今天' : '📆';
      const cls = isPast ? ' collapsed' : '';

      html.push('<div class="day-section'+cls+'" data-date="'+day.date+'">');
      html.push('<div class="day-header'+(isToday?' today':'')+'" onclick="toggleDaySection(this)">');
      html.push('<span>'+label+day.date+' · '+day.matches+'场比赛 <span style="font-size:0.6rem;color:var(--gold-dark)">🔒</span></span>');
      html.push('<span class="day-toggle">'+(isPast?'▶':'▼')+'</span>');
      html.push('</div>');
      html.push('<div class="day-body" style="display:'+(isPast?'none':'block')+'">');

      if (day.statistical && day.statistical.length) {
        html.push('<h4 class="sub-title">📊 统计模型</h4>');
        day.statistical.forEach(p => {
          html.push('<div class="card mini-pred-card"><span class="mini-teams">'+p.match.home+' vs '+p.match.away+'</span><span class="mini-score">'+p.prediction.predictedScore+'</span><span class="mini-meta">'+p.match.time+' '+p.match.group+'组</span></div>');
        });
      }

      if (day.divination && day.divination.length) {
        html.push('<h4 class="sub-title2">🔮 奇门六壬</h4>');
        day.divination.forEach(r => {
          html.push('<div class="card mini-div-card"><div class="mini-teams">'+r.match.home+' vs '+r.match.away+'</div><div class="mini-div-row"><span class="mini-div-item">🛡️ '+r.qimenPrediction.winner+' '+r.qimenPrediction.score+'</span><span class="mini-div-item">🐢 '+r.liurenPrediction.winner+' '+r.liurenPrediction.score+'</span><span class="mini-div-final">🏆 '+r.winner+' '+r.score+'</span></div><span class="mini-meta">'+r.match.time+' '+r.match.group+'组 '+(r.agree?'✅':'⚡')+'</span></div>');
        });
      }

      html.push('</div></div>');
    });

    container.innerHTML = html.join('');
  } catch(e) { container.innerHTML = '<p style="color:var(--red)">❌ 加载失败: '+e.message+'</p>'; }
}

function toggleDaySection(h) {
  var b = h.parentElement.querySelector('.day-body');
  var t = h.querySelector('.day-toggle');
  if (b.style.display === 'none') { b.style.display = 'block'; t.textContent = '▼'; h.parentElement.classList.remove('collapsed'); }
  else { b.style.display = 'none'; t.textContent = '▶'; h.parentElement.classList.add('collapsed'); }
}


