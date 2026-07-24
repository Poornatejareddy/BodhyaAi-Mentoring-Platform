# Cleanup and Optimization Report

This report documents the file cleanup, pruned dependencies, and workspace optimizations completed to simplify the BodhyaAI repository structure.

---

### Navigation
[« Docs Index](../../README.md) | [Audit Report](../AUDIT_REPORT.md) | [Safe to Delete Report](./SAFE_TO_DELETE.md) | [Recommendations](../recommendations/RECOMMENDATIONS.md)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Findings](#findings)
3. [Impact](#impact)
4. [Recommendations](#recommendations)
5. [Priority & Status Matrix](#priority--status-matrix)

---

## Executive Summary

As the BodhyaAI project evolved, legacy draft reports, duplicated page files, and scratch debugging scripts accumulated in the root directory. To restore repository cleanliness and prevent build-time compilation issues, a comprehensive cleanup was executed, quarantining 28 files to the `/archive` folder.

---

## Findings

1.  **Clutter Accumulation:** Found 28 unused files comprising PDF report drafts, academic LaTeX files, duplicate React dashboard views, and obsolete postgres migration configurations.
2.  **Duplicate Components:** Identified duplicate settings and mentee pages inside the frontend source code tree.
3.  **Dependency Bloat:** Identified two declared node dependencies (`@heroicons/react` and `date-fns`) in the frontend manifest that were not imported anywhere in the code.
4.  **Temporary Cache Files:** Found several `__pycache__` folders in active Python microservice directories.

---

## Impact

*   **Repository Size:** Medium. Moving 28 legacy, draft, and scratch files to the `/archive` directory saved active workspace space and decluttered search scopes.
*   **Compile Speed:** Medium. Pruning duplicate views prevents Vite routing conflicts and reduces frontend build compile times.
*   **Security Surface Area:** Low. Removing unused third-party node packages minimizes dependency alerts and security vulnerabilities.

---

## Recommendations

1.  **Add Archive to GitIgnore:** If the `/archive` folder should not be pushed to the remote repository, add `/archive/` to the root `.gitignore`.
2.  **Permanent Deletion:** After verifying system behavior over a trial period, delete the `/archive` folder permanently to free up disk storage.

---

## Priority & Status Matrix

| Cleanup Finding / Action | Priority | Status | Details |
| :--- | :---: | :---: | :--- |
| **Quarantine Legacy Files to `/archive`** | `Medium` | **Fixed** | Relocated 28 files into `/archive/`. |
| **Prune Duplicate Frontend Views** | `High` | **Fixed** | Removed duplicate settings/mentee files. |
| **Remove Unused Node Packages** | `Medium` | **Fixed** | Pruned `@heroicons/react` and `date-fns`. |
| **Clean PyCache Directories** | `Low` | **Fixed** | Cleaned python runtime cache folders. |
| **Add Archive to GitIgnore** | `Low` | *Planned* | Add exclusion to `.gitignore` if needed. |
| **Permanent Deletion of Archive** | `Low` | *Planned* | Purge `/archive` files permanently later. |
