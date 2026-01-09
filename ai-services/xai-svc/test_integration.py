import os
import joblib
import json
import time
import pandas as pd
import numpy as np
from service import explain_risk_model, explain_cog_model, RiskInput, CogInput

# Setup directories
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

print("🚀 Starting XAI Service Integration Test...")

# ---------------------------------------------------------
# 1. Test Risk Explanation (delegates to risk-svc model)
# ---------------------------------------------------------
print("\n🧪 Testing Risk Model Explanation...")

# Mock Data (High Risk Profile)
risk_data = {
    "CGPA": 5.5,
    "Attendance": 60.0,
    "StressScore": 8.0,
    "SleepHours": 5.0,
    "Backlogs": 2,
    "StudyHoursPerDay": 2.0,
    "FatherIncome": 50000.0,
    "MotherIncome": 40000.0,
    "FatherIncome": 50000.0,
    "MotherIncome": 40000.0,
    "MentalHealthIndex": 4.0,
    "ExerciseHours": 1.0,
    "ScreenTime": 6.0,
    # Add dummy columns if model expects more (based on risk-svc training)
    "ParentEducation": 2, "InternetAccess": 1, "PartTimeJob": 0,
    "ClubParticipation": 0, "MentorMeetings": 0, "CounselingSessions": 0,
    "SocialHours": 2.0,
    "IAT1": 10.0, "IAT2": 12.0, "IAT3": 11.0 # Exam scores
}

# Ensure columns match training features
# risk-svc expected columns:
# CGPA, Attendance, StressScore, SleepHours, Backlogs, StudyHoursPerDay, FatherIncome, MotherIncome,
# ParentEducation, InternetAccess, PartTimeJob, MentalHealthIndex, ExerciseHours, ScreenTime, SocialHours,
# ClubParticipation, MentorMeetings, CounselingSessions, IAT1, IAT2, IAT3 
# (Based on risk-svc/train_academic_model.py)

# Features must match training order exactly
FEATURE_ORDER = [
    "CGPA", "Attendance", "StressScore", "SleepHours", "Backlogs",
    "StudyHoursPerDay", "FatherIncome", "MotherIncome",
    "ParentEducation", "InternetAccess", "PartTimeJob",
    "MentalHealthIndex", "ExerciseHours", "ScreenTime", "SocialHours",
    "ClubParticipation", "MentorMeetings", "CounselingSessions",
    "IAT1", "IAT2", "IAT3"
]

risk_df = pd.DataFrame([risk_data])
risk_df = risk_df[FEATURE_ORDER] # Enforce order

start_time = time.time()
try:
    risk_result = explain_risk_model(risk_df)
    risk_latency = time.time() - start_time
    print(f"✅ Risk explanation generated in {risk_latency:.4f}s")
    print(f"   Prediction: {risk_result['prediction']}")
    print(f"   Warnings: {risk_result['warnings']}")
    risk_status = "success"
except Exception as e:
    print(f"❌ Risk explanation failed: {e}")
    risk_latency = 0
    risk_result = {"error": str(e)}
    risk_status = "failed"

# ---------------------------------------------------------
# 2. Test Cognitive Explanation (delegates to cog-svc models)
# ---------------------------------------------------------
print("\n🧪 Testing Cognitive Model Explanation...")

# Mock Data (Random answers 1-5)
cog_data = {f"Q{i+1}": np.random.randint(1, 6) for i in range(50)}
cog_df = pd.DataFrame([cog_data])

start_time = time.time()
try:
    cog_result = explain_cog_model(cog_df)
    cog_latency = time.time() - start_time
    print(f"✅ Cognitive explanation generated in {cog_latency:.4f}s")
    print(f"   Predictions: {cog_result['predictions']}")
    print(f"   Insights: {cog_result['insights']}")
    cog_status = "success"
except Exception as e:
    print(f"❌ Cognitive explanation failed: {e}")
    cog_latency = 0
    cog_result = {"error": str(e)}
    cog_status = "failed"

# ---------------------------------------------------------
# 3. Save Report
# ---------------------------------------------------------
report = {
    "risk_service": {
        "status": risk_status,
        "latency_seconds": risk_latency,
        "sample_output": risk_result
    },
    "cognitive_service": {
        "status": cog_status,
        "latency_seconds": cog_latency,
        "sample_output": {k: v for k, v in cog_result.items() if k != "feature_importance"} # Simplify output
    }
}

report_path = os.path.join(MODEL_DIR, "integration_report.json")
with open(report_path, 'w') as f:
    json.dump(report, f, indent=2)
print(f"\n💾 Saved integration report to {report_path}")
