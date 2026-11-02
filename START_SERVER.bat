@echo off
cd /d "%~dp0"
echo ========================================================
echo  Starting Conference Registration Portal (Port 8080)
echo ========================================================
echo Working directory: %CD%
echo.
echo Application URL:   http://localhost:8080/
echo Admin Dashboard:   http://localhost:8080/admin.html
echo Health Check:      http://localhost:8080/api/health
echo.
echo Leave this window open while using the application.
echo Press Ctrl+C to stop.
echo ========================================================
echo.
node server.js
pause
