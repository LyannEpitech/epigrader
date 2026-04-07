; EpiGrader NSIS Installer Script
; Generates a professional Windows installer

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"

; General
Name "EpiGrader"
OutFile "EpiGrader-Setup.exe"
InstallDir "$LOCALAPPDATA\EpiGrader"
InstallDirRegKey HKCU "Software\EpiGrader" "InstallDir"
RequestExecutionLevel user

; Version Info
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "EpiGrader"
VIAddVersionKey "CompanyName" "EpiGrader"
VIAddVersionKey "FileDescription" "EpiGrader - AI Code Grading for Epitech"
VIAddVersionKey "FileVersion" "1.0.0"
VIAddVersionKey "ProductVersion" "1.0.0"
VIAddVersionKey "LegalCopyright" "© 2024 EpiGrader"

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\welcome.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets\header.bmp"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "French"
!insertmacro MUI_LANGUAGE "English"

; Installer Sections
Section "EpiGrader (Required)" SecMain
  SectionIn RO
  
  SetOutPath "$INSTDIR"
  
  ; Create directories
  CreateDirectory "$INSTDIR\backend"
  CreateDirectory "$INSTDIR\backend\frontend"
  CreateDirectory "$INSTDIR\assets"
  CreateDirectory "$INSTDIR\data"
  
  ; Copy backend files
  SetOutPath "$INSTDIR\backend"
  File /r "app\backend\*.*"
  
  ; Copy assets
  SetOutPath "$INSTDIR\assets"
  File "assets\icon.ico"
  
  ; Create main executable
  SetOutPath "$INSTDIR"
  File "EpiGrader.exe"
  
  ; Create config file
  SetOutPath "$INSTDIR"
  FileOpen $0 "config.json" w
  FileWrite $0 "{$\r$\n"
  FileWrite $0 "  \"moonshotApiKey\": \"\",$\r$\n"
  FileWrite $0 "  \"githubToken\": \"\",$\r$\n"
  FileWrite $0 "  \"firstRun\": true$\r$\n"
  FileWrite $0 "}$\r$\n"
  FileClose $0
  
  ; Install Node.js if needed
  Call InstallNodeJS
  
  ; Install dependencies
  DetailPrint "Installing dependencies..."
  nsExec::ExecToLog '"$INSTDIR\node\node.exe" "-e" "require(\'child_process\').execSync(\'cd \"$INSTDIR\backend\" && npm install --production\', {stdio: \'inherit\'})"'
  
  ; Store installation folder
  WriteRegStr HKCU "Software\EpiGrader" "InstallDir" $INSTDIR
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\EpiGrader"
  CreateShortcut "$SMPROGRAMS\EpiGrader\EpiGrader.lnk" "$INSTDIR\EpiGrader.exe" "" "$INSTDIR\assets\icon.ico" 0
  CreateShortcut "$SMPROGRAMS\EpiGrader\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\EpiGrader.lnk" "$INSTDIR\EpiGrader.exe" "" "$INSTDIR\assets\icon.ico" 0
  
  ; Register uninstaller
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "DisplayName" "EpiGrader"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "DisplayIcon" "$INSTDIR\assets\icon.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "Publisher" "EpiGrader"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader" "DisplayVersion" "1.0.0"
SectionEnd

Section "Desktop Shortcut" SecDesktop
  CreateShortcut "$DESKTOP\EpiGrader.lnk" "$INSTDIR\EpiGrader.exe" "" "$INSTDIR\assets\icon.ico" 0
SectionEnd

; Function to install Node.js
Function InstallNodeJS
  DetailPrint "Checking for Node.js..."
  
  ; Check if Node.js is installed
  nsExec::ExecToStack 'node --version'
  Pop $0
  
  ${If} $0 != 0
    DetailPrint "Node.js not found. Installing..."
    
    ; Download Node.js
    DetailPrint "Downloading Node.js..."
    inetc::get "https://nodejs.org/dist/v20.11.0/win-x64/node.exe" "$TEMP\node.exe" /END
    Pop $0
    
    ${If} $0 == "OK"
      CreateDirectory "$INSTDIR\node"
      CopyFiles "$TEMP\node.exe" "$INSTDIR\node\"
      DetailPrint "Node.js installed successfully"
    ${Else}
      DetailPrint "Failed to download Node.js"
      MessageBox MB_OK "Failed to download Node.js. Please install it manually from https://nodejs.org/"
    ${EndIf}
  ${Else}
    DetailPrint "Node.js is already installed"
  ${EndIf}
FunctionEnd

; Descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} "Install EpiGrader application and required components"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} "Create a shortcut on the desktop"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Uninstaller Section
Section "Uninstall"
  ; Stop any running processes
  nsProcess::FindProcess "node.exe"
  Pop $0
  ${If} $0 == "1"
    nsProcess::KillProcess "node.exe"
  ${EndIf}
  
  ; Remove files and directories
  RMDir /r "$INSTDIR\backend"
  RMDir /r "$INSTDIR\assets"
  RMDir /r "$INSTDIR\data"
  RMDir /r "$INSTDIR\node"
  Delete "$INSTDIR\EpiGrader.exe"
  Delete "$INSTDIR\config.json"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\EpiGrader\EpiGrader.lnk"
  Delete "$SMPROGRAMS\EpiGrader\Uninstall.lnk"
  RMDir "$SMPROGRAMS\EpiGrader"
  Delete "$DESKTOP\EpiGrader.lnk"
  
  ; Remove registry keys
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EpiGrader"
  DeleteRegKey HKCU "Software\EpiGrader"
SectionEnd

; Welcome page text
!define MUI_WELCOMEPAGE_TITLE "Welcome to EpiGrader Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of EpiGrader.$$
$$
EpiGrader is an AI-powered code grading tool for Epitech projects.$$
$$
Click Next to continue."

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\EpiGrader.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch EpiGrader now"