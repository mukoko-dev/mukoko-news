/**
 * InsightsScreen - Mobile-first analytics
 * shadcn-style with NativeWind + Lucide icons
 *
 * UX Principles:
 * - Stats visible at a glance (top)
 * - Trending topics immediately visible (no scrolling needed)
 * - All data flows naturally in a single scroll
 * - No redundant navigation (tab bar exists)
 * - No expanding/collapsing sections
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Pressable, Text, Dimensions } from 'react-native';
import { TrendingUp, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { insights as insightsAPI } from '../api/client';
import { LoadingState, EmptyState, StatsRow, Card, Badge } from '../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category emojis
const CATEGORY_EMOJIS = {
  politics: '🏛️',
  business: '💼',
  sports: '⚽',
  entertainment: '🎬',
  technology: '💻',
  health: '🏥',
  world: '🌍',
  local: '📍',
  opinion: '💭',
  breaking: '⚡',
  crime: '🚨',
  education: '📚',
  environment: '🌱',
  lifestyle: '✨',
  agriculture: '🌾',
  mining: '⛏️',
  tourism: '✈️',
  finance: '💰',
  culture: '🎭',
  general: '📰',
};

const getEmoji = (name) => CATEGORY_EMOJIS[(name || '').toLowerCase()] || '📰';

export default function InsightsScreen({ navigation }) {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        insightsAPI.getStats(),
        insightsAPI.getTrendingCategories(8),
        insightsAPI.getTrendingAuthors(5),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.data?.database) {
        setStats(results[0].value.data.database);
      }
      if (results[1].status === 'fulfilled' && results[1].value.data?.trending) {
        setTrending(results[1].value.data.trending);
      }
      if (results[2].status === 'fulfilled' && results[2].value.data?.trending_authors) {
        setAuthors(results[2].value.data.trending_authors);
      }
    } catch (err) {
      console.error('[Insights] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleTopicPress = (topic) => {
    navigation.navigate('DiscoverFeed', { selectedCategory: topic.slug || topic.id });
  };

  const handleAuthorPress = (author) => {
    navigation.navigate('SearchFeed', { searchQuery: author.name });
  };

  // Card width for 2-column grid
  const cardWidth = (SCREEN_WIDTH - 12 * 2 - 8) / 2; // 12px padding, 8px gap

  if (loading) {
    return <LoadingState />;
  }

  const hasData = stats || trending.length > 0 || authors.length > 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4B0082']}
            tintColor="#4B0082"
          />
        }
      >
        {/* Stats row - immediately visible */}
        {stats && (
          <StatsRow
            stats={[
              {
                value: (stats.total_articles || 0).toLocaleString(),
                label: 'Articles',
              },
              {
                value: stats.active_sources || 0,
                label: 'Sources',
              },
              {
                value: stats.categories || 0,
                label: 'Topics',
              },
            ]}
            className="mb-md"
          />
        )}

        {/* Trending topics - 2 column grid */}
        {trending.length > 0 && (
          <>
            <Text className="font-sans-medium text-label-large text-on-surface-variant mb-sm mt-sm">
              🔥 Trending Now
            </Text>
            <View className="flex-row flex-wrap gap-sm mb-md">
              {trending.map((topic, i) => (
                <Pressable
                  key={topic.id || i}
                  className="bg-surface rounded-card p-sm border border-outline"
                  style={{ width: cardWidth }}
                  onPress={() => handleTopicPress(topic)}
                >
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-headline-large">{getEmoji(topic.name || topic.category_name)}</Text>
                    {i < 3 && (
                      <View className="w-[18px] h-[18px] rounded-full bg-gold items-center justify-center">
                        <Text className="font-sans-bold text-caption text-white">{i + 1}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-sans-medium text-label-large text-on-surface mb-0.5" numberOfLines={1}>
                    {topic.name || topic.category_name}
                  </Text>
                  <Text className="font-sans text-label-small text-on-surface-variant">
                    {topic.article_count || 0} articles
                  </Text>
                  {topic.growth_rate > 0 && (
                    <View className="flex-row items-center gap-0.5 mt-1">
                      <TrendingUp size={12} color="#1B5E20" />
                      <Text className="font-sans-medium text-caption text-success">
                        +{Math.round(topic.growth_rate)}%
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Top journalists - compact list */}
        {authors.length > 0 && (
          <>
            <Text className="font-sans-medium text-label-large text-on-surface-variant mb-sm mt-sm">
              ✍️ Top Journalists
            </Text>
            <View className="mb-md">
              {authors.map((author, i) => (
                <Pressable
                  key={author.id || i}
                  className="flex-row items-center py-sm border-b border-outline"
                  onPress={() => handleAuthorPress(author)}
                  style={{ borderBottomWidth: i === authors.length - 1 ? 0 : 1 }}
                >
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mr-sm"
                    style={{
                      backgroundColor:
                        i === 0
                          ? '#FFD700' // Gold
                          : i === 1
                          ? '#C0C0C0' // Silver
                          : i === 2
                          ? '#CD7F32' // Bronze
                          : '#FFFFFF', // Default
                    }}
                  >
                    <Text
                      className="font-sans-bold text-label-small"
                      style={{ color: i < 3 ? '#FFF' : '#1C1B1F' }}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-medium text-body-medium text-on-surface" numberOfLines={1}>
                      {author.name}
                    </Text>
                    <Text className="font-sans text-label-small text-on-surface-variant mt-0.5">
                      {author.article_count || 0} articles
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#4a4a4a" />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* No data state */}
        {!hasData && (
          <EmptyState
            emoji="📊"
            title="No data yet"
            subtitle="Pull to refresh"
          />
        )}
      </ScrollView>
    </View>
  );
}
