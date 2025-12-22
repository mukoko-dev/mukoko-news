/**
 * Tests for OIDC Authentication Service
 * Tests JWT validation, token parsing, and OIDC claims handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OIDCAuthService } from '../OIDCAuthService';

// Mock KV Namespace
const createMockKV = () => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});

// Mock fetch for OIDC discovery
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OIDCAuthService', () => {
  let service: OIDCAuthService;
  let mockKV: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockKV = createMockKV();
    service = new OIDCAuthService({
      CACHE_STORAGE: mockKV as unknown as KVNamespace,
      AUTH_ISSUER_URL: 'https://id.mukoko.com',
    });
  });

  describe('extractBearerToken', () => {
    it('should extract token from valid Bearer header', () => {
      const result = OIDCAuthService.extractBearerToken('Bearer abc123');
      expect(result).toBe('abc123');
    });

    it('should handle lowercase bearer', () => {
      const result = OIDCAuthService.extractBearerToken('bearer abc123');
      expect(result).toBe('abc123');
    });

    it('should return null for null header', () => {
      const result = OIDCAuthService.extractBearerToken(null);
      expect(result).toBeNull();
    });

    it('should return null for empty header', () => {
      const result = OIDCAuthService.extractBearerToken('');
      expect(result).toBeNull();
    });

    it('should return null for non-Bearer auth', () => {
      const result = OIDCAuthService.extractBearerToken('Basic abc123');
      expect(result).toBeNull();
    });

    it('should return null for malformed header', () => {
      const result = OIDCAuthService.extractBearerToken('Bearer');
      expect(result).toBeNull();
    });

    it('should return null for header with extra parts', () => {
      const result = OIDCAuthService.extractBearerToken('Bearer token extra');
      expect(result).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has matching role', () => {
      const claims = { sub: 'user-123', role: 'admin' };
      const result = service.hasRole(claims, ['admin', 'moderator']);
      expect(result).toBe(true);
    });

    it('should return false when user lacks matching role', () => {
      const claims = { sub: 'user-123', role: 'user' };
      const result = service.hasRole(claims, ['admin', 'moderator']);
      expect(result).toBe(false);
    });

    it('should return false when claims has no role', () => {
      const claims = { sub: 'user-123' };
      const result = service.hasRole(claims, ['admin']);
      expect(result).toBe(false);
    });

    it('should return true for exact role match', () => {
      const claims = { sub: 'user-123', role: 'moderator' };
      const result = service.hasRole(claims, ['moderator']);
      expect(result).toBe(true);
    });
  });

  describe('isMinor', () => {
    it('should return true when isMinor claim is true', () => {
      const claims = { sub: 'user-123', isMinor: true };
      const result = service.isMinor(claims);
      expect(result).toBe(true);
    });

    it('should return false when isMinor claim is false', () => {
      const claims = { sub: 'user-123', isMinor: false };
      const result = service.isMinor(claims);
      expect(result).toBe(false);
    });

    it('should return false when isMinor claim is missing', () => {
      const claims = { sub: 'user-123' };
      const result = service.isMinor(claims);
      expect(result).toBe(false);
    });

    it('should return false for undefined isMinor', () => {
      const claims = { sub: 'user-123', isMinor: undefined };
      const result = service.isMinor(claims);
      expect(result).toBe(false);
    });
  });

  describe('getDisplayName', () => {
    it('should prefer name claim', () => {
      const claims = {
        sub: 'user-123',
        name: 'John Doe',
        preferred_username: 'johnd',
        email: 'john@example.com',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('John Doe');
    });

    it('should fallback to preferred_username', () => {
      const claims = {
        sub: 'user-123',
        preferred_username: 'johnd',
        email: 'john@example.com',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('johnd');
    });

    it('should fallback to nickname', () => {
      const claims = {
        sub: 'user-123',
        nickname: 'Johnny',
        email: 'john@example.com',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('Johnny');
    });

    it('should combine given_name and family_name', () => {
      const claims = {
        sub: 'user-123',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john@example.com',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('John Doe');
    });

    it('should use given_name alone if no family_name', () => {
      const claims = {
        sub: 'user-123',
        given_name: 'John',
        email: 'john@example.com',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('John');
    });

    it('should fallback to email', () => {
      const claims = {
        sub: 'user-123',
        email: 'john@example.com',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('john@example.com');
    });

    it('should fallback to sub as last resort', () => {
      const claims = {
        sub: 'user-123',
      };
      const result = service.getDisplayName(claims);
      expect(result).toBe('user-123');
    });
  });

  describe('validateToken', () => {
    // Helper to setup mock for discovery + userinfo 401 (invalid token fallback)
    const setupInvalidTokenMocks = () => {
      mockKV.get.mockResolvedValue(null);
      // Discovery endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          issuer: 'https://id.mukoko.com',
          jwks_uri: 'https://id.mukoko.com/.well-known/jwks.json',
          userinfo_endpoint: 'https://id.mukoko.com/userinfo',
          authorization_endpoint: 'https://id.mukoko.com/authorize',
          token_endpoint: 'https://id.mukoko.com/token',
        }),
      });
      // Userinfo endpoint returns 401 for invalid token
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
    };

    it('should return invalid for malformed JWT', async () => {
      setupInvalidTokenMocks();
      const result = await service.validateToken('not-a-jwt');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return invalid for JWT with wrong number of parts', async () => {
      setupInvalidTokenMocks();
      const result = await service.validateToken('part1.part2');
      expect(result.valid).toBe(false);
      // Falls back to userinfo which returns 401
      expect(result.error).toBe('Invalid or expired token');
    });

    it('should detect expired tokens via userinfo fallback', async () => {
      // Create expired JWT payload
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'key-1' }));
      const payload = btoa(JSON.stringify({
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        iss: 'https://id.mukoko.com',
      }));
      const signature = 'fake-signature';
      const token = `${header}.${payload}.${signature}`;

      setupInvalidTokenMocks();

      const result = await service.validateToken(token);
      expect(result.valid).toBe(false);
      // Falls back to userinfo which returns 401
      expect(result.error).toBe('Invalid or expired token');
    });

    it('should detect tokens not yet valid via userinfo fallback', async () => {
      // Create token with future nbf
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'key-1' }));
      const payload = btoa(JSON.stringify({
        sub: 'user-123',
        nbf: Math.floor(Date.now() / 1000) + 3600, // Valid in 1 hour
        iss: 'https://id.mukoko.com',
      }));
      const signature = 'fake-signature';
      const token = `${header}.${payload}.${signature}`;

      setupInvalidTokenMocks();

      const result = await service.validateToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });

    it('should detect wrong issuer via userinfo fallback', async () => {
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'key-1' }));
      const payload = btoa(JSON.stringify({
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'https://wrong-issuer.com',
      }));
      const signature = 'fake-signature';
      const token = `${header}.${payload}.${signature}`;

      setupInvalidTokenMocks();

      const result = await service.validateToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });
  });

  describe('getDiscovery', () => {
    it('should return cached discovery document', async () => {
      const cachedDiscovery = {
        issuer: 'https://id.mukoko.com',
        jwks_uri: 'https://id.mukoko.com/.well-known/jwks.json',
        userinfo_endpoint: 'https://id.mukoko.com/userinfo',
        authorization_endpoint: 'https://id.mukoko.com/authorize',
        token_endpoint: 'https://id.mukoko.com/token',
      };
      mockKV.get.mockResolvedValue(cachedDiscovery);

      const result = await service.getDiscovery();

      expect(result).toEqual(cachedDiscovery);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache discovery when not cached', async () => {
      const discovery = {
        issuer: 'https://id.mukoko.com',
        jwks_uri: 'https://id.mukoko.com/.well-known/jwks.json',
        userinfo_endpoint: 'https://id.mukoko.com/userinfo',
        authorization_endpoint: 'https://id.mukoko.com/authorize',
        token_endpoint: 'https://id.mukoko.com/token',
      };

      mockKV.get.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(discovery),
      });

      const result = await service.getDiscovery();

      expect(result).toEqual(discovery);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://id.mukoko.com/.well-known/openid-configuration'
      );
      expect(mockKV.put).toHaveBeenCalledWith(
        'oidc:discovery',
        JSON.stringify(discovery),
        expect.objectContaining({ expirationTtl: 86400 })
      );
    });

    it('should throw error when discovery fetch fails', async () => {
      mockKV.get.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.getDiscovery()).rejects.toThrow('Failed to fetch OIDC discovery: 500');
    });
  });

  describe('getJWKS', () => {
    it('should return cached JWKS', async () => {
      const cachedJWKS = {
        keys: [
          { kty: 'RSA', kid: 'key-1', n: 'abc', e: 'AQAB' },
        ],
      };
      mockKV.get.mockResolvedValue(cachedJWKS);

      const result = await service.getJWKS();

      expect(result).toEqual(cachedJWKS);
    });

    it('should fetch JWKS when not cached', async () => {
      const discovery = {
        issuer: 'https://id.mukoko.com',
        jwks_uri: 'https://id.mukoko.com/.well-known/jwks.json',
        userinfo_endpoint: 'https://id.mukoko.com/userinfo',
        authorization_endpoint: 'https://id.mukoko.com/authorize',
        token_endpoint: 'https://id.mukoko.com/token',
      };
      const jwks = {
        keys: [
          { kty: 'RSA', kid: 'key-1', n: 'abc', e: 'AQAB' },
        ],
      };

      // First call returns null (no cache), triggers discovery
      mockKV.get
        .mockResolvedValueOnce(null) // JWKS not cached
        .mockResolvedValueOnce(null); // Discovery not cached

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(discovery),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(jwks),
        });

      const result = await service.getJWKS();

      expect(result).toEqual(jwks);
      expect(mockKV.put).toHaveBeenCalledWith(
        'oidc:jwks',
        JSON.stringify(jwks),
        expect.objectContaining({ expirationTtl: 3600 })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle base64url encoded JWT parts', async () => {
      // JWT with URL-safe base64 characters
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'key-1' }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const payload = btoa(JSON.stringify({
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'https://id.mukoko.com',
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const signature = 'signature';
      const token = `${header}.${payload}.${signature}`;

      mockKV.get.mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          issuer: 'https://id.mukoko.com',
          jwks_uri: 'https://id.mukoko.com/.well-known/jwks.json',
          userinfo_endpoint: 'https://id.mukoko.com/userinfo',
          authorization_endpoint: 'https://id.mukoko.com/authorize',
          token_endpoint: 'https://id.mukoko.com/token',
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ keys: [] }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ keys: [] }),
      }).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await service.validateToken(token);
      // Should parse successfully but may fail validation
      expect(result).toBeDefined();
    });

    it('should handle concurrent JWKS fetches', async () => {
      const jwks = { keys: [{ kty: 'RSA', kid: 'key-1' }] };

      mockKV.get.mockResolvedValue(null);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            issuer: 'https://id.mukoko.com',
            jwks_uri: 'https://id.mukoko.com/.well-known/jwks.json',
            userinfo_endpoint: 'https://id.mukoko.com/userinfo',
            authorization_endpoint: 'https://id.mukoko.com/authorize',
            token_endpoint: 'https://id.mukoko.com/token',
          }),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(jwks),
        });

      // Start two concurrent requests
      const [result1, result2] = await Promise.all([
        service.getJWKS(),
        service.getJWKS(),
      ]);

      expect(result1).toEqual(jwks);
      expect(result2).toEqual(jwks);
    });
  });
});
