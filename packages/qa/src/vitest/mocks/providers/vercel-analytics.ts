import { vi } from 'vitest';

// Mock Vercel Analytics
export const createMockVercelAnalytics = () => {
  const mockTrack = vi.fn();
  const mockAnalytics = vi.fn();

  // Mock analytics tracking
  const mockAnalyticsInstance = {
    track: mockTrack,
    identify: vi.fn(),
    page: vi.fn(),
    reset: vi.fn(),
    group: vi.fn(),
    alias: vi.fn(),
    ready: vi.fn(),
    debug: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  return {
    Analytics: mockAnalytics,
    track: mockTrack,
    analyticsInstance: mockAnalyticsInstance,
  };
};

// Create test scenarios for different analytics states
export const createVercelAnalyticsScenarios = () => {
  const baseMock = createMockVercelAnalytics();

  return {
    // Standard tracking
    standard: {
      ...baseMock,
      track: vi.fn().mockResolvedValue(undefined),
    },

    // Tracking with errors
    error: {
      ...baseMock,
      track: vi.fn().mockRejectedValue(new Error('Analytics tracking failed')),
    },

    // Disabled analytics
    disabled: {
      ...baseMock,
      track: vi.fn().mockImplementation(() => {
        console.warn('Analytics tracking is disabled');
      }),
    },

    // Custom tracking response
    custom: (response: any) => ({
      ...baseMock,
      track: vi.fn().mockResolvedValue(response),
    }),
  };
};

// Export the main mock instance
export const mockVercelAnalytics = createMockVercelAnalytics();

// Setup function for automatic mocking
export const setupVercelAnalyticsMocks = () => {
  const mock = createMockVercelAnalytics();

  // Mock @vercel/analytics
  vi.doMock('@vercel/analytics', () => mock);

  // Mock @vercel/analytics/react
  vi.doMock('@vercel/analytics/react', () => ({
    ...mock,
    Analytics: mock.Analytics,
  }));

  return mock;
};

// Reset function
export const resetVercelAnalyticsMocks = (mocks: ReturnType<typeof setupVercelAnalyticsMocks>) => {
  vi.clearAllMocks();

  // Reset to default behavior
  mocks.track.mockResolvedValue(undefined);
  mocks.Analytics.mockImplementation(() => null);
};

// Mock the @vercel/analytics module for automatic Vitest usage
vi.mock('@vercel/analytics', () => createMockVercelAnalytics());
vi.mock('@vercel/analytics/react', () => ({
  ...createMockVercelAnalytics(),
  Analytics: createMockVercelAnalytics().Analytics,
}));
