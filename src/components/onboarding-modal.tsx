"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { usePreferences } from "@/contexts/preferences-context";
import { api, type Category } from "@/lib/api";

export function OnboardingModal() {
  const {
    showOnboarding,
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

  // Show top 6 popular categories for quick selection
  const quickCategories = categories.slice(0, 6);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - click to skip */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleGetStarted}
      />

      {/* Modal - compact and friendly */}
      <div className="relative w-full max-w-sm bg-[#1a1a2e] rounded-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={handleGetStarted}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Welcome to Mukoko
          </h2>
          <p className="text-white/60 text-sm">
            Pick topics you like (optional)
          </p>
        </div>

        {/* Quick category selection */}
        <div className="px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {quickCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
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
            className="w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {selectedCategories.length > 0 ? "Start Reading" : "Show Me News"}
          </button>
          <p className="text-center text-white/40 text-xs mt-3">
            You can always customize later in Discover
          </p>
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
