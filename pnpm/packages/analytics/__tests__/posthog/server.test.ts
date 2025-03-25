import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PostHog } from 'posthog-node';

// Mock posthog-node
vi.mock('posthog-node', () => {
  return {
    PostHog: vi.fn().mockImplementation((key, options) => {
      return {
        key,
        options,
        capture: vi.fn(),
        identify: vi.fn(),
      };
    }),
  };
});

// Mock keys
vi.mock('../../keys', () => ({
  keys: vi.fn().mockReturnValue({
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://test.posthog.com',
  }),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

describe('PostHog Server Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes PostHog with correct configuration', async () => {
    // Import the module to trigger initialization
    const { analytics } = await import('../../posthog/server');

    // Check that PostHog constructor was called with correct arguments
    expect(PostHog).toHaveBeenCalledTimes(1);
    expect(PostHog).toHaveBeenCalledWith('phc_test123', {
      host: 'https://test.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    });
  });

  it('exports the analytics instance', async () => {
    const { analytics } = await import('../../posthog/server');

    // Check that analytics is defined
    expect(analytics).toBeDefined();

    // Check that it has the expected methods
    expect(analytics.capture).toBeDefined();
    expect(analytics.identify).toBeDefined();
  });
});
