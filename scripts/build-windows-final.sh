#!/bin/bash

# Build final Windows distribution package
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "=========================================="
echo "  Building EpiGrader Windows Package"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build application
echo -e "${BLUE}Building application...${NC}"
cd backend && npm run build
cd ../frontend && npm run build

cd "$ROOT_DIR"

# Prepare package directory
rm -rf windows-setup/app
mkdir -p windows-setup/app/backend

# Copy files
echo -e "${BLUE}Copying files...${NC}"
cp -r backend/dist/* windows-setup/app/backend/
cp backend/package.json windows-setup/app/backend/
cp -r frontend/dist windows-setup/app/backend/frontend/

# Create README
cat > windows-setup/README.txt << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                              🎓 EpiGrader                                    ║
║                    AI-Powered Code Grading Tool                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

INSTALLATION
════════════

Method 1: Quick Install (Recommended)
─────────────────────────────────────
1. Double-click "Setup.bat"
2. Follow the on-screen instructions
3. The installer will:
   • Check for Node.js (and help you install it if missing)
   • Install EpiGrader to %LOCALAPPDATA%\EpiGrader
   • Create desktop and Start Menu shortcuts
   • Launch the application

Method 2: Portable (No Install)
───────────────────────────────
1. Just run "EpiGrader.bat" directly from this folder
2. Configuration will be saved in this folder

FIRST RUN
═════════

On first run, you'll be prompted to enter your Moonshot API Key:

1. Visit: https://platform.moonshot.cn/
2. Create an account or log in
3. Generate an API key
4. Copy and paste it when prompted

Your API key will be saved securely and you won't need to enter it again.

USAGE
═════

After installation, use either:
• Desktop shortcut: "EpiGrader"
• Start Menu: Start > EpiGrader > EpiGrader

The application will:
1. Start the backend server automatically
2. Open your default browser
3. Display the EpiGrader interface at http://localhost:PORT

To stop: Close the browser tab and press any key in the EpiGrader window.

UNINSTALL
═════════

Simply delete the folder:
  %LOCALAPPDATA%\EpiGrader

And remove the desktop shortcut.

TROUBLESHOOTING
═══════════════

Problem: "Node.js not found"
Solution: Install Node.js 18+ from https://nodejs.org/

Problem: "Server failed to start"
Solution: Check that port 3000-3010 is not in use by another application

Problem: "Invalid API key"
Solution: Get a valid key from https://platform.moonshot.cn/

SUPPORT
═══════

GitHub: https://github.com/LyannEpitech/epigrader
Issues: https://github.com/LyannEpitech/epigrader/issues

═══════════════════════════════════════════════════════════════════════════════
EOF

# Create archive
echo -e "${BLUE}Creating archive...${NC}"
cd windows-setup
tar -czf ../EpiGrader-Windows.tar.gz Setup.bat EpiGrader.bat README.txt app/

cd "$ROOT_DIR"

SIZE=$(du -h EpiGrader-Windows.tar.gz | cut -f1)

echo ""
echo -e "${GREEN}✅ Package created successfully!${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  EpiGrader-Windows.tar.gz (${SIZE})"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Contents:"
echo "  📦 Setup.bat       - Visual installer with Node.js check"
echo "  🚀 EpiGrader.bat   - Main launcher with ASCII UI"
echo "  📁 app/            - Backend + Frontend"
echo "  📖 README.txt      - Documentation"
echo ""
echo "User workflow:"
echo "  1. Extract on Windows"
echo "  2. Double-click Setup.bat"
echo "  3. Enter API key"
echo "  4. Done!"
echo ""
echo "No technical knowledge required! 🎉"
echo "═══════════════════════════════════════════════════════════════════"