# ai-services/xai-svc/service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import pandas as pd
import numpy as np
import shap

# Import shared modules
from common.config import (
    HOST,
    XAI_SVC_PORT,
    RISK_MODEL_PATH,
    RISK_LABEL_ENCODER_PATH,
    RISK_FEATURE_ENCODERS_PATH,
    COG_MODEL_PATHS
)
from common.models.schemas import RiskInput, CogInput, CogInput as SurveyInput  # Use survey or cog input
from common.utils.helper import (
    load_joblib_model,
    preprocess_risk_features,
    FEATURE_COLUMNS
)
from common.utils.logging import get_logger

logger = get_logger("xai-svc")

app = FastAPI(title="BodhyaAI XAI Service", version="2.0")

# ---------------------------
# Load Models
# ---------------------------
risk_model = load_joblib_model(RISK_MODEL_PATH)
risk_label_encoder = load_joblib_model(RISK_LABEL_ENCODER_PATH)
risk_feature_encoders = load_joblib_model(RISK_FEATURE_ENCODERS_PATH)

cog_models = {}
for trait, path in COG_MODEL_PATHS.items():
    model = load_joblib_model(path)
    if model is not None:
        cog_models[trait.capitalize()] = model
    else:
        logger.error(f"Failed to load cog model for: {trait}")

# Initialize TreeExplainer for Risk Model SHAP analysis
risk_explainer = None
if risk_model is not None and hasattr(risk_model, 'named_steps') and 'clf' in risk_model.named_steps:
    try:
        logger.info("Initializing SHAP TreeExplainer for Risk model...")
        risk_explainer = shap.TreeExplainer(risk_model.named_steps['clf'])
    except Exception as e:
        logger.error(f"Failed to initialize TreeExplainer: {e}")

# Schema for the nested explanation request from backend
class ExplanationRequest(BaseModel):
    student_id: Optional[str] = None
    features: Dict
    prediction: Optional[str] = None

# ---------------------------
# Explainers
# ---------------------------
def explain_risk_model(input_df):
    if risk_model is None:
        raise ValueError("Risk model is not loaded")
        
    prediction = risk_model.predict(input_df)[0]
    clf = risk_model.named_steps["clf"]

    # Feature importances
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
        feature_importance = {col: float(val) for col, val in zip(input_df.columns, importances)}
    else:
        feature_importance = {}

    warnings = []
    attendance = float(input_df['Attendance'].iloc[0]) if 'Attendance' in input_df.columns else 0.0
    cgpa = float(input_df['CGPA'].iloc[0]) if 'CGPA' in input_df.columns else 0.0
    backlogs = int(input_df['Backlogs'].iloc[0]) if 'Backlogs' in input_df.columns else 0

    if attendance < 70:
        warnings.append("⚠️ Low attendance.")
    if cgpa < 6.5:
        warnings.append("⚠️ CGPA below recommended level.")
    if backlogs > 0:
        warnings.append("⚠️ Student has pending backlogs, risk of failing.")

    # Calculate SHAP values for this instance
    shap_dict = {}
    if risk_explainer:
        try:
            df_for_shap = input_df
            if 'scaler' in risk_model.named_steps:
                scaler = risk_model.named_steps['scaler']
                X_scaled = scaler.transform(input_df)
                df_for_shap = pd.DataFrame(X_scaled, columns=input_df.columns)
            
            shap_values = risk_explainer.shap_values(df_for_shap)
            
            # Handle multi-class outputs
            if isinstance(shap_values, list):
                # Pick SHAP values for the predicted class
                class_idx = int(prediction)
                if class_idx < len(shap_values):
                    class_shap_values = shap_values[class_idx][0]
                else:
                    class_shap_values = shap_values[0][0]
            else:
                if len(shap_values.shape) == 2:
                    class_shap_values = shap_values[0]
                else:
                    class_shap_values = shap_values
                    
            for i, col in enumerate(input_df.columns):
                shap_dict[col] = float(class_shap_values[i])
        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")

    # Return prediction cast to int for backward compatibility
    return {
        "prediction": int(prediction),
        "feature_importance": feature_importance,
        "shap_values": shap_dict,
        "warnings": warnings
    }

def explain_cog_model(input_df):
    predictions = {}
    feature_importance = {}

    for trait, model in cog_models.items():
        preds = model.predict(input_df.values)[0]
        predictions[trait] = float(preds)

        # Extract feature importance
        try:
            if hasattr(model.named_steps["regressor"], "feature_importances_"):
                importances = model.named_steps["regressor"].feature_importances_
                feature_importance[trait] = {
                    f"Q{i+1}": float(val) for i, val in enumerate(importances)
                }
            else:
                explainer = shap.Explainer(model, input_df.values)
                shap_values = explainer(input_df.values)
                vals = np.abs(shap_values.values[0])
                vals /= vals.sum()
                feature_importance[trait] = {
                    f"Q{i+1}": float(v) for i, v in enumerate(vals)
                }
        except Exception as e:
            feature_importance[trait] = {"error": str(e)}

    # Build insights
    insights = []
    if predictions.get("Neuroticism", 0.5) > 0.6:
        insights.append("⚠️ High Neuroticism → student may need stress management support.")
    elif predictions.get("Neuroticism", 0.5) > 0.4:
        insights.append("Neuroticism is moderate → student may experience stress.")

    if predictions.get("Extraversion", 0.5) > 0.65:
        insights.append("🙂 High Extraversion → student may thrive in group work.")

    if predictions.get("Conscientiousness", 0.5) < 0.5:
        insights.append("📉 Low Conscientiousness → may need help with organization and deadlines.")

    return {
        "predictions": predictions,
        "feature_importance": feature_importance,
        "insights": insights,
    }

# ---------------------------
# API Endpoints
# ---------------------------
@app.get("/")
def health_check():
    return {
        "status": "ok" if risk_model is not None and len(cog_models) == 5 else "error",
        "service": "xai-svc",
        "risk_model_loaded": risk_model is not None,
        "cog_models_loaded": len(cog_models)
    }

@app.post("/explain")
def explain_risk_nested(req: ExplanationRequest):
    try:
        # Preprocess features using shared logic
        df = preprocess_risk_features(req.features, risk_feature_encoders)
        return explain_risk_model(df)
    except Exception as e:
        logger.error(f"Nested explanation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain/risk")
def explain_risk(data: RiskInput):
    try:
        df = preprocess_risk_features(data.dict(), risk_feature_encoders)
        return explain_risk_model(df)
    except Exception as e:
        logger.error(f"Risk explanation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain/cog")
def explain_cog_basic(data: SurveyInput):
    df = pd.DataFrame([data.dict()])
    preds = {}
    for trait, model in cog_models.items():
        try:
            preds[trait] = float(model.predict(df.values)[0])
        except Exception as e:
            logger.error(f"Error predicting trait {trait}: {e}")
    return {"predictions": preds, "insights": []}

@app.post("/explain/cog-extended")
def explain_cog_extended(data: SurveyInput):
    df = pd.DataFrame([data.dict()])
    return explain_cog_model(df)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=XAI_SVC_PORT)
