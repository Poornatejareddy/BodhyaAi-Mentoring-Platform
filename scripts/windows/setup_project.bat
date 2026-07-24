@echo off
rem ==============================================================================
rem BODHYAAI WINDOWS PROVISIONING SCRIPT
rem ==============================================================================

echo ====================================================
echo          BODHYAAI WINDOWS WORKSPACE SETUP
echo ====================================================

rem 1. Check requirements
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed.
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed.
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed.
    exit /b 1
)

rem 2. Environment config files
if not exist .env (
    echo Creating root .env file...
    copy .env.example .env >nul
)

if not exist backend\.env (
    echo Creating backend\.env file...
    (
    echo JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-in-production
    echo MONGODB_URI=mongodb://localhost:27017/bodhyai
    echo PORT=5001
    echo FRONTEND_URL=http://localhost:5173
    echo COG_SERVICE_URL=http://localhost:8000
    echo RISK_SERVICE_URL=http://localhost:8001
    echo XAI_SERVICE_URL=http://localhost:8002
    echo LLM_SERVICE_URL=http://localhost:8003
    ) > backend\.env
)

if not exist frontend\.env (
    echo Creating frontend\.env file...
    echo VITE_API_URL=http://localhost:5001 > frontend\.env
)

if not exist ai-services\.env (
    echo Creating ai-services\.env file...
    echo GEMINI_API_KEY=your-gemini-key > ai-services\.env
)

rem 3. NodeJS Modules installation
echo Installaing backend dependencies...
cd backend
call npm install
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

rem 4. Python Environment
if not exist ai-services\venv (
    echo Creating virtual environment in ai-services\venv...
    python -m venv ai-services\venv
)

echo Installing Python package requirements...
call ai-services\venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r ai-services\requirements.txt
pip install -e ai-services\

echo ====================================================
echo Setup Completed Successfully!
echo Start stack by running scripts\windows\run_project.bat
echo ====================================================
