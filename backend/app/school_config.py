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
TUITION_FEES = {
    "Kindergarten": 25000.0,
    "Grade 1": 30000.0,
    "Grade 2": 30000.0,
    "Grade 3": 30000.0,
    "Grade 4": 30000.0,
    "Grade 5": 30000.0,
    "Grade 6": 30000.0,
    "Grade 7": 35000.0,
    "Grade 8": 35000.0,
    "Grade 9": 35000.0,
    "Grade 10": 35000.0
}

def get_school_config():
    return {
        "calendar": CALENDAR,
        "sections": SECTIONS,
        "subjects": SUBJECTS,
        "tuition_fees": TUITION_FEES
    }
