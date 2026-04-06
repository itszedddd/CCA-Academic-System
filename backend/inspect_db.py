import sqlite3
import os

def inspect_db(db_path):
    if not os.path.exists(db_path):
        print(f"{os.path.basename(db_path)} does not exist.")
        return
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"\n--- Database: {os.path.basename(db_path)} ({os.path.getsize(db_path)} bytes) ---")
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"\nTable: => {table_name} <= (Rows: {count})")
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            rows = cursor.fetchall()
            cursor.execute(f"PRAGMA table_info({table_name})")
            cols = [col[1] for col in cursor.fetchall()]
            print(f"  Columns: {', '.join(cols)}")
            for row in rows:
                print(f"  Row: {row}")
    conn.close()

inspect_db('cca.db')
inspect_db('sis.db')
