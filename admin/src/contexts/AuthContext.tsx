import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { auth, getAuthToken, getStoredUser, saveAuthData, clearAuthData, type AdminUser } from '../api/client';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        // Verify token with backend
        const { data, error } = await auth.getSession();

        if (data && !error) {
          setUser(storedUser);
        } else {
          // Token invalid, clear storage
          clearAuthData();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Check auth error:', error);
      clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await auth.login(email, password);

      if (error) {
        return { error };
      }

      if (data?.user && data?.token) {
        saveAuthData(data.token, data.user);
        setUser(data.user);
        return {};
      }

      return { error: 'Login failed - no user data received' };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { error: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      clearAuthData();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
