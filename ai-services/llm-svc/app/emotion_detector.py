# app/emotion_detector.py

import re

def detect_intent(message: str) -> str:
    """
    Detects the emotional or academic intent of a user's message.
    Returns one of:
      - 'emotional': stress, anxiety, demotivation
      - 'academic': study, exams, GPA, assignments
      - 'career': internships, projects, placements
      - 'mentor': guidance requests from students
      - 'general': casual greetings or unknown
      - 'risk': indicates potential academic risk
    """

    msg = message.lower().strip()

    # -------------------------------
    # Keywords by category
    # -------------------------------
    emotional_keywords = [
        "stress", "stressed", "tired", "anxious", "anxiety", "sad",
        "depressed", "demotivated", "hopeless", "fail", "failure",
        "pressure", "overwhelmed", "can't focus", "lost", "scared"
    ]

    academic_keywords = [
        "exam", "test", "study", "subject", "marks", "gpa",
        "assignment", "notes", "lecture", "syllabus", "topic", "revision"
    ]

    career_keywords = [
        "career", "internship", "job", "placement", "resume", "cv",
        "future", "goal", "project", "interview", "company", "skills"
    ]

    mentor_keywords = [
        "guide", "help me", "mentor", "advice", "support", "teach me"
    ]

    risk_keywords = [
        "i failed", "low gpa", "drop out", "can't cope", "struggling", "at risk"
    ]

    general_keywords = [
        "hello", "hi", "hey", "thanks", "thank you", "how are you",
        "good morning", "good evening"
    ]

    # -------------------------------
    # Priority-based detection
    # -------------------------------
    if any(word in msg for word in risk_keywords):
        return "risk"
    elif any(word in msg for word in emotional_keywords):
        return "emotional"
    elif any(word in msg for word in academic_keywords):
        return "academic"
    elif any(word in msg for word in career_keywords):
        return "career"
    elif any(word in msg for word in mentor_keywords):
        return "mentor"
    elif any(word in msg for word in general_keywords):
        return "general"
    else:
        return "general"
