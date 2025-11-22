"""
RAG (Retrieval-Augmented Generation) Engine
Orchestrates retrieval, context building, and LLM generation with source attribution
"""

import os
from typing import List, Dict, Optional
import logging
from app.retriever import get_vector_store
from app.document_manager import get_document_manager
from app.knowledge_base import get_all_seed_documents
from app.inference import generate_response

# Optional: OpenAI integration
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available - install with: pip install openai")

# Gemini AI integration
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Google Generative AI not available - install with: pip install google-generativeai")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGEngine:
    """Retrieval-Augmented Generation engine"""
    
    def __init__(self, use_openai: bool = True, use_gemini: bool = True):
        """
        Initialize RAG engine
        
        Args:
            use_openai: Whether to use OpenAI API (requires API key)
            use_gemini: Whether to use Gemini API (requires API key)
        """
        self.vector_store = get_vector_store()
        self.document_manager = get_document_manager()
        self.use_openai = use_openai and OPENAI_AVAILABLE
        self.use_gemini = use_gemini and GEMINI_AVAILABLE
        
        # Initialize Gemini if available (PRIORITY)
        if self.use_gemini:
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
                logger.info("✅ Gemini 2.5 Flash initialized (PRIMARY)")
            else:
                logger.warning("GEMINI_API_KEY not found in environment")
                self.use_gemini = False
        
        # Initialize OpenAI if available (FALLBACK 1)
        if self.use_openai:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key:
                openai.api_key = api_key
                logger.info("✅ OpenAI API initialized (FALLBACK 1)")
            else:
                logger.warning("OPENAI_API_KEY not found in environment")
                self.use_openai = False
        
        logger.info(f"RAG Engine initialized (Gemini: {self.use_gemini}, OpenAI: {self.use_openai})")
    
    def initialize_knowledge_base(self, force_reload: bool = False):
        """
        Initialize knowledge base with seed documents
        
        Args:
            force_reload: Whether to reload even if index exists
        """
        # Check if index already exists
        index_path = "models/faiss_index.idx"
        metadata_path = "models/faiss_metadata.pkl"
        
        if not force_reload and os.path.exists(index_path) and os.path.exists(metadata_path):
            logger.info("Loading existing knowledge base...")
            self.vector_store.load_index(index_path, metadata_path)
            logger.info(f"Loaded {self.vector_store.index.ntotal} documents from disk")
            return
        
        logger.info("Initializing knowledge base with seed documents...")
        
        # Get seed documents
        seed_docs = get_all_seed_documents()
        
        # Process documents
        texts, metadatas = self.document_manager.process_batch(seed_docs)
        
        # Add to vector store
        self.vector_store.add_documents(texts, metadatas)
        
        # Save index
        os.makedirs("models", exist_ok=True)
        self.vector_store.save_index(index_path, metadata_path)
        
        logger.info(f"Knowledge base initialized with {len(texts)} chunks from {len(seed_docs)} documents")
    
    def retrieve_context(
        self,
        query: str,
        k: int = 5,
        min_score: float = 0.0,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Retrieve relevant context for a query
        
        Args:
            query: Search query
            k: Number of documents to retrieve
            min_score: Minimum similarity score
            filters: Optional metadata filters (category, tags)
            
        Returns:
            List of relevant documents with scores
        """
        results = self.vector_store.search(query, k=k, min_score=min_score)
        
        # Apply filters if provided
        if filters:
            filtered_results = []
            for result in results:
                metadata = result['metadata']
                
                # Check category filter
                if 'category' in filters and metadata.get('category') != filters['category']:
                    continue
                
                # Check tags filter
                if 'tags' in filters:
                    required_tags = filters['tags'] if isinstance(filters['tags'], list) else [filters['tags']]
                    if not any(tag in metadata.get('tags', []) for tag in required_tags):
                        continue
                
                filtered_results.append(result)
            
            results = filtered_results
        
        logger.info(f"Retrieved {len(results)} relevant documents for query")
        return results
    
    def build_context(self, retrieved_docs: List[Dict], max_tokens: int = 2000) -> str:
        """
        Build context string from retrieved documents
        
        Args:
            retrieved_docs: List of retrieved documents
            max_tokens: Maximum context length (approximate)
            
        Returns:
            Formatted context string
        """
        context_parts = []
        current_tokens = 0
        
        for idx, doc in enumerate(retrieved_docs):
            content = doc['content']
            source = doc['metadata'].get('source', 'Unknown')
            score = doc.get('score', 0)
            
            # Rough token estimation (1 token ≈ 4 characters)
            tokens = len(content) // 4
            
            if current_tokens + tokens > max_tokens:
                break
            
            context_parts.append(f"[Source {idx+1}: {source} (relevance: {score:.2f})]\n{content}\n")
            current_tokens += tokens
        
        context = "\n".join(context_parts)
        logger.info(f"Built context with {len(context_parts)} sources (~{current_tokens} tokens)")
        return context
    
    def generate_response_gemini(
        self,
        query: str,
        context: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict:
        """
        Generate response using Gemini API (PRIMARY)
        
        Args:
            query: User query
            context: Retrieved context
            system_prompt: Optional system prompt
            max_tokens: Maximum response length
            temperature: Sampling temperature
            
        Returns:
            Dict with answer and metadata
        """
        if not self.use_gemini:
            return {"error": "Gemini API not available"}
        
        # Build system context
        if not system_prompt:
            system_prompt = """You are BodhyaAI, an intelligent academic mentor and study assistant. 
You help students with study strategies, subject understanding, and academic guidance.
Answer questions based on the provided context. If the context doesn't contain enough information,
say so and provide general guidance. Always be supportive, encouraging, and clear."""
        
        # Build complete prompt
        full_prompt = f"""{system_prompt}

Context from knowledge base:
{context}

Student Question: {query}

Please provide a helpful, accurate answer based on the context above. If the context is relevant, 
reference it in your answer.  If additional information would be helpful, mention it."""
        
        try:
            # Configure generation settings
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            answer = response.text
            
            logger.info("✅ Gemini response generated")
            
            return {
                "answer": answer,
                "model": "gemini-pro",
                "tokens_used": None  # Gemini doesn't provide token count in same way
            }
        
        except Exception as e:
            logger.error(f"❌ Gemini API error: {e}")
            return {"error": str(e)}
    
    def generate_response_openai(
        self,
        query: str,
        context: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict:
        """
        Generate response using OpenAI API (FALLBACK 1)
        
        Args:
            query: User query
            context: Retrieved context
            system_prompt: Optional system prompt
            max_tokens: Maximum response length
            temperature: Sampling temperature
            
        Returns:
            Dict with answer and metadata
        """
        if not self.use_openai:
            return {"error": "OpenAI API not available"}
        
        # Build system prompt
        if not system_prompt:
            system_prompt = """You are BodhyaAI, an intelligent academic mentor and study assistant. 
You help students with study strategies, subject understanding, and academic guidance.
Answer questions based on the provided context. If the context doesn't contain enough information,
say so and provide general guidance. Always be supportive, encouraging, and clear."""
        
        # Build user prompt with context
        user_prompt = f"""Context from knowledge base:
{context}

Student Question: {query}

Please provide a helpful, accurate answer based on the context above. If the context is relevant, 
reference it in your answer. If additional information would be helpful, mention it."""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            answer = response.choices[0].message.content
            
            logger.info("✅ OpenAI response generated (fallback)")
            
            return {
                "answer": answer,
                "model": "gpt-3.5-turbo",
                "tokens_used": response.usage.total_tokens
            }
        
        except Exception as e:
            logger.error(f"❌ OpenAI API error: {e}")
            return {"error": str(e)}
    


    def generate_response_local(
        self,
        query: str,
        context: str
    ) -> Dict:
        """
        Generate response using local model (fallback)
        
        Args:
            query: User query
            context: Retrieved context
            
        Returns:
            Dict with answer
        """
        # Construct prompt for local LLM
        prompt = f"""System: You are BodhyaAI, an intelligent academic mentor. Use the provided context to answer the user's request.
        
Context:
{context}

User Request: {query}

Assistant:"""
        
        try:
            # Call local LLM inference
            answer = generate_response(prompt, max_tokens=512)
        except Exception as e:
            logger.error(f"Local LLM error: {e}")
            answer = "I encountered an error generating the report. Please ensure the local model is loaded."

        return {
            "answer": answer,
            "model": "local_llm",
            "tokens_used": 0
        }
    
    def query(
        self,
        question: str,
        k: int = 5,
        filters: Optional[Dict] = None,
        include_sources: bool = True
    ) -> Dict:
        """
        Complete RAG query: retrieve, generate, and cite sources
        WITH CASCADING FALLBACK: Gemini → OpenAI → Local LLM
        
        Args:
            question: User question
            k: Number of documents to retrieve
            filters: Optional metadata filters
            include_sources: Whether to include source information
            
        Returns:
            Dict with answer, sources, and metadata
        """
        logger.info(f"Processing RAG query: {question[:100]}...")
        
        # Step 1: Retrieve relevant documents
        retrieved_docs = self.retrieve_context(question, k=k, filters=filters)
        
        if not retrieved_docs:
            return {
                "answer": "I don't have enough information to answer that question. Could you rephrase or ask about study strategies, academic skills, or specific subjects?",
                "sources": [],
                "confidence": 0.0
            }
        
        # Step 2: Build context
        context = self.build_context(retrieved_docs)
        
        # Step 3: Generate response with CASCADING FALLBACK
        generation_result = None
        
        # Try Gemini first (FASTEST)
        if self.use_gemini:
            logger.info("🚀 Attempting Gemini API (primary)...")
            generation_result = self.generate_response_gemini(question, context)
            if "error" in generation_result:
                logger.warning(f"⚠️ Gemini failed: {generation_result['error']}, falling back to OpenAI...")
                generation_result = None
        
        # Fallback to OpenAI if Gemini failed
        if generation_result is None and self.use_openai:
            logger.info("🔄 Attempting OpenAI API (fallback 1)...")
            generation_result = self.generate_response_openai(question, context)
            if "error" in generation_result:
                logger.warning(f"⚠️ OpenAI failed: {generation_result['error']}, falling back to local LLM...")
                generation_result = None
        
        # Final fallback to local LLM
        if generation_result is None:
            logger.info("🤖 Using local LLM (fallback 2)...")
            generation_result = self.generate_response_local(question, context)
        
        # Step 4: Build response with citations
        response = {
            "answer": generation_result.get("answer", ""),
            "model": generation_result.get("model", "unknown"),
            "tokens_used": generation_result.get("tokens_used", 0)
        }
        
        # Add sources if requested
        if include_sources:
            sources = []
            for doc in retrieved_docs[:3]:  # Top 3 sources
                sources.append({
                    "content": doc['content'][:200] + "...",  # Excerpt
                    "source": doc['metadata'].get('source', 'Unknown'),
                    "category": doc['metadata'].get('category', 'unknown'),
                    "score": doc.get('score', 0.0)
                })
            response["sources"] = sources
        
        # Estimate confidence based on top source score
        if retrieved_docs:
            response["confidence"] = retrieved_docs[0].get('score', 0.0)
        else:
            response["confidence"] = 0.0
        
        logger.info(f"✅ Query completed using {response['model']} (confidence: {response['confidence']:.2f})")
        return response
    
    def get_stats(self) -> Dict:
        """Get RAG engine statistics"""
        return {
            "vector_store": self.vector_store.get_stats(),
            "document_manager": self.document_manager.get_stats(),
            "gemini_enabled": self.use_gemini,
            "openai_enabled": self.use_openai
        }


# Global instance
_rag_engine = None


def get_rag_engine() -> RAGEngine:
    """Get or create global RAG engine instance"""
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RAGEngine()
        # Initialize knowledge base on first load
        _rag_engine.initialize_knowledge_base()
    return _rag_engine
