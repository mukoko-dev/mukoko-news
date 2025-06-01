import React from 'react'
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline'

export default function NewsCard({ article }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Recent'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      news: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      technology: 'bg-purple-100 text-purple-800',
      sports: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || colors.general
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-blue-600">
          {article.source}
        </span>
        <div className="flex items-center text-xs text-gray-500">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {formatDate(article.pubDate)}
        </div>
      </div>
      
      <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
        {article.title}
      </h2>
      
      {article.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TagIcon className="h-3 w-3 mr-1 text-gray-400" />
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>
        
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group"
        >
          Read more
          <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  )
}
