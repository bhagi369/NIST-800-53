import sqlite3

DB_PATH = "800-53-controls.sqlite"

def test_database_connection():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    conn.close()
    assert ("controls",) in tables

def test_fetch_controls():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT number, title, family FROM controls LIMIT 1;")
    data = cursor.fetchone()
    conn.close()
    assert data is not None
    assert len(data) == 3
