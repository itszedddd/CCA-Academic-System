import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'cca.db')

def update_db():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if profile_picture exists
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN profile_picture VARCHAR")
        print("Added profile_picture column to users table.")
    except sqlite3.OperationalError as e:
        print(f"profile_picture column might already exist: {e}")
        
    # Check if schedule exists
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN schedule VARCHAR")
        print("Added schedule column to users table.")
    except sqlite3.OperationalError as e:
        print(f"schedule column might already exist: {e}")

    conn.commit()
    conn.close()
    print("Database update complete.")

if __name__ == '__main__':
    update_db()
