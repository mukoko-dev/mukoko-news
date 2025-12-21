/**
 * CategoryChips Component
 * Horizontal scrollable category filter with emojis, borders, and visual feedback
 * Following 2025 news app design patterns
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import mukokoTheme from '../theme';

// Category emoji mapping - adds visual interest and quick recognition
const CATEGORY_EMOJIS = {
  all: '📰',
  politics: '🏛️',
  business: '💼',
  sports: '⚽',
  entertainment: '🎬',
  technology: '💻',
  health: '🏥',
  world: '🌍',
  local: '📍',
  opinion: '💭',
  breaking: '⚡',
  crime: '🚨',
  education: '📚',
  environment: '🌱',
  lifestyle: '✨',
  agriculture: '🌾',
  mining: '⛏️',
  tourism: '✈️',
  finance: '💰',
  culture: '🎭',
};

/**
 * CategoryChips - Horizontal scrollable category filter with emojis
 *
 * @param {Array} categories - Array of category objects { id, name, slug, article_count }
 * @param {string|null} selectedCategory - Currently selected category slug
 * @param {Function} onCategoryPress - Callback when a category is pressed
 * @param {boolean} showAll - Whether to show "All" chip at the start
 * @param {boolean} showCounts - Whether to show article counts
 * @param {boolean} showEmojis - Whether to show category emojis (default: true)
 */
export default function CategoryChips({
  categories = [],
  selectedCategory = null,
  onCategoryPress,
  showAll = true,
  showCounts = true,  // Default to true to show count badges like old Harare Metro
  showEmojis = true,
  style,
}) {
  const { theme } = useTheme();

  const allCategories = showAll
    ? [{ id: 'all', name: 'All', slug: null }, ...categories]
    : categories;

  const getEmoji = (categoryName) => {
    const lowerName = categoryName.toLowerCase();
    return CATEGORY_EMOJIS[lowerName] || '📄';
  };

  const isSelected = (category) => {
    if (category.slug === null && selectedCategory === null) return true;
    return category.slug === selectedCategory || category.id === selectedCategory;
  };

  // Dynamic glass styles based on theme
  const chipGlassStyle = {
    backgroundColor: theme.colors.surface || 'rgba(94, 87, 114, 0.08)',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder || 'rgba(94, 87, 114, 0.12)',
  };

  const chipSelectedStyle = {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        decelerationRate="fast"
      >
        {allCategories.map((category, index) => {
          const selected = isSelected(category);
          const emoji = getEmoji(category.name);

          return (
            <TouchableOpacity
              key={category.id || category.slug || index}
              activeOpacity={0.7}
              onPress={() => onCategoryPress(category.slug || category.id)}
              style={[
                styles.chip,
                chipGlassStyle,
                selected && chipSelectedStyle,
                index === 0 && styles.chipFirst,
              ]}
              accessibilityLabel={`${category.name} category${category.article_count ? `, ${category.article_count} articles` : ''}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityHint={`Filter news by ${category.name} category`}
            >
              {showEmojis && (
                <Text style={styles.chipEmoji}>{emoji}</Text>
              )}
              <Text
                style={[
                  styles.chipText,
                  { color: theme.colors['on-surface'] },
                  selected && { color: theme.colors['on-primary'] },
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
              {showCounts && (category.article_count > 0 || category.count > 0) && (
                <View style={[
                  styles.countBadge,
                  {
                    backgroundColor: selected
                      ? 'rgba(255,255,255,0.25)'
                      : theme.colors.surface || 'rgba(94, 87, 114, 0.12)',
                    borderWidth: 1,
                    borderColor: selected
                      ? 'rgba(255,255,255,0.15)'
                      : theme.colors.surfaceBorder || 'rgba(94, 87, 114, 0.15)',
                  }
                ]}>
                  <Text style={[
                    styles.countText,
                    { color: selected ? theme.colors['on-primary'] : theme.colors['on-surface-variant'] }
                  ]}>
                    {(category.article_count || category.count) > 99 ? '99+' : (category.article_count || category.count)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

/**
 * CategoryPills - Alternative pill-style category selector (for search/discover)
 */
export function CategoryPills({
  categories = [],
  selectedCategories = [],
  onCategoryToggle,
  multiSelect = true,
  showEmojis = true,
  style,
}) {
  const { theme } = useTheme();

  const isSelected = (categorySlug) => selectedCategories.includes(categorySlug);

  const getEmoji = (categoryName) => {
    const lowerName = categoryName.toLowerCase();
    return CATEGORY_EMOJIS[lowerName] || '📄';
  };

  // Dynamic glass styles based on theme
  const pillGlassStyle = {
    backgroundColor: theme.colors.surface || 'rgba(94, 87, 114, 0.08)',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder || 'rgba(94, 87, 114, 0.12)',
  };

  const pillSelectedStyle = {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  };

  return (
    <View style={[styles.pillsContainer, style]}>
      {categories.map((category, index) => {
        const selected = isSelected(category.slug || category.id);
        const emoji = getEmoji(category.name);

        return (
          <TouchableOpacity
            key={category.id || category.slug || index}
            activeOpacity={0.7}
            onPress={() => onCategoryToggle(category.slug || category.id)}
            style={[
              styles.pill,
              pillGlassStyle,
              selected && pillSelectedStyle,
            ]}
            accessibilityLabel={`${category.name} category`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityHint={selected ? `Deselect ${category.name}` : `Select ${category.name}`}
          >
            {showEmojis && (
              <Text style={styles.pillEmoji}>{emoji}</Text>
            )}
            <Text
              style={[
                styles.pillText,
                { color: theme.colors['on-surface'] },
                selected && { color: theme.colors['on-primary'] },
              ]}
            >
              {category.name}
            </Text>
            {selected && (
              <Text style={[styles.pillCheck, { color: theme.colors['on-primary'] }]}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // ============ CHIPS (Horizontal Scroll) ============
  container: {
    backgroundColor: 'transparent',
    // No border - seamless with header and content
  },
  scrollContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xs,
    paddingBottom: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    // Glass effect - semi-transparent with subtle background
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm + 2, // Increased for 44px min height
    minHeight: 44, // WCAG touch target minimum
    borderRadius: 22,
    marginRight: mukokoTheme.spacing.xs,
    // No border for cleaner look
    gap: mukokoTheme.spacing.xs,
  },
  chipFirst: {
    marginLeft: 0,
  },
  chipSelected: {
    backgroundColor: mukokoTheme.colors.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: 0.1,
  },
  chipTextSelected: {
    color: mukokoTheme.colors.onPrimary,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  countBadge: {
    marginLeft: mukokoTheme.spacing.xs,
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12, // Increased from 11 for WCAG readability
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textAlign: 'center',
  },

  // ============ PILLS (Wrap Layout) ============
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    // Glass effect
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm + 2, // Increased for 44px min height
    minHeight: 44, // WCAG touch target minimum
    borderRadius: 22,
    gap: mukokoTheme.spacing.xs,
  },
  pillSelected: {
    backgroundColor: mukokoTheme.colors.primary,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  pillTextSelected: {
    color: mukokoTheme.colors.onPrimary,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  pillCheck: {
    fontSize: 12,
    color: mukokoTheme.colors.onPrimary,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
});
