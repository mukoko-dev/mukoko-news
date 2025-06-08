import React, { useState, useEffect, useMemo } from 'react'
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ArrowLeftIcon,
  PhotoIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  NewspaperIcon,
  ArrowTrendingUpIcon, // Changed from TrendingUpIcon
  GlobeAltIcon
} from '@heroicons/react/24/outline'

function SearchPage({ 
  currentColors, 
  allFeeds, 
  onClose,
  onSelectArticle 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem('recentSearches') || '[]')
  )

  // Calculate analytics from articles
  const analytics = useMemo(() => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const categoryCounts = {}
    const sourceCounts = {}
    const hourlyActivity = Array(24).fill(0)
    let todayArticles = 0
    let weekArticles = 0
    let totalImages = 0

    allFeeds.forEach(article => {
      const articleDate = new Date(article.pubDate)
      
      // Category counts
      if (article.category) {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1
      }
      
      // Source counts
      sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1
      
      // Time-based analytics
      if (articleDate > oneDayAgo) todayArticles++
      if (articleDate > oneWeekAgo) weekArticles++
      
      // Hourly activity
      const hour = articleDate.getHours()
      hourlyActivity[hour]++
      
      // Image count
      if (article.optimizedImageUrl) totalImages++
    })

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    const topSources = Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))

    return {
      total: allFeeds.length,
      todayArticles,
      weekArticles,
      totalImages,
      topCategories,
      topSources,
      peakHour,
      imagePercentage: Math.round((totalImages / allFeeds.length) * 100)
    }
  }, [allFeeds])

  // Filter articles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const results = allFeeds.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.description?.toLowerCase().includes(query) ||
      article.source.toLowerCase().includes(query)
    ).slice(0, 20) // Limit results for performance
    
    setSearchResults(results)
  }, [searchQuery, allFeeds])

  const saveSearch = (query) => {
    if (!query.trim()) return
    
    const updated = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 8)
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const clearHistory = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const trendingTerms = ['Zimbabwe', 'Harare', 'Economy', 'Politics', 'Sports', 'Business']

  return (
    <div className={`fixed inset-0 ${currentColors.bg} z-50`}>
      {/* Header with Search */}
      <div className={`${currentColors.headerBg} backdrop-blur-lg border-b ${currentColors.border} py-3 px-4`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 -ml-2 ${currentColors.text}`}
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="search"
              className={`w-full pl-10 pr-10 py-3 rounded-xl text-base ${
                currentColors.cardBg
              } ${currentColors.border} border ${currentColors.text} placeholder-gray-400`}
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <MagnifyingGlassIcon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-73px)] pb-20">
        {!searchQuery ? (
          <div className="p-4 space-y-6">
            {/* Analytics Cards */}
            <div className="space-y-4">
              <h2 className={`text-xl font-bold ${currentColors.text} mb-4`}>
                News Analytics
              </h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${currentColors.text}`}>
                        {analytics.total}
                      </p>
                      <p className={`text-sm ${currentColors.textMuted}`}>Total Articles</p>
                    </div>
                    <NewspaperIcon className={`w-8 h-8 ${currentColors.textMuted}`} />
                  </div>
                </div>

                <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${currentColors.text}`}>
                        {analytics.todayArticles}
                      </p>
                      <p className={`text-sm ${currentColors.textMuted}`}>Today</p>
                    </div>
                    <FireIcon className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${currentColors.text}`}>
                        {analytics.imagePercentage}%
                      </p>
                      <p className={`text-sm ${currentColors.textMuted}`}>With Images</p>
                    </div>
                    <PhotoIcon className={`w-8 h-8 ${currentColors.textMuted}`} />
                  </div>
                </div>

                <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${currentColors.text}`}>
                        {analytics.peakHour}:00
                      </p>
                      <p className={`text-sm ${currentColors.textMuted}`}>Peak Hour</p>
                    </div>
                    <ClockIcon className={`w-8 h-8 ${currentColors.textMuted}`} />
                  </div>
                </div>
              </div>

              {/* Top Sources */}
              <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                <h3 className={`text-lg font-semibold ${currentColors.text} mb-3 flex items-center`}>
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Top News Sources
                </h3>
                <div className="space-y-2">
                  {analytics.topSources.map(([source, count], index) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center mr-3`}>
                          {index + 1}
                        </span>
                        <span className={`${currentColors.text} font-medium`}>{source}</span>
                      </div>
                      <span className={`${currentColors.textMuted} text-sm`}>{count} articles</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Terms - Updated icon */}
              <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                <h3 className={`text-lg font-semibold ${currentColors.text} mb-3 flex items-center`}>
                  <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTerms.map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        currentColors.categoryButton
                      }`}
                    >
                      #{term}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-semibold ${currentColors.text}`}>
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearHistory}
                    className={`text-sm ${currentColors.textMuted}`}
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(query)}
                      className={`px-3 py-2 rounded-full text-sm ${currentColors.statsBg} ${currentColors.text}`}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Search Results */
          <div className="p-4">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <p className={`text-sm ${currentColors.textMuted} mb-4`}>
                  {searchResults.length} results for "{searchQuery}"
                </p>
                {searchResults.map((article) => (
                  <button
                    key={article.guid}
                    onClick={() => {
                      saveSearch(searchQuery)
                      onSelectArticle(article)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl ${currentColors.cardBg} ${currentColors.border} border transition-colors active:scale-95`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {article.optimizedImageUrl ? (
                        <img
                          src={article.optimizedImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${currentColors.statsBg} flex items-center justify-center`}>
                          <PhotoIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className={`${currentColors.text} font-medium line-clamp-2 text-sm leading-tight`}>
                        {article.title}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <p className={`${currentColors.textMuted} text-xs`}>
                          {article.source}
                        </p>
                        <span className={`${currentColors.textMuted} text-xs`}>•</span>
                        <p className={`${currentColors.textMuted} text-xs`}>
                          {new Date(article.pubDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className={`w-16 h-16 ${currentColors.textMuted} mx-auto mb-4`} />
                <h3 className={`text-lg font-medium ${currentColors.text} mb-2`}>
                  No results found
                </h3>
                <p className={`${currentColors.textMuted} text-sm`}>
                  Try searching for something else
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage