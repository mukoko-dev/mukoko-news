import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useRef 
} from 'react'
import { HelmetProvider } from 'react-helmet-async'
import SEO from './components/SEO'
import { 
  NewspaperIcon, 
  ArrowPathIcon, 
  FunnelIcon,
  ClockIcon,
  StarIcon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Squares2X2Icon,
  VideoCameraIcon,
  ShareIcon,
  ArrowsPointingOutIcon // Add this line
} from '@heroicons/react/24/outline'
import NewsBytes from './components/NewsBytes'
import ErrorBoundary from './components/ErrorBoundary'
import SearchPage from './components/SearchPage'
import ShareModal from './components/ShareModal'
import ArticleModal from './components/ArticleModal' // Add this import
import { usePWA } from './hooks/usePWA'
import PWAPrompt from './components/PWAPrompt'

// Logo Component
const Logo = ({ 
  variant = 'main', 
  theme = 'light', 
  size = 'md' 
}) => {
  const sizes = {
    sm: { main: [120, 36], horizontal: [180, 30], compact: [48, 24] },
    md: { main: [200, 60], horizontal: [300, 50], compact: [80, 40] },
    lg: { main: [280, 84], horizontal: [420, 70], compact: [112, 56] }
  }
  
  const colors = {
    light: { stroke: '#000', fill: '#000', subtitle: '#666' },
    dark: { stroke: '#fff', fill: '#fff', subtitle: '#ccc' }
  }
  
  const [width, height] = sizes[size][variant]
  const { stroke, fill } = colors[theme]
  
  if (variant === 'horizontal') {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="logo-horizontal">
        <text x={width*0.17} y={height*0.64} textAnchor="middle" 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.56} 
              fontWeight="bold" 
              fill={fill}>HM</text>
        <line x1={width*0.28} y1={height*0.2} x2={width*0.28} y2={height*0.8} stroke={stroke} strokeWidth="2"/>
        <text x={width*0.34} y={height*0.4} 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.32} 
              fontWeight="bold" 
              fill={fill}>HARARE METRO</text>
      </svg>
    )
  }
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="logo-main">
      <rect x="2" y="2" width={width-4} height={height-4} fill="none" stroke={stroke} strokeWidth="2"/>
      <rect x="6" y="6" width={width-12} height={height-12} fill="none" stroke={stroke} strokeWidth="1"/>
      <text x={width/2} y={height*0.63} textAnchor="middle" 
            fontFamily="Georgia, Times New Roman, serif" 
            fontSize={height*0.53} 
            fontWeight="bold" 
            fill={fill}>HM</text>
    </svg>
  )
}

// Category configuration
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

// Cache management class
class CacheManager {
  constructor() {
    this.cache = new Map()
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key) {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  isValid(key) {
    const cached = this.cache.get(key)
    return cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)
  }
}

// Global cache instance
const cache = new CacheManager()

// Scroll tracker hook for 25% scroll detection
function useScrollTracker() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hasReached25Percent, setHasReached25Percent] = useState(false)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min((scrollTop / docHeight) * 100, 100)
      
      setScrollProgress(progress)
      
      if (progress >= 25 && !hasReached25Percent) {
        setHasReached25Percent(true)
      }
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress()

    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [hasReached25Percent])

  return { scrollProgress, hasReached25Percent }
}

// Scroll direction hook
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up')
  const [lastScroll, setLastScroll] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset
      if (currentScroll <= 0) {
        setScrollDirection('up')
        return
      }
      
      if (currentScroll > lastScroll && scrollDirection !== 'down') {
        setScrollDirection('down')
      } else if (currentScroll < lastScroll && scrollDirection !== 'up') {
        setScrollDirection('up')
      }
      
      setLastScroll(currentScroll)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollDirection, lastScroll])

  return scrollDirection
}

