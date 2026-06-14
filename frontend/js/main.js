/* =========================================
   main.js — Shared utilities for all pages
   ========================================= */

// ── Toast System ──────────────────────────
function showToast(message, type = 'info', icon = 'ℹ️', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Navigation scroll effect ──────────────
const nav = document.getElementById('mainNav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Modal helpers ─────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// ── User info ─────────────────────────────
function loadUserInfo() {
  const u = JSON.parse(localStorage.getItem('vortex_user') || '{}');
  const name = u.name || 'Student';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const navAvatar = document.getElementById('navAvatar');
  const navName   = document.getElementById('navName');
  if (navAvatar) navAvatar.textContent = initials;
  if (navName)   navName.textContent   = name.split(' ')[0];

  const menuName  = document.getElementById('menuName');
  const menuEmail = document.getElementById('menuEmail');
  if (menuName)  menuName.textContent  = name;
  if (menuEmail) menuEmail.textContent = u.email || '';
}
loadUserInfo();

// ── Greeting ──────────────────────────────
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  const u = JSON.parse(localStorage.getItem('vortex_user') || '{}');
  const firstName = (u.name || 'Student').split(' ')[0];

  const el = document.getElementById('greetingTitle');
  if (el) el.textContent = `${greeting}, ${firstName}! 👋`;
}
setGreeting();

// ── User menu toggle ──────────────────────
function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  if (!menu) return;
  const isVisible = menu.style.display === 'block';
  menu.style.display = isVisible ? 'none' : 'block';
  menu.style.animation = isVisible ? '' : 'slideUp 0.2s ease both';
}
function closeUserMenu() {
  const menu = document.getElementById('userMenu');
  if (menu) menu.style.display = 'none';
}
document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  const btn  = e.target.closest('.nav-user');
  if (menu && !btn && !menu.contains(e.target)) menu.style.display = 'none';
});

// ── Notification panel toggle ─────────────
function toggleNotifPanel() {
  showToast('No new notifications 🎉', 'info', '🔔');
}

// ── Format duration ───────────────────────
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s > 0 ? s + 's' : ''}`.trim();
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm > 0 ? rm + 'm' : ''}`.trim();
}

// ── Format time ───────────────────────────
function formatTime(seconds) {
  const h  = Math.floor(seconds / 3600);
  const m  = Math.floor((seconds % 3600) / 60);
  const s  = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// ── Animate number counter ────────────────
function animateCounter(el, target, suffix = '', duration = 1200) {
  if (!el) return;
  const start = 0;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * ease);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Intersection Observer for animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('slide-up');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.card').forEach(el => observer.observe(el));

// ── Keyboard shortcuts ────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// ── Data storage helpers ──────────────────
const Store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem('vortex_' + key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem('vortex_' + key, JSON.stringify(value));
  },
  update(key, updater, fallback = null) {
    const current = this.get(key, fallback);
    const updated = updater(current);
    this.set(key, updated);
    return updated;
  }
};

