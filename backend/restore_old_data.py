import sqlite3
import os
import sys

print("Starting migration...")
sis_conn = sqlite3.connect('sis.db')
sis_conn.row_factory = sqlite3.Row
sis_c = sis_conn.cursor()

cca_conn = sqlite3.connect('cca.db')
cca_c = cca_conn.cursor()

# Wipe the mock data
print("Wiping existing data...")
tables_to_wipe = ['users', 'students', 'enrollment_forms', 'academic_records', 'tuition_payments', 'attendance', 'payment_records', 'payment_schedules', 'student_history', 'document_requests']
for t in tables_to_wipe:
    cca_c.execute(f"DELETE FROM {t}")
cca_conn.commit()

def copy_table(table_name, target_table=None):
    if not target_table:
        target_table = table_name
    print(f"Copying {table_name} -> {target_table}...")
    sis_c.execute(f"SELECT * FROM {table_name}")
    rows = sis_c.fetchall()
    if not rows:
        return
    columns = list(rows[0].keys())
    
    cca_c.execute(f"PRAGMA table_info({target_table})")
    cca_cols = [r[1] for r in cca_c.fetchall()]
    
    if table_name == 'payments':
        # Mapping for payments -> tuition_payments
        for row in rows:
            cca_c.execute(
                "INSERT INTO tuition_payments (id, student_id, amount_paid, amount_due, status, term) VALUES (?, ?, ?, ?, ?, ?)",
                (row['id'], row['student_id'], row['amount'], 35000.0, row['status'], "Term 1")
            )
    else:
        valid_cols = [c for c in columns if c in cca_cols]
        placeholders = ",".join(["?" for _ in valid_cols])
        col_names = ",".join(valid_cols)
        query = f"INSERT INTO {target_table} ({col_names}) VALUES ({placeholders})"
        
        for row in rows:
            try:
                cca_c.execute(query, [row[c] for c in valid_cols])
            except Exception as ex:
                print(f"FAILED on row {dict(row)}: {ex}")
                raise
    
    cca_conn.commit()
    print(f"  Copied {len(rows)} rows.")

try:
    # Ensure foreign keys don't block deletion
    cca_c.execute("PRAGMA foreign_keys = OFF")
    
    copy_table('users')
    copy_table('students')
    copy_table('enrollment_forms')
    copy_table('academic_records')
    copy_table('payments', 'tuition_payments')
    
    # Set all restored students to Enrolled
    cca_c.execute("UPDATE students SET enrollment_status = 'Enrolled' WHERE enrollment_status IS NULL OR enrollment_status = ''")
    cca_conn.commit()
    
    cca_c.execute("PRAGMA foreign_keys = ON")

except Exception as e:
    print("Error during migration:", e)
finally:
    sis_conn.close()
    cca_conn.close()

print("Data recovery complete!")
