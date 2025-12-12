/**
 * SearchPromo Component
 * Promotes the search functionality with suggested queries
 * Can be placed on Home, Discover, or other screens
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import mukokoTheme from '../theme';

// Suggested search queries for Zimbabwe news
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
        style={[styles.minimalContainer, style]}
        onPress={() => handleSearchPress()}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={mukokoTheme.colors.onSurfaceVariant}
        />
        <Text style={styles.minimalText}>Search for news...</Text>
      </TouchableOpacity>
    );
  }

  // Compact variant - single row with a few suggestions
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity
          style={styles.compactSearchBar}
          onPress={() => handleSearchPress()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={mukokoTheme.colors.onSurfaceVariant}
          />
          <Text style={styles.compactSearchText}>Search news</Text>
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactSuggestions}
        >
          {queries.slice(0, 4).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.compactChip}
              onPress={() => handleSearchPress(item.query)}
              activeOpacity={0.7}
            >
              <Text style={styles.compactChipText}>{item.query}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Full variant - promotional card with header and suggestions
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color={mukokoTheme.colors.accent}
          />
          <Text style={styles.badgeText}>DISCOVER</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Find what matters to you</Text>
      <Text style={styles.subtitle}>
        Search for topics, sources, or keywords
      </Text>

      {/* Search Suggestions */}
      <View style={styles.suggestionsGrid}>
        {queries.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => handleSearchPress(item.query)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={18}
              color={mukokoTheme.colors.accent}
            />
            <Text style={styles.suggestionText}>{item.query}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => handleSearchPress()}
        activeOpacity={0.7}
      >
        <Text style={styles.ctaText}>Open Search</Text>
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
    marginBottom: mukokoTheme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 99, 74, 0.1)',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.accent,
    letterSpacing: 0.5,
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
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 20,
    gap: mukokoTheme.spacing.xs,
  },
  suggestionText: {
    fontSize: 14,
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
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  compactSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 24,
    gap: mukokoTheme.spacing.sm,
  },
  compactSearchText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  compactSuggestions: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.xs,
  },
  compactChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: 16,
  },
  compactChipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 24,
    marginHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  minimalText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
});
