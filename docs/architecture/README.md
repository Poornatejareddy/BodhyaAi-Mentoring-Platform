# System architecture

```text
React/Vite SPA ── HTTPS + JWT ──> Express API ──> MongoDB
       │                  │              │
       └── Socket.IO <────┘              ├── risk-svc (FastAPI/XGBoost/SHAP)
                                         ├── cog-svc (FastAPI trait models)
                                         ├── xai-svc (FastAPI explanations)
                                         └── llm-svc (FastAPI/Gemini/FAISS)
```

`backend/src/index.js` mounts `/api/auth`, `/students`, `/mentors`, `/admin`, `/chat`, `/alerts`, `/audit`, `/interventions`, `/risk`, `/personality`, and `/llm`. MongoDB is the system of record. Socket.IO is initialized on the Express HTTP server. Docker Compose starts Mongo, frontend, backend and four AI containers on a bridge network.

Important mismatch to resolve: backend defaults to port 5001 while Compose sets 5000. Treat Compose environment configuration as authoritative only after a deployment smoke test.
