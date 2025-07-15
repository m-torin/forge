import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('safeEnv', () => {
  const originalEnv = process.env;
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    process.env = { ...originalEnv };
    consoleErrorSpy.mockClear();
    // Clear module cache to allow re-evaluation
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  test('should return keys when ARCJET_KEY is set', async () => {
    process.env.ARCJET_KEY = 'ajkey_test_12345';

    const { safeEnv } = await import('../env');
    const result = safeEnv();

    expect(result.ARCJET_KEY).toBe('ajkey_test_12345');
  });

  test('should return undefined when ARCJET_KEY is not set', async () => {
    delete process.env.ARCJET_KEY;

    const { safeEnv } = await import('../env');
    const result = safeEnv();

    expect(result.ARCJET_KEY).toBeUndefined();
  });

  test('should return fallback values when environment validation fails', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ARCJET_KEY = 'invalid_key';

    const { safeEnv } = await import('../env');
    const result = safeEnv();
    expect(result.ARCJET_KEY).toBe('invalid_key'); // safeEnv returns what's available
  });

  test('should handle missing ARCJET_KEY gracefully', async () => {
    delete process.env.ARCJET_KEY;

    const { safeEnv } = await import('../env');
    const result = safeEnv();
    expect(result.ARCJET_KEY).toBeUndefined();
  });

  test('should allow empty ARCJET_KEY in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ARCJET_KEY = '';

    const { safeEnv } = await import('../env');
    expect(() => safeEnv()).not.toThrow();
  });

  test('should accept valid ARCJET_KEY format', async () => {
    process.env.ARCJET_KEY = 'ajkey_valid_api_key_12345';

    const { safeEnv } = await import('../env');
    expect(() => safeEnv()).not.toThrow();
  });
});
