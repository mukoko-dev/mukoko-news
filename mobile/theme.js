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
 * - Display/Headings/Logo: Noto Serif - Elegant, authoritative
 * - Body: Plus Jakarta Sans - Clean, modern, readable
 *
 * Note: Zimbabwe flag strip uses separate flag colors (zwGreen, zwYellow, zwRed, etc.)
 */

export const mukokoTheme = {
  // Roundness - clean modern feel (reduced for mobile)
  roundness: 12,

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

  // Typography - Plus Jakarta Sans (body) / Noto Serif (headings/logo)
  fonts: {
    regular: {
      fontFamily: 'PlusJakartaSans-Regular',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'PlusJakartaSans-Medium',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'PlusJakartaSans-Bold',
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

  // Spacing system (compact mobile-first - 4px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
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
 * Features glassmorphism with subtle purple tinge
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

    // Glass surfaces with subtle purple tinge
    surface: 'rgba(255, 255, 255, 0.85)',  // Glass white
    surfaceVariant: 'rgba(249, 248, 244, 0.9)',  // Glass warm white
    surfaceDisabled: 'rgba(26, 26, 26, 0.08)',

    // Background with very subtle purple tinge
    background: '#f7f6f8',  // Slight purple-tinted off-white

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

    // Borders with subtle purple tinge for glass effect
    outline: 'rgba(94, 87, 114, 0.15)',  // Purple-tinted border
    outlineVariant: 'rgba(94, 87, 114, 0.08)',

    inverseSurface: '#1f1f1f',
    inverseOnSurface: '#f9f8f4',
    inversePrimary: '#8a819e',

    shadow: '#000000',
    scrim: '#000000',

    backdrop: 'rgba(94, 87, 114, 0.3)',  // Purple-tinted backdrop

    // Elevation levels with glass effect
    elevation: {
      level0: 'transparent',
      level1: 'rgba(253, 252, 250, 0.95)',
      level2: 'rgba(249, 248, 244, 0.92)',
      level3: 'rgba(245, 244, 240, 0.90)',
      level4: 'rgba(242, 241, 237, 0.88)',
      level5: 'rgba(238, 237, 234, 0.85)',
    },

    // Glass effect colors - purple-tinted glassmorphism (primary)
    glass: 'rgba(94, 87, 114, 0.06)',  // Light purple glass overlay
    glassBorder: 'rgba(94, 87, 114, 0.12)',  // Glass border
    glassCard: 'rgba(255, 255, 255, 0.75)',  // Card glass background
    glassSurface: 'rgba(249, 248, 250, 0.85)',  // Surface glass

    // Glass effect colors - accent-tinted glassmorphism (terracotta)
    glassAccent: 'rgba(212, 99, 74, 0.06)',  // Light terracotta glass overlay
    glassAccentBorder: 'rgba(212, 99, 74, 0.15)',  // Terracotta glass border
    glassAccentCard: 'rgba(255, 250, 248, 0.8)',  // Warm-tinted card glass
    glassAccentSurface: 'rgba(252, 248, 244, 0.85)',  // Warm surface glass
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
 * Features glassmorphism effects with semi-transparent surfaces
 */
export const paperThemeDark = {
  dark: true,
  roundness: mukokoTheme.roundness,

  colors: {
    // Primary - lighter for dark mode visibility
    primary: '#8a7fa0',  // Lighter purple for dark mode
    primaryContainer: 'rgba(94, 87, 114, 0.3)',  // Glass effect

    secondary: '#8a7fa0',
    secondaryContainer: 'rgba(94, 87, 114, 0.3)',

    tertiary: '#e88a75',  // Lighter terracotta for dark mode
    tertiaryContainer: 'rgba(212, 99, 74, 0.25)',

    // Glass effect surfaces - purple-tinted glassmorphism
    surface: 'rgba(38, 35, 48, 0.88)',  // Purple-tinted dark glass
    surfaceVariant: 'rgba(48, 44, 58, 0.82)',  // Lighter purple glass surface
    surfaceDisabled: 'rgba(255, 255, 255, 0.08)',

    // Background - dark with subtle purple undertone
    background: '#161418',  // Purple-tinted dark base

    error: '#ff8a7a',  // Lighter red for dark mode
    errorContainer: 'rgba(212, 99, 74, 0.25)',

    // Text colors - high contrast for readability
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#e0dce8',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#e0dce8',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#fce8e4',
    onSurface: '#f5f4f0',  // Warm white for readability
    onSurfaceVariant: '#a8a8b0',  // Muted but visible
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
    onError: '#FFFFFF',
    onErrorContainer: '#fce8e4',
    onBackground: '#f5f4f0',

    // Borders - visible but subtle
    outline: 'rgba(255, 255, 255, 0.15)',  // Glass border
    outlineVariant: 'rgba(255, 255, 255, 0.08)',

    inverseSurface: '#f5f4f0',
    inverseOnSurface: '#1a1a1c',
    inversePrimary: '#5e5772',

    shadow: '#000000',
    scrim: 'rgba(0, 0, 0, 0.6)',

    backdrop: 'rgba(0, 0, 0, 0.6)',

    // Elevation levels with glass effect - purple-tinted
    elevation: {
      level0: 'transparent',
      level1: 'rgba(35, 32, 42, 0.92)',  // Purple-tinted dark glass
      level2: 'rgba(42, 38, 52, 0.90)',
      level3: 'rgba(50, 45, 60, 0.88)',
      level4: 'rgba(55, 50, 65, 0.86)',
      level5: 'rgba(60, 55, 72, 0.85)',
    },

    // Glass effect colors - purple-tinted glassmorphism for dark mode (primary)
    glass: 'rgba(138, 127, 160, 0.12)',  // Purple glass overlay
    glassBorder: 'rgba(138, 127, 160, 0.2)',  // Glass border with purple tint
    glassCard: 'rgba(45, 42, 55, 0.85)',  // Card glass - purple-tinted dark
    glassSurface: 'rgba(35, 32, 42, 0.9)',  // Surface glass - purple-tinted

    // Glass effect colors - accent-tinted glassmorphism for dark mode (terracotta)
    glassAccent: 'rgba(232, 138, 117, 0.12)',  // Terracotta glass overlay
    glassAccentBorder: 'rgba(232, 138, 117, 0.2)',  // Terracotta glass border
    glassAccentCard: 'rgba(55, 42, 40, 0.85)',  // Warm-tinted dark card glass
    glassAccentSurface: 'rgba(45, 35, 32, 0.9)',  // Warm dark surface glass
  },

  fonts: paperTheme.fonts, // Use same font configuration

  animation: {
    scale: 1.0,
  },
};

export default mukokoTheme;
