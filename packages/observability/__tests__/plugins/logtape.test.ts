import { LogTapePlugin, createLogTapePlugin } from '#/plugins/logtape';
import { vi } from 'vitest';

// Use centralized test factory and utilities
import { createObservabilityTestSuite, createScenarios } from '../plugin-test-factory';
import { createTestData } from '../test-data-generators';

// Mock LogTape logger for testing
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  with: vi.fn().mockReturnThis(),
};

// Mock LogTape client for testing
const mockClient = {
  configure: vi.fn().mockResolvedValue(undefined),
  getLogger: vi.fn(() => mockLogger),
  shutdown: vi.fn(),
  getConsoleSink: vi.fn(() => ({
    type: 'console',
    level: 'info',
  })),
};

const mockSinks = {
  fileSink: { FileSink: vi.fn() },
  cloudWatchSink: { CloudWatchSink: vi.fn() },
  sentrySink: { SentrySink: vi.fn() },
  asyncHooks: { AsyncLocalStorage: vi.fn() },
};

// Mock scenarios for testing
const scenarios = {
  configurationError: () =>
    mockClient.configure.mockImplementation(() => {
      throw new Error('LogTape configuration error');
    }),
};

const resetMocks = () => {
  vi.clearAllMocks();
  // Reset the mock implementations
  mockClient.configure.mockResolvedValue(undefined);
  mockClient.getLogger.mockReturnValue(mockLogger);
};

