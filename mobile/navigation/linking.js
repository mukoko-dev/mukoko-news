/**
 * Deep Linking Configuration for Mukoko News
 * Maps screen names to URL paths for web navigation
 *
 * This enables:
 * - Browser URL updates when navigating
 * - Direct linking to screens (e.g., /article/source/slug)
 * - Browser back/forward button support
 * - Shareable URLs for articles
 */

import { Platform } from 'react-native';

/**
 * URL path prefixes for the app
 * On web, we use the current domain
 * On mobile, we could use a custom scheme like 'mukoko://'
 */
const prefixes = Platform.select({
  web: [
    // Production domain
    'https://mukoko.news',
    'https://www.mukoko.news',
    // Development
    'http://localhost:8081',
    'http://localhost:19006',
    // Vercel preview
    'https://mukoko-news.vercel.app',
  ],
  default: [
    'mukoko://',
    'https://mukoko.news',
  ],
});

/**
 * Screen configuration mapping URLs to screens
 *
 * URL Structure:
 * /                        -> Home tab
 * /discover                -> Discover tab (browse trending content)
 * /discover/insights       -> AI-powered Insights screen
 * /bytes                   -> NewsBytes tab
 * /search                  -> Search tab
 * /search?q=query          -> Search with query
 * /profile                 -> Profile tab
 * /profile/login           -> Login screen
 * /profile/register        -> Register screen
 * /article/:source/:slug   -> Article detail
 * /admin                   -> Admin dashboard (protected)
 */
const config = {
  screens: {
    // Main tabs
    Home: {
      path: '',
      screens: {
        HomeFeed: '',
        ArticleDetail: {
          path: 'article/:source/:slug',
          parse: {
            source: (source) => decodeURIComponent(source),
            slug: (slug) => decodeURIComponent(slug),
          },
          stringify: {
            source: (source) => encodeURIComponent(source),
            slug: (slug) => encodeURIComponent(slug),
          },
        },
      },
    },
    Discover: {
      path: 'discover',
      screens: {
        DiscoverFeed: '',
        InsightsFeed: 'insights',
        ArticleDetail: {
          path: 'article/:source/:slug',
          parse: {
            source: (source) => decodeURIComponent(source),
            slug: (slug) => decodeURIComponent(slug),
          },
        },
        SearchFeed: 'search',
      },
    },
    Bytes: {
      path: 'bytes',
      screens: {
        BytesFeed: '',
      },
    },
    Search: {
      path: 'search',
      screens: {
        SearchFeed: {
          path: '',
          parse: {
            q: (q) => decodeURIComponent(q || ''),
            category: (category) => decodeURIComponent(category || ''),
          },
        },
        ArticleDetail: {
          path: 'article/:source/:slug',
        },
      },
    },
    Profile: {
      path: 'profile',
      screens: {
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        Onboarding: 'onboarding',
        ProfileSettings: 'settings',
        UserProfile: '',
      },
    },
    Admin: {
      path: 'admin',
      screens: {
        AdminDashboard: '',
        AdminUsers: 'users',
        AdminSources: 'sources',
        AdminAnalytics: 'analytics',
        AdminSystem: 'system',
      },
    },
  },
};

/**
 * Linking configuration object for NavigationContainer
 */
const linking = {
  prefixes,
  config,

  // Custom function to get initial URL
  async getInitialURL() {
    // On web, use the current URL
    if (Platform.OS === 'web') {
      return window.location.href;
    }
    // On mobile, could handle deep links here
    return null;
  },

  // Subscribe to URL changes (for web)
  subscribe(listener) {
    if (Platform.OS === 'web') {
      // Listen for popstate events (browser back/forward)
      const onPopState = () => {
        listener(window.location.href);
      };
      window.addEventListener('popstate', onPopState);

      return () => {
        window.removeEventListener('popstate', onPopState);
      };
    }
    return () => {};
  },
};

export default linking;

/**
 * Helper function to generate article URL
 * @param {string} source - Article source identifier
 * @param {string} slug - Article slug
 * @returns {string} Full article URL path
 */
export function getArticleUrl(source, slug) {
  return `/article/${encodeURIComponent(source)}/${encodeURIComponent(slug)}`;
}

/**
 * Helper function to generate search URL with query
 * @param {string} query - Search query
 * @param {string} category - Optional category filter
 * @returns {string} Search URL with query params
 */
export function getSearchUrl(query, category = '') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  const queryString = params.toString();
  return `/search${queryString ? `?${queryString}` : ''}`;
}

/**
 * Helper function to generate category URL
 * @param {string} categorySlug - Category slug
 * @returns {string} Category URL path
 */
export function getCategoryUrl(categorySlug) {
  return `/?category=${encodeURIComponent(categorySlug)}`;
}
