"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight, Compass, RefreshCw, WifiOff } from "lucide-react";
import { CategoryChip } from "@/components/ui/category-chip";
import { ArticleCard } from "@/components/article-card";
import { HeroCard } from "@/components/hero-card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FeedPageSkeleton, CategoryChipSkeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/contexts/preferences-context";
import { api, type Article, type Category } from "@/lib/api";
import { isValidImageUrl } from "@/lib/utils";

// Simplified layout - Featured + Latest only

export default function FeedPage() {
  const { selectedCategories, selectedCountries } = usePreferences();

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
        api.getArticles({
          limit: 50,
          countries: selectedCountries.length > 0 ? selectedCountries : undefined,
        }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries.join(',')]);

  // Pull-to-refresh for mobile
  useEffect(() => {
    // Use refs to avoid stale closure and excessive re-renders
    let currentPullDistance = 0;
    let rafId: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || window.scrollY > 0) {
        currentPullDistance = 0;
        setPullDistance(0);
        return;
      }
      const touchY = e.touches[0].clientY;
      const distance = Math.max(0, (touchY - touchStartY.current) * 0.5);
      if (distance > 0 && distance < 150) {
        currentPullDistance = distance;
        // Use requestAnimationFrame for smoother animation
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          setPullDistance(distance);
        });
      }
    };

    const handleTouchEnd = () => {
      if (currentPullDistance > 80) {
        handleRefresh();
      }
      currentPullDistance = 0;
      // Use requestAnimationFrame for final state update
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setPullDistance(0);
      });
      isPulling.current = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [handleRefresh]);

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
    if (!activeCategory) return articles;

    return articles.filter(
      (a) => (a.category_id || a.category)?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [articles, activeCategory]);

  // Simple split: Featured (first with image) + Latest (all others)
  const { featuredArticle, latestArticles } = useMemo(() => {
    const featured = filteredArticles.find((a) => isValidImageUrl(a.image_url)) || filteredArticles[0];
    const latest = filteredArticles.filter((a) => a.id !== featured?.id);
    return { featuredArticle: featured || null, latestArticles: latest };
  }, [filteredArticles]);

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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Pull-to-refresh indicator (mobile) */}
      {pullDistance > 0 && (
        <div
          className="fixed top-[72px] left-0 right-0 flex justify-center z-50 md:hidden"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
          aria-hidden="true"
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
        <div className="fixed top-[80px] left-0 right-0 flex justify-center z-50" role="status" aria-live="polite">
          <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Refreshing...
          </div>
        </div>
      )}

      {/* Feed Header */}
      <header className="py-5 flex items-center justify-between">
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
            aria-label="Refresh news feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="hidden lg:inline">Refresh</span>
          </button>

          <Link
            href="/discover"
            className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-sm font-medium hover:bg-elevated transition-colors"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            Discover
          </Link>
        </div>
      </header>

      {/* Category Filters - Sticky on scroll */}
      <div ref={filtersSectionRef}>
        <nav
          aria-label="Category filters"
          className={`py-3 border-b border-elevated transition-all duration-300 ${
            isSticky
              ? "fixed top-[72px] left-0 right-0 z-40 bg-background/80 backdrop-blur-xl shadow-sm"
              : ""
          }`}
        >
          <div className={isSticky ? "max-w-[1200px] mx-auto px-4 sm:px-6" : ""}>
            <div className="relative flex items-center">
              {isSticky && (
                <button
                  onClick={() => scrollCategories("left")}
                  className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-background/90 rounded-full shadow-md hover:bg-elevated transition-colors"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                className={`flex gap-2 overflow-x-auto scrollbar-hide ${
                  isSticky ? "px-10 scroll-smooth" : "flex-wrap"
                }`}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                role="tablist"
                aria-label="News categories"
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
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </nav>
        {isSticky && <div className="h-[52px]" />}
      </div>

      {/* Main Content */}
      <main>
        {loading ? (
          <FeedPageSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
            <WifiOff className="w-12 h-12 text-text-tertiary mb-4" aria-hidden="true" />
            <p className="text-lg text-text-secondary mb-2">Unable to load articles</p>
            <p className="text-sm text-text-tertiary mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="py-6 space-y-8">
            {/* Featured Article */}
            {featuredArticle && (
              <ErrorBoundary fallback={<div className="p-8 rounded-2xl bg-surface text-center text-text-secondary">Featured story unavailable</div>}>
                <section aria-labelledby="featured-heading">
                  <h2 id="featured-heading" className="sr-only">Featured Story</h2>
                  <HeroCard article={featuredArticle} />
                </section>
              </ErrorBoundary>
            )}

            {/* Latest Articles */}
            {latestArticles.length > 0 && (
              <ErrorBoundary fallback={<div className="p-4 rounded-lg bg-surface text-center text-text-secondary">Latest articles unavailable</div>}>
                <section aria-labelledby="latest-heading">
                  <div className="flex justify-between items-center mb-4">
                    <h2 id="latest-heading" className="text-lg font-bold">Latest</h2>
                    <span className="text-sm text-text-tertiary">
                      {latestArticles.length} articles
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              </ErrorBoundary>
            )}
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
      </main>
    </div>
  );
}
