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
