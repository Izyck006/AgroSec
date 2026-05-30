@echo off
title AgroSec Automation Pipeline
echo ===================================================
echo              STARTING AGROSEC SYSTEM
echo ===================================================

echo [1/3] Launching Spring Boot Backend...
:: CHANGE THE PATH BELOW TO YOUR ACTUAL BACKEND FOLDER
start cmd /k "cd /d C:\Users\T470\Downloads\Project\backend && .\mvnw.cmd spring-boot:run"

:: Wait 12 seconds to give the Java server enough time to boot up completely
timeout /t 12

echo [2/3] Launching Permanent Ngrok Tunnel...
:: This uses your permanent Ngrok link automatically
start cmd /k "ngrok http --domain=reproach-sinner-femur.ngrok-free.dev 8080"

:: Wait 3 seconds for the tunnel to establish connection
timeout /t 3

echo [3/3] Launching Python Edge AI Camera Node...
:: CHANGE THE PATH BELOW TO WHERE YOUR PYTHON SCRIPT IS
start cmd /k "cd /d C:\Users\T470\Downloads\Project && python edge_detector.py"

echo ===================================================
echo         ALL SYSTEMS ARE LIVE AND DEPLOYED!
echo ===================================================
pause