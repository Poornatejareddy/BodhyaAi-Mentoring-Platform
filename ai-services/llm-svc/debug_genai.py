try:
    from google import genai
    print("Successfully imported google.genai")
    print(f"File: {genai.__file__}")
    print(f"Dir: {dir(genai)}")
    
    if hasattr(genai, 'Client'):
        print("genai.Client exists")
    
except ImportError as e:
    print(f"ImportError: {e}")
    
try:
    import google.generativeai as old_genai
    print("Successfully imported google.generativeai")
    print(f"Version: {old_genai.__version__}")
except ImportError:
    print("google.generativeai not found")
