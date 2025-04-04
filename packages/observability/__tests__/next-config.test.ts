import { describe, expect, it, vi, beforeEach } from 'vitest';
import { sentryConfig, withSentry, withLogging } from '../next-config';
import { withSentryConfig } from '@sentry/nextjs';
import { withLogtail } from '@logtail/next';
import { keys } from '../keys';

// Import the mocked modules
vi.mock('@sentry/nextjs');
vi.mock('@logtail/next');
vi.mock('../keys');

describe.skip('Next.js Configuration', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock keys to return test values
    (keys as any).mockReturnValue({
      SENTRY_ORG: 'test-sentry-org',
      SENTRY_PROJECT: 'test-sentry-project',
    });

    // Mock withSentryConfig to return the config
    (withSentryConfig as any).mockImplementation((config) => config);

    // Mock withLogtail to return the config
    (withLogtail as any).mockImplementation((config) => config);

    // Mock process.env.CI
    process.env.CI = 'false';
  });

  it('configures Sentry with the correct options', () => {
    expect(sentryConfig).toMatchObject({
      org: expect.any(String),
      project: expect.any(String),
      silent: expect.any(Boolean),
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      disableLogger: true,
      automaticVercelMonitors: true,
    });
  });

  it('withSentry adds the Sentry configuration to Next.js config', () => {
    const mockConfig = { reactStrictMode: true };
    const result = withSentry(mockConfig);

    expect(result).toHaveProperty('transpilePackages');
    expect(Array.isArray(result.transpilePackages)).toBe(true);
    expect(result.transpilePackages).toContain('@sentry/nextjs');
  });

  it('withLogging adds Logtail to Next.js config', () => {
    const mockConfig = { reactStrictMode: true };
    const result = withLogging(mockConfig);

    // Can't test much here as withLogtail is mocked
    expect(result).toBeDefined();
  });
});
