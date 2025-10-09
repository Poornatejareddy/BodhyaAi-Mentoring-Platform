# app/safety.py

import re

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "give up", "end it", "can't go on", "worthless", "hopeless"
]

def sanitize_reply(reply: str, role: str, user_message: str = "") -> str:
    """
    Applies safety rules:
    - Basic profanity filter / model hallucinations
    - Crisis override for sensitive emotional messages
    """
    # 🔹 Crisis override
    if any(kw in user_message.lower() for kw in CRISIS_KEYWORDS):
        return (
            "I’m really sorry you’re feeling this way. "
            "It might help to reach out to your mentor or a counselor immediately. "
            "You are not alone, and support is available."
        )

    # 🔹 Existing safety rules (example: profanity removal)
    safe_reply = reply.replace("badword", "***")  # simple placeholder
    return safe_reply
