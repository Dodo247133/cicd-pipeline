@echo off
cd /d "%~dp0"
set "JAVA_HOME=%~dp0tools\jdk-21.0.13+9"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "JENKINS_HOME=%~dp0tools\.jenkins"

echo ========================================================
echo  Starting Jenkins CI/CD Automation Server (Port 8085)
echo ========================================================
echo Java Home:    %JAVA_HOME%
echo Jenkins Home: %JENKINS_HOME%
echo Jenkins URL:  http://localhost:8085/
echo ========================================================
echo.
echo Launching Jenkins... please wait 15-30 seconds for initialization.
java -Djenkins.install.runSetupWizard=false -jar tools\jenkins.war --httpPort=8085
pause
