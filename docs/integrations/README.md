# Institution integration blueprint

**Recommended, not implemented.** Integrate SIS/ERP for identity, enrolment, program/term and grades; LMS (Moodle, Canvas, Blackboard, Google Classroom, Teams) for course activity and assignment events; attendance/biometric systems for signed attendance; examination systems for marks; calendar/video for scheduled mentoring; and email/SMS/WhatsApp only through opt-in notification providers.

Use OAuth/OIDC or service accounts, least-privilege scopes, encrypted connectors, webhook signature verification, idempotency keys, a staging/normalization layer, reconciliation reports, retry queues and source timestamps. Do not ingest counselling, biometric, financial, parent, or placement data without a purpose limitation, retention policy, DPIA/legal review, and role-specific access policy.
