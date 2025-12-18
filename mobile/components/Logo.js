import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import mukokoTheme from '../theme';

// Import logo assets
const logoIconDark = require('../assets/mukoko-icon-dark.png');
const logoIconLight = require('../assets/mukoko-icon-light.png');

/**
 * Logo Component
 * Displays the Mukoko logo - icon with serif wordmark
 *
 * @param {string} size - 'icon' | 'sm' | 'md' | 'lg' ('icon' = logo only, no text)
 * @param {boolean} showText - Whether to show text next to logo (ignored for 'icon' size)
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
    icon: { logoSize: 28, fontSize: 0, spacing: 0 }, // Icon only, no text
    sm: { logoSize: 32, fontSize: 20, spacing: 4 },
    md: { logoSize: 40, fontSize: 24, spacing: 4 },
    lg: { logoSize: 52, fontSize: 32, spacing: 4 },
  };

  // Icon size implies no text
  const shouldShowText = size === 'icon' ? false : showText;

  const { logoSize, fontSize, spacing } = sizes[size] || sizes.md;

  // Use theme prop if provided for backwards compatibility, otherwise use textStyle
  const effectiveStyle = theme || textStyle;

  // textStyle: 'dark' = dark/black text (for light backgrounds) - use dark icon
  //            'light' = light/white text (for dark backgrounds) - use light icon
  const textColor = effectiveStyle === 'dark'
    ? mukokoTheme.colors.onSurface
    : mukokoTheme.colors.onPrimary;
  const logoIcon = effectiveStyle === 'dark' ? logoIconDark : logoIconLight;

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
      {shouldShowText && (
        <Text style={[styles.logoText, { fontSize, color: textColor }]}>
          Mukoko News
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
