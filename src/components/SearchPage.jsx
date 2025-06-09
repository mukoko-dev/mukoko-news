import React, { useState, useMemo, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  FunnelIcon,
  NewspaperIcon,
  StarIcon,
  PhotoIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline'

const SearchPage = ({ currentColors, allFeeds, onClose, onSelectArticle, lastUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAnalytics, setShowAnalytics] = useState(true)

  // Categories for filtering
  const CATEGORIES = [
    { id: 'all', label: 'All News', icon: '📰' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'economy', label: 'Economy', icon: '💰' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'harare', label: 'Harare', icon: '🏙️' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { id: 'environment', label: 'Environment', icon: '🌍' },
    { id: 'crime', label: 'Crime & Security', icon: '🚔' },
    { id: 'international', label: 'International', icon: '🌐' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
    { id: 'finance', label: 'Finance', icon: '💳' }
  ]

  // Search results (for displaying search suggestions, not a feed)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase().trim()
    return allFeeds
      .filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query) ||
        article.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      )
      .slice(0, 5) // Only show top 5 suggestions
  }, [allFeeds, searchQuery])

  // Comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Source distribution
    const sourceCount = {}
    allFeeds.forEach(article => {
      sourceCount[article.source] = (sourceCount[article.source] || 0) + 1
    })
    const topSources = Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    // Category distribution
    const categoryCount = {}
    allFeeds.forEach(article => {
      const cat = article.category || 'uncategorized'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    // Keywords frequency
    const keywordCount = {}
    allFeeds.forEach(article => {
      if (article.keywords) {
        article.keywords.forEach(keyword => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1
        })
      }
    })
    const topKeywords = Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    // Time-based stats
    const last24h = allFeeds.filter(article => new Date(article.pubDate) > oneDayAgo)
    const lastWeek = allFeeds.filter(article => new Date(article.pubDate) > oneWeekAgo)

    return {
      total: allFeeds.length,
      priority: allFeeds.filter(article => article.priority).length,
      withImages: allFeeds.filter(article => article.optimizedImageUrl).length,
      last24h: last24h.length,
      lastWeek: lastWeek.length,
      sourcesCount: Object.keys(sourceCount).length,
      categoriesCount: Object.keys(categoryCount).length,
      avgPerDay: Math.round(allFeeds.length / 7),
      topSources,
      topCategories,
      topKeywords
    }
  }, [allFeeds])

  // Handle search
  const handleSearch = (query) => {
    if (query.trim()) {
      onClose()
      // Trigger search in main app
      window.dispatchEvent(new CustomEvent('globalSearch', { detail: query }))
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && searchQuery.trim()) {
        handleSearch(searchQuery)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, searchQuery])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Panel */}
      <div className={`absolute inset-x-0 top-0 h-full ${currentColors.bg} overflow-y-auto`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`sticky top-0 ${currentColors.headerBg} backdrop-blur-lg border-b ${currentColors.border} p-4`}>
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className={`p-3 rounded-lg ${currentColors.text}`}
                aria-label="Close search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon 
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${currentColors.textMuted}`}
                  />
                  <input
                    type="search"
                    placeholder="Search Zimbabwe news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 text-base ${currentColors.cardBg} ${currentColors.text} border ${currentColors.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
                aria-label="Toggle analytics"
              >
                <ChartBarIcon className={`p-3 rounded-lg ${currentColors.text}`} />
              </button>
            </div>

            {/* Search Suggestions */}
            {searchQuery && searchResults.length > 0 && (
              <div className={`mt-3 ${currentColors.cardBg} border ${currentColors.border} rounded-xl p-3`}>
                <h4 className={`text-sm font-medium ${currentColors.text} mb-2`}>
                  Found {searchResults.length} matches:
                </h4>
                <div className="space-y-2">
                  {searchResults.map((article, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectArticle(article)
                        onClose()
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${currentColors.categoryButton} hover:bg-blue-100 dark:hover:bg-blue-900/30`}
                    >
                      <div className={`text-sm font-medium ${currentColors.text} line-clamp-1`}>
                        {article.title}
                      </div>
                      <div className={`text-xs ${currentColors.textMuted}`}>
                        {article.source} • {new Date(article.pubDate).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className={`mt-3 w-full py-2 px-4 rounded-lg ${currentColors.accent} text-sm font-medium transition-colors hover:opacity-90`}
                  style={{ 
                  color: currentColors.accent?.includes('white') || currentColors.accent?.includes('gray-100') ? 'black' : 'white'
                  }}
                >
                  Search All Results
                </button>
              </div>
            )}
          </div>

          {/* Analytics Dashboard */}
          {showAnalytics && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className={`text-xl font-bold ${currentColors.text} mb-2`}>
                  Zimbabwe News Analytics
                </h2>
                <p className={`${currentColors.textMuted}`}>
                  Real-time insights from 21+ trusted news sources
                </p>
              </div>

              

              {/* Detailed Analytics */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Trending Keywords */}
                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-6`}>
                  <h3 className={`text-lg font-semibold ${currentColors.text} mb-4`}>
                    Trending Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topKeywords.map(([keyword, count], index) => (
                      <button
                        key={keyword}
                        onClick={() => {
                          setSearchQuery(keyword)
                          handleSearch(keyword)
                        }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentColors.categoryButton} hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors`}
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {keyword} ({count})
                      </button>
                    ))}
                  </div>
                </div>
                
                
                {/* Top Sources */}
                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-6`}>
                  <h3 className={`text-lg font-semibold ${currentColors.text} mb-4`}>
                    Top News Sources
                  </h3>
                  <div className="space-y-3">
                    {analytics.topSources.map(([source, count], index) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className={`text-sm ${currentColors.text}`}>{source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / analytics.topSources[0][1]) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${currentColors.text} w-8 text-right`}>
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Categories */}
                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-6`}>
                  <h3 className={`text-lg font-semibold ${currentColors.text} mb-4`}>
                    Popular Categories
                  </h3>
                  <div className="space-y-3">
                    {analytics.topCategories.map(([category, count], index) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className={`text-sm ${currentColors.text} capitalize`}>
                          {CATEGORIES.find(c => c.id === category)?.icon} {category}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(count / analytics.topCategories[0][1]) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${currentColors.text} w-8 text-right`}>
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                

              {/* Activity Stats */}
              <div className={`mt-6 ${currentColors.cardBg} border ${currentColors.border} rounded-xl p-6`}>
                <h3 className={`text-lg font-semibold ${currentColors.text} mb-4`}>
                  Publishing Activity
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className={`text-xl font-bold ${currentColors.text}`}>{analytics.avgPerDay}</div>
                    <div className={`text-sm ${currentColors.textMuted}`}>Avg/Day</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${currentColors.text}`}>{analytics.lastWeek}</div>
                    <div className={`text-sm ${currentColors.textMuted}`}>This Week</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${currentColors.text}`}>
                      {Math.round((analytics.priority / analytics.total) * 100)}%
                    </div>
                    <div className={`text-sm ${currentColors.textMuted}`}>Priority Rate</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${currentColors.text}`}>
                      {Math.round((analytics.withImages / analytics.total) * 100)}%
                    </div>
                    <div className={`text-sm ${currentColors.textMuted}`}>Image Rate</div>
                  </div>
                </div>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-4 text-center`}>
                  <NewspaperIcon className={`h-8 w-8 ${currentColors.textMuted} mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${currentColors.text}`}>{analytics.total}</div>
                  <div className={`text-sm ${currentColors.textMuted}`}>Total Articles</div>
                </div>

                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-4 text-center`}>
                  <StarIcon className={`h-8 w-8 text-yellow-500 mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${currentColors.text}`}>{analytics.priority}</div>
                  <div className={`text-sm ${currentColors.textMuted}`}>Priority News</div>
                </div>

                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-4 text-center`}>
                  <PhotoIcon className={`h-8 w-8 ${currentColors.textMuted} mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${currentColors.text}`}>{analytics.withImages}</div>
                  <div className={`text-sm ${currentColors.textMuted}`}>With Images</div>
                </div>

                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-4 text-center`}>
                  <ClockIcon className={`h-8 w-8 text-green-500 mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${currentColors.text}`}>{analytics.last24h}</div>
                  <div className={`text-sm ${currentColors.textMuted}`}>Last 24 Hours</div>
                </div>

                <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-4 text-center`}>
                  <GlobeAltIcon className={`h-8 w-8 ${currentColors.textMuted} mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${currentColors.text}`}>{analytics.sourcesCount}</div>
                  <div className={`text-sm ${currentColors.textMuted}`}>News Sources</div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage