@echo off
REM ──────────────────────────────────────────────
REM  MediAI — Launch Both Backend + AI Service
REM ──────────────────────────────────────────────
echo.
echo  🏥 MediAI Integrated Startup
echo ──────────────────────────────
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Python not found! Please install Python 3.10+
    pause
    exit /b 1
)

REM Check if Node is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/4] Installing Python dependencies...
pip install -q -r ai\requirements.txt 2>nul

echo [2/4] Installing Node dependencies...
if not exist node_modules (
    call npm install
) else (
    echo      (node_modules exists, skipping)
)

echo [3/4] Starting AI Service (Python FastAPI) on port 8000...
REM Must run from the ai/ directory so 'from app.xxx' imports resolve
start "MediAI AI Service" cmd /k "cd /d %~dp0ai && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait for AI service to start
echo      Waiting for AI service to start...
timeout /t 4 /nobreak >nul

echo [4/4] Starting Backend (Node.js Express) on port 3000...
start "MediAI Backend" cmd /k "cd /d %~dp0 && npx tsx src/index.ts"

echo.
echo ──────────────────────────────────────────────
echo  ✅ Both services starting!
echo.
echo  Backend:     http://localhost:3000
echo  AI Service:  http://localhost:8000
echo  Temp UI:     http://localhost:3000
echo  Health:      http://localhost:3000/api/health
echo  AI Docs:     http://localhost:8000/docs
echo ──────────────────────────────────────────────
echo.
pause
