/**
 * Tests for ThemeContext
 * Tests theme state management, dark mode detection, and theme toggling
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';

// Mock react-native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

// Mock theme
jest.mock('../../theme', () => ({
  paperTheme: { dark: false, colors: { primary: '#4B0082' } },
  paperThemeDark: { dark: true, colors: { primary: '#6B20A8' } },
  mukokoTheme: { primary: '#4B0082' },
}));

// Import after mocks
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useColorScheme.mockReturnValue('light');
  });

  describe('ThemeProvider', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    it('should provide theme context to children', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.theme).toBeDefined();
      expect(result.current.isDark).toBeDefined();
      expect(result.current.toggleTheme).toBeDefined();
    });

    it('should default to light theme when system is light', () => {
      useColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);
      expect(result.current.theme.dark).toBe(false);
    });

    it('should default to dark theme when system is dark', () => {
      useColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(true);
      expect(result.current.theme.dark).toBe(true);
    });

    it('should include mukokoTheme in context', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mukokoTheme).toBeDefined();
      expect(result.current.mukokoTheme.primary).toBe('#4B0082');
    });
  });

  describe('toggleTheme', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    it('should toggle from light to dark', () => {
      useColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);
    });

    it('should toggle from dark to light', () => {
      useColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(false);
    });

    it('should toggle back and forth', () => {
      useColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('resetToSystem', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    it('should reset to follow system preference', () => {
      useColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Toggle to manual dark mode
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.isDark).toBe(true);

      // Reset to system
      act(() => {
        result.current.resetToSystem();
      });
      expect(result.current.isDark).toBe(false); // System is light
    });

    it('should follow system changes after reset', () => {
      useColorScheme.mockReturnValue('light');

      const { result, rerender } = renderHook(() => useTheme(), { wrapper });

      // Manually toggle
      act(() => {
        result.current.toggleTheme();
      });

      // Reset to system
      act(() => {
        result.current.resetToSystem();
      });

      // Simulate system change to dark
      useColorScheme.mockReturnValue('dark');
      rerender();

      expect(result.current.isDark).toBe(true);
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should return stable references for functions', () => {
      const wrapper = ({ children }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result, rerender } = renderHook(() => useTheme(), { wrapper });

      const firstToggleTheme = result.current.toggleTheme;
      const firstResetToSystem = result.current.resetToSystem;

      rerender();

      expect(result.current.toggleTheme).toBe(firstToggleTheme);
      expect(result.current.resetToSystem).toBe(firstResetToSystem);
    });
  });

  describe('Theme object', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    it('should return paperTheme for light mode', () => {
      useColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme.dark).toBe(false);
    });

    it('should return paperThemeDark for dark mode', () => {
      useColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme.dark).toBe(true);
    });
  });

  describe('Edge cases', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    it('should handle null system color scheme', () => {
      useColorScheme.mockReturnValue(null);

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should default to light when null
      expect(result.current.isDark).toBe(false);
    });

    it('should handle undefined system color scheme', () => {
      useColorScheme.mockReturnValue(undefined);

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);
    });
  });
});
