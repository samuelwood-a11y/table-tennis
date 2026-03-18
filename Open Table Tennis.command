#!/bin/bash

# Navigate to the app directory
cd "$(dirname "$0")"

# Check if already running on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "✅ App already running — opening browser..."
  open http://localhost:3000
  exit 0
fi

echo "🏓 Starting Table Tennis app..."
npm run dev &

# Wait for the server to be ready
echo "⏳ Waiting for server..."
for i in {1..30}; do
  if curl -s -o /dev/null http://localhost:3000; then
    echo "✅ Ready!"
    open http://localhost:3000
    exit 0
  fi
  sleep 1
done

echo "❌ Server did not start in time"
