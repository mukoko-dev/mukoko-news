// Enhanced Worker with scheduled background fetching
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { XMLParser } from 'fast-xml-parser'

// Cache configuration for scheduled updates
const CACHE_CONFIG = {
  ARTICLES_TTL: 14 * 24 * 60 * 60, // 2 weeks in seconds
  SCHEDULED_REFRESH_INTERVAL: 60 * 60, // 1 hour in seconds
  MAX_ARTICLES: 10000, // Increased article storage
  ITEMS_PER_SOURCE: 50, // More items per source
  CACHE_HEADERS: {
    'Cache-Control': 'public, max-age=300, s-maxage=600', // 5min browser, 10min CDN
    'CDN-Cache-Control': 'max-age=600', // 10 minutes CDN cache
    'Cloudflare-CDN-Cache-Control': 'max-age=600'
  }
}

// Cache keys
const CACHE_KEYS = {
  ALL_ARTICLES: 'cache:all_articles',
  LAST_REFRESH: 'cache:last_refresh',
  ARTICLE_COUNT: 'cache:article_count',
  REFRESH_LOCK: 'cache:refresh_lock', // Prevent concurrent refreshes
  LAST_SCHEDULED_RUN: 'cache:last_scheduled_run'
}

// Comprehensive list of trusted image domains for Zimbabwe news sites
const TRUSTED_IMAGE_DOMAINS = [
  // Primary Zimbabwe news sites
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
  'pindula.co.zw',
  'zimbabwesituation.com',
  'nehandaradio.com',
  'opennews.co.zw',
  'fingaz.co.zw',
  'manicapost.co.zw',
  'southerneye.co.zw',
  
  // WordPress and common CMS domains
  'wp.com',
  'wordpress.com',
  'files.wordpress.com',
  'i0.wp.com',
  'i1.wp.com',
  'i2.wp.com',
  'i3.wp.com',
  
  // CDN and image hosting services
  'cloudinary.com',
  'res.cloudinary.com',
  'imgur.com',
  'i.imgur.com',
  'gravatar.com',
  'secure.gravatar.com',
  'amazonaws.com',
  's3.amazonaws.com',
  'cloudfront.net',
  'unsplash.com',
  'images.unsplash.com',
  'pexels.com',
  'images.pexels.com',
  
  // Google services
  'googleusercontent.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'blogger.googleusercontent.com',
  'drive.google.com',
  
  // Social media image domains
  'fbcdn.net',
  'scontent.fhre1-1.fna.fbcdn.net',
  'pbs.twimg.com',
  'abs.twimg.com',
  'instagram.com',
  
  // News agency images
  'ap.org',
  'apnews.com',
  'reuters.com',
  'bbci.co.uk',
  'bbc.co.uk',
  'cnn.com',
  'media.cnn.com',
  
  // African news networks
  'africanews.com',
  'mg.co.za',
  'news24.com',
  'timeslive.co.za',
  'iol.co.za',
  'citizen.co.za',
  
  // Generic domains that might host images
  'photobucket.com',
  'flickr.com',
  'staticflickr.com',
  'wikimedia.org',
  'upload.wikimedia.org'
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
  sports: [
    'sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'dynamos', 
    'caps united', 'highlanders', 'afcon', 'fifa', 'world cup', 'olympics',
    'athletics', 'boxing', 'tennis', 'golf', 'swimming', 'basketball',
    'volleyball', 'netball', 'hockey', 'cycling', 'marathon'
  ],
  harare: [
    'harare', 'capital', 'city council', 'mayor', 'cbd', 'avondale', 'borrowdale', 
    'chitungwiza', 'municipality', 'ward', 'councillor', 'rates', 'water', 'sewer',
    'traffic', 'kombi', 'transport', 'housing', 'residential', 'suburbs'
  ],
  agriculture: [
    'agriculture', 'farming', 'tobacco', 'maize', 'cotton', 'wheat', 'soya',
    'irrigation', 'crop', 'harvest', 'season', 'drought', 'rainfall',
    'fertilizer', 'seed', 'land reform', 'farmer', 'commercial', 'communal'
  ],
  technology: [
    'technology', 'tech', 'digital', 'internet', 'mobile', 'app', 'software',
    'innovation', 'startup', 'fintech', 'blockchain', 'ai', 'data',
    'cybersecurity', 'telecoms', 'econet', 'netone', 'telecel'
  ],
  health: [
    'health', 'hospital', 'medical', 'doctor', 'patient', 'medicine', 'treatment',
    'disease', 'covid', 'vaccination', 'clinic', 'healthcare', 'pharmacy',
    'outbreak', 'epidemic', 'maternal', 'child health', 'malaria', 'hiv', 'aids'
  ],
  education: [
    'education', 'school', 'student', 'teacher', 'university', 'college',
    'examination', 'zimsec', 'results', 'fees', 'scholarship', 'learning',
    'curriculum', 'graduation', 'degree', 'diploma', 'research'
  ],
  entertainment: [
    'entertainment', 'music', 'artist', 'movie', 'film', 'celebrity', 'culture',
    'festival', 'concert', 'award', 'album', 'song', 'dance', 'theatre',
    'comedy', 'fashion', 'beauty', 'lifestyle'
  ],
  environment: [
    'environment', 'climate', 'weather', 'conservation', 'wildlife', 'forest',
    'pollution', 'green', 'renewable', 'solar', 'clean', 'nature',
    'endangered', 'national park', 'tourism', 'safari'
  ],
  crime: [
    'crime', 'police', 'arrest', 'court', 'trial', 'judge', 'sentence', 'prison',
    'theft', 'robbery', 'murder', 'investigation', 'security', 'violence',
    'corruption', 'fraud', 'smuggling', 'drugs'
  ],
  international: [
    'international', 'world', 'global', 'foreign', 'embassy', 'visa', 'travel',
    'tourism', 'export', 'import', 'trade', 'relations', 'diplomatic',
    'african union', 'sadc', 'united nations', 'brexit', 'china', 'uk', 'usa'
  ],
  lifestyle: [
    'lifestyle', 'fashion', 'food', 'recipe', 'home', 'family', 'relationship',
    'wedding', 'travel', 'vacation', 'hobby', 'fitness', 'diet', 'beauty'
  ],
  finance: [
    'finance', 'financial', 'money', 'cash', 'loan', 'credit', 'savings',
    'insurance', 'pension', 'investment', 'portfolio', 'shares', 'dividend',
    'interest', 'mortgage', 'banking', 'microfinance'
  ]
};

