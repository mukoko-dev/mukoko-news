#!/bin/bash

# ============================================================================
# Harare Metro - Repository Structure Fixer
# ============================================================================
# This script fixes the broken Cloudflare Worker + React SPA structure
# Run from within your existing repository directory
# ============================================================================

set -e  # Exit on any error

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Icons
STEP="🔧"
SUCCESS="✅"
WARNING="⚠️ "
ERROR="❌"
INFO="💡"
ROCKET="🚀"

print_banner() {
    echo -e "${PURPLE}============================================================================${NC}"
    echo -e "${WHITE}                    HARARE METRO REPOSITORY FIXER${NC}"
    echo -e "${PURPLE}============================================================================${NC}"
    echo -e "${CYAN}Fixing broken Cloudflare Worker + React SPA structure...${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}${STEP} STEP: $1${NC}"
}

print_substep() {
    echo -e "  ${CYAN}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}${SUCCESS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING}$1${NC}"
}

print_error() {
    echo -e "${RED}${ERROR} $1${NC}"
}

print_info() {
    echo -e "${YELLOW}${INFO} $1${NC}"
}

# ============================================================================
# VALIDATION
# ============================================================================

validate_environment() {
    print_step "Validating environment"
    
    # Check if we're in a directory with package.json
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found!"
        print_error "Please run this script from your repository root directory."
        exit 1
    fi
    
    # Check if this is a git repository
    if [[ ! -d ".git" ]]; then
        print_warning "Not a Git repository. Consider running 'git init' first."
    fi
    
    # Check for required commands
    local missing_commands=()
    
    if ! command -v node &> /dev/null; then
        missing_commands+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_commands+=("npm")
    fi
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        print_error "Missing required commands: ${missing_commands[*]}"
        print_error "Please install Node.js and npm first."
        exit 1
    fi
    
    print_success "Environment validation passed"
}

# ============================================================================
# BACKUP SYSTEM
# ============================================================================

create_backup() {
    print_step "Creating backup of existing files"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backup_${timestamp}"
    
    mkdir -p "$backup_dir"
    
    # Files to backup
    local backup_files=(
        "package.json"
        "package-lock.json"
        "wrangler.toml"
        "vite.config.js"
        "tsconfig.json"
        "postcss.config.js"
        "tailwind.config.js"
        "worker/index.js"
        "src/"
        "public/"
        "react.jsx"
    )
    
    for file in "${backup_files[@]}"; do
        if [[ -e "$file" ]]; then
            print_substep "Backing up $file"
            cp -r "$file" "$backup_dir/" 2>/dev/null || true
        fi
    done
    
    print_success "Backup created in $backup_dir/"
    echo "$backup_dir" > .last_backup
}

# ============================================================================
# CLEANUP
# ============================================================================

cleanup_old_structure() {
    print_step "Cleaning up old/incorrect structure"
    
    # Remove incorrect files and directories
    local cleanup_items=(
        "react.jsx"
        "dist/client"
        "main.jsx"
    )
    
    for item in "${cleanup_items[@]}"; do
        if [[ -e "$item" ]]; then
            print_substep "Removing $item"
            rm -rf "$item" 2>/dev/null || true
        fi
    done
    
    print_success "Cleanup completed"
}

# ============================================================================
# DIRECTORY STRUCTURE
# ============================================================================

create_directory_structure() {
    print_step "Creating proper directory structure"
    
    local directories=(
        "src/components"
        "src/hooks"
        "src/utils"
        "public"
        "worker"
        "dist/assets"
        "scripts"
    )
    
    for dir in "${directories[@]}"; do
        print_substep "Creating $dir/"
        mkdir -p "$dir"
    done
    
    print_success "Directory structure created"
}

# ============================================================================
# CONFIGURATION FILES
# ============================================================================

