/* =========================================
   planner.js — Study Planner page logic
   ========================================= */

// ── State ─────────────────────────────────
let selectedEmoji = '📐';
let selectedColor = '#6c63ff';
let pomRunning  = false;
let pomPaused   = false;
let pomSeconds  = 25 * 60;
let pomTotal    = 25 * 60;
let pomInterval = null;
let pomMode     = 'focus';
let dragSrcIdx  = null;

const STUDY_TIPS = [
  "🧠 The Feynman Technique: explain concepts as if teaching a child to solidify understanding.",
  "⏱ Spaced practice beats cramming. Study in short bursts over multiple days.",
  "📝 Active recall > passive re-reading. Test yourself instead of just reading notes.",
  "🎯 Break big topics into micro-goals. Complete 3 focused tasks, then take a break.",
  "🌙 Sleep consolidates memory. Review your notes before sleeping for better retention.",
  "🔄 Interleave subjects during study sessions to boost long-term retention.",
  "✍️ Handwriting notes engages more brain regions than typing for memory encoding.",
  "🎵 Instrumental music (no lyrics) can improve focus during study sessions.",
  "💧 Stay hydrated! Even mild dehydration reduces cognitive performance by 10%.",
  "🏃 Physical exercise before studying boosts BDNF and enhances learning capacity.",
];

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setDateLabel();
  renderExamCountdowns();
  renderSchedule();
  renderSubjectsList();
  renderRevisionTimeline();
  refreshTip();

  // Set default exam date
  const examDateInput = document.getElementById('examDate');
  if (examDateInput) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    examDateInput.min = new Date().toISOString().split('T')[0];
    examDateInput.value = d.toISOString().split('T')[0];
  }
});

