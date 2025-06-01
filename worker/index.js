// Enhanced Worker with Zimbabwe-specific keyword categorization + Global trending categories
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

// Enhanced category mapping with global trending categories
const CATEGORY_KEYWORDS = {
  // Zimbabwe-specific categories (highest priority)
  politics: [
    'parliament', 'government', 'election', 'party', 'minister', 'president', 'policy', 
    'zanu', 'mdc', 'opposition', 'mnangagwa', 'chamisa', 'cabinet', 'senate', 'mp', 
    'constituency', 'voter', 'ballot', 'democracy', 'governance', 'corruption',
    'sanctions', 'diplomatic', 'ambassador'
  ],
  economy: [
    'economy', 'economic', 'inflation', 'currency', 'budget', 'finance', 'bank', 
    'investment', 'gdp', 'trade', 'bond', 'rtgs', 'usd', 'forex', 'revenue',
    'tax', 'fiscal', 'monetary', 'debt', 'loan', 'imf', 'world bank', 'stock exchange',
    'zse', 'commodity', 'export', 'import', 'manufacturing'
  ],
  business: [
    'business', 'company', 'entrepreneur', 'startup', 'market', 'industry', 
    'corporate', 'commerce', 'mining', 'tobacco', 'retail', 'wholesale',
    'sme', 'tender', 'procurement', 'partnership', 'merger', 'acquisition',
    'ceo', 'director', 'shareholder', 'profit', 'revenue', 'growth'
  ],
  
  // Sports (enhanced)
  sports: [
    'sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'dynamos', 
    'caps united', 'highlanders', 'afcon', 'fifa', 'world cup', 'olympics',
    'athletics', 'boxing', 'tennis', 'golf', 'swimming', 'basketball',
    'volleyball', 'netball', 'hockey', 'cycling', 'marathon'
  ],
  
  // Local/Regional
  harare: [
    'harare', 'capital', 'city council', 'mayor', 'cbd', 'avondale', 'borrowdale', 
    'chitungwiza', 'municipality', 'ward', 'councillor', 'rates', 'water',
    'sewer', 'roads', 'traffic', 'parking', 'housing', 'suburbs'
  ],
  agriculture: [
    'agriculture', 'farming', 'maize', 'cotton', 'tobacco', 'crop', 'harvest', 
    'farmer', 'irrigation', 'drought', 'rain', 'season', 'seed', 'fertilizer',
    'pesticide', 'livestock', 'cattle', 'poultry', 'dairy', 'horticulture',
    'land reform', 'a1', 'a2', 'commercial farming'
  ],

  // Global trending categories
  technology: [
    'technology', 'tech', 'digital', 'internet', 'mobile', 'smartphone', 'app',
    'software', 'ai', 'artificial intelligence', 'blockchain', 'crypto', 'bitcoin',
    'fintech', 'ecommerce', 'social media', 'facebook', 'twitter', 'whatsapp',
    'google', 'microsoft', 'apple', 'innovation', 'startup', 'coding', 'programming',
    'cybersecurity', 'data', 'cloud', 'iot', 'automation', '5g', 'broadband'
  ],
  
  health: [
    'health', 'medical', 'hospital', 'doctor', 'nurse', 'patient', 'treatment',
    'medicine', 'vaccine', 'covid', 'pandemic', 'virus', 'disease', 'illness',
    'mental health', 'wellness', 'fitness', 'nutrition', 'diet', 'exercise',
    'pharmacy', 'clinic', 'surgery', 'emergency', 'maternal', 'child health',
    'hiv', 'aids', 'malaria', 'tuberculosis', 'cancer', 'diabetes'
  ],
  
  education: [
    'education', 'school', 'university', 'college', 'student', 'teacher', 'lecturer',
    'exam', 'zimsec', 'o level', 'a level', 'degree', 'graduation', 'scholarship',
    'tuition', 'fees', 'curriculum', 'syllabus', 'learning', 'literacy',
    'primary school', 'secondary school', 'higher education', 'vocational training',
    'apprenticeship', 'skills development'
  ],
  
  entertainment: [
    'entertainment', 'music', 'movie', 'film', 'celebrity', 'artist', 'musician',
    'actor', 'actress', 'concert', 'show', 'performance', 'festival', 'awards',
    'album', 'single', 'video', 'streaming', 'netflix', 'youtube', 'television',
    'radio', 'podcast', 'comedy', 'drama', 'documentary', 'theatre', 'dance',
    'culture', 'tradition', 'heritage'
  ],
  
  environment: [
    'environment', 'climate', 'weather', 'conservation', 'wildlife', 'nature',
    'pollution', 'green', 'renewable', 'solar', 'sustainability', 'recycling',
    'carbon', 'emissions', 'deforestation', 'biodiversity', 'ecosystem',
    'national park', 'safari', 'tourism', 'eco-tourism', 'endangered species',
    'global warming', 'climate change', 'drought', 'flood', 'cyclone'
  ],
  
  crime: [
    'crime', 'police', 'arrest', 'court', 'judge', 'trial', 'sentence', 'prison',
    'theft', 'robbery', 'murder', 'assault', 'fraud', 'corruption', 'bribery',
    'investigation', 'detective', 'evidence', 'witness', 'victim', 'justice',
    'law', 'legal', 'attorney', 'lawyer', 'magistrate', 'bail', 'fine'
  ],
  
  international: [
    'international', 'global', 'world', 'foreign', 'embassy', 'diplomat', 'un',
    'africa', 'sadc', 'south africa', 'botswana', 'zambia', 'mozambique',
    'malawi', 'namibia', 'china', 'usa', 'uk', 'europe', 'brexit', 'trade war',
    'sanctions', 'peacekeeping', 'humanitarian', 'refugee', 'migration'
  ],
  
  lifestyle: [
    'lifestyle', 'fashion', 'beauty', 'travel', 'food', 'recipe', 'cooking',
    'restaurant', 'hotel', 'vacation', 'holiday', 'wedding', 'family',
    'parenting', 'relationship', 'dating', 'home', 'property', 'real estate',
    'car', 'vehicle', 'shopping', 'consumer', 'brand', 'luxury'
  ],
  
  finance: [
    'finance', 'financial', 'money', 'cash', 'loan', 'credit', 'debt', 'savings',
    'pension', 'insurance', 'investment', 'stock', 'share', 'dividend', 'interest',
    'mortgage', 'microfinance', 'banking', 'mobile money', 'ecocash', 'onemoney',
    'telecash', 'fintech', 'cryptocurrency', 'forex', 'exchange rate'
  ]
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
  },
  // Additional Zimbabwe sources you might want to add
  {
    name: 'NewZimbabwe',
    url: 'https://www.newzimbabwe.com/feed/',
    category: 'general',
    enabled: false // Set to true when ready
  },
  {
    name: 'Zimbabwe Independent',
    url: 'https://www.theindependent.co.zw/feed/',
    category: 'general',
    enabled: false // Set to true when ready
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
        
        // Enhanced fallback HTML with all categories
        return new Response(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Harare Metro - Zimbabwe News Aggregator</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                line-height: 1.4;
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
                flex-wrap: wrap;
                gap: 1rem;
              }
              .logo {
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }
              .logo h1 {
                color: #2d3748;
                font-size: clamp(1.2rem, 4vw, 1.8rem);
                font-weight: 700;
              }
              .flag { font-size: 1.5rem; }
              .subtitle { color: #718096; font-size: 0.85rem; }
              .refresh-btn {
                background: #4299e1;
                color: white;
                border: none;
                padding: 0.75rem 1.25rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.9rem;
                transition: all 0.2s;
              }
              .refresh-btn:hover { background: #3182ce; transform: translateY(-1px); }
              .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 1rem;
              }
              .filters {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
                overflow-x: auto;
                padding-bottom: 0.5rem;
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .filters::-webkit-scrollbar { display: none; }
              .filter-btn {
                background: rgba(255,255,255,0.9);
                border: 2px solid transparent;
                padding: 0.5rem 1rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
                font-size: 0.85rem;
                transition: all 0.2s;
                color: #4a5568;
                white-space: nowrap;
                min-width: fit-content;
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
                font-size: 1rem;
                padding: 2rem;
              }
              .error { 
                color: #f56565; 
                background: rgba(255,255,255,0.9); 
                padding: 1rem; 
                border-radius: 0.5rem;
                margin: 1rem 0;
                border-left: 4px solid #f56565;
                font-size: 0.9rem;
              }
              .news-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
                gap: 1rem;
              }
              .article {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                border-radius: 0.75rem;
                padding: 1.25rem;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                border: 1px solid rgba(255,255,255,0.2);
              }
              .article:hover { 
                transform: translateY(-3px); 
                box-shadow: 0 15px 35px rgba(0,0,0,0.15);
              }
              .article-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
                flex-wrap: wrap;
                gap: 0.5rem;
              }
              .source {
                color: #4299e1;
                font-weight: 600;
                font-size: 0.8rem;
              }
              .date {
                color: #718096;
                font-size: 0.75rem;
              }
              .article h3 { 
                margin: 0 0 0.75rem 0; 
                color: #2d3748; 
                font-size: 1rem;
                line-height: 1.4;
                font-weight: 600;
              }
              .description { 
                color: #4a5568; 
                line-height: 1.5; 
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
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
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: capitalize;
              }
              .category.politics { background: #fed7d7; color: #c53030; }
              .category.economy { background: #c6f6d5; color: #2f855a; }
              .category.business { background: #bee3f8; color: #2b6cb0; }
              .category.sports { background: #feebc8; color: #c05621; }
              .category.harare { background: #e9d8fd; color: #6b46c1; }
              .category.agriculture { background: #d4edda; color: #155724; }
              .category.technology { background: #e0f2fe; color: #0277bd; }
              .category.health { background: #f3e5f5; color: #7b1fa2; }
              .category.education { background: #fff3e0; color: #ef6c00; }
              .category.entertainment { background: #fce4ec; color: #c2185b; }
              .category.environment { background: #e8f5e8; color: #388e3c; }
              .category.crime { background: #ffebee; color: #d32f2f; }
              .category.international { background: #e3f2fd; color: #1976d2; }
              .category.lifestyle { background: #f1f8e9; color: #689f38; }
              .category.finance { background: #fff8e1; color: #f57c00; }
              .read-more {
                color: #4299e1;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.85rem;
                transition: color 0.2s;
              }
              .read-more:hover { color: #3182ce; }
              .priority-badge {
                background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 0.2rem 0.5rem;
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
                font-size: 0.9rem;
              }
              @media (max-width: 768px) {
                .header-content { flex-direction: column; text-align: center; }
                .filters { justify-content: flex-start; }
                .container { padding: 0.75rem; }
                .article { padding: 1rem; }
                .article h3 { font-size: 0.95rem; }
                .description { font-size: 0.85rem; -webkit-line-clamp: 2; }
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
                <button class="refresh-btn" onclick="loadNews()">🔄 Refresh</button>
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
                <button class="filter-btn" data-category="health">Health</button>
                <button class="filter-btn" data-category="education">Education</button>
                <button class="filter-btn" data-category="entertainment">Entertainment</button>
                <button class="filter-btn" data-category="environment">Environment</button>
                <button class="filter-btn" data-category="crime">Crime</button>
                <button class="filter-btn" data-category="international">International</button>
                <button class="filter-btn" data-category="lifestyle">Lifestyle</button>
                <button class="filter-btn" data-category="finance">Finance</button>
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
                const categories = [...new Set(allFeeds.map(article => article.category))].length;
                document.getElementById('stats').innerHTML = \`
                  <div>📊 <strong>\${allFeeds.length}</strong> articles • <strong>\${priorityCount}</strong> priority Zimbabwe stories • <strong>\${categories}</strong> categories</div>
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
                      <span class="category \${article.category}">\${article.category}</span>
                      <a href="\${article.link}" target="_blank" rel="noopener" class="read-more">Read More →</a>
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
              
              // Auto-refresh every 15 minutes
              setInterval(loadNews, 15 * 60 * 1000);
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
          sources: RSS_SOURCES.filter(s => s.enabled).length,
          totalSources: RSS_SOURCES.length,
          categories: Object.keys(CATEGORY_KEYWORDS).length,
          message: 'Harare Metro API is healthy!',
          features: ['enhanced-categorization', 'priority-detection', 'zimbabwe-focus', 'global-categories']
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
          priority: PRIORITY_KEYWORDS,
          totalCategories: Object.keys(CATEGORY_KEYWORDS).length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case '/debug/categories':
        // Test category detection with sample content
        const testContent = "President Mnangagwa announced new economic policies for Zimbabwe's agriculture sector in Harare"
        const testResult = detectCategoryEnhanced(testContent.toLowerCase(), testContent, "Test Source")
        
        return new Response(JSON.stringify({
          testContent,
          detectedCategory: testResult,
          availableCategories: Object.keys(CATEGORY_KEYWORDS),
          categoryKeywordCount: Object.fromEntries(
            Object.entries(CATEGORY_KEYWORDS).map(([cat, keywords]) => [cat, keywords.length])
          )
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        return new Response(JSON.stringify({ 
          error: 'Endpoint not found',
          available: ['/health', '/feeds/sources', '/feeds', '/feeds/cached', '/categories', '/debug/categories']
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
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(source.url, {
        headers: { 
          'User-Agent': 'Harare Metro News Aggregator/2.0 (Zimbabwe)',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
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
        .slice(0, 20)
        .map(item => {
          const title = item.title?.text || item.title || 'No title'
          const description = cleanHtml(item.description?.text || item.description || item.summary?.text || item.summary || '')
          
          // ENHANCED: Create more comprehensive content for analysis
          const content = `${title} ${description}`.toLowerCase()
          
          // DEBUG: Log the content being analyzed (remove after testing)
          console.log(`Analyzing article: "${title.substring(0, 50)}..." | Content length: ${content.length}`)
          
          // Enhanced category detection with debugging
          const detectedCategory = detectCategoryEnhanced(content, title, source.name) || source.category || 'general'
          
          // Enhanced priority detection
          const isPriority = PRIORITY_KEYWORDS.some(keyword => 
            content.includes(keyword.toLowerCase())
          )
          
          const relevanceScore = calculateRelevanceScore(content)
          
          const processedItem = {
            title: title,
            description: description,
            link: item.link?.text || item.link || item.id || '#',
            pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
            source: source.name,
            category: detectedCategory,
            priority: isPriority,
            relevanceScore: relevanceScore,
            guid: item.guid?.text || item.guid || item.id || `${source.name}-${Date.now()}-${Math.random()}`
            // DEBUG: Add debug info (remove after testing)
            // debug: {
            //   contentPreview: content.substring(0, 100),
            //   originalCategory: source.category,
            //   detectedCategory: detectedCategory
            // }
          }
          
          console.log(`Article processed: "${title.substring(0, 30)}..." -> Category: ${detectedCategory}`)
          
          return processedItem
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

  // Enhanced sorting: Priority first, then relevance score, then date
  allFeeds.sort((a, b) => {
    if (a.priority && !b.priority) return -1
    if (!a.priority && b.priority) return 1
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    return new Date(b.pubDate) - new Date(a.pubDate)
  })

  const uniqueFeeds = removeDuplicates(allFeeds)
  const limitedFeeds = uniqueFeeds.slice(0, 100)

  // DEBUG: Log category distribution
  const categoryStats = {}
  limitedFeeds.forEach(feed => {
    categoryStats[feed.category] = (categoryStats[feed.category] || 0) + 1
  })
  console.log('Category distribution:', categoryStats)

  return new Response(JSON.stringify(limitedFeeds), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600' 
    }
  })
}

// ENHANCED CATEGORY DETECTION FUNCTION
function detectCategoryEnhanced(content, title, sourceName) {
  let maxMatches = 0
  let detectedCategory = null
  let categoryScores = {}
  
  console.log(`Detecting category for: "${title.substring(0, 50)}..."`)
  
  // Calculate scores for each category with enhanced matching
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0
    
    // Check each keyword
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      
      // Count occurrences (not just presence)
      const titleMatches = (title.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length
      const contentMatches = (content.match(new RegExp(keywordLower, 'g')) || []).length
      
      // Weight title matches higher
      matches += (titleMatches * 2) + contentMatches
    }
    
    categoryScores[category] = matches
    
    if (matches > maxMatches) {
      maxMatches = matches
      detectedCategory = category
    }
  }
  
  console.log(`Category scores for "${title.substring(0, 30)}...":`, categoryScores)
  console.log(`Detected category: ${detectedCategory} (${maxMatches} matches)`)
  
  // If we have a tie or low confidence, prefer Zimbabwe-specific categories
  const zimbabweCategories = ['politics', 'economy', 'harare', 'agriculture']
  if (maxMatches > 0) {
    for (const zwCategory of zimbabweCategories) {
      if (categoryScores[zwCategory] === maxMatches) {
        detectedCategory = zwCategory
        break
      }
    }
  }
  
  // Fallback: If no category detected but source has specific focus
  if (!detectedCategory || maxMatches === 0) {
    // Source-based fallback
    if (sourceName.toLowerCase().includes('business')) {
      detectedCategory = 'business'
    } else if (sourceName.toLowerCase().includes('tech')) {
      detectedCategory = 'technology'
    } else {
      detectedCategory = 'general'
    }
  }
  
  return detectedCategory
}

function calculateRelevanceScore(content) {
  let score = 0
  
  // Higher scores for Zimbabwe-specific content
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      score += 3 // High priority for Zimbabwe keywords
    }
  })
  
  // Bonus for local city names
  const cities = ['harare', 'bulawayo', 'mutare', 'gweru', 'kwekwe', 'masvingo', 'chitungwiza']
  cities.forEach(city => {
    if (content.includes(city)) {
      score += 2
    }
  })
  
  // Bonus for government/political terms
  const govTerms = ['government', 'parliament', 'minister', 'president', 'cabinet']
  govTerms.forEach(term => {
    if (content.includes(term)) {
      score += 1
    }
  })
  
  return score
}

function removeDuplicates(feeds) {
  const seen = new Set()
  const unique = []
  
  for (const feed of feeds) {
    // Create a simplified version of the title for comparison
    const normalizedTitle = feed.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Check if we've seen a very similar title
    let isDuplicate = false
    for (const seenTitle of seen) {
      if (calculateSimilarity(normalizedTitle, seenTitle) > 0.8) {
        isDuplicate = true
        break
      }
    }
    
    if (!isDuplicate) {
      seen.add(normalizedTitle)
      unique.push(feed)
    }
  }
  
  return unique
}

function calculateSimilarity(str1, str2) {
  const words1 = str1.split(' ')
  const words2 = str2.split(' ')
  const intersection = words1.filter(word => words2.includes(word))
  const union = [...new Set([...words1, ...words2])]
  return intersection.length / union.length
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
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 300) // Increased from 250 for better descriptions
}