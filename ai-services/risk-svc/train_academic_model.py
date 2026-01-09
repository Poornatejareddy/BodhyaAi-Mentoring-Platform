# ai-services/risk-svc/train_academic_model.py
import pandas as pd
import os
import joblib
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from xgboost import XGBClassifier
import matplotlib.pyplot as plt
import seaborn as sns
import shap
import json

# ---------------------------
# 1. Paths and Config
# ---------------------------
DATA_DIR = "datasets"
MODEL_DIR = "models"
INPUT_FILE = os.path.join(DATA_DIR, "academic_dataset_large.csv")
MODEL_FILE = os.path.join(MODEL_DIR, "academic_risk_pipeline.pkl")
LABEL_ENCODER_FILE = os.path.join(MODEL_DIR, "label_encoder.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------------------
# 2. Load and Clean Dataset
# ---------------------------
print("📂 Loading dataset...")
df = pd.read_csv(INPUT_FILE)
print(f"📊 Original dataset shape: {df.shape}")

# Remove duplicates
duplicates = df.duplicated().sum()
if duplicates > 0:
    print(f"⚠️  Found {duplicates} duplicate rows. Removing duplicates...")
    df = df.drop_duplicates()
print(f"✅ Cleaned dataset shape: {df.shape}")

# ---------------------------
# 3. Define Features and Target
# ---------------------------
FEATURE_COLUMNS = [
    "CGPA", "Attendance", "StressScore", "SleepHours", "Backlogs",
    "StudyHoursPerDay", "FatherIncome", "MotherIncome",
    "ParentEducation", "InternetAccess", "PartTimeJob",
    "MentalHealthIndex", "ExerciseHours", "ScreenTime", "SocialHours",
    "ClubParticipation", "MentorMeetings", "CounselingSessions",
    "IAT1", "IAT2", "IAT3"
]

# Encode categorical columns
print("\n🔄 Encoding categorical features...")
categorical_cols = ["ParentEducation", "InternetAccess", "PartTimeJob", "ClubParticipation"]
encoders = {}

for col in categorical_cols:
    le_col = LabelEncoder()
    df[col] = le_col.fit_transform(df[col])
    encoders[col] = le_col

# Save category encoders
joblib.dump(encoders, os.path.join(MODEL_DIR, "feature_encoders.pkl"))

X = df[FEATURE_COLUMNS]
y = df["RiskLevel"]

# Encode target labels
le_target = LabelEncoder()
y_encoded = le_target.fit_transform(y)

# Save label encoder
joblib.dump(le_target, LABEL_ENCODER_FILE)
print(f"✅ Label classes: {le_target.classes_}")

# ---------------------------
# 4. Train-Test Split
# ---------------------------
print("\n📊 Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"Training set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples")

# ---------------------------
# 5. Define Pipeline with XGBoost
# ---------------------------
print("\n🤖 Creating XGBoost pipeline...")
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        use_label_encoder=False,
        eval_metric="mlogloss",
        objective="multi:softprob",
        num_class=len(le_target.classes_)
    ))
])

# ---------------------------
# 6. Train Model
# ---------------------------
print("\n🔄 Training model...")
pipeline.fit(X_train, y_train)
print("✅ Model training complete!")

# ---------------------------
# 7. Evaluate on Test Set
# ---------------------------
print("\n📈 Evaluating model...")
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n🎯 Test Accuracy: {acc * 100:.2f}%")

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred, target_names=le_target.classes_))

cm = confusion_matrix(y_test, y_pred)
print("\n📉 Confusion Matrix:")
print(cm)

# Normalized Confusion Matrix
cm_normalized = confusion_matrix(y_test, y_pred, normalize='true')
print("\n📉 Normalized Confusion Matrix:")
print(cm_normalized)

# Save normalized confusion matrix as JSON
cm_norm_list = cm_normalized.tolist()
with open(os.path.join(MODEL_DIR, "confusion_matrix_normalized.json"), 'w') as f:
    json.dump({"matrix": cm_norm_list, "labels": list(le_target.classes_)}, f, indent=2)
print(f"💾 Saved normalized confusion matrix to {MODEL_DIR}/confusion_matrix_normalized.json")

# Plot normalized confusion matrix
plt.figure(figsize=(8, 6))
sns.heatmap(cm_normalized, annot=True, fmt='.2f', cmap='Blues',
            xticklabels=le_target.classes_, yticklabels=le_target.classes_)
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title(f"Normalized Confusion Matrix - Academic Risk Prediction\nAccuracy: {acc*100:.2f}%")
plt.tight_layout()
plt.savefig(os.path.join(MODEL_DIR, "confusion_matrix_normalized.png"))
print(f"💾 Saved normalized confusion matrix plot to {MODEL_DIR}/confusion_matrix_normalized.png")
plt.close()

# Plot confusion matrix
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=le_target.classes_, yticklabels=le_target.classes_)
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title(f"Confusion Matrix - Academic Risk Prediction\nAccuracy: {acc*100:.2f}%")
plt.tight_layout()
plt.savefig(os.path.join(MODEL_DIR, "confusion_matrix.png"))
print(f"💾 Saved confusion matrix to {MODEL_DIR}/confusion_matrix.png")
plt.close()

