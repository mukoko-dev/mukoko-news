import React, { useState, useRef, useEffect } from 'react'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ShareIcon 
} from '@heroicons/react/24/outline'

function NewsBytes({ articles, currentColors }) {
  // Sort articles by date, newest first
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.pubDate) - new Date(a.pubDate)
  )
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState([])
  const containerRef = useRef(null)
  const touchStart = useRef(null)

  // Preload images
  useEffect(() => {
    const preloadNextImages = () => {
      const nextIndexes = [
        currentIndex + 1, 
        currentIndex + 2,
        currentIndex - 1
      ].filter(idx => idx >= 0 && idx < articles.length)

      nextIndexes.forEach(idx => {
        if (!preloadedImages.includes(idx)) {
          const img = new Image()
          img.src = articles[idx].optimizedImageUrl
          setPreloadedImages(prev => [...prev, idx])
        }
      })
    }

    preloadNextImages()
  }, [currentIndex, articles])

  const handleSwipe = (direction) => {
    if (direction === 'down' && currentIndex < sortedArticles.length - 1) {
      // Swipe down to see older articles
      setCurrentIndex(prev => prev + 1)
      setIsExpanded(false)
    } else if (direction === 'up' && currentIndex > 0) {
      // Swipe up to see newer articles
      setCurrentIndex(prev => prev - 1)
      setIsExpanded(false)
    }
  }

  const handleShare = async () => {
    const article = articles[currentIndex]
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.link
        })
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(article.link)
        // You might want to add a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    if (!touchStart.current) return

    const currentTouch = e.touches[0].clientY
    const diff = touchStart.current - currentTouch

    if (Math.abs(diff) > 50) { // minimum swipe distance
      if (diff > 0) {
        // Swiping up shows newer articles
        handleSwipe('up')
      } else {
        // Swiping down shows older articles
        handleSwipe('down')
      }
      touchStart.current = null
    }
  }

  const currentArticle = sortedArticles[currentIndex]

  return (
    <div 
      className="fixed inset-0 bg-black lg:hidden" 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => touchStart.current = null}
    >
      {/* Current Article */}
      <div className="relative h-full w-full">
        {/* Image */}
        <img
          src={currentArticle.optimizedImageUrl}
          alt={currentArticle.title}
          className="h-full w-full object-cover"
          loading="eager"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black to-transparent" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          {/* Source and Date */}
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold">{currentArticle.source}</span>
            <span className="opacity-75">
              {new Date(currentArticle.pubDate).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mb-2">{currentArticle.title}</h2>

          {/* Description */}
          <div className="relative">
            <p className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {currentArticle.description}
            </p>
            {currentArticle.description?.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-sm text-white/75 flex items-center"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUpIcon className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Read More <ChevronDownIcon className="h-4 w-4 ml-1" /></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Side Actions */}
        <div className="absolute right-4 bottom-1/3 flex flex-col items-center space-y-6">
          {/* Source Logo/Icon */}
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center">
            <img 
              src={`/source-logos/${currentArticle.source.toLowerCase()}.png`}
              alt={currentArticle.source}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/default-source-icon.png'
              }}
            />
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center"
            aria-label="Share article"
          >
            <ShareIcon className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Controls */}
          <div className="flex flex-col items-center space-y-4">
            <button 
              onClick={() => handleSwipe('up')}
              disabled={currentIndex <= 0}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center disabled:opacity-50"
              aria-label="Show newer article"
            >
              <ChevronUpIcon className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={() => handleSwipe('down')}
              disabled={currentIndex >= sortedArticles.length - 1}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center disabled:opacity-50"
              aria-label="Show older article"
            >
              <ChevronDownIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute left-0 top-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white"
            style={{ 
              width: `${((currentIndex + 1) / articles.length) * 100}%`,
              transition: 'width 0.3s ease-out'
            }}
          />
        </div>
      </div>

      {/* Preload Next Images */}
      <div className="hidden">
        {[currentIndex + 1, currentIndex + 2].map(idx => (
          articles[idx] && (
            <img 
              key={idx}
              src={articles[idx].optimizedImageUrl}
              alt=""
              aria-hidden="true"
            />
          )
        ))}
      </div>
    </div>
  )
}

export default NewsBytes