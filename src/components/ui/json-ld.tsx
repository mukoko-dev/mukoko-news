import type { Article } from "@/lib/api";

interface NewsArticleSchema {
  "@context": "https://schema.org";
  "@type": "NewsArticle";
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    "@type": "Organization";
    name: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
}

interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

/**
 * Safely stringify JSON for embedding in script tags.
 * Escapes sequences that could break out of the script context.
 * This prevents XSS via </script> or <!-- injection in user content.
 */
function safeJsonLdStringify(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")  // Escape < to prevent </script> injection
    .replace(/>/g, "\\u003e")  // Escape > for safety
    .replace(/&/g, "\\u0026"); // Escape & for HTML entity safety
}

export function ArticleJsonLd({ article, url }: { article: Article; url: string }) {
  const schema: NewsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.image_url,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      "@type": "Organization",
      name: article.source,
    },
    publisher: {
      "@type": "Organization",
      name: "Mukoko News",
      logo: {
        "@type": "ImageObject",
        url: "https://mukoko.news/icon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  // safeJsonLdStringify escapes <, >, & to Unicode to prevent XSS
  const safeJson = safeJsonLdStringify(schema);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; href?: string }> }) {
  const schema: BreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? `https://mukoko.news${item.href}` : undefined,
    })),
  };

  // safeJsonLdStringify escapes <, >, & to Unicode to prevent XSS
  const safeJson = safeJsonLdStringify(schema);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mukoko News",
    description: "Pan-African digital news aggregation platform",
    url: "https://mukoko.news",
    logo: "https://mukoko.news/icon.png",
    sameAs: [],
  };

  // safeJsonLdStringify escapes <, >, & to Unicode to prevent XSS
  const safeJson = safeJsonLdStringify(schema);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
