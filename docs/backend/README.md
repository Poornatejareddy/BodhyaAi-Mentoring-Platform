# Backend reference

Express is initialized in `backend/src/index.js`, connects MongoDB, initializes Socket.IO, parses JSON, and mounts route modules. Controllers implement HTTP orchestration; models persist domain documents; middleware contains JWT role checks, consent and audit helpers; services contain domain/AI/report integrations.

Before production, move configuration validation to startup, define a central error handler, apply schema validation and rate limiting, restrict CORS, verify every authorization chain, and add controller/service integration tests.
