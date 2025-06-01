import React, { useState, useEffect, useCallback } from 'react'
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
  TagIcon
} from '@heroicons/react/24/outline'

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

  // Zimbabwe-inspired color schemes
  const themes = {
    light: {
      bg: 'bg-gradient-to-br from-green-500 via-yellow-400 to-red-500', // Zimbabwe flag colors
      headerBg: 'bg-white/95',
      cardBg: 'bg-white/95',
      statsBg: 'bg-white/20',
      footerBg: 'bg-white/20',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textLight: 'text-white',
      textMuted: 'text-gray-500',
      border: 'border-white/30',
      accent: 'bg-green-600 hover:bg-green-700', // Zimbabwe green
      accentText: 'text-green-600 hover:text-green-700'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 via-green-900 to-gray-800', // Dark with Zimbabwe green accent
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

  // Detect system theme and apply
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

    // Listen for system theme changes
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

  const filteredFeeds = selectedCategory === 'all' 
    ? feeds 
    : feeds.filter(feed => feed.category === selectedCategory)

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

  if (loading && feeds.length === 0) {
    return (
      <div className={`min-h-screen ${currentColors.bg} flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Zimbabwe News</h2>
          <p className="text-white/80">Connecting to local news sources...</p>
        </div>
      </div>
    )
  }

  if (error && feeds.length === 0) {
    return (
      <div className={`min-h-screen ${currentColors.bg} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className={`${currentColors.cardBg} backdrop-blur-sm rounded-xl p-6 shadow-xl`}>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className={`text-xl font-semibold ${currentColors.text} mb-2`}>
              Failed to Load News
            </h2>
            <p className={`${currentColors.textSecondary} mb-4`}>{error}</p>
            <button 
              onClick={loadFeeds}
              className={`${currentColors.accent} text-white px-6 py-2 rounded-lg transition-colors font-medium`}
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
      {/* Header */}
      <header className={`${currentColors.headerBg} backdrop-blur-sm shadow-lg sticky top-0 z-50`}>
        <div className="w-full max-w-none px-4">
          <div className="flex items-center justify-between h-16 min-w-0">
            <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
              <span className="text-xl sm:text-2xl">🇿🇼</span>
              <div>
                <h1 className={`text-lg sm:text-xl font-bold ${currentColors.text} truncate`}>
                  Harare Metro
                </h1>
                <p className={`text-xs ${currentColors.textSecondary} hidden sm:block`}>
                  Zimbabwe News Aggregator
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => changeTheme('light')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  theme === 'light' 
                    ? 'bg-white/20 text-yellow-400' 
                    : `${currentColors.textMuted} hover:text-yellow-400`
                }`}
                title="Light mode"
              >
                <SunIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/20 text-blue-400' 
                    : `${currentColors.textMuted} hover:text-blue-400`
                }`}
                title="Dark mode"
              >
                <MoonIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => changeTheme('system')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  theme === 'system' 
                    ? 'bg-white/20 text-green-400' 
                    : `${currentColors.textMuted} hover:text-green-400`
                }`}
                title="System preference"
              >
                <ComputerDesktopIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={loadFeeds}
                disabled={loading}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${currentColors.textMuted} hover:text-green-400 disabled:opacity-50`}
                title="Refresh news"
              >
                <ArrowPathIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
        {/* Stats */}
        <div className={`${currentColors.statsBg} backdrop-blur-md rounded-xl p-4 mb-6 ${currentColors.textLight}`}>
          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <span className="flex items-center space-x-1">
                <NewspaperIcon className="h-4 w-4" />
                <span>{feeds.length} articles</span>
              </span>
              <span className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4" />
                <span>{priorityCount} priority</span>
              </span>
              <span className="flex items-center space-x-1">
                <FunnelIcon className="h-4 w-4" />
                <span>{categoryCount} categories</span>
              </span>
            </div>
            {lastUpdated && (
              <span className="flex items-center space-x-1 text-xs opacity-75">
                <ClockIcon className="h-3 w-3" />
                <span>Updated {formatDate(lastUpdated)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {categoriesToShow.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? `${currentColors.accent} text-white shadow-lg`
                    : `${currentColors.cardBg} ${currentColors.text} hover:shadow-md backdrop-blur-sm`
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          
          {/* Show More/Less Categories Button */}
          {secondaryCategories.length > 0 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className={`${currentColors.textLight} hover:text-white text-sm font-medium flex items-center space-x-1 opacity-80 hover:opacity-100 transition-opacity`}
            >
              <span>
                {showAllCategories ? 'Show Less' : `+${secondaryCategories.length} More Categories`}
              </span>
            </button>
          )}
        </div>

        {/* Content */}
        {error && feeds.length > 0 && (
          <div className="bg-red-500/90 backdrop-blur-md text-white p-4 rounded-xl mb-6">
            <h3 className="font-semibold mb-2">Error Refreshing News</h3>
            <p className="text-sm opacity-90">{error}</p>
            <button
              onClick={loadFeeds}
              className="mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {filteredFeeds.length === 0 ? (
          <div className={`${currentColors.statsBg} backdrop-blur-md ${currentColors.textLight} p-8 rounded-xl text-center`}>
            <FunnelIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
            <p className="text-sm opacity-75">
              {selectedCategory === 'all' 
                ? 'No news articles are currently available.' 
                : `No articles found in the "${CATEGORIES.find(c => c.id === selectedCategory)?.label}" category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Footer */}
      <footer className={`${currentColors.footerBg} backdrop-blur-sm ${currentColors.border} border-t mt-12 sm:mt-16 w-full`}>
        <div className="w-full px-4 py-6 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-white max-w-6xl mx-auto">
            
            {/* Company Info */}
            <div className="text-center md:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Developed by</h3>
              <a 
                href="https://www.nyuchi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-300 hover:text-white transition-colors font-medium text-base sm:text-lg break-words"
              >
                Nyuchi Web Services
              </a>
              <p className="text-xs sm:text-sm opacity-80 mt-2">Professional web solutions</p>
            </div>

            {/* Project Links */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Project</h3>
              <div className="space-y-3">
                <div>
                  <a 
                    href="https://github.com/nyuchitech/harare-metro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-white transition-colors inline-flex items-center text-sm sm:text-base break-words"
                  >
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub Repository</span>
                  </a>
                </div>
                <div className="text-xs sm:text-sm opacity-80">
                  MIT License
                </div>
              </div>
            </div>

            {/* Made with Love */}
            <div className="text-center md:text-right">
              <div className="inline-flex items-center text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                <span>Built with</span>
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 mx-2 text-red-400 flex-shrink-0" />
                <span>for Zimbabwe</span>
              </div>
              <p className="text-xs sm:text-sm opacity-80">
                Bringing local news to your fingertips
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center max-w-6xl mx-auto">
            <p className="text-xs sm:text-sm text-white break-words">
              © {new Date().getFullYear()} Nyuchi Web Services - Harare Metro. All rights reserved.
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
    <article className={`${currentColors.cardBg} backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 ${currentColors.border} border w-full min-w-0`}>
      {/* Article Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 min-w-0">
        <span className={`text-xs sm:text-sm font-semibold ${currentColors.accentText} truncate flex-shrink-0`}>
          {article.source}
        </span>
        <div className={`flex items-center text-xs ${currentColors.textMuted} flex-shrink-0`}>
          <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
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
      
      {/* Title with Priority Badge */}
      <h2 className={`text-base sm:text-lg font-semibold ${currentColors.text} mb-3 sm:mb-4 line-clamp-2 leading-tight min-w-0`}>
        <span className="break-words">{article.title}</span>
        {article.priority && (
          <span className="ml-2 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white whitespace-nowrap">
            🇿🇼 Priority
          </span>
        )}
      </h2>
      
      {/* Description */}
      {article.description && (
        <p className={`${currentColors.textSecondary} text-sm mb-4 sm:mb-5 line-clamp-3 leading-relaxed break-words`}>
          {article.description}
        </p>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-auto gap-2 min-w-0">
        <div className="flex items-center min-w-0 flex-shrink">
          <TagIcon className={`h-3 w-3 mr-1 ${currentColors.textMuted} flex-shrink-0`} />
          <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium ${getCategoryColor(article.category)} truncate`}>
            {categoryInfo?.icon || '📰'} {article.category}
          </span>
        </div>
        
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${currentColors.accentText} text-xs sm:text-sm font-medium inline-flex items-center group transition-colors flex-shrink-0`}
        >
          <span className="hidden sm:inline">Read Article</span>
          <span className="sm:hidden">Read</span>
          <GlobeAltIcon className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </a>
      </div>
    </article>
  )
}

function getCategoryColor(category) {
  const colors = {
    politics: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    economy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', 
    business: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    harare: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    agriculture: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    technology: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    health: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    education: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    entertainment: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    environment: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    crime: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    international: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    lifestyle: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300'
  }
  return colors[category] || colors.general
}

export default App