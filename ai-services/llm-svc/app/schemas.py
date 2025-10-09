from pydantic import BaseModel
from typing import List, Optional

# -------------------------------
# Request Schema
# -------------------------------
class ChatRequest(BaseModel):
    role: str
    userId: str
    message: str
    context: str = ""
    docs: Optional[List[str]] = []  # now optional, can be omitted in requests

# -------------------------------
# Response Schema
# -------------------------------
class ChatResponse(BaseModel):
    reply: str
