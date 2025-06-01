import React from 'react'
import { NewspaperIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Header({ onRefresh }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NewspaperIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">
                Harare Metro
              </h1>
              <p className="text-sm text-gray-500">Zimbabwe News Aggregator</p>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}
