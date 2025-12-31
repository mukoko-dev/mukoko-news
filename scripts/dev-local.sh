#!/bin/bash

# Mukoko News Local Development Script
echo "🚀 Starting Mukoko News Development..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local - Please update with your API credentials"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🌐 Starting services..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8787 (optional)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start Next.js development server
npm run dev
