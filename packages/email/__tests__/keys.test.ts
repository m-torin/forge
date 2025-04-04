import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { keys } from '../keys';

describe('Email Keys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns the correct values when environment variables are set', () => {
    process.env.RESEND_FROM = 'test@example.com';
    process.env.RESEND_TOKEN = 're_test_token';

    const result = keys();

    expect(result.RESEND_FROM).toBe('test@example.com');
    expect(result.RESEND_TOKEN).toBe('re_test_token');
  });

  it('validates that RESEND_FROM is a valid email', () => {
    // Valid email should work
    process.env.RESEND_FROM = 'test@example.com';
    process.env.RESEND_TOKEN = 're_test_token';
    expect(() => keys()).not.toThrow();

    // Invalid email should throw
    process.env.RESEND_FROM = 'not-an-email';
    expect(() => keys()).toThrow();
  });

  it('validates that RESEND_TOKEN starts with "re_"', () => {
    // Valid token should work
    process.env.RESEND_FROM = 'test@example.com';
    process.env.RESEND_TOKEN = 're_test_token';
    expect(() => keys()).not.toThrow();

    // Invalid token should throw
    process.env.RESEND_TOKEN = 'invalid_token';
    expect(() => keys()).toThrow();
  });

  it('validates that RESEND_FROM is not empty', () => {
    // Empty email should throw
    process.env.RESEND_FROM = '';
    process.env.RESEND_TOKEN = 're_test_token';
    expect(() => keys()).toThrow();
  });

  it('validates that RESEND_TOKEN is not empty', () => {
    // Empty token should throw
    process.env.RESEND_FROM = 'test@example.com';
    process.env.RESEND_TOKEN = '';
    expect(() => keys()).toThrow();
  });
});
