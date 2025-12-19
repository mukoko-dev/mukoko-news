import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';

/**
 * ArticleEngagementBar - Consistent engagement UI across the app
 * Features glass morphism effect with Cobalt (secondary brand color) highlights
 * Following Nyuchi Brand System: Cobalt represents digital future & knowledge
 * Used in ArticleDetailScreen, ArticleCard, etc.
 */
export default function ArticleEngagementBar({
  isLiked,
  isSaved,
  likesCount,
  commentsCount,
  onLike,
  onSave,
  onShare,
  onComment,
  layout = 'horizontal', // 'horizontal' or 'vertical'
  variant = 'light', // 'light' or 'dark'
}) {
  const theme = useTheme();

  // Glass effect colors with Cobalt (secondary brand color)
  const glassBackground = variant === 'dark'
    ? 'rgba(0, 176, 255, 0.15)' // Cobalt dark with transparency
    : 'rgba(0, 71, 171, 0.08)';  // Cobalt light with transparency

  const glassBorder = variant === 'dark'
    ? 'rgba(0, 176, 255, 0.2)' // Cobalt dark border
    : 'rgba(0, 71, 171, 0.12)'; // Cobalt light border

  const iconColor = variant === 'dark' ? '#fff' : theme.colors.onSurface;
  const textColor = variant === 'dark' ? '#fff' : theme.colors.onSurfaceVariant;
  const accentColor = theme.colors.secondary; // Cobalt (secondary brand color)

  const handlePress = async (callback) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback?.();
  };

  const ActionButton = ({ icon, active, count, onPress, accessibilityLabel }) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => handlePress(onPress)}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.actionIconContainer,
          {
            backgroundColor: glassBackground,
            borderColor: active ? accentColor : glassBorder,
            borderWidth: 1.5,
          },
        ]}
      >
        <IconButton
          icon={icon}
          iconColor={active ? accentColor : iconColor}
          size={24}
          style={styles.actionIcon}
        />
      </View>
      {count !== undefined && count !== null && (
        <Text
          style={[
            styles.actionText,
            {
              color: active ? accentColor : textColor,
              fontFamily: active ? mukokoTheme.fonts.bold.fontFamily : mukokoTheme.fonts.medium.fontFamily,
            },
          ]}
        >
          {typeof count === 'number' ? (count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count) : count}
        </Text>
      )}
    </TouchableOpacity>
  );

  const containerStyle = layout === 'vertical'
    ? styles.verticalContainer
    : styles.horizontalContainer;

  return (
    <View style={containerStyle}>
      {/* Like */}
      {onLike && (
        <ActionButton
          icon={isLiked ? 'heart' : 'heart-outline'}
          active={isLiked}
          count={likesCount}
          onPress={onLike}
          accessibilityLabel={isLiked ? 'Unlike article' : 'Like article'}
        />
      )}

      {/* Comment */}
      {onComment && (
        <ActionButton
          icon="comment-outline"
          active={false}
          count={commentsCount}
          onPress={onComment}
          accessibilityLabel="View comments"
        />
      )}

      {/* Share */}
      {onShare && (
        <ActionButton
          icon="share-variant-outline"
          active={false}
          count="Share"
          onPress={onShare}
          accessibilityLabel="Share article"
        />
      )}

      {/* Bookmark/Save */}
      {onSave && (
        <ActionButton
          icon={isSaved ? 'bookmark' : 'bookmark-outline'}
          active={isSaved}
          onPress={onSave}
          accessibilityLabel={isSaved ? 'Remove bookmark' : 'Bookmark article'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Flat card with border
    borderWidth: 1,
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginTop: 2,
  },
});
