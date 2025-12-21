/**
 * ArticleCard Component
 * Reusable news article card with proper image handling, loading states,
 * and responsive layout following 2025 news app best practices
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, Surface, useTheme as usePaperTheme } from 'react-native-paper';
import { ImageIcon } from 'lucide-react-native';
import mukokoTheme from '../theme';
import SourceIcon from './SourceIcon';

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
          <ImageIcon
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

ArticleImage.displayName = 'ArticleImage';

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
  const paperTheme = usePaperTheme();

  const imageUrl = article.imageUrl || article.image_url;
  const hasImage = imageUrl && !imageError;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Calculate card width based on variant
  const cardWidth = width || (variant === 'horizontal' ? SCREEN_WIDTH - mukokoTheme.spacing.md * 2 : undefined);

  // Stable key for the image to prevent re-mounting
  const imageKey = `${article.id || article.slug}-image`;

  // Dynamic glass styles based on theme
  const glassStyles = {
    surface: {
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderWidth: 1,
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    },
    title: {
      color: paperTheme.colors.onSurface,
    },
    description: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    category: {
      color: paperTheme.colors.primary,
    },
    source: {
      color: paperTheme.colors.primary,
    },
    meta: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    placeholder: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
    // Hashtag chip styling
    tagChip: {
      backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.10)',
      borderWidth: 1,
      borderColor: paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.18)',
    },
    tagText: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    statsText: {
      color: paperTheme.colors.onSurfaceVariant,
    },
  };

  // Render different variants
  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.horizontalCard, cardWidth && { width: cardWidth }, style]}
        accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
        accessibilityRole="button"
        accessibilityHint="Opens article for reading"
      >
        <Surface style={[styles.horizontalSurface, glassStyles.surface]} elevation={0}>
          {/* Image Section - only show if we have an image */}
          {hasImage && (
            <View style={[styles.horizontalImageContainer, glassStyles.placeholder]}>
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
            <Text style={[styles.horizontalTitle, glassStyles.title]} numberOfLines={2}>
              {article.title}
            </Text>
            <View style={styles.metaRow}>
              <SourceIcon source={article.source} size={14} showBorder={false} />
              <Text style={[styles.sourceText, glassStyles.source]}>{article.source}</Text>
              <Text style={[styles.dotSeparator, glassStyles.meta]}>•</Text>
              <Text style={[styles.dateText, glassStyles.meta]}>
                {formatRelativeTime(article.pubDate || article.published_at)}
              </Text>
            </View>
          </View>
        </Surface>
      </Pressable>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.compactCard, style]}
        accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
        accessibilityRole="button"
        accessibilityHint="Opens article for reading"
      >
        <Surface style={[styles.compactSurface, glassStyles.surface]} elevation={0}>
          <View style={styles.compactContent}>
            <View style={styles.compactTextContent}>
              <Text style={[styles.compactTitle, glassStyles.title]} numberOfLines={2}>
                {article.title}
              </Text>
              <View style={styles.metaRow}>
                <SourceIcon source={article.source} size={12} showBorder={false} />
                <Text style={[styles.sourceTextSmall, glassStyles.source]}>{article.source}</Text>
                <Text style={[styles.dotSeparator, glassStyles.meta]}>•</Text>
                <Text style={[styles.dateTextSmall, glassStyles.meta]}>
                  {formatRelativeTime(article.pubDate || article.published_at)}
                </Text>
              </View>
            </View>
            {hasImage && (
              <View style={[styles.compactImageContainer, glassStyles.placeholder]}>
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
      </Pressable>
    );
  }

  if (variant === 'featured') {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.featuredCard, cardWidth && { width: cardWidth }, style]}
        accessibilityLabel={`Featured article: ${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
        accessibilityRole="button"
        accessibilityHint="Opens featured article for reading"
      >
        <Surface style={[styles.featuredSurface, glassStyles.surface]} elevation={0}>
          {/* Full-width Image - only show if we have an image */}
          {hasImage && (
            <View style={[styles.featuredImageContainer, glassStyles.placeholder]}>
              <ArticleImage
                key={imageKey}
                uri={imageUrl}
                style={styles.featuredImage}
                onError={handleImageError}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, glassStyles.title]} numberOfLines={3}>
              {article.title}
            </Text>
            {article.description && (
              <Text style={[styles.featuredDescription, glassStyles.description]} numberOfLines={2}>
                {article.description}
              </Text>
            )}
            <View style={styles.metaRow}>
              <SourceIcon source={article.source} size={16} showBorder={false} />
              <Text style={[styles.sourceText, glassStyles.source]}>{article.source}</Text>
              <Text style={[styles.dotSeparator, glassStyles.meta]}>•</Text>
              <Text style={[styles.dateText, glassStyles.meta]}>
                {formatRelativeTime(article.pubDate || article.published_at)}
              </Text>
            </View>
          </View>
        </Surface>
      </Pressable>
    );
  }

  // Default variant
  return (
    <Pressable
      onPress={onPress}
      style={[styles.defaultCard, cardWidth && { width: cardWidth }, style]}
      accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
      accessibilityRole="button"
      accessibilityHint="Opens article for reading"
    >
      <Surface style={[styles.defaultSurface, glassStyles.surface]} elevation={0}>
        {/* Image Section - only show if we have an image */}
        {hasImage && (
          <View style={[styles.defaultImageContainer, glassStyles.placeholder]}>
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
          {/* Source and Date Row */}
          <View style={styles.sourceRow}>
            <SourceIcon source={article.source} size={16} showBorder={false} />
            <Text style={[styles.sourceText, glassStyles.source]}>{article.source}</Text>
            <Text style={[styles.dotSeparator, glassStyles.meta]}>•</Text>
            <Text style={[styles.dateText, glassStyles.meta]}>
              {formatRelativeTime(article.pubDate || article.published_at)}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.defaultTitle, glassStyles.title]} numberOfLines={3}>
            {article.title}
          </Text>

          {/* Description */}
          {article.description && (
            <Text style={[styles.defaultDescription, glassStyles.description]} numberOfLines={2}>
              {article.description}
            </Text>
          )}
        </View>
      </Surface>
    </Pressable>
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    padding: mukokoTheme.spacing.lg,
    gap: mukokoTheme.spacing.sm,
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
    marginTop: mukokoTheme.spacing.sm,
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    padding: mukokoTheme.spacing.md,
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  compactContent: {
    flexDirection: 'row',
    padding: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.md,
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    gap: mukokoTheme.spacing.md,
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
    fontSize: 12, // Increased from 11 for WCAG readability
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelSmall: {
    fontSize: 11, // Increased from 10 for WCAG readability
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Source row (at top of content)
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.sm,
    gap: 6,
  },

  // Meta row (source, date) - for variants that use bottom placement
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: mukokoTheme.spacing.sm,
    gap: 6,
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

  // Hashtags row
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.xs,
  },
  hashtagChip: {
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs / 2,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 12, // Increased from 11 for WCAG readability
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  moreTagsText: {
    fontSize: 12, // Increased from 11 for WCAG readability
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginLeft: mukokoTheme.spacing.xs,
    opacity: 0.8, // Increased from 0.7 for better contrast
  },

  // Stats row (word count, read time)
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: mukokoTheme.spacing.sm,
    paddingTop: mukokoTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  statsText: {
    fontSize: 12, // Increased from 11 for WCAG readability
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
