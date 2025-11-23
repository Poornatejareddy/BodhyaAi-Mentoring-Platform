# Enhanced Risk-svc with Extended Features

This directory contains the enhanced academic risk prediction service with comprehensive features and SHAP interpretability.

## Features

### Extended Input Features (21 features)
- **Academic**: CGPA, Attendance, IAT1, IAT2, IAT3, StudyHoursPerDay, Backlogs
- **Socio-economic**: FatherIncome, MotherIncome, ParentEducation, InternetAccess, PartTimeJob
- **Lifestyle & Health**: StressScore, SleepHours, MentalHealthIndex, ExerciseHours, ScreenTime, SocialHours
- **Engagement**: ClubParticipation, MentorMeetings, Counseling Sessions

### Model Details
- **Algorithm**: XGBoost Classifier
- **Classes**: High, Medium, Low
- **Interpretability**: SHAP values for explainability
- **Accuracy**: ~95% (on synthetic data)

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Generate Dataset and Train Model
```bash
chmod +x train.sh
./train.sh
```

This will:
1. Generate 50,000 synthetic student records
2. Train XGBoost model with cross-validation
3. Generate SHAP interpretability plots
4. Save model artifacts

### 3. Start Service
```bash
uvicorn service:app --reload --port 8000
```

## Generated Files

After running `./train.sh`:

### Datasets
- `datasets/academic_dataset_large.csv` - 50K student records

### Models
- `models/academic_risk_pipeline.pkl` - Trained XGBoost pipeline
- `models/label_encoder.pkl` - Label encoder for classes
- `models/feature_encoders.pkl` - Encoders for categorical features
- `models/feature_importance.json` - Feature importance scores

### Visualizations
- `models/confusion_matrix.png` - Model accuracy visualization
- `models/feature_importance.png` - Top features chart
- `models/shap_summary_High.png` - SHAP explainability for High risk
- `models/shap_summary_Medium.png` - SHAP for Medium risk
- `models/shap_summary_Low.png` - SHAP for Low risk

## API Endpoints

### POST /predict
Predict academic risk for a student.

**Request Body:**
```json
{
  "CGPA": 7.5,
  "Attendance": 85,
  "StressScore": 50,
  "SleepHours": 7,
  "Backlogs": 0,
  "StudyHoursPerDay": 5,
  "FatherIncome": 50000,
  "MotherIncome": 30000,
  "ParentEducation": "Graduate",
  "InternetAccess": "Yes",
  "PartTimeJob": "No",
  "MentalHealthIndex": 0.75,
  "ExerciseHours": 3,
  "ScreenTime": 4,
  "SocialHours": 6,
  "ClubParticipation": "Yes",
  "MentorMeetings": 2,
  "CounselingSessions": 1,
  "IAT1": 35,
  "IAT2": 38,
  "IAT3": 40
}
```

**Response:**
```json
{
  "prediction": "LOW",
  "confidence": 0.92,
  "probabilities": {
    "High": 0.02,
    "Low": 0.92,
    "Medium": 0.06
  },
  "model_version": "xgboost_v2.0"
}
```

### GET /
Health check endpoint.

## Integration with Backend

The backend service (`backend/src/services/riskService.js`) automatically handles the extended features when calling this service.

## Model Retraining

To retrain with new data:
1. Update `generate_dataset.py` with new patterns
2. Run `./train.sh`
3. Restart the service

## Notes

- Model uses StandardScaler for normalization
- Categorical features are label-encoded
- SHAP values provide detailed feature importance per class
- Cross-validation ensures model generalization
