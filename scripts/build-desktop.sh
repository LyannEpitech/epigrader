#!/bin/bash

# Build script for EpiGrader Desktop Application
# This script builds the backend, frontend, and packages them into an Electron app

set -e

echo "🚀 Building EpiGrader Desktop Application..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build Backend
echo -e "${BLUE}📦 Building Backend...${NC}"
cd ../backend
npm run build
echo -e "${GREEN}✅ Backend built successfully${NC}"
echo ""

# Build Frontend
echo -e "${BLUE}📦 Building Frontend...${NC}"
cd ../frontend
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Build Desktop App
echo -e "${BLUE}📦 Building Desktop Application...${NC}"
cd ../desktop
npm install
npm run build

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "To create the distributable:"
echo "  cd desktop"
echo "  npm run dist        # Build for current platform"
echo "  npm run dist:win    # Build for Windows"
echo "  npm run dist:mac    # Build for macOS"
echo "  npm run dist:linux  # Build for Linux"
echo ""
echo "Output will be in: desktop/release/"