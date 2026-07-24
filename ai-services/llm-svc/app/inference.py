# app/inference.py
import logging
import time
from typing import List, Optional, Generator
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_MODEL, REQUEST_TIMEOUT, MAX_RETRIES

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LLMService")

class ModelManager:
    """
    Centralized ModelManager responsible for:
    - Order of fallback models
    - Handling retry logic across available models
    - Caching the last successful model to minimize request latency on subsequent calls
    """
    PREFERRED_MODELS = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite"
    ]

    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.client = None
        self._cached_model = None
        self.last_successful_request = None

        if self.api_key:
            try:
                # Initialize GenAI Client using official google-genai SDK
                self.client = genai.Client(
                    api_key=self.api_key,
                    http_options={"timeout": int(REQUEST_TIMEOUT * 1000)}
                )
                logger.info("GenAI Client successfully initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize GenAI Client: {e}")
        else:
            logger.warning("GEMINI_API_KEY is not configured.")

    @property
    def current_model(self) -> Optional[str]:
        return self._cached_model

    def get_models_to_try(self, requested_model: Optional[str] = None) -> List[str]:
        """
        Returns order of models to attempt.
        If a model is explicitly requested or GEMINI_MODEL override is configured,
        it is placed at the front of the list, followed by the preferred list.
        """
        models = []
        if requested_model:
            models.append(requested_model)
        if GEMINI_MODEL and GEMINI_MODEL not in models:
            models.append(GEMINI_MODEL)
        
        # Add cached model at the front if it's already set and not already in list
        if self._cached_model and self._cached_model not in models:
            models.append(self._cached_model)
            
        for m in self.PREFERRED_MODELS:
            if m not in models:
                models.append(m)
        return models

    def execute_with_fallback(self, func, *args, requested_model: Optional[str] = None, **kwargs):
        """
        Executes a genai call, automatically falling back across models if one fails.
        """
        if not self.api_key:
            logger.error("No API Key configured.")
            raise ValueError("Invalid API key.")

        if not self.client:
            # Re-attempt client initialization in case it failed before
            try:
                self.client = genai.Client(
                    api_key=self.api_key,
                    http_options={"timeout": int(REQUEST_TIMEOUT * 1000)}
                )
            except Exception as e:
                logger.error(f"GenAI Client re-initialization failed: {e}")
                raise RuntimeError("Gemini API unavailable.")

        models_to_try = self.get_models_to_try(requested_model)
        last_error = None

        for model in models_to_try:
            retry_count = 0
            while retry_count < MAX_RETRIES:
                try:
                    start_time = time.time()
                    logger.info(f"Attempting content generation using model: {model} (attempt {retry_count + 1})")
                    
                    # Call target function passing client and model
                    result = func(self.client, model, *args, **kwargs)
                    
                    latency = time.time() - start_time
                    logger.info(f"Successfully generated content using model: {model} in {latency:.4f}s")
                    
                    # Cache the successful model
                    if self._cached_model != model:
                        logger.info(f"Caching successful model: {model}")
                        self._cached_model = model
                        
                    self.last_successful_request = time.time()
                    return result
                except Exception as e:
                    retry_count += 1
                    last_error = e
                    logger.warning(f"Error calling model {model} (attempt {retry_count}/{MAX_RETRIES}): {e}")
                    
                    # Fast fail on key errors
                    err_msg = str(e).lower()
                    if "api key" in err_msg or "invalid" in err_msg or "unauthorized" in err_msg or "api_key" in err_msg:
                        logger.error("Invalid API key detected. Aborting execution.")
                        raise ValueError("Invalid API key.")
                    
            # Fallback triggered
            logger.warning(f"Model {model} failed all retry attempts. Trying fallback model...")

        # Parse the last error and raise user-friendly Exception
        err_msg = str(last_error).lower()
        if "quota" in err_msg or "exhausted" in err_msg or "429" in err_msg:
            raise RuntimeError("Gemini quota exceeded.")
        elif "api key" in err_msg or "invalid" in err_msg or "unauthorized" in err_msg or "api_key" in err_msg:
            raise ValueError("Invalid API key.")
        elif "not found" in err_msg or "deprecated" in err_msg or "404" in err_msg:
            raise RuntimeError("Gemini model not found or deprecated.")
        elif "unavailable" in err_msg or "timeout" in err_msg or "connection" in err_msg:
            raise RuntimeError("Gemini API unavailable.")
        else:
            raise RuntimeError("Temporary AI service issue.")

# Global instance of ModelManager
model_manager = ModelManager()

class LLMService:
    """
    Exposes clean service layer logic using the ModelManager.
    """
    def __init__(self, manager: ModelManager):
        self.model_manager = manager

    def generate_response(self, prompt: str, model_name: Optional[str] = None) -> str:
        """
        Generates content from the model using the fallback strategy.
        """
        def _generate(client, model):
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            if not response.text:
                raise RuntimeError("Empty response received from Gemini.")
            return response.text.strip()

        return self.model_manager.execute_with_fallback(_generate, requested_model=model_name)

    def summarize(self, text: str, model_name: Optional[str] = None) -> str:
        prompt = f"Summarize the following text clearly and concisely:\n\n{text}"
        return self.generate_response(prompt, model_name=model_name)

    def explain(self, topic: str, context: Optional[str] = None, model_name: Optional[str] = None) -> str:
        prompt = f"Explain the following topic: {topic}"
        if context:
            prompt += f"\nContext:\n{context}"
        return self.generate_response(prompt, model_name=model_name)

    def analyze(self, data: str, model_name: Optional[str] = None) -> str:
        prompt = f"Analyze the following data and provide insights:\n\n{data}"
        return self.generate_response(prompt, model_name=model_name)

    def chat(self, message: str, history: Optional[list] = None, context: Optional[str] = None, model_name: Optional[str] = None) -> str:
        prompt = ""
        if context:
            prompt += f"System Context:\n{context}\n\n"
        if history:
            prompt += "Conversation history:\n"
            for msg in history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                prompt += f"{role.capitalize()}: {content}\n"
            prompt += "\n"
        prompt += f"User: {message}\nAssistant:"
        return self.generate_response(prompt, model_name=model_name)

# Instantiated LLMService
llm_service = LLMService(model_manager)

# Legacy imports wrappers to maintain compatibility with callers
def generate_response(prompt: str, model_name: Optional[str] = None) -> str:
    """
    Wrapper for existing callers in RAGEngine or main API endpoints.
    """
    return llm_service.generate_response(prompt, model_name=model_name)

def stream_response(prompt: str, model_name: Optional[str] = None, chunk_size: int = 12) -> Generator[str, None, None]:
    """
    Generator wrapper for stream endpoints.
    """
    full = generate_response(prompt, model_name=model_name)
    for i in range(0, len(full), chunk_size):
        yield full[i:i+chunk_size]
        time.sleep(0.01)
