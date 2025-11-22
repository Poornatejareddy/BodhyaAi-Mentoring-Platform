# ai-services/risk-svc/service.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import joblib
import os
import numpy as np

app = FastAPI()

# Paths
MODEL_PATH = os.path.join("models", "academic_risk_pipeline.pkl")
ENCODER_PATH = os.path.join("models", "label_encoder.pkl")

# Load model & encoder
model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)

# Request body schema - all fields optional with defaults
class AcademicInput(BaseModel):
    CGPA: Optional[float] = 0.0
    Attendance: Optional[int] = 0
    StressScore: Optional[int] = 5
    SleepHours: Optional[int] = 6
    Backlogs: Optional[int] = 0
    StudyHoursPerDay: Optional[int] = 2
    FatherIncome: Optional[int] = 30000
    MotherIncome: Optional[int] = 20000
    HasSiblings: Optional[int] = 0
    SiblingCount: Optional[int] = 0
    MentalHealthIndex: Optional[float] = 5.0
    ExerciseHours: Optional[int] = 1
    ScreenTime: Optional[int] = 6

@app.get("/")
def health_check():
    return {"status": "ok", "service": "risk-svc", "port": 8000}

@app.post("/predict")
def predict(data: AcademicInput):
    features = np.array([[
        data.CGPA, data.Attendance, data.StressScore, data.SleepHours, data.Backlogs,
        data.StudyHoursPerDay, data.FatherIncome, data.MotherIncome,
        data.HasSiblings, data.SiblingCount, data.MentalHealthIndex,
        data.ExerciseHours, data.ScreenTime
    ]])

    prediction_encoded = model.predict(features)[0]
    prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
    
    # Convert to uppercase to match backend expectations (HIGH/MEDIUM/LOW)
    prediction_label = str(prediction_label).upper()
    
    # Get probability/confidence if model supports it
    confidence = 0.8  # Default
    if hasattr(model, 'predict_proba'):
        try:
            proba = model.predict_proba(features)[0]
            confidence = float(np.max(proba))
        except:
            pass

    return {
        "prediction": prediction_label,
        "confidence": confidence,
        "model": "academic_risk_pipeline"
    }
