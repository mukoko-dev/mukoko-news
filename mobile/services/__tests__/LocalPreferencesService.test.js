/**
 * Tests for LocalPreferencesService
 * Tests preference storage, retrieval, and management with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalPreferencesService, { PREF_KEYS } from '../LocalPreferencesService';

describe('LocalPreferencesService', () => {
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear AsyncStorage mock
    await AsyncStorage.clear();

    // Reset the singleton's internal state
    LocalPreferencesService.cache = new Map();
    LocalPreferencesService.isInitialized = false;
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
      // Set up some stored preferences
      await AsyncStorage.setItem('@mukoko_prefs_selected_categories', JSON.stringify(['politics', 'sports']));

      await LocalPreferencesService.init();

      expect(LocalPreferencesService.isInitialized).toBe(true);
      expect(LocalPreferencesService.cache.size).toBeGreaterThan(0);
    });

    it('should only initialize once', async () => {
      await LocalPreferencesService.init();
      expect(LocalPreferencesService.isInitialized).toBe(true);

      // Second init should not change state
      LocalPreferencesService.cache.set('test', 'value');
      await LocalPreferencesService.init();

      // Cache should still have the test value (not cleared by reinit)
      expect(LocalPreferencesService.cache.get('test')).toBe('value');
    });
  });

  describe('get and set', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should get value from cache if available', async () => {
      LocalPreferencesService.cache.set('test_key', 'cached_value');

      const value = await LocalPreferencesService.get('test_key');

      expect(value).toBe('cached_value');
    });

    it('should get value from storage if not in cache', async () => {
      await AsyncStorage.setItem('@mukoko_prefs_new_key', JSON.stringify('stored_value'));

      const value = await LocalPreferencesService.get('new_key');

      expect(value).toBe('stored_value');
    });

    it('should set value and update cache', async () => {
      await LocalPreferencesService.set('test_key', 'test_value');

      expect(LocalPreferencesService.cache.get('test_key')).toBe('test_value');

      const storedValue = await AsyncStorage.getItem('@mukoko_prefs_test_key');
      expect(JSON.parse(storedValue)).toBe('test_value');
    });

    it('should handle storage errors gracefully', async () => {
      // Mock setItem to throw an error
      const originalSetItem = AsyncStorage.setItem;
      AsyncStorage.setItem = jest.fn().mockRejectedValue(new Error('Storage error'));

      const result = await LocalPreferencesService.set('error_key', 'value');

      expect(result).toBe(false);

      // Restore original
      AsyncStorage.setItem = originalSetItem;
    });
  });

  describe('Category methods', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should return empty array when no categories', async () => {
      const categories = await LocalPreferencesService.getSelectedCategories();

      expect(categories).toEqual([]);
    });

    it('should set selected categories', async () => {
      await LocalPreferencesService.setSelectedCategories(['politics', 'sports']);

      const categories = await LocalPreferencesService.getSelectedCategories();
      expect(categories).toEqual(['politics', 'sports']);
    });

    it('should add a category', async () => {
      await LocalPreferencesService.setSelectedCategories(['politics']);
      await LocalPreferencesService.addCategory('sports');

      const categories = await LocalPreferencesService.getSelectedCategories();
      expect(categories).toContain('sports');
      expect(categories).toContain('politics');
    });

    it('should not add duplicate category', async () => {
      await LocalPreferencesService.setSelectedCategories(['politics']);
      await LocalPreferencesService.addCategory('politics');

      const categories = await LocalPreferencesService.getSelectedCategories();
      expect(categories).toEqual(['politics']);
    });

    it('should remove a category', async () => {
      await LocalPreferencesService.setSelectedCategories(['politics', 'sports', 'tech']);
      await LocalPreferencesService.removeCategory('sports');

      const categories = await LocalPreferencesService.getSelectedCategories();
      expect(categories).not.toContain('sports');
      expect(categories).toContain('politics');
      expect(categories).toContain('tech');
    });

    it('should toggle a category (add then remove)', async () => {
      await LocalPreferencesService.setSelectedCategories([]);

      // Toggle on
      await LocalPreferencesService.toggleCategory('politics');
      let categories = await LocalPreferencesService.getSelectedCategories();
      expect(categories).toContain('politics');

      // Toggle off
      await LocalPreferencesService.toggleCategory('politics');
      categories = await LocalPreferencesService.getSelectedCategories();
      expect(categories).not.toContain('politics');
    });
  });

  describe('Country methods', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should get selected countries', async () => {
      await LocalPreferencesService.setSelectedCountries(['ZW', 'ZA']);

      const countries = await LocalPreferencesService.getSelectedCountries();
      expect(countries).toEqual(['ZW', 'ZA']);
    });

    it('should return empty array when no countries set', async () => {
      const countries = await LocalPreferencesService.getSelectedCountries();
      expect(countries).toEqual([]);
    });

    it('should set primary country', async () => {
      await LocalPreferencesService.setPrimaryCountry('ZA');

      const primary = await LocalPreferencesService.getPrimaryCountry();
      expect(primary).toBe('ZA');
    });

    it('should return ZW as default primary country', async () => {
      const primary = await LocalPreferencesService.getPrimaryCountry();

      expect(primary).toBe('ZW');
    });
  });

  describe('Theme methods', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should get theme mode', async () => {
      await LocalPreferencesService.setThemeMode('dark');

      const theme = await LocalPreferencesService.getThemeMode();
      expect(theme).toBe('dark');
    });

    it('should return system as default theme', async () => {
      const theme = await LocalPreferencesService.getThemeMode();

      expect(theme).toBe('system');
    });

    it('should accept valid theme values', async () => {
      for (const mode of ['light', 'dark', 'system']) {
        await LocalPreferencesService.setThemeMode(mode);
        const theme = await LocalPreferencesService.getThemeMode();
        expect(theme).toBe(mode);
      }
    });
  });

  describe('Display settings', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should get text size', async () => {
      await LocalPreferencesService.setTextSize('large');

      const size = await LocalPreferencesService.getTextSize();
      expect(size).toBe('large');
    });

    it('should return medium as default text size', async () => {
      const size = await LocalPreferencesService.getTextSize();

      expect(size).toBe('medium');
    });

    it('should get data saver mode', async () => {
      await LocalPreferencesService.setDataSaverMode(true);

      const dataSaver = await LocalPreferencesService.getDataSaverMode();
      expect(dataSaver).toBe(true);
    });

    it('should return false as default data saver mode', async () => {
      const dataSaver = await LocalPreferencesService.getDataSaverMode();

      expect(dataSaver).toBe(false);
    });
  });

  describe('Onboarding', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should check onboarding status', async () => {
      const completed = await LocalPreferencesService.isOnboardingCompleted();

      expect(completed).toBe(false);
    });

    it('should set onboarding completed', async () => {
      await LocalPreferencesService.setOnboardingCompleted(true);

      const completed = await LocalPreferencesService.isOnboardingCompleted();
      expect(completed).toBe(true);
    });
  });

  describe('getAllPreferences', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should get all preferences', async () => {
      await LocalPreferencesService.setSelectedCategories(['politics', 'sports']);
      await LocalPreferencesService.setPrimaryCountry('ZW');
      await LocalPreferencesService.setThemeMode('dark');

      const prefs = await LocalPreferencesService.getAllPreferences();

      expect(prefs).toHaveProperty('selected_categories');
      expect(prefs).toHaveProperty('primary_country');
      expect(prefs).toHaveProperty('theme_mode');
    });
  });

  describe('clearAll', () => {
    beforeEach(async () => {
      await LocalPreferencesService.init();
    });

    it('should clear cache when clearAll is called', async () => {
      await LocalPreferencesService.setSelectedCategories(['politics']);
      await LocalPreferencesService.setThemeMode('dark');

      await LocalPreferencesService.clearAll();

      // Cache should be cleared
      expect(LocalPreferencesService.cache.size).toBe(0);
    });
  });
});
