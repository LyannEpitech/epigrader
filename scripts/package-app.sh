#!/bin/bash

# Package EpiGrader as a standalone application
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Packaging EpiGrader...${NC}"

# Create package directory
rm -rf epigrader-app
mkdir -p epigrader-app

# Copy backend source and compiled files
echo "Copying backend..."
mkdir -p epigrader-app/backend
cp -r backend/dist epigrader-app/backend/
cp backend/package.json epigrader-app/backend/
cp backend/package-lock.json epigrader-app/backend/ 2>/dev/null || true

# Create default .env file
cat > epigrader-app/backend/.env << 'EOF'
NODE_ENV=production
PORT=3002
MOONSHOT_API_KEY=
EOF

# Copy frontend (into backend for integrated serving)
echo "Copying frontend..."
mkdir -p epigrader-app/backend/frontend/dist
cp -r frontend/dist/* epigrader-app/backend/frontend/dist/

# Create install script
cat > epigrader-app/install.sh << 'EOF'
#!/bin/bash

echo "=========================================="
echo "  EpiGrader - Installation"
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

echo "✅ Node.js found: $(node --version)"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Installing dependencies..."
cd "$SCRIPT_DIR/backend"
npm install --production 2>&1 | grep -E "(added|packages|found)" || true

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start EpiGrader:"
echo "  ./start.sh"
echo ""
EOF

chmod +x epigrader-app/install.sh

# Create start script
cat > epigrader-app/start.sh << 'EOF'
#!/bin/bash

echo "=========================================="
echo "  EpiGrader - AI Code Grader"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo "⚠️  Dependencies not installed."
    echo "Running installation first..."
    echo ""
    "$SCRIPT_DIR/install.sh"
    echo ""
fi

# Check for API key in .env
if ! grep -q "MOONSHOT_API_KEY=" "$SCRIPT_DIR/backend/.env" 2>/dev/null || grep -q "MOONSHOT_API_KEY=$" "$SCRIPT_DIR/backend/.env" 2>/dev/null; then
    echo "⚠️  Warning: MOONSHOT_API_KEY not configured"
    echo "   Please edit backend/.env and add your API key"
    echo "   Get your key at: https://platform.moonshot.cn/"
    echo ""
fi

# Start server
cd "$SCRIPT_DIR/backend"
echo "🚀 Starting EpiGrader..."
echo "   URL: http://localhost:3002"
echo ""

node dist/index.js &
SERVER_PID=$!

sleep 3

if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Failed to start server"
    exit 1
fi

echo "✅ Server is running!"
echo ""

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3002 2>/dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:3002 2>/dev/null &
fi

echo "=========================================="
echo "  EpiGrader is ready!"
echo "  Press Ctrl+C to stop"
echo "=========================================="
echo ""

trap 'echo ""; echo "🛑 Stopping..."; kill $SERVER_PID 2>/dev/null; exit 0' INT

wait $SERVER_PID
EOF

chmod +x epigrader-app/start.sh

# Create Windows scripts
cat > epigrader-app/install.bat << 'BATEOF'
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
BATEOF

cat > epigrader-app/start.bat << 'BATEOF'
@echo off
echo ==========================================
echo   EpiGrader - AI Code Grader
echo ==========================================
echo.

if not exist "%~dp0\backend\node_modules" (
    echo ⚠️  Dependencies not installed.
    echo Running installation first...
    call "%~dp0\install.bat"
)

if not exist "%~dp0\backend\.env" (
    echo Creating configuration...
    (
        echo NODE_ENV=production
        echo PORT=3002
        echo MOONSHOT_API_KEY=
    ) > "%~dp0\backend\.env"
)

cd /d "%~dp0\backend"
echo 🚀 Starting EpiGrader...
echo    URL: http://localhost:3002
echo.

start /b node dist\index.js

timeout /t 3 /nobreak >nul
start http://localhost:3002

echo.
echo ✅ EpiGrader is running!
echo Close this window to stop.
pause
BATEOF

# Create README
cat > epigrader-app/README.txt << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                    EpiGrader v1.0.0                            ║
║              AI-Powered Code Grading Tool                      ║
╚════════════════════════════════════════════════════════════════╝

INSTALLATION
────────────

1. Prerequisites:
   • Node.js 18+ installed

2. Install dependencies:
   
   Linux/Mac:
     ./install.sh
   
   Windows:
     Double-click install.bat

3. Configure:
   Edit backend/.env and add your Moonshot API key:
   MOONSHOT_API_KEY=your_key_here

START
─────

Linux/Mac:   ./start.sh
Windows:     Double-click start.bat

Then open: http://localhost:3002

GET API KEY
───────────
https://platform.moonshot.cn/

SUPPORT
───────
https://github.com/LyannEpitech/epigrader
EOF

# Create archive
echo ""
echo "Creating archive..."
tar -czf epigrader-app.tar.gz epigrader-app/

SIZE=$(du -h epigrader-app.tar.gz | cut -f1)

echo ""
echo -e "${GREEN}✅ Package created: epigrader-app.tar.gz (${SIZE})${NC}"
echo ""
echo "═══════════════════════════════════════════════════"
echo "  INSTALLATION"
echo "═══════════════════════════════════════════════════"
echo ""
echo "1. Extract:  tar -xzf epigrader-app.tar.gz"
echo "2. Install:  cd epigrader-app && ./install.sh"
echo "3. Run:      ./start.sh"
echo ""
echo "═══════════════════════════════════════════════════"