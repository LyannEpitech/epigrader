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
