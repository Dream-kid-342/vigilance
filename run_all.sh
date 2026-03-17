#!/bin/bash

# Kill node processes
killall node 2>/dev/null

echo "🚀 Launching Vigilance Ecosystem (Bash Script)..."

# Load root .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

CLIENT_PORT=${VIGILANCE_CLIENT_PORT:-5173}
WORKER_PORT=${VIGILANCE_WORKER_PORT:-5174}
ADMIN_PORT=${VIGILANCE_ADMIN_PORT:-5175}

# Start Apps
(cd client && npm run dev -- --port $CLIENT_PORT) &
echo "✅ Client App starting on http://localhost:$CLIENT_PORT"

(cd worker && npm run dev -- --port $WORKER_PORT) &
echo "✅ Worker App starting on http://localhost:$WORKER_PORT"

(cd admin && npm run dev -- --port $ADMIN_PORT) &
echo "✅ Admin App starting on http://localhost:$ADMIN_PORT"

echo "✨ All systems firing!"
wait
