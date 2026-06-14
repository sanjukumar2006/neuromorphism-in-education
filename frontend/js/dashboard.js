/* =========================================
   dashboard.js — Dashboard page logic
   ========================================= */

// ── Session State ─────────────────────────
let sessionActive  = false;
let sessionPaused  = false;
let sessionSeconds = 0;
let sessionInterval = null;
let attentionInterval = null;
let attentionScore = 0;
let currentSubjectIdx = 0;

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTodayPlan();
  renderActivityChart();
  renderRecommendations();
  renderStreakCalendar();
  renderSubjectOverview();
  renderRevisionModal();
  updateSidebarGoal();
  updateGreetingSubtitle();
});

// ── Greeting subtitle ─────────────────────
function updateGreetingSubtitle() {
  const subjects = getSubjects();
  const highPriority = subjects.filter(s => s.score < 60).length;
  const el = document.getElementById('greetingSubtitle');
  if (!el) return;
  if (highPriority > 0) {
    el.textContent = `⚠️ ${highPriority} subject${highPriority > 1 ? 's' : ''} need urgent attention. Let's fix that today!`;
    el.style.color = 'var(--high)';
  } else {
    el.textContent = `You have ${subjects.length} subjects scheduled. Let's crush it! 💪`;
  }
}

// ── Today's Study Plan ────────────────────
function renderTodayPlan() {
  const subjects = getSubjects();
  const sorted   = [...subjects].sort((a, b) => a.score - b.score);
  const list     = document.getElementById('todayPlanList');
  if (!list) return;

  const studyTimes = { high: 90, medium: 60, low: 30 };
  let startHour = 9;

  list.innerHTML = sorted.slice(0, 5).map((sub, i) => {
    const level = priorityLabel(sub.score);
    const mins  = studyTimes[level];
    const timeStr = `${startHour}:00`;
    startHour += Math.ceil(mins / 60);

    const plan = `
      <div class="plan-row" onclick="startSubjectSession('${sub.name}')">
        <div class="order" style="background:${sub.color}22;color:${sub.color};font-weight:800;">${i + 1}</div>
        <div style="font-size:1.2rem;">${sub.emoji}</div>
        <div class="info">
          <div class="name">${sub.name}</div>
          <div class="meta">⏱ ${mins} min · ${timeStr}</div>
        </div>
        <span class="badge badge-${level}">${priorityEmoji(sub.score)} ${level.charAt(0).toUpperCase() + level.slice(1)}</span>
        <div style="width:48px;text-align:right;">
          <div style="font-weight:800;font-size:0.95rem;color:${sub.color};">${sub.score}%</div>
        </div>
      </div>`;
    return plan;
  }).join('');
}

// ── Weekly Activity Chart ─────────────────
function renderActivityChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [2.5, 3.0, 4.0, 1.5, 5.0, 3.5, 4.2];
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0

  const barsEl   = document.getElementById('activityBars');
  const labelsEl = document.getElementById('activityLabels');
  if (!barsEl || !labelsEl) return;

  const maxH = Math.max(...hours);
  barsEl.innerHTML = hours.map((h, i) => {
    const pct = (h / maxH) * 100;
    return `<div class="chart-bar ${i === todayIdx ? 'today' : ''}"
      data-tip="${h}h"
      style="height:0%;transition:height 1s ${i * 0.08}s cubic-bezier(0.4,0,0.2,1);"
      id="actBar${i}"></div>`;
  }).join('');

  labelsEl.innerHTML = days.map((d, i) =>
    `<span class="${i === todayIdx ? 'today' : ''}">${d}</span>`
  ).join('');

  // Animate after render
  setTimeout(() => {
    hours.forEach((h, i) => {
      const bar = document.getElementById('actBar' + i);
      if (bar) bar.style.height = ((h / maxH) * 100) + '%';
    });
  }, 200);

  const total = hours.reduce((a, b) => a + b, 0);
  const avgH  = (total / hours.length).toFixed(1);
  const weekEl = document.getElementById('weekTotal');
  const avgEl  = document.getElementById('weekAvg');
  if (weekEl) weekEl.textContent = total.toFixed(0) + 'h';
  if (avgEl)  avgEl.textContent  = avgH + 'h';
}

// ── AI Recommendations ────────────────────
function renderRecommendations() {
  const subjects = getSubjects();
  const sorted   = [...subjects].sort((a, b) => a.score - b.score);
  const list     = document.getElementById('recoList');
  if (!list) return;

  list.innerHTML = sorted.slice(0, 4).map(sub => {
    const level = priorityLabel(sub.score);
    const reco  = getRecommendation(sub.score);
    const colors = { high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };
    return `
      <div class="reco-item reco-${level}">
        <div class="reco-dot" style="background:${colors[level]};box-shadow:0 0 6px ${colors[level]};"></div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1rem;">${sub.emoji}</span>
            <span style="font-weight:700;font-size:0.875rem;">${sub.name}</span>
            <span class="badge badge-${level}">${sub.score}%</span>
          </div>
          <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;">${reco}</div>
        </div>
      </div>`;
  }).join('');
}

