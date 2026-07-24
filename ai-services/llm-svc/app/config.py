import os
from common import config as common_config

# Import shared configs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", common_config.GEMINI_API_KEY)
GEMINI_MODEL = os.getenv("GEMINI_MODEL")  # Optional override

# Timeout & Retries configurations
REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "30.0"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Service Metadata
SERVICE_NAME = "llm-svc"
VERSION = "2.0"
