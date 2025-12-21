/**
 * HeroStoryCard - Premium magazine-style hero article card
 *
 * Design: Apple News + The Athletic inspired
 * - Full-bleed 16:10 aspect ratio image
 * - Gradient overlay on bottom 40%
 * - Large serif title (22-24px)
 * - Source badge + time
 * - NO personalization labels (Discover = everything)
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Pressable,
  Image,
  Dimensions,
  Text as RNText,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon, Newspaper } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme } = useTheme();

  const imageUrl = article?.imageUrl || article?.image_url;
  const hasImage = imageUrl && !imageError;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const cardWidth = width || SCREEN_WIDTH - 32; // 16px padding on each side

  if (!article) return null;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-card overflow-hidden shadow-md"
      style={[{ width: cardWidth }, style]}
      accessibilityLabel={`${article.title}. ${article.source}. ${formatRelativeTime(article.pubDate || article.published_at)}`}
      accessibilityRole="button"
      accessibilityHint="Opens article for reading"
    >
      {/* Hero Image Container */}
      <View
        className="w-full aspect-[16/10] relative rounded-card overflow-hidden"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        }}
      >
        {hasImage ? (
          <>
            {/* Placeholder while loading */}
            {!imageLoaded && (
              <View className="absolute inset-0 justify-center items-center" style={{ backgroundColor: theme.colors['surface-variant'] }}>
                <ImageIcon
                  size={48}
                  color={theme.colors.outline}
                  strokeWidth={1.5}
                />
              </View>
            )}
            <Image
              source={{ uri: imageUrl }}
              className="absolute inset-0"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {/* Gradient Overlay - Bottom 60% */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              className="absolute left-0 right-0 bottom-0 h-[60%]"
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </>
        ) : (
          <View className="absolute inset-0 justify-center items-center" style={{ backgroundColor: theme.colors['surface-variant'] }}>
            <Newspaper
              size={64}
              color={theme.colors.outline}
              strokeWidth={1.5}
            />
          </View>
        )}

        {/* Content Overlay */}
        <View className="absolute left-0 right-0 bottom-0 p-lg gap-sm">
          {/* Category Badge */}
          {article.category && (
            <View className="self-start px-sm py-xs rounded-sm" style={{ backgroundColor: theme.colors.tanzanite }}>
              <RNText className="text-white text-[10px] font-sans-bold uppercase tracking-widest">{article.category}</RNText>
            </View>
          )}

          {/* Title */}
          <RNText className="font-serif-bold text-[22px] leading-[28px] tracking-tight text-white" numberOfLines={3}>
            {article.title}
          </RNText>

          {/* Description */}
          {article.description && hasImage && (
            <RNText className="font-sans text-[14px] leading-[20px] text-white/85" numberOfLines={2}>
              {article.description}
            </RNText>
          )}

          {/* Source and Time Row */}
          <View className="flex-row items-center justify-between mt-xs">
            <View className="flex-row items-center px-sm py-xs rounded-sm gap-[6px] bg-black/40">
              <SourceIcon source={article.source} size={14} showBorder={false} />
              <RNText className="text-white text-[12px] font-sans-medium">{article.source}</RNText>
            </View>
            <RNText className="text-white/75 text-[12px] font-sans">
              {formatRelativeTime(article.pubDate || article.published_at)}
            </RNText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(HeroStoryCard, (prevProps, nextProps) => {
  return prevProps.article?.id === nextProps.article?.id && prevProps.width === nextProps.width;
});
