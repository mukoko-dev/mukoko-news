import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import mukokoTheme from '../theme';

// Import logo asset
const logoIcon = require('../assets/mukoko-logo-compact.png');

/**
 * Logo Component
 * Displays the Mukoko News logo with different variants
 *
 * @param {string} variant - 'compact' | 'horizontal' | 'text'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showText - Whether to show text next to logo (for compact variant)
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
    sm: { logoSize: 28, fontSize: 16, spacing: 6 },
    md: { logoSize: 36, fontSize: 20, spacing: 8 },
    lg: { logoSize: 48, fontSize: 28, spacing: 10 },
  };

  const { logoSize, fontSize, spacing } = sizes[size];

  // Use theme prop if provided for backwards compatibility, otherwise use textStyle
  const effectiveStyle = theme || textStyle;

  // textStyle: 'dark' = dark/black text (for light backgrounds like white headers)
  //            'light' = light/white text (for dark backgrounds like colored buttons)
  const textColor = effectiveStyle === 'dark'
    ? mukokoTheme.colors.onSurface      // Dark text for light backgrounds
    : mukokoTheme.colors.onPrimary;      // Light/white text for dark backgrounds

  // Text only variant
  if (variant === 'text') {
    return (
      <View style={[styles.container, { gap: spacing }, style]}>
        <Text style={[styles.text, { fontSize, color: textColor }]}>
          Mukoko News
        </Text>
        {showFlag && <Text style={[styles.flag, { fontSize: fontSize * 0.8 }]}>🇿🇼</Text>}
      </View>
    );
  }

  // Horizontal variant - icon with full "Mukoko News" text
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
        <Text style={[styles.text, { fontSize, color: textColor }]}>
          Mukoko News
        </Text>
        {showFlag && <Text style={[styles.flag, { fontSize: fontSize * 0.8 }]}>🇿🇼</Text>}
      </View>
    );
  }

  // Compact variant (default) - icon with short text
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
        <Text style={[styles.text, { fontSize, color: textColor }]}>
          Mukoko
        </Text>
      )}
      {showFlag && <Text style={[styles.flag, { fontSize: fontSize * 0.8 }]}>🇿🇼</Text>}
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
  flag: {
    lineHeight: 24,
  },
});
