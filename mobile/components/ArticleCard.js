/**
 * ArticleCard Component
 * Reusable news article card with proper image handling, loading states,
 * and responsive layout following 2025 news app best practices
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Image aspect ratio for consistent card heights
const IMAGE_ASPECT_RATIO = 16 / 9;

/**
 * Format relative time for article dates
 */
const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

/**
 * Optimized Image component to prevent flickering
 * Uses memo and stable key to prevent unnecessary re-renders
 */
const ArticleImage = memo(({ uri, style, onError }) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <View style={style}>
      {/* Show placeholder until image loads */}
      {!loaded && (
        <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]}>
          <MaterialCommunityIcons
            name="image-outline"
            size={32}
            color={mukokoTheme.colors.outline}
          />
        </View>
      )}
      <Image
        source={{
          uri,
          // Add cache headers for web
          ...(Platform.OS === 'web' && { cache: 'force-cache' }),
        }}
        style={[StyleSheet.absoluteFill, { opacity: loaded ? 1 : 0 }]}
        resizeMode="cover"
        onLoad={handleLoad}
        onError={onError}
        // Prevent flickering with fade duration
        fadeDuration={0}
      />
    </View>
  );
}, (prevProps, nextProps) => prevProps.uri === nextProps.uri);

/**
 * ArticleCard - Main card component for displaying news articles
 *
 * @param {Object} article - Article data object
 * @param {Function} onPress - Callback when card is pressed
 * @param {string} variant - Card variant: 'default' | 'compact' | 'featured' | 'horizontal'
 * @param {number} width - Optional fixed width for the card
 */