function refreshRecommendations() {
  renderRecommendations();
  showToast('Recommendations refreshed 🤖', 'info', '🔄');
}

// ── Streak Calendar ───────────────────────
function renderStreakCalendar() {
  const grid = document.getElementById('streakGrid');
  if (!grid) return;

  const today = new Date().getDay(); // 0=Sun
  const streakData = Store.get('streak_data', null);

  // Generate 28-day streak data
  const days = Array.from({ length: 28 }, (_, i) => {
    const daysAgo = 27 - i;
    const r = Math.random();
    if (daysAgo === 0) return 'today';
    if (daysAgo < 8)   return r > 0.25 ? 'done' : 'missed';
    return r > 0.4 ? 'done' : '';
  });

  grid.innerHTML = days.map((state, i) =>
    `<div class="streak-day ${state}"
      title="${state === 'today' ? 'Today' : state === 'done' ? 'Studied ✓' : state === 'missed' ? 'Missed' : 'Not yet'}"
      onclick="showDayInfo(${i})"></div>`
  ).join('');

  const streakEl = document.getElementById('streakDays');
  if (streakEl) streakEl.textContent = Store.get('streak', 7) + ' days';
  const streakCount = document.getElementById('streakCount');
  if (streakCount) streakCount.textContent = Store.get('streak', 7);
}

function showDayInfo(i) {
  const daysAgo = 27 - i;
  if (daysAgo === 0) showToast("That's today! Keep going 💪", 'info', '📅');
  else showToast(`${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`, 'info', '📅');
}

