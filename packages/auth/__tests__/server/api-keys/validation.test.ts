/**
 * API key validation tests - converted to use DRY utilities
 */

import {
  createMockApiKey,
  createMockHeaders,
  createMockSession,
} from '@repo/qa/vitest/mocks/internal/auth-factories';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { setupAllMocks } from '../../test-helpers/mocks';
import {
  createApiKeyValidationTestSuite,
  createComprehensiveValidationTestSuite,
  createHeaderExtractionTestSuite,
  createPermissionCheckTestSuite,
  createRateLimitTestSuite,
} from '../../test-helpers/validation-builders';

// Import after mocking
import {
  extractApiKeyFromHeaders,
  hasPermissionForRequest,
  requireAuth,
  validateApiKey,
  validateApiKeyWithRateLimit,
} from '../../src/server/api-keys/validation';
import type { PermissionCheck } from '../../src/shared/api-keys';
import { auth } from '../../src/shared/auth';

// Set up all mocks
setupAllMocks();

// Mock the auth module directly for this test
vi.mock('../../src/shared/auth', () => ({
  auth: {
    api: {
      verifyApiKey: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

describe('aPI Key Validation (DRY)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mocks for auth.api
    vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
      valid: true,
      error: null,
      key: createMockApiKey(),
    });

    vi.mocked(auth.api.getSession).mockResolvedValue(createMockSession());
  });

  // Use DRY validation test suite for comprehensive API key validation
  createComprehensiveValidationTestSuite({
    validateApiKey,
    extractApiKey: extractApiKeyFromHeaders,
    hasPermission: hasPermissionForRequest,
    requireAuth,
    validateWithRateLimit: validateApiKeyWithRateLimit,
  });

  // Use DRY API key validation test suite for specific API key scenarios
  createApiKeyValidationTestSuite({
    validationFn: validateApiKey,
    testPermissions: true,
    customTests: [
      {
        name: 'should validate API key from x-api-key header',
        test: async () => {
          const headers = createMockHeaders({ 'x-api-key': 'test-api-key' });

          vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
            valid: true,
            error: null,
            key: createMockApiKey({
              id: 'key-1',
              name: 'Test Key',
              permissions: ['read'],
            }),
          });

          const result = await validateApiKey(headers);

          expect(result.isValid).toBeTruthy();
          expect(result.keyData?.id).toBe('key-1');
        },
      },
      {
        name: 'should validate API key from Authorization Bearer header',
        test: async () => {
          const headers = createMockHeaders({ authorization: 'Bearer test-bearer-token' });

          vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
            valid: true,
            error: null,
            key: createMockApiKey({ id: 'key-2', name: 'Bearer Key' }),
          });

          const result = await validateApiKey(headers);

          expect(result.isValid).toBeTruthy();
          expect(result.keyData?.id).toBe('key-2');
        },
      },
    ],
  });

  // Authentication requirement tests
  describe('requireAuth', () => {
    test('should return session when API key is valid', async () => {
      const headers = createMockHeaders({ 'x-api-key': 'valid-key' });
      const request = new (await import('next/server')).NextRequest(
        'http://localhost:3000/api/test',
        { headers },
      );

      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: createMockApiKey(),
      });

      const mockSession = createMockSession();
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth(request);

      expect(result).toStrictEqual(mockSession);
    });

    test('should return null when API key is invalid and no session', async () => {
      const headers = createMockHeaders({ 'x-api-key': 'invalid-key' });
      const request = new (await import('next/server')).NextRequest(
        'http://localhost:3000/api/test',
        { headers },
      );

      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await requireAuth(request);

      expect(result).toBeNull();
    });

    test('should fall back to session auth when no API key', async () => {
      const request = new (await import('next/server')).NextRequest(
        'http://localhost:3000/api/test',
      );

      const mockSession = createMockSession();
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth(request);

      expect(result).toStrictEqual(mockSession);
    });

    test('should handle session errors gracefully', async () => {
      const request = new (await import('next/server')).NextRequest(
        'http://localhost:3000/api/test',
      );

      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Session error'));

      const result = await requireAuth(request);

      expect(result).toBeNull();
    });
  });

  // Use DRY permission test suite for hasPermissionForRequest
  createPermissionCheckTestSuite(hasPermissionForRequest, { users: ['read'] });

  // Additional permission tests
  describe('hasPermissionForRequest', () => {
    test('should return true for valid API key with permissions', async () => {
      const headers = createMockHeaders({ 'x-api-key': 'valid-key' });
      const request = new (await import('next/server')).NextRequest(
        'http://localhost:3000/api/test',
        { headers },
      );
      const permissions: PermissionCheck = { users: ['read'] };

      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        key: createMockApiKey({ permissions: ['users:read'] }),
      });

      const result = await hasPermissionForRequest(request, permissions);

      expect(result).toBeTruthy();
    });

    test('should return false for invalid API key', async () => {
      const request = new (await import('next/server')).NextRequest(
        'http://localhost:3000/api/test',
      );
      request.headers.set('x-api-key', 'invalid-key');
      const permissions: PermissionCheck = { users: ['read'] };

      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await hasPermissionForRequest(request, permissions);

      expect(result).toBeFalsy();
    });
  });

  // Use DRY rate limit test suite for validateApiKeyWithRateLimit
  createRateLimitTestSuite(validateApiKeyWithRateLimit);

  // Additional rate limit tests
  describe('validateApiKeyWithRateLimit', () => {
    test('should include rate limit data for valid API key', async () => {
      const headers = createMockHeaders({ 'x-api-key': 'valid-key' });

      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: true,
        error: null,
        key: createMockApiKey(),
      });

      const result = await validateApiKeyWithRateLimit(headers);

      expect(result.isValid).toBeTruthy();
      expect(result.rateLimit).toStrictEqual({
        success: true,
        allowed: true,
        limit: 100,
        remaining: 100,
        resetTime: expect.any(Date),
      });
    });

    test('should not include rate limit for invalid API key', async () => {
      const headers = createMockHeaders({ 'x-api-key': 'invalid-key' });

      vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
      });

      const result = await validateApiKeyWithRateLimit(headers);

      expect(result.isValid).toBeFalsy();
      expect(result.rateLimit).toBeUndefined();
    });
  });

  // Use DRY header extraction test suite for extractApiKeyFromHeaders
  createHeaderExtractionTestSuite(extractApiKeyFromHeaders);

  // Additional header extraction tests
  describe('extractApiKeyFromHeaders', () => {
    test('should prioritize x-api-key over other headers', () => {
      const headers = createMockHeaders({
        'x-api-key': 'priority-key',
        authorization: 'Bearer other-token',
        'api-key': 'another-key',
      });

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBe('priority-key');
    });

    test('should return null when no API key is found', () => {
      const headers = createMockHeaders({ 'content-type': 'application/json' });

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBeNull();
    });

    test('should ignore non-Bearer authorization headers', () => {
      const headers = createMockHeaders({ authorization: 'Basic dXNlcjpwYXNz' });

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBeNull();
    });
  });
});
