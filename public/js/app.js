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

// ========== Divination Tab ==========
async function renderDivination(container) {
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>奇门遁甲 + 大六壬 双盘推演中...</p></div>';

  try {
    const data = await fetch('/api/divination?date=2026-06-22').then(r => r.json());
    let html = ['<h2 class="section-title">🔮 奇门遁甲 · 大六壬 占卜预测</h2>'];
    html.push(`<p style="color:var(--text-secondary);font-size:0.78rem;margin-bottom:16px">📅 ${data.date} · 共${data.count}场 · 双术数体系交叉验证 · 仅供参考娱乐</p>`);

    data.results.forEach(r => {
      const q = r.qimen, l = r.liuren;
      const vColor = r.verdict === 'home' ? 'var(--blue)' : r.verdict === 'away' ? 'var(--red)' : 'var(--text-secondary)';
      const winnerText = r.verdict === 'draw' ? '🤝 平局' : `🏆 ${r.winner}胜`;
      const verdictClass = r.verdict === 'home' ? 'home-conf' : r.verdict === 'away' ? 'away-conf' : 'draw-conf';

      html.push(`
      <div class="card divination-card">
        <!-- 比赛信息 + 综合结果 -->
        <div class="div-header">
          <span class="div-teams">${r.match.home} <span style="color:var(--text-secondary);font-size:0.7rem">vs</span> ${r.match.away}</span>
          <span style="font-size:0.7rem;color:var(--text-secondary)">${r.match.group}组 ${r.match.time}</span>
        </div>

        <div class="pred-verdict ${verdictClass}" style="font-size:1.05rem;margin:8px 0">
          ${winnerText} <span style="color:var(--gold-light);font-weight:800;font-size:1.3rem">${r.score}</span>
          <span style="font-size:0.75rem;color:var(--text-secondary)">进球数: ${r.goals}球</span>
        </div>

        <!-- 双栏: 奇门 + 六壬 -->
        <div class="div-dual">
          <div class="div-column">
            <div class="div-col-title">🛡️ 奇门遁甲</div>
            <div class="div-detail"><span>局数</span><span>阳遁${q.juNum}局 · ${q.jieQi}</span></div>
            <div class="div-detail"><span>值符星</span><span>${q.zhiFuStar}</span></div>
            <div class="div-detail"><span>日干宫</span><span>${q.riGanGong} (主队/左)</span></div>
            <div class="div-detail"><span>时干宫</span><span>${q.shiGanGong} (客队/右)</span></div>
            <div class="div-detail"><span>生克</span><span style="font-weight:700;color:${vColor}">${q.shengKe}</span></div>
            <div class="div-detail"><span>八门</span><span>${q.doorName} <span class="qm-tag ${q.doorJiXiong==='吉'?'ji':q.doorJiXiong==='凶'?'xiong':'ping'}">${q.doorJiXiong}</span></span></div>
            <div class="div-detail"><span>八神</span><span>${q.shenName}</span></div>
            <div class="div-detail"><span>判断</span><span style="color:${vColor}">${q.advantage}</span></div>
          </div>

          <div class="div-column">
            <div class="div-col-title">🐢 大六壬</div>
            <div class="div-detail"><span>初传 上半场</span><span style="color:${vColor}">${l.sanChuan.chu}</span></div>
            <div class="div-detail"><span>中传 中段</span><span>${l.sanChuan.zhong}</span></div>
            <div class="div-detail"><span>末传 终局</span><span style="color:${vColor};font-weight:700">${l.sanChuan.mo}</span></div>
            ${l.siKe.filter(k => !k.includes('undefined')).map(k => `<div class="div-detail"><span>${k.split(':')[0]}</span><span>${k.split(':')[1]||''}</span></div>`).join('')}
            <div class="div-detail" style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px"><span>上半场</span><span style="color:${vColor}">${l.firstHalf}</span></div>
            ${l.trend ? `<div class="div-detail"><span>中段走势</span><span>${l.trend}</span></div>` : ''}
            <div class="div-detail"><span>终局</span><span style="color:${vColor}">${l.secondHalf}</span></div>
          </div>
        </div>

        <!-- 综合分析 -->
        <details style="margin-top:10px;font-size:0.75rem;color:var(--text-secondary)">
          <summary style="cursor:pointer;color:var(--gold-light)">📜 查看完整课辞</summary>
          <pre style="white-space:pre-wrap;margin-top:8px;line-height:1.8;background:rgba(0,0,0,0.2);padding:10px;border-radius:8px">${r.summary}</pre>
        </details>
      </div>`);
    });

    // 方法说明
    html.push(`
    <div class="card" style="border-left:3px solid var(--gold);margin-top:16px">
      <h4 style="color:var(--gold-light);margin-bottom:8px">📖 术数方法说明</h4>
      <p style="font-size:0.78rem;color:var(--text-secondary);line-height:1.7">
        <strong>奇门遁甲：</strong>以比赛时辰排盘（阳遁/阴遁+局数），日干落宫代表主队(左队)，时干落宫代表客队(右队)。通过五行生克（生/克/比和）+ 八门吉凶 + 八神组合，判断比赛胜负倾向。<br><br>
        <strong>大六壬：</strong>以比赛时辰起课，天盘+四课+三传推演。初传应上半场，中传应中段走势，末传应终局结果。日干为占主（主队），辰为客（客队），观三传与日干生克关系定上下半场走势。<br><br>
        ⚠️ 奇门遁甲与大六壬传统用于军事、国事、人事择吉，体育比分预测非其传统应用领域，<strong>以上结果仅供传统文化研究参考与娱乐</strong>。
      </p>
    </div>`);

    container.innerHTML = html.join('');
  } catch (e) {
    container.innerHTML = '<p style="color:#e74c3c">❌ 占卜数据加载失败</p>';
  }
}
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
