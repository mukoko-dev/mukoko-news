import React, { useState, useEffect } from 'react'
import {
  XMarkIcon,
  ShareIcon,
  LinkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const ShareModal = ({ article, isOpen, onClose, currentColors }) => {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (article) {
      // Create a shareable URL for the article
      const url = `${window.location.origin}?article=${encodeURIComponent(article.guid)}&source=${encodeURIComponent(article.source)}`
      setShareUrl(url)
    }
  }, [article])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${article?.title}\n\n${shareUrl}`)}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article?.title)}&url=${encodeURIComponent(shareUrl)}&hashtags=Zimbabwe,News`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(article?.title)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-400 hover:bg-blue-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article?.title)}`
    },
    {
      name: 'Reddit',
      icon: '🔸',
      color: 'bg-orange-500 hover:bg-orange-600',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article?.title)}`
    }
  ]

  if (!isOpen || !article) return null

  const handleShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: shareUrl
        })
      } catch (err) {
        console.log('Native share failed, using fallback')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`${currentColors.cardBg} rounded-t-3xl w-full max-w-md mx-4 mb-0 transform transition-transform duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${currentColors.text}`}>Share Article</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${currentColors.categoryButton}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Article Preview */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            {article.optimizedImageUrl && (
              <img
                src={article.optimizedImageUrl}
                alt={article.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${currentColors.text} line-clamp-2 mb-1`}>
                {article.title}
              </h4>
              <p className={`text-xs ${currentColors.textMuted}`}>
                {article.source} • {new Date(article.pubDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Copy Link */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={copyToClipboard}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
              copied ? 'bg-green-100 dark:bg-green-900/30' : currentColors.categoryButton
            }`}
          >
            <div className="flex items-center space-x-3">
              {copied ? (
                <CheckIcon className="h-5 w-5 text-green-600" />
              ) : (
                <LinkIcon className="h-5 w-5" />
              )}
              <span className={`font-medium ${copied ? 'text-green-600' : currentColors.text}`}>
                {copied ? 'Link Copied!' : 'Copy Link'}
              </span>
            </div>
            {copied && (
              <span className="text-xs text-green-600">✓</span>
            )}
          </button>
        </div>

        {/* Native Share (if available) */}
        {navigator.share && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleNativeShare}
              className={`w-full flex items-center justify-center space-x-3 p-3 rounded-xl transition-colors ${currentColors.categoryButton}`}
            >
              <ShareIcon className="h-5 w-5" />
              <span className={`font-medium ${currentColors.text}`}>
                More Options
              </span>
            </button>
          </div>
        )}

        {/* Social Media Options */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleShare(option.url)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl text-white transition-transform hover:scale-105 ${option.color}`}
              >
                <span className="text-2xl mb-2">{option.icon}</span>
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0">
          <p className={`text-xs ${currentColors.textMuted} text-center`}>
            Share news from Harare Metro - Zimbabwe's trusted news source
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShareModal