#!/bin/bash

# Build EpiGrader Electron Application
# Creates a complete Windows executable with installer

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "=========================================="
echo "  Building EpiGrader Electron App"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required${NC}"
    exit 1
fi

# Build backend
echo -e "${BLUE}📦 Building Backend...${NC}"
cd backend
npm install
npm run build
echo -e "${GREEN}✅ Backend built${NC}"

# Build frontend
echo ""
echo -e "${BLUE}📦 Building Frontend...${NC}"
cd ../frontend
npm install
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

# Install Electron dependencies
echo ""
echo -e "${BLUE}📦 Installing Electron Dependencies...${NC}"
cd ../electron
npm install
echo -e "${GREEN}✅ Electron dependencies installed${NC}"

# Create assets directory
mkdir -p assets

# Create a simple icon if none exists
if [ ! -f "assets/icon.ico" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  No icon found. Creating placeholder...${NC}"
    echo "    Please replace assets/icon.ico with a real icon (256x256px)"
    touch assets/icon.ico
fi

# Create LICENSE file
cat > LICENSE.txt << 'EOF'
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
EOF

echo ""
echo -e "${BLUE}📦 Building Electron Application...${NC}"
echo ""

# Build for current platform
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "Building for Windows (native)..."
    npm run dist:win
elif command -v wine &> /dev/null; then
    echo "Building for Windows (with Wine)..."
    npm run dist:win
else
    echo -e "${YELLOW}⚠️  Wine not found. Building for current platform...${NC}"
    echo "    To build for Windows, install Wine:"
    echo "    sudo apt-get install wine64"
    echo ""
    npm run dist
fi

# Check if build succeeded
cd "$ROOT_DIR"

if [ -d "electron/dist" ]; then
    echo ""
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo ""
    echo "Output files:"
    ls -lh electron/dist/*.{exe,dmg,AppImage,deb} 2>/dev/null || ls -lh electron/dist/
    echo ""
    echo -e "${BLUE}Windows Users:${NC}"
    echo "  - EpiGrader Setup.exe : Full installer with wizard"
    echo "  - EpiGrader-Portable.exe : Portable version (no install)"
    echo ""
    echo -e "${BLUE}Installation:${NC}"
    echo "  1. Run EpiGrader Setup.exe on Windows"
    echo "  2. Follow the installation wizard"
    echo "  3. Enter API key on first launch"
    echo "  4. Done!"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi