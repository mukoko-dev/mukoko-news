/**
 * IndexedDB Cache Service for Mukoko News Mobile App
 * Provides offline-first caching for articles, categories, and user data
 */

const DB_NAME = 'MukokoNewsCache';
const DB_VERSION = 1;

// Store names
const STORES = {
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
  USER_DATA: 'userData',
  SEARCH_HISTORY: 'searchHistory',
  OFFLINE_QUEUE: 'offlineQueue',
};

// Cache durations in milliseconds
const CACHE_DURATIONS = {
  ARTICLES: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
  USER_DATA: 60 * 60 * 1000, // 1 hour
};

class CacheService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[CacheService] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('[CacheService] Database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Articles store with indexes
        if (!db.objectStoreNames.contains(STORES.ARTICLES)) {
          const articlesStore = db.createObjectStore(STORES.ARTICLES, { keyPath: 'id' });
          articlesStore.createIndex('slug', 'slug', { unique: true });
          articlesStore.createIndex('category', 'category', { unique: false });
          articlesStore.createIndex('source', 'source', { unique: false });
          articlesStore.createIndex('published_at', 'published_at', { unique: false });
          articlesStore.createIndex('cached_at', 'cached_at', { unique: false });
        }

        // Categories store
        if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
          const categoriesStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
          categoriesStore.createIndex('name', 'name', { unique: true });
        }

        // User data store (preferences, bookmarks, etc.)
        if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
          db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
        }

        // Search history
        if (!db.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
          const searchStore = db.createObjectStore(STORES.SEARCH_HISTORY, { keyPath: 'id', autoIncrement: true });
          searchStore.createIndex('query', 'query', { unique: false });
          searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Offline queue for actions to sync
        if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('type', 'type', { unique: false });
          queueStore.createIndex('created_at', 'created_at', { unique: false });
        }

        console.log('[CacheService] Database schema created/upgraded');
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  async ensureInit() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // ==================== ARTICLES ====================

  /**
   * Cache articles
   */
  async cacheArticles(articles) {
    await this.ensureInit();
    const tx = this.db.transaction(STORES.ARTICLES, 'readwrite');
    const store = tx.objectStore(STORES.ARTICLES);
    const cachedAt = Date.now();

    for (const article of articles) {
      await store.put({ ...article, cached_at: cachedAt });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get cached articles
   */
  async getCachedArticles(options = {}) {
    await this.ensureInit();
    const { category, limit = 50, checkExpiry = true } = options;
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORES.ARTICLES, 'readonly');
      const store = tx.objectStore(STORES.ARTICLES);
      const articles = [];

      let request;
      if (category) {
        const index = store.index('category');
        request = index.openCursor(IDBKeyRange.only(category));
      } else {
        const index = store.index('published_at');
        request = index.openCursor(null, 'prev'); // Sort by published_at desc
      }

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && articles.length < limit) {
          const article = cursor.value;

          // Check if cache is still valid
          if (!checkExpiry || (now - article.cached_at) < CACHE_DURATIONS.ARTICLES) {
            articles.push(article);
          }
          cursor.continue();
        } else {
          resolve(articles);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get single article by slug
   */
  async getArticleBySlug(slug) {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORES.ARTICLES, 'readonly');
      const store = tx.objectStore(STORES.ARTICLES);
      const index = store.index('slug');
      const request = index.get(slug);

      request.onsuccess = () => {
        const article = request.result;
        if (article) {
          const now = Date.now();
          if ((now - article.cached_at) < CACHE_DURATIONS.ARTICLES) {
            resolve(article);
          } else {
            resolve(null); // Cache expired
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if articles cache is valid
   */
  async isArticlesCacheValid(category = null) {
    await this.ensureInit();
    const articles = await this.getCachedArticles({ category, limit: 1, checkExpiry: true });
    return articles.length > 0;
  }

  // ==================== CATEGORIES ====================

  /**
   * Cache categories
   */
  async cacheCategories(categories) {
    await this.ensureInit();
    const tx = this.db.transaction(STORES.CATEGORIES, 'readwrite');
    const store = tx.objectStore(STORES.CATEGORIES);
    const cachedAt = Date.now();

    for (const category of categories) {
      await store.put({ ...category, cached_at: cachedAt });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get cached categories
   */
  async getCachedCategories() {
    await this.ensureInit();
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORES.CATEGORIES, 'readonly');
      const store = tx.objectStore(STORES.CATEGORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        const categories = request.result.filter(
          cat => (now - cat.cached_at) < CACHE_DURATIONS.CATEGORIES
        );
        resolve(categories);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== USER DATA ====================

  /**
   * Save user data
   */
  async setUserData(key, value) {
    await this.ensureInit();
    const tx = this.db.transaction(STORES.USER_DATA, 'readwrite');
    const store = tx.objectStore(STORES.USER_DATA);

    await store.put({
      key,
      value,
      cached_at: Date.now(),
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get user data
   */
  async getUserData(key) {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORES.USER_DATA, 'readonly');
      const store = tx.objectStore(STORES.USER_DATA);
      const request = store.get(key);

      request.onsuccess = () => {
        const data = request.result;
        if (data && (Date.now() - data.cached_at) < CACHE_DURATIONS.USER_DATA) {
          resolve(data.value);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== SEARCH HISTORY ====================

  /**
   * Add search query to history
   */
  async addSearchHistory(query) {
    await this.ensureInit();
    const tx = this.db.transaction(STORES.SEARCH_HISTORY, 'readwrite');
    const store = tx.objectStore(STORES.SEARCH_HISTORY);

    await store.add({
      query,
      timestamp: Date.now(),
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get recent search history
   */
  async getSearchHistory(limit = 10) {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORES.SEARCH_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.SEARCH_HISTORY);
      const index = store.index('timestamp');
      const results = [];

      const request = index.openCursor(null, 'prev');

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== OFFLINE QUEUE ====================

  /**
   * Queue an action for offline sync
   */
  async queueOfflineAction(type, data) {
    await this.ensureInit();
    const tx = this.db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_QUEUE);

    await store.add({
      type,
      data,
      created_at: Date.now(),
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get pending offline actions
   */
  async getOfflineQueue() {
    await this.ensureInit();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORES.OFFLINE_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.OFFLINE_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove action from offline queue
   */
  async removeFromOfflineQueue(id) {
    await this.ensureInit();
    const tx = this.db.transaction(STORES.OFFLINE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_QUEUE);
    await store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // ==================== UTILITIES ====================

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    await this.ensureInit();
    const stores = Object.values(STORES);

    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readwrite');
      await tx.objectStore(storeName).clear();
    }

    console.log('[CacheService] All caches cleared');
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCaches() {
    await this.ensureInit();
    const now = Date.now();

    // Clear expired articles
    const articlesTx = this.db.transaction(STORES.ARTICLES, 'readwrite');
    const articlesStore = articlesTx.objectStore(STORES.ARTICLES);
    const articlesIndex = articlesStore.index('cached_at');
    const expiredArticlesTime = now - CACHE_DURATIONS.ARTICLES;

    const articlesCursor = articlesIndex.openCursor(IDBKeyRange.upperBound(expiredArticlesTime));
    articlesCursor.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    console.log('[CacheService] Expired caches cleared');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    await this.ensureInit();
    const stats = {};

    for (const [name, storeName] of Object.entries(STORES)) {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const countRequest = store.count();

      stats[name] = await new Promise((resolve) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => resolve(0);
      });
    }

    return stats;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
