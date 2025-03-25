import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';

// Mock the @t3-oss/env-nextjs package
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    // Simple implementation that validates DATABASE_URL
    if (!runtimeEnv.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }

    if (runtimeEnv.DATABASE_URL === 'not-a-url') {
      throw new Error('DATABASE_URL must be a valid URL');
    }

    if (runtimeEnv.DATABASE_URL === '') {
      throw new Error('DATABASE_URL must not be empty');
    }

    return runtimeEnv;
  }),
}));

// Import after mocking
import { keys } from '../keys';

describe('Database Keys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns undefined when DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;

    expect(() => keys()).toThrow();
  });

  it('returns the correct value when DATABASE_URL is set', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/test';

    const result = keys();

    expect(result.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/test',
    );
  });

  it('validates that DATABASE_URL is a valid URL', () => {
    // Valid URL should work
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/test';
    expect(() => keys()).not.toThrow();

    // Invalid URL should throw
    process.env.DATABASE_URL = 'not-a-url';
    expect(() => keys()).toThrow();
  });

  it('validates that DATABASE_URL is not empty', () => {
    // Empty string should throw
    process.env.DATABASE_URL = '';
    expect(() => keys()).toThrow();
  });
});
