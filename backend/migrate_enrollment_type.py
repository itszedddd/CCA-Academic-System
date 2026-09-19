import sqlite3
import os

DB_PATH = 'c:/Users/ender/Programming/Thesis_Project/backend/cca.db'

def migrate_db():
    print(f"Connecting to {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Add column to students table
    try:
        c.execute("ALTER TABLE students ADD COLUMN enrollment_type VARCHAR DEFAULT 'Old Student'")
        print("Successfully added enrollment_type to students")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column enrollment_type already exists in students")
        else:
            raise e
            
    # 2. Backfill New Students based on enrollment forms
    print("Backfilling New Students...")
    c.execute("""
        UPDATE students 
        SET enrollment_type = 'New Student'
        WHERE id IN (
            SELECT student_id 
            FROM enrollment_forms 
            WHERE form_type IN ('Student Registration', 'Online Pre-Registration', 'Pre-Registration Application')
            AND student_id IS NOT NULL
        )
    """)
    print(f"Updated {c.rowcount} students to 'New Student'")
    
    conn.commit()
    conn.close()
    print("Migration completed successfully")

if __name__ == '__main__':
    migrate_db()
