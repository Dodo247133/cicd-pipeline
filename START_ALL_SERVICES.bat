@echo off
cd /d "%~dp0"
echo ========================================================
echo   Conference Registration DevOps Project - Master Launcher
echo ========================================================
echo 1. Starting Web Application on http://localhost:8080 ...
start "Conference Portal (Port 8080)" cmd /k "START_SERVER.bat"

echo 2. Starting Jenkins CI/CD on http://localhost:8085 ...
start "Jenkins Server (Port 8085)" cmd /k "START_JENKINS.bat"

echo ========================================================
echo Both services are booting in separate console windows.
echo Portal URL:   http://localhost:8080/admin.html
echo Jenkins URL:  http://localhost:8085/
echo ========================================================
timeout /t 5
