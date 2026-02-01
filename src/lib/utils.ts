import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string as relative time (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Handle future dates (clock skew or scheduled content)
    if (diffMs < 0) return "Recently";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins === 0) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

/**
 * Build a safe CSS url() value using encodeURI for standards-compliant escaping.
 * Prevents CSS injection by encoding all special characters.
 * Handles already-encoded URLs by decoding first to avoid double-encoding.
 */
export function safeCssUrl(src: string): string {
  try {
    // Decode first to handle already-encoded URLs, then encode fresh
    // This prevents double-encoding (e.g., %20 becoming %2520)
    const decoded = decodeURI(src);
    return `url('${encodeURI(decoded)}')`;
  } catch {
    // If decodeURI fails (malformed %), just encode as-is
    return `url('${encodeURI(src)}')`;
  }
}

/**
 * Validate that a URL is safe for use in image src attributes
 * Prevents XSS via javascript: URLs or other dangerous protocols
 * Supports relative URLs for local images (Next.js Image handles these)
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;

  // Relative URLs starting with / are safe for Next.js Image
  if (url.startsWith('/')) return true;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
