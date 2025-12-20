/**
 * DiscoverScreen - Premium Visual Exploration
 *
 * Purpose: Browse EVERYTHING (not personalized)
 * Design: Apple News + The Athletic + Artifact inspired
 *
 * Features:
 * - NO search bar (pure browsing - search lives on Search tab)
 * - Hero story card (magazine-style)
 * - Hot topics with rank badges
 * - Visual category explorer grid
 * - Latest articles in 2-column magazine grid
 *
 * UX Principles:
 * - Visual exploration, not text-heavy
 * - Discover shows ALL content (not personalized)
 * - Magazine-style layouts
 * - Subtle AI indicators where appropriate
 */

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
  useTheme as usePaperTheme,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLayout } from '../components/layout';
import ArticleCard from '../components/ArticleCard';
import { CuratedLabel } from '../components/ai';
import { HeroStoryCard, CategoryExplorerCard, TrendingTopicRow } from '../components/discover';
import {
  articles as articlesAPI,
  categories as categoriesAPI,
  insights as insightsAPI,
} from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();
  const layout = useLayout();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? 100 : 24;

  // Data states
  const [heroArticle, setHeroArticle] = useState(null);
  const [latestArticles, setLatestArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [stats, setStats] = useState({ countries: 0, categories: 0 });
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
        loadArticles(),
        loadCategories(),
        loadStats(),
      ]);
    } catch (err) {
      console.error('[Discover] Initial load error:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      // Load trending articles for hero and grid
      let result = await articlesAPI.getFeed({
        limit: 25,
        offset: 0,
        sort: 'trending',
      });

      const articles = result.data?.articles || [];

      // If no trending, fall back to latest
      if (articles.length === 0) {
        result = await articlesAPI.getFeed({
          limit: 25,
          offset: 0,
          sort: 'latest',
        });
      }

      const allArticles = result.data?.articles || [];

      // First article becomes hero
      if (allArticles.length > 0) {
        setHeroArticle(allArticles[0]);
        setLatestArticles(allArticles.slice(1));
      } else {
        setHeroArticle(null);
        setLatestArticles([]);
      }
    } catch (err) {
      console.error('[Discover] Load articles error:', err);
      setHeroArticle(null);
      setLatestArticles([]);
    }
  };

  const loadCategories = async () => {
    try {
      const [categoriesResult, trendingResult] = await Promise.all([
        categoriesAPI.getAll(),
        insightsAPI.getTrendingCategories(6),
      ]);

      if (categoriesResult.data?.categories) {
        // Filter out 'all' and limit to main categories
        const filtered = categoriesResult.data.categories.filter(
          cat => cat.id !== 'all' && cat.slug !== 'all'
        );
        setCategories(filtered);
      }

      if (trendingResult.data?.trending) {
        setTrendingCategories(trendingResult.data.trending);
      }
    } catch (err) {
      console.error('[Discover] Load categories error:', err);
    }
  };

  const loadStats = async () => {
    try {
      const result = await insightsAPI.getStats();
      if (result.data) {
        setStats({
          countries: result.data.unique_countries || result.data.countries || 15,
          categories: result.data.category_count || result.data.categories || 14,
        });
      }
    } catch (err) {
      console.error('[Discover] Load stats error:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCategoryPress = async (category) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const categorySlug = category?.slug || category?.id || category?.name;
    if (categorySlug) {
      // Navigate to a filtered view or the category screen
      navigation.navigate('CategoryArticles', { category: categorySlug, categoryName: category.name });
    }
  };

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      source: article.source_id || article.source,
      slug: article.slug,
    });
  }, [navigation]);

  // Calculate grid dimensions based on screen size
  const padding = mukokoTheme.spacing.md;
  const gap = mukokoTheme.spacing.sm;

  // Responsive column counts
  const getCategoryColumns = () => {
    if (layout.isDesktop) return 5;
    if (layout.isTablet) return 4;
    return 3; // mobile
  };

  const getArticleColumns = () => {
    if (layout.isDesktop) return 3;
    if (layout.isTablet) return 2;
    return 1; // mobile
  };

  const categoryColumns = getCategoryColumns();
  const articleColumns = getArticleColumns();

  // Calculate available width (accounting for sidebars on desktop/tablet)
  const getAvailableWidth = () => {
    if (layout.isMobile) return screenWidth;
    // For tablet/desktop, use the contentWidth from layout context
    return layout.contentWidth || screenWidth;
  };

  const availableWidth = getAvailableWidth();

  // Calculate card widths based on columns
  const categoryCardWidth = (availableWidth - padding * 2 - gap * (categoryColumns - 1)) / categoryColumns;
  const articleCardWidth = (availableWidth - padding * 2 - gap * (articleColumns - 1)) / articleColumns;

  // Number of items to show initially
  const categoryItemsToShow = categoryColumns * 2; // 2 rows
  const articleItemsToShow = articleColumns * 4; // 4 rows

  // Dynamic styles
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    sectionTitle: {
      color: paperTheme.colors.onSurface,
    },
    subtitle: {
      color: paperTheme.colors.onSurfaceVariant,
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.subtitle]}>
          Loading discoveries...
        </Text>
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.sectionTitle]}>
            Explore Africa's News
          </Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.subtitle]}>
            Browse {stats.countries} countries, {stats.categories} topics
          </Text>
        </View>

        {/* Hero Story */}
        {heroArticle && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                TRENDING NOW
              </Text>
              <CuratedLabel variant="trending" size="small" />
            </View>
            <HeroStoryCard
              article={heroArticle}
              onPress={() => handleArticlePress(heroArticle)}
              width={availableWidth - padding * 2}
            />
          </View>
        )}

        {/* Hot Topics */}
        {trendingCategories.length > 0 && (
          <TrendingTopicRow
            topics={trendingCategories}
            onTopicPress={handleCategoryPress}
            title="HOT TOPICS"
            showAILabel={true}
            style={styles.trendingSection}
          />
        )}

        {/* Browse by Category */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                BROWSE BY CATEGORY
              </Text>
            </View>
            <View style={styles.categoryGrid}>
              {categories.slice(0, categoryItemsToShow).map((category, index) => (
                <CategoryExplorerCard
                  key={category.id || category.slug || index}
                  category={category}
                  onPress={() => handleCategoryPress(category)}
                  width={categoryCardWidth}
                  showCount={true}
                />
              ))}
            </View>
            {categories.length > categoryItemsToShow && (
              <TouchableOpacity
                style={[styles.viewAllButton, { borderColor: paperTheme.colors.primary }]}
                onPress={() => navigation.navigate('AllCategories')}
              >
                <Text style={[styles.viewAllText, { color: paperTheme.colors.primary }]}>
                  View all {categories.length} categories
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Latest from All Sources */}
        {latestArticles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                LATEST FROM ALL SOURCES
              </Text>
              <CuratedLabel variant="popular" size="small" showIcon={false} />
            </View>
            <View style={styles.articleGrid}>
              {latestArticles.slice(0, articleItemsToShow).map((article) => (
                <View key={article.id} style={{ width: articleCardWidth }}>
                  <ArticleCard
                    article={article}
                    onPress={() => handleArticlePress(article)}
                    width={articleCardWidth}
                    variant="compact"
                  />
                </View>
              ))}
            </View>
            {latestArticles.length > articleItemsToShow && (
              <TouchableOpacity
                style={[styles.loadMoreButton, { backgroundColor: paperTheme.colors.primary }]}
                onPress={async () => {
                  // Could load more articles or navigate to a full feed
                  if (Platform.OS !== 'web') {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={styles.loadMoreText}>Load more stories</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {!heroArticle && latestArticles.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.sectionTitle]}>
              No stories to explore
            </Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.subtitle]}>
              Pull to refresh and discover news from across Africa
            </Text>
          </View>
        )}

        <View style={{ height: bottomPadding }} />
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
    gap: mukokoTheme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: mukokoTheme.spacing.md,
  },

  // Header
  header: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingTop: mukokoTheme.spacing.lg,
    paddingBottom: mukokoTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginTop: mukokoTheme.spacing.xs,
  },

  // Sections
  section: {
    paddingHorizontal: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mukokoTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Trending section (uses TrendingTopicRow which handles its own padding)
  trendingSection: {
    marginBottom: mukokoTheme.spacing.md,
  },

  // Category Grid (3 columns)
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },

  // Article Grid (2 columns)
  articleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },

  // Buttons
  viewAllButton: {
    alignSelf: 'center',
    marginTop: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.xl,
    borderRadius: mukokoTheme.roundness,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.xxl * 2,
    paddingHorizontal: mukokoTheme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: mukokoTheme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
  },
});
