/**
 * API Client for Mukoko News Mobile
 * Connects to Cloudflare Worker backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@mukoko_auth_token';

/**
 * Get auth token from storage
 */
async function getAuthToken() {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[API] Get token error:', error);
    return null;
  }
}

// Backend URLs - Mukoko News Architecture:
// - news.mukoko.com → Expo Web frontend (Vercel)
// - mukoko-news-backend.nyuchi.workers.dev → API (Cloudflare Workers)
// API URL can be overridden via EXPO_PUBLIC_API_URL environment variable
const DEFAULT_API_URL = 'https://mukoko-news-backend.nyuchi.workers.dev';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const BASE_URL = __DEV__
  ? API_URL  // Use configured API URL in development
  // ? 'http://localhost:3000'  // Local dev server (uncomment for local testing)
  : API_URL;  // Production uses configured API URL

// All APIs are on the same domain
const API_BASE_URL = BASE_URL;
const ADMIN_API_URL = BASE_URL; // Admin at /admin

// API Secret for backend authentication (set via environment variable)
const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET;

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token if available
  const token = await getAuthToken();

  // Set up timeout controller (10 seconds for API calls)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  // Determine which Authorization header to use
  // Priority: User OIDC token > API Secret (for unauthenticated requests)
  const authHeader = token
    ? `Bearer ${token}`  // User authenticated - use their token
    : API_SECRET
      ? `Bearer ${API_SECRET}`  // No user token - use API secret for backend auth
      : undefined;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
      ...(token && { Cookie: `auth_token=${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for cross-origin requests
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data.error
        ? data.error
        : `API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return { data, error: null };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout error
    if (error.name === 'AbortError') {
      console.error(`[API] ${endpoint}: Request timeout (10s)`);
      return { data: null, error: 'Request timeout - please try again' };
    }

    console.error(`[API] ${endpoint}:`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Save auth token to storage
 */
async function saveAuthToken(token) {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('[API] Save token error:', error);
  }
}

/**
 * Remove auth token from storage
 */
async function removeAuthToken() {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[API] Remove token error:', error);
  }
}

/**
 * Authentication API - OIDC-based
 * Authentication is handled by id.mukoko.com (OIDC provider)
 */
export const auth = {
  /**
   * Exchange OIDC authorization code for tokens
   * Called after OIDC redirect callback
   */
  async exchangeOIDCCode(code, redirectUri) {
    const result = await apiRequest('/api/auth/oidc/callback', {
      method: 'POST',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });

    // Store token on successful exchange
    if (result.data && result.data.access_token) {
      await saveAuthToken(result.data.access_token);
    }

    return result;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const result = await apiRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored token
    if (result.data && result.data.access_token) {
      await saveAuthToken(result.data.access_token);
    }

    return result;
  },

  /**
   * Sign out
   */
  async signOut() {
    const result = await apiRequest('/api/auth/logout', {
      method: 'POST',
    });

    // Remove token from storage
    await removeAuthToken();

    return result;
  },

  /**
   * Get current session
   */
  async getSession() {
    return apiRequest('/api/auth/session');
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated() {
    const token = await getAuthToken();
    if (!token) return false;

    const result = await auth.getSession();
    return result.data && result.data.user !== null;
  },

  /**
   * Check username availability
   */
  async checkUsername(username) {
    return apiRequest(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
  },

  /**
   * Get OIDC configuration info
   */
  getOIDCConfig() {
    return {
      issuer: 'https://id.mukoko.com',
      clientId: 'mukoko-news-mobile',
    };
  },
};

/**
 * Articles/News Feed API
 */
export const articles = {
  /**
   * Trigger backend RSS collection (TikTok-style feed refresh)
   * Rate limited to once every 5 minutes
   * Returns number of new articles collected
   */
  async collectFeed() {
    return apiRequest('/api/feed/collect', {
      method: 'POST',
    });
  },

  /**
   * Get article feed
   * @param {Object} options
   * @param {number} options.limit - Number of articles to fetch
   * @param {number} options.offset - Offset for pagination
   * @param {string|null} options.category - Category filter
   * @param {string} options.sort - Sort order: 'latest', 'trending', 'popular'
   * @param {string[]|null} options.countries - Pan-African: filter by country codes (e.g., ['ZW', 'SA'])
   */
  async getFeed({ limit = 20, offset = 0, category = null, sort = 'latest', countries = null } = {}) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort: sort,
    });

    if (category) {
      params.append('category', category);
    }

    // Pan-African: add country filter
    if (countries && countries.length > 0) {
      params.append('countries', countries.join(','));
    }

    return apiRequest(`/api/feeds?${params.toString()}`);
  },

  /**
   * Get personalized feed (For You)
   * Uses user preferences, reading history, follows, and country preferences to curate articles
   * Falls back to trending for anonymous users
   * @param {Object} options
   * @param {number} options.limit - Number of articles to fetch
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.excludeRead - Exclude already read articles
   * @param {number} options.diversity - Diversity factor 0-1 (higher = more diverse categories)
   * @param {string[]|null} options.countries - Pan-African: override country filter (uses user preferences if null)
   */
  async getPersonalizedFeed({ limit = 30, offset = 0, excludeRead = true, diversity = 0.3, countries = null } = {}) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      excludeRead: excludeRead.toString(),
      diversity: diversity.toString(),
    });

    // Pan-African: add country filter override
    if (countries && countries.length > 0) {
      params.append('countries', countries.join(','));
    }

    return apiRequest(`/api/feeds/personalized?${params.toString()}`);
  },

  /**
   * Get explanation for why articles are recommended
   */
  async getFeedExplanation() {
    return apiRequest('/api/feeds/personalized/explain');
  },

  /**
   * Get single article by source and slug
   */
  async getBySourceSlug(source, slug) {
    const params = new URLSearchParams({ source, slug });
    return apiRequest(`/api/article/by-source-slug?${params.toString()}`);
  },

  /**
   * Get single article by ID
   */
  async getById(articleId) {
    return apiRequest(`/api/article/${articleId}`);
  },

  /**
   * Like/unlike article
   */
  async toggleLike(articleId) {
    return apiRequest(`/api/articles/${articleId}/like`, {
      method: 'POST',
    });
  },

  /**
   * Bookmark/unbookmark article
   */
  async toggleBookmark(articleId) {
    return apiRequest(`/api/articles/${articleId}/save`, {
      method: 'POST',
    });
  },

  /**
   * Track article view
   */
  async trackView(articleId) {
    return apiRequest(`/api/articles/${articleId}/view`, {
      method: 'POST',
    });
  },
};

