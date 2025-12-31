/**
 * SearchScreen - Premium AI-Enhanced Search Experience
 *
 * Purpose: Find + Insights (AI-enhanced search)
 * Design: Apple News + The Athletic inspired
 *
 * Features:
 * - Premium search bar with AI indicator
 * - AI-powered suggestions when empty
 * - Trending searches with rank badges
 * - Top authors with avatars
 * - Platform stats display
 * - Subtle AI indicators throughout
 *
 * UX Principles:
 * - Search bar is THE primary focus (lives here, not elsewhere)
 * - AI enhances but doesn't overwhelm
 * - Clean, premium feel
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  ScrollView,
  Image,
  Platform,
  RefreshControl,
  Dimensions,
  Pressable,
  Text as RNText,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Loader2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, layout as layoutConstants, radius } from '../constants/design-tokens';
import { useLayout } from '../components/layout';
import CategoryChips from '../components/CategoryChips';
import { CuratedLabel, AISparkleIcon, AIShimmerEffect } from '../components/ai';
import { EnhancedSearchBar, TrendingSearches, AuthorResultCard } from '../components/search';
import { FilterChip } from '../components/ui';
import {
  search as searchAPI,
  categories as categoriesAPI,
  insights as insightsAPI,
} from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Memoized Search Result Card
 */
