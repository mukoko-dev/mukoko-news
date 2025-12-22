/**
 * Tests for LocalPreferencesService
 * Tests preference storage, retrieval, and management with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  clear: jest.fn(),
}));

// Import after mocking
import LocalPreferencesService, { PREF_KEYS } from '../LocalPreferencesService';

describe('LocalPreferencesService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create fresh instance for each test
    service = new LocalPreferencesService.constructor();
    service.cache = new Map();
    service.isInitialized = false;
  });

  describe('PREF_KEYS', () => {
    it('should have all required preference keys', () => {
      expect(PREF_KEYS.SELECTED_CATEGORIES).toBe('selected_categories');
      expect(PREF_KEYS.SELECTED_COUNTRIES).toBe('selected_countries');
      expect(PREF_KEYS.PRIMARY_COUNTRY).toBe('primary_country');
      expect(PREF_KEYS.THEME_MODE).toBe('theme_mode');
      expect(PREF_KEYS.FEED_SORT).toBe('feed_sort');
      expect(PREF_KEYS.ONBOARDING_COMPLETED).toBe('onboarding_completed');
      expect(PREF_KEYS.TEXT_SIZE).toBe('text_size');
      expect(PREF_KEYS.AUTO_PLAY_VIDEO).toBe('auto_play_video');
      expect(PREF_KEYS.DATA_SAVER_MODE).toBe('data_saver_mode');
    });
  });

  describe('init', () => {
    it('should load preferences into cache on init', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['politics', 'sports']));

      await LocalPreferencesService.init();

      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it('should only initialize once', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      await LocalPreferencesService.init();
      const callCount = AsyncStorage.getItem.mock.calls.length;

      await LocalPreferencesService.init();

      expect(AsyncStorage.getItem.mock.calls.length).toBe(callCount);
    });
  });

  describe('get and set', () => {
    it('should get value from cache if available', async () => {
      LocalPreferencesService.cache.set('test_key', 'cached_value');

      const value = await LocalPreferencesService.get('test_key');

      expect(value).toBe('cached_value');
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it('should get value from storage if not in cache', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('stored_value'));

      const value = await LocalPreferencesService.get('new_key');

      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(value).toBe('stored_value');
    });

    it('should return default value when key not found', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const value = await LocalPreferencesService.get('missing_key', 'default');

      expect(value).toBe('default');
    });

    it('should set value in storage and cache', async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await LocalPreferencesService.set('my_key', 'my_value');

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mukoko_prefs_my_key',
        JSON.stringify('my_value')
      );
      expect(LocalPreferencesService.cache.get('my_key')).toBe('my_value');
    });

    it('should handle set errors gracefully', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await LocalPreferencesService.set('key', 'value');

      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove from storage and cache', async () => {
      LocalPreferencesService.cache.set('to_remove', 'value');
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      const result = await LocalPreferencesService.remove('to_remove');

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@mukoko_prefs_to_remove');
      expect(LocalPreferencesService.cache.has('to_remove')).toBe(false);
    });
  });

  describe('Category methods', () => {
    it('should get selected categories', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['politics', 'sports']));

      const categories = await LocalPreferencesService.getSelectedCategories();

      expect(categories).toEqual(['politics', 'sports']);
    });

    it('should return empty array when no categories', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const categories = await LocalPreferencesService.getSelectedCategories();

      expect(categories).toEqual([]);
    });

    it('should set selected categories', async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalPreferencesService.setSelectedCategories(['tech', 'health']);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mukoko_prefs_selected_categories',
        JSON.stringify(['tech', 'health'])
      );
    });

    it('should add category if not exists', async () => {
      LocalPreferencesService.cache.set(PREF_KEYS.SELECTED_CATEGORIES, ['politics']);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalPreferencesService.addCategory('sports');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mukoko_prefs_selected_categories',
        JSON.stringify(['politics', 'sports'])
      );
    });

    it('should not add duplicate category', async () => {
      LocalPreferencesService.cache.set(PREF_KEYS.SELECTED_CATEGORIES, ['politics']);

      await LocalPreferencesService.addCategory('politics');

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should toggle category on/off', async () => {
      LocalPreferencesService.cache.set(PREF_KEYS.SELECTED_CATEGORIES, ['politics']);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      // Toggle on
      await LocalPreferencesService.toggleCategory('sports');
      expect(LocalPreferencesService.cache.get(PREF_KEYS.SELECTED_CATEGORIES)).toContain('sports');

      // Toggle off
      await LocalPreferencesService.toggleCategory('sports');
      expect(LocalPreferencesService.cache.get(PREF_KEYS.SELECTED_CATEGORIES)).not.toContain('sports');
    });
  });

  describe('Country methods', () => {
    it('should get selected countries', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(['ZW', 'ZA']));

      const countries = await LocalPreferencesService.getSelectedCountries();

      expect(countries).toEqual(['ZW', 'ZA']);
    });

    it('should return default ZW when no countries', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const countries = await LocalPreferencesService.getSelectedCountries();

      expect(countries).toEqual(['ZW']);
    });

    it('should get primary country', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('ZA'));

      const primary = await LocalPreferencesService.getPrimaryCountry();

      expect(primary).toBe('ZA');
    });

    it('should return ZW as default primary', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const primary = await LocalPreferencesService.getPrimaryCountry();

      expect(primary).toBe('ZW');
    });

    it('should add country', async () => {
      LocalPreferencesService.cache.set(PREF_KEYS.SELECTED_COUNTRIES, ['ZW']);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalPreferencesService.addCountry('ZA');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should remove country', async () => {
      LocalPreferencesService.cache.set(PREF_KEYS.SELECTED_COUNTRIES, ['ZW', 'ZA']);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalPreferencesService.removeCountry('ZA');

      expect(LocalPreferencesService.cache.get(PREF_KEYS.SELECTED_COUNTRIES)).toEqual(['ZW']);
    });
  });

  describe('Display preferences', () => {
    it('should get theme mode', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('dark'));

      const mode = await LocalPreferencesService.getThemeMode();

      expect(mode).toBe('dark');
    });

    it('should return system as default theme', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const mode = await LocalPreferencesService.getThemeMode();

      expect(mode).toBe('system');
    });

    it('should get feed sort', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('trending'));

      const sort = await LocalPreferencesService.getFeedSort();

      expect(sort).toBe('trending');
    });

    it('should return latest as default sort', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const sort = await LocalPreferencesService.getFeedSort();

      expect(sort).toBe('latest');
    });

    it('should get text size', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify('large'));

      const size = await LocalPreferencesService.getTextSize();

      expect(size).toBe('large');
    });

    it('should get auto play video setting', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(false));

      const autoPlay = await LocalPreferencesService.getAutoPlayVideo();

      expect(autoPlay).toBe(false);
    });

    it('should get data saver mode', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(true));

      const dataSaver = await LocalPreferencesService.getDataSaverMode();

      expect(dataSaver).toBe(true);
    });
  });

  describe('Onboarding', () => {
    it('should check onboarding completion', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(true));

      const completed = await LocalPreferencesService.isOnboardingCompleted();

      expect(completed).toBe(true);
    });

    it('should return false when onboarding not completed', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const completed = await LocalPreferencesService.isOnboardingCompleted();

      expect(completed).toBe(false);
    });

    it('should set onboarding completed', async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await LocalPreferencesService.setOnboardingCompleted(true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mukoko_prefs_onboarding_completed',
        JSON.stringify(true)
      );
    });
  });

  describe('getAllPreferences', () => {
    it('should return all preferences', async () => {
      LocalPreferencesService.cache.set(PREF_KEYS.SELECTED_CATEGORIES, ['politics']);
      LocalPreferencesService.cache.set(PREF_KEYS.THEME_MODE, 'dark');

      const prefs = await LocalPreferencesService.getAllPreferences();

      expect(prefs).toBeDefined();
    });
  });

  describe('importPreferences', () => {
    it('should import preferences from object', async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      const serverPrefs = {
        selectedCategories: ['politics', 'sports'],
        themeMode: 'dark',
      };

      await LocalPreferencesService.importPreferences(serverPrefs);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    it('should clear all preferences', async () => {
      LocalPreferencesService.cache.set('key1', 'value1');
      LocalPreferencesService.cache.set('key2', 'value2');
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await LocalPreferencesService.clearAll();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });
});
