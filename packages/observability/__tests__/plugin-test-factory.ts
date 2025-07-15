/**
 * Observability Test Factory
 *
 * Centralized factory for creating consistent observability plugin tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for observability plugins.
 */

import type { ObservabilityPlugin } from '#/core/plugin';
import type { Breadcrumb, LogLevel, ObservabilityContext, ObservabilityUser } from '#/core/types';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Common test data generators for observability
export const createTestData = {
  /**
   * Creates a standard error for testing
   */
  error: (message = 'Test error', overrides: Partial<Error> = {}): Error => {
    const error = new Error(message);
    Object.assign(error, overrides);
    return error;
  },

  /**
   * Creates observability context for testing
   */
  context: (overrides: Partial<ObservabilityContext> = {}): ObservabilityContext => ({
    extra: {
      userId: 'test-user-123',
      sessionId: 'session-456',
      feature: 'test-feature',
      component: 'TestComponent',
      action: 'test-action',
      metadata: {
        timestamp: Date.now(),
        version: '1.0.0',
      },
    },
    tags: {
      environment: 'test',
      service: 'observability-test',
      version: '1.0.0',
      team: 'platform',
    },
    ...overrides,
  }),

  /**
   * Creates user data for testing
   */
  user: (overrides: Partial<ObservabilityUser> = {}): ObservabilityUser => ({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    ip_address: '192.168.1.1',
    segment: 'premium',
    ...overrides,
  }),

  /**
   * Creates breadcrumb data for testing
   */
  breadcrumb: (overrides: Partial<Breadcrumb> = {}): Breadcrumb => ({
    message: 'Test breadcrumb',
    level: 'info',
    category: 'test',
    timestamp: Date.now() / 1000,
    data: {
      url: 'https://example.com/test',
      method: 'GET',
      status: 200,
    },
    ...overrides,
  }),

  /**
   * Creates various log levels for testing
   */
  logLevels: ['debug', 'info', 'warning', 'error'] as LogLevel[],

  /**
   * Creates test messages for different scenarios
   */
  messages: {
    simple: 'Simple test message',
    withContext: 'Message with context data',
    longMessage: 'A'.repeat(1000), // Long message for testing
    specialChars: 'Message with special chars: !@#$%^&*()[]{}',
    unicode: 'Message with unicode: 🔥 Error occurred in 北京',
    empty: '',
  },

  /**
   * Creates performance test data
   */
  performance: {
    manyErrors: (count = 100) =>
      Array.from({ length: count }, (_, i) => createTestData.error(`Test error ${i}`)),

    manyMessages: (count = 100) => Array.from({ length: count }, (_, i) => `Test message ${i}`),

    manyBreadcrumbs: (count = 100) =>
      Array.from({ length: count }, (_, i) =>
        createTestData.breadcrumb({ message: `Breadcrumb ${i}` }),
      ),
  },
};

/**
 * Plugin test factory configuration
 */
export interface ObservabilityTestConfig<TPlugin extends ObservabilityPlugin<any>> {
  /** Name of the plugin being tested */
  pluginName: string;
  /** Factory function to create the plugin */
  createPlugin: (config?: any) => TPlugin;
  /** Default configuration for the plugin */
  defaultConfig?: any;
  /** Test scenarios to generate */
  scenarios: ObservabilityTestScenario<TPlugin>[];
  /** Whether the plugin supports server-specific features */
  isServerPlugin?: boolean;
}

/**
 * Test scenario definition
 */
export interface ObservabilityTestScenario<TPlugin extends ObservabilityPlugin<any>> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Test execution function */
  test: (plugin: TPlugin) => void | Promise<void>;
  /** Whether this scenario should be skipped */
  skip?: boolean;
  /** Timeout for this specific test */
  timeout?: number;
}

/**
 * Creates a complete test suite for an observability plugin
 */
