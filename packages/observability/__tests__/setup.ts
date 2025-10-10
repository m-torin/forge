import { beforeEach, vi } from 'vitest';

// Mock environment variables for edge runtime tests
vi.mock('../src/plugins/betterstack/env', () => ({
  env: {
    BETTER_STACK_SOURCE_TOKEN: undefined,
    BETTERSTACK_SOURCE_TOKEN: undefined,
    LOGTAIL_SOURCE_TOKEN: undefined,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: undefined,
    BETTER_STACK_INGESTING_URL: undefined,
    BETTER_STACK_LOG_LEVEL: 'info',
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: undefined,
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: 'info',
  },
  safeEnv: () => ({
    BETTER_STACK_SOURCE_TOKEN: '',
    BETTERSTACK_SOURCE_TOKEN: '',
    LOGTAIL_SOURCE_TOKEN: '',
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: '',
    BETTER_STACK_INGESTING_URL: '',
    BETTER_STACK_LOG_LEVEL: 'info',
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: '',
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: 'info',
  }),
}));

// Mock main env to prevent client/server validation errors
vi.mock('../env', () => ({
  env: {
    NEXT_PUBLIC_NODE_ENV: 'test',
    NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED: true,
    NEXT_PUBLIC_OBSERVABILITY_DEBUG: false,
  },
  safeEnv: () => ({
    NEXT_PUBLIC_NODE_ENV: 'test',
    NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED: true,
    NEXT_PUBLIC_OBSERVABILITY_DEBUG: false,
    SENTRY_DSN: '',
    NEXT_PUBLIC_SENTRY_DSN: '',
    SENTRY_ORG: '',
    SENTRY_PROJECT: '',
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_RELEASE: '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
    NEXT_PUBLIC_SENTRY_RELEASE: '',
  }),
}));

// Mock Sentry environment variables
vi.mock('../src/plugins/sentry/env', () => ({
  env: {
    SENTRY_DSN: undefined,
    NEXT_PUBLIC_SENTRY_DSN: undefined,
    SENTRY_ORG: undefined,
    SENTRY_PROJECT: undefined,
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_RELEASE: undefined,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
    NEXT_PUBLIC_SENTRY_RELEASE: undefined,
  },
  safeEnv: () => ({
    SENTRY_DSN: '',
    NEXT_PUBLIC_SENTRY_DSN: '',
    SENTRY_ORG: '',
    SENTRY_PROJECT: '',
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_RELEASE: '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
    NEXT_PUBLIC_SENTRY_RELEASE: '',
  }),
}));

// Import centralized mocks from @repo/qa (when available)
// TODO: Re-enable when @repo/qa exports are built
// import '@repo/qa/vitest/mocks/providers/sentry';

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

// Mock external dependencies used by plugins
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn(callback => {
    if (callback) {
      callback({
        setContext: vi.fn(),
        setUser: vi.fn(),
      });
    }
  }),
  flush: vi.fn().mockResolvedValue(true),
  close: vi.fn().mockResolvedValue(true),
  getClient: vi.fn(),
  httpIntegration: vi.fn(() => ({})),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
  profilesIntegration: vi.fn(() => ({})),
}));

vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn(callback => {
    if (callback) {
      callback({
        setContext: vi.fn(),
        setUser: vi.fn(),
      });
    }
  }),
  flush: vi.fn().mockResolvedValue(true),
  close: vi.fn().mockResolvedValue(true),
  getClient: vi.fn(),
  httpIntegration: vi.fn(() => ({})),
}));

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn(callback => {
    if (callback) {
      callback({
        setContext: vi.fn(),
        setUser: vi.fn(),
      });
    }
  }),
  flush: vi.fn().mockResolvedValue(true),
  close: vi.fn().mockResolvedValue(true),
  getClient: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
}));

vi.mock('@logtail/js', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    flush: vi.fn().mockResolvedValue(true),
    setContext: vi.fn(),
    removeContext: vi.fn(),
    setUser: vi.fn(),
    removeUser: vi.fn(),
  })),
  Logtail: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    flush: vi.fn().mockResolvedValue(true),
    setContext: vi.fn(),
    removeContext: vi.fn(),
    setUser: vi.fn(),
    removeUser: vi.fn(),
  })),
}));

vi.mock('node:async_hooks', () => ({
  AsyncLocalStorage: vi.fn(),
}));

// Common observability test configuration
export const createObservabilityTestConfig = (overrides = {}) => ({
  plugins: {
    console: { enabled: true },
    ...overrides,
  },
});

// Common observability creation patterns
export const createTestObservability = async (config = createObservabilityTestConfig()) => {
  const { ObservabilityBuilder } = await import('#/factory/builder');
  const { createConsolePlugin } = await import('#/plugins/console');

  return ObservabilityBuilder.create()
    .withPlugin(createConsolePlugin(config.plugins.console))
    .build();
};

export const createTestServerObservability = async (config = createObservabilityTestConfig()) => {
  const { ObservabilityBuilder } = await import('#/factory/builder');
  const { createConsoleServerPlugin } = await import('#/plugins/console');

  return ObservabilityBuilder.create()
    .withPlugin(createConsoleServerPlugin(config.plugins.console))
    .build();
};

// Export test factories and generators (avoiding conflicts)
export { createObservabilityTestSuite, createScenarios } from './plugin-test-factory';
// Re-export test-data-generators through the factory to avoid conflicts

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
