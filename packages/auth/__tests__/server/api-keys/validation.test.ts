/**
 * API key validation tests
 */

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Import logError from mock
import { logError } from '@repo/observability/server/next';

// Import after mocking
import {
  extractApiKeyFromHeaders,
  hasPermissionForRequest,
  requireAuth,
  validateApiKey,
  validateApiKeyWithRateLimit,
} from '../../../src/server/api-keys/validation';
import type { PermissionCheck } from '../../../src/shared/api-keys';

// Mock server-only module
vi.mock('server-only', () => ({}));

// Mock observability logger
vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  createLogger: () => ({
    info: vi.fn((message: string, ...args: any[]) => console.info(message, ...args)),
    error: vi.fn((message: string, ...args: any[]) => console.error(message, ...args)),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

// Use vi.hoisted for mocks that need to be available during module loading
const { mockAuth, mockCheckApiKeyPermissions, mockHeaders, mockPermissionsArrayToStructure } =
  vi.hoisted(() => {
    const mockHeaders = vi.fn();
    const mockAuth = {
      api: {
        getSession: vi.fn(),
        verifyApiKey: vi.fn(),
      },
    };
    const mockCheckApiKeyPermissions = vi.fn();
    const mockPermissionsArrayToStructure = vi.fn();

    return {
      mockAuth,
      mockCheckApiKeyPermissions,
      mockHeaders,
      mockPermissionsArrayToStructure,
    };
  });

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Mock auth module
vi.mock('../../../src/shared/auth', () => ({
  auth: mockAuth,
}));

// Mock shared api-keys module
vi.mock('../../../src/shared/api-keys', () => ({
  checkApiKeyPermissions: mockCheckApiKeyPermissions,
  hasPermission: vi.fn(),
  permissionsArrayToStructure: mockPermissionsArrayToStructure,
}));

describe('aPI Key Validation', () => {
  const originalConsole = console;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation();

    // Setup default headers mock
    mockHeaders.mockResolvedValue(new Headers());

    // Setup default permission conversion mock
    mockPermissionsArrayToStructure.mockImplementation((permissions: string[]) => {
      const actions: string[] = [];
      const resources: string[] = [];

      permissions.forEach((p: string) => {
        if (p && p.includes(':')) {
          const [resource, action] = p.split(':');
          if (!resources.includes(resource)) resources.push(resource);
          if (!actions.includes(action)) actions.push(action);
        } else if (p) {
          // Handle single permissions without colon
          if (!actions.includes(p)) actions.push(p);
        }
      });

      return { actions, resources };
    });
  });

  afterEach(() => {
    console.error = originalConsole.error;
  });

  describe('validateApiKey', () => {
    test('should validate API key from x-api-key header', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'test-api-key');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-1',
          name: 'Test Key',
          expiresAt: '2024-12-31T23:59:59Z',
          lastUsedAt: '2024-06-05T12:00:00Z',
          organizationId: 'org-1',
          permissions: ['read'],
        },
      });

      const result = await validateApiKey(headers);

      expect(result).toStrictEqual({
        isValid: true,
        keyData: {
          id: 'key-1',
          name: 'Test Key',
          expiresAt: new Date('2024-12-31T23:59:59Z'),
          lastUsedAt: new Date('2024-06-05T12:00:00Z'),
          organizationId: 'org-1',
          permissions: {
            actions: ['read'],
            resources: [],
          },
        },
      });

      expect(mockAuth.api.verifyApiKey).toHaveBeenCalledWith({
        body: { key: 'test-api-key' },
      });
    });

    test('should validate API key from Authorization Bearer header', async () => {
      const headers = new Headers();
      headers.set('authorization', 'Bearer test-bearer-token');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-2',
          name: 'Bearer Key',
          organizationId: 'org-1',
          permissions: ['write'],
        },
      });

      const result = await validateApiKey(headers);

      expect(result.isValid).toBeTruthy();
      expect(result.keyData?.id).toBe('key-2');

      expect(mockAuth.api.verifyApiKey).toHaveBeenCalledWith({
        body: { key: 'test-bearer-token' },
      });
    });

    test('should return error when no API key is provided', async () => {
      const headers = new Headers();

      const result = await validateApiKey(headers);

      expect(result).toStrictEqual({
        isValid: false,
        error: 'No API key provided',
      });

      expect(mockAuth.api.verifyApiKey).not.toHaveBeenCalled();
    });

    test('should return error when API key is invalid', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'invalid-key');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'Key not found' },
      });

      const result = await validateApiKey(headers);

      expect(result).toStrictEqual({
        isValid: false,
        error: 'Key not found',
      });
    });

    test('should check permissions when provided', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'test-key');

      const permissions: PermissionCheck = { users: ['read'] };

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['users:read'],
        },
      });

      mockCheckApiKeyPermissions.mockReturnValue(true);

      const result = await validateApiKey(headers, permissions);

      expect(result.isValid).toBeTruthy();
      expect(mockAuth.api.verifyApiKey).toHaveBeenCalledWith({
        body: { key: 'test-key', permissions },
      });
      expect(mockCheckApiKeyPermissions).toHaveBeenCalledWith(
        { actions: ['read'], resources: ['users'] },
        permissions,
      );
    });

    test('should return error for insufficient permissions', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'test-key');

      const permissions: PermissionCheck = { users: ['write'] };

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['users:read'], // Only has read permission
        },
      });

      mockCheckApiKeyPermissions.mockReturnValue(false);

      const result = await validateApiKey(headers, permissions);

      expect(result).toStrictEqual({
        isValid: false,
        error: 'Insufficient permissions',
      });
    });

    test('should handle validation errors gracefully', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'test-key');

      mockAuth.api.verifyApiKey.mockRejectedValue(new Error('Database error'));

      const result = await validateApiKey(headers);

      expect(result).toStrictEqual({
        isValid: false,
        error: 'Failed to validate API key',
      });

      expect(logError).toHaveBeenCalledWith('API key validation error:', expect.any(Error));
    });

    test('should work with NextRequest object', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'test-key');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['read'],
        },
      });

      const result = await validateApiKey(request);

      expect(result.isValid).toBeTruthy();
      expect(mockAuth.api.verifyApiKey).toHaveBeenCalledWith({
        body: { key: 'test-key' },
      });
    });
  });

  describe('requireAuth', () => {
    test('should return session when API key is valid', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'valid-key');
      const request = new NextRequest('http://localhost:3000/api/test', { headers });

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: { id: 'key-1', organizationId: 'org-1' },
      });

      const mockSession = {
        session: { id: 'session-1' },
        user: { id: 'user-1', email: 'test@example.com' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await requireAuth(request);

      expect(result).toStrictEqual(mockSession);
    });

    test('should return null when API key is invalid and no session', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'invalid-key');
      const request = new NextRequest('http://localhost:3000/api/test', { headers });

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
      });

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await requireAuth(request);

      expect(result).toBeNull();
    });

    test('should fall back to session auth when no API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const mockSession = {
        session: { id: 'session-1' },
        user: { id: 'user-1', email: 'test@example.com' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await requireAuth(request);

      expect(result).toStrictEqual(mockSession);
    });

    test('should handle session errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      mockAuth.api.getSession.mockRejectedValue(new Error('Session error'));

      const result = await requireAuth(request);

      expect(result).toBeNull();
    });
  });

  describe('hasPermissionForRequest', () => {
    const permissions: PermissionCheck = { users: ['read'] };

    test('should return true for valid API key with permissions', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'valid-key');

      const request = {
        headers,
        url: 'http://localhost:3000/api/test',
        method: 'GET',
        nextUrl: {
          pathname: '/api/test',
          searchParams: new URLSearchParams(),
        },
      } as unknown as NextRequest;

      // First mock call - validateApiKey is called with permissions
      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-123',
          permissions: ['users:read'], // Permissions as array
        },
      });

      // Mock permission check to return true
      mockCheckApiKeyPermissions.mockReturnValue(true);

      const result = await hasPermissionForRequest(request, permissions);

      expect(result).toBeTruthy();
      // Verify that the API was called with the correct parameters
      expect(mockAuth.api.verifyApiKey).toHaveBeenCalledTimes(1);
      const callArgs = mockAuth.api.verifyApiKey.mock.calls[0][0];
      expect(callArgs.body.key).toBe('valid-key');
      expect(callArgs.body.permissions).toStrictEqual({ users: ['read'] });
    });

    test('should return false for invalid API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      request.headers.set('x-api-key', 'invalid-key');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
      });

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await hasPermissionForRequest(request, permissions);

      expect(result).toBeFalsy();
    });

    test('should return true for valid session', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'No API key' },
      });

      const mockSession = {
        session: { id: 'session-1' },
        user: { id: 'user-1', email: 'test@example.com' },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await hasPermissionForRequest(request, permissions);

      expect(result).toBeTruthy();
    });

    test('should return false when no authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'No API key' },
      });

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await hasPermissionForRequest(request, permissions);

      expect(result).toBeFalsy();
    });
  });

  describe('validateApiKeyWithRateLimit', () => {
    test('should include rate limit data for valid API key', async () => {
      const headers = new Headers();
      headers.set('x-api-key', 'valid-key');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          id: 'key-1',
          name: 'Test Key',
          organizationId: 'org-1',
          permissions: ['read'],
        },
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
      const headers = new Headers();
      headers.set('x-api-key', 'invalid-key');

      mockAuth.api.verifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'Invalid key' },
      });

      const result = await validateApiKeyWithRateLimit(headers);

      expect(result.isValid).toBeFalsy();
      expect(result.rateLimit).toBeUndefined();
    });
  });

  describe('extractApiKeyFromHeaders', () => {
    test('should extract from x-api-key header', () => {
      const headers = new Headers();
      headers.set('x-api-key', 'test-key');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBe('test-key');
    });

    test('should extract from Authorization Bearer header', () => {
      const headers = new Headers();
      headers.set('authorization', 'Bearer bearer-token');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBe('bearer-token');
    });

    test('should extract from api-key header', () => {
      const headers = new Headers();
      headers.set('api-key', 'api-key-value');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBe('api-key-value');
    });

    test('should extract from x-api-token header', () => {
      const headers = new Headers();
      headers.set('x-api-token', 'token-value');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBe('token-value');
    });

    test('should prioritize x-api-key over other headers', () => {
      const headers = new Headers();
      headers.set('x-api-key', 'priority-key');
      headers.set('authorization', 'Bearer other-token');
      headers.set('api-key', 'another-key');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBe('priority-key');
    });

    test('should return null when no API key is found', () => {
      const headers = new Headers();
      headers.set('content-type', 'application/json');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBeNull();
    });

    test('should ignore non-Bearer authorization headers', () => {
      const headers = new Headers();
      headers.set('authorization', 'Basic dXNlcjpwYXNz');

      const result = extractApiKeyFromHeaders(headers);

      expect(result).toBeNull();
    });
  });
});
