import sqlite3
conn = sqlite3.connect('c:/Users/ender/Programming/Thesis_Project/backend/cca.db')
cursor = conn.cursor()
cursor.execute("UPDATE students SET section = 'Kindness' WHERE grade_level = 'Kinder' AND section IS NULL")
print(f'Rows updated: {cursor.rowcount}')
conn.commit()
conn.close()
