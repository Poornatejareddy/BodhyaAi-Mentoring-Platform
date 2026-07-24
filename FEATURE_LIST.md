# BodhyaAI feature list

Generated from repository routes, models, dashboard pages, controllers, and AI services. “Validated” requires live dependencies; this inventory only establishes source-level implementation.

| Feature | Frontend / user action | Backend/API | Data / AI | Source status |
|---|---|---|---|---|
| Identity and roles | Login, registration, protected dashboards | `/api/auth/*`, JWT middleware | `User` | Implemented; live validation blocked |
| Student profile and consent | Profile, survey, settings | `/api/students/my-profile*` | `Student` | Implemented/partial |
| Mentor management | Mentees, assignment, detail, exports | `/api/mentors/*`, `/api/admin/*` | `Mentor`, `Student` | Implemented/partial |
| Risk classification | Mentor prediction, student explanation | `/api/risk/*` | risk-svc XGBoost/SHAP | Prototype; live model unavailable |
| Cognitive survey | Survey, profile, mentor links/PDF | `/api/personality/*` | cog-svc, `SurveyLink` | Experimental |
| Intervention management | Create/update/notes/timeline | `/api/interventions/*` | `Intervention` | Implemented/partial |
| Alerts and notifications | Panel, alerts pages, Socket events | `/api/alerts/*`, `/api/admin/alerts` | `Alert`, Socket.IO | Partial; live socket unavailable |
| Messaging and AI chat | Chat list/window/chatbot | `/api/chat/*` | `Message`, LLM service | Partial; Gemini unavailable |
| AI study/class plans | Study plan, mentor report | `/api/llm/*` | Gemini/RAG | Prototype; Gemini unavailable |
| Admin operations | users, alerts, logs, reassignment | `/api/admin/*`, `/api/audit/*` | `Admin`, `AuditLog` | Implemented/partial |

Known non-features: password reset/forgot password, privileged-mentor role, file-upload persistence/scanning, online-user presence, and independently verified learning-plan feature are not established by current routes/models.
