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
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const SearchPage = ({ currentColors, allFeeds, onClose, onSelectArticle, lastUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('relevance') // 'relevance', 'date', 'priority'

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

  // Filter and search articles
  const filteredArticles = useMemo(() => {
    let filtered = allFeeds

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query) ||
        article.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    // Sort articles
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.pubDate) - new Date(a.pubDate)
        case 'priority':
          if (a.priority !== b.priority) {
            return b.priority - a.priority
          }
          return new Date(b.pubDate) - new Date(a.pubDate)
        case 'relevance':
        default:
          // Priority first, then by relevance score, then by date
          if (a.priority !== b.priority) {
            return b.priority - a.priority
          }
          if (a.relevanceScore !== b.relevanceScore) {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0)
          }
          return new Date(b.pubDate) - new Date(a.pubDate)
      }
    })
  }, [allFeeds, selectedCategory, searchQuery, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    const filtered = filteredArticles
    const total = allFeeds
    
    return {
      totalArticles: total.length,
      filteredArticles: filtered.length,
      priorityCount: total.filter(article => article.priority).length,
      imageCount: total.filter(article => article.imageUrl || article.optimizedImageUrl).length,
      filteredPriority: filtered.filter(article => article.priority).length,
      filteredImages: filtered.filter(article => article.imageUrl || article.optimizedImageUrl).length,
      sourcesCount: [...new Set(total.map(article => article.source))].length,
      categoriesCount: [...new Set(total.map(article => article.category))].length
    }
  }, [allFeeds, filteredArticles])

  // Format date helper
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Panel */}
      <div className={`absolute inset-x-0 top-0 h-full ${currentColors.bg} overflow-y-auto`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`sticky top-0 ${currentColors.headerBg} backdrop-blur-lg border-b ${currentColors.border} p-4`}>
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${currentColors.categoryButton}`}
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
                    placeholder="Search articles, keywords, sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 text-base ${currentColors.cardBg} ${currentColors.text} border ${currentColors.border} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${currentColors.categoryButton}`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`${currentColors.statsBg} border-b ${currentColors.border} p-4`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div className={`flex flex-col items-center p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}>
                <NewspaperIcon className={`h-5 w-5 ${currentColors.textMuted} mb-1`} />
                <div className={`text-lg font-bold ${currentColors.text}`}>
                  {stats.filteredArticles}
                </div>
                <div className={`text-xs ${currentColors.textMuted} text-center`}>
                  {searchQuery || selectedCategory !== 'all' ? 'Filtered' : 'Total'} Articles
                </div>
                {stats.filteredArticles !== stats.totalArticles && (
                  <div className={`text-xs ${currentColors.textMuted} mt-1`}>
                    of {stats.totalArticles}
                  </div>
                )}
              </div>

              <div className={`flex flex-col items-center p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}>
                <StarIcon className={`h-5 w-5 ${currentColors.textMuted} mb-1`} />
                <div className={`text-lg font-bold ${currentColors.text}`}>
                  {stats.filteredPriority}
                </div>
                <div className={`text-xs ${currentColors.textMuted} text-center`}>
                  Priority News
                </div>
                {stats.filteredPriority !== stats.priorityCount && (
                  <div className={`text-xs ${currentColors.textMuted} mt-1`}>
                    of {stats.priorityCount}
                  </div>
                )}
              </div>

              <div className={`flex flex-col items-center p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}>
                <PhotoIcon className={`h-5 w-5 ${currentColors.textMuted} mb-1`} />
                <div className={`text-lg font-bold ${currentColors.text}`}>
                  {stats.filteredImages}
                </div>
                <div className={`text-xs ${currentColors.textMuted} text-center`}>
                  With Images
                </div>
                {stats.filteredImages !== stats.imageCount && (
                  <div className={`text-xs ${currentColors.textMuted} mt-1`}>
                    of {stats.imageCount}
                  </div>
                )}
              </div>

              <div className={`flex flex-col items-center p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}>
                <GlobeAltIcon className={`h-5 w-5 ${currentColors.textMuted} mb-1`} />
                <div className={`text-lg font-bold ${currentColors.text}`}>
                  {stats.sourcesCount}
                </div>
                <div className={`text-xs ${currentColors.textMuted} text-center`}>
                  News Sources
                </div>
              </div>

              <div className={`flex flex-col items-center p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}>
                <FunnelIcon className={`h-5 w-5 ${currentColors.textMuted} mb-1`} />
                <div className={`text-lg font-bold ${currentColors.text}`}>
                  {stats.categoriesCount}
                </div>
                <div className={`text-xs ${currentColors.textMuted} text-center`}>
                  Categories
                </div>
              </div>

              {lastUpdated && (
                <div className={`flex flex-col items-center p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}>
                  <ClockIcon className={`h-5 w-5 ${currentColors.textMuted} mb-1`} />
                  <div className={`text-sm font-bold ${currentColors.text}`}>
                    {formatDate(lastUpdated)}
                  </div>
                  <div className={`text-xs ${currentColors.textMuted} text-center`}>
                    Last Updated
                  </div>
                </div>
              )}
            </div>

            {/* High Volume Indicator */}
            {stats.totalArticles >= 400 && (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                  <ArrowPathIcon className="h-3 w-3 mr-1" />
                  HIGH VOLUME: {stats.totalArticles}+ articles available
                </span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Category Filter */}
            <div className="mb-4">
              <h3 className={`text-sm font-medium ${currentColors.text} mb-2`}>Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? currentColors.categoryButtonActive
                        : currentColors.categoryButton
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className={`text-sm font-medium ${currentColors.text} mb-2`}>Sort by</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'relevance', label: 'Relevance' },
                  { id: 'date', label: 'Newest First' },
                  { id: 'priority', label: 'Priority First' }
                ].map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => setSortBy(sort.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      sortBy === sort.id
                        ? currentColors.categoryButtonActive
                        : currentColors.categoryButton
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className={`h-12 w-12 mx-auto mb-4 ${currentColors.textMuted}`} />
                <h3 className={`text-lg font-medium ${currentColors.text} mb-2`}>
                  No articles found
                </h3>
                <p className={`${currentColors.textMuted} mb-4`}>
                  Try adjusting your search terms or filters
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                    className={`px-4 py-2 rounded-lg ${currentColors.accent} ${currentColors.textLight} text-sm font-medium`}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                  <div
                    key={`${article.guid}-${index}`}
                    onClick={() => onSelectArticle(article)}
                    className={`${currentColors.cardBg} ${currentColors.border} border rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}
                  >
                    <div className="flex gap-4">
                      {article.optimizedImageUrl && (
                        <img
                          src={article.optimizedImageUrl}
                          alt={article.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium ${currentColors.accentText}`}>
                            {article.source}
                          </span>
                          {article.priority && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                              🇿🇼 Priority
                            </span>
                          )}
                          <span className={`text-xs ${currentColors.textMuted}`}>
                            {formatDate(article.pubDate)}
                          </span>
                        </div>
                        <h3 className={`font-semibold ${currentColors.text} mb-2 line-clamp-2`}>
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className={`text-sm ${currentColors.textSecondary} line-clamp-2 mb-2`}>
                            {article.description}
                          </p>
                        )}
                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {article.keywords.slice(0, 3).map((keyword, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${currentColors.categoryButton}`}
                              >
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage