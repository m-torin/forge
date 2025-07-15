/**
 * Shared test utilities for observability tests
 * Reduces code duplication and provides consistent test patterns
 */

import type { ObservabilityPlugin, ObservabilityServerPlugin } from '#/core/plugin';
import type { Breadcrumb, LogLevel, ObservabilityContext, ObservabilityUser } from '#/core/types';
import { expect, vi } from 'vitest';

// ============================================================================
// MOCK PLUGINS
// ============================================================================

/**
 * Mock implementation of ObservabilityPlugin for testing
 */
export class MockObservabilityPlugin implements ObservabilityPlugin<any> {
  name = 'mock';
  enabled = true;

  // Mock methods with proper vi.fn() typing
  captureException = vi.fn();
  captureMessage = vi.fn();
  setUser = vi.fn();
  addBreadcrumb = vi.fn();
  withScope = vi.fn();
  flush = vi.fn().mockResolvedValue(true);
  getClient = vi.fn();
  initialize = vi.fn().mockResolvedValue(undefined);
  shutdown = vi.fn().mockResolvedValue(undefined);

  constructor(config: Partial<{ name: string; enabled: boolean }> = {}) {
    this.name = config.name || 'mock';
    this.enabled = config.enabled ?? true;
  }

  /**
   * Reset all mocks to their initial state
   */
  resetMocks() {
    vi.clearAllMocks();
  }
}

/**
 * Mock implementation of ObservabilityServerPlugin for testing
 */
export class MockObservabilityServerPlugin
  extends MockObservabilityPlugin
  implements ObservabilityServerPlugin<any>
{
  name = 'mock-server';

  constructor(config: Partial<{ name: string; enabled: boolean }> = {}) {
    super(config);
    this.name = config.name || 'mock-server';
  }
}

/**
 * Creates a mock plugin with configurable behavior
 */
export function createMockPlugin(overrides: Partial<ObservabilityPlugin<any>> = {}) {
  const plugin = new MockObservabilityPlugin();

  // Apply overrides
  Object.assign(plugin, overrides);

  return plugin;
}

/**
 * Creates a mock server plugin with configurable behavior
 */
export function createMockServerPlugin(overrides: Partial<ObservabilityServerPlugin<any>> = {}) {
  const plugin = new MockObservabilityServerPlugin();

  // Apply overrides
  Object.assign(plugin, overrides);

  return plugin;
}

// ============================================================================
// MOCK FACTORIES
// ============================================================================

/**
 * Creates a mock plugin that simulates initialization failure
 */
export function createFailingInitializationPlugin(errorMessage = 'Initialization failed') {
  const plugin = createMockPlugin();
  plugin.initialize.mockRejectedValue(new Error(errorMessage));
  return plugin;
}

/**
 * Creates a mock plugin that simulates shutdown failure
 */
export function createFailingShutdownPlugin(errorMessage = 'Shutdown failed') {
  const plugin = createMockPlugin();
  plugin.shutdown.mockRejectedValue(new Error(errorMessage));
  return plugin;
}

/**
 * Creates a mock plugin that simulates flush failure
 */
export function createFailingFlushPlugin(errorMessage = 'Flush failed') {
  const plugin = createMockPlugin();
  (plugin as any).flush.mockRejectedValue(new Error(errorMessage));
  return plugin;
}

/**
 * Creates a disabled mock plugin
 */
export function createDisabledPlugin() {
  return createMockPlugin({ enabled: false });
}

/**
 * Creates a mock plugin that tracks method calls
 */
export function createTrackingPlugin() {
  const plugin = createMockPlugin();
  const callLog: Array<{ method: string; args: any[] }> = [];

  // Override methods to track calls
  const originalCaptureException = plugin.captureException;
  const originalCaptureMessage = plugin.captureMessage;
  const originalSetUser = plugin.setUser;
  const originalAddBreadcrumb = plugin.addBreadcrumb;

  vi.spyOn(plugin, 'captureException').mockImplementation((...args) => {
    callLog.push({ method: 'captureException', args });
    return originalCaptureException(...args);
  });

  vi.spyOn(plugin, 'captureMessage').mockImplementation((...args) => {
    callLog.push({ method: 'captureMessage', args });
    return originalCaptureMessage(...args);
  });

  vi.spyOn(plugin, 'setUser').mockImplementation((...args) => {
    callLog.push({ method: 'setUser', args });
    return originalSetUser(...args);
  });

  vi.spyOn(plugin, 'addBreadcrumb').mockImplementation((...args) => {
    callLog.push({ method: 'addBreadcrumb', args });
    return originalAddBreadcrumb(...args);
  });

  // Add method to get call log
  (plugin as any).getCallLog = () => callLog;
  (plugin as any).clearCallLog = () => (callLog.length = 0);

  return plugin;
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Validates that a plugin has the correct structure
 */
export function validatePluginStructure(plugin: ObservabilityPlugin<any>) {
  expect(plugin).toHaveProperty('name');
  expect(plugin).toHaveProperty('enabled');
  expect(plugin).toHaveProperty('initialize');
  expect(plugin).toHaveProperty('shutdown');
  expect(plugin).toHaveProperty('captureException');
  expect(plugin).toHaveProperty('captureMessage');
  expect(plugin).toHaveProperty('setUser');
  expect(plugin).toHaveProperty('addBreadcrumb');
  expect(plugin).toHaveProperty('withScope');
  expect(plugin).toHaveProperty('flush');
  expect(plugin).toHaveProperty('getClient');

  expect(typeof plugin.name).toBe('string');
  expect(typeof plugin.enabled).toBe('boolean');
  expect(typeof plugin.initialize).toBe('function');
  expect(typeof plugin.shutdown).toBe('function');
  expect(typeof plugin.captureException).toBe('function');
  expect(typeof plugin.captureMessage).toBe('function');
  expect(typeof plugin.setUser).toBe('function');
  expect(typeof plugin.addBreadcrumb).toBe('function');
  expect(typeof plugin.withScope).toBe('function');
  expect(typeof (plugin as any).flush).toBe('function');
  expect(typeof plugin.getClient).toBe('function');
}

/**
 * Validates that a plugin was called with the correct arguments
 */
export function validatePluginCall(
  mockFn: ReturnType<typeof vi.fn>,
  expectedArgs: any[],
  callIndex = 0,
) {
  expect(mockFn).toHaveBeenCalledTimes(callIndex + 1);
  expect(mockFn).toHaveBeenNthCalledWith(callIndex + 1, ...expectedArgs);
}

/**
 * Validates that a plugin method was not called
 */
export function validatePluginNotCalled(mockFn: ReturnType<typeof vi.fn>) {
  expect(mockFn).not.toHaveBeenCalled();
}

/**
 * Validates that a plugin's captureException was called correctly
 */
export function validateCaptureException(
  plugin: MockObservabilityPlugin,
  expectedError: Error,
  expectedContext?: ObservabilityContext,
  callIndex = 0,
) {
  if (expectedContext) {
    validatePluginCall(plugin.captureException, [expectedError, expectedContext], callIndex);
  } else {
    validatePluginCall(plugin.captureException, [expectedError], callIndex);
  }
}

/**
 * Validates that a plugin's captureMessage was called correctly
 */
export function validateCaptureMessage(
  plugin: MockObservabilityPlugin,
  expectedMessage: string,
  expectedLevel?: LogLevel,
  expectedContext?: ObservabilityContext,
  callIndex = 0,
) {
  const args: any[] = [expectedMessage];
  if (expectedLevel) args.push(expectedLevel);
  if (expectedContext) args.push(expectedContext);

  validatePluginCall(plugin.captureMessage, args, callIndex);
}

/**
 * Validates that a plugin's setUser was called correctly
 */
export function validateSetUser(
  plugin: MockObservabilityPlugin,
  expectedUser: ObservabilityUser | null,
  callIndex = 0,
) {
  validatePluginCall(plugin.setUser, [expectedUser], callIndex);
}

/**
 * Validates that a plugin's addBreadcrumb was called correctly
 */
export function validateAddBreadcrumb(
  plugin: MockObservabilityPlugin,
  expectedBreadcrumb: Breadcrumb,
  callIndex = 0,
) {
  validatePluginCall(plugin.addBreadcrumb, [expectedBreadcrumb], callIndex);
}

/**
 * Validates that all plugins in a list were called with the same arguments
 */
export function validateAllPluginsCalled(
  plugins: MockObservabilityPlugin[],
  method: keyof MockObservabilityPlugin,
  expectedArgs: any[],
) {
  plugins.forEach(plugin => {
    const mockFn = plugin[method] as ReturnType<typeof vi.fn>;
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  });
}

/**
 * Validates that only enabled plugins were called
 */
export function validateOnlyEnabledPluginsCalled(
  plugins: MockObservabilityPlugin[],
  method: keyof MockObservabilityPlugin,
  expectedArgs: any[],
) {
  plugins.forEach(plugin => {
    const mockFn = plugin[method] as ReturnType<typeof vi.fn>;
    if (plugin.enabled) {
      expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
    } else {
      expect(mockFn).not.toHaveBeenCalled();
    }
  });
}

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Creates test error objects with various characteristics
 */
export function createTestError(overrides: Partial<Error> = {}) {
  const error = new Error('Test error');
  error.name = 'TestError';
  error.stack = `TestError: Test error
    at testFunction (test.js:123:45)`;

  return Object.assign(error, overrides);
}

/**
 * Creates test context objects with various characteristics
 */
export function createTestContext(
  overrides: Partial<ObservabilityContext> = {},
): ObservabilityContext {
  return {
    extra: {
      userId: 'test-user-123',
      sessionId: 'test-session-456',
      feature: 'test-feature',
      component: 'TestComponent',
      action: 'test-action',
      ...(overrides.extra || {}),
    },
    tags: {
      environment: 'test',
      service: 'test-service',
      version: '1.0.0',
      team: 'test-team',
      ...(overrides.tags || {}),
    },
    ...overrides,
  };
}

/**
 * Creates test user objects with various characteristics
 */
export function createTestUser(overrides: Partial<ObservabilityUser> = {}): ObservabilityUser {
  return {
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    ip_address: '192.168.1.1',
    segment: 'test',
    ...overrides,
  };
}

/**
 * Creates test breadcrumb objects with various characteristics
 */
export function createTestBreadcrumb(overrides: Partial<Breadcrumb> = {}): Breadcrumb {
  return {
    message: 'Test breadcrumb',
    level: 'info',
    category: 'test',
    timestamp: Date.now() / 1000,
    data: {
      action: 'test-action',
      component: 'TestComponent',
    },
    ...overrides,
  };
}

// ============================================================================
// SCENARIO GENERATORS
// ============================================================================

/**
 * Generates test scenarios for plugin lifecycle testing
 */
export function generateLifecycleScenarios(plugin: MockObservabilityPlugin) {
  return [
    {
      name: 'initialization',
      description: 'should initialize plugin successfully',
      test: async () => {
        await plugin.initialize();
        expect(plugin.initialize).toHaveBeenCalledTimes(1);
      },
    },
    {
      name: 'shutdown',
      description: 'should shutdown plugin successfully',
      test: async () => {
        await plugin.shutdown();
        expect(plugin.shutdown).toHaveBeenCalledTimes(1);
      },
    },
    {
      name: 'flush',
      description: 'should flush plugin successfully',
      test: async () => {
        const result = await (plugin as any).flush();
        expect(result).toBeTruthy();
        expect((plugin as any).flush).toHaveBeenCalledTimes(1);
      },
    },
  ];
}

/**
 * Generates test scenarios for plugin error handling
 */
export function generateErrorHandlingScenarios(plugin: MockObservabilityPlugin) {
  return [
    {
      name: 'basic error',
      description: 'should capture basic error',
      test: () => {
        const error = createTestError();
        plugin.captureException(error);
        validateCaptureException(plugin, error);
      },
    },
    {
      name: 'error with context',
      description: 'should capture error with context',
      test: () => {
        const error = createTestError();
        const context = createTestContext();
        plugin.captureException(error, context);
        validateCaptureException(plugin, error, context);
      },
    },
    {
      name: 'string error',
      description: 'should handle string error',
      test: () => {
        const error = 'String error message';
        plugin.captureException(error);
        expect(plugin.captureException).toHaveBeenCalledWith(error);
      },
    },
  ];
}

/**
 * Generates test scenarios for plugin message handling
 */
export function generateMessageHandlingScenarios(plugin: MockObservabilityPlugin) {
  const levels: LogLevel[] = ['debug', 'info', 'warning', 'error'];

  return levels.map(level => ({
    name: `${level} message`,
    description: `should capture ${level} message`,
    test: () => {
      const message = `Test ${level} message`;
      const context = createTestContext();
      plugin.captureMessage(message, level, context);
      validateCaptureMessage(plugin, message, level, context);
    },
  }));
}

/**
 * Generates test scenarios for plugin user management
 */
export function generateUserManagementScenarios(plugin: MockObservabilityPlugin) {
  return [
    {
      name: 'set user',
      description: 'should set user successfully',
      test: () => {
        const user = createTestUser();
        plugin.setUser(user);
        validateSetUser(plugin, user);
      },
    },
    {
      name: 'clear user',
      description: 'should clear user successfully',
      test: () => {
        plugin.setUser(null);
        validateSetUser(plugin, null);
      },
    },
    {
      name: 'partial user',
      description: 'should handle partial user data',
      test: () => {
        const partialUser = { id: 'partial-user' };
        plugin.setUser(partialUser);
        validateSetUser(plugin, partialUser);
      },
    },
  ];
}

/**
 * Generates test scenarios for plugin breadcrumb handling
 */
export function generateBreadcrumbScenarios(plugin: MockObservabilityPlugin) {
  return [
    {
      name: 'basic breadcrumb',
      description: 'should add basic breadcrumb',
      test: () => {
        const breadcrumb = createTestBreadcrumb();
        plugin.addBreadcrumb(breadcrumb);
        validateAddBreadcrumb(plugin, breadcrumb);
      },
    },
    {
      name: 'minimal breadcrumb',
      description: 'should handle minimal breadcrumb data',
      test: () => {
        const breadcrumb = { message: 'Minimal breadcrumb' };
        plugin.addBreadcrumb(breadcrumb);
        validateAddBreadcrumb(plugin, breadcrumb);
      },
    },
    {
      name: 'breadcrumb with data',
      description: 'should handle breadcrumb with custom data',
      test: () => {
        const breadcrumb = createTestBreadcrumb({
          data: { custom: 'data', nested: { key: 'value' } },
        });
        plugin.addBreadcrumb(breadcrumb);
        validateAddBreadcrumb(plugin, breadcrumb);
      },
    },
  ];
}

// ============================================================================
// PERFORMANCE TEST HELPERS
// ============================================================================

/**
 * Measures execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => T | Promise<T>,
  iterations = 1000,
): Promise<{ result: T; averageTime: number; totalTime: number }> {
  const start = performance.now();
  let result!: T;

  for (let i = 0; i < iterations; i++) {
    result = await fn();
  }

  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;

  return { result, averageTime, totalTime };
}

/**
 * Validates performance benchmarks
 */
export function validatePerformance(
  averageTime: number,
  maxAllowedTime = 1, // 1ms default
  operation = 'operation',
) {
  expect(averageTime).toBeLessThan(maxAllowedTime);

  if (averageTime > maxAllowedTime * 0.8) {
    console.warn(
      `Performance warning: ${operation} took ${averageTime.toFixed(2)}ms (threshold: ${maxAllowedTime}ms)`,
    );
  }
}

/**
 * Creates a performance test for plugin operations
 */
export function createPluginPerformanceTest(
  plugin: MockObservabilityPlugin,
  operation: 'captureException' | 'captureMessage' | 'setUser' | 'addBreadcrumb',
  testData: any[],
  maxTime = 10,
) {
  return async () => {
    const { averageTime } = await measureExecutionTime(() => {
      testData.forEach(data => {
        if (operation === 'captureException') {
          plugin.captureException(data);
        } else if (operation === 'captureMessage') {
          plugin.captureMessage(data);
        } else if (operation === 'setUser') {
          plugin.setUser(data);
        } else if (operation === 'addBreadcrumb') {
          plugin.addBreadcrumb(data);
        }
      });
    }, testData.length);

    validatePerformance(averageTime, maxTime, operation);
  };
}

// ============================================================================
// INTEGRATION TEST HELPERS
// ============================================================================

/**
 * Runs a complete plugin integration test
 */
export async function runPluginIntegrationTest(plugin: MockObservabilityPlugin) {
  // Initialize
  await plugin.initialize();
  expect(plugin.initialize).toHaveBeenCalledTimes(1);

  // Set user
  const user = createTestUser();
  plugin.setUser(user);
  validateSetUser(plugin, user);

  // Add breadcrumb
  const breadcrumb = createTestBreadcrumb();
  plugin.addBreadcrumb(breadcrumb);
  validateAddBreadcrumb(plugin, breadcrumb);

  // Capture message
  const message = 'Integration test message';
  const context = createTestContext();
  plugin.captureMessage(message, 'info', context);
  validateCaptureMessage(plugin, message, 'info', context);

  // Capture error
  const error = createTestError();
  plugin.captureException(error, context);
  validateCaptureException(plugin, error, context);

  // Use scope
  const scopeCallback = vi.fn();
  plugin.withScope(scopeCallback);
  expect(scopeCallback).toHaveBeenCalledTimes(1);

  // Flush
  const flushResult = await (plugin as any).flush();
  expect(flushResult).toBeTruthy();

  // Shutdown
  await plugin.shutdown();
  expect(plugin.shutdown).toHaveBeenCalledTimes(1);
}

/**
 * Creates a standardized test suite for any plugin
 */
export function createStandardPluginTestSuite(
  pluginName: string,
  createPlugin: () => MockObservabilityPlugin,
) {
  return {
    structure: () => validatePluginStructure(createPlugin()),
    lifecycle: () => generateLifecycleScenarios(createPlugin()),
    errorHandling: () => generateErrorHandlingScenarios(createPlugin()),
    messageHandling: () => generateMessageHandlingScenarios(createPlugin()),
    userManagement: () => generateUserManagementScenarios(createPlugin()),
    breadcrumbs: () => generateBreadcrumbScenarios(createPlugin()),
    integration: () => runPluginIntegrationTest(createPlugin()),
  };
}
