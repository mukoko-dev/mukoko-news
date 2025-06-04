import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  CalendarIcon,
  TagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

// Logo Component (unchanged)
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
  const { stroke, fill, subtitle } = colors[theme]
  
  if (variant === 'horizontal') {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="logo-horizontal">
        <text x={width*0.17} y={height*0.64} textAnchor="middle" 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.56} 
              fontWeight="bold" 
              fill={fill}>HM</text>
        <line x1={width*0.28} y1={height*0.2} x2={width*0.28} y2={height*0.8} 
              stroke={stroke} strokeWidth="2"/>
        <text x={width*0.37} y={height*0.44} 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.28} 
              fontWeight="bold" 
              fill={fill}>HARARE</text>
        <text x={width*0.37} y={height*0.72} 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.28} 
              fill={subtitle}>METRO</text>
      </svg>
    )
  }
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="logo-compact">
      <rect x="2" y="2" width={width-4} height={height-4} fill="none" stroke={stroke} strokeWidth="1.5"/>
      <text x={width/2} y={height*0.65} textAnchor="middle" 
            fontFamily="Georgia, Times New Roman, serif" 
            fontSize={height*0.4} 
            fontWeight="bold" 
            fill={fill}>HM</text>
    </svg>
  )
}

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

// Enhanced ArticleCard for infinite scroll with expandable text
function ArticleCard({ article, currentColors, isVisible = true }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef(null)
  
  const categoryInfo = CATEGORIES.find(cat => cat.id === article.category)
  
  // Use original image URL directly from worker
  const hasImage = article.imageUrl && !imageError
  const showImagePlaceholder = !hasImage && !imageError

  // Check if description is long enough to need expansion
  const hasLongDescription = article.description && article.description.length > 150
  
  // Get preview text (first ~150 characters)
  const getPreviewText = (text) => {
    if (!text) return ''
    if (text.length <= 150) return text
    
    // Find the last complete sentence or word break within 150 characters
    const preview = text.substring(0, 150)
    const lastPeriod = preview.lastIndexOf('.')
    const lastSpace = preview.lastIndexOf(' ')
    
    if (lastPeriod > 100) {
      return preview.substring(0, lastPeriod + 1)
    } else if (lastSpace > 100) {
      return preview.substring(0, lastSpace) + '...'
    }
    return preview + '...'
  }

  const toggleExpansion = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleImageLoad = () => setImageLoaded(true)
  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!cardRef.current || !isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [isVisible])

  return (
    <article 
      ref={cardRef}
      className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:transform hover:-translate-y-1 opacity-0`}
    >
      {/* Image Section */}
      {hasImage && (
        <div className="relative w-full h-48 sm:h-52 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
              <div className="animate-pulse flex flex-col items-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                <div className="text-xs text-gray-500 dark:text-gray-400">Loading image...</div>
              </div>
            </div>
          )}
          
          <img
            src={article.imageUrl}
            alt={article.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
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
      
      {showImagePlaceholder && (
        <div className="w-full h-32 sm:h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">{categoryInfo?.icon || '📰'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
              {article.category}
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className={`text-sm font-semibold ${currentColors.accentText} truncate`}>
            {article.source}
          </span>
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
        
        <h2 className={`text-base sm:text-lg font-bold ${currentColors.text} mb-3 leading-tight line-clamp-3`}>
          {article.title}
          {article.priority && !hasImage && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
              🇿🇼
            </span>
          )}
        </h2>
        
        {/* Description - Instagram-style expandable text */}
        {article.description && (
          <div className="mb-4">
            <p className={`${currentColors.textSecondary} text-sm sm:text-base leading-relaxed transition-all duration-300`}>
              {isExpanded ? article.description : getPreviewText(article.description)}
              {hasLongDescription && (
                <button
                  onClick={toggleExpansion}
                  className={`ml-2 text-sm font-medium ${currentColors.accentText} hover:underline focus:outline-none inline-flex items-center transition-colors`}
                >
                  {isExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUpIcon className="w-3 h-3 ml-1" />
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <ChevronDownIcon className="w-3 h-3 ml-1" />
                    </>
                  )}
                </button>
              )}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium ${getCategoryColor(article.category)} truncate flex-shrink-0`}>
            <span className="mr-1">{categoryInfo?.icon || '📰'}</span>
            <span className="hidden sm:inline">{article.category}</span>
          </span>
          
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${currentColors.accentText} text-xs sm:text-sm font-medium inline-flex items-center group transition-colors hover:underline`}
          >
            <span className="hidden sm:inline">Read Full Article</span>
            <span className="sm:hidden">Read</span>
            <GlobeAltIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
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

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading])

  useEffect(() => {
    if (!isFetching) return
    loadMore()
    setIsFetching(false)
  }, [isFetching, loadMore])

  return [isFetching, setIsFetching]
}

function App() {
  const [allFeeds, setAllFeeds] = useState([]) // Store all fetched feeds
  const [displayedFeeds, setDisplayedFeeds] = useState([]) // Currently displayed feeds
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [theme, setTheme] = useState('system')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 15 // Reduced for better performance on mobile

  const themes = {
    light: {
      bg: 'bg-gray-50',
      headerBg: 'bg-white/95',
      cardBg: 'bg-white',
      statsBg: 'bg-gray-100',
      footerBg: 'bg-gray-800',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textLight: 'text-white',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      accent: 'bg-gray-900 hover:bg-gray-800',
      accentText: 'text-gray-900 hover:text-gray-700',
      categoryButton: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
      categoryButtonActive: 'bg-gray-900 text-white border-gray-900'
    },
    dark: {
      bg: 'bg-gray-900',
      headerBg: 'bg-gray-800/95',
      cardBg: 'bg-gray-800',
      statsBg: 'bg-gray-700',
      footerBg: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-200',
      textLight: 'text-white',
      textMuted: 'text-gray-400',
      border: 'border-gray-600',
      accent: 'bg-white hover:bg-gray-100',
      accentText: 'text-white hover:text-gray-200',
      categoryButton: 'bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600',
      categoryButtonActive: 'bg-white text-gray-900 border-white'
    }
  }

  // Theme management (unchanged)
  useEffect(() => {
    const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const savedTheme = localStorage.getItem('harare-metro-theme') || 'system'
    setTheme(savedTheme)

    if (savedTheme === 'system') {
      const systemTheme = getSystemTheme()
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('harare-metro-theme', newTheme)
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

  const getCurrentTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  const currentColors = themes[getCurrentTheme()]

  // Load initial feeds
  const loadFeeds = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true)
        setCurrentPage(0)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }
      
      setError(null)
      
      const response = await fetch('/api/feeds')
      if (!response.ok) {
        throw new Error(`Failed to load news: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (refresh) {
        setAllFeeds(data)
        setDisplayedFeeds(data.slice(0, ITEMS_PER_PAGE))
        setCurrentPage(1)
        setLastUpdated(new Date())
      } else {
        setAllFeeds(prev => [...prev, ...data])
      }
      
    } catch (err) {
      setError(err.message)
      console.error('Error loading feeds:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Load more feeds for infinite scroll
  const loadMoreFeeds = useCallback(() => {
    if (loadingMore || !hasMore) return

    const filtered = getFilteredFeeds(allFeeds)
    const nextPageStart = currentPage * ITEMS_PER_PAGE
    const nextPageEnd = nextPageStart + ITEMS_PER_PAGE
    const nextPageItems = filtered.slice(nextPageStart, nextPageEnd)

    if (nextPageItems.length === 0) {
      setHasMore(false)
      return
    }

    setDisplayedFeeds(prev => [...prev, ...nextPageItems])
    setCurrentPage(prev => prev + 1)

    // Check if we have more items
    if (nextPageEnd >= filtered.length) {
      setHasMore(false)
    }
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

  useEffect(() => {
    loadFeeds(true)
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(() => loadFeeds(true), 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadFeeds])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const priorityCount = allFeeds.filter(feed => feed.priority).length
  const imageCount = allFeeds.filter(feed => feed.imageUrl).length
  const filteredTotal = getFilteredFeeds(allFeeds).length

  // Search handlers
  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive)
    if (isSearchActive) {
      setSearchQuery('')
    }
  }

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

  const primaryCategories = CATEGORIES.filter(cat => cat.primary)
  const secondaryCategories = CATEGORIES.filter(cat => !cat.primary)
  const categoriesToShow = showAllCategories ? CATEGORIES : primaryCategories

  if (loading && displayedFeeds.length === 0) {
    return (
      <HelmetProvider>
        <SEO />
        <div className={`min-h-screen ${currentColors.bg} flex items-center justify-center font-serif`}>
          <div className={`text-center ${currentColors.text} px-4`}>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold mb-3">Loading Zimbabwe News</h2>
            <p className={`${currentColors.textMuted} text-base`}>Connecting to local news sources...</p>
          </div>
        </div>
      </HelmetProvider>
    )
  }

  return (
    <HelmetProvider>
      <SEO />
      <div className={`min-h-screen ${currentColors.bg} flex flex-col font-serif`}>
        {/* Header */}
        <header className={`${currentColors.headerBg} backdrop-blur-sm shadow-lg sticky top-0 z-50 ${currentColors.border} border-b`}>
          <div className="w-full px-3 sm:px-4">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="hidden md:block">
                  <Logo variant="horizontal" theme={getCurrentTheme()} size="sm" />
                </div>
                <div className="md:hidden">
                  <Logo variant="compact" theme={getCurrentTheme()} size="sm" />
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSearchToggle}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                    isSearchActive 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : `${currentColors.textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                  title="Search news"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
                
                <div className={`flex items-center ${currentColors.cardBg} ${currentColors.border} border rounded-lg p-0.5`}>
                  <button
                    onClick={() => changeTheme('light')}
                    className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                      theme === 'light' 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : `${currentColors.textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }`}
                  >
                    <SunIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                      theme === 'dark' 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                        : `${currentColors.textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }`}
                  >
                    <MoonIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => changeTheme('system')}
                    className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                      theme === 'system' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                        : `${currentColors.textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }`}
                  >
                    <ComputerDesktopIcon className="h-3 w-3" />
                  </button>
                </div>
                
                <button
                  onClick={() => loadFeeds(true)}
                  disabled={loading}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${currentColors.textMuted} hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50`}
                  title="Refresh news"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-5">
          {/* Search Bar */}
          {isSearchActive && (
            <div className={`${currentColors.statsBg} rounded-xl p-3 mb-4 ${currentColors.border} border`}>
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${currentColors.textMuted}`} />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 bg-transparent ${currentColors.text} placeholder-gray-400 text-sm font-serif focus:outline-none`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${currentColors.textMuted} hover:text-red-500`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className={`text-xs ${currentColors.textMuted} mt-2`}>
                  Found {filteredTotal} articles matching "{searchQuery}"
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className={`${currentColors.statsBg} rounded-xl p-3 mb-4 ${currentColors.border} border`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className={`flex items-center space-x-1.5 ${currentColors.text} font-medium`}>
                  <NewspaperIcon className="h-4 w-4" />
                  <span>{displayedFeeds.length} of {filteredTotal}</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${currentColors.text} font-medium`}>
                  <StarIcon className="h-4 w-4" />
                  <span>{priorityCount} Priority</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${currentColors.text} font-medium`}>
                  <PhotoIcon className="h-4 w-4" />
                  <span>{imageCount} Images</span>
                </span>
              </div>
              {lastUpdated && (
                <span className={`flex items-center space-x-1.5 ${currentColors.textMuted}`}>
                  <ClockIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Updated </span>
                  <span>{formatDate(lastUpdated)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-5">
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-2 min-w-max">
                {categoriesToShow.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === category.id
                        ? currentColors.categoryButtonActive
                        : currentColors.categoryButton
                    }`}
                  >
                    <span className="text-sm">{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {secondaryCategories.length > 0 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className={`${currentColors.textMuted} hover:${currentColors.text} text-sm font-medium transition-colors mt-2`}
              >
                {showAllCategories ? '← Show Less Categories' : `+ Show ${secondaryCategories.length} More Categories`}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              <h3 className="font-semibold mb-2">Error Refreshing</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Content */}
          {displayedFeeds.length === 0 ? (
            <div className={`${currentColors.cardBg} ${currentColors.border} border p-12 rounded-xl text-center`}>
              <div className="text-6xl mb-4">
                {searchQuery ? '🔍' : '📰'}
              </div>
              <h3 className={`text-xl font-semibold ${currentColors.text} mb-2`}>
                {searchQuery ? 'No Search Results' : 'No Articles Found'}
              </h3>
              <p className={`text-base ${currentColors.textMuted}`}>
                {searchQuery 
                  ? `No articles match "${searchQuery}"` 
                  : selectedCategory === 'all' 
                    ? 'No news articles available.' 
                    : `No articles in "${CATEGORIES.find(c => c.id === selectedCategory)?.label}".`
                  }
              </p>
            </div>
          ) : (
            <>
              {/* Articles Grid */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {displayedFeeds.map((article, index) => (
                  <ArticleCard 
                    key={`${article.guid || article.link}-${index}`} 
                    article={article} 
                    currentColors={currentColors}
                    isVisible={true}
                  />
                ))}
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-900"></div>
                  <span className={`ml-3 ${currentColors.textMuted}`}>Loading more articles...</span>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && displayedFeeds.length > 0 && (
                <div className={`text-center py-8 ${currentColors.textMuted}`}>
                  <div className="text-4xl mb-2">📰</div>
                  <p>You've reached the end of all available articles!</p>
                  <p className="text-sm mt-1">Pull down to refresh for new content</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 ${currentColors.accent} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40`}
            title="Scroll to top"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}

        {/* Footer */}
        <footer className={`${currentColors.footerBg} ${currentColors.border} border-t mt-12`}>
          <div className="px-4 sm:px-6 py-8">
            <div className="text-center text-white max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-3">
                <span className="text-base">Made with</span>
                <HeartIcon className="h-5 w-5 mx-2 text-red-400" />
                <span className="text-base">for Zimbabwe</span>
              </div>
              <a 
                href="https://www.nyuchi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors text-base font-medium"
              >
                Nyuchi Web Services
              </a>
              <p className="text-sm text-gray-400 mt-2">
                © {new Date().getFullYear()} Harare Metro. All rights reserved
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* CSS for fade-in animation */}
      <style jsx>{`
        .animate-fade-in {
          opacity: 1 !important;
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </HelmetProvider>
  )
}

function getCategoryColor(category) {
  const colors = {
    politics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    economy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', 
    business: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
    harare: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    agriculture: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    technology: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200',
    health: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    education: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    entertainment: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200',
    environment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    crime: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    international: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200',
    lifestyle: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    finance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200'
  }
  return colors[category] || colors.general
}

export default App