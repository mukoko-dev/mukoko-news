import React, { useState, useEffect } from 'react'
import { NewspaperIcon, ArrowPathIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline'

function App() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stats, setStats] = useState({ total: 0, priority: 0 })

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/feeds')
      if (!response.ok) throw new Error('Failed to fetch feeds')
      const data = await response.json()
      setFeeds(data)
      
      // Calculate stats
      const priorityCount = data.filter(article => article.priority).length
      setStats({ total: data.length, priority: priorityCount })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredFeeds = selectedCategory === 'all' 
    ? feeds 
    : feeds.filter(feed => feed.category === selectedCategory)

  const categories = [
    'all', 'politics', 'economy', 'business', 'sports', 
    'harare', 'agriculture', 'technology'
  ]

  const getCategoryColor = (category) => {
    const colors = {
      politics: 'bg-red-100 text-red-800',
      economy: 'bg-green-100 text-green-800', 
      business: 'bg-blue-100 text-blue-800',
      sports: 'bg-orange-100 text-orange-800',
      harare: 'bg-purple-100 text-purple-800',
      agriculture: 'bg-emerald-100 text-emerald-800',
      technology: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.general
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Zimbabwe News</h2>
          <p className="text-blue-100">Connecting to local news sources...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load News
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchFeeds}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇿🇼</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Harare Metro
                </h1>
                <p className="text-sm text-gray-600">Zimbabwe News Aggregator</p>
              </div>
            </div>
            
            <button
              onClick={fetchFeeds}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-white text-center">
          <div className="flex justify-center items-center space-x-8">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-blue-100">Articles Loaded</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.priority}</div>
              <div className="text-sm text-blue-100">Priority Stories</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {filteredFeeds.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <NewspaperIcon className="h-16 w-16 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-medium mb-2">
                No articles found
              </h3>
              <p className="text-blue-100">
                {selectedCategory === 'all' 
                  ? 'No news articles are currently available.' 
                  : `No articles found in the "${selectedCategory}" category.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeeds.slice(0, 50).map((article, index) => (
              <article 
                key={article.guid || index} 
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-white/20"
              >
                {/* Article Header */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-sm font-medium text-blue-600">
                    {article.source}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {new Date(article.pubDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                {/* Title with Priority Badge */}
                <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {article.title}
                  {article.priority && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-red-500 text-white">
                      🇿🇼 Priority
                    </span>
                  )}
                </h2>
                
                {/* Description */}
                {article.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center">
                    <TagIcon className="h-3 w-3 mr-1 text-gray-400" />
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </div>
                  
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group transition-colors"
                  >
                    Read Article
                    <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App