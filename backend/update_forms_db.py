import sqlite3

def add_columns():
    conn = sqlite3.connect('cca.db')
    cursor = conn.cursor()
    columns_to_add = [
        "req_birth_cert INTEGER DEFAULT 0",
        "req_form_138 INTEGER DEFAULT 0",
        "req_good_moral INTEGER DEFAULT 0",
        "req_pictures INTEGER DEFAULT 0"
    ]
    for col in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE enrollment_forms ADD COLUMN {col};")
            print(f"Added column {col}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                pass
            else:
                print(f"Error adding {col}: {e}")
    conn.commit()
    conn.close()
    print("Database alteration complete.")

if __name__ == '__main__':
    add_columns()
