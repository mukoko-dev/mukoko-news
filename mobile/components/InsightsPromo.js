/**
 * InsightsPromo Component
 * Showcases platform insights and real metrics
 * Uses ACCENT color tint for unique insights identity
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import mukokoTheme from '../theme';

/**
 * InsightsPromo - Displays platform metrics and insights
 * Uses ACCENT (terracotta) color for unique insights identity
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
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;

  // Accent-tinted glass colors for insights identity (terracotta)
  const accentGlass = {
    background: paperTheme.colors.glassAccentCard || paperTheme.colors.surface,
    border: paperTheme.colors.glassAccentBorder || paperTheme.colors.outline,
    chip: paperTheme.colors.glassAccent || 'rgba(212, 99, 74, 0.08)',
    chipBorder: paperTheme.colors.glassAccentBorder || 'rgba(212, 99, 74, 0.15)',
  };

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
        style={[
          styles.minimalContainer,
          {
            backgroundColor: accentGlass.chip,
            borderWidth: 1,
            borderColor: accentGlass.chipBorder,
          },
          style
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="chart-line"
          size={18}
          color={paperTheme.colors.tertiary}
        />
        <Text style={[styles.minimalText, { color: paperTheme.colors.onSurfaceVariant }]}>
          {formatNumber(defaultMetrics.articles)} articles from {defaultMetrics.sources} sources
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={paperTheme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    );
  }

  // Compact variant - horizontal stats row
  if (variant === 'compact') {
    return (
      <View style={[
        styles.compactContainer,
        {
          backgroundColor: accentGlass.background,
          borderWidth: 1,
          borderColor: accentGlass.border,
        },
        style
      ]}>
        <View style={styles.compactHeader}>
          <MaterialCommunityIcons
            name="chart-box"
            size={18}
            color={paperTheme.colors.tertiary}
          />
          <Text style={[styles.compactTitle, { color: paperTheme.colors.onSurface }]}>
            Live Insights
          </Text>
          <Text style={[styles.compactUpdated, { color: paperTheme.colors.onSurfaceVariant }]}>
            {defaultMetrics.lastUpdated}
          </Text>
        </View>
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Text style={[styles.compactStatValue, { color: paperTheme.colors.onSurface }]}>
              {formatNumber(defaultMetrics.articles)}
            </Text>
            <Text style={[styles.compactStatLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              Articles
            </Text>
          </View>
          <View style={[styles.compactStatDivider, { backgroundColor: paperTheme.colors.outline }]} />
          <View style={styles.compactStat}>
            <Text style={[styles.compactStatValue, { color: paperTheme.colors.onSurface }]}>
              {formatNumber(defaultMetrics.sources)}
            </Text>
            <Text style={[styles.compactStatLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              Sources
            </Text>
          </View>
          <View style={[styles.compactStatDivider, { backgroundColor: paperTheme.colors.outline }]} />
          <View style={styles.compactStat}>
            <Text style={[styles.compactStatValue, { color: paperTheme.colors.onSurface }]}>
              {formatNumber(defaultMetrics.categories)}
            </Text>
            <Text style={[styles.compactStatLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
              Categories
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Full variant - comprehensive insights card
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: accentGlass.background,
        borderWidth: 1,
        borderColor: accentGlass.border,
      },
      style
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: accentGlass.chip }]}>
          <MaterialCommunityIcons
            name="chart-timeline-variant"
            size={14}
            color={paperTheme.colors.tertiary}
          />
          <Text style={[styles.badgeText, { color: paperTheme.colors.tertiary }]}>INSIGHTS</Text>
        </View>
        <Text style={[styles.updated, { color: paperTheme.colors.onSurfaceVariant }]}>
          Updated {defaultMetrics.lastUpdated}
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
        Zimbabwe News at a Glance
      </Text>
      <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
        Real-time coverage from trusted sources
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[
          styles.statCard,
          {
            backgroundColor: accentGlass.chip,
            borderWidth: 1,
            borderColor: accentGlass.chipBorder,
          }
        ]}>
          <MaterialCommunityIcons
            name="newspaper-variant-multiple"
            size={24}
            color={paperTheme.colors.tertiary}
          />
          <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>
            {formatNumber(defaultMetrics.articles)}
          </Text>
          <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
            Articles
          </Text>
        </View>
        <View style={[
          styles.statCard,
          {
            backgroundColor: accentGlass.chip,
            borderWidth: 1,
            borderColor: accentGlass.chipBorder,
          }
        ]}>
          <MaterialCommunityIcons
            name="source-branch"
            size={24}
            color={paperTheme.colors.tertiary}
          />
          <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>
            {formatNumber(defaultMetrics.sources)}
          </Text>
          <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
            Sources
          </Text>
        </View>
        <View style={[
          styles.statCard,
          {
            backgroundColor: accentGlass.chip,
            borderWidth: 1,
            borderColor: accentGlass.chipBorder,
          }
        ]}>
          <MaterialCommunityIcons
            name="folder-multiple"
            size={24}
            color={paperTheme.colors.tertiary}
          />
          <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>
            {formatNumber(defaultMetrics.categories)}
          </Text>
          <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
            Categories
          </Text>
        </View>
        <View style={[
          styles.statCard,
          {
            backgroundColor: accentGlass.chip,
            borderWidth: 1,
            borderColor: accentGlass.chipBorder,
          }
        ]}>
          <MaterialCommunityIcons
            name="eye"
            size={24}
            color={paperTheme.colors.onSurfaceVariant}
          />
          <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>
            {formatNumber(defaultMetrics.views)}
          </Text>
          <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
            Views
          </Text>
        </View>
      </View>

      {/* Trending Topics */}
      {defaultMetrics.trending.length > 0 && (
        <View style={styles.trendingSection}>
          <View style={styles.trendingHeader}>
            <MaterialCommunityIcons
              name="fire"
              size={16}
              color={paperTheme.colors.tertiary}
            />
            <Text style={[styles.trendingTitle, { color: paperTheme.colors.onSurface }]}>
              Trending Now
            </Text>
          </View>
          <View style={styles.trendingChips}>
            {defaultMetrics.trending.slice(0, 4).map((topic, index) => (
              <View key={index} style={[
                styles.trendingChip,
                {
                  backgroundColor: accentGlass.chip,
                  borderWidth: 1,
                  borderColor: accentGlass.chipBorder,
                }
              ]}>
                <Text style={[styles.trendingChipText, { color: paperTheme.colors.onSurface }]}>
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CTA - Uses accent color */}
      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: paperTheme.colors.tertiary }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={[styles.ctaText, { color: paperTheme.colors.onTertiary }]}>Explore More</Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color={paperTheme.colors.onTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ============ FULL VARIANT ============
  container: {
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
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 0.5,
  },
  updated: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  title: {
    fontSize: 22,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
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
    borderRadius: 12,
    padding: mukokoTheme.spacing.md,
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
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
  },
  trendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.xs,
  },
  trendingChip: {
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: 16,
  },
  trendingChipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: 24,
    gap: mukokoTheme.spacing.xs,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ COMPACT VARIANT ============
  compactContainer: {
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
    flex: 1,
  },
  compactUpdated: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
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
  },
  compactStatLabel: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  compactStatDivider: {
    width: 1,
    height: 30,
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
});
