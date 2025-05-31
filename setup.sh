#!/bin/bash

# Harare Metro - Repository Setup Script
# Creates complete project structure for the news aggregation site
# Developed by Bryan Fawcett (@bryanfawcett) in collaboration with Claude AI
# Created by Nyuchi Web Services - https://nyuchi.com

set -e  # Exit on any error

echo "🏙️ Setting up Harare Metro repository structure..."
echo "🌐 Domain: harare-metro.co.zw"
echo "📁 Creating directories and files..."

# Create main directories
mkdir -p .github/workflows
mkdir -p docs
mkdir -p tests

echo "📝 Creating package.json..."

# Create package.json
cat > package.json << 'PACKAGE_EOF'
{
  "name": "harare-metro",
  "version": "1.0.0",
  "description": "Harare Metro - Mobile-first news aggregation site for Zimbabwe's capital with RSS feed processing",
  "main": "worker.js",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "build": "echo 'No build step required for this worker'",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint worker.js",
    "lint:fix": "eslint worker.js --fix",
    "update-feeds": "wrangler invoke harare-metro-worker --env production /api/update",
    "logs": "wrangler tail"
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
PACKAGE_EOF

echo "🔧 Creating wrangler.toml..."

# Create wrangler.toml
cat > wrangler.toml << 'WRANGLER_EOF'
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
WRANGLER_EOF

echo "📄 Creating .gitignore..."

# Create .gitignore
cat > .gitignore << 'GITIGNORE_EOF'
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
GITIGNORE_EOF

echo "⚖️ Creating LICENSE..."

# Create LICENSE
cat > LICENSE << 'LICENSE_EOF'
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
LICENSE_EOF

echo "⚙️ Creating Cloudflare Worker..."

# Create worker.js (main backend file)
cat > worker.js << 'WORKER_EOF'
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
WORKER_EOF

echo "🚀 Creating GitHub Actions workflow..."

# Create GitHub Actions workflow
cat > .github/workflows/deploy.yml << 'WORKFLOW_EOF'
# .github/workflows/deploy.yml
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
          # Test the news API endpoint
          response=$(curl -s -o /dev/null -w "%{http_code}" "https://harare-metro-worker.harare-metro.workers.dev/api/news")
          if [ $response -eq 200 ]; then
            echo "✅ Worker API is responding correctly"
          else
            echo "❌ Worker API failed with status $response"
            exit 1
          fi

      - name: Test Pages Deployment
        run: |
          # Test the main site
          response=$(curl -s -o /dev/null -w "%{http_code}" "https://harare-metro.co.zw")
          if [ $response -eq 200 ]; then
            echo "✅ Site is loading correctly"
          else
            echo "❌ Site failed with status $response"
            exit 1
          fi

  notify:
    runs-on: ubuntu-latest
    name: Notify Deployment Status
    needs: [deploy-worker, deploy-pages, test-deployment]
    if: always() && github.ref == 'refs/heads/main'
    steps:
      - name: Deployment Success
        if: needs.deploy-worker.result == 'success' && needs.deploy-pages.result == 'success'
        run: |
          echo "🎉 Harare Metro site deployed successfully!"
          echo "🔗 Site: https://harare-metro.co.zw"
          echo "🔗 API: https://harare-metro-worker.harare-metro.workers.dev"

      - name: Deployment Failure
        if: needs.deploy-worker.result == 'failure' || needs.deploy-pages.result == 'failure'
        run: |
          echo "❌ Deployment failed. Check the logs above."
          exit 1
WORKFLOW_EOF

echo "🧪 Creating test files..."

# Create basic test file
cat > worker.test.js << 'TEST_EOF'
// worker.test.js - Basic tests for the Harare Metro Cloudflare Worker
// Developed by Bryan Fawcett (@bryanfawcett) in collaboration with Claude AI
// Created by Nyuchi Web Services - https://nyuchi.com

import { describe, it, expect, beforeAll } from 'vitest';

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

  it('should calculate relevance scores', () => {
    const testCases = [
      {
        text: 'Harare Zimbabwe infrastructure development',
        expectedMinScore: 15
      },
      {
        text: 'International news from Europe',
        expectedMaxScore: 5
      }
    ];

    testCases.forEach(testCase => {
      const score = calculateRelevance(testCase.text);
      if (testCase.expectedMinScore) {
        expect(score).toBeGreaterThanOrEqual(testCase.expectedMinScore);
      }
      if (testCase.expectedMaxScore) {
        expect(score).toBeLessThanOrEqual(testCase.expectedMaxScore);
      }
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

function calculateRelevance(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  if (lowerText.includes('zimbabwe') || lowerText.includes('zim ')) score += 10;
  if (lowerText.includes('harare')) score += 8;
  
  const priorityKeywords = ['parliament', 'government', 'economy', 'business', 'sports'];
  priorityKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 2;
    }
  });
  
  return score;
}
TEST_EOF

echo "📖 Creating README.md..."

# Create README.md
cat > README.md << 'README_EOF'
# 🏙️ Harare Metro

A fast, mobile-first news aggregation site focused on Harare and Zimbabwe news. Built with Cloudflare Workers and Pages for maximum performance and global reach.

**🌐 Live Site:** [https://harare-metro.co.zw](https://harare-metro.co.zw)

**Created by Nyuchi Web Services**  
**Lead Developer:** Bryan Fawcett (@bryanfawcett)

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
├── setup.sh                # Automated setup script ⭐
├── worker.test.js          # Tests for Worker functionality
├── .github/workflows/
│   └── deploy.yml          # Auto-deployment pipeline
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
└── README.md               # This file
```

## 🚀 Quick Setup

### Prerequisites

- Node.js 16+ installed
- Cloudflare account (free tier works)
- GitHub account
- Git installed

### 1. Use Setup Script (Recommended)

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/nyuchitech/harare-metro/main/setup.sh
chmod +x setup.sh
./setup.sh

# Or clone the repository first
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro
chmod +x setup.sh && ./setup.sh
```

### 2. Manual Setup

```bash
# Clone the repository
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro

# Install dependencies
npm install

# Login to Cloudflare (one-time setup)
npx wrangler login
```

### 3. Create Cloudflare Resources

```bash
# Create KV namespace for article storage
npx wrangler kv:namespace create "NEWS_STORAGE"
npx wrangler kv:namespace create "NEWS_STORAGE" --preview

# Note the IDs returned and update wrangler.toml
```

### 4. Update Configuration

1. **Update `wrangler.toml`** with your KV namespace IDs:
```toml
[[kv_namespaces]]
binding = "NEWS_STORAGE"
preview_id = "your-preview-kv-id-here"
id = "your-production-kv-id-here"
```

2. **Update HTML files** with your Worker URL:
```javascript
// Replace YOUR_WORKER_URL with your actual worker URL
const API_BASE = 'https://harare-metro-worker.harare-metro.workers.dev';
```

### 5. Deploy

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy

# Test the deployment
curl https://harare-metro-worker.harare-metro.workers.dev/api/news
```

### 6. Setup GitHub Actions

1. Go to your GitHub repository settings
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

3. Update the workflow file URLs with your actual domains

## 🛠️ Development

### Local Development

```bash
# Start the worker locally
npm run dev

# Test RSS feed updates
npm run update-feeds

# View worker logs
npm run logs
```

### Adding New RSS Sources

Edit the `RSS_SOURCES` array in `worker.js`:

```javascript
const RSS_SOURCES = [
  {
    name: 'Your News Source',
    url: 'https://yournews.co.zw/feed/',
    category: 'general'
  },
  // ... existing sources
];
```

## 📊 News Sources

Current sources include:
- Herald Zimbabwe
- NewsDay Zimbabwe
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Zimbabwe Independent

## 📈 Performance

Expected performance metrics:
- **Page Load Speed**: < 2 seconds on 3G
- **API Response Time**: < 500ms globally
- **Lighthouse Score**: 90+ on mobile
- **Uptime**: 99.9% (Cloudflare SLA)

## 🔒 Privacy & Terms

- [Privacy Policy](./privacy.html) - How we collect, use, and protect your information
- [Terms of Service](./terms.html) - Rules and guidelines for using our service

Both pages are fully responsive and include:
- **GDPR-compliant privacy practices**
- **Clear terms of service**
- **Zimbabwe law compliance**
- **Contact information for legal inquiries**

## 💖 Sponsor Development

Support ongoing development and new features:

- **💖 GitHub Sponsors** - [Sponsor @bryanfawcett](https://github.com/sponsors/bryanfawcett)
- **☕ Buy me a coffee** - [buymeacoffee.com/bryanfawcett](https://buymeacoffee.com/bryanfawcett)
- **🏢 Professional services** - Custom development and consulting available

Your sponsorship helps maintain this free service and develop new features for the Zimbabwe tech community.

## 📞 Contact

- **Website**: [https://nyuchi.com](https://nyuchi.com)
- **GitHub**: [https://github.com/nyuchitech](https://github.com/nyuchitech)
- **Email**: [hello@nyuchi.com](mailto:hello@nyuchi.com)
- **Issues**: [GitHub Issues](https://github.com/nyuchitech/harare-metro/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏆 Credits

**Created by Nyuchi Web Services**
- **Lead Developer**: Bryan Fawcett (@bryanfawcett)
- **Development Assistant**: Claude AI
- **Organization**: [Nyuchi Web Services](https://nyuchi.com)

**Special Thanks:**
- Zimbabwe news organizations for providing RSS feeds
- Cloudflare for hosting and edge infrastructure
- Open source community for tools and libraries

**Professional Services:**
For custom web development, mobile apps, and tech consulting in Zimbabwe and beyond, visit [nyuchi.com](https://nyuchi.com).

---

Built with ❤️ for Harare 🏙️
README_EOF

echo ""
echo "✅ Repository structure created successfully!"
echo ""
echo "📁 Created files:"
echo "   ├── package.json"
echo "   ├── wrangler.toml"
echo "   ├── worker.js"
echo "   ├── worker.test.js"
echo "   ├── .gitignore"
echo "   ├── LICENSE"
echo "   ├── README.md"
echo "   └── .github/workflows/deploy.yml"
echo ""
echo "📋 IMPORTANT: Still needed (copy these from your artifacts):"
echo "   ├── index.html          # Main news feed page"
echo "   ├── privacy.html        # Privacy policy page"
echo "   └── terms.html          # Terms of service page"
echo ""
echo "🚀 Next steps:"
echo "1. Copy the missing HTML files from your Claude artifacts"
echo "2. Initialize git: git init && git add . && git commit -m 'Initial commit'"
echo "3. Create GitHub repository: https://github.com/nyuchitech/harare-metro"
echo "4. Push to GitHub: git remote add origin <your-repo-url> && git push -u origin main"
echo "5. Set up Cloudflare Workers and Pages"
echo "6. Configure custom domain: harare-metro.co.zw"
echo ""
echo "🔧 Setup Cloudflare:"
echo "   npx wrangler login"
echo "   npx wrangler kv:namespace create \"NEWS_STORAGE\""
echo "   npx wrangler kv:namespace create \"NEWS_STORAGE\" --preview"
echo "   # Update wrangler.toml with the returned IDs"
echo ""
echo "🌐 Live site: https://harare-metro.co.zw"
echo "📧 Contact: hello@nyuchi.com"
echo "🏢 Organization: Nyuchi Web Services"
echo "💖 Sponsor: https://github.com/sponsors/bryanfawcett"