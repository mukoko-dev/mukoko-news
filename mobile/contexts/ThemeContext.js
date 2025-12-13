/**
 * ThemeContext - Manages theme state and system dark mode detection
 * Provides paperTheme (light) or paperThemeDark based on system preference
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { paperTheme, paperThemeDark, mukokoTheme } from '../theme';

const ThemeContext = createContext({
  theme: paperTheme,
  isDark: false,
  toggleTheme: () => {},
  mukokoTheme: mukokoTheme,
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

  // Select the appropriate theme
  const theme = useMemo(() => {
    return isDark ? paperThemeDark : paperTheme;
  }, [isDark]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setManualTheme((prev) => {
      if (prev === null) {
        // Currently following system, switch to opposite
        return isDark ? 'light' : 'dark';
      }
      // Toggle manual setting
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  // Reset to system preference
  const resetToSystem = () => {
    setManualTheme(null);
  };

  const value = useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
    resetToSystem,
    mukokoTheme,
  }), [theme, isDark]);

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
