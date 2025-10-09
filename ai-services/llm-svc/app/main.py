# app/main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from app.schemas import ChatRequest, ChatResponse
from app.prompt_manager import build_prompt
from app.inference import generate_response, stream_response
from app.memory import save_message, get_recent
from app.safety import sanitize_reply
from app.emotion_detector import detect_intent

app = FastAPI(
    title="BodhyaAI LLM Service",
    version="1.2",
    description="BodhyaAI LLM service with streaming, role-tuned and emotion-aware prompts."
)

# ------------------------
# Non-streaming chat
# ------------------------
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    intent = detect_intent(req.message)
    recent_history = get_recent(req.userId)
    user_context = req.context
    if recent_history:
        user_context += "\nRecent conversation:\n" + "\n".join(recent_history)

    # Build prompt differently based on intent
    prompt = build_prompt(req.role, user_context, req.message, req.docs, intent)

    reply = generate_response(prompt, max_tokens=128)
    safe_reply = sanitize_reply(reply, req.role)
    save_message(req.userId, req.role, req.message, safe_reply)
    return ChatResponse(reply=safe_reply)

# ------------------------
# Streaming chat
# ------------------------
@app.post("/chat/stream")
def chat_stream(req: ChatRequest):
    intent = detect_intent(req.message)
    recent_history = get_recent(req.userId)
    user_context = req.context
    if recent_history:
        user_context += "\nRecent conversation:\n" + "\n".join(recent_history)

    prompt = build_prompt(req.role, user_context, req.message, req.docs, intent)

    # StreamingResponse with generator
    return StreamingResponse(
        stream_response(prompt, max_tokens=128),
        media_type="text/plain"
    )

# ------------------------
# Health endpoint
# ------------------------
@app.get("/health")
def health():
    return {"status": "ok", "service": "llm-svc", "version": "1.2"}
