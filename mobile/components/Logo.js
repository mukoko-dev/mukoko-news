import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import mukokoTheme from '../theme';

// Import logo asset
const logoIcon = require('../assets/mukoko-logo-compact.png');

/**
 * Logo Component
 * Displays the Mukoko logo - icon with serif wordmark
 *
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showText - Whether to show text next to logo
 * @param {string} textStyle - 'light' | 'dark' - text color for different backgrounds
 */
export default function Logo({
  size = 'md',
  showText = true,
  textStyle = 'dark',
  // Legacy prop for backwards compatibility
  theme,
  style,
}) {
  const sizes = {
    sm: { logoSize: 32, fontSize: 20, spacing: 8 },
    md: { logoSize: 40, fontSize: 24, spacing: 10 },
    lg: { logoSize: 52, fontSize: 32, spacing: 12 },
  };

  const { logoSize, fontSize, spacing } = sizes[size];

  // Use theme prop if provided for backwards compatibility, otherwise use textStyle
  const effectiveStyle = theme || textStyle;

  // textStyle: 'dark' = dark/black text (for light backgrounds)
  //            'light' = light/white text (for dark backgrounds)
  const textColor = effectiveStyle === 'dark'
    ? mukokoTheme.colors.onSurface
    : mukokoTheme.colors.onPrimary;

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
        <Text style={[styles.logoText, { fontSize, color: textColor }]}>
          Mukoko
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '700',
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
});
