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

  if (src) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${src})` }}
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
