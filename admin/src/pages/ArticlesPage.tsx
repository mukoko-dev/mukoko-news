import React, { useState, useEffect, useCallback } from 'react';
import { articles as articlesAPI, categories as categoriesAPI, type Article, type Category } from '../api/client';
import { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function ArticlesPage() {
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const LIMIT = 20;

  const loadArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await articlesAPI.list({
        limit: LIMIT,
        offset: page * LIMIT,
        category: selectedCategory || undefined,
      });

      if (result.data) {
        setArticleList(result.data.articles || []);
        setTotal(result.data.total || 0);
      }
    } catch (error) {
      showToast('Failed to load articles', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedCategory, showToast]);

  const loadCategories = async () => {
    const result = await categoriesAPI.list();
    if (result.data) {
      setCategoryList(result.data.categories || []);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleRefresh = async () => {
    try {
      const result = await articlesAPI.refreshRSS();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('RSS feeds refreshed successfully', 'success');
        loadArticles();
      }
    } catch (error) {
      showToast('Failed to refresh feeds', 'error');
    }
  };

  const handleBulkPull = async () => {
    try {
      const result = await articlesAPI.bulkPull();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Bulk pull completed', 'success');
        loadArticles();
      }
    } catch (error) {
      showToast('Failed to bulk pull', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (isLoading && articleList.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-500">{total.toLocaleString()} total articles</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRefresh} className="btn btn-secondary">
            🔄 Refresh RSS
          </button>
          <button onClick={handleBulkPull} className="btn btn-primary">
            📥 Bulk Pull
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="input md:w-48"
          >
            <option value="">All Categories</option>
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Source</th>
                <th>Category</th>
                <th>Views</th>
                <th>Published</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {articleList.map((article) => (
                <tr key={article.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {article.image_url && (
                        <img
                          src={article.image_url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-md">
                          {truncateText(article.title, 60)}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-md">
                          {truncateText(article.description || '', 80)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">{article.source}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{article.category}</span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">
                      {article.view_count?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(article.published_at)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        article.status === 'published'
                          ? 'badge-success'
                          : article.status === 'draft'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {page * LIMIT + 1} to {Math.min((page + 1) * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * LIMIT >= total}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
