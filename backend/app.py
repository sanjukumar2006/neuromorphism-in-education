"""
app.py  —  Vortex Adaptive Study Planner  —  Flask REST API
Connects Frontend ↔ Backend ↔ AI Models
"""

import sys
import os

# ── Make sure project root is on path so imports work ──────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS

from backend.database import (
    init_db, get_db,
    get_or_create_user, upsert_subject
)

# AI Models
from ai_models.learning_score   import calculate_learning_score
from ai_models.scheduler        import generate_schedule
from ai_models.priority_calculator import calculate_priority, get_priority_label

# Backend Engines
from backend.attention_tracker  import AttentionTracker
from backend.recommendation_engine import RecommendationEngine
from backend.revision_engine    import RevisionEngine
from backend.planner            import generate_plan, get_priority, get_study_time

# ── App setup ──────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins="*")          # allow all origins for local dev

recommendation_engine = RecommendationEngine()
revision_engine       = RevisionEngine()

# ── Utility ───────────────────────────────────────────────────────────────

def ok(data: dict, code: int = 200):
    return jsonify({"success": True,  **data}), code

def err(msg: str, code: int = 400):
    return jsonify({"success": False, "error": msg}), code

def uid_from_req():
    """Extract user_id from request body or query-string."""
    if request.is_json and request.json:
        return request.json.get("user_id")
    return request.args.get("user_id", type=int)

# ══════════════════════════════════════════════════════════════════════════
# 1.  HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════

@app.route("/")
@app.route("/api")
def health():
    return ok({"message": "Vortex API is running 🚀", "version": "2.0"})


# ══════════════════════════════════════════════════════════════════════════
# 2.  AUTH — Login / Register
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    Body: { name, email }
    Returns: { user_id, name, email }
    """
    data = request.json or {}
    name  = data.get("name",  "Student")
    email = data.get("email", "")

    if not email:
        return err("Email is required")

    user_id = get_or_create_user(name, email)

    # Seed default Class-12 subjects for brand-new users
    conn = get_db()
    existing = conn.execute(
        "SELECT COUNT(*) as cnt FROM subjects WHERE user_id = ?", (user_id,)
    ).fetchone()["cnt"]
    conn.close()

    if existing == 0:
        _seed_default_subjects(user_id)

    return ok({"user_id": user_id, "name": name, "email": email})


def _seed_default_subjects(user_id: int):
    defaults = [
        {"name": "Mathematics",     "emoji": "📐", "color": "#6c63ff", "score": 65, "examDate": "2026-07-15"},
        {"name": "Physics",         "emoji": "⚛️", "color": "#ff6584", "score": 72, "examDate": "2026-07-20"},
        {"name": "Chemistry",       "emoji": "🧪", "color": "#43e97b", "score": 58, "examDate": "2026-07-18"},
        {"name": "Biology",         "emoji": "🌿", "color": "#06d6a0", "score": 70, "examDate": "2026-07-22"},
        {"name": "Computer Science","emoji": "💻", "color": "#00c9ff", "score": 88, "examDate": "2026-07-25"},
        {"name": "English",         "emoji": "📚", "color": "#f7971e", "score": 80, "examDate": "2026-07-10"},
        {"name": "Accountancy",     "emoji": "📒", "color": "#a855f7", "score": 62, "examDate": "2026-07-12"},
        {"name": "Economics",       "emoji": "📊", "color": "#f59e0b", "score": 67, "examDate": "2026-07-17"},
    ]
    for s in defaults:
        upsert_subject(user_id, s)


# ══════════════════════════════════════════════════════════════════════════
# 3.  SUBJECTS
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/subjects", methods=["GET"])
def get_subjects():
    """GET /api/subjects?user_id=1"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return err("user_id required")

    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM subjects WHERE user_id = ? ORDER BY name", (user_id,)
    ).fetchall()
    conn.close()

    subjects = [dict(r) for r in rows]
    return ok({"subjects": subjects})


@app.route("/api/subjects", methods=["POST"])
def add_subject():
    """
    Body: { user_id, name, emoji, color, score, examDate }
    """
    data = request.json or {}
    user_id = data.get("user_id")
    if not user_id:
        return err("user_id required")

    upsert_subject(user_id, data)
    return ok({"message": f"Subject '{data.get('name')}' saved"}, 201)


@app.route("/api/subjects/<name>", methods=["PUT"])
def update_subject_score(name):
    """PATCH score for a subject: { user_id, score }"""
    data = request.json or {}
    user_id = data.get("user_id")
    score   = data.get("score")
    if not user_id or score is None:
        return err("user_id and score required")

    conn = get_db()
    conn.execute(
        "UPDATE subjects SET score = ? WHERE user_id = ? AND name = ?",
        (score, user_id, name)
    )
    conn.commit()
    conn.close()
    return ok({"message": "Score updated"})


