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
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)

  const currentArticle = articles[currentIndex]

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      handleNext()
    }, 8000) // 8 seconds per article

    return () => clearTimeout(timer)
  }, [currentIndex, isPlaying])

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

  // Touch gestures
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()
    const deltaY = touchStartY.current - touchEndY
    const deltaTime = touchEndTime - touchStartTime.current

    // Swipe detection
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      if (deltaY > 0) {
        handleNext() // Swipe up - next article
      } else {
        handlePrevious() // Swipe down - previous article
      }
    }
  }, [])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
    setIsExpanded(false)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
    setIsExpanded(false)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleLike = () => {
    const newLiked = new Set(likedArticles)
    if (newLiked.has(currentArticle.guid)) {
      newLiked.delete(currentArticle.guid)
    } else {
      newLiked.add(currentArticle.guid)
    }
    setLikedArticles(newLiked)
  }

  const handleShare = () => {
    setShareArticle(currentArticle)
    setShowShareModal(true)
  }

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
        className="fixed inset-0 bg-black overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image */}
        {currentArticle?.optimizedImageUrl && (
          <div className="absolute inset-0">
            <img
              src={currentArticle.optimizedImageUrl}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col">
          {/* Top Controls */}
          <div className="flex-shrink-0 p-4 pt-safe">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">
                  {currentIndex + 1} / {articles.length}
                </span>
                <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-200"
                    style={{ width: `${((currentIndex + 1) / articles.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="h-5 w-5" />
                  ) : (
                    <SpeakerWaveIcon className="h-5 w-5" />
                  )}
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white"
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
            <div className="w-full">
              {/* Priority Badge */}
              {currentArticle?.priority && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                    🇿🇼 Priority News
                  </span>
                </div>
              )}

              {/* Source and Date */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-white/90 text-sm font-semibold">
                  {currentArticle?.source}
                </span>
                <span className="text-white/60 text-xs">
                  {currentArticle?.pubDate && new Date(currentArticle.pubDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-white text-xl font-bold leading-tight mb-3 line-clamp-3">
                {currentArticle?.title}
              </h2>

              {/* Description */}
              {currentArticle?.description && (
                <div className="mb-4">
                  <p className={`text-white/90 text-sm leading-relaxed ${
                    isExpanded ? '' : 'line-clamp-3'
                  }`}>
                    {isExpanded ? currentArticle.description : getSmartPreview(currentArticle.description)}
                  </p>
                  
                  {currentArticle.description.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsExpanded(!isExpanded)
                      }}
                      className="mt-2 text-white/80 text-xs hover:text-white flex items-center gap-1"
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

              {/* Read Full Article Link */}
              <a
                href={currentArticle?.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-white/80 text-sm hover:text-white transition-colors"
              >
                <span>Read Full Article</span>
                <GlobeAltIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-32 flex flex-col space-y-4">
            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLike()
              }}
              className="flex flex-col items-center space-y-1"
            >
              {likedArticles.has(currentArticle?.guid) ? (
                <HeartSolidIcon className="h-8 w-8 text-red-500" />
              ) : (
                <HeartIcon className="h-8 w-8 text-white" />
              )}
              <span className="text-white text-xs">
                {likedArticles.has(currentArticle?.guid) ? 'Liked' : 'Like'}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              className="flex flex-col items-center justify-center space-y-1"
            >
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                <ShareIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xs">Share</span>
            </button>
          </div>

          {/* Bottom Navigation Hints */}
          <div className="flex-shrink-0 p-4 pb-safe">
            <div className="flex justify-center space-x-8 text-white/60 text-xs">
              <div className="flex items-center space-x-1">
                <ChevronUpIcon className="h-4 w-4" />
                <span>Swipe up for next</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Tap to pause/play</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows (for desktop) */}
        <button
          onClick={handlePrevious}
          className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          disabled={currentIndex === 0}
        >
          <ChevronUpIcon className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          disabled={currentIndex === articles.length - 1}
        >
          <ChevronDownIcon className="h-6 w-6" />
        </button>
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