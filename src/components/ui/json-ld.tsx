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

// Note: dangerouslySetInnerHTML is safe here because JSON.stringify
// properly escapes all content and we control the schema structure
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
