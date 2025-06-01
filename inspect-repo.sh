#!/bin/bash

# Repository Structure Inspector
# This script will show the complete structure and key file contents

echo "🔍 HARARE METRO REPOSITORY INSPECTION"
echo "===================================="

# Show current directory
echo "📍 Current Directory:"
pwd
echo ""

# 1. DIRECTORY STRUCTURE
echo "📁 DIRECTORY STRUCTURE:"
echo "----------------------"
tree -a -I 'node_modules|.git|backup_*|*.log' || find . -type d -not -path './node_modules*' -not -path './.git*' -not -path './backup_*' | head -20

echo ""
echo "📋 DETAILED FILE LISTING:"
echo "-------------------------"

# 2. ROOT FILES
echo "🏠 ROOT FILES:"
ls -la | grep -E '\.(json|js|toml|md|html)$'

echo ""

# 3. SRC DIRECTORY
echo "⚛️  SRC DIRECTORY:"
if [ -d "src" ]; then
    find src -type f | head -20
else
    echo "❌ src/ directory not found!"
fi

echo ""

# 4. PUBLIC DIRECTORY  
echo "🌐 PUBLIC DIRECTORY:"
if [ -d "public" ]; then
    find public -type f | head -10
else
    echo "❌ public/ directory not found!"
fi

echo ""

# 5. WORKER DIRECTORY
echo "☁️  WORKER DIRECTORY:"
if [ -d "worker" ]; then
    find worker -type f | head -10
else
    echo "❌ worker/ directory not found!"
fi

echo ""

# 6. KEY FILE CONTENTS
echo "📄 KEY FILE CONTENTS:"
echo "====================="

# Package.json
echo "📦 PACKAGE.JSON:"
echo "---------------"
if [ -f "package.json" ]; then
    echo "✅ Found package.json"
    echo "Name: $(grep '"name"' package.json)"
    echo "Scripts:"
    grep -A 15 '"scripts"' package.json | head -15
else
    echo "❌ package.json not found!"
fi

echo ""

# Vite config
echo "⚡ VITE.CONFIG.JS:"
echo "-----------------"
if [ -f "vite.config.js" ]; then
    echo "✅ Found vite.config.js"
    cat vite.config.js
else
    echo "❌ vite.config.js not found!"
fi

echo ""

# Wrangler config
echo "☁️  WRANGLER.TOML:"
echo "------------------"
if [ -f "wrangler.toml" ]; then
    echo "✅ Found wrangler.toml"
    cat wrangler.toml
else
    echo "❌ wrangler.toml not found!"
fi

echo ""

# Public index.html
echo "🌐 PUBLIC/INDEX.HTML:"
echo "--------------------"
if [ -f "public/index.html" ]; then
    echo "✅ Found public/index.html"
    cat public/index.html
else
    echo "❌ public/index.html not found!"
fi

echo ""

# React main entry point
echo "⚛️  SRC/MAIN.JSX:"
echo "----------------"
if [ -f "src/main.jsx" ]; then
    echo "✅ Found src/main.jsx"
    cat src/main.jsx
else
    echo "❌ src/main.jsx not found!"
fi

echo ""

# React App component
echo "⚛️  SRC/APP.JSX:"
echo "---------------"
if [ -f "src/App.jsx" ]; then
    echo "✅ Found src/App.jsx (first 30 lines):"
    head -30 src/App.jsx
else
    echo "❌ src/App.jsx not found!"
fi

echo ""

# CSS file
echo "🎨 SRC/INDEX.CSS:"
echo "-----------------"
if [ -f "src/index.css" ]; then
    echo "✅ Found src/index.css (first 20 lines):"
    head -20 src/index.css
else
    echo "❌ src/index.css not found!"
fi

echo ""

# Worker file
echo "☁️  WORKER/INDEX.JS:"
echo "-------------------"
if [ -f "worker/index.js" ]; then
    echo "✅ Found worker/index.js (first 30 lines):"
    head -30 worker/index.js
else
    echo "❌ worker/index.js not found!"
fi

echo ""

# 7. DEPENDENCIES CHECK
echo "📦 DEPENDENCY CHECK:"
echo "-------------------"
echo "Node.js version:"
node --version 2>/dev/null || echo "❌ Node.js not found"

echo "NPM version:"
npm --version 2>/dev/null || echo "❌ NPM not found"

echo ""
echo "React dependencies in package.json:"
if [ -f "package.json" ]; then
    grep -E '"react":|"@vitejs/plugin-react":|"vite":' package.json || echo "❌ React dependencies not found"
else
    echo "❌ package.json not found"
fi

echo ""

# 8. NODE_MODULES CHECK
echo "📦 NODE_MODULES CHECK:"
echo "---------------------"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "React installed: $([ -d "node_modules/react" ] && echo "✅ Yes" || echo "❌ No")"
    echo "Vite installed: $([ -d "node_modules/vite" ] && echo "✅ Yes" || echo "❌ No")"
    echo "Wrangler installed: $([ -d "node_modules/wrangler" ] && echo "✅ Yes" || echo "❌ No")"
else
    echo "❌ node_modules not found! Run 'npm install'"
fi

echo ""

# 9. DIST DIRECTORY
echo "🏗️  BUILD OUTPUT (DIST):"
echo "------------------------"
if [ -d "dist" ]; then
    echo "✅ dist/ exists:"
    find dist -type f | head -10
else
    echo "❌ dist/ not found (run 'npm run build' to create)"
fi

echo ""

# 10. GIT STATUS
echo "📝 GIT STATUS:"
echo "-------------"
if [ -d ".git" ]; then
    echo "✅ Git repository detected"
    echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "Uncommitted files:"
    git status --porcelain | head -10 || echo "No changes"
else
    echo "❌ Not a git repository"
fi

echo ""

# 11. PORT CHECK
echo "🌐 PORT CHECK:"
echo "-------------"
echo "Checking if development ports are in use:"
echo "Port 5173 (Vite default): $(lsof -i :5173 >/dev/null 2>&1 && echo "🔴 In use" || echo "🟢 Available")"
echo "Port 5176 (Your Vite): $(lsof -i :5176 >/dev/null 2>&1 && echo "🔴 In use" || echo "🟢 Available")"
echo "Port 8787 (Wrangler): $(lsof -i :8787 >/dev/null 2>&1 && echo "🔴 In use" || echo "🟢 Available")"

echo ""
echo "🎯 INSPECTION COMPLETE!"
echo "======================"
echo ""
echo "💡 SUMMARY:"
echo "- Use this output to identify missing files"
echo "- Check for any ❌ errors above"
echo "- Verify React dependencies are installed"
echo "- Ensure all key files exist and have content"