create_package_json() {
    print_step "Creating package.json"
    
    cat > package.json << 'EOF'
{
  "name": "harare-metro",
  "version": "1.0.0",
  "type": "module",
  "description": "Zimbabwe News Aggregator - Cloudflare Worker + React SPA",
  "scripts": {
    "dev": "vite",
    "dev:worker": "wrangler dev",
    "dev:both": "./scripts/dev-start.sh",
    "build": "vite build",
    "build:check": "vite build --mode development",
    "preview": "vite preview",
    "deploy": "npm run build && wrangler deploy",
    "deploy:staging": "npm run build && wrangler deploy --env staging",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.vite",
    "setup": "npm install && npm run build"
  },
  "dependencies": {
    "@cloudflare/kv-asset-handler": "^0.3.4",
    "@heroicons/react": "^2.2.0",
    "fast-xml-parser": "^4.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250531.0",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^4.5.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.5.4",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.1.4",
    "wrangler": "^4.18.0"
  },
  "keywords": ["zimbabwe", "news", "rss", "cloudflare", "worker", "react"],
  "author": "Your Name",
  "license": "MIT"
}
EOF
    
    print_success "package.json created"
}

create_wrangler_config() {
    print_step "Creating wrangler.toml"
    
    cat > wrangler.toml << 'EOF'
name = "harare-metro"
compatibility_date = "2024-05-01"
main = "./worker/index.js"

[assets]
directory = "./dist/assets"
binding = "ASSETS"

[[kv_namespaces]]
binding = "NEWS_STORAGE"
id = "your-production-kv-id"  # Replace with your KV namespace ID
preview_id = "your-preview-kv-id"  # Replace with your preview KV namespace ID

[triggers]
crons = ["0 */6 * * *"]  # Update feeds every 6 hours

[env.staging]
name = "harare-metro-staging"

[[env.staging.kv_namespaces]]
binding = "NEWS_STORAGE"
id = "your-staging-kv-id"  # Replace with your staging KV namespace ID
preview_id = "your-staging-preview-kv-id"

# Increase memory limit for RSS processing
[placement]
mode = "smart"
EOF
    
    print_success "wrangler.toml created"
}

create_vite_config() {
    print_step "Creating vite.config.js"
    
    cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['@heroicons/react']
        },
      },
    },
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173
  }
})
EOF
    
    print_success "vite.config.js created"
}

create_typescript_config() {
    print_step "Creating TypeScript configuration"
    
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
    
    cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.js", "worker/**/*"]
}
EOF
    
    print_success "TypeScript configuration created"
}

create_tailwind_config() {
    print_step "Creating Tailwind configuration"
    
    cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOF
    
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    
    print_success "Tailwind configuration created"
}

# ============================================================================
# WORKER CODE
# ============================================================================

create_worker() {
    print_step "Creating Cloudflare Worker"
    
    cat > worker/index.js << 'EOF'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { XMLParser } from 'fast-xml-parser'

// RSS feed sources for Zimbabwe news
const RSS_SOURCES = [
  {
    name: 'Herald Zimbabwe',
    url: 'https://www.herald.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'NewsDay Zimbabwe', 
    url: 'https://www.newsday.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Chronicle Zimbabwe',
    url: 'https://www.chronicle.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'ZBC News',
    url: 'https://www.zbc.co.zw/feed/',
    category: 'news',
    enabled: true
  },
  {
    name: 'Business Weekly',
    url: 'https://businessweekly.co.zw/feed/',
    category: 'business',
    enabled: true
  },
  {
    name: 'Techzim',
    url: 'https://www.techzim.co.zw/feed/',
    category: 'technology',
    enabled: true
  },
  {
    name: 'The Standard',
    url: 'https://www.thestandard.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'ZimLive',
    url: 'https://www.zimlive.com/feed/',
    category: 'general',
    enabled: true
  }
]

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    try {
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env, ctx)
      }

      // Serve React SPA and static assets
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx)
        },
        {
          ASSET_NAMESPACE: env.ASSETS,
          // SPA routing - serve index.html for all non-asset routes
          mapRequestToAsset: (req) => {
            const url = new URL(req.url)
            const pathname = url.pathname
            
            // Serve actual files for assets
            if (pathname.includes('.') || pathname.startsWith('/assets/')) {
              return req
            }
            
            // Serve index.html for SPA routes
            if (!pathname.startsWith('/api/')) {
              return new Request(`${url.origin}/index.html`, req)
            }
            
            return req
          }
        }
      )
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  },

  // Scheduled task to update feeds every 6 hours
  async scheduled(event, env, ctx) {
    console.log('Running scheduled feed update...')
    ctx.waitUntil(updateFeeds(env))
  }
}

