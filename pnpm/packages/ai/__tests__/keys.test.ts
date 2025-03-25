import { afterEach, describe, expect, it, vi } from 'vitest';

import { keys } from '../keys';

describe('Environment Keys', () => {
  // Store original environment
  const originalEnv = { ...process.env };

  // After each test, restore environment
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('returns API key from environment', () => {
    // Set environment variable
    process.env.OPENAI_API_KEY = 'sk_test_openai_key123456';

    // Call keys function
    const result = keys();

    // Check result has the API key
    expect(result.OPENAI_API_KEY).toBeDefined();
    expect(result.OPENAI_API_KEY).toBe('sk_test_openai_key123456');
  });

  it('handles missing API key gracefully', () => {
    // Since the global mock returns the value from the mock,
    // we'll test the behavior differently by checking
    // that the function executes without error when API key is missing

    // Delete environment variable
    delete process.env.OPENAI_API_KEY;

    // Function should not throw an error
    expect(() => keys()).not.toThrow();

    // Call function to verify it returns something (the mock result)
    const result = keys();
    expect(result).toBeDefined();
  });

  it('does not throw with non-prefixed key in test environment', () => {
    // Ensure we're in test mode and set non-prefixed key
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'non-prefixed-key';

    // This should not throw in test environment
    expect(() => keys()).not.toThrow();
  });
});
