@echo off
title AgroSec
echo ===================================================
echo              STARTING AGROSEC
echo ===================================================

echo [1/2] Ngrok Server Tunnel:

start cmd /k "ngrok http --domain=reproach-sinner-femur.ngrok-free.dev 8080"


timeout /t 18

echo [1/2] Run Python node and start the Camera:

start cmd /k "cd /d C:\Users\T470\Downloads\Project && python edge_detector.py"

echo ===================================================
echo         ALL SYSTEMS ARE LIVE
echo ===================================================
pause