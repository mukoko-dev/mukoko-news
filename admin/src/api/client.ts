/**
 * Admin API Client for Mukoko News
 * Connects to Cloudflare Worker backend
 */

const BASE_URL = import.meta.env.DEV
  ? '' // Use Vite proxy in development
  : 'https://mukoko-news-backend.nyuchi.workers.dev';

const AUTH_TOKEN_KEY = 'mukoko_admin_token';
const USER_DATA_KEY = 'mukoko_admin_user';

/**
 * Get auth token from storage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Save auth token and user data
 */
export function saveAuthData(token: string, user: AdminUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Get stored user data
 */
export function getStoredUser(): AdminUser | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear auth data
 */
export function clearAuthData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Make API request with authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data.error
        ? data.error
        : `API error: ${response.status}`;
      return { data: null, error: errorMessage };
    }

    return { data: data as T, error: null };
  } catch (error) {
    console.error(`[Admin API] ${endpoint}:`, error);
    return { data: null, error: (error as Error).message };
  }
}

// Types
export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  role: 'admin' | 'super_admin' | 'moderator';
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AdminStats {
  database: {
    total_articles: number;
    active_sources: number;
    categories: number;
    size: number;
  };
  timestamp: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  author?: string;
  source: string;
  category: string;
  published_at: string;
  created_at: string;
  status: string;
  view_count: number;
  image_url?: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  role: string;
  status: string;
  created_at: string;
  last_login_at?: string;
  login_count: number;
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  category?: string;
  last_fetched?: string;
  article_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
  article_count?: number;
}

export interface Analytics {
  views: number;
  likes: number;
  shares: number;
  bookmarks: number;
  topArticles?: Article[];
  topCategories?: { category: string; count: number }[];
}

// Auth API
export const auth = {
  async login(email: string, password: string) {
    return apiRequest<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    const result = await apiRequest('/api/admin/logout', { method: 'POST' });
    clearAuthData();
    return result;
  },

  async getSession() {
    return apiRequest<{ user: AdminUser }>('/api/auth/session');
  },
};

// Admin Stats API
export const stats = {
  async getOverview() {
    return apiRequest<AdminStats>('/api/admin/stats');
  },

  async getAnalytics() {
    return apiRequest<Analytics>('/api/admin/analytics');
  },

  async getUserStats() {
    return apiRequest<{
      total_users: number;
      active_users: number;
      new_users_today: number;
      role_distribution: { role: string; count: number }[];
    }>('/api/admin/user-stats');
  },

  async getContentQuality() {
    return apiRequest('/api/admin/content-quality');
  },

  async getAIPipelineStatus() {
    return apiRequest('/api/admin/ai-pipeline-status');
  },

  async getCronLogs() {
    return apiRequest('/api/admin/cron-logs');
  },
};

// Articles API
export const articles = {
  async list(params: { limit?: number; offset?: number; category?: string; status?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.status) searchParams.append('status', params.status);
    return apiRequest<{ articles: Article[]; total: number }>(
      `/api/feeds?${searchParams.toString()}`
    );
  },

  async getById(id: number) {
    return apiRequest<Article>(`/api/article/${id}`);
  },

  async updateStatus(id: number, status: string) {
    return apiRequest(`/api/admin/articles/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: number) {
    return apiRequest(`/api/admin/articles/${id}`, { method: 'DELETE' });
  },

  async bulkPull() {
    return apiRequest('/api/admin/bulk-pull', { method: 'POST' });
  },

  async refreshRSS() {
    return apiRequest('/api/refresh-rss', { method: 'POST' });
  },
};

// Users API
export const users = {
  async list(params: { search?: string; role?: string; status?: string; limit?: number; offset?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.status) searchParams.append('status', params.status);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    return apiRequest<{ users: User[]; total: number }>(
      `/api/admin/users?${searchParams.toString()}`
    );
  },

  async updateRole(userId: string, role: string) {
    return apiRequest(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async updateStatus(userId: string, status: string) {
    return apiRequest(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(userId: string) {
    return apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
  },
};

// RSS Sources API
export const sources = {
  async list() {
    return apiRequest<{ sources: RSSSource[] }>('/api/admin/sources');
  },

  async getConfig() {
    return apiRequest('/api/admin/rss-config');
  },

  async update(sourceId: string, data: Partial<RSSSource>) {
    return apiRequest(`/api/admin/rss-source/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async addZimbabweSources() {
    return apiRequest('/api/admin/add-zimbabwe-sources', { method: 'POST' });
  },
};

// Categories API
export const categories = {
  async list() {
    return apiRequest<{ categories: Category[] }>('/api/categories');
  },

  async withAuthors() {
    return apiRequest('/api/admin/categories/with-authors');
  },

  async getInsights(days: number = 7) {
    return apiRequest(`/api/admin/category-insights?days=${days}`);
  },
};

// Authors API
export const authors = {
  async list() {
    return apiRequest('/api/admin/authors');
  },

  async detailed() {
    return apiRequest('/api/admin/authors/detailed');
  },
};

// Observability API
export const observability = {
  async health() {
    return apiRequest('/api/admin/observability/health');
  },

  async metrics() {
    return apiRequest('/api/admin/observability/metrics');
  },

  async alerts() {
    return apiRequest('/api/admin/observability/alerts');
  },
};

// SEO API
export const seo = {
  async getStats() {
    return apiRequest('/api/admin/seo/stats');
  },

  async batchUpdate(updates: { articleId: number; metaTitle?: string; metaDescription?: string }[]) {
    return apiRequest('/api/admin/seo/batch-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  },
};

export default {
  auth,
  stats,
  articles,
  users,
  sources,
  categories,
  authors,
  observability,
  seo,
};
