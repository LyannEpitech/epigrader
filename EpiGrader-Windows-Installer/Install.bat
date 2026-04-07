@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   EpiGrader - Installation Wizard
echo ==========================================
echo.

:: Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [1/4] Node.js not found. Downloading installer...
    echo.
    
    :: Download Node.js LTS
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\nodejs.msi'}"
    
    if exist "%TEMP%\nodejs.msi" (
        echo [2/4] Installing Node.js...
        msiexec /i "%TEMP%\nodejs.msi" /qn /norestart
        del "%TEMP%\nodejs.msi"
        
        :: Refresh PATH
        call refreshenv.cmd 2>nul || set "PATH=%PATH%;%ProgramFiles%\nodejs"
        
        node --version >nul 2>&1
        if errorlevel 1 (
            echo [ERROR] Node.js installation failed
            pause
            exit /b 1
        )
    ) else (
        echo [ERROR] Failed to download Node.js
        echo Please install manually from https://nodejs.org/
        pause
        exit /b 1
    )
) else (
    echo [1/4] Node.js found: 
    node --version
)

echo.
echo [2/4] Installing EpiGrader...

:: Get script directory
set "INSTALL_DIR=%LOCALAPPDATA%\EpiGrader"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy application files
xcopy /E /I /Y "%~dp0app\*" "%INSTALL_DIR%\" >nul 2>&1

:: Install dependencies
cd /d "%INSTALL_DIR%\backend"
call npm install --production >nul 2>&1

echo [3/4] Creating shortcuts...

:: Create desktop shortcut
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\EpiGrader.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\EpiGrader.bat'; $Shortcut.IconLocation = '%INSTALL_DIR%\assets\icon.ico'; $Shortcut.Save()"

:: Create Start Menu shortcut
set "STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\EpiGrader.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\EpiGrader.bat'; $Shortcut.IconLocation = '%INSTALL_DIR%\assets\icon.ico'; $Shortcut.Save()"

echo [4/4] Installation complete!
echo.
echo EpiGrader has been installed to: %INSTALL_DIR%
echo.
echo Starting EpiGrader...
timeout /t 2 /nobreak >nul

:: Launch application
call "%INSTALL_DIR%\EpiGrader.bat"

exit /b 0