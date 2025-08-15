// src/components/FilterControls.jsx - Simplified version
import React, { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { IconGroup } from './ui/icon-group'
import { IconButton } from './ui/icon-button'

const FilterControls = ({
  selectedTimeframe,
  setSelectedTimeframe,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  className = ''
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const timeframeOptions = [
    { id: 'all', label: 'All Time', icon: '📅' },
    { id: '1h', label: 'Last Hour', icon: '⏰' },
    { id: '6h', label: 'Last 6 Hours', icon: '🕕' },
    { id: '24h', label: 'Last 24 Hours', icon: '📆' },
    { id: '7d', label: 'Last 7 Days', icon: '📅' }
  ]

  const sortOptions = [
    { id: 'newest', label: 'Newest First', icon: '⬇️' },
    { id: 'oldest', label: 'Oldest First', icon: '⬆️' },
    { id: 'source', label: 'By Source', icon: '📰' },
    { id: 'category', label: 'By Category', icon: '📂' }
  ]

  // Check if filters are active (not default)
  const hasActiveFilters = selectedTimeframe !== 'all' || sortBy !== 'newest'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${hasActiveFilters 
              ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600/20' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          {/* Filter Icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full font-bold">
              {(selectedTimeframe !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)}
            </span>
          )}
          {/* Chevron */}
          <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsFilterOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-72 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
              <div className="p-4">
                
                {/* Timeframe Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-200 dark:border-gray-700 mb-3">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Timeframe
                    </span>
                  </div>
                  <div className="space-y-1">
                    {timeframeOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedTimeframe(option.id)
                          setIsFilterOpen(false)
                        }}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 text-sm
                          ${selectedTimeframe === option.id 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                        {selectedTimeframe === option.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Section */}
                <div>
                  <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-200 dark:border-gray-700 mb-3">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Sort By
                    </span>
                  </div>
                  <div className="space-y-1">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id)
                          setIsFilterOpen(false)
                        }}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 text-sm
                          ${sortBy === option.id 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                        {sortBy === option.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Mode Toggle */}
      <IconGroup variant="contained" className="p-1">
        <IconButton
          variant="icon"
          size="icon"
          onClick={() => setViewMode?.('grid')}
          className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
          tooltip="Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </IconButton>
        
        <IconButton
          variant="icon"
          size="icon"
          onClick={() => setViewMode?.('list')}
          className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
          tooltip="List View"
        >
          <List className="w-4 h-4" />
        </IconButton>
      </IconGroup>
    </div>
  )
}

export default FilterControls