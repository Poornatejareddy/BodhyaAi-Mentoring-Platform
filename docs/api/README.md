# API reference inventory

All API paths are relative to `/api`. Authentication is JWT bearer middleware where routes use `protect`; role authorization is route-specific and should be verified endpoint-by-endpoint before exposure.

| Area | Paths |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Student | `GET/PUT /students/my-profile`, survey, consent, risk explanation; mentor/admin full profile |
| Mentor | profile, stats, reports/exports, mentee assignment/update paths |
| Admin | dashboard stats, users CRUD, students/mentors, assignment/reassignment, alerts, audit logs |
| Risk | predict one/batch, student risk, stats |
| Personality | submit/profile/insights, mentor survey-link and PDF/bulk endpoints, public token endpoints |
| Intervention | create/list/student/update/notes/delete |
| Chat | send/history/read/unread/AI chat/edit/delete |
| Alerts/Audit/LLM | per-user alerts and logs; study plan, intervention and class report generation |

Source of truth is `backend/src/routes/*.js` plus controllers. Generated OpenAPI is not present; add request schemas, example responses, error catalog, rate limits, and contract tests before external integration.
