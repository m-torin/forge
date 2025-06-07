import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createServiceAuth,
  parseServiceToken,
  verifyServiceAuth,
} from '../../../server/api-keys/service-auth';

// Mock jsonwebtoken
const mockSign = vi.fn();
const mockVerify = vi.fn();

vi.mock('jsonwebtoken', () => ({
  sign: mockSign,
  verify: mockVerify,
}));

// Mock crypto
vi.mock('crypto', () => ({
  randomBytes: vi.fn().mockReturnValue({
    toString: vi.fn().mockReturnValue('random-string-123'),
  }),
}));

describe('Service Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset environment
    process.env.BETTER_AUTH_SECRET = 'test-secret';
  });

  describe('createServiceAuth', () => {
    it('should create service auth token with default expiration', async () => {
      const mockToken = 'service.token.123';
      mockSign.mockReturnValue(mockToken);

      const result = await createServiceAuth({
        permissions: ['read:data', 'write:data'],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        expiresAt: expect.any(Date),
        success: true,
        token: mockToken,
      });

      expect(mockSign).toHaveBeenCalledWith(
        {
          exp: expect.any(Number),
          iat: expect.any(Number),
          iss: 'service-auth',
          permissions: ['read:data', 'write:data'],
          sub: 'test-service',
        },
        'test-secret',
        { algorithm: 'HS256' },
      );

      // Check default expiration is 30 days
      const callArgs = mockSign.mock.calls[0][0];
      const expirationDays = (callArgs.exp - callArgs.iat) / (60 * 60 * 24);
      expect(expirationDays).toBeCloseTo(30, 0);
    });

    it('should create service auth token with custom expiration', async () => {
      const mockToken = 'service.token.123';
      mockSign.mockReturnValue(mockToken);

      await createServiceAuth({
        expiresIn: '7d',
        permissions: [],
        serviceId: 'test-service',
      });

      const callArgs = mockSign.mock.calls[0][0];
      const expirationDays = (callArgs.exp - callArgs.iat) / (60 * 60 * 24);
      expect(expirationDays).toBeCloseTo(7, 0);
    });

    it('should handle various expiration formats', async () => {
      mockSign.mockReturnValue('token');

      // Test hours
      await createServiceAuth({
        expiresIn: '48h',
        permissions: [],
        serviceId: 'test',
      });

      let callArgs = mockSign.mock.calls[0][0];
      const expirationHours = (callArgs.exp - callArgs.iat) / (60 * 60);
      expect(expirationHours).toBeCloseTo(48, 0);

      // Test minutes
      vi.clearAllMocks();
      mockSign.mockReturnValue('token');

      await createServiceAuth({
        expiresIn: '120m',
        permissions: [],
        serviceId: 'test',
      });

      callArgs = mockSign.mock.calls[0][0];
      const expirationMinutes = (callArgs.exp - callArgs.iat) / 60;
      expect(expirationMinutes).toBeCloseTo(120, 0);
    });

    it('should return error when secret is missing', async () => {
      delete process.env.BETTER_AUTH_SECRET;

      const result = await createServiceAuth({
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        error: 'Service authentication not configured',
        success: false,
      });
    });

    it('should handle token creation errors', async () => {
      mockSign.mockImplementation(() => {
        throw new Error('Token creation failed');
      });

      const result = await createServiceAuth({
        permissions: [],
        serviceId: 'test-service',
      });

      expect(result).toEqual({
        error: 'Failed to create service token',
        success: false,
      });
    });
  });

  describe('verifyServiceAuth', () => {
    it('should verify valid service token', async () => {
      const mockPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000) - 60,
        iss: 'service-auth',
        permissions: ['read:data'],
        sub: 'test-service',
      };

      mockVerify.mockReturnValue(mockPayload);

      const result = await verifyServiceAuth('valid.token.123');

      expect(result).toEqual({
        permissions: ['read:data'],
        serviceId: 'test-service',
        success: true,
      });

      expect(mockVerify).toHaveBeenCalledWith('valid.token.123', 'test-secret', {
        algorithms: ['HS256'],
      });
    });

    it('should reject invalid issuer', async () => {
      const mockPayload = {
        iss: 'wrong-issuer',
        permissions: ['read:data'],
        sub: 'test-service',
      };

      mockVerify.mockReturnValue(mockPayload);

      const result = await verifyServiceAuth('token');

      expect(result).toEqual({
        error: 'Invalid service token',
        success: false,
      });
    });

    it('should handle missing subject', async () => {
      const mockPayload = {
        iss: 'service-auth',
        permissions: ['read:data'],
      };

      mockVerify.mockReturnValue(mockPayload);

      const result = await verifyServiceAuth('token');

      expect(result).toEqual({
        error: 'Invalid service token',
        success: false,
      });
    });

    it('should handle expired tokens', async () => {
      mockVerify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = await verifyServiceAuth('expired.token');

      expect(result).toEqual({
        error: 'Service token expired',
        success: false,
      });
    });

    it('should handle invalid tokens', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      const result = await verifyServiceAuth('invalid.token');

      expect(result).toEqual({
        error: 'Invalid service token',
        success: false,
      });
    });

    it('should return error when secret is missing', async () => {
      delete process.env.BETTER_AUTH_SECRET;

      const result = await verifyServiceAuth('token');

      expect(result).toEqual({
        error: 'Service authentication not configured',
        success: false,
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

      expect(token).toBe('lowercase.token');
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
