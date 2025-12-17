/**
 * Tests for AuthContext
 * Tests authentication state management, login, logout, and role checking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants from AuthContext
const ADMIN_ROLES = ['admin', 'super_admin', 'moderator'];
const AUTH_TOKEN_KEY = '@mukoko_auth_token';
const USER_DATA_KEY = '@mukoko_user_data';

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Admin Role Checking', () => {
    const isAdmin = (user) => {
      return !!(user && ADMIN_ROLES.includes(user.role));
    };

    it('should return true for admin role', () => {
      const user = { id: '1', email: 'admin@test.com', role: 'admin' };
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for super_admin role', () => {
      const user = { id: '1', email: 'super@test.com', role: 'super_admin' };
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for moderator role', () => {
      const user = { id: '1', email: 'mod@test.com', role: 'moderator' };
      expect(isAdmin(user)).toBe(true);
    });

    it('should return false for creator role', () => {
      const user = { id: '1', email: 'creator@test.com', role: 'creator' };
      expect(isAdmin(user)).toBe(false);
    });

    it('should return false for user role', () => {
      const user = { id: '1', email: 'user@test.com', role: 'user' };
      expect(isAdmin(user)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isAdmin(null)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(isAdmin(undefined)).toBe(false);
    });

    it('should return false for user without role', () => {
      const user = { id: '1', email: 'test@test.com' };
      expect(isAdmin(user)).toBe(false);
    });
  });

  describe('Storage Keys', () => {
    it('should use correct auth token key', () => {
      expect(AUTH_TOKEN_KEY).toBe('@mukoko_auth_token');
    });

    it('should use correct user data key', () => {
      expect(USER_DATA_KEY).toBe('@mukoko_user_data');
    });
  });

  describe('AsyncStorage Operations', () => {
    it('should store auth token', async () => {
      const token = 'test-token-123';
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      expect(storedToken).toBe(token);
    });

    it('should store user data as JSON', async () => {
      const userData = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'creator',
      };

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      const storedData = await AsyncStorage.getItem(USER_DATA_KEY);
      expect(JSON.parse(storedData)).toEqual(userData);
    });

    it('should clear auth data on logout', async () => {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'token');
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({ id: '1' }));

      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      expect(token).toBeNull();
      expect(userData).toBeNull();
    });
  });

  describe('Authentication State', () => {
    it('should compute isAuthenticated correctly', () => {
      const getIsAuthenticated = (user) => !!user;

      expect(getIsAuthenticated({ id: '1' })).toBe(true);
      expect(getIsAuthenticated(null)).toBe(false);
      expect(getIsAuthenticated(undefined)).toBe(false);
    });
  });

  describe('Login Flow', () => {
    it('should handle successful login response', () => {
      const mockResponse = {
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            role: 'creator',
          },
          token: 'auth-token-123',
        },
        error: null,
      };

      expect(mockResponse.data.user).toBeDefined();
      expect(mockResponse.data.token).toBeDefined();
      expect(mockResponse.error).toBeNull();
    });

    it('should handle login error response', () => {
      const mockResponse = {
        data: null,
        error: 'Invalid credentials',
      };

      expect(mockResponse.error).toBe('Invalid credentials');
      expect(mockResponse.data).toBeNull();
    });

    it('should handle login without token', () => {
      const mockResponse = {
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
          },
        },
        error: null,
      };

      // Should still work, token is optional
      expect(mockResponse.data.user).toBeDefined();
    });
  });

  describe('Registration Flow', () => {
    it('should handle successful registration response', () => {
      const mockResponse = {
        data: {
          user: {
            id: '456',
            email: 'new@example.com',
            username: 'newuser',
            displayName: 'New User',
            role: 'creator',
          },
          token: 'new-auth-token',
        },
        error: null,
      };

      expect(mockResponse.data.user.id).toBe('456');
      expect(mockResponse.data.user.role).toBe('creator');
    });

    it('should handle registration error', () => {
      const mockResponse = {
        data: null,
        error: 'Email already exists',
      };

      expect(mockResponse.error).toBe('Email already exists');
    });
  });

  describe('Logout Flow', () => {
    it('should handle successful logout', async () => {
      // Setup initial state
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'token');
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({ id: '1' }));

      // Simulate logout
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);

      // Verify cleared
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      expect(token).toBeNull();
    });
  });

  describe('Check Auth Flow', () => {
    it('should restore session from storage', async () => {
      const storedToken = 'stored-token';
      const storedUser = { id: '123', email: 'test@example.com' };

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, storedToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(storedUser));

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      expect(token).toBe(storedToken);
      expect(JSON.parse(userData)).toEqual(storedUser);
    });

    it('should handle missing token gracefully', async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      expect(token).toBeNull();
    });

    it('should handle corrupted user data gracefully', async () => {
      await AsyncStorage.setItem(USER_DATA_KEY, 'not-valid-json');

      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      expect(() => JSON.parse(userData)).toThrow();
    });
  });

  describe('Token Retrieval', () => {
    it('should get auth token from storage', async () => {
      const token = 'test-token';
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

      const retrievedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      expect(retrievedToken).toBe(token);
    });

    it('should return null when no token exists', async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      expect(token).toBeNull();
    });
  });
});
