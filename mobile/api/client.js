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
// - mukoko-news-backend.nyuchi.workers.dev → Mukoko News backend (Cloudflare Workers)
// - api.mukoko.com → Future unified API gateway (separate worker)
const BASE_URL = __DEV__
  ? 'https://mukoko-news-backend.nyuchi.workers.dev'  // Deployed Cloudflare Workers for testing
  // ? 'http://localhost:3000'  // Local dev server (uncomment for local testing)
  : 'https://mukoko-news-backend.nyuchi.workers.dev';  // Production backend

// All APIs are on the same domain
const API_BASE_URL = BASE_URL;
const ADMIN_API_URL = BASE_URL; // Admin at /admin

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token if available
  const token = await getAuthToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(token && { Cookie: `auth_token=${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for cross-origin requests
  };

  try {
    const response = await fetch(url, config);

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
 * Authentication API
 */
export const auth = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token on successful login
    if (result.data && result.data.session && result.data.session.access_token) {
      await saveAuthToken(result.data.session.access_token);
    }

    return result;
  },

  /**
   * Register new user
   */
  async signUp(email, password, displayName) {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });

    // Automatically log in after registration
    if (result.data && !result.error) {
      return await auth.signIn(email, password);
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
   * Request password reset code
   */
  async forgotPassword(email) {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with code
   */
  async resetPassword(email, code, newPassword) {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  /**
   * Check username availability
   */
  async checkUsername(username) {
    return apiRequest(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
  },
};

/**
 * Articles/News Feed API
 */
export const articles = {
  /**
   * Get article feed
   * @param {Object} options
   * @param {number} options.limit - Number of articles to fetch
   * @param {number} options.offset - Offset for pagination
   * @param {string|null} options.category - Category filter
   * @param {string} options.sort - Sort order: 'latest', 'trending', 'popular'
   */
  async getFeed({ limit = 20, offset = 0, category = null, sort = 'latest' } = {}) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort: sort,
    });

    if (category) {
      params.append('category', category);
    }

    return apiRequest(`/api/feeds?${params.toString()}`);
  },

  /**
   * Get personalized feed (For You)
   * Uses user preferences, reading history, and follows to curate articles
   * Falls back to trending for anonymous users
   * @param {Object} options
   * @param {number} options.limit - Number of articles to fetch
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.excludeRead - Exclude already read articles
   * @param {number} options.diversity - Diversity factor 0-1 (higher = more diverse categories)
   */
  async getPersonalizedFeed({ limit = 30, offset = 0, excludeRead = true, diversity = 0.3 } = {}) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      excludeRead: excludeRead.toString(),
      diversity: diversity.toString(),
    });

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
   * Get platform statistics
   */
  async getStats() {
    return apiRequest('/api/admin/stats');
  },

  /**
   * Get category insights with trends
   */
  async getCategoryInsights(days = 7) {
    return apiRequest(`/api/admin/category-insights?days=${days}`);
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
  user,
  comments,
  newsBytes,
  pulse,
  health,
  insights,
  search,
  admin,
};
