"""
RAG Engine – Gemini (primary) → OpenAI → Local fallback
"""

import os
from typing import List, Dict, Optional
import logging

from app.retriever import get_vector_store
from app.document_manager import get_document_manager
from app.knowledge_base import get_all_seed_documents
from app.inference import generate_response

# Gemini SDK (new google-genai)
try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("google-genai not installed. Run: pip install google-genai")

# OpenAI fallback
try:
    import openai
    OPENAI_AVAILABLE = True
except:
    OPENAI_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGEngine:

    def __init__(self, use_openai=True, use_gemini=True):
        self.vector_store = get_vector_store()
        self.document_manager = get_document_manager()

        self.use_gemini = use_gemini and GEMINI_AVAILABLE
        self.use_openai = use_openai and OPENAI_AVAILABLE

        # ---------------------------
        # Gemini Initialization
        # ---------------------------
        self.gemini_client = None
        self.gemini_model_name = "gemini-2.0-flash"

        if self.use_gemini:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                self.gemini_client = genai.Client(api_key=api_key)
                logger.info("✅ Gemini 1.5 Flash initialized (PRIMARY)")
            else:
                self.use_gemini = False
                logger.warning("GEMINI_API_KEY missing, Gemini disabled")

        # ---------------------------
        # OpenAI Initialization
        # ---------------------------
        if self.use_openai:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                openai.api_key = api_key
                logger.info("✅ OpenAI Initialized (fallback)")
            else:
                self.use_openai = False

        logger.info(
            f"RAG Engine initialized → Gemini={self.use_gemini}, OpenAI={self.use_openai}"
        )

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
    # Gemini 1.5 Flash Response  (Primary)
    # -------------------------------------------------------------------
    def generate_response_gemini(self, query, context, model_name="gemini-2.5-flash"):

        if not self.use_gemini:
            return {"error": "Gemini disabled"}

        prompt = f"""
You are BodhyaAI — an intelligent academic mentoring assistant.

{context}

User Question:
{query}

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
            # Use requested model or fallback to default
            model_to_use = model_name if model_name else self.gemini_model_name
            
            response = self.gemini_client.models.generate_content(
                model=model_to_use,
                contents=[
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ]
            )

            answer = response.text.strip()

            return {
                "answer": answer,
                "model": model_to_use,
                "tokens_used": None
            }

        except Exception as e:
            logger.error(f"❌ Gemini API error: {e}")
            return {"error": str(e)}

    # -------------------------------------------------------------------
    # OpenAI Fallback
    # -------------------------------------------------------------------
    def generate_response_openai(self, query, context):
        if not self.use_openai:
            return {"error": "OpenAI disabled"}

        system_prompt = "You are BodhyaAI, an academic mentor."

        try:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Context:\n{context}\n\nQuestion:\n{query}",
                    },
                ],
                max_tokens=400,
                temperature=0.7,
            )

            return {
                "answer": resp.choices[0].message.content,
                "model": "gpt-3.5-turbo",
                "tokens_used": resp.usage.total_tokens
            }

        except Exception as e:
            return {"error": str(e)}

    # -------------------------------------------------------------------
    # Local Model Fallback
    # -------------------------------------------------------------------
    def generate_response_local(self, query, context):

        prompt = f"""
System: You are BodhyaAI.

Context:
{context}

User Question:
{query}

Assistant:
"""

        try:
            ans = generate_response(prompt, max_tokens=400)
        except Exception as e:
            ans = f"Local model error: {e}"

        return {"answer": ans, "model": "local_llm"}

    # -------------------------------------------------------------------
    # RAG Full Query
    # -------------------------------------------------------------------
    def query(self, question, k=5, filters=None, include_sources=True, external_context=None, model_name="gemini-2.5-flash"):

        logger.info(f"Processing RAG query: {question[:80]}... Model: {model_name}")

        docs = self.retrieve_context(question, k=k, filters=filters)
        if not docs and not external_context:
            return {"answer": "I don't have enough information.", "sources": []}

        context = self.build_context(docs)
        
        if external_context:
            context = f"{external_context}\n\nKnowledge Base:\n{context}"

        # 1️⃣ Gemini (Primary)
        if self.use_gemini:
            res = self.generate_response_gemini(question, context, model_name=model_name)
            if "error" not in res:
                return self._finalize(res, docs, include_sources)

        # 2️⃣ OpenAI fallback
        if self.use_openai:
            res = self.generate_response_openai(question, context)
            if "error" not in res:
                return self._finalize(res, docs, include_sources)

        # 3️⃣ Local model fallback
        res = self.generate_response_local(question, context)
        return self._finalize(res, docs, include_sources)

    # -------------------------------------------------------------------
    # Final Formatting
    # -------------------------------------------------------------------
    def _finalize(self, result, docs, include_sources):

        result["confidence"] = docs[0].get("score", 0.0)

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
