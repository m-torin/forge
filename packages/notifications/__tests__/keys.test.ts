import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables
const mockCreateEnv = vi.fn();
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

describe('Notifications Keys Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    it('should make all keys optional in development', async () => {
      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(result.KNOCK_SECRET_API_KEY).toBe('sk_test_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('pk_test_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('channel_123');
    });

    it('should handle missing keys in development', async () => {
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: {
          NEXT_PUBLIC_KNOCK_API_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
        runtimeEnv: {
          KNOCK_SECRET_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
        },
        server: {
          KNOCK_SECRET_API_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.KNOCK_SECRET_API_KEY).toBeUndefined();
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBeUndefined();
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBeUndefined();
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_live_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_live_123';
    });

    it('should make keys optional even in production', async () => {
      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_live_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_live_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_live_123',
      });

      const { keys } = await import('../keys');
      const result = keys();

      // Notifications keys are always optional
      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: {
          NEXT_PUBLIC_KNOCK_API_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
        runtimeEnv: {
          KNOCK_SECRET_API_KEY: 'sk_live_123456789',
          NEXT_PUBLIC_KNOCK_API_KEY: 'pk_live_123456789',
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_live_123',
        },
        server: {
          KNOCK_SECRET_API_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.KNOCK_SECRET_API_KEY).toBe('sk_live_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_API_KEY).toBe('pk_live_123456789');
      expect(result.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBe('channel_live_123');
    });
  });

  describe('key validation', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    it('should validate minimum length for all keys', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      // Check server key validation
      const serverKeySchema = call.server.KNOCK_SECRET_API_KEY;
      expect(serverKeySchema._def.innerType._def.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'min',
            value: 1,
          }),
        ]),
      );

      // Check client key validation
      const clientKeySchema = call.client.NEXT_PUBLIC_KNOCK_API_KEY;
      expect(clientKeySchema._def.innerType._def.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'min',
            value: 1,
          }),
        ]),
      );

      // Check feed channel ID validation
      const feedChannelSchema = call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;
      expect(feedChannelSchema._def.innerType._def.checks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'min',
            value: 1,
          }),
        ]),
      );
    });
  });

  describe('runtime environment mapping', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    it('should map environment variables correctly', async () => {
      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: expect.any(Object),
        runtimeEnv: {
          KNOCK_SECRET_API_KEY: 'sk_test_123456789',
          NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
        },
        server: expect.any(Object),
      });
    });

    it('should handle undefined environment variables', async () => {
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: expect.any(Object),
        runtimeEnv: {
          KNOCK_SECRET_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
        },
        server: expect.any(Object),
      });
    });

    it('should handle empty string environment variables', async () => {
      process.env.KNOCK_SECRET_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = '';

      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: expect.any(Object),
        runtimeEnv: {
          KNOCK_SECRET_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
        },
        server: expect.any(Object),
      });
    });
  });

  describe('hasRequiredEnvVars logic', () => {
    it('should detect when any env var is present', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { keys } = await import('../keys');
      keys();

      // Should still make keys optional since notifications are always optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.KNOCK_SECRET_API_KEY._def.typeName).toBe('ZodOptional');
    });

    it('should detect when all env vars are missing', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { keys } = await import('../keys');
      keys();

      // Should make keys optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.KNOCK_SECRET_API_KEY._def.typeName).toBe('ZodOptional');
      expect(call.client.NEXT_PUBLIC_KNOCK_API_KEY._def.typeName).toBe('ZodOptional');
      expect(call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID._def.typeName).toBe('ZodOptional');
    });

    it('should handle partial env var presence', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { keys } = await import('../keys');
      keys();

      // Should make all keys optional since notifications are always optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.KNOCK_SECRET_API_KEY._def.typeName).toBe('ZodOptional');
      expect(call.client.NEXT_PUBLIC_KNOCK_API_KEY._def.typeName).toBe('ZodOptional');
      expect(call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID._def.typeName).toBe('ZodOptional');
    });
  });

  describe('client vs server configuration', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    it('should configure server keys correctly', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.server).toEqual({
        KNOCK_SECRET_API_KEY: expect.objectContaining({
          _def: expect.objectContaining({
            typeName: 'ZodOptional',
          }),
        }),
      });
    });

    it('should configure client keys correctly', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.client).toEqual({
        NEXT_PUBLIC_KNOCK_API_KEY: expect.objectContaining({
          _def: expect.objectContaining({
            typeName: 'ZodOptional',
          }),
        }),
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.objectContaining({
          _def: expect.objectContaining({
            typeName: 'ZodOptional',
          }),
        }),
      });
    });

    it('should not include client keys in server config', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.server.NEXT_PUBLIC_KNOCK_API_KEY).toBeUndefined();
      expect(call.server.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBeUndefined();
    });

    it('should not include server keys in client config', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.client.KNOCK_SECRET_API_KEY).toBeUndefined();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    it('should propagate createEnv errors', async () => {
      const error = new Error('Invalid environment configuration');
      mockCreateEnv.mockImplementation(() => {
        throw error;
      });

      const { keys } = await import('../keys');

      expect(() => keys()).toThrow('Invalid environment configuration');
    });
  });

  describe('function invocation', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';

      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    it('should return a function', async () => {
      const { keys } = await import('../keys');
      expect(typeof keys).toBe('function');
    });

    it('should call createEnv when invoked', async () => {
      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledTimes(1);
    });

    it('should return the result from createEnv', async () => {
      const expectedResult = {
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      };

      mockCreateEnv.mockReturnValue(expectedResult);

      const { keys } = await import('../keys');
      const result = keys();

      expect(result).toEqual(expectedResult);
    });

    it('should call createEnv every time invoked', async () => {
      const { keys } = await import('../keys');

      keys();
      keys();
      keys();

      expect(mockCreateEnv).toHaveBeenCalledTimes(3);
    });
  });

  describe('configuration consistency', () => {
    it('should always make notifications keys optional', async () => {
      // Test production with all keys present
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_live_123';

      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      // Even in production with all keys present, they should be optional
      expect(call.server.KNOCK_SECRET_API_KEY._def.typeName).toBe('ZodOptional');
      expect(call.client.NEXT_PUBLIC_KNOCK_API_KEY._def.typeName).toBe('ZodOptional');
      expect(call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID._def.typeName).toBe('ZodOptional');
    });

    it('should handle mixed environment scenarios', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.runtimeEnv).toEqual({
        KNOCK_SECRET_API_KEY: 'sk_live_123',
        NEXT_PUBLIC_KNOCK_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
      });
    });
  });
});
