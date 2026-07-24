"""
RAG Engine – Uses Gemini exclusively with centralized fallback logic.
"""

import os
import logging
from typing import List, Dict, Optional

from app.retriever import get_vector_store
from app.document_manager import get_document_manager
from app.knowledge_base import get_all_seed_documents
from app.inference import generate_response, model_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAGEngine")


class RAGEngine:

    def __init__(self):
        self.vector_store = get_vector_store()
        self.document_manager = get_document_manager()
        logger.info("RAG Engine initialized to use Gemini.")

    # -------------------------------------------------------------------
    # Knowledge Base Initialization
    # -------------------------------------------------------------------
    def initialize_knowledge_base(self, force_reload=False):
        index_path = "models/faiss_index.idx"
        metadata_path = "models/faiss_metadata.pkl"

        if (
            not force_reload
            and os.path.exists(index_path)
            and os.path.exists(metadata_path)
        ):
            logger.info("Loading existing FAISS index...")
            self.vector_store.load_index(index_path, metadata_path)
            logger.info(f"Loaded {self.vector_store.index.ntotal} documents")
            return

        logger.info("Initializing knowledge base...")
        docs = get_all_seed_documents()

        texts, metas = self.document_manager.process_batch(docs)
        self.vector_store.add_documents(texts, metas)

        os.makedirs("models", exist_ok=True)
        self.vector_store.save_index(index_path, metadata_path)

        logger.info(f"Knowledge base created with {len(texts)} chunks")

    # -------------------------------------------------------------------
    # Retrieve Context
    # -------------------------------------------------------------------
    def retrieve_context(self, query, k=5, min_score=0, filters=None):
        results = self.vector_store.search(query, k=k, min_score=min_score)

        # Optional filters
        if filters:
            filtered = []
            for r in results:
                md = r["metadata"]
                if "category" in filters and md.get("category") != filters["category"]:
                    continue
                if "tags" in filters:
                    req_tags = (
                        filters["tags"]
                        if isinstance(filters["tags"], list)
                        else [filters["tags"]]
                    )
                    if not any(t in md.get("tags", []) for t in req_tags):
                        continue
                filtered.append(r)
            results = filtered

        logger.info(f"Search returned {len(results)} results for query '{query[:80]}'")
        return results

    # -------------------------------------------------------------------
    # Build Context
    # -------------------------------------------------------------------
    def build_context(self, docs, max_tokens=2000):
        parts = []
        used_tokens = 0

        for i, d in enumerate(docs):
            content = d["content"]
            source = d["metadata"].get("source", "Unknown")
            score = d.get("score", 0)

            tokens = len(content) // 4  # approx
            if used_tokens + tokens > max_tokens:
                break

            parts.append(
                f"[Source {i+1}: {source} | relevance={score:.2f}]\n{content}\n"
            )
            used_tokens += tokens

        logger.info(f"Built context with {len(parts)} sources (~{used_tokens} tokens)")
        return "\n".join(parts)

    # -------------------------------------------------------------------
    # RAG Full Query
    # -------------------------------------------------------------------
    def query(self, question, k=5, filters=None, include_sources=True, external_context=None, model_name="gemini-2.5-flash"):
        logger.info(f"Processing RAG query: {question[:80]}... Model: {model_name}")

        docs = self.retrieve_context(question, k=k, filters=filters)
        context = self.build_context(docs)
        
        if external_context:
            context = f"{external_context}\n\nKnowledge Base:\n{context}"

        prompt = f"""
You are BodhyaAI — an intelligent academic mentoring assistant.

{context}

User Question:
{question}

INSTRUCTIONS:
1. **Identify the user's role** from the context above (student, mentor, or admin).
2. **Greet appropriately**: 
   - For students: Offer study guidance, exam prep, stress management
   - For mentors: Offer to analyze students, generate reports, identify at-risk students
   - For admins: Provide system insights and analytics
3. **Use the provided context** to give personalized, data-driven responses.
4. **For mentors asking about students**: If a specific student is mentioned in "focused_student", provide detailed analysis of their risk level, academic performance, and recommendations.
5. **Offer to help**: Proactively suggest what you can do based on their role.

Give a helpful, clear, and actionable answer.
"""

        try:
            answer = generate_response(prompt, model_name=model_name)
            model_used = model_manager.current_model or model_name or "gemini"
            
            res = {
                "answer": answer,
                "model": model_used
            }
            return self._finalize(res, docs, include_sources)
            
        except Exception as e:
            logger.error(f"RAG query generation failed: {e}")
            # Reraise so endpoints can catch and display unified user-friendly error messages
            raise e

    # -------------------------------------------------------------------
    # Final Formatting
    # -------------------------------------------------------------------
    def _finalize(self, result, docs, include_sources):
        result["confidence"] = docs[0].get("score", 0.0) if docs else 0.0

        if include_sources:
            result["sources"] = [
                {
                    "content": d["content"][:200] + "...",
                    "source": d["metadata"].get("source", "unknown"),
                    "score": d.get("score", 0),
                }
                for d in docs[:3]
            ]

        logger.info(
            f"✅ Query completed using {result['model']} "
            f"(confidence={result['confidence']:.2f})"
        )
        return result


# -------------------------------------------------------------------
# Global instance
# -------------------------------------------------------------------
_rag_engine = None


def get_rag_engine():
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RAGEngine()
        _rag_engine.initialize_knowledge_base()
    return _rag_engine
