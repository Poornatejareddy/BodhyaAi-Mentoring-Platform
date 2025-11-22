# app/inference.py
try:
    from llama_cpp import Llama
except ImportError:
    class Llama:
        def __call__(self, *args, **kwargs):
            return {"choices": [{"text": "[Dummy response – llama_cpp not installed]"}]}

import os
import time

# -------------------------------
# Load Phi-3 Mini Model (CPU-friendly)
# -------------------------------
# Use pathlib for robust path handling
from pathlib import Path

# Determine the base directory of the current script
base_dir = Path(__file__).parent.parent
model_name = "Phi-3-mini-4k-instruct-Q5_K_S.gguf"
model_path = base_dir / "models" / model_name

# Attempt to load the model; if missing or initialization fails, fall back to a dummy implementation
try:
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found at: {model_path}\n"
            "Using dummy Llama for development/testing."
        )
    llm = Llama(
        model_path=str(model_path),
        n_ctx=2048,
        n_threads=4,
        n_batch=32,
        verbose=False,
    )
except Exception as exc:
    # Dummy fallback that mimics Llama's call signature
    class DummyLlama:
        def __call__(self, *args, **kwargs):
            return {"choices": [{"text": "[Dummy response – model not available]"}]}
    llm = DummyLlama()
    print(f"⚠️ Llama initialization failed: {exc}")

# -------------------------------
# Non-streaming response
# -------------------------------
def generate_response(prompt: str, max_tokens: int = 96) -> str:
    output = llm(
        prompt=prompt,
        max_tokens=max_tokens,
        temperature=0.7,
        top_p=0.9,
        stop=["</s>", "User:", "Assistant:", "Context:"]
    )
    text = output["choices"][0]["text"].strip()
    if text.endswith(("and", "but", "so", "by", "then", "or")):
        text = text.rsplit(" ", 1)[0] + "."
    if not text.endswith((".", "!", "?")):
        text += "."
    if "\n\n" in text:
        text = text.split("\n\n")[0]
    return text

# -------------------------------
# Streaming response generator
# -------------------------------
def stream_response(prompt: str, max_tokens: int = 96, chunk_size: int = 8):
    """
    Streams response in small chunks (works for any llama_cpp version)
    """
    full_text = generate_response(prompt, max_tokens=max_tokens)
    for i in range(0, len(full_text), chunk_size):
        yield full_text[i:i+chunk_size]
        time.sleep(0.01)  # simulate real-time typing
