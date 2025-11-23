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
    # Scale to 0-100 and round to integer
    raw_predictions = {trait.capitalize(): float(models[trait].predict(df)[0]) for trait in models}
    predictions = {}
    for trait, value in raw_predictions.items():
        # If value is small (<= 1), assume it's 0-1 scale and multiply by 100
        # If value is large (> 1), assume it's already 0-100 scale
        if value <= 1.0:
            predictions[trait] = int(value * 100)
        else:
            predictions[trait] = int(value)
    
    # Generate extended insights based on predictions
    extended_profile = generate_extended_profile(predictions)
    
    return {
        "predictions": predictions,
        "extended_profile": extended_profile
    }

def generate_extended_profile(scores):
    # Normalize scores to 0-100 if they aren't already (assuming model returns 0-100)
    # Logic to derive Learning Style, Strengths, etc.
    
    openness = scores.get('Openness', 50)
    conscientiousness = scores.get('Conscientiousness', 50)
    extraversion = scores.get('Extraversion', 50)
    agreeableness = scores.get('Agreeableness', 50)
    neuroticism = scores.get('Neuroticism', 50)

    # 1. Learning Style
    # High Openness -> Visual
    # High Extraversion -> Auditory
    # High Conscientiousness -> Kinesthetic (Structured/Doing)
    learning_style = {
        "visual": min(100, int(openness * 0.8 + 20)),
        "auditory": min(100, int(extraversion * 0.8 + 20)),
        "kinesthetic": min(100, int(conscientiousness * 0.8 + 20))
    }

    # 2. Strengths
    strengths = []
    if openness > 60: strengths.append("Creative problem solving")
    if conscientiousness > 60: strengths.append("Strong attention to detail")
    if extraversion > 60: strengths.append("Effective communication")
    if agreeableness > 60: strengths.append("Team collaboration")
    if neuroticism < 40: strengths.append("Resilience under pressure")
    if len(strengths) < 3: strengths.append("Adaptability")

    # 3. Growth Areas
    growth_areas = []
    if openness < 40: growth_areas.append("Embracing new ideas")
    if conscientiousness < 40: growth_areas.append("Time management")
    if extraversion < 40: growth_areas.append("Public speaking")
    if agreeableness < 40: growth_areas.append("Conflict resolution")
    if neuroticism > 60: growth_areas.append("Stress management")
    if len(growth_areas) < 3: growth_areas.append("Networking skills")

    # 4. Career Suggestions
    careers = []
    if openness > 70 and conscientiousness > 60:
        careers.append({"title": "Data Scientist", "compatibility": 90})
    if extraversion > 70 and agreeableness > 60:
        careers.append({"title": "Human Resources Manager", "compatibility": 85})
    if openness > 70 and extraversion > 60:
        careers.append({"title": "Product Manager", "compatibility": 88})
    if conscientiousness > 70 and neuroticism < 40:
        careers.append({"title": "Financial Analyst", "compatibility": 92})
    if openness > 80:
        careers.append({"title": "UX/UI Designer", "compatibility": 85})
    
    # Fallback careers
    if not careers:
        careers.append({"title": "Project Coordinator", "compatibility": 75})
        careers.append({"title": "Business Analyst", "compatibility": 70})

    return {
        "learningStyle": learning_style,
        "strengths": strengths,
        "growthAreas": growth_areas,
        "careerSuggestions": careers[:3] # Top 3
    }
