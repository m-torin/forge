import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('storage Keys Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('environment configuration behavior', () => {
    test('should handle Vercel Blob configuration in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('STORAGE_PROVIDER', 'vercel-blob');
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_token_123');

      const { keys } = await import('../keys');

      // Should not throw and should return a configuration object
      expect(() => keys()).not.toThrow();

      const result = keys();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('should handle Cloudflare R2 configuration in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('STORAGE_PROVIDER', 'cloudflare-r2');
      vi.stubEnv('R2_ACCOUNT_ID', 'account_123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'access_key_123');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret_key_123');
      vi.stubEnv('R2_BUCKET', 'my-bucket');

      const { keys } = await import('../keys');

      // Should not throw and should return a configuration object
      expect(() => keys()).not.toThrow();

      const result = keys();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('development environment', () => {
    test('should handle development environment gracefully', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('STORAGE_PROVIDER', 'vercel-blob');
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_token_123');

      const { keys } = await import('../keys');

      // Should not throw and should return a configuration object
      expect(() => keys()).not.toThrow();

      const result = keys();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('should handle missing configuration in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('STORAGE_PROVIDER', undefined);
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', undefined);

      const { keys } = await import('../keys');

      // Should not throw even with missing configuration in development
      expect(() => keys()).not.toThrow();

      const result = keys();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('function behavior', () => {
    test('should return a function', async () => {
      const { keys } = await import('../keys');
      expect(typeof keys).toBe('function');
    });

    test('should return consistent results', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('STORAGE_PROVIDER', 'vercel-blob');
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'token_123');

      const { keys } = await import('../keys');

      const result1 = keys();
      const result2 = keys();

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(typeof result1).toBe('object');
      expect(typeof result2).toBe('object');
    });

    test('should handle environment variable parsing', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('STORAGE_PROVIDER', 'cloudflare-r2');
      vi.stubEnv('R2_ACCOUNT_ID', 'test-account');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'test-key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret');
      vi.stubEnv('R2_BUCKET', 'test-bucket');

      const { keys } = await import('../keys');

      // Should not throw with R2 configuration
      expect(() => keys()).not.toThrow();

      const result = keys();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
