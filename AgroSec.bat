@echo off
title AgroSec Automation
echo ===================================================
echo              STARTING AGROSEC
echo ===================================================

echo [1/3] Launching Spring Boot Backend...

start cmd /k "cd /d C:\Users\T470\Downloads\Project\backend && .\mvnw.cmd spring-boot:run"

timeout /t 25

echo [2/3] Launching Ngrok Server Tunnel...

start cmd /k "ngrok http --domain=reproach-sinner-femur.ngrok-free.dev 8080"


timeout /t 18

echo [3/3] Launching Python Edge AI Camera...

start cmd /k "cd /d C:\Users\T470\Downloads\Project && python edge_detector.py"

echo ===================================================
echo         ALL SYSTEMS ARE LIVE
echo ===================================================
pause