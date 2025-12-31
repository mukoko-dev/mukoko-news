/**
 * DiscoverScreen - Premium Visual Exploration
 * shadcn-style with NativeWind + Lucide icons
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
import { View, ScrollView, RefreshControl, Dimensions, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useLayout } from '../components/layout';
import { LoadingState, EmptyState } from '../components/ui';
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
  const padding = 12;
  const gap = 8;

  // Responsive column counts - defensive checks for layout properties
  const getCategoryColumns = () => {
    if (layout?.isDesktop || layout?.layout === 'desktop') return 5;
    if (layout?.isTablet || layout?.layout === 'tablet') return 4;
    return 3; // mobile
  };

  const getArticleColumns = () => {
    if (layout?.isDesktop || layout?.layout === 'desktop') return 3;
    if (layout?.isTablet || layout?.layout === 'tablet') return 2;
    return 1; // mobile
  };

  const categoryColumns = getCategoryColumns();
  const articleColumns = getArticleColumns();

  // Calculate available width (accounting for sidebars on desktop/tablet)
  const getAvailableWidth = () => {
    const isMobileLayout = !layout?.isDesktop && !layout?.isTablet &&
                          (layout?.isMobile || layout?.layout === 'mobile' || !layout);
    if (isMobileLayout) return screenWidth;

    // For tablet/desktop, use the contentWidth from layout context
    // contentWidth might be a string '100%' or a number
    const layoutContentWidth = layout?.contentWidth;
    if (typeof layoutContentWidth === 'number' && layoutContentWidth > 0) {
      return layoutContentWidth;
    }
    return screenWidth;
  };

  const availableWidth = getAvailableWidth();

  // Validate availableWidth is a valid number
  const validWidth = typeof availableWidth === 'number' && !isNaN(availableWidth) && availableWidth > 0
    ? availableWidth
    : screenWidth;

  // Calculate card widths based on columns
  const calculateCardWidth = (columns) => {
    const totalGap = gap * (columns - 1);
    const totalPadding = padding * 2;
    const width = (validWidth - totalPadding - totalGap) / columns;
    // Ensure width is valid and positive with a percentage-based minimum
    // Minimum is 15% of available width to handle very small screens
    const minWidth = validWidth * 0.15;
    return Math.max(width, minWidth);
  };

  const categoryCardWidth = calculateCardWidth(categoryColumns);
  const articleCardWidth = calculateCardWidth(articleColumns);

  // Number of items to show initially
  const categoryItemsToShow = categoryColumns * 2; // 2 rows
  const articleItemsToShow = articleColumns * 4; // 4 rows

  if (loading) {
    return <LoadingState message="Loading discoveries..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1C1B1F' : '#FAF9F5' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
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
        {/* Header Section */}
        <View className="px-md pt-lg pb-md">
          <Text className="font-serif-bold text-[28px] text-on-surface" style={{ letterSpacing: -0.5 }}>
            Explore Africa's News
          </Text>
          <Text className="font-sans text-body-medium text-on-surface-variant mt-xs">
            Browse {stats.countries} countries, {stats.categories} topics
          </Text>
        </View>

        {/* Hero Story */}
        {heroArticle && (
          <View className="px-md mb-lg">
            <View className="flex-row items-center justify-between mb-sm">
              <Text className="font-sans-bold text-label-medium text-on-surface uppercase" style={{ letterSpacing: 0.8 }}>
                TRENDING NOW
              </Text>
              <CuratedLabel variant="trending" size="small" />
            </View>
            <HeroStoryCard
              article={heroArticle}
              onPress={() => handleArticlePress(heroArticle)}
              width={validWidth - padding * 2}
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
            className="mb-md"
          />
        )}

        {/* Browse by Category */}
        {categories.length > 0 && (
          <View className="px-md mb-lg">
            <View className="flex-row items-center justify-between mb-sm">
              <Text className="font-sans-bold text-label-medium text-on-surface uppercase" style={{ letterSpacing: 0.8 }}>
                BROWSE BY CATEGORY
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-sm">
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
              <Pressable
                className="self-center mt-md py-sm px-lg rounded-button border border-tanzanite"
                onPress={() => navigation.navigate('AllCategories')}
              >
                <Text className="font-sans-medium text-label-large text-tanzanite">
                  View all {categories.length} categories
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Latest from All Sources */}
        {latestArticles.length > 0 && (
          <View className="px-md mb-lg">
            <View className="flex-row items-center justify-between mb-sm">
              <Text className="font-sans-bold text-label-medium text-on-surface uppercase" style={{ letterSpacing: 0.8 }}>
                LATEST FROM ALL SOURCES
              </Text>
              <CuratedLabel variant="popular" size="small" showIcon={false} />
            </View>
            <View className="flex-row flex-wrap gap-sm">
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
              <Pressable
                className="self-center mt-md py-sm px-xl rounded-button bg-tanzanite"
                onPress={async () => {
                  // Could load more articles or navigate to a full feed
                  if (Platform.OS !== 'web') {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text className="font-sans-medium text-body-medium text-white">
                  Load more stories
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Empty State */}
        {!heroArticle && latestArticles.length === 0 && (
          <EmptyState
            emoji="🌍"
            title="No stories to explore"
            subtitle="Pull to refresh and discover news from across Africa"
          />
        )}
      </ScrollView>
    </View>
  );
}

// All styles removed - using NativeWind classes instead
