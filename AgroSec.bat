@echo off
title AgroSec Automation
echo ===================================================
echo              STARTING AGROSEC PRODUCT
echo ===================================================

echo [1/3] Start Spring Boot Backend.

start cmd /k "cd /d C:\Users\T470\Downloads\Project\backend && .\mvnw.cmd spring-boot:run"

timeout /t 25

echo [2/3] Ngrok Server Tunnel:

start cmd /k "ngrok http --domain=reproach-sinner-femur.ngrok-free.dev 8080"


timeout /t 18

echo [3/3] Run Python node and Camera...

start cmd /k "cd /d C:\Users\T470\Downloads\Project && python edge_detector.py"

echo ===================================================
echo         ALL SYSTEMS ARE LIVE
echo ===================================================
pause