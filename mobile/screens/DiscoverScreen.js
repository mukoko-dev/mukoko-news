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
  Icon,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import ArticleCard from '../components/ArticleCard';
import CategoryChips from '../components/CategoryChips';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout';
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

/**
 * DiscoverScreen - Mobile-first content discovery
 *
 * UX Principles:
 * - Content visible immediately (no banners/heroes blocking)
 * - Single continuous scroll
 * - Category filtering at top (compact)
 * - Articles flow naturally
 * - Trending topics inline with content
 */
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
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
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
        loadArticles(),
        loadCategories(),
      ]);
    } catch (err) {
      console.error('[Discover] Initial load error:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (category = null) => {
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

      setArticles(result.data?.articles || []);
    } catch (err) {
      console.error('[Discover] Load articles error:', err);
      setArticles([]);
    }
  };

  const loadCategories = async () => {
    try {
      const [categoriesResult, trendingResult] = await Promise.all([
        categoriesAPI.getAll(),
        insightsAPI.getTrendingCategories(6),
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

    if (!categorySlug || selectedCategory === categorySlug) {
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

  // Calculate card width for 2-column grid
  const gap = mukokoTheme.spacing.sm;
  const padding = mukokoTheme.spacing.md;
  const cardWidth = (screenWidth - padding * 2 - gap) / 2;

  // Dynamic styles
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    title: {
      color: paperTheme.colors.onSurface,
    },
    subtitle: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    card: {
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    },
  };

  // Render inline trending topic card (inserted between articles)
  const renderTrendingTopicInline = (category, index) => (
    <TouchableOpacity
      key={`topic-${category.id || index}`}
      style={[styles.inlineTopicCard, dynamicStyles.card, { width: cardWidth }]}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <Text style={styles.topicEmoji}>{getEmoji(category.name || category.category_name)}</Text>
      <Text style={[styles.topicName, dynamicStyles.title]} numberOfLines={1}>
        {category.name || category.category_name}
      </Text>
      <View style={styles.topicMeta}>
        <Text style={[styles.topicCount, dynamicStyles.subtitle]}>
          {category.article_count || 0}
        </Text>
        {category.growth_rate > 0 && (
          <View style={[styles.growthBadge, { backgroundColor: mukokoTheme.colors.success + '20' }]}>
            <Icon source="trending-up" size={10} color={mukokoTheme.colors.success} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Build mixed content: articles with inline topic cards
  const buildMixedContent = () => {
    const content = [];
    let topicIndex = 0;

    articles.forEach((article, index) => {
      // Add article
      content.push(
        <View key={`article-${article.id}`} style={[styles.gridItem, { width: cardWidth }]}>
          <ArticleCard
            article={article}
            onPress={() => handleArticlePress(article)}
            width={cardWidth}
            variant="compact"
          />
        </View>
      );

      // Insert a trending topic card after every 4 articles (if available)
      if ((index + 1) % 4 === 0 && topicIndex < trendingCategories.length && !selectedCategory) {
        content.push(renderTrendingTopicInline(trendingCategories[topicIndex], topicIndex));
        topicIndex++;
      }
    });

    return content;
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Compact category filter - uses shared CategoryChips for consistency */}
      <CategoryChips
        categories={categories.slice(0, 12)}
        selectedCategory={selectedCategory}
        onCategoryPress={(categorySlug) => {
          // Find the category object or use null for "All"
          if (categorySlug === null || categorySlug === 'all') {
            handleCategoryPress(null);
          } else {
            const category = categories.find(c => c.slug === categorySlug || c.id === categorySlug);
            handleCategoryPress(category || { slug: categorySlug });
          }
        }}
        showAll={true}
        showCounts={true}
        showEmojis={true}
        style={styles.categoryBar}
      />

      {/* Content grid */}
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
        {articles.length > 0 ? (
          <View style={styles.grid}>
            {buildMixedContent()}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📰</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No stories yet</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.subtitle]}>
              {selectedCategory ? 'Try another category' : 'Pull to refresh'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: paperTheme.colors.primary }]}
                onPress={() => handleCategoryPress(null)}
              >
                <Text style={{ color: paperTheme.colors.primary }}>Show all</Text>
              </TouchableOpacity>
            )}
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
  },

  // Category bar - compact, always visible
  categoryBar: {
    maxHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoryBarContent: {
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs,
    alignItems: 'center',
  },
  categoryChip: {
    marginHorizontal: 3,
    height: 32,
  },
  categoryChipText: {
    fontSize: 12,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  chipEmoji: {
    fontSize: 12,
  },

  // Content scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: mukokoTheme.spacing.md,
    paddingTop: mukokoTheme.spacing.sm,
  },

  // Grid layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  gridItem: {
    marginBottom: 0,
  },

  // Inline topic card (mixed with articles)
  inlineTopicCard: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  topicEmoji: {
    fontSize: 28,
    marginBottom: mukokoTheme.spacing.xs,
  },
  topicName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  topicCount: {
    fontSize: 11,
  },
  growthBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: mukokoTheme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: mukokoTheme.spacing.md,
  },
  clearButton: {
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },

  // Bottom padding for tab bar
  bottomPadding: {
    height: 100,
  },
});