// Enhanced ArticleCard component
function ArticleCard({ article, currentColors }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const cardRef = useRef(null)
  
  const categoryInfo = CATEGORIES.find(cat => cat.id === article.category)
  const hasImage = article.optimizedImageUrl && !imageError

  // Check if user prefers reduced data
  const shouldLoadImages = useMemo(() => {
    return !('connection' in navigator) || 
           navigator.connection?.effectiveType === '4g' ||
           !navigator.connection?.saveData
  }, [])

  const openModal = useCallback(() => {
    setShowArticleModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowArticleModal(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  return (
    <>
      <article 
        ref={cardRef}
        className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}
        aria-labelledby={`article-title-${article.guid}`}
      >
        {/* Image Section */}
        {hasImage && shouldLoadImages && (
          <div className="relative w-full overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <div className="animate-pulse flex flex-col items-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Loading image...</div>
                </div>
              </div>
            )}
            
            <img
              src={article.optimizedImageUrl}
              alt={article.imageAlt || article.title}
              className={`w-full transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {article.priority && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg">
                  🇿🇼 Priority
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Article Header */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className={`text-sm font-semibold ${currentColors.accentText} truncate`}>
              {article.source}
            </span>
            <div className="flex items-center space-x-2">
              
              <div className={`flex items-center text-xs ${currentColors.textMuted}`}>
                <span className="whitespace-nowrap">
                  {new Date(article.pubDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h2 
            id={`article-title-${article.guid}`}
            className={`text-base sm:text-lg font-bold ${currentColors.text} mb-3 leading-tight line-clamp-3`}
          >
            {article.title}
            {article.priority && (!hasImage || !shouldLoadImages) && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                🇿🇼
              </span>
            )}
          </h2>
          
          {/* Description - UPDATED */}
          {article.description && (
            <div className="mb-4">
              <p className={`${currentColors.textMuted} text-sm leading-relaxed line-clamp-3`}>
                {article.description.length > 250 
                  ? `${article.description.substring(0, 250)}...`
                  : article.description
                }
              </p>
              
              {article.description.length > 250 && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openModal() // Open modal instead of expanding
                  }}
                  className={`mt-2 text-xs ${currentColors.accentText} hover:underline flex items-center gap-1 transition-all duration-200 active:scale-95`}
                  aria-label={`Read full article: ${article.title}`}
                >
                  <ArrowsPointingOutIcon className="w-3 h-3 transition-transform duration-200 active:scale-110" />
                  Read More
                </button>
              )}
            </div>
          )}

          {/* Keywords/Hashtags Section */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {article.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95
                      ${currentColors.categoryButton} hover:bg-blue-100 dark:hover:bg-blue-900/30 
                      ${currentColors.textMuted} hover:text-blue-600 dark:hover:text-blue-400`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleKeywordSearch(keyword)
                    }}
                    title={`Search for articles about ${keyword}`}
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions - UPDATED */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs ${currentColors.accentText} hover:underline flex items-center gap-1 transition-all duration-200 active:scale-95`}
                aria-label={`Read full article: ${article.title}`}
              >
                <GlobeAltIcon className="w-3 h-3 transition-transform duration-200 active:scale-110" />
                Read Original
              </a>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowShareModal(true)
              }}
              className="p-1.5 rounded-full transition-all duration-200 active:scale-95"
              aria-label={`Share article: ${article.title}`}
            >
              <ShareIcon className={`h-4 w-4 transition-transform duration-200 active:scale-110 ${currentColors.text}`} />
            </button>
          </div>
        </div>
      </article>

      {/* Share Modal */}
      <ShareModal
        article={article}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        currentColors={currentColors}
      />

      {/* Article Modal */}
      <ArticleModal
        article={article}
        isOpen={showArticleModal}
        onClose={closeModal}
        currentColors={currentColors}
      />
    </>
  )
}

// Infinite Scroll Hook
function useInfiniteScroll(hasMore, loading, loadMore) {
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && hasMore && !loading) {
        setIsFetching(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading])

  useEffect(() => {
    if (!isFetching) return
    loadMore()
    setIsFetching(false)
  }, [isFetching, loadMore])

  return [isFetching, setIsFetching]
}

// Helper function to determine the next theme
const getNextTheme = (currentTheme) => {
  return currentTheme === 'light' ? 'dark' : 'light'
};

// Main App Component
function App() {
  // Use the hook only here in the main App component
  const { isOffline } = usePWA()

  // Core state
  const [allFeeds, setAllFeeds] = useState([])
  const [displayedFeeds, setDisplayedFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  // UI state - Changed default theme to 'dark'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [theme, setTheme] = useState('dark') // Changed from 'light' to 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [currentView, setCurrentView] = useState('grid') // 'grid' or 'bytes'
  const [showSearch, setShowSearch] = useState(false)
  
  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 15

  // Scroll tracking
  const { hasReached25Percent } = useScrollTracker()
  const scrollDirection = useScrollDirection()

  // Enhanced theme configurations with better contrast
  const themes = {
    light: {
      bg: 'bg-gray-50',
      headerBg: 'bg-white/95',
      cardBg: 'bg-white',
      statsBg: 'bg-gray-100',
      footerBg: 'bg-gray-900',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textLight: 'text-white',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      accent: 'bg-gray-900 hover:bg-gray-800',
      accentText: 'text-gray-900 hover:text-gray-700',
      categoryButton: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50',
      categoryButtonActive: 'bg-gray-900 text-white border border-gray-900'
    },
    dark: {
      bg: 'bg-black', // Changed from bg-gray-900 to pure black
      headerBg: 'bg-black/95', // Changed from bg-gray-800/95 to black
      cardBg: 'bg-gray-900', // Kept as gray-900 for cards to stand out from black background
      statsBg: 'bg-gray-800', // Slightly lighter than cards
      footerBg: 'bg-gray-900',
      text: 'text-white', // Pure white for maximum contrast
      textSecondary: 'text-gray-100', // Very light gray instead of gray-200
      textLight: 'text-white',
      textMuted: 'text-gray-300', // Lighter than before for better readability
      border: 'border-gray-700', // Lighter border for better visibility
      accent: 'bg-white hover:bg-gray-100',
      accentText: 'text-white hover:text-gray-100', // Better contrast
      categoryButton: 'bg-gray-800 border border-gray-600 text-gray-100 hover:bg-gray-700', // Improved contrast
      categoryButtonActive: 'bg-white text-black border border-white' // Pure white active state
    }
  }

  // Enhanced theme management - Default to dark theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      // Default to dark theme instead of system preference
      const defaultTheme = 'dark'
      setTheme(defaultTheme)
      localStorage.setItem('theme', defaultTheme)
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Only change if no theme is saved (first visit)
      if (!localStorage.getItem('theme')) {
        const newTheme = 'dark' // Always default to dark
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (['light', 'dark'].includes(theme)) {
      localStorage.setItem('theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  // FIX: Ensure currentColors is always defined with fallback (now dark)
  const currentColors = themes[theme] || themes.dark

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      setShowScrollTop(scrolled > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load feeds function - Updated for high volume with background refresh
  const loadFeeds = useCallback(async (forceRefresh = false) => {
    const cacheKey = `feeds_${selectedCategory}`
    
    if (!forceRefresh && cache.isValid(cacheKey)) {
      const cachedData = cache.get(cacheKey)
      if (cachedData) {
        setAllFeeds(cachedData.articles || cachedData)
        setLoading(false)
        return
      }
    }

    try {
      if (forceRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      // High volume request - 500 articles, fast response from worker cache
      const params = new URLSearchParams({
        limit: '500',
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const apiUrl = `/api/feeds?${params}`
      console.log('🚀 Fetching high volume from:', apiUrl)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.error('❌ Request timeout after 15 seconds')
      }, 15000) // Shorter timeout since we're reading from cache

      const startTime = Date.now()
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      const fetchTime = Date.now() - startTime
      
      console.log('📨 High volume response:', response.status, `(${fetchTime}ms)`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      
      // Enhanced data validation and extraction
      let articles = []
      let meta = {}
      
      if (responseData) {
        // Handle different response structures
        if (Array.isArray(responseData)) {
          articles = responseData
        } else if (responseData.articles && Array.isArray(responseData.articles)) {
          articles = responseData.articles
          meta = responseData.meta || {}
        } else if (responseData.success !== false && responseData.articles) {
          articles = Array.isArray(responseData.articles) ? responseData.articles : []
          meta = responseData.meta || {}
        } else {
          console.error('❌ Invalid response structure:', responseData)
          throw new Error('Invalid response format from server')
        }
      }
      
      const processingTime = Date.now() - startTime
      
      console.log(`✅ High volume data received: ${articles.length} articles (${processingTime}ms total)`)
      console.log('📊 Cache info:', {
        lastRefresh: meta.lastRefresh,
        nextScheduledRefresh: meta.nextScheduledRefresh,
        cached: meta.cached,
        success: responseData.success !== false
      })
      
      // Additional validation
      if (!Array.isArray(articles)) {
        console.error('❌ Articles is not an array:', typeof articles, articles)
        throw new Error('Received invalid data format')
      }
      
      // Enhanced debugging
      const withImages = articles.filter(article => article && article.imageUrl)
      const priorityCount = articles.filter(article => article && article.priority).length
      
      console.log('📊 Article stats:', {
        totalArticles: articles.length,
        withImages: withImages.length,
        priority: priorityCount,
        categories: meta.categories?.length || 0,
        sources: meta.sources?.length || 0
      })
      
      cache.set(cacheKey, { articles, meta })
      setAllFeeds(articles)
      setLastUpdated(meta.lastRefresh || new Date().toISOString())
      console.log('✅ Feed loading completed successfully')
      
    } catch (err) {
      console.error('❌ High volume feed loading error:', err)
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Network connection failed. Please check your connection.')
      } else {
        setError(`Failed to load news: ${err.message}`)
      }
      
      // Set empty array on error to prevent filter errors
      setAllFeeds([])
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [selectedCategory])

  // Load more feeds for infinite scroll
  const loadMoreFeeds = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    const filtered = getFilteredFeeds(allFeeds)
    const nextPageStart = currentPage * ITEMS_PER_PAGE
    const nextPageEnd = nextPageStart + ITEMS_PER_PAGE
    const nextPageItems = filtered.slice(nextPageStart, nextPageEnd)

    if (nextPageItems.length === 0) {
      setHasMore(false)
      setLoadingMore(false)
      return
    }

    setTimeout(() => {
      setDisplayedFeeds(prev => [...prev, ...nextPageItems])
      setCurrentPage(prev => prev + 1)

      if (nextPageEnd >= filtered.length) {
        setHasMore(false)
      }
      
      setLoadingMore(false)
    }, 500)
  }, [allFeeds, currentPage, loadingMore, hasMore])

  // Filter function
  const getFilteredFeeds = useCallback((feeds) => {
    let filtered = feeds

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(feed => feed.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(feed => 
        feed.title.toLowerCase().includes(query) ||
        feed.description?.toLowerCase().includes(query) ||
        feed.source.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [selectedCategory, searchQuery])

  // Update displayed feeds when filters change
  useEffect(() => {
    const filtered = getFilteredFeeds(allFeeds)
    setDisplayedFeeds(filtered.slice(0, ITEMS_PER_PAGE))
    setCurrentPage(1)
    setHasMore(filtered.length > ITEMS_PER_PAGE)
  }, [allFeeds, getFilteredFeeds])

  // Initialize infinite scroll
  useInfiniteScroll(hasMore, loadingMore, loadMoreFeeds)

  // Load feeds when component mounts - rely on hourly worker refresh
  useEffect(() => {
    loadFeeds(false) // Don't force refresh, use cached data
    
    // Check for updates every 5 minutes (worker updates hourly)
    const interval = setInterval(() => loadFeeds(false), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadFeeds])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const priorityCount = allFeeds.filter(feed => feed.priority).length
  const imageCount = allFeeds.filter(feed => feed.imageUrl).length
  const filteredTotal = getFilteredFeeds(allFeeds).length

  // Search handlers
  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchActive(false)
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 60) {
        return `${diffMins}m ago`
      } else if (diffHours < 24) {
        return `${diffHours}h ago`
      } else if (diffDays < 7) {
        return `${diffDays}d ago`
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch {
      return 'Recent'
    }
  }

  // Generate dynamic SEO data
  const generateSEOData = () => {
    let title = 'Zimbabwe News Aggregator'
    let description = 'Stay informed with the latest news from Zimbabwe. Real-time aggregation from Herald, NewsDay, Chronicle, ZBC and more trusted local sources.'
    let keywords = 'Zimbabwe news, Harare news, Zimbabwe politics, Zimbabwe economy, Herald Zimbabwe, NewsDay, Chronicle, ZBC News'

    if (selectedCategory !== 'all') {
      const categoryInfo = CATEGORIES.find(cat => cat.id === selectedCategory)
      if (categoryInfo) {
        title = `${categoryInfo.label} News - Zimbabwe`
        description = `Latest ${categoryInfo.label.toLowerCase()} news from Zimbabwe. ${description}`
        keywords = `Zimbabwe ${categoryInfo.label.toLowerCase()}, ${keywords}`
      }
    }

    if (searchQuery.trim()) {
      title = `"${searchQuery}" - Search Results`
      description = `Search results for "${searchQuery}" in Zimbabwe news. ${description}`
      keywords = `${searchQuery}, ${keywords}`
    }

    return { title, description, keywords }
  }

  const seoData = generateSEOData()

  // Filter articles with images for bytes view
  const articlesWithImages = useMemo(() => {
    return allFeeds.filter(article => article.optimizedImageUrl)
  }, [allFeeds])

  // Add this function to handle keyword searches
  const handleKeywordSearch = useCallback((keyword) => {
    setSearchQuery(keyword)
    setIsSearchActive(true)
    setSelectedCategory('all') // Show all categories when searching
    
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <HelmetProvider>
      <div className={`min-h-screen ${currentColors.bg} transition-colors duration-300`}>
        <SEO {...seoData} />
        
        {/* Add PWA component - it uses the hook internally */}
        <PWAPrompt currentColors={currentColors} />
        
        {/* Use isOffline in your error handling */}
        {error && (
          <div className="mb-6">
            <div className={`${isOffline ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'} border rounded-xl p-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XMarkIcon className={`h-5 w-5 ${isOffline ? 'text-orange-400' : 'text-red-400'}`} />
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${isOffline ? 'text-orange-800 dark:text-orange-100' : 'text-red-800 dark:text-red-100'}`}>
                    {isOffline ? 'Offline Mode' : 'Error Loading News'}
                  </h3>
                  <p className={`mt-1 text-sm ${isOffline ? 'text-orange-600 dark:text-orange-200' : 'text-red-600 dark:text-red-200'}`}>
                    {isOffline ? 'Showing cached articles. Connect to internet for latest updates.' : error}
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => loadFeeds(true)}
                    className={`${isOffline ? 'text-orange-600 dark:text-orange-300 hover:text-orange-500' : 'text-red-600 dark:text-red-300 hover:text-red-500'}`}
                    disabled={isOffline}
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Updated Header with auto-hide */}
        <header 
          className={`fixed top-0 left-0 right-0 z-50 ${currentColors.headerBg} backdrop-blur-lg ${
            currentColors.border
          } border-b transition-transform duration-300 ${
            scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
          }`} 
          role="banner"
        >
          <div className="h-16 flex items-center justify-center">
            <Logo variant="compact" theme={theme} size="md" />
          </div>
        </header>

        {/* Add padding to account for fixed header */}
        <div className="pt-16">
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6" role="main">
            {currentView === 'grid' ? (
              <>
                {/* Error State with improved contrast */}
                {error && (
                  <div className="mb-6">
                    <div className={`${isOffline ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'} border rounded-xl p-4`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <XMarkIcon className={`h-5 w-5 ${isOffline ? 'text-orange-400' : 'text-red-400'}`} />
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${isOffline ? 'text-orange-800 dark:text-orange-100' : 'text-red-800 dark:text-red-100'}`}>
                            {isOffline ? 'Offline Mode' : 'Error Loading News'}
                          </h3>
                          <p className={`mt-1 text-sm ${isOffline ? 'text-orange-600 dark:text-orange-200' : 'text-red-600 dark:text-red-200'}`}>
                            {isOffline ? 'Showing cached articles. Connect to internet for latest updates.' : error}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={() => loadFeeds(true)}
                            className={`${isOffline ? 'text-orange-600 dark:text-orange-300 hover:text-orange-500' : 'text-red-600 dark:text-red-300 hover:text-red-500'}`}
                            disabled={isOffline}
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Filters with improved contrast */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex-1 overflow-x-auto" role="navigation" aria-label="News categories">
                      <div className="flex space-x-2 pb-2">
                        {CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`
                              flex-shrink-0 px-3 sm:px-4 py-2 rounded-full transition-colors font-medium
                              ${selectedCategory === category.id 
                                ? `${currentColors.categoryButtonActive}` 
                                : `${currentColors.categoryButton}`
                              }
                            `}
                            aria-current={selectedCategory === category.id ? 'true' : undefined}
                            aria-label={`Show ${category.label} news`}
                          >
                            <span aria-hidden="true" className="mr-1.5">{category.icon}</span>
                            <span>{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Bar with improved contrast */}
                <div className="mb-6">
                  {isSearchActive && (
                    <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <label htmlFor="news-search" className="sr-only">
                              Search news articles
                            </label>
                            <MagnifyingGlassIcon 
                              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${currentColors.textMuted}`}
                              aria-hidden="true" 
                            />
                            <input
                              id="news-search"
                              type="search"
                              placeholder="Search news..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2 text-sm ${currentColors.cardBg} ${currentColors.text} border-0 focus:ring-2 focus:ring-blue-500 rounded-lg placeholder-gray-400 dark:placeholder-gray-500`}
                              aria-label="Search news articles"
                              aria-expanded={isSearchActive}
                            />
                          </div>
                        </div>
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className={`p-2 rounded-lg transition-colors ${currentColors.categoryButton}`}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading State */}
                {loading && allFeeds.length === 0 && (
                  <div className="text-center py-12">
                    <ArrowPathIcon className={`h-8 w-8 animate-spin mx-auto mb-4 ${currentColors.textMuted}`} />
                    <p className={`${currentColors.textMuted} mb-2`}>
                      Loading latest news from 21+ Zimbabwe sources...
                    </p>
                    <p className={`text-sm ${currentColors.textMuted}`}>
                      Reading from hourly cache - this should be quick!
                    </p>
                  </div>
                )}

                {/* Articles Grid */}
                {!loading && displayedFeeds.length > 0 && (
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                    {displayedFeeds.map((article, index) => (
                      <div key={`${article.guid}-${index}`} className="break-inside-avoid mb-6">
                        <ArticleCard
                          article={article}
                          currentColors={currentColors}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="text-center py-8">
                    <ArrowPathIcon className={`h-6 w-6 animate-spin mx-auto mb-2 ${currentColors.textMuted}`} />
                    <p className={`text-sm ${currentColors.textMuted}`}>Loading more articles...</p>
                  </div>
                )}

                {/* No More Content */}
                {!hasMore && displayedFeeds.length > 0 && (
                  <div className="text-center py-8">
                    <p className={`text-sm ${currentColors.textMuted}`}>
                      You've reached the end! 📰
                    </p>
                  </div>
                )}

                {/* No Results */}
                {!loading && displayedFeeds.length === 0 && allFeeds.length > 0 && (
                  <div className="text-center py-12">
                    <FunnelIcon className={`h-12 w-12 mx-auto mb-4 ${currentColors.textMuted}`} />
                    <h3 className={`text-lg font-medium ${currentColors.text} mb-2`}>
                      No articles found
                    </h3>
                    <p className={`${currentColors.textMuted} mb-4`}>
                      Try adjusting your filters or search terms
                    </p>
                    {(selectedCategory !== 'all' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedCategory('all')
                          setSearchQuery('')
                          setIsSearchActive(false)
                        }}
                        className={`px-4 py-2 rounded-lg ${currentColors.accent} ${currentColors.textLight} text-sm font-medium`}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Bytes view - only show on mobile/tablet
              <div className="lg:hidden">
                <ErrorBoundary>
                  {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-black">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-white" />
                    </div>
                  ) : (
                    <NewsBytes 
                      articles={articlesWithImages}
                      currentColors={currentColors}
                    />
                  )}
                </ErrorBoundary>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation with improved contrast */}
        <nav className={`
          fixed bottom-0 left-0 right-0 lg:hidden z-50 
          ${currentColors.headerBg} backdrop-blur-lg ${currentColors.border} border-t
        `}>
          <div className="flex items-center justify-around h-16 px-4">
            <button
              onClick={() => setCurrentView('grid')}
              className={`p-2 rounded-lg flex flex-col items-center`}
              aria-label="Grid view"
              aria-pressed={currentView === 'grid'}
            >
              <Squares2X2Icon className={`h-6 w-6 ${
                currentView === 'grid' ? currentColors.text : currentColors.textMuted
              }`} />
              <span className={`text-xs mt-1 font-medium ${
                currentView === 'grid' ? currentColors.text : currentColors.textMuted
              }`}>Feed</span>
            </button>

            <button
              onClick={() => setCurrentView('bytes')}
              className={`p-2 rounded-lg flex flex-col items-center`}
              aria-label="Bytes view"
              aria-pressed={currentView === 'bytes'}
            >
              <VideoCameraIcon className={`h-6 w-6 ${
                currentView === 'bytes' ? currentColors.text : currentColors.textMuted
              }`} />
              <span className={`text-xs mt-1 font-medium ${
                currentView === 'bytes' ? currentColors.text : currentColors.textMuted
              }`}>Bytes</span>
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className={`p-2 rounded-lg flex flex-col items-center`}
              aria-label="Search"
            >
              <MagnifyingGlassIcon className={`h-6 w-6 ${currentColors.textMuted}`} />
              <span className={`text-xs mt-1 font-medium ${currentColors.textMuted}`}>Search</span>
            </button>

            <button
              onClick={() => setTheme(getNextTheme(theme))}
              className={`p-2 rounded-lg flex flex-col items-center`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? (
                <>
                  <SunIcon className={`h-6 w-6 ${currentColors.textMuted}`} />
                  <span className={`text-xs mt-1 font-medium ${currentColors.textMuted}`}>Light</span>
                </>
              ) : (
                <>
                  <MoonIcon className={`h-6 w-6 ${currentColors.textMuted}`} />
                  <span className={`text-xs mt-1 font-medium ${currentColors.textMuted}`}>Dark</span>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-20 right-4 lg:bottom-6 z-40 p-3 rounded-full ${currentColors.accent} shadow-lg transition-all duration-300 hover:scale-110`}
            aria-label="Scroll to top"
          >
            <ArrowUpIcon className={`h-5 w-5 ${theme === 'light' ? 'text-white' : 'text-black'}`} />
          </button>
        )}

        {/* Footer */}
        <footer className={`${currentColors.footerBg} text-center py-8 mt-12`} role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <HeartIcon className="h-5 w-5 text-red-400" />
              <span className={`text-sm ${currentColors.textLight}`}>
                Made with love for Zimbabwe by{' '}
                <a 
                  href="https://www.nyuchi.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  Nyuchi Web Services
                </a>
              </span>
            </div>
            <p className={`text-xs ${currentColors.textMuted}`}>
              Hourly news updates from Herald, NewsDay, Chronicle, ZBC, and 17+ trusted Zimbabwean sources
            </p>
          </div>
        </footer>

        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50"
        >
          Skip to main content
        </a>

        {/* Search Page */}
        {showSearch && (
          <SearchPage
            currentColors={currentColors}
            allFeeds={allFeeds}
            lastUpdated={lastUpdated} // Add this prop
            onClose={() => setShowSearch(false)}
            onSelectArticle={(article) => {
              setShowSearch(false)
              // Handle article selection (e.g., scroll to article or open in bytes view)
            }}
          />
        )}
      </div>
    </HelmetProvider>
  )
}

// Helper function for category colors
function getCategoryColor(category) {
  const colors = {
    politics: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    economy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    health: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    education: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    entertainment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    agriculture: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    harare: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    environment: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    crime: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    international: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    lifestyle: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    finance: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  }
  
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

export default App