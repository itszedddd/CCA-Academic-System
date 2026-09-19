import sqlite3
import shutil

# Check cca.db.backup
try:
    conn = sqlite3.connect('backend/cca.db.backup')
    c = conn.cursor()
    c.execute("SELECT first_name FROM students LIMIT 10")
    print("cca.db.backup students:", [t[0] for t in c.fetchall()])
    conn.close()
except Exception as e:
    print(e)
