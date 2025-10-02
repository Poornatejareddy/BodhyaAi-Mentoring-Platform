# ai-services/cog-svc/train_bigfive_model.py
import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

DATA_DIR = "datasets"
MODEL_DIR = "models"
INPUT_FILE = os.path.join(DATA_DIR, "bigfive_dataset.csv")
os.makedirs(MODEL_DIR, exist_ok=True)

# Traits we want to predict
TRAITS = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]

# Load dataset
df = pd.read_csv(INPUT_FILE)

# Features: survey questions Q1–Q50
FEATURE_COLUMNS = [f"Q{i+1}" for i in range(50)]
X = df[FEATURE_COLUMNS]

for trait in TRAITS:
    y = df[trait]

    # Split train-test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Build pipeline
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", RandomForestRegressor(n_estimators=200, random_state=42))
    ])

    # Train
    pipeline.fit(X_train, y_train)

    # Evaluate
    r2 = pipeline.score(X_test, y_test)
    print(f"✅ {trait} model trained with R^2: {r2:.2f}")

    # Save model
    model_file = os.path.join(MODEL_DIR, f"{trait.lower()}_pipeline.pkl")
    joblib.dump(pipeline, model_file)
    print(f"📁 {trait} model saved at: {model_file}")
