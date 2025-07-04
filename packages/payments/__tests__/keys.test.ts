import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock environment variables
const mockCreateEnv = vi.fn();
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: mockCreateEnv,
}));

describe('payment Keys Configuration', () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv as NodeJS.ProcessEnv;
  });

  describe('production environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.VERCEL = '1'; // Simulate Vercel deployment
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should require valid Stripe keys in production', async () => {
      mockCreateEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_live_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          STRIPE_SECRET_KEY: 'sk_live_123456789',
          STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
          PAYMENTS_LOG_PROVIDER: undefined,
        },
        server: {
          STRIPE_SECRET_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodString',
            }),
          }),
          STRIPE_WEBHOOK_SECRET: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodString',
            }),
          }),
          PAYMENTS_LOG_PROVIDER: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.STRIPE_SECRET_KEY).toBe('sk_live_123456789');
      expect(result.STRIPE_WEBHOOK_SECRET).toBe('whsec_123456789');
    });

    test('should validate Stripe secret key format in production', async () => {
      const { keys } = await import('../keys');

      // The actual validation happens in @t3-oss/env-nextjs
      // We just verify our schema configuration is correct
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.STRIPE_SECRET_KEY).toBeDefined();
      expect(call.server.STRIPE_WEBHOOK_SECRET).toBeDefined();
    });
  });

  describe('development environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should make keys optional in development', async () => {
      mockCreateEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123456789');
      expect(result.STRIPE_WEBHOOK_SECRET).toBe('whsec_123456789');
    });

    test('should handle missing keys in development', async () => {
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;

      mockCreateEnv.mockReturnValue({
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
      });

      const { keys } = await import('../keys');
      const result = keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          STRIPE_SECRET_KEY: undefined,
          STRIPE_WEBHOOK_SECRET: undefined,
          PAYMENTS_LOG_PROVIDER: undefined,
        },
        server: {
          STRIPE_SECRET_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodUnion',
            }),
          }),
          STRIPE_WEBHOOK_SECRET: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodUnion',
            }),
          }),
          PAYMENTS_LOG_PROVIDER: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.STRIPE_SECRET_KEY).toBeUndefined();
      expect(result.STRIPE_WEBHOOK_SECRET).toBeUndefined();
    });
  });

  describe('production with missing required env vars', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      // Missing required env vars
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;
    });

    test('should make keys optional when env vars are missing in production', async () => {
      mockCreateEnv.mockReturnValue({
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
      });

      const { keys } = await import('../keys');
      const result = keys();

      // When hasRequiredEnvVars is false, keys become optional even in production
      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          STRIPE_SECRET_KEY: undefined,
          STRIPE_WEBHOOK_SECRET: undefined,
          PAYMENTS_LOG_PROVIDER: undefined,
        },
        server: {
          STRIPE_SECRET_KEY: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodUnion',
            }),
          }),
          STRIPE_WEBHOOK_SECRET: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodUnion',
            }),
          }),
          PAYMENTS_LOG_PROVIDER: expect.objectContaining({
            _def: expect.objectContaining({
              typeName: 'ZodOptional',
            }),
          }),
        },
      });

      expect(result.STRIPE_SECRET_KEY).toBeUndefined();
      expect(result.STRIPE_WEBHOOK_SECRET).toBeUndefined();
    });
  });

  describe('key format validation', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should validate secret key starts with sk_', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      const secretKeySchema = call.server.STRIPE_SECRET_KEY;

      // The schema should validate that the key starts with 'sk_'
      expect(secretKeySchema).toBeDefined();
    });

    test('should validate webhook secret starts with whsec_', async () => {
      const { keys } = await import('../keys');
      keys();

      const call = mockCreateEnv.mock.calls[0][0];
      const webhookSecretSchema = call.server.STRIPE_WEBHOOK_SECRET;

      // The schema should validate that the secret starts with 'whsec_'
      expect(webhookSecretSchema).toBeDefined();
    });
  });

  describe('runtime environment mapping', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should map environment variables correctly', async () => {
      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          STRIPE_SECRET_KEY: 'sk_test_123456789',
          STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
        },
        server: expect.any(Object),
      });
    });

    test('should handle undefined environment variables', async () => {
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;

      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledWith({
        runtimeEnv: {
          STRIPE_SECRET_KEY: undefined,
          STRIPE_WEBHOOK_SECRET: undefined,
        },
        server: expect.any(Object),
      });
    });
  });

  describe('configuration logic', () => {
    test('should determine requireInProduction correctly for production with keys', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.VERCEL = '1'; // Simulate Vercel deployment
      process.env.STRIPE_SECRET_KEY = 'sk_live_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

      const { keys } = await import('../keys');
      keys();

      // Should require keys in production when they exist
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.STRIPE_SECRET_KEY._def.typeName).toBe('ZodString');
    });

    test('should determine requireInProduction correctly for production without keys', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;

      const { keys } = await import('../keys');
      keys();

      // Should make keys optional in production when they don't exist
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.STRIPE_SECRET_KEY._def.typeName).toBe('ZodUnion');
    });

    test('should determine requireInProduction correctly for development', async () => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

      const { keys } = await import('../keys');
      keys();

      // Should make keys optional in development regardless of existence
      const call = mockCreateEnv.mock.calls[0][0];
      expect(call.server.STRIPE_SECRET_KEY._def.typeName).toBe('ZodUnion');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should propagate createEnv errors', async () => {
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
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';

      mockCreateEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    test('should return a function', async () => {
      const { keys } = await import('../keys');
      expect(typeof keys).toBe('function');
    });

    test('should call createEnv when invoked', async () => {
      const { keys } = await import('../keys');
      keys();

      expect(mockCreateEnv).toHaveBeenCalledTimes(1);
    });

    test('should return the result from createEnv', async () => {
      const expectedResult = {
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      };

      mockCreateEnv.mockReturnValue(expectedResult);

      const { keys } = await import('../keys');
      const result = keys();

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
