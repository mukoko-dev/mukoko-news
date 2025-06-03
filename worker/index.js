// Enhanced Worker with SSR support for SEO
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
    enabled: true // Set to true when ready
  },
  {
    name: 'Zimbabwe Independent',
    url: 'https://www.theindependent.co.zw/feed/',
    category: 'general',
    enabled: false // Set to true when ready
  },
  { name: 'NewZimbabwe', url: 'https://www.newzimbabwe.com/feed/', category: 'general', enabled: true },
  { name: 'The Sunday Mail', url: 'https://www.sundaymail.co.zw/feed/', category: 'general', enabled: true },
  { name: '263Chat', url: 'https://www.263chat.com/feed/', category: 'general', enabled: true },
  { name: 'iHarare', url: 'https://iharare.com/feed/', category: 'general', enabled: false },
  { name: 'Bulawayo24', url: 'https://bulawayo24.com/feeds-rss-rss.rss', category: 'general', enabled: true },
  { name: 'Zimbabwe Situation', url: 'https://www.zimbabwesituation.com/feed/', category: 'general', enabled: false },
  { name: 'ZW News', url: 'https://zwnews.com/feed/', category: 'general', enabled: true },
  { name: 'My Zimbabwe', url: 'https://www.myzimbabwe.co.zw/feed/', category: 'general', enabled: true },
  { name: 'NewsDzeZimbabwe', url: 'https://www.newsdzezimbabwe.co.uk/feeds/posts/default?alt=rss', category: 'general', enabled: false },
  { name: 'Daily News', url: 'https://dailynews.co.zw/feed/', category: 'general', enabled: true },
  { name: 'ZimEye', url: 'https://www.zimeye.net/feed/', category: 'general', enabled: true },
  { name: 'Zim Morning Post', url: 'https://zimmorningpost.com/feed/', category: 'general', enabled: true },
  { name: 'Mbare Times', url: 'https://mbaretimes.com/feed/', category: 'general', enabled: false },
  { name: 'Nehanda Radio', url: 'https://nehandaradio.com/feed/', category: 'general', enabled: false },
  { name: 'Pindula News', url: 'https://news.pindula.co.zw/feed/', category: 'general', enabled: false }
]

