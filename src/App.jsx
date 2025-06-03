import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

  // Clean monochrome color schemes with better contrast
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

  // Generate dynamic SEO data based on current state
  const generateSEOData = () => {
    const baseKeywords = [
      'Zimbabwe news',
      'Harare news',
      'Zimbabwe politics',
      'Zimbabwe economy',
      'Herald Zimbabwe',
      'NewsDay',
      'Chronicle',
      'ZBC News'
    ]

    // Add current category to keywords if not 'all'
    if (selectedCategory !== 'all') {
      const categoryInfo = CATEGORIES.find(cat => cat.id === selectedCategory)
      if (categoryInfo) {
        baseKeywords.unshift(`Zimbabwe ${categoryInfo.label.toLowerCase()}`)
        baseKeywords.unshift(`${categoryInfo.label} news Zimbabwe`)
      }
    }

    // Add sources from current feeds
    const uniqueSources = [...new Set(feeds.map(feed => feed.source))]
    baseKeywords.push(...uniqueSources)

    // Add popular categories from current feeds
    const popularCategories = [...new Set(feeds.slice(0, 10).map(feed => feed.category))]
    popularCategories.forEach(cat => {
      if (cat !== 'general') {
        baseKeywords.push(`Zimbabwe ${cat}`)
      }
    })

    let title = ''
    let description = 'Stay informed with the latest news from Zimbabwe. '

    if (selectedCategory !== 'all') {
      const categoryInfo = CATEGORIES.find(cat => cat.id === selectedCategory)
      title = `${categoryInfo.label} News Zimbabwe`
      description = `Latest ${categoryInfo.label.toLowerCase()} news and updates from Zimbabwe. `
    }

    if (searchQuery) {
      title = `Search: ${searchQuery}`
      description = `Search results for "${searchQuery}" in Zimbabwe news. `
    }

    description += `Real-time aggregation from ${uniqueSources.slice(0, 3).join(', ')} and more trusted local sources.`

    return {
      title,
      description,
      keywords: baseKeywords.join(', '),
      url: `https://www.hararemetro.co.zw${selectedCategory !== 'all' ? `/?category=${selectedCategory}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`
    }
  }

  const seoData = generateSEOData()

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

  if (error && feeds.length === 0) {
    return (
      <HelmetProvider>
        <SEO />
        <div className={`min-h-screen ${currentColors.bg} flex items-center justify-center p-4 font-serif`}>
          <div className="text-center max-w-md mx-auto">
            <div className={`${currentColors.cardBg} rounded-xl p-8 shadow-xl ${currentColors.border} border`}>
              <div className="text-red-500 text-5xl mb-6">❌</div>
              <h2 className={`text-xl font-semibold ${currentColors.text} mb-3`}>
                Failed to Load News
              </h2>
              <p className={`${currentColors.textSecondary} mb-6 text-base`}>{error}</p>
              <button 
                onClick={loadFeeds}
                className={`${currentColors.accent} text-white px-6 py-3 rounded-lg transition-colors font-medium text-base`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </HelmetProvider>
    )
  }

  return (
    <HelmetProvider>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
      />
      <div className={`min-h-screen ${currentColors.bg} flex flex-col font-serif`}>
        {/* Header - Reduced padding */}
        <header className={`${currentColors.headerBg} backdrop-blur-sm shadow-lg sticky top-0 z-50 ${currentColors.border} border-b`}>
          <div className="w-full px-3 sm:px-4">
            <div className="flex items-center justify-between h-12 sm:h-14">
              {/* Logo Section */}
              <div className="flex items-center space-x-2 min-w-0">
                {/* Use horizontal logo on tablet, desktop and larger (769px and up) */}
                <div className="hidden md:block">
                  <Logo 
                    variant="horizontal" 
                    theme={getCurrentTheme()} 
                    size="sm" 
                  />
                </div>
                {/* Use compact logo on mobile only (768px and below) */}
                <div className="md:hidden">
                  <Logo 
                    variant="compact" 
                    theme={getCurrentTheme()} 
                    size="sm" 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Search Button */}
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
                
                {/* Theme Controls */}
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
                
                {/* Refresh Button */}
                <button
                  onClick={loadFeeds}
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
                  Found {filteredFeeds.length} articles matching "{searchQuery}"
                </p>
              )}
            </div>
          )}

          {/* Stats - Reduced padding */}
          <div className={`${currentColors.statsBg} rounded-xl p-3 mb-4 ${currentColors.border} border`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className={`flex items-center space-x-1.5 ${currentColors.text} font-medium`}>
                  <NewspaperIcon className="h-4 w-4" />
                  <span>{filteredFeeds.length} Articles</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${currentColors.text} font-medium`}>
                  <StarIcon className="h-4 w-4" />
                  <span>{priorityCount} Priority</span>
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

          {/* Category Filters - Reduced padding */}
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
            
            {/* Show More/Less Categories Button */}
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
          {error && feeds.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              <h3 className="font-semibold mb-2">Error Refreshing</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Content - Better spacing and larger text */}
          {filteredFeeds.length === 0 ? (
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
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredFeeds.slice(0, 30).map((article, index) => (
                <ArticleCard 
                  key={article.guid || index} 
                  article={article} 
                  currentColors={currentColors}
                />
              ))}
            </div>
          )}
        </div>

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
    </HelmetProvider>
  )
}

function ArticleCard({ article, currentColors }) {
  const categoryInfo = CATEGORIES.find(cat => cat.id === article.category)
  
  return (
    <article className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:transform hover:-translate-y-1`}>
      {/* Article Header - Better spacing */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className={`text-sm font-semibold ${currentColors.accentText} truncate`}>
          {article.source}
        </span>
        <div className={`flex items-center text-sm ${currentColors.textMuted}`}>
          <span className="whitespace-nowrap">
            {new Date(article.pubDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      
      {/* Title - Much larger and better spacing */}
      <h2 className={`text-lg sm:text-xl font-bold ${currentColors.text} mb-4 leading-tight`}>
        {article.title}
        {article.priority && (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
            🇿🇼 Priority
          </span>
        )}
      </h2>
      
      {/* Description - Larger text */}
      {article.description && (
        <p className={`${currentColors.textSecondary} text-base mb-4 leading-relaxed line-clamp-3`}>
          {article.description}
        </p>
      )}
      
      {/* Footer - Better spacing */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getCategoryColor(article.category)} truncate flex-shrink-0`}>
          <span className="mr-1.5">{categoryInfo?.icon || '📰'}</span>
          {article.category}
        </span>
        
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${currentColors.accentText} text-sm font-medium inline-flex items-center group transition-colors hover:underline`}
        >
          <span>Read Full Article</span>
          <GlobeAltIcon className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </article>
  )
}

function getCategoryColor(category) {
  // Zimbabwe flag colors for categories only
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