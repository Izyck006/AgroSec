import sqlite3
from contextlib import contextmanager

from config import DB_FILENAME

ALERTS_TABLE_SQL = """
    CREATE TABLE IF NOT EXISTS alerts_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        intruderType TEXT,
        confidence REAL,
        imageData TEXT,
        timestamp TEXT,
        status TEXT
    )
"""


@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_FILENAME)
    try:
        yield conn
    finally:
        conn.close()


def init_local_db():
    try:
        with get_db_connection() as conn:
            conn.cursor().execute(ALERTS_TABLE_SQL)
            conn.commit()
        print("[INFO] Local SQLite Cache Initialized.")
    except Exception as e:
        print(f"[ERROR] Could not initialize SQLite database: {e}")


def save_alert(payload):
    print(f"[BACKUP] Writing alert ({payload['intruderType']}) to database.")
    try:
        with get_db_connection() as conn:
            conn.cursor().execute(
                "INSERT INTO alerts_cache (intruderType, confidence, imageData, timestamp, status) VALUES (?, ?, ?, ?, ?)",
                (
                    payload["intruderType"],
                    payload["confidence"],
                    payload["imageData"],
                    payload["timestamp"],
                    payload.get("status"),
                ),
            )
            conn.commit()
    except Exception as e:
        print(f"[ERROR] Critical error writing to SQLite cache: {e}")


def fetch_pending_alerts(limit=5):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, intruderType, confidence, imageData, timestamp, status FROM alerts_cache ORDER BY timestamp ASC LIMIT ?",
            (limit,),
        )
        return cursor.fetchall()


def delete_alert(conn, row_id):
    conn.cursor().execute("DELETE FROM alerts_cache WHERE id=?", (row_id,))
    conn.commit()
