/**
 * Mukoko News Custom Material Design Theme
 * Updated brand colors - January 2025
 *
 * Brand Colors:
 * - Primary: #5e5772 - Sophisticated purple-gray
 * - Accent: #d4634a - Warm terracotta/coral
 * - Light: #f9f8f4 - Warm off-white
 * - Dark: #1f1f1f - Near black
 * - Gradient: Circular gradient from #779b63 to #1f1f1f
 *
 * Typography (Nyuchi Brand System):
 * - Display/Headings: Noto Serif - Elegant, authoritative
 * - Body: Noto Sans - Clean, modern, readable
 *
 * Note: Zimbabwe flag strip uses separate flag colors (zwGreen, zwYellow, zwRed, etc.)
 */

export const mukokoTheme = {
  // Roundness - clean modern feel
  roundness: 24,

  // Mukoko News brand colors
  colors: {
    // Primary brand color - Sophisticated purple-gray
    primary: '#5e5772',
    primaryHover: '#6f6885',
    primaryActive: '#4d475f',
    primaryContainer: '#e8e6ec',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#2a2634',

    // Accent color - Warm terracotta/coral
    accent: '#d4634a',
    accentContainer: '#fce8e4',
    onAccent: '#FFFFFF',
    onAccentContainer: '#3d1a12',

    // Secondary palette (same as primary for consistency)
    secondary: '#5e5772',
    secondaryContainer: '#e8e6ec',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#2a2634',

    // Surface colors - warm off-white theme
    surface: '#FFFFFF',
    surfaceVariant: '#f9f8f4',   // Warm off-white (Light color)
    surfaceSubtle: '#fdfcfa',    // Even lighter warm white
    onSurface: '#1f1f1f',        // Dark color
    onSurfaceVariant: '#5a5a5a',

    // Borders and dividers
    outline: '#e0dfdc',
    outlineVariant: '#f0efec',

    // Semantic colors
    error: '#d4634a',            // Using accent for errors (warm red)
    errorContainer: '#fce8e4',
    onError: '#FFFFFF',
    onErrorContainer: '#3d1a12',

    success: '#779b63',          // Gradient green for success
    successContainer: '#e8f0e4',
    onSuccess: '#FFFFFF',
    onSuccessContainer: '#1f2d1a',

    warning: '#e5a84d',
    warningContainer: '#fcf3e4',
    onWarning: '#1f1f1f',
    onWarningContainer: '#3d2e12',

    // Background - warm off-white
    background: '#f9f8f4',       // Light color
    onBackground: '#1f1f1f',     // Dark color

    // Brand gradient colors
    gradientStart: '#779b63',    // Green for gradient
    gradientEnd: '#1f1f1f',      // Dark for gradient

    // Zimbabwe flag colors (kept for Zimbabwe flag strip component ONLY)
    zwGreen: '#00A651',
    zwYellow: '#FDD116',
    zwRed: '#EF3340',
    zwBlack: '#000000',
    zwWhite: '#FFFFFF',
  },

  // Typography - Noto Sans/Serif
  fonts: {
    regular: {
      fontFamily: 'NotoSans-Regular',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'NotoSans-Medium',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'NotoSans-Bold',
      fontWeight: '600'
    },
    serif: {
      fontFamily: 'NotoSerif-Regular',
      fontWeight: '400'
    },
    serifBold: {
      fontFamily: 'NotoSerif-Bold',
      fontWeight: '700'
    },
  },

  // Elevation/Shadows (more subtle, like reference app)
  shadows: {
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
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },

  // Spacing system (8px base - increased for more generous white space)
  spacing: {
    xs: 6,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    xxl: 56,
  },

  // Animation timings
  animation: {
    fast: 150,
    medium: 250,
    slow: 350,
  },
};

/**
 * React Native Paper theme configuration
 * Converts our custom theme to Paper's format
 */
