/**
 * ThemeContext - Manages theme state and system dark mode detection
 * Single theme system using NativeWind + global.css
 * Components should use className for styling, not inline styles
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  resetToSystem: () => {},
  colors: {
    background: '#FAF9F5',
    surface: '#FFFFFF',
    primary: '#4B0082',
    text: '#000000',
  },
});

export function ThemeProvider({ children }) {
  // Detect system color scheme
  const systemColorScheme = useColorScheme();

  // Track manual override (null = follow system)
  const [manualTheme, setManualTheme] = useState(null);

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (manualTheme !== null) {
      return manualTheme === 'dark';
    }
    return systemColorScheme === 'dark';
  }, [manualTheme, systemColorScheme]);

  // Dynamic colors that can't be in CSS (used for inline styles when necessary)
  // Full Nyuchi Brand System v6 - Five African Minerals
  const colors = useMemo(() => ({
    // Background & Surface
    background: isDark ? '#0A0A0A' : '#FAF9F5',
    surface: isDark ? '#1A1A1A' : '#FFFFFF',
    surfaceVariant: isDark ? '#2A2A2A' : '#F5F5F0',
    surfaceContainer: isDark ? '#1E1E1E' : '#F5F5F5',

    // Primary - Tanzanite
    primary: isDark ? '#B388FF' : '#4B0082',
    primaryContainer: isDark ? '#3D0066' : '#EDE7F6',
    onPrimary: isDark ? '#1A0033' : '#FFFFFF',
    onPrimaryContainer: isDark ? '#E9DDFF' : '#4B0082',
    tanzanite: isDark ? '#B388FF' : '#4B0082',

    // Secondary - Cobalt
    secondary: isDark ? '#64B5F6' : '#0047AB',
    secondaryContainer: isDark ? '#002966' : '#E3F2FD',
    onSecondary: isDark ? '#001A3D' : '#FFFFFF',
    onSecondaryContainer: isDark ? '#C5E7FF' : '#0047AB',
    cobalt: isDark ? '#64B5F6' : '#0047AB',

    // Tertiary - Terracotta
    tertiary: isDark ? '#FFAB91' : '#D4634A',
    tertiaryContainer: isDark ? '#5D2906' : '#FFCCBC',
    onTertiary: isDark ? '#3E1500' : '#FFFFFF',
    onTertiaryContainer: isDark ? '#FFE0D6' : '#5D2906',
    terracotta: isDark ? '#FFAB91' : '#D4634A',
    accent: isDark ? '#FFAB91' : '#D4634A',

    // Success - Malachite
    success: isDark ? '#69F0AE' : '#004D40',
    successContainer: isDark ? '#00332B' : '#E0F2F1',
    onSuccess: isDark ? '#00251A' : '#FFFFFF',
    malachite: isDark ? '#69F0AE' : '#004D40',

    // Warning - Gold
    warning: isDark ? '#FFD740' : '#5D4037',
    warningContainer: isDark ? '#3E2723' : '#FFF8E1',
    onWarning: isDark ? '#1F1300' : '#FFFFFF',
    gold: isDark ? '#FFD740' : '#5D4037',

    // Error
    error: isDark ? '#F2B8B5' : '#B3261E',
    errorContainer: isDark ? '#8C1D18' : '#F9DEDC',
    onError: isDark ? '#601410' : '#FFFFFF',
    onErrorContainer: isDark ? '#F9DEDC' : '#410E0B',

    // Text colors (camelCase)
    text: isDark ? '#FFFFFF' : '#1C1B1F',
    textSecondary: isDark ? '#B0B0B0' : '#666666',
    textMuted: isDark ? '#808080' : '#999999',
    onSurface: isDark ? '#E6E1E5' : '#1C1B1F',
    onSurfaceVariant: isDark ? '#CAC4D0' : '#49454F',
    onBackground: isDark ? '#E6E1E5' : '#1C1B1F',

    // Text colors (kebab-case aliases for backward compat)
    'on-surface': isDark ? '#E6E1E5' : '#1C1B1F',
    'on-surface-variant': isDark ? '#CAC4D0' : '#49454F',
    'on-background': isDark ? '#E6E1E5' : '#1C1B1F',
    'on-primary': isDark ? '#1A0033' : '#FFFFFF',
    'on-secondary': isDark ? '#001A3D' : '#FFFFFF',
    'on-tertiary': isDark ? '#3E1500' : '#FFFFFF',
    'on-error': isDark ? '#601410' : '#FFFFFF',

    // Outline & Borders
    outline: isDark ? '#938F99' : '#79747E',
    outlineVariant: isDark ? '#49454F' : '#CAC4D0',
    'outline-variant': isDark ? '#49454F' : '#CAC4D0',

    // Container variants (kebab-case aliases)
    'surface-variant': isDark ? '#2A2A2A' : '#F5F5F0',
    'primary-container': isDark ? '#3D0066' : '#EDE7F6',
    'secondary-container': isDark ? '#002966' : '#E3F2FD',
    'tertiary-container': isDark ? '#5D2906' : '#FFCCBC',
    'error-container': isDark ? '#8C1D18' : '#F9DEDC',
    'success-container': isDark ? '#00332B' : '#E0F2F1',
    'warning-container': isDark ? '#3E2723' : '#FFF8E1',

    // Static colors (don't change with theme)
    white: '#FFFFFF',
    black: '#000000',
    whiteFaded: 'rgba(255, 255, 255, 0.6)',

    // Glass effects
    glassBackground: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    glassCard: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',

    // Misc
    card: isDark ? '#1E1E1E' : '#FFFFFF',
    divider: isDark ? '#3A3A3A' : '#E0E0E0',
  }), [isDark]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setManualTheme((prev) => {
      if (prev === null) {
        // Currently following system, switch to opposite of current
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      // Toggle manual setting
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [systemColorScheme]);

  // Reset to system preference
  const resetToSystem = useCallback(() => {
    setManualTheme(null);
  }, []);

  // Legacy theme object for backward compatibility (TEMPORARY)
  // TODO: Remove once all components migrated to use colors directly
  const theme = useMemo(() => ({
    colors,
    dark: isDark,
  }), [colors, isDark]);

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    resetToSystem,
    colors,
    theme, // Backward compatibility - allows const { theme } = useTheme()
  }), [isDark, toggleTheme, resetToSystem, colors, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
