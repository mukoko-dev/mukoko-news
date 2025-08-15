/* eslint-env worker */
/* global Response, Request, URL, __STATIC_CONTENT_MANIFEST */
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import ConfigService from './services/ConfigService.js'
// import { D1UserService } from './services/D1UserService.js'  // DISABLED: Using Supabase now
import { AnalyticsEngineService } from './services/AnalyticsEngineService.js'
import RSSFeedService from './services/RSSFeedService.js'
import { CacheService } from './services/CacheService.js'
import { handleApiRequest } from './api.js'
import { CloudflareImagesService } from './services/CloudflareImagesService.js'

// Cache configuration
const CACHE_CONFIG = {
  ARTICLES_TTL: 14 * 24 * 60 * 60, // 2 weeks in seconds
  SCHEDULED_REFRESH_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
  MAX_ARTICLES: 20000,           // Increased from 10000
  ITEMS_PER_SOURCE: 100,         // Increased from 50
  MIN_LIMIT: 100,                // New minimum limit
  MAX_LIMIT: 1000,               // New maximum limit
  CACHE_HEADERS: {
    'Cache-Control': 'public, max-age=300, s-maxage=600',
    'CDN-Cache-Control': 'max-age=600',
    'Cloudflare-CDN-Cache-Control': 'max-age=600'
  }
}

// Initialize services with CORRECT bindings
function initializeServices(env) {
  // FIXED: Use correct binding names
  const configService = new ConfigService(env.CONFIG_STORAGE)
  
  // FIXED: CacheService expects (newsStorageKV, contentCacheKV) with correct binding names
  const cacheService = new CacheService(
    env.NEWS_STORAGE,      // newsStorageKV (for articles)
    env.CONTENT_CACHE      // contentCacheKV (for search/general cache) - FIXED name
  )
  
  // DISABLED: User service now handled by Supabase directly in frontend
  // const userService = env.USER_DB ? new D1UserService(env.USER_DB) : null
  const userService = null // User operations moved to Supabase
  
  // FIXED: Analytics service with correct 3 datasets
  const analyticsService = new AnalyticsEngineService({
    categoryClicks: env.CATEGORY_CLICKS || null,
    newsInteractions: env.NEWS_INTERACTIONS || null,
    searchQueries: env.SEARCH_QUERIES || null
  })
  
  const imagesService = new CloudflareImagesService(env)
  const rssService = new RSSFeedService(configService)

  // Services initialized successfully
  
  return {
    configService,
    cacheService,
    userService,
    analyticsService,
    imagesService,
    rssService
  }
}

