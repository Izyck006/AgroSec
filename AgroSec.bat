@echo off
title AgroSec Startup Manager
echo ===================================================
echo   Starting AgroSec: Edge-Driven Security System...
echo ===================================================
echo.

echo [1/3] Booting up Java Spring Boot Backend...

start "Farm Backend (Java)" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"

echo [2/3] Booting up React Dashboard...

start "Farm Dashboard (React)" cmd /k "cd farm-dashboard\farm-web-ui && npm run dev"

echo Waiting 5 seconds for the Java server to wake up...
timeout /t 5 /nobreak > NUL

echo [3/3] Booting up Python Edge Node...

start "Farm Edge Node (Python)" cmd /k "python edge_detector.py"

echo.
echo ===================================================
echo ALL SYSTEMS LAUNCHED SUCCESSFULLY!
echo You can now close this main launcher window.
echo ===================================================
pause