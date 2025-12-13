import React, { useState, useEffect } from 'react';
import { sources as sourcesAPI, type RSSSource } from '../api/client';
import { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function SourcesPage() {
  const [sourceList, setSourceList] = useState<RSSSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setIsLoading(true);
      const result = await sourcesAPI.list();
      if (result.data) {
        setSourceList(result.data.sources || []);
      } else if (result.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Failed to load sources', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      const result = await sourcesAPI.update(sourceId, { enabled: !enabled });
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast(`Source ${!enabled ? 'enabled' : 'disabled'} successfully`, 'success');
        loadSources();
      }
    } catch (error) {
      showToast('Failed to update source', 'error');
    }
  };

  const handleAddZimbabweSources = async () => {
    try {
      const result = await sourcesAPI.addZimbabweSources();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Zimbabwe sources added successfully', 'success');
        loadSources();
      }
    } catch (error) {
      showToast('Failed to add sources', 'error');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const enabledCount = sourceList.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Sources</h1>
          <p className="text-gray-500">
            {enabledCount} active of {sourceList.length} sources
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadSources} className="btn btn-secondary">
            🔄 Refresh
          </button>
          <button onClick={handleAddZimbabweSources} className="btn btn-primary">
            🇿🇼 Add Zimbabwe Sources
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sourceList.map((source) => (
          <div
            key={source.id}
            className={`card ${!source.enabled ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <span className="text-lg">📰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{source.name}</h3>
                  {source.category && (
                    <span className="badge badge-info text-xs">{source.category}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleSource(source.id, source.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  source.enabled ? 'bg-success' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    source.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">URL</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate max-w-[200px]"
                >
                  {source.url}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Articles</span>
                <span className="font-medium">{source.article_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Fetched</span>
                <span className="text-gray-600">{formatDate(source.last_fetched)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sourceList.length === 0 && (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">📡</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sources configured</h3>
          <p className="text-gray-500 mb-4">Add news sources to start aggregating articles</p>
          <button onClick={handleAddZimbabweSources} className="btn btn-primary">
            🇿🇼 Add Zimbabwe Sources
          </button>
        </div>
      )}
    </div>
  );
}
