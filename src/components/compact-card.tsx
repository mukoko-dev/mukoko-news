"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/api";
import { SourceBadge } from "@/components/ui/source-icon";

interface CompactCardProps {
  article: Article;
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function CompactCard({ article }: CompactCardProps) {
  const timeAgo = formatTimeAgo(article.published_at);

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <div className="p-4 rounded-xl bg-surface hover:bg-elevated transition-colors border-l-4 border-primary/60 hover:border-primary">
        {/* Category */}
        {(article.category_id || article.category) && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {article.category_id || article.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold mt-1 mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-text-tertiary">
          <SourceBadge source={article.source} iconSize={14} showName={false} />
          <span className="text-xs">{article.source}</span>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
