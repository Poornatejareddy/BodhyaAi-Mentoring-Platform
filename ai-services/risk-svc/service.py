# ai-services/risk-svc/service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import joblib
import os
import pandas as pd
import numpy as np
import shap

app = FastAPI(title="BodhyaAI Risk Service", version="2.1")

# Paths
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "academic_risk_pipeline.pkl")
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
FEATURE_ENCODERS_PATH = os.path.join(MODEL_DIR, "feature_encoders.pkl")

# Global variables for artifacts
model = None
label_encoder = None
feature_encoders = None
explainer = None  # SHAP explainer

# Feature columns in exact order used during training
FEATURE_COLUMNS = [
    "CGPA", "Attendance", "StressScore", "SleepHours", "Backlogs",
    "StudyHoursPerDay", "FatherIncome", "MotherIncome",
    "ParentEducation", "InternetAccess", "PartTimeJob",
    "MentalHealthIndex", "ExerciseHours", "ScreenTime", "SocialHours",
    "ClubParticipation", "MentorMeetings", "CounselingSessions",
    "IAT1", "IAT2", "IAT3"
]

CATEGORICAL_COLS = ["ParentEducation", "InternetAccess", "PartTimeJob", "ClubParticipation"]

@app.on_event("startup")
def load_artifacts():
    global model, label_encoder, feature_encoders, explainer
    try:
        print(f"Loading model from {MODEL_PATH}...")
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        feature_encoders = joblib.load(FEATURE_ENCODERS_PATH)
        
        # Initialize SHAP Explainer
        # Extract XGBoost model from pipeline
        if hasattr(model, 'named_steps') and 'clf' in model.named_steps:
            xgb_model = model.named_steps['clf']
            print("Initializing SHAP TreeExplainer...")
            # TreeExplainer is fast and works well for XGBoost
            explainer = shap.TreeExplainer(xgb_model)
        else:
            print("⚠️ Could not extract classifier for SHAP. Explainability will be disabled.")
            
        print("✅ All model artifacts loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading model artifacts: {e}")
        # Don't crash, but prediction will fail

# Request body schema - Extended to 21 features
class AcademicInput(BaseModel):
    # Academic
    CGPA: float = 0.0
    Attendance: int = 0
    Backlogs: int = 0
    StudyHoursPerDay: int = 2
    IAT1: int = 0
    IAT2: int = 0
    IAT3: int = 0
    
    # Socio-economic
    FatherIncome: int = 0
    MotherIncome: int = 0
    ParentEducation: str = "Graduate" # Categorical
    InternetAccess: str = "Yes"       # Categorical
    PartTimeJob: str = "No"           # Categorical
    
    # Lifestyle & Health
    StressScore: int = 5
    SleepHours: int = 6
    MentalHealthIndex: float = 5.0
    ExerciseHours: int = 1
    ScreenTime: int = 4
    SocialHours: int = 2
    
    # Engagement
    ClubParticipation: str = "No"     # Categorical
    MentorMeetings: int = 0
    CounselingSessions: int = 0

@app.get("/")
def health_check():
    status = "ok" if model is not None else "error"
    return {
        "status": status, 
        "service": "risk-svc", 
        "version": "2.1", 
        "features": len(FEATURE_COLUMNS),
        "xai_enabled": explainer is not None
    }

