import sqlite3
import os

DB_PATH = 'cca.db'

def main():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE enrollment_forms ADD COLUMN req_hard_copy INTEGER DEFAULT 0")
        print("Added req_hard_copy to enrollment_forms.")
    except sqlite3.OperationalError as e:
        print(f"Error modifying enrollment_forms: {e}")

    try:
        cursor.execute("ALTER TABLE students ADD COLUMN req_hard_copy INTEGER DEFAULT 0")
        print("Added req_hard_copy to students.")
    except sqlite3.OperationalError as e:
        print(f"Error modifying students: {e}")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
