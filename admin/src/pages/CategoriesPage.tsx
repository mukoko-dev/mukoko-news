import React, { useState, useEffect } from 'react';
import { categories as categoriesAPI, type Category } from '../api/client';
import { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function CategoriesPage() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const result = await categoriesAPI.list();
      if (result.data) {
        setCategoryList(result.data.categories || []);
      } else if (result.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      politics: '🏛️',
      economy: '💰',
      business: '💼',
      sports: '⚽',
      entertainment: '🎬',
      technology: '💻',
      health: '🏥',
      education: '📚',
      world: '🌍',
      local: '📍',
      opinion: '💭',
      lifestyle: '🌟',
    };
    return icons[name.toLowerCase()] || '📁';
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-cyan-100 text-cyan-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const totalArticles = categoryList.reduce((sum, cat) => sum + (cat.article_count || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">
            {categoryList.length} categories • {totalArticles.toLocaleString()} total articles
          </p>
        </div>
        <button onClick={loadCategories} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categoryList.map((category, index) => (
          <div
            key={category.id}
            className={`card hover:shadow-md transition-shadow ${
              !category.enabled ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getCategoryColor(index)}`}
              >
                {getCategoryIcon(category.name)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">{category.name}</h3>
                <span className="text-xs text-gray-500">/{category.slug}</span>
              </div>
            </div>

            {category.description && (
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(category.article_count || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">articles</p>
              </div>
              <span
                className={`badge ${category.enabled ? 'badge-success' : 'badge-warning'}`}
              >
                {category.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution Chart */}
      {categoryList.length > 0 && (
        <div className="card">
          <h3 className="card-title mb-6">Article Distribution</h3>
          <div className="space-y-4">
            {categoryList
              .sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
              .map((category, index) => {
                const percentage =
                  totalArticles > 0
                    ? Math.round(((category.article_count || 0) / totalArticles) * 100)
                    : 0;
                return (
                  <div key={category.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{category.name}</span>
                      <span className="text-gray-500">
                        {(category.article_count || 0).toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          index === 0
                            ? 'bg-primary'
                            : index === 1
                            ? 'bg-success'
                            : index === 2
                            ? 'bg-accent'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