// RSS feed sources
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
    name: 'New Zimbabwe',
    url: 'https://www.newzimbabwe.com/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'The Independent',
    url: 'https://www.theindependent.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Sunday Mail',
    url: 'https://www.sundaymail.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: '263Chat',
    url: 'https://263chat.com/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Daily News',
    url: 'https://www.dailynews.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'ZimEye',
    url: 'https://zimeye.net/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Pindula News',
    url: 'https://news.pindula.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Zimbabwe Situation',
    url: 'https://zimbabwesituation.com/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Nehanda Radio',
    url: 'https://nehandaradio.com/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Open News Zimbabwe',
    url: 'https://opennews.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Financial Gazette',
    url: 'https://fingaz.co.zw/feed/',
    category: 'business',
    enabled: true
  },
  {
    name: 'Manica Post',
    url: 'https://manicapost.co.zw/feed/',
    category: 'general',
    enabled: true
  },
  {
    name: 'Southern Eye',
    url: 'https://southerneye.co.zw/feed/',
    category: 'general',
    enabled: true
  }
]

// Function to clean HTML content
function cleanHtml(html) {
  if (!html) return ''
  
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
    .substring(0, 300)
}

// Function to clean text inputs
function cleanText(text) {
  if (!text) return ''
  return text.toString().trim()
}

