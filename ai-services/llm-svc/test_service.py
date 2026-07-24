import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Set up system paths so that it can find common and app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

from app.main import health
from app.inference import ModelManager, LLMService

class TestGeminiIntegration(unittest.TestCase):

    def setUp(self):
        # Fresh patches for clean state
        self.patcher_key = patch('app.inference.GEMINI_API_KEY', 'dummy-key-for-test')
        self.mock_api_key = self.patcher_key.start()
        
    def tearDown(self):
        self.patcher_key.stop()

    @patch('app.inference.genai.Client')
    def test_api_key_validation_success(self, mock_client_class):
        # Client initializes successfully when key is present
        manager = ModelManager()
        self.assertEqual(manager.api_key, 'dummy-key-for-test')
        self.assertIsNotNone(manager.client)

    @patch('app.inference.GEMINI_API_KEY', None)
    def test_api_key_validation_failure(self):
        # Client cannot perform operations without an API key configured
        manager = ModelManager()
        self.assertIsNone(manager.client)
        
        with self.assertRaises(ValueError) as ctx:
            manager.execute_with_fallback(lambda c, m: "success")
        self.assertEqual(str(ctx.exception), "Invalid API key.")

    @patch('app.inference.genai.Client')
    def test_fallback_model_flow(self, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        manager = ModelManager()
        manager.client = mock_client
        
        # Test function fails on gemini-2.5-flash and succeeds on the next (gemini-2.5-flash-lite)
        def dummy_func(client, model):
            if model == "gemini-2.5-flash":
                raise Exception("API Error: Model is temporarily unavailable")
            return f"Response from {model}"
            
        result = manager.execute_with_fallback(dummy_func)
        
        self.assertEqual(result, "Response from gemini-2.5-flash-lite")
        self.assertEqual(manager.current_model, "gemini-2.5-flash-lite")

    @patch('app.inference.genai.Client')
    def test_invalid_model_fallback(self, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        manager = ModelManager()
        manager.client = mock_client
        
        # Test requested model is invalid, triggers fallback to preferred
        def dummy_func(client, model):
            if model == "invalid-model":
                raise Exception("404 Model not found")
            return f"Response from {model}"
            
        result = manager.execute_with_fallback(dummy_func, requested_model="invalid-model")
        self.assertEqual(result, "Response from gemini-2.5-flash")
        self.assertEqual(manager.current_model, "gemini-2.5-flash")

    @patch('app.inference.genai.Client')
    def test_quota_exceeded_error_handling(self, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        manager = ModelManager()
        manager.client = mock_client
        
        # All models throw quota exceeded / 429
        def dummy_func(client, model):
            raise Exception("ResourceExhausted: 429 Quota exceeded for model")
            
        with self.assertRaises(RuntimeError) as ctx:
            manager.execute_with_fallback(dummy_func)
        self.assertEqual(str(ctx.exception), "Gemini quota exceeded.")

    @patch('app.inference.genai.Client')
    def test_timeout_error_handling(self, mock_client_class):
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        manager = ModelManager()
        manager.client = mock_client
        
        # All models throw connection or timeout
        def dummy_func(client, model):
            raise Exception("DeadlineExceeded: 504 Gateway Timeout or Service Unavailable")
            
        with self.assertRaises(RuntimeError) as ctx:
            manager.execute_with_fallback(dummy_func)
        self.assertEqual(str(ctx.exception), "Gemini API unavailable.")

    def test_health_endpoint(self):
        # Directly invoke the handler function to verify health outputs
        data = health()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "llm-svc")
        self.assertIn("sdk version", data)
        self.assertIn("current selected model", data)
        self.assertIn("API configured", data)
        self.assertIn("last successful request", data)

if __name__ == '__main__':
    unittest.main()
