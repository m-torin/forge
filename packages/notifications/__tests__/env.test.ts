import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock environment variables
const mockCreateEnv = vi.fn();
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

describe('notifications Environment Configuration', () => {
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
      });

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: {
          NEXT_PUBLIC_KNOCK_API_KEY: expect.objectContaining({
            def: expect.objectContaining({
              type: 'optional',
            }),
          }),
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.objectContaining({
            def: expect.objectContaining({
              type: 'optional',
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
            def: expect.objectContaining({
              type: 'optional',
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

    test('should make keys optional even in production', async () => {
      mockCreateEnv.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_live_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_live_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_live_123',
      });

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      // Notifications keys are always optional
      expect(mockCreateEnv).toHaveBeenCalledWith({
        client: {
          NEXT_PUBLIC_KNOCK_API_KEY: expect.objectContaining({
            def: expect.objectContaining({
              type: 'optional',
            }),
          }),
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.objectContaining({
            def: expect.objectContaining({
              type: 'optional',
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
            def: expect.objectContaining({
              type: 'optional',
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

    test('should validate minimum length for all keys', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      // Check that all keys have proper validation by testing they are optional strings with min length
      const serverKeySchema = call.server.KNOCK_SECRET_API_KEY;
      expect(serverKeySchema.def.type).toBe('optional');
      expect(serverKeySchema.def.innerType.def.type).toBe('string');
      expect(serverKeySchema.def.innerType.def.checks).toHaveLength(1);

      const clientKeySchema = call.client.NEXT_PUBLIC_KNOCK_API_KEY;
      expect(clientKeySchema.def.type).toBe('optional');
      expect(clientKeySchema.def.innerType.def.type).toBe('string');
      expect(clientKeySchema.def.innerType.def.checks).toHaveLength(1);

      const feedChannelSchema = call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;
      expect(feedChannelSchema.def.type).toBe('optional');
      expect(feedChannelSchema.def.innerType.def.type).toBe('string');
      expect(feedChannelSchema.def.innerType.def.checks).toHaveLength(1);

      // Test validation works by parsing valid and invalid values
      expect(() => serverKeySchema.def.innerType.parse('a')).not.toThrow();
      expect(() => serverKeySchema.def.innerType.parse('')).toThrow(
        'String must contain at least 1 character(s)',
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

    test('should map environment variables correctly', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

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

    test('should handle undefined environment variables', async () => {
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

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

    test('should handle empty string environment variables', async () => {
      process.env.KNOCK_SECRET_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = '';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = '';

      const { safeEnv } = await import('../env');
      safeEnv();

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
    test('should detect when any env var is present', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      // Should still make keys optional since notifications are always optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.KNOCK_SECRET_API_KEY.def.type).toBe('optional');
    });

    test('should detect when all env vars are missing', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      // Should make keys optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.KNOCK_SECRET_API_KEY.def.type).toBe('optional');
      expect(call.client.NEXT_PUBLIC_KNOCK_API_KEY.def.type).toBe('optional');
      expect(call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID.def.type).toBe('optional');
    });

    test('should handle partial env var presence', async () => {
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = undefined;
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = undefined;

      const { safeEnv } = await import('../env');
      safeEnv();

      // Should make all keys optional since notifications are always optional
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.KNOCK_SECRET_API_KEY.def.type).toBe('optional');
      expect(call.client.NEXT_PUBLIC_KNOCK_API_KEY.def.type).toBe('optional');
      expect(call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID.def.type).toBe('optional');
    });
  });

  describe('client vs server configuration', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.KNOCK_SECRET_API_KEY = 'sk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_test_123456789';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_123';
    });

    test('should configure server keys correctly', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.server).toStrictEqual({
        KNOCK_SECRET_API_KEY: expect.objectContaining({
          def: expect.objectContaining({
            type: 'optional',
          }),
        }),
      });
    });

    test('should configure client keys correctly', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.client).toStrictEqual({
        NEXT_PUBLIC_KNOCK_API_KEY: expect.objectContaining({
          def: expect.objectContaining({
            type: 'optional',
          }),
        }),
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.objectContaining({
          def: expect.objectContaining({
            type: 'optional',
          }),
        }),
      });
    });

    test('should not include client keys in server config', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      expect(call.server.NEXT_PUBLIC_KNOCK_API_KEY).toBeUndefined();
      expect(call.server.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID).toBeUndefined();
    });

    test('should not include server keys in client config', async () => {
      const { safeEnv } = await import('../env');
      safeEnv();

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

    test('should propagate createEnv errors', async () => {
      const error = new Error('Invalid environment configuration');
      mockCreateEnv.mockImplementation(() => {
        throw error;
      });

      const { safeEnv } = await import('../env');

      expect(() => safeEnv()).toThrow('Invalid environment configuration');
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

    test('should call createEnv every time invoked', async () => {
      const { safeEnv } = await import('../env');

      safeEnv();
      safeEnv();
      safeEnv();

      expect(mockCreateEnv).toHaveBeenCalledTimes(3);
    });
  });

  describe('configuration consistency', () => {
    test('should always make notifications keys optional', async () => {
      // Test production with all keys present
      process.env.NODE_ENV = 'production';
      process.env.KNOCK_SECRET_API_KEY = 'sk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'pk_live_123';
      process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'channel_live_123';

      const { safeEnv } = await import('../env');
      safeEnv();

      const call = mockCreateEnv.mock.calls[0][0];

      // Even in production with all keys present, they should be optional
      expect(call.server.KNOCK_SECRET_API_KEY.def.type).toBe('optional');
      expect(call.client.NEXT_PUBLIC_KNOCK_API_KEY.def.type).toBe('optional');
      expect(call.client.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID.def.type).toBe('optional');
    });

    test('should handle mixed environment scenarios', async () => {
      process.env.NODE_ENV = 'production';
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
      });
    });
  });
});
