const { liuYaoPredict } = require('../algorithms/divination');

const matches = [
  { id:'M45', date:'2026-06-24', time:'01:00', home:'葡萄牙', away:'乌兹别克斯坦', group:'K' },
  { id:'M46', date:'2026-06-24', time:'04:00', home:'英格兰', away:'加纳', group:'L' },
  { id:'M47', date:'2026-06-24', time:'07:00', home:'巴拿马', away:'克罗地亚', group:'L' },
  { id:'M48', date:'2026-06-24', time:'10:00', home:'哥伦比亚', away:'民主刚果', group:'K' }
];

const results = matches.map(m => {
  const r = liuYaoPredict(m);
  return {
    match: r.match,
    verdict: r.verdict,
    score: r.score,
    confidence: r.confidence,
    confLevel: r.confLevel,
    gua: r.gua.shangSymbol + r.gua.xiaSymbol + ' ' + r.gua.name,
    shiYing: r.analysis.shiYao + ' vs ' + r.analysis.yingYao,
    shiWang: r.analysis.shiWang,
    yingWang: r.analysis.yingWang,
    reasons: r.analysis.reasons,
    danger: r.analysis.dangerSignals,
    altScores: r.altScores
  };
});

console.log(JSON.stringify(results, null, 2));
