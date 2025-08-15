// src/App.jsx - Updated to use consolidated useFeed  // Remove automatic auth modal behavior - only show auth for protected pagespabase Auth
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'

// Import existing components
import HeaderNavigation from './components/HeaderNavigation'
import MobileNavigation from './components/MobileNavigation'
import FilterControls from './components/FilterControls'
import CategoryFilter from './components/CategoryFilter'
import ArticleCard from './components/ArticleCard'
import SearchPage from './components/SearchPage'
import ProfilePage from './components/ProfilePage'
import NewsBytes from './components/NewsBytes'
import SaveForLater from './components/SaveForLater'
import PersonalInsights from './components/PersonalInsights'
import ErrorBoundary from './components/ErrorBoundary'
import AuthModal from './components/auth/AuthModal'
import AuthDebugger from './components/AuthDebugger'

// Import hooks - UPDATED to use consolidated useFeeds
import { useHead } from './hooks/useHead'
import { useFeeds } from './hooks/useFeeds'
import { useAnalytics } from './hooks/useAnalytics'

// Simple cn utility function
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Lucide React icons
import { 
  ArrowUp, 
  RefreshCw, 
  X
} from 'lucide-react'

function App() {
  // Auth state from context
  const { user, profile, isAuthenticated, loading: authLoading, isAdmin, signOut } = useAuth()
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentView, setCurrentView] = useState('home')
  const [viewMode, setViewMode] = useState('grid')
  const [theme, setTheme] = useState('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  
  // User preferences state (localStorage based)
  const [userPreferences, setUserPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('harare_metro_preferences')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  
  const [readingHistory, setReadingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('harare_metro_reading_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('harare_metro_recent_searches')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // HOOK ORDER IS CRITICAL - ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME
  const {
    // Feed data
    feeds,
    allFeeds,
    loading,
    loadingMore,
    error,
    totalCount,
    hasMore,
    meta,
    
    // User data
    likes: likedArticles,
    bookmarks: bookmarkedArticles,
    userProfile: _userProfile,
    
    // Actions
    loadFeeds: _loadFeeds,
    loadMoreFeeds: _loadMoreFeeds,
    refreshFeeds: _refreshFeeds,
    forceRefresh,
    loadUserData,
    toggleLike,
    toggleBookmark,
    
    // Scroll
    scrollDirection: _scrollDirection,
    hasReached25Percent,
    scrollToTop,
    
    // Analytics
    trackEvent,
    
    // Utilities
    isLiked: _isLiked,
    isBookmarked: _isBookmarked,
    clearError: _clearError,
    
    // Status
    isInitialLoad,
    isEmpty
  } = useFeeds({
    selectedCategory,
    searchQuery,
    selectedTimeframe,
    sortBy,
    itemsPerPage: 25,
    enableInfiniteScroll: true,
    autoRefresh: false,
    refreshInterval: 5 * 60 * 1000
  })

  const {
    trackCategoryClick,
    trackSearch,
    trackArticleClick,
    trackPageView,
    trackFeedLoad
  } = useAnalytics()

  // Use head hook for SEO - MOVED TO AFTER ALL MAIN HOOKS
  useHead({
    title: `Harare Metro - Zimbabwe News${selectedCategory !== 'all' ? ` - ${selectedCategory}` : ''}${searchQuery ? ` - "${searchQuery}"` : ''}`,
    description: "Stay informed with the latest news from Zimbabwe",
    keywords: "Zimbabwe news, Harare Metro, politics, economy, sports"
  })

  // Extract categories and sources from meta
  const categories = meta?.categories || []
  const _sources = meta?.sources || []

  // Theme colors
  const currentColors = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    headerBg: theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    cardBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    categoryButton: theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    categoryButtonActive: theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
    accent: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
    accentText: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    input: theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
  }

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  // Update theme in localStorage and DOM
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Save user preferences to localStorage
  useEffect(() => {
    localStorage.setItem('harare_metro_preferences', JSON.stringify(userPreferences))
  }, [userPreferences])

  useEffect(() => {
    localStorage.setItem('harare_metro_reading_history', JSON.stringify(readingHistory.slice(0, 100)))
  }, [readingHistory])

  useEffect(() => {
    localStorage.setItem('harare_metro_recent_searches', JSON.stringify(recentSearches))
  }, [recentSearches])

  // Check for password reset URL and handle tokens
  useEffect(() => {
    const handlePasswordResetUrl = async () => {
      const currentPath = window.location.pathname
      const hash = window.location.hash
      
      // Check if this is a password reset URL
      if (currentPath === '/auth/reset-password' && hash.includes('access_token=')) {
        // Extract tokens from URL hash
        const params = new window.URLSearchParams(hash.substring(1)) // Remove the # symbol
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (accessToken && refreshToken) {
          try {
            // Set the session with the tokens from the URL
            const { data: _data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              // Error setting session
            } else {
              // Successfully authenticated, show the auth modal for password reset
              setShowAuthModal(true)
              setAuthModalMode('reset-password')
              
              // Clean up the URL
              window.history.replaceState({}, '', '/')
            }
          } catch {
            // Error handling password reset tokens
          }
        }
      }
    }
    
    handlePasswordResetUrl()
  }, [])

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initializing Harare Metro...
        if (loadUserData) {
          await loadUserData()
        }
      } catch {
        // Failed to load user data, continuing with defaults
      }
    }
    
    initializeApp()
  }, [loadUserData])

  // Track page view on mount
  useEffect(() => {
    if (trackPageView) {
      trackPageView('home', document.referrer)
    }
  }, [trackPageView])

  // Track feed loads
  useEffect(() => {
    if (!loading && feeds && feeds.length > 0 && trackFeedLoad) {
      trackFeedLoad({
        category: selectedCategory,
        searchQuery,
        sortBy,
        timeframe: selectedTimeframe,
        resultCount: feeds.length
      })
    }
  }, [loading, feeds?.length, feeds, selectedCategory, searchQuery, sortBy, selectedTimeframe, trackFeedLoad])

  // UPDATED handlers to use new consolidated functions
  const handleLikeArticle = useCallback(async (article) => {
    try {
      if (toggleLike) {
        await toggleLike(article)
      }
      // Track analytics using new method
      if (trackEvent) {
        await trackEvent('article_view', {
          articleId: article.id || article.link,
          articleTitle: article.title,
          source: article.source,
          category: article.category,
          action: 'like'
        })
      }
    } catch {
      // Error liking article
    }
  }, [toggleLike, trackEvent])

  const handleBookmarkArticle = useCallback(async (article) => {
    try {
      if (toggleBookmark) {
        await toggleBookmark(article)
      }
      if (trackEvent) {
        await trackEvent('article_view', {
          articleId: article.id || article.link,
          articleTitle: article.title,
          source: article.source,
          category: article.category,
          action: 'bookmark'
        })
      }
    } catch {
      // Error bookmarking article
    }
  }, [toggleBookmark, trackEvent])

  const handleArticleView = useCallback(async (article) => {
    const historyEntry = {
      ...article,
      viewedAt: new Date().toISOString(),
      readingTime: Math.floor(Math.random() * 180) + 30
    }
    
    setReadingHistory(prev => [historyEntry, ...prev.slice(0, 99)])
    
    // Track analytics
    if (trackEvent) {
      await trackEvent('article_view', {
        articleId: article.id || article.link,
        articleTitle: article.title,
        source: article.source,
        category: article.category
      })
    }
  }, [trackEvent])

  const handleAddRecentSearch = useCallback(async (query) => {
    setRecentSearches(prev => {
      const newSearches = [query, ...prev.filter(s => s !== query)].slice(0, 10)
      return newSearches
    })
    
    // Track search analytics
    if (trackEvent) {
      await trackEvent('search', {
        query,
        resultsCount: feeds?.length || 0,
        searchTime: Date.now()
      })
    }
  }, [trackEvent, feeds?.length])

  const _handleCategoryChange = useCallback(async (category) => {
    setSelectedCategory(category)
    
    // Track category analytics
    if (trackEvent) {
      await trackEvent('category_click', { category })
    }
  }, [trackEvent])

  const handleShare = useCallback(async (article) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.link
        })
      } catch {
        // Error sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(article.link)
      } catch {
        // Error copying to clipboard
      }
    }
  }, [])

  // SIMPLIFIED refresh handlers (now handled by useFeeds)
  const handleForceRefresh = useCallback(async () => {
    if (forceRefresh) {
      await forceRefresh()
    }
  }, [forceRefresh])

  // Navigation handlers
  const handleSearchClick = () => setCurrentView('search')
  const handleBytesClick = () => setCurrentView('bytes')

  // Auth handlers
  const handleLogout = useCallback(async () => {
    try {
      await signOut()
      
      // Force clear any lingering session data
      try {
        // Clear localStorage items that might contain session data
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Clear any sessionStorage as well
        sessionStorage.clear()
      } catch {
        // Continue even if localStorage operations fail
      }
      
      setCurrentView('home') // Redirect to home after logout
      
      // Optional: reload page to ensure clean state
      window.location.reload()
    } catch {
      // Error during logout - user will remain in current state
    }
  }, [signOut, setCurrentView])

  // Debug function to force clear all auth data - available in browser console as window.clearAuth
  const forceAuthClear = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear all localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Reload the page
      window.location.reload()
    } catch {
      // Error clearing auth data - continue silently
    }
  }, [])

  // Make forceAuthClear available globally for debugging
  useEffect(() => {
    window.clearAuth = forceAuthClear
    return () => {
      delete window.clearAuth
    }
  }, [forceAuthClear])
  
  const handleSavedClick = () => setCurrentView('saved')
  
  // Protected navigation handlers that require authentication
  const handleProtectedNavigation = (view) => {
    if (isAuthenticated) {
      setCurrentView(view)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleInsightsClick = () => handleProtectedNavigation('insights')
  const handleProfileClick = () => handleProtectedNavigation('profile')
  const handleAuthClick = () => handleProtectedNavigation('profile')
  
  // Admin-only navigation (for future analytics pages)
  const _handleAdminNavigation = (view) => {
    if (isAuthenticated) {
      // Check if user has admin role
      if (isAdmin()) {
        setCurrentView(view)
      } else {
        // User is authenticated but not admin
        setCurrentView('profile') // Redirect to profile instead
      }
    } else {
      setShowAuthModal(true)
    }
  }

  // Track category changes
  const handleCategoryChangeTracked = (newCategory) => {
    setSelectedCategory(newCategory)
    if (trackCategoryClick) {
      trackCategoryClick(newCategory, 'category_filter')
    }
  }

  // Track search
  const _handleSearchTracked = (query) => {
    setSearchQuery(query)
    if (query.trim() && trackSearch) {
      trackSearch(query, selectedCategory, feeds?.length || 0)
    }
  }

  // Track article clicks
  const _handleArticleClickTracked = (article) => {
    if (trackArticleClick) {
      trackArticleClick(article)
    }
    // Open article logic here
  }

  // Articles with images for bytes view
  const articlesWithImages = allFeeds ? allFeeds.filter(article => article.optimizedImageUrl) : []

  // Auth Loading State
  if (authLoading) {
    return (
      <ErrorBoundary>
        <div className={`min-h-screen ${currentColors.bg}`}>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-white mb-4"></div>
            <p className={`text-lg ${currentColors.textMuted}`}>Loading Harare Metro...</p>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // LOADING STATE - Show loading while initializing
  if (isInitialLoad) {
    return (
      <ErrorBoundary>
        <div className={`min-h-screen ${currentColors.bg}`}>
          <HeaderNavigation
            theme={theme}
            setTheme={setTheme}
            currentView={currentView}
            setCurrentView={setCurrentView}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSearchClick={handleSearchClick}
            onBytesClick={handleBytesClick}
            onProfileClick={handleProfileClick}
            onAuthClick={handleAuthClick}
            onLogout={handleLogout}
            user={user}
            profile={profile}
            isAuthenticated={isAuthenticated}
          />
          <div className="pt-12 lg:pt-16">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-white mb-4"></div>
              <p className={`text-lg ${currentColors.textMuted}`}>Loading news...</p>
            </div>
          </div>
          <MobileNavigation
            currentView={currentView}
            setCurrentView={setCurrentView}
            onSearchClick={handleSearchClick}
            onBytesClick={handleBytesClick}
            onProfileClick={handleProfileClick}
            onSavedClick={handleSavedClick}
            onInsightsClick={handleInsightsClick}
          />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      {/* Auth Debugger - Development only */}
      <AuthDebugger />
      
      <div className={`min-h-screen ${currentColors.bg} transition-colors duration-300`}>
        {/* Header */}
        <HeaderNavigation
          theme={theme}
          setTheme={setTheme}
          currentView={currentView}
          setCurrentView={setCurrentView}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSearchClick={handleSearchClick}
          onBytesClick={handleBytesClick}
          onProfileClick={handleProfileClick}
          onAuthClick={handleAuthClick}
          onLogout={handleLogout}
          likedCount={likedArticles?.size || 0}
          bookmarkedCount={bookmarkedArticles?.length || 0}
          user={user}
          profile={profile}
          isAuthenticated={isAuthenticated}
        />

        {/* Main Content */}
        <div className="pt-2 pb-20 lg:pb-6">
          {/* Search View */}
          {currentView === 'search' && (
            <SearchPage
              currentColors={currentColors}
              allFeeds={allFeeds || []}
              onClose={() => setCurrentView('home')}
              onSelectArticle={handleArticleView}
              lastUpdated={meta?.lastRefresh}
              recentSearches={recentSearches}
              onAddRecentSearch={handleAddRecentSearch}
            />
          )}

          {/* Profile View */}
          {currentView === 'profile' && (
            <ProfilePage 
              currentColors={currentColors}
              userPreferences={userPreferences}
              onUpdatePreferences={setUserPreferences}
              user={user}
              profile={profile}
              isAuthenticated={isAuthenticated}
            />
          )}

          {/* News Bytes View */}
          {currentView === 'bytes' && (
            <NewsBytes 
              currentColors={currentColors}
              articles={articlesWithImages}
              viewMode={viewMode}
              onLikeArticle={handleLikeArticle}
              onBookmarkArticle={handleBookmarkArticle}
              onShare={handleShare}
              likedArticles={likedArticles}
              bookmarkedArticles={bookmarkedArticles}
              savedArticles={bookmarkedArticles}
              onToggleSave={handleBookmarkArticle}
            />
          )}

          {/* Saved Articles View */}
          {currentView === 'saved' && (
            <SaveForLater
              savedArticles={bookmarkedArticles || []}
              onToggleSave={handleBookmarkArticle}
              onShare={handleShare}
              onArticleClick={handleArticleView}
              currentColors={currentColors}
              className="max-w-7xl mx-auto px-4 lg:px-6 py-6"
            />
          )}

          {/* Personal Insights View */}
          {currentView === 'insights' && (
            <PersonalInsights
              currentColors={currentColors}
              allFeeds={allFeeds || []}
              lastUpdated={meta?.lastRefresh}
              readingHistory={readingHistory}
              className="max-w-7xl mx-auto px-4 lg:px-6 py-6"
            />
          )}

          {/* Home View */}
          {currentView === 'home' && (
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
              {/* Error State */}
              {error && (
                <div className="mb-3">
                  <div className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 border rounded-xl p-3">
                    <div className="flex items-center">
                      <X className="h-5 w-5 text-red-400 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-100">
                          Error Loading News
                        </h3>
                        <p className="mt-1 text-sm text-red-600 dark:text-red-200">
                          {error.message}
                        </p>
                      </div>
                      <button
                        onClick={handleForceRefresh}
                        className="ml-auto text-red-600 dark:text-red-300"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Refreshing Indicator */}
              {loading && (
                <div className="mb-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 border rounded-xl p-3">
                    <div className="flex items-center">
                      <RefreshCw className="h-5 w-5 text-blue-400 mr-3 animate-spin" />
                      <p className="text-sm text-blue-800 dark:text-blue-100">
                        Refreshing news...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="mb-3">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  setSelectedCategory={handleCategoryChangeTracked}
                  feeds={allFeeds || []}
                  categories={categories}
                />
              </div>

              {/* Filter Controls */}
              <div className="mb-3">
                <FilterControls
                  selectedTimeframe={selectedTimeframe}
                  setSelectedTimeframe={setSelectedTimeframe}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  feeds={allFeeds || []}
                  currentColors={currentColors}
                />
              </div>

              {/* Articles display */}
              {feeds && feeds.length > 0 ? (
                viewMode === 'grid' ? (
                  // Masonry Grid for card view
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {feeds.map((article, index) => (
                      <div key={`${article.link || article.id}-${index}`} className="break-inside-avoid mb-4">
                        <ArticleCard
                          article={article}
                          currentColors={currentColors}
                          onShare={handleShare}
                          savedArticles={bookmarkedArticles || []}
                          onToggleSave={handleBookmarkArticle}
                          viewMode={viewMode}
                          onArticleClick={handleArticleView}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Compact List for list view
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {feeds.map((article, index) => (
                      <ArticleCard
                        key={`${article.link || article.id}-${index}`}
                        article={article}
                        currentColors={currentColors}
                        onShare={handleShare}
                        savedArticles={bookmarkedArticles || []}
                        onToggleSave={handleBookmarkArticle}
                        viewMode={viewMode}
                        onArticleClick={handleArticleView}
                      />
                    ))}
                  </div>
                )
              ) : null}

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                    <span className={`text-sm ${currentColors.textMuted}`}>
                      Loading more articles...
                    </span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {isEmpty && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className={`text-lg font-medium ${currentColors.text} mb-2`}>
                    No articles found
                  </h3>
                  <p className={`${currentColors.textMuted} mb-4`}>
                    {searchQuery 
                      ? `No articles match "${searchQuery}"`
                      : selectedCategory !== 'all' 
                        ? `No articles in ${selectedCategory} category`
                        : 'No articles available'
                    }
                  </p>
                  <button
                    onClick={handleForceRefresh}
                    className={`px-4 py-2 ${currentColors.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Refresh Articles
                  </button>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && feeds && feeds.length > 0 && !isEmpty && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className={`${currentColors.textMuted} mb-2`}>
                    You&apos;ve reached the end!
                  </p>
                  <p className={`text-sm ${currentColors.textMuted}`}>
                    {totalCount} total articles loaded
                  </p>
                </div>
              )}
            </main>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          onSearchClick={handleSearchClick}
          onBytesClick={handleBytesClick}
          onProfileClick={handleProfileClick}
          onSavedClick={handleSavedClick}
          onInsightsClick={handleInsightsClick}
          likedCount={likedArticles?.size || 0}
          bookmarkedCount={bookmarkedArticles?.length || 0}
        />

        {/* Scroll to Top Button */}
        {hasReached25Percent && (
          <button
            onClick={scrollToTop}
            className={cn(
              "fixed bottom-24 lg:bottom-6 right-4 z-40 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
              "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
            )}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </ErrorBoundary>
  )
}

export default App