import type { Article } from "@/lib/api";
import { BASE_URL, getFullUrl, getArticleUrl } from "@/lib/constants";

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

interface ItemListSchema {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name?: string;
  description?: string;
  numberOfItems: number;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    item: {
      "@type": "NewsArticle";
      "@id": string;
      headline: string;
      description?: string;
      image?: string;
      datePublished: string;
      author?: {
        "@type": "Organization";
        name: string;
      };
      publisher: {
        "@type": "Organization";
        name: string;
      };
    };
  }>;
}

interface CollectionPageSchema {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  isPartOf: {
    "@type": "WebSite";
    name: string;
    url: string;
  };
  mainEntity?: {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      url: string;
    }>;
  };
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
        url: `${BASE_URL}/icon.png`,
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
      item: item.href ? getFullUrl(item.href) : undefined,
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
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
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

/**
 * ItemList JSON-LD for a section of articles (e.g., Top Stories, Latest)
 * Uses safeJsonLdStringify to escape <, >, & and prevent XSS attacks.
 * @see https://schema.org/ItemList
 */
export function ItemListJsonLd({
  articles,
  name,
  description,
}: {
  articles: Article[];
  name?: string;
  description?: string;
}) {
  if (!articles || articles.length === 0) return null;

  const schema: ItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "NewsArticle",
        "@id": getArticleUrl(article.id),
        headline: article.title,
        description: article.description,
        image: article.image_url,
        datePublished: article.published_at,
        author: article.source
          ? {
              "@type": "Organization",
              name: article.source,
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          name: "Mukoko News",
        },
      },
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

/**
 * CollectionPage JSON-LD for the main feed page.
 * Uses safeJsonLdStringify to escape <, >, & and prevent XSS attacks.
 * @see https://schema.org/CollectionPage
 */
export function CollectionPageJsonLd({
  name,
  description,
  url,
  articles,
}: {
  name: string;
  description: string;
  url: string;
  articles?: Article[];
}) {
  const schema: CollectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Mukoko News",
      url: BASE_URL,
    },
    mainEntity: articles && articles.length > 0
      ? {
          "@type": "ItemList",
          numberOfItems: articles.length,
          itemListElement: articles.slice(0, 10).map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: getArticleUrl(article.id),
          })),
        }
      : undefined,
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

/**
 * WebPage JSON-LD for generic pages.
 * Uses safeJsonLdStringify to escape <, >, & and prevent XSS attacks.
 * @see https://schema.org/WebPage
 */
export function WebPageJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Mukoko News",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Mukoko News",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.png`,
      },
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