// ── Subject Overview Cards ────────────────
function renderSubjectOverview() {
  const subjects = getSubjects();
  const grid     = document.getElementById('subjectOverview');
  if (!grid) return;

  grid.innerHTML = subjects.slice(0, 6).map(sub => {
    const level = priorityLabel(sub.score);
    const daysLeft = sub.examDate
      ? Math.max(0, Math.ceil((new Date(sub.examDate) - new Date()) / 86400000))
      : null;

    return `
      <div class="subject-card" onclick="window.location='planner.html'">
        <div class="accent-bar" style="background:${sub.color};"></div>
        <div style="padding-top:8px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span style="font-size:1.5rem;">${sub.emoji}</span>
            <span class="badge badge-${level}">${priorityEmoji(sub.score)} ${sub.score}%</span>
          </div>
          <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">${sub.name}</div>
          ${daysLeft !== null ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">📅 Exam in ${daysLeft} days</div>` : ''}
          <div class="progress-bar">
            <div class="progress-fill" style="width:${sub.score}%;background:${sub.color};"></div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Revision Modal ────────────────────────
function renderRevisionModal() {
  const subjects  = getSubjects();
  const timeline  = document.getElementById('revisionTimeline');
  if (!timeline) return;

  const colors = [
    'rgba(108,99,255,0.2)', 'rgba(255,101,132,0.2)',
    'rgba(67,233,123,0.2)', 'rgba(0,201,255,0.2)'
  ];
  const dotColors = ['#6c63ff','#ff6584','#43e97b','#00c9ff'];

  timeline.innerHTML = subjects.slice(0, 5).map((sub, i) => {
    const revCount = Math.floor(Math.random() * 3) + 1;
    const nextDate = getNextRevision(revCount);
    return `
      <div class="timeline-item">
        <div class="timeline-line"></div>
        <div class="timeline-dot" style="background:${colors[i % 4]};border:2px solid ${dotColors[i % 4]};">
          <span>${sub.emoji}</span>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">${sub.name}</div>
          <div class="timeline-time">Next revision: ${nextDate} · Revision #${revCount + 1}</div>
          <div style="margin-top:6px;">
            <div class="progress-bar" style="">
              <div class="progress-fill" style="width:${(revCount/5)*100}%;background:${dotColors[i%4]};height:4px;"></div>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function openRevisionModal() { openModal('revisionModal'); }
function openAttentionPanel() {
  renderAttentionModal();
  openModal('attentionModal');
}

function renderAttentionModal() {
  const subjects = getSubjects();
  const topicsEl = document.getElementById('attTopics');
  const attCircle = document.getElementById('attCircle');
  const attScoreEl = document.getElementById('attScore');

  const score = Math.floor(Math.random() * 30) + 65;
  if (attScoreEl) attScoreEl.textContent = score;
  if (attCircle) {
    const circumference = 377;
    const offset = circumference - (score / 100) * circumference;
    attCircle.style.strokeDashoffset = offset;
  }

  if (!topicsEl) return;
  const analyses = [
    { icon: '✅', label: 'Mastered', color: 'var(--accent-3)' },
    { icon: '⚡', label: 'Fast but wrong', color: 'var(--medium)' },
    { icon: '🐌', label: 'Slow but correct', color: 'var(--accent)' },
    { icon: '🔴', label: 'Needs work', color: 'var(--high)' },
  ];
  topicsEl.innerHTML = subjects.slice(0, 4).map((sub, i) => {
    const a = analyses[i % analyses.length];
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);">
        <span>${sub.emoji}</span>
        <span style="flex:1;font-weight:600;font-size:0.875rem;">${sub.name}</span>
        <span style="font-size:1rem;">${a.icon}</span>
        <span style="font-size:0.75rem;color:${a.color};font-weight:700;">${a.label}</span>
      </div>`;
  }).join('');
}

// ── Sidebar Goal ──────────────────────────
function updateSidebarGoal() {
  const goal    = parseInt(Store.get('goal', 120));
  const studied = Store.get('studied_today', 47); // minutes
  const pct     = Math.min(100, (studied / goal) * 100);

  const fillEl  = document.getElementById('sidebarGoalFill');
  const doneEl  = document.getElementById('sidebarGoalDone');
  const totalEl = document.getElementById('sidebarGoalTotal');

  setTimeout(() => {
    if (fillEl)  fillEl.style.width  = pct + '%';
    if (doneEl)  doneEl.textContent  = studied + 'm';
    if (totalEl) totalEl.textContent = goal + 'm';
  }, 500);
}

// ── Session Timer ─────────────────────────
function startSubjectSession(name) {
  if (!sessionActive) {
    startStudySession(name);
  } else {
    const el = document.getElementById('currentSubjectDisplay');
    if (el) el.textContent = name;
    showToast(`Switched to ${name}`, 'info', '📚');
  }
}

function startStudySession(name) {
  if (sessionActive) return;

  const subjects = getSubjects();
  const subName  = name || subjects[0]?.name || 'Mathematics';

  sessionActive  = true;
  sessionSeconds = 0;

  const banner = document.getElementById('sessionBanner');
  const startBtn = document.getElementById('startSessionBtn');
  const fab    = document.getElementById('fab');
  const subjDisplay = document.getElementById('currentSubjectDisplay');

  if (banner)    banner.style.display = 'block';
  if (startBtn)  { startBtn.disabled = true; startBtn.innerHTML = '⚡ Session Active'; }
  if (fab)       fab.style.display   = 'none';
  if (subjDisplay) subjDisplay.textContent = subName;

  sessionInterval = setInterval(() => {
    if (!sessionPaused) {
      sessionSeconds++;
      const el = document.getElementById('sessionTimerDisplay');
      if (el) el.textContent = formatTime(sessionSeconds);
    }
  }, 1000);

  // Simulate attention score slowly building
  attentionScore = 60;
  attentionInterval = setInterval(() => {
    if (!sessionPaused) {
      attentionScore = Math.min(100, attentionScore + (Math.random() * 2 - 0.5));
      const pct = Math.round(attentionScore);
      const fillEl = document.getElementById('attentionFill');
      const pctEl  = document.getElementById('attentionPct');
      if (fillEl) fillEl.style.width = pct + '%';
      if (pctEl)  pctEl.textContent  = pct + '%';
    }
  }, 3000);

  showToast(`Session started: ${subName} 📚`, 'success', '▶️');
}

function pauseSession() {
  sessionPaused = !sessionPaused;
  const btn = document.getElementById('pauseBtn');
  if (btn) btn.textContent = sessionPaused ? '▶ Resume' : '⏸ Pause';
  showToast(sessionPaused ? 'Session paused ⏸' : 'Session resumed ▶', 'info', sessionPaused ? '⏸' : '▶️');
}

function endSession() {
  if (!sessionActive) return;
  clearInterval(sessionInterval);
  clearInterval(attentionInterval);

  const minutes = Math.floor(sessionSeconds / 60);
  sessionActive  = false;
  sessionPaused  = false;
  sessionSeconds = 0;

  const banner   = document.getElementById('sessionBanner');
  const startBtn = document.getElementById('startSessionBtn');
  const fab      = document.getElementById('fab');

  if (banner)  banner.style.display = 'none';
  if (startBtn){ startBtn.disabled = false; startBtn.innerHTML = '▶ Start Session'; }
  if (fab)     fab.style.display   = 'flex';

  // Update stored study time
  Store.update('studied_today', (v) => (v || 0) + minutes, 0);
  updateSidebarGoal();

  showToast(`Session complete! ${minutes}m studied 🎉`, 'success', '🏆');
}