// Helper function to check if URL is an image
function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  const imageExtensions = /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico|tiff?)(\?.*)?$/i
  const imageParams = /[?&](format|f)=(jpe?g|png|gif|webp|svg|bmp|avif)/i
  
  return imageExtensions.test(url) || imageParams.test(url)
}

// Function to detect category based on content
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

// Function to calculate relevance score for sorting
function calculateRelevanceScore(content, title) {
  let score = 0
  
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      score += title.toLowerCase().includes(keyword.toLowerCase()) ? 3 : 1
    }
  })

  return Math.min(score, 10)
}

// Enhanced but simplified image extraction function
function extractImageFromContent(item, link) {
  // Debug logging (reduced frequency)
  if (Math.random() < 0.1) { // Only log 10% of calls
    console.log(`[DEBUG] Extracting image for: ${item.title || 'Unknown title'}`)
  }

  const imageMatches = []
  
  // 1. RSS Media tags (highest priority)
  try {
    if (item['media:content'] && item['media:content']['@_url']) {
      const mediaUrl = item['media:content']['@_url']
      if (isImageUrl(mediaUrl)) {
        imageMatches.push(mediaUrl)
      }
    }
  } catch (e) {
    console.log('[DEBUG] Error extracting media:content:', e.message)
  }
  
  // 2. RSS Enclosure tags
  try {
    if (item.enclosure && item.enclosure['@_type']?.startsWith('image/') && item.enclosure['@_url']) {
      imageMatches.push(item.enclosure['@_url'])
    }
  } catch (e) {
    console.log('[DEBUG] Error extracting enclosure:', e.message)
  }
  
  // 3. RSS Image tag
  try {
    if (item.image) {
      const imgUrl = typeof item.image === 'string' ? item.image : item.image.url || item.image['@_url']
      if (imgUrl && isImageUrl(imgUrl)) {
        imageMatches.push(imgUrl)
      }
    }
  } catch (e) {
    console.log('[DEBUG] Error extracting RSS image:', e.message)
  }
  
  // 4. WordPress specific fields
  try {
    if (item['wp:featured_image']) {
      imageMatches.push(item['wp:featured_image'])
    }
    
    if (item['wp:attachment_url'] && isImageUrl(item['wp:attachment_url'])) {
      imageMatches.push(item['wp:attachment_url'])
    }
  } catch (e) {
    console.log('[DEBUG] Error extracting WordPress fields:', e.message)
  }
  
  // 5. Content fields to search
  const contentFields = [
    item.description,
    item['content:encoded'],
    item.content,
    item.summary
  ].filter(Boolean)
  
  // 6. Extract from content fields
  contentFields.forEach((content) => {
    try {
      if (typeof content === 'object') {
        content = content.text || content['#text'] || content._ || ''
      }
      
      if (typeof content === 'string' && content.length > 0) {
        // Extract img src attributes
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
        let match
        while ((match = imgRegex.exec(content)) !== null) {
          imageMatches.push(match[1])
        }
        
        // Extract meta og:image
        const metaRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi
        let metaMatch
        while ((metaMatch = metaRegex.exec(content)) !== null) {
          imageMatches.push(metaMatch[1])
        }
        
        // Extract direct image URLs
        const imageUrlRegex = /https?:\/\/[^\s<>"']+\.(?:jpe?g|png|gif|webp|svg|bmp|avif)(?:\?[^\s<>"']*)?/gi
        let urlMatch
        while ((urlMatch = imageUrlRegex.exec(content)) !== null) {
          imageMatches.push(urlMatch[0])
        }
      }
    } catch (e) {
      console.log('[DEBUG] Error processing content field:', e.message)
    }
  })
  
  // 7. Process and validate all found images
  const validImages = imageMatches
    .map(img => {
      try {
        if (!img || typeof img !== 'string') return null
        
        // Clean up the URL
        img = img.trim()
        
        // Remove HTML entities
        img = img.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        
        // Handle relative URLs
        if (img.startsWith('//')) {
          return `https:${img}`
        } else if (img.startsWith('/')) {
          const baseUrl = new URL(link)
          return `${baseUrl.protocol}//${baseUrl.hostname}${img}`
        } else if (!img.startsWith('http')) {
          const baseUrl = new URL(link)
          return `${baseUrl.protocol}//${baseUrl.hostname}/${img.replace(/^\.\//, '')}`
        }
        return img
      } catch (e) {
        return null
      }
    })
    .filter(Boolean)
    .filter(img => {
      try {
        // Validate it's actually an image URL
        if (!isImageUrl(img)) return false
        
        const imgUrl = new URL(img)
        // Check if it's from a trusted domain
        const isTrusted = TRUSTED_IMAGE_DOMAINS.some(domain => 
          imgUrl.hostname.includes(domain) || imgUrl.hostname.endsWith(domain)
        )
        
        return isTrusted
      } catch (e) {
        return false
      }
    })
    .filter((img, index, arr) => arr.indexOf(img) === index) // Remove duplicates
  
  const result = validImages.length > 0 ? validImages[0] : null
  
  if (result && Math.random() < 0.1) {
    console.log(`[DEBUG] Successfully extracted image: ${result}`)
  }
  
  return result
}

// Simple image proxy handler
async function handleImageProxy(request, env) {
  const url = new URL(request.url)
  const imageUrl = url.searchParams.get('url')
  
  if (!imageUrl) {
    return new Response('Missing image URL', { status: 400 })
  }

  try {
    // Validate the image URL is from trusted domains
    const imageUrlObj = new URL(imageUrl)
    const isTrusted = TRUSTED_IMAGE_DOMAINS.some(domain => 
      imageUrlObj.hostname.includes(domain)
    )
    
    if (!isTrusted) {
      return new Response('Untrusted image domain', { status: 403 })
    }

    // Check cache first
    const cacheKey = `image:${imageUrl}`
    const cached = await env.NEWS_STORAGE.get(cacheKey, { type: 'arrayBuffer' })
    
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Fetch original image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': imageUrlObj.origin
      }
    })

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Cache the image for 24 hours
    await env.NEWS_STORAGE.put(cacheKey, imageBuffer, {
      expirationTtl: 86400
    })

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Image proxy error:', error)
    return new Response('Failed to process image', { status: 500 })
  }
}

