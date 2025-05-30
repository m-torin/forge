import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock PostHog constructor
const mockPostHog = vi.fn();
vi.mock('posthog-node', () => ({
  PostHog: mockPostHog,
}));

// Mock keys
vi.mock('../../keys', () => ({
  keys: () => ({
    NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
  }),
}));

describe('posthog/server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('creates PostHog instance with correct configuration on first use', async () => {
    const mockInstance = {
      identify: vi.fn(),
      alias: vi.fn(),
      capture: vi.fn(),
      shutdown: vi.fn(),
    };
    mockPostHog.mockReturnValue(mockInstance);

    const { analytics } = await import('../../posthog/server');

    // Access a property to trigger initialization
    expect(analytics.identify).toBeDefined();

    expect(mockPostHog).toHaveBeenCalledWith('phc_test123', {
      flushAt: 1,
      flushInterval: 0,
      host: 'https://app.posthog.com',
    });
  });

  it('configures for serverless environment', async () => {
    const mockInstance = { identify: vi.fn() };
    mockPostHog.mockReturnValue(mockInstance);

    const { analytics } = await import('../../posthog/server');

    // Access a property to trigger initialization
    expect(analytics.identify).toBeDefined();

    const config = mockPostHog.mock.calls[0][1];
    expect(config.flushAt).toBe(1);
    expect(config.flushInterval).toBe(0);
  });

  it('exports analytics proxy that provides PostHog methods', async () => {
    const mockInstance = {
      identify: vi.fn(),
      alias: vi.fn(),
      capture: vi.fn(),
      shutdown: vi.fn(),
    };
    mockPostHog.mockReturnValue(mockInstance);

    const { analytics } = await import('../../posthog/server');

    expect(analytics.identify).toBe(mockInstance.identify);
    expect(analytics.capture).toBe(mockInstance.capture);
  });
});
