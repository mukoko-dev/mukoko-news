// Enhanced Worker with fixed image extraction
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { XMLParser } from 'fast-xml-parser'

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

// Helper function to check if URL is an image
function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  const imageExtensions = /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico|tiff?)(\?.*)?$/i
  const imageParams = /[?&](format|f)=(jpe?g|png|gif|webp|svg|bmp|avif)/i
  
  return imageExtensions.test(url) || imageParams.test(url)
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

// Main Cloudflare Worker export
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const userAgent = request.headers.get('User-Agent') || ''
    
    try {
      // Handle image proxy route
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
          newResponse.headers.set('Cache-Control', 'public, max-age=31536000')
          return newResponse
        } catch (e) {
          console.log('Asset not found:', url.pathname)
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
        return new Response(getBasicHTML(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        })
      }

    } catch (error) {
      console.error('Worker error:', error)
      return new Response(`Internal Server Error: ${error.message}`, { status: 500 })
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

  try {
    // Route API requests
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        sources: RSS_SOURCES.filter(s => s.enabled).length,
        message: 'Harare Metro API is healthy!'
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/feeds') {
      return await getAllFeeds(request, env, corsHeaders)
    }

    return new Response('API endpoint not found', { 
      status: 404,
      headers: corsHeaders
    })
  } catch (error) {
    console.error('API request error:', error)
    return new Response(`API Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

async function getAllFeeds(request, env, corsHeaders) {
  const url = new URL(request.url)
  const allFeeds = []
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: 'text'
  })

  const enabledSources = RSS_SOURCES.filter(source => source.enabled)
  
  console.log(`Processing ${enabledSources.length} RSS sources`)
  
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
            cacheTtl: 300,
            cacheEverything: true
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const xmlText = await response.text()
        const feedData = parser.parse(xmlText)
        
        let items = feedData?.rss?.channel?.item || 
                    feedData?.feed?.entry || 
                    feedData?.channel?.item || 
                    []

        // Ensure items is always an array
        if (!items) {
          items = []
        } else if (!Array.isArray(items)) {
          items = [items] // Single item, make it an array
        }

        if (items.length === 0) {
          console.log(`No items found for ${source.name}`)
          return
        }

        const processedItems = items
          .slice(0, 20)
          .map(item => {
            try {
              const title = item.title?.text || item.title || 'No title'
              const description = cleanHtml(item.description?.text || item.description || item.summary?.text || item.summary || '')
              const content = `${title} ${description}`.toLowerCase()
              const link = item.link?.text || item.link || item.id || '#'
              
              // Extract image
              const extractedImage = extractImageFromContent(item, link)
              
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
                optimizedImageUrl: extractedImage ? `/api/image-proxy?url=${encodeURIComponent(extractedImage)}` : null
              }
            } catch (itemError) {
              console.error(`Error processing item from ${source.name}:`, itemError)
              return null
            }
          })
          .filter(item => item && item.title !== 'No title')

        allFeeds.push(...processedItems)
        console.log(`Successfully processed ${processedItems.length} items from ${source.name}`)
        
        const withImages = processedItems.filter(item => item.imageUrl)
        console.log(`  - ${withImages.length} items have images`)

      } catch (error) {
        console.error(`Error processing ${source.name}:`, error.message)
      }
    })
  )

  // Sort feeds
  const sortedFeeds = allFeeds
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return new Date(b.pubDate) - new Date(a.pubDate)
    })

  // Apply limit
  const limit = parseInt(url.searchParams.get('limit')) || 50
  const limitedFeeds = sortedFeeds.slice(0, limit)

  return new Response(JSON.stringify(limitedFeeds), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300'
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
  
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      score += title.toLowerCase().includes(keyword.toLowerCase()) ? 3 : 1
    }
  })

  return Math.min(score, 10)
}

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

function getBasicHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Harare Metro - Zimbabwe News Aggregator</title>
</head>
<body>
  <div id="root"></div>
  <script>
    console.log('Loading Harare Metro...');
  </script>
</body>
</html>`
}