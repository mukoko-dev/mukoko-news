import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  XMarkIcon
} from '@heroicons/react/24/outline'

// Logo Component
const Logo = ({ 
  variant = 'main', // 'main', 'horizontal', 'compact'
  theme = 'light', // 'light', 'dark'
  size = 'md' // 'sm', 'md', 'lg'
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
  
  if (variant === 'main') {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="logo-main">
        <rect x="2" y="2" width={width-4} height={height-4} fill="none" stroke={stroke} strokeWidth="2"/>
        <rect x="6" y="6" width={width-12} height={height-12} fill="none" stroke={stroke} strokeWidth="1"/>
        <text x={width/2} y={height*0.63} textAnchor="middle" 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.53} 
              fontWeight="bold" 
              fill={fill}>HM</text>
        <text x={width/2} y={height*0.83} textAnchor="middle" 
              fontFamily="Georgia, Times New Roman, serif" 
              fontSize={height*0.13} 
              fill={subtitle}
              letterSpacing="2px">HARARE METRO</text>
      </svg>
    )
  }
  
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
  
  // compact variant
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

// All available categories with display info
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

function App() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [theme, setTheme] = useState('system')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)

  // Zimbabwe-inspired color schemes (optimized for performance)
  const themes = {
    light: {
      bg: 'bg-gradient-to-br from-green-500 via-yellow-400 to-red-500',
      headerBg: 'bg-white/95',
      cardBg: 'bg-white/95',
      statsBg: 'bg-white/20',
      footerBg: 'bg-white/20',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textLight: 'text-white',
      textMuted: 'text-gray-500',
      border: 'border-white/30',
      accent: 'bg-green-600 hover:bg-green-700',
      accentText: 'text-green-600 hover:text-green-700'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 via-green-900 to-gray-800',
      headerBg: 'bg-gray-900/95',
      cardBg: 'bg-gray-800/95',
      statsBg: 'bg-gray-800/40',
      footerBg: 'bg-gray-900/40',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textLight: 'text-white',
      textMuted: 'text-gray-400',
      border: 'border-gray-700/50',
      accent: 'bg-green-600 hover:bg-green-500',
      accentText: 'text-green-400 hover:text-green-300'
    }
  }

  // Theme management
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

  // Load feeds function (optimized)
  const loadFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/feeds')
      if (!response.ok) {
        throw new Error(`Failed to load news: ${response.status}`)
      }
      
      const data = await response.json()
      setFeeds(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
      console.error('Error loading feeds:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFeeds()
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(loadFeeds, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadFeeds])

  // Optimized filtering with search and memoization
  const filteredFeeds = useMemo(() => {
    let filtered = feeds

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(feed => feed.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(feed => 
        feed.title.toLowerCase().includes(query) ||
        feed.description?.toLowerCase().includes(query) ||
        feed.source.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [feeds, selectedCategory, searchQuery])

  const priorityCount = feeds.filter(feed => feed.priority).length
  const categoryCount = new Set(feeds.map(feed => feed.category)).size

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
  const categoriesToShow = showAllCategories 
    ? CATEGORIES 
    : primaryCategories

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

  if (loading && feeds.length === 0) {
    return (
      <div className={`min-h-screen ${currentColors.bg} flex items-center justify-center`}>
        <div className="text-center text-white px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Harare Metro News</h2>
          <p className="text-white/80 text-sm">Connecting to local news sources...</p>
        </div>
      </div>
    )
  }

  if (error && feeds.length === 0) {
    return (
      <div className={`min-h-screen ${currentColors.bg} flex items-center justify-center p-4`}>
        <div className="text-center max-w-sm mx-auto">
          <div className={`${currentColors.cardBg} backdrop-blur-sm rounded-xl p-6 shadow-xl`}>
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className={`text-lg font-semibold ${currentColors.text} mb-2`}>
              Failed to Load News
            </h2>
            <p className={`${currentColors.textSecondary} mb-4 text-sm`}>{error}</p>
            <button 
              onClick={loadFeeds}
              className={`${currentColors.accent} text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${currentColors.bg} flex flex-col`}>
      {/* Header - Updated with Logo */}
      <header className={`${currentColors.headerBg} backdrop-blur-sm shadow-lg sticky top-0 z-50`}>
        <div className="w-full px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 min-w-0">
              {/* Use compact logo on mobile, horizontal on larger screens */}
              <div className="hidden sm:block">
                <Logo 
                  variant="horizontal" 
                  theme={getCurrentTheme()} 
                  size="sm" 
                />
              </div>
              <div className="sm:hidden">
                <Logo 
                  variant="compact" 
                  theme={getCurrentTheme()} 
                  size="sm" 
                />
              </div>
              <div className="min-w-0 ml-2 sm:hidden">
                <p className={`text-xs ${currentColors.textSecondary}`}>
                  Harare Metro
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Search Button */}
              <button
                onClick={handleSearchToggle}
                className={`p-2 rounded-md transition-colors ${
                  isSearchActive 
                    ? 'bg-green-500 text-white' 
                    : `${currentColors.textMuted} hover:text-green-400`
                }`}
                title="Search news"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
              
              {/* Theme Controls - Compressed for mobile */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-0.5">
                <button
                  onClick={() => changeTheme('light')}
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'light' 
                      ? 'bg-white/20 text-yellow-400' 
                      : `${currentColors.textMuted} hover:text-yellow-400`
                  }`}
                >
                  <SunIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={() => changeTheme('dark')}
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/20 text-blue-400' 
                      : `${currentColors.textMuted} hover:text-blue-400`
                  }`}
                >
                  <MoonIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={() => changeTheme('system')}
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'system' 
                      ? 'bg-white/20 text-green-400' 
                      : `${currentColors.textMuted} hover:text-green-400`
                  }`}
                >
                  <ComputerDesktopIcon className="h-3 w-3" />
                </button>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={loadFeeds}
                disabled={loading}
                className={`p-2 rounded-md transition-colors ${currentColors.textMuted} hover:text-green-400 disabled:opacity-50`}
                title="Refresh news"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4">
        {/* Search Bar */}
        {isSearchActive && (
          <div className={`${currentColors.cardBg} backdrop-blur-sm rounded-lg p-3 mb-4 shadow-lg`}>
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${currentColors.textMuted}`} />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 ${currentColors.text} placeholder-gray-500 text-sm`}
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
                Found {filteredFeeds.length} articles matching "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Stats - Compact for mobile */}
        <div className={`${currentColors.statsBg} backdrop-blur-md rounded-lg p-3 mb-4 ${currentColors.textLight}`}>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <NewspaperIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{filteredFeeds.length}</span>
              </span>
              <span className="flex items-center space-x-1">
                <StarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{priorityCount}</span>
              </span>
            </div>
            {lastUpdated && (
              <span className="flex items-center space-x-1 opacity-75">
                <ClockIcon className="h-3 w-3" />
                <span className="hidden sm:inline">Updated </span>
                <span>{formatDate(lastUpdated)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Filters - Horizontal Scroll on Mobile */}
        <div className="mb-4 sm:mb-6">
          {/* Scrollable Categories */}
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-2 min-w-max">
              {categoriesToShow.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category.id
                      ? `${currentColors.accent} text-white shadow-lg`
                      : `${currentColors.cardBg} ${currentColors.text} hover:shadow-md backdrop-blur-sm`
                  }`}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Show More/Less Categories Button */}
          {secondaryCategories.length > 0 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className={`${currentColors.textLight} hover:text-white text-xs sm:text-sm font-medium opacity-80 hover:opacity-100 transition-opacity mt-2`}
            >
              {showAllCategories ? 'Show Less' : `+${secondaryCategories.length} More`}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && feeds.length > 0 && (
          <div className="bg-red-500/90 backdrop-blur-md text-white p-3 rounded-lg mb-4">
            <h3 className="font-semibold mb-1 text-sm">Error Refreshing</h3>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        )}

        {/* Content - Optimized Grid */}
        {filteredFeeds.length === 0 ? (
          <div className={`${currentColors.statsBg} backdrop-blur-md ${currentColors.textLight} p-6 rounded-lg text-center`}>
            <div className="text-3xl mb-2">
              {searchQuery ? '🔍' : '📰'}
            </div>
            <h3 className="text-sm font-semibold mb-1">
              {searchQuery ? 'No Search Results' : 'No Articles Found'}
            </h3>
            <p className="text-xs opacity-75">
              {searchQuery 
                ? `No articles match "${searchQuery}"` 
                : selectedCategory === 'all' 
                  ? 'No news articles available.' 
                  : `No articles in "${CATEGORIES.find(c => c.id === selectedCategory)?.label}".`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeeds.slice(0, 50).map((article, index) => (
              <ArticleCard 
                key={article.guid || index} 
                article={article} 
                currentColors={currentColors}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Updated */}
      <footer className={`${currentColors.footerBg} backdrop-blur-sm ${currentColors.border} border-t mt-8`}>
        <div className="px-3 sm:px-4 py-4 sm:py-6">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 mx-1 text-red-400" />
              <span>for Zimbabwe</span>
            </div>
            <a 
              href="https://www.nyuchi.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-300 hover:text-white transition-colors text-sm"
            >
              Nyuchi Web Services
            </a>
            <p className="text-xs opacity-80 mt-1">
              © {new Date().getFullYear()} Harare Metro. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ArticleCard({ article, currentColors }) {
  const categoryInfo = CATEGORIES.find(cat => cat.id === article.category)
  
  return (
    <article className={`${currentColors.cardBg} backdrop-blur-sm rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-0.5 ${currentColors.border} border`}>
      {/* Article Header - Compact */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className={`text-xs font-semibold ${currentColors.accentText} truncate`}>
          {article.source}
        </span>
        <div className={`flex items-center text-xs ${currentColors.textMuted}`}>
          <span className="whitespace-nowrap">
            {new Date(article.pubDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      
      {/* Title with Priority Badge - Optimized */}
      <h2 className={`text-sm sm:text-base font-semibold ${currentColors.text} mb-2 sm:mb-3 line-clamp-2 leading-tight`}>
        {article.title}
        {article.priority && (
          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
            🇿🇼
          </span>
        )}
      </h2>
      
      {/* Description - Mobile optimized */}
      {article.description && (
        <p className={`${currentColors.textSecondary} text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-3 leading-relaxed`}>
          {article.description}
        </p>
      )}
      
      {/* Footer - Compact */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(article.category)} truncate flex-shrink-0`}>
          <span className="hidden sm:inline">{categoryInfo?.icon || '📰'} </span>
          {article.category}
        </span>
        
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${currentColors.accentText} text-xs font-medium inline-flex items-center group transition-colors`}
        >
          <span>Read</span>
          <GlobeAltIcon className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </article>
  )
}

function getCategoryColor(category) {
  const colors = {
    politics: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    economy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', 
    business: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    harare: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    agriculture: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    technology: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    health: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    education: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    entertainment: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    environment: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    crime: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    international: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    lifestyle: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
    finance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300'
  }
  return colors[category] || colors.general
}

export default App