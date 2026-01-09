# ai-services/cog-svc/train_bigfive_model.py
import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

# ... imports ...

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

performance_report = {}

for trait in TRAITS:
    print(f"\n🧠 Training model for: {trait}")
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
    y_pred = pipeline.predict(X_test)
    
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    
    print(f"✅ Metrics -> R2: {r2:.4f}, RMSE: {rmse:.4f}, MAE: {mae:.4f}")

    # Feature Importance
    regressor = pipeline.named_steps["regressor"]
    importances = regressor.feature_importances_
    # Get top 10 features
    indices = np.argsort(importances)[::-1]
    
    feature_importance_dict = {
        FEATURE_COLUMNS[i]: float(importances[i]) for i in indices[:10]
    }

    # Plot Feature Importance
    plt.figure(figsize=(10, 6))
    plt.title(f"Feature Importance - {trait}")
    plt.bar(range(10), importances[indices[:10]], align="center")
    plt.xticks(range(10), [FEATURE_COLUMNS[i] for i in indices[:10]], rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, f"feature_importance_{trait}.png"))
    plt.close()

    # Save details to report
    performance_report[trait] = {
        "metrics": {
            "r2": r2,
            "mse": mse,
            "rmse": rmse,
            "mae": mae
        },
        "top_features": feature_importance_dict
    }

    # Save model
    model_file = os.path.join(MODEL_DIR, f"{trait.lower()}_pipeline.pkl")
    joblib.dump(pipeline, model_file)
    print(f"📁 Model saved at: {model_file}")

# Save full performance report
report_path = os.path.join(MODEL_DIR, "performance_report.json")
with open(report_path, 'w') as f:
    json.dump(performance_report, f, indent=2)
print(f"\n💾 Saved performance report to {report_path}")

