import { render, waitFor } from '@testing-library/react';
import posthog from 'posthog-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

// Mock posthog-js
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
  },
}));

// Mock posthog-js/react
vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children, client }: { client: any; children: ReactNode }) => (
    <div data-testid="posthog-provider" data-client={client}>
      {children}
    </div>
  ),
  usePostHog: vi.fn(() => ({ capture: vi.fn() })),
}));

// Mock keys
vi.mock('../../keys', () => ({
  keys: () => ({
    NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
  }),
}));

describe('PostHogProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes PostHog on mount', async () => {
    const { PostHogProvider } = await import('../../posthog/client');

    render(
      <PostHogProvider>
        <div>Test Content</div>
      </PostHogProvider>,
    );

    await waitFor(() => {
      expect(posthog.init).toHaveBeenCalledWith('phc_test123', {
        api_host: '/ingest',
        capture_pageleave: true,
        capture_pageview: false,
        person_profiles: 'identified_only',
        ui_host: 'https://app.posthog.com',
      });
    });
  });

  it('renders children correctly', async () => {
    const { PostHogProvider } = await import('../../posthog/client');

    const { getByText } = render(
      <PostHogProvider>
        <div>Test Content</div>
      </PostHogProvider>,
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('passes posthog client to PostHogProviderRaw', async () => {
    const { PostHogProvider } = await import('../../posthog/client');

    const { getByTestId } = render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>,
    );

    const provider = getByTestId('posthog-provider');
    expect(provider).toHaveAttribute('data-client', String(posthog));
  });

  it('only initializes once on multiple renders', async () => {
    const { PostHogProvider } = await import('../../posthog/client');

    const { rerender } = render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>,
    );

    rerender(
      <PostHogProvider>
        <div>Updated Test</div>
      </PostHogProvider>,
    );

    await waitFor(() => {
      expect(posthog.init).toHaveBeenCalledTimes(1);
    });
  });

  it('exports useAnalytics as alias for usePostHog', async () => {
    const { useAnalytics } = await import('../../posthog/client');
    const { usePostHog } = await import('posthog-js/react');

    expect(useAnalytics).toBe(usePostHog);
  });
});
