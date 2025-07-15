/**
 * Common test patterns and utilities
 * Reduces duplication in assertion patterns and test scenarios
 */

import { renderHook, type RenderHookResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, vi, type Mock } from 'vitest';

/**
 * Standard mock provider for orchestration tests
 * Type-aware provider mock factory with common scenarios
 */
export function createStandardMockProvider(
  type: 'workflow' | 'qstash' | 'redis' = 'workflow',
  overrides: any = {},
) {
  const baseMethods = {
    name: 'test-provider',
    version: '1.0.0',
    healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  };

  const workflowMethods = {
    execute: vi.fn().mockResolvedValue({ id: 'exec-1', status: 'running' }),
    getExecution: vi.fn(),
    listExecutions: vi.fn(),
    cancelExecution: vi.fn(),
    scheduleWorkflow: vi.fn(),
    unscheduleWorkflow: vi.fn(),
  };

  const qstashMethods = {
    publishJSON: vi.fn(),
    schedules: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  };

  const redisMethods = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  };

  const typeMethods = {
    workflow: workflowMethods,
    qstash: qstashMethods,
    redis: redisMethods,
  };

  return {
    ...baseMethods,
    ...typeMethods[type],
    ...overrides,
  };
}

/**
 * Mock lifecycle management for consistent setup/cleanup
 */
export function createMockLifecycle() {
  return {
    beforeEach: () => {
      vi.clearAllMocks();
    },
    afterEach: () => {
      vi.restoreAllMocks();
    },
    setup: () => {
      const lifecycle = createMockLifecycle();
      beforeEach(lifecycle.beforeEach);
      afterEach(lifecycle.afterEach);
      return lifecycle;
    },
  };
}

/**
 * Create React hook test scenarios
 * Standardizes hook testing patterns across client tests
 */
export function createHookTestScenarios() {
  const mockProvider = createStandardMockProvider();

  return {
    mockProvider,

    // Standard hook options for testing
    enabledOptions: {
      provider: mockProvider,
      enabled: true,
      autoRefresh: false,
    },

    disabledOptions: {
      provider: mockProvider,
      enabled: false,
    },

    nullProviderOptions: {
      provider: null,
      enabled: true,
    },

    // Helper to test hook with different scenarios
    testHookScenarios: async function <T>(
      hookFactory: (options: any) => T,
      scenarios: Array<{ name: string; options: any; expectation?: (result: any) => void }>,
    ) {
      const results: Array<{ name: string; result: RenderHookResult<T, any> }> = [];

      for (const scenario of scenarios) {
        const hookResult = renderHook(() => hookFactory(scenario.options));
        results.push({ name: scenario.name, result: hookResult });

        if (scenario.expectation) {
          scenario.expectation(hookResult.result.current);
        }
      }

      return results;
    },
  };
}

/**
 * Hook testing helper utilities
 */
