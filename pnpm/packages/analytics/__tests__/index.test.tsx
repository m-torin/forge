import { render, screen } from '@repo/testing/vitest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AnalyticsProvider } from '../index';
import { keys } from '../keys';

// Mock the dependencies
vi.mock('../keys', () => ({
  keys: vi.fn().mockReturnValue({
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123',
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://test.posthog.com',
  }),
}));

vi.mock('../google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}));

vi.mock('../vercel', () => ({
  VercelAnalytics: () => <div data-testid="vercel-analytics" />,
}));

vi.mock('../posthog/client', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posthog-provider">{children}</div>
  ),
}));

describe.skip('AnalyticsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <AnalyticsProvider>
        <div data-testid="test-child">Test Child</div>
      </AnalyticsProvider>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders PostHogProvider', () => {
    render(
      <AnalyticsProvider>
        <div>Test Child</div>
      </AnalyticsProvider>,
    );

    expect(screen.getByTestId('posthog-provider')).toBeInTheDocument();
  });

  it('renders VercelAnalytics', () => {
    render(
      <AnalyticsProvider>
        <div>Test Child</div>
      </AnalyticsProvider>,
    );

    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
  });

  it('renders GoogleAnalytics when GA ID is provided', () => {
    render(
      <AnalyticsProvider>
        <div>Test Child</div>
      </AnalyticsProvider>,
    );

    expect(screen.getByTestId('google-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('google-analytics')).toHaveAttribute(
      'data-ga-id',
      'G-TEST123',
    );
  });

  it('does not render GoogleAnalytics when GA ID is not provided', () => {
    // Mock keys to return no GA ID
    (keys as any).mockReturnValueOnce({
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://test.posthog.com',
    });

    render(
      <AnalyticsProvider>
        <div>Test Child</div>
      </AnalyticsProvider>,
    );

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
  });
});
