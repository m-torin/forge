import { render, screen } from '@repo/testing/vitest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PostHogProvider } from '../../posthog/client';

// Mock posthog-js
vi.mock('posthog-js', () => {
  const mockPostHog = {
    init: vi.fn(),
  };
  return {
    default: mockPostHog,
  };
});

// Mock posthog-js/react
vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posthog-provider-raw">{children}</div>
  ),
  usePostHog: vi.fn(),
}));

// Mock keys
vi.mock('../../keys', () => ({
  keys: vi.fn().mockReturnValue({
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://test.posthog.com',
  }),
}));

describe.skip('PostHogProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <PostHogProvider>
        <div data-testid="test-child">Test Child</div>
      </PostHogProvider>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders the raw PostHogProvider', () => {
    render(
      <PostHogProvider>
        <div>Test Child</div>
      </PostHogProvider>,
    );

    expect(screen.getByTestId('posthog-provider-raw')).toBeInTheDocument();
  });

  it('initializes PostHog with correct configuration', async () => {
    const posthogModule = await import('posthog-js');
    const posthog = posthogModule.default;

    render(
      <PostHogProvider>
        <div>Test Child</div>
      </PostHogProvider>,
    );

    // Check that posthog.init was called
    expect(posthog.init).toHaveBeenCalledTimes(1);

    // Check that it was called with the correct arguments
    expect(posthog.init).toHaveBeenCalledWith('phc_test123', {
      api_host: '/ingest',
      ui_host: 'https://test.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
    });
  });
});
