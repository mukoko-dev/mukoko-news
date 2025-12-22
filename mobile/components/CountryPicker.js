/**
 * CountryPicker Component
 * Horizontal scrollable and multi-select country filter for Pan-African news feed
 * Following 2025 news app design patterns
 *
 * Migration: NativeWind + ThemeContext only (NO React Native Paper, NO StyleSheet)
 */

import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text as RNText,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();

  const allCountries = showAll
    ? [{ id: 'all', name: 'All Africa', code: 'all', emoji: '🌍' }, ...countries]
    : countries;

  const isSelected = (country) => {
    if (country.code === 'all' && (!selectedCountries || selectedCountries.length === 0)) {
      return true;
    }
    return selectedCountries?.includes(country.code) || selectedCountries?.includes(country.id);
  };

  return (
    <View className="bg-transparent" style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-md py-xs pb-sm gap-sm"
        bounces={true}
        decelerationRate="fast"
      >
        {allCountries.map((country, index) => {
          const selected = isSelected(country);

          return (
            <Pressable
              key={country.id || country.code || index}
              className={`flex-row items-center px-md py-sm min-h-touch rounded-[22px] gap-xs mr-xs ${
                index === 0 ? 'ml-0' : ''
              } ${
                selected
                  ? 'bg-tanzanite border border-tanzanite'
                  : 'bg-surface-variant border border-outline'
              }`}
              onPress={() => onCountryPress(country.code === 'all' ? null : country.code)}
              accessibilityLabel={`${country.name}${country.article_count ? `, ${country.article_count} articles` : ''}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityHint={`Filter news from ${country.name}`}
            >
              <RNText className="text-[16px]">{country.emoji}</RNText>
              <RNText
                className={`font-sans-medium text-[14px] ${
                  selected ? 'text-on-primary' : 'text-on-surface'
                }`}
                numberOfLines={1}
              >
                {country.name}
              </RNText>
              {showCounts && (country.article_count > 0 || country.count > 0) && (
                <View
                  className={`ml-xs px-sm py-[3px] rounded-[12px] min-w-[24px] items-center justify-center border ${
                    selected
                      ? 'bg-white/25 border-white/15'
                      : 'bg-surface-variant border-outline'
                  }`}
                >
                  <RNText
                    className={`font-sans-bold text-[12px] text-center ${
                      selected ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {(country.article_count || country.count) > 99 ? '99+' : (country.article_count || country.count)}
                  </RNText>
                </View>
              )}
            </Pressable>
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
  const { theme } = useTheme();

  const isSelected = (countryCode) => selectedCountries.includes(countryCode);
  const isPrimary = (countryCode) => primaryCountry === countryCode;

  return (
    <View className="flex-row flex-wrap gap-sm px-md py-sm" style={style}>
      {countries.map((country, index) => {
        const selected = isSelected(country.code || country.id);
        const primary = isPrimary(country.code || country.id);

        return (
          <Pressable
            key={country.id || country.code || index}
            className={`flex-row items-center px-md py-sm min-h-touch rounded-[22px] gap-xs border ${
              primary
                ? 'bg-success border-success'
                : selected
                ? 'bg-tanzanite border-tanzanite'
                : 'bg-surface-variant border-outline'
            }`}
            onPress={() => onCountryToggle(country.code || country.id)}
            onLongPress={() => {
              if (selected && onSetPrimary) {
                onSetPrimary(country.code || country.id);
              }
            }}
            accessibilityLabel={`${country.name}${primary ? ', primary country' : ''}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityHint={
              selected
                ? `Deselect ${country.name}. Long press to set as primary.`
                : `Select ${country.name} for your news feed`
            }
          >
            <RNText className="text-[16px]">{country.emoji}</RNText>
            <RNText
              className={`font-sans-medium text-[14px] ${
                selected ? 'text-on-primary' : 'text-on-surface'
              }`}
            >
              {country.name}
            </RNText>
            {selected && !primary && (
              <RNText className="font-sans-bold text-[12px] text-on-primary">✓</RNText>
            )}
            {primary && showPrimaryBadge && (
              <View className="ml-[2px] w-[18px] h-[18px] rounded-[9px] bg-white/30 items-center justify-center">
                <RNText className="font-sans-bold text-[12px] text-white">★</RNText>
              </View>
            )}
          </Pressable>
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
  const { theme } = useTheme();

  const isSelected = (countryCode) => selectedCountries.includes(countryCode);

  return (
    <View className="flex-row flex-wrap px-md py-sm gap-sm" style={style}>
      {countries.map((country, index) => {
        const selected = isSelected(country.code || country.id);

        return (
          <Pressable
            key={country.id || country.code || index}
            className={`w-[47%] p-md rounded-card border items-center relative ${
              selected
                ? 'bg-tanzanite border-tanzanite'
                : 'bg-surface-variant border-outline'
            }`}
            onPress={() => onCountryToggle(country.code || country.id)}
            accessibilityLabel={`${country.name}${country.source_count ? `, ${country.source_count} news sources` : ''}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
          >
            <RNText className="text-[32px] mb-xs">{country.emoji}</RNText>
            <RNText
              className={`font-sans-medium text-[14px] text-center ${
                selected ? 'text-on-primary' : 'text-on-surface'
              }`}
              numberOfLines={1}
            >
              {country.name}
            </RNText>
            {country.source_count > 0 && (
              <RNText
                className={`font-sans text-[12px] mt-[2px] ${
                  selected ? 'text-white/70' : 'text-on-surface-variant'
                }`}
              >
                {country.source_count} sources
              </RNText>
            )}
            {selected && (
              <View className="absolute top-[8px] right-[8px] w-[24px] h-[24px] rounded-[12px] bg-white/30 items-center justify-center">
                <RNText className="text-on-primary text-[16px]">✓</RNText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
