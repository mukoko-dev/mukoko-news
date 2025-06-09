import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  HeartIcon,
  ShareIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import ShareModal from './ShareModal'

const NewsBytes = ({ articles = [], currentColors }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [likedArticles, setLikedArticles] = useState(new Set())
  const [isExpanded, setIsExpanded] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareArticle, setShareArticle] = useState(null)
  const [showHeader, setShowHeader] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef(null)

  const currentArticle = articles[currentIndex]

  // Header auto-hide logic
  useEffect(() => {
    let hideTimer
    
    if (isPlaying) {
      // Hide header after 3 seconds when playing
      hideTimer = setTimeout(() => {
        setShowHeader(false)
      }, 3000)
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [isPlaying, currentIndex])

  // Show header on user interaction
  const showHeaderTemporarily = useCallback(() => {
    setShowHeader(true)
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }
    
    scrollTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowHeader(false)
      }
    }, 3000)
  }, [isPlaying])

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying || isTransitioning) return

    const timer = setTimeout(() => {
      handleNext()
    }, 8000) // 8 seconds per article

    return () => clearTimeout(timer)
  }, [currentIndex, isPlaying, isTransitioning])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlayPause()
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        handlePrevious()
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Enhanced touch gestures with smooth transitions
  const handleTouchStart = useCallback((e) => {
    if (isTransitioning) return
    
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    lastScrollY.current = touchStartY.current
    
    // Show header on touch
    showHeaderTemporarily()
  }, [isTransitioning, showHeaderTemporarily])

  const handleTouchMove = useCallback((e) => {
    if (isTransitioning) return
    
    const currentY = e.touches[0].clientY
    const deltaY = lastScrollY.current - currentY
    
    // Prevent default scrolling behavior
    e.preventDefault()
    
    // Update last position
    lastScrollY.current = currentY
  }, [isTransitioning])

  const handleTouchEnd = useCallback((e) => {
    if (isTransitioning) return
    
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()
    const deltaY = touchStartY.current - touchEndY
    const deltaTime = touchEndTime - touchStartTime.current
    const velocity = Math.abs(deltaY) / deltaTime

    // Enhanced swipe detection with velocity
    if (Math.abs(deltaY) > 50 && deltaTime < 500 && velocity > 0.1) {
      if (deltaY > 0) {
        handleNext() // Swipe up - next article
      } else {
        handlePrevious() // Swipe down - previous article
      }
    }
  }, [isTransitioning])

  const handleNext = useCallback(() => {
    if (isTransitioning || currentIndex >= articles.length - 1) return
    
    setIsTransitioning(true)
    setIsExpanded(false)
    
    // Smooth transition
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, articles.length - 1))
      setIsTransitioning(false)
    }, 150)
  }, [currentIndex, articles.length, isTransitioning])

  const handlePrevious = useCallback(() => {
    if (isTransitioning || currentIndex <= 0) return
    
    setIsTransitioning(true)
    setIsExpanded(false)
    
    // Smooth transition
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
      setIsTransitioning(false)
    }, 150)
  }, [currentIndex, isTransitioning])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    showHeaderTemporarily()
  }, [isPlaying, showHeaderTemporarily])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    showHeaderTemporarily()
  }, [isMuted, showHeaderTemporarily])

  const toggleLike = useCallback(() => {
    const newLiked = new Set(likedArticles)
    if (newLiked.has(currentArticle.guid)) {
      newLiked.delete(currentArticle.guid)
    } else {
      newLiked.add(currentArticle.guid)
    }
    setLikedArticles(newLiked)
    showHeaderTemporarily()
  }, [currentArticle, likedArticles, showHeaderTemporarily])

  const handleShare = useCallback(() => {
    setShareArticle(currentArticle)
    setShowShareModal(true)
    showHeaderTemporarily()
  }, [currentArticle, showHeaderTemporarily])

  const getSmartPreview = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text
    
    const preview = text.substring(0, maxLength)
    const lastSpace = preview.lastIndexOf(' ')
    
    if (lastSpace > 80) {
      return preview.substring(0, lastSpace) + '...'
    }
    return preview + '...'
  }

  if (!articles.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-white text-lg mb-4">📰</div>
          <div className="text-white text-sm">No articles with images available</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed inset-0 bg-black overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'none', // Prevent default touch behaviors
          overscrollBehavior: 'none' // Prevent bounce scrolling
        }}
      >
        {/* Background Image with clear visibility */}
        {currentArticle?.optimizedImageUrl && (
          <div className="absolute inset-0">
            <img
              key={currentArticle.guid} // Force re-render for smooth transitions
              src={currentArticle.optimizedImageUrl}
              alt=""
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isTransitioning ? 'opacity-80' : 'opacity-100'
              }`}
            />
            {/* Lighter gradient overlay - only at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        )}

        {/* Content Overlay with smooth transitions */}
        <div className={`relative h-full flex flex-col transition-opacity duration-200 ${
          isTransitioning ? 'opacity-80' : 'opacity-100'
        }`}>
          {/* Top Controls with lighter background */}
          <div className={`flex-shrink-0 p-4 pt-safe transition-all duration-500 ease-in-out ${
            showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
            {/* Light overlay for top controls only when header is visible */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium drop-shadow-lg">
                  {currentIndex + 1} / {articles.length}
                </span>
                <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + 1) / articles.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 border border-white/20"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="h-5 w-5" />
                  ) : (
                    <SpeakerWaveIcon className="h-5 w-5" />
                  )}
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 border border-white/20"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area - Clickable to pause/play */}
          <div 
            className="flex-1 flex items-end p-4 cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="w-full relative">
              {/* Text background overlay - only behind text content */}
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                {/* Priority Badge */}
                {currentArticle?.priority && (
                  <div className="mb-4 transition-opacity duration-300">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg">
                      🇿🇼 Priority News
                    </span>
                  </div>
                )}

                {/* Source and Date */}
                <div className="flex items-center space-x-2 mb-3 transition-opacity duration-300">
                  <span className="text-white text-sm font-semibold drop-shadow-lg">
                    {currentArticle?.source}
                  </span>
                  <span className="text-white/80 text-xs drop-shadow-lg">
                    {currentArticle?.pubDate && new Date(currentArticle.pubDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-white text-xl font-bold leading-tight mb-3 line-clamp-3 transition-opacity duration-300 drop-shadow-lg">
                  {currentArticle?.title}
                </h2>

                {/* Description */}
                {currentArticle?.description && (
                  <div className="mb-4 transition-opacity duration-300">
                    <p className={`text-white/95 text-sm leading-relaxed transition-all duration-300 drop-shadow-md ${
                      isExpanded ? '' : 'line-clamp-3'
                    }`}>
                      {isExpanded ? currentArticle.description : getSmartPreview(currentArticle.description)}
                    </p>
                    
                    {currentArticle.description.length > 120 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsExpanded(!isExpanded)
                          showHeaderTemporarily()
                        }}
                        className="mt-2 text-white/90 text-xs hover:text-white flex items-center gap-1 transition-colors duration-200 drop-shadow-lg"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUpIcon className="w-3 h-3" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-3 h-3" />
                            Read More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Keywords/Hashtags Section */}
                {currentArticle?.keywords && currentArticle.keywords.length > 0 && (
                  <div className="mb-4 transition-opacity duration-300">
                    <div className="flex flex-wrap gap-1.5">
                      {currentArticle.keywords.slice(0, 4).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Add search functionality here
                            console.log('Search for:', keyword)
                            showHeaderTemporarily()
                          }}
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Read Full Article Link */}
                <a
                  href={currentArticle?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation()
                    showHeaderTemporarily()
                  }}
                  className="inline-flex items-center text-white/90 text-sm hover:text-white transition-colors duration-200 drop-shadow-lg"
                >
                  <span>Read Full Article</span>
                  <GlobeAltIcon className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Side Actions - with better contrast */}
          <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-20">
            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLike()
              }}
              className="flex flex-col items-center space-y-1 transition-transform duration-200 hover:scale-110"
            >
              {likedArticles.has(currentArticle?.guid) ? (
                <HeartSolidIcon className="h-8 w-8 text-red-500 drop-shadow-xl" />
              ) : (
                <HeartIcon className="h-8 w-8 text-white drop-shadow-xl" />
              )}
              <span className="text-white text-xs font-medium drop-shadow-lg">
                {likedArticles.has(currentArticle?.guid) ? 'Liked' : 'Like'}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              className="flex flex-col items-center justify-center space-y-1 transition-transform duration-200 hover:scale-110"
            >
              <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                <ShareIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow-lg">Share</span>
            </button>
          </div>

          {/* Bottom Navigation Hints - only show when header is visible */}
          <div className={`flex-shrink-0 p-4 pb-safe transition-all duration-500 ease-in-out ${
            showHeader ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <div className="flex justify-center space-x-8 text-white/70 text-xs">
              <div className="flex items-center space-x-1">
                <ChevronUpIcon className="h-4 w-4 drop-shadow-lg" />
                <span className="drop-shadow-lg">Swipe up for next</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="drop-shadow-lg">Tap to pause/play</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows (for desktop) - with better visibility */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isTransitioning}
          className={`hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 border border-white/20 ${
            (currentIndex === 0 || isTransitioning) ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
        >
          <ChevronUpIcon className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === articles.length - 1 || isTransitioning}
          className={`hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 border border-white/20 ${
            (currentIndex === articles.length - 1 || isTransitioning) ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
        >
          <ChevronDownIcon className="h-6 w-6" />
        </button>

        {/* Loading indicator during transitions */}
        {isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin drop-shadow-lg"></div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        article={shareArticle}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setShareArticle(null)
        }}
        currentColors={{
          cardBg: 'bg-white dark:bg-gray-800',
          text: 'text-gray-900 dark:text-white',
          textMuted: 'text-gray-500 dark:text-gray-400',
          categoryButton: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
        }}
      />
    </>
  )
}

export default NewsBytes