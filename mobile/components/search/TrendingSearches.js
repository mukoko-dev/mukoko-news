/**
 * TrendingSearches - Ranked trending searches list
 *
 * Design: Premium ranked list with fire indicators
 * - Numbered ranking
 * - Fire emoji for top items
 * - Tap to search
 */

import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/design-tokens';
import { CuratedLabel } from '../ai';

// Rank badge colors
const RANK_COLORS = {
  1: '#FFD700', // Gold
  2: '#C0C0C0', // Silver
  3: '#CD7F32', // Bronze
};

function TrendingSearchItem({ item, rank, onPress, theme }) {
  const isTopThree = rank <= 3;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.item,
        { borderBottomColor: theme.colors.outline },
      ]}
      accessibilityLabel={`Trending search: ${item.query || item.name}. Rank ${rank}`}
      accessibilityRole="button"
    >
      {/* Rank Badge */}
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor: isTopThree
              ? RANK_COLORS[rank]
              : theme.colors.surfaceVariant,
          },
        ]}
      >
        <Text
          style={[
            styles.rankText,
            { color: isTopThree ? '#FFFFFF' : theme.colors.onSurfaceVariant },
          ]}
        >
          {rank}
        </Text>
      </View>

      {/* Search Term */}
      <View style={styles.content}>
        <Text
          style={[styles.searchTerm, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {item.query || item.name || item.category_name}
        </Text>
        {item.count !== undefined && (
          <Text style={[styles.searchCount, { color: theme.colors.onSurfaceVariant }]}>
            {item.count || item.article_count} searches
          </Text>
        )}
      </View>

      {/* Fire indicator for top items */}
      {isTopThree && (
        <Text style={styles.fireEmoji}>🔥</Text>
      )}

      {/* Arrow */}
      <ChevronRight
        size={18}
        color={theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
}

function TrendingSearches({
  searches = [],
  onSearchPress,
  title = 'Trending Searches',
  showAILabel = true,
  maxItems = 10,
  style,
}) {
  const { theme } = useTheme();

  if (!searches || searches.length === 0) return null;

  const displaySearches = searches.slice(0, maxItems);

  return (
    <View style={[styles.container, style]}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {showAILabel && (
          <CuratedLabel variant="trending" size="small" />
        )}
      </View>

      {/* Searches List */}
      <View
        style={[
          styles.list,
          {
            backgroundColor: theme.colors.glassCard || theme.colors.surface,
            borderColor: theme.colors.glassBorder || theme.colors.outline,
          },
        ]}
      >
        {displaySearches.map((item, index) => (
          <TrendingSearchItem
            key={item.id || item.query || index}
            item={item}
            rank={index + 1}
            onPress={() => onSearchPress?.(item)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

export default memo(TrendingSearches);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    borderRadius: radius.button,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  content: {
    flex: 1,
  },
  searchTerm: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  searchCount: {
    fontSize: 11,
    marginTop: 1,
  },
  fireEmoji: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
});