# ---------------------------
# 8. Cross-Validation
# ---------------------------
print("\n🔁 Performing 5-Fold Cross Validation...")
kfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(pipeline, X, y_encoded, cv=kfold, scoring='accuracy')

print(f"✅ Cross-Validation Accuracy: {cv_scores.mean() * 100:.2f}% ± {cv_scores.std() * 100:.2f}%")
print(f"📊 Fold-wise Scores: {np.round(cv_scores * 100, 2)}")

# ---------------------------
# 9. Feature Importance
# ---------------------------
print("\n📊 Calculating feature importance...")
xgb_model = pipeline.named_steps['clf']
fi = xgb_model.feature_importances_
fi_df = pd.DataFrame({"Feature": X.columns, "Importance": fi}).sort_values(by="Importance", ascending=False)

print("\n🔝 Top 10 Important Features:")
print(fi_df.head(10))

plt.figure(figsize=(10, 8))
sns.barplot(data=fi_df, x="Importance", y="Feature", palette="viridis")
plt.title("Feature Importance - Academic Risk Prediction")
plt.tight_layout()
plt.savefig(os.path.join(MODEL_DIR, "feature_importance.png"))
print(f"💾 Saved feature importance to {MODEL_DIR}/feature_importance.png")
plt.close()

# Save feature importance as JSON
fi_dict = fi_df.set_index('Feature')['Importance'].to_dict()
import json
with open(os.path.join(MODEL_DIR, "feature_importance.json"), 'w') as f:
    json.dump(fi_dict, f, indent=2)

# ---------------------------
# 11. Save Comprehensive Performance Report
# ---------------------------
print("\n📝 Generating comprehensive performance report...")

# Get classification report as dict
clf_report_dict = classification_report(y_test, y_pred, target_names=le_target.classes_, output_dict=True)

performance_report = {
    "accuracy": acc,
    "cross_validation": {
        "mean_accuracy": cv_scores.mean(),
        "std_accuracy": cv_scores.std(),
        "fold_scores": cv_scores.tolist()
    },
    "classification_report": clf_report_dict,
    "confusion_matrix": {
        "raw": cm.tolist(),
        "normalized": cm_normalized.tolist(),
        "labels": list(le_target.classes_)
    },
    "feature_importance": fi_dict
}

report_path = os.path.join(MODEL_DIR, "performance_report.json")
with open(report_path, 'w') as f:
    json.dump(performance_report, f, indent=2)
print(f"💾 Saved comprehensive performance report to {report_path}")

# ---------------------------
# 12. Save Model
# ---------------------------
joblib.dump(pipeline, MODEL_FILE)
print(f"\n💾 Model saved at: {MODEL_FILE}")

# ---------------------------
# 13. SHAP Interpretability
# ---------------------------
print("\n💡 Calculating SHAP values for XAI explainability...")

# Create SHAP explainer
explainer = shap.Explainer(
    pipeline.predict_proba,
    X_train,
    feature_names=FEATURE_COLUMNS
)

# Compute SHAP values on a sample (for speed)
X_test_sample = X_test.sample(n=min(100, len(X_test)), random_state=42)
shap_values = explainer(X_test_sample)

# Save SHAP plots for each class
for i, class_name in enumerate(le_target.classes_):
    print(f"📊 Generating SHAP summary for class: {class_name}")
    plt.figure()
    shap.summary_plot(
        shap_values[:, :, i],
        X_test_sample,
        feature_names=FEATURE_COLUMNS,
        show=False
    )
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_DIR, f"shap_summary_{class_name}.png"), dpi=150)
    print(f"💾 Saved SHAP plot: shap_summary_{class_name}.png")
    plt.close()

print("\n✅ SHAP summary plots saved successfully for all classes!")

# ---------------------------
# 13. Save Comprehensive Performance Report
# ---------------------------
print("\n📝 Generating comprehensive performance report...")

# Get classification report as dict
clf_report_dict = classification_report(y_test, y_pred, target_names=le_target.classes_, output_dict=True)

performance_report = {
    "accuracy": acc,
    "cross_validation": {
        "mean_accuracy": cv_scores.mean(),
        "std_accuracy": cv_scores.std(),
        "fold_scores": cv_scores.tolist()
    },
    "classification_report": clf_report_dict,
    "confusion_matrix": {
        "raw": cm.tolist(),
        "normalized": cm_normalized.tolist(),
        "labels": list(le_target.classes_)
    },
    "feature_importance": fi_dict
}

report_path = os.path.join(MODEL_DIR, "performance_report.json")
with open(report_path, 'w') as f:
    json.dump(performance_report, f, indent=2)
print(f"💾 Saved comprehensive performance report to {report_path}")

# ---------------------------
# 14. Model Summary
# ---------------------------
print("\n" + "="*60)
print("🎉 MODEL TRAINING COMPLETE!")
print("="*60)
print(f"📊 Features: {len(FEATURE_COLUMNS)}")
print(f"🎯 Classes: {list(le_target.classes_)}")
print(f"📈 Test Accuracy: {acc * 100:.2f}%")
print(f"🔁 CV Accuracy: {cv_scores.mean() * 100:.2f}% ± {cv_scores.std() * 100:.2f}%")
print(f"💾 Model saved: {MODEL_FILE}")
print(f"💾 Label encoder: {LABEL_ENCODER_FILE}")
print(f"💾 Performance Report: {report_path}")
print("="*60)

