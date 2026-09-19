import sqlite3

conn = sqlite3.connect('backend/cca.db')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM students")
print("cca.db students count:", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM tuition_payments")
print("cca.db tuition_payments count:", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM payment_records")
print("cca.db payment_records count:", c.fetchone()[0])

c.execute("SELECT first_name FROM students LIMIT 5")
print("cca.db students:", [t[0] for t in c.fetchall()])

conn.close()
