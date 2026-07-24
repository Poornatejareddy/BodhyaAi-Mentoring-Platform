#!/usr/bin/env python3
"""
Quick test script to verify Gemini API integration using the new google-genai SDK
"""
import os
import sys
from dotenv import load_dotenv

# Set up system paths
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

from app.inference import generate_response, model_manager

# Load environment variables
load_dotenv()

print("=" * 60)
print("GEMINI NEW SDK API TEST")
print("=" * 60)

# Check if API key is loaded
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    print(f"✅ GEMINI_API_KEY found: {api_key[:10]}...")
else:
    print("❌ GEMINI_API_KEY not found in environment!")
    exit(1)

# Try to import and use google-genai
try:
    from google import genai
    print("✅ google.genai package imported successfully")
except ImportError as e:
    print(f"❌ Failed to import google.genai: {e}")
    exit(1)

# Test generation via ModelManager/Service
print("\n" + "=" * 60)
print("TESTING GENERATION VIA SERVICE LAYER")
print("=" * 60)
prompt = "Explain the Pomodoro technique in 2 sentences."
print(f"Prompt: '{prompt}'")
print("\nGenerating response...\n")

try:
    response = generate_response(prompt)
    print("✅ Response generated successfully!")
    print("\n" + "-" * 60)
    print("RESPONSE:")
    print("-" * 60)
    print(response)
    print("-" * 60)
    print(f"Model used: {model_manager.current_model}")
    print("\n✅ GEMINI API TEST PASSED!")
    print("=" * 60)
except Exception as e:
    print(f"❌ Generation failed: {e}")
    exit(1)
