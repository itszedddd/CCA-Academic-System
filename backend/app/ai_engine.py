import numpy as np
import pytesseract
from PIL import Image
import io
import shutil

# Auto-detect Tesseract path on Windows
if not shutil.which("tesseract"):
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def analyze_grade_trend(scores: list[float]) -> dict:
    """
    Analyzes an array of academic scores to detect declining performance.
    Uses linear regression (numpy polyfit) to compute the performance slope.
    Flags a warning when slope <= -3.0 (losing >3 points per term on average).
    """
    if len(scores) < 3:
        return {
            "has_warning": False,
            "slope": 0.0,
            "message": "Insufficient data for trend analysis.",
            "latest_score": scores[-1] if scores else 0.0,
        }

    x = np.arange(len(scores))
    y = np.array(scores)
    slope, _intercept = np.polyfit(x, y, 1)

    has_warning = slope <= -3.0
    message = "Stable or improving."
    if has_warning:
        drop = scores[0] - scores[-1]
        message = (
            f"Warning: Declining trend detected. "
            f"Dropped ~{drop:.1f}pts from start. Slope: {slope:.2f}"
        )

    return {
        "has_warning": has_warning,
        "slope": round(float(slope), 2),
        "message": message,
        "latest_score": scores[-1],
    }


# ---------------------------------------------------------------------------
# Resource Recommendation Engine
# Curated catalog maps subject areas to targeted learning resources.
# Rule-based for MVP explainability; can be replaced with a trained model later.
# ---------------------------------------------------------------------------

RESOURCE_CATALOG: dict[str, list[dict]] = {
    "Math": [
        {"title": "Khan Academy – Algebra Fundamentals", "url": "https://www.khanacademy.org/math/algebra", "type": "Video"},
        {"title": "Brilliant.org – Math Practice", "url": "https://brilliant.org/courses/#math-foundational", "type": "Practice Set"},
        {"title": "Paul's Online Math Notes", "url": "https://tutorial.math.lamar.edu/", "type": "Article"},
    ],
    "Algebra": [
        {"title": "Khan Academy – Algebra Fundamentals", "url": "https://www.khanacademy.org/math/algebra", "type": "Video"},
        {"title": "GeoGebra Algebra Explorer", "url": "https://www.geogebra.org/algebra", "type": "Practice Set"},
        {"title": "Purple Math – Algebra Lessons", "url": "https://www.purplemath.com/modules/index.htm", "type": "Article"},
    ],
    "Science": [
        {"title": "Khan Academy – Biology Overview", "url": "https://www.khanacademy.org/science/biology", "type": "Video"},
        {"title": "CK-12 – Science Flexbooks", "url": "https://www.ck12.org/student/", "type": "Article"},
        {"title": "PhET Interactive Simulations", "url": "https://phet.colorado.edu/", "type": "Practice Set"},
    ],
    "Physics": [
        {"title": "Khan Academy – Physics", "url": "https://www.khanacademy.org/science/physics", "type": "Video"},
        {"title": "HyperPhysics Concepts", "url": "http://hyperphysics.phy-astr.gsu.edu/hbase/hframe.html", "type": "Article"},
        {"title": "PhET – Physics Sims", "url": "https://phet.colorado.edu/en/simulations/filter?subjects=physics", "type": "Practice Set"},
    ],
    "Chemistry": [
        {"title": "Khan Academy – Chemistry", "url": "https://www.khanacademy.org/science/chemistry", "type": "Video"},
        {"title": "Chemguide", "url": "https://www.chemguide.co.uk/", "type": "Article"},
        {"title": "Royal Society of Chemistry – LearnChemistry", "url": "https://edu.rsc.org/", "type": "Practice Set"},
    ],
    "English": [
        {"title": "Khan Academy – Grammar", "url": "https://www.khanacademy.org/humanities/grammar", "type": "Video"},
        {"title": "Purdue OWL – Writing Resources", "url": "https://owl.purdue.edu/owl/purdue_owl.html", "type": "Article"},
        {"title": "ReadWorks – Reading Comprehension", "url": "https://www.readworks.org/", "type": "Practice Set"},
    ],
    "Filipino": [
        {"title": "DepEd Learning Resources – Filipino", "url": "https://lrmds.deped.gov.ph/", "type": "Article"},
        {"title": "Tagalog Grammar Guide", "url": "https://www.tagalog.com/grammar/", "type": "Article"},
        {"title": "Rappler – Filipino Language Practice", "url": "https://www.rappler.com/", "type": "Article"},
    ],
    "History": [
        {"title": "Khan Academy – World History", "url": "https://www.khanacademy.org/humanities/world-history", "type": "Video"},
        {"title": "CrashCourse – World History", "url": "https://thecrashcourse.com/topic/worldhistory/", "type": "Video"},
        {"title": "HistoryNet Articles", "url": "https://www.historynet.com/", "type": "Article"},
    ],
    "Computer Science": [
        {"title": "CS50 by Harvard (Free)", "url": "https://cs50.harvard.edu/", "type": "Video"},
        {"title": "freeCodeCamp – Web Fundamentals", "url": "https://www.freecodecamp.org/", "type": "Practice Set"},
        {"title": "W3Schools – Programming Basics", "url": "https://www.w3schools.com/", "type": "Article"},
    ],
    "_default": [
        {"title": "Khan Academy – Browse All Subjects", "url": "https://www.khanacademy.org/", "type": "Video"},
        {"title": "CK-12 – Free Study Materials", "url": "https://www.ck12.org/student/", "type": "Article"},
        {"title": "Quizlet – Flashcards & Practice", "url": "https://quizlet.com/", "type": "Practice Set"},
    ],
}

