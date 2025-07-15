/**
 * LogTape Provider Mock Factory
 *
 * Centralized mock factory for LogTape observability testing.
 * Supports @logtape/logtape and related sink packages.
 */

import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * LogTape mock logger interface
 */
export interface MockLogTapeLogger {
  trace: Mock;
  debug: Mock;
  info: Mock;
  warning: Mock;
  error: Mock;
  fatal: Mock;
  with: Mock;
}

/**
 * LogTape mock client interface
 */
export interface MockLogTapeClient {
  // Core LogTape methods
  configure: Mock;
  getLogger: Mock;
  dispose: Mock;

  // Sink factories
  getConsoleSink: Mock;
  jsonLinesFormatter: any;

  // Logger instances
  logger?: MockLogTapeLogger;
}

/**
 * LogTape sink mock interfaces
 */
export interface MockLogTapeSinks {
  fileSink: {
    getFileSink: Mock;
  };
  cloudWatchSink: {
    getCloudWatchLogsSink: Mock;
  };
  sentrySink: {
    getSentrySink: Mock;
  };
  asyncHooks: {
    AsyncLocalStorage: Mock;
  };
}

/**
 * LogTape mock scenarios for different test cases
 */
export interface LogTapeMockScenarios {
  success: () => void;
  configureError: () => void;
  sinkError: () => void;
  disposeError: () => void;
  reset: () => void;
}

/**
 * Configuration for LogTape mock factory
 */
export interface LogTapeMockConfig {
  includeSinks?: boolean;
  includeAsyncHooks?: boolean;
  mockReturnValues?: {
    configure?: boolean;
    dispose?: boolean;
  };
}

/**
 * Create a comprehensive LogTape mock client
 */
