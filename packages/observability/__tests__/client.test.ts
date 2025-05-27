import { init, replayIntegration } from '@sentry/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocks
import { initializeSentry } from '../client';

describe('@repo/observability/client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes Sentry with the correct configuration', () => {
    // Mock replayIntegration implementation
    vi.mocked(replayIntegration).mockReturnValue('mocked-replay-integration' as any);

    initializeSentry();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        debug: false,
        dsn: 'test-sentry-dsn',
        integrations: ['mocked-replay-integration'],
        replaysOnErrorSampleRate: 1,
        replaysSessionSampleRate: 0.1,
        tracesSampleRate: 1,
      }),
    );
  });

  it('configures replay integration with expected options', () => {
    initializeSentry();

    expect(replayIntegration).toHaveBeenCalledWith(
      expect.objectContaining({
        blockAllMedia: true,
        maskAllText: true,
      }),
    );
  });

  it('returns the result of Sentry init', () => {
    vi.mocked(init).mockReturnValueOnce('sentry-init-result' as any);

    const result = initializeSentry();

    expect(result).toBe('sentry-init-result');
  });
});
