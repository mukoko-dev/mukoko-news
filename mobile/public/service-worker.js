/**
 * Service Worker - Disabled
 * This service worker immediately unregisters itself to disable PWA functionality
 */

// Unregister this service worker and clear all caches
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
  // Unregister this service worker
  event.waitUntil(
    Promise.all([
      // Clear all caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[ServiceWorker] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Unregister
      self.registration.unregister().then(() => {
        console.log('[ServiceWorker] Unregistered');
      }),
    ])
  );
});

// Don't intercept any requests
self.addEventListener('fetch', () => {
  // Let all requests pass through to the network
});

console.log('[ServiceWorker] PWA disabled - this worker will unregister itself');
