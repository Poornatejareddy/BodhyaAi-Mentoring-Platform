#!/usr/bin/env python3
"""
Debug script to verify google-genai SDK installation and client initialization.
"""
import importlib.metadata

try:
    from google import genai
    version = importlib.metadata.version('google-genai')
    print(f"✅ google.genai imported successfully (v{version})")
    print(f"   Module: {genai.__file__}")

    if hasattr(genai, 'Client'):
        print("✅ genai.Client class available")
    else:
        print("❌ genai.Client class NOT found")

except ImportError as e:
    print(f"❌ ImportError: {e}")
    print("   Run: pip install google-genai")
