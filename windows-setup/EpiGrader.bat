@echo off
setlocal EnableDelayedExpansion

title EpiGrader
mode con: cols=80 lines=25

:: Get application directory
set "APP_DIR=%~dp0"
set "BACKEND_DIR=%APP_DIR%backend"
set "CONFIG_FILE=%APP_DIR%config.json"

:: ASCII Art Header
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════════════╗
echo  ║                                                                          ║
echo  ║     ███████╗██████╗ ██╗ ██████╗ ██████╗  █████╗ ██████╗ ███████╗██████╗  ║
echo  ║     ██╔════╝██╔══██╗██║██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗ ║
echo  ║     █████╗  ██████╔╝██║██║  ███╗██████╔╝███████║██║  ██║█████╗  ██████╔╝ ║
echo  ║     ██╔══╝  ██╔═══╝ ██║██║   ██║██╔══██╗██╔══██║██║  ██║██╔══╝  ██╔══██╗ ║
echo  ║     ███████╗██║     ██║╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗██║  ██║ ║
echo  ║     ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝ ║
echo  ║                                                                          ║
echo  ║                    AI-Powered Code Grading Tool                          ║
echo  ╚══════════════════════════════════════════════════════════════════════════╝
echo.

:: Check if first run or missing API key
if not exist "%CONFIG_FILE%" goto :first_run

:: Read config
powershell -Command "& {$c=Get-Content '%CONFIG_FILE%'|ConvertFrom-Json;if($c.moonshotApiKey -eq '' -or $c.moonshotApiKey -eq $null){exit 1}else{exit 0}}" >nul 2>&1
if errorlevel 1 goto :first_run

goto :start_server

:first_run
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════════════╗
echo  ║                         🔑 Configuration Required                        ║
echo  ╚══════════════════════════════════════════════════════════════════════════╝
echo.
echo  Welcome to EpiGrader! Before we start, we need to configure your API key.
echo.
echo  ┌─────────────────────────────────────────────────────────────────────────┐
echo  │ Step 1: Get your Moonshot API Key                                       │
echo  │                                                                         │
echo  │  1. Visit: https://platform.moonshot.cn/                                │
echo  │  2. Create an account or log in                                         │
echo  │  3. Go to API Keys section                                              │
echo  │  4. Create a new key                                                    │
echo  │  5. Copy the key (starts with 'sk-')                                    │
echo  └─────────────────────────────────────────────────────────────────────────┘
echo.
set /p APIKEY="Enter your Moonshot API Key: "

if "!APIKEY!"=="" (
    echo.
    echo [❌] API Key is required. Please try again.
    pause
    goto :first_run
)

if not "!APIKEY:~0,3!"=="sk-" (
    echo.
    echo [⚠️] Warning: API key should start with 'sk-'
    set /p CONTINUE="Continue anyway? (Y/N): "
    if /I "!CONTINUE!"=="N" goto :first_run
)

:: Save config
echo.
echo [💾] Saving configuration...
(
echo {
echo   "moonshotApiKey": "!APIKEY!",
echo   "githubToken": "",
echo   "firstRun": false
echo }
) > "%CONFIG_FILE%"

echo [✅] Configuration saved!
echo.
timeout /t 2 /nobreak >nul

:start_server
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════════════════╗
echo  ║                         🚀 Starting EpiGrader                            ║
echo  ╚══════════════════════════════════════════════════════════════════════════╝
echo.

:: Load API key
echo [1/3] Loading configuration...
for /f "tokens=*" %%a in ('powershell -Command "& {(Get-Content '%CONFIG_FILE%'|ConvertFrom-Json).moonshotApiKey}"') do set APIKEY=%%a
echo [✅] Configuration loaded
echo.

:: Create .env file
echo [2/3] Preparing server...
(
echo NODE_ENV=production
echo PORT=0
echo MOONSHOT_API_KEY=%APIKEY%
) > "%BACKEND_DIR%\.env"
echo [✅] Server ready
echo.

:: Start backend
echo [3/3] Starting server...
echo     Please wait...
echo.

cd /d "%BACKEND_DIR%"
start /b node dist\index.js > "%TEMP%\epigrader.log" 2>&1

:: Wait and check
set /a COUNT=0
:wait_loop
timeout /t 1 /nobreak >nul
set /a COUNT+=1

:: Check if port file exists
if exist "%BACKEND_DIR%\.port" (
    for /f "tokens=*" %%a in ('type "%BACKEND_DIR%\.port"') do set PORT=%%a
    goto :server_ready
)

if %COUNT% GTR 10 (
    echo [❌] Server failed to start. Check log: %TEMP%\epigrader.log
    pause
    exit /b 1
)

goto :wait_loop

:server_ready
echo [✅] Server started on port %PORT%
echo.

:: Open browser
echo 🌐 Opening browser...
start http://localhost:%PORT%

echo.
echo ╔══════════════════════════════════════════════════════════════════════════╗
echo ║                                                                          ║
echo ║                    ✅ EpiGrader is Running!                               ║
echo ║                                                                          ║
echo ║  🌐 Open your browser at: http://localhost:%PORT%                          ║
echo ║                                                                          ║
echo ║  Press any key to stop the server...                                     ║
echo ║                                                                          ║
echo ╚══════════════════════════════════════════════════════════════════════════╝
echo.

pause >nul

:: Stop server
echo.
echo 🛑 Stopping server...
taskkill /F /IM node.exe >nul 2>&1
echo [✅] Server stopped
echo.
echo Thank you for using EpiGrader!
timeout /t 2 /nobreak >nul