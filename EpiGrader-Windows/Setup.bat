@echo off
setlocal EnableDelayedExpansion

title EpiGrader Installer
mode con: cols=80 lines=30
cls

echo.
echo  ╔══════════════════════════════════════════════════════════════════════════╗
echo  ║                                                                          ║
echo  ║                    🎓 EpiGrader - Installation                           ║
echo  ║                                                                          ║
echo  ║              AI-Powered Code Grading for Epitech                         ║
echo  ║                                                                          ║
echo  ╚══════════════════════════════════════════════════════════════════════════╝
echo.

:: Check for admin rights (not required, but nice to have)
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [ℹ️] Running with administrator privileges
) else (
    echo [ℹ️] Running without administrator privileges (recommended)
)
echo.

:: Check for Node.js
echo [1/4] Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [⚠️] Node.js not found!
    echo.
    echo EpiGrader requires Node.js 18+ to run.
    echo.
    set /p INSTALL_NODE="Would you like to download Node.js now? (Y/N): "
    if /I "!INSTALL_NODE!"=="Y" (
        echo.
        echo Opening browser to download Node.js...
        start https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
        echo.
        echo Please install Node.js, then run this installer again.
        echo.
        pause
        exit /b 1
    ) else (
        echo.
        echo Installation cancelled. Please install Node.js from:
        echo https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo [✅] Node.js found: %NODE_VERSION%
echo.

:: Create installation directory
echo [2/4] Creating installation directory...
set "INSTALL_DIR=%LOCALAPPDATA%\EpiGrader"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
echo [✅] Installation directory: %INSTALL_DIR%
echo.

:: Copy application files
echo [3/4] Installing EpiGrader...
echo     This may take a few minutes...
echo.

:: Copy with progress indicator
xcopy /E /I /Y "app" "%INSTALL_DIR%" >nul 2>&1
if errorlevel 1 (
    echo [❌] Failed to copy application files
    pause
    exit /b 1
)

:: Install dependencies
echo     Installing dependencies...
cd /d "%INSTALL_DIR%\backend"
call npm install --production >nul 2>&1
if errorlevel 1 (
    echo [⚠️]  Warning: Some dependencies may not have installed correctly
) else (
    echo [✅] Dependencies installed
)

:: Create initial config
echo     Creating configuration...
(
echo {
echo   "moonshotApiKey": "",
echo   "githubToken": "",
echo   "firstRun": true
echo }
) > "%INSTALL_DIR%\config.json"

echo [✅] Installation complete!
echo.

:: Create shortcuts
echo [4/4] Creating shortcuts...

:: Desktop shortcut
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\EpiGrader.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\EpiGrader.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%SystemRoot%\System32\shell32.dll,14'; $Shortcut.Description = 'EpiGrader - AI Code Grading'; $Shortcut.Save()" >nul 2>&1

:: Start Menu shortcut
set "STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if not exist "%STARTMENU%\EpiGrader" mkdir "%STARTMENU%\EpiGrader"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\EpiGrader\EpiGrader.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\EpiGrader.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%SystemRoot%\System32\shell32.dll,14'; $Shortcut.Description = 'EpiGrader - AI Code Grading'; $Shortcut.Save()" >nul 2>&1

echo [✅] Shortcuts created
echo.

:: Installation complete
echo ╔══════════════════════════════════════════════════════════════════════════╗
echo ║                                                                          ║
echo ║                    ✅ Installation Complete!                              ║
echo ║                                                                          ║
echo ║  EpiGrader has been installed to:                                        ║
echo ║  %INSTALL_DIR%
echo ║                                                                          ║
echo ║  Shortcuts created:                                                      ║
echo ║  • Desktop                                                               ║
echo ║  • Start Menu ^> EpiGrader                                               ║
echo ║                                                                          ║
echo ╚══════════════════════════════════════════════════════════════════════════╝
echo.

:: Ask to launch
set /p LAUNCH_NOW="Would you like to launch EpiGrader now? (Y/N): "
if /I "%LAUNCH_NOW%"=="Y" (
    echo.
    echo Starting EpiGrader...
    call "%INSTALL_DIR%\EpiGrader.bat"
) else (
    echo.
    echo You can start EpiGrader later using the desktop shortcut.
    echo.
    echo Don't forget to get your Moonshot API key:
    echo https://platform.moonshot.cn/
    echo.
    pause
)

exit /b 0