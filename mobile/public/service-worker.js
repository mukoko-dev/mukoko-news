/**
 * Service Worker for Mukoko News Mobile App
 * Provides offline-first experience with intelligent caching strategies
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `mukoko-static-${CACHE_VERSION}`,
  DYNAMIC: `mukoko-dynamic-${CACHE_VERSION}`,
  IMAGES: `mukoko-images-${CACHE_VERSION}`,
  API: `mukoko-api-${CACHE_VERSION}`,
};

// Static assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// API endpoints with different caching strategies
const API_CACHE_CONFIG = {
  // Articles - cache for 5 minutes, serve stale while revalidating
  articles: {
    pattern: /\/api\/(feeds|articles)/,
    maxAge: 5 * 60 * 1000,
    strategy: 'stale-while-revalidate',
  },
  // Categories - cache for 24 hours
  categories: {
    pattern: /\/api\/categories/,
    maxAge: 24 * 60 * 60 * 1000,
    strategy: 'cache-first',
  },
  // User data - always network first
  user: {
    pattern: /\/api\/(user|auth)/,
    maxAge: 0,
    strategy: 'network-first',
  },
  // Search - cache results for 10 minutes
  search: {
    pattern: /\/api\/search/,
    maxAge: 10 * 60 * 1000,
    strategy: 'network-first',
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old version caches
              return Object.values(CACHE_NAMES).indexOf(name) === -1;
            })
            .map((name) => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle image requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle static assets and navigation
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with appropriate caching strategy
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);

  // Find matching API config
  let config = null;
  for (const [key, cfg] of Object.entries(API_CACHE_CONFIG)) {
    if (cfg.pattern.test(url.pathname)) {
      config = cfg;
      break;
    }
  }

  // Default to network-first for unknown API endpoints
  if (!config) {
    return networkFirst(request, CACHE_NAMES.API);
  }

  switch (config.strategy) {
    case 'cache-first':
      return cacheFirst(request, CACHE_NAMES.API, config.maxAge);
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, CACHE_NAMES.API, config.maxAge);
    case 'network-first':
    default:
      return networkFirst(request, CACHE_NAMES.API, config.maxAge);
  }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  return cacheFirst(request, CACHE_NAMES.IMAGES, 7 * 24 * 60 * 60 * 1000); // 7 days
}

/**
 * Handle static assets and navigation requests
 */
async function handleStaticRequest(request) {
  // For navigation requests, try network first, fall back to cached index.html
  if (request.mode === 'navigate') {
    try {
      const response = await fetch(request);
      // Cache successful responses
      if (response.ok) {
        const cache = await caches.open(CACHE_NAMES.STATIC);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Offline - serve cached index.html for SPA
      const cache = await caches.open(CACHE_NAMES.STATIC);
      const cachedResponse = await cache.match('/index.html');
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }

  // For other static assets, use stale-while-revalidate
  return staleWhileRevalidate(request, CACHE_NAMES.STATIC, 24 * 60 * 60 * 1000);
}

/**
 * Cache-first strategy - serve from cache, fall back to network
 */
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cachedTime = cachedResponse.headers.get('sw-cache-time');
    if (cachedTime && maxAge > 0) {
      const age = Date.now() - parseInt(cachedTime, 10);
      if (age < maxAge) {
        return cachedResponse;
      }
    } else {
      return cachedResponse;
    }
  }

  // Fetch from network and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    // Return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Network-first strategy - try network, fall back to cache
 */
async function networkFirst(request, cacheName, maxAge = 0) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy - serve cache immediately, update in background
 */
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Start network request in background
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cacheResponse(cache, request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log('[ServiceWorker] Network request failed:', error);
      return null;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    // Check cache age
    const cachedTime = cachedResponse.headers.get('sw-cache-time');
    if (cachedTime && maxAge > 0) {
      const age = Date.now() - parseInt(cachedTime, 10);
      if (age > maxAge) {
        // Cache is stale, wait for network
        const networkResponse = await networkPromise;
        if (networkResponse) {
          return networkResponse;
        }
      }
    }
    return cachedResponse;
  }

  // No cache, wait for network
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  throw new Error('No cached or network response available');
}

/**
 * Cache a response with timestamp header
 */
async function cacheResponse(cache, request, response) {
  // Clone the response and add cache timestamp
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', Date.now().toString());

  const cachedResponse = new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  await cache.put(request, cachedResponse);
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some((ext) => url.pathname.toLowerCase().endsWith(ext));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sync queued offline actions when back online
 */
async function syncOfflineActions() {
  try {
    // Get offline queue from IndexedDB (via postMessage to client)
    const clients = await self.clients.matchAll();

    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_OFFLINE_QUEUE',
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || 'New update from Mukoko News',
    icon: '/assets/images/logo-192.png',
    badge: '/assets/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      articleId: data.articleId,
    },
    actions: [
      { action: 'open', title: 'Read Now' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Mukoko News', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;

    case 'CACHE_ARTICLES':
      event.waitUntil(cacheArticles(payload.articles));
      break;

    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then((size) => {
        event.source.postMessage({ type: 'CACHE_SIZE', size });
      }));
      break;
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[ServiceWorker] All caches cleared');
}

/**
 * Pre-cache articles for offline reading
 */
async function cacheArticles(articles) {
  const cache = await caches.open(CACHE_NAMES.API);

  for (const article of articles) {
    const url = `/api/articles/${article.id}`;
    const response = new Response(JSON.stringify(article), {
      headers: {
        'Content-Type': 'application/json',
        'sw-cache-time': Date.now().toString(),
      },
    });
    await cache.put(url, response);
  }

  console.log(`[ServiceWorker] Cached ${articles.length} articles`);
}

/**
 * Get total cache size
 */
async function getCacheSize() {
  let totalSize = 0;

  for (const cacheName of Object.values(CACHE_NAMES)) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    } catch (error) {
      console.error(`[ServiceWorker] Error getting cache size for ${cacheName}:`, error);
    }
  }

  return totalSize;
}

console.log('[ServiceWorker] Script loaded');
