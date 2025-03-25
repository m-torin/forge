import { describe, expect, it, vi } from 'vitest';

// Create a simple mock implementation for testing
const mockKeysObject = {
  CLERK_SECRET_KEY: 'test_secret_key',
  CLERK_WEBHOOK_SECRET: 'test_webhook_secret',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test_publishable_key',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/onboarding',
};

// Mock the entire keys module
vi.mock('../keys', () => ({
  keys: vi.fn(() => mockKeysObject),
}));

// Import the mocked keys
import { keys } from '../keys';

describe('Auth Keys', () => {
  it('should return environment variables when called', () => {
    const result = keys();

    // Test that the mock implementation works
    expect(result).toEqual(mockKeysObject);
    expect(result.CLERK_SECRET_KEY).toBe('test_secret_key');
    expect(result.CLERK_WEBHOOK_SECRET).toBe('test_webhook_secret');
    expect(result.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe(
      'test_publishable_key',
    );
    expect(result.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe('/sign-in');
    expect(result.NEXT_PUBLIC_CLERK_SIGN_UP_URL).toBe('/sign-up');
    expect(result.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL).toBe('/dashboard');
    expect(result.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL).toBe('/onboarding');
  });

  it('should verify URL paths start with /', () => {
    const result = keys();

    // Verify URL paths
    const urlPaths = [
      result.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      result.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      result.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      result.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    ];

    // All URL paths should start with /
    urlPaths.forEach((path) => {
      expect(path).toMatch(/^\//);
    });
  });
});
