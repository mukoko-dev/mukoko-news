"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/api";
import { SourceBadge } from "@/components/ui/source-icon";

interface HeroCardProps {
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

export function HeroCard({ article }: HeroCardProps) {
  const hasImage = article.image_url && article.image_url.startsWith("http");
  const timeAgo = formatTimeAgo(article.published_at);

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <div className="relative rounded-2xl overflow-hidden bg-surface">
        {/* Large image area */}
        <div
          className="relative h-[280px] sm:h-[340px] md:h-[400px] w-full"
          style={
            hasImage
              ? {
                  background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%), url('${article.image_url}') center/cover`,
                }
              : {
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                }
          }
        >
          {/* Category badge */}
          {(article.category_id || article.category) && (
            <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              {article.category_id || article.category}
            </div>
          )}

          {/* Content overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h2>

            {article.description && (
              <p className="text-white/70 text-sm sm:text-base line-clamp-2 mb-4 max-w-2xl">
                {article.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-white/60">
              <SourceBadge source={article.source} iconSize={20} className="text-white/80" />
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
