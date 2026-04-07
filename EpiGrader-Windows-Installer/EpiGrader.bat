@echo off
setlocal

echo ==========================================
echo   EpiGrader - AI Code Grader
echo ==========================================
echo.

:: Get install directory
set "APP_DIR=%LOCALAPPDATA%\EpiGrader"
if not exist "%APP_DIR%" (
    echo Error: EpiGrader not found.
    echo Please run Install.bat first.
    pause
    exit /b 1
)

:: Check if config exists
if not exist "%APP_DIR%\config.json" (
    echo First run - Configuration needed
    echo.
    goto :configure
)

:: Read config and check for API key
powershell -Command "& {$config = Get-Content '%APP_DIR%\config.json' | ConvertFrom-Json; if ($config.moonshotApiKey -eq '' -or $config.moonshotApiKey -eq $null) { exit 1 } else { exit 0 }}"
if errorlevel 1 goto :configure

goto :launch

:configure
echo.
echo Please enter your Moonshot API Key.
echo You can get one at: https://platform.moonshot.cn/
echo.
set /p APIKEY="API Key: "

if "%APIKEY%"=="" (
    echo Error: API Key is required
    pause
    exit /b 1
)

:: Save config
powershell -Command "& {@{moonshotApiKey='%APIKEY%';githubToken='';firstRun=$false} | ConvertTo-Json | Set-Content '%APP_DIR%\config.json'}"

echo.
echo Configuration saved!
echo.

:launch
echo Starting EpiGrader server...
echo.

:: Create .env file
powershell -Command "& {$config = Get-Content '%APP_DIR%\config.json' | ConvertFrom-Json; Set-Content '%APP_DIR%\backend\.env' \"NODE_ENV=production`nPORT=0`nMOONSHOT_API_KEY=$($config.moonshotApiKey)\"}"

:: Start backend
cd /d "%APP_DIR%\backend"
start /b node dist\index.js > "%TEMP%\epigrader.log" 2>&1

:: Wait for server
echo Waiting for server to start...
timeout /t 3 /nobreak >nul

:: Find the port
for /f "tokens=*" %%a in ('powershell -Command "& {if (Test-Path '%APP_DIR%\backend\.port') { Get-Content '%APP_DIR%\backend\.port' } else { '3002' }}"') do set PORT=%%a

if "%PORT%"=="" set PORT=3002

echo.
echo ==========================================
echo   EpiGrader is running!
echo   http://localhost:%PORT%
echo ==========================================
echo.

:: Open browser
start http://localhost:%PORT%

echo Press any key to stop EpiGrader...
pause >nul

:: Stop backend
taskkill /F /IM node.exe >nul 2>&1

echo.
echo EpiGrader stopped.
timeout /t 2 /nobreak >nul