# BodhyaAI Platform

<div align="center">

![BodhyaAI Logo](https://via.placeholder.com/150x150?text=BodhyaAI)

**AI-Powered Student Success & Mentoring Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

[Overview](#-overview) •
[Architecture](#-architecture) •
[Repository Structure](#-repository-structure) •
[Quick Start](#-quick-start) •
[Deployment](#-deployment) •
[FAQ](#-faq) •
[Contributing](#-contributing) •
[License](#-license)

</div>

---

## 📖 Overview

BodhyaAI is an enterprise-grade, next-generation AI-powered student success and mentoring platform. It integrates machine learning risk predictions, explainable AI, real-time message gateways, personality surveys, and comprehensive audit frameworks to create a holistic support ecosystem for academic institutions.

### 🎯 Key Highlights

*   **🤖 Advanced AI Services:** 4 microservices (Risk Prediction, XAI, Cognitive Profiling, LLM/RAG) running in a unified shared virtual environment.
*   **📊 Academic Risk Prediction:** XGBoost classification model mapping 21 features with SHAP explainability.
*   **🧠 Personality Profiling:** OCEAN (Big Five) assessment based on BFI-44 survey questions.
*   **💬 Real-time Communication:** Socket.IO messaging with online states and typing indicators.
*   **📚 RAG Knowledge Assistant:** FAISS-powered semantic search with conversational fallback strategies.
*   **🔐 Enterprise Security:** JWT session validation, Role-Based Access Control (RBAC), and user activity audit logging.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                      │
│     Student Dashboard | Mentor Dashboard | Admin Dashboard    │
│              Modern UI with Responsive Design                │
└───────────────────────┬──────────────────────────────────────┘
                        │ REST API + Socket.IO
                        ↓
┌──────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                      │
│  Authentication │ Chat │ Alerts │ User Management │ API      │
└──────┬──────────┬─────────┬──────────────────────┬──────────┘
       │          │         │                      │
       ↓          ↓         ↓                      ↓
┌────────────┐ ┌────────────────────────────────────────────┐
│  MongoDB   │ │          AI Services (Python)               │
│  Database  │ │  ┌─────────────────────────────────────┐   │
└────────────┘ │  │ LLM-SVC :8003 (RAG + Study Plans)   │   │
               │  │ - FAISS Vector Store                 │   │
               │  │ - Google Gemini Integration          │   │
               │  └─────────────────────────────────────┘   │
               │  ┌─────────────────────────────────────┐   │
               │  │ RISK-SVC :8001 (Risk Prediction)    │   │
               │  │ - XGBoost Model (21 features)       │   │
               │  │ - Business Rules Engine              │   │
               │  └─────────────────────────────────────┘   │
               │  ┌─────────────────────────────────────┐   │
               │  │ XAI-SVC :8002 (Explainability)      │   │
               │  │ - SHAP Feature Importance           │   │
               │  └─────────────────────────────────────┘   │
               │  ┌─────────────────────────────────────┐   │
               │  │ COG-SVC :8000 (Cognitive Profile)   │   │
               │  │ - OCEAN Personality Models          │   │
               │  └─────────────────────────────────────┘   │
               └────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

The monorepo isolates sub-project contexts while centralizing automation under a root operations folder:

```
BodhyaAi-Mentoring-Platform/
├── backend/                  # Node Express API Gateway Server
├── frontend/                 # React UI Client using Vite + Tailwind
├── ai-services/              # Python FastAPI Machine Learning microservices
├── docs/                     # Centralized technical documentation suite
│   ├── api/                  # API endpoints and payload descriptions
│   ├── architecture/         # Architectural designs & component diagrams
│   ├── deployment/           # Production & container deployment guides
│   ├── guides/               # User guides & tutorials
│   └── reports/              # Diagnostic reports and test logs
├── scripts/                  # Cross-platform lifecycle bash scripts
│   └── windows/              # Windows batch utility commands
├── kubernetes/               # Orchestration resources for cluster deployment
├── archive/                  # Archived legacy code files
├── package.json              # Monorepo shortcuts descriptor
├── Makefile                  # Developer setup helper mapping
└── docker-compose.yml        # Multi-container local orchestration
```

---

## 🚀 Quick Start

Ensure the following prerequisites are installed before startup:
*   **Git**
*   **Node.js v18+ & npm**
*   **Python v3.10+ & pip**
*   **Docker & Docker Compose** (or local MongoDB server)
*   **Make**

### 1. Workspace Initialization
Run the setup utility to verify system requirements, install backend/frontend modules, construct default environments, build the shared Python virtual environment, and install model components:

```bash
# Via Make (Recommended)
make init

# Or Direct Shell
./scripts/setup_project.sh

# Or Windows cmd
.\scripts\windows\setup_project.bat
```

### 2. Startup Orchestration
Launch the entire system (MongoDB, 4 FastAPI services, Node Backend, and Vite client) with a single run action. The script performs port conflict resolution, updates dependencies when package files have changed, and conducts system health tests:

```bash
# Via Make
make dev

# Or Via NPM
npm run dev:all

# Or Direct Shell
./scripts/run_project.sh

# Or Windows cmd
.\scripts\windows\run_project.bat
```

### 3. Check Service Status
Monitor memory usage, active PIDs, port bindings, and uptime metrics:

```bash
# Via NPM
npm run status

# Or Direct Shell
./scripts/status_project.sh
```

### 4. System Health Checks
Verify the connectivity and responsiveness of all services:

```bash
# Via Make
make health

# Or Direct Shell
./scripts/health_check.sh
```

### 5. Automated Integration Verification
Start the integration test suite to verify JWT authentication, user registration flows, database reads, and AI microservice predictions:

```bash
# Via Make
make test-integration

# Or Via NPM
npm run test:all

# Or Direct Shell
./scripts/test_project.sh
```

### 6. Codebase Restart
To stop services, evaluate dependencies, and boot the stack from a clean state:

```bash
# Via Make
make restart

# Or Direct Shell
./scripts/restart_project.sh

# Or Windows cmd
.\scripts\windows\restart_project.bat
```

### 7. Clean Shutdown
Gracefully stop active background services and discard runtime PID markers:

```bash
# Via Make
make stop

# Or Direct Shell
./scripts/stop_project.sh

# Or Windows cmd
.\scripts\windows\stop_project.bat
```

---

## 🐳 Deployment

### Production Container Orchestration
The monorepo provides target production compose files:

```bash
# Start all containers in background
docker compose -f docker-compose.prod.yml up -d --build

# View container logs
docker compose logs -f

# Shut down containers
docker compose down
```

---

## ❓ FAQ

#### Why are AI microservices returning `[UNHEALTHY/OFFLINE]`?
Ensure uvicorn is active. Check `logs/cognitive.log`, `logs/risk.log`, `logs/xai.log`, and `logs/llm.log` for Python exceptions.

#### How do I register a Google Gemini key?
Add your key inside `ai-services/.env` or root `.env` as `GEMINI_API_KEY`. If empty, the RAG service automatically degrades to rule-based fallback mode.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your modifications.
4.  Push the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
