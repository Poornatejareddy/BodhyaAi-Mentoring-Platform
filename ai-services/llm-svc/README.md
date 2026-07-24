# BodhyaAI LLM Service

> Gemini-powered LLM microservice with RAG, streaming chat, and intelligent study recommendations.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  LLM Service                    │
│                                                 │
│  ┌───────────┐   ┌──────────────────────────┐   │
│  │ FastAPI   │──▶│ ModelManager              │   │
│  │ Endpoints │   │  ├─ gemini-2.5-flash      │   │
│  └───────────┘   │  ├─ gemini-2.5-flash-lite │   │
│       │          │  ├─ gemini-2.0-flash      │   │
│       ▼          │  └─ gemini-2.0-flash-lite │   │
│  ┌───────────┐   └──────────────────────────┘   │
│  │ RAGEngine │                                  │
│  │  ├ FAISS  │   ┌──────────────────────────┐   │
│  │  └ Embed  │──▶│ google-genai SDK v2.14+  │   │
│  └───────────┘   └──────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Stack

| Component | Technology |
|---|---|
| **LLM Provider** | Google Gemini API (exclusively) |
| **SDK** | `google-genai` v2.14+ |
| **Framework** | FastAPI + Uvicorn |
| **Vector Store** | FAISS (CPU) |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` |
| **Fallback Strategy** | Multi-model cascade with retry |

## Model Fallback Strategy

The `ModelManager` class tries models in this order:

1. **gemini-2.5-flash** — Primary (best quality/speed ratio)
2. **gemini-2.5-flash-lite** — Lighter variant
3. **gemini-2.0-flash** — Previous generation
4. **gemini-2.0-flash-lite** — Minimum viable fallback

Each model is retried up to 3 times before moving to the next. The last successful model is cached for subsequent requests.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health + SDK version + active model |
| `POST` | `/chat` | Non-streaming chat |
| `POST` | `/chat/stream` | Streaming chat (SSE) |
| `POST` | `/rag/query` | Semantic search with RAG |
| `POST` | `/rag/chat` | Conversational AI with RAG context |
| `POST` | `/rag/study-plan` | Generate personalized study plan |
| `POST` | `/rag/interventions` | Recommend interventions for at-risk students |
| `POST` | `/rag/report` | Generate class performance report |
| `GET` | `/rag/stats` | RAG engine statistics |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ | — | Google AI Studio API key |
| `GEMINI_MODEL` | ❌ | — | Override default model |
| `REQUEST_TIMEOUT` | ❌ | `30.0` | HTTP timeout (seconds) |
| `MAX_RETRIES` | ❌ | `3` | Retry count per model |
| `LLM_SVC_PORT` | ❌ | `8003` | Service port |

## Running Locally

```bash
# From ai-services/ directory
source venv/bin/activate
cd llm-svc
python run.py
```

## Running Tests

```bash
# Unit tests (mocked, no API key needed)
PYTHONPATH=llm-svc venv/bin/python llm-svc/test_service.py

# Integration test (requires valid GEMINI_API_KEY)
PYTHONPATH=llm-svc venv/bin/python llm-svc/test_gemini.py
```
