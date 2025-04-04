import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock environment variables
process.env.BETTERSTACK_API_KEY = 'test-betterstack-api-key';
process.env.BETTERSTACK_URL = 'https://test-betterstack-url.com';
process.env.SENTRY_ORG = 'test-sentry-org';
process.env.SENTRY_PROJECT = 'test-sentry-project';
process.env.NEXT_PUBLIC_SENTRY_DSN =
  'https://test-sentry-dsn.ingest.sentry.io/test';
process.env.NODE_ENV = 'test';
process.env.NEXT_RUNTIME = 'nodejs';

// Mock @sentry/nextjs
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({}),
  withSentryConfig: vi.fn().mockImplementation((config) => config),
}));

// Mock @logtail/next
vi.mock('@logtail/next', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  withLogtail: vi.fn().mockImplementation((config) => config),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, client, runtimeEnv }) => {
    const env = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    Object.keys(client).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));

// Mock fetch for BetterStack API
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('betterstack.com')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: 'test-monitor-1',
              type: 'monitor',
              attributes: {
                status: 'up',
                url: 'https://test-site-1.com',
              },
            },
            {
              id: 'test-monitor-2',
              type: 'monitor',
              attributes: {
                status: 'up',
                url: 'https://test-site-2.com',
              },
            },
          ],
          pagination: {
            first: 'https://api.betterstack.com/v2/monitors?page=1',
            last: 'https://api.betterstack.com/v2/monitors?page=1',
          },
        }),
    });
  }
  return Promise.reject(new Error('Not found'));
});

// Mock console
console.error = vi.fn();
console.warn = vi.fn();
console.info = vi.fn();
console.log = vi.fn();
