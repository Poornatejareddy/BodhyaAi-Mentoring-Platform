# ai-services/risk-svc/service.py
from fastapi import FastAPI
from pydantic import BaseModel
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

# Request body schema
class AcademicInput(BaseModel):
    CGPA: float
    Attendance: int
    StressScore: int
    SleepHours: int
    Backlogs: int
    StudyHoursPerDay: int
    FatherIncome: int
    MotherIncome: int
    HasSiblings: int
    SiblingCount: int
    MentalHealthIndex: float
    ExerciseHours: int
    ScreenTime: int

@app.get("/")
def health_check():
    return {"status": "ok", "service": "risk-svc"}

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

    return {"prediction": prediction_label}
