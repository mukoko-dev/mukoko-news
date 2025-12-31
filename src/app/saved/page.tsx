"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/api";

export default function SavedPage() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from API or localStorage
    // For now, show empty state
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Saved Articles</h1>
        <p className="text-text-secondary">
          Articles you&apos;ve bookmarked for later reading
        </p>
      </div>

      {savedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-text-tertiary" />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">No saved articles</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            When you find articles you want to read later, tap the bookmark icon
            to save them here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Discover Articles
          </Link>
        </div>
      )}
    </div>
  );
}
