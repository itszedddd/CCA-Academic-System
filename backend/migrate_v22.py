"""Migration script to create new tables for V2.2 inspection report features."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "cca.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create document_requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id),
        document_type TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        date_requested TEXT NOT NULL,
        date_processed TEXT,
        processed_by INTEGER REFERENCES users(id),
        remarks TEXT
    )
    """)
    
    # Create student_history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id),
        action TEXT NOT NULL,
        description TEXT,
        date_recorded TEXT NOT NULL,
        recorded_by INTEGER REFERENCES users(id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("[CCA] Migration complete: document_requests, student_history tables created.")

if __name__ == "__main__":
    migrate()
