# REDDY AI STUDIO - Automated Launch Script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  REDDY AI STUDIO - Autonomous AI Video Production" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$env:NODE_PATH = "$ScriptDir\..\premium-stream\backend\node_modules;$ScriptDir\..\premium-stream\frontend\node_modules;$ScriptDir\backend\node_modules"

Write-Host "Starting Unified Server on http://localhost:5050 ..." -ForegroundColor Green
node backend/src/server.js
