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
  }
}

// ========== Scores Tab ==========
function renderScores(container) {
  const { completed, upcoming } = allData.matches || { completed:[], upcoming:[] };
  const html = [];

  // ===== 预告区：按日期分组，仅最近日期展开 =====
  const upByDate = {};
  upcoming.forEach(m => {
    if (!upByDate[m.date]) upByDate[m.date] = [];
    upByDate[m.date].push(m);
  });
  const upDates = Object.keys(upByDate).sort();

  if (upDates.length > 0) {
    // 最近日期 - 全展开
    const nextDate = upDates[0];
    const nextMatches = upByDate[nextDate].sort((a,b) => a.time.localeCompare(b.time));
    html.push(`<h2 class="section-title">📅 ${nextDate} 赛程预告</h2>`);
    nextMatches.forEach(m => {
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

    // 其余日期 - 折叠收纳
    for (let i = 1; i < upDates.length; i++) {
      const d = upDates[i];
      const dMatches = upByDate[d].sort((a,b) => a.time.localeCompare(b.time));
      html.push(`<div class="day-section collapsed" data-date="${d}">`);
      html.push(`<div class="day-header" onclick="toggleDaySection(this)"><span>📆 ${d} · ${dMatches.length}场</span><span class="day-toggle">▶</span></div>`);
      html.push(`<div class="day-body" style="display:none">`);
      dMatches.forEach(m => {
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
      html.push('</div></div>');
    }
  }

  // ===== 已完赛区 =====
  const sortIcon = scoreSortOrder === 'desc' ? '↓ 最新在前' : '↑ 最早在前';
  html.push(`
    <div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 8px">
      <h2 class="section-title" style="margin-bottom:0;border-bottom:none;padding-bottom:0">✅ 已完赛</h2>
      <button class="sort-toggle-btn" id="sortToggleBtn">${sortIcon}</button>
    </div>`);

  // 按轮次分组
  const rounds = {};
  completed.forEach(m => {
    const key = `第${m.round}轮`;
    if (!rounds[key]) rounds[key] = [];
    rounds[key].push(m);
  });

  const sortedRounds = Object.entries(rounds)
    .sort((a,b) => parseInt(b[0].replace(/\D/g,'')) - parseInt(a[0].replace(/\D/g,'')));
  const roundList = scoreSortOrder === 'desc' ? sortedRounds : [...sortedRounds].reverse();

  for (const [round, matches] of roundList) {
    html.push(`<div class="round-title">📌 ${round}</div>`);
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

  // 绑定排序按钮（用 addEventListener 避免 inline onclick 问题）
  const sortBtn = document.getElementById('sortToggleBtn');
  if (sortBtn) {
    sortBtn.addEventListener('click', () => {
      scoreSortOrder = scoreSortOrder === 'desc' ? 'asc' : 'desc';
      renderScores(document.getElementById('main-content'));
    });
  }
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

// ========== Predictions Tab (Statistical + Divination Subtabs) ==========
async function renderPredictions(container) {
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>加载预测数据...</p></div>';
  try {
    const data = await fetch('/api/predictions-history').then(r => r.json());
    if (!data.history || data.history.length === 0) {
      container.innerHTML = '<p class="empty-msg">暂无预测数据，系统每日自动生成次日预测</p>'; return;
    }

    let html = ['<h2 class="section-title">📊 统计模型 + 术数预测</h2>'];
    html.push('<p class="sub-desc">📌 ELO+泊松+形态复合 · 奇门遁甲+大六壬双术数 · 每日仅预测下一日 · 结果永久锁定</p>');

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
      html.push('<span>'+label+day.date+' · '+day.matches+'场 <span class="lock-badge">🔒</span></span>');
      html.push('<span class="day-toggle">'+(isPast?'▶':'▼')+'</span>');
      html.push('</div>');
      html.push('<div class="day-body" style="display:'+(isPast?'none':'block')+'">');

      const stats = day.statistical || [];
      const divs = day.divination || [];

      stats.forEach((item, i) => {
        const p = item.prediction;
        const div = divs[i] || null;
        const matchId = 'match-' + day.date + '-' + i;

        // === 统计预测卡片 ===
        const confCls = p.confidence >= 80 ? 'high' : p.confidence >= 60 ? 'med' : 'low';
        const verdictCls = p.winner === 'home' ? 'home-conf' : p.winner === 'away' ? 'away-conf' : 'draw-conf';
        const verdictText = p.winner === 'home' ? item.match.home + '胜' : p.winner === 'away' ? item.match.away + '胜' : '平局';
        const winnerIcon = p.winner === 'home' ? '🏠' : p.winner === 'away' ? '✈️' : '🤝';

        html.push('<div class="card prediction-full-card">');
        // 统计预测头部
        html.push('<div class="stat-head">');
        html.push('<div class="stat-teams">'+item.match.home+' <span class="stat-vs">vs</span> '+item.match.away+'</div>');
        html.push('<div class="stat-meta">'+item.match.time+' · '+item.match.group+'组 · 第'+item.match.round+'轮</div>');
        html.push('</div>');

        html.push('<div class="stat-main">');
        html.push('<div class="stat-score-col">');
        html.push('<span class="stat-pred-score">'+p.predictedScore+'</span>');
        html.push('<span class="stat-verdict '+verdictCls+'">'+winnerIcon+' '+verdictText+'</span>');
        html.push('<span class="stat-confidence conf-'+confCls+'">置信度 '+p.confidence+'%</span>');
        html.push('</div>');

        // 概率条
        html.push('<div class="stat-prob-col">');
        const maxProb = Math.max(p.homeWinProb, p.drawProb, p.awayWinProb);
        html.push('<div class="prob-row"><span class="prob-label home">'+item.match.home+'</span><div class="prob-bar-bg"><div class="prob-bar-fill home" style="width:'+p.homeWinProb+'%"></div></div><span class="prob-val'+(p.homeWinProb===maxProb?' prob-max':'')+'">'+p.homeWinProb+'%</span></div>');
        html.push('<div class="prob-row"><span class="prob-label draw">平局</span><div class="prob-bar-bg"><div class="prob-bar-fill draw" style="width:'+p.drawProb+'%"></div></div><span class="prob-val'+(p.drawProb===maxProb?' prob-max':'')+'">'+p.drawProb+'%</span></div>');
        html.push('<div class="prob-row"><span class="prob-label away">'+item.match.away+'</span><div class="prob-bar-bg"><div class="prob-bar-fill away" style="width:'+p.awayWinProb+'%"></div></div><span class="prob-val'+(p.awayWinProb===maxProb?' prob-max':'')+'">'+p.awayWinProb+'%</span></div>');
        html.push('</div>');
        html.push('</div>'); // .stat-main

        // 模型细节
        html.push('<div class="stat-details">');
        html.push('<span class="stat-detail-tag">📊 ELO: '+item.match.home+' '+p.algorithms.elo.eloHome+' vs '+item.match.away+' '+p.algorithms.elo.eloAway+'</span>');
        html.push('<span class="stat-detail-tag">🎯 xG: '+p.algorithms.poisson.xG_home+' - '+p.algorithms.poisson.xG_away+'</span>');
        html.push('<span class="stat-detail-tag">📈 形态: '+p.algorithms.form.homeFormScore+' / '+p.algorithms.form.awayFormScore+'</span>');
        html.push('</div>');

        // === 六爻预测区域 ===
        if (div) {
          html.push('<div class="liuyao-section">');
          html.push(buildLiuYaoPanel(div));
          html.push('</div>');
        }

        html.push('</div>'); // .card
      });

      html.push('</div></div>'); // .day-body .day-section
    });

    container.innerHTML = html.join('');
  } catch(e) { container.innerHTML = '<p class="err-msg">❌ 加载失败: '+e.message+'</p>'; }
}

function buildLiuYaoPanel(div) {
  const g = div.gua || {};
  const yao = div.pan?.yao || [];
  const a = div.analysis || {};
  const lp = div.liuYaoPrediction || {};
  let h = '';

  // 卦名标题行
  h += '<div class="liuyao-header">';
  h += '<span class="liuyao-gua-symbol">'+g.shangSymbol+'</span>';
  h += '<div class="liuyao-gua-info">';
  h += '<span class="liuyao-gua-name">'+g.name+'</span>';
  h += '<span class="liuyao-gua-meta">'+g.gong+'宫 · '+g.gongWx+' · 动'+g.dongYao+'爻</span>';
  h += '</div>';
  h += '<span class="liuyao-gua-symbol">'+g.xiaSymbol+'</span>';
  h += '</div>';

  // 六爻排盘表
  h += '<table class="liuyao-table"><tbody>';
  const yaoNames = ['六爻','五爻','四爻','三爻','二爻','初爻'];
  const yaoRows = [...yao].reverse(); // 从上往下显示
  for (const y of yaoRows) {
    const tagClass = 'ly-tag-' + y.liuQinCls;
    const markers = [];
    if (y.isShi) markers.push('<span class="ly-marker shi">世</span>');
    if (y.isYing) markers.push('<span class="ly-marker ying">应</span>');
    if (y.isDong) markers.push('<span class="ly-marker dong">○</span>');
    const ws = y.wangScore;
    const wsColor = ws >= 1 ? '#2ecc71' : ws <= -1 ? '#e74c3c' : '#95a5a6';
    h += '<tr class="'+(y.isDong?'ly-dong-row':'')+'">';
    h += '<td class="ly-pos">'+yaoNames[y.pos-1]+'</td>';
    h += '<td class="ly-zhi">'+y.zhi+'</td>';
    h += '<td class="ly-wx" style="color:var(--tag-'+y.wx+')">'+y.wx+'</td>';
    h += '<td class="ly-qin"><span class="ly-tag '+tagClass+'">'+y.liuQin+'</span></td>';
    h += '<td class="ly-shou">'+y.liuShou+'</td>';
    h += '<td class="ly-markers">'+markers.join('')+'</td>';
    h += '<td class="ly-ws" style="color:'+wsColor+'">'+(ws>0?'+':'')+ws+'</td>';
    h += '</tr>';
  }
  h += '</tbody></table>';

  // 世应分析
  h += '<div class="liuyao-analysis">';
  h += '<div class="ly-row"><span>世爻(主)</span><span>'+a.shiYao+' · 旺度:'+a.shiWang+'</span></div>';
  h += '<div class="ly-row"><span>应爻(客)</span><span>'+a.yingYao+' · 旺度:'+a.yingWang+'</span></div>';
  h += '<div class="ly-row"><span>主优</span><span style="color:#3498db">+'+a.homeAdv+'</span></div>';
  h += '<div class="ly-row"><span>火力</span><span>'+(a.totalFirepower>0?'🔥':'')+a.totalFirepower+'</span></div>';
  h += '</div>';

  // 推理过程
  if (a.reasons && a.reasons.length > 0) {
    h += '<div class="liuyao-reasons">';
    a.reasons.forEach(r => { h += '<div class="ly-reason">'+r+'</div>'; });
    h += '</div>';
  }

  // 警示信号
  if (a.dangerSignals && a.dangerSignals.length > 0) {
    h += '<div class="liuyao-dangers">';
    a.dangerSignals.forEach(d => { h += '<div class="ly-danger">'+d+'</div>'; });
    h += '</div>';
  }

  // 预测结论
  const vc = lp.verdict;
  h += '<div class="div-pred-result '+(vc==='home'?'pred-home':vc==='away'?'pred-away':'pred-draw')+'">';
  h += '🎯 六爻预测：<strong>'+lp.winner+'</strong> <span class="pred-score-tag">'+lp.score+'</span>';
  h += '<span class="pred-range">'+lp.goalRange+'</span>';
  h += '</div>';

  return h;
}

// ========== Injuries Tab ==========
function renderInjuries(container) {
  const injuries = allData.injuries || [];
  if (injuries.length === 0) {
    container.innerHTML = '<p class="empty-msg">暂无伤病信息</p>';
    return;
  }

  // 按球队分组
  const byTeam = {};
  injuries.forEach(inj => {
    if (!byTeam[inj.team]) byTeam[inj.team] = [];
    byTeam[inj.team].push(inj);
  });

  const html = ['<h2 class="section-title">🏥 伤病 & 停赛信息</h2>'];

  for (const [team, list] of Object.entries(byTeam)) {
    html.push(`<div class="card"><h3 style="color:var(--gold-light);margin-bottom:12px">${team}</h3>`);
    list.forEach(inj => {
      const statusCls = inj.status.includes('缺阵') || inj.status.includes('伤缺') || inj.status.includes('退役') ? 'status-out' :
                        inj.status.includes('成疑') || inj.status.includes('轻伤') ? 'status-doubt' :
                        inj.status.includes('风险') || inj.status.includes('累积') ? 'status-risk' : 'status-ok';
      html.push(`
        <div class="injury-card">
          <div class="injury-icon">${statusCls==='status-out'?'🚫':statusCls==='status-doubt'?'⚠️':statusCls==='status-risk'?'🟡':'✅'}</div>
          <div class="injury-info">
            <div class="injury-player">${inj.player}</div>
            <div class="injury-status ${statusCls}">${inj.status}</div>
            <div class="injury-detail">${inj.detail}</div>
          </div>
          <div class="injury-update">更新: ${inj.update}</div>
        </div>`);
    });
    html.push('</div>');
  }

  container.innerHTML = html.join('');
}

// ========== Algorithms Tab ==========
function renderAlgorithms(container) {
  const algo = allData.algorithms;
  if (!algo) {
    container.innerHTML = '<p class="empty-msg">算法信息加载中...</p>';
    return;
  }

  const html = [];
  html.push('<h2 class="section-title">🧠 预测算法说明</h2>');
  html.push('<p class="sub-desc">'+algo.name+' v'+algo.version+'</p>');

  algo.algorithms.forEach(a => {
    html.push(`
      <div class="algo-card card">
        <h3>${a.name}</h3>
        <span class="weight-tag">权重: ${a.weight}</span>
        <p class="desc">${a.description}</p>
        <div class="factors">${a.factors.map(f=>'<span class="factor-tag">'+f+'</span>').join('')}</div>
      </div>`);
  });

  html.push(`
    <div class="card" style="padding:16px;font-size:0.8rem;color:var(--text-secondary)">
      <strong style="color:var(--gold-light)">📌 置信度说明：</strong>${algo.confidenceNote}
    </div>`);

  container.innerHTML = html.join('');
}

// ========== Day Section Toggle ==========
function toggleDaySection(header) {
  const body = header.nextElementSibling;
  const toggle = header.querySelector('.day-toggle');
  const isVisible = body.style.display !== 'none';
  body.style.display = isVisible ? 'none' : 'block';
  toggle.textContent = isVisible ? '▶' : '▼';
}
