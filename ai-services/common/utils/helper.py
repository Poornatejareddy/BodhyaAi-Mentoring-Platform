import joblib
import os
import pandas as pd
import numpy as np
from common.utils.logging import get_logger

logger = get_logger("common.utils.helper")

# Column lists for risk model preprocessing
FEATURE_COLUMNS = [
    "CGPA", "Attendance", "StressScore", "SleepHours", "Backlogs",
    "StudyHoursPerDay", "FatherIncome", "MotherIncome",
    "ParentEducation", "InternetAccess", "PartTimeJob",
    "MentalHealthIndex", "ExerciseHours", "ScreenTime", "SocialHours",
    "ClubParticipation", "MentorMeetings", "CounselingSessions",
    "IAT1", "IAT2", "IAT3"
]

CATEGORICAL_COLS = ["ParentEducation", "InternetAccess", "PartTimeJob", "ClubParticipation"]

# Realistic default values for missing columns
DEFAULT_VALUES = {
    "CGPA": 0.0,
    "Attendance": 0,
    "StressScore": 5,
    "SleepHours": 6,
    "Backlogs": 0,
    "StudyHoursPerDay": 2,
    "FatherIncome": 0,
    "MotherIncome": 0,
    "ParentEducation": "Graduate",
    "InternetAccess": "Yes",
    "PartTimeJob": "No",
    "MentalHealthIndex": 5.0,
    "ExerciseHours": 1,
    "ScreenTime": 4,
    "SocialHours": 2,
    "ClubParticipation": "No",
    "MentorMeetings": 0,
    "CounselingSessions": 0,
    "IAT1": 25,
    "IAT2": 25,
    "IAT3": 25
}

def load_joblib_model(path: str):
    """Safely load a joblib model from the given path."""
    if not os.path.exists(path):
        logger.error(f"Model file not found at path: {path}")
        return None
    try:
        logger.info(f"Loading joblib model from {path}...")
        return joblib.load(path)
    except Exception as e:
        logger.error(f"Failed to load model from {path}: {e}")
        return None

def transform_label_safe(le, value, default=0):
    """Safely transform a label using a label encoder, falling back to a default value if unknown."""
    if le is None:
        return default
    try:
        return le.transform([value])[0]
    except Exception:
        # Fallback to the default value (usually 0)
        return default

def preprocess_risk_features(input_data: dict, feature_encoders: dict) -> pd.DataFrame:
    """
    Standardize, fill defaults, and encode categorical features for the risk prediction model.
    Accepts raw features (as dict) and returns a DataFrame in the exact order needed by the model.
    """
    data = DEFAULT_VALUES.copy()
    
    # Update with passed inputs (case-insensitive key matching)
    for k, v in input_data.items():
        matched_key = None
        for ref_key in FEATURE_COLUMNS:
            if ref_key.lower() == k.lower():
                matched_key = ref_key
                break
        
        # Also map HasSiblings / SiblingCount or other custom fields to defaults if needed
        if matched_key:
            # Convert boolean values to "Yes" / "No" strings for categorical columns
            if matched_key in ["InternetAccess", "PartTimeJob", "ClubParticipation"] and isinstance(v, bool):
                v = "Yes" if v else "No"
            data[matched_key] = v
            
    # Convert to DataFrame
    df = pd.DataFrame([data])
    
    # Encode categorical columns using the encoders dict
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = feature_encoders.get(col) if feature_encoders else None
            if le:
                df[col] = df[col].map(lambda x: transform_label_safe(le, x))
            else:
                # Default encoding fallback (0) if encoder is missing
                df[col] = 0
                
    # Enforce exact column order
    df = df[FEATURE_COLUMNS]
    return df