# ══════════════════════════════════════════════════════════════════════════
# 4.  QUIZ
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    """
    Body: {
        user_id, subject, score_pct, correct, total, xp_earned,
        difficulty, topic, time_taken_secs,
        answers: [{topic, correct, expected_secs, actual_secs}, ...]
    }
    Returns: { learning_score, attention_score, exam_readiness, recommendations }
    """
    data = request.json or {}
    user_id        = data.get("user_id")
    subject        = data.get("subject", "Unknown")
    score_pct      = float(data.get("score_pct", 0))
    correct        = int(data.get("correct", 0))
    total          = int(data.get("total", 1))
    xp_earned      = int(data.get("xp_earned", 0))
    difficulty     = data.get("difficulty", "mixed")
    topic          = data.get("topic")
    time_taken     = int(data.get("time_taken_secs", 0))
    answers        = data.get("answers", [])

    if not user_id:
        return err("user_id required")

    conn = get_db()

    # Save quiz result
    conn.execute("""
        INSERT INTO quiz_results
            (user_id, subject, score_pct, correct, total, xp_earned, difficulty, topic, time_taken_secs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, subject, score_pct, correct, total, xp_earned, difficulty, topic, time_taken))

    # Save individual question attempts for attention tracking
    for a in answers:
        conn.execute("""
            INSERT INTO question_attempts
                (user_id, subject, topic, correct, expected_secs, actual_secs)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id, subject,
            a.get("topic", topic),
            1 if a.get("correct") else 0,
            a.get("expected_secs", 30),
            a.get("actual_secs", 30)
        ))

    # Update subject score (running average)
    subj_row = conn.execute(
        "SELECT score FROM subjects WHERE user_id = ? AND name = ?",
        (user_id, subject)
    ).fetchone()
    if subj_row:
        old_score = subj_row["score"]
        new_score = round(0.6 * old_score + 0.4 * score_pct, 1)
        conn.execute(
            "UPDATE subjects SET score = ? WHERE user_id = ? AND name = ?",
            (new_score, user_id, subject)
        )

    conn.commit()

    # ── AI Computations ───────────────────────────────────────────────
    # 1. Attention score from answer timing
    tracker = AttentionTracker()
    for a in answers:
        tracker.add_question_attempt(
            topic         = a.get("topic", subject),
            expected_time = a.get("expected_secs", 30),
            actual_time   = a.get("actual_secs", 30),
            correct       = bool(a.get("correct", False))
        )
    attention_score = tracker.calculate_attention_score() if answers else 70.0
    topic_analysis  = tracker.get_topic_analysis() if answers else {}

    # 2. Revision score (% revisions completed) from DB
    rev_row = conn.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN revision_count > 0 THEN 1 ELSE 0 END) as done
        FROM topic_progress WHERE user_id = ?
    """, (user_id,)).fetchone()
    revision_rate = 0
    if rev_row and rev_row["total"] > 0:
        revision_rate = round((rev_row["done"] / rev_row["total"]) * 100, 1)

    # 3. Learning score (AI model)
    learning_score = calculate_learning_score(
        quiz_score    = score_pct,
        revision_rate = revision_rate,
        focus_score   = attention_score
    )

    # 4. Exam readiness
    exam_readiness = recommendation_engine.exam_readiness(learning_score)

    # 5. Recommendations
    recommendations = recommendation_engine.generate_recommendations(
        learning_score, topic_analysis
    )

    conn.close()

    return ok({
        "learning_score":   learning_score,
        "attention_score":  round(attention_score, 1),
        "exam_readiness":   exam_readiness,
        "recommendations":  recommendations,
        "updated_score":    new_score if subj_row else score_pct
    })


# ══════════════════════════════════════════════════════════════════════════
# 5.  STUDY PLAN GENERATION  (AI Scheduler)
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/plan/generate", methods=["POST"])
def generate_ai_plan():
    """
    Body: { user_id }
    Reads subjects from DB, computes priority via AI, returns schedule.
    """
    data    = request.json or {}
    user_id = data.get("user_id")
    if not user_id:
        return err("user_id required")

    conn = get_db()
    subjects = conn.execute(
        "SELECT * FROM subjects WHERE user_id = ?", (user_id,)
    ).fetchall()

    from datetime import datetime
    today = datetime.now().date()

    topics_input = []
    for s in subjects:
        # Days since last quiz for this subject
        last_row = conn.execute("""
            SELECT timestamp FROM quiz_results
            WHERE user_id = ? AND subject = ?
            ORDER BY timestamp DESC LIMIT 1
        """, (user_id, s["name"])).fetchone()

        days_since = 7  # default
        if last_row:
            try:
                last_dt = datetime.fromisoformat(last_row["timestamp"])
                days_since = (datetime.now() - last_dt).days
            except Exception:
                pass

        # Exam weight: closer exam → higher weight
        exam_weight = 50
        if s["exam_date"]:
            try:
                exam_dt = datetime.strptime(s["exam_date"], "%Y-%m-%d").date()
                days_to_exam = (exam_dt - today).days
                if days_to_exam <= 0:
                    exam_weight = 100
                elif days_to_exam <= 7:
                    exam_weight = 90
                elif days_to_exam <= 14:
                    exam_weight = 75
                elif days_to_exam <= 30:
                    exam_weight = 60
                else:
                    exam_weight = 40
            except Exception:
                pass

        # mistake_rate = 100 - score
        mistake_rate = max(0, 100 - float(s["score"]))

        topics_input.append({
            "name":                s["name"],
            "mistake_rate":        round(mistake_rate, 1),
            "days_since_revision": days_since,
            "exam_weight":         exam_weight
        })

    conn.close()

    schedule = generate_schedule(topics_input)

    # Add emoji / color from subject data
    subj_meta = {s["name"]: dict(s) for s in subjects}
    for item in schedule:
        meta = subj_meta.get(item["topic"], {})
        item["emoji"]     = meta.get("emoji", "📖")
        item["color"]     = meta.get("color", "#6c63ff")
        item["score"]     = meta.get("score", 60)
        item["exam_date"] = meta.get("exam_date", "")

    return ok({"schedule": schedule, "total_subjects": len(schedule)})


@app.route("/api/plan", methods=["GET"])
def get_plan():
    """GET /api/plan?user_id=1 — return cached/simple plan"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return err("user_id required")

    conn = get_db()
    subjects = conn.execute(
        "SELECT * FROM subjects WHERE user_id = ?", (user_id,)
    ).fetchall()
    conn.close()

    subj_list = [{"name": s["name"], "score": s["score"]} for s in subjects]
    plan = generate_plan(subj_list)

    return ok({"plan": plan})


