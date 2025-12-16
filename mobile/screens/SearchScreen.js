import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  ActivityIndicator,
  Surface,
  Icon,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import CategoryChips from '../components/CategoryChips';
import {
  search as searchAPI,
  categories as categoriesAPI,
  insights as insightsAPI,
} from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category emojis
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

const getEmoji = (name) => CATEGORY_EMOJIS[(name || '').toLowerCase()] || '📰';

/**
 * Memoized Search Result Card
 */
const SearchResultCard = memo(({ article, onPress, paperTheme }) => {
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
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(article)}
      style={styles.resultCard}
    >
      <Surface style={[styles.card, { backgroundColor: paperTheme.colors.surface }]} elevation={1}>
        <View style={styles.cardRow}>
          {hasImage && (
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: article.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            </View>
          )}
          <View style={[styles.cardContent, !hasImage && styles.cardContentNoImage]}>
            <Text style={[styles.cardSource, { color: paperTheme.colors.primary }]}>
              {article.source || 'News'}
            </Text>
            <Text style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]} numberOfLines={2}>
              {article.title}
            </Text>
            <Text style={[styles.cardDate, { color: paperTheme.colors.onSurfaceVariant }]}>
              {formatDate(article.published_at)}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => prevProps.article.id === nextProps.article.id);

/**
 * SearchScreen - Search + Insights combined
 * When empty: shows insights (stats, trending, journalists)
 * When searching: shows search results
 */
