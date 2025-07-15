/**
 * Tests for server helpers functionality
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Mock NextResponse
const mockNextResponseJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock shared auth
const mockAuth = {
  api: {
    getSession: vi.fn(),
  },
};
vi.mock('#/shared/auth', () => ({
  auth: mockAuth,
}));

describe('server helpers functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SERVICE_API_KEY;
  });

  describe('createAuthHelpers', () => {
    test('should create helpers with default config', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      expect(helpers).toHaveProperty('requireAuth');
      expect(helpers).toHaveProperty('getOptionalAuth');
      expect(typeof helpers.requireAuth).toBe('function');
      expect(typeof helpers.getOptionalAuth).toBe('function');
    });

    test('should create helpers with custom config', async () => {
      const helpersModule = await import('#/server/helpers');

      const config = {
        serviceEmail: 'custom@service.com',
        serviceName: 'Custom Service',
      };

      const helpers = helpersModule.createAuthHelpers(config);

      expect(helpers).toBeDefined();
    });

    test('should create helpers with partial config', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers({
        serviceName: 'Test Service',
      });

      expect(helpers).toBeDefined();
    });
  });

  describe('requireAuth', () => {
    test('should authenticate with valid service API key', async () => {
      const helpersModule = await import('#/server/helpers');

      process.env.SERVICE_API_KEY = 'valid-service-key';

      const helpers = helpersModule.createAuthHelpers({
        serviceEmail: 'test@service.com',
        serviceName: 'Test Service',
      });

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('valid-service-key'),
        },
      } as any;

      const result = await helpers.requireAuth(mockRequest);

      expect(result).toStrictEqual({
        session: {
          id: 'service-session',
          activeOrganizationId: 'system',
          userId: 'service',
        },
        user: {
          id: 'service',
          name: 'Test Service',
          email: 'test@service.com',
        },
      });
    });

    test('should not authenticate with invalid service API key', async () => {
      const helpersModule = await import('#/server/helpers');

      process.env.SERVICE_API_KEY = 'valid-service-key';

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('invalid-key'),
        },
      } as any;

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await helpers.requireAuth(mockRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          error: 'Unauthorized',
          message: 'Please authenticate',
        },
        {
          headers: {
            'WWW-Authenticate': 'Bearer realm="api", charset="UTF-8"',
          },
          status: 401,
        },
      );
    });

    test('should authenticate with valid user session', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await helpers.requireAuth(mockRequest);

      expect(result).toBe(mockSession);
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: mockRequest.headers,
      });
    });

    test('should return 401 when no authentication provided', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      mockAuth.api.getSession.mockResolvedValue(null);

      await helpers.requireAuth(mockRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          error: 'Unauthorized',
          message: 'Please authenticate',
        },
        {
          headers: {
            'WWW-Authenticate': 'Bearer realm="api", charset="UTF-8"',
          },
          status: 401,
        },
      );
    });

    test('should skip service auth when SERVICE_API_KEY not set', async () => {
      const helpersModule = await import('#/server/helpers');

      // No SERVICE_API_KEY env var
      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('some-key'),
        },
      } as any;

      const mockSession = {
        user: { id: 'user-1' },
        session: { id: 'session-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await helpers.requireAuth(mockRequest);

      expect(result).toBe(mockSession);
    });
  });

  describe('getOptionalAuth', () => {
    test('should return service auth with valid service API key', async () => {
      const helpersModule = await import('#/server/helpers');

      process.env.SERVICE_API_KEY = 'valid-service-key';

      const helpers = helpersModule.createAuthHelpers({
        serviceEmail: 'optional@service.com',
        serviceName: 'Optional Service',
      });

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('valid-service-key'),
        },
      } as any;

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result).toStrictEqual({
        session: {
          id: 'service-session',
          activeOrganizationId: 'system',
          userId: 'service',
        },
        user: {
          id: 'service',
          name: 'Optional Service',
          email: 'optional@service.com',
        },
      });
    });

    test('should return user session when available', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      const mockSession = {
        user: { id: 'user-1', name: 'Test User' },
        session: { id: 'session-1' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result).toBe(mockSession);
    });

    test('should return null when no authentication available', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result).toBeNull();
    });

    test('should not authenticate with invalid service API key', async () => {
      const helpersModule = await import('#/server/helpers');

      process.env.SERVICE_API_KEY = 'valid-service-key';

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('invalid-key'),
        },
      } as any;

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result).toBeNull();
    });

    test('should use default service config when not provided', async () => {
      const helpersModule = await import('#/server/helpers');

      process.env.SERVICE_API_KEY = 'valid-service-key';

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('valid-service-key'),
        },
      } as any;

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result.user.email).toBe('service@system');
      expect(result.user.name).toBe('Service Account');
    });
  });

  describe('edge cases', () => {
    test('should handle headers.get returning null', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result).toBeNull();
    });

    test('should handle auth.api.getSession throwing error', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as any;

      mockAuth.api.getSession.mockRejectedValue(new Error('Session error'));

      await expect(helpers.requireAuth(mockRequest)).rejects.toThrow('Session error');
    });

    test('should handle empty config object', async () => {
      const helpersModule = await import('#/server/helpers');

      const helpers = helpersModule.createAuthHelpers({});

      expect(helpers).toHaveProperty('requireAuth');
      expect(helpers).toHaveProperty('getOptionalAuth');
    });

    test('should handle missing SERVICE_API_KEY with API key provided', async () => {
      const helpersModule = await import('#/server/helpers');

      // Ensure SERVICE_API_KEY is not set
      delete process.env.SERVICE_API_KEY;

      const helpers = helpersModule.createAuthHelpers();

      const mockRequest = {
        headers: {
          get: vi.fn().mockReturnValue('some-api-key'),
        },
      } as any;

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await helpers.getOptionalAuth(mockRequest);

      expect(result).toBeNull();
    });
  });
});
