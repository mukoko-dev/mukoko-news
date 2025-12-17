/**
 * Tests for AuthService
 * Tests authentication, authorization, and user management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, SupabaseUser, AuthResult } from '../AuthService';

// Mock global fetch
global.fetch = vi.fn();

describe('AuthService', () => {
  let authService: AuthService;
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockServiceKey = 'test-service-key';
  const mockAdminRoles = ['admin', 'super_admin', 'moderator'];

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(mockSupabaseUrl, mockServiceKey, mockAdminRoles);
  });

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should return user data for valid token', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'user-123',
        role: 'admin',
        full_name: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockProfile]),
        });

      const result = await authService.verifyToken('valid-token');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        full_name: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      });
    });

    it('should return null for invalid token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await authService.verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null when user data is missing', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await authService.verifyToken('token');

      expect(result).toBeNull();
    });

    it('should return null when profile is not found', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'user-123', email: 'test@example.com' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        });

      const result = await authService.verifyToken('token');

      expect(result).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.verifyToken('token');

      expect(result).toBeNull();
    });

    it('should use correct headers for auth request', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      await authService.verifyToken('test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/auth/v1/user`,
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'apikey': mockServiceKey,
          },
        }
      );
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      const user: SupabaseUser = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2024-01-01',
      };

      expect(authService.isAdmin(user)).toBe(true);
    });

    it('should return true for super_admin role', () => {
      const user: SupabaseUser = {
        id: '123',
        email: 'super@example.com',
        role: 'super_admin',
        created_at: '2024-01-01',
      };

      expect(authService.isAdmin(user)).toBe(true);
    });

    it('should return true for moderator role', () => {
      const user: SupabaseUser = {
        id: '123',
        email: 'mod@example.com',
        role: 'moderator',
        created_at: '2024-01-01',
      };

      expect(authService.isAdmin(user)).toBe(true);
    });

    it('should return false for user role', () => {
      const user: SupabaseUser = {
        id: '123',
        email: 'user@example.com',
        role: 'user',
        created_at: '2024-01-01',
      };

      expect(authService.isAdmin(user)).toBe(false);
    });

    it('should return false for unknown role', () => {
      const user: SupabaseUser = {
        id: '123',
        email: 'user@example.com',
        role: 'guest',
        created_at: '2024-01-01',
      };

      expect(authService.isAdmin(user)).toBe(false);
    });
  });

  describe('getUserProfile', () => {
    it('should return profile for valid user ID', async () => {
      const mockProfile = {
        id: 'user-123',
        role: 'admin',
        full_name: 'Test User',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProfile]),
      });

      const result = await authService.getUserProfile('user-123');

      expect(result).toEqual(mockProfile);
    });

    it('should return null for non-existent user', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await authService.getUserProfile('non-existent');

      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await authService.getUserProfile('user-123');

      expect(result).toBeNull();
    });

    it('should use correct query parameters', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await authService.getUserProfile('user-123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/rest/v1/profiles?id=eq.user-123&select=*`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockServiceKey}`,
            'apikey': mockServiceKey,
          }),
        })
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update role and return success', async () => {
      const updatedProfile = {
        id: 'user-123',
        role: 'moderator',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([updatedProfile]),
      });

      const result = await authService.updateUserRole('user-123', 'moderator');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(updatedProfile);
    });

    it('should return error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await authService.updateUserRole('user-123', 'admin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update user role');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.updateUserRole('user-123', 'admin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update user role');
    });

    it('should use PATCH method with correct body', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{}]),
      });

      await authService.updateUserRole('user-123', 'admin');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockSupabaseUrl}/rest/v1/profiles?id=eq.user-123`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ role: 'admin' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          }),
        })
      );
    });
  });

  describe('listUsers', () => {
    it('should return list of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', role: 'user' },
        { id: '2', email: 'admin@example.com', role: 'admin' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      });

      const result = await authService.listUsers();

      expect(result).toEqual(mockUsers);
    });

    it('should return empty array on API error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await authService.listUsers();

      expect(result).toEqual([]);
    });

    it('should return empty array on fetch error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.listUsers();

      expect(result).toEqual([]);
    });

    it('should order by created_at descending', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await authService.listUsers();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('order=created_at.desc'),
        expect.any(Object)
      );
    });
  });
});
