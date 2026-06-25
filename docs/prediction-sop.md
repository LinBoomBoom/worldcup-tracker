# 📋 世界杯预测操作流程 SOP

> 目的：减少反复试错，固定数据获取和预测流程

---

## 一、赛前 · 获取赛程 & 跑预测

### 数据源
- **主源：** 小红书世界杯频道 `xiaohongshu.com/worldcup26`
  - 含完整赛程、实时比分、小组积分榜、赛果事件
  - 需浏览器渲染（SPA），web_fetch 无效
- **备源：** data/matches.js 本地缓存

### 操作步骤
```
1. browser → open xiaohongshu.com/worldcup26 → snapshot 获取当日赛程
2. 确认 match.round / home / away / time / group
3. 运行预测: node -e "require('./algorithms/divination').liuYaoPredict({...})"
4. 输出到 predictions-store.json → divination[date]
```

### ⚠️ 易错点
- **主客队方向：** predictions-store.json 中的 home/away 必须与赛程一致
  - 之前6/25的3场主客颠倒，导致测试脚本出错
- **轮次标注：** match.round 必须正确传入（R1=1, R2=2, R3=3, R16=4...）
- **开球时间：** 用北京时间，不是美国当地时间

---

## 二、赛后 · 获取比分 & 复盘

### 数据源
- **主源：** 小红书世界杯频道（同上）
  - 完赛场次会显示比分 + 事件摘要 + MOTM
- **备源：** 无可靠备源（FIFA API 不返回世界杯数据，ESPN/SofaScore 受限）

### 操作步骤
```
1. browser → open xiaohongshu.com/worldcup26 → snapshot
2. 滚动到当日日期区域，提取: score, events, motm
3. 更新 data/matches.js（状态从 upcoming → 完赛数据）
4. 更新 data/all-results.json
5. 对比 predictions-store.json 中的预测 → 写复盘
```

### ⚠️ 易错点
- **比分格式：** "主队进球-客队进球"，不要搞反
- **小组第三轮：** 同组同时开球，两场比赛必须一起看（积分榜联动）
- **小红书页面长：** 需要 evaluate + scrollBy 才能看到后面的日期

---

## 三、预测系统架构

```
divination.js (v2.3)
├── 六爻起卦: threeNumberQiGua(队伍编码+日期时间)
├── 纳甲排盘: decodeGua → 六亲/六兽/世应/旺衰
├── 足球映射: 世=主队 应=客队 财=进球 官=防守
├── 胜负判断: 旺衰差 + 动爻生克 + ELO修正
├── 进球预测: 泊松分布 + ELO + 六爻扰动
├── 比分选择: altScores智能优选(非平局优先)
└── 置信度: 旺衰差距+动爻+卦名警告+铁桶阵
```

### 当前已知问题
- [ ] 比分精确度0% — 泊松分布天然做不到精确比分
- [ ] 方向命中率67% — 优于随机但远非可靠
- [ ] 强弱逆转判断差 — 波黑/南非两个冷门方向全错

---

## 四、每次预测/复盘必须检查

- [ ] round 值是否正确
- [ ] home/away 与赛程一致
- [ ] 已查积分榜了解出线形势
- [ ] 预测结果存入 predictions-store.json
- [ ] 赛果更新到 matches.js + all-results.json
- [ ] 复盘写入 docs/divination-postmortem-{MMDD}.md

---

*晴子 🌸 · 2026-06-25*