const SearchResultCard = memo(({ article, onPress, theme }) => {
  const [imageError, setImageError] = useState(false);

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

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const hasImage = article.image_url && !imageError;

  return (
    <Pressable
      onPress={() => onPress(article)}
      className="mb-md"
    >
      <View
        className="rounded-card border overflow-hidden"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        }}
      >
        <View className="flex-row p-md gap-md">
          {hasImage && (
            <View className="w-20 h-20 rounded-lg overflow-hidden">
              <Image
                source={{ uri: article.image_url }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            </View>
          )}
          <View className={`flex-1 ${!hasImage ? 'pr-0' : ''}`}>
            <RNText className="font-sans-bold text-label-large mb-xs" style={{ color: theme.colors.primary }}>
              {article.source || 'News'}
            </RNText>
            <RNText className="font-serif-bold text-body-large leading-5 mb-xs" style={{ color: theme.colors['on-surface'] }} numberOfLines={2}>
              {article.title}
            </RNText>
            <RNText className="font-sans text-label-small" style={{ color: theme.colors['on-surface-variant'] }}>
              {formatDate(article.published_at)}
            </RNText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => prevProps.article.id === nextProps.article.id);

/**
 * SearchScreen - Search + Insights combined
 */
export default function SearchScreen({ navigation, route }) {
  const { theme } = useTheme();
  const layout = useLayout();

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? layoutConstants.bottomPaddingMobile : layoutConstants.bottomPaddingDesktop;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Insights state
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Handle incoming search query from route params
  useEffect(() => {
    if (route?.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      performSearch(route.params.searchQuery);
    }
  }, [route?.params?.searchQuery]);

  useEffect(() => {
    loadInsightsData();
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const loadInsightsData = async () => {
    setInsightsLoading(true);
    try {
      const results = await Promise.allSettled([
        categoriesAPI.getAll(),
        insightsAPI.getStats(),
        insightsAPI.getTrendingCategories(8),
        insightsAPI.getTrendingAuthors(5),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.data?.categories) {
        const filteredCategories = results[0].value.data.categories.filter(
          cat => cat.id !== 'all' && cat.slug !== 'all'
        );
        setCategories(filteredCategories);

        // Create AI suggestions from top categories
        const topCategories = filteredCategories.slice(0, 4);
        setSuggestions(topCategories.map(c => c.name || c.slug));
      }

      if (results[1].status === 'fulfilled' && results[1].value.data?.database) {
        setStats(results[1].value.data.database);
      }

      if (results[2].status === 'fulfilled' && results[2].value.data?.trending) {
        setTrending(results[2].value.data.trending);
      }

      if (results[3].status === 'fulfilled' && results[3].value.data?.trending_authors) {
        setAuthors(results[3].value.data.trending_authors);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[Search] Load insights error:', err);
      }
    } finally {
      setInsightsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInsightsData();
    setRefreshing(false);
  }, []);

  const performSearch = async (query, category = null) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setTotal(0);
      setActiveQuery('');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setActiveQuery(query);

      const result = await searchAPI.query(query, { category, limit: 50 });

      if (result.error) {
        setError(result.error);
        setResults([]);
        setTotal(0);
      } else if (result.data) {
        setResults(result.data.results || []);
        setTotal(result.data.total || 0);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[Search] Search error:', err);
      }
      setError('Search failed. Please try again.');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      if (text.trim().length > 0) {
        performSearch(text, selectedCategory);
      } else {
        setResults([]);
        setTotal(0);
        setActiveQuery('');
      }
    }, 500);

    setDebounceTimer(timer);
  };

  const handleSearchSubmit = (query) => {
    if (query && query.trim().length > 0) {
      performSearch(query, selectedCategory);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setResults([]);
    setTotal(0);
    setSelectedCategory(null);
  };

  const handleCategoryPress = async (categorySlug) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (selectedCategory === categorySlug) {
      setSelectedCategory(null);
      if (activeQuery) await performSearch(activeQuery, null);
    } else {
      setSelectedCategory(categorySlug);
      if (activeQuery) await performSearch(activeQuery, categorySlug);
    }
  };

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      source: article.source_id || article.source,
      slug: article.slug,
    });
  }, [navigation]);

  const handleSuggestionPress = async (suggestion) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };

  const handleTrendingPress = (topic) => {
    const query = topic.name || topic.category_name || topic.query;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleAuthorPress = (author) => {
    setSearchQuery(author.name);
    performSearch(author.name);
  };

  // Colors
  const colors = {
    bg: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors['on-surface'],
    textMuted: theme.colors['on-surface-variant'],
    primary: theme.colors.primary,
    border: theme.colors.outline,
    card: theme.colors.surface,
    cardBorder: theme.colors.outline,
  };

  const isSearchMode = activeQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Premium Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <EnhancedSearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Search African news..."
          loading={loading}
          showAIIndicator={true}
        />
      </View>

      {/* Category Filter - Only in search mode */}
      {isSearchMode && categories.length > 0 && (
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryPress={handleCategoryPress}
          showAll={true}
          showEmojis={true}
        />
      )}

      {/* AI Results Info - Search mode */}
      {isSearchMode && !loading && (
        <AIShimmerEffect enabled={results.length > 0}>
          <View style={[styles.resultsInfo, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.resultsRow}>
              <AISparkleIcon size={14} animated={false} />
              <RNText style={[styles.resultsInfoText, { color: colors.textMuted }]}>
                AI found {total} result{total !== 1 ? 's' : ''}
              </RNText>
            </View>
            <RNText style={[styles.resultsSubtext, { color: colors.textMuted }]}>
              Most relevant first
            </RNText>
          </View>
        </AIShimmerEffect>
      )}

      {/* Error State */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors['error-container'] }]}>
          <AlertCircle size={16} color={theme.colors.error} />
          <RNText style={{ color: theme.colors.error, flex: 1 }}>{error}</RNText>
        </View>
      )}

      {/* Loading - Search mode */}
      {loading && (
        <View className="flex-1 justify-center items-center gap-md py-xl">
          <Loader2 size={48} color={colors.primary} className="animate-spin" />
          <RNText className="font-sans-medium text-body-medium" style={{ color: colors.textMuted }}>
            Searching with AI...
          </RNText>
        </View>
      )}

      {/* Search Results */}
      {isSearchMode && !loading && results.length > 0 && (
        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          {results.map((article) => (
            <SearchResultCard
              key={article.id}
              article={article}
              onPress={handleArticlePress}
              theme={theme}
            />
          ))}
          <View style={{ height: bottomPadding }} />
        </ScrollView>
      )}

      {/* No Results - Search mode */}
      {isSearchMode && !loading && results.length === 0 && !error && (
        <View className="flex-1 justify-center items-center px-xl gap-md">
          <RNText className="text-[64px] opacity-50">📭</RNText>
          <RNText className="font-serif-bold text-headline-medium text-center" style={{ color: colors.text }}>
            No results found
          </RNText>
          <RNText className="font-sans text-body-medium text-center" style={{ color: colors.textMuted }}>
            Try a different search term or category
          </RNText>
          <Pressable
            className="py-sm px-lg rounded-button border"
            style={{ borderColor: colors.primary }}
            onPress={handleClearSearch}
          >
            <RNText className="font-sans-medium text-label-large" style={{ color: colors.primary }}>
              Clear search
            </RNText>
          </Pressable>
        </View>
      )}

      {/* Insights Content - When not searching */}
      {!isSearchMode && !loading && (
        <ScrollView
          contentContainerStyle={styles.insightsContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {insightsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsSection}>
                  <View style={styles.sectionHeader}>
                    <AISparkleIcon size={14} />
                    <RNText style={[styles.sectionLabel, { color: colors.text }]}>
                      AI-POWERED SUGGESTIONS
                    </RNText>
                  </View>
                  <RNText style={[styles.suggestionsSubtext, { color: colors.textMuted }]}>
                    Based on trending topics
                  </RNText>
                  <View style={styles.suggestionsRow}>
                    {suggestions.map((suggestion, i) => (
                      <FilterChip
                        key={i}
                        selected={false}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        {suggestion}
                      </FilterChip>
                    ))}
                  </View>
                </View>
              )}

              {/* Trending Searches */}
              {trending.length > 0 && (
                <TrendingSearches
                  searches={trending}
                  onSearchPress={handleTrendingPress}
                  title="TRENDING SEARCHES"
                  showAILabel={true}
                  maxItems={6}
                />
              )}

              {/* Top Authors */}
              {authors.length > 0 && (
                <View style={styles.authorsSection}>
                  <View style={styles.sectionHeader}>
                    <RNText style={[styles.sectionLabel, { color: colors.text }]}>
                      TOP AUTHORS
                    </RNText>
                    <CuratedLabel variant="popular" size="small" showIcon={false} />
                  </View>
                  <View
                    style={[
                      styles.authorsList,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {authors.map((author, i) => (
                      <AuthorResultCard
                        key={author.id || i}
                        author={author}
                        rank={i + 1}
                        onPress={() => handleAuthorPress(author)}
                        variant="list"
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Platform Stats */}
              {stats && (
                <View style={styles.statsSection}>
                  <RNText style={[styles.sectionLabel, { color: colors.text }]}>
                    PLATFORM STATS
                  </RNText>
                  <View
                    style={[
                      styles.statsCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.statsRow}>
                      <View style={styles.stat}>
                        <RNText style={[styles.statEmoji]}>📰</RNText>
                        <RNText style={[styles.statValue, { color: colors.primary }]}>
                          {(stats.total_articles || 0).toLocaleString()}
                        </RNText>
                        <RNText style={[styles.statLabel, { color: colors.textMuted }]}>Articles</RNText>
                      </View>
                      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                      <View style={styles.stat}>
                        <RNText style={[styles.statEmoji]}>📡</RNText>
                        <RNText style={[styles.statValue, { color: colors.primary }]}>
                          {stats.active_sources || 0}
                        </RNText>
                        <RNText style={[styles.statLabel, { color: colors.textMuted }]}>Sources</RNText>
                      </View>
                      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                      <View style={styles.stat}>
                        <RNText style={[styles.statEmoji]}>🗂️</RNText>
                        <RNText style={[styles.statValue, { color: colors.primary }]}>
                          {stats.categories || 0}
                        </RNText>
                        <RNText style={[styles.statLabel, { color: colors.textMuted }]}>Topics</RNText>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* No Data */}
              {!stats && trending.length === 0 && authors.length === 0 && (
                <View style={styles.emptyState}>
                  <RNText style={styles.emptyEmoji}>🔍</RNText>
                  <RNText style={[styles.emptyTitle, { color: colors.text }]}>Search African News</RNText>
                  <RNText style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                    Find articles from trusted sources across Africa
                  </RNText>
                </View>
              )}
            </>
          )}

          <View style={{ height: bottomPadding }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Search Bar Container
  searchContainer: {
    padding: spacing.md,
  },

  // Results Info
  resultsInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resultsInfoText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  resultsSubtext: {
    fontSize: 11,
    marginTop: 2,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.button,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },

  // Results
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    padding: spacing.md,
  },
  resultCard: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radius.button,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    padding: spacing.sm,
  },
  cardImageContainer: {
    width: layoutConstants.cardImageWidth,
    height: layoutConstants.cardImageHeight,
    borderRadius: layoutConstants.cardImageRadius,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  cardContentNoImage: {
    marginLeft: 0,
  },
  cardSource: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: 'NotoSerif-Bold',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: layoutConstants.emojiLarge,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'NotoSerif-Bold',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  clearButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    borderWidth: 1,
  },

  // Insights Content
  insightsContent: {
    padding: spacing.md,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // AI Suggestions
  suggestionsSection: {
    marginBottom: spacing.lg,
  },
  suggestionsSubtext: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    borderRadius: radius.modal,
  },
  suggestionText: {
    fontSize: 12,
  },

  // Authors Section
  authorsSection: {
    marginBottom: spacing.lg,
  },
  authorsList: {
    borderRadius: radius.button,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing.lg,
  },
  statsCard: {
    borderRadius: radius.button,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: layoutConstants.emojiSmall,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'NotoSerif-Bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: layoutConstants.dividerWidth,
    height: layoutConstants.touchTargetCompact,
  },
});
