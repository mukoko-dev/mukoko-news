import { isValidImageUrl } from "@/lib/utils";

interface AvatarProps {
  initials?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function buildBackgroundImage(src: string): string {
  try {
    // Normalize the URL; if it's relative, resolve it against the current origin
    const url = new URL(src, window.location.origin).toString();
    return `url('${encodeURI(url)}')`;
  } catch {
    // Fallback to a safe, encoded version of the original src
    return `url('${encodeURI(src)}')`;
  }
}

export function Avatar({ initials, src, size = "md", className = "" }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  // Validate URL to prevent XSS via javascript: or data: URLs
  if (src && isValidImageUrl(src)) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-cover bg-center ${className}`}
        style={{ backgroundImage: buildBackgroundImage(src) }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-white cursor-pointer ${className}`}
    >
      {initials}
    </div>
  );
}
