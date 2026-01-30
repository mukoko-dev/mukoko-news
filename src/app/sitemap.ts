import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';

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
];

// Static pages
const STATIC_PAGES = [
  '',           // home
  '/discover',
  '/newsbytes',
  '/search',
  '/categories',
  '/saved',
  '/profile',
  '/help',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticUrls, ...categoryUrls];
}
