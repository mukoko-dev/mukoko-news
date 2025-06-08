// Enhanced Worker with SSR support for SEO and Simple Image Extraction
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { XMLParser } from 'fast-xml-parser'

// Image URL patterns to match common formats
const IMAGE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?[^)]*)?/i,
  /\/[^\/]*\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i
]

// Common image hosting domains for Zimbabwe news sites
const TRUSTED_IMAGE_DOMAINS = [
  'herald.co.zw',
  'newsday.co.zw', 
  'chronicle.co.zw',
  'zbc.co.zw',
  'businessweekly.co.zw',
  'techzim.co.zw',
  'thestandard.co.zw',
  'zimlive.com',
  'newzimbabwe.com',
  'theindependent.co.zw',
  'sundaymail.co.zw',
  '263chat.com',
  'dailynews.co.zw',
  'zimeye.net',
  // Add CDN domains commonly used
  'wp.com',
  'wordpress.com',
  'cloudinary.com',
  'imgur.com',
  'gravatar.com',
  'amazonaws.com'
]

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
    'chitungwiza', 'municipality', 'ward', 'councillor', 'rates', 'water', 'sewer',
    'traffic', 'kombi', 'transport', 'housing', 'residential', 'suburbs'
  ],
  
  // Agriculture (important for Zimbabwe)
  agriculture: [
    'agriculture', 'farming', 'tobacco', 'maize', 'cotton', 'wheat', 'soya',
    'irrigation', 'crop', 'harvest', 'season', 'drought', 'rainfall',
    'fertilizer', 'seed', 'land reform', 'farmer', 'commercial', 'communal'
  ],
  
  // Technology (growing sector)
  technology: [
    'technology', 'tech', 'digital', 'internet', 'mobile', 'app', 'software',
    'innovation', 'startup', 'fintech', 'blockchain', 'ai', 'data',
    'cybersecurity', 'telecoms', 'econet', 'netone', 'telecel'
  ],
  
  // Health (always relevant)
  health: [
    'health', 'hospital', 'medical', 'doctor', 'patient', 'medicine', 'treatment',
    'disease', 'covid', 'vaccination', 'clinic', 'healthcare', 'pharmacy',
    'outbreak', 'epidemic', 'maternal', 'child health', 'malaria', 'hiv', 'aids'
  ],
  
  // Education
  education: [
    'education', 'school', 'student', 'teacher', 'university', 'college',
    'examination', 'zimsec', 'results', 'fees', 'scholarship', 'learning',
    'curriculum', 'graduation', 'degree', 'diploma', 'research'
  ],
  
  // Entertainment & Culture
  entertainment: [
    'entertainment', 'music', 'artist', 'movie', 'film', 'celebrity', 'culture',
    'festival', 'concert', 'award', 'album', 'song', 'dance', 'theatre',
    'comedy', 'fashion', 'beauty', 'lifestyle'
  ],
  
  // Environment
  environment: [
    'environment', 'climate', 'weather', 'conservation', 'wildlife', 'forest',
    'pollution', 'green', 'renewable', 'solar', 'clean', 'nature',
    'endangered', 'national park', 'tourism', 'safari'
  ],
  
  // Crime & Security
  crime: [
    'crime', 'police', 'arrest', 'court', 'trial', 'judge', 'sentence', 'prison',
    'theft', 'robbery', 'murder', 'investigation', 'security', 'violence',
    'corruption', 'fraud', 'smuggling', 'drugs'
  ],
  
  // International
  international: [
    'international', 'world', 'global', 'foreign', 'embassy', 'visa', 'travel',
    'tourism', 'export', 'import', 'trade', 'relations', 'diplomatic',
    'african union', 'sadc', 'united nations', 'brexit', 'china', 'uk', 'usa'
  ],
  
  // Lifestyle
  lifestyle: [
    'lifestyle', 'fashion', 'food', 'recipe', 'home', 'family', 'relationship',
    'wedding', 'travel', 'vacation', 'hobby', 'fitness', 'diet', 'beauty'
  ],
  
  // Finance (separate from economy for more specific financial news)
  finance: [
    'finance', 'financial', 'money', 'cash', 'loan', 'credit', 'savings',
    'insurance', 'pension', 'investment', 'portfolio', 'shares', 'dividend',
    'interest', 'mortgage', 'banking', 'microfinance'
  ]
};

