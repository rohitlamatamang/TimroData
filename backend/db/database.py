# database.py - Week 3
# SQLite database connection helpers

import sqlite3
from contextlib import contextmanager

DATABASE_PATH = 'db/timrodata.sqlite3'

@contextmanager
def get_db_connection():
    """
    Context manager for database connections
    
    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM visits")
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    """Initialize database with schema"""
    with open('db/schema.sql', 'r') as f:
        schema = f.read()
    
    with get_db_connection() as conn:
        conn.executescript(schema)
    
    print("Database initialized successfully")
