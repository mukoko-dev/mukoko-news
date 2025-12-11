/**
 * Service Worker Manager for Mukoko News Mobile App
 * Handles service worker registration, updates, and communication
 */

import { Platform } from 'react-native';

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = this.checkSupport();
  }

  /**
   * Check if service workers are supported (web only)
   */
  checkSupport() {
    return Platform.OS === 'web' && 'serviceWorker' in navigator;
  }

  /**
   * Register the service worker
   */
  async register() {
    if (!this.isSupported) {
      console.log('[ServiceWorkerManager] Service workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('[ServiceWorkerManager] Registered:', this.registration.scope);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        console.log('[ServiceWorkerManager] Update found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            this.onUpdateAvailable(newWorker);
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      return this.registration;
    } catch (error) {
      console.error('[ServiceWorkerManager] Registration failed:', error);
      return null;
    }
  }

  /**
   * Handle update available
   */
  onUpdateAvailable(newWorker) {
    console.log('[ServiceWorkerManager] New version available');

    // Dispatch custom event for app to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sw-update-available', {
        detail: { worker: newWorker },
      }));
    }
  }

  /**
   * Handle messages from service worker
   */
  handleMessage(event) {
    const { type, ...data } = event.data;

    switch (type) {
      case 'SYNC_OFFLINE_QUEUE':
        this.syncOfflineQueue();
        break;

      case 'CACHE_SIZE':
        console.log('[ServiceWorkerManager] Cache size:', data.size);
        break;

      default:
        console.log('[ServiceWorkerManager] Unknown message:', type);
    }
  }

  /**
   * Sync offline queue when back online
   */
  async syncOfflineQueue() {
    try {
      // Import CacheService dynamically to avoid circular dependencies
      const { cacheService } = await import('./CacheService.js');

      const queue = await cacheService.getOfflineQueue();
      console.log(`[ServiceWorkerManager] Syncing ${queue.length} offline actions`);

      for (const action of queue) {
        try {
          await this.processOfflineAction(action);
          await cacheService.removeFromOfflineQueue(action.id);
        } catch (error) {
          console.error('[ServiceWorkerManager] Failed to sync action:', action.id, error);
        }
      }
    } catch (error) {
      console.error('[ServiceWorkerManager] Sync failed:', error);
    }
  }

  /**
   * Process a single offline action
   */
  async processOfflineAction(action) {
    const { type, data } = action;

    switch (type) {
      case 'LIKE_ARTICLE':
        await fetch(`/api/articles/${data.articleId}/like`, {
          method: 'POST',
          credentials: 'include',
        });
        break;

      case 'SAVE_ARTICLE':
        await fetch(`/api/articles/${data.articleId}/save`, {
          method: 'POST',
          credentials: 'include',
        });
        break;

      case 'TRACK_VIEW':
        await fetch(`/api/articles/${data.articleId}/view`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;

      case 'POST_COMMENT':
        await fetch(`/api/articles/${data.articleId}/comment`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.content }),
        });
        break;

      default:
        console.warn('[ServiceWorkerManager] Unknown action type:', type);
    }
  }

  /**
   * Force update to new service worker
   */
  async forceUpdate() {
    if (!this.isSupported || !this.registration) {
      return false;
    }

    const waiting = this.registration.waiting;
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }

    return false;
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    if (!this.isSupported) {
      return false;
    }

    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({ type: 'CLEAR_CACHE' });
      return true;
    }

    return false;
  }

  /**
   * Pre-cache articles for offline reading
   */
  async cacheArticles(articles) {
    if (!this.isSupported) {
      return false;
    }

    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({
        type: 'CACHE_ARTICLES',
        payload: { articles },
      });
      return true;
    }

    return false;
  }

  /**
   * Get cache size
   */
  async getCacheSize() {
    if (!this.isSupported) {
      return 0;
    }

    return new Promise((resolve) => {
      const controller = navigator.serviceWorker.controller;
      if (!controller) {
        resolve(0);
        return;
      }

      const messageHandler = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          navigator.serviceWorker.removeEventListener('message', messageHandler);
          resolve(event.data.size);
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      controller.postMessage({ type: 'GET_CACHE_SIZE' });

      // Timeout after 5 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve(0);
      }, 5000);
    });
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission() {
    if (!this.isSupported || !('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(vapidPublicKey) {
    if (!this.isSupported || !this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('[ServiceWorkerManager] Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('[ServiceWorkerManager] Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Check if app is running in standalone mode (PWA)
   */
  isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  /**
   * Check online status
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Add online/offline event listeners
   */
  addConnectivityListeners(onOnline, onOffline) {
    if (typeof window === 'undefined') {
      return () => {};
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
export default serviceWorkerManager;