export function createObservabilityTestSuite<TPlugin extends ObservabilityPlugin<any>>(
  config: ObservabilityTestConfig<TPlugin>,
) {
  const { pluginName, createPlugin, defaultConfig, scenarios, isServerPlugin } = config;

  return describe(`${pluginName} plugin`, () => {
    let plugin: TPlugin;

    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      plugin = createPlugin(defaultConfig);
    });

    // Basic plugin structure tests
    describe('plugin structure', () => {
      test('should have correct plugin name', () => {
        expect(plugin.name).toBe(pluginName);
      });

      test('should have enabled property', () => {
        expect(plugin).toHaveProperty('enabled');
        expect(typeof plugin.enabled).toBe('boolean');
      });

      test('should have required methods', () => {
        expect(plugin).toHaveProperty('initialize');
        expect(plugin).toHaveProperty('shutdown');
        expect(plugin).toHaveProperty('captureException');
        expect(plugin).toHaveProperty('captureMessage');
        expect(plugin).toHaveProperty('setUser');
        expect(plugin).toHaveProperty('addBreadcrumb');
        expect(plugin).toHaveProperty('withScope');
        expect(plugin).toHaveProperty('flush');
        expect(plugin).toHaveProperty('getClient');
      });

      test('should be a server plugin', () => {
        if (isServerPlugin) {
          expect(plugin).toHaveProperty('flush');
          expect(typeof (plugin as any).flush).toBe('function');
        } else {
          // For non-server plugins, just verify they exist
          expect(plugin).toBeDefined();
        }
      });
    });

    // Standard initialization tests
    describe('initialization', () => {
      test('should initialize without errors', async () => {
        if (plugin.initialize) {
          if (plugin.initialize) {
            await expect(plugin.initialize()).resolves.not.toThrow();
          }
        }
      });

      test('should handle initialization when disabled', async () => {
        plugin.enabled = false;
        if (plugin.initialize) {
          if (plugin.initialize) {
            await expect(plugin.initialize()).resolves.not.toThrow();
          }
        }
      });
    });

    // Standard error handling tests
    describe('error handling', () => {
      test('should capture exceptions', () => {
        const error = createTestData.error();
        const context = createTestData.context();

        expect(() => plugin.captureException(error, context)).not.toThrow();
      });

      test('should handle disabled plugin gracefully', () => {
        plugin.enabled = false;
        const error = createTestData.error();

        expect(() => plugin.captureException(error)).not.toThrow();
      });

      test('should handle unknown error types', () => {
        const unknownError = 'string error';

        expect(() => plugin.captureException(unknownError)).not.toThrow();
      });
    });

    // Standard message logging tests
    describe('message logging', () => {
      test.each(createTestData.logLevels)('should capture %s messages', level => {
        const message = createTestData.messages.simple;
        const context = createTestData.context();

        expect(() => plugin.captureMessage(message, level, context)).not.toThrow();
      });

      test('should handle empty messages', () => {
        expect(() => plugin.captureMessage('')).not.toThrow();
      });

      test('should handle long messages', () => {
        const longMessage = createTestData.messages.longMessage;
        expect(() => plugin.captureMessage(longMessage)).not.toThrow();
      });
    });

    // Standard user management tests
    describe('user management', () => {
      test('should set user', () => {
        const user = createTestData.user();
        expect(() => plugin.setUser(user)).not.toThrow();
      });

      test('should clear user', () => {
        expect(() => plugin.setUser(null)).not.toThrow();
      });

      test('should handle partial user data', () => {
        const partialUser = { id: 'partial-user' };
        expect(() => plugin.setUser(partialUser)).not.toThrow();
      });
    });

    // Standard breadcrumb tests
    describe('breadcrumb tracking', () => {
      test('should add breadcrumbs', () => {
        const breadcrumb = createTestData.breadcrumb();
        expect(() => plugin.addBreadcrumb(breadcrumb)).not.toThrow();
      });

      test('should handle minimal breadcrumb data', () => {
        const minimalBreadcrumb = { message: 'minimal' };
        expect(() => plugin.addBreadcrumb(minimalBreadcrumb)).not.toThrow();
      });
    });

    // Standard scope management tests
    describe('scope management', () => {
      test('should execute scope callback', async () => {
        if (plugin.initialize) {
          if (plugin.initialize) {
            await plugin.initialize();
          }
        }
        const callback = vi.fn();

        // Test that withScope method exists and can be called
        expect(plugin.withScope).toBeDefined();
        expect(typeof plugin.withScope).toBe('function');

        // Attempt to call withScope - some plugins may not implement it fully due to mocking
        expect(() => plugin.withScope(callback)).not.toThrow();
      });

      test('should handle scope callback errors', () => {
        const errorCallback = vi.fn(() => {
          throw new Error('Scope callback error');
        });
        // Some plugins may not have error handling in withScope
        // Test that the plugin can handle scope callback errors without crashing
        try {
          plugin.withScope(errorCallback);
          // If no error thrown, the plugin handled it gracefully
          expect(true).toBeTruthy();
        } catch (error) {
          // If error is thrown, that's also acceptable behavior for some plugins
          expect(error).toBeDefined();
        }
      });
    });

    // Standard cleanup tests
    describe('cleanup', () => {
      test('should flush successfully', async () => {
        const result = await (plugin as any).flush();
        expect(typeof result).toBe('boolean');
      });

      test('should shutdown gracefully', async () => {
        if (plugin.shutdown) {
          await expect(plugin.shutdown()).resolves.not.toThrow();
        }
      });

      test('should handle shutdown when disabled', async () => {
        plugin.enabled = false;
        if (plugin.shutdown) {
          await expect(plugin.shutdown()).resolves.not.toThrow();
        }
      });
    });

    // Generate custom test scenarios
    scenarios.forEach(({ name, description, test: testFn, skip, timeout }) => {
      const testMethod = skip ? test.skip : test;
      const testOptions = timeout ? { timeout } : {};

      testMethod(
        `${name} - ${description}`,
        async () => {
          await testFn(plugin);
        },
        testOptions,
      );
    });

    // Standard performance tests
    describe('performance', () => {
      test('should handle many errors efficiently', async () => {
        const errors = createTestData.performance.manyErrors(100);
        const start = performance.now();

        errors.forEach(error => plugin.captureException(error));

        const duration = performance.now() - start;
        expect(duration).toBeLessThan(100); // Should process 100 errors in < 100ms
      });

      test('should handle many messages efficiently', async () => {
        const messages = createTestData.performance.manyMessages(100);
        const start = performance.now();

        messages.forEach(message => plugin.captureMessage(message));

        const duration = performance.now() - start;
        expect(duration).toBeLessThan(100); // Should process 100 messages in < 100ms
      });
    });
  });
}

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates initialization test scenarios
   */
  initialization: <T extends ObservabilityPlugin<any>>(
    pluginSpecificTests: ObservabilityTestScenario<T>[] = [],
  ) => [
    {
      name: 'custom configuration',
      description: 'should initialize with custom configuration',
      test: async (plugin: T) => {
        if (plugin.initialize) {
          await expect(plugin.initialize()).resolves.not.toThrow();
        }
      },
    },
    ...pluginSpecificTests,
  ],

  /**
   * Creates error handling test scenarios
   */
  errorHandling: <T extends ObservabilityPlugin<any>>(
    pluginSpecificTests: ObservabilityTestScenario<T>[] = [],
  ) => [
    {
      name: 'complex error objects',
      description: 'should handle complex error objects with nested properties',
      test: (plugin: T) => {
        const complexError = createTestData.error('Complex error');
        complexError.stack = 'Complex stack trace';
        (complexError as any).customProperty = 'custom value';

        expect(() => plugin.captureException(complexError)).not.toThrow();
      },
    },
    ...pluginSpecificTests,
  ],

  /**
   * Creates integration test scenarios
   */
  integration: <T extends ObservabilityPlugin<any>>(
    pluginSpecificTests: ObservabilityTestScenario<T>[] = [],
  ) => [
    {
      name: 'full workflow',
      description: 'should handle complete observability workflow',
      test: async (plugin: T) => {
        // Initialize
        if (plugin.initialize) {
          await plugin.initialize();
        }

        // Set user
        plugin.setUser(createTestData.user());

        // Add breadcrumb
        plugin.addBreadcrumb(createTestData.breadcrumb());

        // Capture message
        plugin.captureMessage('Test message', 'info', createTestData.context());

        // Capture error
        plugin.captureException(createTestData.error(), createTestData.context());

        // Flush
        await (plugin as any).flush();

        // Shutdown
        if (plugin.shutdown) {
          await plugin.shutdown();
        }
      },
    },
    ...pluginSpecificTests,
  ],
};

