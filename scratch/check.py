import sqlite3
conn = sqlite3.connect('backend/sis.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("sis.db tables:", [t[0] for t in c.fetchall()])
conn.close()

conn2 = sqlite3.connect('backend/cca.db')
c2 = conn2.cursor()
c2.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("cca.db tables:", [t[0] for t in c2.fetchall()])
conn2.close()