export const paperTheme = {
  dark: false,
  roundness: mukokoTheme.roundness,

  colors: {
    primary: mukokoTheme.colors.primary,
    primaryContainer: mukokoTheme.colors.primaryContainer,

    secondary: mukokoTheme.colors.secondary,
    secondaryContainer: mukokoTheme.colors.secondaryContainer,

    tertiary: mukokoTheme.colors.accent,
    tertiaryContainer: mukokoTheme.colors.accentContainer,

    surface: mukokoTheme.colors.surface,
    surfaceVariant: mukokoTheme.colors.surfaceVariant,
    surfaceDisabled: 'rgba(26, 26, 26, 0.12)',

    background: mukokoTheme.colors.background,

    error: mukokoTheme.colors.error,
    errorContainer: mukokoTheme.colors.errorContainer,

    onPrimary: mukokoTheme.colors.onPrimary,
    onPrimaryContainer: mukokoTheme.colors.onPrimaryContainer,
    onSecondary: mukokoTheme.colors.onSecondary,
    onSecondaryContainer: mukokoTheme.colors.onSecondaryContainer,
    onTertiary: mukokoTheme.colors.onAccent,
    onTertiaryContainer: mukokoTheme.colors.onAccentContainer,
    onSurface: mukokoTheme.colors.onSurface,
    onSurfaceVariant: mukokoTheme.colors.onSurfaceVariant,
    onSurfaceDisabled: 'rgba(26, 26, 26, 0.38)',
    onError: mukokoTheme.colors.onError,
    onErrorContainer: mukokoTheme.colors.onErrorContainer,
    onBackground: mukokoTheme.colors.onBackground,

    outline: mukokoTheme.colors.outline,
    outlineVariant: mukokoTheme.colors.outlineVariant,

    inverseSurface: '#1f1f1f',    // Dark color
    inverseOnSurface: '#f9f8f4',  // Light color
    inversePrimary: '#8a819e',

    shadow: '#000000',
    scrim: '#000000',

    backdrop: 'rgba(31, 31, 31, 0.4)',

    elevation: {
      level0: 'transparent',
      level1: '#fdfcfa',
      level2: '#f9f8f4',          // Light color
      level3: '#f5f4f0',
      level4: '#f2f1ed',
      level5: '#eeedea',
    },
  },

  fonts: {
    regular: mukokoTheme.fonts.regular,
    medium: mukokoTheme.fonts.medium,
    bold: mukokoTheme.fonts.bold,

    // Paper-specific font variants
    displayLarge: {
      ...mukokoTheme.fonts.serifBold,
      fontSize: 57,
      lineHeight: 64,
      letterSpacing: 0,
    },
    displayMedium: {
      ...mukokoTheme.fonts.serifBold,
      fontSize: 45,
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      ...mukokoTheme.fonts.serif,
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: 0,
    },

    headlineLarge: {
      ...mukokoTheme.fonts.serifBold,
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      ...mukokoTheme.fonts.serif,
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      ...mukokoTheme.fonts.serif,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },

    titleLarge: {
      ...mukokoTheme.fonts.serifBold,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      ...mukokoTheme.fonts.serif,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      ...mukokoTheme.fonts.serif,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },

    bodyLarge: {
      ...mukokoTheme.fonts.regular,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    bodyMedium: {
      ...mukokoTheme.fonts.regular,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      ...mukokoTheme.fonts.regular,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
    },

    labelLarge: {
      ...mukokoTheme.fonts.medium,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      ...mukokoTheme.fonts.medium,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      ...mukokoTheme.fonts.medium,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },

  animation: {
    scale: 1.0,
  },
};

/**
 * Dark theme variant for React Native Paper
 */
export const paperThemeDark = {
  dark: true,
  roundness: mukokoTheme.roundness,

  colors: {
    primary: mukokoTheme.colors.primary,
    primaryContainer: '#3a3448',

    secondary: mukokoTheme.colors.secondary,
    secondaryContainer: '#3a3448',

    tertiary: mukokoTheme.colors.accent,
    tertiaryContainer: '#5d2e24',

    surface: '#1f1f1f',           // Dark color
    surfaceVariant: '#2a2a2a',
    surfaceDisabled: 'rgba(232, 232, 232, 0.12)',

    background: '#1f1f1f',        // Dark color

    error: mukokoTheme.colors.error,
    errorContainer: '#5d2e24',

    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#c4bfd4',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#c4bfd4',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#f0c4bc',
    onSurface: '#f9f8f4',         // Light color
    onSurfaceVariant: '#9ca3af',
    onSurfaceDisabled: 'rgba(232, 232, 232, 0.38)',
    onError: '#FFFFFF',
    onErrorContainer: '#f0c4bc',
    onBackground: '#f9f8f4',      // Light color

    outline: '#3a3a3a',
    outlineVariant: '#2a2a2a',

    inverseSurface: '#f9f8f4',    // Light color
    inverseOnSurface: '#1f1f1f',  // Dark color
    inversePrimary: '#8a819e',

    shadow: '#000000',
    scrim: '#000000',

    backdrop: 'rgba(0, 0, 0, 0.5)',

    elevation: {
      level0: 'transparent',
      level1: '#1f1f1f',
      level2: '#242424',
      level3: '#292929',
      level4: '#2b2b2b',
      level5: '#303030',
    },
  },

  fonts: paperTheme.fonts, // Use same font configuration

  animation: {
    scale: 1.0,
  },
};

export default mukokoTheme;
