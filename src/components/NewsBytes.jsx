// src/components/NewsBytes.jsx - Updated to work with consolidated useFeeds hook
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share,
  Bookmark,
  Heart,
  MessageCircle,
  MoreVertical,
  X,
  ChevronDown,
  Maximize2,
  Globe,
  User,
  SkipBack,
  SkipForward,
  RotateCcw
} from 'lucide-react'
import ArticleModal from './ArticleModal'
import ShareModal from './ShareModal'
import { useAnalytics } from '../hooks/useAnalytics'

const NewsBytes = ({ 
  currentColors, 
  articles = [], 
  viewMode = 'grid',
  // Updated props to match new useFeeds hook
  likedArticles = new Set(),
  bookmarkedArticles = [],
  onLikeArticle,
  onBookmarkArticle,
  onShare,
  onArticleView,
  // Legacy props for backward compatibility
  savedArticles = [],
  onToggleSave
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [expandedContent, setExpandedContent] = useState(false)
  const [showPlayPause, setShowPlayPause] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const containerRef = useRef(null)
  const touchStartRef = useRef({ y: 0, time: 0, moved: false })
  const autoplayTimerRef = useRef(null)

  // Analytics hooks
  const {
    trackArticleClick,
    trackArticleView,
    trackUserInteraction,
    trackPageView,
    trackScroll
  } = useAnalytics()

  // Filter articles that have images
  const validArticles = articles.filter(article => 
    article.optimizedImageUrl || article.imageUrl || article.image
  )

  // Track page view when component mounts
  useEffect(() => {
    trackPageView('news_bytes', document.referrer)
  }, [trackPageView])

  // Track article view when current article changes
  useEffect(() => {
    if (validArticles[currentIndex]) {
      trackArticleView(validArticles[currentIndex])
    }
  }, [currentIndex, validArticles, trackArticleView])

  // Auto-advance to next article with better timer management
  useEffect(() => {
    if (!isPlaying || validArticles.length === 0) {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
        autoplayTimerRef.current = null
      }
      return
    }

    autoplayTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % validArticles.length)
    }, 10000) // 10 seconds per article

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
        autoplayTimerRef.current = null
      }
    }
  }, [isPlaying, validArticles.length])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
      }
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't handle keyboard events when modals are open
      if (showShareModal || showArticleModal) {
        if (e.key === 'Escape') {
          setShowShareModal(false)
          setShowArticleModal(false)
        }
        return
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          handlePreviousArticle()
          break
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          handleNextArticle()
          break
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'Enter':
          e.preventDefault()
          handleOpenArticleModal()
          break
        case 'Escape':
          e.preventDefault()
          if (showShareModal || showArticleModal) {
            setShowShareModal(false)
            setShowArticleModal(false)
          }
          break
        case 'l':
          e.preventDefault()
          handleLike()
          break
        case 's':
          e.preventDefault()
          handleBookmark()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [validArticles.length, showShareModal, showArticleModal, currentIndex])

  // Enhanced touch navigation with better gesture recognition
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e) => {
      touchStartRef.current = {
        y: e.touches[0].clientY,
        time: Date.now(),
        moved: false
      }
    }

    const handleTouchMove = (e) => {
      const touch = e.touches[0]
      const startTouch = touchStartRef.current
      const deltaY = Math.abs(touch.clientY - startTouch.y)
      
      if (deltaY > 10) {
        touchStartRef.current.moved = true
        e.preventDefault() // Prevent default scrolling
      }
    }

    const handleTouchEnd = (e) => {
      const endTouch = e.changedTouches[0]
      const startTouch = touchStartRef.current
      const deltaY = startTouch.y - endTouch.clientY
      const deltaTime = Date.now() - startTouch.time
      
      // Only process swipes if there was movement and it was intentional
      if (touchStartRef.current.moved && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          // Swipe up - next article
          handleNextArticle()
        } else {
          // Swipe down - previous article
          handlePreviousArticle()
        }
      } else if (!touchStartRef.current.moved && deltaTime < 300) {
        // Quick tap without movement - toggle play/pause or show controls
        const containerRect = container.getBoundingClientRect()
        const tapX = endTouch.clientX - containerRect.left
        const containerWidth = containerRect.width
        
        // Check if tap is in the center 70% of the screen (avoiding side buttons)
        if (tapX > containerWidth * 0.15 && tapX < containerWidth * 0.85) {
          togglePlayPause()
          showPlayPauseFeedback()
        }
      }
    }

    const handleWheel = (e) => {
      e.preventDefault()
      // Add debouncing for wheel events
      const now = Date.now()
      if (handleWheel.lastCall && now - handleWheel.lastCall < 100) return
      handleWheel.lastCall = now
      
      if (e.deltaY > 0) {
        handleNextArticle()
      } else {
        handlePreviousArticle()
      }
      
      // Track scroll events
      trackScroll(e.deltaY > 0 ? 'down' : 'up', currentIndex)
    }

    // Use passive: false for better control
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [validArticles.length, currentIndex, trackScroll])

  // Navigation functions
  const handleNextArticle = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % validArticles.length)
  }, [validArticles.length])

  const handlePreviousArticle = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : validArticles.length - 1)
  }, [validArticles.length])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Function to show brief play/pause feedback
  const showPlayPauseFeedback = useCallback(() => {
    setShowPlayPause(true)
    setTimeout(() => {
      setShowPlayPause(false)
    }, 1000) // Show for 1 second
  }, [])

  // Enhanced interaction handlers with analytics tracking
  const handleLike = useCallback(async () => {
    const article = validArticles[currentIndex]
    if (!article) return

    try {
      let newLikeState = false
      if (onLikeArticle) {
        newLikeState = await onLikeArticle(article)
      }
      
      // Track the interaction
      trackUserInteraction('like', article, newLikeState)
      
      // Show brief feedback
      showPlayPauseFeedback()
    } catch (error) {
      console.log('Error liking article:', error)
    }
  }, [currentIndex, validArticles, onLikeArticle, trackUserInteraction, showPlayPauseFeedback])

  const handleBookmark = useCallback(async () => {
    const article = validArticles[currentIndex]
    if (!article) return

    try {
      let newBookmarkState = false
      if (onBookmarkArticle) {
        newBookmarkState = await onBookmarkArticle(article)
      } else if (onToggleSave) {
        // Fallback to legacy prop
        newBookmarkState = await onToggleSave(article)
      }
      
      // Track the interaction
      trackUserInteraction('bookmark', article, newBookmarkState)
      
      // Show brief feedback
      showPlayPauseFeedback()
    } catch (error) {
      console.log('Error bookmarking article:', error)
    }
  }, [currentIndex, validArticles, onBookmarkArticle, onToggleSave, trackUserInteraction, showPlayPauseFeedback])

  const formatTimeAgo = useCallback((dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }, [])

  const handleOpenArticleModal = useCallback(() => {
    const article = validArticles[currentIndex]
    if (!article) return

    setShowArticleModal(true)
    setIsPlaying(false) // Pause playback when opening modal
    
    // Track article click and view
    trackArticleClick(article)
    
    // Track article view
    if (onArticleView && article) {
      onArticleView(article)
    }
  }, [currentIndex, validArticles, onArticleView, trackArticleClick])

  const handleCloseArticleModal = useCallback(() => {
    setShowArticleModal(false)
  }, [])

  const handleShare = useCallback(() => {
    const article = validArticles[currentIndex]
    if (!article) return

    // Track share interaction
    trackUserInteraction('share', article, true)

    if (onShare) {
      onShare(article)
    } else {
      setShowShareModal(true)
    }
  }, [currentIndex, validArticles, onShare, trackUserInteraction])

  const handleReadOriginal = useCallback(() => {
    const article = validArticles[currentIndex]
    if (!article) return

    // Track external link click
    trackUserInteraction('external_link', article, true)
    window.open(article.link, '_blank')
  }, [currentIndex, validArticles, trackUserInteraction])

  // Check if article is liked (support both new and legacy formats)
  const isArticleLiked = useCallback((article) => {
    if (likedArticles && typeof likedArticles.has === 'function') {
      return likedArticles.has(article.link || article.id)
    }
    return false
  }, [likedArticles])

  // Check if article is bookmarked (support both new and legacy formats)
  const isArticleBookmarked = useCallback((article) => {
    // Check new format (array)
    if (Array.isArray(bookmarkedArticles)) {
      return bookmarkedArticles.some(saved => 
        (saved.link || saved.id) === (article.link || article.id)
      )
    }
    // Check legacy format (array)
    if (Array.isArray(savedArticles)) {
      return savedArticles.some(saved => 
        (saved.link || saved.id) === (article.link || article.id)
      )
    }
    return false
  }, [bookmarkedArticles, savedArticles])

  // Loading state
  if (validArticles.length === 0) {
    return (
      <div className={`h-screen flex items-center justify-center ${currentColors.bg}`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">📸</div>
          <h3 className={`text-xl font-semibold ${currentColors.text}`}>
            No Visual Stories Available
          </h3>
          <p className={`${currentColors.textMuted} max-w-md`}>
            We're working on bringing you more visual content soon!
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className={currentColors.border}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  const currentArticle = validArticles[currentIndex]

  return (
    <div 
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-black select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentArticle.optimizedImageUrl || currentArticle.imageUrl || currentArticle.image}
          alt={currentArticle.title}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-2 left-4 right-4 z-20 pt-safe">
        <div className="flex space-x-1">
          {validArticles.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-white" 
                  : index < currentIndex 
                    ? "bg-white/60" 
                    : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop Controls (hover to show) */}
      {showControls && (
        <div className="absolute top-4 right-4 z-30 hidden lg:flex items-center space-x-2">
          <Button
            variant="icon"
            size="icon"
            onClick={handlePreviousArticle}
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={togglePlayPause}
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={handleNextArticle}
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main Content Area - Optimized Layout */}
      <div className="absolute inset-0 flex">
        {/* Left side - Content (85%) */}
        <div className="flex-1 flex items-end pb-32 lg:pb-8 px-3">
          <div className="w-full max-w-[90%] space-y-3">
            {/* Source Avatar */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">
                    {currentArticle.source?.charAt(0).toUpperCase() || 'N'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {currentArticle.source || 'Unknown Source'}
                </p>
                <p className="text-white/70 text-xs">
                  {formatTimeAgo(currentArticle.publishedAt || currentArticle.pubDate || currentArticle.published)}
                </p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-white text-lg font-bold leading-tight">
              {currentArticle.title}
            </h2>
            
            {/* Description */}
            {currentArticle.description && (
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                {currentArticle.description}
              </p>
            )}

            {/* Category Badge */}
            {currentArticle.category && (
              <div>
                <Badge 
                  variant="secondary" 
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  #{currentArticle.category}
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Read More Button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenArticleModal}
                className="bg-white text-black hover:bg-gray-100"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Read More
              </Button>

              {/* Read Original Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReadOriginal}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Globe className="w-4 h-4 mr-2" />
                Original
              </Button>
            </div>

            {/* Article Progress */}
            <div className="text-white/60 text-xs">
              {currentIndex + 1} of {validArticles.length} stories
            </div>
          </div>
        </div>

        {/* Right side - Action Buttons (15%) */}
        <div className="w-16 flex flex-col justify-end pb-32 lg:pb-6 items-center space-y-4 px-1">
          {/* Like Button */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="icon"
              size="icon"
              onClick={handleLike}
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
            >
              <Heart 
                className={cn(
                  "h-6 w-6 transition-colors",
                  isArticleLiked(currentArticle)
                    ? "fill-red-500 text-red-500" 
                    : "text-white"
                )}
              />
            </Button>
            <span className="text-white text-[10px] font-medium">
              {Math.floor(Math.random() * 999) + 1}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="icon"
              size="icon"
              onClick={handleShare}
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
            >
              <Share className="h-6 w-6" />
            </Button>
            <span className="text-white text-[10px] font-medium">Share</span>
          </div>

          {/* Bookmark Button */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="icon"
              size="icon"
              onClick={handleBookmark}
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
            >
              <Bookmark 
                className={cn(
                  "h-6 w-6 transition-colors",
                  isArticleBookmarked(currentArticle)
                    ? "fill-yellow-500 text-yellow-500" 
                    : "text-white"
                )}
              />
            </Button>
            <span className="text-white text-[10px] font-medium">Save</span>
          </div>

          {/* More Options */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="icon"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
            >
              <MoreVertical className="h-6 w-6" />
            </Button>
            <span className="text-white text-[10px] font-medium">More</span>
          </div>
        </div>
      </div>

      {/* Brief Play/Pause Feedback */}
      {showPlayPause && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-6 border border-white/30 animate-in fade-in zoom-in duration-200">
            {isPlaying ? (
              <Pause className="h-12 w-12 text-white" />
            ) : (
              <Play className="h-12 w-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Article Modal */}
      {showArticleModal && currentArticle && (
        <ArticleModal
          article={currentArticle}
          onClose={handleCloseArticleModal}
          currentColors={currentColors}
          onShare={onShare}
          savedArticles={bookmarkedArticles || savedArticles}
          onToggleSave={onBookmarkArticle || onToggleSave}
        />
      )}

      {/* Share Modal */}
      {showShareModal && !onShare && currentArticle && (
        <ShareModal
          article={currentArticle}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          currentColors={currentColors}
        />
      )}
    </div>
  )
}

export default NewsBytes