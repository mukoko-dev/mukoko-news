import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stats, articles, type AdminStats } from '../api/client';
import LoadingSpinner, { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  bgColor: string;
}

function StatCard({ icon, label, value, change, changeType = 'neutral', bgColor }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${bgColor}`}>
        <span>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeColors[changeType]}`}>
          {change}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<{ total_users: number; active_users: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [statsResult, userStatsResult] = await Promise.all([
        stats.getOverview(),
        stats.getUserStats(),
      ]);

      if (statsResult.data) {
        setAdminStats(statsResult.data);
      }
      if (userStatsResult.data) {
        setUserStats(userStatsResult.data as { total_users: number; active_users: number });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      showToast('Failed to load dashboard stats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRSS = async () => {
    setIsRefreshing(true);
    try {
      const result = await articles.refreshRSS();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('RSS feeds refreshed successfully', 'success');
        loadStats();
      }
    } catch (error) {
      showToast('Failed to refresh RSS feeds', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📰"
          label="Total Articles"
          value={adminStats?.database.total_articles?.toLocaleString() || '0'}
          bgColor="bg-blue-100"
        />
        <StatCard
          icon="📡"
          label="Active Sources"
          value={adminStats?.database.active_sources || '0'}
          bgColor="bg-green-100"
        />
        <StatCard
          icon="🏷️"
          label="Categories"
          value={adminStats?.database.categories || '0'}
          bgColor="bg-purple-100"
        />
        <StatCard
          icon="👥"
          label="Total Users"
          value={userStats?.total_users?.toLocaleString() || '0'}
          bgColor="bg-orange-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleRefreshRSS}
            disabled={isRefreshing}
            className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-left"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="text-2xl">🔄</span>
            )}
            <div>
              <p className="font-medium text-gray-900">Refresh RSS Feeds</p>
              <p className="text-sm text-gray-500">Pull latest articles</p>
            </div>
          </button>

          <Link
            to="/articles"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Manage Articles</p>
              <p className="text-sm text-gray-500">View and edit content</p>
            </div>
          </Link>

          <Link
            to="/users"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">👤</span>
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">Roles and permissions</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation Cards */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Management</h3>
          </div>
          <div className="space-y-3">
            <Link
              to="/sources"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📡</span>
                <span className="font-medium">News Sources</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              to="/categories"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🏷️</span>
                <span className="font-medium">Categories</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📈</span>
                <span className="font-medium">Analytics</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Status</h3>
            <Link to="/system" className="text-sm text-primary hover:underline">
              View details →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="badge badge-success">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">RSS Processing</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-500">
                {adminStats?.timestamp
                  ? new Date(adminStats.timestamp).toLocaleTimeString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
