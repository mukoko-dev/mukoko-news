import React, { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ArrowLeftIcon,
  PhotoIcon
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
    )
    setSearchResults(results)
  }, [searchQuery, allFeeds])

  // Save search to recent searches
  const saveSearch = (query) => {
    if (!query.trim()) return
    
    const updated = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5)
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Clear search history
  const clearHistory = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
      {/* Header */}
      <div className={`${currentColors.headerBg} border-b ${currentColors.border} py-2 px-4`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 -ml-2"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="search"
              className={`w-full pl-10 pr-4 py-2 rounded-full text-base ${
                currentColors.cardBg
              } ${currentColors.border} border`}
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-57px)]">
        {!searchQuery && (
          <div className="p-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className={`text-lg font-semibold ${currentColors.text}`}>
                    Recent Searches
                  </h2>
                  <button
                    onClick={clearHistory}
                    className={`text-sm ${currentColors.textMuted}`}
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(query)}
                      className={`w-full text-left p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}
                    >
                      <span className={currentColors.text}>{query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="p-4">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((article) => (
                  <button
                    key={article.guid}
                    onClick={() => {
                      saveSearch(searchQuery)
                      onSelectArticle(article)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg ${currentColors.cardBg} ${currentColors.border} border`}
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
                      <h3 className={`${currentColors.text} font-medium line-clamp-2 text-sm`}>
                        {article.title}
                      </h3>
                      <p className={`${currentColors.textMuted} text-xs mt-1`}>
                        {article.source}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className={`w-12 h-12 ${currentColors.textMuted} mx-auto mb-4`} />
                <p className={`${currentColors.textMuted}`}>
                  No results found for "{searchQuery}"
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