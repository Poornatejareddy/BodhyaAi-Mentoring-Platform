# Feature inventory

| Feature | Role | Evidence | Status | Institutional assessment |
|---|---|---|---|---|
| Registration/login and JWT roles | all | `authRoutes`, `User` | Implemented | Needs expiry/revocation, verification, SSO and stronger policy controls. |
| Student digital profile and consent toggles | student | `Student`, `studentRoutes` | Partial | Useful foundation; inputs are manually maintained and consent enforcement needs audit. |
| Risk prediction/explanation | mentor/student | `riskRoutes`, risk service | Prototype | Decision-support only; trained artifacts and real-world calibration are not documented. |
| Personality survey/profile | student/mentor | `cogRoutes`, cog service | Experimental | Sensitive profiling requires validated instrument/licensing, consent and governance. |
| Mentee assignment and views | mentor/admin | mentor/admin routes | Implemented | Useful, but lacks institution/department isolation and workload rules. |
| Interventions and notes | mentor | `Intervention` routes/model | Partial | Good workflow basis; needs outcome taxonomy, reminders and counsellor controls. |
| Alerts and real-time notifications | all | `Alert`, Socket.IO | Partial | Needs reliable delivery, preferences, escalation policy, and monitoring. |
| Mentor/student messaging | all | `Message`, chat routes | Partial | Needs attachment scanning/storage, moderation/retention policy, and rate limits. |
| Study plans/class reports via Gemini | student/mentor | `llmRoutes`, LLM service | Prototype | Requires guardrails, evaluation, cost controls, and human review. |
| Admin users/audit logs | admin | admin/audit routes | Partial | Useful operations baseline; authorization and immutable compliance logs need review. |

Priority: secure identity, trustworthy data integrations, calibrated risk governance, and mentor intervention outcomes precede new AI features.
