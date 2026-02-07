import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getArticleUrl, BASE_URL } from "@/lib/constants";
import ArticleDetailClient from "./article-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const data = await api.getArticle(id);
    const article = data.article;

    if (!article) {
      return { title: "Article Not Found" };
    }

    const articleUrl = getArticleUrl(id);
    const description =
      article.description ||
      `Read "${article.title}" — latest news from ${article.source} on Mukoko News.`;

    return {
      title: article.title,
      description,
      authors: article.source ? [{ name: article.source }] : undefined,
      openGraph: {
        title: article.title,
        description,
        url: articleUrl,
        type: "article",
        publishedTime: article.published_at,
        section: article.category_id || article.category || undefined,
        siteName: "Mukoko News",
        images: article.image_url
          ? [
              {
                url: article.image_url,
                alt: article.title,
              },
            ]
          : [
              {
                url: `${BASE_URL}/mukoko-icon-dark.png`,
                width: 512,
                height: 512,
                alt: "Mukoko News",
              },
            ],
      },
      twitter: {
        card: article.image_url ? "summary_large_image" : "summary",
        title: article.title,
        description,
        images: article.image_url ? [article.image_url] : undefined,
        creator: "@mukokoafrica",
      },
      alternates: {
        canonical: articleUrl,
      },
      robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    };
  } catch {
    return {
      title: "Article",
      description: "Read the latest news on Mukoko News.",
    };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  return <ArticleDetailClient articleId={id} />;
}
