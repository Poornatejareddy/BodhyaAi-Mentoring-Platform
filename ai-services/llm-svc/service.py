from fastapi import FastAPI
from contextlib import asynccontextmanager
from pydantic import BaseModel
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import chromadb
from typing import List

# --- Global Variables ---
embedding_model = None
llm_pipeline = None
db_collection = None

# --- New Lifespan Function for Startup/Shutdown Events ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global embedding_model, llm_pipeline, db_collection
    print("Startup event: Loading models and data...")
    
    # 1. Load models
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    llm_pipeline = pipeline('text2text-generation', model='google/flan-t5-small')
    
    # 2. Setup DB and ingest data
    client = chromadb.Client()
    db_collection = client.get_or_create_collection("college_docs")
    with open('rag/college_rules.txt', 'r') as f:
        documents = f.read().split('\n\n')
    embeddings = embedding_model.encode(documents)
    db_collection.add(
        embeddings=embeddings.tolist(),
        documents=documents,
        ids=[f"doc_{i}" for i in range(len(documents))]
    )
    
    print("Startup complete. Service is ready.")
    yield
    # Code after yield would run on shutdown
    print("Shutdown event: Cleaning up...")

# --- Initialize FastAPI app with the lifespan function ---
app = FastAPI(
    title="BodhyaAI LLM Service",
    description="A microservice for RAG-based Q&A.",
    version="0.1.0",
    lifespan=lifespan
)

# --- Pydantic Models ---
class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str
    context: str

# --- API Endpoints ---
@app.post("/ask", response_model=AnswerResponse)
def ask_question(request: QuestionRequest):
    """
    Answers a question using a RAG pipeline.
    """
    question_embedding = embedding_model.encode(request.question).tolist()
    
    results = db_collection.query(
        query_embeddings=[question_embedding],
        n_results=1
    )
    context = results['documents'][0][0]
    
    prompt = f"""
    Context: "{context}"
    
    Based on the context provided, answer the following question.
    Question: "{request.question}"
    
    Answer:
    """
    
    llm_response = llm_pipeline(prompt, max_length=50)
    answer = llm_response[0]['generated_text']
    
    return AnswerResponse(answer=answer, context=context)

@app.get("/health")
def health_check():
    return {"status": "ok"}