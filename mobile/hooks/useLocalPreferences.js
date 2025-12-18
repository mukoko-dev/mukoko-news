/**
 * useLocalPreferences - React hook for accessing local preferences
 * Works for both authenticated and anonymous users
 */

import { useState, useEffect, useCallback } from 'react';
import localPreferences, { PREF_KEYS } from '../services/LocalPreferencesService';

/**
 * Hook to access and manage local preferences
 * Automatically handles loading state and updates
 */
export function useLocalPreferences() {
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    selectedCategories: [],
    selectedCountries: ['ZW'],
    primaryCountry: 'ZW',
    themeMode: 'system',
    feedSort: 'latest',
    onboardingCompleted: false,
    textSize: 'medium',
    autoPlayVideo: true,
    dataSaverMode: false,
  });

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      await localPreferences.init();

      const [
        selectedCategories,
        selectedCountries,
        primaryCountry,
        themeMode,
        feedSort,
        onboardingCompleted,
        textSize,
        autoPlayVideo,
        dataSaverMode,
      ] = await Promise.all([
        localPreferences.getSelectedCategories(),
        localPreferences.getSelectedCountries(),
        localPreferences.getPrimaryCountry(),
        localPreferences.getThemeMode(),
        localPreferences.getFeedSort(),
        localPreferences.isOnboardingCompleted(),
        localPreferences.getTextSize(),
        localPreferences.getAutoPlayVideo(),
        localPreferences.getDataSaverMode(),
      ]);

      setPreferences({
        selectedCategories,
        selectedCountries,
        primaryCountry,
        themeMode,
        feedSort,
        onboardingCompleted,
        textSize,
        autoPlayVideo,
        dataSaverMode,
      });
    } catch (error) {
      console.error('[useLocalPreferences] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Category methods
  const setSelectedCategories = useCallback(async (categories) => {
    await localPreferences.setSelectedCategories(categories);
    setPreferences(prev => ({ ...prev, selectedCategories: categories }));
  }, []);

  const toggleCategory = useCallback(async (categoryId) => {
    await localPreferences.toggleCategory(categoryId);
    const updated = await localPreferences.getSelectedCategories();
    setPreferences(prev => ({ ...prev, selectedCategories: updated }));
  }, []);

  // Country methods
  const setSelectedCountries = useCallback(async (countries) => {
    await localPreferences.setSelectedCountries(countries);
    setPreferences(prev => ({ ...prev, selectedCountries: countries }));
  }, []);

  const setPrimaryCountry = useCallback(async (countryCode) => {
    await localPreferences.setPrimaryCountry(countryCode);
    setPreferences(prev => ({ ...prev, primaryCountry: countryCode }));
  }, []);

  const addCountry = useCallback(async (countryCode) => {
    await localPreferences.addCountry(countryCode);
    const updated = await localPreferences.getSelectedCountries();
    setPreferences(prev => ({ ...prev, selectedCountries: updated }));
  }, []);

  const removeCountry = useCallback(async (countryCode) => {
    await localPreferences.removeCountry(countryCode);
    const updated = await localPreferences.getSelectedCountries();
    setPreferences(prev => ({ ...prev, selectedCountries: updated }));
  }, []);

  // Display methods
  const setThemeMode = useCallback(async (mode) => {
    await localPreferences.setThemeMode(mode);
    setPreferences(prev => ({ ...prev, themeMode: mode }));
  }, []);

  const setFeedSort = useCallback(async (sort) => {
    await localPreferences.setFeedSort(sort);
    setPreferences(prev => ({ ...prev, feedSort: sort }));
  }, []);

  const setTextSize = useCallback(async (size) => {
    await localPreferences.setTextSize(size);
    setPreferences(prev => ({ ...prev, textSize: size }));
  }, []);

  const setAutoPlayVideo = useCallback(async (enabled) => {
    await localPreferences.setAutoPlayVideo(enabled);
    setPreferences(prev => ({ ...prev, autoPlayVideo: enabled }));
  }, []);

  const setDataSaverMode = useCallback(async (enabled) => {
    await localPreferences.setDataSaverMode(enabled);
    setPreferences(prev => ({ ...prev, dataSaverMode: enabled }));
  }, []);

  // Onboarding
  const completeOnboarding = useCallback(async () => {
    await localPreferences.setOnboardingCompleted(true);
    setPreferences(prev => ({ ...prev, onboardingCompleted: true }));
  }, []);

  // Export for syncing
  const exportPreferences = useCallback(async () => {
    return localPreferences.getAllPreferences();
  }, []);

  // Import from server (after login)
  const importPreferences = useCallback(async (serverPrefs) => {
    await localPreferences.importPreferences(serverPrefs);
    await loadPreferences();
  }, []);

  // Clear all (logout)
  const clearPreferences = useCallback(async () => {
    await localPreferences.clearAll();
    setPreferences({
      selectedCategories: [],
      selectedCountries: ['ZW'],
      primaryCountry: 'ZW',
      themeMode: 'system',
      feedSort: 'latest',
      onboardingCompleted: false,
      textSize: 'medium',
      autoPlayVideo: true,
      dataSaverMode: false,
    });
  }, []);

  return {
    isLoading,
    preferences,
    // Category methods
    setSelectedCategories,
    toggleCategory,
    // Country methods
    setSelectedCountries,
    setPrimaryCountry,
    addCountry,
    removeCountry,
    // Display methods
    setThemeMode,
    setFeedSort,
    setTextSize,
    setAutoPlayVideo,
    setDataSaverMode,
    // Onboarding
    completeOnboarding,
    // Sync methods
    exportPreferences,
    importPreferences,
    clearPreferences,
    // Reload
    reload: loadPreferences,
  };
}

/**
 * Simplified hook for just feed sort preference
 */
export function useFeedSort() {
  const [feedSort, setFeedSortState] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSort();
  }, []);

  const loadSort = async () => {
    await localPreferences.init();
    const sort = await localPreferences.getFeedSort();
    setFeedSortState(sort);
    setIsLoading(false);
  };

  const setFeedSort = async (sort) => {
    await localPreferences.setFeedSort(sort);
    setFeedSortState(sort);
  };

  return { feedSort, setFeedSort, isLoading };
}

/**
 * Simplified hook for country preferences
 */
export function useCountryPreferences() {
  const [countries, setCountriesState] = useState(['ZW']);
  const [primaryCountry, setPrimaryState] = useState('ZW');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    await localPreferences.init();
    const [selected, primary] = await Promise.all([
      localPreferences.getSelectedCountries(),
      localPreferences.getPrimaryCountry(),
    ]);
    setCountriesState(selected);
    setPrimaryState(primary);
    setIsLoading(false);
  };

  const setSelectedCountries = async (countries) => {
    await localPreferences.setSelectedCountries(countries);
    setCountriesState(countries);
  };

  const setPrimaryCountry = async (code) => {
    await localPreferences.setPrimaryCountry(code);
    setPrimaryState(code);
  };

  const toggleCountry = async (code) => {
    const current = await localPreferences.getSelectedCountries();
    if (current.includes(code)) {
      await localPreferences.removeCountry(code);
    } else {
      await localPreferences.addCountry(code);
    }
    const updated = await localPreferences.getSelectedCountries();
    setCountriesState(updated);
  };

  return {
    countries,
    primaryCountry,
    isLoading,
    setSelectedCountries,
    setPrimaryCountry,
    toggleCountry,
    reload: loadCountries,
  };
}

export default useLocalPreferences;