// Validation schemas for request parameters
const VALIDATION_SCHEMAS = {
  feeds: {
    category: {
      type: 'string',
      enum: ['politics', 'economy', 'business', 'sports', 'harare', 'agriculture', 
             'technology', 'health', 'education', 'entertainment', 'environment', 
             'crime', 'international', 'lifestyle', 'finance', 'general']
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

// Define CATEGORIES constant for SSR
const CATEGORIES = [
  { id: 'all', label: 'All News', icon: '📰', primary: true },
  { id: 'politics', label: 'Politics', icon: '🏛️', primary: true },
  { id: 'economy', label: 'Economy', icon: '💰', primary: true },
  { id: 'business', label: 'Business', icon: '💼', primary: true },
  { id: 'sports', label: 'Sports', icon: '⚽', primary: true },
  { id: 'harare', label: 'Harare', icon: '🏙️', primary: true },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾', primary: true },
  { id: 'technology', label: 'Technology', icon: '💻', primary: false },
  { id: 'health', label: 'Health', icon: '🏥', primary: false },
  { id: 'education', label: 'Education', icon: '🎓', primary: false },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭', primary: false },
  { id: 'environment', label: 'Environment', icon: '🌍', primary: false },
  { id: 'crime', label: 'Crime', icon: '🚔', primary: false },
  { id: 'international', label: 'International', icon: '🌐', primary: false },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨', primary: false },
  { id: 'finance', label: 'Finance', icon: '💳', primary: false }
]

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
    // General Zimbabwe terms
    'Zimbabwe news',
    'Harare news',
    'Bulawayo news',
    'Zimbabwe politics',
    'Zimbabwe economy',
    'Zimbabwe business',
    'Zimbabwe sports',
    'Zimbabwe technology',
    
    // Major news sources
    'Herald Zimbabwe',
    'NewsDay Zimbabwe',
    'Chronicle Zimbabwe',
    'ZBC News',
    'Business Weekly Zimbabwe',
    'Techzim',
    'The Standard Zimbabwe',
    'ZimLive',
    'NewZimbabwe',
    'The Sunday Mail',
    '263Chat',
    'iHarare',
    'Bulawayo24',
    'Zimbabwe Situation',
    'ZW News',
    'My Zimbabwe',
    'NewsDzeZimbabwe',
    'Daily News Zimbabwe',
    'ZimEye',
    'Zim Morning Post',
    'Mbare Times',
    'Nehanda Radio',
    'Pindula News',
    
    // Additional relevant terms
    'Zimbabwe breaking news',
    'Zimbabwe latest news',
    'Zimbabwe today',
    'Zimbabwe headlines',
    'Zimbabwe news today',
    'Zim news',
    'Zimbabwean news',
    'news Zimbabwe',
    'Zimbabwe news online',
    'Zimbabwe news live',
    'Zimbabwe news 24/7',
    'Zimbabwe independent news',
    'Zimbabwe diaspora news',
    'Zimbabwe entertainment news',
    'Zimbabwe financial news'
  ]

  if (category !== 'all') {
    title = `${categoryInfo.label} News Zimbabwe | Harare Metro`
    description = `Latest ${categoryInfo.label.toLowerCase()} news and updates from Zimbabwe. `
    keywords.unshift(`Zimbabwe ${categoryInfo.label.toLowerCase()}`)
    keywords.unshift(`${categoryInfo.label} news Zimbabwe`)
  }

  if (searchQuery) {
    title = `Search: ${searchQuery} | Harare Metro`
    description = `Search results for "${searchQuery}" in Zimbabwe news. `
  }

  description += `Real-time aggregation from ${uniqueSources.slice(0, 3).join(', ')} and more trusted local sources.`
  
  // Add sources and categories to keywords
  keywords.push(...uniqueSources)
  popularCategories.forEach(cat => {
    if (cat !== 'general') {
      keywords.push(`Zimbabwe ${cat}`)
    }
  })

  const keywordsString = keywords.join(', ')
  const canonicalUrl = `https://www.hararemetro.co.zw${category !== 'all' ? `/?category=${category}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`

  // Generate structured data
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
      "alternateName": "HM News",
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
    "articleSection": article.category
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
    @media (max-width: 640px) { 
      body { padding: 10px; }
      .stats { flex-direction: column; gap: 10px; }
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

// Check if request is from a bot/crawler
function isBot(userAgent) {
  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegram', 'slack', 'discord', 'pinterest', 'applebot',
    'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot'
  ]
  
  const ua = userAgent.toLowerCase()
  return botPatterns.some(bot => ua.includes(bot))
}

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

      // For bots and crawlers, or when specifically requested, serve SSR version
      if (isBot(userAgent) || url.searchParams.get('_escaped_fragment_') !== null) {
        console.log('Bot detected, serving SSR version')
        
        try {
          // Get feeds for SSR
          const category = url.searchParams.get('category') || 'all'
          const searchQuery = url.searchParams.get('search') || ''
          
          // Fetch feeds from KV storage or API
          let feeds = []
          try {
            const cachedFeeds = await env.NEWS_STORAGE.get('cached_feeds')
            if (cachedFeeds) {
              feeds = JSON.parse(cachedFeeds)
            }
          } catch (e) {
            console.error('Failed to get cached feeds:', e)
          }
          
          // Filter feeds based on category and search
          if (category !== 'all') {
            feeds = feeds.filter(feed => feed.category === category)
          }
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            feeds = feeds.filter(feed => 
              feed.title.toLowerCase().includes(query) ||
              feed.description?.toLowerCase().includes(query) ||
              feed.source.toLowerCase().includes(query)
            )
          }
          
          // Generate SSR HTML
          const html = generateSEOHTML(feeds, category, searchQuery)
          
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
              'X-Robots-Tag': 'index, follow'
            }
          })
        } catch (error) {
          console.error('SSR Error:', error)
          // Fall back to regular SPA if SSR fails
        }
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
        
        // Enhanced fallback HTML with documentation links
        return new Response(getEnhancedFallbackHTML(), {
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
          features: ['enhanced-categorization', 'priority-detection', 'zimbabwe-focus', 'global-categories', 'api-validation', 'ssr-seo'],
          documentation: {
            schema: '/api/schema',
            swagger: 'https://petstore.swagger.io/?url=' + encodeURIComponent(request.url.replace('/api/health', '/api/schema'))
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case '/schema':
        return await serveApiSchema(request, corsHeaders)

      case '/feeds/sources':
        return new Response(JSON.stringify(RSS_SOURCES), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      
      case '/feeds':
        return await getAllFeeds(request, env, corsHeaders)

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
      
      default:
        return new Response(JSON.stringify({ 
          error: 'Endpoint not found',
          available: ['/health', '/schema', '/feeds/sources', '/feeds', '/feeds/cached', '/categories'],
          documentation: '/api/schema'
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

async function serveApiSchema(request, corsHeaders) {
  const accept = request.headers.get('Accept') || ''
  
  // Serve YAML schema content
  const yamlSchema = `openapi: 3.0.3
info:
  title: Harare Metro News API
  description: |
    Zimbabwe News Aggregation API that fetches and categorizes news from multiple local sources.
    
    Features:
    - Real-time RSS feed aggregation
    - Enhanced categorization with Zimbabwe-specific keywords
    - Priority detection for Zimbabwe-relevant content
    - Multiple news sources from Herald, NewsDay, Chronicle, ZBC, and more
    - Request validation and API documentation
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
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, error]
                  timestamp:
                    type: string
                    format: date-time
                  sources:
                    type: integer
                  totalSources:
                    type: integer
                  categories:
                    type: integer
                  message:
                    type: string
                  features:
                    type: array
                    items:
                      type: string

  /feeds:
    get:
      summary: Get all news feeds
      tags: [News]
      parameters:
        - name: category
          in: query
          required: false
          schema:
            type: string
            enum: [politics, economy, business, sports, harare, agriculture, technology, health, education, entertainment, environment, crime, international, lifestyle, finance, general]
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 50
        - name: priority
          in: query
          required: false
          schema:
            type: boolean
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
                      format: uri
                    pubDate:
                      type: string
                      format: date-time
                    source:
                      type: string
                    category:
                      type: string
                    priority:
                      type: boolean
                    relevanceScore:
                      type: number
                    guid:
                      type: string
        '400':
          description: Invalid request parameters

  /feeds/sources:
    get:
      summary: Get RSS sources configuration
      tags: [Configuration]
      responses:
        '200':
          description: RSS sources list

  /categories:
    get:
      summary: Get categorization configuration
      tags: [Configuration]
      responses:
        '200':
          description: Categorization data

  /schema:
    get:
      summary: Get OpenAPI schema
      tags: [Documentation]
      responses:
        '200':
          description: API schema

tags:
  - name: News
    description: News aggregation endpoints
  - name: Configuration
    description: API configuration endpoints
  - name: System
    description: System health endpoints
  - name: Documentation
    description: API documentation endpoints

externalDocs:
  description: View in Swagger UI
  url: https://petstore.swagger.io/?url=${encodeURIComponent(new URL(request.url).href)}`

  if (accept.includes('application/json')) {
    // Convert YAML to JSON (simplified)
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
          const content = `${title} ${description}`.toLowerCase()
          
          const detectedCategory = detectCategory(content) || source.category
          const isPriority = PRIORITY_KEYWORDS.some(keyword => 
            content.includes(keyword.toLowerCase())
          )
          const relevanceScore = calculateRelevanceScore(content)
          
          return {
            title: title,
            description: description,
            link: item.link?.text || item.link || item.id || '#',
            pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
            source: source.name,
            category: detectedCategory,
            priority: isPriority,
            relevanceScore: relevanceScore,
            guid: item.guid?.text || item.guid || item.id || `${source.name}-${Date.now()}-${Math.random()}`
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

  // Sort feeds
  allFeeds.sort((a, b) => {
    if (a.priority && !b.priority) return -1
    if (!a.priority && b.priority) return 1
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    return new Date(b.pubDate) - new Date(a.pubDate)
  })

  // Remove duplicates
  const uniqueFeeds = removeDuplicates(allFeeds)
  
  // Apply filters based on validated parameters
  let filteredFeeds = uniqueFeeds
  
  if (params.category) {
    filteredFeeds = filteredFeeds.filter(feed => feed.category === params.category)
  }
  
  if (params.priority !== undefined) {
    const priorityFilter = params.priority === 'true'
    filteredFeeds = filteredFeeds.filter(feed => feed.priority === priorityFilter)
  }
  
  const limit = params.limit ? parseInt(params.limit) : 50
  const limitedFeeds = filteredFeeds.slice(0, limit)

  return new Response(JSON.stringify(limitedFeeds), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600',
      'X-Total-Count': filteredFeeds.length.toString(),
      'X-Returned-Count': limitedFeeds.length.toString()
    }
  })
}

