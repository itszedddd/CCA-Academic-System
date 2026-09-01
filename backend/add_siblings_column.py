import sqlite3

try:
    conn = sqlite3.connect('cca.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE enrollment_forms ADD COLUMN siblings VARCHAR")
    conn.commit()
    print("Column added successfully to cca.db.")
except sqlite3.OperationalError as e:
    print(f"Error: {e}")
finally:
    conn.close()