// ── Default subjects — Class 12 CBSE ──────
const DEFAULT_SUBJECTS = [
  {
    name: 'Mathematics', emoji: '📐', score: 65, color: '#6c63ff',
    examDate: '2026-07-15',
    topics: [
      'Relations & Functions','Inverse Trigonometry',
      'Matrices & Determinants','Continuity & Differentiability',
      'Applications of Derivatives','Integrals',
      'Differential Equations','Vectors',
      '3D Geometry','Probability'
    ]
  },
  {
    name: 'Physics', emoji: '⚛️', score: 72, color: '#ff6584',
    examDate: '2026-07-20',
    topics: [
      'Electrostatics','Current Electricity',
      'Magnetic Effects of Current','Electromagnetic Induction',
      'Alternating Current','Electromagnetic Waves',
      'Optics','Dual Nature of Radiation',
      'Atoms & Nuclei','Semiconductors'
    ]
  },
  {
    name: 'Chemistry', emoji: '🧪', score: 58, color: '#43e97b',
    examDate: '2026-07-18',
    topics: [
      'Solutions','Electrochemistry',
      'Chemical Kinetics','Surface Chemistry',
      'Isolation of Elements','p-Block Elements',
      'd & f Block Elements','Coordination Compounds',
      'Haloalkanes','Aldehydes & Ketones',
      'Amines','Biomolecules'
    ]
  },
  {
    name: 'Biology', emoji: '🌿', score: 70, color: '#06d6a0',
    examDate: '2026-07-22',
    topics: [
      'Reproduction in Plants','Human Reproduction',
      'Reproductive Health','Genetics & Mendelism',
      'Molecular Basis of Inheritance','Evolution',
      'Human Health & Disease','Biotechnology Principles',
      'Biotechnology Applications','Organisms & Populations',
      'Ecosystem','Biodiversity'
    ]
  },
  {
    name: 'Computer Science', emoji: '💻', score: 88, color: '#00c9ff',
    examDate: '2026-07-25',
    topics: [
      'Python Revision','OOP in Python',
      'Exception Handling','File Handling',
      'Stack & Queue','Searching Algorithms',
      'Sorting Algorithms','Computer Networks',
      'SQL & Databases','Boolean Algebra',
      'Communication Technologies'
    ]
  },
  {
    name: 'English', emoji: '📚', score: 80, color: '#f7971e',
    examDate: '2026-07-10',
    topics: [
      'The Last Lesson','Lost Spring',
      'Deep Water','The Rattrap',
      'Indigo','Going Places',
      'My Mother at Sixty-Six','An Elementary School Classroom',
      'Keeping Quiet','A Thing of Beauty',
      'The Tiger King','Journey to the End of the Earth',
      'Grammar','Writing Skills'
    ]
  },
  {
    name: 'Accountancy', emoji: '📒', score: 62, color: '#a855f7',
    examDate: '2026-07-12',
    topics: [
      'Accounting for Partnership','Goodwill',
      'Admission of Partner','Retirement & Death',
      'Dissolution of Firm','Accounting for Companies',
      'Issue & Forfeiture of Shares','Issue of Debentures',
      'Financial Statement Analysis','Ratio Analysis',
      'Cash Flow Statement'
    ]
  },
  {
    name: 'Economics', emoji: '📊', score: 67, color: '#f59e0b',
    examDate: '2026-07-17',
    topics: [
      'Microeconomics: Introduction','Theory of Consumer Behaviour',
      'Production & Costs','Market & Price Determination',
      'Forms of Market','National Income',
      'Money & Banking','Determination of Income',
      'Government Budget','Balance of Payments'
    ]
  },
];

function getSubjects() {
  let stored = Store.get('subjects_data', null);
  if (!stored || stored.length === 0) {
    const names = Store.get('subjects', []);
    if (names.length > 0) {
      stored = names.map(n => DEFAULT_SUBJECTS.find(s => s.name === n) || { name: n, emoji: '📖', score: 60, color: '#6c63ff', examDate: '', topics: [] });
    } else {
      stored = DEFAULT_SUBJECTS;
    }
    Store.set('subjects_data', stored);
  }
  return stored;
}

// ── AI Recommendation engine (frontend) ───
const RECOMMENDATIONS = {
  high:   [
    '🔴 HIGH PRIORITY: Focus heavily on this subject this week.',
    '⚠️ Your score is below 60%. Schedule extra revision sessions.',
    '📌 Dedicate at least 90 minutes daily to catch up.',
  ],
  medium: [
    '🟡 MEDIUM: You\'re on track but need consistent practice.',
    '📖 Review weak topics twice before your exam.',
    '💡 Try practice problems to reinforce understanding.',
  ],
  low: [
    '✅ Well done! Maintain your momentum.',
    '🔄 Light revision once a week is sufficient.',
    '⚡ Focus on harder problems to push your score higher.',
  ]
};

function getRecommendation(score) {
  const level = score < 60 ? 'high' : score < 80 ? 'medium' : 'low';
  const arr = RECOMMENDATIONS[level];
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Spaced repetition intervals ───────────
function getNextRevision(count) {
  const days = [1, 3, 7, 15, 30];
  const d = days[Math.min(count - 1, days.length - 1)] || 30;
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Priority color ────────────────────────
function priorityColor(score) {
  if (score < 60) return 'var(--high)';
  if (score < 80) return 'var(--medium)';
  return 'var(--low)';
}
function priorityLabel(score) {
  if (score < 60) return 'high';
  if (score < 80) return 'medium';
  return 'low';
}
function priorityEmoji(score) {
  if (score < 60) return '🔴';
  if (score < 80) return '🟡';
  return '🟢';
}
