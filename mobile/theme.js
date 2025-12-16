/**
 * Mukoko News Custom Material Design Theme
 * Nyuchi Brand System v6 - December 2025
 *
 * Mukoko = "Beehive" — Where community gathers and stores
 * The digital gathering place where community stores knowledge,
 * shares stories, and authenticates identity.
 *
 * Brand Colors (Five Minerals):
 * - Primary: Tanzanite - Premium, creativity
 *   Light: #4B0082 | Dark: #B388FF
 * - Secondary: Cobalt - Digital future, knowledge
 *   Light: #0047AB | Dark: #00B0FF
 * - Accent: Gold - Honey, rewards
 *   Light: #5D4037 | Dark: #FFD740
 *
 * Surface Colors:
 * - Light Mode:
 *   Base: #FAF9F5 (Warm Cream) | Surface: #FFFFFF | Surface Dim: #F3F2EE
 * - Dark Mode:
 *   Base: #0A0A0A (Charcoal) | Surface: #141414 | Elevated: #1E1E1E
 *
 * Typography (Nyuchi Brand System):
 * - Display/Headings/Logo: Noto Serif - Elegant, authoritative
 * - Body: Plus Jakarta Sans - Clean, modern, readable
 *
 * Design Tokens:
 * - Button radius: 12px
 * - Card radius: 16px
 *
 * Note: Zimbabwe flag strip uses separate flag colors (zwGreen, zwYellow, zwRed, etc.)
 */

