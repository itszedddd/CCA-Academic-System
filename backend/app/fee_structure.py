# fee_structure.py
# CCA Fee Structure for SY 2026-2027

FEE_STRUCTURE = {
    "Kindergarten": {
        "Registration & Misc": 5700,
        "Tuition (CBC Monthly)": 1606,
        "Tuition (CBC Yearly)": 16060,
        "Tuition (Non-Member Monthly)": 1706,
        "Tuition (Non-Member Yearly)": 17060,
        "Energy Fee (Monthly)": 150,
        "Books": 5500
    },
    "Grade 1-6": {
        "Registration & Misc": 5700,
        "Tuition (CBC Monthly)": 1701,
        "Tuition (CBC Yearly)": 17010,
        "Tuition (Non-Member Monthly)": 1801,
        "Tuition (Non-Member Yearly)": 18010,
        "Energy Fee (Monthly)": 300,
        "Books": 7500 # Average of 6300-8500
    },
    "Grade 7-10": {
        "Registration & Misc": 5700,
        "Tuition (CBC Monthly)": 1906,
        "Tuition (CBC Yearly)": 19060,
        "Tuition (Non-Member Monthly)": 2006,
        "Tuition (Non-Member Yearly)": 20060,
        "Energy Fee (Monthly)": 300,
        "Books": 9200
    }
}

def get_fee_category(grade_level: str) -> str:
    if grade_level == "Kindergarten" or grade_level == "Pre-K":
        return "Kindergarten"
    elif grade_level in ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"]:
        return "Grade 1-6"
    elif grade_level in ["Grade 7", "Grade 8", "Grade 9", "Grade 10"]:
        return "Grade 7-10"
    return "Grade 1-6" # Default

def compute_total_fees(grade_level: str, membership_type: str, include_books: bool = False, full_payment: bool = False) -> dict:
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
    books = fees["Books"] if include_books else 0
    
    total = reg_fee + tuition + energy_fee_yearly + books
    
    discount = 0
    if full_payment:
        discount = total * 0.05 # 5% cash discount for full payment
        
    esc_subsidy = 0
    if grade_level == "Grade 7":
        esc_subsidy = 9000 # Example ESC subsidy
        
    final_total = total - discount - esc_subsidy
    
    return {
        "Registration & Misc": reg_fee,
        "Tuition": tuition,
        "Monthly Tuition": monthly_tuition,
        "Energy Fee (Yearly)": energy_fee_yearly,
        "Books": books,
        "Subtotal": total,
        "Discount": discount,
        "ESC Subsidy": esc_subsidy,
        "Final Total": final_total
    }
