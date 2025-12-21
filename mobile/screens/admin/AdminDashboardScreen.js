import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  Pressable,
  Text as RNText,
} from 'react-native';
import { Loader2 } from 'lucide-react-native';
import { LoadingState } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';

/**
 * Admin Dashboard Screen
 * Shows platform statistics and quick actions
 * Responsive: works on mobile, tablet, and web
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AdminDashboardScreen({ navigation }) {
  const theme = useTheme();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const { width } = Dimensions.get('window');
  const isWideScreen = width >= 768;

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [statsResult, userStatsResult] = await Promise.all([
        admin.getStats(),
        admin.getUserStats(),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (userStatsResult.data) setUserStats(userStatsResult.data);
    } catch (err) {
      console.error('[Admin] Load data error:', err);
      setError('Failed to load dashboard. Please try again.');
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
      <View className="flex-1 justify-center items-center px-lg bg-background">
        <RNText className="font-serif-bold text-headline-small mb-sm text-on-surface">
          Access Denied
        </RNText>
        <RNText className="font-sans text-body-medium text-center text-on-surface-variant">
          You don't have permission to access the admin panel.
        </RNText>
      </View>
    );
  }

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
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

  const StatCard = ({ icon, label, value, color }) => (
    <View
      className="flex-1 rounded-card bg-surface border border-outline overflow-hidden"
      style={{ minWidth: 150 }}
      accessibilityLabel={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
      accessibilityRole="text"
    >
      <View className="items-center py-lg">
        <RNText
          className="text-[24px] w-[48px] h-[48px] text-center leading-[48px] rounded-button overflow-hidden"
          style={{ backgroundColor: color + '20', color }}
          accessibilityElementsHidden
        >
          {icon}
        </RNText>
        <RNText className="font-serif-bold text-headline-medium mt-sm text-on-surface">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </RNText>
        <RNText className="font-sans text-body-small text-on-surface-variant">
          {label}
        </RNText>
      </View>
    </View>
  );

  const QuickAction = ({ icon, title, subtitle, onPress, loading: isLoading }) => (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className="flex-row items-center p-lg rounded-button gap-md min-h-touch bg-surface-variant"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading }}
      accessibilityHint={`Activates ${title.toLowerCase()}`}
    >
      {isLoading ? (
        <Loader2 size={24} color={theme.colors.tanzanite} className="animate-spin" />
      ) : (
        <RNText className="text-[24px]" accessibilityElementsHidden>{icon}</RNText>
      )}
      <View className="flex-1">
        <RNText className="font-sans-bold text-title-small text-on-surface">{title}</RNText>
        <RNText className="font-sans text-body-small text-on-surface-variant">
          {subtitle}
        </RNText>
      </View>
    </Pressable>
  );

  const NavItem = ({ icon, title, screen }) => (
    <Pressable
      onPress={() => navigation.navigate(screen)}
      className="flex-row items-center p-lg rounded-button border border-outline gap-md min-h-touch"
      accessibilityLabel={`${title} management`}
      accessibilityRole="button"
      accessibilityHint={`Navigate to ${title.toLowerCase()} screen`}
    >
      <RNText className="text-[20px]" accessibilityElementsHidden>{icon}</RNText>
      <RNText className="font-sans-bold text-title-small text-on-surface">{title}</RNText>
      <RNText className="text-on-surface-variant" accessibilityElementsHidden>→</RNText>
    </Pressable>
  );

  return (
    <AdminScreenWrapper>
      <View className="flex-1 bg-background">
        <AdminHeader navigation={navigation} currentScreen="AdminDashboard" />
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
          <View className="mb-xl">
            <RNText
              className="font-serif-bold text-headline-small text-on-surface"
              accessibilityRole="header"
            >
              Admin Dashboard
            </RNText>
            <RNText className="font-sans text-body-medium text-on-surface-variant">
              Welcome, {user?.displayName || user?.username || 'Admin'}
            </RNText>
          </View>

          {/* Stats Grid */}
          <View
            className="flex-row flex-wrap gap-md mb-lg"
            style={isWideScreen && { flexWrap: 'nowrap' }}
          >
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
          <View className="mb-lg rounded-card bg-surface border border-outline overflow-hidden">
            <View className="p-lg">
              <RNText className="font-sans-bold text-title-medium mb-lg text-on-surface">
                Quick Actions
              </RNText>
              <View className="gap-md">
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
            </View>
          </View>

          {/* Navigation */}
          <View className="mb-lg rounded-card bg-surface border border-outline overflow-hidden">
            <View className="p-lg">
              <RNText className="font-sans-bold text-title-medium mb-lg text-on-surface">
                Management
              </RNText>
              <View className="gap-sm">
                <NavItem icon="👥" title="Users" screen="AdminUsers" />
                <NavItem icon="📡" title="News Sources" screen="AdminSources" />
                <NavItem icon="📊" title="Analytics" screen="AdminAnalytics" />
                <NavItem icon="🔧" title="System Health" screen="AdminSystem" />
              </View>
            </View>
          </View>

          {/* System Status */}
          <View className="mb-lg rounded-card bg-surface border border-outline overflow-hidden">
            <View className="p-lg">
              <RNText className="font-sans-bold text-title-medium mb-lg text-on-surface">
                System Status
              </RNText>
              <View className="gap-md">
                <View className="flex-row justify-between items-center">
                  <RNText className="font-sans text-body-medium text-on-surface">API Status</RNText>
                  <View className="px-md py-xs rounded-button" style={{ backgroundColor: '#10B98120' }}>
                    <RNText className="font-sans-bold text-[12px]" style={{ color: '#10B981' }}>
                      Operational
                    </RNText>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <RNText className="font-sans text-body-medium text-on-surface">Database</RNText>
                  <View className="px-md py-xs rounded-button" style={{ backgroundColor: '#10B98120' }}>
                    <RNText className="font-sans-bold text-[12px]" style={{ color: '#10B981' }}>
                      Connected
                    </RNText>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <RNText className="font-sans text-body-medium text-on-surface">Last Updated</RNText>
                  <RNText className="font-sans text-[12px] text-on-surface-variant">
                    {stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : 'N/A'}
                  </RNText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AdminScreenWrapper>
  );
}