export function createHookTestHelper() {
  return {
    testHook: <T>(hookFn: () => T, expectations?: (result: T) => void) => {
      const { result } = renderHook(hookFn);

      if (expectations) {
        expectations(result.current);
      }

      return result;
    },

    testHookMethods: (hookResult: any, methods: string[]) => {
      methods.forEach(method => {
        const methodType = hookResult?.[method] ? typeof hookResult[method] : 'undefined';
        expect(['function', 'undefined']).toContain(methodType);
      });
    },

    testHookWithRetry: async <T>(
      hookFn: () => T,
      condition: (result: T) => boolean,
      timeout = 5000,
    ) => {
      let result: RenderHookResult<T, any>;
      const startTime = Date.now();

      do {
        result = renderHook(hookFn);
        if (condition(result.result.current)) {
          return result;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } while (Date.now() - startTime < timeout);

      throw new Error('Hook condition not met within timeout');
    },
  };
}

/**
 * API handler testing patterns
 * Standardizes Next.js API route testing
 */
export function createApiTestPatterns() {
  const createMockRequest = (method: string, data?: any, url?: string) => ({
    method,
    json: vi.fn().mockResolvedValue(data || {}),
    url: url || 'http://localhost:3000/api/test',
    headers: new Map([['content-type', 'application/json']]),
  });

  const createMockResponse = (data: any, status = 200) => ({
    json: vi.fn().mockResolvedValue(data),
    status,
    headers: new Map(),
  });

  return {
    createMockRequest,
    createMockResponse,

    // Standard request scenarios
    postRequest: (data: any) => createMockRequest('POST', data),
    getRequest: (url?: string) => createMockRequest('GET', undefined, url),
    putRequest: (data: any) => createMockRequest('PUT', data),
    deleteRequest: () => createMockRequest('DELETE'),

    // Test handler with different HTTP methods
    testHandlerMethods: async function (
      handler: (req: any) => Promise<any>,
      scenarios: Array<{ method: string; data?: any; expectation?: (response: any) => void }>,
    ) {
      const results = [];

      for (const scenario of scenarios) {
        const request = createMockRequest(scenario.method, scenario.data);
        const response = await handler(request);
        results.push({ method: scenario.method, response });

        if (scenario.expectation) {
          scenario.expectation(response);
        }
      }

      return results;
    },

    // Test handler with multiple scenarios
    testHandlerWithScenarios: async function (
      handler: (req: any) => Promise<any>,
      scenarios: Array<{
        name: string;
        method: string;
        data?: any;
        expectedStatus?: number;
        expectedResponse?: any;
      }>,
    ) {
      const results = [];

      for (const scenario of scenarios) {
        const request = createMockRequest(scenario.method, scenario.data);
        const response = await handler(request);

        if (scenario.expectedStatus) {
          expect(response.status).toBe(scenario.expectedStatus);
        }

        if (scenario.expectedResponse) {
          expect(response).toMatchObject(scenario.expectedResponse);
        }

        results.push({ scenario: scenario.name, response });
      }

      return results;
    },
  };
}

/**
 * Error testing patterns
 * Standardizes error handling tests
 */
export function createErrorTestPatterns() {
  const networkError = new Error('Network error');
  const timeoutError = new Error('Timeout');
  const validationError = new Error('Validation failed');
  const providerError = new Error('Provider error');

  return {
    networkError,
    timeoutError,
    validationError,
    providerError,

    // Mock functions that fail with specific errors
    createFailingMock: (error: Error) => vi.fn().mockRejectedValue(error),

    // Test error scenarios
    testErrorHandling: async function (testFn: () => Promise<any>, expectedError: Error | string) {
      try {
        await testFn();
        throw new Error('Expected function to throw');
      } catch (error: any) {
        if (typeof expectedError === 'string') {
          expect(error.message).toContain(expectedError);
        } else {
          expect(error).toBe(expectedError);
        }
      }
    },

    // Create error scenarios for a base function
    createErrorScenarios: (baseFunction: () => Mock) => ({
      networkError: () => baseFunction().mockRejectedValue(networkError),
      timeoutError: () => baseFunction().mockRejectedValue(timeoutError),
      validationError: () => baseFunction().mockRejectedValue(validationError),
      providerError: () => baseFunction().mockRejectedValue(providerError),
    }),

    // Test multiple error scenarios
    testErrorScenarios: async function (
      scenarios: Record<string, () => Promise<any>>,
      expectedErrors: Record<string, string>,
    ) {
      const results = [];

      for (const [name, scenarioFn] of Object.entries(scenarios)) {
        const expectedError = expectedErrors[name];

        try {
          await scenarioFn();
          throw new Error(`Expected ${name} to throw`);
        } catch (error: any) {
          if (expectedError) {
            expect(error.message).toContain(expectedError);
          }
          results.push({ scenario: name, error });
        }
      }

      return results;
    },
  };
}

/**
 * Workflow testing patterns
 * Specific to orchestration workflow testing
 */
export function createWorkflowTestPatterns() {
  const createMockWorkflow = (overrides: any = {}) => ({
    id: 'test-workflow',
    name: 'Test Workflow',
    version: '1.0.0',
    steps: [
      {
        id: 'step-1',
        name: 'Test Step',
        action: 'test-action',
      },
    ],
    ...overrides,
  });

  const createMockExecution = (overrides: any = {}) => ({
    id: 'exec_123',
    startedAt: new Date(),
    status: 'running' as const,
    steps: [],
    workflowId: 'test-workflow',
    ...overrides,
  });

  const createMockStep = (overrides: any = {}) => ({
    id: 'step-1',
    name: 'Test Step',
    action: 'test-action',
    status: 'pending' as const,
    ...overrides,
  });

  return {
    createMockWorkflow,
    createMockExecution,
    createMockStep,

    // Standard execution scenarios
    successfulExecution: createMockExecution({
      status: 'completed',
      completedAt: new Date(),
      output: { success: true },
    }),

    failedExecution: createMockExecution({
      status: 'failed',
      error: { message: 'Execution failed' },
    }),

    runningExecution: createMockExecution({
      status: 'running',
    }),

    // Standard workflow scenarios
    simpleWorkflow: createMockWorkflow(),

    complexWorkflow: createMockWorkflow({
      steps: [
        createMockStep({ name: 'Step 1' }),
        createMockStep({ name: 'Step 2' }),
        createMockStep({ name: 'Step 3' }),
      ],
    }),

    // Test workflow execution lifecycle
    testWorkflowLifecycle: async function (
      executeFn: (workflow: any) => Promise<any>,
      workflow: any = createMockWorkflow(),
    ) {
      const execution = await executeFn(workflow);
      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.workflowId).toBe(workflow.id);
      return execution;
    },
  };
}