# ══════════════════════════════════════════════════════════════════════════
# 6.  RECOMMENDATIONS
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    """GET /api/recommendations?user_id=1"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return err("user_id required")

    conn = get_db()

    # Average quiz score
    avg_row = conn.execute("""
        SELECT AVG(score_pct) as avg_score, AVG(time_taken_secs) as avg_time
        FROM quiz_results WHERE user_id = ?
    """, (user_id,)).fetchone()
    avg_score = avg_row["avg_score"] or 60

    # Attention score from recent attempts
    attempts = conn.execute("""
        SELECT topic, correct, expected_secs, actual_secs
        FROM question_attempts WHERE user_id = ?
        ORDER BY timestamp DESC LIMIT 50
    """, (user_id,)).fetchall()

    tracker = AttentionTracker()
    for a in attempts:
        tracker.add_question_attempt(
            topic         = a["topic"] or "General",
            expected_time = a["expected_secs"],
            actual_time   = a["actual_secs"],
            correct       = bool(a["correct"])
        )
    attention = tracker.calculate_attention_score() if attempts else 70
    topic_analysis = tracker.get_topic_analysis() if attempts else {}

    # Revision rate
    rev_row = conn.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN revision_count > 0 THEN 1 ELSE 0 END) as done
        FROM topic_progress WHERE user_id = ?
    """, (user_id,)).fetchone()
    revision_rate = 0
    if rev_row and rev_row["total"]:
        revision_rate = round((rev_row["done"] / rev_row["total"]) * 100, 1)

    learning_score = calculate_learning_score(avg_score, revision_rate, attention)
    exam_readiness = recommendation_engine.exam_readiness(learning_score)
    recs = recommendation_engine.generate_recommendations(learning_score, topic_analysis)
    study_plan = recommendation_engine.create_study_plan(topic_analysis) if topic_analysis else []

    # Priority subjects
    subjects = conn.execute(
        "SELECT name, score, emoji, color FROM subjects WHERE user_id = ? ORDER BY score ASC LIMIT 3",
        (user_id,)
    ).fetchall()
    priority_subjects = [dict(s) for s in subjects]

    conn.close()

    return ok({
        "learning_score":    round(learning_score, 1),
        "attention_score":   round(attention, 1),
        "revision_rate":     revision_rate,
        "exam_readiness":    exam_readiness,
        "recommendations":   recs,
        "study_plan":        study_plan,
        "priority_subjects": priority_subjects
    })