export default function SearchScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();

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

  // Handle incoming search query from route params
  useEffect(() => {
    if (route?.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      performSearch(route.params.searchQuery);
    }
  }, [route?.params?.searchQuery]);

  useEffect(() => {
    loadInsightsData();
    // Cleanup debounce timer on unmount
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
        setCategories(results[0].value.data.categories);
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
      console.error('[Search] Load insights error:', err);
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
      console.error('[Search] Search error:', err);
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

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery, selectedCategory);
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

  const handleTopicPress = (topic) => {
    const query = topic.name || topic.category_name;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleAuthorPress = (author) => {
    setSearchQuery(author.name);
    performSearch(author.name);
  };

  // Colors
  const colors = {
    bg: paperTheme.colors.background,
    surface: paperTheme.colors.surface,
    text: paperTheme.colors.onSurface,
    textMuted: paperTheme.colors.onSurfaceVariant,
    primary: paperTheme.colors.primary,
    border: paperTheme.colors.outline,
    card: paperTheme.colors.glassCard || paperTheme.colors.surface,
    cardBorder: paperTheme.colors.glassBorder || paperTheme.colors.outline,
  };

  // Card width for 2-column grid
  const cardWidth = (SCREEN_WIDTH - mukokoTheme.spacing.md * 2 - mukokoTheme.spacing.sm) / 2;

  const isSearchMode = activeQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Search Bar - Always visible */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Searchbar
          placeholder="Search Zimbabwe news..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          style={[styles.searchbar, { backgroundColor: paperTheme.colors.surfaceVariant }]}
          inputStyle={styles.searchInput}
          iconColor={colors.primary}
          loading={loading}
          onClearIconPress={handleClearSearch}
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

      {/* Results Info - Search mode */}
      {isSearchMode && !loading && (
        <View style={[styles.resultsInfo, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.resultsInfoText, { color: colors.textMuted }]}>
            {total} result{total !== 1 ? 's' : ''} for "{activeQuery}"
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: paperTheme.colors.errorContainer }]}>
          <Icon source="alert-circle" size={16} color={paperTheme.colors.error} />
          <Text style={{ color: paperTheme.colors.error, flex: 1 }}>{error}</Text>
        </View>
      )}

      {/* Loading - Search mode */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Searching...</Text>
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
              paperTheme={paperTheme}
            />
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* No Results - Search mode */}
      {isSearchMode && !loading && results.length === 0 && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No results</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Try a different search term
          </Text>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.primary }]}
            onPress={handleClearSearch}
          >
            <Text style={{ color: colors.primary }}>Clear search</Text>
          </TouchableOpacity>
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
              {/* Stats Row */}
              {stats && (
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {(stats.total_articles || 0).toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Articles</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {stats.active_sources || 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sources</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {stats.categories || 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Topics</Text>
                  </View>
                </View>
              )}

              {/* Trending Topics */}
              {trending.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                    🔥 Trending Now
                  </Text>
                  <View style={styles.topicsGrid}>
                    {trending.map((topic, i) => (
                      <TouchableOpacity
                        key={topic.id || i}
                        style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, width: cardWidth }]}
                        onPress={() => handleTopicPress(topic)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.topicRow}>
                          <Text style={styles.topicEmoji}>{getEmoji(topic.name || topic.category_name)}</Text>
                          {i < 3 && (
                            <View style={[styles.hotBadge, { backgroundColor: mukokoTheme.colors.accent }]}>
                              <Text style={styles.hotBadgeText}>{i + 1}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.topicName, { color: colors.text }]} numberOfLines={1}>
                          {topic.name || topic.category_name}
                        </Text>
                        <Text style={[styles.topicCount, { color: colors.textMuted }]}>
                          {topic.article_count || 0} articles
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Top Journalists */}
              {authors.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                    ✍️ Top Journalists
                  </Text>
                  <View style={styles.authorsList}>
                    {authors.map((author, i) => (
                      <TouchableOpacity
                        key={author.id || i}
                        style={[styles.authorRow, { borderBottomColor: colors.border }]}
                        onPress={() => handleAuthorPress(author)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.rank,
                          { backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.card }
                        ]}>
                          <Text style={[styles.rankText, { color: i < 3 ? '#FFF' : colors.text }]}>{i + 1}</Text>
                        </View>
                        <View style={styles.authorInfo}>
                          <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                            {author.name}
                          </Text>
                          <Text style={[styles.authorMeta, { color: colors.textMuted }]}>
                            {author.article_count || 0} articles
                          </Text>
                        </View>
                        <Icon source="chevron-right" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* No Data */}
              {!stats && trending.length === 0 && authors.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Search Zimbabwe News</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                    Find articles from trusted sources
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Search Bar
  searchContainer: {
    padding: mukokoTheme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchbar: {
    borderRadius: mukokoTheme.roundness,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },

  // Results Info
  resultsInfo: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultsInfoText: {
    fontSize: 13,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    margin: mukokoTheme.spacing.md,
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xxl,
  },
  loadingText: {
    fontSize: 14,
  },

  // Results
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    padding: mukokoTheme.spacing.md,
  },
  resultCard: {
    marginBottom: mukokoTheme.spacing.sm,
  },
  card: {
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    padding: mukokoTheme.spacing.sm,
  },
  cardImageContainer: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    marginLeft: mukokoTheme.spacing.sm,
    justifyContent: 'center',
  },
  cardContentNoImage: {
    marginLeft: 0,
  },
  cardSource: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 10,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.xxl,
    paddingHorizontal: mukokoTheme.spacing.xl,
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
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  clearButton: {
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },

  // Insights Content
  insightsContent: {
    padding: mukokoTheme.spacing.md,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },

  // Section Labels
  sectionLabel: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: mukokoTheme.spacing.sm,
    marginTop: mukokoTheme.spacing.sm,
  },

  // Topics Grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  topicCard: {
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  topicEmoji: {
    fontSize: 22,
  },
  hotBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  topicName: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 2,
  },
  topicCount: {
    fontSize: 10,
  },

  // Authors List
  authorsList: {
    marginBottom: mukokoTheme.spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rank: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: mukokoTheme.spacing.sm,
  },
  rankText: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  authorMeta: {
    fontSize: 10,
    marginTop: 1,
  },

  // Bottom padding
  bottomPadding: {
    height: 100,
  },
});
