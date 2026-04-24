import numpy as np


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
