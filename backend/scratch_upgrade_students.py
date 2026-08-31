import sqlite3

def upgrade_db():
    conn = sqlite3.connect('C:/Users/ender/Programming/Thesis_Project/backend/cca.db')
    cursor = conn.cursor()
    
    new_columns = {
        'gender': 'VARCHAR',
        'date_of_birth': 'VARCHAR',
        'address': 'VARCHAR',
        'parent_name': 'VARCHAR',
        'contact_number': 'VARCHAR'
    }
    
    for col, dtype in new_columns.items():
        try:
            cursor.execute(f"ALTER TABLE students ADD COLUMN {col} {dtype}")
            print(f"Added column {col} to students table.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col} already exists.")
            else:
                print(f"Error adding {col}: {e}")
                
    conn.commit()
    conn.close()
    print("Database upgrade complete.")

if __name__ == "__main__":
    upgrade_db()
