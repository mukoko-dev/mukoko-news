#!/bin/bash
echo "🚀 Deploying Harare Metro..."

echo "📦 Building..."
npm run build

echo "☁️ Deploying..."
npx wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🔧 Next: Initialize KV configuration"
    echo "Run: ./scripts/configure.sh"
else
    echo "❌ Deployment failed"
    exit 1
fi
