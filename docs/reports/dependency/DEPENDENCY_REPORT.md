# Dependency Review Report

This report evaluates package dependencies across the Node.js (Frontend and Backend) and Python (AI Services) environments to ensure minimal overhead and dependency security.

---

### Navigation
[« Docs Index](../../README.md) | [Audit Report](../AUDIT_REPORT.md) | [Code Quality Report](../code-quality/CODE_QUALITY_REPORT.md) | [Recommendations](../recommendations/RECOMMENDATIONS.md)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Findings](#findings)
3. [Impact](#impact)
4. [Recommendations](#recommendations)
5. [Priority & Status Matrix](#priority--status-matrix)

---

## Executive Summary

An audit of Node and Python package manifests was conducted to prune unused modules, address vulnerabilities, and ensure stable builds. We removed two unused packages from the React frontend bundle, unified the Python service environments, and configured automated Dependabot monitoring.

---

## Findings

1.  **Unused Frontend Packages (Patched):** Found two declared dependencies in `frontend/package.json` that had 0 imports in the source code:
    *   `@heroicons/react` (replaced entirely by `lucide-react`).
    *   `date-fns` (dates are formatted natively).
2.  **Microservice Isolation (Patched):** Pruned individual microservice Python requirements, consolidating all package definitions into `ai-services/requirements.txt`.
3.  **Dependabot Integration (Patched):** Configured `.github/dependabot.yml` to run weekly audits of Node and Python package versions.

---

## Impact

*   **Frontend Bundle Size:** Medium. Removing `@heroicons/react` and `date-fns` reduced build bundle sizes and speeds up initial page load.
*   **Monorepo Consistency:** High. Unifying the Python environment resolves package conflicts across services and prevents installation drift.
*   **Security Posture:** Medium. Dependabot alerts keep developers updated on security patches in third-party modules.

---

## Recommendations

1.  **Enforce CI Lockfile Installs:** Ensure build pipelines use `npm ci` rather than `npm install` to prevent version drift during deployments.
2.  **Regular Vulnerability Scans:** Schedule cron audits running `npm audit` and `safety check` in active directories.

---

## Priority & Status Matrix

| Dependency Action | Priority | Status | Details |
| :--- | :---: | :---: | :--- |
| **Prune Unused Frontend Packages** | `Medium` | **Fixed** | Removed `@heroicons/react` and `date-fns` from package manifest. |
| **Unify Python requirements** | `High` | **Fixed** | Centralized python requirements in `/ai-services`. |
| **Setup Dependabot Alerts** | `Medium` | **Fixed** | Configured weekly Dependabot scans. |
| **Enforce CI Lockfile builds** | `High` | **Active** | CI workflow configured to use `npm ci`. |
| **Schedule Periodic Package Scans** | `Medium` | *Planned* | Add safety/audit alerts. |
