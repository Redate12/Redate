#!/bin/bash

echo "🚀 Starting REDATE Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update with your credentials."
    echo ""
    echo "Required credentials:"
    echo "  - Firebase service account key"
    echo "  - Stripe secret keys"
    echo "  - Mapbox access token"
    echo "  - PostgreSQL database connection"
    echo "  - Redis connection"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "💕 Server starting on http://localhost:3000"
npm run dev