/**
 * ArticleCard Component
 * Reusable news article card with proper image handling, loading states,
 * and responsive layout following 2025 news app best practices
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Pressable,
  Image,
  Dimensions,
  Platform,
  Text as RNText,
} from 'react-native';
import { ImageIcon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import SourceIcon from './SourceIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
const ArticleImage = memo(({ uri, imageClassName, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const { theme } = useTheme();

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <View className={imageClassName}>
      {/* Show placeholder until image loads */}
      {!loaded && (
        <View className="absolute inset-0 justify-center items-center bg-surface-variant">
          <ImageIcon
            size={32}
            color={theme.colors.outline}
          />
        </View>
      )}
      <Image
        source={{
          uri,
          // Add cache headers for web
          ...(Platform.OS === 'web' && { cache: 'force-cache' }),
        }}
        className="absolute inset-0"
        style={{ opacity: loaded ? 1 : 0 }}
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
  const { theme } = useTheme();

  const imageUrl = article.imageUrl || article.image_url;
  const hasImage = imageUrl && !imageError;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Calculate card width based on variant
  const cardWidth = width || (variant === 'horizontal' ? SCREEN_WIDTH - 24 : undefined);

  // Stable key for the image to prevent re-mounting
  const imageKey = `${article.id || article.slug}-image`;

  // Render different variants
  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        className="mb-sm"
        style={[cardWidth && { width: cardWidth }, style]}
        accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
        accessibilityRole="button"
        accessibilityHint="Opens article for reading"
      >
        <View className="flex-row rounded-lg bg-surface border border-outline overflow-hidden">
          {/* Image Section - only show if we have an image */}
          {hasImage && (
            <ArticleImage
              key={imageKey}
              uri={imageUrl}
              imageClassName="w-[120px] h-[90px] bg-surface-variant"
              onError={handleImageError}
            />
          )}

          {/* Content Section */}
          <View className={`flex-1 p-md justify-between ${!hasImage ? 'py-md' : ''}`}>
            <RNText
              className="font-serif-bold text-[15px] leading-[20px] text-on-surface"
              style={{ letterSpacing: -0.2 }}
              numberOfLines={2}
            >
              {article.title}
            </RNText>
            <View className="flex-row items-center mt-sm gap-[6px]">
              <SourceIcon source={article.source} size={14} showBorder={false} />
              <RNText className="font-sans-medium text-[12px] text-tanzanite">
                {article.source}
              </RNText>
              <RNText className="text-[12px] text-on-surface-variant mx-xs" style={{ opacity: 0.5 }}>
                •
              </RNText>
              <RNText className="text-[12px] text-on-surface-variant">
                {formatRelativeTime(article.pubDate || article.published_at)}
              </RNText>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        className="mb-sm"
        style={style}
        accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
        accessibilityRole="button"
        accessibilityHint="Opens article for reading"
      >
        <View className="rounded-lg bg-surface border border-outline overflow-hidden">
          <View className="flex-row p-md gap-md">
            <View className="flex-1 gap-[2px]">
              <RNText
                className="font-serif-bold text-[14px] leading-[19px] text-on-surface"
                style={{ letterSpacing: -0.1 }}
                numberOfLines={2}
              >
                {article.title}
              </RNText>
              <View className="flex-row items-center mt-sm gap-[6px]">
                <SourceIcon source={article.source} size={12} showBorder={false} />
                <RNText className="font-sans-medium text-[11px] text-tanzanite">
                  {article.source}
                </RNText>
                <RNText className="text-[12px] text-on-surface-variant mx-xs" style={{ opacity: 0.5 }}>
                  •
                </RNText>
                <RNText className="text-[11px] text-on-surface-variant">
                  {formatRelativeTime(article.pubDate || article.published_at)}
                </RNText>
              </View>
            </View>
            {hasImage && (
              <ArticleImage
                key={imageKey}
                uri={imageUrl}
                imageClassName="w-[72px] h-[72px] rounded-[5px] overflow-hidden bg-surface-variant"
                onError={handleImageError}
              />
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'featured') {
    return (
      <Pressable
        onPress={onPress}
        className="mb-lg"
        style={[cardWidth && { width: cardWidth }, style]}
        accessibilityLabel={`Featured article: ${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
        accessibilityRole="button"
        accessibilityHint="Opens featured article for reading"
      >
        <View className="rounded-card bg-surface border border-outline overflow-hidden">
          {/* Full-width Image - only show if we have an image */}
          {hasImage && (
            <ArticleImage
              key={imageKey}
              uri={imageUrl}
              imageClassName="w-full bg-surface-variant"
              style={{ aspectRatio: 16 / 10 }}
              onError={handleImageError}
            />
          )}

          {/* Content */}
          <View className="p-lg gap-md">
            <RNText
              className="font-serif-bold text-[22px] leading-[28px] text-on-surface"
              style={{ letterSpacing: -0.3 }}
              numberOfLines={3}
            >
              {article.title}
            </RNText>
            {article.description && (
              <RNText
                className="text-[15px] leading-[22px] text-on-surface-variant"
                numberOfLines={2}
              >
                {article.description}
              </RNText>
            )}
            <View className="flex-row items-center mt-sm gap-[6px]">
              <SourceIcon source={article.source} size={16} showBorder={false} />
              <RNText className="font-sans-medium text-[12px] text-tanzanite">
                {article.source}
              </RNText>
              <RNText className="text-[12px] text-on-surface-variant mx-xs" style={{ opacity: 0.5 }}>
                •
              </RNText>
              <RNText className="text-[12px] text-on-surface-variant">
                {formatRelativeTime(article.pubDate || article.published_at)}
              </RNText>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Default variant
  return (
    <Pressable
      onPress={onPress}
      className="mb-md"
      style={[cardWidth && { width: cardWidth }, style]}
      accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
      accessibilityRole="button"
      accessibilityHint="Opens article for reading"
    >
      <View className="rounded-card bg-surface border border-outline overflow-hidden">
        {/* Image Section - only show if we have an image */}
        {hasImage && (
          <ArticleImage
            key={imageKey}
            uri={imageUrl}
            imageClassName="w-full bg-surface-variant"
            style={{ aspectRatio: 16 / 9 }}
            onError={handleImageError}
          />
        )}

        {/* Content Section */}
        <View className="p-lg gap-sm">
          {/* Source and Date Row */}
          <View className="flex-row items-center mb-sm gap-[6px]">
            <SourceIcon source={article.source} size={16} showBorder={false} />
            <RNText className="font-sans-medium text-[12px] text-tanzanite">
              {article.source}
            </RNText>
            <RNText className="text-[12px] text-on-surface-variant mx-xs" style={{ opacity: 0.5 }}>
              •
            </RNText>
            <RNText className="text-[12px] text-on-surface-variant">
              {formatRelativeTime(article.pubDate || article.published_at)}
            </RNText>
          </View>

          {/* Title */}
          <RNText
            className="font-serif-bold text-[17px] leading-[24px] text-on-surface"
            style={{ letterSpacing: -0.2 }}
            numberOfLines={3}
          >
            {article.title}
          </RNText>

          {/* Description */}
          {article.description && (
            <RNText
              className="text-[14px] leading-[20px] text-on-surface-variant mt-sm"
              numberOfLines={2}
            >
              {article.description}
            </RNText>
          )}
        </View>
      </View>
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
