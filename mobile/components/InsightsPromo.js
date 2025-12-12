/**
 * InsightsPromo Component
 * Showcases platform insights and real metrics
 * Can be placed on Home, Discover, or Profile screens
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import mukokoTheme from '../theme';

/**
 * InsightsPromo - Displays platform metrics and insights
 *
 * @param {string} variant - 'full' | 'compact' | 'minimal'
 * @param {Object} metrics - Real metrics data { articles, views, trending, sources }
 * @param {Function} onPress - Optional callback when pressed
 */
export default function InsightsPromo({
  variant = 'full',
  metrics = {},
  onPress,
  style,
}) {
  const navigation = useNavigation();

  // Default metrics if not provided
  const defaultMetrics = {
    articles: metrics.articles || 0,
    views: metrics.views || 0,
    trending: metrics.trending || [],
    sources: metrics.sources || 0,
    categories: metrics.categories || 0,
    lastUpdated: metrics.lastUpdated || 'Just now',
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('Discover');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Minimal variant - single stat highlight
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.minimalContainer, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="chart-line"
          size={18}
          color={mukokoTheme.colors.primary}
        />
        <Text style={styles.minimalText}>
          {formatNumber(defaultMetrics.articles)} articles from {defaultMetrics.sources} sources
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={mukokoTheme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    );
  }

  // Compact variant - horizontal stats row
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactHeader}>
          <MaterialCommunityIcons
            name="chart-box"
            size={18}
            color={mukokoTheme.colors.primary}
          />
          <Text style={styles.compactTitle}>Live Insights</Text>
          <Text style={styles.compactUpdated}>{defaultMetrics.lastUpdated}</Text>
        </View>
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>
              {formatNumber(defaultMetrics.articles)}
            </Text>
            <Text style={styles.compactStatLabel}>Articles</Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>
              {formatNumber(defaultMetrics.sources)}
            </Text>
            <Text style={styles.compactStatLabel}>Sources</Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>
              {formatNumber(defaultMetrics.categories)}
            </Text>
            <Text style={styles.compactStatLabel}>Categories</Text>
          </View>
        </View>
      </View>
    );
  }

  // Full variant - comprehensive insights card
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="chart-timeline-variant"
            size={14}
            color={mukokoTheme.colors.primary}
          />
          <Text style={styles.badgeText}>INSIGHTS</Text>
        </View>
        <Text style={styles.updated}>Updated {defaultMetrics.lastUpdated}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Zimbabwe News at a Glance</Text>
      <Text style={styles.subtitle}>
        Real-time coverage from trusted sources
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="newspaper-variant-multiple"
            size={24}
            color={mukokoTheme.colors.primary}
          />
          <Text style={styles.statValue}>{formatNumber(defaultMetrics.articles)}</Text>
          <Text style={styles.statLabel}>Articles</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="source-branch"
            size={24}
            color={mukokoTheme.colors.accent}
          />
          <Text style={styles.statValue}>{formatNumber(defaultMetrics.sources)}</Text>
          <Text style={styles.statLabel}>Sources</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="folder-multiple"
            size={24}
            color={mukokoTheme.colors.secondary}
          />
          <Text style={styles.statValue}>{formatNumber(defaultMetrics.categories)}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="eye"
            size={24}
            color={mukokoTheme.colors.onSurfaceVariant}
          />
          <Text style={styles.statValue}>{formatNumber(defaultMetrics.views)}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
      </View>

      {/* Trending Topics */}
      {defaultMetrics.trending.length > 0 && (
        <View style={styles.trendingSection}>
          <View style={styles.trendingHeader}>
            <MaterialCommunityIcons
              name="fire"
              size={16}
              color={mukokoTheme.colors.accent}
            />
            <Text style={styles.trendingTitle}>Trending Now</Text>
          </View>
          <View style={styles.trendingChips}>
            {defaultMetrics.trending.slice(0, 4).map((topic, index) => (
              <View key={index} style={styles.trendingChip}>
                <Text style={styles.trendingChipText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.ctaText}>Explore More</Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color={mukokoTheme.colors.onPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ============ FULL VARIANT ============
  container: {
    backgroundColor: mukokoTheme.colors.surface,
    borderRadius: 16,
    padding: mukokoTheme.spacing.lg,
    marginHorizontal: mukokoTheme.spacing.md,
    marginVertical: mukokoTheme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mukokoTheme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 166, 81, 0.1)',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.primary,
    letterSpacing: 0.5,
  },
  updated: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  title: {
    fontSize: 22,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    color: mukokoTheme.colors.onSurface,
    marginBottom: mukokoTheme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
    marginBottom: mukokoTheme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
    padding: mukokoTheme.spacing.md,
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  trendingSection: {
    marginBottom: mukokoTheme.spacing.md,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
    marginBottom: mukokoTheme.spacing.sm,
  },
  trendingTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  trendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.xs,
  },
  trendingChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: 16,
  },
  trendingChipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mukokoTheme.colors.primary,
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: 24,
    gap: mukokoTheme.spacing.xs,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onPrimary,
  },

  // ============ COMPACT VARIANT ============
  compactContainer: {
    backgroundColor: mukokoTheme.colors.surface,
    borderRadius: 12,
    padding: mukokoTheme.spacing.md,
    marginHorizontal: mukokoTheme.spacing.md,
    marginVertical: mukokoTheme.spacing.xs,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
    marginBottom: mukokoTheme.spacing.sm,
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onSurface,
    flex: 1,
  },
  compactUpdated: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  compactStat: {
    alignItems: 'center',
    flex: 1,
  },
  compactStatValue: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  compactStatLabel: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  compactStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 24,
    marginHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  minimalText: {
    flex: 1,
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
});
