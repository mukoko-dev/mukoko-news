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
 */
const prefixes = Platform.select({
  web: [
    'https://mukoko.news',
    'https://www.mukoko.news',
    'http://localhost:8081',
    'http://localhost:19006',
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
 * /                        -> Bytes (default landing - core feature)
 * /discover                -> Discover (header menu only)
 * /clips                   -> Clips (personalized feed)
 * /search                  -> Search (includes insights when empty)
 * /profile                 -> Profile
 * /profile/login           -> Login
 * /profile/register        -> Register
 * /article/:source/:slug   -> Article detail
 * /admin                   -> Admin dashboard
 */
const config = {
  screens: {
    // Bytes - Default landing (core feature)
    Bytes: {
      path: '',
      screens: {
        BytesFeed: '',
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
    // Discover - Header menu access only
    Discover: {
      path: 'discover',
      screens: {
        DiscoverFeed: '',
        ArticleDetail: {
          path: 'article/:source/:slug',
          parse: {
            source: (source) => decodeURIComponent(source),
            slug: (slug) => decodeURIComponent(slug),
          },
        },
      },
    },
    // Clips - Personalized feed
    Clips: {
      path: 'clips',
      screens: {
        ClipsFeed: '',
        ArticleDetail: {
          path: 'article/:source/:slug',
        },
      },
    },
    // Search
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
    // Profile
    Profile: {
      path: 'profile',
      screens: {
        UserProfile: '',
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        Onboarding: 'onboarding',
        ProfileSettings: 'settings',
      },
    },
    // Admin
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

  async getInitialURL() {
    if (Platform.OS === 'web') {
      return window.location.href;
    }
    return null;
  },

  subscribe(listener) {
    if (Platform.OS === 'web') {
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
 */
export function getArticleUrl(source, slug) {
  return `/article/${encodeURIComponent(source)}/${encodeURIComponent(slug)}`;
}

/**
 * Helper function to generate search URL with query
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
 */
export function getCategoryUrl(categorySlug) {
  return `/discover?category=${encodeURIComponent(categorySlug)}`;
}
