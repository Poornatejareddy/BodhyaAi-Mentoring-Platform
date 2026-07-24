@echo off
rem ==============================================================================
rem BODHYAAI WINDOWS CLEAN SHUTDOWN UTILITY
rem ==============================================================================

echo ====================================================
echo        BODHYAAI WINDOWS SERVICES TERMINATOR
echo ====================================================

set PID_DIR=.pids

if not exist %PID_DIR% (
    echo No pid folder found. Skipping process termination checks.
    exit /b 0
)

setlocal enabledelayedexpansion
for %%f in (frontend.pid backend.pid llm.pid xai.pid risk.pid cog.pid) do (
    if exist %PID_DIR%\%%f (
        set /p pid=<%PID_DIR%\%%f
        echo Stopping service PID !pid!...
        taskkill /F /PID !pid! >nul 2>nul
        del %PID_DIR%\%%f >nul 2>nul
    )
)

if exist %PID_DIR%\mongodb.pid (
    set /p mpid=<%PID_DIR%\mongodb.pid
    if "!mpid:~0,7!"=="docker-" (
        set container=!mpid:~7!
        echo Stopping docker container !container!...
        docker rm -f !container! >nul 2>nul
    ) else (
        echo Stopping local mongod PID !mpid!...
        taskkill /F /PID !mpid! >nul 2>nul
    )
    del %PID_DIR%\mongodb.pid >nul 2>nul
)

rmdir /s /q %PID_DIR% >nul 2>nul
echo ====================================================
echo Shutdown completed successfully on Windows!
echo ====================================================
