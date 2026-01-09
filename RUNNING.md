# Running BodhyaAI Platform

This guide provides instructions for running the BodhyaAI platform locally.

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **MongoDB** 6+ (Running locally or accessible via URI)
- **npm**

## Option 1: Quick Start (Hybrid)

This method runs AI services via a simplified script and the web stack via npm.

### 1. Start AI Microservices
The project includes a helper script to start all Python-based AI services (`risk-svc`, `xai-svc`, `cog-svc`, `llm-svc`).

```bash
# From the root 'bodhyai' directory
bash start_ai_services.sh
```
*Note: This script assumes you have `python3` installed. It will set up virtual environments and install requirements automatically.*

**Service Ports:**
- **Cognitive Service:** http://localhost:8000
- **Risk Service:** http://localhost:8001
- **XAI Service:** http://localhost:8002
- **LLM Service:** http://localhost:8003

### 2. Start Backend
In a new terminal:

```bash
cd backend
npm install
npm run dev
```
*The backend runs on http://localhost:5000*

### 3. Start Frontend
In a new terminal:

```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on http://localhost:5173*

---

## Option 2: Docker (Containerized)

If you have Docker and Docker Compose installed:

```bash
docker-compose up -d
```

This will start:
- MongoDB
- Backend
- Frontend
- AI Services (LLM, Risk, XAI)

*Note: Check `docker-compose.yml` for exact service configurations.*

---

## configuration

Ensure your `backend/.env` file points to the correct service ports if running manually. based on `start_ai_services.sh`, they should be:

```env
RISK_SERVICE_URL=http://localhost:8001
XAI_SERVICE_URL=http://localhost:8002
COG_SERVICE_URL=http://localhost:8000
LLM_SERVICE_URL=http://localhost:8003
```
