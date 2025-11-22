"""
FAISS-based Vector Store for Retrieval-Augmented Generation (RAG)
Handles document embedding, indexing, and semantic search.
"""

import os
import pickle
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VectorStore:
    """FAISS-based vector store for semantic search"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize vector store with sentence transformer model
        
        Args:
            model_name: HuggingFace model name for embeddings
        """
        self.model_name = model_name
        self.embedding_model = None
        self.index = None
        self.documents = []  # Store document metadata
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        
        logger.info(f"Initializing VectorStore with model: {model_name}")
        self._load_embedding_model()
        self._initialize_index()
    
    def _load_embedding_model(self):
        """Load sentence transformer model"""
        try:
            self.embedding_model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded embedding model: {self.model_name}")
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise
    
    def _initialize_index(self):
        """Initialize FAISS index"""
        # Using IndexFlatL2 for exact search (good for small datasets < 100k)
        self.index = faiss.IndexFlatL2(self.dimension)
        logger.info(f"Initialized FAISS index with dimension {self.dimension}")
    
    def embed_text(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text
        
        Args:
            text: Input text to embed
            
        Returns:
            Embedding vector as numpy array
        """
        try:
            embedding = self.embedding_model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Error embedding text: {e}")
            raise
    
    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of texts to embed
            
        Returns:
            Matrix of embeddings
        """
        try:
            embeddings = self.embedding_model.encode(
                texts,
                convert_to_numpy=True,
                show_progress_bar=True
            )
            return embeddings
        except Exception as e:
            logger.error(f"Error embedding batch: {e}")
            raise
    
    def add_documents(
        self,
        texts: List[str],
        metadatas: List[Dict],
        batch_size: int = 32
    ) -> None:
        """
        Add documents to the vector store
        
        Args:
            texts: List of document texts
            metadatas: List of metadata dicts for each document
            batch_size: Batch size for embedding
        """
        if len(texts) != len(metadatas):
            raise ValueError("texts and metadatas must have same length")
        
        logger.info(f"Adding {len(texts)} documents to vector store...")
        
        # Generate embeddings
        embeddings = self.embed_batch(texts)
        
        # Add to FAISS index
        self.index.add(embeddings.astype('float32'))
        
        # Store metadata
        for text, metadata in zip(texts, metadatas):
            self.documents.append({
                'content': text,
                'metadata': metadata
            })
        
        logger.info(f"Successfully added {len(texts)} documents. Total: {len(self.documents)}")
    
    def search(
        self,
        query: str,
        k: int = 5,
        min_score: float = 0.0
    ) -> List[Dict]:
        """
        Semantic search for top-k similar documents
        
        Args:
            query: Search query
            k: Number of results to return
            min_score: Minimum similarity score (0-1, after conversion)
            
        Returns:
            List of dicts with 'content', 'metadata', and 'score'
        """
        if self.index.ntotal == 0:
            logger.warning("Vector store is empty")
            return []
        
        # Embed query
        query_embedding = self.embed_text(query)
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        
        # Search FAISS index
        distances, indices = self.index.search(query_embedding, min(k, self.index.ntotal))
        
        # Convert L2 distances to similarity scores (0-1)
        # Lower distance = higher similarity
        # Using exponential decay: similarity = exp(-distance)
        similarities = np.exp(-distances[0])
        
        # Build results
        results = []
        for idx, (doc_idx, similarity) in enumerate(zip(indices[0], similarities)):
            if doc_idx < len(self.documents) and similarity >= min_score:
                doc = self.documents[doc_idx]
                results.append({
                    'content': doc['content'],
                    'metadata': doc['metadata'],
                    'score': float(similarity),
                    'rank': idx + 1
                })
        
        logger.info(f"Search returned {len(results)} results for query: '{query[:50]}...'")
        return results
    
    def save_index(self, index_path: str, metadata_path: str):
        """
        Save FAISS index and metadata to disk
        
        Args:
            index_path: Path to save FAISS index
            metadata_path: Path to save document metadata
        """
        try:
            # Save FAISS index
            faiss.write_index(self.index, index_path)
            
            # Save documents metadata
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.documents, f)
            
            logger.info(f"Saved index to {index_path} and metadata to {metadata_path}")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
            raise
    
    def load_index(self, index_path: str, metadata_path: str):
        """
        Load FAISS index and metadata from disk
        
        Args:
            index_path: Path to FAISS index
            metadata_path: Path to document metadata
        """
        try:
            # Load FAISS index
            self.index = faiss.read_index(index_path)
            
            # Load documents metadata
            with open(metadata_path, 'rb') as f:
                self.documents = pickle.load(f)
            
            logger.info(f"Loaded index from {index_path} with {len(self.documents)} documents")
        except Exception as e:
            logger.error(f"Error loading index: {e}")
            raise
    
    def get_stats(self) -> Dict:
        """Get statistics about the vector store"""
        return {
            'total_documents': len(self.documents),
            'index_size': self.index.ntotal,
            'dimension': self.dimension,
            'model': self.model_name
        }
    
    def clear(self):
        """Clear all documents and reset index"""
        self.documents = []
        self._initialize_index()
        logger.info("Vector store cleared")


# Global instance
_vector_store = None


def get_vector_store() -> VectorStore:
    """Get or create global vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
