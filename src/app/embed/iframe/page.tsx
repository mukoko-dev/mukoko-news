"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ExternalLink, Clock } from "lucide-react";
import { api, type Article } from "@/lib/api";
import { getArticleUrl, BASE_URL } from "@/lib/constants";
import { isValidImageUrl, formatTimeAgo, safeCssUrl } from "@/lib/utils";
import { SourceIcon } from "@/components/ui/source-icon";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function EmbedCard({ article }: { article: Article }) {
  const timeAgo = formatTimeAgo(article.published_at);
  const category = article.category_id || article.category;
  const articleUrl = getArticleUrl(article.id);
  const hasImage = isValidImageUrl(article.image_url);

  return (
    <a
      href={articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <article className="flex gap-3 p-3 rounded-xl hover:bg-elevated transition-colors border border-transparent hover:border-primary/30">
        {/* Thumbnail */}
        {hasImage && (
          <div
            className="w-20 h-20 rounded-lg bg-elevated bg-cover bg-center shrink-0"
            style={{ backgroundImage: safeCssUrl(article.image_url!) }}
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Category */}
          {category && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {category}
            </span>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-1 text-text-tertiary">
            <SourceIcon source={article.source} size={12} showBorder={false} />
            <span className="text-[11px] truncate">{article.source}</span>
            <time
              className="flex items-center gap-0.5 text-[11px] shrink-0"
              dateTime={article.published_at}
            >
              <Clock className="w-2.5 h-2.5" aria-hidden="true" />
              {timeAgo}
            </time>
          </div>
        </div>

        {/* External link indicator */}
        <ExternalLink className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
      </article>
    </a>
  );
}

function EmbedSkeleton() {
  return (
    <div className="space-y-1 p-2" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 animate-pulse">
          <div className="w-20 h-20 rounded-lg bg-elevated shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 w-12 bg-elevated rounded" />
            <div className="h-3.5 w-full bg-elevated rounded" />
            <div className="h-3.5 w-3/4 bg-elevated rounded" />
            <div className="flex gap-2 mt-1">
              <div className="h-2.5 w-16 bg-elevated rounded" />
              <div className="h-2.5 w-12 bg-elevated rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EmbedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadArticles = useCallback(async () => {
    try {
      const data = await api.getArticles({
        countries: ["ZW"],
        limit: 15,
        sort: "latest",
      });
      setArticles(data.articles || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("[Embed] Failed to load articles:", err);
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadArticles, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadArticles]);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <a
          href={BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/mukoko-icon-dark.png"
            alt="Mukoko News"
            className="w-6 h-6 rounded"
          />
          <div>
            <h1 className="text-sm font-bold leading-none">Zimbabwe News</h1>
            <p className="text-[10px] text-text-tertiary leading-tight">
              Powered by Mukoko News
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-text-tertiary hidden sm:block">
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={() => {
              setLoading(true);
              loadArticles();
            }}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-tertiary hover:text-foreground"
            aria-label="Refresh news"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && articles.length === 0 ? (
          <EmbedSkeleton />
        ) : error && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-sm text-text-secondary mb-3">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                loadArticles();
              }}
              className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {articles.map((article) => (
              <EmbedCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-text-tertiary shrink-0">
        <span>
          {articles.length > 0
            ? `${articles.length} stories`
            : "Loading..."}
        </span>
        <a
          href={`${BASE_URL}/discover?country=ZW`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          More on Mukoko News
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </footer>
    </div>
  );
}
