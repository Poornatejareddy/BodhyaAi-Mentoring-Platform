# Codebase guide

- `frontend/src`: React router, layouts, auth/socket/theme contexts, role dashboards, pages, UI components, and API services.
- `backend/src`: Express routes/controllers, Mongoose models, JWT/authorization/audit/consent middleware, domain services, Socket.IO setup, and report generation.
- `ai-services`: shared configuration/schemas/helpers plus FastAPI risk, cognitive, XAI and LLM services.
- `docker-compose.yml`: local multi-container topology; `docker-compose.prod.yml` and Kubernetes manifests are deployment starting points, not evidence of production operation.
- `docs`: permanent product/technical knowledge base; archival material is under `archive` and should not be treated as current runtime code.

Start execution tracing at `frontend/src/main.jsx`, `frontend/src/App.jsx`, `backend/src/index.js`, then the route/controller/service/model corresponding to the page being studied.