async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    switch (path) {
      case '/feeds':
        return await getAllFeeds(env, corsHeaders)
      
      case '/feeds/sources':
        return new Response(JSON.stringify(RSS_SOURCES), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      
      case '/feeds/cached':
        return await getCachedFeeds(env, corsHeaders)
      
      case '/health':
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          sources: RSS_SOURCES.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getAllFeeds(env, corsHeaders) {
  const allFeeds = []
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: 'text'
  })

  const enabledSources = RSS_SOURCES.filter(source => source.enabled)
  
  // Fetch feeds with Promise.allSettled for better error handling
  const feedPromises = enabledSources.map(async (source) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
      
      const response = await fetch(source.url, {
        headers: { 
          'User-Agent': 'Harare Metro News Aggregator/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const xmlData = await response.text()
      const jsonData = parser.parse(xmlData)
      
      // Handle different RSS structures
      const channel = jsonData?.rss?.channel || jsonData?.feed
      const items = channel?.item || channel?.entry || []
      
      const processedItems = (Array.isArray(items) ? items : [items])
        .slice(0, 10)
        .map(item => ({
          title: item.title?.text || item.title || 'No title',
          description: cleanHtml(item.description?.text || item.description || item.summary?.text || item.summary || ''),
          link: item.link?.text || item.link || item.id || '#',
          pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
          source: source.name,
          category: source.category,
          guid: item.guid?.text || item.guid || item.id || `${source.name}-${Date.now()}`
        }))
        .filter(item => item.title !== 'No title')

      return processedItems
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error.message)
      return []
    }
  })

  const results = await Promise.allSettled(feedPromises)
  
  // Combine all successful results
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allFeeds.push(...result.value)
    }
  })

  // Sort by date, most recent first
  allFeeds.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

  // Limit to 100 items total
  const limitedFeeds = allFeeds.slice(0, 100)

  return new Response(JSON.stringify(limitedFeeds), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900' // 15 minutes
    }
  })
}

async function getCachedFeeds(env, corsHeaders) {
  try {
    const cachedFeeds = await env.NEWS_STORAGE.get('cached_feeds')
    const lastUpdated = await env.NEWS_STORAGE.get('last_updated')
    
    if (cachedFeeds) {
      return new Response(JSON.stringify({
        feeds: JSON.parse(cachedFeeds),
        lastUpdated: lastUpdated || null,
        cached: true
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 minutes
        }
      })
    }
    
    // If no cache, fetch fresh data
    return await getAllFeeds(env, corsHeaders)
  } catch (error) {
    console.error('Cache error:', error)
    return await getAllFeeds(env, corsHeaders)
  }
}

async function updateFeeds(env) {
  try {
    console.log('Updating feed cache...')
    const response = await getAllFeeds(env, {})
    const feedsData = await response.text()
    
    await env.NEWS_STORAGE.put('cached_feeds', feedsData)
    await env.NEWS_STORAGE.put('last_updated', new Date().toISOString())
    
    console.log('Feed cache updated successfully')
  } catch (error) {
    console.error('Failed to update feed cache:', error)
  }
}

function cleanHtml(html) {
  if (typeof html !== 'string') return ''
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim()
    .substring(0, 300) // Limit description length
}
EOF
    
    print_success "Cloudflare Worker created"
}

# ============================================================================
# REACT APPLICATION
# ============================================================================

