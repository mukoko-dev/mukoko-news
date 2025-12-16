/**
 * InsightsScreen - Mobile-first analytics
 *
 * UX Principles:
 * - Stats visible at a glance (top)
 * - Trending topics immediately visible (no scrolling needed)
 * - All data flows naturally in a single scroll
 * - No redundant navigation (tab bar exists)
 * - No expanding/collapsing sections
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Icon,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import mukokoTheme from '../theme';
import { insights as insightsAPI } from '../api/client';

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
  const paperTheme = usePaperTheme();

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

  // Dynamic styles
  const colors = {
    bg: paperTheme.colors.background,
    text: paperTheme.colors.onSurface,
    textMuted: paperTheme.colors.onSurfaceVariant,
    card: paperTheme.colors.glassCard || paperTheme.colors.surface,
    border: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    primary: paperTheme.colors.primary,
  };

  // Card width for 2-column grid
  const cardWidth = (SCREEN_WIDTH - mukokoTheme.spacing.md * 2 - mukokoTheme.spacing.sm) / 2;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasData = stats || trending.length > 0 || authors.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats row - immediately visible */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {(stats.total_articles || 0).toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Articles</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.active_sources || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sources</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.categories || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Topics</Text>
            </View>
          </View>
        )}

        {/* Trending topics - 2 column grid */}
        {trending.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              🔥 Trending Now
            </Text>
            <View style={styles.topicsGrid}>
              {trending.map((topic, i) => (
                <TouchableOpacity
                  key={topic.id || i}
                  style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border, width: cardWidth }]}
                  onPress={() => handleTopicPress(topic)}
                  activeOpacity={0.7}
                >
                  <View style={styles.topicRow}>
                    <Text style={styles.topicEmoji}>{getEmoji(topic.name || topic.category_name)}</Text>
                    {i < 3 && (
                      <View style={[styles.hotBadge, { backgroundColor: mukokoTheme.colors.accent }]}>
                        <Text style={styles.hotBadgeText}>{i + 1}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.topicName, { color: colors.text }]} numberOfLines={1}>
                    {topic.name || topic.category_name}
                  </Text>
                  <Text style={[styles.topicCount, { color: colors.textMuted }]}>
                    {topic.article_count || 0} articles
                  </Text>
                  {topic.growth_rate > 0 && (
                    <View style={styles.growthRow}>
                      <Icon source="trending-up" size={12} color={mukokoTheme.colors.success} />
                      <Text style={[styles.growthText, { color: mukokoTheme.colors.success }]}>
                        +{Math.round(topic.growth_rate)}%
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Top journalists - compact list */}
        {authors.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              ✍️ Top Journalists
            </Text>
            <View style={styles.authorsList}>
              {authors.map((author, i) => (
                <TouchableOpacity
                  key={author.id || i}
                  style={[styles.authorRow, { borderBottomColor: colors.border }]}
                  onPress={() => handleAuthorPress(author)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.rank,
                    { backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.card }
                  ]}>
                    <Text style={[styles.rankText, { color: i < 3 ? '#FFF' : colors.text }]}>{i + 1}</Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                      {author.name}
                    </Text>
                    <Text style={[styles.authorMeta, { color: colors.textMuted }]}>
                      {author.article_count || 0} articles
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* No data state */}
        {!hasData && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No data yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Pull to refresh
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: mukokoTheme.spacing.md,
  },

  // Stats row - top
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: mukokoTheme.spacing.sm,
    marginTop: mukokoTheme.spacing.sm,
  },

  // Topics grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  topicCard: {
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  topicEmoji: {
    fontSize: 24,
  },
  hotBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  topicName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 2,
  },
  topicCount: {
    fontSize: 11,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  growthText: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Authors list
  authorsList: {
    marginBottom: mukokoTheme.spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: mukokoTheme.spacing.sm,
  },
  rankText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  authorMeta: {
    fontSize: 11,
    marginTop: 1,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: mukokoTheme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
  },

  // Bottom padding
  bottomPadding: {
    height: 100,
  },
});
