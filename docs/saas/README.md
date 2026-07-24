# SaaS transformation roadmap

**Recommended architecture:** add immutable `tenantId` to every tenant-owned record, enforce it in database queries and API middleware, and use a separate control plane for institution onboarding, domains/branding, plans, billing, feature flags, and retention. Role hierarchy should include platform operator, institution admin, department/program admin, mentor, counsellor, faculty contributor, student, and optionally parent/guardian with explicit scope.

Use tenant-aware SSO (SAML/OIDC), SCIM, KMS-managed encryption, audit export, regional data residency, object storage for reports/attachments, queue workers for imports/alerts, model registry, monitoring, backups and tested restores. Complexity: high; ROI: required for selling safely to more than one institution.
