import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

/**
 * AuthContext - OIDC-based authentication state management
 *
 * Authentication is handled by id.mukoko.com (OIDC provider)
 * This context manages:
 * - Session state after OIDC callback
 * - Token storage and refresh
 * - User profile from OIDC claims
 */

// OIDC Configuration
const OIDC_CONFIG = {
  issuer: 'https://id.mukoko.com',
  clientId: 'mukoko-news-mobile',
  redirectUri: Platform.select({
    web: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://news.mukoko.com/auth/callback',
    default: 'mukoko-news://auth/callback',
  }),
};

// Backend API URL
const API_BASE_URL = __DEV__
  ? 'https://mukoko-news-backend.nyuchi.workers.dev'
  : 'https://mukoko-news-backend.nyuchi.workers.dev';

// Admin roles that have access to admin features
const ADMIN_ROLES = ['admin', 'moderator'];

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  handleOIDCCallback: async () => {},
});

// Storage keys
const AUTH_TOKEN_KEY = '@mukoko_auth_token';
const REFRESH_TOKEN_KEY = '@mukoko_refresh_token';
const USER_DATA_KEY = '@mukoko_user_data';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle deep links for OIDC callback
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (url && url.includes('/auth/callback')) {
        await handleOIDCCallback(url);
      }
    };

    // Handle initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription?.remove();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (token && userData) {
        // Verify session with backend
        const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            await clearAuthData();
          }
        } else {
          // Token invalid, try refresh
          const refreshed = await refreshSession();
          if (!refreshed) {
            await clearAuthData();
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Check auth error:', error);
      }
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Redirect to OIDC provider for login
   */
  const login = useCallback(async () => {
    const params = new URLSearchParams({
      client_id: OIDC_CONFIG.clientId,
      redirect_uri: OIDC_CONFIG.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      prompt: 'login',
    });

    const authUrl = `${OIDC_CONFIG.issuer}/authorize?${params.toString()}`;

    try {
      await Linking.openURL(authUrl);
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Failed to open OIDC login:', error);
      }
      return { error: error.message };
    }
  }, []);

  /**
   * Handle OIDC callback - exchange code for tokens
   */
  const handleOIDCCallback = async (callbackUrl) => {
    try {
      setIsLoading(true);

      const url = new URL(callbackUrl);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        if (__DEV__) {
          console.error('[Auth] OIDC error:', error);
        }
        return { error };
      }

      if (!code) {
        return { error: 'No authorization code received' };
      }

      // Exchange code for tokens via backend
      const response = await fetch(`${API_BASE_URL}/api/auth/oidc/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: OIDC_CONFIG.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Token exchange failed' };
      }

      const data = await response.json();

      if (data.access_token && data.user) {
        // Store tokens
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        if (data.refresh_token) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

        setUser(data.user);
        return { user: data.user, error: null };
      }

      return { error: 'Invalid response from server' };
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] OIDC callback error:', error);
      }
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh session using refresh token
   */
  const refreshSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.access_token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        if (data.refresh_token) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
        if (data.user) {
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
          setUser(data.user);
        }
        return true;
      }

      return false;
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Refresh session error:', error);
      }
      return false;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      // Notify backend of logout
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      await clearAuthData();
      setUser(null);

      // Optionally redirect to OIDC logout
      // const logoutUrl = `${OIDC_CONFIG.issuer}/logout?client_id=${OIDC_CONFIG.clientId}`;
      // await Linking.openURL(logoutUrl);

      return { error: null };
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Logout error:', error);
      }
      return { error: error.message };
    }
  };

  /**
   * Clear authentication data from storage
   */
  const clearAuthData = async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
  };

  // Check if user has admin role
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    login,
    logout,
    checkAuth,
    handleOIDCCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Get auth token from storage (for API requests)
 */
export async function getAuthToken() {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    if (__DEV__) {
      console.error('[Auth] Get token error:', error);
    }
    return null;
  }
}

export default AuthContext;
