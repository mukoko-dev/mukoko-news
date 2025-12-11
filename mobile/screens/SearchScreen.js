import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Button,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import CategoryChips from '../components/CategoryChips';
import { useAuth } from '../contexts/AuthContext';
import { articles as articlesAPI, categories as categoriesAPI } from '../api/client';

/**
 * Memoized Search Result Card
 */
const SearchResultCard = memo(({ article, onPress }) => {
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

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(article)}
      style={styles.resultCard}
    >
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardRow}>
          {/* Image */}
          <View style={styles.cardImageContainer}>
            {article.image_url && !imageError ? (
              <Image
                source={{ uri: article.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
                fadeDuration={0}
              />
            ) : (
              <View style={[styles.cardImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>📰</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardSource}>{article.source || 'News'}</Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {article.title}
            </Text>
            <Text style={styles.cardDate}>{formatDate(article.published_at)}</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => prevProps.article.id === nextProps.article.id);

/**
 * SearchScreen - Search news articles
 * Clean design without duplicate headers
 */
export default function SearchScreen({ navigation }) {
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await categoriesAPI.getAll();
      if (result.data?.categories) {
        setCategories(result.data.categories);
      }
    } catch (err) {
      console.error('[Search] Load categories error:', err);
    }
  };

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

      const result = await articlesAPI.search({
        q: query,
        category,
        limit: 50,
      });

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

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

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

  const handleCategoryPress = async (categorySlug) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (selectedCategory === categorySlug) {
      setSelectedCategory(null);
      if (activeQuery) {
        await performSearch(activeQuery, null);
      }
    } else {
      setSelectedCategory(categorySlug);
      if (activeQuery) {
        await performSearch(activeQuery, categorySlug);
      }
    }
  };

  const handleArticlePress = useCallback((article) => {
    navigation.navigate('ArticleDetail', {
      articleId: article.id,
      source: article.source_id || article.source,
      slug: article.slug,
    });
  }, [navigation]);

  const handleSuggestionPress = (categoryName) => {
    setSearchQuery(categoryName.toLowerCase());
    performSearch(categoryName.toLowerCase());
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Zimbabwe news..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={mukokoTheme.colors.primary}
          loading={loading}
        />
      </View>

      {/* Category Filter (only show when there's a query) */}
      {activeQuery && categories.length > 0 && (
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryPress={handleCategoryPress}
          showAll={true}
          showEmojis={true}
        />
      )}

      {/* Search Results Info */}
      {activeQuery && !loading && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsInfoText}>
            {total} result{total !== 1 ? 's' : ''} for "{activeQuery}"
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Empty State - No Query */}
      {!activeQuery && !loading && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Search Zimbabwe News</Text>
            <Text style={styles.emptyMessage}>
              Find articles from trusted Zimbabwe news sources
            </Text>

            {categories.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Popular Topics</Text>
                <View style={styles.suggestionsGrid}>
                  {categories.slice(0, 6).map((category) => (
                    <Chip
                      key={category.id}
                      onPress={() => handleSuggestionPress(category.name)}
                      style={styles.suggestionChip}
                      textStyle={styles.suggestionChipText}
                    >
                      {category.emoji} {category.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* No Results State */}
      {activeQuery && results.length === 0 && !loading && !error && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No Results</Text>
            <Text style={styles.emptyMessage}>
              No articles found for "{activeQuery}"
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Home')}
              style={styles.browseButton}
              buttonColor={mukokoTheme.colors.primary}
            >
              Browse All News
            </Button>
          </View>
        </View>
      )}

      {/* Search Results */}
      {results.length > 0 && (
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
            />
          ))}

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={mukokoTheme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
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

  // Search Bar
  searchContainer: {
    padding: mukokoTheme.spacing.md,
    backgroundColor: mukokoTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: mukokoTheme.colors.outlineVariant,
  },
  searchbar: {
    backgroundColor: mukokoTheme.colors.surfaceVariant,
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
    backgroundColor: mukokoTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: mukokoTheme.colors.outlineVariant,
  },
  resultsInfoText: {
    fontSize: 14,
    color: mukokoTheme.colors.onSurfaceVariant,
  },

  // Error
  errorContainer: {
    margin: mukokoTheme.spacing.md,
    padding: mukokoTheme.spacing.md,
    backgroundColor: mukokoTheme.colors.errorContainer,
    borderRadius: mukokoTheme.roundness - 8,
  },
  errorText: {
    color: mukokoTheme.colors.onErrorContainer,
    fontSize: 14,
    textAlign: 'center',
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: mukokoTheme.spacing.xl,
  },
  emptyStateCard: {
    backgroundColor: mukokoTheme.colors.surface,
    borderRadius: mukokoTheme.roundness,
    padding: mukokoTheme.spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: mukokoTheme.spacing.md,
  },
  emptyTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    color: mukokoTheme.colors.onSurface,
    marginBottom: mukokoTheme.spacing.xs,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: mukokoTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.lg,
  },
  browseButton: {
    borderRadius: mukokoTheme.roundness,
  },

  // Suggestions
  suggestionsContainer: {
    width: '100%',
    marginTop: mukokoTheme.spacing.md,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
    marginBottom: mukokoTheme.spacing.sm,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.xs,
  },
  suggestionChip: {
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  suggestionChipText: {
    fontSize: 12,
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
    borderRadius: mukokoTheme.roundness - 8,
    backgroundColor: mukokoTheme.colors.surface,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    padding: mukokoTheme.spacing.sm,
  },
  cardImageContainer: {
    width: 100,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    marginLeft: mukokoTheme.spacing.sm,
    justifyContent: 'center',
  },
  cardSource: {
    fontSize: 11,
    color: mukokoTheme.colors.primary,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 14,
    lineHeight: 18,
    color: mukokoTheme.colors.onSurface,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 11,
    color: mukokoTheme.colors.onSurfaceVariant,
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

  // Bottom padding for floating tab bar
  bottomPadding: {
    height: 100,
  },
});
