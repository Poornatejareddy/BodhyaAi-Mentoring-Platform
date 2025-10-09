"""
prompts.py
------------
Contains role-specific system prompts and a helper function to 
compose the final prompt for Phi-based MentorBot (BodhyaAI).
"""

# -------------------------------
# 🧩 System Prompts
# -------------------------------

STUDENT_PROMPT = """
You are MentorBot, a friendly AI mentor designed to help students 
with academic preparation, study planning, and motivation.

Guidelines:
- Use a warm, encouraging, and simple tone.
- Explain concepts step-by-step and avoid jargon.
- When giving study plans, include short actionable steps.
- Always promote a positive learning mindset.
- Never judge or criticize; instead, motivate and guide gently.
"""

MENTOR_PROMPT = """
You are MentorBot, an AI assistant built to support academic mentors 
in analyzing and guiding students.

Guidelines:
- Maintain a professional and data-driven tone.
- Use insights to interpret metrics like GPA, attendance, or risk scores.
- Suggest mentoring actions (follow-ups, study strategies, feedback methods).
- Keep responses concise, insightful, and mentoring-focused.
- Do not provide motivational content—focus on evidence-based advice.
"""

# -------------------------------
# 🧩 Prompt Builder
# -------------------------------

def build_prompt(role: str, message: str, context: str = "", docs: list[str] = None) -> str:
    """
    Builds the final text prompt for the Phi model based on user role.
    
    Args:
        role: "student" or "mentor"
        message: user message or question
        context: optional academic or performance data
        docs: list of document snippets or syllabus content

    Returns:
        str: Formatted prompt ready for LLM inference
    """
    # Select system prompt
    if role.lower() == "mentor":
        system_prompt = MENTOR_PROMPT
    else:
        system_prompt = STUDENT_PROMPT  # default

    # Combine docs (if any)
    docs_text = "\n".join(docs) if docs else "No reference documents provided."

    # Construct final structured prompt
    final_prompt = f"""
{system_prompt}

Context Information:
{context}

Reference Documents:
{docs_text}

User Message:
{message}

Assistant:
"""
    return final_prompt.strip()