// Bot detection function
function isBot(userAgent) {
  if (!userAgent) return false
  
  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot',
    'linkedinbot', 'embedly', 'quora', 'showyoubot', 'outbrain',
    'pinterest', 'slackbot', 'vkshare', 'w3c_validator', 'redditbot',
    'applebot', 'whatsapp', 'flipboard', 'tumblr', 'bitlybot'
  ]
  
  return botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )
}

// Background refresh lock management
async function acquireRefreshLock(env) {
  const lockKey = CACHE_KEYS.REFRESH_LOCK
  const lockValue = `lock-${Date.now()}`
  const lockTTL = 30 * 60 // 30 minutes max lock time
  
  try {
    // Try to acquire lock
    await env.NEWS_STORAGE.put(lockKey, lockValue, { 
      expirationTtl: lockTTL,
      metadata: { acquiredAt: new Date().toISOString() }
    })
    
    // Verify we got the lock
    const currentLock = await env.NEWS_STORAGE.get(lockKey)
    return currentLock === lockValue
  } catch (error) {
    console.error('Error acquiring refresh lock:', error)
    return false
  }
}

async function releaseRefreshLock(env) {
  try {
    await env.NEWS_STORAGE.delete(CACHE_KEYS.REFRESH_LOCK)
  } catch (error) {
    console.error('Error releasing refresh lock:', error)
  }
}

// Check if scheduled refresh is needed
async function shouldRunScheduledRefresh(env) {
  try {
    const lastScheduledRun = await env.NEWS_STORAGE.get(CACHE_KEYS.LAST_SCHEDULED_RUN)
    if (!lastScheduledRun) return true

    const lastRunTime = new Date(lastScheduledRun)
    const now = new Date()
    const timeDiff = (now - lastRunTime) / 1000 // seconds

    return timeDiff >= CACHE_CONFIG.SCHEDULED_REFRESH_INTERVAL
  } catch (error) {
    console.error('Error checking scheduled refresh status:', error)
    return true
  }
}

