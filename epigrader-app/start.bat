@echo off
echo ==========================================
echo   EpiGrader - AI Code Grader
echo ==========================================
echo.

if not exist "%~dp0\backend\node_modules" (
    echo ⚠️  Dependencies not installed.
    echo Running installation first...
    call "%~dp0\install.bat"
)

if not exist "%~dp0\backend\.env" (
    echo Creating configuration...
    (
        echo NODE_ENV=production
        echo PORT=3002
        echo MOONSHOT_API_KEY=
    ) > "%~dp0\backend\.env"
)

cd /d "%~dp0\backend"
echo 🚀 Starting EpiGrader...
echo    URL: http://localhost:3002
echo.

start /b node dist\index.js

timeout /t 3 /nobreak >nul
start http://localhost:3002

echo.
echo ✅ EpiGrader is running!
echo Close this window to stop.
pause
