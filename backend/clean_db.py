import sqlite3

def clean_orphaned_records():
    conn = sqlite3.connect('cca.db')
    c = conn.cursor()
    
    tables_with_student_id = [
        'academic_records',
        'tuition_payments',
        'student_clearance',
        'academic_warning_remarks',
        'attendance',
        'payment_records',
        'payment_schedules',
        'student_history'
    ]
    
    for table in tables_with_student_id:
        try:
            c.execute(f"DELETE FROM {table} WHERE student_id != 5")
            print(f"Deleted orphaned records from {table}")
        except sqlite3.OperationalError as e:
            print(f"Error on table {table}: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    clean_orphaned_records()
