"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

interface AppIconProps {
  size?: number;
  className?: string;
}

export function AppIcon({ size = 32, className = "" }: AppIconProps) {
  const { resolvedTheme } = useTheme();

  // Use matching icon for current theme
  const iconSrc = resolvedTheme === "dark"
    ? "/mukoko-icon-dark.png"
    : "/mukoko-icon-light.png";

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconSrc}
        alt="Mukoko News"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}
