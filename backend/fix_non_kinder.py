import sqlite3
conn = sqlite3.connect('c:/Users/ender/Programming/Thesis_Project/backend/cca.db')
cursor = conn.cursor()
cursor.execute("UPDATE students SET grade_level = 'Grade 1', section = 'Love' WHERE first_name || ' ' || last_name IN ('Sam Davis', 'John Moore', 'Laura Anderson', 'Rachel Robinson')")
print(f'Rows updated: {cursor.rowcount}')
conn.commit()
conn.close()