// Reduced RSS feed sources for Zimbabwe news (optimized list)
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
  {
    name: 'NewZimbabwe',
    url: 'https://www.newzimbabwe.com/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'The Sunday Mail',
    url: 'https://www.sundaymail.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: '263Chat',
    url: 'https://www.263chat.com/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Daily News',
    url: 'https://dailynews.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'ZimEye',
    url: 'https://www.zimeye.net/feed/',
    category: 'general',
    enabled: true
  }
]

// Validation schemas for request parameters
const VALIDATION_SCHEMAS = {
  feeds: {
    category: {
      type: 'string',
      enum: ['politics', 'economy', 'business', 'sports', 'harare', 'agriculture', 'technology', 'health', 'education', 'entertainment', 'environment', 'crime', 'international', 'lifestyle', 'finance', 'general']
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 50
    },
    priority: {
      type: 'boolean'
    }
  }
}

// Category configuration for frontend
const CATEGORIES = [
  { id: 'all', label: 'All News', icon: '📰', primary: true },
  { id: 'politics', label: 'Politics', icon: '🏛️', primary: true },
  { id: 'economy', label: 'Economy', icon: '💰', primary: true },
  { id: 'business', label: 'Business', icon: '💼', primary: true },
  { id: 'sports', label: 'Sports', icon: '⚽', primary: true },
  { id: 'harare', label: 'Harare', icon: '🏙️', primary: true },
  { id: 'technology', label: 'Technology', icon: '💻', primary: false },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾', primary: false },
  { id: 'health', label: 'Health', icon: '🏥', primary: false },
  { id: 'education', label: 'Education', icon: '🎓', primary: false },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭', primary: false },
  { id: 'environment', label: 'Environment', icon: '🌍', primary: false },
  { id: 'crime', label: 'Crime & Security', icon: '🚔', primary: false },
  { id: 'international', label: 'International', icon: '🌐', primary: false },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨', primary: false },
  { id: 'finance', label: 'Finance', icon: '💳', primary: false }
]

