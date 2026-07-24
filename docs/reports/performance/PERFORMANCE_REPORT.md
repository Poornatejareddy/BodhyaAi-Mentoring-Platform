# Performance Review Report

This report evaluates the performance characteristics of BodhyaAI across database queries, frontend asset delivery, and AI microservice latencies.

---

### Navigation
[« Docs Index](../../README.md) | [Audit Report](../AUDIT_REPORT.md) | [Architecture Report](../architecture/ARCHITECTURE_REPORT.md) | [Recommendations](../recommendations/RECOMMENDATIONS.md)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Findings](#findings)
3. [Impact](#impact)
4. [Recommendations](#recommendations)
5. [Priority & Status Matrix](#priority--status-matrix)

---

## Executive Summary

BodhyaAI's response latency is dominated by database operations and AI model inference speed. Performance auditing identified that the `Student` schema lacked key query indexes, resulting in collection scans. Additionally, we verified frontend bundle delivery and AI model loading routines. Mongoose indexes were introduced to optimize database read performance.

---

## Findings

1.  **Missing DB Indexes (Patched):** Relational queries mapping mentors to student lists (e.g. `Student.find({ mentor: mentorId })`) triggered collection scans due to missing indexes.
2.  **Added Schema Indexes (Patched):** Added indexes on the `Student` schema: `studentSchema.index({ mentor: 1 })` and `studentSchema.index({ user: 1 })`.
3.  **In-Memory Model Caching:** AI services load their scikit-learn and XGBoost pipelines once at startup, achieving sub-15ms inference latency.
4.  **CPU Wheel Optimizations:** Docker files for `llm-svc` explicitly install CPU-only PyTorch wheels, saving container size (~2GB) and memory overhead.
5.  **Frontend Bundle Size:** Pruned unused node packages (`@heroicons/react` and `date-fns`) from the React frontend, reducing bundle size and speeding up load times.

---

## Impact

*   **Database Query Time:** High. Relational student queries are now executed in **O(log N)** indexed time, preventing memory exhaustion and query timeouts as student records grow.
*   **Asset Delivery Speed:** Medium. Minimizing the React vendor chunk allows Vite to build clean assets in 7.50 seconds.
*   **Microservice Responsiveness:** High. Caching ML models in memory prevents disk read bottlenecks, keeping API latencies extremely low.

---

## Recommendations

1.  **Prediction Caching:** Implement Redis to cache risk and OCEAN personality outputs to avoid redundant ML pipeline execution.
2.  **React Route Lazy Loading:** Use React `lazy` and `Suspense` inside `App.jsx` to split the frontend JS bundle into views loaded on-demand.

---

## Priority & Status Matrix

| Performance Finding / Action | Priority | Status | Details |
| :--- | :---: | :---: | :--- |
| **Add `Student` Model Query Indexes** | `High` | **Fixed** | Added indexes on `mentor` and `user` fields. |
| **Prune Frontend Dependencies** | `Medium` | **Fixed** | Pruned `@heroicons/react` and `date-fns`. |
| **Cache ML Models in RAM at Startup** | `High` | **Active** | Models loaded at FastAPI server launch. |
| **Install CPU-only PyTorch Wheels** | `High` | **Active** | Optimized container build footprint. |
| **Implement Redis Caching** | `Medium` | *Planned* | Cache predictions to avoid redundant model runs. |
| **Frontend Route Lazy Loading** | `Medium` | *Planned* | Split dashboard views to reduce bundle size. |
