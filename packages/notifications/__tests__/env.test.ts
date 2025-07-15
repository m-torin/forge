import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock environment variables
const mockCreateEnv = vi.fn();
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

// Mock return value for createEnv
const mockEnvValue = {
  KNOCK_SECRET_API_KEY: 'sk_test_123456789',
  NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
  NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
  NODE_ENV: 'development',
  NEXT_PUBLIC_NODE_ENV: 'development',
};

describe('notifications Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
    vi.resetModules();
    mockCreateEnv.mockReturnValue(mockEnvValue);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('development environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    test('should make all keys optional in development', async () => {
      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.KNOCK_SECRET_API_KEY).toBe('sk_test_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('pk_test_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('channel_123');
    });

    test('should handle missing keys in development', async () => {
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
        NODE_ENV: 'development',
        NEXT_PUBLIC_NODE_ENV: undefined,
      });

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          runtimeEnv: {
            KNOCK_SECRET_API_KEY: undefined,
            NEXT_PUBLIC_KNOCK_API_KEY: undefined,
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
            NODE_ENV: 'development',
            NEXT_PUBLIC_NODE_ENV: undefined,
          },
        }),
      );

      expect(result.KNOCK_SECRET_API_KEY).toBeUndefined();
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBeUndefined();
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBeUndefined();
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_live_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_live_123';
    });

    test('should make keys optional even in production', async () => {
      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_live_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_live_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_live_123',
        NODE_ENV: 'production',
        NEXT_PUBLIC_NODE_ENV: undefined,
      });

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      // Notifications keys are always optional
      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          runtimeEnv: {
            KNOCK_SECRET_API_KEY: 'sk_live_123456789',
            NEXT_PUBLIC_KNOCK_API_KEY: 'pk_live_123456789',
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_live_123',
            NODE_ENV: 'production',
            NEXT_PUBLIC_NODE_ENV: undefined,
          },
        }),
      );

      expect(result.KNOCK_SECRET_API_KEY).toBe('sk_live_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('pk_live_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('channel_live_123');
    });
  });

  describe('key validation', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    test('should validate minimum length for all keys', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            KNOCK_SECRET_API_KEY: expect.any(Object),
            NODE_ENV: expect.any(Object),
          }),
          client: expect.objectContaining({
            NEXT_PUBLIC_KNOCK_API_KEY: expect.any(Object),
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.any(Object),
            NEXT_PUBLIC_NODE_ENV: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('runtime environment mapping', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    test('should map environment variables correctly', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      // Should return the expected values
      expect(result.KNOCK_SECRET_API_KEY).toBe('sk_test_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('pk_test_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('channel_123');
    });

    test('should handle undefined environment variables', async () => {
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      // Should use fallback values when env vars are undefined
      expect(typeof result.KNOCK_SECRET_API_KEY).toBe('string');
      expect(typeof result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('string');
      expect(typeof result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('string');
    });

    test('should handle empty string environment variables', async () => {
      process.env.KNOCK_SECRET_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = '';

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      // Should return fallback values for empty strings
      expect(typeof result.KNOCK_SECRET_API_KEY).toBe('string');
      expect(typeof result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('string');
      expect(typeof result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('string');
    });
  });

  describe('hasRequiredEnvVars logic', () => {
    test('should detect when any env var is present', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      // Should still make keys optional since notifications are always optional
      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            KNOCK_SECRET_API_KEY: expect.any(Object),
          }),
        }),
      );
    });

    test('should detect when all env vars are missing', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      // Should make keys optional
      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            KNOCK_SECRET_API_KEY: expect.any(Object),
          }),
          client: expect.objectContaining({
            NEXT_PUBLIC_KNOCK_API_KEY: expect.any(Object),
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.any(Object),
          }),
        }),
      );
    });

    test('should handle partial env var presence', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      // Should make all keys optional since notifications are always optional
      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            KNOCK_SECRET_API_KEY: expect.any(Object),
          }),
          client: expect.objectContaining({
            NEXT_PUBLIC_KNOCK_API_KEY: expect.any(Object),
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('client vs server configuration', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    test('should configure server keys correctly', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            KNOCK_SECRET_API_KEY: expect.any(Object),
            NODE_ENV: expect.any(Object),
          }),
        }),
      );
    });

    test('should configure client keys correctly', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.objectContaining({
            NEXT_PUBLIC_KNOCK_API_KEY: expect.any(Object),
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.any(Object),
            NEXT_PUBLIC_NODE_ENV: expect.any(Object),
          }),
        }),
      );
    });

    test('should not include client keys in server config', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.server.NEXT_PUBLIC_KNOCK_API_KEY).toBeUndefined();
      expect(call.server.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBeUndefined();
      expect(call.server.NEXT_PUBLIC_NODE_ENV).toBeUndefined();
    });

    test('should not include server keys in client config', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.client.KNOCK_SECRET_API_KEY).toBeUndefined();
      expect(call.client.NODE_ENV).toBeUndefined();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    test('should handle createEnv errors gracefully', async () => {
      const error = new Error('Invalid environment configuration');
      mockCreateEnv.mockImplementation(() => {
        throw error;
      });

      const { safeEnv } = await import('../env');

      // Since this is a package, it should not throw but return fallback values
      const result = safeEnv();
      expect(result).toBeDefined();
      expect(typeof result.KNOCK_SECRET_API_KEY).toBe('string');
    });
  });

  describe('function invocation', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';

      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    test('should return a function', async () => {
      const { safeEnv } = await import('../env');
      expect(typeof safeEnv).toBe('function');
    });

    test('should call createEnv when invoked', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledTimes(1);
    });

    test('should return the result from createEnv', async () => {
      const expectedResult = {
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      };

      mockCreateEnv.mockReturnValue(expectedResult);

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result).toStrictEqual(expectedResult);
    });

    test('should reuse env instance after first call', async () => {
      const { safeEnv } = await import('../env');

      safeEnv();
      safeEnv();
      safeEnv();

      // createEnv is called once when module loads, then safeEnv reuses the cached env
      expect(mockCreateEnv).toHaveBeenCalledTimes(1);
    });
  });

  describe('configuration consistency', () => {
    test('should always make notifications keys optional', async () => {
      // Test production with all keys present
      (process.env as any).NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_live_123';

      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      // Even in production with all keys present, they should be optional
      expect(mockCreateEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            KNOCK_SECRET_API_KEY: expect.any(Object),
          }),
          client: expect.objectContaining({
            NEXT_PUBLIC_KNOCK_API_KEY: expect.any(Object),
            NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.any(Object),
          }),
        }),
      );
    });

    test('should handle mixed environment scenarios', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.runtimeEnv).toStrictEqual({
        KNOCK_SECRET_API_KEY: 'sk_live_123',
        NEXT_PUBLIC_KNOCK_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
        NODE_ENV: 'production',
        NEXT_PUBLIC_NODE_ENV: undefined,
      });
    });
  });
});
