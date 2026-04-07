#!/bin/bash

# Package EpiGrader as a standalone application with integrated frontend
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Packaging EpiGrader with integrated frontend...${NC}"

# Create package directory
rm -rf epigrader-app
mkdir -p epigrader-app/package

# Copy backend
echo "Copying backend..."
cp -r backend/dist epigrader-app/package/
cp backend/package.json epigrader-app/package/

# Copy frontend into backend folder (for integrated serving)
echo "Copying frontend..."
mkdir -p epigrader-app/package/frontend/dist
cp -r frontend/dist/* epigrader-app/package/frontend/dist/

# Create .env file
cat > epigrader-app/package/.env << 'EOF'
NODE_ENV=production
PORT=3002
MOONSHOT_API_KEY=your_api_key_here
EOF

# Create start script
cat > epigrader-app/start.sh << 'EOF'
#!/bin/bash

# Start EpiGrader (Integrated Frontend + Backend)

echo "=========================================="
echo "  EpiGrader - AI Code Grader"
echo "=========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    echo ""
    echo "Please install Node.js 18+ from:"
    echo "  https://nodejs.org/"
    echo ""
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for .env file
if [ ! -f "$SCRIPT_DIR/package/.env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating default .env file..."
    cat > "$SCRIPT_DIR/package/.env" << 'ENVFILE'
NODE_ENV=production
PORT=3002
MOONSHOT_API_KEY=
ENVFILE
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Start backend
cd "$SCRIPT_DIR/package"
echo "🚀 Starting EpiGrader server..."
echo "   URL: http://localhost:3002"
echo ""

node index.js &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Failed to start server"
    exit 1
fi

echo "✅ Server is running!"
echo ""

# Open browser
echo "🌐 Opening browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3002 2>/dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:3002 2>/dev/null &
else
    echo "   Please open: http://localhost:3002"
fi

echo ""
echo "=========================================="
echo "  EpiGrader is ready!"
echo "  Press Ctrl+C to stop"
echo "=========================================="
echo ""

# Trap Ctrl+C
trap 'echo ""; echo "🛑 Stopping server..."; kill $SERVER_PID 2>/dev/null; exit 0' INT

wait $SERVER_PID
EOF

chmod +x epigrader-app/start.sh

# Create Windows start script
cat > epigrader-app/start.bat << 'BATEOF'
@echo off
chcp 65001 >nul
echo ==========================================
echo   EpiGrader - AI Code Grader
echo ==========================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is required but not installed.
    echo.
    echo Please install Node.js 18+ from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check for .env file
if not exist "%~dp0\package\.env" (
    echo ⚠️  Warning: .env file not found
    echo Creating default .env file...
    (
        echo NODE_ENV=production
        echo PORT=3002
        echo MOONSHOT_API_KEY=
    ) > "%~dp0\package\.env"
)

cd /d "%~dp0\package"
echo 🚀 Starting EpiGrader server...
echo    URL: http://localhost:3002
echo.

start /b node index.js

timeout /t 3 /nobreak >nul

echo ✅ Server is running!
echo.
echo 🌐 Opening browser...
start http://localhost:3002

echo.
echo ==========================================
echo   EpiGrader is ready!
echo   Close this window to stop
echo ==========================================
echo.

pause
BATEOF

# Create comprehensive README
cat > epigrader-app/README.txt << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                    EpiGrader v1.0.0                            ║
║              AI-Powered Code Grading Tool                      ║
╚════════════════════════════════════════════════════════════════╝

QUICK START
───────────

1. Prerequisites:
   • Node.js 18 or higher installed
   • GitHub Personal Access Token (PAT)
   • Moonshot API key (for AI analysis)

2. First Run:
   
   Linux/Mac:
     ./start.sh
   
   Windows:
     Double-click start.bat

3. The application will:
   ✓ Start the backend server on http://localhost:3002
   ✓ Open your default browser automatically
   ✓ Display the EpiGrader interface

CONFIGURATION
─────────────

Edit package/.env file:

  MOONSHOT_API_KEY=your_moonshot_api_key_here

Get your API key from: https://platform.moonshot.cn/

GITHUB TOKEN
────────────

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes:
   ☑ repo (Full control of private repositories)
4. For Epitech repositories:
   → Authorize SAML SSO at:
     https://github.com/orgs/EpitechBachelorPromo2028/sso

USAGE
─────

1. Enter your GitHub PAT in the interface
2. Create or select a grading rubric
3. Paste a GitHub repository URL
4. Click "Analyze"
5. Wait for AI analysis to complete
6. Review the detailed grading report
7. Export as PDF if needed

TROUBLESHOOTING
───────────────

❌ "Port 3002 is already in use"
   → Kill existing Node processes:
      Linux/Mac: killall node
      Windows: taskkill /F /IM node.exe

❌ "Cannot connect to backend"
   → Check that the server started correctly
   → Look for error messages in the terminal

❌ "GitHub API error"
   → Verify your PAT is valid
   → Check SAML SSO authorization for Epitech repos

❌ "Moonshot API error"
   → Verify your API key in package/.env
   → Check your Moonshot account has available credits

SUPPORT
───────

GitHub: https://github.com/LyannEpitech/epigrader
Issues: https://github.com/LyannEpitech/epigrader/issues

LICENSE
───────

MIT License - See LICENSE file for details

═══════════════════════════════════════════════════════════════════
EOF

# Create tar archive
echo ""
echo "Creating archive..."
tar -czf epigrader-app.tar.gz epigrader-app/

# Get size
SIZE=$(du -h epigrader-app.tar.gz | cut -f1)

echo ""
echo -e "${GREEN}✅ Package created successfully!${NC}"
echo ""
echo "📦 File: epigrader-app.tar.gz (${SIZE})"
echo "📍 Location: $ROOT_DIR/epigrader-app.tar.gz"
echo ""
echo "═══════════════════════════════════════════════════"
echo "  INSTALLATION INSTRUCTIONS"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Linux/Mac:"
echo "  tar -xzf epigrader-app.tar.gz"
echo "  cd epigrader-app"
echo "  ./start.sh"
echo ""
echo "Windows:"
echo "  1. Extract with 7-Zip or WinRAR"
echo "  2. Double-click start.bat"
echo ""
echo "═══════════════════════════════════════════════════"