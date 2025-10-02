# ai-services/cog-svc/service.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os
import pandas as pd

app = FastAPI()
MODEL_DIR = "models"

# Load models
models = {trait: joblib.load(os.path.join(MODEL_DIR, f"{trait}_pipeline.pkl"))
          for trait in ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]}

# Pydantic model for input
class SurveyInput(BaseModel):
    Q1: float; Q2: float; Q3: float; Q4: float; Q5: float
    Q6: float; Q7: float; Q8: float; Q9: float; Q10: float
    Q11: float; Q12: float; Q13: float; Q14: float; Q15: float
    Q16: float; Q17: float; Q18: float; Q19: float; Q20: float
    Q21: float; Q22: float; Q23: float; Q24: float; Q25: float
    Q26: float; Q27: float; Q28: float; Q29: float; Q30: float
    Q31: float; Q32: float; Q33: float; Q34: float; Q35: float
    Q36: float; Q37: float; Q38: float; Q39: float; Q40: float
    Q41: float; Q42: float; Q43: float; Q44: float; Q45: float
    Q46: float; Q47: float; Q48: float; Q49: float; Q50: float

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/predict")
def predict_traits(input_data: SurveyInput):
    df = pd.DataFrame([input_data.dict()])
    predictions = {trait.capitalize(): float(models[trait].predict(df)[0]) for trait in models}
    return {"predictions": predictions}
