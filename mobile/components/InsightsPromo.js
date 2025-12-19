/**
 * InsightsPromo Component
 * Large, attention-grabbing component showcasing platform insights
 * Consistent design with LoginPromo - uses ACCENT color (terracotta)
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import mukokoTheme from '../theme';

/**
 * InsightsPromo - Large promotional component displaying platform metrics
 * Designed to STAND OUT and match LoginPromo's visual style
 *
 * @param {string} variant - 'hero' | 'card' | 'banner' | 'minimal'
 * @param {Object} metrics - Real metrics data { articles, views, trending, sources }
 * @param {Function} onPress - Optional callback when pressed
 */
export default function InsightsPromo({
  variant = 'hero',
  metrics = {},
  onPress,
  style,
}) {
  const navigation = useNavigation();
  const paperTheme = usePaperTheme();

  // Bold accent colors for prominence (matching LoginPromo)
  const accentColor = paperTheme.colors.tertiary || '#D4634A';
  const accentDark = '#B84D38';

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

  // HERO variant - Full-width attention-grabbing promo
  if (variant === 'hero') {
    return (
      <TouchableOpacity
        style={[styles.heroContainer, style]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityLabel="View platform insights"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[accentColor, accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Decorative elements */}
          <View style={styles.heroDecorativeCircle} />
          <View style={styles.heroDecorativeCircle2} />

          {/* Content */}
          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={16} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>LIVE INSIGHTS</Text>
            </View>

            {/* Headline */}
            <Text style={styles.heroHeadline}>
              African News{'\n'}at a Glance
            </Text>

            <Text style={styles.heroSubheadline}>
              Real-time coverage from {defaultMetrics.sources}+ trusted sources across {defaultMetrics.categories} categories.
            </Text>

            {/* Stats grid */}
            <View style={styles.heroStats}>
              {[
                { icon: 'newspaper-variant-multiple', value: formatNumber(defaultMetrics.articles), label: 'Articles' },
                { icon: 'source-branch', value: formatNumber(defaultMetrics.sources), label: 'Sources' },
                { icon: 'folder-multiple', value: formatNumber(defaultMetrics.categories), label: 'Categories' },
                { icon: 'eye', value: formatNumber(defaultMetrics.views), label: 'Views' },
              ].map((stat, index) => (
                <View key={index} style={styles.heroStatItem}>
                  <MaterialCommunityIcons name={stat.icon} size={22} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroStatValue}>{stat.value}</Text>
                  <Text style={styles.heroStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Trending topics */}
            {defaultMetrics.trending.length > 0 && (
              <View style={styles.heroTrending}>
                <View style={styles.heroTrendingHeader}>
                  <MaterialCommunityIcons name="fire" size={18} color="#FFFFFF" />
                  <Text style={styles.heroTrendingTitle}>Trending Now</Text>
                </View>
                <View style={styles.heroTrendingChips}>
                  {defaultMetrics.trending.slice(0, 3).map((topic, index) => (
                    <View key={index} style={styles.heroTrendingChip}>
                      <Text style={styles.heroTrendingChipText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* CTA Button */}
            <View style={styles.heroPrimaryButton}>
              <Text style={[styles.heroPrimaryButtonText, { color: accentColor }]}>
                Explore Insights
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={22} color={accentColor} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // CARD variant - Large card with visual impact
  if (variant === 'card') {
    return (
      <TouchableOpacity
        style={[styles.cardContainer, { backgroundColor: paperTheme.colors.surface }, style]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityLabel="View platform insights"
        accessibilityRole="button"
      >
        {/* Accent header strip */}
        <View style={[styles.cardHeader, { backgroundColor: accentColor }]}>
          <MaterialCommunityIcons name="chart-box" size={28} color="#FFFFFF" />
          <Text style={styles.cardHeaderText}>PLATFORM INSIGHTS</Text>
        </View>

        {/* Main content */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]}>
            African News Coverage
          </Text>

          <Text style={[styles.cardDescription, { color: paperTheme.colors.onSurfaceVariant }]}>
            Real-time aggregation from trusted sources across the continent
          </Text>

          {/* Stats Grid */}
          <View style={styles.cardStatsGrid}>
            {[
              { icon: 'newspaper-variant-multiple', value: formatNumber(defaultMetrics.articles), label: 'Articles', color: accentColor },
              { icon: 'source-branch', value: formatNumber(defaultMetrics.sources), label: 'Sources', color: accentColor },
              { icon: 'folder-multiple', value: formatNumber(defaultMetrics.categories), label: 'Categories', color: accentColor },
              { icon: 'eye', value: formatNumber(defaultMetrics.views), label: 'Views', color: paperTheme.colors.onSurfaceVariant },
            ].map((stat, index) => (
              <View
                key={index}
                style={[styles.cardStatItem, { backgroundColor: `${accentColor}10`, borderColor: `${accentColor}25` }]}
              >
                <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
                <Text style={[styles.cardStatValue, { color: paperTheme.colors.onSurface }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.cardStatLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Trending topics */}
          {defaultMetrics.trending.length > 0 && (
            <View style={styles.cardTrending}>
              <View style={styles.cardTrendingHeader}>
                <MaterialCommunityIcons name="fire" size={18} color={accentColor} />
                <Text style={[styles.cardTrendingTitle, { color: paperTheme.colors.onSurface }]}>
                  Trending Now
                </Text>
              </View>
              <View style={styles.cardTrendingChips}>
                {defaultMetrics.trending.slice(0, 4).map((topic, index) => (
                  <View
                    key={index}
                    style={[styles.cardTrendingChip, { backgroundColor: `${accentColor}12`, borderColor: `${accentColor}20` }]}
                  >
                    <Text style={[styles.cardTrendingChipText, { color: paperTheme.colors.onSurface }]}>
                      {topic}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CTA */}
          <View style={[styles.cardPrimaryButton, { backgroundColor: accentColor }]}>
            <MaterialCommunityIcons name="compass" size={22} color="#FFFFFF" />
            <Text style={styles.cardPrimaryButtonText}>Explore More</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // BANNER variant - Prominent horizontal banner
  if (variant === 'banner') {
    return (
      <TouchableOpacity
        style={[styles.bannerContainer, style]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityLabel="View platform insights"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[accentColor, accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconBg}>
                <MaterialCommunityIcons name="chart-line" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>
                  {formatNumber(defaultMetrics.articles)} Articles
                </Text>
                <Text style={styles.bannerSubtitle}>
                  From {defaultMetrics.sources} sources • Updated {defaultMetrics.lastUpdated}
                </Text>
              </View>
            </View>
            <View style={styles.bannerButton}>
              <Text style={[styles.bannerButtonText, { color: accentColor }]}>View</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={accentColor} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // MINIMAL variant - Subtle but noticeable
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[
          styles.minimalContainer,
          {
            backgroundColor: `${accentColor}15`,
            borderColor: `${accentColor}30`,
          },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel="View platform insights"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="chart-line" size={24} color={accentColor} />
        <View style={styles.minimalTextContainer}>
          <Text style={[styles.minimalTitle, { color: paperTheme.colors.onSurface }]}>
            {formatNumber(defaultMetrics.articles)} articles
          </Text>
          <Text style={[styles.minimalSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            From {defaultMetrics.sources} sources
          </Text>
        </View>
        <View style={[styles.minimalArrow, { backgroundColor: accentColor }]}>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // ============ HERO VARIANT ============
  heroContainer: {
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecorativeCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 1,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubheadline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 320,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  heroStatItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  heroTrending: {
    width: '100%',
    marginBottom: 24,
  },
  heroTrendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  heroTrendingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  heroTrendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  heroTrendingChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroTrendingChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 10,
    minWidth: 200,
    borderWidth: 1,
  },
  heroPrimaryButtonText: {
    fontSize: 17,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ CARD VARIANT ============
  cardContainer: {
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 1,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 300,
  },
  cardStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  cardStatItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  cardStatValue: {
    fontSize: 22,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  cardStatLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  cardTrending: {
    width: '100%',
    marginBottom: 20,
  },
  cardTrendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTrendingTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  cardTrendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTrendingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTrendingChipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  cardPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 10,
    width: '100%',
  },
  cardPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ BANNER VARIANT ============
  bannerContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bannerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  bannerButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    borderWidth: 2,
    gap: 14,
  },
  minimalTextContainer: {
    flex: 1,
  },
  minimalTitle: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  minimalSubtitle: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  minimalArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
