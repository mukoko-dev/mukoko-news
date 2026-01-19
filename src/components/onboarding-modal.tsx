"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { usePreferences, COUNTRIES } from "@/contexts/preferences-context";
import { api, type Category } from "@/lib/api";

// Number of quick-pick items to show
const QUICK_COUNTRIES_COUNT = 4;
const QUICK_CATEGORIES_COUNT = 6;

export function OnboardingModal() {
  const {
    showOnboarding,
    selectedCountries,
    toggleCountry,
    selectedCategories,
    toggleCategory,
    completeOnboarding,
  } = usePreferences();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.getCategories();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    }
    if (showOnboarding) {
      loadCategories();
    }
  }, [showOnboarding]);

  if (!showOnboarding) return null;

  const handleGetStarted = () => {
    completeOnboarding();
  };

  // Show top countries and categories for quick selection
  const quickCountries = COUNTRIES.slice(0, QUICK_COUNTRIES_COUNT);
  const quickCategories = categories.slice(0, QUICK_CATEGORIES_COUNT);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop - click to skip */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleGetStarted}
        aria-hidden="true"
      />

      {/* Modal - compact and friendly */}
      <div className="relative w-full max-w-sm bg-[#1a1a2e] rounded-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={handleGetStarted}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          aria-label="Close and skip onboarding"
        >
          <X className="w-4 h-4 text-white" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h2 id="onboarding-title" className="text-xl font-bold text-white mb-1">
            Welcome to Mukoko
          </h2>
          <p className="text-white/60 text-sm">
            Personalize your news (optional)
          </p>
        </div>

        {/* Country selection */}
        <div className="px-6 pb-3">
          <p className="text-white/50 text-xs mb-2 font-medium" id="country-label">Your region</p>
          <div className="flex flex-wrap gap-2 justify-center" role="group" aria-labelledby="country-label">
            {quickCountries.map((country) => {
              const isSelected = selectedCountries.includes(country.code);
              return (
                <button
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-secondary text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                  aria-pressed={isSelected}
                >
                  {country.flag} {country.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category selection */}
        <div className="px-6 pb-4">
          <p className="text-white/50 text-xs mb-2 font-medium" id="category-label">Topics you like</p>
          {loading ? (
            <div className="flex items-center justify-center py-4" role="status">
              <Loader2 className="w-5 h-5 text-primary animate-spin" aria-label="Loading categories" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-labelledby="category-label">
              {quickCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {getCategoryEmoji(category.slug || category.name)} {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="p-6 pt-2">
          <button
            onClick={handleGetStarted}
            className="w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a2e]"
          >
            {selectedCategories.length > 0 || selectedCountries.length > 0
              ? "Start Reading"
              : "Show Me News"}
          </button>
          <p className="text-center text-white/40 text-xs mt-3">
            Customize more in Discover
          </p>
        </div>
      </div>
    </div>
  );
}

// Category emoji mapping
function getCategoryEmoji(slug: string): string {
  if (!slug) return "📰";
  const emojiMap: Record<string, string> = {
    politics: "🏛️",
    business: "💼",
    sports: "⚽",
    entertainment: "🎬",
    technology: "💻",
    health: "🏥",
    education: "📚",
    world: "🌍",
    local: "📍",
    opinion: "💭",
    lifestyle: "✨",
    science: "🔬",
    culture: "🎭",
    finance: "💰",
    economy: "📈",
  };
  return emojiMap[slug.toLowerCase()] || "📰";
}
