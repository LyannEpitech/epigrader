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
