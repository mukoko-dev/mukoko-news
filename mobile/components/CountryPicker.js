/**
 * CountryPicker Component
 * Horizontal scrollable and multi-select country filter for Pan-African news feed
 * Following 2025 news app design patterns
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import mukokoTheme from '../theme';

/**
 * CountryChips - Horizontal scrollable country filter with flags
 *
 * @param {Array} countries - Array of country objects { id, name, code, emoji, article_count }
 * @param {string[]|null} selectedCountries - Currently selected country codes
 * @param {Function} onCountryPress - Callback when a country is pressed (for single select)
 * @param {boolean} showAll - Whether to show "All Africa" chip at the start
 * @param {boolean} showCounts - Whether to show article counts
 */
export default function CountryChips({
  countries = [],
  selectedCountries = [],
  onCountryPress,
  showAll = true,
  showCounts = true,
  style,
}) {
  const paperTheme = usePaperTheme();

  const allCountries = showAll
    ? [{ id: 'all', name: 'All Africa', code: 'all', emoji: '🌍' }, ...countries]
    : countries;

  const isSelected = (country) => {
    if (country.code === 'all' && (!selectedCountries || selectedCountries.length === 0)) {
      return true;
    }
    return selectedCountries?.includes(country.code) || selectedCountries?.includes(country.id);
  };

  // Dynamic glass styles based on theme
  const chipGlassStyle = {
    backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.08)',
    borderWidth: 1,
    borderColor: paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
  };

  const chipSelectedStyle = {
    backgroundColor: paperTheme.colors.primary,
    borderColor: paperTheme.colors.primary,
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
        {allCountries.map((country, index) => {
          const selected = isSelected(country);

          return (
            <TouchableOpacity
              key={country.id || country.code || index}
              activeOpacity={0.7}
              onPress={() => onCountryPress(country.code === 'all' ? null : country.code)}
              style={[
                styles.chip,
                chipGlassStyle,
                selected && chipSelectedStyle,
                index === 0 && styles.chipFirst,
              ]}
              accessibilityLabel={`${country.name}${country.article_count ? `, ${country.article_count} articles` : ''}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityHint={`Filter news from ${country.name}`}
            >
              <Text style={styles.chipEmoji}>{country.emoji}</Text>
              <Text
                style={[
                  styles.chipText,
                  { color: paperTheme.colors.onSurface },
                  selected && { color: paperTheme.colors.onPrimary },
                ]}
                numberOfLines={1}
              >
                {country.name}
              </Text>
              {showCounts && (country.article_count > 0 || country.count > 0) && (
                <View style={[
                  styles.countBadge,
                  {
                    backgroundColor: selected
                      ? 'rgba(255,255,255,0.25)'
                      : paperTheme.colors.glass || 'rgba(94, 87, 114, 0.12)',
                    borderWidth: 1,
                    borderColor: selected
                      ? 'rgba(255,255,255,0.15)'
                      : paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.15)',
                  }
                ]}>
                  <Text style={[
                    styles.countText,
                    { color: selected ? paperTheme.colors.onPrimary : paperTheme.colors.onSurfaceVariant }
                  ]}>
                    {(country.article_count || country.count) > 99 ? '99+' : (country.article_count || country.count)}
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
 * CountryPills - Multi-select country pills for preferences/settings
 *
 * @param {Array} countries - Array of country objects { id, name, code, emoji }
 * @param {string[]} selectedCountries - Currently selected country codes
 * @param {Function} onCountryToggle - Callback when a country is toggled
 * @param {string|null} primaryCountry - User's primary country code
 * @param {Function} onSetPrimary - Callback when primary country is set
 * @param {boolean} showPrimaryBadge - Whether to show primary country badge
 */
export function CountryPills({
  countries = [],
  selectedCountries = [],
  onCountryToggle,
  primaryCountry = null,
  onSetPrimary = null,
  showPrimaryBadge = true,
  style,
}) {
  const paperTheme = usePaperTheme();

  const isSelected = (countryCode) => selectedCountries.includes(countryCode);
  const isPrimary = (countryCode) => primaryCountry === countryCode;

  // Dynamic glass styles based on theme
  const pillGlassStyle = {
    backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.08)',
    borderWidth: 1,
    borderColor: paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
  };

  const pillSelectedStyle = {
    backgroundColor: paperTheme.colors.primary,
    borderColor: paperTheme.colors.primary,
  };

  const pillPrimaryStyle = {
    backgroundColor: paperTheme.colors.success || '#779b63',
    borderColor: paperTheme.colors.success || '#779b63',
  };

  return (
    <View style={[styles.pillsContainer, style]}>
      {countries.map((country, index) => {
        const selected = isSelected(country.code || country.id);
        const primary = isPrimary(country.code || country.id);

        return (
          <TouchableOpacity
            key={country.id || country.code || index}
            activeOpacity={0.7}
            onPress={() => onCountryToggle(country.code || country.id)}
            onLongPress={() => {
              if (selected && onSetPrimary) {
                onSetPrimary(country.code || country.id);
              }
            }}
            style={[
              styles.pill,
              pillGlassStyle,
              selected && pillSelectedStyle,
              primary && pillPrimaryStyle,
            ]}
            accessibilityLabel={`${country.name}${primary ? ', primary country' : ''}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityHint={
              selected
                ? `Deselect ${country.name}. Long press to set as primary.`
                : `Select ${country.name} for your news feed`
            }
          >
            <Text style={styles.pillEmoji}>{country.emoji}</Text>
            <Text
              style={[
                styles.pillText,
                { color: paperTheme.colors.onSurface },
                selected && { color: paperTheme.colors.onPrimary },
              ]}
            >
              {country.name}
            </Text>
            {selected && !primary && (
              <Text style={[styles.pillCheck, { color: paperTheme.colors.onPrimary }]}>✓</Text>
            )}
            {primary && showPrimaryBadge && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>★</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * CountryGrid - Grid layout for country selection (onboarding/settings)
 *
 * @param {Array} countries - Array of country objects { id, name, code, emoji, source_count }
 * @param {string[]} selectedCountries - Currently selected country codes
 * @param {Function} onCountryToggle - Callback when a country is toggled
 */
export function CountryGrid({
  countries = [],
  selectedCountries = [],
  onCountryToggle,
  style,
}) {
  const paperTheme = usePaperTheme();

  const isSelected = (countryCode) => selectedCountries.includes(countryCode);

  return (
    <View style={[styles.gridContainer, style]}>
      {countries.map((country, index) => {
        const selected = isSelected(country.code || country.id);

        return (
          <TouchableOpacity
            key={country.id || country.code || index}
            activeOpacity={0.7}
            onPress={() => onCountryToggle(country.code || country.id)}
            style={[
              styles.gridItem,
              {
                backgroundColor: selected
                  ? paperTheme.colors.primary
                  : paperTheme.colors.glass || 'rgba(94, 87, 114, 0.08)',
                borderColor: selected
                  ? paperTheme.colors.primary
                  : paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
              },
            ]}
            accessibilityLabel={`${country.name}${country.source_count ? `, ${country.source_count} news sources` : ''}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
          >
            <Text style={styles.gridEmoji}>{country.emoji}</Text>
            <Text
              style={[
                styles.gridName,
                { color: selected ? paperTheme.colors.onPrimary : paperTheme.colors.onSurface },
              ]}
              numberOfLines={1}
            >
              {country.name}
            </Text>
            {country.source_count > 0 && (
              <Text
                style={[
                  styles.gridSourceCount,
                  { color: selected ? 'rgba(255,255,255,0.7)' : paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {country.source_count} sources
              </Text>
            )}
            {selected && (
              <View style={styles.gridCheck}>
                <Text style={{ color: paperTheme.colors.onPrimary, fontSize: 16 }}>✓</Text>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm + 2,
    minHeight: 44,
    borderRadius: 22,
    marginRight: mukokoTheme.spacing.xs,
    gap: mukokoTheme.spacing.xs,
  },
  chipFirst: {
    marginLeft: 0,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: 0.1,
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
    fontSize: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm + 2,
    minHeight: 44,
    borderRadius: 22,
    gap: mukokoTheme.spacing.xs,
  },
  pillEmoji: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
  pillCheck: {
    fontSize: 12,
    color: mukokoTheme.colors.onPrimary,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  primaryBadge: {
    marginLeft: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ GRID (Settings/Onboarding) ============
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  gridItem: {
    width: '47%',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness.md,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  gridEmoji: {
    fontSize: 32,
    marginBottom: mukokoTheme.spacing.xs,
  },
  gridName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  gridSourceCount: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginTop: 2,
  },
  gridCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
