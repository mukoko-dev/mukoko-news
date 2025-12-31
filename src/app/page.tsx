"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight, Compass, RefreshCw, WifiOff } from "lucide-react";
import { CategoryChip } from "@/components/ui/category-chip";
import { ArticleCard } from "@/components/article-card";
import { usePreferences } from "@/contexts/preferences-context";
import { api, type Article, type Category } from "@/lib/api";

export default function FeedPage() {
  const { selectedCategories } = usePreferences();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const filtersSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  // Fetch articles and categories
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [articlesResponse, categoriesData] = await Promise.all([
        api.getArticles({ limit: 50 }),
        api.getCategories(),
      ]);
      setArticles(articlesResponse.articles || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to load news feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (!refreshing && !loading) {
      fetchData(true);
    }
  }, [refreshing, loading]);

  useEffect(() => {
    fetchData();
  }, []);

  // Pull-to-refresh for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || window.scrollY > 0) {
        setPullDistance(0);
        return;
      }
      const touchY = e.touches[0].clientY;
      const distance = Math.max(0, (touchY - touchStartY.current) * 0.5);
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 80) {
        handleRefresh();
      }
      setPullDistance(0);
      isPulling.current = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, handleRefresh]);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (filtersSectionRef.current) {
        const rect = filtersSectionRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 72);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  // Filter articles by selected category and user's country/category preferences
  const filteredArticles = useMemo(() => {
    let result = articles;

    // Filter by category_id (API returns category_id, not category)
    if (activeCategory) {
      result = result.filter(
        (a) => (a.category_id || a.category)?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    return result;
  }, [articles, activeCategory]);

  // Get personalized category chips - show user's selected categories first
  const displayCategories = useMemo(() => {
    if (selectedCategories.length === 0) return categories;

    const selected = categories.filter((c) =>
      selectedCategories.includes(c.id)
    );
    const others = categories.filter(
      (c) => !selectedCategories.includes(c.id)
    );
    return [...selected, ...others];
  }, [categories, selectedCategories]);

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Pull-to-refresh indicator (mobile) */}
      {pullDistance > 0 && (
        <div
          className="fixed top-[72px] left-0 right-0 flex justify-center z-50 md:hidden"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
        >
          <div className={`bg-primary/10 rounded-full p-2 ${pullDistance > 80 ? "animate-pulse" : ""}`}>
            <RefreshCw
              className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullDistance * 2}deg)` }}
            />
          </div>
        </div>
      )}

      {/* Refreshing indicator */}
      {refreshing && (
        <div className="fixed top-[80px] left-0 right-0 flex justify-center z-50">
          <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            Refreshing...
          </div>
        </div>
      )}

      {/* Feed Header */}
      <div className="py-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">For You</h1>
          <p className="text-xs text-text-tertiary">Pan-African News</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button (tablet/desktop) */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-sm font-medium hover:bg-elevated transition-colors disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden lg:inline">Refresh</span>
          </button>

          <Link
            href="/discover"
            className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-sm font-medium hover:bg-elevated transition-colors"
          >
            <Compass className="w-4 h-4" />
            Discover
          </Link>
        </div>
      </div>

      {/* Category Filters - Sticky on scroll */}
      <div ref={filtersSectionRef}>
        <section
          className={`py-3 border-b border-elevated transition-all duration-300 ${
            isSticky
              ? "fixed top-[72px] left-0 right-0 z-40 bg-background/80 backdrop-blur-xl shadow-sm"
              : ""
          }`}
        >
          <div className={isSticky ? "max-w-[1200px] mx-auto px-6" : ""}>
            <div className="relative flex items-center">
              {isSticky && (
                <button
                  onClick={() => scrollCategories("left")}
                  className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-background/90 rounded-full shadow-md hover:bg-elevated transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                className={`flex gap-2 overflow-x-auto scrollbar-hide ${
                  isSticky ? "px-10 scroll-smooth" : "flex-wrap"
                }`}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <CategoryChip
                  label="All"
                  active={activeCategory === null}
                  onClick={() => setActiveCategory(null)}
                />
                {displayCategories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    active={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  />
                ))}
              </div>

              {isSticky && (
                <button
                  onClick={() => scrollCategories("right")}
                  className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-background/90 rounded-full shadow-md hover:bg-elevated transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>
        {isSticky && <div className="h-[52px]" />}
      </div>

      {/* Articles Feed */}
      <section className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {activeCategory
              ? categories.find((c) => c.id === activeCategory)?.name || activeCategory
              : "Latest"}
          </h2>
          <span className="text-sm text-text-tertiary">
            {filteredArticles.length} articles
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <WifiOff className="w-12 h-12 text-text-tertiary mb-4" />
            <p className="text-lg text-text-secondary mb-2">Unable to load articles</p>
            <p className="text-sm text-text-tertiary mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-lg">No articles found.</p>
            <button
              onClick={() => setActiveCategory(null)}
              className="mt-4 text-primary font-medium hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
