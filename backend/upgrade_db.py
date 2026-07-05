import sqlite3

def upgrade_db():
    conn = sqlite3.connect('aesms.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE announcements ADD COLUMN target_section VARCHAR")
        print("Added target_section to announcements")
    except sqlite3.OperationalError as e:
        print(f"Error adding to announcements: {e}")
        
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN target_section VARCHAR")
        print("Added target_section to events")
    except sqlite3.OperationalError as e:
        print(f"Error adding to events: {e}")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade_db()
