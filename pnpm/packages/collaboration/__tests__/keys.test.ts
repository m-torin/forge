import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { keys } from '../keys';

describe('Collaboration Keys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns undefined when LIVEBLOCKS_SECRET is not set', () => {
    delete process.env.LIVEBLOCKS_SECRET;

    const result = keys();

    expect(result.LIVEBLOCKS_SECRET).toBeUndefined();
  });

  it('returns the correct value when LIVEBLOCKS_SECRET is set', () => {
    process.env.LIVEBLOCKS_SECRET = 'sk_test_liveblocks_key';

    const result = keys();

    expect(result.LIVEBLOCKS_SECRET).toBe('sk_test_liveblocks_key');
  });

  it('validates that LIVEBLOCKS_SECRET starts with sk_', () => {
    // This test relies on the validation in the schema
    // In a real environment, an invalid key would throw an error
    // But in the test environment, we're just checking the validation logic
    process.env.NODE_ENV = 'production'; // Ensure validation runs

    // This should work
    process.env.LIVEBLOCKS_SECRET = 'sk_test_liveblocks_key';
    expect(() => keys()).not.toThrow();

    // This would normally throw in production, but we're in a test
    // The validation is still important to test though
    process.env.LIVEBLOCKS_SECRET = 'invalid-key';
    expect(() => keys()).toThrow();

    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });
});
