import React, { useState, useEffect } from 'react'
import { NewspaperIcon, ArrowPathIcon, CalendarIcon, TagIcon, HeartIcon } from '@heroicons/react/24/outline'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex flex-col">
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
            
            {/* Company Info */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-3">Developed by</h3>
              <a 
                href="https://www.nyuchi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-white transition-colors font-medium"
              >
                Nyuchi Web Services
              </a>
              <p className="text-sm text-blue-100 mt-1">Professional web solutions</p>
            </div>

            {/* Project Links */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">Project</h3>
              <div className="space-y-2">
                <div>
                  <a 
                    href="https://github.com/nyuchitech/harare-metro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-white transition-colors inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub Repository
                  </a>
                </div>
                <div className="text-sm text-blue-100">
                  MIT License
                </div>
              </div>
            </div>

            {/* Made with Love */}
            <div className="text-center md:text-right">
              <div className="inline-flex items-center text-lg font-semibold mb-3">
                Built with 
                <HeartIcon className="h-5 w-5 mx-2 text-red-400" />
                for Zimbabwe
              </div>
              <p className="text-sm text-blue-100">
                Bringing local news to your fingertips
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-6 pt-6 text-center">
            <p className="text-sm text-blue-100">
              © {new Date().getFullYear()} Nyuchi Web Services - Harare Metro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App