# ══════════════════════════════════════════════════════════════════════════
# 7.  STUDY SESSIONS
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/session/start", methods=["POST"])
def start_session():
    """Body: { user_id, subject }"""
    data = request.json or {}
    user_id = data.get("user_id")
    subject = data.get("subject", "General")
    if not user_id:
        return err("user_id required")

    conn = get_db()
    conn.execute(
        "INSERT INTO study_sessions (user_id, subject) VALUES (?, ?)",
        (user_id, subject)
    )
    session_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()["id"]
    conn.commit()
    conn.close()

    return ok({"session_id": session_id, "message": "Session started"}, 201)


@app.route("/api/session/end", methods=["POST"])
def end_session():
    """
    Body: { user_id, session_id, duration_seconds, attention_score }
    """
    data            = request.json or {}
    user_id         = data.get("user_id")
    session_id      = data.get("session_id")
    duration_secs   = int(data.get("duration_seconds", 0))
    attention_score = float(data.get("attention_score", 0))

    if not user_id:
        return err("user_id required")

    conn = get_db()
    conn.execute("""
        UPDATE study_sessions
        SET duration_seconds = ?, attention_score = ?
        WHERE id = ? AND user_id = ?
    """, (duration_secs, attention_score, session_id, user_id))
    conn.commit()
    conn.close()

    return ok({
        "message":       "Session saved",
        "duration_mins": round(duration_secs / 60, 1)
    })


# ══════════════════════════════════════════════════════════════════════════
# 8.  PROGRESS / ANALYTICS
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/progress", methods=["GET"])
def get_progress():
    """GET /api/progress?user_id=1"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return err("user_id required")

    conn = get_db()

    # Total study hours
    hours_row = conn.execute("""
        SELECT COALESCE(SUM(duration_seconds),0) as total_secs
        FROM study_sessions WHERE user_id = ?
    """, (user_id,)).fetchone()
    total_hours = round(hours_row["total_secs"] / 3600, 1)

    # Quiz stats
    quiz_row = conn.execute("""
        SELECT COUNT(*) as total_quizzes,
               COALESCE(AVG(score_pct),0) as avg_score,
               COALESCE(SUM(correct),0) as total_correct,
               COALESCE(SUM(total),0)   as total_questions
        FROM quiz_results WHERE user_id = ?
    """, (user_id,)).fetchone()

    # Attention
    att_row = conn.execute("""
        SELECT COALESCE(AVG(attention_score),0) as avg_attention
        FROM study_sessions WHERE user_id = ? AND attention_score > 0
    """, (user_id,)).fetchone()

    # Weekly activity (last 7 days)
    weekly = conn.execute("""
        SELECT date(timestamp) as day,
               ROUND(SUM(duration_seconds)/3600.0, 2) as hours
        FROM study_sessions
        WHERE user_id = ?
          AND timestamp >= datetime('now', '-7 days')
        GROUP BY date(timestamp)
        ORDER BY day
    """, (user_id,)).fetchall()
    weekly_data = [{"day": r["day"], "hours": r["hours"]} for r in weekly]

    # Subject performance
    subjects = conn.execute("""
        SELECT s.name, s.emoji, s.color, s.score,
               COUNT(q.id) as quiz_count,
               COALESCE(AVG(q.score_pct),0) as avg_quiz
        FROM subjects s
        LEFT JOIN quiz_results q ON q.user_id = s.user_id AND q.subject = s.name
        WHERE s.user_id = ?
        GROUP BY s.name
        ORDER BY s.score DESC
    """, (user_id,)).fetchall()
    subject_data = [dict(s) for s in subjects]

    # Streak calculation
    streak_row = conn.execute("""
        SELECT COUNT(DISTINCT date(timestamp)) as streak_days
        FROM study_sessions
        WHERE user_id = ?
          AND timestamp >= datetime('now', '-30 days')
    """, (user_id,)).fetchone()
    streak = streak_row["streak_days"] if streak_row else 0

    conn.close()

    return ok({
        "total_hours":       total_hours,
        "total_quizzes":     quiz_row["total_quizzes"],
        "avg_score":         round(quiz_row["avg_score"], 1),
        "total_questions":   quiz_row["total_questions"],
        "avg_attention":     round(att_row["avg_attention"], 1),
        "streak_days":       streak,
        "weekly_activity":   weekly_data,
        "subjects":          subject_data
    })


# ══════════════════════════════════════════════════════════════════════════
# 9.  REVISION SCHEDULE  (Spaced Repetition)
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/revision", methods=["GET"])
def get_revision_schedule():
    """GET /api/revision?user_id=1"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return err("user_id required")

    conn = get_db()
    topics = conn.execute("""
        SELECT subject, topic, revision_count, last_revised
        FROM topic_progress
        WHERE user_id = ? AND completed = 1
        ORDER BY revision_count ASC, last_revised ASC
    """, (user_id,)).fetchall()
    conn.close()

    from datetime import datetime
    schedule = []
    for t in topics:
        next_date = revision_engine.get_next_revision_date(
            max(1, t["revision_count"])
        )
        days_since = 0
        if t["last_revised"]:
            try:
                last = datetime.fromisoformat(t["last_revised"])
                days_since = (datetime.now() - last).days
            except Exception:
                pass

        priority = revision_engine.get_revision_priority(days_since)

        schedule.append({
            "subject":        t["subject"],
            "topic":          t["topic"],
            "revision_count": t["revision_count"],
            "next_revision":  next_date.strftime("%Y-%m-%d"),
            "days_since":     days_since,
            "priority":       priority
        })

    # Sort: HIGH first
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    schedule.sort(key=lambda x: order.get(x["priority"], 3))

    return ok({"revision_schedule": schedule, "total": len(schedule)})


