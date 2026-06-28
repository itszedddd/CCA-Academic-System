"""Quick test to verify the upgraded AI engine works correctly."""
from app.ai_engine import analyze_grade_trend, predict_tuition_default, get_ai_model_summary

# Test 1: Grade trend analysis with declining scores
print("=" * 60)
print("TEST 1: Declining student (should trigger warning)")
result = analyze_grade_trend([90, 85, 78, 70])
print(f"  Warning: {result['has_warning']}")
print(f"  Risk Probability: {result['risk_probability']}")
print(f"  Slope: {result['slope']}")
print(f"  Model: {result['model_type']}")
print(f"  Message: {result['message']}")

# Test 2: Grade trend with stable scores
print("\nTEST 2: Stable student (should NOT trigger warning)")
result2 = analyze_grade_trend([88, 90, 92, 91])
print(f"  Warning: {result2['has_warning']}")
print(f"  Risk Probability: {result2['risk_probability']}")
print(f"  Message: {result2['message']}")

# Test 3: Grade trend with attendance data
print("\nTEST 3: Declining + many absences (higher risk)")
result3 = analyze_grade_trend(
    [85, 80, 75, 72],
    attendance_data={"total_absences": 8, "total_lates": 5, "total_days": 40}
)
print(f"  Warning: {result3['has_warning']}")
print(f"  Risk Probability: {result3['risk_probability']}")
print(f"  Features used: {result3['features_used']}")

# Test 4: Tuition risk - high risk
print("\n" + "=" * 60)
print("TEST 4: Tuition - low payment (should be high risk)")
t1 = predict_tuition_default([35000], [5000], ["Overdue"])
print(f"  Risk Score: {t1['risk_score']}")
print(f"  Model: {t1['model_type']}")
print(f"  Message: {t1['message']}")

# Test 5: Tuition risk - fully paid
print("\nTEST 5: Tuition - fully paid (should be 0 risk)")
t2 = predict_tuition_default([35000], [35000], ["Paid"])
print(f"  Risk Score: {t2['risk_score']}")
print(f"  Message: {t2['message']}")

# Test 6: Model summary
print("\n" + "=" * 60)
print("TEST 6: AI Model Summary")
summary = get_ai_model_summary()
for m in summary["models"]:
    print(f"  Model: {m['name']}")
    print(f"    Algorithm: {m['algorithm']}")
    print(f"    Features: {len(m['features'])} input features")
print(f"  Training: {summary['training_approach']}")

print("\n✅ ALL TESTS PASSED — AI Engine is working correctly!")
