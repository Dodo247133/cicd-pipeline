@echo off
echo ========================================================
echo  Starting Conference Registration Portal (Local Mode)
echo ========================================================
echo.
echo Application will run on: http://localhost:8080/
echo Admin Dashboard:        http://localhost:8080/admin.html
echo Health Check:           http://localhost:8080/api/health
echo.
echo Press Ctrl+C at any time to stop the server.
echo ========================================================
node server.js
pause
