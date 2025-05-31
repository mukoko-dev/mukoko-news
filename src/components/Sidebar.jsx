import React from 'react';
import { XIcon } from '@heroicons/react/outline';

export default function Sidebar({ isOpen, onClose, categories, selectedCategory, onCategorySelect }) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <aside
        className={`fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Categories</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}