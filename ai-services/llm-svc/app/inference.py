# app/inference.py

import os
import time
from pathlib import Path

# -----------------------------------------------------
# Gemini 1.5 Flash (Primary LLM)
# -----------------------------------------------------
try:
    from google import genai
    from google.genai.types import GenerationConfig
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("❌ google-genai not installed — run: pip install google-genai")


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
        gemini_model = "gemini-2.0-flash"
        print("✅ Gemini 1.5 Flash initialized")
    except Exception as e:
        print("❌ Gemini initialization failed:", e)
        GEMINI_AVAILABLE = False
else:
    print("⚠️ Gemini disabled — using local model")


def generate_gemini(prompt: str, max_tokens: int = 256, model_name: str = "gemini-2.5-flash"):
    """Primary: Gemini"""
    if not GEMINI_AVAILABLE:
        return None

    try:
        # Use requested model or fallback to default
        model_to_use = model_name if model_name else gemini_model

        response = genai_client.models.generate_content(
            model=model_to_use,
            contents=[
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            config={
                "max_output_tokens": max_tokens,
                "temperature": 0.7,
            },
        )

        text = response.text.strip()

        if text:
            print("🤖 Gemini used successfully")
            return text

        return None

    except Exception as e:
        print("⚠️ Gemini failed:", e)
        return None


# -----------------------------------------------------
# Local Phi-3 Mini (GGUF) — Fallback
# -----------------------------------------------------
try:
    from llama_cpp import Llama
except ImportError:
    class Llama:
        def __call__(self, *a, **kw):
            return {"choices": [{"text": "[Dummy response – llama_cpp missing]"}]}


base_dir = Path(__file__).parent.parent
model_name = "Phi-3-mini-4k-instruct-Q5_K_S.gguf"
model_path = base_dir / "models" / model_name

try:
    if not model_path.exists():
        raise FileNotFoundError(f"Missing model: {model_path}")

    llm = Llama(
        model_path=str(model_path),
        n_ctx=2048,
        n_threads=4,
        n_batch=32,
        verbose=False,
    )

    print("✅ Local Phi-3 Mini model loaded")

except Exception as e:
    print(f"⚠️ Local model load failed: {e}")
    class DummyLlama:
        def __call__(self, *a, **k):
            return {"choices": [{"text": "[Dummy llama response]"}]}
    llm = DummyLlama()


# -----------------------------------------------------
# Local Model Fallback Generator
# -----------------------------------------------------
def generate_local_fallback(prompt: str, max_tokens: int = 128) -> str:
    print("🔄 Using LOCAL Phi-3 model (fallback)...")

    output = llm(
        prompt=prompt,
        max_tokens=max_tokens,
        temperature=0.7,
        top_p=0.9,
        stop=["</s>", "User:", "Assistant:", "Context:"]
    )

    text = output["choices"][0]["text"].strip()

    if not text.endswith((".", "!", "?")):
        text += "."

    return text


# -----------------------------------------------------
# Unified Response (Gemini → Local)
# -----------------------------------------------------
def generate_response(prompt: str, model_name: str = "gemini-2.5-flash"):
    """
    Unified inference function:
    1. Try Gemini (Primary)
    2. Fallback to Local Model (Phi-3)
    """
    # 1. Try Gemini
    response = generate_gemini(prompt, model_name=model_name)
    if response:
        return response

    # fallback
    return generate_local_fallback(prompt)


# -----------------------------------------------------
# Streaming Response (Gemini → Local)
# -----------------------------------------------------
def stream_response(prompt: str, max_tokens: int = 128, chunk_size: int = 12):
    """
    Streaming generator for FastAPI StreamingResponse
    """

    full = generate_response(prompt, max_tokens=max_tokens)

    for i in range(0, len(full), chunk_size):
        yield full[i:i+chunk_size]
        time.sleep(0.01)  # simulate typing
