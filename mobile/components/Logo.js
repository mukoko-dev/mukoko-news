import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import mukokoTheme from '../theme';

// Import logo asset
const logoIcon = require('../assets/mukoko-logo-compact.png');

/**
 * Logo Component
 * Displays the Mukoko News logo with different variants
 *
 * @param {string} variant - 'compact' | 'horizontal' | 'stacked'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showText - Whether to show text next to logo
 * @param {boolean} showFlag - Whether to show Zimbabwe flag emoji (default: false for cleaner headers)
 * @param {string} textStyle - 'light' | 'dark' - 'light' = white text (for dark backgrounds), 'dark' = black text (for light backgrounds)
 */
export default function Logo({
  variant = 'compact',
  size = 'md',
  showText = true,
  showFlag = false,
  textStyle = 'dark',
  // Legacy prop for backwards compatibility
  theme,
  style,
}) {
  const sizes = {
    sm: { logoSize: 32, mukokoSize: 10, newsSize: 16, spacing: 6 },
    md: { logoSize: 40, mukokoSize: 12, newsSize: 20, spacing: 8 },
    lg: { logoSize: 52, mukokoSize: 14, newsSize: 26, spacing: 10 },
  };

  const { logoSize, mukokoSize, newsSize, spacing } = sizes[size];

  // Use theme prop if provided for backwards compatibility, otherwise use textStyle
  const effectiveStyle = theme || textStyle;

  // textStyle: 'dark' = dark/black text (for light backgrounds like white headers)
  //            'light' = light/white text (for dark backgrounds like colored buttons)
  const textColor = effectiveStyle === 'dark'
    ? mukokoTheme.colors.onSurface      // Dark text for light backgrounds
    : mukokoTheme.colors.onPrimary;      // Light/white text for dark backgrounds

  // Horizontal variant - icon with inline "Mukoko News" text
  if (variant === 'horizontal') {
    return (
      <View style={[styles.container, { gap: spacing }, style]}>
        <Image
          source={logoIcon}
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: logoSize / 4,
          }}
          resizeMode="contain"
        />
        <Text style={[styles.text, { fontSize: newsSize, color: textColor }]}>
          Mukoko News
        </Text>
        {showFlag && <Text style={[styles.flag, { fontSize: newsSize * 0.8 }]}>🇿🇼</Text>}
      </View>
    );
  }

  // Compact/Stacked variant (default) - icon with stacked "Mukoko" (small) and "News" (large)
  return (
    <View style={[styles.container, { gap: spacing }, style]}>
      <Image
        source={logoIcon}
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: logoSize / 4,
        }}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.stackedText}>
          <Text style={[styles.mukokoText, { fontSize: mukokoSize, color: textColor }]}>
            MUKOKO
          </Text>
          <Text style={[styles.newsText, { fontSize: newsSize, color: textColor }]}>
            News
          </Text>
        </View>
      )}
      {showFlag && <Text style={[styles.flag, { fontSize: newsSize * 0.8 }]}>🇿🇼</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  stackedText: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  mukokoText: {
    fontWeight: '600',
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    letterSpacing: 1.5,
    lineHeight: 12,
    marginBottom: -2,
  },
  newsText: {
    fontWeight: '700',
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    lineHeight: 20,
  },
  flag: {
    lineHeight: 24,
  },
});
