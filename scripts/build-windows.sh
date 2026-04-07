#!/bin/bash

# Build EpiGrader Windows Executable
# This script builds everything needed for a Windows executable

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "=========================================="
echo "  Building EpiGrader Windows Executable"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Building Backend...${NC}"
cd backend
npm install
npm run build
echo -e "${GREEN}✅ Backend built${NC}"

echo ""
echo -e "${BLUE}📦 Step 2: Building Frontend...${NC}"
cd ../frontend
npm install
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

echo ""
echo -e "${BLUE}📦 Step 3: Preparing Electron...${NC}"
cd ../electron

# Create necessary directories
mkdir -p assets
mkdir -p build

# Create a simple icon if none exists
if [ ! -f "assets/icon.ico" ]; then
    echo "⚠️  No icon found, creating placeholder..."
    # You should replace this with a real icon
    touch assets/icon.ico
fi

echo -e "${GREEN}✅ Electron prepared${NC}"

echo ""
echo -e "${BLUE}📦 Step 4: Installing Electron Dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}⚠️  Note: Building Windows executable on Linux requires Wine${NC}"
echo -e "${YELLOW}   Install with: sudo apt install wine64${NC}"
echo ""

# Check if we're on Windows or have Wine
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo -e "${BLUE}📦 Building Windows executable (native)...${NC}"
    npm run dist:win
elif command -v wine &> /dev/null; then
    echo -e "${BLUE}📦 Building Windows executable (with Wine)...${NC}"
    npm run dist:win
else
    echo -e "${YELLOW}⚠️  Wine not found. Building portable package instead...${NC}"
    
    # Create a portable package
    mkdir -p dist/portable
    
    # Copy files
    cp -r src dist/portable/
    cp package.json dist/portable/
    cp -r ../backend/dist dist/portable/backend/
    cp ../backend/package.json dist/portable/backend/
    cp -r ../frontend/dist dist/portable/backend/frontend/
    
    # Create batch file
    cat > dist/portable/EpiGrader.bat << 'EOF'
@echo off
echo Starting EpiGrader...
cd /d "%~dp0"
node src/main.js
EOF
    
    echo -e "${GREEN}✅ Portable package created in dist/portable/${NC}"
    echo ""
    echo "To run on Windows:"
    echo "  1. Copy dist/portable/ to Windows machine"
    echo "  2. Run EpiGrader.bat"
    echo ""
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "Output location: electron/dist/"
echo ""
ls -lh dist/*.exe 2>/dev/null || ls -lh dist/