/**
 * InsightsScreen - AI-Powered Analytics Dashboard
 * Community-focused analytics with open access to data
 * Core Mukoko belief: Everyone gets access to insights, not just admins
 *
 * Design principles:
 * - Always show meaningful data (graceful fallbacks)
 * - Clear visual hierarchy
 * - Actionable sections that drive engagement
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
  Chip,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
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
  general: '📰',
};

const getEmoji = (categoryName) => {
  const lowerName = (categoryName || '').toLowerCase();
  return CATEGORY_EMOJIS[lowerName] || '📰';
};

// Animated number component (simple version)
const AnimatedNumber = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startValue + (endValue - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <Text>{displayValue.toLocaleString()}{suffix}</Text>;
};

export default function InsightsScreen({ navigation }) {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [platformStats, setPlatformStats] = useState(null);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [trendingAuthors, setTrendingAuthors] = useState([]);
  const [engagementStats, setEngagementStats] = useState(null);
  const [contentQuality, setContentQuality] = useState(null);
  const [categoryInsights, setCategoryInsights] = useState(null);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel - each with its own error handling
      const results = await Promise.allSettled([
        insightsAPI.getStats(),
        insightsAPI.getTrendingCategories(12),
        insightsAPI.getTrendingAuthors(10),
        insightsAPI.getAnalytics(),
        insightsAPI.getContentQuality(),
        insightsAPI.getCategoryInsights(timeRange),
      ]);

      // Process results individually - don't fail if some are missing
      if (results[0].status === 'fulfilled' && results[0].value.data?.database) {
        setPlatformStats(results[0].value.data.database);
      }

      if (results[1].status === 'fulfilled' && results[1].value.data?.trending) {
        setTrendingCategories(results[1].value.data.trending);
      }

      if (results[2].status === 'fulfilled' && results[2].value.data?.trending_authors) {
        setTrendingAuthors(results[2].value.data.trending_authors);
      }

      if (results[3].status === 'fulfilled' && results[3].value.data) {
        setEngagementStats(results[3].value.data);
      }

      if (results[4].status === 'fulfilled' && results[4].value.data) {
        setContentQuality(results[4].value.data);
      }

      if (results[5].status === 'fulfilled' && results[5].value.data?.insights) {
        setCategoryInsights(results[5].value.data.insights);
      }

      // Only show error if ALL requests failed
      const allFailed = results.every(r => r.status === 'rejected');
      if (allFailed) {
        setError('Unable to load insights. Pull to refresh.');
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
  }, [timeRange]);

  const handleCategoryPress = (category) => {
    navigation.navigate('DiscoverFeed', { selectedCategory: category.slug || category.id });
  };

  const handleAuthorPress = (author) => {
    navigation.navigate('SearchFeed', { searchQuery: author.name });
  };

  const handleExplorePress = () => {
    navigation.navigate('DiscoverFeed');
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
    accentCard: {
      backgroundColor: paperTheme.colors.glassAccentCard || paperTheme.colors.surface,
      borderColor: paperTheme.colors.glassAccentBorder || paperTheme.colors.outline,
    },
  };

  // Calculate grid width for topic cards
  const cardWidth = (SCREEN_WIDTH - mukokoTheme.spacing.md * 2 - mukokoTheme.spacing.sm) / 2;

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, dynamicStyles.subtitle]}>
            Analyzing trends...
          </Text>
          <View style={styles.loadingIconRow}>
            <Icon source="chart-line" size={20} color={mukokoTheme.colors.accent} />
          </View>
        </View>
      </View>
    );
  }

  // Check if we have ANY data to show
  const hasData = platformStats || trendingCategories.length > 0 || trendingAuthors.length > 0;

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
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, dynamicStyles.title]}>Insights</Text>
            <View style={[styles.aiBadge, { backgroundColor: mukokoTheme.colors.accent + '15' }]}>
              <Icon source="chart-timeline-variant" size={14} color={mukokoTheme.colors.accent} />
              <Text style={[styles.aiBadgeText, { color: mukokoTheme.colors.accent }]}>
                AI Powered
              </Text>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, dynamicStyles.subtitle]}>
            Open analytics for everyone
          </Text>
        </View>

        {/* Time Range Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeRangeContainer}
          contentContainerStyle={styles.timeRangeContent}
        >
          {[7, 14, 30].map((days) => (
            <Chip
              key={days}
              mode={timeRange === days ? 'flat' : 'outlined'}
              selected={timeRange === days}
              onPress={() => setTimeRange(days)}
              style={[
                styles.timeChip,
                timeRange === days && { backgroundColor: paperTheme.colors.primary },
              ]}
              textStyle={timeRange === days ? { color: '#FFFFFF' } : {}}
            >
              {days} Days
            </Chip>
          ))}
        </ScrollView>

        {/* Error Banner (if partial error) */}
        {error && hasData && (
          <View style={[styles.errorBanner, { backgroundColor: paperTheme.colors.errorContainer }]}>
            <Icon source="alert-circle" size={16} color={paperTheme.colors.error} />
            <Text style={{ color: paperTheme.colors.error, flex: 1, fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {/* Platform Stats - Always show if available */}
        {platformStats && (
          <View style={[styles.card, styles.statsCard, dynamicStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="database" size={20} color={paperTheme.colors.primary} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Platform Overview</Text>
              </View>
              <View style={[styles.liveBadge, { backgroundColor: mukokoTheme.colors.success }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleExplorePress}
                activeOpacity={0.7}
              >
                <Text style={[styles.statValue, { color: paperTheme.colors.primary }]}>
                  <AnimatedNumber value={platformStats.total_articles || 0} />
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Articles</Text>
              </TouchableOpacity>

              <View style={[styles.statDivider, { backgroundColor: paperTheme.colors.outline }]} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: paperTheme.colors.primary }]}>
                  <AnimatedNumber value={platformStats.active_sources || 0} />
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Sources</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: paperTheme.colors.outline }]} />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: paperTheme.colors.primary }]}>
                  <AnimatedNumber value={platformStats.categories || 0} />
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Categories</Text>
              </View>
            </View>
          </View>
        )}

        {/* Engagement Stats - Show if available */}
        {engagementStats && (
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="heart-pulse" size={20} color={mukokoTheme.colors.accent} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Community Activity</Text>
              </View>
            </View>

            <View style={styles.engagementGrid}>
              <View style={styles.engagementItem}>
                <Icon source="eye" size={24} color={paperTheme.colors.primary} />
                <Text style={[styles.engagementValue, { color: paperTheme.colors.primary }]}>
                  {(engagementStats.total_views || 0).toLocaleString()}
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Views</Text>
              </View>

              <View style={styles.engagementItem}>
                <Icon source="heart" size={24} color={mukokoTheme.colors.accent} />
                <Text style={[styles.engagementValue, { color: paperTheme.colors.primary }]}>
                  {(engagementStats.total_likes || 0).toLocaleString()}
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Likes</Text>
              </View>

              <View style={styles.engagementItem}>
                <Icon source="bookmark" size={24} color={mukokoTheme.colors.warning} />
                <Text style={[styles.engagementValue, { color: paperTheme.colors.primary }]}>
                  {(engagementStats.total_saves || 0).toLocaleString()}
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Saves</Text>
              </View>
            </View>
          </View>
        )}

        {/* Content Quality - Show if available */}
        {contentQuality && (
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="star-check" size={20} color={mukokoTheme.colors.warning} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Content Quality</Text>
              </View>
            </View>

            <View style={styles.qualityGrid}>
              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, { color: paperTheme.colors.primary }]}>
                  {Math.round(contentQuality.avg_word_count || 0)}
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>Avg Words</Text>
              </View>

              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, { color: paperTheme.colors.primary }]}>
                  {Math.round(contentQuality.with_images_percent || 0)}%
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>With Images</Text>
              </View>

              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, { color: paperTheme.colors.primary }]}>
                  {(contentQuality.avg_read_time || 0).toFixed(1)}m
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>Read Time</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Summary - Show if available */}
        {categoryInsights?.summary && (
          <View style={[styles.card, styles.aiCard, dynamicStyles.accentCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="robot" size={20} color={mukokoTheme.colors.accent} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>AI Analysis</Text>
              </View>
            </View>
            <View style={[styles.aiSummaryBox, { backgroundColor: paperTheme.colors.surface }]}>
              <Text style={[styles.aiSummaryText, dynamicStyles.title]}>
                "{categoryInsights.summary}"
              </Text>
            </View>
          </View>
        )}

        {/* Trending Topics */}
        {trendingCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="fire" size={20} color={mukokoTheme.colors.accent} />
              <Text style={[styles.sectionTitle, dynamicStyles.title]}>Hot Topics</Text>
            </View>

            <View style={styles.topicsGrid}>
              {trendingCategories.slice(0, 8).map((category, index) => (
                <TouchableOpacity
                  key={category.id || index}
                  style={[styles.topicCard, dynamicStyles.card, { width: cardWidth }]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                >
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicEmoji}>
                      {getEmoji(category.name || category.category_name)}
                    </Text>
                    {index < 3 && (
                      <View style={[styles.hotBadge, { backgroundColor: mukokoTheme.colors.accent }]}>
                        <Icon source="fire" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.topicName, dynamicStyles.title]} numberOfLines={1}>
                    {category.name || category.category_name}
                  </Text>
                  <Text style={[styles.topicCount, dynamicStyles.subtitle]}>
                    {category.article_count || 0} articles
                  </Text>
                  {category.growth_rate !== undefined && category.growth_rate > 0 && (
                    <View style={[styles.growthBadge, { backgroundColor: mukokoTheme.colors.success + '20' }]}>
                      <Icon source="trending-up" size={12} color={mukokoTheme.colors.success} />
                      <Text style={[styles.growthText, { color: mukokoTheme.colors.success }]}>
                        +{Math.round(category.growth_rate)}%
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Top Journalists */}
        {trendingAuthors.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon source="account-star" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.sectionTitle, dynamicStyles.title]}>Top Journalists</Text>
            </View>

            <View style={styles.authorsList}>
              {trendingAuthors.slice(0, 5).map((author, index) => (
                <TouchableOpacity
                  key={author.id || index}
                  style={[styles.authorItem, dynamicStyles.card]}
                  onPress={() => handleAuthorPress(author)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.authorRank,
                    {
                      backgroundColor: index === 0 ? '#FFD700' :
                        index === 1 ? '#C0C0C0' :
                        index === 2 ? '#CD7F32' : paperTheme.colors.primaryContainer,
                    },
                  ]}>
                    <Text style={[
                      styles.authorRankText,
                      { color: index < 3 ? '#FFFFFF' : paperTheme.colors.primary },
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, dynamicStyles.title]} numberOfLines={1}>
                      {author.name}
                    </Text>
                    <Text style={[styles.authorMeta, dynamicStyles.subtitle]} numberOfLines={1}>
                      {author.article_count || 0} articles
                      {author.outlets?.length > 0 && ` · ${author.outlets[0]}`}
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Community Message */}
        <View style={[styles.communityCard, dynamicStyles.card]}>
          <Icon source="account-group" size={28} color={paperTheme.colors.primary} />
          <View style={styles.communityContent}>
            <Text style={[styles.communityTitle, dynamicStyles.title]}>
              Open Analytics
            </Text>
            <Text style={[styles.communityText, dynamicStyles.subtitle]}>
              At Mukoko, we believe everyone deserves access to news insights.
              This data shows what Zimbabwe is reading and talking about.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.primaryContainer }]}
              onPress={() => navigation.navigate('DiscoverFeed')}
              activeOpacity={0.7}
            >
              <Icon source="fire" size={28} color={paperTheme.colors.primary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onPrimaryContainer }]}>
                Trending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.secondaryContainer }]}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.7}
            >
              <Icon source="magnify" size={28} color={paperTheme.colors.secondary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onSecondaryContainer }]}>
                Search
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.tertiaryContainer }]}
              onPress={() => navigation.navigate('Bytes')}
              activeOpacity={0.7}
            >
              <Icon source="lightning-bolt" size={28} color={paperTheme.colors.tertiary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onTertiaryContainer }]}>
                Bytes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* No Data State */}
        {!hasData && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No Data Available</Text>
            <Text style={[styles.emptyMessage, dynamicStyles.subtitle]}>
              Pull down to refresh and load the latest insights.
            </Text>
          </View>
        )}

        {/* Bottom padding */}
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

  // Loading
  loadingContainer: {
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  loadingIconRow: {
    marginTop: mukokoTheme.spacing.xs,
  },

  // Header
  header: {
    marginBottom: mukokoTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mukokoTheme.spacing.xs,
  },
  headerTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Time Range
  timeRangeContainer: {
    marginBottom: mukokoTheme.spacing.md,
  },
  timeRangeContent: {
    gap: mukokoTheme.spacing.sm,
  },
  timeChip: {
    marginRight: mukokoTheme.spacing.xs,
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    marginBottom: mukokoTheme.spacing.md,
  },

  // Cards
  card: {
    borderRadius: mukokoTheme.roundness,
    padding: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
    borderWidth: 1,
  },
  statsCard: {
    paddingBottom: mukokoTheme.spacing.lg,
  },
  aiCard: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mukokoTheme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
  },
  cardTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 16,
  },

  // Live Badge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statValue: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },

  // Engagement Grid
  engagementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  engagementItem: {
    alignItems: 'center',
    flex: 1,
    gap: mukokoTheme.spacing.xs,
  },
  engagementValue: {
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    fontSize: 20,
  },
  engagementLabel: {
    fontSize: 11,
  },

  // Quality Grid
  qualityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qualityItem: {
    alignItems: 'center',
    flex: 1,
  },
  qualityValue: {
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    fontSize: 22,
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // AI Summary
  aiSummaryBox: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness / 2,
  },
  aiSummaryText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Sections
  section: {
    marginBottom: mukokoTheme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  sectionTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 18,
  },

  // Topics Grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  topicCard: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: mukokoTheme.spacing.sm,
  },
  topicEmoji: {
    fontSize: 28,
  },
  hotBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  topicCount: {
    fontSize: 12,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
    marginTop: mukokoTheme.spacing.xs,
  },
  growthText: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Authors List
  authorsList: {
    gap: mukokoTheme.spacing.sm,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    gap: mukokoTheme.spacing.md,
  },
  authorRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorRankText: {
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
    fontSize: 12,
    marginTop: 2,
  },

  // Community Card
  communityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: mukokoTheme.spacing.md,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    marginBottom: mukokoTheme.spacing.md,
  },
  communityContent: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  communityText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Actions
  actionsSection: {
    marginBottom: mukokoTheme.spacing.md,
  },
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
    minHeight: 90,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: mukokoTheme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: mukokoTheme.spacing.md,
  },
  emptyTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    marginBottom: mukokoTheme.spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Bottom padding
  bottomPadding: {
    height: 100,
  },
});
