"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2, Newspaper } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { api, type Article, type Category } from "@/lib/api";

// Pan-African countries with flags and colors
const COUNTRIES = [
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", color: "bg-green-600" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", color: "bg-yellow-500" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", color: "bg-red-600" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", color: "bg-green-500" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", color: "bg-yellow-400" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", color: "bg-blue-500" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", color: "bg-yellow-600" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", color: "bg-cyan-500" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", color: "bg-green-400" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", color: "bg-sky-400" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", color: "bg-orange-500" },
  { code: "MW", name: "Malawi", flag: "🇲🇼", color: "bg-red-500" },
];

// Category emoji and color mapping
const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  all: { emoji: "📰", color: "bg-gray-500" },
  politics: { emoji: "🏛️", color: "bg-red-500" },
  economy: { emoji: "💰", color: "bg-emerald-500" },
  technology: { emoji: "💻", color: "bg-blue-500" },
  sports: { emoji: "⚽", color: "bg-orange-500" },
  health: { emoji: "🏥", color: "bg-green-500" },
  education: { emoji: "📚", color: "bg-violet-500" },
  entertainment: { emoji: "🎬", color: "bg-pink-500" },
  international: { emoji: "🌍", color: "bg-cyan-500" },
  general: { emoji: "📰", color: "bg-lime-500" },
  harare: { emoji: "🏙️", color: "bg-teal-500" },
  agriculture: { emoji: "🌾", color: "bg-amber-500" },
  crime: { emoji: "🚔", color: "bg-red-600" },
  environment: { emoji: "🌍", color: "bg-green-600" },
};

interface Source {
  id: string;
  name: string;
  country_code?: string;
  article_count?: number;
}

interface Keyword {
  id: string;
  name: string;
  slug: string;
  type: string;
  article_count: number;
}

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Check for active filters from URL
  const activeCategory = searchParams.get("category");
  const activeCountry = searchParams.get("country");
  const activeSource = searchParams.get("source");

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, categoriesRes, sourcesRes, keywordsRes] = await Promise.all([
          api.getArticles({ limit: 50 }),
          api.getCategories(),
          api.getSources(),
          api.getKeywords(32),
        ]);
        setArticles(articlesRes.articles || []);
        setCategories(categoriesRes.categories?.filter(c => c.id !== "all") || []);
        setSources(sourcesRes.sources || []);
        setKeywords(keywordsRes.keywords || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter articles based on URL params
  const filteredArticles = articles.filter((a) => {
    if (activeCategory && (a.category_id || a.category) !== activeCategory) return false;
    if (activeCountry && (a.country_id || a.country) !== activeCountry) return false;
    if (activeSource && a.source !== activeSource) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.source?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isFiltered = activeCategory || activeCountry || activeSource;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discover</h1>
        <p className="text-text-secondary">
          Explore news from across Africa, browse by category, or check out stories from your favorite sources.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, topics, or sources..."
          className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border border-elevated outline-none text-foreground placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
        />
      </form>

      {/* Show filtered results if filters are active */}
      {isFiltered ? (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {activeCategory && categories.find(c => c.id === activeCategory)?.name}
                {activeCountry && COUNTRIES.find(c => c.code === activeCountry)?.name}
                {activeSource && activeSource}
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                {filteredArticles.length} articles found
              </p>
            </div>
            <Link
              href="/discover"
              className="text-sm text-primary font-medium hover:underline"
            >
              Clear filters
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">No articles found for this filter.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Latest News Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Latest News</h2>
                <p className="text-text-secondary text-sm mt-0.5">Pan-African</p>
              </div>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          {/* Trending Topics - Tag Cloud */}
          {keywords.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-6">Trending Topics</h2>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => {
                  // Calculate font size based on article_count (min 0.75rem, max 1.5rem)
                  const maxCount = Math.max(...keywords.map(k => k.article_count));
                  const minCount = Math.min(...keywords.map(k => k.article_count));
                  const range = maxCount - minCount || 1;
                  const normalized = (keyword.article_count - minCount) / range;
                  const fontSize = 0.75 + (normalized * 0.75); // 0.75rem to 1.5rem
                  const fontWeight = normalized > 0.5 ? 600 : 400;

                  return (
                    <Link
                      key={keyword.id}
                      href={`/search?q=${encodeURIComponent(keyword.name)}`}
                      className="px-3 py-1.5 bg-surface rounded-full border border-elevated hover:border-primary/30 hover:bg-elevated transition-all text-foreground hover:text-primary"
                      style={{ fontSize: `${fontSize}rem`, fontWeight }}
                    >
                      {keyword.name}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Browse by Category */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((category) => {
                const meta = CATEGORY_META[category.id] || { emoji: "📰", color: "bg-gray-500" };
                return (
                  <Link
                    key={category.id}
                    href={`/discover?category=${category.id}`}
                    className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-elevated hover:border-primary/30 hover:bg-elevated transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-full ${meta.color} flex items-center justify-center text-lg`}>
                      {meta.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {category.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {category.article_count || 0} Articles
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Browse by Country */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Browse by Country</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {COUNTRIES.map((country) => {
                const articleCount = articles.filter(a => (a.country_id || a.country) === country.code).length;
                return (
                  <Link
                    key={country.code}
                    href={`/discover?country=${country.code}`}
                    className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-elevated hover:border-primary/30 hover:bg-elevated transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-full ${country.color} flex items-center justify-center text-lg`}>
                      {country.flag}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {country.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {articleCount > 0 ? `${articleCount} Articles` : "Browse news"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Browse by Source */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Browse by Source</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sources.slice(0, 12).map((source) => (
                <Link
                  key={source.id}
                  href={`/discover?source=${encodeURIComponent(source.name)}`}
                  className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-elevated hover:border-primary/30 hover:bg-elevated transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {source.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {source.article_count || 0} Articles
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {sources.length > 12 && (
              <div className="mt-4 text-center">
                <Link
                  href="/sources"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  View all {sources.length} sources
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