/**
 * Validation testing patterns
 * Common validation test scenarios
 */
export function createValidationTestPatterns() {
  return {
    // Test valid/invalid input scenarios
    testValidation: function <T>(
      validatorFn: (input: any) => T,
      scenarios: Array<{
        name: string;
        input: any;
        shouldPass: boolean;
        expectedError?: string;
      }>,
    ) {
      const results = [];

      for (const scenario of scenarios) {
        try {
          const result = validatorFn(scenario.input);
          if (!scenario.shouldPass) {
            throw new Error(`Expected validation to fail for ${scenario.name}`);
          }
          results.push({ name: scenario.name, success: true, result });
        } catch (error: any) {
          if (scenario.shouldPass) {
            throw new Error(`Unexpected validation failure for ${scenario.name}: ${error.message}`);
          }
          if (scenario.expectedError && !error.message.includes(scenario.expectedError)) {
            throw new Error(
              `Expected error containing "${scenario.expectedError}", got "${error.message}"`,
            );
          }
          results.push({ name: scenario.name, success: false, error });
        }
      }

      return results;
    },
  };
}

/**
 * Performance testing patterns
 * For testing timeouts and execution timing
 */
export function createPerformanceTestPatterns() {
  const measureExecutionTime = async (fn: () => Promise<any>) => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  };

  const createDelayedMock = (delay: number, returnValue?: any) =>
    vi.fn().mockImplementation(async () => {
      await new Promise((resolve: any) => setTimeout(resolve, delay));
      return returnValue;
    });

  return {
    measureExecutionTime,
    createDelayedMock,

    // Test timeout scenarios
    testTimeout: async function (
      fn: () => Promise<any>,
      expectedTimeoutMs: number,
      tolerance = 50,
    ) {
      const { duration } = await measureExecutionTime(fn);
      expect(duration).toBeGreaterThanOrEqual(expectedTimeoutMs - tolerance);
    },

    // Test performance characteristics
    testPerformance: async function (fn: () => Promise<any>, maxDurationMs: number) {
      const { duration } = await measureExecutionTime(fn);
      expect(duration).toBeLessThan(maxDurationMs);
    },

    // Create performance test scenarios
    createPerformanceScenarios: () => ({
      fast: createDelayedMock(10, { status: 'fast' }),
      medium: createDelayedMock(100, { status: 'medium' }),
      slow: createDelayedMock(1000, { status: 'slow' }),
    }),
  };
}

/**
 * Schedule testing patterns
 * For testing workflow scheduling scenarios
 */
export function createScheduleTestPatterns() {
  const createScheduleConfig = (overrides: any = {}) => ({
    cron: '0 9 * * *',
    timezone: 'UTC',
    workflowId: 'test-workflow',
    ...overrides,
  });

  return {
    createScheduleConfig,

    // Standard schedule scenarios
    dailySchedule: createScheduleConfig({ cron: '0 9 * * *' }),
    hourlySchedule: createScheduleConfig({ cron: '0 * * * *' }),
    weeklySchedule: createScheduleConfig({ cron: '0 9 * * 1' }),

    // Test schedule creation
    testScheduleCreation: async function (
      service: any,
      config: any = createScheduleConfig(),
      expectations?: (scheduleId: string) => void,
    ) {
      const scheduleId = await service.createSchedule(config.workflowId || 'test-workflow', config);

      expect(scheduleId).toBeDefined();

      if (expectations) {
        expectations(scheduleId);
      }

      return scheduleId;
    },

    // Test schedule patterns
    testSchedulePatterns: function (patterns: Array<{ cron: string; description: string }>) {
      patterns.forEach(pattern => {
        expect(pattern.cron).toMatch(/^[0-9*,\-/\s]+$/);
        expect(pattern.description).toBeTruthy();
      });
    },
  };
}

