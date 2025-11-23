import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No API key found")
    exit(1)

client = genai.Client(api_key=api_key)

try:
    print("Listing models...")
    # Try to list models. The method might vary based on SDK version.
    # Common methods: list_models(), models.list()
    
    # For new SDK:
    for m in client.models.list():
        print(f"Model: {m.name}")
        # print(f"  Supported methods: {m.supported_generation_methods}")
        
except Exception as e:
    print(f"Error listing models: {e}")
