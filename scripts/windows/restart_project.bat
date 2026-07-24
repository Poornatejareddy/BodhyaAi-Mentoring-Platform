@echo off
rem ==============================================================================
rem BODHYAAI WINDOWS RESTART UTILITY
rem ==============================================================================

echo ====================================================
echo        RESTARTING ALL BODHYAAI SERVICES (WINDOWS)
echo ====================================================

call scripts\windows\stop_project.bat
call scripts\windows\run_project.bat
