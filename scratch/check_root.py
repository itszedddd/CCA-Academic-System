import sqlite3

try:
    conn = sqlite3.connect('cca.db')
    c = conn.cursor()
    c.execute("SELECT first_name FROM students LIMIT 10")
    print("root cca.db students:", [t[0] for t in c.fetchall()])
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    print("root cca.db tables:", [t[0] for t in c.fetchall()])
    conn.close()
except Exception as e:
    print(e)
