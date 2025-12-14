/**
 * Global Styles for Mukoko News
 * Centralized styling for consistency across the app
 *
 * Usage: import { globalStyles, typography, spacing, layout } from '../styles/globalStyles';
 */

import { StyleSheet, Platform } from 'react-native';
import mukokoTheme from '../theme';

/**
 * Spacing scale (4px base unit)
 * Use these instead of hardcoded pixel values
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

/**
 * Typography scale
 * Minimum font size is 12px for WCAG accessibility
 */
export const typography = {
  // Display text (for hero sections, splash screens)
  displayLarge: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontFamily: mukokoTheme.fonts.serif.fontFamily,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.2,
  },

  // Headlines
  headlineLarge: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  headlineMedium: {
    fontFamily: mukokoTheme.fonts.serif.fontFamily,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  headlineSmall: {
    fontFamily: mukokoTheme.fonts.serif.fontFamily,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  },

  // Titles
  titleLarge: {
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body text
  bodyLarge: {
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  bodyMedium: {
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    fontSize: 12, // Minimum readable size per WCAG
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Labels (buttons, chips, badges)
  labelLarge: {
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelMedium: {
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontSize: 12, // Minimum readable size per WCAG
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

/**
 * Layout utilities
 */
export const layout = {
  // Flexbox shortcuts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Touch targets (WCAG minimum 44px)
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
  },

  // Common container padding
  screenPadding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cardPadding: {
    padding: spacing.md,
  },
};

/**
 * Component-specific global styles
 */
export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  // Cards
  card: {
    backgroundColor: mukokoTheme.colors.surface,
    borderRadius: mukokoTheme.roundness,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  glassCard: {
    borderWidth: 1,
    borderColor: mukokoTheme.colors.outline,
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: mukokoTheme.colors.primary,
    borderRadius: mukokoTheme.roundness * 2,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: mukokoTheme.colors.primary,
    borderRadius: mukokoTheme.roundness * 2,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    backgroundColor: 'transparent',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  textPrimary: {
    color: mukokoTheme.colors.onSurface,
  },
  textSecondary: {
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  textAccent: {
    color: mukokoTheme.colors.primary,
  },
  textOnPrimary: {
    color: mukokoTheme.colors.onPrimary,
  },
  textCenter: {
    textAlign: 'center',
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: mukokoTheme.colors.outline,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: mukokoTheme.colors.outline,
  },

  // Empty/Loading states
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },

  // Lists
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: mukokoTheme.colors.outline,
  },

  // Badges
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: mukokoTheme.colors.primaryContainer,
  },
  badgeText: {
    ...typography.labelSmall,
    color: mukokoTheme.colors.primary,
  },
});

export default globalStyles;
