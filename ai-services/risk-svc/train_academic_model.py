# ai-services/risk-svc/train_academic_model.py
import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from xgboost import XGBClassifier

DATA_DIR = "datasets"
MODEL_DIR = "models"
INPUT_FILE = os.path.join(DATA_DIR, "academic_dataset_balanced.csv")
MODEL_FILE = os.path.join(MODEL_DIR, "academic_risk_pipeline.pkl")

# Load dataset
df = pd.read_csv(INPUT_FILE)

# Features
FEATURE_COLUMNS = [
    "CGPA", "Attendance", "StressScore", "SleepHours", "Backlogs",
    "StudyHoursPerDay", "FatherIncome", "MotherIncome",
    "HasSiblings", "SiblingCount", "MentalHealthIndex", "ExerciseHours", "ScreenTime"
]

X = df[FEATURE_COLUMNS]
y = df["RiskLevel"]

# Encode labels (Low, Medium, High → 0,1,2)
le = LabelEncoder()
y = le.fit_transform(y)

# Save encoder separately for decoding later
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder.pkl"))

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Pipeline
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    ))
])

# Train
pipeline.fit(X_train, y_train)

# Evaluate
acc = pipeline.score(X_test, y_test)
print(f"✅ Model trained with accuracy: {acc:.2f}")

# Save model
joblib.dump(pipeline, MODEL_FILE)
print(f"📁 Model saved at: {MODEL_FILE}")
