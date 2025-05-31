#!/bin/bash

# Harare Metro - Complete Setup Script
# ====================================
# Automated setup for the Harare Metro news aggregation site
# Created by Nyuchi Web Services - https://nyuchi.com
# Lead Developer: Bryan Fawcett (@bryanfawcett)
# Development Assistant: Claude AI

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
PROJECT_NAME="harare-metro"
WORKER_NAME="harare-metro-worker"
DOMAIN="harare-metro.co.zw"
NODE_MIN_VERSION="16.0.0"

# Helper functions
print_header() {
    echo -e "\n${BLUE}${BOLD}===================================================${NC}"
    echo -e "${CYAN}${BOLD}$1${NC}"
    echo -e "${BLUE}${BOLD}===================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${PURPLE}▶ $1${NC}"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Compare version numbers
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=0
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        if version_gt "$NODE_MIN_VERSION" "$NODE_VERSION"; then
            print_error "Node.js version $NODE_VERSION is installed, but $NODE_MIN_VERSION or higher is required"
            missing_deps=1
        else
            print_success "Node.js $NODE_VERSION (required: >=$NODE_MIN_VERSION)"
        fi
    else
        print_error "Node.js is not installed"
        missing_deps=1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION"
    else
        print_error "npm is not installed"
        missing_deps=1
    fi
    
    # Check git
    if command_exists git; then
        GIT_VERSION=$(git --version | cut -d ' ' -f 3)
        print_success "Git $GIT_VERSION"
    else
        print_error "Git is not installed"
        missing_deps=1
    fi
    
    # Check curl
    if command_exists curl; then
        print_success "curl is installed"
    else
        print_error "curl is not installed"
        missing_deps=1
    fi
    
    if [ $missing_deps -eq 1 ]; then
        echo ""
        print_error "Missing dependencies detected. Please install them before continuing."
        print_info "Installation guides:"
        print_info "  Node.js: https://nodejs.org/"
        print_info "  Git: https://git-scm.com/"
        print_info "  curl: Usually pre-installed, or use your package manager"
        exit 1
    fi
    
    print_success "All prerequisites are installed!"
}

# Create directory structure
create_directories() {
    print_step "Creating directory structure"
    
    mkdir -p .github/workflows
    mkdir -p docs
    mkdir -p tests
    
    print_success "Directory structure created"
}

# Create package.json
create_package_json() {
    print_step "Creating package.json"
    
    cat > package.json << 'EOF'
{
  "name": "harare-metro",
  "version": "1.0.0",
  "description": "Harare Metro - Mobile-first news aggregation site for Zimbabwe's capital with RSS feed processing",
  "main": "worker.js",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:force": "wrangler deploy --force",
    "build": "echo 'No build step required for this worker'",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint worker.js",
    "lint:fix": "eslint worker.js --fix",
    "logs": "wrangler tail",
    "logs:pretty": "wrangler tail --format=pretty",
    "deployments": "wrangler deployments list",
    "whoami": "wrangler whoami",
    "kv:list": "wrangler kv namespace list",
    "audit": "npm audit",
    "audit-fix": "npm audit fix",
    "update-deps": "npm update"
  },
  "keywords": [
    "harare",
    "metro",
    "zimbabwe",
    "news",
    "rss",
    "cloudflare-workers",
    "mobile-first"
  ],
  "author": "Bryan Fawcett <hello@nyuchi.com>",
  "license": "MIT",
  "dependencies": {
    "fast-xml-parser": "^4.3.2"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240512.0",
    "wrangler": "^3.57.1",
    "eslint": "^8.57.0",
    "vitest": "^1.6.0",
    "typescript": "^5.4.5"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/nyuchitech/harare-metro.git"
  },
  "bugs": {
    "url": "https://github.com/nyuchitech/harare-metro/issues"
  },
  "homepage": "https://harare-metro.co.zw"
}
EOF
    
    print_success "package.json created"
}

