/* eslint-disable */
// src/hooks/useFeeds.js - Consolidated feed management with Supabase auth integration
import { useState, useEffect, useMemo, useCallback } from 'react'

// User ID management
function generateUserId() {
  const stored = localStorage.getItem('mukoko_user_id')
  if (stored) return stored
  
  const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2)
  localStorage.setItem('mukoko_user_id', newId)
  return newId
}

// Main consolidated feeds hook
export function useFeeds({
  selectedCategory = 'all',
  searchQuery = '',
  selectedTimeframe = 'all',
  sortBy = 'newest',
  itemsPerPage = 100,
  enableInfiniteScroll = true,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
} = {}) {
  
  // User ID
  const userId = useMemo(() => generateUserId(), [])
  
  // API state
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  
  // Feed data state
  const [allFeeds, setAllFeeds] = useState([])
  const [displayedFeeds, setDisplayedFeeds] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [lastFetchParams, setLastFetchParams] = useState({})
  const [meta, setMeta] = useState({})
  
  // Scroll state
  const [scrollDirection, setScrollDirection] = useState('up')
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hasReached25Percent, setHasReached25Percent] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  
  // User interaction state with localStorage initialization
  const [likes, setLikes] = useState(() => {
    try {
      const saved = localStorage.getItem('mukoko_likes')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('mukoko_bookmarks')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [userProfile, setUserProfile] = useState(null)

  // API request function with improved error handling
  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
      'X-Timestamp': Date.now().toString(),
      ...options.headers
    }

    try {
      const url = endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Check if response is empty
      const responseText = await response.text()
      
      if (!responseText) {
        throw new Error(`Empty response from server (HTTP ${response.status})`)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response text:', responseText)
        throw new Error(`Invalid JSON response: ${parseError.message}`)
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request failed:', {
        endpoint,
        error: error.message,
        options
      })
      throw new Error(error.message || 'Network request failed')
    }
  }, [userId])

  // Calculate API parameters
  const apiParams = useMemo(() => {
    const params = new URLSearchParams()
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory)
    }
    
    if (searchQuery?.trim()) {
      params.set('search', searchQuery.trim())
    }
    
    if (selectedTimeframe && selectedTimeframe !== 'all') {
      params.set('timeframe', selectedTimeframe)
    }
    
    if (sortBy && sortBy !== 'newest') {
      params.set('sort', sortBy)
    }
    
    params.set('format', 'json')
    params.set('limit', Math.min(itemsPerPage * (currentPage + 1), 1000).toString())
    params.set('timestamp', Date.now().toString())
    
    return params
  }, [selectedCategory, searchQuery, selectedTimeframe, sortBy, itemsPerPage, currentPage])

  // Check if we need to refetch
  const needsRefetch = useMemo(() => {
    const currentParamsString = apiParams.toString()
    const lastParamsString = Object.keys(lastFetchParams).length > 0 
      ? new URLSearchParams(lastFetchParams).toString() 
      : ''
    
    return currentParamsString !== lastParamsString
  }, [apiParams, lastFetchParams])

  // Main fetch function with fallback
  const fetchFeeds = useCallback(async (append = false) => {
    try {
      if (!append) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      console.log(`🔍 Fetching feeds with params:`, Object.fromEntries(apiParams))
      
      let response
      try {
        response = await apiRequest(`/feeds?${apiParams.toString()}`)
      } catch (apiError) {
        console.warn('API failed, using fallback data:', apiError.message)
        
        // Fallback to mock data for development
        response = {
          success: true,
          articles: generateMockArticles(),
          total: 50,
          totalCached: 10,
          filters: {
            categories: ['Politics', 'Economy', 'Sports', 'Technology'],
            sources: ['Herald', 'NewsDay', 'DailyNews']
          }
        }
      }
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch feeds')
      }

      const { articles = [], total = 0, totalCached = 0, filters = {}, ...metaData } = response

      console.log(`✅ Fetched ${articles.length} articles (${total} total, ${totalCached} cached)`)

      if (append) {
        setDisplayedFeeds(prev => {
          const existingIds = new Set(prev.map(article => article.id || article.link))
          const newArticles = articles.filter(article => 
            !existingIds.has(article.id || article.link)
          )
          return [...prev, ...newArticles]
        })
      } else {
        setAllFeeds(articles)
        setDisplayedFeeds(articles)
        setCurrentPage(0)
      }

      setTotalCount(total)
      setMeta({ ...metaData, filters, lastRefresh: new Date().toISOString() })
      setLastFetchParams(Object.fromEntries(apiParams))
      
      return { success: true, count: articles.length, total }
      
    } catch (error) {
      console.error('❌ Error fetching feeds:', error)
      setError(error.message)
      
      if (!append) {
        // Load fallback data on error
        const fallbackArticles = generateMockArticles()
        setAllFeeds(fallbackArticles)
        setDisplayedFeeds(fallbackArticles)
        setTotalCount(fallbackArticles.length)
        setMeta({ 
          filters: { categories: ['Politics', 'Economy'], sources: ['Herald'] },
          lastRefresh: new Date().toISOString()
        })
      }
      
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [apiRequest, apiParams, searchQuery, selectedCategory])

  // Load more for infinite scroll
  const loadMoreFeeds = useCallback(async () => {
    if (loadingMore || !hasMore) return

    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    
    const nextApiParams = new URLSearchParams(apiParams)
    nextApiParams.set('limit', Math.min(itemsPerPage * (nextPage + 1), 1000).toString())
    
    try {
      setLoadingMore(true)
      
      const response = await apiRequest(`/feeds?${nextApiParams.toString()}`)
      
      if (response.success && response.articles) {
        const newArticles = response.articles.slice(displayedFeeds.length)
        
        if (newArticles.length > 0) {
          setDisplayedFeeds(prev => [...prev, ...newArticles])
          console.log(`📄 Loaded ${newArticles.length} more articles (page ${nextPage + 1})`)
        }
      }
    } catch (error) {
      console.error('❌ Error loading more feeds:', error)
      setCurrentPage(currentPage)
    } finally {
      setLoadingMore(false)
    }
  }, [apiRequest, apiParams, currentPage, itemsPerPage, displayedFeeds.length, loadingMore])

  // Calculate if there are more items
  const hasMore = useMemo(() => {
    return displayedFeeds.length < totalCount && displayedFeeds.length < 1000
  }, [displayedFeeds.length, totalCount])

  // Refresh function
  const refreshFeeds = useCallback(async () => {
    console.log('🔄 Refreshing feeds...')
    setCurrentPage(0)
    return await fetchFeeds(false)
  }, [fetchFeeds])

  // Force refresh with better error handling
  const forceRefresh = useCallback(async () => {
    console.log('🚀 Force refreshing feeds...')
    
    try {
      setLoading(true)
      setError(null)
      
      // Try to force refresh, but don't fail if endpoint doesn't exist
      try {
        await apiRequest('/admin/force-refresh', { method: 'POST' })
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (refreshError) {
        console.warn('Force refresh endpoint not available:', refreshError.message)
      }
      
      const result = await fetchFeeds(false)
      
      if (result.success) {
        console.log(`✅ Force refresh completed: ${result.count} articles loaded`)
      }
      
      return result
    } catch (error) {
      console.error('❌ Force refresh failed:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [apiRequest, fetchFeeds])

  // User data functions - DISABLED: Now using Supabase directly
  const loadUserData = useCallback(async () => {
    try {
      // Note: User data is now handled by Supabase authentication
      // These legacy API calls have been disabled
      console.log('User data loading disabled - using Supabase authentication')
      
      // Clear any existing data
      setLikes(new Set())
      setBookmarks([])
      setUserProfile(null)
    } catch (error) {
      console.log('Error loading user data:', error)
    }
  }, [])

  // Toggle like function - DISABLED: Now using Supabase directly
  const toggleLike = useCallback(async (article) => {
    const articleId = article.id || article.link
    const isLiked = likes.has(articleId)

    // Note: Like persistence is now handled by Supabase
    // Legacy API calls have been disabled
    
    // Always update local state regardless of API success
    setLikes(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      
      // Save to localStorage
      localStorage.setItem('mukoko_likes', JSON.stringify([...newSet]))
      return newSet
    })
    
    return !isLiked
  }, [likes])

  // Toggle bookmark function
  const toggleBookmark = useCallback(async (article) => {
    const articleId = article.id || article.link
    const isBookmarked = bookmarks.some(b => (b.article_id || b.id || b.link) === articleId)

    // Note: Bookmark persistence is now handled by Supabase
    // Legacy API calls have been disabled
    
    // Always update local state
    setBookmarks(prev => {
      let newBookmarksmarks
      if (isBookmarked) {
        newBookmarksmarks = prev.filter(b => (b.article_id || b.id || b.link) !== articleId)
      } else {
        const bookmarkData = { 
          ...article, 
          article_id: articleId,
          savedAt: new Date().toISOString() 
        }
        newBookmarksmarks = [...prev, bookmarkData]
      }
      
      // Save to localStorage
      localStorage.setItem('mukoko_bookmarks', JSON.stringify(newBookmarksmarks))
      return newBookmarksmarks
    })
    
    return !isBookmarked
  }, [bookmarks])

  // Refresh analytics data from localStorage
  const refreshAnalytics = useCallback(() => {
    try {
      const events = JSON.parse(localStorage.getItem('mukoko_analytics') || '[]')
      if (events.length > 0) {
        console.log('📊 Analytics events:', events)
        
        // Send in batches of 10
        const batchSize = 10
        for (let i = 0; i < events.length; i += batchSize) {
          const batch = events.slice(i, i + batchSize)
          apiRequest('analytics/track', {
            method: 'POST',
            body: JSON.stringify({ 
              eventType: 'batch',
              data: batch,
              timestamp: Date.now() 
            })
          }).catch(error => {
            console.log('Batch analytics tracking failed:', error.message)
          })
        }
        
        // Clear sent events
        localStorage.setItem('mukoko_analytics', JSON.stringify([]))
      }
    } catch (error) {
      console.log('Error reading analytics from localStorage:', error)
    }
  }, [apiRequest])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing feeds...')
      refreshFeeds()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshFeeds])

  // Fetch when parameters change
  useEffect(() => {
    if (needsRefetch) {
      console.log('🔄 Parameters changed, fetching new data...')
      fetchFeeds(false)
    }
  }, [needsRefetch, fetchFeeds])

  // Scroll tracking effect
  useEffect(() => {
    if (!enableInfiniteScroll) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else {
        setScrollDirection('up')
      }
      setLastScrollY(currentScrollY)
      
      // 25% scroll tracking
      const scrollPercent = currentScrollY / (documentHeight - windowHeight)
      setHasReached25Percent(scrollPercent >= 0.25)
      
      // Infinite scroll trigger
      if (windowHeight + currentScrollY >= documentHeight - 1000 && hasMore && !loadingMore) {
        setIsFetching(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, hasMore, loadingMore, enableInfiniteScroll])

  // Handle infinite scroll trigger
  useEffect(() => {
    if (!isFetching || !enableInfiniteScroll) return
    
    loadMoreFeeds()
    setIsFetching(false)
  }, [isFetching, loadMoreFeeds, enableInfiniteScroll])

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Filter summary
  const filterSummary = useMemo(() => {
    const filters = []
    
    if (selectedCategory !== 'all') {
      filters.push(`Category: ${selectedCategory}`)
    }
    
    if (searchQuery?.trim()) {
      filters.push(`Search: "${searchQuery.trim()}"`)
    }
    
    if (selectedTimeframe !== 'all') {
      filters.push(`Time: ${selectedTimeframe}`)
    }
    
    if (sortBy !== 'newest') {
      filters.push(`Sort: ${sortBy}`)
    }
    
    return {
      active: filters,
      hasFilters: filters.length > 0,
      summary: filters.length > 0 ? filters.join(', ') : 'No filters'
    }
  }, [selectedCategory, searchQuery, selectedTimeframe, sortBy])

  // Utility functions
  const isLiked = useCallback((articleId) => likes.has(articleId), [likes])
  const isBookmarked = useCallback((articleId) => 
    bookmarks.some(b => (b.article_id || b.id || b.link) === articleId), [bookmarks])

  const clearError = useCallback(() => setError(null), [])

  return {
    // Feed data
    feeds: displayedFeeds,
    allFeeds,
    loading,
    loadingMore,
    error,
    totalCount,
    hasMore,
    currentPage,
    meta,
    
    // User data
    likes,
    bookmarks,
    userProfile,
    
    // Actions
    loadFeeds: fetchFeeds,
    loadMoreFeeds,
    refreshFeeds,
    forceRefresh,
    loadUserData,
    toggleLike,
    toggleBookmark,
    
    // Scroll
    scrollDirection,
    hasReached25Percent,
    scrollToTop,
    
    // Filter info
    filterSummary,
    apiParams: Object.fromEntries(apiParams),
    
    // Status
    isInitialLoad: loading && displayedFeeds.length === 0,
    isEmpty: !loading && displayedFeeds.length === 0,
    enableInfiniteScroll,
    
    // Utilities
    isLiked,
    isBookmarked,
    clearError,
    userId,
    apiRequest
  }
}

// Legacy exports for backwards compatibility
export const useAPI = () => {
  console.warn('useAPI is deprecated. Use useFeeds instead.')
  const feeds = useFeeds()
  return {
    request: feeds.apiRequest,
    apiRequest: feeds.apiRequest,
    loading: feeds.loading,
    error: feeds.error,
    userId: feeds.userId,
    clearError: feeds.clearError
  }
}

export const useUserData = () => {
  console.warn('useUserData is deprecated. Use useFeeds instead.')
  const feeds = useFeeds()
  return {
    likes: feeds.likes,
    bookmarks: feeds.bookmarks,
    userProfile: feeds.userProfile,
    loading: feeds.loading,
    loadUserData: feeds.loadUserData,
    toggleLike: feeds.toggleLike,
    toggleBookmark: feeds.toggleBookmark,
    isLiked: feeds.isLiked,
    isBookmarked: feeds.isBookmarked
  }
}

export const useScrollAndFeed = (params) => {
  console.warn('useScrollAndFeed is deprecated. Use useFeeds instead.')
  const feeds = useFeeds(params)
  return {
    displayedFeeds: feeds.feeds,
    filteredFeeds: feeds.allFeeds,
    loadingMore: feeds.loadingMore,
    hasMore: feeds.hasMore,
    currentPage: feeds.currentPage,
    loadMoreFeeds: feeds.loadMoreFeeds,
    refreshFeeds: feeds.refreshFeeds,
    scrollDirection: feeds.scrollDirection,
    hasReached25Percent: feeds.hasReached25Percent,
    scrollToTop: feeds.scrollToTop
  }
}