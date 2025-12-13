import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { admin } from '../../api/client';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

/**
 * Admin Analytics Screen
 * View platform analytics and metrics
 */
export default function AdminAnalyticsScreen() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [contentQuality, setContentQuality] = useState(null);
  const [categoryInsights, setCategoryInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7');

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, qualityRes, categoryRes] = await Promise.all([
        admin.getAnalytics(),
        admin.getContentQuality(),
        admin.getCategoryInsights(parseInt(timeRange)),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (qualityRes.data) setContentQuality(qualityRes.data);
      if (categoryRes.data) setCategoryInsights(categoryRes.data);
    } catch (error) {
      console.error('[Admin] Load analytics error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

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

  const MetricCard = ({ title, value, subtitle, icon }) => (
    <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>{icon}</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {title}
          </Text>
        </View>
        <Text variant="headlineMedium" style={styles.metricValue}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const CategoryBar = ({ category, count, maxCount }) => {
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
      <View style={styles.categoryBar}>
        <View style={styles.categoryInfo}>
          <Text variant="bodyMedium">{category}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {count} articles
          </Text>
        </View>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.barFill,
              {
                width: `${percentage}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const maxCategoryCount = categoryInsights?.categories
    ? Math.max(...categoryInsights.categories.map((c) => c.article_count || 0))
    : 0;

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
        <Text variant="headlineSmall" style={styles.title}>Analytics</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          Platform metrics and insights
        </Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: '7', label: '7 Days' },
            { value: '14', label: '14 Days' },
            { value: '30', label: '30 Days' },
          ]}
        />
      </View>

      {/* Engagement Metrics */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Engagement</Text>
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Views"
          value={analytics?.total_views?.toLocaleString() || '0'}
          icon="👁️"
        />
        <MetricCard
          title="Total Likes"
          value={analytics?.total_likes?.toLocaleString() || '0'}
          icon="❤️"
        />
        <MetricCard
          title="Total Saves"
          value={analytics?.total_saves?.toLocaleString() || '0'}
          icon="🔖"
        />
        <MetricCard
          title="Avg. Engagement"
          value={`${analytics?.avg_engagement_rate?.toFixed(1) || '0'}%`}
          icon="📊"
        />
      </View>

      {/* Content Quality */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Content Quality</Text>
      <Card style={[styles.qualityCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.qualityGrid}>
            <View style={styles.qualityItem}>
              <Text style={styles.qualityValue}>
                {contentQuality?.avg_word_count?.toFixed(0) || '0'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Avg Words
              </Text>
            </View>
            <View style={styles.qualityItem}>
              <Text style={styles.qualityValue}>
                {contentQuality?.with_images_percent?.toFixed(0) || '0'}%
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                With Images
              </Text>
            </View>
            <View style={styles.qualityItem}>
              <Text style={styles.qualityValue}>
                {contentQuality?.ai_enhanced_percent?.toFixed(0) || '0'}%
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                AI Enhanced
              </Text>
            </View>
            <View style={styles.qualityItem}>
              <Text style={styles.qualityValue}>
                {contentQuality?.avg_read_time?.toFixed(1) || '0'}m
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Avg Read Time
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Category Insights */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Category Distribution</Text>
      <Card style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {categoryInsights?.categories?.length > 0 ? (
            categoryInsights.categories.slice(0, 10).map((category, index) => (
              <CategoryBar
                key={index}
                category={category.category || 'Uncategorized'}
                count={category.article_count || 0}
                maxCount={maxCategoryCount}
              />
            ))
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No category data available
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Top Performing */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Top Performing Articles</Text>
      <Card style={[styles.topCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {analytics?.top_articles?.length > 0 ? (
            analytics.top_articles.slice(0, 5).map((article, index) => (
              <View key={index} style={styles.topArticle}>
                <Text style={styles.topRank}>{index + 1}</Text>
                <View style={styles.topInfo}>
                  <Text variant="bodyMedium" numberOfLines={2}>
                    {article.title}
                  </Text>
                  <View style={styles.topStats}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      👁️ {article.view_count || 0}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      ❤️ {article.like_count || 0}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No top articles data available
            </Text>
          )}
        </Card.Content>
      </Card>
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
  segmentContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: isTablet ? 1 : undefined,
    minWidth: isTablet ? 150 : '47%',
    borderRadius: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricValue: {
    fontWeight: '700',
  },
  qualityCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  qualityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qualityItem: {
    alignItems: 'center',
  },
  qualityValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryBar: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  topCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  topArticle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topRank: {
    fontSize: 18,
    fontWeight: '700',
    width: 32,
    color: '#888',
  },
  topInfo: {
    flex: 1,
  },
  topStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
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
