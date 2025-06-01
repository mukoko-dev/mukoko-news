import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading latest news...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching articles from Zimbabwe news sources</p>
      </div>
    </div>
  )
}
