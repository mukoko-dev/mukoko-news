import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { spacing } from '../constants/design-tokens';

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

  const { logoSize, fontSize, spacing: logoSpacing } = sizes[size] || sizes.md;

  // Use theme prop if provided for backwards compatibility, otherwise use textStyle
  const effectiveStyle = theme || textStyle;

  // Logo text colors - pure black/white for maximum contrast
  // textStyle: 'dark' = dark text (for light backgrounds)
  //            'light' = light text (for dark backgrounds)
  const LOGO_COLORS = {
    dark: '#1a1a1a',  // Dark text on light backgrounds
    light: '#FFFFFF',  // Light text on dark backgrounds
  };

  const textColor = LOGO_COLORS[effectiveStyle] || LOGO_COLORS.dark;
  const logoIcon = effectiveStyle === 'dark' ? logoIconLight : logoIconDark;

  return (
    <View style={[styles.container, { gap: logoSpacing }, style]}>
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
    fontFamily: 'NotoSerif-Bold',
  },
});
