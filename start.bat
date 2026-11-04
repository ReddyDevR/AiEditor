@echo off
echo ========================================================
echo   Starting REDDY AI STUDIO (Autonomous Video Platform)
echo ========================================================
cd /d "%~dp0"
set NODE_PATH=%~dp0..\premium-stream\backend\node_modules;%~dp0..\premium-stream\frontend\node_modules;%~dp0backend\node_modules
node backend/src/server.js
pause