// Background scheduled refresh function
async function runScheduledRefresh(env) {
  console.log('Attempting scheduled refresh...')
  
  // Check if refresh is needed
  const needsRefresh = await shouldRunScheduledRefresh(env)
  if (!needsRefresh) {
    console.log('Scheduled refresh not needed yet')
    return { success: false, reason: 'Not time for refresh' }
  }

  // Try to acquire lock
  const lockAcquired = await acquireRefreshLock(env)
  if (!lockAcquired) {
    console.log('Could not acquire refresh lock, another process may be running')
    return { success: false, reason: 'Lock acquisition failed' }
  }

  try {
    console.log('Starting scheduled background refresh')
    const startTime = Date.now()
    
    // Fetch fresh articles
    const freshArticles = await fetchAllFeedsBackground(env)
    
    // Update last scheduled run timestamp
    await env.NEWS_STORAGE.put(
      CACHE_KEYS.LAST_SCHEDULED_RUN,
      new Date().toISOString(),
      { expirationTtl: CACHE_CONFIG.ARTICLES_TTL }
    )

    const duration = Date.now() - startTime
    console.log(`Scheduled refresh completed in ${duration}ms, fetched ${freshArticles.length} articles`)
    
    return { 
      success: true, 
      articlesCount: freshArticles.length,
      duration: duration,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Scheduled refresh failed:', error)
    return { success: false, reason: error.message }
  } finally {
    // Always release the lock
    await releaseRefreshLock(env)
  }
}

// Background feed fetching (optimized for scheduled runs)
async function fetchAllFeedsBackground(env) {
  console.log('Background feed fetching started')
  
  const allFeeds = []
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: 'text',
    parseAttributeValue: false,
    trimValues: true
  })

  const enabledSources = RSS_SOURCES.filter(source => source.enabled)
  console.log(`Processing ${enabledSources.length} RSS sources in background`)

  // Process feeds in parallel with aggressive timeouts for background processing
  const feedPromises = enabledSources.map(async (source) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout for background

      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Harare Metro News Aggregator/2.0 (Zimbabwe; +https://harare-metro.nyuchi.dev)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        cf: {
          cacheTtl: 60, // Short cache for background fetches
          cacheEverything: false
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const xmlText = await response.text()
      if (!xmlText || xmlText.length < 100) {
        throw new Error('Empty or invalid RSS response')
      }

      const feedData = parser.parse(xmlText)
      
      let items = feedData?.rss?.channel?.item || 
                  feedData?.feed?.entry || 
                  feedData?.channel?.item || 
                  feedData?.rss?.item ||
                  []

      if (!Array.isArray(items)) {
        items = items ? [items] : []
      }

      if (items.length === 0) {
        return []
      }

      const processedItems = items
        .slice(0, CACHE_CONFIG.ITEMS_PER_SOURCE)
        .map(item => processArticleItem(item, source))
        .filter(Boolean)

      return processedItems

    } catch (error) {
      console.error(`Background fetch error for ${source.name}:`, error.message)
      return []
    }
  })

  // Wait for all feeds with a timeout
  const feedResults = await Promise.allSettled(feedPromises)
  
  // Collect successful results
  feedResults.forEach((result, index) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allFeeds.push(...result.value)
    } else if (result.status === 'rejected') {
      console.error(`Background feed ${enabledSources[index].name} failed:`, result.reason)
    }
  })

  console.log(`Background fetch collected: ${allFeeds.length} articles`)

  // Remove duplicates and cache
  const uniqueFeeds = removeDuplicateArticles(allFeeds)
  const cachedArticles = await setCachedArticles(env, uniqueFeeds)
  
  return cachedArticles
}

