import React, { useState, useEffect } from 'react';
import { stats, categories as categoriesAPI } from '../api/client';
import { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

interface CategoryInsight {
  category: string;
  article_count: number;
  total_views: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<{
    views?: number;
    likes?: number;
    shares?: number;
    bookmarks?: number;
  } | null>(null);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([]);
  const [contentQuality, setContentQuality] = useState<{
    total_articles?: number;
    with_images?: number;
    with_descriptions?: number;
    average_word_count?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const { showToast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [analyticsResult, insightsResult, qualityResult] = await Promise.all([
        stats.getAnalytics(),
        categoriesAPI.getInsights(timeRange),
        stats.getContentQuality(),
      ]);

      if (analyticsResult.data) {
        setAnalytics(analyticsResult.data as { views?: number; likes?: number; shares?: number; bookmarks?: number });
      }
      if (insightsResult.data) {
        setCategoryInsights((insightsResult.data as { insights?: CategoryInsight[] })?.insights || []);
      }
      if (qualityResult.data) {
        setContentQuality(qualityResult.data as { total_articles?: number; with_images?: number; with_descriptions?: number; average_word_count?: number });
      }
    } catch (error) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Platform engagement and content metrics</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`btn ${timeRange === days ? 'btn-primary' : 'btn-secondary'}`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">👁️</div>
          <div className="stat-value">{formatNumber(analytics?.views)}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-100">❤️</div>
          <div className="stat-value">{formatNumber(analytics?.likes)}</div>
          <div className="stat-label">Total Likes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100">🔗</div>
          <div className="stat-value">{formatNumber(analytics?.shares)}</div>
          <div className="stat-label">Total Shares</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow-100">🔖</div>
          <div className="stat-value">{formatNumber(analytics?.bookmarks)}</div>
          <div className="stat-label">Total Bookmarks</div>
        </div>
      </div>

      {/* Content Quality */}
      <div className="card">
        <h3 className="card-title mb-6">Content Quality</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {contentQuality?.total_articles?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500">Total Articles</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success">
              {contentQuality?.total_articles
                ? Math.round(
                    ((contentQuality?.with_images || 0) / contentQuality.total_articles) * 100
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-gray-500">With Images</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {contentQuality?.total_articles
                ? Math.round(
                    ((contentQuality?.with_descriptions || 0) / contentQuality.total_articles) * 100
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-gray-500">With Descriptions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">
              {contentQuality?.average_word_count?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500">Avg. Word Count</p>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="card">
        <h3 className="card-title mb-6">Category Performance</h3>
        {categoryInsights.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Articles</th>
                  <th>Views</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categoryInsights.map((insight) => (
                  <tr key={insight.category}>
                    <td>
                      <span className="font-medium capitalize">{insight.category}</span>
                    </td>
                    <td>{insight.article_count?.toLocaleString() || 0}</td>
                    <td>{insight.total_views?.toLocaleString() || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          insight.trend === 'up'
                            ? 'badge-success'
                            : insight.trend === 'down'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {insight.trend === 'up' ? '↑ Up' : insight.trend === 'down' ? '↓ Down' : '→ Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No category insights available</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="card-title mb-4">Engagement Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-success"
                  style={{
                    width: `${Math.min(
                      ((analytics?.likes || 0) / Math.max(analytics?.views || 1, 1)) * 100 * 10,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-lg font-semibold">
              {analytics?.views
                ? (((analytics?.likes || 0) / analytics.views) * 100).toFixed(2)
                : 0}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Percentage of views that result in likes
          </p>
        </div>

        <div className="card">
          <h3 className="card-title mb-4">Save Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-warning"
                  style={{
                    width: `${Math.min(
                      ((analytics?.bookmarks || 0) / Math.max(analytics?.views || 1, 1)) * 100 * 10,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-lg font-semibold">
              {analytics?.views
                ? (((analytics?.bookmarks || 0) / analytics.views) * 100).toFixed(2)
                : 0}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Percentage of views that result in bookmarks
          </p>
        </div>
      </div>
    </div>
  );
}
