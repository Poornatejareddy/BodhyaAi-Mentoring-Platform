# Bug report

| Severity | Finding | Evidence / resolution |
|---|---|---|
| High | Live platform unavailable | Health audit found all seven runtime endpoints offline; Docker socket is inaccessible in this environment. Start the approved runtime and rerun integration tests. |
| High | AI end-to-end unverified | No Gemini key/service was available; risk/cognitive/XAI services were also offline. Do not claim AI success until health, authenticated requests and UI rendering are tested. |
| Medium | Health script checked wrong path | `scripts/health_check.sh` used `/api/auth/me`; backend mounts protected `/api/me`. Fixed to probe `/api/me` and expect 401. |
| Medium | Automated test coverage incomplete | Backend `npm test` intentionally exits nonzero and no browser/API contract suite exists. Add CI tests before production. |
| Medium | Lint debt | Existing frontend lint reports unused values and hook dependency warnings. These can hide state/re-render defects. |
| Medium | Legacy local embedding dependency remains | LLM RAG retriever imports `sentence_transformers`; this conflicts with a strict “Gemini only / no Transformers” requirement. Replacing it needs a Gemini embeddings design and index migration, not a string deletion. |
