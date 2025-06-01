// Enhanced Worker with Zimbabwe-specific keyword categorization
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { XMLParser } from 'fast-xml-parser'

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
  politics: ['parliament', 'government', 'election', 'party', 'minister', 'president', 'policy', 'zanu', 'mdc', 'opposition', 'mnangagwa', 'chamisa'],
  economy: ['economy', 'economic', 'inflation', 'currency', 'budget', 'finance', 'bank', 'investment', 'gdp', 'trade', 'bond', 'rtgs', 'usd'],
  business: ['business', 'company', 'entrepreneur', 'startup', 'market', 'industry', 'corporate', 'commerce', 'mining', 'tobacco'],
  sports: ['sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'dynamos', 'caps united', 'highlanders', 'afcon'],
  harare: ['harare', 'capital', 'city council', 'mayor', 'cbd', 'avondale', 'borrowdale', 'chitungwiza'],
  agriculture: ['agriculture', 'farming', 'maize', 'cotton', 'tobacco', 'crop', 'harvest', 'farmer', 'irrigation', 'drought']
};

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
    console.log('Request:', url.pathname)
    
    try {
      // Handle API routes first (highest priority)
      if (url.pathname.startsWith('/api/')) {
        console.log('Handling API request:', url.pathname)
        return await handleApiRequest(request, env, ctx)
      }

      // Try to serve static assets from KV
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx)
          },
          {
            ASSET_NAMESPACE: env.ASSETS,
            // Serve index.html for SPA routes
            mapRequestToAsset: (req) => {
              const url = new URL(req.url)
              const pathname = url.pathname
              
              // Serve actual files for assets (js, css, images, etc.)
              if (pathname.includes('.') && !pathname.endsWith('/')) {
                return req
              }
              
              // Serve index.html for SPA routes (everything else)
              return new Request(`${url.origin}/index.html`, req)
            }
          }
        )
      } catch (assetError) {
        console.log('Asset serving failed, falling back to enhanced HTML:', assetError.message)
        
        // Enhanced fallback HTML with Zimbabwe focus
        return new Response(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Harare Metro - Zimbabwe News Aggregator</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .header {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                padding: 1rem 0;
                box-shadow: 0 2px 20px rgba(0,0,0,0.1);
                position: sticky;
                top: 0;
                z-index: 100;
              }
              .header-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .logo {
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }
              .logo h1 {
                margin: 0;
                color: #2d3748;
                font-size: 1.8rem;
                font-weight: 700;
              }
              .flag { font-size: 1.5rem; }
              .subtitle { color: #718096; font-size: 0.9rem; margin: 0; }
              .refresh-btn {
                background: #4299e1;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
              }
              .refresh-btn:hover { background: #3182ce; transform: translateY(-1px); }
              .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 2rem 1rem;
              }
              .filters {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
              }
              .filter-btn {
                background: rgba(255,255,255,0.9);
                border: 2px solid transparent;
                padding: 0.5rem 1rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                color: #4a5568;
              }
              .filter-btn:hover { background: white; transform: translateY(-1px); }
              .filter-btn.active { 
                background: #4299e1; 
                color: white; 
                border-color: #3182ce;
              }
              .loading { 
                text-align: center; 
                color: white;
                font-size: 1.1rem;
                padding: 3rem;
              }
              .error { 
                color: #f56565; 
                background: rgba(255,255,255,0.9); 
                padding: 1rem; 
                border-radius: 0.5rem;
                margin: 1rem 0;
                border-left: 4px solid #f56565;
              }
              .news-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
              }
              .article {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                border-radius: 0.75rem;
                padding: 1.5rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                border: 1px solid rgba(255,255,255,0.2);
              }
              .article:hover { 
                transform: translateY(-5px); 
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
              }
              .article-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                flex-wrap: wrap;
                gap: 0.5rem;
              }
              .source {
                color: #4299e1;
                font-weight: 600;
                font-size: 0.9rem;
              }
              .date {
                color: #718096;
                font-size: 0.8rem;
              }
              .article h3 { 
                margin: 0 0 1rem 0; 
                color: #2d3748; 
                font-size: 1.1rem;
                line-height: 1.4;
                font-weight: 600;
              }
              .description { 
                color: #4a5568; 
                line-height: 1.6; 
                margin-bottom: 1rem;
                font-size: 0.95rem;
              }
              .article-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
              }
              .category {
                background: #edf2f7;
                color: #4a5568;
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 500;
              }
              .category.politics { background: #fed7d7; color: #c53030; }
              .category.economy { background: #c6f6d5; color: #2f855a; }
              .category.business { background: #bee3f8; color: #2b6cb0; }
              .category.sports { background: #feebc8; color: #c05621; }
              .category.harare { background: #e9d8fd; color: #6b46c1; }
              .category.agriculture { background: #d4edda; color: #155724; }
              .read-more {
                color: #4299e1;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
                transition: color 0.2s;
              }
              .read-more:hover { color: #3182ce; }
              .priority-badge {
                background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: 600;
                margin-left: 0.5rem;
              }
              .stats {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 0.5rem;
                padding: 1rem;
                margin-bottom: 1.5rem;
                color: white;
                text-align: center;
              }
              @media (max-width: 768px) {
                .news-grid { grid-template-columns: 1fr; }
                .header-content { flex-direction: column; gap: 1rem; }
                .filters { justify-content: center; }
              }
            </style>
          </head>
          <body>
            <header class="header">
              <div class="header-content">
                <div class="logo">
                  <span class="flag">🇿🇼</span>
                  <div>
                    <h1>Harare Metro</h1>
                    <p class="subtitle">Zimbabwe News Aggregator</p>
                  </div>
                </div>
                <button class="refresh-btn" onclick="loadNews()">🔄 Refresh News</button>
              </div>
            </header>

            <div class="container">
              <div id="stats" class="stats">
                <div>📰 Loading latest news from Zimbabwe sources...</div>
              </div>

              <div class="filters">
                <button class="filter-btn active" data-category="all">All News</button>
                <button class="filter-btn" data-category="politics">Politics</button>
                <button class="filter-btn" data-category="economy">Economy</button>
                <button class="filter-btn" data-category="business">Business</button>
                <button class="filter-btn" data-category="sports">Sports</button>
                <button class="filter-btn" data-category="harare">Harare</button>
                <button class="filter-btn" data-category="agriculture">Agriculture</button>
                <button class="filter-btn" data-category="technology">Technology</button>
              </div>
              
              <div id="news-container" class="news-grid">
                <div class="loading">📡 Connecting to Zimbabwe news sources...</div>
              </div>
            </div>

            <script>
              let allFeeds = [];
              let currentCategory = 'all';

              async function loadNews() {
                try {
                  document.getElementById('news-container').innerHTML = '<div class="loading">📡 Fetching latest Zimbabwe news...</div>';
                  
                  const response = await fetch('/api/feeds');
                  if (!response.ok) throw new Error('Failed to load news');
                  
                  allFeeds = await response.json();
                  updateStats();
                  displayNews();
                  
                } catch (error) {
                  document.getElementById('news-container').innerHTML = 
                    \`<div class="error">❌ Error loading news: \${error.message}<br><small>Please check your internet connection and try again.</small></div>\`;
                }
              }

              function updateStats() {
                const priorityCount = allFeeds.filter(article => article.priority).length;
                document.getElementById('stats').innerHTML = \`
                  <div>📊 <strong>\${allFeeds.length}</strong> articles loaded • <strong>\${priorityCount}</strong> priority Zimbabwe stories</div>
                \`;
              }

              function displayNews() {
                const filteredFeeds = currentCategory === 'all' 
                  ? allFeeds 
                  : allFeeds.filter(feed => feed.category === currentCategory);

                const container = document.getElementById('news-container');
                
                if (filteredFeeds.length === 0) {
                  container.innerHTML = \`<div class="error">No articles found for "\${currentCategory}" category.</div>\`;
                  return;
                }
                
                container.innerHTML = filteredFeeds.slice(0, 50).map(article => \`
                  <div class="article">
                    <div class="article-header">
                      <span class="source">\${article.source}</span>
                      <span class="date">\${new Date(article.pubDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}</span>
                    </div>
                    
                    <h3>
                      \${article.title}
                      \${article.priority ? '<span class="priority-badge">🇿🇼 Priority</span>' : ''}
                    </h3>
                    
                    \${article.description ? \`<div class="description">\${article.description}</div>\` : ''}
                    
                    <div class="article-footer">
                      <span class="category \${article.category}">\${article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
                      <a href="\${article.link}" target="_blank" rel="noopener" class="read-more">Read Full Article →</a>
                    </div>
                  </div>
                \`).join('');
              }

              // Category filtering
              document.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                  e.target.classList.add('active');
                  currentCategory = e.target.dataset.category;
                  displayNews();
                }
              });

              // Load news on page load
              loadNews();
              
              // Auto-refresh every 10 minutes
              setInterval(loadNews, 10 * 60 * 1000);
            </script>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        })
      }

    } catch (error) {
      console.error('Worker error:', error)
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  },

  async scheduled(event, env, ctx) {
    console.log('Running scheduled feed update...')
    ctx.waitUntil(updateFeeds(env))
  }
}

async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    switch (path) {
      case '/health':
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          sources: RSS_SOURCES.length,
          message: 'Harare Metro API is healthy!',
          features: ['keyword-categorization', 'priority-detection', 'zimbabwe-focus']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case '/feeds/sources':
        return new Response(JSON.stringify(RSS_SOURCES), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      
      case '/feeds':
        return await getAllFeeds(env, corsHeaders)

      case '/feeds/cached':
        return await getCachedFeeds(env, corsHeaders)

      case '/categories':
        return new Response(JSON.stringify({
          categories: Object.keys(CATEGORY_KEYWORDS),
          keywords: CATEGORY_KEYWORDS,
          priority: PRIORITY_KEYWORDS
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        return new Response(JSON.stringify({ 
          error: 'Endpoint not found',
          available: ['/health', '/feeds/sources', '/feeds', '/feeds/cached', '/categories']
        }), {
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
  
  const feedPromises = enabledSources.map(async (source) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
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
      
      const channel = jsonData?.rss?.channel || jsonData?.feed
      const items = channel?.item || channel?.entry || []
      
      const processedItems = (Array.isArray(items) ? items : [items])
        .slice(0, 15)
        .map(item => {
          const title = item.title?.text || item.title || 'No title'
          const description = cleanHtml(item.description?.text || item.description || item.summary?.text || item.summary || '')
          const content = `${title} ${description}`.toLowerCase()
          
          // Determine category based on keywords
          const detectedCategory = detectCategory(content) || source.category
          
          // Check for priority content
          const isPriority = PRIORITY_KEYWORDS.some(keyword => 
            content.includes(keyword.toLowerCase())
          )
          
          return {
            title: title,
            description: description,
            link: item.link?.text || item.link || item.id || '#',
            pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
            source: source.name,
            category: detectedCategory,
            priority: isPriority,
            guid: item.guid?.text || item.guid || item.id || `${source.name}-${Date.now()}`
          }
        })
        .filter(item => item.title !== 'No title')

      return processedItems
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error.message)
      return []
    }
  })

  const results = await Promise.allSettled(feedPromises)
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allFeeds.push(...result.value)
    }
  })

  // Sort by priority first, then by date
  allFeeds.sort((a, b) => {
    if (a.priority && !b.priority) return -1
    if (!a.priority && b.priority) return 1
    return new Date(b.pubDate) - new Date(a.pubDate)
  })

  const limitedFeeds = allFeeds.slice(0, 100)

  return new Response(JSON.stringify(limitedFeeds), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900'
    }
  })
}

function detectCategory(content) {
  let maxMatches = 0
  let detectedCategory = null
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length
    
    if (matches > maxMatches) {
      maxMatches = matches
      detectedCategory = category
    }
  }
  
  return detectedCategory
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
          'Cache-Control': 'public, max-age=300'
        }
      })
    }
    
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
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 250)
}