function ArticleCard({
  article,
  onPress,
  variant = 'default',
  width,
  style,
}) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = article.imageUrl || article.image_url;
  const hasImage = imageUrl && !imageError;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Calculate card width based on variant
  const cardWidth = width || (variant === 'horizontal' ? SCREEN_WIDTH - mukokoTheme.spacing.md * 2 : undefined);

  // Stable key for the image to prevent re-mounting
  const imageKey = `${article.id || article.slug}-image`;

  // Render different variants
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.horizontalCard, cardWidth && { width: cardWidth }, style]}
      >
        <Surface style={styles.horizontalSurface} elevation={1}>
          {/* Image Section - only show if we have an image */}
          {hasImage && (
            <View style={styles.horizontalImageContainer}>
              <ArticleImage
                key={imageKey}
                uri={imageUrl}
                style={styles.horizontalImage}
                onError={handleImageError}
              />
            </View>
          )}

          {/* Content Section */}
          <View style={[styles.horizontalContent, !hasImage && styles.horizontalContentNoImage]}>
            {article.category && (
              <Text style={styles.categoryLabel}>{article.category}</Text>
            )}
            <Text style={styles.horizontalTitle} numberOfLines={2}>
              {article.title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.sourceText}>{article.source}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.dateText}>
                {formatRelativeTime(article.pubDate || article.published_at)}
              </Text>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.compactCard, style]}
      >
        <Surface style={styles.compactSurface} elevation={1}>
          <View style={styles.compactContent}>
            <View style={styles.compactTextContent}>
              {article.category && (
                <Text style={styles.categoryLabelSmall}>{article.category}</Text>
              )}
              <Text style={styles.compactTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.sourceTextSmall}>{article.source}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.dateTextSmall}>
                  {formatRelativeTime(article.pubDate || article.published_at)}
                </Text>
              </View>
            </View>
            {hasImage && (
              <View style={styles.compactImageContainer}>
                <ArticleImage
                  key={imageKey}
                  uri={imageUrl}
                  style={styles.compactImage}
                  onError={handleImageError}
                />
              </View>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.featuredCard, cardWidth && { width: cardWidth }, style]}
      >
        <Surface style={styles.featuredSurface} elevation={2}>
          {/* Full-width Image - only show if we have an image */}
          {hasImage && (
            <View style={styles.featuredImageContainer}>
              <ArticleImage
                key={imageKey}
                uri={imageUrl}
                style={styles.featuredImage}
                onError={handleImageError}
              />
              {/* Gradient overlay for text readability */}
              <View style={styles.featuredGradient} />
              {/* Category badge on image */}
              {article.category && (
                <View style={styles.featuredCategoryBadge}>
                  <Text style={styles.featuredCategoryText}>{article.category}</Text>
                </View>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.featuredContent}>
            {/* Show category in content when no image */}
            {!hasImage && article.category && (
              <Text style={styles.categoryLabel}>{article.category}</Text>
            )}
            <Text style={styles.featuredTitle} numberOfLines={3}>
              {article.title}
            </Text>
            {article.description && (
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {article.description}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.sourceText}>{article.source}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.dateText}>
                {formatRelativeTime(article.pubDate || article.published_at)}
              </Text>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.defaultCard, cardWidth && { width: cardWidth }, style]}
    >
      <Surface style={styles.defaultSurface} elevation={1}>
        {/* Image Section - only show if we have an image */}
        {hasImage && (
          <View style={styles.defaultImageContainer}>
            <ArticleImage
              key={imageKey}
              uri={imageUrl}
              style={styles.defaultImage}
              onError={handleImageError}
            />
          </View>
        )}

        {/* Content Section */}
        <View style={styles.defaultContent}>
          {article.category && (
            <Text style={styles.categoryLabel}>{article.category}</Text>
          )}
          <Text style={styles.defaultTitle} numberOfLines={3}>
            {article.title}
          </Text>
          {article.description && (
            <Text style={styles.defaultDescription} numberOfLines={2}>
              {article.description}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.sourceText}>{article.source}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.dateText}>
              {formatRelativeTime(article.pubDate || article.published_at)}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export default memo(ArticleCard, (prevProps, nextProps) => {
  return (
    prevProps.article?.id === nextProps.article?.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.width === nextProps.width
  );
});

const styles = StyleSheet.create({
  // ============ DEFAULT VARIANT ============
  defaultCard: {
    marginBottom: mukokoTheme.spacing.md,
  },
  defaultSurface: {
    borderRadius: mukokoTheme.roundness,
    backgroundColor: mukokoTheme.colors.surface,
    overflow: 'hidden',
  },
  defaultImageContainer: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  defaultImage: {
    width: '100%',
    height: '100%',
  },
  defaultContent: {
    padding: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.xs,
  },
  defaultTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 17,
    lineHeight: 24,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: -0.2,
  },
  defaultDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: mukokoTheme.colors.onSurfaceVariant,
    marginTop: mukokoTheme.spacing.xs,
  },

  // ============ HORIZONTAL VARIANT ============
  horizontalCard: {
    marginBottom: mukokoTheme.spacing.sm,
  },
  horizontalSurface: {
    flexDirection: 'row',
    borderRadius: mukokoTheme.roundness / 2,
    backgroundColor: mukokoTheme.colors.surface,
    overflow: 'hidden',
  },
  horizontalImageContainer: {
    width: 120,
    height: 90,
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    padding: mukokoTheme.spacing.sm,
    justifyContent: 'space-between',
  },
  horizontalContentNoImage: {
    paddingVertical: mukokoTheme.spacing.md,
  },
  horizontalTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: -0.2,
  },

  // ============ COMPACT VARIANT ============
  compactCard: {
    marginBottom: mukokoTheme.spacing.sm,
  },
  compactSurface: {
    borderRadius: mukokoTheme.roundness / 2,
    backgroundColor: mukokoTheme.colors.surface,
    overflow: 'hidden',
  },
  compactContent: {
    flexDirection: 'row',
    padding: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  compactTextContent: {
    flex: 1,
    gap: mukokoTheme.spacing.xs / 2,
  },
  compactTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: -0.1,
  },
  compactImageContainer: {
    width: 72,
    height: 72,
    borderRadius: mukokoTheme.roundness / 3,
    overflow: 'hidden',
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },

  // ============ FEATURED VARIANT ============
  featuredCard: {
    marginBottom: mukokoTheme.spacing.lg,
  },
  featuredSurface: {
    borderRadius: mukokoTheme.roundness,
    backgroundColor: mukokoTheme.colors.surface,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: mukokoTheme.colors.surfaceVariant,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredPlaceholder: {
    aspectRatio: 16 / 10,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
  },
  featuredCategoryBadge: {
    position: 'absolute',
    top: mukokoTheme.spacing.sm,
    left: mukokoTheme.spacing.sm,
    backgroundColor: mukokoTheme.colors.primary,
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs / 2,
    borderRadius: mukokoTheme.roundness / 2,
  },
  featuredCategoryText: {
    color: mukokoTheme.colors.onPrimary,
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredContent: {
    padding: mukokoTheme.spacing.lg,
    gap: mukokoTheme.spacing.sm,
  },
  featuredTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: -0.3,
  },
  featuredDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: mukokoTheme.colors.onSurfaceVariant,
  },

  // ============ SHARED STYLES ============
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mukokoTheme.colors.surfaceVariant,
    gap: mukokoTheme.spacing.xs,
  },
  placeholderText: {
    fontSize: 12,
    color: mukokoTheme.colors.onSurfaceVariant,
    opacity: 0.7,
  },

  // Category labels
  categoryLabel: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelSmall: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Meta row (source, date)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: mukokoTheme.spacing.xs,
  },
  sourceText: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.primary,
  },
  sourceTextSmall: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.primary,
  },
  dotSeparator: {
    fontSize: 12,
    color: mukokoTheme.colors.onSurfaceVariant,
    marginHorizontal: mukokoTheme.spacing.xs,
    opacity: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  dateTextSmall: {
    fontSize: 11,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
});