export const mukokoTheme = {
  // Roundness - clean modern feel (reduced for mobile)
  roundness: 12,

  // Mukoko News brand colors (Nyuchi Brand System v6 - Five Minerals)
  colors: {
    // Primary brand color - Tanzanite (Premium, creativity)
    primary: '#4B0082',           // Tanzanite Light
    primaryHover: '#5C109A',      // Lighter tanzanite for hover
    primaryActive: '#3A0066',     // Darker tanzanite for active
    primaryContainer: '#E8D5F9',  // Light purple container
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1A0033',

    // Accent color - Gold (Honey, rewards)
    accent: '#5D4037',            // Gold Light (brown-gold)
    accentContainer: '#F5E6D3',   // Light gold/honey container
    onAccent: '#FFFFFF',
    onAccentContainer: '#2D1F1A',

    // Secondary palette - Cobalt (Digital future, knowledge)
    secondary: '#0047AB',         // Cobalt Light
    secondaryContainer: '#D6E4F9',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#001A40',

    // Surface colors - Brand System v6
    surface: '#FFFFFF',          // White (card backgrounds)
    surfaceVariant: '#F3F2EE',   // Surface Dim (subtle gray)
    surfaceSubtle: '#FAF9F5',    // Warm Cream (base)
    onSurface: '#1C1B1F',        // Dark text
    onSurfaceVariant: '#4a4a4a', // Darker for better WCAG AA contrast

    // Borders and dividers
    outline: '#e0dfdc',
    outlineVariant: '#f0efec',

    // Semantic colors
    error: '#B3261E',            // Material error red
    errorContainer: '#F9DEDC',
    onError: '#FFFFFF',
    onErrorContainer: '#410E0B',

    success: '#1B5E20',          // Success green
    successContainer: '#E8F5E9',
    onSuccess: '#FFFFFF',
    onSuccessContainer: '#0D3311',

    warning: '#E65100',          // Warning orange
    warningContainer: '#FFF3E0',
    onWarning: '#FFFFFF',
    onWarningContainer: '#331200',

    // Background - Warm Cream base
    background: '#FAF9F5',       // Warm Cream (base)
    onBackground: '#1C1B1F',     // Dark text

    // Brand gradient colors - Tanzanite gradient
    gradientStart: '#4B0082',    // Tanzanite
    gradientEnd: '#0047AB',      // Cobalt

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
 * Nyuchi Brand System v6 Surface Colors
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

    // Surface colors - Brand System v6 Light Mode
    surface: '#FFFFFF',           // White (card backgrounds)
    surfaceVariant: '#F3F2EE',    // Surface Dim (subtle gray)
    surfaceDisabled: 'rgba(26, 26, 26, 0.12)',

    // Background - Warm Cream base
    background: '#FAF9F5',        // Warm Cream (base)

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
    onSurfaceDisabled: 'rgba(26, 26, 26, 0.55)', // Increased opacity for WCAG AA contrast
    onError: mukokoTheme.colors.onError,
    onErrorContainer: mukokoTheme.colors.onErrorContainer,
    onBackground: mukokoTheme.colors.onBackground,

    // Borders - thin dark borders for light theme contrast
    outline: 'rgba(0, 0, 0, 0.08)',  // Subtle dark border
    outlineVariant: 'rgba(0, 0, 0, 0.04)',

    inverseSurface: '#0A0A0A',    // Dark mode base
    inverseOnSurface: '#FAF9F5',  // Warm cream
    inversePrimary: '#B388FF',    // Tanzanite dark

    shadow: '#000000',
    scrim: '#000000',

    backdrop: 'rgba(75, 0, 130, 0.4)',  // Tanzanite backdrop

    // Elevation levels - Brand System v6 Light Mode
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',          // White surface
      level2: '#FFFFFF',          // White surface
      level3: '#F3F2EE',          // Surface dim
      level4: '#F3F2EE',          // Surface dim
      level5: '#E8E7E3',          // Slightly darker
    },

    // Glass effect colors - Tanzanite-tinted glassmorphism
    glass: 'rgba(75, 0, 130, 0.08)',        // Tanzanite glass overlay
    glassBorder: 'rgba(0, 0, 0, 0.06)',     // Thin dark border for contrast
    glassCard: '#FFFFFF',                    // White card
    glassSurface: '#FAF9F5',                 // Warm Cream

    // Glass effect colors - Gold/accent-tinted glassmorphism
    glassAccent: 'rgba(93, 64, 55, 0.08)',     // Gold glass overlay
    glassAccentBorder: 'rgba(0, 0, 0, 0.06)', // Thin dark border for contrast
    glassAccentCard: '#FFFFFF',               // White card
    glassAccentSurface: '#F3F2EE',            // Surface dim
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
      fontSize: 12, // Increased from 11 for WCAG readability
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
 * Nyuchi Brand System v6 - Tanzanite Dark Mode
 * Features glassmorphism effects with semi-transparent surfaces
 */
export const paperThemeDark = {
  dark: true,
  roundness: mukokoTheme.roundness,

  colors: {
    // Primary - Tanzanite Dark Mode
    primary: '#B388FF',           // Tanzanite Dark
    primaryContainer: 'rgba(179, 136, 255, 0.25)',  // Glass effect

    // Secondary - Cobalt Dark Mode
    secondary: '#00B0FF',         // Cobalt Dark
    secondaryContainer: 'rgba(0, 176, 255, 0.25)',

    // Tertiary/Accent - Gold Dark Mode
    tertiary: '#FFD740',          // Gold Dark
    tertiaryContainer: 'rgba(255, 215, 64, 0.25)',

    // Surface colors - Brand System v6 Dark Mode
    surface: '#141414',             // Card Surface
    surfaceVariant: '#1E1E1E',      // Elevated Surface
    surfaceDisabled: 'rgba(255, 255, 255, 0.08)',

    // Background - Near Black (Charcoal)
    background: '#0A0A0A',          // Base (Near Black)

    error: '#FF8A80',       // Light red for dark mode
    errorContainer: 'rgba(179, 38, 30, 0.25)',

    // Text colors - high contrast for readability
    onPrimary: '#1A0033',         // Dark text on light Tanzanite
    onPrimaryContainer: '#E8D5F9',
    onSecondary: '#001A40',       // Dark text on light Cobalt
    onSecondaryContainer: '#D6E4F9',
    onTertiary: '#1A1400',        // Dark text on Gold
    onTertiaryContainer: '#FFF8E1',
    onSurface: '#F5F0FA',         // Light purple-white for readability
    onSurfaceVariant: '#C5B8D0',  // Lighter for better WCAG AA contrast on dark
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.55)', // Increased opacity for WCAG AA contrast
    onError: '#1A0000',
    onErrorContainer: '#FFCDD2',
    onBackground: '#F5F0FA',

    // Borders - thin white borders for dark theme contrast
    outline: 'rgba(179, 136, 255, 0.2)',  // Tanzanite-tinted border
    outlineVariant: 'rgba(179, 136, 255, 0.1)',

    inverseSurface: '#FAF9F5',    // Warm Cream
    inverseOnSurface: '#0A0A0A',  // Near Black
    inversePrimary: '#4B0082',    // Tanzanite Light

    shadow: '#000000',
    scrim: 'rgba(0, 0, 0, 0.6)',

    backdrop: 'rgba(75, 0, 130, 0.5)',  // Tanzanite backdrop

    // Elevation levels - Brand System v6 Dark Mode
    elevation: {
      level0: 'transparent',
      level1: '#141414',   // Card Surface
      level2: '#1E1E1E',   // Elevated Surface
      level3: '#252525',   // Higher elevation
      level4: '#2C2C2C',   // Higher elevation
      level5: '#333333',   // Highest elevation
    },

    // Glass effect colors - Tanzanite glassmorphism for dark mode
    glass: 'rgba(179, 136, 255, 0.15)',       // Tanzanite glass overlay
    glassBorder: 'rgba(179, 136, 255, 0.12)', // Tanzanite-tinted border for contrast
    glassCard: '#141414',                      // Card Surface
    glassSurface: '#0A0A0A',                   // Base (Near Black)

    // Glass effect colors - Gold/accent glassmorphism for dark mode
    glassAccent: 'rgba(255, 215, 64, 0.15)',   // Gold glass overlay
    glassAccentBorder: 'rgba(255, 215, 64, 0.12)', // Gold-tinted border for contrast
    glassAccentCard: '#1E1E1E',                    // Elevated Surface
    glassAccentSurface: '#141414',                 // Card Surface
  },

  fonts: paperTheme.fonts, // Use same font configuration

  animation: {
    scale: 1.0,
  },
};

export default mukokoTheme;
