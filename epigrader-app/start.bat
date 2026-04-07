@echo off
chcp 65001 >nul
echo ==========================================
echo   EpiGrader - AI Code Grader
echo ==========================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is required but not installed.
    echo.
    echo Please install Node.js 18+ from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check for .env file
if not exist "%~dp0\package\.env" (
    echo ⚠️  Warning: .env file not found
    echo Creating default .env file...
    (
        echo NODE_ENV=production
        echo PORT=3002
        echo MOONSHOT_API_KEY=
    ) > "%~dp0\package\.env"
)

cd /d "%~dp0\package"
echo 🚀 Starting EpiGrader server...
echo    URL: http://localhost:3002
echo.

start /b node index.js

timeout /t 3 /nobreak >nul

echo ✅ Server is running!
echo.
echo 🌐 Opening browser...
start http://localhost:3002

echo.
echo ==========================================
echo   EpiGrader is ready!
echo   Close this window to stop
echo ==========================================
echo.

pause
