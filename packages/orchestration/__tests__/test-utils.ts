/**
 * Consolidated Test Utils
 *
 * Centralized utilities for orchestration tests, combining and enhancing
 * the existing scattered utilities from the utils/ directory.
 *
 * Provides standardized patterns for:
 * - Import testing
 * - Assertion helpers
 * - Mock management
 * - Test data validation
 * - Performance measurement
 * - Error handling
 */

import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { testDataUtils } from './test-data-generators';

// Re-export and enhance existing utilities
export * from './utils/advanced-patterns';
export * from './utils/import-testing';
export * from './utils/test-patterns';

// Types for enhanced test utilities
export interface TestImportResult<T = any> {
  success: boolean;
  module?: T;
  error?: Error;
  exports?: string[];
  duration?: number;
}

export interface TestPerformanceResult {
  result: any;
  duration: number;
  memoryUsage?: number;
}

export interface TestValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TestMockScenario {
  name: string;
  setup: () => void;
  teardown?: () => void;
  expectedBehavior: string;
}

/**
 * Enhanced import testing utilities
 */
export class ImportTestUtils {
  /**
   * Test dynamic import with comprehensive error handling
   */
  static async testDynamicImport<T>(importFn: () => Promise<T>): Promise<TestImportResult<T>> {
    try {
      const startTime = Date.now();
      const module = await importFn();
      const duration = Date.now() - startTime;

      const exports = module && typeof module === 'object' ? Object.keys(module) : [];

      return {
        success: true,
        module,
        exports,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Test multiple imports in parallel
   */
  static async testParallelImports<T>(
    importFns: Array<() => Promise<T>>,
  ): Promise<TestImportResult<T>[]> {
    const results = await Promise.allSettled(importFns.map(fn => this.testDynamicImport(fn)));

    return results.map(result =>
      result.status === 'fulfilled'
        ? result.value
        : {
            success: false,
            error: result.reason,
          },
    );
  }

  /**
   * Test import with expected exports
   */
  static async testImportWithExpectedExports<T>(
    importFn: () => Promise<T>,
    expectedExports: string[],
  ): Promise<TestImportResult<T>> {
    const result = await this.testDynamicImport(importFn);

    if (result.success && result.module && result.exports) {
      const missingExports = expectedExports.filter(exp => !result.exports!.includes(exp));

      if (missingExports.length > 0) {
        return {
          success: false,
          error: new Error(`Missing exports: ${missingExports.join(', ')}`),
        };
      }
    }

    return result;
  }

  /**
   * Test import with timeout
   */
  static async testImportWithTimeout<T>(
    importFn: () => Promise<T>,
    timeoutMs = 5000,
  ): Promise<TestImportResult<T>> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Import timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
      const result = await Promise.race([this.testDynamicImport(importFn), timeoutPromise]);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

/**
 * Enhanced assertion utilities
 */
export class AssertionUtils {
  /**
   * Assert workflow structure
   */
  static assertWorkflow(workflow: any, expectedProperties: string[] = []) {
    expect(workflow).toBeDefined();
    expect(workflow.id).toBeDefined();
    expect(workflow.name).toBeDefined();
    expect(workflow.version).toBeDefined();
    expect(workflow.steps).toBeDefined();
    expect(Array.isArray(workflow.steps)).toBeTruthy();

    expectedProperties.forEach(prop => {
      expect(workflow).toHaveProperty(prop);
    });
  }

  /**
   * Assert workflow execution result
   */
  static assertWorkflowExecution(execution: any, expectedStatus?: string) {
    expect(execution).toBeDefined();
    expect(execution.id).toBeDefined();
    if (execution.workflowId) {
      expect(execution.workflowId).toBeDefined();
    }
    expect(execution.status).toBeDefined();

    if (expectedStatus) {
      expect(execution.status).toBe(expectedStatus);
    }

    const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    expect(validStatuses).toContain(execution.status);
  }

  /**
   * Assert workflow engine structure
   */
  static assertWorkflowEngine(engine: any) {
    expect(engine).toBeDefined();
    expect(engine.executeWorkflow).toBeDefined();
    expect(typeof engine.executeWorkflow).toBe('function');
    expect(engine.getExecution).toBeDefined();
    expect(typeof engine.getExecution).toBe('function');
    expect(engine.listExecutions).toBeDefined();
    expect(typeof engine.listExecutions).toBe('function');
    expect(engine.healthCheck).toBeDefined();
    expect(typeof engine.healthCheck).toBe('function');
  }

  /**
   * Assert step structure
   */
  static assertStep(step: any, expectedProperties: string[] = []) {
    expect(step).toBeDefined();
    expect(step.id).toBeDefined();
    expect(step.name).toBeDefined();
    expect(step.action).toBeDefined();

    expectedProperties.forEach(prop => {
      expect(step).toHaveProperty(prop);
    });
  }

  /**
   * Assert execution structure
   */
  static assertExecution(execution: any, expectedStatus?: string) {
    expect(execution).toBeDefined();
    expect(execution.id).toBeDefined();
    expect(execution.workflowId).toBeDefined();
    expect(execution.status).toBeDefined();
    expect(execution.startedAt).toBeDefined();

    if (expectedStatus) {
      expect(execution.status).toBe(expectedStatus);
    }

    const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    expect(validStatuses).toContain(execution.status);
  }

  /**
   * Assert provider interface
   */
  static assertProvider(provider: any, expectedType?: string) {
    expect(provider).toBeDefined();
    expect(provider.name).toBeDefined();
    expect(provider.type).toBeDefined();
    expect(provider.healthCheck).toBeDefined();
    expect(typeof provider.healthCheck).toBe('function');

    if (expectedType) {
      expect(provider.type).toBe(expectedType);
    }
  }

  /**
   * Assert health check result
   */
  static assertHealthCheck(health: any, expectedStatus = 'healthy') {
    expect(health).toBeDefined();
    expect(health.status).toBe(expectedStatus);

    if (expectedStatus === 'healthy') {
      expect(health.message).toBeDefined();
    } else {
      expect(health.error).toBeDefined();
    }
  }

  /**
   * Assert provider health array
   */
  static assertProviderHealthArray(healthArray: any) {
    expect(Array.isArray(healthArray)).toBeTruthy();
    healthArray.forEach((health: any) => {
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      const validStatuses = ['healthy', 'degraded', 'unhealthy'];
      expect(validStatuses).toContain(health.status);
      if (health.status !== 'healthy') {
        expect(health.error).toBeDefined();
      }
    });
  }

  /**
   * Assert error structure
   */
  static assertError(error: any, expectedMessage?: string) {
    expect(error).toBeDefined();
    expect(error.message).toBeDefined();

    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage);
    }
  }

  /**
   * Assert array of items with consistent structure
   */
  static assertArrayStructure<T>(
    array: T[],
    assertItem: (item: T) => void,
    expectedLength?: number,
  ) {
    expect(Array.isArray(array)).toBeTruthy();

    if (expectedLength !== undefined) {
      expect(array).toHaveLength(expectedLength);
    }

    array.forEach(assertItem);
  }

  /**
   * Assert deep object equality with helpful error messages
   */
  static assertDeepEqual(actual: any, expected: any, path = '') {
    if (typeof expected !== typeof actual) {
      throw new Error(
        `Type mismatch at ${path}: expected ${typeof expected}, got ${typeof actual}`,
      );
    }

    if (expected === null || actual === null) {
      expect(actual).toBe(expected);
      return;
    }

    if (typeof expected === 'object' && !Array.isArray(expected)) {
      Object.keys(expected).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        this.assertDeepEqual(actual[key], expected[key], newPath);
      });
    } else {
      expect(actual).toStrictEqual(expected);
    }
  }
}

