import { beforeEach, describe, expect, it, vi } from 'vitest';

import { keys } from '../keys';

describe('keys', () => {
  const originalEnv = process.env;
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    process.env = { ...originalEnv };
    consoleErrorSpy.mockClear();
  });

  beforeEach(() => {
    // Use beforeEach instead of afterEach to ensure vitest types can recognize it
    process.env = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  it('should return keys when ARCJET_KEY is set', () => {
    process.env.ARCJET_KEY = 'ajkey_test_12345';

    const result = keys();

    expect(result.ARCJET_KEY).toBe('ajkey_test_12345');
  });

  it('should return undefined when ARCJET_KEY is not set', () => {
    delete process.env.ARCJET_KEY;

    const result = keys();

    expect(result.ARCJET_KEY).toBeUndefined();
  });

  it('should validate that ARCJET_KEY starts with ajkey_ in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.ARCJET_KEY = 'invalid_key';

    expect(() => keys()).toThrow();
  });

  it('should validate that ARCJET_KEY has minimum length in production when set', () => {
    process.env.NODE_ENV = 'production';
    process.env.ARCJET_KEY = 'ajkey'; // Set but missing underscore and content

    expect(() => keys()).toThrow();
  });

  it('should allow empty ARCJET_KEY in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.ARCJET_KEY = '';

    expect(() => keys()).not.toThrow();
  });

  it('should accept valid ARCJET_KEY format', () => {
    process.env.ARCJET_KEY = 'ajkey_valid_api_key_12345';

    expect(() => keys()).not.toThrow();
  });
});
