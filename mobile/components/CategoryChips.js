/**
 * CategoryChips Component
 * Horizontal scrollable category filter with proper spacing and visual feedback
 * Following 2025 news app design patterns
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

// Category icon mapping
const CATEGORY_ICONS = {
  all: 'newspaper-variant-multiple-outline',
  politics: 'bank',
  business: 'chart-line',
  sports: 'soccer',
  entertainment: 'movie-open',
  technology: 'laptop',
  health: 'heart-pulse',
  world: 'earth',
  local: 'map-marker',
  opinion: 'comment-quote',
  breaking: 'lightning-bolt',
};

/**
 * CategoryChips - Horizontal scrollable category filter
 *
 * @param {Array} categories - Array of category objects { id, name, slug, article_count }
 * @param {string|null} selectedCategory - Currently selected category slug
 * @param {Function} onCategoryPress - Callback when a category is pressed
 * @param {boolean} showAll - Whether to show "All" chip at the start
 * @param {boolean} showCounts - Whether to show article counts
 * @param {boolean} showIcons - Whether to show category icons
 */
export default function CategoryChips({
  categories = [],
  selectedCategory = null,
  onCategoryPress,
  showAll = true,
  showCounts = false,
  showIcons = false,
  style,
}) {
  const allCategories = showAll
    ? [{ id: 'all', name: 'All', slug: null }, ...categories]
    : categories;

  const getIconName = (categoryName) => {
    const lowerName = categoryName.toLowerCase();
    return CATEGORY_ICONS[lowerName] || 'tag-outline';
  };

  const isSelected = (category) => {
    if (category.slug === null && selectedCategory === null) return true;
    return category.slug === selectedCategory || category.id === selectedCategory;
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
          const iconName = getIconName(category.name);

          return (
            <TouchableOpacity
              key={category.id || category.slug || index}
              activeOpacity={0.7}
              onPress={() => onCategoryPress(category.slug || category.id)}
              style={[
                styles.chip,
                selected && styles.chipSelected,
                index === 0 && styles.chipFirst,
              ]}
            >
              {showIcons && (
                <MaterialCommunityIcons
                  name={iconName}
                  size={16}
                  color={selected ? mukokoTheme.colors.onPrimary : mukokoTheme.colors.onSurfaceVariant}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
              {showCounts && category.article_count > 0 && (
                <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
                  <Text style={[styles.countText, selected && styles.countTextSelected]}>
                    {category.article_count > 99 ? '99+' : category.article_count}
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
  style,
}) {
  const isSelected = (categorySlug) => selectedCategories.includes(categorySlug);

  return (
    <View style={[styles.pillsContainer, style]}>
      {categories.map((category, index) => {
        const selected = isSelected(category.slug || category.id);

        return (
          <TouchableOpacity
            key={category.id || category.slug || index}
            activeOpacity={0.7}
            onPress={() => onCategoryToggle(category.slug || category.id)}
            style={[
              styles.pill,
              selected && styles.pillSelected,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                selected && styles.pillTextSelected,
              ]}
            >
              {category.name}
            </Text>
            {selected && (
              <MaterialCommunityIcons
                name="check"
                size={14}
                color={mukokoTheme.colors.onPrimary}
                style={styles.pillCheck}
              />
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
    backgroundColor: mukokoTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: mukokoTheme.colors.outlineVariant,
  },
  scrollContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mukokoTheme.colors.surfaceVariant,
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm - 2,
    borderRadius: mukokoTheme.roundness,
    marginRight: mukokoTheme.spacing.xs,
  },
  chipFirst: {
    marginLeft: 0,
  },
  chipSelected: {
    backgroundColor: mukokoTheme.colors.primary,
  },
  chipIcon: {
    marginRight: mukokoTheme.spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
    letterSpacing: 0.1,
  },
  chipTextSelected: {
    color: mukokoTheme.colors.onPrimary,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  countBadge: {
    marginLeft: mukokoTheme.spacing.xs,
    backgroundColor: mukokoTheme.colors.outline,
    paddingHorizontal: mukokoTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  countTextSelected: {
    color: mukokoTheme.colors.onPrimary,
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
    backgroundColor: mukokoTheme.colors.surfaceVariant,
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    borderColor: mukokoTheme.colors.outline,
  },
  pillSelected: {
    backgroundColor: mukokoTheme.colors.primary,
    borderColor: mukokoTheme.colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  pillTextSelected: {
    color: mukokoTheme.colors.onPrimary,
  },
  pillCheck: {
    marginLeft: mukokoTheme.spacing.xs,
  },
});
