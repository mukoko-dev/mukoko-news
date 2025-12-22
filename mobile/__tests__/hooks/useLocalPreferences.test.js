/**
 * Tests for useLocalPreferences hook
 * Tests preference loading, updating, and persistence
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock LocalPreferencesService
const mockLocalPreferences = {
  init: jest.fn().mockResolvedValue(undefined),
  getSelectedCategories: jest.fn().mockResolvedValue([]),
  setSelectedCategories: jest.fn().mockResolvedValue(true),
  toggleCategory: jest.fn().mockResolvedValue(true),
  getSelectedCountries: jest.fn().mockResolvedValue(['ZW']),
  setSelectedCountries: jest.fn().mockResolvedValue(true),
  getPrimaryCountry: jest.fn().mockResolvedValue('ZW'),
  setPrimaryCountry: jest.fn().mockResolvedValue(true),
  addCountry: jest.fn().mockResolvedValue(true),
  removeCountry: jest.fn().mockResolvedValue(true),
  getThemeMode: jest.fn().mockResolvedValue('system'),
  setThemeMode: jest.fn().mockResolvedValue(true),
  getFeedSort: jest.fn().mockResolvedValue('latest'),
  setFeedSort: jest.fn().mockResolvedValue(true),
  isOnboardingCompleted: jest.fn().mockResolvedValue(false),
  setOnboardingCompleted: jest.fn().mockResolvedValue(true),
  getTextSize: jest.fn().mockResolvedValue('medium'),
  setTextSize: jest.fn().mockResolvedValue(true),
  getAutoPlayVideo: jest.fn().mockResolvedValue(true),
  setAutoPlayVideo: jest.fn().mockResolvedValue(true),
  getDataSaverMode: jest.fn().mockResolvedValue(false),
  setDataSaverMode: jest.fn().mockResolvedValue(true),
  getAllPreferences: jest.fn().mockResolvedValue({}),
  importPreferences: jest.fn().mockResolvedValue(true),
  clearAll: jest.fn().mockResolvedValue(true),
};

jest.mock('../../services/LocalPreferencesService', () => ({
  __esModule: true,
  default: mockLocalPreferences,
  PREF_KEYS: {
    SELECTED_CATEGORIES: 'selected_categories',
    SELECTED_COUNTRIES: 'selected_countries',
    PRIMARY_COUNTRY: 'primary_country',
    THEME_MODE: 'theme_mode',
    FEED_SORT: 'feed_sort',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    TEXT_SIZE: 'text_size',
    AUTO_PLAY_VIDEO: 'auto_play_video',
    DATA_SAVER_MODE: 'data_saver_mode',
  },
}));

import { useLocalPreferences, useFeedSort, useCountryPreferences } from '../../hooks/useLocalPreferences';

describe('useLocalPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial loading', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useLocalPreferences());

      expect(result.current.isLoading).toBe(true);
    });

    it('should load preferences on mount', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockLocalPreferences.init).toHaveBeenCalled();
      expect(mockLocalPreferences.getSelectedCategories).toHaveBeenCalled();
      expect(mockLocalPreferences.getSelectedCountries).toHaveBeenCalled();
    });

    it('should have default preference values', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.selectedCategories).toEqual([]);
      expect(result.current.preferences.selectedCountries).toEqual(['ZW']);
      expect(result.current.preferences.primaryCountry).toBe('ZW');
      expect(result.current.preferences.themeMode).toBe('system');
      expect(result.current.preferences.feedSort).toBe('latest');
    });
  });

  describe('Category methods', () => {
    it('should set selected categories', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setSelectedCategories(['politics', 'sports']);
      });

      expect(mockLocalPreferences.setSelectedCategories).toHaveBeenCalledWith(['politics', 'sports']);
      expect(result.current.preferences.selectedCategories).toEqual(['politics', 'sports']);
    });

    it('should toggle category', async () => {
      mockLocalPreferences.getSelectedCategories.mockResolvedValue(['politics']);

      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleCategory('sports');
      });

      expect(mockLocalPreferences.toggleCategory).toHaveBeenCalledWith('sports');
    });
  });

  describe('Country methods', () => {
    it('should set selected countries', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setSelectedCountries(['ZW', 'ZA']);
      });

      expect(mockLocalPreferences.setSelectedCountries).toHaveBeenCalledWith(['ZW', 'ZA']);
    });

    it('should set primary country', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setPrimaryCountry('ZA');
      });

      expect(mockLocalPreferences.setPrimaryCountry).toHaveBeenCalledWith('ZA');
      expect(result.current.preferences.primaryCountry).toBe('ZA');
    });

    it('should add country', async () => {
      mockLocalPreferences.getSelectedCountries.mockResolvedValue(['ZW', 'ZA']);

      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addCountry('KE');
      });

      expect(mockLocalPreferences.addCountry).toHaveBeenCalledWith('KE');
    });

    it('should remove country', async () => {
      mockLocalPreferences.getSelectedCountries.mockResolvedValue(['ZW']);

      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.removeCountry('ZA');
      });

      expect(mockLocalPreferences.removeCountry).toHaveBeenCalledWith('ZA');
    });
  });

  describe('Display methods', () => {
    it('should set theme mode', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setThemeMode('dark');
      });

      expect(mockLocalPreferences.setThemeMode).toHaveBeenCalledWith('dark');
      expect(result.current.preferences.themeMode).toBe('dark');
    });

    it('should set feed sort', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setFeedSort('trending');
      });

      expect(mockLocalPreferences.setFeedSort).toHaveBeenCalledWith('trending');
      expect(result.current.preferences.feedSort).toBe('trending');
    });

    it('should set text size', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setTextSize('large');
      });

      expect(mockLocalPreferences.setTextSize).toHaveBeenCalledWith('large');
    });

    it('should toggle auto play video', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setAutoPlayVideo(false);
      });

      expect(mockLocalPreferences.setAutoPlayVideo).toHaveBeenCalledWith(false);
    });

    it('should toggle data saver mode', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setDataSaverMode(true);
      });

      expect(mockLocalPreferences.setDataSaverMode).toHaveBeenCalledWith(true);
    });
  });

  describe('Onboarding', () => {
    it('should complete onboarding', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.completeOnboarding();
      });

      expect(mockLocalPreferences.setOnboardingCompleted).toHaveBeenCalledWith(true);
      expect(result.current.preferences.onboardingCompleted).toBe(true);
    });
  });

  describe('Sync methods', () => {
    it('should export preferences', async () => {
      mockLocalPreferences.getAllPreferences.mockResolvedValue({ theme: 'dark' });

      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const exported = await result.current.exportPreferences();

      expect(mockLocalPreferences.getAllPreferences).toHaveBeenCalled();
      expect(exported).toEqual({ theme: 'dark' });
    });

    it('should import preferences', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.importPreferences({ theme: 'light' });
      });

      expect(mockLocalPreferences.importPreferences).toHaveBeenCalledWith({ theme: 'light' });
    });

    it('should clear all preferences', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearPreferences();
      });

      expect(mockLocalPreferences.clearAll).toHaveBeenCalled();
      expect(result.current.preferences.selectedCategories).toEqual([]);
      expect(result.current.preferences.primaryCountry).toBe('ZW');
    });
  });

  describe('Reload', () => {
    it('should reload preferences', async () => {
      const { result } = renderHook(() => useLocalPreferences());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockLocalPreferences.getSelectedCategories.mock.calls.length;

      await act(async () => {
        await result.current.reload();
      });

      expect(mockLocalPreferences.getSelectedCategories.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});

describe('useFeedSort', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return feed sort preference', async () => {
    const { result } = renderHook(() => useFeedSort());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.feedSort).toBe('latest');
  });

  it('should update feed sort', async () => {
    const { result } = renderHook(() => useFeedSort());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setFeedSort('trending');
    });

    expect(mockLocalPreferences.setFeedSort).toHaveBeenCalledWith('trending');
  });
});

describe('useCountryPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return country preferences', async () => {
    const { result } = renderHook(() => useCountryPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.countries).toEqual(['ZW']);
    expect(result.current.primaryCountry).toBe('ZW');
  });

  it('should toggle country', async () => {
    mockLocalPreferences.getSelectedCountries
      .mockResolvedValueOnce(['ZW'])
      .mockResolvedValueOnce(['ZW', 'ZA']);

    const { result } = renderHook(() => useCountryPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleCountry('ZA');
    });

    expect(mockLocalPreferences.addCountry).toHaveBeenCalledWith('ZA');
  });
});
