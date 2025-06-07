/**
 * Test setup for observability package
 */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock @t3-oss/env-nextjs to avoid server-side environment restrictions
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn(() => {
    return new Proxy(
      {},
      {
        get(target, prop) {
          const envValue = process.env[prop as string];
          if (envValue !== undefined) {
            return envValue;
          }
          // Provide defaults for specific environment variables
          switch (prop) {
            case 'SENTRY_DSN':
              return process.env.SENTRY_DSN || undefined;
            case 'SENTRY_AUTH_TOKEN':
              return process.env.SENTRY_AUTH_TOKEN || undefined;
            case 'NEXT_PUBLIC_SENTRY_DSN':
              return process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;
            case 'LOGTAIL_SOURCE_TOKEN':
              return process.env.LOGTAIL_SOURCE_TOKEN || undefined;
            case 'NODE_ENV':
              return process.env.NODE_ENV || 'test';
            default:
              return undefined;
          }
        },
      },
    );
  }),
}));

// Mock Sentry to prevent actual initialization during tests
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  configureScope: vi.fn(),
  endSession: vi.fn(),
  getActiveTransaction: vi.fn(() => null),
  getCurrentHub: vi.fn(() => ({
    getClient: vi.fn(() => null),
  })),
  init: vi.fn(),
  setContext: vi.fn(),
  setExtra: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  startSession: vi.fn(),
  startSpan: vi.fn(),
  startTransaction: vi.fn(),
}));

// Mock @sentry/node for server-side tests
vi.mock('@sentry/node', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  flush: vi.fn(() => Promise.resolve(true)),
  getCurrentScope: vi.fn(() => ({
    setSpan: vi.fn(),
  })),
  httpIntegration: vi.fn(() => ({ name: 'Http' })),
  init: vi.fn(),
  nativeNodeFetchIntegration: vi.fn(() => ({ name: 'NativeNodeFetch' })),
  setContext: vi.fn(),
  setExtra: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  Severity: {
    Debug: 'debug',
    Error: 'error',
    Info: 'info',
    Warning: 'warning',
  },
  startSpan: vi.fn(),
  startTransaction: vi.fn(),
  withScope: vi.fn((callback) =>
    callback({
      setExtra: vi.fn(),
      setFingerprint: vi.fn(),
      setLevel: vi.fn(),
      setTag: vi.fn(),
      setUser: vi.fn(),
    }),
  ),
}));

// Note: Pino mocking is handled individually by test files to avoid conflicts

// Mock winston
vi.mock('winston', () => ({
  createLogger: vi.fn(() => ({
    child: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
  format: {
    combine: vi.fn(),
    errors: vi.fn(),
    json: vi.fn(),
    timestamp: vi.fn(),
  },
  transports: {
    Console: vi.fn(),
    File: vi.fn(),
  },
}));

// Make Sentry mock available globally
(global as any).mockSentry = {
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  flush: vi.fn(() => Promise.resolve(true)),
  getCurrentScope: vi.fn(() => ({
    setSpan: vi.fn(),
  })),
  httpIntegration: vi.fn(() => ({ name: 'Http' })),
  init: vi.fn(),
  nativeNodeFetchIntegration: vi.fn(() => ({ name: 'NativeNodeFetch' })),
  setContext: vi.fn(),
  setExtra: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  Severity: {
    Debug: 'debug',
    Error: 'error',
    Info: 'info',
    Warning: 'warning',
  },
  startSpan: vi.fn(),
  startTransaction: vi.fn(),
  withScope: vi.fn((callback) =>
    callback({
      setExtra: vi.fn(),
      setFingerprint: vi.fn(),
      setLevel: vi.fn(),
      setTag: vi.fn(),
      setUser: vi.fn(),
    }),
  ),
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
