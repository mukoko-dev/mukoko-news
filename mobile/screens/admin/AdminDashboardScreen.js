import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';

/**
 * Admin Dashboard Screen
 * Shows platform statistics and quick actions
 * Responsive: works on mobile, tablet, and web
 */
export default function AdminDashboardScreen({ navigation }) {
  const theme = useTheme();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const { width } = Dimensions.get('window');
  const isWideScreen = width >= 768;

  const loadData = useCallback(async () => {
    try {
      const [statsResult, userStatsResult] = await Promise.all([
        admin.getStats(),
        admin.getUserStats(),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (userStatsResult.data) setUserStats(userStatsResult.data);
    } catch (error) {
      console.error('[Admin] Load data error:', error);
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

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall">Access Denied</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            You don't have permission to access the admin panel.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const StatCard = ({ icon, label, value, color }) => (
    <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.statCardContent}>
        <Text style={[styles.statIcon, { backgroundColor: color + '20', color }]}>
          {icon}
        </Text>
        <Text variant="headlineMedium" style={styles.statValue}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );

  const QuickAction = ({ icon, title, subtitle, onPress, loading: isLoading }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[
        styles.quickAction,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <Text style={styles.quickActionIcon}>{icon}</Text>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="titleSmall">{title}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const NavItem = ({ icon, title, screen }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(screen)}
      style={[styles.navItem, { borderColor: theme.colors.outline }]}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text variant="titleSmall">{title}</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AdminHeader navigation={navigation} currentScreen="AdminDashboard" />
      <ScrollView
        style={styles.scrollView}
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
        <Text variant="headlineSmall" style={styles.title}>
          Admin Dashboard
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Welcome, {user?.displayName || user?.username || 'Admin'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={[styles.statsGrid, isWideScreen && styles.statsGridWide]}>
        <StatCard
          icon="📰"
          label="Total Articles"
          value={stats?.database?.total_articles || 0}
          color="#3B82F6"
        />
        <StatCard
          icon="📡"
          label="Active Sources"
          value={stats?.database?.active_sources || 0}
          color="#10B981"
        />
        <StatCard
          icon="🏷️"
          label="Categories"
          value={stats?.database?.categories || 0}
          color="#8B5CF6"
        />
        <StatCard
          icon="👥"
          label="Total Users"
          value={userStats?.total_users || 0}
          color="#F59E0B"
        />
      </View>

      {/* Quick Actions */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="🔄"
              title="Refresh RSS"
              subtitle="Pull latest articles"
              onPress={handleRefreshRSS}
              loading={actionLoading === 'rss'}
            />
            <QuickAction
              icon="📥"
              title="Bulk Pull"
              subtitle="Fetch all sources"
              onPress={handleBulkPull}
              loading={actionLoading === 'bulk'}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Navigation */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Management
          </Text>
          <View style={styles.navList}>
            <NavItem icon="👥" title="Users" screen="AdminUsers" />
            <NavItem icon="📡" title="News Sources" screen="AdminSources" />
            <NavItem icon="📊" title="Analytics" screen="AdminAnalytics" />
            <NavItem icon="🔧" title="System Health" screen="AdminSystem" />
          </View>
        </Card.Content>
      </Card>

      {/* System Status */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            System Status
          </Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Text>API Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
                <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>
                  Operational
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text>Database</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
                <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>
                  Connected
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text>Last Updated</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                {stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : 'N/A'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statsGridWide: {
    flexWrap: 'nowrap',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 12,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    fontSize: 24,
    width: 48,
    height: 48,
    textAlign: 'center',
    lineHeight: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statValue: {
    fontWeight: '700',
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  navList: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  navIcon: {
    fontSize: 20,
  },
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