function detectCategory(content) {
  let maxMatches = 0
  let detectedCategory = null
  let categoryScores = {}
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length
    
    categoryScores[category] = matches
    
    if (matches > maxMatches) {
      maxMatches = matches
      detectedCategory = category
    }
  }
  
  const zimbabweCategories = ['politics', 'economy', 'harare', 'agriculture']
  if (maxMatches > 0) {
    for (const zwCategory of zimbabweCategories) {
      if (categoryScores[zwCategory] === maxMatches) {
        detectedCategory = zwCategory
        break
      }
    }
  }
  
  return detectedCategory
}

function calculateRelevanceScore(content) {
  let score = 0
  
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      score += 3
    }
  })
  
  const cities = ['harare', 'bulawayo', 'mutare', 'gweru', 'kwekwe', 'masvingo', 'chitungwiza']
  cities.forEach(city => {
    if (content.includes(city)) {
      score += 2
    }
  })
  
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
    const normalizedTitle = feed.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
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
    
    return await getAllFeeds(new Request('https://example.com/api/feeds'), env, corsHeaders)
  } catch (error) {
    console.error('Cache error:', error)
    return await getAllFeeds(new Request('https://example.com/api/feeds'), env, corsHeaders)
  }
}

async function updateFeeds(env) {
  try {
    console.log('Updating feed cache...')
    const response = await getAllFeeds(new Request('https://example.com/api/feeds'), env, {})
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
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300)
}

