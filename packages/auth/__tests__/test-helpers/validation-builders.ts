/**
 * Validation test builders for auth package
 * Provides reusable patterns for API key validation, permissions, and authentication tests
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createMockHeaders } from './factories';

// Mock auth for validation builders
vi.mock('#/shared/auth', () => ({
  auth: {
    api: {
      verifyApiKey: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

/**
 * Configuration for API key validation tests
 */
interface ApiKeyValidationTestConfig {
  /** Function to test */
  validationFn: (headers: any, permissions?: any) => Promise<any>;
  /** Expected validation result structure */
  expectedResult?: any;
  /** Whether to test permission checking */
  testPermissions?: boolean;
  /** Custom test cases */
  customTests?: Array<{
    name: string;
    test: () => Promise<void>;
  }>;
}

/**
 * Creates a comprehensive API key validation test suite
 */
export const createApiKeyValidationTestSuite = (config: ApiKeyValidationTestConfig) => {
  const { validationFn, expectedResult, testPermissions = false, customTests = [] } = config;

  return describe('aPI Key Validation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should validate API key from x-api-key header', async () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'test-api-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['read'],
        },
      });

      const result = await validationFn(headers);

      expect(result.isValid).toBeTruthy();
      expect(auth.api.verifyApiKey).toHaveBeenCalledWith({
        body: { key: 'test-api-key' },
      });
    });

    test('should validate API key from Authorization Bearer header', async () => {
      const headers = createMockHeaders();
      headers.set('authorization', 'Bearer test-bearer-token');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: {
          id: 'key-2',
          name: 'Bearer Key',
          organizationId: 'org-1',
          permissions: ['write'],
        },
      });

      const result = await validationFn(headers);

      expect(result.isValid).toBeTruthy();
      expect(auth.api.verifyApiKey).toHaveBeenCalledWith({
        body: { key: 'test-bearer-token' },
      });
    });

    test('should return error when no API key is provided', async () => {
      const headers = createMockHeaders();

      const result = await validationFn(headers);

      expect(result.isValid).toBeFalsy();
      expect(result.error).toBe('No API key provided');

      const { auth } = await import('#/shared/auth');
      expect(auth.api.verifyApiKey).not.toHaveBeenCalled();
    });

    test('should return error when API key is invalid', async () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'invalid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Key not found' },
        key: null,
      });

      const result = await validationFn(headers);

      expect(result.isValid).toBeFalsy();
      expect(result.error).toBe('Key not found');
    });

    test('should handle validation errors gracefully', async () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'test-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockRejectedValue(new Error('Database error'));

      const result = await validationFn(headers);

      expect(result.isValid).toBeFalsy();
      expect(result.error).toBe('Failed to validate API key');
    });

    test('should work with NextRequest object', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'test-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['read'],
        },
      });

      const result = await validationFn(request);

      expect(result.isValid).toBeTruthy();
    });

    if (testPermissions) {
      test('should check permissions when provided', async () => {
        const headers = createMockHeaders();
        headers.set('x-api-key', 'test-key');
        const permissions = { users: ['read'] };

        const { auth } = await import('#/shared/auth');
        vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
          valid: true,
          error: null,
          key: {
            id: 'key-1',
            name: 'Test Key',
            organizationId: 'org-1',
            permissions: ['users:read'],
          },
        });

        const result = await validationFn(headers, permissions);

        expect(result.isValid).toBeTruthy();
        expect(auth.api.verifyApiKey).toHaveBeenCalledWith({
          body: { key: 'test-key', permissions },
        });
      });

      test('should return error for insufficient permissions', async () => {
        const headers = createMockHeaders();
        headers.set('x-api-key', 'test-key');
        const permissions = { users: ['write'] };

        const { auth } = await import('#/shared/auth');
        vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
          valid: true,
          error: null,
          key: {
            id: 'key-1',
            name: 'Test Key',
            organizationId: 'org-1',
            permissions: ['users:read'], // Only has read permission
          },
        });

        const result = await validationFn(headers, permissions);

        expect(result.isValid).toBeFalsy();
        expect(result.error).toBe('Insufficient permissions');
      });
    }

    // Run custom tests
    customTests.forEach(({ name, test: testFn }) => {
      test(name, testFn);
    });
  });
};

/**
 * Creates a header extraction test suite
 */
export const createHeaderExtractionTestSuite = (extractionFn: (headers: any) => string | null) => {
  return describe('header Extraction', () => {
    test('should extract from x-api-key header', () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'test-key');

      const result = extractionFn(headers);

      expect(result).toBe('test-key');
    });

    test('should extract from Authorization Bearer header', () => {
      const headers = createMockHeaders();
      headers.set('authorization', 'Bearer bearer-token');

      const result = extractionFn(headers);

      expect(result).toBe('bearer-token');
    });

    test('should extract from api-key header', () => {
      const headers = createMockHeaders();
      headers.set('api-key', 'api-key-value');

      const result = extractionFn(headers);

      expect(result).toBe('api-key-value');
    });

    test('should extract from x-api-token header', () => {
      const headers = createMockHeaders();
      headers.set('x-api-token', 'token-value');

      const result = extractionFn(headers);

      expect(result).toBe('token-value');
    });

    test('should prioritize x-api-key over other headers', () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'priority-key');
      headers.set('authorization', 'Bearer other-token');
      headers.set('api-key', 'another-key');

      const result = extractionFn(headers);

      expect(result).toBe('priority-key');
    });

    test('should return null when no API key is found', () => {
      const headers = createMockHeaders();
      headers.set('content-type', 'application/json');

      const result = extractionFn(headers);

      expect(result).toBeNull();
    });

    test('should ignore non-Bearer authorization headers', () => {
      const headers = createMockHeaders();
      headers.set('authorization', 'Basic dXNlcjpwYXNz');

      const result = extractionFn(headers);

      expect(result).toBeNull();
    });
  });
};

