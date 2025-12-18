/**
 * HeroStoryCard - Premium magazine-style hero article card
 *
 * Design: Apple News + The Athletic inspired
 * - Full-bleed 16:10 aspect ratio image
 * - Gradient overlay on bottom 40%
 * - Large serif title (22-24px)
 * - Source badge + time
 * - NO personalization labels (Discover = everything)
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
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../../theme';
import SourceIcon from '../SourceIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

function HeroStoryCard({
  article,
  onPress,
  width,
  style,
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const paperTheme = usePaperTheme();

  const imageUrl = article?.imageUrl || article?.image_url;
  const hasImage = imageUrl && !imageError;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const cardWidth = width || SCREEN_WIDTH - mukokoTheme.spacing.md * 2;

  if (!article) return null;

  const dynamicStyles = {
    card: {
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    },
    title: {
      color: '#FFFFFF', // Always white on gradient
    },
    description: {
      color: 'rgba(255, 255, 255, 0.85)',
    },
    meta: {
      color: 'rgba(255, 255, 255, 0.75)',
    },
    sourceBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    placeholder: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { width: cardWidth }, style]}
      accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
      accessibilityRole="button"
      accessibilityHint="Opens article for reading"
    >
      {/* Hero Image Container */}
      <View style={[styles.imageContainer, dynamicStyles.card]}>
        {hasImage ? (
          <>
            {/* Placeholder while loading */}
            {!imageLoaded && (
              <View style={[styles.imagePlaceholder, dynamicStyles.placeholder]}>
                <MaterialCommunityIcons
                  name="image-outline"
                  size={48}
                  color={mukokoTheme.colors.outline}
                />
              </View>
            )}
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, { opacity: imageLoaded ? 1 : 0 }]}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {/* Gradient Overlay - Bottom 50% */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </>
        ) : (
          <View style={[styles.noImagePlaceholder, dynamicStyles.placeholder]}>
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={64}
              color={mukokoTheme.colors.outline}
            />
          </View>
        )}

        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          {/* Category Badge */}
          {article.category && (
            <View style={[styles.categoryBadge, { backgroundColor: paperTheme.colors.primary }]}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, dynamicStyles.title]} numberOfLines={3}>
            {article.title}
          </Text>

          {/* Description */}
          {article.description && hasImage && (
            <Text style={[styles.description, dynamicStyles.description]} numberOfLines={2}>
              {article.description}
            </Text>
          )}

          {/* Source and Time Row */}
          <View style={styles.metaRow}>
            <View style={[styles.sourceBadge, dynamicStyles.sourceBadge]}>
              <SourceIcon source={article.source} size={14} showBorder={false} />
              <Text style={styles.sourceText}>{article.source}</Text>
            </View>
            <Text style={[styles.timeText, dynamicStyles.meta]}>
              {formatRelativeTime(article.pubDate || article.published_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(HeroStoryCard, (prevProps, nextProps) => {
  return prevProps.article?.id === nextProps.article?.id && prevProps.width === nextProps.width;
});

const styles = StyleSheet.create({
  card: {
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
    ...mukokoTheme.shadows.medium,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  contentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: mukokoTheme.spacing.lg,
    gap: mukokoTheme.spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: mukokoTheme.roundness / 2,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: mukokoTheme.spacing.xs,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: mukokoTheme.roundness / 2,
    gap: 6,
  },
  sourceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  timeText: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
