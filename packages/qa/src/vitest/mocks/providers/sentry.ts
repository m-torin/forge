/**
 * Sentry Provider Mock Factory
 *
 * Centralized mock factory for Sentry observability testing across the monorepo.
 * Supports @sentry/browser, @sentry/node, and @sentry/nextjs packages.
 */

import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * Sentry mock client interface
 */
export interface MockSentryClient {
  // Core initialization
  init: Mock;

  // Error and message capture
  captureException: Mock;
  captureMessage: Mock;

  // User and context management
  setUser: Mock;
  addBreadcrumb: Mock;
  setTag: Mock;
  setExtra: Mock;
  setContext: Mock;

  // Scope management
  withScope: Mock;
  getCurrentScope: Mock;

  // Lifecycle management
  flush: Mock;
  close: Mock;

  // Performance monitoring
  startTransaction: Mock;
  startSpan: Mock;

  // Integration functions
  browserTracingIntegration: Mock;
  replayIntegration: Mock;
  profilesIntegration: Mock;

  // Server-specific (Node.js)
  nodeProfilingIntegration?: Mock;

  // Browser-specific
  Replay?: Mock;
  BrowserTracing?: Mock;
}

/**
 * Sentry mock scenarios for different test cases
 */
export interface SentryMockScenarios {
  success: () => void;
  initError: () => void;
  captureError: () => void;
  flushError: () => void;
  reset: () => void;
}

/**
 * Configuration for Sentry mock factory
 */
export interface SentryMockConfig {
  package?: '@sentry/browser' | '@sentry/node' | '@sentry/nextjs';
  includeIntegrations?: boolean;
  includePerformance?: boolean;
  includeReplays?: boolean;
  includeProfiles?: boolean;
  mockReturnValues?: {
    captureException?: string;
    captureMessage?: string;
    flush?: boolean;
    close?: boolean;
  };
}

/**
 * Create a comprehensive Sentry mock client
 */
export function createSentryMock(config: SentryMockConfig = {}): {
  mockClient: MockSentryClient;
  scenarios: SentryMockScenarios;
  resetMocks: () => void;
} {
  const {
    package: sentryPackage = '@sentry/node',
    includeIntegrations = true,
    includePerformance = true,
    includeReplays = true,
    includeProfiles = true,
    mockReturnValues = {},
  } = config;

  // Create mock client with all methods
  const mockClient: MockSentryClient = {
    // Core initialization
    init: vi.fn(),

    // Error and message capture
    captureException: vi.fn().mockReturnValue(mockReturnValues.captureException || 'event-id'),
    captureMessage: vi.fn().mockReturnValue(mockReturnValues.captureMessage || 'message-id'),

    // User and context management
    setUser: vi.fn(),
    addBreadcrumb: vi.fn(),
    setTag: vi.fn(),
    setExtra: vi.fn(),
    setContext: vi.fn(),

    // Scope management
    withScope: vi.fn().mockImplementation(callback => {
      const scope = {
        setTag: vi.fn(),
        setExtra: vi.fn(),
        setContext: vi.fn(),
        setUser: vi.fn(),
        addBreadcrumb: vi.fn(),
        setLevel: vi.fn(),
        setFingerprint: vi.fn(),
        clear: vi.fn(),
      };
      callback(scope);
    }),
    getCurrentScope: vi.fn().mockReturnValue({
      setTag: vi.fn(),
      setExtra: vi.fn(),
      setContext: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
    }),

    // Lifecycle management
    flush: vi.fn().mockResolvedValue(mockReturnValues.flush ?? true),
    close: vi.fn().mockResolvedValue(mockReturnValues.close ?? true),

    // Performance monitoring
    startTransaction: vi.fn().mockReturnValue({
      setTag: vi.fn(),
      setData: vi.fn(),
      setStatus: vi.fn(),
      finish: vi.fn(),
      startChild: vi.fn(),
    }),
    startSpan: vi.fn().mockReturnValue({
      setTag: vi.fn(),
      setData: vi.fn(),
      setStatus: vi.fn(),
      finish: vi.fn(),
    }),

    // Integration functions
    browserTracingIntegration: vi.fn().mockReturnValue({}),
    replayIntegration: vi.fn().mockReturnValue({}),
    profilesIntegration: vi.fn().mockReturnValue({}),
  };

  // Add package-specific mocks
  if (sentryPackage === '@sentry/node') {
    vi.spyOn(mockClient, 'nodeProfilingIntegration').mockImplementation(() => ({}));
  }

  if (sentryPackage === '@sentry/browser') {
    vi.spyOn(mockClient, 'Replay').mockImplementation(() => ({}));
    vi.spyOn(mockClient, 'BrowserTracing').mockImplementation(() => ({}));
  }

  // Mock scenarios for different test cases
  const scenarios: SentryMockScenarios = {
    success: () => {
      mockClient.init.mockResolvedValue(undefined);
      mockClient.captureException.mockReturnValue('success-event-id');
      mockClient.captureMessage.mockReturnValue('success-message-id');
      mockClient.flush.mockResolvedValue(true);
      mockClient.close.mockResolvedValue(true);
    },

    initError: () => {
      mockClient.init.mockRejectedValue(new Error('Sentry initialization failed'));
    },

    captureError: () => {
      mockClient.captureException.mockImplementation(() => {
        throw new Error('Sentry capture failed');
      });
      mockClient.captureMessage.mockImplementation(() => {
        throw new Error('Sentry message failed');
      });
    },

    flushError: () => {
      mockClient.flush.mockRejectedValue(new Error('Sentry flush failed'));
      mockClient.close.mockRejectedValue(new Error('Sentry close failed'));
    },

    reset: () => {
      Object.values(mockClient).forEach(mock => {
        if (typeof mock?.mockReset === 'function') {
          mock.mockReset();
        }
      });
      // Restore default implementations
      scenarios.success();
    },
  };

  const resetMocks = () => {
    scenarios.reset();
  };

  // Set up default successful scenario
  scenarios.success();

  return {
    mockClient,
    scenarios,
    resetMocks,
  };
}

