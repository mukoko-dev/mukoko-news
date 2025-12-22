import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Text as RNText,
} from 'react-native';
import { RefreshCw, Download } from 'lucide-react-native';
import { LoadingState, Badge } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';

/**
 * Admin System Screen
 * Monitor system health and manage cron jobs
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AdminSystemScreen({ navigation }) {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [systemHealth, setSystemHealth] = useState(null);
  const [cronLogs, setCronLogs] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [healthRes, cronRes, aiRes] = await Promise.all([
        admin.getSystemHealth(),
        admin.getCronLogs(),
        admin.getAIPipelineStatus(),
      ]);

      if (healthRes.data) setSystemHealth(healthRes.data);
      if (cronRes.data) setCronLogs(cronRes.data.logs || []);
      if (aiRes.data) setAiStatus(aiRes.data);
    } catch (err) {
      console.error('[Admin] Load system data error:', err);
      setError('Failed to load system data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleRefreshRSS = async () => {
    setActionLoading('rss');
    try {
      await admin.refreshRSS();
      loadData();
    } catch (error) {
      console.error('[Admin] Refresh RSS error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkPull = async () => {
    setActionLoading('bulk');
    try {
      await admin.bulkPull();
      loadData();
    } catch (error) {
      console.error('[Admin] Bulk pull error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'success':
      case 'ok':
        return theme.colors.success;
      case 'warning':
      case 'degraded':
        return theme.colors.warning;
      case 'error':
      case 'failed':
      case 'critical':
        return theme.colors.error;
      default:
        return theme.colors['on-surface-variant'];
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <View className="flex-1 justify-center items-center px-lg bg-background">
        <RNText className="font-serif-bold text-headline-small text-on-surface">
          Access Denied
        </RNText>
      </View>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-lg bg-background">
        <RNText className="font-serif-bold text-headline-small mb-sm text-on-surface">
          Something went wrong
        </RNText>
        <RNText className="font-sans text-body-medium mb-lg text-center text-on-surface-variant">
          {error}
        </RNText>
        <Pressable
          className="py-md px-xl rounded-button min-h-touch bg-tanzanite"
          onPress={loadData}
        >
          <RNText className="font-sans-bold text-label-large text-on-primary">
            Try Again
          </RNText>
        </Pressable>
      </View>
    );
  }

  return (
    <AdminScreenWrapper>
      <View className="flex-1 bg-background">
        <AdminHeader navigation={navigation} currentScreen="AdminSystem" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.tanzanite]}
            />
          }
        >
          {/* Header */}
          <View className="mb-lg">
            <RNText className="font-serif-bold text-headline-small text-on-surface">
              System
            </RNText>
            <RNText className="font-sans text-body-medium text-on-surface-variant">
              Health monitoring and operations
            </RNText>
          </View>

          {/* Quick Actions */}
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            Quick Actions
          </RNText>
          <View className="flex-row gap-md mb-lg">
            <Pressable
              onPress={handleRefreshRSS}
              disabled={actionLoading !== null}
              className="flex-1 flex-row items-center justify-center gap-sm py-md px-lg rounded-button min-h-touch bg-tanzanite"
            >
              <RefreshCw size={18} color="#FFFFFF" />
              <RNText className="font-sans-bold text-label-large text-on-primary">
                Refresh RSS
              </RNText>
            </Pressable>
            <Pressable
              onPress={handleBulkPull}
              disabled={actionLoading !== null}
              className="flex-1 flex-row items-center justify-center gap-sm py-md px-lg rounded-button min-h-touch border border-tanzanite bg-surface"
            >
              <Download size={18} color={theme.colors.tanzanite} />
              <RNText className="font-sans-bold text-label-large text-tanzanite">
                Bulk Pull
              </RNText>
            </Pressable>
          </View>

          {/* System Health */}
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            System Health
          </RNText>
          <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
            <View className="p-lg">
              <View className="flex-row flex-wrap gap-lg">
                <View className="flex-row items-center gap-md" style={{ minWidth: '45%' }}>
                  <View
                    className="w-[12px] h-[12px] rounded-full"
                    style={{ backgroundColor: getStatusColor(systemHealth?.database?.status) }}
                  />
                  <View>
                    <RNText className="font-sans text-body-medium text-on-surface">
                      Database
                    </RNText>
                    <RNText className="font-sans text-body-small text-on-surface-variant">
                      {systemHealth?.database?.status || 'Unknown'}
                    </RNText>
                  </View>
                </View>

                <View className="flex-row items-center gap-md" style={{ minWidth: '45%' }}>
                  <View
                    className="w-[12px] h-[12px] rounded-full"
                    style={{ backgroundColor: getStatusColor(systemHealth?.kv?.status) }}
                  />
                  <View>
                    <RNText className="font-sans text-body-medium text-on-surface">
                      KV Storage
                    </RNText>
                    <RNText className="font-sans text-body-small text-on-surface-variant">
                      {systemHealth?.kv?.status || 'Unknown'}
                    </RNText>
                  </View>
                </View>

                <View className="flex-row items-center gap-md" style={{ minWidth: '45%' }}>
                  <View
                    className="w-[12px] h-[12px] rounded-full"
                    style={{ backgroundColor: getStatusColor(systemHealth?.rss?.status) }}
                  />
                  <View>
                    <RNText className="font-sans text-body-medium text-on-surface">
                      RSS Feeds
                    </RNText>
                    <RNText className="font-sans text-body-small text-on-surface-variant">
                      {systemHealth?.rss?.active_sources || 0} active
                    </RNText>
                  </View>
                </View>

                <View className="flex-row items-center gap-md" style={{ minWidth: '45%' }}>
                  <View
                    className="w-[12px] h-[12px] rounded-full"
                    style={{ backgroundColor: getStatusColor(systemHealth?.ai?.status) }}
                  />
                  <View>
                    <RNText className="font-sans text-body-medium text-on-surface">
                      AI Pipeline
                    </RNText>
                    <RNText className="font-sans text-body-small text-on-surface-variant">
                      {systemHealth?.ai?.status || 'Unknown'}
                    </RNText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* AI Pipeline Status */}
          {aiStatus && (
            <>
              <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
                AI Pipeline
              </RNText>
              <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
                <View className="p-lg">
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <RNText className="font-serif-bold text-stats text-on-surface">
                        {aiStatus.processed_today || 0}
                      </RNText>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        Processed Today
                      </RNText>
                    </View>
                    <View className="items-center">
                      <RNText className="font-serif-bold text-stats text-on-surface">
                        {aiStatus.pending || 0}
                      </RNText>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        Pending
                      </RNText>
                    </View>
                    <View className="items-center">
                      <RNText className="font-serif-bold text-stats text-on-surface">
                        {aiStatus.failed || 0}
                      </RNText>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        Failed
                      </RNText>
                    </View>
                  </View>

                  {aiStatus.last_processed && (
                    <RNText className="font-sans text-body-small text-on-surface-variant mt-md">
                      Last processed: {formatTimestamp(aiStatus.last_processed)}
                    </RNText>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Cron Logs */}
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            Recent Jobs
          </RNText>
          <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
            <View className="p-lg">
              {cronLogs.length > 0 ? (
                cronLogs.slice(0, 10).map((log, index) => (
                  <View
                    key={index}
                    className="py-md border-b border-outline-variant"
                  >
                    <View className="flex-row justify-between items-center mb-xs">
                      <Badge
                        variant={getStatusBadgeVariant(log.status)}
                        size="sm"
                      >
                        {log.status || 'Unknown'}
                      </Badge>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        {formatTimestamp(log.created_at)}
                      </RNText>
                    </View>
                    <RNText className="font-sans-medium text-body-medium text-on-surface my-xs">
                      {log.job_name || 'Unknown Job'}
                    </RNText>
                    {log.message && (
                      <RNText
                        className="font-sans text-body-small text-on-surface-variant"
                        numberOfLines={2}
                      >
                        {log.message}
                      </RNText>
                    )}
                    {log.duration_ms && (
                      <RNText className="font-sans text-body-small text-on-surface-variant mt-xs">
                        Duration: {log.duration_ms}ms
                      </RNText>
                    )}
                  </View>
                ))
              ) : (
                <RNText className="font-sans text-body-medium text-on-surface-variant">
                  No recent job logs
                </RNText>
              )}
            </View>
          </View>

          {/* Database Stats */}
          {systemHealth?.database?.stats && (
            <>
              <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
                Database Stats
              </RNText>
              <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
                <View className="p-lg">
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <RNText className="font-serif-bold text-stats text-on-surface">
                        {systemHealth.database.stats.total_articles?.toLocaleString() || 0}
                      </RNText>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        Articles
                      </RNText>
                    </View>
                    <View className="items-center">
                      <RNText className="font-serif-bold text-stats text-on-surface">
                        {systemHealth.database.stats.total_users?.toLocaleString() || 0}
                      </RNText>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        Users
                      </RNText>
                    </View>
                    <View className="items-center">
                      <RNText className="font-serif-bold text-stats text-on-surface">
                        {systemHealth.database.stats.total_sources?.toLocaleString() || 0}
                      </RNText>
                      <RNText className="font-sans text-body-small text-on-surface-variant">
                        Sources
                      </RNText>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </AdminScreenWrapper>
  );
}
