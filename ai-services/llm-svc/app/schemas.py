from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# -------------------------------
# Request Schema
# -------------------------------
class ChatRequest(BaseModel):
    message: str
    student_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    model: Optional[str] = "gemini-2.5-flash" # Default to the new model

# -------------------------------
# Response Schema
# -------------------------------
class ChatResponse(BaseModel):
    reply: str