@app.post("/predict")
def predict(data: AcademicInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # 1. Convert input to DataFrame
        input_dict = data.dict()
        df = pd.DataFrame([input_dict])
        
        # 2. Encode categorical features
        for col in CATEGORICAL_COLS:
            if col in df.columns:
                # Handle unseen labels safely
                le = feature_encoders.get(col)
                if le:
                    # Use a helper to handle unknown categories (fallback to 0)
                    df[col] = df[col].map(lambda x: transform_label(le, x))
        
        # 3. Ensure correct column order
        df = df[FEATURE_COLUMNS]
        
        # 4. Predict
        prediction_encoded = model.predict(df)[0]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # 5. Get confidence
        confidence = 0.0
        probabilities = {}
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(df)[0]
            confidence = float(np.max(proba))
            
            # Map probabilities to class names
            class_names = label_encoder.classes_
            for i, cls in enumerate(class_names):
                probabilities[str(cls)] = float(proba[i])

        # --- BUSINESS RULE OVERRIDE ---
        # Force HIGH risk if critical thresholds are breached, regardless of ML model
        # This ensures safety and alignment with university policy
        # Updated thresholds to match realistic academic standards:
        # - 75% attendance is typical minimum requirement
        # - 6.0 CGPA is passing grade for most universities
        # - 2+ backlogs indicate serious academic difficulty
        critical_triggers = []
        override_reason = None
        
        if data.Attendance < 75:
            critical_triggers.append("Attendance < 75%")
        if data.CGPA < 6.0:
            critical_triggers.append("CGPA < 6.0")
        if data.Backlogs >= 2:
            critical_triggers.append("Backlogs ≥ 2")
            
        if critical_triggers:
            print(f"⚠️ Business Rule Triggered: {critical_triggers}. Forcing HIGH risk.")
            prediction_label = "High"
            confidence = 0.99 # High confidence in the rule
            # Adjust probabilities to reflect this
            probabilities = {"High": 0.99, "Medium": 0.01, "Low": 0.0}
            override_reason = f"Critical Academic Failure: {', '.join(critical_triggers)}"

        # 6. Calculate SHAP values (Explainability)
        feature_contributions = []
        if explainer:
            try:
                # Calculate SHAP values
                # IMPORTANT: The model was trained on SCALED data.
                # We must scale the input 'df' before passing it to the raw XGBoost explainer.
                
                df_for_shap = df
                if hasattr(model, 'named_steps') and 'scaler' in model.named_steps:
                    scaler = model.named_steps['scaler']
                    # Transform returns numpy array
                    X_scaled = scaler.transform(df)
                    # Convert back to DataFrame to keep feature names (optional but good for debugging)
                    df_for_shap = pd.DataFrame(X_scaled, columns=FEATURE_COLUMNS)
                
                # Note: TreeExplainer returns values in log-odds space for XGBoost
                shap_values = explainer.shap_values(df_for_shap)
                
                # For multi-class, shap_values is a list of arrays (one per class)
                # We want the SHAP values for the "High" risk class to ensure consistent visualization
                # (Positive SHAP = Increases Risk = Red, Negative SHAP = Decreases Risk = Green)
                
                target_class = "High"
                if hasattr(label_encoder, 'classes_'):
                    try:
                        target_class_index = list(label_encoder.classes_).index(target_class)
                    except ValueError:
                        target_class_index = 0 # Fallback to 0 if High not found
                else:
                    target_class_index = 0

                if isinstance(shap_values, list):
                    # Multi-class case
                    class_shap_values = shap_values[target_class_index][0]
                else:
                    # Binary or single output case (handle carefully)
                    if len(shap_values.shape) == 2:
                         class_shap_values = shap_values[0]
                    else:
                         class_shap_values = shap_values
                
                # Create list of {feature, value}
                for i, col in enumerate(FEATURE_COLUMNS):
                    feature_contributions.append({
                        "feature": col,
                        "value": float(class_shap_values[i])
                    })
                
                # Sort by absolute impact (magnitude)
                feature_contributions.sort(key=lambda x: abs(x["value"]), reverse=True)
                
            except Exception as e:
                print(f"⚠️ SHAP calculation failed: {e}")

        return {
            "prediction": str(prediction_label),
            "confidence": round(confidence, 2),
            "probabilities": probabilities,
            "feature_contributions": feature_contributions,
            "override_reason": override_reason,
            "model": "xgboost_enhanced_v2"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

def transform_label(le, value):
    """Safely transform a label, defaulting to 0 if unknown"""
    try:
        return le.transform([value])[0]
    except:
        # If value not seen during training, return the most common class (0 usually)
        return 0
