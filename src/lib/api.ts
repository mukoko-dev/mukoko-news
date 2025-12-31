const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mukoko-news-backend.nyuchi.workers.dev';

interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source: string;
  source_id?: string;
  slug: string;
  category?: string;
  category_id?: string;  // API returns category_id
  country?: string;
  country_id?: string;   // API returns country_id
  image_url?: string;
  published_at: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface ArticlesResponse {
  articles: Article[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  article_count?: number;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Add API secret if available (for protected endpoints)
  // Server-side uses API_SECRET, client-side would use NEXT_PUBLIC_API_SECRET
  const apiSecret = process.env.API_SECRET || process.env.NEXT_PUBLIC_API_SECRET;
  if (apiSecret) {
    headers['Authorization'] = `Bearer ${apiSecret}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      // Re-throw with more context
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
}

export const api = {
  // Articles (uses /api/feeds endpoint)
  getArticles: (params?: { limit?: number; page?: number; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.category) searchParams.set('category', params.category);

    const query = searchParams.toString();
    return fetchAPI<ArticlesResponse>(`/api/feeds${query ? `?${query}` : ''}`);
  },

  getArticle: (id: string) => {
    return fetchAPI<{ article: Article }>(`/api/article/${id}`);
  },

  getNewsFeed: (params?: { limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return fetchAPI<ArticlesResponse>(`/api/feeds${query ? `?${query}` : ''}`);
  },

  // Categories
  getCategories: () => {
    return fetchAPI<{ categories: Category[] }>('/api/categories');
  },

  // NewsBytes (TikTok-style feed)
  getNewsBytes: (params?: { limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return fetchAPI<{ articles: Article[] }>(`/api/news-bytes${query ? `?${query}` : ''}`);
  },

  // Search
  search: (query: string, params?: { limit?: number }) => {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return fetchAPI<ArticlesResponse>(`/api/search?${searchParams.toString()}`);
  },

  // Health check
  health: () => {
    return fetchAPI<{ status: string }>('/api/health');
  },

  // Insights - uses backend stats and trending endpoints
  getStats: () => {
    return fetchAPI<{
      database: {
        total_articles: number;
        active_sources: number;
        categories: number;
        today_articles?: number;
      };
      timestamp?: string;
    }>('/api/stats');
  },

  getTrendingCategories: (limit = 8) => {
    return fetchAPI<{
      success: boolean;
      trending: Array<{
        id: string;
        name: string;
        slug: string;
        article_count: number;
        growth_rate?: number;
      }>;
      timestamp?: string;
    }>(`/api/trending-categories?limit=${limit}`);
  },

  getTrendingAuthors: (limit = 5) => {
    return fetchAPI<{
      trending_authors: Array<{
        id: string;
        name: string;
        article_count: number;
      }>;
      timeframe?: string;
    }>(`/api/trending-authors?limit=${limit}`);
  },

  // Additional backend endpoints
  getCountries: () => {
    return fetchAPI<{
      countries: Array<{
        id: string;
        code: string;
        name: string;
        flag_emoji?: string;
      }>;
    }>('/api/countries');
  },

  getSources: () => {
    return fetchAPI<{
      sources: Array<{
        id: string;
        name: string;
        country_code?: string;
        article_count?: number;
      }>;
    }>('/api/sources');
  },

  getRelatedArticles: (articleId: string, limit = 5) => {
    return fetchAPI<{
      related: Article[];
    }>(`/api/article/${articleId}/related?limit=${limit}`);
  },

  getTrendingStories: (limit = 10) => {
    return fetchAPI<{
      stories: Array<{
        id: string;
        title: string;
        article_count: number;
        latest_article?: Article;
      }>;
    }>(`/api/stories/trending?limit=${limit}`);
  },

  getFeaturedAuthors: (limit = 5) => {
    return fetchAPI<{
      authors: Array<{
        id: string;
        name: string;
        bio?: string;
        article_count: number;
      }>;
    }>(`/api/featured-authors?limit=${limit}`);
  },

  searchAuthors: (query: string, limit = 20) => {
    return fetchAPI<{
      authors: Array<{
        id: string;
        name: string;
        article_count: number;
      }>;
    }>(`/api/search/authors?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Keywords for tag cloud
  getKeywords: (limit = 32) => {
    return fetchAPI<{
      keywords: Array<{
        id: string;
        name: string;
        slug: string;
        type: string;
        article_count: number;
      }>;
      total: number;
    }>(`/api/keywords?limit=${limit}`);
  },
};

export type { Article, ArticlesResponse, Category };
