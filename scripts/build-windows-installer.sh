#!/bin/bash

# Build Windows Installer Package
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "=========================================="
echo "  Building Windows Installer Package"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Build backend and frontend
echo -e "${BLUE}Building application...${NC}"
cd backend && npm run build
cd ../frontend && npm run build

cd "$ROOT_DIR"

# Create package directory
rm -rf windows-installer/app
mkdir -p windows-installer/app/backend
mkdir -p windows-installer/app/assets

# Copy files
echo -e "${BLUE}Copying files...${NC}"
cp -r backend/dist/* windows-installer/app/backend/
cp backend/package.json windows-installer/app/backend/
cp -r frontend/dist windows-installer/app/backend/frontend/

# Create a simple icon placeholder
touch windows-installer/app/assets/icon.ico

# Create README
cat > windows-installer/README.txt << 'EOF'
EpiGrader - Windows Installer
==============================

INSTALLATION
------------
1. Double-click "Install.bat"
2. Wait for installation to complete
3. EpiGrader will start automatically

FIRST RUN
---------
On first run, you'll be asked for your Moonshot API Key.
Get one at: https://platform.moonshot.cn/

USAGE
-----
After installation, use the desktop shortcut or run EpiGrader.bat

UNINSTALL
---------
Delete the folder: %LOCALAPPDATA%\EpiGrader
Remove desktop shortcut

SUPPORT
-------
https://github.com/LyannEpitech/epigrader
EOF

# Create ZIP archive
echo -e "${BLUE}Creating installer package...${NC}"
cd windows-installer
zip -r ../EpiGrader-Windows-Installer.zip . -x "*.zip"

cd "$ROOT_DIR"

SIZE=$(du -h EpiGrader-Windows-Installer.zip | cut -f1)

echo ""
echo -e "${GREEN}✅ Windows installer package created!${NC}"
echo ""
echo "File: EpiGrader-Windows-Installer.zip (${SIZE})"
echo ""
echo "Contents:"
echo "  - Install.bat (Auto-installer with Node.js download)"
echo "  - EpiGrader.bat (Launcher with config wizard)"
echo "  - app/ (Backend + Frontend)"
echo "  - README.txt"
echo ""
echo "User workflow:"
echo "  1. Extract ZIP"
echo "  2. Double-click Install.bat"
echo "  3. Enter API key when prompted"
echo "  4. Use desktop shortcut to launch"