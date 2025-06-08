import React, { useState, useRef, useEffect } from 'react'
import { ShareIcon } from '@heroicons/react/24/outline'

function NewsBytes({ articles, currentColors }) {
  // Sort articles by date, newest first
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.pubDate) - new Date(a.pubDate)
  )
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchCurrentY, setTouchCurrentY] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef(null)

  // Preload images
  useEffect(() => {
    const preloadNextImages = () => {
      const nextIndexes = [
        currentIndex + 1, 
        currentIndex + 2,
        currentIndex - 1
      ].filter(idx => idx >= 0 && idx < sortedArticles.length)

      nextIndexes.forEach(idx => {
        if (!preloadedImages.includes(idx)) {
          const img = new Image()
          img.src = sortedArticles[idx].optimizedImageUrl
          setPreloadedImages(prev => [...prev, idx])
        }
      })
    }

    preloadNextImages()
  }, [currentIndex, sortedArticles])

  const handleTouchStart = (e) => {
    if (isTransitioning) return
    setIsDragging(true)
    setTouchStartY(e.touches[0].clientY)
    setTouchCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || isTransitioning) return
    setTouchCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!isDragging || isTransitioning) return
    
    const deltaY = touchStartY - touchCurrentY
    const threshold = 50 // Minimum swipe distance

    if (Math.abs(deltaY) > threshold) {
      setIsTransitioning(true)
      
      if (deltaY > 0 && currentIndex < sortedArticles.length - 1) {
        // Swiped up - go to next (older) article
        setCurrentIndex(prev => prev + 1)
      } else if (deltaY < 0 && currentIndex > 0) {
        // Swiped down - go to previous (newer) article
        setCurrentIndex(prev => prev - 1)
      }

      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }

    setIsDragging(false)
    setIsExpanded(false)
  }

  const handleShare = async () => {
    const currentArticle = sortedArticles[currentIndex]
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentArticle.title,
          text: currentArticle.description,
          url: currentArticle.link,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(currentArticle.link)
    }
  }

  if (!sortedArticles.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white">No articles available</p>
      </div>
    )
  }

  const currentArticle = sortedArticles[currentIndex]
  const dragOffset = isDragging ? touchCurrentY - touchStartY : 0

  return (
    <div 
      className="fixed inset-0 bg-black lg:hidden overflow-hidden select-none"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Articles Container */}
      <div className="relative h-full w-full">
        {/* Previous Article (when swiping down) */}
        {currentIndex > 0 && (
          <div 
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${isDragging && dragOffset > 0 ? dragOffset - window.innerHeight : '-100vh'})`
            }}
          >
            <img
              src={sortedArticles[currentIndex - 1].optimizedImageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Current Article */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${isDragging ? dragOffset : 0}px)`
          }}
        >
          <img
            src={currentArticle.optimizedImageUrl}
            alt={currentArticle.title}
            className="h-full w-full object-cover"
            loading="eager"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Article Content */}
          <div className="absolute inset-x-0 bottom-0 p-4 pb-8 text-white">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  {currentArticle.source}
                </span>
                <span className="text-xs text-white/80">
                  {new Date(currentArticle.pubDate).toLocaleDateString()}
                </span>
              </div>
              
              <h1 className="text-lg font-bold leading-tight line-clamp-3">
                {currentArticle.title}
              </h1>
              
              {currentArticle.description && (
                <p className={`text-sm text-white/90 leading-relaxed ${
                  isExpanded ? '' : 'line-clamp-2'
                }`}>
                  {currentArticle.description}
                </p>
              )}
              
              {currentArticle.description && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-white/80 underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Side Actions */}
          <div className="absolute right-4 bottom-1/3 flex flex-col items-center space-y-6">
            {/* Source Icon */}
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20">
              <span className="text-white text-xs font-bold">
                {currentArticle.source.charAt(0)}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
              aria-label="Share article"
            >
              <ShareIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ 
                width: `${((currentIndex + 1) / sortedArticles.length) * 100}%`
              }}
            />
          </div>

          {/* Article Counter */}
          <div className="absolute top-4 right-4">
            <span className="text-white/80 text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
              {currentIndex + 1} / {sortedArticles.length}
            </span>
          </div>
        </div>

        {/* Next Article (when swiping up) */}
        {currentIndex < sortedArticles.length - 1 && (
          <div 
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${isDragging && dragOffset < 0 ? dragOffset + window.innerHeight : '100vh'})`
            }}
          >
            <img
              src={sortedArticles[currentIndex + 1].optimizedImageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Swipe Indicator */}
      {isDragging && Math.abs(dragOffset) > 20 && (
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-center pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
            <span className="text-white text-sm">
              {dragOffset < 0 ? '↑ Next Article' : '↓ Previous Article'}
            </span>
          </div>
        </div>
      )}

      {/* Preload hidden images */}
      <div className="hidden">
        {[currentIndex + 1, currentIndex + 2].map((idx) => {
          if (idx < sortedArticles.length) {
            return (
              <img
                key={idx}
                src={sortedArticles[idx].optimizedImageUrl}
                alt=""
                loading="lazy"
              />
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

export default NewsBytes