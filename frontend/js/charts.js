/* =========================================
   charts.js — Progress page logic & charts
   ========================================= */

// ── State ─────────────────────────────────
let currentTimeFilter = 'week';
let currentProgressTab = 'overview';
let selectedSubjectIdx = null;

// ── Data ──────────────────────────────────
const WEEKLY_DATA = {
  week: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Today'],
    scores: [62,71,68,75,80,77,82],
    attn:   [70,65,72,68,80,74,78],
  },
  month: {
    labels: ['W1','W2','W3','W4','W5'],
    scores: [58,65,72,76,82],
    attn:   [68,70,72,75,78],
  },
  all: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    scores: [50,58,65,70,78,82],
    attn:   [60,65,68,72,75,78],
  }
};

const ACHIEVEMENTS = [
  { icon:'🔥', name:'Streak Master',   desc:'7-day study streak',      xp:200,  unlocked:true  },
  { icon:'🧠', name:'Quiz Ace',        desc:'Score 100% on a quiz',    xp:300,  unlocked:true  },
  { icon:'📚', name:'Bookworm',        desc:'Study for 10 hours total',xp:150,  unlocked:true  },
  { icon:'⚡', name:'Speed Runner',    desc:'Complete 5 quizzes fast', xp:200,  unlocked:false },
  { icon:'🎯', name:'Precision Pro',   desc:'90%+ accuracy 5 times',   xp:250,  unlocked:false },
  { icon:'🌙', name:'Night Owl',       desc:'Study after 10 PM',       xp:100,  unlocked:true  },
  { icon:'🏆', name:'Champion',        desc:'Top 3 on leaderboard',    xp:500,  unlocked:false },
  { icon:'🔄', name:'Revision King',   desc:'Complete all revisions',  xp:200,  unlocked:false },
  { icon:'💪', name:'Consistency',     desc:'30-day streak',           xp:1000, unlocked:false },
  { icon:'📐', name:'Math Wizard',     desc:'Perfect score in Math',   xp:300,  unlocked:true  },
];

const AI_INSIGHTS = [
  { icon:'📈', title:'Improving Trend',    desc:'Your scores increased by 20 points over the last month. Keep this momentum!', color:'rgba(67,233,123,0.1)', border:'rgba(67,233,123,0.2)' },
  { icon:'⚠️', title:'Chemistry Alert',   desc:'Your Chemistry score dropped 8% this week. Schedule an extra revision session.', color:'rgba(255,77,109,0.08)', border:'rgba(255,77,109,0.2)' },
  { icon:'⏰', title:'Best Study Time',   desc:'Your attention peaks at 9-11 AM. Schedule your hardest subjects in the morning.', color:'rgba(108,99,255,0.08)', border:'rgba(108,99,255,0.2)' },
  { icon:'🔄', title:'Spaced Repetition', desc:'Mathematics is due for revision in 2 days. Don\'t miss it!', color:'rgba(0,201,255,0.08)', border:'rgba(0,201,255,0.2)' },
];

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  renderLineChart();
  renderRadarChart();
  renderHeatmap();
  renderInsights();
  renderSubjectProgressList();
  renderAchievements();
  animateStats();
});

// ── Stats ─────────────────────────────────
function loadStats() {
  const subjects = getSubjects();
  const avgScore = subjects.length > 0
    ? Math.round(subjects.reduce((s, sub) => s + sub.score, 0) / subjects.length)
    : 76;

  document.getElementById('stat-totalHours').textContent = '42h';
  document.getElementById('stat-quizzes').textContent    = Store.get('total_questions', 0) || 24;
  document.getElementById('stat-avgScore').textContent   = avgScore + '%';
  document.getElementById('stat-attScore').textContent   = 82;

  document.getElementById('overallGpa').textContent = '8.8';
  document.getElementById('totalHoursLabel').textContent = '42h';
  document.getElementById('topicsCoveredLabel').textContent = 47;
  document.getElementById('totalXp').textContent = Store.get('total_xp', 1240).toLocaleString();
}

