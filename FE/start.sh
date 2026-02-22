#!/bin/bash

echo "🚀 Starting REDATE Frontend (Expo)..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Expo development server
echo "💕 Expo starting on http://localhost:19002"
npm start