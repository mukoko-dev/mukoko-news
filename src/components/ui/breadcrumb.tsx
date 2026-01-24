"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbJsonLd } from "./json-ld";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLdItems = [
    { name: "Home", href: "/" },
    ...items.map((item) => ({ name: item.label, href: item.href })),
  ];

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-tertiary overflow-x-auto">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">Home</span>
        </Link>
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="w-3.5 h-3.5" />
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