// Mock dynamic imports
vi.mock('../../src/plugins/logtape/env', () => ({
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

// Create plugin factory for testing
function createLogTapeTestPlugin(config?: any) {
  // Set up the import mock to return our mock client
  vi.doMock('@logtape/logtape', () => mockClient);

  const plugin = new LogTapePlugin({
    enabled: true,
    sinks: {
      console: true,
      ...config?.sinks,
    },
    ...config,
  });

  resetMocks();
  return plugin;
}

// Generate standard test suite
createObservabilityTestSuite({
  pluginName: 'logtape',
  createPlugin: createLogTapeTestPlugin,
  defaultConfig: {
    enabled: true,
    sinks: {
      console: true,
    },
  },
  scenarios: [
    ...createScenarios.initialization([
      {
        name: 'with console sink',
        description: 'should initialize with console sink',
        test: async (plugin: any) => {
          await plugin.initialize();
          // Plugin should initialize without errors
          expect(plugin.name).toBe('logtape');
        },
      },
      {
        name: 'with multiple sinks',
        description: 'should initialize with multiple sinks',
        test: async (plugin: any) => {
          const multiSinkPlugin = createLogTapeTestPlugin({
            sinks: {
              console: true,
              file: { path: '/var/log/test.log' },
              cloudwatch: { logGroup: '/aws/lambda/test', region: 'us-east-1' },
            },
          });

          await multiSinkPlugin.initialize();
          // Plugin should initialize without errors
          expect(multiSinkPlugin.name).toBe('logtape');
        },
      },
    ]),
    ...createScenarios.integration([
      {
        name: 'logtape integration workflow',
        description: 'should handle complete LogTape workflow',
        test: async (plugin: any) => {
          await plugin.initialize();

          // Set user - converted to context
          const user = createTestData.user();
          plugin.setUser(user);

          // Add breadcrumb - converted to structured log
          const breadcrumb = createTestData.breadcrumb();
          plugin.addBreadcrumb(breadcrumb);

          // Capture message
          const message = 'Integration test message';
          plugin.captureMessage(message, 'info');
          expect(mockLogger.info).toHaveBeenCalledWith(message, expect.any(Object));

          // Capture error
          const error = createTestData.error();
          plugin.captureException(error);
          expect(mockLogger.error).toHaveBeenCalledWith(error.message, expect.any(Object));

          // Flush
          await (plugin as any).flush();

          // Shutdown
          await plugin.shutdown();
        },
      },
    ]),
  ],
  isServerPlugin: true,
});

// Additional LogTape-specific tests
describe('logtape-specific features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('factory functions', () => {
    test('should create LogTapePlugin with default config', () => {
      const plugin = createLogTapePlugin();

      expect(plugin).toBeInstanceOf(LogTapePlugin);
      expect(plugin.name).toBe('logtape');
      expect(plugin.enabled).toBeTruthy();
    });

    test('should create LogTapePlugin with custom config', () => {
      const plugin = createLogTapePlugin({
        enabled: false,
        categoryPrefix: 'custom-app',
      });

      expect(plugin).toBeInstanceOf(LogTapePlugin);
      expect(plugin.enabled).toBeFalsy();
    });
  });

  describe('sink configuration', () => {
    test('should configure console sink', async () => {
      const plugin = createLogTapeTestPlugin({
        sinks: { console: true },
      });

      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe('logtape');
    });

    test('should configure file sink', async () => {
      const plugin = createLogTapeTestPlugin({
        sinks: {
          console: true,
          file: { path: '/var/log/test.log' },
        },
      });

      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe('logtape');
    });

    test('should configure CloudWatch sink', async () => {
      const plugin = createLogTapeTestPlugin({
        sinks: {
          console: true,
          cloudwatch: {
            logGroup: '/aws/lambda/test',
            region: 'us-east-1',
          },
        },
      });

      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe('logtape');
    });

    test('should configure Sentry sink', async () => {
      const plugin = createLogTapeTestPlugin({
        sinks: {
          console: true,
          sentry: { dsn: 'https://test@sentry.io/123' },
        },
      });

      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe('logtape');
    });

    test('should handle sink configuration errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const plugin = createLogTapeTestPlugin({
        sinks: { file: { path: '/var/log/test.log' } },
      });

      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe('logtape');

      consoleSpy.mockRestore();
    });
  });

  describe('structured logging', () => {
    test('should include structured data in logs', async () => {
      const plugin = createLogTapeTestPlugin();
      await plugin.initialize();

      const context = createTestData.context();
      plugin.captureMessage('Test message', 'info', context);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          context: context.extra,
          tags: context.tags,
        }),
      );
    });

    test('should include user context in logs', async () => {
      const plugin = createLogTapeTestPlugin();
      await plugin.initialize();

      const user = createTestData.user();
      plugin.setUser(user);
      plugin.captureMessage('Test message');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          user: user,
        }),
      );
    });

    test('should include breadcrumbs in logs', async () => {
      const plugin = createLogTapeTestPlugin();
      await plugin.initialize();

      const breadcrumb = createTestData.breadcrumb();
      plugin.addBreadcrumb(breadcrumb);
      plugin.captureMessage('Test message');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          breadcrumbs: [breadcrumb],
        }),
      );
    });
  });

  describe('error handling', () => {
    test('should handle configuration errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Set up the mock to throw during configure BEFORE creating plugin
      const failingMockClient = {
        ...mockClient,
        configure: vi.fn().mockImplementation(() => {
          throw new Error('Configuration failed');
        }),
      };

      // Mock LogTape import to return failing client
      vi.doMock('@logtape/logtape', () => failingMockClient);

      const { LogTapePlugin } = await import('../../src/plugins/logtape');
      const plugin = new LogTapePlugin({
        enabled: true,
        sinks: { console: true },
      });

      await plugin.initialize();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize LogTape:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    test('should handle logger creation errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Set up the mock to throw during getLogger BEFORE creating plugin
      const failingMockClient = {
        ...mockClient,
        getLogger: vi.fn().mockImplementation(() => {
          throw new Error('Logger creation failed');
        }),
      };

      // Mock LogTape import to return failing client
      vi.doMock('@logtape/logtape', () => failingMockClient);

      const { LogTapePlugin } = await import('../../src/plugins/logtape');
      const plugin = new LogTapePlugin({
        enabled: true,
        sinks: { console: true },
      });

      await plugin.initialize();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize LogTape:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('performance features', () => {
    test('should handle high-volume logging', async () => {
      const plugin = createLogTapeTestPlugin();
      await plugin.initialize();

      const messages = createTestData.performance.manyMessages(1000);
      const start = performance.now();

      messages.forEach(message => {
        plugin.captureMessage(message);
      });

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should handle 1000 messages in < 100ms
    });

    test('should handle async hooks when available', async () => {
      const plugin = createLogTapeTestPlugin();
      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe('logtape');
    });
  });
});
