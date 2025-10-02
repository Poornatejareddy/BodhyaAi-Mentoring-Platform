from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
import shap

# ---------------------------
# Input schemas
# ---------------------------
class RiskInput(BaseModel):
    CGPA: float
    Attendance: float
    StressScore: float
    SleepHours: float
    Backlogs: int
    StudyHoursPerDay: float
    FatherIncome: float
    MotherIncome: float
    HasSiblings: int
    SiblingCount: int
    MentalHealthIndex: float
    ExerciseHours: float
    ScreenTime: float

class CogInput(BaseModel):
    Q1: int; Q2: int; Q3: int; Q4: int; Q5: int
    Q6: int; Q7: int; Q8: int; Q9: int; Q10: int
    Q11: int; Q12: int; Q13: int; Q14: int; Q15: int
    Q16: int; Q17: int; Q18: int; Q19: int; Q20: int
    Q21: int; Q22: int; Q23: int; Q24: int; Q25: int
    Q26: int; Q27: int; Q28: int; Q29: int; Q30: int
    Q31: int; Q32: int; Q33: int; Q34: int; Q35: int
    Q36: int; Q37: int; Q38: int; Q39: int; Q40: int
    Q41: int; Q42: int; Q43: int; Q44: int; Q45: int
    Q46: int; Q47: int; Q48: int; Q49: int; Q50: int

# ---------------------------
# Initialize FastAPI
# ---------------------------
app = FastAPI(title="XAI Service")

# ---------------------------
# Load models
# ---------------------------
risk_model = joblib.load("../risk-svc/models/academic_risk_pipeline.pkl")

cog_models = {
    "Openness": joblib.load("../cog-svc/models/openness_pipeline.pkl"),
    "Conscientiousness": joblib.load("../cog-svc/models/conscientiousness_pipeline.pkl"),
    "Extraversion": joblib.load("../cog-svc/models/extraversion_pipeline.pkl"),
    "Agreeableness": joblib.load("../cog-svc/models/agreeableness_pipeline.pkl"),
    "Neuroticism": joblib.load("../cog-svc/models/neuroticism_pipeline.pkl"),
}

# ---------------------------
# Risk Explainer
# ---------------------------
def explain_risk_model(input_df):
    prediction = risk_model.predict(input_df)[0]
    clf = risk_model.named_steps["clf"]

    # Feature importances
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
        feature_importance = {col: float(val) for col, val in zip(input_df.columns, importances)}
    else:
        feature_importance = {}

    warnings = []
    if input_df['Attendance'].iloc[0] < 75:
        warnings.append("⚠️ Low attendance.")
    if input_df['CGPA'].iloc[0] < 6.5:
        warnings.append("⚠️ CGPA below recommended level.")
    if input_df['Backlogs'].iloc[0] > 0:
        warnings.append("⚠️ Student has pending backlogs, risk of failing.")

    return {
        "prediction": int(prediction),  # 👈 cast to Python int
        "feature_importance": feature_importance,
        "warnings": warnings
    }


# ---------------------------
# Cog Explainer
# ---------------------------
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
    if predictions["Neuroticism"] > 0.6:
        insights.append("⚠️ High Neuroticism → student may need stress management support.")
    elif predictions["Neuroticism"] > 0.4:
        insights.append("Neuroticism is moderate → student may experience stress.")

    if predictions["Extraversion"] > 0.65:
        insights.append("🙂 High Extraversion → student may thrive in group work.")

    if predictions["Conscientiousness"] < 0.5:
        insights.append("📉 Low Conscientiousness → may need help with organization and deadlines.")

    return {
        "predictions": predictions,
        "feature_importance": feature_importance,
        "insights": insights,
    }

# ---------------------------
# API Endpoints
# ---------------------------
@app.post("/explain/risk")
def explain_risk(data: RiskInput):
    df = pd.DataFrame([data.dict()])
    return explain_risk_model(df)

@app.post("/explain/cog")
def explain_cog_basic(data: CogInput):
    df = pd.DataFrame([data.dict()])
    preds = {trait: float(model.predict(df.values)[0]) for trait, model in cog_models.items()}
    return {"predictions": preds, "insights": []}

@app.post("/explain/cog-extended")
def explain_cog_extended(data: CogInput):
    df = pd.DataFrame([data.dict()])
    return explain_cog_model(df)
