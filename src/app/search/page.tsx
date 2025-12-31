"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, TrendingUp, Users, BarChart3, X } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { CategoryChip } from "@/components/ui/category-chip";
import { api, type Article, type Category } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Sample trending topics (would come from API)
  const trendingTopics = [
    { name: "Zimbabwe", count: 1245 },
    { name: "Politics", count: 892 },
    { name: "Economy", count: 734 },
    { name: "Sports", count: 621 },
    { name: "Business", count: 512 },
    { name: "Health", count: 423 },
  ];

  // Sample stats (would come from API)
  const stats = {
    totalArticles: 15420,
    activeSources: 56,
    categories: 12,
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setInsightsLoading(true);
    try {
      const categoriesData = await api.getCategories();
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const performSearch = useCallback(async (searchQuery: string, category?: string | null) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setActiveQuery("");
      return;
    }

    setLoading(true);
    setActiveQuery(searchQuery);

    try {
      const data = await api.search(searchQuery, { limit: 50 });
      let filtered = data.articles || [];

      if (category) {
        filtered = filtered.filter(
          (a) => (a.category_id || a.category)?.toLowerCase() === category.toLowerCase()
        );
      }

      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, selectedCategory);
  };

  const handleClear = () => {
    setQuery("");
    setActiveQuery("");
    setResults([]);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      if (activeQuery) performSearch(activeQuery, null);
    } else {
      setSelectedCategory(categoryName);
      if (activeQuery) performSearch(activeQuery, categoryName);
    }
  };

  const handleTrendingClick = (topic: string) => {
    setQuery(topic);
    performSearch(topic, selectedCategory);
  };

  const isSearchMode = activeQuery.length > 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center gap-3 bg-surface border border-elevated rounded-2xl px-4 py-3 focus-within:border-primary transition-colors">
            <Search className="w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search African news..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-text-tertiary"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-elevated rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            )}
            {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
          </div>
        </form>
      </div>

      {/* Category Filters - Only in search mode */}
      {isSearchMode && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.slice(0, 8).map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={selectedCategory === category.name}
              onClick={() => handleCategoryClick(category.name)}
            />
          ))}
        </div>
      )}

      {/* Search Results */}
      {isSearchMode && !loading && (
        <>
          <div className="flex items-center gap-2 mb-6 text-sm text-text-secondary">
            <span>Found {results.length} results for &quot;{activeQuery}&quot;</span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-6xl mb-4 opacity-50">📭</p>
              <h3 className="font-serif text-xl font-bold mb-2">No results found</h3>
              <p className="text-text-secondary mb-4">
                Try a different search term or category
              </p>
              <button
                onClick={handleClear}
                className="text-primary font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}

      {/* Insights Content - When not searching */}
      {!isSearchMode && !loading && (
        <>
          {/* AI Suggestions */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Suggested Topics
            </h3>
            <div className="flex gap-2 flex-wrap">
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleTrendingClick(category.name)}
                  className="px-4 py-2 bg-surface border border-elevated rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Searches */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Trending Searches
              </h3>
            </div>
            <div className="bg-surface border border-elevated rounded-2xl overflow-hidden">
              {trendingTopics.map((topic, index) => (
                <button
                  key={topic.name}
                  onClick={() => handleTrendingClick(topic.name)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors border-b border-elevated last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <span className="font-medium">{topic.name}</span>
                  </div>
                  <span className="text-sm text-text-tertiary">
                    {topic.count.toLocaleString()} articles
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-secondary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Platform Stats
              </h3>
            </div>
            <div className="bg-surface border border-elevated rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl mb-1">📰</p>
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalArticles.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-tertiary">Articles</p>
                </div>
                <div className="border-x border-elevated">
                  <p className="text-3xl mb-1">📡</p>
                  <p className="text-2xl font-bold text-primary">
                    {stats.activeSources}
                  </p>
                  <p className="text-xs text-text-tertiary">Sources</p>
                </div>
                <div>
                  <p className="text-3xl mb-1">🗂️</p>
                  <p className="text-2xl font-bold text-primary">
                    {stats.categories}
                  </p>
                  <p className="text-xs text-text-tertiary">Topics</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
