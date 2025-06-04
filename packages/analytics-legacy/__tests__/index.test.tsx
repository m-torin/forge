import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

describe('AnalyticsProvider', () => {
  it('renders all analytics providers when GA ID is provided', async () => {
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
        <div data-testid="posthog-provider">{children}</div>
      ),
    }));

    // Mock Google Analytics
    vi.doMock('../google', () => ({
      GoogleAnalytics: ({ gaId }: { gaId: string }) => (
        <div data-ga-id={gaId} data-testid="google-analytics" />
      ),
    }));

    // Mock Vercel Analytics
    vi.doMock('../vercel', () => ({
      VercelAnalytics: () => <div data-testid="vercel-analytics" />,
    }));

    const { AnalyticsProvider } = await import('../index');

    const { getByTestId, getByText } = render(
      <AnalyticsProvider>
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    expect(getByTestId('posthog-provider')).toBeInTheDocument();
    expect(getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(getByTestId('google-analytics')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();

    vi.resetModules();
  });

  it('passes GA measurement ID to GoogleAnalytics', async () => {
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
        <div data-testid="posthog-provider">{children}</div>
      ),
    }));

    // Mock Google Analytics
    vi.doMock('../google', () => ({
      GoogleAnalytics: ({ gaId }: { gaId: string }) => (
        <div data-ga-id={gaId} data-testid="google-analytics" />
      ),
    }));

    // Mock Vercel Analytics
    vi.doMock('../vercel', () => ({
      VercelAnalytics: () => <div data-testid="vercel-analytics" />,
    }));

    const { AnalyticsProvider } = await import('../index');

    const { getByTestId } = render(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    const gaElement = getByTestId('google-analytics');
    expect(gaElement).toHaveAttribute('data-ga-id', 'G-TEST123');

    vi.resetModules();
  });

  it('only renders PostHog and Vercel when GA ID is not provided', async () => {
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
        <div data-testid="posthog-provider">{children}</div>
      ),
    }));

    // Mock Google Analytics
    vi.doMock('../google', () => ({
      GoogleAnalytics: ({ gaId }: { gaId: string }) => (
        <div data-ga-id={gaId} data-testid="google-analytics" />
      ),
    }));

    // Mock Vercel Analytics
    vi.doMock('../vercel', () => ({
      VercelAnalytics: () => <div data-testid="vercel-analytics" />,
    }));

    const { AnalyticsProvider } = await import('../index');

    const { getByTestId, queryByTestId } = render(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    expect(getByTestId('posthog-provider')).toBeInTheDocument();
    expect(getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(queryByTestId('google-analytics')).not.toBeInTheDocument();

    vi.resetModules();
  });
});
