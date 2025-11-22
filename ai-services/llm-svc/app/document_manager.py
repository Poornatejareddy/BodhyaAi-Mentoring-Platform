"""
Document Manager for chunking, preprocessing, and managing documents
"""

import re
import hashlib
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentManager:
    """Manages document preprocessing, chunking, and metadata"""
    
    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        min_chunk_length: int = 100
    ):
        """
        Initialize document manager
        
        Args:
            chunk_size: Target size for each chunk (in tokens/words)
            chunk_overlap: Overlap between chunks (in tokens/words)
            min_chunk_length: Minimum chunk length to keep
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_length = min_chunk_length
        self.processed_docs = set()  # Track processed doc hashes for deduplication
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text
        
        Args:
            text: Raw text
            
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-\'\"]+', '', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        # Simple sentence splitter (can be improved with NLTK)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def chunk_text(
        self,
        text: str,
        metadata: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Chunk text into smaller pieces with overlap
        
        Args:
            text: Input text to chunk
            metadata: Optional metadata to attach to each chunk
            
        Returns:
            List of chunk dicts with content and metadata
        """
        # Clean text
        text = self.clean_text(text)
        
        # Split into sentences
        sentences = self.split_into_sentences(text)
        
        if not sentences:
            logger.warning("No sentences found in text")
            return []
        
        # Create chunks
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            
            # Check if adding this sentence exceeds chunk size
            if current_length + sentence_length > self.chunk_size and current_chunk:
                # Save current chunk
                chunk_text = ' '.join(current_chunk)
                if len(chunk_text.split()) >= self.min_chunk_length:
                    chunks.append(chunk_text)
                
                # Start new chunk with overlap
                overlap_words = []
                overlap_length = 0
                for s in reversed(current_chunk):
                    s_len = len(s.split())
                    if overlap_length + s_len <= self.chunk_overlap:
                        overlap_words.insert(0, s)
                        overlap_length += s_len
                    else:
                        break
                
                current_chunk = overlap_words
                current_length = overlap_length
            
            current_chunk.append(sentence)
            current_length += sentence_length
        
        # Add final chunk
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            if len(chunk_text.split()) >= self.min_chunk_length:
                chunks.append(chunk_text)
        
        # Build chunk objects with metadata
        chunk_objs = []
        base_metadata = metadata or {}
        
        for idx, chunk_content in enumerate(chunks):
            chunk_metadata = {
                **base_metadata,
                'chunk_index': idx,
                'total_chunks': len(chunks),
                'chunk_size': len(chunk_content.split()),
                'created_at': datetime.utcnow().isoformat()
            }
            
            chunk_objs.append({
                'content': chunk_content,
                'metadata': chunk_metadata
            })
        
        logger.info(f"Created {len(chunk_objs)} chunks from text of length {len(text)}")
        return chunk_objs
    
    def is_duplicate(self, text: str) -> bool:
        """
        Check if document has already been processed
        
        Args:
            text: Document text
            
        Returns:
            True if duplicate, False otherwise
        """
        doc_hash = hashlib.md5(text.encode()).hexdigest()
        if doc_hash in self.processed_docs:
            return True
        self.processed_docs.add(doc_hash)
        return False
    
    def process_document(
        self,
        text: str,
        source: str,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        skip_duplicates: bool = True
    ) -> List[Dict]:
        """
        Process a complete document: clean, chunk, and add metadata
        
        Args:
            text: Document text
            source: Source identifier (filename, URL, etc.)
            category: Document category
            tags: List of tags
            skip_duplicates: Whether to skip duplicate documents
            
        Returns:
            List of processed chunks ready for embedding
        """
        # Check for duplicates
        if skip_duplicates and self.is_duplicate(text):
            logger.warning(f"Skipping duplicate document: {source}")
            return []
        
        # Build metadata
        metadata = {
            'source': source,
            'category': category or 'uncategorized',
            'tags': tags or [],
            'processed_at': datetime.utcnow().isoformat()
        }
        
        # Chunk the document
        chunks = self.chunk_text(text, metadata)
        
        logger.info(f"Processed document '{source}' into {len(chunks)} chunks")
        return chunks
    
    def process_batch(
        self,
        documents: List[Dict]
    ) -> Tuple[List[str], List[Dict]]:
        """
        Process multiple documents in batch
        
        Args:
            documents: List of dicts with 'text', 'source', 'category', 'tags'
            
        Returns:
            Tuple of (texts, metadatas) ready for vector store
        """
        all_texts = []
        all_metadatas = []
        
        for doc in documents:
            chunks = self.process_document(
                text=doc['text'],
                source=doc.get('source', 'unknown'),
                category=doc.get('category'),
                tags=doc.get('tags'),
                skip_duplicates=doc.get('skip_duplicates', True)
            )
            
            for chunk in chunks:
                all_texts.append(chunk['content'])
                all_metadatas.append(chunk['metadata'])
        
        logger.info(f"Processed {len(documents)} documents into {len(all_texts)} chunks")
        return all_texts, all_metadatas
    
    def get_stats(self) -> Dict:
        """Get processing statistics"""
        return {
            'chunk_size': self.chunk_size,
            'chunk_overlap': self.chunk_overlap,
            'min_chunk_length': self.min_chunk_length,
            'processed_documents': len(self.processed_docs)
        }


# Global instance
_document_manager = None


def get_document_manager() -> DocumentManager:
    """Get or create global document manager instance"""
    global _document_manager
    if _document_manager is None:
        _document_manager = DocumentManager()
    return _document_manager
