/**
 * InsightsScreen - Analytics and Trends Dashboard
 * Shows trending topics, categories, authors, and personalized insights
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
  Surface,
  ActivityIndicator,
  Icon,
  useTheme as usePaperTheme,
  ProgressBar,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import { insights as insightsAPI, categories as categoriesAPI } from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category emoji mapping
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
};

const getEmoji = (categoryName) => {
  const lowerName = (categoryName || '').toLowerCase();
  return CATEGORY_EMOJIS[lowerName] || '📰';
};

export default function InsightsScreen({ navigation }) {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [trendingAuthors, setTrendingAuthors] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [categoryInsights, setCategoryInsights] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        trendingCatsResult,
        trendingAuthorsResult,
        statsResult,
        insightsResult,
      ] = await Promise.all([
        insightsAPI.getTrendingCategories(8),
        insightsAPI.getTrendingAuthors(6),
        insightsAPI.getStats(),
        insightsAPI.getCategoryInsights(7),
      ]);

      if (trendingCatsResult.data?.trending) {
        setTrendingCategories(trendingCatsResult.data.trending);
      }

      if (trendingAuthorsResult.data?.trending_authors) {
        setTrendingAuthors(trendingAuthorsResult.data.trending_authors);
      }

      if (statsResult.data?.database) {
        setPlatformStats(statsResult.data.database);
      }

      if (insightsResult.data?.insights) {
        setCategoryInsights(insightsResult.data.insights);
      }
    } catch (err) {
      console.error('[Insights] Load error:', err);
      setError('Failed to load insights. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCategoryPress = (category) => {
    navigation.navigate('DiscoverFeed', { selectedCategory: category.slug || category.id });
  };

  const handleAuthorPress = (author) => {
    navigation.navigate('SearchFeed', { searchQuery: author.name });
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    card: {
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    },
    title: {
      color: paperTheme.colors.onSurface,
    },
    subtitle: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    statValue: {
      color: paperTheme.colors.primary,
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.subtitle]}>Loading insights...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.title]}>Insights</Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.subtitle]}>
            Discover trends and analytics
          </Text>
        </View>

        {/* Error State */}
        {error && (
          <Surface style={[styles.errorCard, { backgroundColor: paperTheme.colors.errorContainer }]} elevation={0}>
            <Icon source="alert-circle" size={20} color={paperTheme.colors.error} />
            <Text style={{ color: paperTheme.colors.error, flex: 1 }}>{error}</Text>
          </Surface>
        )}

        {/* Platform Stats */}
        {platformStats && (
          <Surface style={[styles.card, dynamicStyles.card]} elevation={1}>
            <View style={styles.cardHeader}>
              <Icon source="chart-bar" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.cardTitle, dynamicStyles.title]}>Platform Overview</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.statValue]}>
                  {platformStats.total_articles?.toLocaleString() || '0'}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Articles</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.statValue]}>
                  {platformStats.active_sources || '0'}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Sources</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.statValue]}>
                  {platformStats.categories || '0'}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Categories</Text>
              </View>
            </View>
          </Surface>
        )}

        {/* Trending Categories */}
        {trendingCategories.length > 0 && (
          <Surface style={[styles.card, dynamicStyles.card]} elevation={1}>
            <View style={styles.cardHeader}>
              <Icon source="fire" size={20} color={mukokoTheme.colors.accent} />
              <Text style={[styles.cardTitle, dynamicStyles.title]}>Trending Categories</Text>
            </View>
            <View style={styles.categoriesGrid}>
              {trendingCategories.map((category, index) => (
                <TouchableOpacity
                  key={category.id || index}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.08)',
                      borderColor: paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.15)',
                    }
                  ]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>
                    {getEmoji(category.name || category.category_name)}
                  </Text>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, dynamicStyles.title]} numberOfLines={1}>
                      {category.name || category.category_name}
                    </Text>
                    {category.article_count && (
                      <Text style={[styles.categoryCount, dynamicStyles.subtitle]}>
                        {category.article_count} articles
                      </Text>
                    )}
                  </View>
                  {category.growth_rate !== undefined && (
                    <View style={[
                      styles.growthBadge,
                      { backgroundColor: category.growth_rate >= 0 ? 'rgba(0, 166, 81, 0.15)' : 'rgba(239, 51, 64, 0.15)' }
                    ]}>
                      <Icon
                        source={category.growth_rate >= 0 ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={category.growth_rate >= 0 ? mukokoTheme.colors.zwGreen : mukokoTheme.colors.zwRed}
                      />
                      <Text style={{
                        fontSize: 10,
                        color: category.growth_rate >= 0 ? mukokoTheme.colors.zwGreen : mukokoTheme.colors.zwRed,
                      }}>
                        {Math.abs(category.growth_rate || 0).toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        )}

        {/* Trending Authors */}
        {trendingAuthors.length > 0 && (
          <Surface style={[styles.card, dynamicStyles.card]} elevation={1}>
            <View style={styles.cardHeader}>
              <Icon source="account-star" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.cardTitle, dynamicStyles.title]}>Top Authors</Text>
            </View>
            <View style={styles.authorsList}>
              {trendingAuthors.map((author, index) => (
                <TouchableOpacity
                  key={author.id || index}
                  style={[
                    styles.authorItem,
                    {
                      backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.05)',
                      borderBottomColor: paperTheme.colors.outlineVariant,
                    }
                  ]}
                  onPress={() => handleAuthorPress(author)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.authorRank, { backgroundColor: paperTheme.colors.primary }]}>
                    <Text style={styles.authorRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, dynamicStyles.title]} numberOfLines={1}>
                      {author.name}
                    </Text>
                    <Text style={[styles.authorMeta, dynamicStyles.subtitle]} numberOfLines={1}>
                      {author.article_count || 0} articles
                      {author.outlets && ` • ${author.outlets.slice(0, 2).join(', ')}`}
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        )}

        {/* Category Insights */}
        {categoryInsights && (
          <Surface style={[styles.card, dynamicStyles.card]} elevation={1}>
            <View style={styles.cardHeader}>
              <Icon source="lightbulb-on" size={20} color={mukokoTheme.colors.zwYellow} />
              <Text style={[styles.cardTitle, dynamicStyles.title]}>AI Insights</Text>
            </View>

            {categoryInsights.recommendations && categoryInsights.recommendations.length > 0 && (
              <View style={styles.insightsList}>
                {categoryInsights.recommendations.slice(0, 3).map((rec, index) => (
                  <View
                    key={index}
                    style={[
                      styles.insightItem,
                      { backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.05)' }
                    ]}
                  >
                    <Icon source="lightbulb" size={16} color={mukokoTheme.colors.zwYellow} />
                    <Text style={[styles.insightText, dynamicStyles.subtitle]}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {categoryInsights.summary && (
              <View style={[styles.summaryBox, { backgroundColor: paperTheme.colors.glass }]}>
                <Text style={[styles.summaryText, dynamicStyles.subtitle]}>
                  {categoryInsights.summary}
                </Text>
              </View>
            )}
          </Surface>
        )}

        {/* Quick Actions */}
        <Surface style={[styles.card, dynamicStyles.card]} elevation={1}>
          <View style={styles.cardHeader}>
            <Icon source="rocket-launch" size={20} color={paperTheme.colors.primary} />
            <Text style={[styles.cardTitle, dynamicStyles.title]}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.primaryContainer }]}
              onPress={() => navigation.navigate('Discover')}
            >
              <Icon source="fire" size={24} color={paperTheme.colors.primary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onPrimaryContainer }]}>
                Trending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.secondaryContainer }]}
              onPress={() => navigation.navigate('Search')}
            >
              <Icon source="magnify" size={24} color={paperTheme.colors.secondary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onSecondaryContainer }]}>
                Search
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.tertiaryContainer }]}
              onPress={() => navigation.navigate('Bytes')}
            >
              <Icon source="lightning-bolt" size={24} color={paperTheme.colors.tertiary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onTertiaryContainer }]}>
                Bytes
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Bottom padding for tab bar */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: mukokoTheme.spacing.md,
  },
  loadingText: {
    marginTop: mukokoTheme.spacing.md,
    fontSize: 14,
  },

  // Header
  header: {
    marginBottom: mukokoTheme.spacing.lg,
  },
  headerTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 28,
    marginBottom: mukokoTheme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
  },

  // Cards
  card: {
    borderRadius: mukokoTheme.roundness,
    padding: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  cardTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 16,
  },

  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    marginBottom: mukokoTheme.spacing.md,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    marginTop: mukokoTheme.spacing.xs,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    minWidth: (SCREEN_WIDTH - mukokoTheme.spacing.md * 4) / 2 - mukokoTheme.spacing.sm,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: mukokoTheme.spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  categoryCount: {
    fontSize: 10,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },

  // Authors
  authorsList: {
    gap: mukokoTheme.spacing.sm,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness / 2,
    gap: mukokoTheme.spacing.sm,
  },
  authorRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorRankText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  },

  // Insights
  insightsList: {
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness / 2,
    gap: mukokoTheme.spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryBox: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness / 2,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    gap: mukokoTheme.spacing.xs,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Bottom padding
  bottomPadding: {
    height: 100,
  },
});
