import '@testing-library/jest-dom';
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

// Mock Sentry Next.js environment variables
vi.mock('../src/plugins/sentry-nextjs/env', () => ({
  env: {
    SENTRY_DSN: undefined,
    NEXT_PUBLIC_SENTRY_DSN: undefined,
    SENTRY_ORG: undefined,
    SENTRY_PROJECT: undefined,
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_RELEASE: undefined,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
    NEXT_PUBLIC_SENTRY_RELEASE: undefined,
    SENTRY_ENABLE_TRACING: undefined,
    NEXT_PUBLIC_SENTRY_ENABLE_TRACING: undefined,
  },
  baseSafeEnv: () => ({
    SENTRY_DSN: '',
    NEXT_PUBLIC_SENTRY_DSN: '',
    SENTRY_ORG: '',
    SENTRY_PROJECT: '',
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_RELEASE: '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
    NEXT_PUBLIC_SENTRY_RELEASE: '',
  }),
  safeEnv: () => ({
    SENTRY_DSN: '',
    NEXT_PUBLIC_SENTRY_DSN: '',
    SENTRY_ORG: '',
    SENTRY_PROJECT: '',
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_RELEASE: '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
    NEXT_PUBLIC_SENTRY_RELEASE: '',
    SENTRY_ENABLE_TRACING: false,
    NEXT_PUBLIC_SENTRY_ENABLE_TRACING: false,
    SENTRY_ENABLE_REPLAY: false,
    NEXT_PUBLIC_SENTRY_ENABLE_REPLAY: false,
    SENTRY_ENABLE_FEEDBACK: false,
    NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK: false,
    SENTRY_TRACES_SAMPLE_RATE: 0.1,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: 0.1,
  }),
}));

// Provider mocks are now handled by centralized @repo/qa setup
// (includes console mocking, server-only, and node:async_hooks mocking)

// Mock feature flag SDKs (optional dependencies)
vi.mock('launchdarkly-js-client-sdk', () => ({
  initialize: vi.fn(() => ({
    allFlags: vi.fn().mockResolvedValue({}),
    variation: vi.fn().mockResolvedValue(false),
    on: vi.fn(),
    off: vi.fn(),
    identify: vi.fn().mockResolvedValue({}),
    close: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('unleash-proxy-client', () => ({
  UnleashApi: vi.fn(() => ({
    isEnabled: vi.fn().mockReturnValue(false),
    getVariant: vi.fn().mockReturnValue({ name: 'disabled', enabled: false }),
    on: vi.fn(),
    off: vi.fn(),
    start: vi.fn().mockResolvedValue({}),
    stop: vi.fn().mockResolvedValue({}),
  })),
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
