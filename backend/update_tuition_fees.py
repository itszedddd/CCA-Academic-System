"""
Update all student tuition records to match the official CCA fee structure.
Uses raw SQL to avoid model column mismatches.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cca.db")

BOOKS_PRICES = {
    "Kinder": 5500, "Kindergarten": 5500,
    "Grade 1": 6900, "Grade 2": 6300, "Grade 3": 6900,
    "Grade 4": 8500, "Grade 5": 8500, "Grade 6": 8500,
    "Grade 7": 9200, "Grade 8": 9200, "Grade 9": 9200, "Grade 10": 9200,
}

def get_energy_fee(grade_level):
    if grade_level in ["Kindergarten", "Kinder", "Pre-K"]:
        return 1500.0  # 150/month * 10
    return 3000.0  # 300/month * 10

def get_tuition_yearly(grade_level, membership_type):
    if grade_level in ["Kindergarten", "Kinder", "Pre-K"]:
        return 16060.0 if membership_type == "CBC Member" else 17060.0
    elif grade_level in ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"]:
        return 17010.0 if membership_type == "CBC Member" else 18010.0
    else:
        return 19060.0 if membership_type == "CBC Member" else 20060.0

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get all non-archived students
    cur.execute("""
        SELECT id, first_name, last_name, grade_level, membership_type
        FROM students 
        WHERE is_archived = 0 
          AND enrollment_status IN ('Enrolled', 'Pre-Registered', 'Pending', 'Pending Validation')
          AND grade_level IS NOT NULL 
          AND grade_level != 'Pending'
    """)
    students = cur.fetchall()

    updated = 0
    created = 0

    for s in students:
        sid = s["id"]
        grade = s["grade_level"]
        membership = s["membership_type"] or "Non-Member"

        reg_fee = 5700.0
        tuition_fee = get_tuition_yearly(grade, membership)
        energy_fee = get_energy_fee(grade)
        books_fee = float(BOOKS_PRICES.get(grade, 8500))
        total_due = reg_fee + tuition_fee + energy_fee + books_fee

        # Check if tuition record exists
        cur.execute("SELECT id, amount_paid FROM tuition_payments WHERE student_id = ?", (sid,))
        existing = cur.fetchone()

        if existing:
            paid = existing["amount_paid"] or 0.0
            status = "Paid" if paid >= total_due else ("Partial" if paid > 0 else "Pending")
            cur.execute("""
                UPDATE tuition_payments SET 
                    reg_fee = ?, tuition_fee = ?, energy_fee = ?, books_fee = ?,
                    esc_subsidy = 0.0, discount = 0.0,
                    amount_due = ?, status = ?, term = 'SY 2026-2027'
                WHERE id = ?
            """, (reg_fee, tuition_fee, energy_fee, books_fee, total_due, status, existing["id"]))
            updated += 1
        else:
            cur.execute("""
                INSERT INTO tuition_payments 
                    (student_id, reg_fee, tuition_fee, energy_fee, books_fee, esc_subsidy, discount,
                     amount_due, amount_paid, term, status, risk_score)
                VALUES (?, ?, ?, ?, ?, 0.0, 0.0, ?, 0.0, 'SY 2026-2027', 'Pending', 0.1)
            """, (sid, reg_fee, tuition_fee, energy_fee, books_fee, total_due))
            created += 1

        print(f"  {s['first_name']} {s['last_name']} ({grade}, {membership}): P{total_due:,.2f}")

    conn.commit()
    conn.close()
    print(f"\nDone! Updated: {updated}, Created: {created}")

if __name__ == "__main__":
    main()
