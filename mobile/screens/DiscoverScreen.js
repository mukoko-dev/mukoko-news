import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import CategoryChips from '../components/CategoryChips';
import ArticleCard from '../components/ArticleCard';
import { useAuth } from '../contexts/AuthContext';
import { articles as articlesAPI, categories as categoriesAPI } from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive column calculation
const getColumnCount = (screenWidth) => {
  if (screenWidth >= 1200) return 4;
  if (screenWidth >= 900) return 3;
  if (screenWidth >= 600) return 2;
  return 2;
};

/**
 * DiscoverScreen - Trending and featured content
 * Clean, modern design without duplicate headers
 */
export default function DiscoverScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);

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
    await Promise.all([loadCategories(), loadArticles()]);
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const result = await categoriesAPI.getAll();
      if (result.data?.categories) {
        setCategories(result.data.categories);
      }
    } catch (err) {
      console.error('[Discover] Load categories error:', err);
    }
  };

  const loadArticles = async (category = null) => {
    try {
      // Fetch trending articles for the featured section
      // Use 'trending' sort to get articles with highest engagement in last 7 days
      const result = await articlesAPI.getFeed({
        limit: 30,
        offset: 0,
        category: category || undefined,
        sort: 'trending', // Get trending articles instead of just latest
      });

      if (result.data?.articles) {
        setArticles(result.data.articles);
      }
    } catch (err) {
      console.error('[Discover] Load articles error:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArticles(selectedCategory);
    setRefreshing(false);
  };

  const handleCategoryPress = async (categorySlug) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (selectedCategory === categorySlug) {
      setSelectedCategory(null);
      await loadArticles(null);
    } else {
      setSelectedCategory(categorySlug);
      await loadArticles(categorySlug);
    }
  };

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      source: article.source_id || article.source,
      slug: article.slug,
    });
  }, [navigation]);

  // Calculate card width based on columns
  const columnCount = getColumnCount(screenWidth);
  const cardGap = mukokoTheme.spacing.sm;
  const horizontalPadding = mukokoTheme.spacing.md * 2;
  const cardWidth = (screenWidth - horizontalPadding - (cardGap * (columnCount - 1))) / columnCount;

  // Featured article is first one
  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    loadingText: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    sectionTitle: {
      color: paperTheme.colors.onSurface,
    },
    emptyTitle: {
      color: paperTheme.colors.onSurface,
    },
    emptyMessage: {
      color: paperTheme.colors.onSurfaceVariant,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Category Filter Bar */}
      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
        showAll={true}
        showEmojis={true}
      />

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Discovering trending news...</Text>
        </View>
      )}

      {/* Content */}
      {!loading && articles.length > 0 && (
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
          {/* Featured Article */}
          {featuredArticle && (
            <ArticleCard
              article={featuredArticle}
              onPress={() => handleArticlePress(featuredArticle)}
              variant="featured"
            />
          )}

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              {selectedCategory ? `${selectedCategory}` : 'Latest Stories'}
            </Text>
          </View>

          {/* Grid Articles */}
          <View style={styles.grid}>
            {gridArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onPress={() => handleArticlePress(article)}
                width={cardWidth}
                variant="default"
                style={styles.gridCard}
              />
            ))}
          </View>

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No Articles Found</Text>
          <Text style={[styles.emptyMessage, dynamicStyles.emptyMessage]}>
            Try selecting a different category or pull to refresh.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingTop: mukokoTheme.spacing.md,
  },

  // Section Header
  sectionHeader: {
    marginBottom: mukokoTheme.spacing.md,
  },
  sectionTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 18,
    color: mukokoTheme.colors.onSurface,
    textTransform: 'capitalize',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  gridCard: {
    marginBottom: mukokoTheme.spacing.sm,
  },

  // Loading
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

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
    color: mukokoTheme.colors.onSurface,
    textAlign: 'center',
  },
  emptyMessage: {
    color: mukokoTheme.colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
  },

  // Bottom padding for floating tab bar
  bottomPadding: {
    height: 100,
  },
});
