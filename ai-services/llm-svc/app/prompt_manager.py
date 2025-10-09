from typing import List, Optional

def build_prompt(role: str, context: str, message: str, docs: Optional[List[str]] = None, intent: Optional[str] = None) -> str:
    """
    Builds a structured prompt for BodhyaAI, including:
      - role-based behavior
      - optional emotion/intent cues
      - mental health support for students
      - academic context/docs
    """
    docs_text = "\n".join(docs) if docs else ""
    intent_text = f"Detected intent/emotion: {intent}\n" if intent else ""

    # -------------------------------
    # Role-specific system prompt
    # -------------------------------
    if role.lower() == "student":
        system_prompt = (
            "You are BodhyaAI, a friendly AI mentor helping students learn with clarity and support. "
            "Keep responses short, motivational, action-oriented, and emotionally supportive. "
            "Encourage the student, reduce anxiety, and offer mental health reassurance when appropriate."
        )
    elif role.lower() == "mentor":
        system_prompt = (
            "You are BodhyaAI, an analytical teaching assistant. "
            "Offer professional insights, identify patterns, and guide effectively."
        )
    else:
        system_prompt = "You are BodhyaAI, a helpful AI assistant."

    # -------------------------------
    # Intent-aware guidance for mental health
    # -------------------------------
    mental_health_note = ""
    if intent in ["stress", "low_motivation", "anxiety"]:
        mental_health_note = (
            "If the user shows signs of stress, anxiety, or low motivation, "
            "respond with empathy, encourage breaks, and provide supportive advice "
            "while guiding academically."
        )

    # -------------------------------
    # Construct final prompt
    # -------------------------------
    return (
        f"{system_prompt}\n"
        f"{intent_text}"
        f"{mental_health_note}\n"
        f"Context: {context}\n"
        f"Relevant Docs:\n{docs_text}\n\n"
        f"User: {message}\nAssistant:"
    )