// Enhanced caching functions
async function getCachedArticles(env) {
  try {
    console.log('Attempting to get cached articles...')
    const cached = await env.NEWS_STORAGE.get(CACHE_KEYS.ALL_ARTICLES, { type: 'json' })
    
    if (cached && Array.isArray(cached)) {
      console.log(`Retrieved ${cached.length} articles from cache`)
      return cached
    } else if (cached) {
      console.log('Cached data exists but is not an array:', typeof cached)
      return []
    } else {
      console.log('No valid cached articles found')
      return []
    }
  } catch (error) {
    console.error('Error retrieving cached articles:', error)
    return []
  }
}

async function setCachedArticles(env, articles) {
  try {
    // Sort by date (newest first) and limit to MAX_ARTICLES
    const sortedArticles = articles
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, CACHE_CONFIG.MAX_ARTICLES)

    await env.NEWS_STORAGE.put(
      CACHE_KEYS.ALL_ARTICLES, 
      JSON.stringify(sortedArticles),
      { expirationTtl: CACHE_CONFIG.ARTICLES_TTL }
    )

    // Update metadata
    await env.NEWS_STORAGE.put(
      CACHE_KEYS.LAST_REFRESH, 
      new Date().toISOString(),
      { expirationTtl: CACHE_CONFIG.ARTICLES_TTL }
    )

    await env.NEWS_STORAGE.put(
      CACHE_KEYS.ARTICLE_COUNT, 
      sortedArticles.length.toString(),
      { expirationTtl: CACHE_CONFIG.ARTICLES_TTL }
    )

    console.log(`Cached ${sortedArticles.length} articles`)
    return sortedArticles
  } catch (error) {
    console.error('Error caching articles:', error)
    return articles
  }
}

// Helper function to process article items
function processArticleItem(item, source) {
  try {
    const title = cleanText(item.title?.text || item.title || '')
    if (!title || title.length < 10) return null

    const description = cleanHtml(
      item.description?.text || 
      item.description || 
      item.summary?.text || 
      item.summary || 
      item['content:encoded'] ||
      ''
    )

    const link = item.link?.text || item.link || item.id || item.guid?.text || item.guid || '#'
    if (link === '#') return null

    const content = `${title} ${description}`.toLowerCase()
    const extractedImage = extractImageFromContent(item, link)
    const detectedCategory = detectCategory(content) || source.category
    const isPriority = PRIORITY_KEYWORDS.some(keyword => 
      content.includes(keyword.toLowerCase())
    )
    const relevanceScore = calculateRelevanceScore(content, title)

    // Parse date with fallback
    let pubDate
    try {
      const dateStr = item.pubDate || item.published || item.updated || item.date
      pubDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()
    } catch {
      pubDate = new Date().toISOString()
    }

    return {
      title,
      description,
      link,
      pubDate,
      source: source.name,
      category: detectedCategory,
      priority: isPriority,
      relevanceScore,
      guid: item.guid?.text || item.guid || item.id || `${source.name}-${Date.now()}-${Math.random()}`,
      imageUrl: extractedImage,
      optimizedImageUrl: extractedImage ? `/api/image-proxy?url=${encodeURIComponent(extractedImage)}` : null,
      wordCount: (title + ' ' + description).split(' ').length,
      processed: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error processing article item:', error)
    return null
  }
}

// Function to remove duplicate articles
function removeDuplicateArticles(articles) {
  const seen = new Set()
  const unique = []

  for (const article of articles) {
    // Create a normalized title for comparison
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!seen.has(normalizedTitle)) {
      seen.add(normalizedTitle)
      unique.push(article)
    }
  }

  return unique
}

