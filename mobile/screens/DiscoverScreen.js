import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Surface,
  Icon,
  Chip,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import ArticleCard from '../components/ArticleCard';
import MasonryGrid from '../components/MasonryGrid';
import { useAuth } from '../contexts/AuthContext';
import {
  articles as articlesAPI,
  categories as categoriesAPI,
  insights as insightsAPI,
} from '../api/client';

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

// Responsive column calculation
const getColumnCount = (screenWidth) => {
  if (screenWidth >= 1200) return 4;
  if (screenWidth >= 900) return 3;
  if (screenWidth >= 600) return 2;
  return 2;
};

/**
 * DiscoverScreen - Unified discovery hub for news content
 * Features: Live insights banner, trending content, topic exploration, journalist spotlights
 * Single scrollable experience with clear visual hierarchy
 */
export default function DiscoverScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);

  // Data states
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [journalists, setJournalists] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  // Handle screen resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadTrendingArticles(),
        loadTrendingCategories(),
        loadJournalists(),
        loadPlatformStats(),
      ]);
    } catch (err) {
      console.error('[Discover] Initial load error:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformStats = async () => {
    try {
      const result = await insightsAPI.getStats();
      if (result.data?.database) {
        setPlatformStats(result.data.database);
      }
    } catch (err) {
      console.error('[Discover] Load stats error:', err);
    }
  };

  const loadTrendingArticles = async (category = null) => {
    try {
      let result = await articlesAPI.getFeed({
        limit: 30,
        offset: 0,
        category: category || undefined,
        sort: 'trending',
      });

      if (!result.data?.articles || result.data.articles.length === 0) {
        result = await articlesAPI.getFeed({
          limit: 30,
          offset: 0,
          category: category || undefined,
          sort: 'latest',
        });
      }

      if (result.data?.articles) {
        const allArticles = result.data.articles;
        // Set first article as featured, rest as regular
        if (allArticles.length > 0) {
          setFeaturedArticle(allArticles[0]);
          setArticles(allArticles.slice(1));
        } else {
          setFeaturedArticle(null);
          setArticles([]);
        }
      } else {
        setFeaturedArticle(null);
        setArticles([]);
      }
    } catch (err) {
      console.error('[Discover] Load articles error:', err);
      setFeaturedArticle(null);
      setArticles([]);
    }
  };

  const loadTrendingCategories = async () => {
    try {
      const [categoriesResult, trendingResult] = await Promise.all([
        categoriesAPI.getAll(),
        insightsAPI.getTrendingCategories(8),
      ]);

      if (categoriesResult.data?.categories) {
        setCategories(categoriesResult.data.categories);
      }

      if (trendingResult.data?.trending) {
        setTrendingCategories(trendingResult.data.trending);
      }
    } catch (err) {
      console.error('[Discover] Load categories error:', err);
    }
  };

  const loadJournalists = async () => {
    try {
      const result = await insightsAPI.getTrendingAuthors(6);
      if (result.data?.trending_authors) {
        setJournalists(result.data.trending_authors);
      }
    } catch (err) {
      console.error('[Discover] Load journalists error:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadInitialData();
    } catch (err) {
      console.error('[Discover] Refresh error:', err);
      setError('Failed to refresh content. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryPress = async (category) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const categorySlug = category?.slug || category?.id || category?.name;

    if (!categorySlug || selectedCategory === categorySlug) {
      setSelectedCategory(null);
      await loadTrendingArticles(null);
    } else {
      setSelectedCategory(categorySlug);
      await loadTrendingArticles(categorySlug);
    }
  };

  const handleJournalistPress = (journalist) => {
    navigation.navigate('SearchFeed', { searchQuery: journalist.name });
  };

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      source: article.source_id || article.source,
      slug: article.slug,
    });
  }, [navigation]);

  const handleInsightsPress = () => {
    navigation.navigate('InsightsFeed');
  };

  // Calculate dimensions
  const columnCount = getColumnCount(screenWidth);
  const gap = mukokoTheme.spacing.sm;

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

  // Render Live Insights Banner - Entry point to analytics
  const renderInsightsBanner = () => (
    <TouchableOpacity
      style={[styles.insightsBanner, dynamicStyles.accentCard]}
      onPress={handleInsightsPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="View insights and analytics"
    >
      <View style={styles.insightsBannerLeft}>
        <View style={[styles.insightsBadge, { backgroundColor: mukokoTheme.colors.accent + '20' }]}>
          <Icon source="chart-line" size={16} color={mukokoTheme.colors.accent} />
          <Text style={[styles.insightsBadgeText, { color: mukokoTheme.colors.accent }]}>
            INSIGHTS
          </Text>
        </View>
        <Text style={[styles.insightsBannerTitle, dynamicStyles.title]}>
          Zimbabwe News Analytics
        </Text>
        <Text style={[styles.insightsBannerSubtitle, dynamicStyles.subtitle]}>
          AI-powered trends, community stats, and more
        </Text>
      </View>
      <View style={styles.insightsBannerRight}>
        {platformStats && (
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatValue, { color: paperTheme.colors.primary }]}>
                {(platformStats.total_articles || 0).toLocaleString()}
              </Text>
              <Text style={[styles.quickStatLabel, dynamicStyles.subtitle]}>Articles</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatValue, { color: paperTheme.colors.primary }]}>
                {platformStats.active_sources || 0}
              </Text>
              <Text style={[styles.quickStatLabel, dynamicStyles.subtitle]}>Sources</Text>
            </View>
          </View>
        )}
        <Icon source="chevron-right" size={24} color={mukokoTheme.colors.accent} />
      </View>
    </TouchableOpacity>
  );

  // Render Category Filter Chips
  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      <Chip
        mode={selectedCategory === null ? 'flat' : 'outlined'}
        selected={selectedCategory === null}
        onPress={() => handleCategoryPress(null)}
        style={[
          styles.filterChip,
          selectedCategory === null && { backgroundColor: paperTheme.colors.primary },
        ]}
        textStyle={[
          styles.filterChipText,
          selectedCategory === null && { color: '#FFFFFF' },
        ]}
      >
        All
      </Chip>
      {categories.slice(0, 10).map((category) => (
        <Chip
          key={category.id || category.slug}
          mode={selectedCategory === (category.slug || category.id) ? 'flat' : 'outlined'}
          selected={selectedCategory === (category.slug || category.id)}
          onPress={() => handleCategoryPress(category)}
          style={[
            styles.filterChip,
            selectedCategory === (category.slug || category.id) && {
              backgroundColor: paperTheme.colors.primary,
            },
          ]}
          textStyle={[
            styles.filterChipText,
            selectedCategory === (category.slug || category.id) && { color: '#FFFFFF' },
          ]}
          icon={() => <Text style={styles.chipEmoji}>{getEmoji(category.name)}</Text>}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render Featured Article (Hero)
  const renderFeaturedArticle = () => {
    if (!featuredArticle) return null;

    return (
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Icon source="fire" size={20} color={mukokoTheme.colors.accent} />
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Top Story</Text>
        </View>
        <ArticleCard
          article={featuredArticle}
          onPress={() => handleArticlePress(featuredArticle)}
          variant="featured"
        />
      </View>
    );
  };

  // Render Trending Topics Section
  const renderTrendingTopics = () => {
    if (trendingCategories.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon source="trending-up" size={20} color={paperTheme.colors.primary} />
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Trending Topics</Text>
          <TouchableOpacity
            onPress={handleInsightsPress}
            style={styles.seeAllButton}
            accessibilityRole="button"
            accessibilityLabel="See all trending topics"
          >
            <Text style={[styles.seeAllText, { color: paperTheme.colors.primary }]}>See All</Text>
            <Icon source="chevron-right" size={16} color={paperTheme.colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsScrollContent}
        >
          {trendingCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id || index}
              style={[styles.topicCard, dynamicStyles.card]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${category.name || category.category_name} articles`}
            >
              <Text style={styles.topicEmoji}>
                {getEmoji(category.name || category.category_name)}
              </Text>
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
                    +{Math.abs(category.growth_rate || 0).toFixed(0)}%
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render Top Journalists Section
  const renderJournalists = () => {
    if (journalists.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon source="account-group" size={20} color={paperTheme.colors.primary} />
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Top Journalists</Text>
          <TouchableOpacity
            onPress={handleInsightsPress}
            style={styles.seeAllButton}
            accessibilityRole="button"
            accessibilityLabel="See all journalists"
          >
            <Text style={[styles.seeAllText, { color: paperTheme.colors.primary }]}>See All</Text>
            <Icon source="chevron-right" size={16} color={paperTheme.colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.journalistsScrollContent}
        >
          {journalists.map((journalist, index) => (
            <TouchableOpacity
              key={journalist.id || index}
              style={[styles.journalistCard, dynamicStyles.card]}
              onPress={() => handleJournalistPress(journalist)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View articles by ${journalist.name}`}
            >
              {index < 3 && (
                <View style={[
                  styles.journalistRankBadge,
                  {
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                  },
                ]}>
                  <Text style={styles.journalistRankText}>{index + 1}</Text>
                </View>
              )}
              <View style={[styles.journalistAvatar, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                <Icon source="account" size={28} color={paperTheme.colors.primary} />
              </View>
              <Text style={[styles.journalistName, dynamicStyles.title]} numberOfLines={2}>
                {journalist.name}
              </Text>
              <Text style={[styles.journalistStats, dynamicStyles.subtitle]}>
                {journalist.article_count || 0} articles
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render article item for masonry
  const renderArticleItem = useCallback(({ item, columnWidth }) => (
    <ArticleCard
      article={item}
      onPress={() => handleArticlePress(item)}
      width={columnWidth}
      variant="default"
    />
  ), [handleArticlePress]);

  // Render More Articles Grid
  const renderArticlesGrid = () => {
    if (articles.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon source="newspaper-variant-multiple" size={20} color={paperTheme.colors.primary} />
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>
            {selectedCategory ? `${selectedCategory} News` : 'More Stories'}
          </Text>
        </View>
        <MasonryGrid
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id?.toString()}
          gap={gap}
        />
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContent}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={[styles.emptyTitle, dynamicStyles.title]}>No Articles Found</Text>
      <Text style={[styles.emptyMessage, dynamicStyles.subtitle]}>
        {selectedCategory
          ? `No articles in "${selectedCategory}" right now. Try a different category.`
          : 'Pull down to refresh or check back later for new stories.'}
      </Text>
      {selectedCategory && (
        <TouchableOpacity
          style={[styles.clearFilterButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={() => handleCategoryPress(null)}
          accessibilityRole="button"
          accessibilityLabel="Clear category filter"
        >
          <Text style={styles.clearFilterText}>Show All Categories</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.subtitle]}>Discovering content...</Text>
      </View>
    );
  }

  if (error && !featuredArticle && articles.length === 0) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={[styles.errorTitle, dynamicStyles.title]}>Something went wrong</Text>
        <Text style={[styles.errorMessage, dynamicStyles.subtitle]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={loadInitialData}
          accessibilityRole="button"
          accessibilityLabel="Retry loading content"
        >
          <Icon source="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasContent = featuredArticle || articles.length > 0;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !hasContent && styles.scrollContentCentered,
        ]}
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
        {/* Insights Banner - Always visible at top */}
        {renderInsightsBanner()}

        {/* Category Filter */}
        {renderCategoryFilter()}

        {hasContent ? (
          <>
            {/* Featured Article */}
            {renderFeaturedArticle()}

            {/* Trending Topics - Horizontal scroll */}
            {!selectedCategory && renderTrendingTopics()}

            {/* Top Journalists - Horizontal scroll */}
            {!selectedCategory && renderJournalists()}

            {/* More Articles Grid */}
            {renderArticlesGrid()}
          </>
        ) : (
          renderEmptyState()
        )}

        {/* Bottom padding for floating tab bar */}
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

  // Insights Banner
  insightsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: mukokoTheme.spacing.md,
    marginTop: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.sm,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },
  insightsBannerLeft: {
    flex: 1,
  },
  insightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: mukokoTheme.spacing.xs,
  },
  insightsBadgeText: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 0.5,
  },
  insightsBannerTitle: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: 2,
  },
  insightsBannerSubtitle: {
    fontSize: 12,
  },
  insightsBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.md,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  quickStatLabel: {
    fontSize: 10,
  },

  // Category Filter
  categoryFilter: {
    maxHeight: 52,
  },
  categoryFilterContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xs,
    gap: mukokoTheme.spacing.sm,
  },
  filterChip: {
    marginRight: mukokoTheme.spacing.xs,
  },
  filterChipText: {
    fontSize: 13,
  },
  chipEmoji: {
    fontSize: 14,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginTop: mukokoTheme.spacing.lg,
  },
  featuredSection: {
    marginTop: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.md,
  },
  sectionTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 18,
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Trending Topics
  topicsScrollContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  topicCard: {
    width: 140,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    alignItems: 'center',
  },
  topicEmoji: {
    fontSize: 32,
    marginBottom: mukokoTheme.spacing.sm,
  },
  topicName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.xs,
  },
  topicCount: {
    fontSize: 12,
    marginBottom: mukokoTheme.spacing.xs,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // Journalists
  journalistsScrollContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  journalistCard: {
    width: 120,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  journalistRankBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  journalistRankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  journalistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.sm,
  },
  journalistName: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.xs,
  },
  journalistStats: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Loading & Empty States
  loadingText: {
    marginTop: mukokoTheme.spacing.md,
    fontSize: 14,
  },
  emptyContent: {
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
    marginBottom: mukokoTheme.spacing.lg,
    paddingHorizontal: mukokoTheme.spacing.xl,
  },
  clearFilterButton: {
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
  },
  clearFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Bottom padding for floating tab bar
  bottomPadding: {
    height: 100,
  },

  // Error state styles
  errorEmoji: {
    fontSize: 60,
    marginBottom: mukokoTheme.spacing.md,
  },
  errorTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    marginBottom: mukokoTheme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.lg,
    paddingHorizontal: mukokoTheme.spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
