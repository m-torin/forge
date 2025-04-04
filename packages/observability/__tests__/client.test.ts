import { describe, expect, it, vi, beforeEach } from 'vitest';
import { initializeSentry } from '../client';
import { init, replayIntegration } from '@sentry/nextjs';
import { keys } from '../keys';

// Import the mocked modules
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn().mockReturnValue({}),
  replayIntegration: vi.fn(),
}));

vi.mock('../keys');

describe('Sentry Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock keys to return test values
    (keys as any).mockReturnValue({
      NEXT_PUBLIC_SENTRY_DSN: 'https://test-sentry-dsn.ingest.sentry.io/test',
    });

    // Mock replayIntegration to return a mock integration
    (replayIntegration as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      name: 'replay',
      setup: vi.fn(),
    });
  });

  it.skip('initializes Sentry with the correct configuration', () => {
    initializeSentry();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: expect.any(String),
        tracesSampleRate: 1,
        replaysOnErrorSampleRate: 1,
        replaysSessionSampleRate: 0.1,
        integrations: expect.any(Array),
      }),
    );
  });

  it.skip('configures replay integration with maskAllText and blockAllMedia', () => {
    initializeSentry();

    expect(replayIntegration).toHaveBeenCalledWith(
      expect.objectContaining({
        maskAllText: true,
        blockAllMedia: true,
      }),
    );
  });

  it.skip('uses the DSN from environment variables', () => {
    // Set a mock DSN
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/1234';

    initializeSentry();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/1234',
      }),
    );
  });

  it.skip('handles missing DSN gracefully', () => {
    // Clear DSN
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    initializeSentry();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: undefined,
      }),
    );
  });

  it.skip('returns the result of init', () => {
    // Mock init to return a specific value
    (init as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test-value');

    const result = initializeSentry();

    expect(result).toBe('test-value');
  });
});
