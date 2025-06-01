#!/bin/bash

echo "🚀 Deploying Harare Metro to Cloudflare..."

# Check if wrangler is logged in
if ! wrangler whoami >/dev/null 2>&1; then
    echo "❌ You're not logged in to Wrangler"
    echo "Please run: wrangler login"
    exit 1
fi

# Build first
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy
echo "📤 Deploying to Cloudflare Workers..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at your Cloudflare Workers domain"
    echo ""
    echo "💡 Don't forget to:"
    echo "   - Update KV namespace IDs in wrangler.toml"
    echo "   - Configure custom domain if needed"
    echo "   - Set up monitoring and analytics"
else
    echo "❌ Deployment failed"
    exit 1
fi