function animateStats() {
  setTimeout(() => {
    animateCounter(document.getElementById('stat-totalHours'), 42, 'h');
    animateCounter(document.getElementById('stat-quizzes'), Store.get('total_questions', 0) || 24);
    animateCounter(document.getElementById('stat-avgScore'), 76, '%');
    animateCounter(document.getElementById('stat-attScore'), 82);
  }, 400);
}

// ── Line Chart ────────────────────────────
function renderLineChart() {
  const data   = WEEKLY_DATA[currentTimeFilter];
  const labels = data.labels;
  const scores = data.scores;
  const attn   = data.attn;

  const W = 500, H = 200;
  const padL = 20, padR = 20, padT = 20, padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minVal = 40, maxVal = 100;

  function toX(i) { return padL + (i / (labels.length - 1)) * chartW; }
  function toY(v) { return H - padB - ((v - minVal) / (maxVal - minVal)) * chartH; }

  function makePath(values) {
    return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  }
  function makeArea(values) {
    const line = makePath(values);
    const lastX = toX(values.length - 1);
    const firstX = toX(0);
    return `${line} L ${lastX} ${H - padB} L ${firstX} ${H - padB} Z`;
  }

  const scorePath = makePath(scores);
  const attnPath  = makePath(attn);

  document.getElementById('scoreLine').setAttribute('d', scorePath);
  document.getElementById('scoreArea').setAttribute('d', makeArea(scores));
  document.getElementById('attnLine').setAttribute('d', attnPath);
  document.getElementById('attnArea').setAttribute('d', makeArea(attn));

  // Dots
  const dotsEl = document.getElementById('chartDots');
  dotsEl.innerHTML = scores.map((v, i) =>
    `<circle cx="${toX(i).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="4"
      fill="#6c63ff" stroke="#0a0a0f" stroke-width="2"
      class="chart-point" data-tip="${labels[i]}: ${v}%"
      onmouseenter="this.setAttribute('r','6')" onmouseleave="this.setAttribute('r','4')"/>`
  ).join('');

  // X Labels
  const xlEl = document.getElementById('chartXLabels');
  if (xlEl) {
    xlEl.innerHTML = labels.map(l =>
      `<span style="font-size:0.7rem;color:var(--text-muted);flex:1;text-align:center;">${l}</span>`
    ).join('');
  }
}

// ── Radar Chart (Canvas) ──────────────────
function renderRadarChart() {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const subjects = getSubjects();

  const labels = subjects.slice(0, 6).map(s => s.emoji + ' ' + s.name.split(' ')[0]);
  const values = subjects.slice(0, 6).map(s => s.score / 100);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r  = 80;
  const n  = labels.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background grid
  for (let ring = 1; ring <= 4; ring++) {
    const ringR = (r * ring) / 4;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + ringR * Math.cos(angle);
      const y = cy + ringR * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // Spoke lines
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const dist  = r * values[i];
    const x = cx + dist * Math.cos(angle);
    const y = cy + dist * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, 'rgba(108,99,255,0.4)');
  grad.addColorStop(1, 'rgba(255,101,132,0.2)');
  ctx.fillStyle   = grad;
  ctx.strokeStyle = '#6c63ff';
  ctx.lineWidth   = 2;
  ctx.fill();
  ctx.stroke();

  // Data points
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const dist  = r * values[i];
    const x = cx + dist * Math.cos(angle);
    const y = cy + dist * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#6c63ff';
    ctx.fill();
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // Labels
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const labelR = r + 18;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    ctx.fillStyle = 'rgba(176,176,204,0.9)';
    ctx.fillText(labels[i], x, y);
  }
}

