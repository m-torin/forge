import { vi } from 'vitest';

// Mock server-only module
vi.mock('server-only', () => ({}));

// Mock environment variables
vi.mock('./keys', () => ({
  keys: () => ({
    LOGTAIL_TOKEN: 'test-logtail-token',
    NEXT_PUBLIC_SENTRY_DSN: 'test-sentry-dsn',
  }),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn(() => 'mock-replay-integration'),
  withScope: vi.fn((callback) => callback({ setExtra: vi.fn() })),
}));

// Mock Logtail
vi.mock('@logtail/next', () => ({
  Logtail: vi.fn().mockImplementation(() => ({
    error: vi.fn(),
    log: vi.fn(),
  })),
}));
