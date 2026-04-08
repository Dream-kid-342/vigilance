#!/bin/bash

# Kill node processes
killall node 2>/dev/null

echo "🚀 Launching Vigilance Ecosystem (Bash Script)..."

# Load root .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

PORT=${PORT:-5173}

# Start Unified App
npm run dev -- --port $PORT &
echo "✅ Unified App starting on http://localhost:$PORT"

echo "  ✅ Client      → http://localhost:$PORT/client"
echo "  ✅ Worker      → http://localhost:$PORT/worker"
echo "  ✅ Admin       → http://localhost:$PORT/admin"

echo "✨ All systems firing!"
wait