// ── Study Heatmap ─────────────────────────
function renderHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;

  const COLS = 12, ROWS = 7;
  const levels = ['rgba(108,99,255,0.1)','rgba(108,99,255,0.3)','rgba(108,99,255,0.5)','rgba(108,99,255,0.7)','rgba(108,99,255,0.95)'];

  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const rand = Math.random();
    const daysAgo = COLS * ROWS - i;
    if (daysAgo > COLS * ROWS - 7) {
      return rand > 0.2 ? Math.floor(rand * 4) + 1 : 0;
    }
    return rand > 0.4 ? Math.floor(rand * 3) + 1 : 0;
  });

  grid.innerHTML = cells.map((level, i) => {
    const color  = level === 0 ? 'rgba(255,255,255,0.04)' : levels[level - 1];
    const hours  = level === 0 ? 'No study' : `${level * 1.2}h`;
    return `<div class="heatmap-cell"
      style="background:${color};"
      title="${hours}"
      data-tip="${hours}"></div>`;
  }).join('');
}

// ── AI Insights ───────────────────────────
function renderInsights() {
  const list = document.getElementById('insightsList');
  if (!list) return;

  list.innerHTML = AI_INSIGHTS.map(ins => `
    <div class="insight-card" style="background:${ins.color};border-color:${ins.border};">
      <div class="insight-icon">${ins.icon}</div>
      <div>
        <div class="insight-title">${ins.title}</div>
        <div class="insight-desc">${ins.desc}</div>
      </div>
    </div>`).join('');
}

// ── Subject Progress List ─────────────────
function renderSubjectProgressList() {
  const subjects = getSubjects();
  const list     = document.getElementById('subjectProgressList');
  if (!list) return;

  const sorted = [...subjects].sort((a, b) => b.score - a.score);

  list.innerHTML = sorted.map((sub, i) => {
    const change  = Math.floor(Math.random() * 10) - 2;
    const isUp    = change >= 0;
    const sparkPath = generateSparkline();
    return `
      <div class="subject-progress-row" onclick="showSubjectDetail(${i})">
        <span class="spr-emoji">${sub.emoji}</span>
        <div class="spr-info">
          <div class="spr-name">${sub.name}</div>
          <div class="spr-bar">
            <div class="progress-bar" style="height:6px;margin-top:4px;">
              <div class="progress-fill"
                style="width:${sub.score}%;background:${sub.color};transition:width 1.2s ${i*0.1}s cubic-bezier(0.4,0,0.2,1);"></div>
            </div>
          </div>
        </div>
        <svg class="sparkline" viewBox="0 0 80 30">
          <polyline points="${sparkPath}" fill="none" stroke="${sub.color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="spr-right">
          <div class="spr-score" style="color:${sub.color};">${sub.score}%</div>
          <div class="spr-change ${isUp ? 'text-success' : 'text-danger'}" style="font-size:0.72rem;font-weight:700;">
            ${isUp ? '↑' : '↓'} ${Math.abs(change)}%
          </div>
        </div>
      </div>`;
  }).join('');
}

