import os
import json
import logging
import time
from app.rag_engine import get_rag_engine

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAG_EVAL")

# Ensure model directory exists
os.makedirs("models", exist_ok=True)

def evaluate_retrieval():
    print("🚀 Starting RAG Evaluation...")
    
    # Initialize Engine (will load seed docs)
    rag = get_rag_engine()
    
    # Test Queries
    queries = [
        {
            "id": "q1",
            "text": "How can I manage academic stress?",
            "expected_keywords": ["stress", "sleep", "exercise", "mindfulness"]
        },
        {
            "id": "q2",
            "text": "Explain the Pomodoro technique",
            "expected_keywords": ["25-minute", "break", "timer", "Pomodoro"]
        },
        {
            "id": "q3",
            "text": "What are the rules for derivatives in calculus?",
            "expected_keywords": ["Power rule", "Product rule", "Chain rule", "slope"]
        }
    ]
    
    results = {}
    
    for q in queries:
        print(f"\n🔍 Query: {q['text']}")
        start_time = time.time()
        
        # 1. Test Retrieval Only first
        retrieved_docs = rag.retrieve_context(q['text'], k=3)
        
        # 2. Check relevance (keyword match)
        relevant_chunks = 0
        retrieved_content = []
        
        for doc in retrieved_docs:
            content = doc['content']
            retrieved_content.append({
                "source": doc['metadata'].get('source'),
                "score": doc.get('score'), # content similarity score
                "snippet": content[:100] + "..."
            })
            
            # Simple keyword check for "relevance"
            if any(k.lower() in content.lower() for k in q['expected_keywords']):
                relevant_chunks += 1
        
        # 3. Test End-to-End Generation (attempting)
        # Note: This might fallback if keys are missing, which is fine
        try:
            qa_result = rag.query(q['text'], k=3)
        except Exception as e:
            logger.warning(f"Generation failed for query {q['id']}: {e}")
            qa_result = {"answer": f"Error: {e}", "model": "error"}
        
        latency = time.time() - start_time
        
        print(f"   found {len(retrieved_docs)} docs in {latency:.4f}s")
        print(f"   relevant chunks (keyword match): {relevant_chunks}/{len(retrieved_docs)}")
        print(f"   response model: {qa_result.get('model', 'unknown')}")
        
        results[q['id']] = {
            "query": q['text'],
            "latency": latency,
            "retrieved_count": len(retrieved_docs),
            "relevant_count": relevant_chunks,
            "retrieved_items": retrieved_content,
            "generated_answer": qa_result.get("answer", "")[:200] + "...", # truncate for report
            "model_used": qa_result.get("model")
        }
        
    # Save Report
    report_path = "models/rag_evaluation.json"
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Saved RAG evaluation report to {report_path}")

if __name__ == "__main__":
    evaluate_retrieval()