/**
 * Create a Sentry mock for dynamic imports
 */
export function createSentryDynamicImportMock(config: SentryMockConfig = {}): Mock {
  const { mockClient } = createSentryMock(config);

  return vi.fn().mockImplementation((moduleName: string) => {
    if (moduleName.includes('@sentry/')) {
      return Promise.resolve(mockClient);
    }
    return Promise.reject(new Error(`Unknown module: ${moduleName}`));
  });
}

/**
 * Setup Sentry mocks for vitest with automatic module mocking
 */
export function setupSentryMocks(config: SentryMockConfig = {}) {
  const { mockClient, scenarios, resetMocks } = createSentryMock(config);
  const sentryPackage = config.package || '@sentry/node';

  // Mock the module
  // vi.mock(sentryPackage, () => mockClient);

  // Mock common environment variables
  vi.mock('../../src/env', () => ({
    safeEnv: () => ({
      SENTRY_DSN: 'https://test@sentry.io/123',
      SENTRY_ENVIRONMENT: 'test',
      SENTRY_RELEASE: '1.0.0',
      SENTRY_ENABLED: true,
      SENTRY_DEBUG: false,
      SENTRY_TRACES_SAMPLE_RATE: 1.0,
      SENTRY_PROFILES_SAMPLE_RATE: 1.0,
      SENTRY_REPLAYS_SESSION_SAMPLE_RATE: 0.1,
      SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: 1.0,
      NEXT_PUBLIC_SENTRY_DSN: 'https://test@sentry.io/123',
      NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'test',
      NEXT_PUBLIC_SENTRY_RELEASE: '1.0.0',
      NEXT_PUBLIC_SENTRY_ENABLED: true,
    }),
  }));

  return {
    mockClient,
    scenarios,
    resetMocks,
  };
}

/**
 * Standard Sentry test data generators
 */
export const sentryTestData = {
  error: (message = 'Test error') => new Error(message),

  context: (overrides = {}) => ({
    extra: { key: 'value' },
    tags: { component: 'test' },
    user: { id: '123' },
    ...overrides,
  }),

  user: (overrides = {}) => ({
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  }),

  breadcrumb: (overrides = {}) => ({
    message: 'Test breadcrumb',
    level: 'info' as const,
    timestamp: Date.now() / 1000,
    ...overrides,
  }),

  initConfig: (overrides = {}) => ({
    dsn: 'https://test@sentry.io/123',
    environment: 'test',
    release: '1.0.0',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ...overrides,
  }),
};
