#!/bin/bash

# Mukoko News Deployment Script
# Deploys backend to Cloudflare Workers

echo "🚀 Deploying Mukoko News Backend..."

cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Type check
echo "🔍 Running type check..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

# Deploy to Cloudflare Workers
echo "☁️ Deploying to Cloudflare Workers..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend deployment successful!"
    echo "🌐 API: https://mukoko-news-backend.nyuchi.workers.dev"
    echo ""
    echo "🔍 Verifying deployment..."
    sleep 3

    # Test health endpoint
    if curl -s https://mukoko-news-backend.nyuchi.workers.dev/api/health | grep -q "ok"; then
        echo "✅ Health check passed"
    else
        echo "⚠️  Health check pending (may still be propagating)"
    fi
else
    echo "❌ Deployment failed"
    exit 1
fi