// Image extraction function - returns original URL (restored from working version)
function extractImageFromContent(content, link, enclosure = null, mediaContent = null) {
  if (!content && !enclosure && !mediaContent) return null

  const imageMatches = []
  
  // First priority: RSS enclosure or media:content tags
  if (mediaContent && mediaContent['@_url']) {
    const mediaUrl = mediaContent['@_url']
    if (IMAGE_PATTERNS.some(pattern => pattern.test(mediaUrl))) {
      imageMatches.push(mediaUrl)
    }
  }
  
  if (enclosure && enclosure['@_type']?.startsWith('image/') && enclosure['@_url']) {
    imageMatches.push(enclosure['@_url'])
  }
  
  // Second priority: Extract from content
  if (content) {
    // Extract img src attributes
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    while ((match = imgRegex.exec(content)) !== null) {
      imageMatches.push(match[1])
    }
    
    // Extract direct image URLs from text
    IMAGE_PATTERNS.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.source, 'gi'))
      if (matches) {
        imageMatches.push(...matches)
      }
    })
  }
  
  // Filter and validate images
  const validImages = imageMatches
    .map(img => {
      try {
        // Handle relative URLs
        if (img.startsWith('//')) {
          return `https:${img}`
        } else if (img.startsWith('/')) {
          const baseUrl = new URL(link)
          return `${baseUrl.protocol}//${baseUrl.hostname}${img}`
        } else if (!img.startsWith('http')) {
          const baseUrl = new URL(link)
          return `${baseUrl.protocol}//${baseUrl.hostname}/${img}`
        }
        return img
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .filter(img => {
      try {
        const imgUrl = new URL(img)
        return TRUSTED_IMAGE_DOMAINS.some(domain => 
          imgUrl.hostname.includes(domain)
        )
      } catch {
        return false
      }
    })
    .filter(img => IMAGE_PATTERNS.some(pattern => pattern.test(img)))
  
  // Return the first valid image URL directly (no optimization)
  return validImages.length > 0 ? validImages[0] : null
}

// SEO-friendly HTML template for server-side rendering
function generateSEOHTML(feeds, category = 'all', searchQuery = '') {
  const categoryInfo = category !== 'all' 
    ? CATEGORIES.find(cat => cat.id === category) 
    : { label: 'All News', id: 'all' }
  
  // Generate dynamic metadata based on feeds
  const uniqueSources = [...new Set(feeds.map(feed => feed.source))]
  const popularCategories = [...new Set(feeds.slice(0, 10).map(feed => feed.category))]
  
  let title = 'Harare Metro - Zimbabwe News Aggregator'
  let description = 'Stay informed with the latest news from Zimbabwe. '
  let keywords = [
    'Zimbabwe news', 'Harare news', 'Zimbabwe politics', 'Zimbabwe economy',
    'Herald Zimbabwe', 'NewsDay', 'Chronicle', 'ZBC News', 'Techzim',
    'Zimbabwe breaking news', 'Zimbabwe latest news', 'Zimbabwe today',
    'Zimbabwe headlines', 'Zim news', 'Zimbabwean news'
  ]

  if (category !== 'all') {
    title = `${categoryInfo.label} News - Harare Metro`
    description += `Latest ${categoryInfo.label.toLowerCase()} news from Zimbabwe. `
    keywords.unshift(`Zimbabwe ${categoryInfo.label.toLowerCase()}`)
  }

  if (searchQuery) {
    title = `"${searchQuery}" - Search Results | Harare Metro`
    description += `Search results for "${searchQuery}". `
    keywords.unshift(searchQuery)
  }

  // Add dynamic keywords based on actual content
  const contentKeywords = feeds.slice(0, 5)
    .map(feed => feed.title.split(' '))
    .flat()
    .filter(word => word.length > 4)
    .slice(0, 10)
  
  keywords.push(...contentKeywords)
  const keywordsString = keywords.join(', ')
  const canonicalUrl = `https://www.hararemetro.co.zw${category !== 'all' ? `/?category=${category}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`

  // Generate structured data for SEO
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Harare Metro",
    "description": "Zimbabwe News Aggregator - Real-time news from trusted local sources",
    "url": "https://www.hararemetro.co.zw",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.hararemetro.co.zw/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Harare Metro",
      "url": "https://www.hararemetro.co.zw",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.hararemetro.co.zw/logo.png",
        "width": 512,
        "height": 512
      }
    }
  }

  const newsArticles = feeds.slice(0, 5).map(article => ({
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.description || "",
    "datePublished": article.pubDate,
    "author": {
      "@type": "Organization",
      "name": article.source
    },
    "publisher": {
      "@type": "Organization",
      "name": article.source
    },
    "url": article.link,
    "articleSection": article.category,
    ...(article.imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": article.imageUrl
      }
    })
  }))

  const newsListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest Zimbabwe News",
    "itemListElement": newsArticles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": article
    }))
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${keywordsString}" />
  <meta name="author" content="Nyuchi Web Services" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="googlebot" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="https://www.hararemetro.co.zw/og-image.png" />
  <meta property="og:site_name" content="Harare Metro" />
  <meta property="og:locale" content="en_ZW" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${canonicalUrl}" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="https://www.hararemetro.co.zw/twitter-image.png" />
  <meta property="twitter:site" content="@hararemetro" />
  
  <!-- Geo Tags -->
  <meta name="geo.region" content="ZW" />
  <meta name="geo.placename" content="Harare" />
  <meta name="geo.position" content="-17.8292;31.0522" />
  <meta name="ICBM" content="-17.8292, 31.0522" />
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#059669" />
  <meta name="msapplication-TileColor" content="#059669" />
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(websiteStructuredData)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(newsListStructuredData)}
  </script>
  
  <!-- Preconnect to improve performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  
  <style>
    body { font-family: Georgia, 'Times New Roman', Times, serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header h1 { margin: 0; color: #111827; }
    .header p { margin: 10px 0 0 0; color: #6b7280; }
    .stats { display: flex; gap: 20px; margin-top: 15px; }
    .stat { font-size: 14px; color: #374151; }
    .article { background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .article h2 { margin: 0 0 10px 0; color: #111827; font-size: 20px; }
    .article-meta { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
    .article-description { color: #374151; line-height: 1.6; margin-bottom: 10px; }
    .article-footer { display: flex; justify-content: space-between; align-items: center; }
    .category { background: #f3f4f6; padding: 4px 12px; border-radius: 12px; font-size: 12px; color: #374151; }
    .read-more { color: #059669; text-decoration: none; font-weight: 500; }
    .priority { background: linear-gradient(to right, #10b981, #fbbf24); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px; }
    .article-image { width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
    @media (max-width: 640px) { 
      body { padding: 10px; }
      .stats { flex-direction: column; gap: 10px; }
      .article-image { max-width: 100%; height: 150px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Harare Metro - Zimbabwe News Aggregator</h1>
      <p>${description}</p>
      <div class="stats">
        <span class="stat">📰 ${feeds.length} Articles</span>
        <span class="stat">⭐ ${feeds.filter(f => f.priority).length} Priority</span>
        <span class="stat">📁 ${new Set(feeds.map(f => f.category)).size} Categories</span>
        <span class="stat">📡 ${uniqueSources.length} Sources</span>
      </div>
    </div>
    
    <noscript>
      <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e;">
          JavaScript is disabled. You're viewing a basic version of Harare Metro. 
          Enable JavaScript for the full interactive experience with real-time updates, 
          search, and filtering capabilities.
        </p>
      </div>
    </noscript>
    
    ${feeds.slice(0, 10).map(article => `
      <article class="article">
        <div class="article-meta">
          <strong>${article.source}</strong> • ${new Date(article.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <h2>
          ${article.title}
          ${article.priority ? '<span class="priority">🇿🇼 Priority</span>' : ''}
        </h2>
        ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" class="article-image" loading="lazy" />` : ''}
        ${article.description ? `<p class="article-description">${article.description}</p>` : ''}
        <div class="article-footer">
          <span class="category">${article.category}</span>
          <a href="${article.link}" class="read-more" target="_blank" rel="noopener noreferrer">
            Read Full Article →
          </a>
        </div>
      </article>
    `).join('')}
    
    <div style="text-align: center; margin-top: 40px; color: #6b7280;">
      <p>Showing latest 10 articles. Enable JavaScript to view all ${feeds.length} articles with filtering and search.</p>
      <p style="margin-top: 20px;">
        Made with ❤️ for Zimbabwe by 
        <a href="https://www.nyuchi.com" style="color: #059669;" target="_blank" rel="noopener noreferrer">
          Nyuchi Web Services
        </a>
      </p>
    </div>
  </div>
  
  <!-- Load React app -->
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`
}

// Enhanced fallback HTML for when the app fails to load
function getEnhancedFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Harare Metro - Zimbabwe News Aggregator</title>
      <meta name="description" content="Stay informed with the latest news from Zimbabwe. Real-time aggregation from trusted local sources." />
      <style>
        body { 
          font-family: Georgia, 'Times New Roman', serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          line-height: 1.4;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
        .loading { text-align: center; color: white; font-size: 1rem; padding: 2rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loading">📡 Loading Harare Metro with enhanced image support...</div>
      </div>

      <script>
        // Load news and display
        async function loadNews() {
          try {
            const response = await fetch('/api/feeds?limit=6');
            const feeds = await response.json();
            
            console.log('Loaded feeds with images:', feeds.filter(f => f.imageUrl).length);
          } catch (error) {
            console.error('Error:', error);
          }
        }

        // Load news on page load
        loadNews();
      </script>
    </body>
</html>`
}

// Bot detection function
function isBot(userAgent) {
  if (!userAgent) return false
  
  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot',
    'linkedinbot', 'embedly', 'quora', 'showyoubot', 'outbrain',
    'pinterest', 'developers.google.com/+/web/snippet',
    'slackbot', 'vkshare', 'w3c_validator', 'redditbot',
    'applebot', 'whatsapp', 'flipboard', 'tumblr', 'bitlybot',
    'skypeuripreview', 'nuzzel', 'discordbot', 'google-structured-data',
    'lighthouse', 'chrome-lighthouse'
  ]
  
  return botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )
}

// Main Cloudflare Worker export
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const userAgent = request.headers.get('User-Agent') || ''
    
    console.log('Request:', url.pathname, 'User-Agent:', userAgent)
    
    try {
      // Handle API routes first (highest priority)
      if (url.pathname.startsWith('/api/')) {
        console.log('Handling API request:', url.pathname)
        return await handleApiRequest(request, env, ctx)
      }

      // Handle static assets with caching
      if (url.pathname.startsWith('/assets/') || url.pathname.includes('.')) {
        try {
          const response = await getAssetFromKV({
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          }, {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
          })
          
          // Add cache headers for assets
          const newResponse = new Response(response.body, response)
          newResponse.headers.set('Cache-Control', 'public, max-age=31536000')
          return newResponse
        } catch (e) {
          console.log('Asset not found:', url.pathname)
        }
      }

      // SEO: Check if request is from a bot or social media crawler
      const isFromBot = isBot(userAgent)
      
      if (isFromBot) {
        console.log('Bot detected, serving SSR HTML')
        
        // Get feeds for SEO content
        const feedsResponse = await handleApiRequest(
          new Request(new URL('/api/feeds?limit=20', request.url)),
          env,
          ctx
        )
        
        if (feedsResponse.ok) {
          const feeds = await feedsResponse.json()
          const category = url.searchParams.get('category') || 'all'
          const search = url.searchParams.get('search') || ''
          
          return new Response(generateSEOHTML(feeds, category, search), {
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=300' // 5 minutes for bots
            }
          })
        }
      }

      // Try to serve React app
      try {
        return await getAssetFromKV({
          request: new Request(new URL('/index.html', request.url)),
          waitUntil: ctx.waitUntil.bind(ctx),
        }, {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        })
      } catch (e) {
        console.log('React app not available, serving fallback')
        return new Response(getEnhancedFallbackHTML(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        })
      }

    } catch (error) {
      console.error('Worker error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

// API request handler
async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Route API requests
  if (url.pathname === '/api/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      sources: RSS_SOURCES.filter(s => s.enabled).length,
      totalSources: RSS_SOURCES.length,
      categories: Object.keys(CATEGORY_KEYWORDS).length,
      message: 'Harare Metro API is healthy with image support!',
      features: ['enhanced-categorization', 'priority-detection', 'zimbabwe-focus', 'image-extraction', 'seo-optimized'],
      documentation: {
        schema: '/api/schema',
        swagger: 'https://petstore.swagger.io/?url=' + encodeURIComponent(request.url.replace('/api/health', '/api/schema'))
      }
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    })
  }

  if (url.pathname === '/api/feeds') {
    return await getAllFeeds(request, env, corsHeaders)
  }

  if (url.pathname === '/api/feeds/sources') {
    return new Response(JSON.stringify({
      sources: RSS_SOURCES,
      enabled: RSS_SOURCES.filter(s => s.enabled),
      disabled: RSS_SOURCES.filter(s => !s.enabled)
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  if (url.pathname === '/api/categories') {
    return new Response(JSON.stringify({
      categories: CATEGORIES,
      keywords: CATEGORY_KEYWORDS
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  if (url.pathname === '/api/schema') {
    return await serveApiSchema(request, corsHeaders)
  }

  return new Response('API endpoint not found', { 
    status: 404,
    headers: corsHeaders
  })
}

async function getAllFeeds(request, env, corsHeaders) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams.entries())
  
  // Validate request parameters
  const validationErrors = validateRequest(params, VALIDATION_SCHEMAS.feeds)
  if (validationErrors.length > 0) {
    return new Response(JSON.stringify({
      error: 'Invalid request parameters',
      validationErrors: validationErrors
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  const allFeeds = []
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: 'text'
  })

  const enabledSources = RSS_SOURCES.filter(source => source.enabled)
  
  await Promise.allSettled(
    enabledSources.map(async (source) => {
      try {
        console.log(`Fetching from ${source.name}: ${source.url}`)
        
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Harare Metro News Aggregator/2.0 (Zimbabwe)',
            'Accept': 'application/rss+xml, application/xml, text/xml'
          },
          cf: {
            cacheTtl: 300, // 5 minutes
            cacheEverything: true
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const xmlText = await response.text()
        const feedData = parser.parse(xmlText)
        
        const items = feedData?.rss?.channel?.item || 
                     feedData?.feed?.entry || 
                     feedData?.channel?.item || 
                     []

        if (!Array.isArray(items)) {
          console.log(`No items found for ${source.name}`)
          return
        }

        const processedItems = items
          .slice(0, 20) // Limit items per source
          .map(item => {
            const title = item.title?.text || item.title || 'No title'
            const description = cleanHtml(item.description?.text || item.description || item.summary?.text || item.summary || '')
            const content = `${title} ${description}`.toLowerCase()
            const link = item.link?.text || item.link || item.id || '#'
            
            // Extract image from content
            const rawContent = item.description || item.content || item.summary || ''
            const extractedImage = extractImageFromContent(
              rawContent, 
              link, 
              item.enclosure, 
              item['media:content']
            )
            
            const detectedCategory = detectCategory(content) || source.category
            const isPriority = PRIORITY_KEYWORDS.some(keyword => 
              content.includes(keyword.toLowerCase())
            )
            const relevanceScore = calculateRelevanceScore(content, title)

            return {
              title: title,
              description: description,
              link: link,
              pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
              source: source.name,
              category: detectedCategory,
              priority: isPriority,
              relevanceScore: relevanceScore,
              guid: item.guid?.text || item.guid || item.id || `${source.name}-${Date.now()}-${Math.random()}`,
              imageUrl: extractedImage,
              // Add optimizedImageUrl that just points to the original image (no actual optimization)
              optimizedImageUrl: extractedImage
            }
          })
          .filter(item => item.title !== 'No title')

        allFeeds.push(...processedItems)
        console.log(`Successfully processed ${processedItems.length} items from ${source.name}`)
        if (processedItems.length > 0) {
          const withImages = processedItems.filter(item => item.imageUrl)
          console.log(`  - ${withImages.length} items have images`)
          if (withImages.length > 0) {
            console.log(`  - Sample image: ${withImages[0].imageUrl}`)
            console.log(`  - Sample item:`, JSON.stringify(withImages[0], null, 2))
          }
        }
        if (processedItems.length > 0) {
          const withImages = processedItems.filter(item => item.imageUrl)
          console.log(`  - ${withImages.length} items have images`)
          if (withImages.length > 0) {
            console.log(`  - Sample image: ${withImages[0].imageUrl}`)
          }
        }

      } catch (error) {
        console.error(`Error processing ${source.name}:`, error.message)
      }
    })
  )

  // Sort and filter feeds
  let sortedFeeds = allFeeds
    .sort((a, b) => {
      // Prioritize Zimbabwe-relevant content
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      // Then by relevance score
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      // Finally by date
      return new Date(b.pubDate) - new Date(a.pubDate)
    })

  // Apply filters
  const category = params.category
  if (category && category !== 'all') {
    sortedFeeds = sortedFeeds.filter(feed => feed.category === category)
  }

  const priority = params.priority
  if (priority === 'true') {
    sortedFeeds = sortedFeeds.filter(feed => feed.priority)
  }

  // Apply limit
  const limit = parseInt(params.limit) || 50
  sortedFeeds = sortedFeeds.slice(0, limit)

  return new Response(JSON.stringify(sortedFeeds), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // 5 minutes
    }
  })
}

// Enhanced validation function
function validateRequest(params, schema) {
  const errors = []
  
  for (const [key, value] of Object.entries(params)) {
    if (schema[key]) {
      const fieldSchema = schema[key]
      
      // Type validation
      if (fieldSchema.type === 'integer') {
        const intValue = parseInt(value)
        if (isNaN(intValue)) {
          errors.push({
            field: key,
            message: `Expected integer, got: ${value}`,
            value: value
          })
          continue
        }
        
        // Range validation
        if (fieldSchema.minimum !== undefined && intValue < fieldSchema.minimum) {
          errors.push({
            field: key,
            message: `Value must be >= ${fieldSchema.minimum}`,
            value: intValue
          })
        }
        if (fieldSchema.maximum !== undefined && intValue > fieldSchema.maximum) {
          errors.push({
            field: key,
            message: `Value must be <= ${fieldSchema.maximum}`,
            value: intValue
          })
        }
      }
      
      // Enum validation
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push({
          field: key,
          message: `Invalid value. Allowed values: ${fieldSchema.enum.join(', ')}`,
          value: value
        })
      }
      
      // Boolean validation
      if (fieldSchema.type === 'boolean') {
        if (value !== 'true' && value !== 'false') {
          errors.push({
            field: key,
            message: `Expected boolean (true/false), got: ${value}`,
            value: value
          })
        }
      }
    }
  }
  
  return errors
}

async function serveApiSchema(request, corsHeaders) {
  const accept = request.headers.get('Accept') || ''
  
  // Serve YAML schema content
  const yamlSchema = `openapi: 3.0.3
info:
  title: Harare Metro News API
  description: |
    Zimbabwe News Aggregation API with original image extraction.
    
    Features:
    - Real-time RSS feed aggregation
    - Enhanced categorization with Zimbabwe-specific keywords
    - Priority detection for Zimbabwe-relevant content
    - Original image extraction (no optimization)
    - Multiple news sources from Herald, NewsDay, Chronicle, ZBC, and more
  version: 2.0.0
  contact:
    name: Nyuchi Web Services
    url: https://www.nyuchi.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: ${new URL(request.url).origin}/api
    description: Current server

paths:
  /health:
    get:
      summary: Health check endpoint
      tags: [System]
      responses:
        '200':
          description: API is healthy

  /feeds:
    get:
      summary: Get all news feeds with original images
      tags: [News]
      parameters:
        - name: category
          in: query
          required: false
          schema:
            type: string
            enum: [politics, economy, business, sports, harare, agriculture, technology, health, education, entertainment, environment, crime, international, lifestyle, finance, general]
      responses:
        '200':
          description: Successfully retrieved news feeds
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    title:
                      type: string
                    description:
                      type: string
                    link:
                      type: string
                    imageUrl:
                      type: string
                      description: Original image URL from source
                    source:
                      type: string
                    category:
                      type: string
                    priority:
                      type: boolean

tags:
  - name: News
    description: News aggregation endpoints
  - name: System
    description: System health endpoints`

  if (accept.includes('application/json')) {
    return new Response(JSON.stringify({
      message: 'Schema available in YAML format',
      swagger_ui: 'https://petstore.swagger.io/?url=' + encodeURIComponent(new URL(request.url).href),
      yaml_endpoint: new URL(request.url).href
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  return new Response(yamlSchema, {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/yaml',
      'Cache-Control': 'public, max-age=3600'
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

function calculateRelevanceScore(content, title) {
  let score = 0
  
  // Higher score for Zimbabwe-specific content
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      score += title.toLowerCase().includes(keyword.toLowerCase()) ? 3 : 1
    }
  })

  return Math.min(score, 10) // Cap at 10
}

function cleanHtml(html) {
  if (!html) return ''
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300) // Limit description length
}