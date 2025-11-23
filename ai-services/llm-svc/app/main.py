# app/main.py
from dotenv import load_dotenv
load_dotenv() 

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.schemas import ChatRequest, ChatResponse
from app.prompt_manager import build_prompt
from app.inference import generate_response, stream_response
from app.memory import save_message, get_recent
from app.safety import sanitize_reply
from app.emotion_detector import detect_intent
from app.rag_engine import get_rag_engine
import logging

logger = logging.getLogger(__name__)

# RAG Request/Response Models
class RAGQueryRequest(BaseModel):
    query: str
    k: int = 5
    filters: Optional[Dict] = None
    include_sources: bool = True

class RAGChatRequest(BaseModel):
    message: str
    student_id: str
    context: Optional[Dict] = None
    conversation_history: Optional[List[Dict]] = None
    model: Optional[str] = "gemini-2.5-flash"

class StudyPlanRequest(BaseModel):
    student_id: str
    current_cgpa: float
    weak_subjects: List[str]
    available_hours_per_week: int
    target_cgpa: Optional[float] = None
    weeks: int = 8

class InterventionRequest(BaseModel):
    student_id: str
    risk_level: str
    academic_data: Dict
    behavioral_data: Optional[Dict] = None

app = FastAPI(
    title="BodhyaAI LLM Service",
    version="2.0",
    description="BodhyaAI LLM service with RAG, streaming, and intelligent study recommendations."
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG engine on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing RAG engine...")
    rag_engine = get_rag_engine()
    logger.info(f"RAG engine ready with {rag_engine.vector_store.index.ntotal} documents")

# ------------------------
# Non-streaming chat
# ------------------------
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    # Adapt new schema to old logic
    user_id = req.student_id or "unknown"
    role = "student" # Default since role was removed from schema
    
    intent = detect_intent(req.message)
    recent_history = get_recent(user_id)
    
    user_context = ""
    if req.context:
        import json
        user_context = json.dumps(req.context)
        
    if recent_history:
        user_context += "\nRecent conversation:\n" + "\n".join(recent_history)

    # Build prompt differently based on intent
    # Note: req.docs is removed from schema, passing empty list
    prompt = build_prompt(role, user_context, req.message, [], intent)

    reply = generate_response(prompt, model_name=req.model)
    safe_reply = sanitize_reply(reply, role)
    save_message(user_id, role, req.message, safe_reply)
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
    return {"status": "ok", "service": "llm-svc", "version": "2.0"}

# ------------------------
# RAG Endpoints
# ------------------------

@app.post("/rag/query")
def rag_query(req: RAGQueryRequest):
    """Semantic search with RAG"""
    try:
        rag_engine = get_rag_engine()
        result = rag_engine.query(
            question=req.query,
            k=req.k,
            filters=req.filters,
            include_sources=req.include_sources
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"RAG query error: {e}")
        return {"success": False, "error": str(e)}

@app.post("/rag/chat")
def rag_chat(req: RAGChatRequest):
    """Conversational AI with RAG context"""
    try:
        rag_engine = get_rag_engine()
        
        # Build context from request
        context_str = ""
        if req.context:
            import json
            # Pretty print the context dictionary to string
            context_str = f"User Context:\n{json.dumps(req.context, indent=2)}"
        
        # Get RAG response
        result = rag_engine.query(
            question=req.message,
            k=3,
            filters=None,
            include_sources=False,
            external_context=context_str,  # Pass external context
            model_name=req.model # Pass requested model
        )
        
        return {
            "success": True,
            "reply": result.get('answer', 'I apologize, but I encountered an error.'),
            "confidence": result.get('confidence', 0.0),
            "model": result.get('model')
        }
    except Exception as e:
        logger.error(f"RAG chat error: {e}")
        return {"success": False, "error": str(e)}

@app.post("/rag/study-plan")
def generate_study_plan(req: StudyPlanRequest):
    """Generate personalized study plan"""
    try:
        # Build study plan query
        query = f"""Create a {req.weeks}-week study plan for a student with:
        - Current CGPA: {req.current_cgpa}
        - Weak subjects: {', '.join(req.weak_subjects)}
        - Available study time: {req.available_hours_per_week} hours/week
        - Target CGPA: {req.target_cgpa or 'improvement'}
        
        Provide a structured weekly plan with specific topics, time allocations, and study strategies."""
        
        rag_engine = get_rag_engine()
        result = rag_engine.query(
            question=query,
            k=5,
            filters={'category': 'study_strategies'},
            include_sources=True
        )
        
        return {
            "success": True,
            "study_plan": result.get('answer', ''),
            "recommended_resources": result.get('sources', []),
            "confidence": result.get('confidence', 0.0)
        }
    except Exception as e:
        logger.error(f"Study plan error: {e}")
        return {"success": False, "error": str(e)}

@app.post("/rag/interventions")
def recommend_interventions(req: InterventionRequest):
    """Recommend interventions based on student risk profile"""
    try:
        # Build intervention query
        cgpa = req.academic_data.get('cgpa', 0)
        attendance = req.academic_data.get('attendance', 0)
        
        query = f"""Recommend academic interventions for a {req.risk_level} risk student:
        - CGPA: {cgpa}
        - Attendance: {attendance}%
        - Risk level: {req.risk_level}
        
        Provide specific, actionable recommendations for academic support, mental health resources, 
        and engagement strategies appropriate for this risk level."""
        
        rag_engine = get_rag_engine()
        result = rag_engine.query(
            question=query,
            k=5,
            include_sources=True
        )
        
        return {
            "success": True,
            "interventions": result.get('answer', ''),
            "resources": result.get('sources', []),
            "priority": "high" if req.risk_level == "HIGH" else "medium",
            "confidence": result.get('confidence', 0.0)
        }
    except Exception as e:
        logger.error(f"Interventions error: {e}")
        return {"success": False, "error": str(e)}

@app.get("/rag/stats")
def get_rag_stats():
    """Get RAG engine statistics"""
    try:
        rag_engine = get_rag_engine()
        stats = rag_engine.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return {"success": False, "error": str(e)}

class ReportRequest(BaseModel):
    mentor_id: str
    class_data: List[Dict]  # List of student data
    focus_area: Optional[str] = "general"

@app.post("/rag/report")
def generate_class_report(req: ReportRequest):
    """Generate a class performance report for mentors"""
    try:
        # Summarize class data
        total_students = len(req.class_data)
        high_risk = len([s for s in req.class_data if s.get('risk') == 'HIGH'])
        avg_cgpa = sum([float(s.get('cgpa', 0)) for s in req.class_data]) / total_students if total_students > 0 else 0
        
        query = f"""Generate a class performance report for a mentor.
        Class Summary:
        - Total Students: {total_students}
        - High Risk Students: {high_risk}
        - Average CGPA: {avg_cgpa:.2f}
        - Focus Area: {req.focus_area}
        
        Provide insights on class performance, identify common challenges based on the risk profile, 
        and suggest teaching strategies to improve outcomes.
        """
        
        rag_engine = get_rag_engine()
        result = rag_engine.query(
            question=query,
            k=5,
            filters={'category': 'study_strategies'}, # Use study strategies to suggest improvements
            include_sources=False
        )
        
        return {
            "success": True,
            "report": result.get('answer', ''),
            "confidence": result.get('confidence', 0.0)
        }
    except Exception as e:
        logger.error(f"Report generation error: {e}")
        return {"success": False, "error": str(e)}
