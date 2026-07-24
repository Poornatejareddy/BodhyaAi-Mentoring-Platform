# Systems Deployment Guide

This document defines deployment configurations for local validation, multi-container orchestration, and production deployments.

---

## 1. Local Development Launch

The monorepo coordinates execution using local shell scripts.

### Initialization
Executes system checks, provisions configuration files, runs package installs, builds the shared Python virtual environment:
```bash
./scripts/setup_project.sh
```

### Running the Services
Concurrently boots MongoDB, FastAPI microservices, Express gateway, and Vite dev server:
```bash
./scripts/run_project.sh
```

---

## 2. Containerized Orchestration (Docker Compose)

Docker compositions are isolated by target environments.

### Ports Topology

| Container | Service | Port Binding | Exposed |
|---|---|---|---|
| `db` | MongoDB | `27017:27017` | Internal Only |
| `cog-svc` | OCEAN Profiling | `8000:8000` | Internal Only |
| `risk-svc` | XGBoost Predictor | `8001:8001` | Internal Only |
| `xai-svc` | SHAP Explainer | `8002:8002` | Internal Only |
| `llm-svc` | RAG & Gemini Engine| `8003:8003` | Internal Only |
| `backend` | Node API Gateway | `5001:5001` | Publicly Available |
| `frontend` | React UI Client | `80:80` (prod Nginx) | Publicly Available |

### Production Composition
Builds optimized production assets and starts containers:
```bash
# Launch Production Stack
docker compose -f docker-compose.prod.yml up -d --build

# Inspect Logs
docker compose -f docker-compose.prod.yml logs -f

# Stopping the Containers
docker compose -f docker-compose.prod.yml down
```

---

## 3. Production Kubernetes Orchestration

Orchestration templates are housed in `/kubernetes`:

### Manifest Components
1.  **`k8s-deployment.yml`**:
    *   Defines Pod deployments for the Express API gateway, the four FastAPI microservices, and React web client.
    *   Implements horizontal pod auto-scaling (HPA) boundaries.
    *   Defines Kubernetes Service bounds (ClusterIP for microservices, LoadBalancer for API Gateway and UI).
2.  **`ingress.yml`**:
    *   Exposes path-based routing (e.g., `/api` maps to the backend service, `/` routes to React client).
    *   Handles TLS terminations.