function getEnhancedFallbackHTML() {
  return `
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
        .api-docs {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .api-link {
          background: #4299e1;
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .api-link:hover { background: #3182ce; transform: translateY(-1px); }
        .api-link.secondary { background: #e53e3e; }
        .api-link.secondary:hover { background: #c53030; }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 2rem 1rem;
        }
        .api-info {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-radius: 0.75rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .api-info h2 {
          color: #2d3748;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        .api-info p {
          color: #4a5568;
          margin-bottom: 1rem;
        }
        .endpoint-list {
          background: #f7fafc;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        .endpoint {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .endpoint:last-child { border-bottom: none; }
        .endpoint code {
          background: #2d3748;
          color: #e2e8f0;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.85rem;
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: 1rem;
        }
        .loading { 
          text-align: center; 
          color: white;
          font-size: 1rem;
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .header-content { flex-direction: column; text-align: center; }
          .api-docs { flex-wrap: wrap; justify-content: center; }
          .container { padding: 1rem; }
          .api-info { padding: 1.5rem; }
        }
      </style>
    </head>
    <body>
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <span style="font-size: 1.5rem;">🇿🇼</span>
            <div>
              <h1>Harare Metro</h1>
              <p style="color: #718096; font-size: 0.85rem;">Zimbabwe News API</p>
            </div>
          </div>
          <div class="api-docs">
            <a href="/api/schema" class="api-link">📋 API Schema</a>
            <a href="https://petstore.swagger.io/?url=${encodeURIComponent('https://' + 'example.com/api/schema')}" class="api-link secondary" target="_blank">📖 Swagger UI</a>
          </div>
        </div>
      </header>

      <div class="container">
        <div class="api-info">
          <h2>🚀 Harare Metro News API</h2>
          <p>
            Welcome to the Harare Metro News API! This API aggregates news from multiple Zimbabwe sources
            and provides intelligent categorization with enhanced validation.
          </p>
          
          <div class="endpoint-list">
            <h3 style="margin-bottom: 1rem; color: #2d3748;">Available Endpoints:</h3>
            <div class="endpoint">
              <span><strong>Health Check:</strong> API status and info</span>
              <code>GET /api/health</code>
            </div>
            <div class="endpoint">
              <span><strong>News Feeds:</strong> Get latest articles</span>
              <code>GET /api/feeds</code>
            </div>
            <div class="endpoint">
              <span><strong>RSS Sources:</strong> Get configured sources</span>
              <code>GET /api/feeds/sources</code>
            </div>
            <div class="endpoint">
              <span><strong>Categories:</strong> Get categorization data</span>
              <code>GET /api/categories</code>
            </div>
            <div class="endpoint">
              <span><strong>API Schema:</strong> OpenAPI 3.0 specification</span>
              <code>GET /api/schema</code>
            </div>
          </div>
          
          <p style="margin-top: 1rem;">
            <strong>✨ New Features:</strong> Request validation, enhanced error messages, 
            and comprehensive API documentation with Swagger UI integration.
          </p>
        </div>
        
        <div id="news-container" class="news-grid">
          <div class="loading">📡 Loading latest Zimbabwe news...</div>
        </div>
      </div>

      <script>
        // Load news and display
        async function loadNews() {
          try {
            const response = await fetch('/api/feeds?limit=12');
            if (!response.ok) throw new Error('Failed to load news');
            
            const feeds = await response.json();
            
            const container = document.getElementById('news-container');
            if (feeds.length === 0) {
              container.innerHTML = '<div class="loading">No news articles available.</div>';
              return;
            }
            
            container.innerHTML = feeds.map(article => \`
              <div style="background: rgba(255,255,255,0.95); border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.8rem;">
                  <span style="color: #4299e1; font-weight: 600;">\${article.source}</span>
                  <span style="color: #718096;">\${new Date(article.pubDate).toLocaleDateString()}</span>
                </div>
                <h3 style="margin-bottom: 0.75rem; color: #2d3748; font-size: 1rem; line-height: 1.4;">
                  \${article.title}
                  \${article.priority ? '<span style="background: linear-gradient(45deg, #f093fb, #f5576c); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.5rem;">🇿🇼</span>' : ''}
                </h3>
                \${article.description ? \`<p style="color: #4a5568; font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.75rem;">\${article.description.substring(0, 150)}...</p>\` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="background: #edf2f7; color: #4a5568; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; text-transform: capitalize;">\${article.category}</span>
                  <a href="\${article.link}" target="_blank" style="color: #4299e1; text-decoration: none; font-weight: 600; font-size: 0.85rem;">Read More →</a>
                </div>
              </div>
            \`).join('');
            
          } catch (error) {
            document.getElementById('news-container').innerHTML = 
              \`<div style="color: #f56565; background: rgba(255,255,255,0.9); padding: 1rem; border-radius: 0.5rem;">❌ Error: \${error.message}</div>\`;
          }
        }

        // Load news on page load
        loadNews();
      </script>
    </body>
    </html>
  `
}