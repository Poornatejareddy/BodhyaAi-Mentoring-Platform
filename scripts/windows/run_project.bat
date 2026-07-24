@echo off
rem ==============================================================================
rem BODHYAAI WINDOWS STARTUP ORCHESTRATION SCRIPT
rem ==============================================================================

echo ====================================================
echo         BODHYAAI WINDOWS SERVICES INITIATOR
echo ====================================================

rem 1. Check folder layout
if not exist logs mkdir logs
if not exist .pids mkdir .pids

rem 2. Check variables
if not exist .env (
    echo [WARNING] Missing root .env. Creating from template...
    copy .env.example .env >nul
)

if not exist backend\.env (
    echo Running setup first...
    call scripts\windows\setup_project.bat
)

rem 3. Dependency detection
if not exist backend\node_modules (
    echo Installing backend dependencies...
    cd backend && call npm install && cd ..
)
if not exist frontend\node_modules (
    echo Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)
if not exist ai-services\venv (
    echo Installing python virtual env...
    python -m venv ai-services\venv
    call ai-services\venv\Scripts\activate.bat
    pip install -r ai-services\requirements.txt
    pip install -e ai-services\
)

rem 4. Free ports function on Windows
rem Check for port helper
setlocal enabledelayedexpansion
for %%P in (27017 8000 8001 8002 8003 5001 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":%%P "') do (
        set pid=%%a
        if not "!pid!"=="" (
            echo Releasing port %%P occupied by PID !pid!...
            taskkill /F /PID !pid! >nul 2>nul
        )
    )
)

rem 5. MongoDB Launcher
where docker >nul 2>nul
if %errorlevel% equ 0 (
    echo Starting MongoDB container via Docker...
    docker rm -f bodhyai-mongodb-local >nul 2>nul
    docker run -d --name bodhyai-mongodb-local -p 27017:27017 mongo:6 > logs\mongodb.log 2>&1
    echo docker-bodhyai-mongodb-local > .pids\mongodb.pid
) else (
    echo Starting local mongod...
    start /B mongod --logpath logs\mongodb.log
    for /f "tokens=5" %%p in ('netstat -aon ^| findstr 27017') do set mongo_pid=%%p
    echo !mongo_pid! > .pids\mongodb.pid
)
timeout /t 5 >nul

rem 6. Start AI services
call ai-services\venv\Scripts\activate.bat

echo Starting Cognitive Service (8000)...
start /B python -m uvicorn service:app --host 0.0.0.0 --port 8000 > logs\cognitive.log 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr 8000') do set cog_pid=%%p
echo !cog_pid! > .pids\cog.pid

echo Starting Risk Service (8001)...
start /B python -m uvicorn service:app --host 0.0.0.0 --port 8001 > logs\risk.log 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr 8001') do set risk_pid=%%p
echo !risk_pid! > .pids\risk.pid

echo Starting XAI Service (8002)...
start /B python -m uvicorn service:app --host 0.0.0.0 --port 8002 > logs\xai.log 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr 8002') do set xai_pid=%%p
echo !xai_pid! > .pids\xai.pid

echo Starting LLM Service (8003)...
start /B python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 > logs\llm.log 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr 8003') do set llm_pid=%%p
echo !llm_pid! > .pids\llm.pid

timeout /t 5 >nul

rem 7. Express Backend Server
echo Starting Express Backend Gateway (5001)...
cd backend
start /B npm run dev > ..\logs\backend.log 2>&1
cd ..
timeout /t 3 >nul
for /f "tokens=5" %%p in ('netstat -aon ^| findstr 5001') do set backend_pid=%%p
echo !backend_pid! > .pids\backend.pid

rem 8. Frontend Server
echo Starting Vite React Client (5173)...
cd frontend
start /B npm run dev > ..\logs\frontend.log 2>&1
cd ..
timeout /t 3 >nul
for /f "tokens=5" %%p in ('netstat -aon ^| findstr 5173') do set frontend_pid=%%p
echo !frontend_pid! > .pids\frontend.pid

echo ====================================================
echo All services started successfully on Windows!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5001
echo ====================================================
