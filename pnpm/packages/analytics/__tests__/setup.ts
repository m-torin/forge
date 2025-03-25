// Import shared testing setup
import { vitest } from '@repo/testing';
import { vi } from 'vitest';

// Add package-specific setup here

// Mock the keys module to provide consistent test values
vi.mock('../keys', () => {
  return {
    keys: vi.fn().mockImplementation(() => {
      // Provide default values for testing
      return {
        NEXT_PUBLIC_POSTHOG_KEY:
          process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_test_key',
        NEXT_PUBLIC_POSTHOG_HOST:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://test.posthog.com',
        NEXT_PUBLIC_GA_MEASUREMENT_ID:
          process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-TEST123',
      };
    }),
  };
});

// Mock PostHog
vi.mock('@posthog/node', () => {
  return {
    PostHog: vi.fn().mockImplementation(() => ({
      capture: vi.fn(),
      identify: vi.fn(),
    })),
  };
});
