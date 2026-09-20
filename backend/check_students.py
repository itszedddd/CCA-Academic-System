import sqlite3
conn = sqlite3.connect('c:/Users/ender/Programming/Thesis_Project/backend/cca.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("SELECT id, first_name, last_name, grade_level, section FROM students WHERE last_name IN ('Davis', 'Moore', 'Anderson', 'Robinson')")
for row in cur.fetchall():
    print(dict(row))
conn.close()
