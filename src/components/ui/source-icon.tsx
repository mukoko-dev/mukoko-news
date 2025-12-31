"use client";

import { useState } from "react";
import Image from "next/image";
import { getFaviconUrl, getSourceColors, getSourceInitials } from "@/lib/source-profiles";

interface SourceIconProps {
  source: string;
  size?: number;
  showBorder?: boolean;
  className?: string;
}

export function SourceIcon({ source, size = 20, showBorder = true, className = "" }: SourceIconProps) {
  const [imageError, setImageError] = useState(false);

  const faviconUrl = getFaviconUrl(source, size * 2);
  const colors = getSourceColors(source);
  const initials = getSourceInitials(source);

  const showInitials = !faviconUrl || imageError;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: showInitials ? colors.primary : 'transparent',
        border: showBorder ? '1px solid rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {showInitials ? (
        <span
          className="font-bold text-white"
          style={{ fontSize: size * 0.45 }}
        >
          {initials.substring(0, 2)}
        </span>
      ) : (
        <Image
          src={faviconUrl!}
          alt={source}
          width={size}
          height={size}
          className="rounded-full"
          onError={() => setImageError(true)}
          unoptimized
        />
      )}
    </div>
  );
}

interface SourceBadgeProps {
  source: string;
  iconSize?: number;
  className?: string;
}

export function SourceBadge({ source, iconSize = 16, className = "" }: SourceBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <SourceIcon source={source} size={iconSize} showBorder={false} />
      <span className="text-xs font-medium text-text-secondary truncate">
        {source}
      </span>
    </div>
  );
}
