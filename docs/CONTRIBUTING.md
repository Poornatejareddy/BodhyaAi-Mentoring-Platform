# Developer Contribution Guide

Welcome! We appreciate your contributions to BodhyaAI. Please follow these guidelines to submit high-quality enhancements, fixes, or diagnostics.

---

## 1. Code Style Guidelines

### Python (AI Services)
*   **Standards**: Follow PEP 8 guidelines.
*   **Formatters**: Use `black` for formatting and `flake8` for linting.
*   **Dependencies**: All new libraries must be defined in `ai-services/requirements.txt`. Do not add libraries to individual microservices folders.
*   **Shared Modules**: Put shared types, logic, or configurations inside the `common` library (`ai-services/common`).

### JavaScript (Frontend / Backend)
*   **Linter**: ESLint configuration. Check your changes before committing:
    ```bash
    npm run lint
    ```
*   **Formatting**: Use Prettier. Ensure consistent indentation (2 spaces) and line length boundaries.

---

## 2. Testing Guidelines

Never submit code changes without passing both unit and integration verifications:

### Microservices Verification
Ensure FastAPI microservices return expected responses:
```bash
pytest ai-services/llm-svc/test_service.py
```

### Express Gateway Verification
Run backend unit testing suites:
```bash
npm run test:backend
```

### End-to-End Integration Verification
Run the automated CLI verification suite to test user registration, risk calculations, database updates, and socket connections:
```bash
./scripts/test_project.sh
```

---

## 3. Pull Request Protocol

1.  **Branch Naming**: Use descriptive branch scopes:
    *   `feature/new-assessment-ui`
    *   `bugfix/jwt-expiry-logout`
    *   `perf/vector-indexing`
2.  **Commit Messages**: Keep commit messages concise and structural (e.g., `feat(llm): update gemini-3.5 fallback logic`).
3.  **Documentation**: If you change configuration files or API endpoints, update the corresponding reference file inside `docs/` and log entries in `CHANGELOG.md`.