WEAK_SCORE_THRESHOLD = 75.0
MAX_WEAK_SUBJECTS = 3


def suggest_resources(subject_averages: dict[str, float]) -> list[dict]:
    """
    Given a mapping of {subject: average_score}, identifies weak subjects
    (score below WEAK_SCORE_THRESHOLD) and returns up to MAX_WEAK_SUBJECTS
    resource recommendations sorted by severity (worst first).
    """
    if not subject_averages:
        return []

    weak_subjects = sorted(
        [(s, avg) for s, avg in subject_averages.items() if avg < WEAK_SCORE_THRESHOLD],
        key=lambda x: x[1],
    )[:MAX_WEAK_SUBJECTS]

    recommendations = []
    for subject, avg_score in weak_subjects:
        catalog_key = "_default"
        for key in RESOURCE_CATALOG:
            if key == "_default":
                continue
            if key.lower() in subject.lower() or subject.lower() in key.lower():
                catalog_key = key
                break

        top_resource = RESOURCE_CATALOG[catalog_key][0]
        recommendations.append({
            "subject": subject,
            "average_score": round(avg_score, 2),
            "resource_title": top_resource["title"],
            "resource_url": top_resource["url"],
            "resource_type": top_resource["type"],
        })

    return recommendations


def extract_student_data_from_image(image_bytes: bytes) -> str:
    """
    Extracts text from an uploaded enrollment form image using PyTesseract.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        return f"Error extracting text: {e}"


def predict_tuition_default(balances: list[float], payments: list[float], statuses: list[str] = None) -> dict:
    """
    Analyzes historical payment behavior to predict the risk of default.
    Returns a risk score 0.0 - 1.0.
    """
    if not balances or not payments:
        return {"risk_score": 0.0, "message": "No data available."}
        
    total_due = sum(balances)
    total_paid = sum(payments)
    
    if total_due <= 0 or total_paid >= total_due:
        return {"risk_score": 0.0, "message": "Low Risk. Balance is fully covered."}
    
    payment_ratio = total_paid / total_due
    
    # Compute base risk inversely to payment ratio
    risk = max(0.0, 1.0 - payment_ratio)
    
    # Overdue statuses act as severe multipliers
    overdue_count = statuses.count("Overdue") if statuses else 0
    if overdue_count > 0:
        risk += (overdue_count * 0.2) 
        
    # Cap at 0.95 realistically
    risk = min(0.95, risk)
    
    if risk >= 0.8:
        msg = "High risk. Very low payment ratio or multiple overdue flags detected."
    elif risk >= 0.5:
        msg = "Moderate risk. Balance accumulation detected."
    else:
        msg = "Low risk. Payments are stable."
        
    return {"risk_score": round(float(risk), 2), "message": msg}

