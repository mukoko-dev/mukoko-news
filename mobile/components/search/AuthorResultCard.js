/**
 * AuthorResultCard - Premium author card with stats
 *
 * Design: Modern profile card with article count
 * - Avatar placeholder or initials
 * - Author name
 * - Article count and source
 * - Tap to search
 */

import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import mukokoTheme from '../../theme';

// Generate initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate color from name for avatar
const getAvatarColor = (name) => {
  const colors = [
    '#4B0082', // Tanzanite
    '#0047AB', // Cobalt
    '#22543D', // Green
    '#702459', // Purple
    '#1A365D', // Navy
    '#5D4037', // Brown
    '#234E52', // Teal
  ];

  if (!name) return colors[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function AuthorResultCard({
  author,
  rank,
  onPress,
  variant = 'list', // 'list' or 'card'
  style,
}) {
  const { theme } = useTheme();

  const name = author?.name || 'Unknown Author';
  const articleCount = author?.article_count || author?.count || 0;
  const source = author?.source || author?.primary_source;
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  const isTopThree = rank && rank <= 3;

  if (variant === 'card') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.glassCard || theme.colors.surface,
            borderColor: theme.colors.glassBorder || theme.colors.outline,
          },
          style,
        ]}
        accessibilityLabel={`${name}. ${articleCount} articles`}
        accessibilityRole="button"
      >
        {/* Rank Badge */}
        {isTopThree && (
          <View
            style={[
              styles.cardRankBadge,
              {
                backgroundColor:
                  rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
              },
            ]}
          >
            <Text style={styles.cardRankText}>{rank}</Text>
          </View>
        )}

        {/* Avatar */}
        <View style={[styles.cardAvatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.cardAvatarText}>{initials}</Text>
        </View>

        {/* Name */}
        <Text
          style={[styles.cardName, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {name}
        </Text>

        {/* Stats */}
        <Text style={[styles.cardStats, { color: theme.colors.onSurfaceVariant }]}>
          {articleCount} articles
        </Text>

        {source && (
          <Text
            style={[styles.cardSource, { color: theme.colors.primary }]}
            numberOfLines={1}
          >
            {source}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // List variant (default)
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.listItem,
        { borderBottomColor: theme.colors.outline },
        style,
      ]}
      accessibilityLabel={`${name}. ${articleCount} articles`}
      accessibilityRole="button"
    >
      {/* Rank Badge */}
      {rank && (
        <View
          style={[
            styles.listRankBadge,
            {
              backgroundColor: isTopThree
                ? rank === 1
                  ? '#FFD700'
                  : rank === 2
                  ? '#C0C0C0'
                  : '#CD7F32'
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          <Text
            style={[
              styles.listRankText,
              { color: isTopThree ? '#FFFFFF' : theme.colors.onSurfaceVariant },
            ]}
          >
            {rank}
          </Text>
        </View>
      )}

      {/* Avatar */}
      <View style={[styles.listAvatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.listAvatarText}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.listInfo}>
        <Text
          style={[styles.listName, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <View style={styles.listMeta}>
          <Text style={[styles.listStats, { color: theme.colors.onSurfaceVariant }]}>
            {articleCount} articles
          </Text>
          {source && (
            <>
              <Text style={[styles.listDot, { color: theme.colors.onSurfaceVariant }]}>
                ·
              </Text>
              <Text
                style={[styles.listSource, { color: theme.colors.primary }]}
                numberOfLines={1}
              >
                {source}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Arrow */}
      <Icon
        source="chevron-right"
        size={18}
        color={theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
}

export default memo(AuthorResultCard, (prevProps, nextProps) => {
  return (
    prevProps.author?.id === nextProps.author?.id &&
    prevProps.author?.article_count === nextProps.author?.article_count &&
    prevProps.rank === nextProps.rank
  );
});

const styles = StyleSheet.create({
  // Card variant
  card: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
    minWidth: 120,
  },
  cardRankBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    ...mukokoTheme.shadows.small,
  },
  cardRankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.sm,
  },
  cardAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  cardName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
    marginBottom: 2,
  },
  cardStats: {
    fontSize: 11,
  },
  cardSource: {
    fontSize: 10,
    marginTop: 2,
  },

  // List variant
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm + 2,
    paddingHorizontal: mukokoTheme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: mukokoTheme.spacing.sm,
  },
  listRankText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: mukokoTheme.spacing.sm,
  },
  listAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  listStats: {
    fontSize: 11,
  },
  listDot: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  listSource: {
    fontSize: 11,
    flex: 1,
  },
});
