/**
 * LocalPreferencesService - Stores user preferences locally without requiring authentication
 * Works for both authenticated and anonymous users
 * Uses AsyncStorage for native apps, falls back to localStorage for web
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_PREFIX = '@mukoko_prefs_';

// Preference keys
export const PREF_KEYS = {
  SELECTED_CATEGORIES: 'selected_categories',
  SELECTED_COUNTRIES: 'selected_countries',
  PRIMARY_COUNTRY: 'primary_country',
  THEME_MODE: 'theme_mode', // 'light', 'dark', 'system'
  FEED_SORT: 'feed_sort', // 'latest', 'trending', 'popular'
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATION_SETTINGS: 'notification_settings',
  TEXT_SIZE: 'text_size', // 'small', 'medium', 'large'
  AUTO_PLAY_VIDEO: 'auto_play_video',
  DATA_SAVER_MODE: 'data_saver_mode',
  LAST_SYNC: 'last_sync',
};

class LocalPreferencesService {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the service and load cached preferences
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Load all preferences into memory cache
      const keys = Object.values(PREF_KEYS);
      for (const key of keys) {
        const value = await this._getRaw(key);
        if (value !== null) {
          this.cache.set(key, value);
        }
      }
      this.isInitialized = true;
      console.log('[LocalPrefs] Initialized with', this.cache.size, 'cached preferences');
    } catch (error) {
      console.error('[LocalPrefs] Init error:', error);
    }
  }

  /**
   * Internal method to get raw value from storage
   */
  async _getRaw(key) {
    const storageKey = STORAGE_PREFIX + key;
    try {
      const value = await AsyncStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('[LocalPrefs] Get error:', key, error);
      return null;
    }
  }

  /**
   * Internal method to set raw value in storage
   */
  async _setRaw(key, value) {
    const storageKey = STORAGE_PREFIX + key;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(value));
      this.cache.set(key, value);
      return true;
    } catch (error) {
      console.error('[LocalPrefs] Set error:', key, error);
      return false;
    }
  }

  /**
   * Get a preference value
   */
  async get(key, defaultValue = null) {
    // Check memory cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const value = await this._getRaw(key);
    if (value !== null) {
      this.cache.set(key, value);
      return value;
    }
    return defaultValue;
  }

  /**
   * Set a preference value
   */
  async set(key, value) {
    return this._setRaw(key, value);
  }

  /**
   * Remove a preference
   */
  async remove(key) {
    const storageKey = STORAGE_PREFIX + key;
    try {
      await AsyncStorage.removeItem(storageKey);
      this.cache.delete(key);
      return true;
    } catch (error) {
      console.error('[LocalPrefs] Remove error:', key, error);
      return false;
    }
  }

  // ==================== CATEGORY PREFERENCES ====================

  /**
   * Get selected categories
   * @returns {Promise<string[]>} Array of category IDs
   */
  async getSelectedCategories() {
    return this.get(PREF_KEYS.SELECTED_CATEGORIES, []);
  }

  /**
   * Set selected categories
   * @param {string[]} categoryIds Array of category IDs
   */
  async setSelectedCategories(categoryIds) {
    return this.set(PREF_KEYS.SELECTED_CATEGORIES, categoryIds);
  }

  /**
   * Add a category to selection
   */
  async addCategory(categoryId) {
    const current = await this.getSelectedCategories();
    if (!current.includes(categoryId)) {
      current.push(categoryId);
      return this.setSelectedCategories(current);
    }
    return true;
  }

  /**
   * Remove a category from selection
   */
  async removeCategory(categoryId) {
    const current = await this.getSelectedCategories();
    const filtered = current.filter(id => id !== categoryId);
    return this.setSelectedCategories(filtered);
  }

  /**
   * Toggle a category selection
   */
  async toggleCategory(categoryId) {
    const current = await this.getSelectedCategories();
    if (current.includes(categoryId)) {
      return this.removeCategory(categoryId);
    } else {
      return this.addCategory(categoryId);
    }
  }

  // ==================== COUNTRY PREFERENCES ====================

  /**
   * Get selected countries
   * @returns {Promise<string[]>} Array of country codes (e.g., ['ZW', 'SA'])
   * Returns empty array as default - means "all countries" (no filtering)
   */
  async getSelectedCountries() {
    return this.get(PREF_KEYS.SELECTED_COUNTRIES, []); // Default to empty = all countries
  }

  /**
   * Set selected countries
   * @param {string[]} countryCodes Array of ISO country codes
   */
  async setSelectedCountries(countryCodes) {
    return this.set(PREF_KEYS.SELECTED_COUNTRIES, countryCodes);
  }

  /**
   * Get primary country
   * @returns {Promise<string>} Primary country code
   */
  async getPrimaryCountry() {
    return this.get(PREF_KEYS.PRIMARY_COUNTRY, 'ZW');
  }

  /**
   * Set primary country
   * @param {string} countryCode ISO country code
   */
  async setPrimaryCountry(countryCode) {
    return this.set(PREF_KEYS.PRIMARY_COUNTRY, countryCode);
  }

  /**
   * Add a country to selection
   */
  async addCountry(countryCode) {
    const current = await this.getSelectedCountries();
    if (!current.includes(countryCode)) {
      current.push(countryCode);
      return this.setSelectedCountries(current);
    }
    return true;
  }

  /**
   * Remove a country from selection
   */
  async removeCountry(countryCode) {
    const current = await this.getSelectedCountries();
    const filtered = current.filter(code => code !== countryCode);
    return this.setSelectedCountries(filtered);
  }

  // ==================== THEME & DISPLAY PREFERENCES ====================

  /**
   * Get theme mode
   * @returns {Promise<'light'|'dark'|'system'>}
   */
  async getThemeMode() {
    return this.get(PREF_KEYS.THEME_MODE, 'system');
  }

  /**
   * Set theme mode
   */
  async setThemeMode(mode) {
    return this.set(PREF_KEYS.THEME_MODE, mode);
  }

  /**
   * Get feed sort preference
   * @returns {Promise<'latest'|'trending'|'popular'>}
   */
  async getFeedSort() {
    return this.get(PREF_KEYS.FEED_SORT, 'latest');
  }

  /**
   * Set feed sort preference
   */
  async setFeedSort(sort) {
    return this.set(PREF_KEYS.FEED_SORT, sort);
  }

  /**
   * Get text size preference
   */
  async getTextSize() {
    return this.get(PREF_KEYS.TEXT_SIZE, 'medium');
  }

  /**
   * Set text size preference
   */
  async setTextSize(size) {
    return this.set(PREF_KEYS.TEXT_SIZE, size);
  }

  // ==================== ONBOARDING & SETTINGS ====================

  /**
   * Check if onboarding is completed
   */
  async isOnboardingCompleted() {
    return this.get(PREF_KEYS.ONBOARDING_COMPLETED, false);
  }

  /**
   * Mark onboarding as completed
   */
  async setOnboardingCompleted(completed = true) {
    return this.set(PREF_KEYS.ONBOARDING_COMPLETED, completed);
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings() {
    return this.get(PREF_KEYS.NOTIFICATION_SETTINGS, {
      breaking: true,
      daily_digest: false,
      followed_sources: true,
      followed_authors: true,
    });
  }

  /**
   * Update notification settings
   */
  async setNotificationSettings(settings) {
    const current = await this.getNotificationSettings();
    return this.set(PREF_KEYS.NOTIFICATION_SETTINGS, { ...current, ...settings });
  }

  /**
   * Get auto-play video preference
   */
  async getAutoPlayVideo() {
    return this.get(PREF_KEYS.AUTO_PLAY_VIDEO, true);
  }

  /**
   * Set auto-play video preference
   */
  async setAutoPlayVideo(enabled) {
    return this.set(PREF_KEYS.AUTO_PLAY_VIDEO, enabled);
  }

  /**
   * Get data saver mode
   */
  async getDataSaverMode() {
    return this.get(PREF_KEYS.DATA_SAVER_MODE, false);
  }

  /**
   * Set data saver mode
   */
  async setDataSaverMode(enabled) {
    return this.set(PREF_KEYS.DATA_SAVER_MODE, enabled);
  }

  // ==================== SYNC UTILITIES ====================

  /**
   * Get all preferences as an object (for syncing to server)
   */
  async getAllPreferences() {
    const prefs = {};
    for (const key of Object.values(PREF_KEYS)) {
      const value = await this.get(key);
      if (value !== null) {
        prefs[key] = value;
      }
    }
    return prefs;
  }

  /**
   * Import preferences from server (after login)
   */
  async importPreferences(serverPrefs) {
    for (const [key, value] of Object.entries(serverPrefs)) {
      if (Object.values(PREF_KEYS).includes(key)) {
        await this.set(key, value);
      }
    }
    await this.set(PREF_KEYS.LAST_SYNC, new Date().toISOString());
    console.log('[LocalPrefs] Imported preferences from server');
  }

  /**
   * Clear all preferences (for logout)
   */
  async clearAll() {
    for (const key of Object.values(PREF_KEYS)) {
      await this.remove(key);
    }
    this.cache.clear();
    console.log('[LocalPrefs] All preferences cleared');
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync() {
    return this.get(PREF_KEYS.LAST_SYNC, null);
  }
}

// Export singleton instance
export const localPreferences = new LocalPreferencesService();
export default localPreferences;
