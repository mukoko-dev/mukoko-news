import { isValidImageUrl } from "@/lib/utils";

interface AvatarProps {
  initials?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
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
        style={{ backgroundImage: `url('${src.replace(/'/g, "\\'")}')` }}
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
