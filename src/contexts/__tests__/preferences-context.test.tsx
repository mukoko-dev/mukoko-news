/**
 * Tests for PreferencesContext
 * Tests localStorage persistence, country/category selection, and onboarding flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { PreferencesProvider, usePreferences } from '../preferences-context';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PreferencesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PreferencesProvider>{children}</PreferencesProvider>
  );

  describe('initial state', () => {
    it('should default to ZW when no localStorage data', async () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toContain('ZW');
      });
    });

    it('should load countries from localStorage', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW', 'ZA', 'KE']));

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toEqual(['ZW', 'ZA', 'KE']);
      });
    });

    it('should load primary country from localStorage', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW', 'ZA']));
      localStorageMock.setItem('mukoko-primary-country', 'ZA');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.primaryCountry).toBe('ZA');
      });
    });

    it('should load categories from localStorage', async () => {
      localStorageMock.setItem('mukoko-categories', JSON.stringify(['politics', 'sports']));

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCategories).toEqual(['politics', 'sports']);
      });
    });

    it('should show onboarding when not completed', async () => {
      // Don't set onboarding complete flag

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(false);
        expect(result.current.showOnboarding).toBe(true);
      });
    });

    it('should not show onboarding when already completed', async () => {
      localStorageMock.setItem('mukoko-onboarding-complete', 'true');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(true);
        expect(result.current.showOnboarding).toBe(false);
      });
    });
  });

  describe('country selection', () => {
    it('should toggle country on', async () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toBeDefined();
      });

      act(() => {
        result.current.toggleCountry('ZA');
      });

      await waitFor(() => {
        expect(result.current.selectedCountries).toContain('ZA');
      });
    });

    it('should toggle country off', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW', 'ZA']));

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toContain('ZA');
      });

      act(() => {
        result.current.toggleCountry('ZA');
      });

      await waitFor(() => {
        expect(result.current.selectedCountries).not.toContain('ZA');
      });
    });

    it('should persist countries to localStorage', async () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toBeDefined();
      });

      act(() => {
        result.current.toggleCountry('KE');
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'mukoko-countries',
          expect.stringContaining('KE')
        );
      });
    });

    it('should set primary country when valid', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW', 'ZA']));

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toContain('ZA');
      });

      act(() => {
        result.current.setPrimaryCountry('ZA');
      });

      await waitFor(() => {
        expect(result.current.primaryCountry).toBe('ZA');
      });
    });

    it('should not set primary country if not in selected list', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW']));
      localStorageMock.setItem('mukoko-primary-country', 'ZW');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.primaryCountry).toBe('ZW');
      });

      act(() => {
        // Try to set KE as primary when it's not selected
        result.current.setPrimaryCountry('KE');
      });

      // Should remain ZW since KE is not in selected countries
      expect(result.current.primaryCountry).toBe('ZW');
    });

    it('should update primary country when removed from selection', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW', 'ZA']));
      localStorageMock.setItem('mukoko-primary-country', 'ZA');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.primaryCountry).toBe('ZA');
      });

      act(() => {
        result.current.toggleCountry('ZA'); // Remove ZA
      });

      await waitFor(() => {
        // Primary should change to first remaining country
        expect(result.current.primaryCountry).toBe('ZW');
      });
    });
  });

  describe('category selection', () => {
    it('should toggle category on', async () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCategories).toBeDefined();
      });

      act(() => {
        result.current.toggleCategory('politics');
      });

      await waitFor(() => {
        expect(result.current.selectedCategories).toContain('politics');
      });
    });

    it('should toggle category off', async () => {
      localStorageMock.setItem('mukoko-categories', JSON.stringify(['politics', 'sports']));

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCategories).toContain('politics');
      });

      act(() => {
        result.current.toggleCategory('politics');
      });

      await waitFor(() => {
        expect(result.current.selectedCategories).not.toContain('politics');
      });
    });

    it('should persist categories to localStorage', async () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCategories).toBeDefined();
      });

      act(() => {
        result.current.toggleCategory('economy');
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'mukoko-categories',
          expect.stringContaining('economy')
        );
      });
    });
  });

  describe('onboarding', () => {
    it('should complete onboarding and persist', async () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(false);
      });

      act(() => {
        result.current.completeOnboarding();
      });

      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(true);
        expect(result.current.showOnboarding).toBe(false);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mukoko-onboarding-complete',
        'true'
      );
    });

    it('should toggle showOnboarding', async () => {
      localStorageMock.setItem('mukoko-onboarding-complete', 'true');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(false);
      });

      act(() => {
        result.current.setShowOnboarding(true);
      });

      expect(result.current.showOnboarding).toBe(true);
    });
  });

  describe('reset preferences', () => {
    it('should clear all preferences', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW', 'ZA']));
      localStorageMock.setItem('mukoko-primary-country', 'ZA');
      localStorageMock.setItem('mukoko-categories', JSON.stringify(['politics']));
      localStorageMock.setItem('mukoko-onboarding-complete', 'true');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toHaveLength(2);
      });

      act(() => {
        result.current.resetPreferences();
      });

      await waitFor(() => {
        expect(result.current.selectedCountries).toEqual([]);
        expect(result.current.primaryCountry).toBeNull();
        expect(result.current.selectedCategories).toEqual([]);
        expect(result.current.hasCompletedOnboarding).toBe(false);
      });
    });

    it('should remove all localStorage keys', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify(['ZW']));
      localStorageMock.setItem('mukoko-onboarding-complete', 'true');

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.selectedCountries).toBeDefined();
      });

      act(() => {
        result.current.resetPreferences();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mukoko-countries');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mukoko-primary-country');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mukoko-categories');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mukoko-onboarding-complete');
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON in localStorage', async () => {
      localStorageMock.setItem('mukoko-countries', 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        // Should fallback to defaults
        expect(result.current.selectedCountries).toEqual(['ZW']);
      });

      consoleSpy.mockRestore();
    });

    it('should handle non-array countries in localStorage', async () => {
      localStorageMock.setItem('mukoko-countries', JSON.stringify({ not: 'array' }));

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await waitFor(() => {
        // Should fallback to default
        expect(result.current.selectedCountries).toEqual(['ZW']);
      });
    });
  });

  describe('usePreferences hook', () => {
    it('should throw when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePreferences());
      }).toThrow('usePreferences must be used within PreferencesProvider');

      consoleSpy.mockRestore();
    });
  });
});
