# BodhyaAI AI Services Port Configuration

## Service Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **risk-svc** | 8000 | http://localhost:8000 | ✅ Running |
| **cog-svc** | 8001 | http://localhost:8001 | ✅ Running |
| **xai-svc** | 8002 | http://localhost:8002 | ✅ Running |
| **llm-svc** | 8003 | http://localhost:8003 | ✅ Running |

## Backend Service URLs

Update `.env` file:
```env
RISK_SERVICE_URL=http://localhost:8000
COG_SERVICE_URL=http://localhost:8001
XAI_SERVICE_URL=http://localhost:8002
LLM_SERVICE_URL=http://localhost:8003
```

## Start Commands

```bash
# Risk Prediction Service (Port 8000)
cd ai-services/risk-svc
source venv/bin/activate
uvicorn service:app --reload --port 8000

# Cognitive Profiling Service (Port 8001)
cd ai-services/cog-svc
source venv/bin/activate
uvicorn service:app --reload --port 8001

# Explainability Service (Port 8002)
cd ai-services/xai-svc
source venv/bin/activate
uvicorn service:app --reload --port 8002

# LLM/RAG Service (Port 8003)
cd ai-services/llm-svc
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

## Health Check

```bash
curl http://localhost:8000/  # risk-svc
curl http://localhost:8001/  # cog-svc
curl http://localhost:8002/  # xai-svc
curl http://localhost:8003/health  # llm-svc
```
