"use client";

import { useState, useEffect } from "react";
import { X, Check, ChevronRight, Loader2 } from "lucide-react";
import { usePreferences, COUNTRIES } from "@/contexts/preferences-context";
import { api, type Category } from "@/lib/api";

export function OnboardingModal() {
  const {
    showOnboarding,
    setShowOnboarding,
    selectedCountries,
    primaryCountry,
    toggleCountry,
    setPrimaryCountry,
    selectedCategories,
    toggleCategory,
    completeOnboarding,
  } = usePreferences();

  const [step, setStep] = useState(1);
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

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const canContinue = step === 1
    ? true // Countries are optional
    : selectedCategories.length >= 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="w-12 h-1 rounded-full bg-white/30 mx-auto mt-4 mb-2" />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Progress */}
        <div className="flex justify-center gap-2 py-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all ${
                s === step ? "w-12 bg-primary" : s < step ? "w-8 bg-primary" : "w-8 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center px-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? "Choose Your Countries" : "Select Your Interests"}
          </h2>
          <p className="text-white/70 text-sm">
            {step === 1
              ? "Get news from countries you care about"
              : "Choose at least 3 topics to follow"}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {step === 1 ? (
            /* Country Selection */
            <div className="grid grid-cols-3 gap-3">
              {COUNTRIES.map((country) => {
                const isSelected = selectedCountries.includes(country.code);
                const isPrimary = primaryCountry === country.code;
                return (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    onDoubleClick={() => setPrimaryCountry(country.code)}
                    className={`relative p-3 rounded-xl border text-center transition-all ${
                      isPrimary
                        ? "bg-emerald-600 border-emerald-500"
                        : isSelected
                        ? "bg-primary border-primary"
                        : "bg-white/10 border-white/20 hover:border-white/40"
                    }`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <p className="text-xs font-medium text-white mt-1 truncate">
                      {country.name}
                    </p>
                    {isPrimary && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                        <span className="text-[10px]">★</span>
                      </div>
                    )}
                    {isSelected && !isPrimary && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Category Selection */
            loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-4 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-primary/40 border-primary"
                          : "bg-white/10 border-white/20 hover:border-white/40"
                      }`}
                    >
                      <span className="text-2xl block mb-1">
                        {getCategoryEmoji(category.slug || category.name)}
                      </span>
                      <p className="text-sm font-medium text-white">
                        {category.name}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* Hint text */}
          <p className="text-center text-white/50 text-sm mt-4">
            {step === 1 && selectedCountries.length === 0 && "No selection = news from all of Africa"}
            {step === 1 && selectedCountries.length > 0 && `${selectedCountries.length} countries selected`}
            {step === 2 && selectedCategories.length < 3 && `${selectedCategories.length}/3 minimum selected`}
            {step === 2 && selectedCategories.length >= 3 && `${selectedCategories.length} topics selected`}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-white/10">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-6 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                canContinue
                  ? "bg-primary text-white hover:opacity-90"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}
            >
              {step === 1 ? (
                selectedCountries.length === 0 ? "Skip" : "Next"
              ) : (
                "Get Started"
              )}
              {step === 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-white/50 text-sm hover:text-white/70 transition-colors mt-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// Category emoji mapping
function getCategoryEmoji(slug: string): string {
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
