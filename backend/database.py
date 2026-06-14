import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'studyplanner.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # allows dict-like access
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # ── Users ──────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL,
            email         TEXT    UNIQUE NOT NULL,
            goal_minutes  INTEGER DEFAULT 120,
            created_at    TEXT    DEFAULT (datetime('now'))
        )
    """)

    # ── Subjects ───────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            name        TEXT    NOT NULL,
            emoji       TEXT    DEFAULT '📖',
            color       TEXT    DEFAULT '#6c63ff',
            score       REAL    DEFAULT 60,
            exam_date   TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE (user_id, name)
        )
    """)

    # ── Quiz Results ───────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL,
            subject         TEXT    NOT NULL,
            score_pct       REAL    NOT NULL,
            correct         INTEGER NOT NULL,
            total           INTEGER NOT NULL,
            xp_earned       INTEGER DEFAULT 0,
            difficulty      TEXT    DEFAULT 'mixed',
            topic           TEXT,
            time_taken_secs INTEGER DEFAULT 0,
            timestamp       TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # ── Study Sessions ─────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS study_sessions (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id          INTEGER NOT NULL,
            subject          TEXT,
            duration_seconds INTEGER DEFAULT 0,
            attention_score  REAL    DEFAULT 0,
            timestamp        TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # ── Topic Progress (spaced repetition) ─────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS topic_progress (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL,
            subject         TEXT    NOT NULL,
            topic           TEXT    NOT NULL,
            completed       INTEGER DEFAULT 0,
            revision_count  INTEGER DEFAULT 0,
            last_revised    TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE (user_id, subject, topic)
        )
    """)

    # ── Question Attempts (for attention tracking) ─────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS question_attempts (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       INTEGER NOT NULL,
            subject       TEXT    NOT NULL,
            topic         TEXT,
            correct       INTEGER NOT NULL,
            expected_secs INTEGER DEFAULT 30,
            actual_secs   INTEGER DEFAULT 0,
            timestamp     TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialised at", DB_PATH)


# ── Helpers ────────────────────────────────────────────────────────────────

def get_or_create_user(name: str, email: str) -> int:
    """Return user id, creating the record if it doesn't exist."""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = c.fetchone()
    if row:
        uid = row["id"]
        # update name in case it changed
        c.execute("UPDATE users SET name = ? WHERE id = ?", (name, uid))
    else:
        c.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (name, email)
        )
        uid = c.lastrowid
    conn.commit()
    conn.close()
    return uid


def upsert_subject(user_id: int, subj: dict):
    """Insert or update a subject row."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        INSERT INTO subjects (user_id, name, emoji, color, score, exam_date)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, name) DO UPDATE SET
            emoji     = excluded.emoji,
            color     = excluded.color,
            score     = excluded.score,
            exam_date = excluded.exam_date
    """, (
        user_id,
        subj.get("name"),
        subj.get("emoji", "📖"),
        subj.get("color", "#6c63ff"),
        subj.get("score", 60),
        subj.get("examDate", "")
    ))
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()