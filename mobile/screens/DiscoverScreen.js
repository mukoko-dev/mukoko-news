import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// View mode options (using chips)
const VIEW_MODES = [
  { key: 'trending', label: 'Trending', icon: 'fire' },
  { key: 'topics', label: 'Topics', icon: 'tag-multiple' },
  { key: 'journalists', label: 'Journalists', icon: 'account-group' },
];

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
 * DiscoverScreen - Browse trending content with chip-based view modes
 * Modes: Trending Articles, Topics/Stories, Journalists
 * Uses masonry layout for visual interest
 */
export default function DiscoverScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

  const [activeMode, setActiveMode] = useState('trending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);

  // Data states
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [journalists, setJournalists] = useState([]);
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
      ]);
    } catch (err) {
      console.error('[Discover] Initial load error:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
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
        setArticles(result.data.articles);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error('[Discover] Load articles error:', err);
      setArticles([]);
    }
  };

  const loadTrendingCategories = async () => {
    try {
      const [categoriesResult, trendingResult] = await Promise.all([
        categoriesAPI.getAll(),
        insightsAPI.getTrendingCategories(12),
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
      const result = await insightsAPI.getTrendingAuthors(20);
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
      if (activeMode === 'trending') {
        await loadTrendingArticles(selectedCategory);
      } else if (activeMode === 'topics') {
        await loadTrendingCategories();
      } else {
        await loadJournalists();
      }
    } catch (err) {
      console.error('[Discover] Refresh error:', err);
      setError('Failed to refresh content. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleModeChange = async (modeKey) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveMode(modeKey);
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

  const handleTopicPress = (category) => {
    setActiveMode('trending');
    setSelectedCategory(category.slug || category.id);
    loadTrendingArticles(category.slug || category.id);
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

  // Calculate dimensions
  const columnCount = getColumnCount(screenWidth);
  const gap = mukokoTheme.spacing.sm;
  const horizontalPadding = mukokoTheme.spacing.md * 2;
  const cardWidth = (screenWidth - horizontalPadding - (gap * (columnCount - 1))) / columnCount;

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
  };

  // Render View Mode Chips
  const renderModeChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.modeChipsContainer}
      contentContainerStyle={styles.modeChipsContent}
    >
      {VIEW_MODES.map((mode) => (
        <Chip
          key={mode.key}
          mode={activeMode === mode.key ? 'flat' : 'outlined'}
          selected={activeMode === mode.key}
          onPress={() => handleModeChange(mode.key)}
          style={[
            styles.modeChip,
            activeMode === mode.key && { backgroundColor: paperTheme.colors.primary },
          ]}
          textStyle={[
            styles.modeChipText,
            activeMode === mode.key && { color: '#FFFFFF' },
          ]}
          icon={() => (
            <Icon
              source={mode.icon}
              size={16}
              color={activeMode === mode.key ? '#FFFFFF' : paperTheme.colors.onSurfaceVariant}
            />
          )}
        >
          {mode.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render Category Filter Chips (for trending mode)
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

  // Render article item for masonry
  const renderArticleItem = useCallback(({ item, columnWidth }) => (
    <ArticleCard
      article={item}
      onPress={() => handleArticlePress(item)}
      width={columnWidth}
      variant="default"
    />
  ), [handleArticlePress]);

  // Render Trending Articles Mode
  const renderTrendingMode = () => (
    <>
      {renderCategoryFilter()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          articles.length === 0 && styles.scrollContentCentered,
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
        {articles.length === 0 ? (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No Articles Found</Text>
            <Text style={[styles.emptyMessage, dynamicStyles.subtitle]}>
              Try selecting a different category or pull down to refresh.
            </Text>
          </View>
        ) : (
          <>
            {/* Masonry Grid */}
            <MasonryGrid
              data={articles}
              renderItem={renderArticleItem}
              keyExtractor={(item) => item.id?.toString()}
              gap={gap}
            />
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </>
  );

  // Render Topics Mode
  const renderTopicsMode = () => (
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
      {/* Trending Topics Header */}
      <View style={styles.sectionHeader}>
        <Icon source="fire" size={20} color={mukokoTheme.colors.accent} />
        <Text style={[styles.sectionTitle, dynamicStyles.title]}>Trending Topics</Text>
      </View>

      {/* Trending Categories - Masonry Grid */}
      <View style={styles.topicsGrid}>
        {trendingCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id || index}
            style={[styles.topicCard, dynamicStyles.card, { width: cardWidth }]}
            onPress={() => handleTopicPress(category)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View ${category.name || category.category_name} articles`}
          >
            <View style={styles.topicHeader}>
              <Text style={styles.topicEmoji}>
                {getEmoji(category.name || category.category_name)}
              </Text>
              {index < 3 && (
                <View style={[styles.trendingBadge, { backgroundColor: mukokoTheme.colors.accent }]}>
                  <Icon source="trending-up" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={[styles.topicName, dynamicStyles.title]} numberOfLines={1}>
              {category.name || category.category_name}
            </Text>
            <Text style={[styles.topicCount, dynamicStyles.subtitle]}>
              {category.article_count || 0} articles
            </Text>
            {category.growth_rate !== undefined && (
              <View style={styles.growthRow}>
                <Icon
                  source={category.growth_rate >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={category.growth_rate >= 0 ? mukokoTheme.colors.zwGreen : mukokoTheme.colors.zwRed}
                />
                <Text
                  style={[
                    styles.growthText,
                    { color: category.growth_rate >= 0 ? mukokoTheme.colors.zwGreen : mukokoTheme.colors.zwRed },
                  ]}
                >
                  {Math.abs(category.growth_rate || 0).toFixed(0)}%
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* All Categories Section */}
      <View style={styles.sectionHeader}>
        <Icon source="folder-multiple" size={20} color={paperTheme.colors.primary} />
        <Text style={[styles.sectionTitle, dynamicStyles.title]}>All Categories</Text>
      </View>

      <View style={styles.allCategoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id || category.slug}
            style={[styles.categoryCard, dynamicStyles.card]}
            onPress={() => handleTopicPress(category)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${category.name}`}
          >
            <Text style={styles.categoryEmoji}>{getEmoji(category.name)}</Text>
            <Text style={[styles.categoryName, dynamicStyles.title]} numberOfLines={1}>
              {category.name}
            </Text>
            {category.count && (
              <Text style={[styles.categoryCount, dynamicStyles.subtitle]}>
                {category.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  // Render Journalists Mode
  const renderJournalistsMode = () => (
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
      {/* Top Journalists Header */}
      <View style={styles.sectionHeader}>
        <Icon source="account-star" size={20} color={paperTheme.colors.primary} />
        <Text style={[styles.sectionTitle, dynamicStyles.title]}>Top Journalists</Text>
      </View>

      {/* Featured Journalists (Top 3) */}
      <View style={styles.featuredJournalists}>
        {journalists.slice(0, 3).map((journalist, index) => (
          <TouchableOpacity
            key={journalist.id || index}
            style={[styles.featuredJournalistCard, dynamicStyles.card]}
            onPress={() => handleJournalistPress(journalist)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View articles by ${journalist.name}`}
          >
            <View style={[
              styles.journalistRankBadge,
              {
                backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
              },
            ]}>
              <Text style={styles.journalistRankText}>{index + 1}</Text>
            </View>
            <View style={[styles.journalistAvatar, { backgroundColor: paperTheme.colors.primaryContainer }]}>
              <Icon source="account" size={32} color={paperTheme.colors.primary} />
            </View>
            <Text style={[styles.featuredJournalistName, dynamicStyles.title]} numberOfLines={2}>
              {journalist.name}
            </Text>
            <Text style={[styles.featuredJournalistStats, dynamicStyles.subtitle]}>
              {journalist.article_count || 0} articles
            </Text>
            {journalist.outlets && journalist.outlets.length > 0 && (
              <Text style={[styles.journalistOutlet, dynamicStyles.subtitle]} numberOfLines={1}>
                {journalist.outlets[0]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* All Journalists List */}
      <View style={styles.sectionHeader}>
        <Icon source="account-group" size={20} color={paperTheme.colors.primary} />
        <Text style={[styles.sectionTitle, dynamicStyles.title]}>All Journalists</Text>
      </View>

      <View style={styles.journalistsList}>
        {journalists.slice(3).map((journalist, index) => (
          <TouchableOpacity
            key={journalist.id || index}
            style={[styles.journalistListItem, dynamicStyles.card]}
            onPress={() => handleJournalistPress(journalist)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View articles by ${journalist.name}`}
          >
            <View style={[styles.listJournalistRank, { backgroundColor: paperTheme.colors.primaryContainer }]}>
              <Text style={[styles.listJournalistRankText, { color: paperTheme.colors.primary }]}>
                {index + 4}
              </Text>
            </View>
            <View style={styles.journalistInfo}>
              <Text style={[styles.journalistName, dynamicStyles.title]} numberOfLines={1}>
                {journalist.name}
              </Text>
              <Text style={[styles.journalistMeta, dynamicStyles.subtitle]} numberOfLines={1}>
                {journalist.article_count || 0} articles
                {journalist.outlets && journalist.outlets.length > 0 && ` • ${journalist.outlets[0]}`}
              </Text>
            </View>
            <Icon source="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.subtitle]}>Discovering content...</Text>
      </View>
    );
  }

  if (error) {
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

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {renderModeChips()}
      {activeMode === 'trending' && renderTrendingMode()}
      {activeMode === 'topics' && renderTopicsMode()}
      {activeMode === 'journalists' && renderJournalistsMode()}
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

  // Mode Chips (replaces tabs)
  modeChipsContainer: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modeChipsContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  modeChip: {
    marginRight: mukokoTheme.spacing.xs,
  },
  modeChipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
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
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingTop: mukokoTheme.spacing.md,
    flexGrow: 1,
  },
  scrollContentCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
    marginTop: mukokoTheme.spacing.md,
  },
  sectionTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 18,
  },

  // Topics Grid (masonry-like)
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  topicCard: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    minHeight: 120,
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
  trendingBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: mukokoTheme.spacing.xs,
  },
  growthText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // All Categories Grid
  allCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    gap: mukokoTheme.spacing.sm,
    minHeight: 44,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  categoryCount: {
    fontSize: 12,
    marginLeft: 'auto',
  },

  // Featured Journalists
  featuredJournalists: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  featuredJournalistCard: {
    flex: 1,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  journalistRankBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  journalistRankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  journalistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.sm,
  },
  featuredJournalistName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.xs,
  },
  featuredJournalistStats: {
    fontSize: 11,
    textAlign: 'center',
  },
  journalistOutlet: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  // Journalists List
  journalistsList: {
    gap: mukokoTheme.spacing.sm,
  },
  journalistListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    gap: mukokoTheme.spacing.md,
    minHeight: 56,
  },
  listJournalistRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listJournalistRankText: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  journalistInfo: {
    flex: 1,
  },
  journalistName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  journalistMeta: {
    fontSize: 12,
    marginTop: 2,
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
