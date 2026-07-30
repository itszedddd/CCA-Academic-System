import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "cca.db")

def migrate():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    columns_to_add = [
        ("assessment_status", "VARCHAR DEFAULT 'Pending'"),
        ("interview_status", "VARCHAR DEFAULT 'Pending'"),
        ("assessment_remarks", "VARCHAR"),
        ("interview_remarks", "VARCHAR"),
        ("assessed_by", "INTEGER"),
        ("interviewed_by", "INTEGER"),
    ]

    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE enrollment_forms ADD COLUMN {col_name} {col_type}")
            print(f"Successfully added column '{col_name}' to enrollment_forms")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column '{col_name}' already exists. Skipping.")
            else:
                print(f"Error adding column '{col_name}': {e}")

    conn.commit()
    conn.close()
    print("Migration completed.")

if __name__ == "__main__":
    migrate()