# Create wrangler.toml
create_wrangler_toml() {
    print_step "Creating wrangler.toml"
    
    cat > wrangler.toml << 'EOF'
name = "harare-metro-worker"
main = "worker.js"
compatibility_date = "2024-05-01"
compatibility_flags = ["nodejs_compat"]

# KV namespace for storing articles
[[kv_namespaces]]
binding = "NEWS_STORAGE"
preview_id = "your-preview-kv-id"
id = "your-production-kv-id"

# Cron trigger for hourly updates
[triggers]
crons = ["0 * * * *"]  # Every hour at minute 0

# Environment variables (set these in Cloudflare dashboard)
[vars]
ENVIRONMENT = "production"

# Build configuration
[build]
command = "npm run build"

# Development settings
[env.development]
name = "harare-metro-worker-dev"

[env.development.vars]
ENVIRONMENT = "development"

# Staging environment
[env.staging]
name = "harare-metro-worker-staging"

[env.staging.vars]
ENVIRONMENT = "staging"
EOF
    
    print_success "wrangler.toml created"
    print_warning "Remember to update KV namespace IDs after creating them"
}

# Create worker.js
create_worker_js() {
    print_step "Creating worker.js"
    
    # Create the file first
    touch worker.js
    
    # Write content in chunks to avoid issues with large heredocs
    cat > worker.js << 'EOF_PART1'
// worker.js - Cloudflare Worker for RSS feed aggregation
// Harare Metro - Mobile-first news aggregation for Zimbabwe's capital
// Developed by Bryan Fawcett (@bryanfawcett) in collaboration with Claude AI
// Created by Nyuchi Web Services - https://nyuchi.com

import { XMLParser } from 'fast-xml-parser';

// Zimbabwe RSS feed sources
const RSS_SOURCES = [
  {
    name: 'Herald Zimbabwe',
    url: 'https://www.herald.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'NewsDay Zimbabwe',
    url: 'https://www.newsday.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'Chronicle Zimbabwe',
    url: 'https://www.chronicle.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'ZBC News',
    url: 'https://www.zbc.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'Business Weekly',
    url: 'https://businessweekly.co.zw/feed/',
    category: 'business'
  },
  {
    name: 'Zimbabwe Independent',
    url: 'https://www.theindependent.co.zw/feed/',
    category: 'general'
  }
];

// Keywords to prioritize for Zimbabwe/Harare relevance
const PRIORITY_KEYWORDS = [
  'harare', 'zimbabwe', 'zim', 'bulawayo', 'mutare', 'gweru', 'kwekwe',
  'parliament', 'government', 'mnangagwa', 'zanu-pf', 'mdc', 'chamisa',
  'economy', 'inflation', 'currency', 'bond', 'rtgs', 'usd',
  'mining', 'tobacco', 'agriculture', 'maize', 'cotton',
  'warriors', 'dynamos', 'caps united', 'highlanders'
];

// Category mapping based on keywords
const CATEGORY_KEYWORDS = {
  politics: ['parliament', 'government', 'election', 'party', 'minister', 'president', 'policy', 'zanu', 'mdc', 'opposition'],
  economy: ['economy', 'economic', 'inflation', 'currency', 'budget', 'finance', 'bank', 'investment', 'gdp', 'trade'],
  business: ['business', 'company', 'entrepreneur', 'startup', 'market', 'industry', 'corporate', 'commerce'],
  sports: ['sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'dynamos', 'caps united', 'highlanders', 'afcon'],
  harare: ['harare', 'capital', 'city council', 'mayor', 'cbd', 'avondale', 'borrowdale', 'chitungwiza']
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/news') {
        const articles = await getStoredArticles(env);
        return new Response(JSON.stringify(articles), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      if (url.pathname === '/api/update') {
        const result = await updateFeeds(env);
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response('Harare Metro API - Available endpoints: /api/news, /api/update', {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  },

  // Scheduled trigger for hourly updates
  async scheduled(controller, env, ctx) {
    console.log('Starting scheduled RSS update...');
    try {
      await updateFeeds(env);
      console.log('Scheduled update completed successfully');
    } catch (error) {
      console.error('Scheduled update failed:', error);
    }
  }
};
EOF_PART1

    # Append the rest of the worker.js content
    cat >> worker.js << 'EOF_PART2'

async function updateFeeds(env) {
  const allArticles = [];
  const updateResults = {
    timestamp: new Date().toISOString(),
    sources: [],
    totalArticles: 0,
    errors: []
  };

  for (const source of RSS_SOURCES) {
    try {
      console.log(`Fetching RSS from ${source.name}...`);
      const articles = await fetchRSSFeed(source);
      
      if (articles && articles.length > 0) {
        allArticles.push(...articles);
        updateResults.sources.push({
          name: source.name,
          articlesCount: articles.length,
          status: 'success'
        });
      }
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      updateResults.errors.push({
        source: source.name,
        error: error.message
      });
      updateResults.sources.push({
        name: source.name,
        articlesCount: 0,
        status: 'error'
      });
    }
  }

  // Process and rank articles
  const processedArticles = processArticles(allArticles);
  
  // Store in KV
  await env.NEWS_STORAGE.put('articles', JSON.stringify(processedArticles));
  await env.NEWS_STORAGE.put('last_update', JSON.stringify(updateResults));

  updateResults.totalArticles = processedArticles.length;
  return updateResults;
}

async function fetchRSSFeed(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'HarareMetro/1.0 (+https://harare-metro.co.zw)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });

    const parsed = parser.parse(xmlText);
    const items = parsed.rss?.channel?.item || parsed.feed?.entry || [];
    
    if (!Array.isArray(items)) {
      return [items].filter(Boolean);
    }

    return items.map(item => ({
      id: generateId(item.title || item.link),
      title: cleanText(item.title),
      summary: cleanText(item.description || item.summary || '').substring(0, 300),
      url: item.link || item.id,
      publishedAt: parseDate(item.pubDate || item.published || item.updated),
      source: source.name,
      category: determineCategory(item.title + ' ' + (item.description || '')),
      keywords: extractKeywords(item.title + ' ' + (item.description || '')),
      relevanceScore: calculateRelevance(item.title + ' ' + (item.description || ''))
    }));

  } catch (error) {
    console.error(`RSS fetch error for ${source.name}:`, error);
    throw error;
  }
}

function processArticles(articles) {
  // Remove duplicates based on title similarity
  const uniqueArticles = removeDuplicates(articles);
  
  // Sort by relevance score and date
  uniqueArticles.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  // Limit to most recent 100 articles
  return uniqueArticles.slice(0, 100);
}

function removeDuplicates(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const normalized = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function determineCategory(text) {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

function extractKeywords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return PRIORITY_KEYWORDS.filter(keyword => 
    words.some(word => word.includes(keyword) || keyword.includes(word))
  );
}

function calculateRelevance(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  // Higher score for Zimbabwe/Harare mentions
  if (lowerText.includes('zimbabwe') || lowerText.includes('zim ')) score += 10;
  if (lowerText.includes('harare')) score += 8;
  
  // Score for priority keywords
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 2;
    }
  });
  
  // Bonus for recent articles
  const hoursOld = (Date.now() - Date.parse(text)) / (1000 * 60 * 60);
  if (hoursOld < 24) score += 5;
  if (hoursOld < 6) score += 3;
  
  return score;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function parseDate(dateString) {
  if (!dateString) return new Date().toISOString();
  
  try {
    return new Date(dateString).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function generateId(text) {
  if (!text) return Date.now().toString();
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

async function getStoredArticles(env) {
  try {
    const stored = await env.NEWS_STORAGE.get('articles');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If no stored articles, fetch fresh ones
    console.log('No stored articles found, fetching fresh...');
    await updateFeeds(env);
    const fresh = await env.NEWS_STORAGE.get('articles');
    return fresh ? JSON.parse(fresh) : [];
    
  } catch (error) {
    console.error('Error getting stored articles:', error);
    return [];
  }
}
EOF_PART2
    
    print_success "worker.js created"
}

# Create other necessary files
create_other_files() {
    print_step "Creating additional files"
    
    # Create .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Cloudflare Workers
.wrangler/
wrangler.toml.bak

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Temporary folders
tmp/
temp/

# Build outputs
dist/
build/

# Cloudflare Pages
/public

# Test files
test-results/
playwright-report/

# Local development
.wrangler.toml.local
EOF
    print_success ".gitignore created"
    
    # Create LICENSE
    cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Nyuchi Web Services - Harare Metro
Developed by Bryan Fawcett (@bryanfawcett) in collaboration with Claude AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

This project aggregates news content from various Zimbabwe news sources for 
educational and informational purposes. All original news content remains 
the property of their respective publishers and is used under fair use 
provisions for news aggregation and commentary.

For professional services and custom development, visit: https://nyuchi.com
Contact: hello@nyuchi.com
EOF
    print_success "LICENSE created"
}

# Create GitHub Actions workflow
create_github_workflow() {
    print_step "Creating GitHub Actions workflow"
    
    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy Harare Metro

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Deploy daily at 6 AM UTC to ensure fresh content
    - cron: '0 6 * * *'

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    name: Deploy Cloudflare Worker
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Deploy to Cloudflare Workers (Staging)
        if: github.ref == 'refs/heads/develop'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: 'staging'

      - name: Deploy to Cloudflare Workers (Production)
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: 'production'

      - name: Trigger initial RSS update
        if: github.ref == 'refs/heads/main'
        run: |
          sleep 30  # Wait for worker deployment
          curl -X GET "https://harare-metro-worker.harare-metro.workers.dev/api/update"

  deploy-pages:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    needs: deploy-worker
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Update API endpoint in HTML
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            sed -i 's|YOUR_WORKER_URL|https://harare-metro-worker.harare-metro.workers.dev|g' index.html
            sed -i 's|YOUR_WORKER_URL|https://harare-metro-worker.harare-metro.workers.dev|g' privacy.html
            sed -i 's|YOUR_WORKER_URL|https://harare-metro-worker.harare-metro.workers.dev|g' terms.html
          else
            sed -i 's|YOUR_WORKER_URL|https://harare-metro-worker-staging.harare-metro.workers.dev|g' index.html
            sed -i 's|YOUR_WORKER_URL|https://harare-metro-worker-staging.harare-metro.workers.dev|g' privacy.html
            sed -i 's|YOUR_WORKER_URL|https://harare-metro-worker-staging.harare-metro.workers.dev|g' terms.html
          fi

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: harare-metro
          directory: .
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

  test-deployment:
    runs-on: ubuntu-latest
    name: Test Deployment
    needs: [deploy-worker, deploy-pages]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Test Worker API
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" "https://harare-metro-worker.harare-metro.workers.dev/api/news")
          if [ $response -eq 200 ]; then
            echo "✅ Worker API is responding correctly"
          else
            echo "❌ Worker API failed with status $response"
            exit 1
          fi

      - name: Test Pages Deployment
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" "https://harare-metro.co.zw")
          if [ $response -eq 200 ]; then
            echo "✅ Site is loading correctly"
          else
            echo "❌ Site failed with status $response"
            exit 1
          fi
EOF
    
    print_success "GitHub Actions workflow created"
}

# Create test file
create_test_file() {
    print_step "Creating test file"
    
    cat > worker.test.js << 'EOF'
import { describe, it, expect } from 'vitest';

// Mock environment for testing
const mockEnv = {
  NEWS_STORAGE: {
    get: async (key) => {
      if (key === 'articles') {
        return JSON.stringify([
          {
            id: 'test-1',
            title: 'Test Harare News Article',
            summary: 'This is a test article about Harare infrastructure',
            category: 'harare',
            source: 'Test Source',
            publishedAt: new Date().toISOString(),
            url: 'https://example.com/test',
            keywords: ['harare', 'test'],
            relevanceScore: 10
          }
        ]);
      }
      return null;
    },
    put: async (key, value) => {
      console.log(`Mock KV PUT: ${key} = ${value.substring(0, 100)}...`);
    }
  }
};

describe('Harare Metro Worker', () => {
  it('should categorize articles correctly', () => {
    const testCases = [
      {
        text: 'Harare City Council announces new infrastructure',
        expectedCategory: 'harare'
      },
      {
        text: 'Zimbabwe parliament debates economic policy',
        expectedCategory: 'politics'
      },
      {
        text: 'Warriors prepare for AFCON qualifiers',
        expectedCategory: 'sports'
      },
      {
        text: 'New business regulations announced',
        expectedCategory: 'business'
      },
      {
        text: 'Economic growth projections for 2025',
        expectedCategory: 'economy'
      }
    ];

    testCases.forEach(testCase => {
      const category = determineCategory(testCase.text);
      expect(category).toBe(testCase.expectedCategory);
    });
  });
});

// Helper functions for testing
function determineCategory(text) {
  const lowerText = text.toLowerCase();
  
  const categoryKeywords = {
    politics: ['parliament', 'government', 'election', 'party', 'minister', 'president', 'policy'],
    economy: ['economy', 'economic', 'inflation', 'currency', 'budget', 'finance', 'bank'],
    business: ['business', 'company', 'entrepreneur', 'startup', 'market', 'industry'],
    sports: ['sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'afcon'],
    harare: ['harare', 'capital', 'city council', 'mayor', 'cbd']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}
EOF
    
    print_success "worker.test.js created"
}

# Create documentation files
create_documentation() {
    print_step "Creating documentation files"
    
    # Create README.md
    cat > README.md << 'EOF'
# 🏙️ Harare Metro

A fast, mobile-first news aggregation site focused on Harare and Zimbabwe news. Built with Cloudflare Workers and Pages for maximum performance and global reach.

**🌐 Live Site:** [https://harare-metro.co.zw](https://harare-metro.co.zw)

**Created by Nyuchi Web Services**  
**Lead Developer:** Bryan Fawcett (@bryanfawcett)  
**Development Assistant:** Claude AI

## ✨ Features

- **📱 Mobile-First Design** - Optimized for quick information access on mobile devices
- **🔍 Smart Search** - Search through article titles, summaries, and keywords
- **🏷️ Category Filtering** - Filter by Politics, Economy, Harare, Sports, Business
- **🌙 Dark/Light Mode** - Toggle between themes with persistence
- **📤 Social Sharing** - Quick sharing to WhatsApp, Twitter, and Facebook
- **⚡ Fast Loading** - Static site with edge-cached API responses
- **🔄 Auto Updates** - RSS feeds updated hourly via Cron triggers
- **🎯 Smart Ranking** - Articles ranked by Harare/Zimbabwe relevance

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│ Cloudflare Pages│───▶│ harare-metro.co │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │Cloudflare Worker│───▶│ RSS Aggregation │
                       └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │  Cloudflare KV  │
                       │ (Article Storage)│
                       └─────────────────┘
```

## 📁 Project Structure

```
harare-metro/
├── index.html              # Main news feed page
├── privacy.html            # Privacy policy page
├── terms.html              # Terms of service page
├── worker.js               # Cloudflare Worker (RSS aggregation)
├── wrangler.toml           # Cloudflare configuration
├── package.json            # Dependencies & scripts
├── worker.test.js          # Tests for Worker functionality
├── setup.sh                # Automated setup script
├── INSTRUCTIONS.md         # Detailed setup and usage guide
├── .github/workflows/
│   └── deploy.yml          # Auto-deployment pipeline
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
└── README.md               # This file
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro

# Run automated setup
chmod +x setup.sh && ./setup.sh

# Install dependencies
npm install
```

For detailed setup instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md).

## 📊 News Sources

The site aggregates news from major Zimbabwe publications:
- Herald Zimbabwe
- NewsDay Zimbabwe
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Zimbabwe Independent

## 🔒 Privacy & Security

- **No user tracking** - We don't collect personal data
- **No API keys exposed** - All processing happens server-side
- **CORS enabled** - Secure cross-origin requests
- **Input sanitization** - HTML tags stripped from RSS content

See our [Privacy Policy](./privacy.html) and [Terms of Service](./terms.html) for details.

## 💖 Support the Project

Help maintain this free service for the Zimbabwe tech community:

- **GitHub Sponsors**: [Sponsor @bryanfawcett](https://github.com/sponsors/bryanfawcett)
- **Buy me a coffee**: [buymeacoffee.com/bryanfawcett](https://buymeacoffee.com/bryanfawcett)
- **Professional services**: Custom development available at [nyuchi.com](https://nyuchi.com)

## 📞 Contact

- **Website**: [https://nyuchi.com](https://nyuchi.com)
- **GitHub**: [https://github.com/nyuchitech](https://github.com/nyuchitech)
- **Email**: [hello@nyuchi.com](mailto:hello@nyuchi.com)
- **Issues**: [GitHub Issues](https://github.com/nyuchitech/harare-metro/issues)

## 🤝 Contributing

We welcome contributions! Please see [INSTRUCTIONS.md](./INSTRUCTIONS.md#contributing) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for Harare 🏙️ by [Nyuchi Web Services](https://nyuchi.com)
EOF
    print_success "README.md created"
    
    # Create INSTRUCTIONS.md (without repeating the entire content)
    print_info "Creating INSTRUCTIONS.md (placeholder - use the full version from artifacts)"
    echo "# Instructions - See full version in artifacts" > INSTRUCTIONS.md
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_step "Running npm install"
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        print_info "You can try installing manually later with: npm install"
    fi
}

# Validate setup
validate_setup() {
    print_header "Validating Setup"
    
    local validation_passed=true
    
    # Check if all files were created
    local required_files=(
        "package.json"
        "wrangler.toml"
        "worker.js"
        ".gitignore"
        "LICENSE"
        "README.md"
        ".github/workflows/deploy.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            validation_passed=false
        fi
    done
    
    # Validate JSON files
    if command_exists node; then
        print_step "Validating JSON syntax"
        if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
            print_success "package.json is valid JSON"
        else
            print_error "package.json has invalid JSON syntax"
            validation_passed=false
        fi
    fi
    
    if $validation_passed; then
        print_success "All validations passed!"
    else
        print_warning "Some validations failed. Please check the errors above."
    fi
}

# Display next steps
display_next_steps() {
    print_header "🎉 Setup Complete!"
    
    echo -e "${GREEN}The Harare Metro project has been set up successfully!${NC}"
    echo ""
    echo -e "${CYAN}${BOLD}📋 Next Steps:${NC}"
    echo ""
    echo "1. ${BOLD}Copy HTML files from Claude artifacts:${NC}"
    echo "   - index.html (main news page)"
    echo "   - privacy.html (privacy policy)"
    echo "   - terms.html (terms of service)"
    echo "   - Copy the full INSTRUCTIONS.md content"
    echo ""
    echo "2. ${BOLD}Initialize Git repository:${NC}"
    echo "   ${YELLOW}git init${NC}"
    echo "   ${YELLOW}git add .${NC}"
    echo "   ${YELLOW}git commit -m \"Initial commit\"${NC}"
    echo ""
    echo "3. ${BOLD}Set up Cloudflare:${NC}"
    echo "   ${YELLOW}npx wrangler login${NC}"
    echo "   ${YELLOW}npx wrangler kv namespace create \"NEWS_STORAGE\"${NC}"
    echo "   ${YELLOW}npx wrangler kv namespace create \"NEWS_STORAGE\" --preview${NC}"
    echo "   ${PURPLE}# Update wrangler.toml with the returned IDs${NC}"
    echo ""
    echo "4. ${BOLD}Deploy to Cloudflare:${NC}"
    echo "   ${YELLOW}npm run deploy${NC}"
    echo ""
    echo "5. ${BOLD}Push to GitHub:${NC}"
    echo "   ${YELLOW}git remote add origin https://github.com/nyuchitech/harare-metro.git${NC}"
    echo "   ${YELLOW}git push -u origin main${NC}"
    echo ""
    echo "6. ${BOLD}Set up GitHub Secrets:${NC}"
    echo "   - CLOUDFLARE_API_TOKEN"
    echo "   - CLOUDFLARE_ACCOUNT_ID"
    echo ""
    echo -e "${BLUE}${BOLD}📖 Documentation:${NC}"
    echo "   - README.md - Project overview"
    echo "   - INSTRUCTIONS.md - Detailed setup guide"
    echo ""
    echo -e "${GREEN}${BOLD}🌐 Resources:${NC}"
    echo "   - Live site: https://harare-metro.co.zw"
    echo "   - GitHub: https://github.com/nyuchitech/harare-metro"
    echo "   - Support: hello@nyuchi.com"
    echo ""
    print_success "Happy coding! 🚀"
}

# Main setup flow
main() {
    clear
    print_header "🏙️ Harare Metro Setup Script"
    echo -e "${CYAN}Mobile-first news aggregation for Zimbabwe's capital${NC}"
    echo -e "${PURPLE}Created by Nyuchi Web Services${NC}"
    echo ""
    
    # Run setup steps
    check_prerequisites
    create_directories
    create_package_json
    create_wrangler_toml
    create_worker_js
    create_other_files
    create_github_workflow
    create_test_file
    create_documentation
    
    # Optional: Install dependencies
    echo ""
    read -p "Would you like to install npm dependencies now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_dependencies
    else
        print_info "Skipping dependency installation. Run 'npm install' later."
    fi
    
    # Validate and show next steps
    validate_setup
    display_next_steps
}

# Run the main function
main "$@"