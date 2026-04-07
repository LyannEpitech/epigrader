#!/bin/bash

# Build complete Windows installer with NSIS
# This creates a professional .exe installer

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "=========================================="
echo "  Building EpiGrader Windows Installer"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for NSIS
if ! command -v makensis &> /dev/null; then
    echo -e "${YELLOW}⚠️  NSIS not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y nsis nsis-pluginapi
fi

# Build application
echo -e "${BLUE}Building application...${NC}"
cd backend && npm run build
cd ../frontend && npm run build

cd "$ROOT_DIR"

# Prepare installer directory
rm -rf nsis-installer/build
mkdir -p nsis-installer/build
mkdir -p nsis-installer/build/app
mkdir -p nsis-installer/build/assets

# Copy files
echo -e "${BLUE}Preparing installer files...${NC}"
cp -r backend/dist nsis-installer/build/app/backend/
cp backend/package.json nsis-installer/build/app/backend/
cp -r frontend/dist nsis-installer/build/app/backend/frontend/

# Create launcher script
cat > nsis-installer/build/app/EpiGrader.bat << 'BATEOF'
@echo off
setlocal EnableDelayedExpansion

:: Get script directory
set "APP_DIR=%~dp0"
set "BACKEND_DIR=%APP_DIR%backend"

:: Check for config
if not exist "%APP_DIR%config.json" (
    echo First run - Configuration needed
    goto :configure
)

:: Read API key from config
for /f "tokens=*" %%a in ('powershell -Command "& {$c=Get-Content '%APP_DIR%config.json'|ConvertFrom-Json;if($c.moonshotApiKey -eq '' -or $c.moonshotApiKey -eq $null){exit 1}else{exit 0}}"') do set "HAS_KEY=%%a"

if errorlevel 1 goto :configure
goto :launch

:configure
echo.
echo ==========================================
echo   EpiGrader - Configuration
echo ==========================================
echo.
echo Please enter your Moonshot API Key.
echo You can get one at: https://platform.moonshot.cn/
echo.
set /p APIKEY="API Key: "

if "!APIKEY!"=="" (
    echo Error: API Key is required
    pause
    exit /b 1
)

:: Save config
powershell -Command "& {@{moonshotApiKey='!APIKEY!';githubToken='';firstRun=$false}|ConvertTo-Json|Set-Content '%APP_DIR%config.json'}"

echo.
echo Configuration saved!
echo.

:launch
:: Create .env file
powershell -Command "& {$c=Get-Content '%APP_DIR%config.json'|ConvertFrom-Json;Set-Content '%BACKEND_DIR%\.env' \"NODE_ENV=production`nPORT=0`nMOONSHOT_API_KEY=$($c.moonshotApiKey)\"}"

:: Start backend
cd /d "%BACKEND_DIR%"
start /b node dist\index.js > "%TEMP%\epigrader.log" 2>&1

:: Wait for server
echo Starting server...
timeout /t 3 /nobreak >nul

:: Find port
for /f "tokens=*" %%a in ('powershell -Command "& {if(Test-Path '%BACKEND_DIR%\.port'){Get-Content '%BACKEND_DIR%\.port'}else{'3002'}}"') do set PORT=%%a

:: Open browser
start http://localhost:%PORT%

echo.
echo EpiGrader is running at http://localhost:%PORT%
echo Press any key to stop...
pause >nul

:: Stop backend
taskkill /F /IM node.exe >nul 2>&1
BATEOF

# Create icon (placeholder)
touch nsis-installer/build/assets/icon.ico

# Create license file
cat > nsis-installer/build/LICENSE.txt << 'EOF'
EpiGrader License
=================

MIT License

Copyright (c) 2024 EpiGrader

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
EOF

# Create simplified NSIS script
cat > nsis-installer/build/installer.nsi << 'NSISEOF'
!include "MUI2.nsh"

Name "EpiGrader"
OutFile "EpiGrader-Setup.exe"
InstallDir "$LOCALAPPDATA\EpiGrader"
RequestExecutionLevel user

!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\EpiGrader.bat"
!define MUI_FINISHPAGE_RUN_TEXT "Launch EpiGrader"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  
  ; Copy all files
  File /r "app\*.*"
  File "LICENSE.txt"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\EpiGrader"
  CreateShortcut "$SMPROGRAMS\EpiGrader\EpiGrader.lnk" "$INSTDIR\EpiGrader.bat"
  CreateShortcut "$SMPROGRAMS\EpiGrader\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\EpiGrader.lnk" "$INSTDIR\EpiGrader.bat"
  
  ; Register uninstaller
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "DisplayName" "EpiGrader"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "Publisher" "EpiGrader"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "DisplayVersion" "1.0.0"
SectionEnd

Section "Uninstall"
  ; Stop processes
  ExecWait 'taskkill /F /IM node.exe' $0
  
  ; Remove files
  RMDir /r "$INSTDIR\app"
  Delete "$INSTDIR\EpiGrader.bat"
  Delete "$INSTDIR\LICENSE.txt"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\EpiGrader\EpiGrader.lnk"
  Delete "$SMPROGRAMS\EpiGrader\Uninstall.lnk"
  RMDir "$SMPROGRAMS\EpiGrader"
  Delete "$DESKTOP\EpiGrader.lnk"
  
  ; Remove registry
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader"
SectionEnd
NSISEOF

# Build installer
echo -e "${BLUE}Building installer...${NC}"
cd nsis-installer/build
makensis installer.nsi

# Move output
cd "$ROOT_DIR"
if [ -f "nsis-installer/build/EpiGrader-Setup.exe" ]; then
    cp "nsis-installer/build/EpiGrader-Setup.exe" .
    SIZE=$(du -h EpiGrader-Setup.exe | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ Installer created successfully!${NC}"
    echo ""
    echo "File: EpiGrader-Setup.exe (${SIZE})"
    echo ""
    echo "User workflow:"
    echo "  1. Double-click EpiGrader-Setup.exe"
    echo "  2. Follow installation wizard"
    echo "  3. Enter API key on first run"
    echo "  4. Use desktop shortcut"
    echo ""
else
    echo -e "${YELLOW}⚠️  Installer build failed${NC}"
    exit 1
fi