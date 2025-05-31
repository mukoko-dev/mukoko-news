import React from 'react';
import { format } from 'date-fns';

export default function NewsFeed({ articles, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading news: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map(article => (
        <article
          key={article.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(article.publishedAt), 'MMM d, yyyy')}
              </span>
              <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                {article.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {article.title}
              </a>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {article.summary}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}