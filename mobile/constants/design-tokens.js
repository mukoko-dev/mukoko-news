/**
 * Design Tokens - Single source of truth for design values
 * These values match the CSS variables in global.css
 * Use for calculations and dynamic values that can't be in CSS
 */

/**
 * Spacing scale (4px base unit)
 * Matches --spacing-* in global.css
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

/**
 * Layout constants
 */
export const layout = {
  touchTarget: 44, // WCAG minimum touch target
  touchTargetCompact: 40,
  touchTargetLarge: 48,
  maxContentWidth: 1200,
  cardMaxWidth: 400,
  cardImageWidth: 80,
  cardImageHeight: 80,
  cardImageRadius: 8,
  dividerWidth: 1,
  bottomPaddingMobile: 100,
  bottomPaddingDesktop: 24,
  emojiLarge: 48,
  emojiSmall: 32,
  progressDotSize: 6,
  progressDotActive: 18,
};

/**
 * Border radius
 * Matches --radius-* in global.css
 */
export const radius = {
  button: 24,
  card: 16,
  modal: 20,
};

/**
 * Animation durations (milliseconds)
 */
export const animation = {
  fast: 150,
  medium: 250,
  slow: 350,
};

/**
 * Scroll behavior constants
 */
export const scroll = {
  headerThreshold: 100,
  headerHeight: 60,
};

/**
 * Touch target sizes (WCAG AAA)
 */
export const touchTargets = {
  minimum: 44,
  compact: 40,
  large: 56,
};

/**
 * Shadow presets
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
};

/**
 * Breakpoints for responsive layout
 * Matches BREAKPOINTS in ResponsiveLayout.js
 */
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
};

/**
 * Common static colors for maximum contrast
 * Use these ONLY when theme colors won't work (e.g., text on primary color backgrounds)
 * Prefer theme.colors from useTheme() hook whenever possible
 */
export const staticColors = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};
