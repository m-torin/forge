import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('payment Environment Configuration', () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalEnv = Object.assign({}, process.env);
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

    test('should provide valid Stripe keys in production', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBe('sk_live_123456789');
      expect(result.STRIPE_WEBHOOK_SECRET).toBe('whsec_123456789');
      expect(result.NODE_ENV).toBe('production');
      expect(result.VERCEL).toBe('1');
    });

    test('should have helper functions work correctly', async () => {
      const { isProduction, hasStripeConfig } = await import('../env');

      expect(isProduction()).toBeTruthy();
      expect(hasStripeConfig()).toBeTruthy();
    });
  });

  describe('development environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should provide keys in development when available', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123456789');
      expect(result.STRIPE_WEBHOOK_SECRET).toBe('whsec_123456789');
      expect(result.NODE_ENV).toBe('development');
    });

    test('should handle missing keys in development', async () => {
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBeUndefined();
      expect(result.STRIPE_WEBHOOK_SECRET).toBeUndefined();
    });

    test('should have correct helper function results', async () => {
      const { isProduction, isBuild, hasStripeConfig } = await import('../env');

      expect(isProduction()).toBeFalsy();
      expect(isBuild()).toBeFalsy();
      expect(hasStripeConfig()).toBeTruthy();
    });
  });

  describe('production with missing required env vars', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      // Missing required env vars
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;
    });

    test('should handle missing keys in production gracefully', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBeUndefined();
      expect(result.STRIPE_WEBHOOK_SECRET).toBeUndefined();
      expect(result.NODE_ENV).toBe('production');
    });

    test('should have correct helper function results with missing keys', async () => {
      const { isProduction, hasStripeConfig } = await import('../env');

      expect(isProduction()).toBeTruthy();
      expect(hasStripeConfig()).toBeFalsy();
    });
  });

  describe('key format validation', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should accept valid secret key format', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123456789');
    });

    test('should accept valid webhook secret format', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_WEBHOOK_SECRET).toBe('whsec_123456789');
    });
  });

  describe('runtime environment mapping', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should map environment variables correctly', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123456789');
      expect(result.STRIPE_WEBHOOK_SECRET).toBe('whsec_123456789');
      expect(result.NODE_ENV).toBe('development');
    });

    test('should handle undefined environment variables', async () => {
      process.env.STRIPE_SECRET_KEY = undefined;
      process.env.STRIPE_WEBHOOK_SECRET = undefined;

      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result.STRIPE_SECRET_KEY).toBeUndefined();
      expect(result.STRIPE_WEBHOOK_SECRET).toBeUndefined();
    });
  });

  describe('build environment detection', () => {
    test('should detect build environment correctly', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.VERCEL = undefined; // Simulate local build
      process.env.STRIPE_SECRET_KEY = 'sk_live_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

      const { isBuild } = await import('../env');
      expect(isBuild()).toBeTruthy();
    });

    test('should detect production deployment correctly', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.VERCEL = '1';
      process.env.STRIPE_SECRET_KEY = 'sk_live_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

      const { isBuild } = await import('../env');
      expect(isBuild()).toBeFalsy();
    });

    test('should detect development environment correctly', async () => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

      const { isProduction, isBuild } = await import('../env');
      expect(isProduction()).toBeFalsy();
      expect(isBuild()).toBeFalsy();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should handle environment errors gracefully', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      // Should always return a result, even if env failed to load
      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe('production');
    });
  });

  describe('function behavior', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789';
    });

    test('should return a function', async () => {
      const { safeEnv } = await import('../env');
      expect(typeof safeEnv).toBe('function');
    });

    test('should return consistent results', async () => {
      const { safeEnv } = await import('../env');
      const result1 = safeEnv();
      const result2 = safeEnv();

      expect(result1.STRIPE_SECRET_KEY).toBe(result2.STRIPE_SECRET_KEY);
      expect(result1.NODE_ENV).toBe(result2.NODE_ENV);
    });

    test('should include all expected properties', async () => {
      const { safeEnv } = await import('../env');
      const result = safeEnv();

      expect(result).toHaveProperty('STRIPE_SECRET_KEY');
      expect(result).toHaveProperty('STRIPE_WEBHOOK_SECRET');
      expect(result).toHaveProperty('NODE_ENV');
      expect(result).toHaveProperty('VERCEL');
      expect(result).toHaveProperty('PAYMENTS_LOG_PROVIDER');
    });
  });
});
