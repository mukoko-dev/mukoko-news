/**
 * DarkModeManager - Applies .dark class to document element for NativeWind
 * Required for NativeWind v4 dark mode on web
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function DarkModeManager() {
  const { isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isDark]);

  return null; // This component doesn't render anything
}
