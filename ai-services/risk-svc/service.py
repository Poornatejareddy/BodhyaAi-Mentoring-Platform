# ai-services/risk-svc/service.py
from fastapi import FastAPI, HTTPException
from typing import Optional, Dict, List
import pandas as pd
import numpy as np
import shap

# Import shared modules
from common.config import (
    HOST,
    RISK_SVC_PORT,
    RISK_MODEL_PATH,
    RISK_LABEL_ENCODER_PATH,
    RISK_FEATURE_ENCODERS_PATH
)
from common.models.schemas import AcademicInput
from common.utils.helper import (
    load_joblib_model,
    transform_label_safe,
    preprocess_risk_features,
    FEATURE_COLUMNS,
    CATEGORICAL_COLS
)
from common.utils.logging import get_logger

logger = get_logger("risk-svc")

app = FastAPI(title="BodhyaAI Risk Service", version="2.1")

# Global variables for artifacts
model = None
label_encoder = None
feature_encoders = None
explainer = None  # SHAP explainer

@app.on_event("startup")
def load_artifacts():
    global model, label_encoder, feature_encoders, explainer
    try:
        logger.info(f"Loading risk model from {RISK_MODEL_PATH}...")
        model = load_joblib_model(RISK_MODEL_PATH)
        label_encoder = load_joblib_model(RISK_LABEL_ENCODER_PATH)
        feature_encoders = load_joblib_model(RISK_FEATURE_ENCODERS_PATH)
        
        # Initialize SHAP Explainer
        # Extract XGBoost model from pipeline
        if model is not None and hasattr(model, 'named_steps') and 'clf' in model.named_steps:
            xgb_model = model.named_steps['clf']
            logger.info("Initializing SHAP TreeExplainer...")
            explainer = shap.TreeExplainer(xgb_model)
        else:
            logger.warning("⚠️ Could not extract classifier for SHAP. Explainability will be disabled.")
            
        logger.info("✅ All risk model artifacts loaded successfully.")
    except Exception as e:
        logger.error(f"❌ Error loading model artifacts: {e}")

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
    if model is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="Model or label encoder not loaded")

    try:
        # Use shared preprocessing function to handle defaults and categories
        input_dict = data.dict()
        df = preprocess_risk_features(input_dict, feature_encoders)
        
        # Predict
        prediction_encoded = model.predict(df)[0]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get confidence
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
        critical_triggers = []
        override_reason = None
        
        if data.Attendance < 75:
            critical_triggers.append("Attendance < 75%")
        if data.CGPA < 6.0:
            critical_triggers.append("CGPA < 6.0")
        if data.Backlogs >= 2:
            critical_triggers.append("Backlogs ≥ 2")
            
        if critical_triggers:
            logger.warning(f"⚠️ Business Rule Triggered: {critical_triggers}. Forcing HIGH risk.")
            prediction_label = "High"
            confidence = 0.99  # High confidence in the rule
            probabilities = {"High": 0.99, "Medium": 0.01, "Low": 0.0}
            override_reason = f"Critical Academic Failure: {', '.join(critical_triggers)}"

        # Calculate SHAP values (Explainability)
        feature_contributions = []
        if explainer:
            try:
                # Scaler step in pipeline
                df_for_shap = df
                if hasattr(model, 'named_steps') and 'scaler' in model.named_steps:
                    scaler = model.named_steps['scaler']
                    X_scaled = scaler.transform(df)
                    df_for_shap = pd.DataFrame(X_scaled, columns=FEATURE_COLUMNS)
                
                shap_values = explainer.shap_values(df_for_shap)
                
                target_class = "High"
                if hasattr(label_encoder, 'classes_'):
                    try:
                        target_class_index = list(label_encoder.classes_).index(target_class)
                    except ValueError:
                        target_class_index = 0
                else:
                    target_class_index = 0

                if isinstance(shap_values, list):
                    class_shap_values = shap_values[target_class_index][0]
                else:
                    if len(shap_values.shape) == 2:
                         class_shap_values = shap_values[0]
                    else:
                         class_shap_values = shap_values
                
                for i, col in enumerate(FEATURE_COLUMNS):
                    feature_contributions.append({
                        "feature": col,
                        "value": float(class_shap_values[i])
                    })
                
                # Sort by absolute impact
                feature_contributions.sort(key=lambda x: abs(x["value"]), reverse=True)
                
            except Exception as e:
                logger.error(f"⚠️ SHAP calculation failed: {e}")

        return {
            "prediction": str(prediction_label),
            "confidence": round(confidence, 2),
            "probabilities": probabilities,
            "feature_contributions": feature_contributions,
            "override_reason": override_reason,
            "model": "xgboost_enhanced_v2"
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=RISK_SVC_PORT)