@app.route("/api/revision/mark", methods=["POST"])
def mark_topic_revised():
    """
    Body: { user_id, subject, topic, completed }
    """
    data       = request.json or {}
    user_id    = data.get("user_id")
    subject    = data.get("subject")
    topic      = data.get("topic")
    completed  = int(data.get("completed", 1))

    if not all([user_id, subject, topic]):
        return err("user_id, subject, topic required")

    conn = get_db()
    conn.execute("""
        INSERT INTO topic_progress (user_id, subject, topic, completed, revision_count, last_revised)
        VALUES (?, ?, ?, ?, 1, datetime('now'))
        ON CONFLICT(user_id, subject, topic) DO UPDATE SET
            completed      = excluded.completed,
            revision_count = revision_count + 1,
            last_revised   = datetime('now')
    """, (user_id, subject, topic, completed))
    conn.commit()
    conn.close()

    return ok({"message": f"Topic '{topic}' marked", "completed": bool(completed)})


# ══════════════════════════════════════════════════════════════════════════
# 10.  USER STATS SUMMARY
# ══════════════════════════════════════════════════════════════════════════

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """GET /api/stats?user_id=1  —  lightweight dashboard stats"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return err("user_id required")

    conn = get_db()

    # Today's study time
    today_row = conn.execute("""
        SELECT COALESCE(SUM(duration_seconds), 0) as secs
        FROM study_sessions
        WHERE user_id = ? AND date(timestamp) = date('now')
    """, (user_id,)).fetchone()

    # Quiz accuracy this week
    acc_row = conn.execute("""
        SELECT COALESCE(AVG(score_pct), 0) as avg
        FROM quiz_results
        WHERE user_id = ? AND timestamp >= datetime('now', '-7 days')
    """, (user_id,)).fetchone()

    # Topics completed
    topics_row = conn.execute("""
        SELECT COUNT(*) as cnt FROM topic_progress
        WHERE user_id = ? AND completed = 1
    """, (user_id,)).fetchone()

    # Streak
    streak_row = conn.execute("""
        SELECT COUNT(DISTINCT date(timestamp)) as days
        FROM study_sessions
        WHERE user_id = ? AND timestamp >= datetime('now', '-30 days')
    """, (user_id,)).fetchone()

    # Total XP (10 per correct answer)
    xp_row = conn.execute("""
        SELECT COALESCE(SUM(xp_earned), 0) as total_xp
        FROM quiz_results WHERE user_id = ?
    """, (user_id,)).fetchone()

    conn.close()

    today_mins = round(today_row["secs"] / 60, 1)
    today_h = int(today_mins // 60)
    today_m = int(today_mins % 60)

    return ok({
        "today_studied":    f"{today_h}h {today_m}m" if today_h else f"{today_m}m",
        "today_secs":       today_row["secs"],
        "quiz_accuracy":    round(acc_row["avg"], 1),
        "topics_completed": topics_row["cnt"],
        "streak_days":      streak_row["days"],
        "total_xp":         xp_row["total_xp"]
    })


# ══════════════════════════════════════════════════════════════════════════
# RUN
# ══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    init_db()
    print("🚀  Vortex API starting on http://localhost:5000")
    app.run(debug=True, port=5000, host="0.0.0.0")