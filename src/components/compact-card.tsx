"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { SourceIcon } from "@/components/ui/source-icon";

interface CompactCardProps {
  article: Article;
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
          <SourceIcon source={article.source} size={14} showBorder={false} />
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
