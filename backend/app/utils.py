import re
from datetime import datetime


def validate_required_fields(data: dict, required: list[str]) -> list[str]:
    """
    Checks that every key in `required` exists in `data` and is non-empty.
    Returns a list of missing/empty field names.
    """
    missing = []
    for field in required:
        val = data.get(field)
        if val is None or (isinstance(val, str) and val.strip() == ""):
            missing.append(field)
    return missing


def check_duplicate_student(db, Student, first_name: str, last_name: str):
    """
    Returns the existing Student row if a student with the same first+last name
    already exists, otherwise None.
    """
    return (
        db.query(Student)
        .filter(
            Student.first_name == first_name.strip(),
            Student.last_name == last_name.strip(),
        )
        .first()
    )


def validate_phone(phone: str) -> bool:
    """Basic Philippine phone validation (09XX or +639XX, 11-13 digits)."""
    if not phone:
        return True  # optional field
    cleaned = re.sub(r"[\s\-()]", "", phone)
    return bool(re.match(r"^(\+?63|0)9\d{9}$", cleaned))


def validate_date(date_str: str) -> bool:
    """Validates date string in common formats."""
    if not date_str:
        return True  # optional field
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%B %d, %Y", "%b %d, %Y"):
        try:
            datetime.strptime(date_str.strip(), fmt)
            return True
        except ValueError:
            continue
    return False
