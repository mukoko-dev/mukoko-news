"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  Share2,
  ChevronLeft,
  AlertCircle,
  Clock,
  Tag,
  RefreshCw,
  Check,
} from "lucide-react";
import { api, type Article } from "@/lib/api";
import { ArticlePageSkeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ArticleJsonLd } from "@/components/ui/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getArticle(articleId);
      if (data.article) {
        setArticle(data.article);
        setIsLiked(data.article.isLiked || false);
        setIsSaved(data.article.isSaved || false);
        setLikesCount(data.article.likesCount || 0);
      } else {
        setError("Article not found");
      }
    } catch (err) {
      console.error("Failed to load article:", err);
      setError("Failed to load article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = async () => {
    if (!article) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || article.title,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed - fallback to clipboard
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return <ArticlePageSkeleton />;
  }

  // Force refresh handler
  const handleForceRefresh = () => {
    router.refresh();
    loadArticle();
  };

  if (error || !article) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6">
        <div className="text-center bg-surface border border-elevated rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-text-secondary mb-6">{error || "This article doesn't exist."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-elevated text-foreground font-medium rounded-xl hover:bg-elevated/80 transition-opacity"
            >
              Go Back
            </button>
            <button
              onClick={handleForceRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const articleUrl = typeof window !== "undefined" ? window.location.href : "";
  const category = article.category_id || article.category;

  return (
    <ErrorBoundary fallback={<div className="p-8 text-center text-text-secondary">Failed to render article content</div>}>
      <ArticleJsonLd article={article} url={articleUrl} />
      <div className="pb-16">
        {/* Breadcrumb */}
        <div className="max-w-[800px] mx-auto px-6 py-3">
          <Breadcrumb
            items={[
              ...(category ? [{ label: category, href: `/discover?category=${category}` }] : []),
              { label: article.title },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="bg-primary text-white px-6 py-12 relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-background/20 rounded-full hover:bg-background/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-background/20 rounded-full hover:bg-background/30 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <div className="max-w-[800px] mx-auto pt-12">
          {/* Category Badge */}
          {(article.category_id || article.category) && (
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">
                {article.category_id || article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-6">
            {article.title}
          </h1>

          {/* Source and Date */}
          <div className="flex items-center gap-4 text-white/80">
            <span className="font-medium">{article.source}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(article.published_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Article Image */}
      {article.image_url && (
        <div className="max-w-[900px] mx-auto px-6 -mt-6">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-[800px] mx-auto px-6 py-8">
        {/* Description */}
        {article.description && (
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            {article.description}
          </p>
        )}

        {/* Content */}
        {article.content && (
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            {article.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-elevated my-8" />

        {/* Action Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
              isLiked
                ? "bg-red-500/10 text-red-500"
                : "bg-surface text-foreground hover:bg-elevated"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{likesCount}</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
              isSaved
                ? "bg-primary/10 text-primary"
                : "bg-surface text-foreground hover:bg-elevated"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            <span className="font-medium">{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ml-auto ${
              copySuccess
                ? "bg-success text-white"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {copySuccess ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            <span className="font-medium">{copySuccess ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}
