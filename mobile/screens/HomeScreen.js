/**
 * HomeScreen - Main news feed
 * Displays articles in a clean, scannable layout following 2025 news app patterns
 * Now with Pan-African country filtering and guest preferences
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Button,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { articles, categories as categoriesAPI } from '../api/client';
import mukokoTheme from '../theme';
import ArticleCard from '../components/ArticleCard';
import CategoryChips from '../components/CategoryChips';
import SearchPromo from '../components/SearchPromo';
import LoginPromo from '../components/LoginPromo';
import SplashScreen from '../components/SplashScreen';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout';

// Storage keys for guest preferences
const GUEST_COUNTRIES_KEY = '@mukoko_guest_countries';
const GUEST_CATEGORIES_KEY = '@mukoko_guest_categories';
const SPLASH_SHOWN_KEY = '@mukoko_splash_shown';

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

  // Splash screen and guest preferences state
  const [showSplash, setShowSplash] = useState(true);
  const [splashShownBefore, setSplashShownBefore] = useState(null);
  const [guestCountries, setGuestCountries] = useState([]);
  const [guestCategories, setGuestCategories] = useState([]);

  const paperTheme = usePaperTheme();
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

  // Check if splash was shown before (on mount)
  useEffect(() => {
    const checkSplashStatus = async () => {
      try {
        const [shown, storedCountries, storedCategories] = await Promise.all([
          AsyncStorage.getItem(SPLASH_SHOWN_KEY),
          AsyncStorage.getItem(GUEST_COUNTRIES_KEY),
          AsyncStorage.getItem(GUEST_CATEGORIES_KEY),
        ]);

        setSplashShownBefore(shown === 'true');

        // Load existing guest preferences
        if (storedCountries) {
          setGuestCountries(JSON.parse(storedCountries));
        }
        if (storedCategories) {
          setGuestCategories(JSON.parse(storedCategories));
        }

        preferencesLoadedRef.current = true;
      } catch (error) {
        console.error('[Home] Failed to check splash status:', error);
        setSplashShownBefore(false);
      }
    };

    checkSplashStatus();
  }, []);

  // Load initial data when preferences are ready
  useEffect(() => {
    if (preferencesLoadedRef.current && splashShownBefore !== null) {
      loadInitialData();
    }
  }, [splashShownBefore]);

  // Reload feed when authentication state changes (personalized vs regular feed)
  useEffect(() => {
    if (!loading && !showSplash) {
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
      console.error('[Home] Initial load error:', err);
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
    }

    if (error) {
      console.error('Failed to load articles:', error);
    }
  };

  // Handle splash screen close and preferences
  const handleSplashClose = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handlePreferencesSet = useCallback(({ countries, categories }) => {
    setGuestCountries(countries || []);
    setGuestCategories(categories || []);

    // Reload articles with new preferences
    loadArticles(selectedCategory, countries);
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadArticles(selectedCategory);
    } catch (err) {
      console.error('[Home] Refresh error:', err);
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
    const totalPadding = mukokoTheme.spacing.md * 2;
    const gap = mukokoTheme.spacing.md * (layoutConfig.numColumns - 1);
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
        style={layoutConfig.numColumns > 1 ? styles.gridCard : undefined}
      />
    );
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    loadingText: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    emptyTitle: {
      color: paperTheme.colors.onSurface,
    },
    emptyDescription: {
      color: paperTheme.colors.onSurfaceVariant,
    },
  };

  // Show splash screen for first-time users or during loading
  // For returning users who have seen splash before, only show during initial load
  if (showSplash || loading) {
    // Determine if we should show customization flow
    const shouldShowCustomization = !isAuthenticated && !splashShownBefore;

    return (
      <SplashScreen
        isLoading={loading}
        loadingMessage="Fetching the latest news from across Africa..."
        showCustomization={shouldShowCustomization}
        onClose={handleSplashClose}
        onPreferencesSet={handlePreferencesSet}
      />
    );
  }

  if (error) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color={paperTheme.colors.error}
        />
        <Text style={[styles.errorTitle, dynamicStyles.emptyTitle]}>Something went wrong</Text>
        <Text style={[styles.errorMessage, dynamicStyles.emptyDescription]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={loadInitialData}
          accessibilityRole="button"
          accessibilityLabel="Retry loading news"
        >
          <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Category Filter */}
      <CategoryChips
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
        showAll={true}
      />

      {/* Articles Feed */}
      <FlatList
        key={`feed-${layoutConfig.numColumns}`}
        data={articlesList}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={layoutConfig.numColumns > 1 ? layoutConfig.numColumns : 1}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        columnWrapperStyle={layoutConfig.numColumns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={
          <SearchPromo
            variant="compact"
            style={styles.searchPromo}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
        ListFooterComponent={
          !isAuthenticated && articlesList.length > 0 ? (
            <LoginPromo
              variant="compact"
              articleLimit={GUEST_ARTICLE_LIMIT}
              style={styles.loginPromo}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={64}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text
              style={[styles.emptyTitle, dynamicStyles.emptyTitle]}
              accessibilityRole="header"
            >No articles found</Text>
            <Text style={[styles.emptyDescription, dynamicStyles.emptyDescription]}>
              {selectedCategory
                ? 'No articles in this category. Try selecting a different one.'
                : 'Pull down to refresh and load the latest news.'}
            </Text>
            <Button
              mode="contained"
              onPress={onRefresh}
              style={styles.emptyButton}
              icon="refresh"
            >
              Refresh Feed
            </Button>
          </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  listContent: {
    padding: mukokoTheme.spacing.md,
    // paddingBottom is set dynamically based on layout (tab bar visibility)
  },
  columnWrapper: {
    gap: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
  },
  gridCard: {
    flex: 1,
    marginBottom: 0,
  },

  // Search promo
  searchPromo: {
    marginBottom: mukokoTheme.spacing.md,
  },

  // Login promo
  loginPromo: {
    marginTop: mukokoTheme.spacing.lg,
    marginBottom: mukokoTheme.spacing.xxl,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: mukokoTheme.colors.onSurfaceVariant,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.xxl,
    paddingHorizontal: mukokoTheme.spacing.xl,
    gap: mukokoTheme.spacing.md,
  },
  emptyTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    color: mukokoTheme.colors.onSurface,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: mukokoTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyButton: {
    marginTop: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
  },

  // Centered layout for error/loading states
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error state styles
  errorTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    marginTop: mukokoTheme.spacing.md,
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
