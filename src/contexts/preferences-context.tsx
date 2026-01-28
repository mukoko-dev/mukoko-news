"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { COUNTRIES } from "@/lib/constants";

// Re-export for backwards compatibility
export { COUNTRIES } from "@/lib/constants";

interface PreferencesContextType {
  // Countries
  selectedCountries: string[];
  primaryCountry: string | null;
  toggleCountry: (code: string) => void;
  setPrimaryCountry: (code: string) => void;

  // Categories
  selectedCategories: string[];
  toggleCategory: (id: string) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;

  // Reset
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const STORAGE_KEYS = {
  countries: "mukoko-countries",
  primaryCountry: "mukoko-primary-country",
  categories: "mukoko-categories",
  onboarding: "mukoko-onboarding-complete",
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [primaryCountry, setPrimaryCountryState] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const countries = localStorage.getItem(STORAGE_KEYS.countries);
    const primary = localStorage.getItem(STORAGE_KEYS.primaryCountry);
    const categories = localStorage.getItem(STORAGE_KEYS.categories);
    const onboarding = localStorage.getItem(STORAGE_KEYS.onboarding);

    if (countries) {
      setSelectedCountries(JSON.parse(countries));
    } else {
      // Default to Zimbabwe if no countries saved
      setSelectedCountries(["ZW"]);
    }

    if (primary) {
      setPrimaryCountryState(primary);
    } else {
      // Default to Zimbabwe if no primary country saved
      setPrimaryCountryState("ZW");
    }

    if (categories) setSelectedCategories(JSON.parse(categories));

    const completed = onboarding === "true";
    setHasCompletedOnboarding(completed);

    // Show onboarding if not completed
    if (!completed) {
      setShowOnboarding(true);
    }

    setIsLoaded(true);
  }, []);

  // Save countries
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.countries, JSON.stringify(selectedCountries));
    }
  }, [selectedCountries, isLoaded]);

  // Save primary country
  useEffect(() => {
    if (isLoaded) {
      if (primaryCountry) {
        localStorage.setItem(STORAGE_KEYS.primaryCountry, primaryCountry);
      } else {
        localStorage.removeItem(STORAGE_KEYS.primaryCountry);
      }
    }
  }, [primaryCountry, isLoaded]);

  // Save categories
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(selectedCategories));
    }
  }, [selectedCategories, isLoaded]);

  // Sync primaryCountry when selectedCountries changes
  // Kept outside toggleCountry to avoid stale closure over primaryCountry
  useEffect(() => {
    if (!isLoaded) return;
    if (selectedCountries.length === 0) {
      setPrimaryCountryState(null);
    } else if (!primaryCountry || !selectedCountries.includes(primaryCountry)) {
      setPrimaryCountryState(selectedCountries[0]);
    }
  }, [selectedCountries, isLoaded, primaryCountry]);

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const setPrimaryCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      setPrimaryCountryState(code);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
    localStorage.setItem(STORAGE_KEYS.onboarding, "true");
  };

  const resetPreferences = () => {
    setSelectedCountries([]);
    setPrimaryCountryState(null);
    setSelectedCategories([]);
    setHasCompletedOnboarding(false);
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  };

  // Don't render children until preferences are loaded from localStorage
  // This prevents blank screen flash on initial load or after skip
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PreferencesContext.Provider
      value={{
        selectedCountries,
        primaryCountry,
        toggleCountry,
        setPrimaryCountry,
        selectedCategories,
        toggleCategory,
        hasCompletedOnboarding,
        completeOnboarding,
        showOnboarding,
        setShowOnboarding,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
