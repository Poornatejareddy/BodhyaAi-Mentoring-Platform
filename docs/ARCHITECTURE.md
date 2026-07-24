# System Architecture Design

This document details the system design, communication protocols, and architectural patterns of the BodhyaAI platform.

---

## 1. Architectural Style

BodhyaAI is structured as an **API Gateway + Specialized Microservices** monorepo:

```
                  ┌───────────────────────────────┐
                  │     React Frontend (Vite)     │
                  └───────────────┬───────────────┘
                                  │ HTTP REST & Socket.IO
                                  ▼
                  ┌───────────────────────────────┐
                  │    Express Backend Gateway    │
                  └───────┬───────────────┬───────┘
                          │               │
            Mongoose ODM  │               │ HTTP REST
                          ▼               ▼
                  ┌───────────────┐ ┌──────────────────────────────────────────────┐
                  │ MongoDB Atlas │ │             AI Services (FastAPI)            │
                  └───────────────┘ │  ┌──────────────┐          ┌──────────────┐  │
                                    │  │ RISK-SVC     │          │ XAI-SVC      │  │
                                    │  │ (Port 8001)  │          │ (Port 8002)  │  │
                                    │  └──────────────┘          └──────────────┘  │
                                    │  ┌──────────────┐          ┌──────────────┐  │
                                    │  │ COG-SVC      │          │ LLM-SVC      │  │
                                    │  │ (Port 8000)  │          │ (Port 8003)  │  │
                                    │  └──────────────┘          └──────────────┘  │
                                    └──────────────────────────────────────────────┘
```

---

## 2. Component Directory

### A. Express Backend Gateway (Port `5001`)
*   **Role**: Handles user management, authentication (JWT), chat persistence, audit logging, and dashboard statistics aggregations.
*   **Proxying**: Acts as an API gateway that validates tokens, formats inputs, routes calls to python microservices, and returns unified HTTP responses.

### B. Cognitive Profiling Service (`cog-svc` - Port `8000`)
*   **Role**: Computes personality profiles using the BFI-44 (OCEAN/Big Five Inventory) model.
*   **Features**: Exposes survey generation URLs, maps answers to standard trait distributions, and produces PDF profiling reports.

### C. Academic Risk Prediction Service (`risk-svc` - Port `8001`)
*   **Role**: Serves an XGBoost classification model mapping 21 behavioral, socio-economic, and academic inputs.
*   **Outputs**: Attrition and academic performance risk status ("High", "Medium", "Low") with probability scores.

### D. Explainable AI Service (`xai-svc` - Port `8002`)
*   **Role**: Translates black-box ML outputs into diagnostic explanations using SHAP force-value calculations.
*   **Significance**: Tells mentors which features (e.g., absenteeism, low exam grades) most strongly influenced the risk classification.

### E. LLM/RAG Service (`llm-svc` - Port `8003`)
*   **Role**: Generates contextual interventions and cohort summaries.
*   **Engine**: Official Google GenAI Python SDK (`google-genai`) querying Gemini (`gemini-3.5-flash` with fallback cascade).
*   **Knowledge Integration**: Searches a FAISS vector index of study guides using Sentence Transformers to retrieve optimal study suggestions (e.g., Pomodoro or Cornell methods).

---

## 3. Communication Protocols

1.  **RESTful HTTP**:
    *   Used for frontend-to-gateway interactions.
    *   Used for gateway-to-microservice internal requests.
2.  **WebSockets (Socket.IO)**:
    *   Used for real-time peer-to-peer chat between Mentors and Students.
    *   Features typing indicators, online status syncing, and read receipts.
3.  **External REST APIs**:
    *   Used by the `llm-svc` to request text generation from Google's `generativelanguage.googleapis.com` servers.

---

## 4. Operational & Startup Model

Instead of requiring manual configuration of multiple service layers, BodhyaAI uses an operational startup suite centered in `/scripts`:

1.  **Single Python Virtual Environment**: All 4 FastAPI python microservices run in a unified, shared virtual environment located at `/ai-services/venv` to minimize resource footprints.
2.  **PID Caching**: The startup script caches the PIDs of background processes under `/.pids/`, allowing `stop_project.sh` to shut down the stack cleanly without dangling ports.
3.  **Automatic Port Auditing**: Scripts perform a pre-check on ports `5001`, `5173`, and `8000-8003` to resolve conflicts before launching.
