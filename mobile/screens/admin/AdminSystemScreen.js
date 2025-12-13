import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { admin } from '../../api/client';

/**
 * Admin System Screen
 * Monitor system health and manage cron jobs
 */
export default function AdminSystemScreen() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [systemHealth, setSystemHealth] = useState(null);
  const [cronLogs, setCronLogs] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [healthRes, cronRes, aiRes] = await Promise.all([
        admin.getSystemHealth(),
        admin.getCronLogs(),
        admin.getAIPipelineStatus(),
      ]);

      if (healthRes.data) setSystemHealth(healthRes.data);
      if (cronRes.data) setCronLogs(cronRes.data.logs || []);
      if (aiRes.data) setAiStatus(aiRes.data);
    } catch (error) {
      console.error('[Admin] Load system data error:', error);
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
        return '#00A651';
      case 'warning':
      case 'degraded':
        return '#FDD116';
      case 'error':
      case 'failed':
      case 'critical':
        return '#EF3340';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall">Access Denied</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>System</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          Health monitoring and operations
        </Text>
      </View>

      {/* Quick Actions */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <Button
          mode="contained"
          onPress={handleRefreshRSS}
          loading={actionLoading === 'rss'}
          disabled={actionLoading !== null}
          icon="refresh"
          style={styles.actionButton}
        >
          Refresh RSS
        </Button>
        <Button
          mode="outlined"
          onPress={handleBulkPull}
          loading={actionLoading === 'bulk'}
          disabled={actionLoading !== null}
          icon="download"
          style={styles.actionButton}
        >
          Bulk Pull
        </Button>
      </View>

      {/* System Health */}
      <Text variant="titleMedium" style={styles.sectionTitle}>System Health</Text>
      <Card style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(systemHealth?.database?.status) },
                ]}
              />
              <View>
                <Text variant="bodyMedium">Database</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {systemHealth?.database?.status || 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(systemHealth?.kv?.status) },
                ]}
              />
              <View>
                <Text variant="bodyMedium">KV Storage</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {systemHealth?.kv?.status || 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(systemHealth?.rss?.status) },
                ]}
              />
              <View>
                <Text variant="bodyMedium">RSS Feeds</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {systemHealth?.rss?.active_sources || 0} active
                </Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(systemHealth?.ai?.status) },
                ]}
              />
              <View>
                <Text variant="bodyMedium">AI Pipeline</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {systemHealth?.ai?.status || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* AI Pipeline Status */}
      {aiStatus && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>AI Pipeline</Text>
          <Card style={[styles.aiCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.aiStats}>
                <View style={styles.aiStat}>
                  <Text style={styles.aiValue}>{aiStatus.processed_today || 0}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Processed Today
                  </Text>
                </View>
                <View style={styles.aiStat}>
                  <Text style={styles.aiValue}>{aiStatus.pending || 0}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Pending
                  </Text>
                </View>
                <View style={styles.aiStat}>
                  <Text style={styles.aiValue}>{aiStatus.failed || 0}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Failed
                  </Text>
                </View>
              </View>

              {aiStatus.last_processed && (
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}
                >
                  Last processed: {formatTimestamp(aiStatus.last_processed)}
                </Text>
              )}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Cron Logs */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Recent Jobs</Text>
      <Card style={[styles.logsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {cronLogs.length > 0 ? (
            cronLogs.slice(0, 10).map((log, index) => (
              <View key={index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Chip
                    compact
                    textStyle={{ fontSize: 11 }}
                    style={{
                      backgroundColor:
                        log.status === 'success'
                          ? '#00A65120'
                          : log.status === 'failed'
                          ? '#EF334020'
                          : '#FDD11620',
                    }}
                  >
                    {log.status || 'Unknown'}
                  </Chip>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatTimestamp(log.created_at)}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.logName}>
                  {log.job_name || 'Unknown Job'}
                </Text>
                {log.message && (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                    numberOfLines={2}
                  >
                    {log.message}
                  </Text>
                )}
                {log.duration_ms && (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                  >
                    Duration: {log.duration_ms}ms
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No recent job logs
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Database Stats */}
      {systemHealth?.database?.stats && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Database Stats</Text>
          <Card style={[styles.dbCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.dbGrid}>
                <View style={styles.dbStat}>
                  <Text style={styles.dbValue}>
                    {systemHealth.database.stats.total_articles?.toLocaleString() || 0}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Articles
                  </Text>
                </View>
                <View style={styles.dbStat}>
                  <Text style={styles.dbValue}>
                    {systemHealth.database.stats.total_users?.toLocaleString() || 0}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Users
                  </Text>
                </View>
                <View style={styles.dbStat}>
                  <Text style={styles.dbValue}>
                    {systemHealth.database.stats.total_sources?.toLocaleString() || 0}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Sources
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  healthCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: '45%',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  aiCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  aiStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aiStat: {
    alignItems: 'center',
  },
  aiValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  logsCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logName: {
    fontWeight: '500',
    marginVertical: 4,
  },
  dbCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  dbGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dbStat: {
    alignItems: 'center',
  },
  dbValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
