# BodhyaAI Development Roadmap

This document outlines the strategic roadmap and future engineering plans for the BodhyaAI mentoring and student success platform.

---

## 📅 Timeline Overview

```
    Q3 2026                 Q4 2026                 2027+
   (Phase 1)               (Phase 2)              (Phase 3)
  🚀 Optimize             🔌 Integrate           🏢 Scale
  - Performance           - LMS Hooks            - Multi-Tenancy
  - Custom Prompts        - SMS Alerts           - Mobile Apps
  - Extra Tests           - Diagnostic Admin     - Financial Analytics
```

---

## 🚀 Phase 1: Performance & Customization (Q3 2026)

### Objectives
Refine current infrastructure and add customization features for advisors.

*   **Configurable LLM Prompts**: Build a dashboard interface where institution administrators can customize standard prompt templates (e.g., custom Cornell note structures).
*   **Vector Store Swapping**: Migrate the current RAG engine from local memory FAISS files to a hosted Vector Database (e.g., Pinecone or MongoDB Atlas Vector Search) for scalability.
*   **Performance Optimization**: Implement Redis caching for common stats queries (such as `/api/mentors/dashboard-stats`) to decrease loading latency.
*   **Test Expansion**: Create extensive end-to-end integration tests using Selenium or Playwright for critical user dashboard flows.

---

## 🔌 Phase 2: Integrations & Notifications (Q4 2026)

### Objectives
Connect BodhyaAI with external educational platforms.

*   **LMS Connectors**: Develop integration bridges for popular Learning Management Systems (LMS) such as Canvas, Moodle, and Blackboard via standard LTI (Learning Tools Interoperability) protocols.
*   **SMS Alert Gateway**: Integrate Twilio or similar SMS channels to automatically notify mentors and students when academic risk shifts to `HIGH`.
*   **Diagnostic Admin Hub**: Add an admin portal to monitor microservice latency logs, CPU usage statistics, and active database connection limits.

---

## 🏢 Phase 3: Scale & Multi-Tenancy (2027+)

### Objectives
Transform the platform into a SaaS structure capable of hosting multiple universities.

*   **Multi-Tenant Isolation**: Implement database schema isolation so multiple universities can run safely on a shared hosting environment.
*   **React Native Mobile Client**: Launch companion iOS and Android applications to allow rapid communications and push notifications.
*   **Predictive Financial Risk Analysis**: Expand the `risk-svc` XGBoost model to predict financial aid dropout risks using university tuition billing logs.