/**
 * Enhanced performance testing utilities
 */
export class PerformanceUtils {
  /**
   * Measure execution time with optional memory tracking
   */
  static async measurePerformance<T>(
    fn: () => Promise<T>,
    options: { trackMemory?: boolean } = {},
  ): Promise<TestPerformanceResult> {
    const startTime = Date.now();
    let startMemory: number | undefined;

    if (options.trackMemory && typeof process !== 'undefined' && process.memoryUsage) {
      startMemory = process.memoryUsage().heapUsed;
    }

    const result = await fn();

    const duration = Date.now() - startTime;
    let memoryUsage: number | undefined;

    if (startMemory && typeof process !== 'undefined' && process.memoryUsage) {
      const endMemory = process.memoryUsage().heapUsed;
      memoryUsage = endMemory - startMemory;
    }

    return {
      result,
      duration,
      memoryUsage,
    };
  }

  /**
   * Test performance with assertions
   */
  static async testPerformance<T>(
    fn: () => Promise<T>,
    maxDuration: number,
    maxMemory?: number,
  ): Promise<TestPerformanceResult> {
    const performance = await this.measurePerformance(fn, { trackMemory: !!maxMemory });

    expect(performance.duration).toBeLessThan(maxDuration);

    if (maxMemory && performance.memoryUsage) {
      expect(performance.memoryUsage).toBeLessThan(maxMemory);
    }

    return performance;
  }