// Updated API handlers
async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log(`API Request: ${request.method} ${url.pathname}`)

    if (url.pathname === '/api/health') {
      const lastRefresh = await env.NEWS_STORAGE.get(CACHE_KEYS.LAST_REFRESH)
      const articleCount = await env.NEWS_STORAGE.get(CACHE_KEYS.ARTICLE_COUNT)
      const lastScheduledRun = await env.NEWS_STORAGE.get(CACHE_KEYS.LAST_SCHEDULED_RUN)
      
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        lastRefresh: lastRefresh || 'Never',
        lastScheduledRun: lastScheduledRun || 'Never',
        cachedArticles: parseInt(articleCount) || 0,
        sources: RSS_SOURCES.filter(s => s.enabled).length,
        maxArticles: CACHE_CONFIG.MAX_ARTICLES,
        refreshInterval: `${CACHE_CONFIG.SCHEDULED_REFRESH_INTERVAL / 60} minutes`,
        message: 'Harare Metro API is healthy!'
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...CACHE_CONFIG.CACHE_HEADERS
        }
      })
    }

    if (url.pathname === '/api/feeds') {
      return await handleFeedsRequest(request, env, corsHeaders, ctx)
    }

    // Admin refresh endpoint (for future admin panel)
    if (url.pathname === '/api/admin/refresh') {
      return await handleAdminRefreshRequest(request, env, corsHeaders)
    }

    return new Response(JSON.stringify({
      error: 'API endpoint not found',
      available_endpoints: ['/api/health', '/api/feeds'],
      method: request.method,
      path: url.pathname
    }), { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('API request error:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleFeedsRequest(request, env, corsHeaders, ctx) {
  try {
    console.log('Handling feeds request...')
    
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 100, 1000)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    
    console.log(`Request params: limit=${limit}, category=${category}, search=${search}`)
    
    // Try scheduled refresh in background if needed (non-blocking)
    ctx.waitUntil(runScheduledRefresh(env))
    
    // Always serve from cache for fast response
    let allFeeds = await getCachedArticles(env)
    console.log(`Retrieved ${allFeeds.length} articles from cache`)
    
    // If no cache exists, initialize with fresh data (only on first run)
    if (!allFeeds || allFeeds.length === 0) {
      console.log('No cached articles found, initializing cache')
      try {
        allFeeds = await fetchAllFeedsBackground(env)
        console.log(`Initialized with ${allFeeds.length} fresh articles`)
      } catch (initError) {
        console.error('Failed to initialize cache:', initError)
        // Return empty array rather than undefined
        allFeeds = []
      }
    }

    // Ensure allFeeds is always an array
    if (!Array.isArray(allFeeds)) {
      console.error('allFeeds is not an array:', typeof allFeeds, allFeeds)
      allFeeds = []
    }

    // Filter articles
    let filteredFeeds = allFeeds

    if (category && category !== 'all') {
      filteredFeeds = filteredFeeds.filter(feed => 
        feed && feed.category === category
      )
      console.log(`Filtered to ${filteredFeeds.length} articles for category: ${category}`)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredFeeds = filteredFeeds.filter(feed =>
        feed && (
          (feed.title && feed.title.toLowerCase().includes(searchLower)) ||
          (feed.description && feed.description.toLowerCase().includes(searchLower)) ||
          (feed.source && feed.source.toLowerCase().includes(searchLower))
        )
      )
      console.log(`Filtered to ${filteredFeeds.length} articles for search: ${search}`)
    }

    // Sort by priority and date
    const sortedFeeds = filteredFeeds
      .filter(feed => feed && feed.title) // Ensure valid articles
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority
        if (a.relevanceScore !== b.relevanceScore) return b.relevanceScore - a.relevanceScore
        return new Date(b.pubDate) - new Date(a.pubDate)
      })
      .slice(0, limit)

    // Always return a consistent response structure
    const response = {
      success: true,
      articles: sortedFeeds, // Ensure this is always an array
      meta: {
        total: filteredFeeds.length,
        returned: sortedFeeds.length,
        cached: true,
        lastRefresh: await env.NEWS_STORAGE.get(CACHE_KEYS.LAST_REFRESH) || new Date().toISOString(),
        nextScheduledRefresh: await getNextScheduledRefresh(env),
        categories: [...new Set(allFeeds.filter(f => f && f.category).map(f => f.category))].sort(),
        sources: [...new Set(allFeeds.filter(f => f && f.source).map(f => f.source))].sort()
      }
    }

    console.log(`Returning ${sortedFeeds.length} articles with structure:`, {
      success: response.success,
      articlesCount: response.articles.length,
      articlesType: Array.isArray(response.articles) ? 'array' : typeof response.articles
    })

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        ...CACHE_CONFIG.CACHE_HEADERS
      }
    })

  } catch (error) {
    console.error('Feeds request error:', error)
    console.error('Error stack:', error.stack)
    
    // Return a consistent error structure
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch feeds',
      message: error.message,
      articles: [], // Always provide an empty array
      meta: {
        total: 0,
        returned: 0,
        cached: false,
        lastRefresh: null,
        nextScheduledRefresh: null,
        categories: [],
        sources: []
      },
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Admin-only refresh endpoint (for future admin panel)
async function handleAdminRefreshRequest(request, env, corsHeaders) {
  try {
    // TODO: Add admin authentication when admin panel is implemented
    // For now, this endpoint is disabled
    return new Response(JSON.stringify({ 
      error: 'Admin functionality not yet implemented',
      message: 'This endpoint will be available in the admin panel release'
    }), { 
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Admin refresh request error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to process admin request',
      message: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Helper function to calculate next scheduled refresh time
async function getNextScheduledRefresh(env) {
  try {
    const lastScheduledRun = await env.NEWS_STORAGE.get(CACHE_KEYS.LAST_SCHEDULED_RUN)
    if (!lastScheduledRun) return 'Soon'

    const lastRunTime = new Date(lastScheduledRun)
    const nextRunTime = new Date(lastRunTime.getTime() + (CACHE_CONFIG.SCHEDULED_REFRESH_INTERVAL * 1000))
    
    return nextRunTime.toISOString()
  } catch (error) {
    console.error('Error calculating next refresh time:', error)
    return 'Unknown'
  }
}

// Basic HTML fallback function - SINGLE DECLARATION
function getBasicHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Harare Metro - Zimbabwe News</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .error { color: #dc2626; background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇿🇼 Harare Metro</h1>
        <div class="error">
            <h3>Application Loading...</h3>
            <p>If this message persists, there may be an issue with the application.</p>
        </div>
        <p>Zimbabwe's premier news aggregator - bringing you the latest from trusted local sources.</p>
    </div>
    <div id="root"></div>
</body>
</html>`
}

// Main Cloudflare Worker export
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    try {
      console.log(`Worker request: ${request.method} ${url.pathname}`)

      // Handle image proxy
      if (url.pathname.startsWith('/api/image-proxy')) {
        return await handleImageProxy(request, env)
      }

      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env, ctx)
      }

      // Handle static assets
      if (url.pathname.startsWith('/assets/') || url.pathname.includes('.')) {
        try {
          const response = await getAssetFromKV({
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          }, {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
          })
          
          const newResponse = new Response(response.body, response)
          newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
          return newResponse
        } catch (e) {
          console.log('Asset not found:', url.pathname)
        }
      }

      // Serve React app
      try {
        const response = await getAssetFromKV({
          request: new Request(new URL('/index.html', request.url)),
          waitUntil: ctx.waitUntil.bind(ctx),
        }, {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        })
        
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('Cache-Control', 'public, max-age=3600')
        return newResponse
      } catch (e) {
        console.log('Serving fallback HTML')
        return new Response(getBasicHTML(), {
          headers: { 
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=300'
          }
        })
      }

    } catch (error) {
      console.error('Worker error:', error)
      console.error('Error stack:', error.stack)
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache' 
        }
      })
    }
  },

  // Scheduled event handler for Cloudflare Cron Triggers
  async scheduled(controller, env, ctx) {
    console.log('Scheduled event triggered:', new Date().toISOString())
    
    try {
      const result = await runScheduledRefresh(env)
      console.log('Scheduled refresh result:', result)
    } catch (error) {
      console.error('Scheduled refresh error:', error)
    }
  }
}