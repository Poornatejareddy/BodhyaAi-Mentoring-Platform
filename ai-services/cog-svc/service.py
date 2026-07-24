# ai-services/cog-svc/service.py
from fastapi import FastAPI
import pandas as pd
from common.config import COG_SVC_PORT, HOST, COG_MODEL_PATHS
from common.models.schemas import SurveyInput
from common.utils.helper import load_joblib_model
from common.utils.logging import get_logger

logger = get_logger("cog-svc")

app = FastAPI(title="BodhyaAI Cognitive Service", version="2.0")

# Load models using centralized config and helpers
models = {}
for trait, path in COG_MODEL_PATHS.items():
    model = load_joblib_model(path)
    if model is not None:
        models[trait] = model
    else:
        logger.error(f"Failed to load cognitive model for trait: {trait}")

@app.get("/")
def read_root():
    status = "ok" if len(models) == 5 else "partial_error"
    return {
        "status": status,
        "service": "cog-svc",
        "loaded_models": list(models.keys())
    }

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
    openness = scores.get('Openness', 50)
    conscientiousness = scores.get('Conscientiousness', 50)
    extraversion = scores.get('Extraversion', 50)
    agreeableness = scores.get('Agreeableness', 50)
    neuroticism = scores.get('Neuroticism', 50)

    # 1. Learning Style
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=COG_SVC_PORT)
