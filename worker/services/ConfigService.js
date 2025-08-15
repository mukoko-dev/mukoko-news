// worker/services/ConfigService.js
export class ConfigService {
  constructor(kvStorage) {
    // IMPORTANT: This should be CONFIG_STORAGE binding, not main storage
    this.kv = kvStorage // Make sure this is env.CONFIG_STORAGE
    this.fallbackConfig = this.initializeFallbackConfig()
    // Configs are static - no auto-refresh timers
  }

  // Initialize comprehensive fallback configuration with ALL sources from old worker
  initializeFallbackConfig() {
    return {
      rss_sources: [
        {
          id: 'herald-zimbabwe',
          name: 'Herald Zimbabwe',
          url: 'https://www.herald.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 5
        },
        {
          id: 'newsday-zimbabwe',
          name: 'NewsDay Zimbabwe', 
          url: 'https://www.newsday.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 5
        },
        {
          id: 'chronicle-zimbabwe',
          name: 'Chronicle Zimbabwe',
          url: 'https://www.chronicle.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 5
        },
        {
          id: 'zbc-news',
          name: 'ZBC News',
          url: 'https://www.zbc.co.zw/feed/',
          category: 'news',
          enabled: true,
          priority: 4
        },
        {
          id: 'business-weekly',
          name: 'Business Weekly',
          url: 'https://businessweekly.co.zw/feed/',
          category: 'business',
          enabled: true,
          priority: 4
        },
        {
          id: 'techzim',
          name: 'Techzim',
          url: 'https://www.techzim.co.zw/feed/',
          category: 'technology',
          enabled: true,
          priority: 4
        },
        {
          id: 'the-standard',
          name: 'The Standard',
          url: 'https://www.thestandard.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 4
        },
        {
          id: 'zimlive',
          name: 'ZimLive',
          url: 'https://www.zimlive.com/feed/',
          category: 'general',
          enabled: true,
          priority: 4
        },
        {
          id: 'new-zimbabwe',
          name: 'New Zimbabwe',
          url: 'https://www.newzimbabwe.com/feed/',
          category: 'general',
          enabled: true,
          priority: 4
        },
        {
          id: 'the-independent',
          name: 'The Independent',
          url: 'https://www.theindependent.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 4
        },
        {
          id: 'sunday-mail',
          name: 'Sunday Mail',
          url: 'https://www.sundaymail.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: '263chat',
          name: '263Chat',
          url: 'https://263chat.com/feed/',
          category: 'general',
          enabled: true,
          priority: 4
        },
        {
          id: 'daily-news',
          name: 'Daily News',
          url: 'https://www.dailynews.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 4
        },
        {
          id: 'zimeye',
          name: 'ZimEye',
          url: 'https://zimeye.net/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: 'pindula-news',
          name: 'Pindula News',
          url: 'https://news.pindula.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: 'zimbabwe-situation',
          name: 'Zimbabwe Situation',
          url: 'https://zimbabwesituation.com/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: 'nehanda-radio',
          name: 'Nehanda Radio',
          url: 'https://nehandaradio.com/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: 'open-news-zimbabwe',
          name: 'Open News Zimbabwe',
          url: 'https://opennews.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: 'financial-gazette',
          name: 'Financial Gazette',
          url: 'https://fingaz.co.zw/feed/',
          category: 'business',
          enabled: true,
          priority: 4
        },
        {
          id: 'manica-post',
          name: 'Manica Post',
          url: 'https://manicapost.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        },
        {
          id: 'southern-eye',
          name: 'Southern Eye',
          url: 'https://southerneye.co.zw/feed/',
          category: 'general',
          enabled: true,
          priority: 3
        }
      ],
      categories: [
        { id: 'general', name: 'General', emoji: '📰' },
        { id: 'politics', name: 'Politics', emoji: '🏛️' },
        { id: 'economy', name: 'Economy', emoji: '💰' },
        { id: 'business', name: 'Business', emoji: '🏢' },
        { id: 'sports', name: 'Sports', emoji: '⚽' },
        { id: 'harare', name: 'Harare', emoji: '🏙️' },
        { id: 'agriculture', name: 'Agriculture', emoji: '🌾' },
        { id: 'technology', name: 'Technology', emoji: '💻' },
        { id: 'health', name: 'Health', emoji: '🏥' },
        { id: 'education', name: 'Education', emoji: '🎓' },
        { id: 'entertainment', name: 'Entertainment', emoji: '🎭' },
        { id: 'environment', name: 'Environment', emoji: '🌍' },
        { id: 'crime', name: 'Crime', emoji: '🚔' },
        { id: 'international', name: 'International', emoji: '🌐' },
        { id: 'lifestyle', name: 'Lifestyle', emoji: '💫' },
        { id: 'finance', name: 'Finance', emoji: '💳' }
      ],
      category_keywords: {
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
      },
      priority_keywords: [
        'harare', 'zimbabwe', 'zim', 'bulawayo', 'mutare', 'gweru', 'kwekwe',
        'parliament', 'government', 'mnangagwa', 'zanu-pf', 'mdc', 'chamisa',
        'economy', 'inflation', 'currency', 'bond', 'rtgs', 'usd',
        'mining', 'tobacco', 'agriculture', 'maize', 'cotton',
        'warriors', 'dynamos', 'caps united', 'highlanders'
      ],
      trusted_image_domains: [
        // Primary Zimbabwe news sites
        'herald.co.zw', 'heraldonline.co.zw', 'www.herald.co.zw', 'www.heraldonline.co.zw',
        'newsday.co.zw', 'www.newsday.co.zw',
        'chronicle.co.zw', 'www.chronicle.co.zw',
        'techzim.co.zw', 'www.techzim.co.zw', 't3n9sm.c2.acecdn.net',
        'zbc.co.zw', 'www.zbc.co.zw',
        'businessweekly.co.zw', 'www.businessweekly.co.zw',
        'thestandard.co.zw', 'www.thestandard.co.zw',
        'zimlive.com', 'www.zimlive.com',
        'newzimbabwe.com', 'www.newzimbabwe.com',
        'theindependent.co.zw', 'www.theindependent.co.zw',
        'sundaymail.co.zw', 'www.sundaymail.co.zw',
        '263chat.com', 'www.263chat.com',
        'dailynews.co.zw', 'www.dailynews.co.zw',
        'zimeye.net', 'www.zimeye.net',
        'pindula.co.zw', 'news.pindula.co.zw',
        'zimbabwesituation.com', 'www.zimbabwesituation.com',
        'nehandaradio.com', 'www.nehandaradio.com',
        'opennews.co.zw', 'www.opennews.co.zw',
        'fingaz.co.zw', 'www.fingaz.co.zw',
        'manicapost.co.zw', 'www.manicapost.co.zw',
        'southerneye.co.zw', 'www.southerneye.co.zw',
        
        // WordPress and common CMS domains
        'wp.com', 'wordpress.com', 'files.wordpress.com',
        'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com',
        
        // CDN and image hosting services
        'cloudinary.com', 'res.cloudinary.com',
        'imgur.com', 'i.imgur.com',
        'gravatar.com', 'secure.gravatar.com',
        'amazonaws.com', 's3.amazonaws.com', 'cloudfront.net',
        'unsplash.com', 'images.unsplash.com',
        'pexels.com', 'images.pexels.com',
        
        // Google services
        'googleusercontent.com', 'lh3.googleusercontent.com',
        'lh4.googleusercontent.com', 'lh5.googleusercontent.com',
        'blogger.googleusercontent.com', 'drive.google.com',
        
        // Social media image domains
        'fbcdn.net', 'scontent.fhre1-1.fna.fbcdn.net',
        'pbs.twimg.com', 'abs.twimg.com', 'instagram.com',
        
        // News agency images
        'ap.org', 'apnews.com', 'reuters.com',
        'bbci.co.uk', 'bbc.co.uk', 'cnn.com', 'media.cnn.com',
        
        // African news networks
        'africanews.com', 'mg.co.za', 'news24.com', 'timeslive.co.za',
        'iol.co.za', 'citizen.co.za',
        
        // Generic domains that might host images
        'photobucket.com', 'flickr.com', 'staticflickr.com',
        'wikimedia.org', 'upload.wikimedia.org'
      ],
      site: {
        siteName: 'Harare Metro',
        maxArticles: 20000,        // Increased from 10000
        itemsPerSource: 100,       // Increased from 50
        refreshIntervalMinutes: 60,
        minLimit: 100,             // New minimum limit
        maxLimit: 1000,            // New maximum limit
        unlimitedContent: true     // Enable unlimited content extraction
      }
    }
  }

  // Get config WITHOUT auto-refresh - configs are static
  async get(key, defaultValue = null) {
    try {
      if (!this.kv) {
        console.log(`[CONFIG] CONFIG_STORAGE not available, using fallback for: ${key}`)
        return this.getFallbackValue(key, defaultValue)
      }
      
      // Get from CONFIG_STORAGE KV (not main article storage)
      const value = await this.kv.get(key, { type: 'json' })
      return value !== null ? value : this.getFallbackValue(key, defaultValue)
    } catch (error) {
      console.log(`Error getting config ${key}:`, error)
      return this.getFallbackValue(key, defaultValue)
    }
  }

  getFallbackValue(key, defaultValue) {
    const configKey = key.replace('config:', '')
    if (this.fallbackConfig[configKey]) {
      return this.fallbackConfig[configKey]
    }
    return defaultValue
  }

  // Set config permanently in CONFIG_STORAGE (no expiration)
  async set(key, value, options = {}) {
    try {
      if (!this.kv) {
        console.log(`[CONFIG] CONFIG_STORAGE not available, cannot set: ${key}`)
        return { success: false, error: 'CONFIG_STORAGE not available' }
      }
      
      // Store permanently in CONFIG_STORAGE - no TTL for static configs
      await this.kv.put(key, JSON.stringify(value))
      console.log(`[CONFIG] Stored config in CONFIG_STORAGE: ${key}`)
      return { success: true }
    } catch (error) {
      console.log(`Error setting config ${key} in CONFIG_STORAGE:`, error)
      return { success: false, error: error.message }
    }
  }

  // RSS Sources - static, no auto-refresh
  async getRSSources() {
    const sources = await this.get('config:rss_sources', this.fallbackConfig.rss_sources)
    console.log(`[CONFIG] Retrieved ${sources.length} RSS sources`)
    return sources
  }

  async setRSSources(sources) {
    return await this.set('config:rss_sources', sources)
  }

  // Categories - static, no auto-refresh
  async getCategories() {
    const categories = await this.get('config:categories', this.fallbackConfig.categories)
    console.log(`[CONFIG] Retrieved ${categories.length} categories`)
    return categories
  }

  async setCategories(categories) {
    return await this.set('config:categories', categories)
  }

  // Category Keywords - static, no auto-refresh
  async getCategoryKeywords() {
    const keywords = await this.get('config:category_keywords', this.fallbackConfig.category_keywords)
    console.log(`[CONFIG] Retrieved keywords for ${Object.keys(keywords).length} categories`)
    return keywords
  }

  // Priority Keywords - static, no auto-refresh
  async getPriorityKeywords() {
    const keywords = await this.get('config:priority_keywords', this.fallbackConfig.priority_keywords)
    console.log(`[CONFIG] Retrieved ${keywords.length} priority keywords`)
    return keywords
  }

  // Trusted Image Domains - static, no auto-refresh
  async getTrustedImageDomains() {
    const domains = await this.get('config:trusted_image_domains', this.fallbackConfig.trusted_image_domains)
    console.log(`[CONFIG] Retrieved ${domains.length} trusted domains`)
    return domains
  }

  // Site Configuration - static, no auto-refresh
  async getSiteConfig() {
    const config = await this.get('config:site', this.fallbackConfig.site)
    console.log(`[CONFIG] Retrieved site config`)
    return config
  }

  // ADMIN ONLY: Initialize CONFIG_STORAGE with defaults if empty
  async initializeFromFallback() {
    if (!this.kv) {
      console.log('[CONFIG] CONFIG_STORAGE not available - using fallback only')
      return { success: true, message: 'Using fallback configuration' }
    }

    try {
      const operations = []
      
      // Only set if not already present in CONFIG_STORAGE
      const checks = [
        { key: 'config:rss_sources', data: this.fallbackConfig.rss_sources },
        { key: 'config:categories', data: this.fallbackConfig.categories },
        { key: 'config:category_keywords', data: this.fallbackConfig.category_keywords },
        { key: 'config:priority_keywords', data: this.fallbackConfig.priority_keywords },
        { key: 'config:trusted_image_domains', data: this.fallbackConfig.trusted_image_domains },
        { key: 'config:site', data: this.fallbackConfig.site }
      ]

      for (const check of checks) {
        const existing = await this.kv.get(check.key)
        if (!existing) {
          console.log(`[CONFIG] Initializing ${check.key} in CONFIG_STORAGE`)
          operations.push(this.kv.put(check.key, JSON.stringify(check.data)))
        } else {
          console.log(`[CONFIG] ${check.key} already exists in CONFIG_STORAGE, skipping`)
        }
      }

      await Promise.all(operations)
      
      return { 
        success: true, 
        message: `Initialized ${operations.length} configuration items in CONFIG_STORAGE`,
        initialized: operations.length
      }
    } catch (error) {
      console.log('Error initializing CONFIG_STORAGE from fallback:', error)
      return { success: false, error: error.message }
    }
  }

  // ADMIN ONLY: Force refresh all configs from fallback to CONFIG_STORAGE
  async forceRefreshFromFallback() {
    if (!this.kv) {
      return { success: false, error: 'CONFIG_STORAGE not available' }
    }

    try {
      console.log('[CONFIG] Force refreshing all configurations from fallback to CONFIG_STORAGE...')
      
      const operations = [
        this.kv.put('config:rss_sources', JSON.stringify(this.fallbackConfig.rss_sources)),
        this.kv.put('config:categories', JSON.stringify(this.fallbackConfig.categories)),
        this.kv.put('config:category_keywords', JSON.stringify(this.fallbackConfig.category_keywords)),
        this.kv.put('config:priority_keywords', JSON.stringify(this.fallbackConfig.priority_keywords)),
        this.kv.put('config:trusted_image_domains', JSON.stringify(this.fallbackConfig.trusted_image_domains)),
        this.kv.put('config:site', JSON.stringify(this.fallbackConfig.site))
      ]

      await Promise.all(operations)
      
      return { 
        success: true, 
        message: 'All configurations force refreshed from fallback to CONFIG_STORAGE',
        refreshed: operations.length
      }
    } catch (error) {
      console.log('Error force refreshing CONFIG_STORAGE from fallback:', error)
      return { success: false, error: error.message }
    }
  }

  // Remove the initializeDefaults method that was auto-refreshing

  // Default categories with "All" as catch-all
  getDefaultCategories() {
    return [
      {
        id: 'all',
        name: 'All News',
        emoji: '📰',
        description: 'All news articles from all sources',
        color: '#6B7280',
        keywords: [], // Empty keywords means it catches everything
        isDefault: true,
        order: 0
      },
      {
        id: 'politics',
        name: 'Politics',
        emoji: '🏛️',
        description: 'Political news and government affairs',
        color: '#DC2626',
        keywords: [
          'politics', 'government', 'election', 'vote', 'parliament', 'minister',
          'president', 'policy', 'law', 'legislation', 'democracy', 'party',
          'campaign', 'senate', 'congress', 'political', 'governance', 'reform',
          'zanu-pf', 'mdc', 'ccc', 'emmerson mnangagwa', 'nelson chamisa'
        ],
        order: 1
      },
      {
        id: 'economy',
        name: 'Economy',
        emoji: '💰',
        description: 'Economic news, business, and finance',
        color: '#059669',
        keywords: [
          'economy', 'business', 'finance', 'banking', 'investment', 'market',
          'economic', 'financial', 'money', 'currency', 'inflation', 'gdp',
          'trade', 'export', 'import', 'stock', 'bond', 'forex', 'dollar',
          'zimbabwe dollar', 'usd', 'bond notes', 'rtgs', 'mining', 'agriculture',
          'tobacco', 'gold', 'platinum', 'diamonds', 'reserve bank'
        ],
        order: 2
      },
      {
        id: 'technology',
        name: 'Technology',
        emoji: '💻',
        description: 'Technology, innovation, and digital news',
        color: '#2563EB',
        keywords: [
          'technology', 'tech', 'digital', 'innovation', 'startup', 'internet',
          'mobile', 'app', 'software', 'hardware', 'computer', 'ai', 'blockchain',
          'cryptocurrency', 'fintech', 'ecocash', 'telecash', 'onewallett',
          'econet', 'netone', 'telecel', 'zimbabwe online', 'ict', 'innovation hub'
        ],
        order: 3
      },
      {
        id: 'sports',
        name: 'Sports',
        emoji: '⚽',
        description: 'Sports news and events',
        color: '#DC2626',
        keywords: [
          'sports', 'football', 'soccer', 'cricket', 'rugby', 'tennis', 'athletics',
          'olympics', 'world cup', 'premier league', 'psl', 'zimbabwe national team',
          'warriors', 'chevrons', 'sables', 'dynamos', 'caps united', 'highlanders',
          'chicken inn', 'fc platinum', 'ngezi platinum', 'manica diamonds'
        ],
        order: 4
      },
      {
        id: 'health',
        name: 'Health',
        emoji: '🏥',
        description: 'Health, medical, and wellness news',
        color: '#059669',
        keywords: [
          'health', 'medical', 'hospital', 'doctor', 'medicine', 'healthcare',
          'covid', 'pandemic', 'vaccine', 'disease', 'treatment', 'wellness',
          'mental health', 'public health', 'clinic', 'nursing', 'pharmacy',
          'medical aid', 'psmas', 'cimas', 'premier medical aid'
        ],
        order: 5
      },
      {
        id: 'education',
        name: 'Education',
        emoji: '📚',
        description: 'Education news and academic affairs',
        color: '#7C3AED',
        keywords: [
          'education', 'school', 'university', 'student', 'teacher', 'learning',
          'academic', 'examination', 'zimsec', 'o level', 'a level', 'degree',
          'uz', 'msu', 'nust', 'cut', 'buse', 'great zimbabwe university',
          'africa university', 'lupane state university', 'hit'
        ],
        order: 6
      },
      {
        id: 'entertainment',
        name: 'Entertainment',
        emoji: '🎬',
        description: 'Entertainment, arts, and culture',
        color: '#EC4899',
        keywords: [
          'entertainment', 'music', 'movie', 'film', 'celebrity', 'artist',
          'culture', 'arts', 'theatre', 'concert', 'festival', 'book',
          'literature', 'zimbo', 'zim dancehall', 'sungura', 'gospel',
          'winky d', 'jah prayzah', 'ammara brown', 'takura', 'holy ten'
        ],
        order: 7
      },
      {
        id: 'international',
        name: 'International',
        emoji: '🌍',
        description: 'International and world news',
        color: '#0891B2',
        keywords: [
          'international', 'world', 'global', 'foreign', 'africa', 'sadc',
          'south africa', 'botswana', 'zambia', 'malawi', 'mozambique',
          'usa', 'uk', 'china', 'europe', 'brexit', 'trump', 'biden',
          'putin', 'ukraine', 'russia', 'middle east', 'israel', 'palestine'
        ],
        order: 8
      }
    ]
  }

  // Enhanced category detection that includes "All" fallback
  async detectCategory(content) {
    const categories = await this.getCategories()
    const categoryKeywords = await this.getCategoryKeywords()
    
    let maxMatches = 0
    let detectedCategory = 'all' // Default to "all" instead of null
    
    // Skip "all" category during detection since it's the fallback
    const categoriesForDetection = categories.filter(cat => cat.id !== 'all')
    
    for (const category of categoriesForDetection) {
      const keywords = categoryKeywords[category.id] || []
      const matches = keywords.filter(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
      ).length

      if (matches > maxMatches) {
        maxMatches = matches
        detectedCategory = category.id
      }
    }

    return detectedCategory
  }
}

export default ConfigService