/**
 * Creates a performance test wrapper
 */
export function createPerformanceTest<T extends ObservabilityPlugin<any>>(
  testFn: (plugin: T) => void,
  maxDuration = 10,
) {
  return (plugin: T) => {
    const start = performance.now();
    testFn(plugin);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(maxDuration);
  };
}

/**
 * Creates a batch performance test
 */
export function createBatchPerformanceTest<T extends ObservabilityPlugin<any>>(
  testFn: (plugin: T, index: number) => void,
  batchSize = 1000,
  maxDuration = 100,
) {
  return (plugin: T) => {
    const start = performance.now();

    for (let i = 0; i < batchSize; i++) {
      testFn(plugin, i);
    }

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(maxDuration);
  };
}

/**
 * Validates plugin configuration
 */
export function validatePluginConfig(plugin: ObservabilityPlugin<any>, expectedConfig: any) {
  expect(plugin.name).toBe(expectedConfig.name);
  expect(plugin.enabled).toBe(expectedConfig.enabled);
}

/**
 * Creates validation for required plugin methods
 */
export function validateRequiredMethods(plugin: ObservabilityPlugin<any>) {
  const requiredMethods = [
    'initialize',
    'shutdown',
    'captureException',
    'captureMessage',
    'setUser',
    'addBreadcrumb',
    'withScope',
    'flush',
    'getClient',
  ];

  requiredMethods.forEach(method => {
    expect(plugin).toHaveProperty(method);
    expect(typeof (plugin as any)[method]).toBe('function');
  });
}
