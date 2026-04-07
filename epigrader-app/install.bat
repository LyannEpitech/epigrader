@echo off
echo ==========================================
echo   EpiGrader - Installation
echo ==========================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is required
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.
echo 📦 Installing dependencies...
cd /d "%~dp0\backend"
npm install --production

echo.
echo ✅ Installation complete!
pause