/**
 * Categories API
 */
export const categories = {
  /**
   * Get all categories
   */
  async getAll() {
    return apiRequest('/api/categories');
  },
};

/**
 * Countries API (Pan-African Support)
 */
export const countries = {
  /**
   * Get all available countries
   * @param {Object} options
   * @param {boolean} options.withStats - Include article/source counts per country
   */
  async getAll({ withStats = false } = {}) {
    const params = new URLSearchParams();
    if (withStats) {
      params.append('withStats', 'true');
    }
    return apiRequest(`/api/countries?${params.toString()}`);
  },

  /**
   * Get country details with sources and category breakdown
   * @param {string} countryId - ISO 3166-1 alpha-2 code (e.g., 'ZW', 'SA')
   */
  async getDetails(countryId) {
    return apiRequest(`/api/countries/${countryId}`);
  },

  /**
   * Get article counts grouped by country
   * @param {Object} options
   * @param {string} options.since - Filter articles published since this date
   */
  async getArticleStats({ since = null } = {}) {
    const params = new URLSearchParams();
    if (since) {
      params.append('since', since);
    }
    return apiRequest(`/api/countries/stats/articles?${params.toString()}`);
  },

  /**
   * Get user's country preferences
   */
  async getUserPreferences() {
    return apiRequest('/api/user/me/countries');
  },

  /**
   * Set user's country preferences (replaces all existing)
   * @param {Array<{countryId: string, isPrimary?: boolean, notifyBreaking?: boolean}>} countriesList
   */
  async setUserPreferences(countriesList) {
    return apiRequest('/api/user/me/countries', {
      method: 'PUT',
      body: JSON.stringify({ countries: countriesList }),
    });
  },

  /**
   * Add a country to user's preferences
   * @param {string} countryId - ISO 3166-1 alpha-2 code
   * @param {Object} options
   * @param {boolean} options.isPrimary - Set as primary/home country
   * @param {boolean} options.notifyBreaking - Receive breaking news notifications
   */
  async addToPreferences(countryId, { isPrimary = false, notifyBreaking = true } = {}) {
    return apiRequest('/api/user/me/countries', {
      method: 'POST',
      body: JSON.stringify({ countryId, isPrimary, notifyBreaking }),
    });
  },

  /**
   * Remove a country from user's preferences
   * @param {string} countryId - ISO 3166-1 alpha-2 code
   */
  async removeFromPreferences(countryId) {
    return apiRequest(`/api/user/me/countries/${countryId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Set user's primary/home country
   * @param {string} countryId - ISO 3166-1 alpha-2 code
   */
  async setPrimary(countryId) {
    return apiRequest(`/api/user/me/countries/${countryId}/primary`, {
      method: 'PUT',
    });
  },
};

/**
 * User API
 */
export const user = {
  /**
   * Get current user's profile
   */
  async getProfile() {
    return apiRequest('/api/user/me/profile');
  },

  /**
   * Update current user's profile
   */
  async updateProfile(profileData) {
    return apiRequest('/api/user/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Update username
   */
  async updateUsername(username) {
    return apiRequest('/api/user/me/username', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  },

  /**
   * Get public user profile by username
   */
  async getPublicProfile(username) {
    return apiRequest(`/api/user/${encodeURIComponent(username)}`);
  },

  /**
   * Get public user stats by username
   */
  async getPublicStats(username) {
    return apiRequest(`/api/user/${encodeURIComponent(username)}/stats`);
  },

  /**
   * Get user's bookmarks/likes/history
   */
  async getActivity(username, type, limit = 20) {
    return apiRequest(`/api/user/${encodeURIComponent(username)}/${type}?limit=${limit}`);
  },

  /**
   * Add category interest during onboarding
   */
  async addCategoryInterest(categoryId, initialScore = 10) {
    return apiRequest('/api/user/me/category-interest', {
      method: 'POST',
      body: JSON.stringify({ categoryId, initialScore }),
    });
  },

  /**
   * Get user preferences
   */
  async getPreferences() {
    return apiRequest('/api/user/me/preferences');
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    return apiRequest('/api/user/me/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  },

  /**
   * Follow source/journalist
   */
  async follow(type, id) {
    return apiRequest('/api/user/me/follows', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
  },

  /**
   * Unfollow source/journalist
   */
  async unfollow(type, id) {
    return apiRequest(`/api/user/me/follows/${type}/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Comments API
 */
export const comments = {
  /**
   * Get comments for article
   */
  async getForArticle(articleId) {
    return apiRequest(`/api/articles/${articleId}/comments`);
  },

  /**
   * Add comment to article
   */
  async add(articleId, content) {
    return apiRequest(`/api/articles/${articleId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

/**
 * NewsBytes API (TikTok-style short news)
 */
export const newsBytes = {
  /**
   * Get NewsBytes feed
   */
  async getFeed({ limit = 10, offset = 0 } = {}) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return apiRequest(`/api/news-bytes?${params.toString()}`);
  },
};

/**
 * Pulse AI API (AI summaries)
 */
export const pulse = {
  /**
   * Generate Pulse summary for article
   */
  async generate(articleId) {
    return apiRequest(`/api/pulse/generate`, {
      method: 'POST',
      body: JSON.stringify({ articleId }),
    });
  },

  /**
   * Get batch summaries
   */
  async getBatch(articleIds) {
    return apiRequest(`/api/pulse/batch`, {
      method: 'POST',
      body: JSON.stringify({ articleIds }),
    });
  },
};

/**
 * Health check
 */
export const health = {
  async check() {
    return apiRequest('/api/health');
  },
};

/**
 * Insights & Analytics API
 * Community-focused analytics - open to everyone
 */
export const insights = {
  /**
   * Get trending categories
   */
  async getTrendingCategories(limit = 5) {
    return apiRequest(`/api/trending-categories?limit=${limit}`);
  },

  /**
   * Get trending authors
   */
  async getTrendingAuthors(limit = 5) {
    return apiRequest(`/api/trending-authors?limit=${limit}`);
  },

  /**
   * Get platform statistics (public aggregate data)
   */
  async getStats() {
    return apiRequest('/api/stats');
  },

  /**
   * Get category insights with trends
   */
  async getCategoryInsights(days = 7) {
    return apiRequest(`/api/admin/category-insights?days=${days}`);
  },

  /**
   * Get engagement analytics (views, likes, saves)
   */
  async getAnalytics() {
    return apiRequest('/api/admin/analytics');
  },

  /**
   * Get content quality metrics
   */
  async getContentQuality() {
    return apiRequest('/api/admin/content-quality');
  },

  /**
   * Get personalized category recommendations for user
   */
  async getPersonalizedCategories(userId) {
    return apiRequest(`/api/user/personalized-categories?userId=${userId}`);
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    return apiRequest(`/api/user/stats?userId=${userId}`);
  },
};

/**
 * Search API
 */
export const search = {
  /**
   * Search articles, keywords, categories, authors
   */
  async query(searchQuery, { limit = 20, offset = 0, category } = {}) {
    const params = new URLSearchParams({
      q: searchQuery,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (category) {
      params.append('category', category);
    }
    return apiRequest(`/api/search?${params.toString()}`);
  },

  /**
   * Search by keyword
   */
  async byKeyword(keyword, { limit = 20, offset = 0 } = {}) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiRequest(`/api/search/by-keyword/${encodeURIComponent(keyword)}?${params.toString()}`);
  },

  /**
   * Search by author
   */
  async byAuthor(author, { limit = 20, offset = 0 } = {}) {
    const params = new URLSearchParams({
      author,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiRequest(`/api/search/by-author?${params.toString()}`);
  },

  /**
   * Search authors
   */
  async authors(query, limit = 10) {
    return apiRequest(`/api/search/authors?q=${encodeURIComponent(query)}&limit=${limit}`);
  },
};

/**
 * Admin API - Protected routes requiring admin role
 */
export const admin = {
  /**
   * Get admin dashboard stats
   */
  async getStats() {
    return apiRequest('/api/admin/stats');
  },

  /**
   * Get all users (paginated)
   */
  async getUsers({ search, role, status, limit = 20, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return apiRequest(`/api/admin/users?${params.toString()}`);
  },

  /**
   * Get user statistics
   */
  async getUserStats() {
    return apiRequest('/api/admin/user-stats');
  },

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    return apiRequest(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * Update user status
   */
  async updateUserStatus(userId, status) {
    return apiRequest(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return apiRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get news sources
   */
  async getSources() {
    return apiRequest('/api/admin/sources');
  },

  /**
   * Update RSS source
   */
  async updateSource(sourceId, data) {
    return apiRequest(`/api/admin/rss-source/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Add Zimbabwe news sources
   */
  async addZimbabweSources() {
    return apiRequest('/api/admin/add-zimbabwe-sources', {
      method: 'POST',
    });
  },

  /**
   * Refresh RSS feeds
   */
  async refreshRSS() {
    return apiRequest('/api/refresh-rss', {
      method: 'POST',
    });
  },

  /**
   * Bulk pull articles
   */
  async bulkPull() {
    return apiRequest('/api/admin/bulk-pull', {
      method: 'POST',
    });
  },

  /**
   * Get analytics
   */
  async getAnalytics() {
    return apiRequest('/api/admin/analytics');
  },

  /**
   * Get content quality metrics
   */
  async getContentQuality() {
    return apiRequest('/api/admin/content-quality');
  },

  /**
   * Get category insights
   */
  async getCategoryInsights(days = 7) {
    return apiRequest(`/api/admin/category-insights?days=${days}`);
  },

  /**
   * Get system health
   */
  async getSystemHealth() {
    return apiRequest('/api/admin/observability/health');
  },

  /**
   * Get cron logs
   */
  async getCronLogs() {
    return apiRequest('/api/admin/cron-logs');
  },

  /**
   * Get AI pipeline status
   */
  async getAIPipelineStatus() {
    return apiRequest('/api/admin/ai-pipeline-status');
  },
};

export default {
  auth,
  articles,
  categories,
  countries,  // Pan-African support
  user,
  comments,
  newsBytes,
  pulse,
  health,
  insights,
  search,
  admin,
};
