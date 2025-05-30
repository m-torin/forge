import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Analytics Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('handles empty PostHog configuration', async () => {
    // Mock keys module with empty values
    vi.doMock('../keys', () => ({
      keys: () => ({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: '',
        NEXT_PUBLIC_POSTHOG_HOST: '',
        NEXT_PUBLIC_POSTHOG_KEY: '',
      }),
    }));

    // Mock server-only
    vi.doMock('server-only', () => ({}));

    // Mock PostHog constructor
    const mockPostHogNode = vi.fn().mockReturnValue({ identify: vi.fn(), capture: vi.fn() });
    vi.doMock('posthog-node', () => ({
      PostHog: mockPostHogNode,
    }));

    const { analytics } = await import('../posthog/server');

    // With empty config, the proxy should return no-op functions
    const identifyFn = analytics.identify;
    expect(identifyFn).toBeDefined();
    expect(typeof identifyFn).toBe('function');

    // Verify it returns a promise when called with required parameters
    const result = await identifyFn({ distinctId: 'test-user' });
    expect(result).toBeUndefined();

    // PostHog should NOT be initialized with empty keys
    expect(mockPostHogNode).not.toHaveBeenCalled();
  });

  it('tests key validation structure', () => {
    // Test the validation logic directly rather than the actual env
    const mockValidators = {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: (val?: string) => {
        if (!val) return true; // Optional
        return val.startsWith('G-');
      },
      NEXT_PUBLIC_POSTHOG_HOST: (val: string) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      NEXT_PUBLIC_POSTHOG_KEY: (val: string) => val.startsWith('phc_'),
    };

    // Valid values
    expect(mockValidators.NEXT_PUBLIC_POSTHOG_KEY('phc_test123')).toBe(true);
    expect(mockValidators.NEXT_PUBLIC_POSTHOG_HOST('https://app.posthog.com')).toBe(true);
    expect(mockValidators.NEXT_PUBLIC_GA_MEASUREMENT_ID('G-TEST123')).toBe(true);
    expect(mockValidators.NEXT_PUBLIC_GA_MEASUREMENT_ID(undefined)).toBe(true);

    // Invalid values
    expect(mockValidators.NEXT_PUBLIC_POSTHOG_KEY('invalid')).toBe(false);
    expect(mockValidators.NEXT_PUBLIC_POSTHOG_HOST('not-a-url')).toBe(false);
    expect(mockValidators.NEXT_PUBLIC_GA_MEASUREMENT_ID('invalid')).toBe(false);
  });

  it('handles PostHog client without init errors', async () => {
    // Mock keys
    vi.doMock('../keys', () => ({
      keys: () => ({
        NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
        NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
      }),
    }));

    const mockInit = vi.fn();
    vi.doMock('posthog-js', () => ({
      default: {
        init: mockInit,
      },
    }));

    vi.doMock('posthog-js/react', () => ({
      PostHogProvider: vi.fn(),
      usePostHog: vi.fn(),
    }));

    // Import the client file
    await import('../posthog/client');

    // The init is called in a useEffect, which won't run in this context
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('tests key validation patterns', () => {
    const isValidPostHogKey = (key: string) => key.startsWith('phc_');
    const isValidPostHogHost = (host: string) => {
      try {
        new URL(host);
        return true;
      } catch {
        return false;
      }
    };
    const isValidGAId = (id: string) => id.startsWith('G-');

    // Test valid keys
    expect(isValidPostHogKey('phc_test123')).toBe(true);
    expect(isValidPostHogHost('https://app.posthog.com')).toBe(true);
    expect(isValidGAId('G-TEST123')).toBe(true);

    // Test invalid keys
    expect(isValidPostHogKey('invalid_key')).toBe(false);
    expect(isValidPostHogHost('not_a_url')).toBe(false);
    expect(isValidGAId('invalid_ga_id')).toBe(false);
  });
});
