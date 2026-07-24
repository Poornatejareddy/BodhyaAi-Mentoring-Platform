# Functional Validation Report

Validated locally on 2026-07-24 against the running full stack.

## Passed

- MongoDB accepted `ping` and the backend established its database connection.
- The cognitive, risk, XAI, and LLM service health endpoints returned `200`.
- The Express backend returned `200` from `/api/me` when presented with a valid test session.
- The Vite frontend returned `200` on port `5173`; a production frontend build completed successfully.
- Registration, login, JWT authorization, and the admin users request passed in `scripts/test_project.sh`.
- The risk prediction flow returned a High-risk result, confidence, probability map, SHAP feature contributions, and business-rule rationale for a representative high-risk payload.
- The cognitive prediction flow returned all five trait scores and its extended learning profile.
- The XAI risk explanation flow returned feature importance, SHAP values, and risk warnings.

## Fixed During Validation

- Conversation memory no longer contains database credentials in source code. It reads deployment configuration, uses a local override for the stack launcher, and fails open so a memory outage cannot make chat return `500`.
- The Gemini fallback loop now performs exactly the configured retry count per model.
- Removed the duplicate Student `user` schema index declaration.
- The project launcher now skips unchanged JavaScript dependency installs, reuses an existing MongoDB server safely, and accurately reports it as external.
- The launcher stops stale workspace Nodemon/Vite parents before launch, then runs managed backend and frontend processes directly. This removes the restart race that previously produced `EADDRINUSE` failures.

## Outstanding Release Risks

- Gemini requests reached the provider client but timed out during the TLS handshake in this environment. The API returns a safe user-facing fallback with `200`, but a successful provider-generated response still requires a working Gemini network path and valid provider access.
- Risk/XAI model artifacts were saved with scikit-learn 1.4, while cognitive artifacts were saved with 1.7. The local runtime remains pinned to 1.4 to protect the primary risk flow; cognitive/XAI startup therefore emits compatibility warnings even though prediction smoke tests pass. Retrain or re-export all artifacts under one pinned version before production deployment.
- `npm audit` reported dependency advisories in both frontend and backend. Audit remediation was intentionally not applied automatically because it may introduce breaking dependency upgrades.

## Current Local State

All seven local services are healthy after the final clean restart. The detailed automated results are in [TEST_REPORT.md](TEST_REPORT.md).
