# Feature audit

See [FEATURE_LIST.md](../../FEATURE_LIST.md) for source discovery. All listed routes were discovered from `backend/src/routes`, UI pages from `frontend/src`, and persistence from Mongoose models.

No feature can be certified end-to-end in this audit run because frontend, backend, MongoDB, risk, cognitive, XAI, and LLM health endpoints were offline. Required validation order is: start dependencies → seed or create student/mentor/admin → obtain JWT per role → execute API route contract tests → operate each UI workflow → inspect MongoDB and Socket.IO events → test Gemini with permitted credentials.
