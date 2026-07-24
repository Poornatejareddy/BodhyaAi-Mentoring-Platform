# AI integration report

Risk service uses a joblib/XGBoost pipeline with policy overrides and SHAP. Cognitive service predicts five traits then applies deterministic profile/career rules. XAI duplicates artifact loading/explanation. LLM service uses Gemini generation with fallback but its RAG retriever currently uses `sentence-transformers` and FAISS.

Gemini generation flow is source-level present (`google.genai`, API key, fallback models, retries), but not live-tested. Missing production controls: request timeouts across all routes, structured prompt/response schema, PII minimization, prompt-injection defenses, safety moderation, evaluation data, token/cost budgets, model/version telemetry, and human approval for mentoring recommendations.

To meet an all-Gemini requirement: replace `SentenceTransformer` in `llm-svc/app/retriever.py` with a Gemini embedding client, version/rebuild FAISS embeddings, remove `sentence-transformers`, `transformers`, and unused OpenAI lock dependencies, then test retrieval quality and latency. Estimated effort: medium/high (3–7 engineering days plus evaluation).
