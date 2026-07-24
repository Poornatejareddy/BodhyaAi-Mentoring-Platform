# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-24

### Added
- Created `archive/` folder to securely quarantine unused files, reports, and legacy code.
- Added comprehensive audit tools and reports: `AUDIT_REPORT.md`, `SECURITY_REPORT.md`, `PERFORMANCE_REPORT.md`, `ARCHITECTURE_REPORT.md`, `CODE_QUALITY_REPORT.md`, `DEPENDENCY_REPORT.md`, `PRODUCTION_READINESS.md`, `RECOMMENDATIONS.md`.
- Added GitHub community guidelines: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, pull request templates, and issue templates.
- Added automated CI/CD pipelines in `.github/workflows/` (Lint, test, build, dependency scan, release workflows).
- Implemented Dependabot updates configuration.

### Changed
- Monorepo architectural consolidation: merged the virtual environments of the four Python microservices (`risk-svc`, `cog-svc`, `xai-svc`, `llm-svc`) into a single, unified virtual environment at `/ai-services/venv`.
- Consolidated all microservice Python requirements into a single, unified `requirements.txt` at the root of `ai-services`.
- Converted `ai-services/common` to a shared package installed in editable/production mode, allowing seamless cross-service configuration and schemas.
- Modified Dockerfiles to compile AI services relative to the monorepo root context, allowing correct resolution of the `common` package during container builds.
- Cleaned unused dependencies from `frontend/package.json` (`@heroicons/react` and `date-fns`).

### Fixed
- Fixed user schema password re-hashing lockout bug on updating profiles (prevented double hashing by correctly returning `next()` inside the pre-save hook).
- Fixed port binding mismatch for `cog-svc` inside its Dockerfile (aligned with `docker-compose.yml` port 8000).
- Fixed duplicate pages (`SettingsPage.jsx` and `MyMenteesPage.jsx`) and obsolete components.
