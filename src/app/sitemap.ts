import { MetadataRoute } from 'next';
import { BASE_URL, COUNTRIES, getArticleUrl } from '@/lib/constants';
import { api } from '@/lib/api';

// Revalidate sitemap every hour to pick up new articles
export const revalidate = 3600;

// Categories from the app
const CATEGORIES = [
  'politics',
  'economy',
  'technology',
  'sports',
  'health',
  'education',
  'entertainment',
  'international',
  'general',
  'harare',
  'agriculture',
  'crime',
  'environment',
] as const;

// Static pages
const STATIC_PAGES = [
  '',           // home
  '/discover',
  '/newsbytes',
  '/search',
  '/categories',
  '/insights',
  '/help',
  '/privacy',
  '/terms',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'hourly' : 'daily',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Category pages via discover
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/discover?category=${category}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  // Country pages via discover
  const countryUrls: MetadataRoute.Sitemap = COUNTRIES.map((country) => ({
    url: `${BASE_URL}/discover?country=${country.code}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  // Fetch recent articles for the sitemap
  let articleUrls: MetadataRoute.Sitemap = [];
  try {
    const data = await api.getArticles({ limit: 200, sort: 'latest' });
    articleUrls = (data.articles || []).map((article) => ({
      url: getArticleUrl(article.id),
      lastModified: article.published_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Silently fail - sitemap still works with static URLs
  }

  return [...staticUrls, ...categoryUrls, ...countryUrls, ...articleUrls];
}
