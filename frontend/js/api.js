/* ============================================================
   api.js  —  Vortex Frontend API Client
   Connects all pages to the Flask backend at localhost:5000
   Falls back to localStorage when server is offline.
   ============================================================ */

const API_BASE = 'http://localhost:5000';

// ── Core fetch wrapper ────────────────────────────────────────────────────
const API = {

  /** GET request */
  async get(path, params = {}) {
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
    try {
      const res  = await fetch(url.toString(), { headers: { 'Content-Type': 'application/json' } });
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('[API] GET offline:', path, e.message);
      return { success: false, offline: true };
    }
  },

  /** POST request */
  async post(path, body = {}) {
    try {
      const res  = await fetch(API_BASE + path, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('[API] POST offline:', path, e.message);
      return { success: false, offline: true };
    }
  },

  /** PUT request */
  async put(path, body = {}) {
    try {
      const res  = await fetch(API_BASE + path, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.warn('[API] PUT offline:', path, e.message);
      return { success: false, offline: true };
    }
  }
};

// ── User helpers ──────────────────────────────────────────────────────────

/** Get current user_id from localStorage, login if missing */
async function ensureUser() {
  let userId = Store.get('api_user_id', null);
  if (userId) return userId;

  const u = Store.get('vortex_user', null) || {};
  if (!u.email) return null;     // not logged in yet

  const res = await API.post('/api/auth/login', {
    name:  u.name  || 'Student',
    email: u.email || 'student@vortex.app'
  });

  if (res.success) {
    Store.set('api_user_id', res.user_id);
    return res.user_id;
  }
  return null;
}

/** Called from index.html login/register flow */
async function apiLogin(name, email) {
  const res = await API.post('/api/auth/login', { name, email });
  if (res.success) {
    Store.set('api_user_id', res.user_id);
    Store.set('vortex_user', { name, email });
  }
  return res;
}

// ── Subjects ─────────────────────────────────────────────────────────────

async function apiGetSubjects() {
  const uid = await ensureUser();
  if (!uid) return null;
  const res = await API.get('/api/subjects', { user_id: uid });
  if (res.success && res.subjects?.length > 0) {
    // Sync to localStorage for offline use
    Store.set('subjects_data', res.subjects.map(s => ({
      name:     s.name,
      emoji:    s.emoji,
      color:    s.color,
      score:    s.score,
      examDate: s.exam_date,
      topics:   []   // topics come from frontend constant
    })));
  }
  return res;
}

async function apiSaveSubject(subjectObj) {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  return await API.post('/api/subjects', { user_id: uid, ...subjectObj });
}

// ── Quiz ─────────────────────────────────────────────────────────────────

/**
 * Submit completed quiz results to backend for AI analysis.
 * @param {object} quizState  — the global quizState object from quiz.js
 */
async function apiSubmitQuiz(quizState) {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };

  const answers = quizState.answers.map(a => ({
    topic:         a.q?.topic   || quizState.subject,
    correct:       a.correct,
    expected_secs: quizState.timeLimit || 30,
    actual_secs:   quizState.timeLimit
                     ? (quizState.timeLimit - (a.timeLeft || 0))
                     : 30
  }));

  const total   = quizState.questions.length;
  const correct = quizState.score;

  return await API.post('/api/quiz/submit', {
    user_id:        uid,
    subject:        quizState.subject,
    score_pct:      Math.round((correct / total) * 100),
    correct,
    total,
    xp_earned:      quizState.xp,
    difficulty:     quizState.difficulty,
    topic:          quizState.selectedTopic || null,
    time_taken_secs: total * (quizState.timeLimit || 30),
    answers
  });
}

// ── Study Plan ────────────────────────────────────────────────────────────

async function apiGeneratePlan() {
  const uid = await ensureUser();
  if (!uid) return { success: false, error: 'User not logged in' };
  return await API.post('/api/plan/generate', { user_id: uid });
}

// ── Recommendations ───────────────────────────────────────────────────────

async function apiGetRecommendations() {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  return await API.get('/api/recommendations', { user_id: uid });
}

// ── Progress ──────────────────────────────────────────────────────────────

async function apiGetProgress() {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  return await API.get('/api/progress', { user_id: uid });
}

async function apiGetStats() {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  return await API.get('/api/stats', { user_id: uid });
}

// ── Sessions ──────────────────────────────────────────────────────────────

async function apiStartSession(subject) {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  const res = await API.post('/api/session/start', { user_id: uid, subject });
  if (res.success) Store.set('active_session_id', res.session_id);
  return res;
}

async function apiEndSession(durationSecs, attentionScore) {
  const uid       = await ensureUser();
  const sessionId = Store.get('active_session_id', null);
  if (!uid || !sessionId) return { success: false, offline: true };
  const res = await API.post('/api/session/end', {
    user_id:          uid,
    session_id:       sessionId,
    duration_seconds: durationSecs,
    attention_score:  attentionScore
  });
  Store.set('active_session_id', null);
  return res;
}

// ── Revision ──────────────────────────────────────────────────────────────

async function apiGetRevision() {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  return await API.get('/api/revision', { user_id: uid });
}

async function apiMarkTopicDone(subject, topic, completed = true) {
  const uid = await ensureUser();
  if (!uid) return { success: false, offline: true };
  return await API.post('/api/revision/mark', {
    user_id: uid, subject, topic, completed: completed ? 1 : 0
  });
}

// ── API Status indicator ──────────────────────────────────────────────────

async function checkAPIStatus() {
  const res = await API.get('/');
  const dot = document.getElementById('apiStatusDot');
  const lbl = document.getElementById('apiStatusLabel');
  if (res.success) {
    if (dot) { dot.style.background = '#43e97b'; dot.title = 'API Online'; }
    if (lbl) lbl.textContent = 'API Online';
    return true;
  } else {
    if (dot) { dot.style.background = '#ff4d6d'; dot.title = 'API Offline (using local data)'; }
    if (lbl) lbl.textContent = 'Offline Mode';
    return false;
  }
}

// Auto-check on every page load
document.addEventListener('DOMContentLoaded', () => {
  checkAPIStatus();
  ensureUser();   // sync user to backend silently
});
