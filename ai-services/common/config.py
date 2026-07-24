import os
from dotenv import load_dotenv

# Base directory references
COMMON_DIR = os.path.dirname(os.path.abspath(__file__))
AI_SERVICES_ROOT = os.path.dirname(COMMON_DIR)  # ai-services/
MONOREPO_ROOT = os.path.dirname(AI_SERVICES_ROOT)  # BodhyaAi-Mentoring-Platform/

# Load environment configuration
env_paths = [
    os.path.join(AI_SERVICES_ROOT, ".env"),
    os.path.join(MONOREPO_ROOT, ".env"),
]

# Find and load the first available .env file
loaded_env = False
for path in env_paths:
    if os.path.exists(path):
        load_dotenv(path, override=True)
        loaded_env = True
        break

if not loaded_env:
    # Fallback to standard dotenv loading
    load_dotenv()

# Server configurations
HOST = os.getenv("HOST", "0.0.0.0")
COG_SVC_PORT = int(os.getenv("COG_SVC_PORT", 8000))
RISK_SVC_PORT = int(os.getenv("RISK_SVC_PORT", 8001))
XAI_SVC_PORT = int(os.getenv("XAI_SVC_PORT", 8002))
LLM_SVC_PORT = int(os.getenv("LLM_SVC_PORT", 8003))

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Model Paths (Centralized absolute paths)
RISK_MODEL_DIR = os.path.join(AI_SERVICES_ROOT, "risk-svc", "models")
RISK_MODEL_PATH = os.path.join(RISK_MODEL_DIR, "academic_risk_pipeline.pkl")
RISK_LABEL_ENCODER_PATH = os.path.join(RISK_MODEL_DIR, "label_encoder.pkl")
RISK_FEATURE_ENCODERS_PATH = os.path.join(RISK_MODEL_DIR, "feature_encoders.pkl")

COG_MODEL_DIR = os.path.join(AI_SERVICES_ROOT, "cog-svc", "models")
COG_TRAITS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
COG_MODEL_PATHS = {
    trait: os.path.join(COG_MODEL_DIR, f"{trait}_pipeline.pkl")
    for trait in COG_TRAITS
}
