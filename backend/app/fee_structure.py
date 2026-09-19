# fee_structure.py
# CCA Fee Structure for SY 2026-2027
# Based on official CCA payment guidelines

FEE_STRUCTURE = {
    "Kindergarten": {
        "Registration & Misc": 5700,
        "Tuition (CBC Monthly)": 1606,
        "Tuition (CBC Yearly)": 16060,
        "Tuition (Non-Member Monthly)": 1706,
        "Tuition (Non-Member Yearly)": 17060,
        "Energy Fee (Monthly)": 150,
    },
    "Grade 1-6": {
        "Registration & Misc": 5700,
        "Tuition (CBC Monthly)": 1701,
        "Tuition (CBC Yearly)": 17010,
        "Tuition (Non-Member Monthly)": 1801,
        "Tuition (Non-Member Yearly)": 18010,
        "Energy Fee (Monthly)": 300,
    },
    "Grade 7-10": {
        "Registration & Misc": 5700,
        "Tuition (CBC Monthly)": 1906,
        "Tuition (CBC Yearly)": 19060,
        "Tuition (Non-Member Monthly)": 2006,
        "Tuition (Non-Member Yearly)": 20060,
        "Energy Fee (Monthly)": 300,
    }
}

# Books Price: SY 2026-2027 (per grade, from CCA official rates)
BOOKS_PRICES = {
    "Kinder": 5500,
    "Kindergarten": 5500,
    "Grade 1": 6900,
    "Grade 2": 6300,
    "Grade 3": 6900,
    "Grade 4": 8500,
    "Grade 5": 8500,
    "Grade 6": 8500,
    "Grade 7": 9200,
    "Grade 8": 9200,
    "Grade 9": 9200,
    "Grade 10": 9200,
}

# Total for one year (books NOT included):
#   Kinder:             24,260
#   Grade 1 to Grade 6: 26,710
#   Grade 7 to Grade 10: 28,760

# Requirements for Admission per Grade Level
ADMISSION_REQUIREMENTS = {
    "Kinder": [
        "CCA Assessment Test",
        "2 PSA Photocopy of Birth Certificate",
        "ECCD",
        "Administration Interview with Parents and Students",
    ],
    "Grade 1": [
        "CCA Assessment Test",
        "2 PSA Photocopy of Birth Certificate",
        "ECCD",
        "Card for Transferee",
        "Administration Interview with Parents and Students",
    ],
    "Grade 2": [
        "CCA Assessment Test",
        "2 PSA Photocopy of Birth Certificate",
        "SF9 (Card)",
        "Card for Transferee",
        "Administration Interview with Parents and Students",
    ],
    # Grades 3-10 share the same requirements as Grade 2
}
# Fill in Grades 3-10 with the same requirements as Grade 2
for g in range(3, 11):
    ADMISSION_REQUIREMENTS[f"Grade {g}"] = ADMISSION_REQUIREMENTS["Grade 2"]
ADMISSION_REQUIREMENTS["Kindergarten"] = ADMISSION_REQUIREMENTS["Kinder"]


def get_fee_category(grade_level: str) -> str:
    if grade_level in ["Kindergarten", "Kinder", "Pre-K", "Pre-Kinder"]:
        return "Kindergarten"
    elif grade_level in ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"]:
        return "Grade 1-6"
    elif grade_level in ["Grade 7", "Grade 8", "Grade 9", "Grade 10"]:
        return "Grade 7-10"
    return "Grade 1-6"  # Default


def get_books_price(grade_level: str) -> float:
    return BOOKS_PRICES.get(grade_level, 8500)


def compute_total_fees(grade_level: str, membership_type: str = "Non-Member", include_books: bool = True, full_payment: bool = False) -> dict:
    category = get_fee_category(grade_level)
    fees = FEE_STRUCTURE[category]

    reg_fee = fees["Registration & Misc"]

    if membership_type == "CBC Member":
        tuition = fees["Tuition (CBC Yearly)"]
        monthly_tuition = fees["Tuition (CBC Monthly)"]
    else:
        tuition = fees["Tuition (Non-Member Yearly)"]
        monthly_tuition = fees["Tuition (Non-Member Monthly)"]

    energy_fee_yearly = fees["Energy Fee (Monthly)"] * 10
    books = get_books_price(grade_level) if include_books else 0

    subtotal_without_books = reg_fee + tuition + energy_fee_yearly
    total = subtotal_without_books + books

    discount = 0
    if full_payment:
        discount = tuition * 0.05  # 5% cash discount on tuition fee paid in full by May 30

    esc_subsidy = 0
    # Grade 7 students who graduated from a public school (Grade 6) are eligible for ESC Subsidy
    if grade_level == "Grade 7":
        esc_subsidy = 9000

    final_total = total - discount - esc_subsidy

    return {
        "Registration & Misc": reg_fee,
        "Tuition": tuition,
        "Monthly Tuition": monthly_tuition,
        "Energy Fee (Yearly)": energy_fee_yearly,
        "Books": books,
        "Subtotal (without books)": subtotal_without_books,
        "Subtotal": total,
        "Discount": discount,
        "ESC Subsidy": esc_subsidy,
        "Final Total": final_total,
    }