create_react_app() {
    print_step "Creating React application"
    
    # Main entry point
    cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

    # Main App component
    cat > src/App.jsx << 'EOF'
import React, { useState, useEffect } from 'react'
import { NewspaperIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './components/LoadingSpinner'
import NewsCard from './components/NewsCard'
import CategoryFilter from './components/CategoryFilter'
import Header from './components/Header'
import { useFetchFeeds } from './hooks/useFetchFeeds'

function App() {
  const { feeds, loading, error, refetch } = useFetchFeeds()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredFeeds = selectedCategory === 'all' 
    ? feeds 
    : feeds.filter(feed => feed.category === selectedCategory)

  const categories = ['all', ...new Set(feeds.map(feed => feed.category))]

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load News
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={refetch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {filteredFeeds.length === 0 ? (
          <div className="text-center py-12">
            <NewspaperIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500">
              {selectedCategory === 'all' 
                ? 'No news articles are currently available.' 
                : `No articles found in the "${selectedCategory}" category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeeds.map((article, index) => (
              <NewsCard key={article.guid || index} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
EOF

    # CSS styles
    cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }
}
EOF

    print_success "React application created"
}

create_react_components() {
    print_step "Creating React components"
    
    # Header component
    cat > src/components/Header.jsx << 'EOF'
import React from 'react'
import { NewspaperIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Header({ onRefresh }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NewspaperIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">
                Harare Metro
              </h1>
              <p className="text-sm text-gray-500">Zimbabwe News Aggregator</p>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}
EOF

    # Loading spinner component
    cat > src/components/LoadingSpinner.jsx << 'EOF'
import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading latest news...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching articles from Zimbabwe news sources</p>
      </div>
    </div>
  )
}
EOF

    # News card component
    cat > src/components/NewsCard.jsx << 'EOF'
import React from 'react'
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline'

export default function NewsCard({ article }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Recent'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      news: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      technology: 'bg-purple-100 text-purple-800',
      sports: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || colors.general
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-blue-600">
          {article.source}
        </span>
        <div className="flex items-center text-xs text-gray-500">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {formatDate(article.pubDate)}
        </div>
      </div>
      
      <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
        {article.title}
      </h2>
      
      {article.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TagIcon className="h-3 w-3 mr-1 text-gray-400" />
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>
        
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group"
        >
          Read more
          <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  )
}
EOF

    # Category filter component
    cat > src/components/CategoryFilter.jsx << 'EOF'
import React from 'react'

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
EOF

    print_success "React components created"
}

create_react_hooks() {
    print_step "Creating React hooks"
    
    cat > src/hooks/useFetchFeeds.js << 'EOF'
import { useState, useEffect, useCallback } from 'react'

export function useFetchFeeds() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/feeds')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feeds: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }
      
      setFeeds(data)
    } catch (err) {
      console.error('Error fetching feeds:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchFeeds()
  }, [fetchFeeds])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  return { feeds, loading, error, refetch }
}
EOF

    print_success "React hooks created"
}

# ============================================================================
# HTML TEMPLATE
# ============================================================================

create_html_template() {
    print_step "Creating HTML template"
    
    cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Harare Metro - Your source for Zimbabwe news. Aggregating the latest news from Herald, NewsDay, Chronicle, ZBC, and more." />
    <meta name="keywords" content="Zimbabwe news, Harare, Herald, NewsDay, Chronicle, ZBC, African news" />
    <meta name="author" content="Harare Metro" />
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="Harare Metro - Zimbabwe News Aggregator" />
    <meta property="og:description" content="Stay updated with the latest news from Zimbabwe's top news sources." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://harare-metro.your-domain.com" />
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Harare Metro - Zimbabwe News" />
    <meta name="twitter:description" content="Latest news from Zimbabwe's top sources" />
    
    <title>Harare Metro - Zimbabwe News Aggregator</title>
    
    <!-- Preconnect to improve performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
    
    print_success "HTML template created"
}

# ============================================================================
# DEVELOPMENT SCRIPTS
# ============================================================================

create_development_scripts() {
    print_step "Creating development scripts"
    
    # Development starter script
    cat > scripts/dev-start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Harare Metro development servers..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "Port $port is already in use"
        return 1
    fi
    return 0
}

# Kill any existing processes on our ports
echo "Cleaning up existing processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "wrangler dev" 2>/dev/null || true

# Wait a moment for processes to die
sleep 2

# Check ports
if ! check_port 5173; then
    echo "❌ Port 5173 (Vite) is still in use. Please kill the process manually."
    exit 1
fi

if ! check_port 8787; then
    echo "❌ Port 8787 (Wrangler) is still in use. Please kill the process manually."
    exit 1
fi

echo "✅ Ports are available"

# Function to open URLs based on OS
open_urls() {
    sleep 5  # Wait for servers to start
    
    if command -v open >/dev/null 2>&1; then
        # macOS
        open http://localhost:5173
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open http://localhost:5173
    elif command -v start >/dev/null 2>&1; then
        # Windows
        start http://localhost:5173
    fi
}

# Start development servers
if command -v gnome-terminal >/dev/null 2>&1; then
    # Linux with GNOME Terminal
    gnome-terminal --tab --title="Vite Dev Server" -- bash -c "echo 'Starting Vite dev server...'; npm run dev; exec bash"
    gnome-terminal --tab --title="Wrangler Dev Server" -- bash -c "echo 'Starting Wrangler dev server...'; npm run dev:worker; exec bash"
    open_urls &
    
elif command -v osascript >/dev/null 2>&1; then
    # macOS Terminal
    osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && echo 'Starting Vite dev server...' && npm run dev\""
    osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && echo 'Starting Wrangler dev server...' && npm run dev:worker\""
    open_urls &
    
elif command -v cmd.exe >/dev/null 2>&1; then
    # Windows
    cmd.exe /c start "Vite Dev Server" cmd /k "echo Starting Vite dev server... && npm run dev"
    cmd.exe /c start "Wrangler Dev Server" cmd /k "echo Starting Wrangler dev server... && npm run dev:worker"
    open_urls &
    
else
    echo "🔧 Manual setup required:"
    echo ""
    echo "Please run these commands in separate terminals:"
    echo "📋 Terminal 1: npm run dev"
    echo "📋 Terminal 2: npm run dev:worker"
    echo ""
    echo "Then open: http://localhost:5173"
    echo ""
    echo "Press any key to continue..."
    read -n 1
fi

echo ""
echo "🌐 Development URLs:"
echo "   React App: http://localhost:5173"
echo "   Worker API: http://localhost:8787"
echo "   API Health: http://localhost:8787/api/health"
echo ""
echo "💡 Tips:"
echo "   - The React app will proxy /api requests to the Worker"
echo "   - Hot reload is enabled for both frontend and backend"
echo "   - Check the terminals for any error messages"
echo ""
EOF

    chmod +x scripts/dev-start.sh

    # Build script
    cat > scripts/build.sh << 'EOF'
#!/bin/bash

echo "🏗️  Building Harare Metro for production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build the React app
echo "⚛️  Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📦 Build output:"
echo "   Frontend: dist/assets/"
echo "   Worker: worker/index.js"
echo ""
echo "🚀 Ready to deploy with: npm run deploy"
EOF

    chmod +x scripts/build.sh

    # Deployment script
    cat > scripts/deploy.sh << 'EOF'
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
EOF

    chmod +x scripts/deploy.sh

    print_success "Development scripts created"
}

# ============================================================================
# ADDITIONAL FILES
# ============================================================================

create_additional_files() {
    print_step "Creating additional project files"
    
    # .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm
.yarn/
.pnp/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
*.lcov

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

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
.Trash/

# Cloudflare
.wrangler/
worker-configuration.d.ts

# Backup files
backup_*/
.last_backup

# Temporary files
*.tmp
*.temp
EOF

    # ESLint configuration
    cat > .eslintrc.cjs << 'EOF'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'worker/'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
  },
}
EOF

    # README.md
    cat > README.md << 'EOF'
# Harare Metro - Zimbabwe News Aggregator

A modern news aggregation platform built with React and Cloudflare Workers, specifically designed to aggregate news from major Zimbabwe news sources.

## 🌟 Features

- **Real-time News Aggregation**: Fetches latest articles from multiple Zimbabwe news sources
- **Category Filtering**: Filter news by category (General, Business, Technology, etc.)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Fast Loading**: Built on Cloudflare Workers for global edge deployment
- **RSS Feed Processing**: Intelligent RSS/XML parsing with error handling
- **Caching**: Automatic feed caching with scheduled updates every 6 hours

## 🏗️ Architecture

- **Frontend**: React SPA with Tailwind CSS
- **Backend**: Cloudflare Worker with KV storage
- **Build Tool**: Vite for fast development and optimized builds
- **Deployment**: Single Cloudflare Worker serving both frontend and API

## 📰 News Sources

- Herald Zimbabwe
- NewsDay Zimbabwe  
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Techzim
- The Standard
- ZimLive

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers enabled
- Wrangler CLI installed globally: `npm install -g wrangler`

### Installation

1. **Clone and setup the repository**:
   ```bash
   git clone <your-repo-url>
   cd harare-metro
   npm install
   ```

2. **Configure Cloudflare KV**:
   ```bash
   # Create KV namespaces
   wrangler kv:namespace create "NEWS_STORAGE"
   wrangler kv:namespace create "NEWS_STORAGE" --preview
   
   # Update wrangler.toml with the returned namespace IDs
   ```

3. **Start development**:
   ```bash
   # Option 1: Use helper script
   ./scripts/dev-start.sh
   
   # Option 2: Manual (two terminals)
   npm run dev          # Terminal 1: React dev server
   npm run dev:worker   # Terminal 2: Worker dev server
   ```

4. **Open your browser**:
   - React App: http://localhost:5173
   - Worker API: http://localhost:8787

### Deployment

1. **Login to Wrangler**:
   ```bash
   wrangler login
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:worker` - Start Wrangler dev server  
- `npm run dev:both` - Start both servers (uses helper script)
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx
│   ├── NewsCard.jsx
│   ├── CategoryFilter.jsx
│   └── LoadingSpinner.jsx
├── hooks/              # Custom React hooks
│   └── useFetchFeeds.js
├── App.jsx             # Main app component
├── main.jsx           # React entry point
└── index.css          # Global styles

worker/
└── index.js           # Cloudflare Worker code

scripts/
├── dev-start.sh       # Development helper
├── build.sh          # Build script
└── deploy.sh         # Deployment script
```

## 🔧 Configuration

### Environment Variables

Update `wrangler.toml` with your KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "NEWS_STORAGE"
id = "your-production-kv-id"
preview_id = "your-preview-kv-id"
```

### Adding News Sources

Edit the `RSS_SOURCES` array in `worker/index.js`:

```javascript
const RSS_SOURCES = [
  {
    name: 'Your News Source',
    url: 'https://example.com/feed/',
    category: 'general',
    enabled: true
  }
]
```

## 📡 API Endpoints

- `GET /api/feeds` - Get all latest news feeds
- `GET /api/feeds/sources` - Get list of RSS sources
- `GET /api/feeds/cached` - Get cached feeds with metadata
- `GET /api/health` - Health check endpoint

## 🔄 Scheduled Updates

Feeds are automatically updated every 6 hours using Cloudflare Cron Triggers. You can modify the schedule in `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Run `./scripts/dev-start.sh` which automatically handles port cleanup
2. **KV namespace errors**: Ensure you've created KV namespaces and updated `wrangler.toml`
3. **Build failures**: Check Node.js version (requires 18+)
4. **CORS issues**: API includes proper CORS headers for development

### Development Tips

- Use browser dev tools to monitor API calls
- Check Wrangler terminal for Worker logs
- RSS feeds may occasionally be unavailable - this is handled gracefully
- Use `npm run build:check` to test builds without deployment

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review Cloudflare Workers documentation
- Open an issue on GitHub

---

Built with ❤️ for Zimbabwe's news ecosystem
EOF

    print_success "Additional project files created"
}

# ============================================================================
# INSTALLATION AND FINAL SETUP
# ============================================================================

install_dependencies() {
    print_step "Installing dependencies"
    
    # Check if package-lock.json exists and remove it to avoid conflicts
    if [[ -f "package-lock.json" ]]; then
        print_substep "Removing existing package-lock.json"
        rm package-lock.json
    fi
    
    # Install dependencies
    print_substep "Running npm install..."
    if npm install --silent; then
        print_success "Dependencies installed successfully"
    else
        print_warning "Some dependencies may have issues. Try running 'npm install' manually."
    fi
}

final_checks() {
    print_step "Running final checks"
    
    # Check if build works
    print_substep "Testing build process..."
    if npm run build --silent >/dev/null 2>&1; then
        print_success "Build test passed"
    else
        print_warning "Build test failed. You may need to fix dependencies."
    fi
    
    # Verify directory structure
    local required_dirs=("src/components" "worker" "public" "scripts")
    local missing_dirs=()
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [[ ${#missing_dirs[@]} -eq 0 ]]; then
        print_success "Directory structure verified"
    else
        print_warning "Missing directories: ${missing_dirs[*]}"
    fi
    
    # Check required files
    local required_files=("src/App.jsx" "worker/index.js" "wrangler.toml" "vite.config.js")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        print_success "Required files verified"
    else
        print_warning "Missing files: ${missing_files[*]}"
    fi
}

print_final_instructions() {
    local backup_dir=""
    if [[ -f ".last_backup" ]]; then
        backup_dir=$(cat .last_backup)
    fi
    
    echo ""
    print_banner
    echo -e "${GREEN}${SUCCESS} Repository structure has been successfully fixed!${NC}"
    echo ""
    
    if [[ -n "$backup_dir" ]]; then
        echo -e "${YELLOW}📁 Backup Location:${NC} $backup_dir/"
    fi
    
    echo ""
    echo -e "${CYAN}🔧 NEXT STEPS:${NC}"
    echo ""
    echo -e "${WHITE}1. Update KV Namespace IDs:${NC}"
    echo "   Edit wrangler.toml and replace 'your-production-kv-id' and 'your-preview-kv-id'"
    echo "   with your actual Cloudflare KV namespace IDs."
    echo ""
    echo -e "${WHITE}2. Start Development:${NC}"
    echo -e "   ${GREEN}./scripts/dev-start.sh${NC}     # Automated setup (recommended)"
    echo "   OR manually in separate terminals:"
    echo -e "   ${GREEN}npm run dev${NC}               # Terminal 1: React dev server"
    echo -e "   ${GREEN}npm run dev:worker${NC}        # Terminal 2: Worker dev server"
    echo ""
    echo -e "${WHITE}3. Deploy When Ready:${NC}"
    echo -e "   ${GREEN}wrangler login${NC}            # Login to Cloudflare (first time)"
    echo -e "   ${GREEN}npm run deploy${NC}            # Build and deploy"
    echo ""
    echo -e "${CYAN}🌐 DEVELOPMENT URLS:${NC}"
    echo "   React App:    http://localhost:5173"
    echo "   Worker API:   http://localhost:8787"
    echo "   API Health:   http://localhost:8787/api/health"
    echo ""
    echo -e "${CYAN}📚 API ENDPOINTS:${NC}"
    echo "   GET /api/feeds         - Latest news feeds"
    echo "   GET /api/feeds/sources - RSS source list" 
    echo "   GET /api/feeds/cached  - Cached feeds"
    echo "   GET /api/health        - Health check"
    echo ""
    echo -e "${CYAN}💡 USEFUL COMMANDS:${NC}"
    echo -e "   ${GREEN}npm run build${NC}             # Build for production"
    echo -e "   ${GREEN}npm run test${NC}              # Run tests"
    echo -e "   ${GREEN}npm run lint${NC}              # Check code quality"
    echo -e "   ${GREEN}./scripts/build.sh${NC}        # Build with helper script"
    echo -e "   ${GREEN}./scripts/deploy.sh${NC}       # Deploy with helper script"
    echo ""
    echo -e "${GREEN}${ROCKET} Your Harare Metro news aggregator is ready to go!${NC}"
    echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    print_banner
    
    # Execute all setup steps
    validate_environment
    create_backup
    cleanup_old_structure
    create_directory_structure
    
    # Configuration files
    create_package_json
    create_wrangler_config
    create_vite_config
    create_typescript_config
    create_tailwind_config
    
    # Application code
    create_worker
    create_react_app
    create_react_components
    create_react_hooks
    create_html_template
    
    # Development tools
    create_development_scripts
    create_additional_files
    
    # Final setup
    install_dependencies
    final_checks
    print_final_instructions
}

# Run the main function
main "$@"