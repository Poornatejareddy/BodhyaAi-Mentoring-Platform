# Contributing to BodhyaAI

Thank you for your interest in contributing to BodhyaAI! We welcome community contributions to make this AI-powered student success platform even better.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the Repository**: Create your own copy of the repository on GitHub.
2. **Clone the Fork**:
   ```bash
   git clone https://github.com/Poornatejareddy/BodhyaAi-Mentoring-Platform.git
   cd BodhyaAi-Mentoring-Platform
   ```
3. **Set Up the Workspace**:
   - Install backend Node packages: `cd backend && npm install`
   - Install frontend Node packages: `cd ../frontend && npm install`
   - Setup the AI services virtual environment: `cd ../ai-services && ./start_all_services.sh`

## Development Guidelines

### Python (AI Services)
- We use a unified virtual environment at `/ai-services/venv` with requirements defined in `/ai-services/requirements.txt`.
- Shared code should go in the `ai-services/common` library.
- Format python code following PEP 8 guidelines.

### Frontend & Backend
- Use ESLint for static code analysis. Run lint checks with `npm run lint`.
- Make sure to test your endpoints using automated tests before submitting a Pull Request.

## Pull Request Process

1. Create a descriptive branch for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Write tests for your changes.
3. Commit your changes with meaningful messages.
4. Push to your branch and open a Pull Request against the `main` branch.
5. Ensure all checks in the CI/CD pipeline pass successfully.