  /**
   * Run performance benchmark
   */
  static async benchmark<T>(
    fn: () => Promise<T>,
    iterations = 10,
  ): Promise<{
    average: number;
    min: number;
    max: number;
    results: TestPerformanceResult[];
  }> {
    const results: TestPerformanceResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const result = await this.measurePerformance(fn);
      results.push(result);
    }

    const durations = results.map(r => r.duration);

    return {
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      results,
    };
  }
}

/**
 * Enhanced validation utilities
 */
export class ValidationUtils {
  /**
   * Validate object structure
   */
  static validateStructure(
    obj: any,
    requiredFields: string[],
    optionalFields: string[] = [],
  ): TestValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (!(field in obj)) {
        errors.push(`Missing required field: ${field}`);
      } else if (obj[field] === null || obj[field] === undefined) {
        errors.push(`Required field ${field} is null or undefined`);
      }
    });

    // Check for unexpected fields
    const allowedFields = [...requiredFields, ...optionalFields];
    Object.keys(obj).forEach(key => {
      if (!allowedFields.includes(key)) {
        warnings.push(`Unexpected field: ${key}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate workflow definition
   */
  static validateWorkflow(workflow: any): TestValidationResult {
    const result = this.validateStructure(
      workflow,
      ['id', 'name', 'version', 'steps'],
      ['description', 'tags', 'metadata'],
    );

    // Additional workflow-specific validation
    if (workflow.steps && !Array.isArray(workflow.steps)) {
      result.errors.push('Steps must be an array');
    }

    if (workflow.version && !/^\d+\.\d+\.\d+/.test(workflow.version)) {
      result.warnings.push('Version should follow semantic versioning');
    }

    return result;
  }

  /**
   * Validate step definition
   */
  static validateStep(step: any): TestValidationResult {
    const result = this.validateStructure(
      step,
      ['id', 'name', 'action'],
      ['status', 'input', 'output', 'config', 'condition'],
    );

    // Additional step-specific validation
    if (step.status) {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(step.status)) {
        result.errors.push(`Invalid status: ${step.status}`);
      }
    }

    return result;
  }

  /**
   * Validate execution
   */
  static validateExecution(execution: any): TestValidationResult {
    const result = this.validateStructure(
      execution,
      ['id', 'workflowId', 'status', 'startedAt'],
      ['completedAt', 'failedAt', 'cancelledAt', 'steps', 'output', 'error'],
    );

    // Additional execution-specific validation
    if (execution.status) {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(execution.status)) {
        result.errors.push(`Invalid status: ${execution.status}`);
      }
    }

    if (execution.startedAt && !(execution.startedAt instanceof Date)) {
      result.errors.push('startedAt must be a Date object');
    }

    return result;
  }

  /**
   * Validate engine status
   */
  static validateEngineStatus(
    status: any,
    expectedProperties: string[] = [],
  ): TestValidationResult {
    const result = this.validateStructure(
      status,
      ['healthy', 'providers'],
      ['errors', 'warnings', 'metadata'],
    );

    expectedProperties.forEach(prop => {
      if (!(prop in status)) {
        result.errors.push(`Missing expected property: ${prop}`);
      }
    });

    return result;
  }
}

/**
 * Enhanced mock management utilities
 */
export class MockUtils {
  private static activeMocks: Map<string, any> = new Map();

  /**
   * Create and register a mock
   */
  static createMock(name: string, mockImplementation: any): any {
    const mock = vi.fn().mockImplementation(mockImplementation);
    this.activeMocks.set(name, mock);
    return mock;
  }

  /**
   * Get registered mock
   */
  static getMock(name: string): any {
    return this.activeMocks.get(name);
  }

  /**
   * Clear all mocks
   */
  static clearAllMocks(): void {
    this.activeMocks.forEach(mock => {
      if (mock && typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
    });
  }

  /**
   * Reset all mocks
   */
  static resetAllMocks(): void {
    this.activeMocks.forEach(mock => {
      if (mock && typeof mock.mockReset === 'function') {
        mock.mockReset();
      }
    });
    this.activeMocks.clear();
  }

  /**
   * Create mock with scenarios
   */
  static createScenarioMock(name: string, scenarios: TestMockScenario[]): any {
    const mock = vi.fn();

    scenarios.forEach(scenario => {
      scenario.setup();
      if (scenario.teardown) {
        afterEach(scenario.teardown);
      }
    });

    this.activeMocks.set(name, mock);
    return mock;
  }

  /**
   * Create mock provider with standard methods
   */
  static createMockProvider(type: string, overrides: any = {}): any {
    const baseMock = {
      name: `mock-${type}-provider`,
      type,
      healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
      ...overrides,
    };

    this.activeMocks.set(`provider-${type}`, baseMock);
    return baseMock;
  }
}

/**
 * Enhanced error testing utilities
 */
export class ErrorTestUtils {
  /**
   * Test that a function throws an error
   */
  static async expectError<T>(
    fn: () => Promise<T>,
    expectedError?: string | RegExp | Error,
  ): Promise<Error> {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (typeof expectedError === 'string') {
          expect(errorMessage).toContain(expectedError);
        } else if (expectedError instanceof RegExp) {
          expect(errorMessage).toMatch(expectedError);
        } else if (expectedError instanceof Error) {
          expect(errorMessage).toBe(expectedError.message);
        }
      }
      return error as Error;
    }
  }

  /**
   * Test error handling in multiple scenarios
   */
  static async testErrorScenarios<T>(
    scenarios: Array<{
      name: string;
      fn: () => Promise<T>;
      expectedError?: string | RegExp | Error;
    }>,
  ): Promise<void> {
    for (const scenario of scenarios) {
      try {
        await this.expectError(scenario.fn, scenario.expectedError);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Error scenario '${scenario.name}' failed: ${errorMessage}`);
      }
    }
  }

  /**
   * Create error with stack trace
   */
  static createTestError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}

