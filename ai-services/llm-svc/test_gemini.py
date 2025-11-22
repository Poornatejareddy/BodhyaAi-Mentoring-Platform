#!/usr/bin/env python3
"""
Quick test script to verify Gemini API integration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("GEMINI API TEST")
print("=" * 60)

# Check if API key is loaded
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    print(f"✅ GEMINI_API_KEY found: {api_key[:20]}...")
else:
    print("❌ GEMINI_API_KEY not found in environment!")
    exit(1)

# Try to import and use Gemini
try:
    import google.generativeai as genai
    print("✅ google.generativeai package imported successfully")
except ImportError as e:
    print(f"❌ Failed to import google.generativeai: {e}")
    exit(1)

# Configure Gemini
try:
    genai.configure(api_key=api_key)
    print("✅ Gemini API configured successfully")
except Exception as e:
    print(f"❌ Failed to configure Gemini: {e}")
    exit(1)

# Create model instance
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("✅ Gemini 2.5 Flash model instance created")
except Exception as e:
    print(f"❌ Failed to create model: {e}")
    exit(1)

# Test generation
print("\n" + "=" * 60)
print("TESTING GENERATION")
print("=" * 60)
print("Prompt: 'Explain the Pomodoro technique in 2 sentences.'")
print("\nGenerating response...\n")

try:
    response = model.generate_content("Explain the Pomodoro technique in 2 sentences.")
    print("✅ Response generated successfully!")
    print("\n" + "-" * 60)
    print("RESPONSE:")
    print("-" * 60)
    print(response.text)
    print("-" * 60)
    print("\n✅ GEMINI API TEST PASSED!")
    print("=" * 60)
except Exception as e:
    print(f"❌ Generation failed: {e}")
    exit(1)
