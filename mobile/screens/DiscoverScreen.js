import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import CategoryChips from '../components/CategoryChips';
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
 * Memoized Article Card to prevent re-renders
 */
const ArticleCard = memo(({ article, onPress, cardWidth, variant }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => setImageError(true), []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Featured card (large, full width)
  if (variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(article)}
        style={styles.featuredCard}
      >
        <View style={styles.featuredImageContainer}>
          {article.image_url && !imageError ? (
            <Image
              source={{ uri: article.image_url }}
              style={styles.featuredImage}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              fadeDuration={0}
            />
          ) : (
            <View style={[styles.featuredImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>📰</Text>
            </View>
          )}
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>🔥 TRENDING</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={3}>
              {article.title}
            </Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.featuredSource}>{article.source || 'News'}</Text>
              <Text style={styles.featuredDot}>•</Text>
              <Text style={styles.featuredDate}>{formatDate(article.published_at)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid card (standard)
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(article)}
      style={[styles.gridCard, { width: cardWidth }]}
    >
      <Surface style={styles.cardSurface} elevation={1}>
        <View style={styles.cardImageWrapper}>
          {article.image_url && !imageError ? (
            <Image
              source={{ uri: article.image_url }}
              style={styles.cardImage}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              fadeDuration={0}
            />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>📰</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardSource}>{article.source || 'News'}</Text>
          <Text style={styles.cardTitle} numberOfLines={3}>
            {article.title}
          </Text>
          <Text style={styles.cardDate}>{formatDate(article.published_at)}</Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => prevProps.article.id === nextProps.article.id);

/**
 * DiscoverScreen - Trending and featured content
 * Clean, modern design without duplicate headers
 */
export default function DiscoverScreen({ navigation }) {
  const { isAuthenticated } = useAuth();

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
      const result = await articlesAPI.getFeed({
        limit: 30,
        offset: 0,
        category: category || undefined,
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

  return (
    <View style={styles.container}>
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
          <ActivityIndicator size="large" color={mukokoTheme.colors.primary} />
          <Text style={styles.loadingText}>Discovering trending news...</Text>
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
              colors={[mukokoTheme.colors.primary]}
              tintColor={mukokoTheme.colors.primary}
            />
          }
        >
          {/* Featured Article */}
          {featuredArticle && (
            <ArticleCard
              article={featuredArticle}
              onPress={handleArticlePress}
              variant="featured"
            />
          )}

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${selectedCategory}` : 'Latest Stories'}
            </Text>
          </View>

          {/* Grid Articles */}
          <View style={styles.grid}>
            {gridArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onPress={handleArticlePress}
                cardWidth={cardWidth}
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
          <Text style={styles.emptyTitle}>No Articles Found</Text>
          <Text style={styles.emptyMessage}>
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

  // Featured Card
  featuredCard: {
    marginBottom: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    height: 220,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: mukokoTheme.spacing.md,
  },
  featuredBadge: {
    backgroundColor: mukokoTheme.colors.accent,
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: mukokoTheme.spacing.sm,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onAccent,
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: '#FFFFFF',
    marginBottom: mukokoTheme.spacing.sm,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredSource: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  featuredDot: {
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: mukokoTheme.spacing.xs,
  },
  featuredDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
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
  cardSurface: {
    borderRadius: mukokoTheme.roundness - 8,
    backgroundColor: mukokoTheme.colors.surface,
    overflow: 'hidden',
  },
  cardImageWrapper: {
    height: 120,
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: mukokoTheme.spacing.sm,
  },
  cardSource: {
    fontSize: 11,
    color: mukokoTheme.colors.primary,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 14,
    lineHeight: 18,
    color: mukokoTheme.colors.onSurface,
    marginBottom: mukokoTheme.spacing.xs,
  },
  cardDate: {
    fontSize: 11,
    color: mukokoTheme.colors.onSurfaceVariant,
  },

  // Placeholders
  imagePlaceholder: {
    backgroundColor: mukokoTheme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.5,
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
