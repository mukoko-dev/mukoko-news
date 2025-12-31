/**
 * HomeScreen - Main news feed
 * Displays articles in a clean, scannable layout following 2025 news app patterns
 * Now with Pan-African country filtering and guest preferences
 * shadcn-style with NativeWind + Lucide icons
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, RefreshControl, Dimensions, Text, Pressable } from 'react-native';
import { Newspaper, RefreshCw, X } from 'lucide-react-native';
import { articles, categories as categoriesAPI } from '../api/client';
import { ErrorState, EmptyState, Button } from '../components/ui';
import ArticleCard from '../components/ArticleCard';
import CategoryChips from '../components/CategoryChips';
import LoginPromo from '../components/LoginPromo';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLayout } from '../components/layout';
import localPreferences, { PREF_KEYS } from '../services/LocalPreferencesService';
import cacheService from '../services/CacheService';
import { spacing } from '../constants/design-tokens';

// Article limit for non-authenticated users
const GUEST_ARTICLE_LIMIT = 50;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Breakpoints for responsive layout
const BREAKPOINTS = {
  mobile: 600,
  tablet: 900,
  desktop: 1200,
};

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articlesList, setArticlesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);
  const [error, setError] = useState(null);
  const [collectingFeed, setCollectingFeed] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Guest preferences state
  const [guestCountries, setGuestCountries] = useState([]);
  const [guestCategories, setGuestCategories] = useState([]);

  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const layout = useLayout();
  const preferencesLoadedRef = useRef(false);

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? 100 : 24;

  // Calculate responsive layout
  const getLayoutConfig = useCallback((width) => {
    if (width < BREAKPOINTS.mobile) {
      return { numColumns: 1, showFeatured: true };
    } else if (width < BREAKPOINTS.tablet) {
      return { numColumns: 2, showFeatured: true };
    } else {
      return { numColumns: 3, showFeatured: false };
    }
  }, []);

  const layoutConfig = getLayoutConfig(screenWidth);

  // Load guest preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        await localPreferences.init();

        const [storedCountries, storedCategories] = await Promise.all([
          localPreferences.getSelectedCountries(),
          localPreferences.getSelectedCategories(),
        ]);

        // Load existing guest preferences
        if (storedCountries && storedCountries.length > 0) {
          setGuestCountries(storedCountries);
        }
        if (storedCategories && storedCategories.length > 0) {
          setGuestCategories(storedCategories);
        }

        preferencesLoadedRef.current = true;
        loadInitialData();
      } catch (error) {
        if (__DEV__) {
          console.error('[Home] Failed to load preferences:', error);
        }
        loadInitialData();
      }
    };

    loadPreferences();
  }, []);

  // Reload feed when authentication state changes (personalized vs regular feed)
  useEffect(() => {
    if (!loading) {
      loadArticles(selectedCategory);
    }
  }, [isAuthenticated]);

  // Handle screen resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load categories (filter out 'all' since CategoryChips adds its own)
      const { data: categoriesData } = await categoriesAPI.getAll();
      if (categoriesData?.categories) {
        const filteredCategories = categoriesData.categories.filter(
          cat => cat.id !== 'all' && cat.slug !== 'all'
        );
        setCategoriesList(filteredCategories);
      }

      // Load articles
      await loadArticles();
    } catch (err) {
      if (__DEV__) {
        console.error('[Home] Initial load error:', err);
      }
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (category = null, countriesFilter = null) => {
    let data, error;

    // Determine article limit based on authentication
    const articleLimit = isAuthenticated ? 30 : GUEST_ARTICLE_LIMIT;

    // Get countries filter - use provided or fall back to guest preferences
    const countriesToFilter = countriesFilter || guestCountries;

    // Use personalized feed for authenticated users (no category filter)
    // Fall back to regular feed for guests or when filtering by category
    if (isAuthenticated && !category) {
      const result = await articles.getPersonalizedFeed({
        limit: articleLimit,
        offset: 0,
        excludeRead: true,
        diversity: 0.3,
        countries: countriesToFilter.length > 0 ? countriesToFilter : undefined,
      });
      data = result.data;
      error = result.error;
    } else {
      const result = await articles.getFeed({
        limit: articleLimit,
        offset: 0,
        category,
        countries: countriesToFilter.length > 0 ? countriesToFilter : undefined,
      });
      data = result.data;
      error = result.error;
    }

    if (data?.articles) {
      setArticlesList(data.articles);

      // Cache articles in IndexedDB for offline access
      try {
        await cacheService.cacheArticles(data.articles);
      } catch (cacheError) {
        if (__DEV__) {
          console.warn('[Home] Failed to cache articles:', cacheError);
        }
        // Don't block UI on cache errors
      }
    }

    if (error) {
      if (__DEV__) {
        console.error('Failed to load articles:', error);
      }
    }
  };

  // Guest preferences are now handled globally by AppNavigator

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    setCollectingFeed(false);

    try {
      // Step 1: Trigger backend RSS collection (TikTok-style)
      if (__DEV__) {
        console.log('[Home] Triggering backend RSS collection...');
      }
      const collectResult = await articles.collectFeed();

      if (collectResult.data?.success) {
        const newArticlesCount = collectResult.data.newArticles || 0;
        if (__DEV__) {
          console.log(`[Home] Collection complete: ${newArticlesCount} new articles`);
        }

        // Show feedback message
        if (newArticlesCount > 0) {
          setSnackbarMessage(`${newArticlesCount} new articles found!`);
          setSnackbarVisible(true);
        } else {
          setSnackbarMessage('No new articles at this time');
          setSnackbarVisible(true);
        }
      } else if (collectResult.error) {
        // Handle rate limiting or other errors
        if (__DEV__) {
          console.log('[Home] Collection info:', collectResult.error);
        }

        // Show rate limit message if applicable
        if (collectResult.error.includes('wait')) {
          setSnackbarMessage(collectResult.error);
          setSnackbarVisible(true);
        }
      }

      // Step 2: Fetch fresh articles from backend
      await loadArticles(selectedCategory);

    } catch (err) {
      if (__DEV__) {
        console.error('[Home] Refresh error:', err);
      }
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryPress = async (categorySlug) => {
    // Toggle off if same category selected, or if "all" (null) is selected
    const newCategory = selectedCategory === categorySlug ? null : categorySlug;
    setSelectedCategory(newCategory);
    await loadArticles(newCategory);
  };

  const handleArticlePress = (article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      source: article.source_id || article.source,
      slug: article.slug,
    });
  };

  // Calculate card width for multi-column layouts
  const getCardWidth = () => {
    if (layoutConfig.numColumns === 1) return undefined;
    const totalPadding = 12 * 2; // 12px = md spacing
    const gap = 12 * (layoutConfig.numColumns - 1);
    return (screenWidth - totalPadding - gap) / layoutConfig.numColumns;
  };

  const cardWidth = getCardWidth();

  const renderArticleItem = ({ item: article, index }) => {
    // Show first article as featured on mobile
    if (index === 0 && layoutConfig.showFeatured && layoutConfig.numColumns === 1) {
      return (
        <ArticleCard
          article={article}
          variant="featured"
          onPress={() => handleArticlePress(article)}
        />
      );
    }

    // Show horizontal cards for items 1-4 on mobile (quick scan section)
    if (index >= 1 && index <= 4 && layoutConfig.numColumns === 1) {
      return (
        <ArticleCard
          article={article}
          variant="horizontal"
          onPress={() => handleArticlePress(article)}
        />
      );
    }

    // Default card for remaining items
    return (
      <ArticleCard
        article={article}
        variant="default"
        width={cardWidth}
        onPress={() => handleArticlePress(article)}
        className={layoutConfig.numColumns > 1 ? 'flex-1 mb-0' : undefined}
      />
    );
  };

  if (error) {
    return (
      <ErrorState
        title="Something went wrong"
        message={error}
        onRetry={loadInitialData}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Category Filter */}
      <CategoryChips
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
        showAll={true}
      />

      {/* Feed Collection Snackbar */}
      {snackbarVisible && (
        <View className="absolute bottom-24 left-md right-md z-50">
          <View
            className="flex-row items-center justify-between px-md py-sm rounded-button border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.outline,
            }}
          >
            <Text
              className="flex-1 font-sans text-body-medium mr-sm"
              style={{ color: colors.text }}
            >
              {snackbarMessage}
            </Text>
            <Pressable
              onPress={() => setSnackbarVisible(false)}
              className="p-xs"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Articles Feed */}
      <FlatList
        key={`feed-${layoutConfig.numColumns}`}
        data={articlesList}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={layoutConfig.numColumns > 1 ? layoutConfig.numColumns : 1}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: bottomPadding }}
        columnWrapperStyle={layoutConfig.numColumns > 1 ? { gap: spacing.md, marginBottom: spacing.md } : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          !isAuthenticated && articlesList.length > 0 ? (
            <LoginPromo
              variant="compact"
              articleLimit={GUEST_ARTICLE_LIMIT}
              className="mt-lg mb-xxl"
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={Newspaper}
            title="No articles found"
            subtitle={
              selectedCategory
                ? 'No articles in this category. Try selecting a different one.'
                : 'Pull down to refresh and load the latest news.'
            }
            actionLabel="Refresh Feed"
            onAction={onRefresh}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />
    </View>
  );
}

// All styles removed - using NativeWind classes instead