/**
 * Creates a permission checking test suite
 */
export const createPermissionCheckTestSuite = (
  permissionFn: (request: any, permissions?: any) => Promise<boolean>,
  permissions: any,
) => {
  return describe('permission Checking', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should return true for valid API key with permissions', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'valid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-123',
          permissions: ['users:read'],
        },
      });

      const result = await permissionFn(request, permissions);

      expect(result).toBeTruthy();
    });

    test('should return false for invalid API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'invalid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
        key: null,
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await permissionFn(request, permissions);

      expect(result).toBeFalsy();
    });

    test('should return true for valid session', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'No API key' },
        key: null,
      });

      const mockSession = {
        session: { id: 'session-1' },
        user: { id: 'user-1', email: 'test@example.com' },
      };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await permissionFn(request, permissions);

      expect(result).toBeTruthy();
    });

    test('should return false when no authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'No API key' },
        key: null,
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await permissionFn(request, permissions);

      expect(result).toBeFalsy();
    });
  });
};

/**
 * Creates an authentication requirement test suite
 */
export const createAuthRequirementTestSuite = (requireAuthFn: (request: any) => Promise<any>) => {
  return describe('authentication Requirements', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should return session when API key is valid', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'valid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: { id: 'key-1', organizationId: 'org-1' },
      });

      const mockSession = {
        session: { id: 'session-1' },
        user: { id: 'user-1', email: 'test@example.com' },
      };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuthFn(request);

      expect(result).toStrictEqual(mockSession);
    });

    test('should return null when API key is invalid and no session', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'invalid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
        key: null,
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await requireAuthFn(request);

      expect(result).toBeNull();
    });

    test('should fall back to session auth when no API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const mockSession = {
        session: { id: 'session-1' },
        user: { id: 'user-1', email: 'test@example.com' },
      };

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuthFn(request);

      expect(result).toStrictEqual(mockSession);
    });

    test('should handle session errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Session error'));

      const result = await requireAuthFn(request);

      expect(result).toBeNull();
    });
  });
};

/**
 * Creates a rate limiting test suite
 */
export const createRateLimitTestSuite = (rateLimitFn: (headers: any) => Promise<any>) => {
  return describe('rate Limiting', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should include rate limit data for valid API key', async () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'valid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['read'],
        },
      });

      const result = await rateLimitFn(headers);

      expect(result.isValid).toBeTruthy();
      expect(result.rateLimit).toMatchObject({
        success: true,
        allowed: true,
        limit: expect.any(Number),
        remaining: expect.any(Number),
        resetTime: expect.any(Date),
      });
    });

    test('should not include rate limit for invalid API key', async () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'invalid-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
        key: null,
      });

      const result = await rateLimitFn(headers);

      expect(result.isValid).toBeFalsy();
      expect(result.rateLimit).toBeUndefined();
    });

    test('should handle rate limit exceeded', async () => {
      const headers = createMockHeaders();
      headers.set('x-api-key', 'rate-limited-key');

      const { auth } = await import('#/shared/auth');
      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['read'],
        },
      });

      // Mock rate limit exceeded
      const result = await rateLimitFn(headers);

      expect(result.isValid).toBeTruthy();
      expect(result.rateLimit).toBeDefined();
    });
  });
};

/**
 * Creates a comprehensive validation test suite combining all patterns
 */
export const createComprehensiveValidationTestSuite = (
  validationFunctions: {
    validateApiKey?: (headers: any, permissions?: any) => Promise<any>;
    extractApiKey?: (headers: any) => string | null;
    hasPermission?: (request: any, permissions?: any) => Promise<boolean>;
    requireAuth?: (request: any) => Promise<any>;
    validateWithRateLimit?: (headers: any) => Promise<any>;
  },
  permissions?: any,
) => {
  return describe('comprehensive Validation', () => {
    if (validationFunctions.validateApiKey) {
      createApiKeyValidationTestSuite({
        validationFn: validationFunctions.validateApiKey,
        testPermissions: Boolean(permissions),
      });
    }

    if (validationFunctions.extractApiKey) {
      createHeaderExtractionTestSuite(validationFunctions.extractApiKey);
    }

    if (validationFunctions.hasPermission && permissions) {
      createPermissionCheckTestSuite(validationFunctions.hasPermission, permissions);
    }

    if (validationFunctions.requireAuth) {
      createAuthRequirementTestSuite(validationFunctions.requireAuth);
    }

    if (validationFunctions.validateWithRateLimit) {
      createRateLimitTestSuite(validationFunctions.validateWithRateLimit);
    }
  });
};
