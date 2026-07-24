# BodhyaAI Python Services Monorepo

Welcome to the consolidated BodhyaAI AI Services monorepo. This directory houses all FastAPI microservices that power BodhyaAI's mentoring platform. The architecture has been consolidated from individual services with disjointed virtual environments and duplicated code, into a streamlined, high-performance monorepo with a single shared environment, a shared utility package, and centralized life-cycle script controls.

---

## Directory Structure

```text
ai-services/
├── common/                     # Shared package containing reusable modules
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Unified Pydantic schemas (AcademicInput, SurveyInput, RiskInput)
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── helper.py           # Model loaders & risk model preprocessing
│   │   └── logging.py          # Structured, unified console logging configuration
│   ├── __init__.py
│   └── config.py               # Shared configuration loader (reads centralized .env)
├── cog-svc/                    # Cognitive / Personality Profiling Service (Port 8000)
│   ├── models/                 # Serialized personality models
│   └── service.py
├── risk-svc/                   # Academic Risk Classification Service (Port 8001)
│   ├── models/                 # Serialized academic risk models
│   ├── datasets/               # Dataset directory (for training)
│   └── service.py
├── xai-svc/                    # Explainable AI (SHAP & feature contribution) (Port 8002)
│   └── service.py
├── llm-svc/                    # LLM RAG Mentoring Assistant Service (Port 8003)
│   ├── app/                    # Inference & vector store logic
│   ├── models/                 # FAISS Index files & local models
│   ├── run.py
│   └── ...
├── venv/                       # Shared Python Virtual Environment (gitignored)
├── requirements.txt            # Shared dependencies file (consolidated & deduplicated)
├── requirements-lock.txt       # Shared lockfile of exact package versions (generated automatically)
├── pyproject.toml              # Standard PEP-517 setup configuring common as editable package
├── start_all_services.sh       # Main startup script (lifespan, dependencies, model checks)
├── stop_all_services.sh        # Shutdown script (clean termination & port safety sweep)
└── test-integration.sh         # E2E Health checks & Mock request verification suite
```

---

## Getting Started

### Prerequisites

- Python 3.9+ (Python 3.10.12 tested)
- Centralized `.env` file at the root or within `ai-services/` (see `.env.example` at the root)

### Launching All Services

To setup the virtual environment, install and verify dependencies, link the `common` package, and start all four microservices in the background, run:

```bash
./start_all_services.sh
```

This script will:
1. Verify/create a single shared virtual environment under `ai-services/venv/`.
2. Install consolidated dependencies from `requirements.txt`.
3. Install the `common` library in editable mode (`pip install -e .`).
4. Generate/update the `requirements-lock.txt` lockfile.
5. Perform sanity checks on serialized machine learning models (checking for the presence of risk and personality models).
6. Start each service in the background under its correct port:
   - **cog-svc**: Port 8000
   - **risk-svc**: Port 8001
   - **xai-svc**: Port 8002
   - **llm-svc**: Port 8003
7. Save the active process PIDs to `.services.pid` and direct service console logs into `logs/`.

### Monitoring Logs

Service logs are stored in the `logs/` directory:

```bash
tail -f logs/cog-svc.log
tail -f logs/risk-svc.log
tail -f logs/xai-svc.log
tail -f logs/llm-svc.log
```

### Stopping Services

To stop all background microservices gracefully, run:

```bash
./stop_all_services.sh
```

This script reads from `.services.pid` to stop processes, and sweeps ports 8000-8003 using `lsof` to ensure no orphan processes are left listening.

---

## Verifying Integration

You can run the end-to-end integration test suite to verify the status and correctness of all services:

```bash
./test-integration.sh
```

---

## Key Refactoring Highlights

1. **Shared Package (`common`)**: Extracted all Pydantic schemas, standard environment configuration loading, shared logging configurations, and common preprocessing helper functions to avoid duplication.
2. **Standardized Preprocessing**: Implemented `common.utils.helper.preprocess_risk_features()` which acts as a single source of truth for converting incoming API dictionaries into the exact DataFrame dimensions and feature order expected by the scikit-learn models (for both `risk-svc` and `xai-svc`).
3. **Consolidated Environment Variable Management**: Uses python-dotenv to dynamically discover the central `.env` config file by climbing up to the repository root. All services now load API credentials, service ports, and host parameters from the centralized `common.config`.
4. **Editable Installation**: By using a PEP-517 `pyproject.toml`, the shared package is installed as an editable dependency (`pip install -e .`), allowing seamless imports like `from common.config import HOST` from any subdirectory without mutating `sys.path`.
5. **No Version Conflicts**: Deduplicated overlapping requirements from all four services into a unified `requirements.txt`, specifying scikit-learn (`1.4.0`), fastapi (`0.109.0`), and xgboost (`2.0.3`) version parity.