/**
 * Dynamic import testing helper
 * Simplifies import testing with built-in assertions
 */
export async function testModuleWithAssertion<T>(
  importFn: () => Promise<T>,
  callback?: (module: T) => void,
) {
  const module = await importFn();
  expect(module).toBeDefined();

  if (callback) {
    callback(module);
  }

  return module;
}

/**
 * Test data factory
 * Centralized test data creation
 */
export class TestDataFactory {
  static execution = {
    running: (overrides?: any) => ({
      id: 'exec_running',
      status: 'running' as const,
      startedAt: new Date(),
      workflowId: 'test-workflow',
      ...overrides,
    }),

    completed: (overrides?: any) => ({
      id: 'exec_completed',
      status: 'completed' as const,
      startedAt: new Date(),
      completedAt: new Date(),
      output: { success: true },
      workflowId: 'test-workflow',
      ...overrides,
    }),

    failed: (overrides?: any) => ({
      id: 'exec_failed',
      status: 'failed' as const,
      startedAt: new Date(),
      error: { message: 'Execution failed' },
      workflowId: 'test-workflow',
      ...overrides,
    }),
  };

  static workflow = {
    simple: (overrides?: any) => ({
      id: 'workflow_simple',
      name: 'Simple Workflow',
      version: '1.0.0',
      steps: [TestDataFactory.step.basic()],
      ...overrides,
    }),

    complex: (overrides?: any) => ({
      id: 'workflow_complex',
      name: 'Complex Workflow',
      version: '1.0.0',
      steps: [
        TestDataFactory.step.basic({ name: 'Step 1' }),
        TestDataFactory.step.basic({ name: 'Step 2' }),
        TestDataFactory.step.basic({ name: 'Step 3' }),
      ],
      ...overrides,
    }),
  };

  static step = {
    basic: (overrides?: any) => ({
      id: 'step_basic',
      name: 'Basic Step',
      action: 'test-action',
      status: 'pending' as const,
      ...overrides,
    }),

    withInput: (input: any, overrides?: any) => ({
      id: 'step_with_input',
      name: 'Step with Input',
      action: 'test-action',
      input,
      status: 'pending' as const,
      ...overrides,
    }),
  };
}

/**
 * Comprehensive test suite builder
 * Combines multiple patterns for full test coverage
 */
export function createTestSuite(moduleName: string) {
  const mockLifecycle = createMockLifecycle();
  const hooks = createHookTestScenarios();
  const hookHelper = createHookTestHelper();
  const api = createApiTestPatterns();
  const errors = createErrorTestPatterns();
  const workflows = createWorkflowTestPatterns();
  const validation = createValidationTestPatterns();
  const performance = createPerformanceTestPatterns();
  const schedules = createScheduleTestPatterns();

  return {
    moduleName,
    mockLifecycle,
    hooks,
    hookHelper,
    api,
    errors,
    workflows,
    validation,
    performance,
    schedules,

    // Test data factory
    data: TestDataFactory,

    // Helper to create consistent test descriptions
    describeModule: (callback: () => void) => {
      describe(moduleName, callback);
    },

    // Helper to create consistent test groups
    describeFeature: (featureName: string, callback: () => void) => {
      describe(`${moduleName} - ${featureName}`, callback);
    },

    // Setup test suite with mock lifecycle
    setupTestSuite: () => {
      return mockLifecycle.setup();
    },

    // Common test patterns
    testModuleImport: async (importFn: () => Promise<any>) => {
      return testModuleWithAssertion(importFn, module => {
        expect(module).toBeDefined();
      });
    },

    // Test provider scenarios
    testProviderScenarios: async function (
      provider: any,
      scenarios: Array<{ name: string; test: (provider: any) => Promise<void> }>,
    ) {
      for (const scenario of scenarios) {
        await scenario.test(provider);
      }
    },
  };
}
