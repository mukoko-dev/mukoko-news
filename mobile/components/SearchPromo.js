/**
 * SearchPromo Component
 * Promotes the search functionality with suggested queries
 * Uses PRIMARY color tint for unique search identity
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import mukokoTheme from '../theme';

// Suggested search queries for African news
const SUGGESTED_QUERIES = [
  { query: 'latest politics', icon: 'magnify' },
  { query: 'business news', icon: 'magnify' },
  { query: 'sports updates', icon: 'magnify' },
  { query: 'breaking news', icon: 'magnify' },
  { query: 'entertainment', icon: 'magnify' },
  { query: 'local stories', icon: 'magnify' },
];

/**
 * SearchPromo - Promotes search functionality
 * Uses PRIMARY (purple) color for unique search identity
 *
 * @param {string} variant - 'full' | 'compact' | 'minimal'
 * @param {Function} onSearchPress - Optional callback when search is pressed
 * @param {Array} queries - Optional custom queries array
 */
export default function SearchPromo({
  variant = 'full',
  onSearchPress,
  queries = SUGGESTED_QUERIES,
  style,
}) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Primary-tinted glass colors for search identity (purple)
  const primaryGlass = {
    background: theme.colors.glassCard || theme.colors.surface,
    border: theme.colors.glassBorder || theme.colors.outline,
    chip: theme.colors.glass || 'rgba(94, 87, 114, 0.08)',
    chipBorder: theme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
  };

  const handleSearchPress = (query = '') => {
    if (onSearchPress) {
      onSearchPress(query);
    } else {
      navigation.navigate('Search', { initialQuery: query });
    }
  };

  // Minimal variant - just a search bar prompt
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[
          styles.minimalContainer,
          {
            backgroundColor: primaryGlass.chip,
            borderWidth: 1,
            borderColor: primaryGlass.chipBorder,
          },
          style
        ]}
        onPress={() => handleSearchPress()}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.primary}
        />
        <Text style={[styles.minimalText, { color: theme.colors.onSurfaceVariant }]}>
          Search for news...
        </Text>
      </TouchableOpacity>
    );
  }

  // Compact variant - single row with a few suggestions
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity
          style={[
            styles.compactSearchBar,
            {
              backgroundColor: primaryGlass.chip,
              borderWidth: 1,
              borderColor: primaryGlass.chipBorder,
            }
          ]}
          onPress={() => handleSearchPress()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.compactSearchText, { color: theme.colors.onSurfaceVariant }]}>
            Search news
          </Text>
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactSuggestions}
        >
          {queries.slice(0, 4).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.compactChip,
                {
                  backgroundColor: primaryGlass.chip,
                  borderWidth: 1,
                  borderColor: primaryGlass.chipBorder,
                }
              ]}
              onPress={() => handleSearchPress(item.query)}
              activeOpacity={0.7}
            >
              <Text style={[styles.compactChipText, { color: theme.colors.onSurface }]}>
                {item.query}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Full variant - promotional card with header and suggestions
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: primaryGlass.background,
        borderWidth: 1,
        borderColor: primaryGlass.border,
      },
      style
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: primaryGlass.chip }]}>
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color={theme.colors.primary}
          />
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>SEARCH</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Find what matters to you
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Search for topics, sources, or keywords
      </Text>

      {/* Search Suggestions */}
      <View style={styles.suggestionsGrid}>
        {queries.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionChip,
              {
                backgroundColor: primaryGlass.chip,
                borderWidth: 1,
                borderColor: primaryGlass.chipBorder,
              }
            ]}
            onPress={() => handleSearchPress(item.query)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.suggestionText, { color: theme.colors.onSurface }]}>
              {item.query}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA - Uses primary color */}
      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleSearchPress()}
        activeOpacity={0.7}
      >
        <Text style={[styles.ctaText, { color: theme.colors.onPrimary }]}>Open Search</Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color={theme.colors.onPrimary}
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
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 20,
    gap: mukokoTheme.spacing.xs,
  },
  suggestionText: {
    fontSize: 14,
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
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  compactSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 24,
    gap: mukokoTheme.spacing.sm,
  },
  compactSearchText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  compactSuggestions: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.xs,
  },
  compactChip: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: 16,
  },
  compactChipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
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
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
