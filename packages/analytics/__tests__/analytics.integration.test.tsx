import { render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

describe('Analytics Package Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('exports all expected functions and components', async () => {
    const exports = await import('../index');

    expect(exports.AnalyticsProvider).toBeDefined();
    expect(typeof exports.AnalyticsProvider).toBe('function');
  });

  it('exports server analytics', async () => {
    // Mock dependencies for server file
    vi.doMock('server-only', () => ({}));
    vi.doMock('../keys', () => ({
      keys: () => ({
        NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
        NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
      }),
    }));

    const mockPostHogNode = vi.fn();
    vi.doMock('posthog-node', () => ({
      PostHog: mockPostHogNode,
    }));

    const { analytics } = await import('../posthog/server');

    expect(analytics).toBeDefined();
    expect(mockPostHogNode).toHaveBeenCalled();
  });

  it('exports client analytics hook', async () => {
    // Mock PostHog client
    vi.doMock('posthog-js', () => ({
      default: {
        init: vi.fn(),
      },
    }));

    const mockPostHogCapture = vi.fn();
    const mockPostHogIdentify = vi.fn();

    vi.doMock('posthog-js/react', () => ({
      PostHogProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      usePostHog: () => ({
        identify: mockPostHogIdentify,
        capture: mockPostHogCapture,
      }),
    }));

    const { useAnalytics } = await import('../posthog/client');

    const { result } = renderHook(() => useAnalytics());

    expect(result.current).toBeDefined();
    expect(result.current.capture).toBeDefined();
    expect(result.current.identify).toBeDefined();
  });

  it('integrates all analytics providers with GA ID', async () => {
    // Mock keys module with GA ID
    vi.doMock('../keys', () => ({
      keys: () => ({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123',
        NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
        NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
      }),
    }));

    // Mock PostHog provider
    vi.doMock('../posthog/client', () => ({
      PostHogProvider: ({ children }: { children: ReactNode }) => (
        <div data-testid="posthog-client">{children}</div>
      ),
    }));

    // Mock third party analytics
    vi.doMock('../google', () => ({
      GoogleAnalytics: () => <div data-testid="google-analytics" />,
    }));

    vi.doMock('../vercel', () => ({
      VercelAnalytics: () => <div data-testid="vercel-analytics" />,
    }));

    const { AnalyticsProvider } = await import('../index');

    const { getByTestId } = render(
      <AnalyticsProvider>
        <div>App Content</div>
      </AnalyticsProvider>,
    );

    // Check all providers are rendered
    expect(getByTestId('posthog-client')).toBeInTheDocument();
    expect(getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(getByTestId('google-analytics')).toBeInTheDocument();
  });

  it('works with missing optional environment variables', async () => {
    // Mock keys module without GA ID
    vi.doMock('../keys', () => ({
      keys: () => ({
        NEXT_PUBLIC_GA_MEASUREMENT_ID: undefined,
        NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
        NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
      }),
    }));

    // Mock PostHog provider
    vi.doMock('../posthog/client', () => ({
      PostHogProvider: ({ children }: { children: ReactNode }) => (
        <div data-testid="posthog-client">{children}</div>
      ),
    }));

    // Mock third party analytics
    vi.doMock('../google', () => ({
      GoogleAnalytics: () => <div data-testid="google-analytics" />,
    }));

    vi.doMock('../vercel', () => ({
      VercelAnalytics: () => <div data-testid="vercel-analytics" />,
    }));

    const { AnalyticsProvider } = await import('../index');

    const { getByTestId, queryByTestId } = render(
      <AnalyticsProvider>
        <div>App</div>
      </AnalyticsProvider>,
    );

    expect(getByTestId('posthog-client')).toBeInTheDocument();
    expect(getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(queryByTestId('google-analytics')).not.toBeInTheDocument();
  });
});
