/**
 * Mukoko News Service Worker
 * Smart caching strategy for news app experience like NYT/Instagram/TikTok
 *
 * Strategy:
 * - HTML: Network-only (NEVER cache to avoid blank pages)
 * - API/Feeds: Stale-while-revalidate (instant load + fresh content)
 * - Static Assets: Cache-first (JS, CSS, fonts are fingerprinted)
 * - Images: Cache-first with network fallback
 */

const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  STATIC: `mukoko-static-${CACHE_VERSION}`,
  API: `mukoko-api-${CACHE_VERSION}`,
  IMAGES: `mukoko-images-${CACHE_VERSION}`,
};

// Cache expiration times
const CACHE_TTL = {
  API_FEEDS: 5 * 60 * 1000,      // 5 minutes for article feeds
  API_CATEGORIES: 60 * 60 * 1000, // 1 hour for categories
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 days for images
};

// Static assets to precache (only fingerprinted/immutable files)
// DO NOT add index.html or / here - that causes blank page issues
const PRECACHE_ASSETS = [
  '/favicon.ico',
];

// ============================================
// INSTALL: Precache static assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v' + CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install complete, activating immediately');
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATE: Clean up old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v' + CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete caches from old versions
              return name.startsWith('mukoko-') &&
                     !Object.values(CACHE_NAMES).includes(name);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Taking control of all clients');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH: Smart caching strategies
// ============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except for API and images
  if (url.origin !== self.location.origin) {
    // Allow API requests to backend
    if (url.hostname === 'mukoko-news-backend.nyuchi.workers.dev') {
      event.respondWith(handleApiRequest(request));
      return;
    }
    // Allow image CDN requests
    if (isImageRequest(request)) {
      event.respondWith(handleImageRequest(request));
      return;
    }
    return;
  }

  // HTML requests - ALWAYS network, NEVER cache
  if (request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.pathname === '/index.html' ||
      url.pathname.endsWith('.html')) {
    event.respondWith(handleHtmlRequest(request));
    return;
  }

  // API requests - stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Static assets (JS, CSS, fonts) - cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Images - cache-first with network fallback
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(handleDefaultRequest(request));
});

// ============================================
// Request Handlers
// ============================================

/**
 * HTML: Network-only (CRITICAL - prevents blank page issues)
 */
async function handleHtmlRequest(request) {
  console.log('[SW] HTML request (network-only):', request.url);
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.error('[SW] HTML fetch failed:', error);
    // Return a basic offline page if network fails
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mukoko News - Offline</title>' +
      '<style>body{font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:50px 20px;background:#f9f8f4;color:#1f1f1f;}' +
      '.flag{display:flex;height:4px;margin-bottom:30px;}.flag div{flex:1;}.g{background:#00A651;}.y{background:#FDD116;}.r{background:#EF3340;}' +
      'h1{color:#5e5772;margin-bottom:10px;}p{color:#666;margin-bottom:20px;}' +
      'button{background:#5e5772;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;}' +
      'button:hover{background:#4d475f;}</style></head>' +
      '<body><div class="flag"><div class="g"></div><div class="y"></div><div class="r"></div></div>' +
      '<h1>You are offline</h1><p>Please check your internet connection and try again.</p>' +
      '<button onclick="location.reload()">Retry</button></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * API: Stale-while-revalidate (instant load + fresh content)
 * Perfect for news feeds - show cached immediately, update in background
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  console.log('[SW] API request (stale-while-revalidate):', url.pathname);

  const cache = await caches.open(CACHE_NAMES.API);
  const cachedResponse = await cache.match(request);

  // Start network fetch immediately (for background update)
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        // Clone and cache the fresh response
        const responseToCache = networkResponse.clone();
        await cache.put(request, responseToCache);
        console.log('[SW] API cached:', url.pathname);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] API network failed:', error);
      return null;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    console.log('[SW] API serving from cache:', url.pathname);
    // Background update happens via networkPromise
    return cachedResponse;
  }

  // No cache, wait for network
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Both cache and network failed
  return new Response(
    JSON.stringify({ error: 'Offline', message: 'Unable to fetch data' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Static Assets: Cache-first (JS bundles are fingerprinted/immutable)
 */
async function handleStaticAsset(request) {
  console.log('[SW] Static asset (cache-first):', request.url);

  const cache = await caches.open(CACHE_NAMES.STATIC);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Not in cache, fetch and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Images: Cache-first with 7-day expiration
 */
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAMES.IMAGES);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder for failed images
    return new Response('', { status: 404 });
  }
}

/**
 * Default: Network with cache fallback
 */
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAMES.STATIC);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Not available offline', { status: 503 });
  }
}

// ============================================
// Helper Functions
// ============================================

function isStaticAsset(pathname) {
  return pathname.startsWith('/_expo/static/') ||
         pathname.startsWith('/assets/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.ttf');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  return pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.gif') ||
         pathname.endsWith('.webp') ||
         pathname.endsWith('.svg') ||
         request.destination === 'image';
}

// ============================================
// Background Sync (for offline actions)
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // TODO: Implement offline action queue sync
  // This would handle likes, bookmarks, etc. made while offline
  console.log('[SW] Syncing offline actions...');
}

// ============================================
// Message Handler (for app communication)
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      })
    );
  }

  if (event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    totalSize += keys.length;
  }

  return totalSize;
}

console.log('[SW] Service worker loaded - v' + CACHE_VERSION);
