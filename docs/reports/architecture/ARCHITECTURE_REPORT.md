# Architecture Review Report

This report evaluates the structural design patterns of the BodhyaAI mentoring and academic success platform, detailing how the codebase implements clean architecture and microservice separation.

---

### Navigation
[« Docs Index](../../README.md) | [Audit Report](../AUDIT_REPORT.md) | [Security Report](../security/SECURITY_REPORT.md) | [Performance Report](../performance/PERFORMANCE_REPORT.md)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Findings](#findings)
3. [Impact](#impact)
4. [Recommendations](#recommendations)
5. [Priority & Status Matrix](#priority--status-matrix)

---

## Executive Summary

BodhyaAI utilizes a hybrid architecture featuring an Express/NodeJS gateway backend (managing authentication, chat WebSockets, and database persistence) coupled with a Python monorepo of four specialized microservices (`cog-svc`, `risk-svc`, `xai-svc`, and `llm-svc`) handling high-speed calculations. The structural architecture review examined modularity, separation of concerns, and clean coding practices.

---

## Findings

1.  **Strict Separation of Concerns:** Business logic and REST definitions are clearly segregated on the Express backend (Routes, Controllers, and Services are isolated).
2.  **Shared Microservice Package:** The microservices successfully register a shared package `common/` that handles baseline configurations (resolving `.env` paths) and shared typing schemas.
3.  **Docker Build Misalignment (Patched):** Previously, individual microservice Dockerfiles had their build context limited to their respective directories. This blocked the builder from fetching the sibling `common/` package, breaking containerization.
4.  **Consolidated Dependencies (Patched):** Legacy virtual environments inside each microservice folder were pruned and replaced by a unified `/ai-services/venv` and shared `requirements.txt`.

---

## Impact

*   **System Modularity:** High. Computational tasks (SHAP calculations, XGBoost risk mapping, and FAISS vector matching) are completely stateless and run on independent servers, keeping the NodeJS gateway lightweight.
*   **Pipeline Stability:** High. The corrected Docker contexts resolved build-time compilation issues, allowing automated CI/CD runs to compile and check images.
*   **Resource Footprint:** High. Merging environments saved valuable disk footprint (~2GB) and prevents redundant package installations on deployment targets.

---

## Recommendations

1.  **Expose Kubernetes Manifests (Post-MVP):** For enterprise deployment, port the Docker Compose service architecture to Kubernetes (K8s) deployments with ingress controllers.
2.  **Unify Client Request Clients:** Ensure backend services communicate with Python endpoints using a centralized Axios client that handles connection retries and error reporting.

---

## Priority & Status Matrix

| Architectural Finding / Action | Priority | Status | Description |
| :--- | :---: | :---: | :--- |
| **Fix Docker Context Paths** | `High` | **Fixed** | Relocated context to `ai-services` root and targeted Dockerfiles explicitly. |
| **Consolidate Service Environments** | `High` | **Fixed** | Unified microservices virtual environments into a single folder. |
| **Centralize Common Microservice Logic**| `Medium` | **Fixed** | Encapsulated shared ML pre-processors in `common/`. |
| **Add CI Build Step Verification** | `Medium` | **Fixed** | Configured workflows to verify clean compiles. |
| **Deploy K8s Deployment Manifests** | `Low` | *Planned* | Map service configs to cluster specs. |