function generateSparkline() {
  const points = [];
  let v = 30 + Math.random() * 20;
  for (let i = 0; i < 8; i++) {
    v = Math.max(5, Math.min(25, v + (Math.random() * 8 - 4)));
    const x = (i / 7) * 80;
    const y = 30 - v;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

function showSubjectDetail(idx) {
  const subjects = getSubjects();
  const sorted   = [...subjects].sort((a, b) => b.score - a.score);
  const sub      = sorted[idx];
  const panel    = document.getElementById('subjectDetailPanel');
  if (!panel || !sub) return;

  selectedSubjectIdx = idx;

  const recommendations = getRecommendation(sub.score);
  const daysLeft = sub.examDate
    ? Math.max(0, Math.ceil((new Date(sub.examDate) - new Date()) / 86400000))
    : null;

  const level = priorityLabel(sub.score);
  const quizHistory = [60, 65, 70, sub.score - 5, sub.score].map(s => Math.max(0, Math.min(100, s)));

  panel.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:2.5rem;margin-bottom:8px;">${sub.emoji}</div>
      <div style="font-family:var(--font-display);font-size:1.25rem;font-weight:700;">${sub.name}</div>
      ${daysLeft !== null ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">📅 Exam in ${daysLeft} days</div>` : ''}
    </div>

    <!-- Score ring -->
    <div style="display:flex;justify-content:center;margin-bottom:20px;position:relative;">
      <svg width="120" height="120" style="transform:rotate(-90deg);">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="${sub.color}" stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="314"
          stroke-dashoffset="${314 - (sub.score / 100) * 314}"
          style="transition:stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1);"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;color:${sub.color};">${sub.score}%</div>
        <span class="badge badge-${level}" style="font-size:0.65rem;">${priorityEmoji(sub.score)} ${level}</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid-2" style="gap:8px;margin-bottom:16px;">
      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px;text-align:center;">
        <div style="font-weight:800;font-size:1.1rem;">${Math.floor(Math.random()*10)+2}h</div>
        <div style="font-size:0.7rem;color:var(--text-muted);">Studied</div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px;text-align:center;">
        <div style="font-weight:800;font-size:1.1rem;">${Math.floor(Math.random()*5)+1}</div>
        <div style="font-size:0.7rem;color:var(--text-muted);">Quizzes</div>
      </div>
    </div>

    <!-- AI Recommendation -->
    <div style="padding:12px 14px;background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.15);border-radius:var(--radius-md);font-size:0.8rem;color:var(--text-secondary);line-height:1.6;margin-bottom:16px;">
      🤖 ${recommendations}
    </div>

    <!-- Topics -->
    ${sub.topics && sub.topics.length > 0 ? `
    <div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Topics</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${sub.topics.map(t => `<span class="badge badge-purple">${t}</span>`).join('')}
      </div>
    </div>` : ''}

    <button class="btn btn-primary w-full mt-16" onclick="window.location='quiz.html'">
      🧠 Take Quiz →
    </button>
  `;
}

// ── Achievements ──────────────────────────
function renderAchievements() {
  const grid = document.getElementById('achievementGrid');
  if (!grid) return;

  grid.innerHTML = ACHIEVEMENTS.map(ach => `
    <div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
      <div class="ach-icon" style="${!ach.unlocked ? 'filter:grayscale(1);' : ''}">${ach.icon}</div>
      <div class="ach-info">
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.desc}</div>
        <div class="ach-xp">+${ach.xp} XP</div>
      </div>
      ${ach.unlocked
        ? `<span class="badge badge-low" style="flex-shrink:0;">✓ Earned</span>`
        : `<span class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-muted);border-color:var(--border);flex-shrink:0;">🔒 Locked</span>`}
    </div>`).join('');
}

// ── Tab Switching ─────────────────────────
function switchProgressTab(tab) {
  currentProgressTab = tab;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('progress-' + tab)?.classList.add('active');

  // Update tab buttons
  document.querySelectorAll('.tabs .tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(tab));
  });

  if (tab === 'overview') {
    setTimeout(() => {
      renderLineChart();
      renderRadarChart();
    }, 100);
  }
}

// ── Time Filter ───────────────────────────
function setTimeFilter(filter) {
  currentTimeFilter = filter;
  document.querySelectorAll('[id^="filter-"]').forEach(btn => {
    btn.classList.toggle('active', btn.id.includes(filter));
  });
  renderLineChart();
  showToast(`Showing ${filter === 'week' ? 'last 7 days' : filter === 'month' ? 'last 30 days' : 'all time'}`, 'info', '📊');
}

// ── Export Report ─────────────────────────
function exportReport() {
  showToast('Generating your progress report... 📄', 'info', '⬇️');
  setTimeout(() => showToast('Report ready! (Demo mode) ✅', 'success', '📊'), 1500);
}
