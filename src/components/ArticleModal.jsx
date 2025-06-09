import React, { useState, useEffect, useRef } from 'react'
import { 
  XMarkIcon, 
  ShareIcon, 
  HeartIcon,
  GlobeAltIcon,
  ClockIcon,
  BookmarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import ShareModal from './ShareModal'

const ArticleModal = ({ article, isOpen, onClose, currentColors }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  
  const modalRef = useRef(null)
  const contentRef = useRef(null)

  // Calculate reading time and track progress
  useEffect(() => {
    if (article?.description) {
      const words = article.description.split(' ').length
      const avgWordsPerMinute = 200
      setEstimatedReadTime(Math.ceil(words / avgWordsPerMinute))
    }
  }, [article])

  // Track reading progress
  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const handleScroll = () => {
      const element = contentRef.current
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight
      const progress = (scrollTop / scrollHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }

    const element = contentRef.current
    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      } else if (e.key === '+' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setFontSize(prev => Math.min(prev + 2, 24))
      } else if (e.key === '-' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setFontSize(prev => Math.max(prev - 2, 12))
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, isFullscreen, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleShare = () => {
    setShowShareModal(true)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // Save to localStorage or send to API
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // Save to localStorage or send to API
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen || !article) return null

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black transition-all duration-300`}
        onClick={onClose}
      >
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-60">
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>

        {/* Modal Container - UPDATED */}
        <div 
          ref={modalRef}
          className="fixed inset-0 bg-black shadow-2xl flex flex-col transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-all duration-200 hover:bg-gray-800 active:scale-95"
                aria-label="Close article"
              >
                <XMarkIcon className="h-5 w-5 text-white transition-transform duration-200 active:scale-110" />
              </button>
              
              <div className="flex items-center space-x-2 text-sm">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">
                  {estimatedReadTime} min read
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Font Size Controls */}
              <div className="hidden sm:flex items-center space-x-1">
                <button
                  onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                  className="px-2 py-1 text-xs rounded transition-all duration-200 hover:bg-gray-800 active:scale-95 text-white disabled:opacity-50"
                  disabled={fontSize <= 12}
                >
                  A-
                </button>
                <span className="text-xs text-gray-400 px-2">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
                  className="px-2 py-1 text-xs rounded transition-all duration-200 hover:bg-gray-800 active:scale-95 text-white disabled:opacity-50"
                  disabled={fontSize >= 24}
                >
                  A+
                </button>
              </div>

              {/* Action Buttons - UPDATED */}
              <button
                onClick={toggleBookmark}
                className="p-2 rounded-full transition-all duration-200 hover:bg-gray-800 active:scale-95"
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="h-5 w-5 text-blue-500 transition-transform duration-200 active:scale-110" />
                ) : (
                  <BookmarkIcon className="h-5 w-5 text-white transition-transform duration-200 active:scale-110" />
                )}
              </button>

              <button
                onClick={toggleLike}
                className="p-2 rounded-full transition-all duration-200 hover:bg-gray-800 active:scale-95"
                aria-label={isLiked ? "Unlike article" : "Like article"}
              >
                {isLiked ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500 transition-transform duration-200 active:scale-110" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-white transition-transform duration-200 active:scale-110" />
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-full transition-all duration-200 hover:bg-gray-800 active:scale-95"
                aria-label="Share article"
              >
                <ShareIcon className="h-5 w-5 text-white transition-transform duration-200 active:scale-110" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden lg:block p-2 rounded-full transition-all duration-200 hover:bg-gray-800 active:scale-95"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5 text-white transition-transform duration-200 active:scale-110" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5 text-white transition-transform duration-200 active:scale-110" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-black"
          >
            <article className="max-w-4xl mx-auto">
              {/* Article Meta */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-blue-400">
                      {article.source}
                    </span>
                    {/*article.priority && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-yellow-500 text-white">
                        🇿🇼 Priority
                      </span>
                    )*/}
                  </div>
                  <time className="text-sm text-gray-400">
                    {formatDate(article.pubDate)}
                  </time>
                </div>

                {/* Category */}
                {article.category && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Featured Image */}
              {article.optimizedImageUrl && (
                <div className="mb-8">
                  <img
                    src={article.optimizedImageUrl}
                    alt={article.imageAlt || article.title}
                    className="w-full rounded-lg shadow-lg"
                    loading="eager"
                  />
                  {article.imageAlt && (
                    <p className="text-sm text-gray-400 mt-2 italic text-center">
                      {article.imageAlt}
                    </p>
                  )}
                </div>
              )}

              {/* Article Content - ONLY this should scale with fontSize */}
              <div 
                className="prose prose-lg max-w-none text-gray-200"
                style={{ fontSize: `${fontSize}px` }}
              >
                {article.description ? (
                  <div 
                    className="leading-relaxed space-y-4"
                    style={{ lineHeight: '1.8' }}
                  >
                    {article.description.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4 text-gray-200">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    Content preview not available. Please visit the original article for the full story.
                  </p>
                )}
              </div>

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Related Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer bg-gray-800 text-gray-200 hover:bg-gray-700 active:scale-95"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action - Updated responsive layout */}
              <div className="mt-8 pt-6 pb-16 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-between">
                  <div>
                    <p className="text-gray-400 mb-2">
                      Want to read the complete article?
                    </p>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                    >
                      <span>Visit Original Article</span>
                      <GlobeAltIcon className="w-4 h-4 ml-2" />
                    </a>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleLike}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                        isLiked ? 'bg-red-900/30 text-red-400' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      {isLiked ? (
                        <HeartSolidIcon className="h-4 w-4 transition-transform duration-200 active:scale-110" />
                      ) : (
                        <HeartIcon className="h-4 w-4 transition-transform duration-200 active:scale-110" />
                      )}
                      <span>
                        {isLiked ? 'Liked' : 'Like'}
                      </span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 bg-gray-800 text-gray-200 hover:bg-gray-700 active:scale-95"
                    >
                      <ShareIcon className="h-4 w-4 transition-transform duration-200 active:scale-110" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        article={article}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        currentColors={currentColors}
      />
    </>
  )
}

// Helper function for category colors (same as in App.jsx)
function getCategoryColor(category) {
  const colors = {
    politics: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    economy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    health: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    education: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    entertainment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    agriculture: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    harare: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    environment: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    crime: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    international: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    lifestyle: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    finance: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  }
  
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

export default ArticleModal