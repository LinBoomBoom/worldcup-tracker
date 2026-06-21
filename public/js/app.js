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
  }
}

// ========== Scores Tab ==========
function renderScores(container) {
  const { completed, upcoming } = allData.matches || { completed:[], upcoming:[] };

  const html = ['<h2 class="section-title">📅 6月22日赛程预告</h2>'];
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

  for (const [round, matches] of Object.entries(rounds).reverse()) {
    html.push(`<div class="round-title">✅ ${round}（已完成）</div>`);
    matches.forEach(m => {
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
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>算法运算中...</p></div>';

  try {
    const predictions = await fetch(API.predictDay + '?date=2026-06-22').then(r => r.json());
    const algos = allData.algorithms || {};

    let html = ['<h2 class="section-title">🔮 6月22日多维预测</h2>'];

    if (!predictions || predictions.length === 0) {
      html.push('<p style="color:var(--text-secondary)">暂无6月22日预测数据</p>');
    } else {
      predictions.forEach(p => {
        const m = p.match;
        const pred = p.prediction;
        const confClass = pred.confidence >= 75 ? 'conf-high' : pred.confidence >= 55 ? 'conf-med' : 'conf-low';
        const confLabel = pred.confidence >= 75 ? '高信度' : pred.confidence >= 55 ? '中信度' : '低信度';
        const verdictClass = pred.winner === 'home' ? 'home-conf' : pred.winner === 'away' ? 'away-conf' : 'draw-conf';
        const verdictText = pred.winner === 'home' ? `🏠 预测${m.home}胜` :
                            pred.winner === 'away' ? `✈️ 预测${m.away}胜` : '🤝 预测打平';

        html.push(`
        <div class="card prediction-card">
          <div class="pred-header">
            <span>${m.home}</span>
            <span class="pred-score">${pred.predictedScore}</span>
            <span>${m.away}</span>
          </div>
          <div style="text-align:center;font-size:0.75rem;color:var(--text-secondary)">
            ${m.date} ${m.time} · ${m.group}组 · 第${m.round}轮
          </div>

          <div class="pred-prob-bars">
            <div class="prob-row">
              <span class="prob-label home">${m.home}胜</span>
              <div class="prob-bar-bg"><div class="prob-bar-fill home" style="width:${pred.homeWinProb}%"></div></div>
              <span class="prob-val">${pred.homeWinProb}%</span>
            </div>
            <div class="prob-row">
              <span class="prob-label draw">平局</span>
              <div class="prob-bar-bg"><div class="prob-bar-fill draw" style="width:${pred.drawProb}%"></div></div>
              <span class="prob-val">${pred.drawProb}%</span>
            </div>
            <div class="prob-row">
              <span class="prob-label away">${m.away}胜</span>
              <div class="prob-bar-bg"><div class="prob-bar-fill away" style="width:${pred.awayWinProb}%"></div></div>
              <span class="prob-val">${pred.awayWinProb}%</span>
            </div>
          </div>

          <div class="pred-verdict ${verdictClass}">
            ${verdictText}
            <span class="confidence-tag ${confClass}">${confLabel} ${pred.confidence}%</span>
            <span style="margin-left:8px;font-size:0.75rem">总进球预测: ${pred.totalGoals}球</span>
          </div>

          <details style="margin-top:12px">
            <summary style="cursor:pointer;font-size:0.8rem;color:var(--text-secondary)">📈 算法明细</summary>
            <div class="pred-detail-grid">
              <div class="pred-detail-item">ELO模型 <span class="val">${m.home}胜 ${pred.algorithms.elo.homeWinProb}%</span></div>
              <div class="pred-detail-item">泊松模型 <span class="val">最可能 ${pred.algorithms.poisson.mostLikelyScore}</span></div>
              <div class="pred-detail-item">形态模型 <span class="val">${m.home}形态 ${pred.algorithms.form.homeFormScore}分</span></div>
              <div class="pred-detail-item">形态模型 <span class="val">${m.away}形态 ${pred.algorithms.form.awayFormScore}分</span></div>
              <div class="pred-detail-item">ELO差值 <span class="val">${pred.algorithms.elo.eloHome - pred.algorithms.elo.away}</span></div>
              <div class="pred-detail-item">预期进球 <span class="val">${m.home} ${pred.algorithms.poisson.xG_home} - ${pred.algorithms.poisson.xG_away} ${m.away}</span></div>
            </div>
          </details>
        </div>`);
      });
    }

    container.innerHTML = html.join('');
  } catch (e) {
    container.innerHTML = '<p style="color:#e74c3c">❌ 预测数据加载失败</p>';
  }
}

// ========== Injuries Tab ==========
function renderInjuries(container) {
  const injuries = allData.injuries || [];
  let html = ['<h2 class="section-title">🏥 球队伤停 · 阵容变动</h2>'];

  // 按球队分组
  const grouped = {};
  injuries.forEach(ij => {
    if (!grouped[ij.team]) grouped[ij.team] = [];
    grouped[ij.team].push(ij);
  });

  for (const [team, players] of Object.entries(grouped)) {
    html.push(`<div class="card"><h3 style="color:var(--gold);margin-bottom:10px">${team}</h3>`);
    players.forEach(p => {
      const statusClass = p.status.includes('缺阵') || p.status.includes('退役') ? 'status-out' :
                          p.status.includes('成疑') || p.status.includes('存疑') ? 'status-doubt' :
                          p.status.includes('风险') ? 'status-risk' : 'status-ok';
      html.push(`
        <div class="injury-card" style="border-bottom:1px solid var(--border);margin-bottom:8px;padding-bottom:8px">
          <div class="injury-icon">${statusClass === 'status-out' ? '🔴' : statusClass === 'status-doubt' ? '🟡' : statusClass === 'status-risk' ? '🟠' : '🟢'}</div>
          <div class="injury-info">
            <div class="injury-player">${p.player}</div>
            <span class="injury-status ${statusClass}">${p.status}</span>
            <div class="injury-detail">${p.detail}</div>
            <div class="injury-update">更新: ${p.update}</div>
          </div>
        </div>`);
    });
    html.push('</div>');
  }

  container.innerHTML = html.join('');
}

// ========== Algorithms Tab ==========
function renderAlgorithms(container) {
  const algos = allData.algorithms || { algorithms: [], confidenceNote: '' };
  let html = ['<h2 class="section-title">🧠 预测算法引擎</h2>'];
  html.push(`<div class="card algo-card"><h3>📐 ${algos.name} v${algos.version}</h3></div>`);

  (algos.algorithms || []).forEach(a => {
    html.push(`
    <div class="card algo-card">
      <h3>${a.name} <span class="weight-tag">权重 ${a.weight}</span></h3>
      <p class="desc">${a.description}</p>
      <div class="factors">${(a.factors||[]).map(f => `<span class="factor-tag">${f}</span>`).join('')}</div>
    </div>`);
  });

  if (algos.confidenceNote) {
    html.push(`<div class="card algo-card" style="border-left:3px solid var(--gold)"><p class="desc">${algos.confidenceNote}</p></div>`);
  }

  container.innerHTML = html.join('');
}
