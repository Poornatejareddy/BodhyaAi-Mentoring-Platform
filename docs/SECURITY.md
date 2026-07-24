# Security & Access Control Protocols

This document defines the authentication architecture, security configurations, and data privacy framework built into BodhyaAI.

---

## 1. Authentication & Session Security

*   **Mechanism**: JSON Web Tokens (JWT).
*   **Authorization Headers**: Exchanged via HTTP Bearer token headers: `Authorization: Bearer <token>`.
*   **Verification**: Done at the route level via `authMiddleware.js`. Valid signatures and expiries are checked before passing requests.

---

## 2. Role-Based Access Control (RBAC)

Access permissions are enforced through middleware scopes:

```javascript
// Example Express Authorization check
router.post('/class-report', protect, authorize('mentor', 'admin'), getClassReport);
```

### Roles Matrix

| Endpoint Target | Student Scope | Mentor Scope | Admin Scope |
|---|:---:|:---:|:---:|
| Read own profile | ✅ | ❌ | ❌ |
| Submit BFI-44 survey | ✅ | ❌ | ❌ |
| Read assigned student risk | ❌ | ✅ | ✅ |
| Calculate student risk | ❌ | ✅ | ❌ |
| Generate Class AI Report | ❌ | ✅ | ✅ |
| View System Audit Logs | ❌ | ❌ | ✅ |

---

## 3. Data Privacy & Consent Engine

BodhyaAI enforces strict data privacy limits depending on user preferences:

1.  **Consent Option (`consentGiven`)**: Every student profile stores a `consentGiven` boolean flag.
2.  **`consentMiddleware` Interceptor**:
    *   Before a mentor can view detailed study metrics, history, or personality results, the `applyConsentFilterMiddleware` inspects the student's preference.
    *   If `consentGiven` is `false`, the middleware strips academic detail keys from the returned payload, preventing mentors from inspecting confidential metrics without explicit permission.

---

## 4. User Activity Audit Logging

For security and accountability, sensitive operations trigger immutable audit entries:

*   **Middleware Tracker**: `auditMiddleware.js` intercepts operations.
*   **Actions Audited**:
    *   `VIEW_PROFILE` / `VIEW_FULL_PROFILE`
    *   `UPDATE_PROFILE`
    *   `UPDATE_CONSENT_SETTINGS`
    *   `VIEW_RISK_EXPLANATION`
    *   `GENERATE_REPORT`
    *   `SEND_MESSAGE`
*   **Log Record Model (`AuditLog` Schema)**:
    ```json
    {
      "userId": "60d5ec4b...",
      "action": "GENERATE_REPORT",
      "ipAddress": "192.168.1.5",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2026-07-24T06:16:35Z"
    }
    ```
*   **Storage**: Logs are written directly to MongoDB Atlas and can be queried only by users with the `admin` role.