export function createLogTapeMock(config: LogTapeMockConfig = {}): {
  mockClient: MockLogTapeClient;
  mockLogger: MockLogTapeLogger;
  mockSinks: MockLogTapeSinks;
  scenarios: LogTapeMockScenarios;
  resetMocks: () => void;
} {
  const { includeSinks = true, includeAsyncHooks = true, mockReturnValues = {} } = config;

  // Create mock logger
  const mockLogger: MockLogTapeLogger = {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    with: vi.fn().mockReturnThis(),
  };

  // Create mock client with all methods
  const mockClient: MockLogTapeClient = {
    // Core LogTape methods
    configure: vi.fn().mockResolvedValue(mockReturnValues.configure ?? undefined),
    getLogger: vi.fn().mockReturnValue(mockLogger),
    dispose: vi.fn().mockResolvedValue(mockReturnValues.dispose ?? undefined),

    // Sink factories
    getConsoleSink: vi.fn().mockReturnValue({}),
    jsonLinesFormatter: {},

    // Logger instance
    logger: mockLogger,
  };

  // Create mock sinks
  const mockSinks: MockLogTapeSinks = {
    fileSink: {
      getFileSink: vi.fn().mockReturnValue({}),
    },
    cloudWatchSink: {
      getCloudWatchLogsSink: vi.fn().mockReturnValue({}),
    },
    sentrySink: {
      getSentrySink: vi.fn().mockReturnValue({}),
    },
    asyncHooks: {
      AsyncLocalStorage: vi.fn().mockImplementation(() => ({})),
    },
  };

  // Mock scenarios for different test cases
  const scenarios: LogTapeMockScenarios = {
    success: () => {
      mockClient.configure.mockResolvedValue(undefined);
      mockClient.getLogger.mockReturnValue(mockLogger);
      mockClient.dispose.mockResolvedValue(undefined);
      mockClient.getConsoleSink.mockReturnValue({});

      // Logger methods
      mockLogger.trace.mockReturnValue(undefined);
      mockLogger.debug.mockReturnValue(undefined);
      mockLogger.info.mockReturnValue(undefined);
      mockLogger.warning.mockReturnValue(undefined);
      mockLogger.error.mockReturnValue(undefined);
      mockLogger.fatal.mockReturnValue(undefined);
      mockLogger.with.mockReturnValue(mockLogger);

      // Sink methods
      mockSinks.fileSink.getFileSink.mockReturnValue({});
      mockSinks.cloudWatchSink.getCloudWatchLogsSink.mockReturnValue({});
      mockSinks.sentrySink.getSentrySink.mockReturnValue({});
    },

    configureError: () => {
      mockClient.configure.mockRejectedValue(new Error('LogTape configure failed'));
    },

    sinkError: () => {
      mockSinks.fileSink.getFileSink.mockImplementation(() => {
        throw new Error('File sink not available');
      });
      mockSinks.cloudWatchSink.getCloudWatchLogsSink.mockImplementation(() => {
        throw new Error('CloudWatch sink not available');
      });
      mockSinks.sentrySink.getSentrySink.mockImplementation(() => {
        throw new Error('Sentry sink not available');
      });
    },

    disposeError: () => {
      mockClient.dispose.mockRejectedValue(new Error('LogTape dispose failed'));
    },

    reset: () => {
      // Reset client mocks
      Object.values(mockClient).forEach(mock => {
        if (typeof mock?.mockReset === 'function') {
          mock.mockReset();
        }
      });

      // Reset logger mocks
      Object.values(mockLogger).forEach(mock => {
        if (typeof mock?.mockReset === 'function') {
          mock.mockReset();
        }
      });

      // Reset sink mocks
      Object.values(mockSinks).forEach(sinkGroup => {
        Object.values(sinkGroup).forEach(mock => {
          if (typeof (mock as any)?.mockReset === 'function') {
            (mock as any).mockReset();
          }
        });
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
    mockLogger,
    mockSinks,
    scenarios,
    resetMocks,
  };
}

/**
 * Create a LogTape mock for dynamic imports
 */
export function createLogTapeDynamicImportMock(config: LogTapeMockConfig = {}): Mock {
  const { mockClient, mockSinks } = createLogTapeMock(config);

  return vi.fn().mockImplementation((moduleName: string) => {
    switch (moduleName) {
      case '@logtape/logtape':
        return Promise.resolve(mockClient);
      case '@logtape/file':
        return Promise.resolve(mockSinks.fileSink);
      case '@logtape/cloudwatch-logs':
        return Promise.resolve(mockSinks.cloudWatchSink);
      case '@logtape/sentry':
        return Promise.resolve(mockSinks.sentrySink);
      case 'node:async_hooks':
        return Promise.resolve(mockSinks.asyncHooks);
      default:
        return Promise.reject(new Error(`Module ${moduleName} not found`));
    }
  });
}

/**
 * Setup LogTape mocks for vitest with automatic module mocking
 */
export function setupLogTapeMocks(config: LogTapeMockConfig = {}) {
  const { mockClient, mockLogger, mockSinks, scenarios, resetMocks } = createLogTapeMock(config);

  // Mock the main LogTape module
  vi.mock('@logtape/logtape', () => mockClient);

  // Mock sink modules
  vi.mock('@logtape/file', () => mockSinks.fileSink);
  vi.mock('@logtape/cloudwatch-logs', () => mockSinks.cloudWatchSink);
  vi.mock('@logtape/sentry', () => mockSinks.sentrySink);
  vi.mock('node:async_hooks', () => mockSinks.asyncHooks);

  // Mock common environment variables
  vi.mock('../../src/env', () => ({
    safeEnv: () => ({
      LOGTAPE_ENABLED: true,
      LOGTAPE_LOG_LEVEL: 'info',
      LOGTAPE_CONSOLE_ENABLED: true,
      LOGTAPE_FILE_PATH: '/var/log/test.log',
      LOGTAPE_CLOUDWATCH_LOG_GROUP: '/aws/lambda/test',
      LOGTAPE_CLOUDWATCH_REGION: 'us-east-1',
      LOGTAPE_SENTRY_DSN: 'https://test@sentry.io/123',
      LOGTAPE_CATEGORY_PREFIX: 'test-app',
      NEXT_PUBLIC_LOGTAPE_ENABLED: true,
      NEXT_PUBLIC_LOGTAPE_LOG_LEVEL: 'info',
    }),
  }));

  return {
    mockClient,
    mockLogger,
    mockSinks,
    scenarios,
    resetMocks,
  };
}

/**
 * Standard LogTape test data generators
 */
export const logTapeTestData = {
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

  configureOptions: (overrides = {}) => ({
    sinks: {
      console: {},
    },
    loggers: [
      {
        category: ['test-app'],
        sinks: ['console'],
        lowestLevel: 'info',
      },
    ],
    ...overrides,
  }),

  sinkConfig: {
    console: () => ({}),
    file: (path = '/var/log/test.log') => ({ path }),
    cloudwatch: (logGroup = '/aws/lambda/test', region = 'us-east-1') => ({
      logGroupName: logGroup,
      region,
      formatter: {},
    }),
    sentry: (dsn = 'https://test@sentry.io/123') => ({ dsn }),
  },
};

// Mock @logtape/cloudwatch-logs module
vi.mock('@logtape/cloudwatch-logs', () => ({
  getCloudWatchLogsSink: vi.fn().mockReturnValue({}),
}));