function setDateLabel() {
  const el = document.getElementById('planDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
}

// ── Tab Switching ─────────────────────────
function switchTab(tab) {
  ['schedule','subjects'].forEach(t => {
    document.getElementById('tab-content-' + t)?.classList.toggle('hidden', t !== tab);
    const btn = document.getElementById('tab-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'subjects') renderSubjectsList();
}

// ── Exam Countdowns ───────────────────────
function renderExamCountdowns() {
  const subjects = getSubjects();
  const grid = document.getElementById('examCountdowns');
  if (!grid) return;

  const withDates = subjects.filter(s => s.examDate).sort((a, b) =>
    new Date(a.examDate) - new Date(b.examDate)
  ).slice(0, 4);

  if (withDates.length === 0) { grid.innerHTML = ''; return; }

  grid.innerHTML = withDates.map(sub => {
    const days = Math.max(0, Math.ceil((new Date(sub.examDate) - new Date()) / 86400000));
    const urgency = days <= 7 ? 'var(--high)' : days <= 14 ? 'var(--medium)' : sub.color;
    return `
      <div class="exam-countdown card" style="border-color:${urgency}22;background:${urgency}08;">
        <div>
          <div style="font-size:1rem;margin-bottom:4px;">${sub.emoji} ${sub.name}</div>
          <div class="countdown-label">Exam date</div>
        </div>
        <div style="text-align:right;">
          <div class="countdown-value" style="color:${urgency};">${days}</div>
          <div class="countdown-label">days left</div>
        </div>
      </div>`;
  }).join('');
}

// ── Generate Study Plan ───────────────────
function generatePlan() {
  const subjects = getSubjects();
  if (subjects.length === 0) {
    showToast('Add subjects first! Click "Subjects" tab.', 'warning', '📚');
    return;
  }

  showToast('Generating your adaptive plan... ⚡', 'info', '🤖');

  setTimeout(() => {
    // Sort by score (lowest = highest priority)
    const sorted = [...subjects].sort((a, b) => a.score - b.score);

    // Build time slots
    const slots = [];
    let startMinute = 9 * 60; // 9:00 AM

    sorted.forEach(sub => {
      const level = priorityLabel(sub.score);
      const dur   = { high: 90, medium: 60, low: 30 }[level];

      slots.push({
        subject: sub.name,
        emoji:   sub.emoji,
        color:   sub.color,
        score:   sub.score,
        start:   startMinute,
        dur,
        level,
        topics: sub.topics?.slice(0, 2) || []
      });
      startMinute += dur + 15; // 15 min break
    });

    Store.set('today_schedule', slots);
    renderSchedule();
    showToast('Plan generated! ✅ Tap a session to start.', 'success', '📅');
    switchTab('schedule');
  }, 600);
}

// ── Render Schedule ───────────────────────
function renderSchedule() {
  const list  = document.getElementById('scheduleList');
  const empty = document.getElementById('scheduleEmpty');
  if (!list) return;

  let schedule = Store.get('today_schedule', []);
  if (schedule.length === 0) {
    generatePlan();
    schedule = Store.get('today_schedule', []);
  }

  if (schedule.length === 0) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  list.innerHTML = schedule.map((slot, i) => {
    const h   = Math.floor(slot.start / 60);
    const m   = slot.start % 60;
    const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const topicStr = slot.topics?.join(' • ') || 'Core concepts';
    return `
      <div class="schedule-item" draggable="true"
        ondragstart="onDragStart(event,${i})"
        ondragover="onDragOver(event,${i})"
        ondrop="onDrop(event,${i})"
        ondragend="onDragEnd(event)"
        id="sched-${i}">
        <div class="color-bar" style="background:${slot.color};"></div>
        <div class="time-block" style="padding-left:8px;">
          <div class="time-start">${timeStr}</div>
          <div class="time-dur">${slot.dur}m</div>
        </div>
        <div class="content">
          <div class="s-name">${slot.emoji} ${slot.subject}</div>
          <div class="s-topics">${topicStr}</div>
          <div style="margin-top:6px;">
            <span class="badge badge-${slot.level}">${priorityEmoji(slot.score)} ${slot.level.charAt(0).toUpperCase()+slot.level.slice(1)}</span>
          </div>
        </div>
        <div class="actions">
          <div class="drag-handle" title="Drag to reorder">⠿</div>
          <button class="btn btn-sm btn-primary" onclick="markDone(${i})" id="done-${i}">▶ Start</button>
          <button class="btn btn-sm btn-ghost" onclick="removeSlot(${i})" title="Remove">✕</button>
        </div>
      </div>`;
  }).join('');
}

// ── Drag & Drop ───────────────────────────
function onDragStart(e, i) {
  dragSrcIdx = i;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(e, i) {
  e.preventDefault();
  document.querySelectorAll('.schedule-item').forEach(el => el.classList.remove('drag-over'));
  document.getElementById('sched-' + i)?.classList.add('drag-over');
  e.dataTransfer.dropEffect = 'move';
}
function onDrop(e, i) {
  e.preventDefault();
  if (dragSrcIdx === null || dragSrcIdx === i) return;
  const schedule = Store.get('today_schedule', []);
  const [moved]  = schedule.splice(dragSrcIdx, 1);
  schedule.splice(i, 0, moved);
  Store.set('today_schedule', schedule);
  renderSchedule();
  showToast('Schedule reordered ✓', 'success', '✅');
}
function onDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.schedule-item').forEach(el => el.classList.remove('drag-over'));
  dragSrcIdx = null;
}

function markDone(i) {
  const schedule = Store.get('today_schedule', []);
  const slot = schedule[i];
  if (!slot) return;
  const btn = document.getElementById('done-' + i);
  if (btn && btn.textContent.includes('Start')) {
    btn.textContent = '✓ Done';
    btn.style.background = 'var(--grad-green)';
    btn.style.opacity = '1';
    showToast(`Started: ${slot.subject} ⏱`, 'success', '▶️');
  } else {
    showToast(`${slot.subject} marked complete! 🎉`, 'success', '✅');
    if (btn) { btn.disabled = true; btn.textContent = '✓ Complete'; }
  }
}

function removeSlot(i) {
  const schedule = Store.get('today_schedule', []);
  schedule.splice(i, 1);
  Store.set('today_schedule', schedule);
  renderSchedule();
  showToast('Session removed', 'info', '🗑️');
}

// ── Subjects List ─────────────────────────
function renderSubjectsList() {
  const subjects = getSubjects();
  const list     = document.getElementById('subjectsList');
  if (!list) return;

  if (subjects.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="icon">📚</div><div class="title">No subjects yet</div><div class="desc">Add your first subject using the form →</div></div>';
    return;
  }

  list.innerHTML = subjects.map((sub, i) => {
    const level = priorityLabel(sub.score);
    return `
      <div class="subject-list-item">
        <div style="width:40px;height:40px;border-radius:var(--radius-md);background:${sub.color}22;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;">${sub.emoji}</div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-weight:700;">${sub.name}</span>
            <span class="badge badge-${level}">${sub.score}%</span>
          </div>
          <div class="progress-bar" style="height:6px;">
            <div class="progress-fill" style="width:${sub.score}%;background:${sub.color};transition:width 1s ${i*0.1}s cubic-bezier(0.4,0,0.2,1);"></div>
          </div>
          ${sub.examDate ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">📅 Exam: ${new Date(sub.examDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-sm btn-secondary" onclick="editSubject(${i})">Edit</button>
          <button class="btn btn-sm btn-ghost" style="color:var(--high);" onclick="deleteSubject(${i})">✕</button>
        </div>
      </div>`;
  }).join('');
}

// ── Add Subject ───────────────────────────
function selectEmoji(btn, emoji) {
  document.querySelectorAll('#emojiPicker .subject-pill').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedEmoji = emoji;
}

function selectColor(el, color) {
  document.querySelectorAll('.color-opt').forEach(e => e.style.borderColor = 'transparent');
  el.style.borderColor = '#fff';
  selectedColor = color;
}

function updateScoreLabel() {
  const val = document.getElementById('scoreSlider')?.value;
  const lbl = document.getElementById('scoreLabel');
  if (lbl && val) lbl.textContent = val;
}

function addSubject() {
  const name  = document.getElementById('subjectName')?.value?.trim();
  const score = parseInt(document.getElementById('scoreSlider')?.value || 60);
  const exam  = document.getElementById('examDate')?.value;

  if (!name) {
    showToast('Enter a subject name', 'warning', '⚠️');
    return;
  }

  const subjects = getSubjects();
  if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    showToast('Subject already exists!', 'error', '⚠️');
    return;
  }

  subjects.push({
    name, emoji: selectedEmoji,
    score, color: selectedColor,
    examDate: exam,
    topics: []
  });
  Store.set('subjects_data', subjects);

  // Reset form
  document.getElementById('subjectName').value = '';
  document.getElementById('scoreSlider').value  = 65;
  updateScoreLabel();

  renderSubjectsList();
  renderExamCountdowns();
  Store.set('today_schedule', []);
  showToast(`${selectedEmoji} ${name} added! ✅`, 'success', '✅');
}

function deleteSubject(i) {
  const subjects = getSubjects();
  const name = subjects[i]?.name;
  subjects.splice(i, 1);
  Store.set('subjects_data', subjects);
  Store.set('today_schedule', []);
  renderSubjectsList();
  renderExamCountdowns();
  showToast(`${name} removed`, 'info', '🗑️');
}

function editSubject(i) {
  const subjects = getSubjects();
  const sub = subjects[i];
  document.getElementById('subjectName').value  = sub.name;
  document.getElementById('scoreSlider').value  = sub.score;
  updateScoreLabel();
  selectedEmoji = sub.emoji;
  selectedColor = sub.color;
  showToast(`Editing ${sub.name}. Make changes and re-add.`, 'info', '✏️');
  deleteSubject(i);
}

// ── Modal shortcut ────────────────────────
function openAddSubjectModal() {
  switchTab('subjects');
}

// ── Revision Timeline ─────────────────────
function renderRevisionTimeline() {
  const timeline = document.getElementById('revisionTimeline');
  if (!timeline) return;

  const subjects = getSubjects();
  const colors   = ['#6c63ff','#ff6584','#43e97b','#00c9ff','#f7971e'];

  timeline.innerHTML = subjects.slice(0, 5).map((sub, i) => {
    const revCount = Math.floor(Math.random() * 4) + 1;
    const nextDate = getNextRevision(revCount);
    return `
      <div class="timeline-item">
        <div class="timeline-line"></div>
        <div class="timeline-dot" style="background:${colors[i % 5]}22;border:2px solid ${colors[i % 5]};">
          <span style="font-size:0.85rem;">${sub.emoji}</span>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">${sub.name}</div>
          <div class="timeline-time">📅 ${nextDate}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Study Tips ────────────────────────────
function refreshTip() {
  const el = document.getElementById('studyTip');
  if (!el) return;
  const tip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
  el.style.opacity = 0;
  setTimeout(() => {
    el.textContent = tip;
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = 1;
  }, 200);
}

// ── Pomodoro Timer ────────────────────────
function setPomMode(mode, minutes) {
  if (pomRunning) resetPomodoro();
  pomMode    = mode;
  pomSeconds = minutes * 60;
  pomTotal   = minutes * 60;

  document.querySelectorAll('.pom-mode').forEach(b => b.classList.remove('active'));
  document.getElementById('pom-' + mode)?.classList.add('active');

  const modeLabels = { focus:'Focus 🧠', short:'Short Break ☕', long:'Long Break 🌿' };
  document.getElementById('pomModeLabel').textContent = modeLabels[mode];
  updatePomDisplay();
  updatePomRing();
}

function togglePomodoro() {
  if (!pomRunning) {
    pomRunning = true;
    pomPaused  = false;
    const btn = document.getElementById('pomBtn');
    if (btn) btn.textContent = '⏸ Pause';

    pomInterval = setInterval(() => {
      pomSeconds--;
      updatePomDisplay();
      updatePomRing();
      if (pomSeconds <= 0) {
        pomComplete();
      }
    }, 1000);
  } else {
    pomPaused  = !pomPaused;
    const btn = document.getElementById('pomBtn');
    if (pomPaused) {
      clearInterval(pomInterval);
      btn.textContent = '▶ Resume';
    } else {
      pomInterval = setInterval(() => {
        pomSeconds--;
        updatePomDisplay();
        updatePomRing();
        if (pomSeconds <= 0) pomComplete();
      }, 1000);
      btn.textContent = '⏸ Pause';
    }
  }
}

function resetPomodoro() {
  clearInterval(pomInterval);
  pomRunning  = false;
  pomPaused   = false;
  const durations = { focus:25, short:5, long:15 };
  pomSeconds = (durations[pomMode] || 25) * 60;
  pomTotal   = pomSeconds;
  const btn  = document.getElementById('pomBtn');
  if (btn) btn.textContent = '▶ Start';
  updatePomDisplay();
  updatePomRing();
}

function pomComplete() {
  clearInterval(pomInterval);
  pomRunning = false;
  const btn  = document.getElementById('pomBtn');
  if (btn) btn.textContent = '▶ Start';
  resetPomodoro();

  if (pomMode === 'focus') {
    showToast('Focus session complete! Take a break 🎉', 'success', '✅');
    setPomMode('short', 5);
  } else {
    showToast('Break over! Time to focus 💪', 'info', '⚡');
    setPomMode('focus', 25);
  }
}

function updatePomDisplay() {
  const m = Math.floor(pomSeconds / 60);
  const s = pomSeconds % 60;
  const el = document.getElementById('pomTime');
  if (el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updatePomRing() {
  const ring = document.getElementById('pomRingFill');
  if (!ring) return;
  const circumference = 440;
  const progress = pomSeconds / pomTotal;
  ring.style.strokeDashoffset = circumference - (progress * circumference);
}