/**
 * Enhanced hook testing utilities
 */
export class HookTestUtils {
  /**
   * Test React hook with multiple scenarios
   */
  static testHookScenarios<T>(
    hookFactory: (options: any) => T,
    scenarios: Array<{
      name: string;
      options: any;
      assertions: (result: T) => void;
    }>,
  ): void {
    scenarios.forEach(scenario => {
      test(scenario.name, () => {
        const { result } = renderHook(() => hookFactory(scenario.options));
        scenario.assertions(result.current);
      });
    });
  }

  /**
   * Test hook with async operations
   */
  static async testAsyncHook<T>(
    hookFactory: () => T,
    asyncOperation: (result: T) => Promise<void>,
    timeout = 5000,
  ): Promise<void> {
    const { result } = renderHook(hookFactory);

    await waitFor(
      async () => {
        await asyncOperation(result.current);
      },
      { timeout },
    );
  }

  /**
   * Test hook lifecycle
   */
  static testHookLifecycle<T>(
    hookFactory: (options: any) => T,
    options: any,
    lifecycle: {
      onMount?: (result: T) => void;
      onUpdate?: (result: T) => void;
      onUnmount?: () => void;
    },
  ): void {
    const { result, rerender, unmount } = renderHook(() => hookFactory(options));

    if (lifecycle.onMount) {
      lifecycle.onMount(result.current);
    }

    if (lifecycle.onUpdate) {
      rerender();
      lifecycle.onUpdate(result.current);
    }

    if (lifecycle.onUnmount) {
      unmount();
      lifecycle.onUnmount();
    }
  }
}

