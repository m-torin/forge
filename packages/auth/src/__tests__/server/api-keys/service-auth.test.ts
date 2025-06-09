import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createServiceAuth,
  parseServiceToken,
  verifyServiceAuth,
} from '../../../server/api-keys/service-auth';

// Mock auth using vi.hoisted
const { mockCreateApiKey, mockListApiKeys, mockRevokeApiKey, mockVerifyApiKey } = vi.hoisted(() => {
  const mockVerifyApiKey = vi.fn();
  const mockCreateApiKey = vi.fn();
  const mockListApiKeys = vi.fn();
  const mockRevokeApiKey = vi.fn();
  return { mockCreateApiKey, mockListApiKeys, mockRevokeApiKey, mockVerifyApiKey };
});

vi.mock('../../../server/auth', () => ({
  auth: {
    api: {
      createApiKey: mockCreateApiKey,
      listApiKeys: mockListApiKeys,
      revokeApiKey: mockRevokeApiKey,
      verifyApiKey: mockVerifyApiKey,
    },
  },
}));

describe('Service Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createServiceAuth', () => {
    it('should create service auth token with default expiration', async () => {
      const mockApiKey = 'ak_test_key_123';

      // Mock successful API key creation
      mockCreateApiKey.mockResolvedValue({
        apiKey: mockApiKey,
        success: true,
      });

      const result = await createServiceAuth({
        permissions: ['read:data', 'write:data'],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        expiresAt: expect.any(Date),
        success: true,
        token: mockApiKey,
      });

      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: 'Service: test-service',
          expiresAt: expect.any(String),
          metadata: {
            type: 'service',
            createdAt: expect.any(String),
            serviceId: 'test-service',
          },
          permissions: ['read:data', 'write:data'],
        },
      });

      // Check default expiration is 30 days
      const callArgs = mockCreateApiKey.mock.calls[0][0].body;
      const expiresAt = new Date(callArgs.expiresAt);
      const now = new Date();
      const diffInDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeGreaterThan(29);
      expect(diffInDays).toBeLessThan(31);
    });

    it('should create service auth token with custom expiration', async () => {
      const mockApiKey = 'ak_test_key_7days';

      // Mock successful API key creation
      mockCreateApiKey.mockResolvedValue({
        apiKey: mockApiKey,
        success: true,
      });

      const result = await createServiceAuth({
        expiresIn: '7d',
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockApiKey);

      const callArgs = mockCreateApiKey.mock.calls[0][0].body;
      const expiresAt = new Date(callArgs.expiresAt);
      const now = new Date();
      const diffInDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeGreaterThan(6.9);
      expect(diffInDays).toBeLessThan(7.1);
    });

    it('should handle various expiration formats', async () => {
      mockCreateApiKey.mockResolvedValue({
        apiKey: 'ak_test_key',
        success: true,
      });

      // Test hours
      await createServiceAuth({
        expiresIn: '48h',
        permissions: [],
        serviceId: 'test',
      });

      let callArgs = mockCreateApiKey.mock.calls[0][0].body;
      let expiresAt = new Date(callArgs.expiresAt);
      let now = new Date();
      const diffInHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffInHours).toBeGreaterThan(47.9);
      expect(diffInHours).toBeLessThan(48.1);

      // Test minutes
      vi.clearAllMocks();
      mockCreateApiKey.mockResolvedValue({
        apiKey: 'ak_test_key',
        success: true,
      });

      await createServiceAuth({
        expiresIn: '120m',
        permissions: [],
        serviceId: 'test',
      });

      callArgs = mockCreateApiKey.mock.calls[0][0].body;
      expiresAt = new Date(callArgs.expiresAt);
      now = new Date();
      const diffInMinutes = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      expect(diffInMinutes).toBeGreaterThan(119);
      expect(diffInMinutes).toBeLessThan(121);
    });

    it('should handle API key creation errors', async () => {
      // Mock API key creation failure
      mockCreateApiKey.mockResolvedValue({
        error: { message: 'API key creation failed' },
        success: false,
      });

      const result = await createServiceAuth({
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        error: 'API key creation failed',
        success: false,
      });
    });

    it('should handle creation exceptions', async () => {
      // Mock API key creation throwing error
      mockCreateApiKey.mockRejectedValue(new Error('Connection failed'));

      const result = await createServiceAuth({
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        error: 'Failed to create service authentication',
        success: false,
      });
    });
  });

  describe('verifyServiceAuth', () => {
    it('should verify valid service token', async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: 'service',
            serviceId: 'test-service',
          },
          permissions: ['read:data'],
        },
      });

      const result = await verifyServiceAuth('valid.token.123');

      expect(result).toEqual({
        isValid: true,
        permissions: ['read:data'],
        serviceId: 'test-service',
      });

      expect(mockVerifyApiKey).toHaveBeenCalledWith({
        body: { key: 'valid.token.123' },
      });
    });

    it('should reject non-service tokens', async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: 'user', // Not a service token
          },
          permissions: ['read:data'],
        },
      });

      const result = await verifyServiceAuth('token');

      expect(result).toEqual({
        isValid: false,
        error: 'Token is not a service authentication token',
      });
    });

    it('should handle invalid tokens', async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'Invalid API key' },
      });

      const result = await verifyServiceAuth('invalid.token');

      expect(result).toEqual({
        isValid: false,
        error: 'Invalid API key',
      });
    });

    it('should handle expired tokens', async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: 'API key expired' },
      });

      const result = await verifyServiceAuth('expired.token');

      expect(result).toEqual({
        isValid: false,
        error: 'API key expired',
      });
    });

    it('should handle verification exceptions', async () => {
      mockVerifyApiKey.mockRejectedValue(new Error('Connection failed'));

      const result = await verifyServiceAuth('error.token');

      expect(result).toEqual({
        isValid: false,
        error: 'Failed to validate service authentication',
      });
    });

    it('should handle tokens passed via headers', async () => {
      const headers = new Headers({
        authorization: 'Bearer service.token.123',
      });

      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: 'service',
            serviceId: 'test-service-2',
          },
          permissions: ['write:data'],
        },
      });

      const result = await verifyServiceAuth(headers);

      expect(result).toEqual({
        isValid: true,
        permissions: ['write:data'],
        serviceId: 'test-service-2',
      });
    });
  });

  describe('parseServiceToken', () => {
    it('should parse authorization header with Bearer token', () => {
      const headers = new Headers({
        authorization: 'Bearer service.token.123',
      });

      const token = parseServiceToken(headers);

      expect(token).toBe('service.token.123');
    });

    it('should parse x-api-key header', () => {
      const headers = new Headers({
        'x-api-key': 'api.key.456',
      });

      const token = parseServiceToken(headers);

      expect(token).toBe('api.key.456');
    });

    it('should prefer authorization header over x-api-key', () => {
      const headers = new Headers({
        authorization: 'Bearer auth.token',
        'x-api-key': 'api.key',
      });

      const token = parseServiceToken(headers);

      expect(token).toBe('auth.token');
    });

    it('should handle lowercase bearer prefix', () => {
      const headers = new Headers({
        authorization: 'bearer lowercase.token',
      });

      const token = parseServiceToken(headers);

      expect(token).toBeNull(); // Implementation only accepts 'Bearer' not 'bearer'
    });

    it('should return null when no token found', () => {
      const headers = new Headers();

      const token = parseServiceToken(headers);

      expect(token).toBeNull();
    });

    it('should return null for invalid authorization format', () => {
      const headers = new Headers({
        authorization: 'InvalidFormat token',
      });

      const token = parseServiceToken(headers);

      expect(token).toBeNull();
    });
  });
});
