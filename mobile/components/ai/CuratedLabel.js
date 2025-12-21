import React from 'react';
import { View, Text as RNText } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AISparkleIcon from './AISparkleIcon';

/**
 * CuratedLabel - Subtle AI indicator label
 *
 * Variants:
 * - "AI-enhanced search" - Search results
 * - "Trending now" - Trending sections
 * - "Popular this week" - Discover sections
 * - "Smart results" - AI-curated content
 * - "Curated for you" - Personalized content
 *
 * Design: Small, elegant label with optional sparkle icon
 *
 * Migration: NativeWind + ThemeContext only (NO React Native Paper, NO StyleSheet)
 */

const LABEL_PRESETS = {
  search: 'AI-enhanced search',
  trending: 'Trending now',
  popular: 'Popular this week',
  smart: 'Smart results',
  curated: 'Curated for you',
  enhanced: 'AI-enhanced',
};

export default function CuratedLabel({
  variant = 'enhanced',
  label,
  showIcon = true,
  iconPosition = 'left',
  size = 'medium',
  style,
}) {
  const { theme, isDark } = useTheme();

  const displayLabel = label || LABEL_PRESETS[variant] || LABEL_PRESETS.enhanced;

  const sizeConfig = {
    small: { fontSize: 10, iconSize: 10, padding: 'px-[6px] py-[2px]' },
    medium: { fontSize: 11, iconSize: 12, padding: 'px-sm py-xs' },
    large: { fontSize: 12, iconSize: 14, padding: 'px-[10px] py-[6px]' },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const backgroundColor = isDark
    ? 'rgba(179, 136, 255, 0.12)'
    : 'rgba(75, 0, 130, 0.08)';

  return (
    <View
      className={`flex-row items-center self-start rounded-sm ${currentSize.padding}`}
      style={[{ backgroundColor }, style]}
    >
      {showIcon && iconPosition === 'left' && (
        <AISparkleIcon
          size={currentSize.iconSize}
          style={{ marginRight: 4 }}
          animated={false}
        />
      )}
      <RNText
        className="font-sans-medium"
        style={{ fontSize: currentSize.fontSize, color: theme.colors.tanzanite }}
      >
        {displayLabel}
      </RNText>
      {showIcon && iconPosition === 'right' && (
        <AISparkleIcon
          size={currentSize.iconSize}
          style={{ marginLeft: 4 }}
          animated={false}
        />
      )}
    </View>
  );
}
