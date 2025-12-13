import React, { useState, useEffect } from 'react';
import { observability, stats } from '../api/client';
import { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

interface HealthStatus {
  status: string;
  services?: Record<string, string>;
  timestamp?: string;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

interface CronLog {
  id: string;
  job_name: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export default function SystemPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number | string> | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);
  const [aiStatus, setAiStatus] = useState<{ enabled?: boolean; queue_size?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      const [healthResult, metricsResult, alertsResult, cronResult, aiResult] = await Promise.all([
        observability.health(),
        observability.metrics(),
        observability.alerts(),
        stats.getCronLogs(),
        stats.getAIPipelineStatus(),
      ]);

      if (healthResult.data) setHealth(healthResult.data as HealthStatus);
      if (metricsResult.data) setMetrics(metricsResult.data as Record<string, number | string>);
      if (alertsResult.data) setAlerts((alertsResult.data as { alerts?: Alert[] })?.alerts || []);
      if (cronResult.data) setCronLogs((cronResult.data as { logs?: CronLog[] })?.logs || []);
      if (aiResult.data) setAiStatus(aiResult.data as { enabled?: boolean; queue_size?: number });
    } catch (error) {
      showToast('Failed to load system data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'operational':
      case 'success':
      case 'active':
        return 'badge-success';
      case 'degraded':
      case 'warning':
        return 'badge-warning';
      case 'error':
      case 'failed':
      case 'unhealthy':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500">Monitor system status and performance</p>
        </div>
        <button onClick={loadSystemData} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Overall Status */}
      <div className="card bg-gradient-to-r from-primary/5 to-success/5">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              health?.status === 'healthy' ? 'bg-success/20' : 'bg-warning/20'
            }`}
          >
            <span className="text-3xl">
              {health?.status === 'healthy' ? '✓' : '⚠️'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              System is {health?.status || 'Unknown'}
            </h2>
            <p className="text-gray-500">
              Last checked: {formatDate(health?.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="card">
        <h3 className="card-title mb-4">Services Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.services &&
            Object.entries(health.services).map(([service, status]) => (
              <div
                key={service}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {service === 'database'
                      ? '🗄️'
                      : service === 'analytics'
                      ? '📊'
                      : service === 'cache'
                      ? '⚡'
                      : '🔧'}
                  </span>
                  <span className="font-medium capitalize">{service}</span>
                </div>
                <span className={`badge ${getStatusColor(String(status))}`}>
                  {String(status)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* AI Pipeline Status */}
      <div className="card">
        <h3 className="card-title mb-4">AI Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold">
              <span className={`badge ${aiStatus?.enabled ? 'badge-success' : 'badge-warning'}`}>
                {aiStatus?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Queue Size</p>
            <p className="text-lg font-semibold">{aiStatus?.queue_size || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-lg font-semibold">
              <span className="badge badge-info">Background</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <h3 className="card-title mb-4">Recent Alerts</h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.level === 'error'
                    ? 'bg-red-50 border-red-500'
                    : alert.level === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{alert.message}</span>
                  <span className="text-sm text-gray-500">{formatDate(alert.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No recent alerts</p>
        )}
      </div>

      {/* Cron Jobs */}
      <div className="card">
        <h3 className="card-title mb-4">Recent Cron Jobs</h3>
        {cronLogs.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {cronLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-medium">{log.job_name}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">{formatDate(log.started_at)}</td>
                    <td className="text-sm text-gray-500">{formatDate(log.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No cron job logs available</p>
        )}
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="card">
          <h3 className="card-title mb-4">System Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
