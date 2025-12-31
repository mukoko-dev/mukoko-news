import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  Pressable,
  Text as RNText,
} from 'react-native';
import { LoadingState } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { admin } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import AdminScreenWrapper from '../../components/AdminScreenWrapper';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

/**
 * Admin Analytics Screen
 * View platform analytics and metrics
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AdminAnalyticsScreen({ navigation }) {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [contentQuality, setContentQuality] = useState(null);
  const [categoryInsights, setCategoryInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7');
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [analyticsRes, qualityRes, categoryRes] = await Promise.all([
        admin.getAnalytics(),
        admin.getContentQuality(),
        admin.getCategoryInsights(parseInt(timeRange)),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (qualityRes.data) setContentQuality(qualityRes.data);
      if (categoryRes.data) setCategoryInsights(categoryRes.data);
    } catch (err) {
      console.error('[Admin] Load analytics error:', err);
      setError('Failed to load analytics. Please try again.');
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

  const MetricCard = ({ title, value, subtitle, icon }) => (
    <View
      className="rounded-card bg-surface border border-outline overflow-hidden"
      style={{
        flex: isTablet ? 1 : undefined,
        minWidth: isTablet ? 150 : '47%',
      }}
    >
      <View className="p-lg">
        <View className="flex-row items-center gap-sm mb-sm">
          <RNText className="text-[20px]">{icon}</RNText>
          <RNText className="font-sans-bold text-title-medium text-on-surface-variant">
            {title}
          </RNText>
        </View>
        <RNText className="font-serif-bold text-headline-medium text-on-surface">
          {value}
        </RNText>
        {subtitle && (
          <RNText className="font-sans text-body-small text-on-surface-variant">
            {subtitle}
          </RNText>
        )}
      </View>
    </View>
  );

  const CategoryBar = ({ category, count, maxCount }) => {
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
      <View className="mb-lg">
        <View className="flex-row justify-between mb-xs">
          <RNText className="font-sans text-body-medium text-on-surface">{category}</RNText>
          <RNText className="font-sans text-body-small text-on-surface-variant">
            {count} articles
          </RNText>
        </View>
        <View className="h-[8px] bg-surface-variant rounded overflow-hidden">
          <View
            className="h-full rounded bg-tanzanite"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    );
  };

  const maxCategoryCount = categoryInsights?.categories
    ? Math.max(...categoryInsights.categories.map((c) => c.article_count || 0))
    : 0;

  return (
    <AdminScreenWrapper>
      <View className="flex-1 bg-background">
        <AdminHeader navigation={navigation} currentScreen="AdminAnalytics" />
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
              Analytics
            </RNText>
            <RNText className="font-sans text-body-medium text-on-surface-variant">
              Platform metrics and insights
            </RNText>
          </View>

          {/* Time Range Selector */}
          <View className="mb-xl">
            <View className="flex-row rounded-button border border-outline overflow-hidden">
              {[
                { value: '7', label: '7 Days' },
                { value: '14', label: '14 Days' },
                { value: '30', label: '30 Days' },
              ].map((button, index) => (
                <Pressable
                  key={button.value}
                  onPress={() => setTimeRange(button.value)}
                  className={`flex-1 py-md items-center ${
                    timeRange === button.value ? 'bg-tanzanite' : 'bg-surface'
                  } ${index > 0 ? 'border-l border-outline' : ''}`}
                >
                  <RNText
                    className={`font-sans-bold text-label-large ${
                      timeRange === button.value ? 'text-on-primary' : 'text-on-surface'
                    }`}
                  >
                    {button.label}
                  </RNText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Engagement Metrics */}
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            Engagement
          </RNText>
          <View className="flex-row flex-wrap gap-md mb-lg">
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
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            Content Quality
          </RNText>
          <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
            <View className="p-lg">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <RNText className="font-serif-bold text-stats text-on-surface mb-xs">
                    {contentQuality?.avg_word_count?.toFixed(0) || '0'}
                  </RNText>
                  <RNText className="font-sans text-body-small text-on-surface-variant">
                    Avg Words
                  </RNText>
                </View>
                <View className="items-center">
                  <RNText className="font-serif-bold text-stats text-on-surface mb-xs">
                    {contentQuality?.with_images_percent?.toFixed(0) || '0'}%
                  </RNText>
                  <RNText className="font-sans text-body-small text-on-surface-variant">
                    With Images
                  </RNText>
                </View>
                <View className="items-center">
                  <RNText className="font-serif-bold text-stats text-on-surface mb-xs">
                    {contentQuality?.ai_enhanced_percent?.toFixed(0) || '0'}%
                  </RNText>
                  <RNText className="font-sans text-body-small text-on-surface-variant">
                    AI Enhanced
                  </RNText>
                </View>
                <View className="items-center">
                  <RNText className="font-serif-bold text-stats text-on-surface mb-xs">
                    {contentQuality?.avg_read_time?.toFixed(1) || '0'}m
                  </RNText>
                  <RNText className="font-sans text-body-small text-on-surface-variant">
                    Avg Read Time
                  </RNText>
                </View>
              </View>
            </View>
          </View>

          {/* Category Insights */}
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            Category Distribution
          </RNText>
          <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
            <View className="p-lg">
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
                <RNText className="font-sans text-body-medium text-on-surface-variant">
                  No category data available
                </RNText>
              )}
            </View>
          </View>

          {/* Top Performing */}
          <RNText className="font-sans-bold text-title-medium mb-md mt-sm text-on-surface">
            Top Performing Articles
          </RNText>
          <View className="rounded-card bg-surface border border-outline overflow-hidden mb-lg">
            <View className="p-lg">
              {analytics?.top_articles?.length > 0 ? (
                analytics.top_articles.slice(0, 5).map((article, index) => (
                  <View
                    key={index}
                    className="flex-row items-start mb-lg pb-lg border-b border-outline-variant"
                  >
                    <RNText className="font-serif-bold text-title-large w-[32px] text-on-surface-variant">
                      {index + 1}
                    </RNText>
                    <View className="flex-1">
                      <RNText className="font-sans text-body-medium text-on-surface" numberOfLines={2}>
                        {article.title}
                      </RNText>
                      <View className="flex-row gap-lg mt-xs">
                        <RNText className="font-sans text-body-small text-on-surface-variant">
                          👁️ {article.view_count || 0}
                        </RNText>
                        <RNText className="font-sans text-body-small text-on-surface-variant">
                          ❤️ {article.like_count || 0}
                        </RNText>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <RNText className="font-sans text-body-medium text-on-surface-variant">
                  No top articles data available
                </RNText>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </AdminScreenWrapper>
  );
}
