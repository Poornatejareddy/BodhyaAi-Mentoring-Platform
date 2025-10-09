# app/inference.py
from llama_cpp import Llama
import os
import time

# -------------------------------
# Load Phi-3 Mini Model (CPU-friendly)
# -------------------------------
model_path = os.path.join(os.path.dirname(__file__), "../models/Phi-3-mini-4k-instruct-Q5_K_S.gguf")

llm = Llama(
    model_path=model_path,
    n_ctx=2048,
    n_threads=4,
    n_batch=32,
    verbose=False
)

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
