# school_config.py
# CCA Section and Subject Configuration for SY 2026-2027

# Calendar Config
CALENDAR = {
    "term_1": 74,
    "term_2": 73,
    "term_3": 73
}

# Section Config
SECTIONS = {
    "Kindergarten": {"name": "Kindness", "max_students": 32},
    "Grade 1": {"name": "Love", "max_students": 32},
    "Grade 2": {"name": "Joyful", "max_students": 32},
    "Grade 3": {"name": "Faith", "max_students": 32},
    "Grade 4": {"name": "Grace", "max_students": 32},
    "Grade 5": {"name": "Loyalty", "max_students": 32},
    "Grade 6": {"name": "Obedience", "max_students": 32},
    "Grade 7": {"name": "Meekness", "max_students": 32},
    "Grade 8": {"name": "Courage", "max_students": 32},
    "Grade 9": {"name": "Benevolence", "max_students": 32},
    "Grade 10": {"name": "Perseverance", "max_students": 32}
}

# Subject Mapping per Grade Level
SUBJECTS = {
    "Kindergarten": [], # No subjects for Kindergarten
    "Grade 1": [
        "Language",
        "Reading and Literacy",
        "Mathematics",
        "Makabansa (Civics, History, Culture, Arts & Health)",
        "Good Manners and Right Conduct (GMRC)"
    ],
    "Grade 2": [
        "English",
        "Filipino",
        "Mathematics",
        "Makabansa",
        "GMRC"
    ],
    "Grade 3": [
        "English",
        "Filipino",
        "Mathematics",
        "Makabansa",
        "GMRC",
        "Science"
    ],
    "Grade 4": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "GMRC"
    ],
    "Grade 5": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "GMRC"
    ],
    "Grade 6": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "GMRC"
    ],
    "Grade 7": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "Values Education"
    ],
    "Grade 8": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "Values Education"
    ],
    "Grade 9": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "Values Education"
    ],
    "Grade 10": [
        "English",
        "Filipino",
        "Mathematics",
        "Science",
        "Araling Panlipunan (AP)",
        "Music, Arts, PE & Health (MAPEH)",
        "Technology and Livelihood (TLE)",
        "Values Education"
    ]
}

# Tuition Fee Configuration (Total Amount Due for the School Year)
# = Registration (5700) + Tuition (Non-Member Yearly) + Energy Fee (Monthly*10) + Books
TUITION_FEES = {
    "Kindergarten": 29760.0,   # 5700 + 17060 + 1500 + 5500
    "Kinder": 29760.0,
    "Grade 1": 33610.0,        # 5700 + 18010 + 3000 + 6900
    "Grade 2": 33010.0,        # 5700 + 18010 + 3000 + 6300
    "Grade 3": 33610.0,        # 5700 + 18010 + 3000 + 6900
    "Grade 4": 35210.0,        # 5700 + 18010 + 3000 + 8500
    "Grade 5": 35210.0,        # 5700 + 18010 + 3000 + 8500
    "Grade 6": 35210.0,        # 5700 + 18010 + 3000 + 8500
    "Grade 7": 37960.0,        # 5700 + 20060 + 3000 + 9200
    "Grade 8": 37960.0,        # 5700 + 20060 + 3000 + 9200
    "Grade 9": 37960.0,        # 5700 + 20060 + 3000 + 9200
    "Grade 10": 37960.0        # 5700 + 20060 + 3000 + 9200
}

def get_school_config():
    from .fee_structure import FEE_STRUCTURE, BOOKS_PRICES, ADMISSION_REQUIREMENTS
    return {
        "calendar": CALENDAR,
        "sections": SECTIONS,
        "subjects": SUBJECTS,
        "tuition_fees": TUITION_FEES,
        "fee_structure": FEE_STRUCTURE,
        "books_prices": BOOKS_PRICES,
        "admission_requirements": ADMISSION_REQUIREMENTS,
    }