/**
 * Enhanced test suite utilities
 */
export class TestSuiteUtils {
  /**
   * Create test suite with standard setup
   */
  static createSuite(
    name: string,
    tests: () => void,
    options: {
      beforeEach?: () => void;
      afterEach?: () => void;
      beforeAll?: () => void;
      afterAll?: () => void;
    } = {},
  ): void {
    describe(name, () => {
      if (options.beforeAll) {
        beforeAll(options.beforeAll);
      }

      if (options.afterAll) {
        afterAll(options.afterAll);
      }

      if (options.beforeEach) {
        beforeEach(options.beforeEach);
      }

      if (options.afterEach) {
        afterEach(options.afterEach);
      }

      tests();
    });
  }

  /**
   * Create parameterized tests
   */
  static createParameterizedTests<T>(
    name: string,
    testFn: (params: T) => void,
    parameters: Array<{ name: string; params: T }>,
  ): void {
    describe(name, () => {
      parameters.forEach(({ name: paramName, params }) => {
        test(paramName, () => testFn(params));
      });
    });
  }

  /**
   * Create conditional tests
   */
  static createConditionalTest(name: string, condition: boolean, testFn: () => void): void {
    const testMethod = condition ? test : test.skip;
    testMethod(name, testFn);
  }

  /**
   * Create test with timeout
   */
  static createTimedTest(name: string, testFn: () => void | Promise<void>, timeout = 10000): void {
    test(name, testFn, timeout);
  }
}

/**
 * Random test data utilities
 */
export class RandomTestUtils {
  /**
   * Generate random test data
   */
  static randomData = testDataUtils;

  /**
   * Create random test scenario
   */
  static createRandomScenario(type: 'workflow' | 'step' | 'execution' = 'workflow'): any {
    switch (type) {
      case 'workflow':
        return testDataUtils.randomWorkflow();
      case 'step':
        return testDataUtils.randomStepId();
      case 'execution':
        return testDataUtils.randomExecution();
      default:
        return testDataUtils.randomWorkflow();
    }
  }

  /**
   * Create multiple random scenarios
   */
  static createRandomScenarios(
    count: number,
    type: 'workflow' | 'step' | 'execution' = 'workflow',
  ): any[] {
    return Array.from({ length: count }, () => this.createRandomScenario(type));
  }
}

// Utility classes are already exported with 'export class' above

// Export consolidated utilities object
export const TestUtils = {
  imports: ImportTestUtils,
  assertions: AssertionUtils,
  performance: PerformanceUtils,
  validation: ValidationUtils,
  mocks: MockUtils,
  errors: ErrorTestUtils,
  hooks: HookTestUtils,
  suites: TestSuiteUtils,
  random: RandomTestUtils,
};

// Export global assertion functions
export const assertWorkflowExecution = AssertionUtils.assertWorkflowExecution;
export const assertProviderHealth = AssertionUtils.assertHealthCheck;

// Export legacy utilities for backwards compatibility
export const testUtils = TestUtils;
