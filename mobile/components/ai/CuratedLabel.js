import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import AISparkleIcon from './AISparkleIcon';
import mukokoTheme from '../../theme';

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
  const theme = useTheme();

  const displayLabel = label || LABEL_PRESETS[variant] || LABEL_PRESETS.enhanced;

  const sizeStyles = {
    small: {
      fontSize: 10,
      iconSize: 10,
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    medium: {
      fontSize: 11,
      iconSize: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    large: {
      fontSize: 12,
      iconSize: 14,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const containerStyle = {
    backgroundColor: theme.dark
      ? 'rgba(179, 136, 255, 0.12)'
      : 'rgba(75, 0, 130, 0.08)',
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    borderRadius: mukokoTheme.roundness / 2,
  };

  const textStyle = {
    fontSize: currentSize.fontSize,
    color: theme.colors.primary,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {showIcon && iconPosition === 'left' && (
        <AISparkleIcon
          size={currentSize.iconSize}
          style={styles.iconLeft}
          animated={false}
        />
      )}
      <Text style={textStyle}>{displayLabel}</Text>
      {showIcon && iconPosition === 'right' && (
        <AISparkleIcon
          size={currentSize.iconSize}
          style={styles.iconRight}
          animated={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
});