// Background scheduled refresh function - FULLY AUTONOMOUS
async function runScheduledRefresh(env) {
  const startTime = Date.now()
  
  try {
    // Starting autonomous scheduled refresh
    
    const { cacheService, rssService } = initializeServices(env)
    
    // Check if refresh is needed (autonomous decision)
    const needsRefresh = await cacheService.shouldRunScheduledRefresh(CACHE_CONFIG.SCHEDULED_REFRESH_INTERVAL)
    if (!needsRefresh) {
      // Scheduled refresh not needed yet
      return { success: true, reason: 'Not time for refresh', skipped: true }
    }

    // Try to acquire lock (autonomous)
    const lockAcquired = await cacheService.acquireRefreshLock()
    if (!lockAcquired) {
      // Could not acquire refresh lock - another process running
      return { success: true, reason: 'Another refresh in progress', skipped: true }
    }

    // Starting RSS fetch from all sources
    
    // Fetch fresh articles autonomously
    const freshArticles = await rssService.fetchAllFeedsBackground(
      CACHE_CONFIG.ITEMS_PER_SOURCE,
      CACHE_CONFIG.MAX_ARTICLES
    )
    
    if (freshArticles && freshArticles.length > 0) {
      // Cache the articles using CacheService
      await cacheService.setCachedArticles(freshArticles)
      await cacheService.setLastScheduledRun()
      
      const duration = Date.now() - startTime
      // Autonomous refresh completed successfully
      
      return { 
        success: true, 
        articlesCount: freshArticles.length,
        duration: duration,
        timestamp: new Date().toISOString(),
        autonomous: true
      }
    } else {
      // No articles fetched during refresh
      return { 
        success: false, 
        reason: 'No articles fetched',
        articlesCount: 0 
      }
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    // Autonomous refresh failed
    return { 
      success: false, 
      reason: error.message,
      autonomous: true,
      duration: duration
    }
  } finally {
    // Always release lock
    try {
      const { cacheService } = initializeServices(env)
      await cacheService.releaseRefreshLock()
      // Refresh lock released
    } catch {
      // Failed to release lock
    }
  }
}

// Initial data loading function - AUTONOMOUS
async function _ensureInitialData(env) {
  try {
    // Checking if initial data load is needed
    
    const { cacheService, rssService } = initializeServices(env)
    
    // Check if we have any cached articles
    const existingArticles = await cacheService.getCachedArticles()
    
    if (existingArticles && existingArticles.length > 0) {
      // Found cached articles, no initial load needed
      return { success: true, reason: 'Data already available', articlesCount: existingArticles.length }
    }
    
    // No cached data found, performing initial load
    
    // Try to acquire lock for initial load
    const lockAcquired = await cacheService.acquireRefreshLock()
    if (!lockAcquired) {
      // Another process is loading data, waiting...
      return { success: true, reason: 'Another process loading', skipped: true }
    }
    
    try {
      // Perform initial RSS fetch
      const articles = await rssService.fetchAllFeedsBackground(
        CACHE_CONFIG.ITEMS_PER_SOURCE,
        CACHE_CONFIG.MAX_ARTICLES
      )
      
      if (articles && articles.length > 0) {
        await cacheService.setCachedArticles(articles)
        await cacheService.setLastScheduledRun()
        
        // Initial load completed
        return { 
          success: true, 
          articlesCount: articles.length,
          initialLoad: true 
        }
      } else {
        // No articles loaded during initial fetch
        return { success: false, reason: 'No articles fetched' }
      }
      
    } finally {
      await cacheService.releaseRefreshLock()
    }
    
  } catch (error) {
    // Initial data load failed
    return { success: false, reason: error.message }
  }
}

// MISSING: Validate environment function with CORRECT binding names
function _validateEnvironment(env) {
  const issues = []
  const warnings = []
  
  // Critical bindings - FIXED names
  if (!env.NEWS_STORAGE) issues.push('NEWS_STORAGE KV binding missing')
  if (!env.CONFIG_STORAGE) issues.push('CONFIG_STORAGE KV binding missing')
  if (!env.CONTENT_CACHE) issues.push('CONTENT_CACHE KV binding missing')
  
  // Optional but recommended - FIXED name
  if (!env.USER_STORAGE) warnings.push('USER_STORAGE binding missing (user features disabled)')
  if (!env.CATEGORY_CLICKS) warnings.push('CATEGORY_CLICKS Analytics binding missing')
  if (!env.NEWS_INTERACTIONS) warnings.push('NEWS_INTERACTIONS Analytics binding missing')
  if (!env.SEARCH_QUERIES) warnings.push('SEARCH_QUERIES Analytics binding missing')
  
  // Image service
  if (!env.CLOUDFLARE_ACCOUNT_ID) warnings.push('CLOUDFLARE_ACCOUNT_ID missing (image optimization disabled)')
  if (!env.CLOUDFLARE_API_TOKEN) warnings.push('CLOUDFLARE_API_TOKEN missing (image optimization disabled)')
  
  return {
    valid: issues.length === 0,
    issues,
    warnings,
    bindingsOk: issues.length === 0,
    allFeaturesAvailable: issues.length === 0 && warnings.length === 0
  }
}

// Basic HTML fallback with embedded React app
function getBasicHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mukoko - Modern News Aggregator</title>
    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #000000;
            min-height: 100vh;
            color: #ffffff;
            font-weight: 400;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 60px 24px; 
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .logo-container {
            margin-bottom: 48px;
        }
        
        .logo {
            display: inline-block;
            padding: 24px;
            border: 2px solid #ffffff;
            margin-bottom: 24px;
        }
        
        .logo-inner {
            border: 1px solid #ffffff;
            padding: 20px 32px;
        }
        
        .logo-mk {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 3rem;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
            line-height: 1;
            letter-spacing: -0.02em;
        }
        
        .logo-text {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 0.9rem;
            color: #a3a3a3;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .tagline {
            color: #a3a3a3;
            font-size: 1.1rem;
            font-weight: 300;
            margin-bottom: 48px;
        }
        
        .loading {
            background: #0f0f0f;
            border: 1px solid #262626;
            border-radius: 12px;
            padding: 40px 32px;
            margin-bottom: 48px;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 2px solid #404040;
            border-top: 2px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 24px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading h3 {
            font-size: 1.25rem;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 12px;
        }
        
        .loading p {
            color: #a3a3a3;
            font-weight: 300;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-top: 48px;
        }
        
        .feature {
            background: #0f0f0f;
            border: 1px solid #262626;
            padding: 32px 24px;
            border-radius: 12px;
            transition: all 0.2s ease;
        }
        
        .feature:hover {
            border-color: #404040;
            background: #1a1a1a;
        }
        
        .feature h3 {
            color: #ffffff;
            margin-bottom: 12px;
            font-weight: 500;
            font-size: 1.1rem;
        }
        
        .feature p {
            color: #a3a3a3;
            font-weight: 300;
            font-size: 0.95rem;
        }
        
        @media (max-width: 768px) {
            .container { 
                padding: 40px 20px; 
            }
            .logo-mk { 
                font-size: 2.5rem; 
            }
            .features {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
        
        @media (prefers-color-scheme: light) {
            body {
                background: #ffffff;
                color: #000000;
            }
            .logo, .logo-inner {
                border-color: #000000;
            }
            .logo-mk {
                color: #000000;
            }
            .tagline, .loading p, .feature p {
                color: #666666;
            }
            .loading, .feature {
                background: #fafafa;
                border-color: #e5e5e5;
            }
            .feature:hover {
                border-color: #d4d4d4;
                background: #f5f5f5;
            }
            .loading h3, .feature h3 {
                color: #000000;
            }
            .spinner {
                border-color: #e5e5e5;
                border-top-color: #000000;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <div class="logo">
                <div class="logo-inner">
                    <div class="logo-mk">MK</div>
                    <div class="logo-text">MUKOKO</div>
                </div>
            </div>
            <p class="tagline">Modern news aggregation platform</p>
        </div>
        
        <div class="loading">
            <div class="spinner"></div>
            <h3>Loading Latest News...</h3>
            <p>Aggregating news from trusted sources worldwide</p>
        </div>

        <div class="features">
            <div class="feature">
                <h3>🌍 Global Sources</h3>
                <p>Curated news from trusted publishers worldwide</p>
            </div>
            <div class="feature">
                <h3>🔍 Smart Search</h3>
                <p>AI-powered search to find exactly what matters</p>
            </div>
            <div class="feature">
                <h3>📱 Mobile First</h3>
                <p>Seamless experience across all your devices</p>
            </div>
        </div>
    </div>

    <div id="root"></div>
    
    <script>
        // Auto-refresh after 5 seconds if still showing fallback
        setTimeout(() => {
            if (document.getElementById('root').innerHTML === '') {
                window.location.reload();
            }
        }, 5000);
    </script>
</body>
</html>`
}

// Export utility functions that the API file might need
export {
  CACHE_CONFIG,
  initializeServices,
  runScheduledRefresh
}

// Main Cloudflare Worker export
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
          }
        })
      }
      
      // Handle API requests (delegates to api.js)
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env, ctx)
      }
      
      // Handle static files - SIMPLIFIED for Vite build structure
      const isAssetRequest = (
        url.pathname.startsWith('/assets/') ||     // Vite assets folder
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.ttf') ||
        url.pathname.endsWith('.map') ||          // Add source maps
        url.pathname === '/favicon.ico' ||
        url.pathname === '/vite.svg' ||
        url.pathname === '/manifest.json'
      )
      
      if (isAssetRequest) {
        try {
          // Check if we have static content binding
          if (!env.__STATIC_CONTENT) {
            // For source maps, return 404 silently
            if (url.pathname.endsWith('.map')) {
              return new Response('Source map not available', { 
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
              })
            }
            
            // Static content not available for: ${url.pathname}
            
            // For missing favicon, return a simple one
            if (url.pathname === '/favicon.ico' || url.pathname === '/vite.svg') {
              return new Response(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <text y="24" font-size="24">🇿🇼</text>
                </svg>
              `, { 
                status: 200,
                headers: { 
                  'Content-Type': 'image/svg+xml',
                  'Cache-Control': 'public, max-age=86400'
                }
              })
            }
            
            return new Response('Static content not configured', { 
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            })
          }

          // Try to get the asset directly from KV
          const response = await getAssetFromKV({
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          }, {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
          })
          
          const newResponse = new Response(response.body, response)
          
          // Set appropriate cache headers based on file type
          if (url.pathname.startsWith('/assets/')) {
            // Vite assets are hashed and immutable
            newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
          } else if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
            newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
          } else if (url.pathname.endsWith('.map')) {
            // Source maps - shorter cache
            newResponse.headers.set('Cache-Control', 'public, max-age=3600')
          } else {
            newResponse.headers.set('Cache-Control', 'public, max-age=86400')
          }
          
          return newResponse
          
        } catch {
          // Handle source maps silently
          if (url.pathname.endsWith('.map')) {
            return new Response('Source map not found', { 
              status: 404,
              headers: { 'Content-Type': 'text/plain' }
            })
          }
          
          // Only log actual missing assets, not common ones
          if (!url.pathname.includes('favicon') && 
              !url.pathname.includes('vite.svg') && 
              !url.pathname.includes('manifest.json') &&
              !url.pathname.endsWith('.map')) {
            // Asset not found: ${url.pathname}
          }
          
          // For missing favicon/vite.svg, return a simple SVG
          if (url.pathname === '/favicon.ico' || url.pathname === '/vite.svg') {
            return new Response(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#2563eb"/>
                <text x="16" y="22" font-size="16" text-anchor="middle" fill="white">🇿🇼</text>
              </svg>
            `, { 
              status: 200,
              headers: { 
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400'
              }
            })
          }
          
          // Return proper 404 for other missing assets
          return new Response('Asset not found', { 
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          })
        }
      }

      // Serve React app (SPA fallback) for all other routes
      try {
        // Check if we have static content
        if (!env.__STATIC_CONTENT) {
          // Static content not available, serving enhanced fallback HTML
          return new Response(getBasicHTML(), {
            headers: { 
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=300'
            }
          })
        }

        // Always serve index.html for SPA routes
        const response = await getAssetFromKV({
          request: new Request(new URL('/index.html', request.url)),
          waitUntil: ctx.waitUntil.bind(ctx),
        }, {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        })
        
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('Cache-Control', 'public, max-age=3600')
        newResponse.headers.set('Content-Type', 'text/html;charset=UTF-8')
        return newResponse
        
      } catch {
        // index.html not found, serving enhanced fallback HTML
        return new Response(getBasicHTML(), {
          headers: { 
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=300'
          }
        })
      }

    } catch {
      // Worker error occurred
      return new Response('Internal Server Error', { status: 500 })
    }
  },

  // Scheduled event handler for Cloudflare Cron Triggers
  async scheduled(controller, env, _ctx) {
    // Cron trigger executed
    
    try {
      const result = await runScheduledRefresh(env)
      
      if (result.success) {
        // Scheduled refresh successful: articles in duration
      } else {
        // Scheduled refresh skipped: reason
      }
      
      return result
    } catch (error) {
      // Scheduled event handler failed
      return { success: false, error: error.message }
    }
  }
}