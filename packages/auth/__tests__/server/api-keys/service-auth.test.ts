import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocking
import {
  createServiceAuth,
  parseServiceToken,
  verifyServiceAuth,
} from '../../../src/server/api-keys/service-auth';

// Mock auth using vi.hoisted
const { mockCreateApiKey, mockListApiKeys, mockRevokeApiKey, mockVerifyApiKey } = vi.hoisted(() => {
  const mockVerifyApiKey = vi.fn();
  const mockCreateApiKey = vi.fn();
  const mockListApiKeys = vi.fn();
  const mockRevokeApiKey = vi.fn();
  return { mockCreateApiKey, mockListApiKeys, mockRevokeApiKey, mockVerifyApiKey };
});

vi.mock('../../../src/shared/auth.config', () => ({
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

      // Mock successful API key creation (better-auth format)
      mockCreateApiKey.mockResolvedValue({
        key: mockApiKey,
        id: 'key-id-123',
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
          metadata: {
            type: 'service',
            createdAt: expect.any(String),
            serviceId: 'test-service',
          },
        },
        headers: expect.any(Object),
      });

      // Verify the service metadata was set correctly
      const callArgs = mockCreateApiKey.mock.calls[0][0].body;
      expect(callArgs.metadata.serviceId).toBe('test-service');
      expect(callArgs.metadata.type).toBe('service');
    });

    it('should create service auth token with custom expiration', async () => {
      const mockApiKey = 'ak_test_key_7days';

      // Mock successful API key creation (better-auth format)
      mockCreateApiKey.mockResolvedValue({
        key: mockApiKey,
        id: 'key-id-7days',
      });

      const result = await createServiceAuth({
        expiresIn: '7d',
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockApiKey);

      // Verify the correct API was called
      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: 'Service: test-service',
          metadata: {
            type: 'service',
            createdAt: expect.any(String),
            serviceId: 'test-service',
          },
        },
        headers: expect.any(Object),
      });
    });

    it('should handle various expiration formats', async () => {
      mockCreateApiKey.mockResolvedValue({
        key: 'ak_test_key',
        id: 'key-id-test',
      });

      // Test hours
      const result1 = await createServiceAuth({
        expiresIn: '48h',
        permissions: [],
        serviceId: 'test',
      });

      expect(result1.success).toBe(true);
      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: 'Service: test',
          metadata: {
            type: 'service',
            createdAt: expect.any(String),
            serviceId: 'test',
          },
        },
        headers: expect.any(Object),
      });

      // Test minutes
      vi.clearAllMocks();
      mockCreateApiKey.mockResolvedValue({
        key: 'ak_test_key',
        id: 'key-id-test',
      });

      const result2 = await createServiceAuth({
        expiresIn: '120m',
        permissions: [],
        serviceId: 'test',
      });

      expect(result2.success).toBe(true);
      expect(mockCreateApiKey).toHaveBeenCalledTimes(1);
    });

    it('should handle API key creation errors', async () => {
      // Mock API key creation failure (better-auth returns null key on failure)
      mockCreateApiKey.mockResolvedValue({
        key: null,
      });

      const result = await createServiceAuth({
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        error: 'Failed to create service authentication',
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
          permissions: {
            data: ['read:data'],
          },
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
          permissions: {
            data: ['read:data'],
          },
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
          permissions: {
            data: ['write:data'],
          },
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
