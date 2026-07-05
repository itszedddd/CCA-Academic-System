"""
Migration script to create the new announcements and events tables,
and seed them with sample data for demonstration.
"""
import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "cca.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create announcements table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER,
            author_role TEXT,
            created_at TEXT,
            is_pinned INTEGER DEFAULT 0,
            FOREIGN KEY (author_id) REFERENCES users(id)
        )
    """)

    # Create events table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_date TEXT NOT NULL,
            event_time TEXT,
            location TEXT,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    """)

    conn.commit()
    print("[Migration] Tables created: announcements, events")

    # Seed sample announcements
    cursor.execute("SELECT COUNT(*) FROM announcements")
    if cursor.fetchone()[0] == 0:
        now = datetime.now()
        announcements = [
            ("Enrollment for SY 2026-2027 is now open!", "All students and parents are encouraged to submit their enrollment forms online or visit the Admission office.", "Principal", now.isoformat(), 1),
            ("Grade 10 Parents' Meeting", "A mandatory parents' meeting for all Grade 10 students will be held this Friday at 3:00 PM in the Main Hall.", "Registrar", (now - timedelta(days=1)).isoformat(), 0),
            ("Library Schedule Update", "The school library will now be open from 7:00 AM to 5:00 PM on weekdays. Weekend access requires prior arrangement.", "Teacher", (now - timedelta(days=2)).isoformat(), 0),
            ("Academic Excellence Awards Ceremony", "Congratulations to all honors students! The awarding ceremony will be held next Monday during the flag ceremony.", "Principal", (now - timedelta(days=3)).isoformat(), 0),
            ("Uniform Policy Reminder", "All students are reminded to wear the complete school uniform. PE uniforms are only allowed during PE days.", "Registrar", (now - timedelta(days=5)).isoformat(), 0),
        ]
        for title, content, role, created_at, pinned in announcements:
            cursor.execute(
                "INSERT INTO announcements (title, content, author_id, author_role, created_at, is_pinned) VALUES (?, ?, 1, ?, ?, ?)",
                (title, content, role, created_at, pinned)
            )
        conn.commit()
        print(f"[Migration] Seeded {len(announcements)} sample announcements")

    # Seed sample events
    cursor.execute("SELECT COUNT(*) FROM events")
    if cursor.fetchone()[0] == 0:
        today = datetime.now().date()
        events = [
            ("Teacher's Development Program", "Professional development workshop for all faculty members.", (today + timedelta(days=5)).isoformat(), "9:00 AM", "Conference Room A"),
            ("Grade 12 Completion Ceremony", "Graduation ceremony for all Grade 12 completers.", (today + timedelta(days=12)).isoformat(), "1:00 PM", "Main Auditorium"),
            ("End of 4th Quarter", "Last day of classes for the 4th quarter.", (today + timedelta(days=20)).isoformat(), "4:00 PM", "All Campuses"),
            ("Science Fair 2026", "Annual science fair showcasing student projects.", (today + timedelta(days=30)).isoformat(), "8:00 AM", "Gymnasium"),
            ("Parent-Teacher Conference", "Quarterly meeting with parents to discuss student progress.", (today + timedelta(days=7)).isoformat(), "2:00 PM", "Classrooms"),
        ]
        for title, desc, event_date, event_time, location in events:
            cursor.execute(
                "INSERT INTO events (title, description, event_date, event_time, location, created_by) VALUES (?, ?, ?, ?, ?, 1)",
                (title, desc, event_date, event_time, location)
            )
        conn.commit()
        print(f"[Migration] Seeded {len(events)} sample events")

    conn.close()
    print("[Migration] Complete!")


if __name__ == "__main__":
    migrate()
