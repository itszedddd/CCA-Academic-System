import sqlite3
conn = sqlite3.connect('cca.db')
c = conn.cursor()
c.execute("PRAGMA table_info(users)")
print("Users table columns:")
for row in c.fetchall():
    print(f"  {row}")
c.execute("SELECT id, username, role FROM users LIMIT 5")
print("\nUsers:")
for row in c.fetchall():
    print(f"  {row}")
conn.close()
