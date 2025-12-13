/**
 * HomeScreen - Main news feed
 * Displays articles in a clean, scannable layout following 2025 news app patterns
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Button,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { articles, categories as categoriesAPI } from '../api/client';
import mukokoTheme from '../theme';
import ArticleCard from '../components/ArticleCard';
import CategoryChips from '../components/CategoryChips';
import SearchPromo from '../components/SearchPromo';
import LoginPromo from '../components/LoginPromo';
import { useAuth } from '../contexts/AuthContext';

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
  const paperTheme = usePaperTheme();
  const { isAuthenticated } = useAuth();

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

  useEffect(() => {
    loadInitialData();
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

    // Load categories
    const { data: categoriesData } = await categoriesAPI.getAll();
    if (categoriesData?.categories) {
      setCategoriesList(categoriesData.categories);
    }

    // Load articles
    await loadArticles();

    setLoading(false);
  };

  const loadArticles = async (category = null) => {
    let data, error;

    // Use personalized feed for authenticated users (no category filter)
    // Fall back to regular feed for guests or when filtering by category
    if (isAuthenticated && !category) {
      const result = await articles.getPersonalizedFeed({
        limit: 30,
        offset: 0,
        excludeRead: true,
        diversity: 0.3,
      });
      data = result.data;
      error = result.error;
    } else {
      const result = await articles.getFeed({
        limit: 30,
        offset: 0,
        category,
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArticles(selectedCategory);
    setRefreshing(false);
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

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading news...</Text>
        </View>
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
        contentContainerStyle={styles.listContent}
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
              articleLimit={20}
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
            <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No articles found</Text>
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
    paddingBottom: 100, // Space for tab bar
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
});
