/**
 * Comprehensive Edge Case Testing for Timeout/Cancellation Scenarios
 *
 * Advanced testing utilities using Node 22+ features:
 * - AbortController with timeout integration
 * - Promise.withResolvers for external control
 * - WeakMap-based cleanup verification
 * - Structured test scenarios with deterministic outcomes
 * - Resource leak detection and verification
 * - Performance regression testing
 */

import { createServerObservability } from '@repo/observability/server/next';
import { circuitBreakerManager } from '../patterns/circuit-breaker';
import { globalMemoryMonitor, MemoryUtils } from './memory-monitor';
import { globalTimeoutManager } from './timeout-manager';

/**
 * Test scenario configuration
 */
interface TestScenario {
  readonly name: string;
  readonly description: string;
  readonly timeout: number;
  readonly expectedOutcome: 'success' | 'timeout' | 'cancel' | 'error';
  readonly setup?: () => Promise<void>;
  readonly cleanup?: () => Promise<void>;
  readonly verification?: (result: TestResult) => Promise<boolean>;
}

/**
 * Test execution result
 */
interface TestResult {
  readonly scenario: string;
  outcome: 'success' | 'timeout' | 'cancel' | 'error';
  readonly duration: number;
  error?: Error;
  readonly memoryLeaked: boolean;
  readonly resourcesCleanedUp: boolean;
  readonly performanceMetrics: {
    readonly memoryUsage: {
      readonly before: number;
      readonly after: number;
      readonly peak: number;
    };
    readonly gcCollections: number;
    readonly timeoutOperations: number;
  };
}

/**
 * Test suite results
 */
interface TestSuiteResult {
  readonly totalTests: number;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly results: ReadonlyArray<TestResult>;
  readonly summary: {
    readonly memoryLeaksDetected: number;
    readonly resourceLeaksDetected: number;
    readonly performanceRegressions: number;
    readonly timeoutAccuracy: number;
  };
}

/**
 * Edge case test executor
 */
class EdgeCaseTestExecutor {
  private readonly scenarios: TestScenario[] = [];
  private readonly results: TestResult[] = [];

  constructor() {
    this.setupDefaultScenarios();
  }

  /**
   * Add a custom test scenario
   */
  addScenario(scenario: TestScenario): void {
    this.scenarios.push(scenario);
  }

  /**
   * Execute all test scenarios
   */
  async executeAll(): Promise<TestSuiteResult> {
    const logger = await createServerObservability().catch(() => null);
    logger?.log('info', 'Starting edge case testing suite', {
      scenarios: this.scenarios.length,
    });

    this.results.length = 0; // Clear previous results

    // Start memory monitoring
    const memoryTracker = new MemoryLeakTracker();
    await memoryTracker.start();

    for (const scenario of this.scenarios) {
      logger?.log('debug', `Executing test scenario: ${scenario.name}`);

      try {
        const result = await this.executeScenario(scenario);
        this.results.push(result);

        logger?.log('debug', `Scenario ${scenario.name} completed`, {
          outcome: result.outcome,
          duration: result.duration,
          expected: scenario.expectedOutcome,
        });
      } catch (error: unknown) {
        const typedError = error instanceof Error ? error : new Error(String(error));
        logger?.log('error', `Scenario ${scenario.name} failed with exception`, {
          error: typedError,
        });

        this.results.push({
          scenario: scenario.name,
          outcome: 'error',
          duration: 0,
          error: typedError,
          memoryLeaked: false,
          resourcesCleanedUp: false,
          performanceMetrics: {
            memoryUsage: { before: 0, after: 0, peak: 0 },
            gcCollections: 0,
            timeoutOperations: 0,
          },
        });
      }
    }

    // Stop memory monitoring and check for leaks
    const leakSummary = await memoryTracker.stop();

    const summary = this.analyzeSuiteResults(leakSummary);
    logger?.log('info', 'Edge case testing suite completed', { summary });

    return {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.outcome === 'success').length,
      failed: this.results.filter(r => r.outcome === 'error').length,
      skipped: 0,
      results: [...this.results],
      summary,
    };
  }

  /**
   * Execute a single test scenario
   */
  private async executeScenario(scenario: TestScenario): Promise<TestResult> {
    // Setup phase
    if (scenario.setup) {
      await scenario.setup();
    }

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();
    const initialTimeoutStats = globalTimeoutManager.getStats();

    let outcome: TestResult['outcome'] = 'success';
    let error: Error | undefined;
    let peakMemory = startMemory;
    const memoryTracker = setInterval(() => {
      const current = process.memoryUsage().heapUsed;
      if (current > peakMemory) {
        peakMemory = current;
      }
    }, 100);

    try {
      // Execute the test scenario
      await this.runScenarioLogic(scenario);
    } catch (caught: unknown) {
      error = caught instanceof Error ? caught : new Error(String(caught));

      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        outcome = 'timeout';
      } else if (error.message.includes('cancel')) {
        outcome = 'cancel';
      } else {
        outcome = 'error';
      }
    } finally {
      clearInterval(memoryTracker);
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    const finalTimeoutStats = globalTimeoutManager.getStats();

    // Cleanup phase
    if (scenario.cleanup) {
      await scenario.cleanup();
    }

    // Wait for garbage collection and resource cleanup
    await this.waitForCleanup();

    const postCleanupMemory = process.memoryUsage().heapUsed;
    const memoryLeaked = postCleanupMemory - startMemory > 1024 * 1024; // 1MB threshold
    const resourcesCleanedUp = this.verifyResourceCleanup();

    const result: TestResult = {
      scenario: scenario.name,
      outcome,
      duration: endTime - startTime,
      error,
      memoryLeaked,
      resourcesCleanedUp,
      performanceMetrics: {
        memoryUsage: {
          before: startMemory,
          after: endMemory,
          peak: peakMemory,
        },
        gcCollections: finalTimeoutStats.totalCompleted - initialTimeoutStats.totalCompleted,
        timeoutOperations: finalTimeoutStats.totalCreated - initialTimeoutStats.totalCreated,
      },
    };

    // Custom verification
    if (scenario.verification) {
      const verificationPassed = await scenario.verification(result);
      if (!verificationPassed && outcome === 'success') {
        result.outcome = 'error';
        result.error = new Error('Custom verification failed');
      }
    }

    return result;
  }

  /**
   * Run the actual scenario logic
   */
  private async runScenarioLogic(scenario: TestScenario): Promise<void> {
    switch (scenario.name) {
      case 'immediate-timeout':
        await this.testImmediateTimeout(scenario);
        break;
      case 'concurrent-timeouts':
        await this.testConcurrentTimeouts(scenario);
        break;
      case 'timeout-chain':
        await this.testTimeoutChain(scenario);
        break;
      case 'abort-signal-propagation':
        await this.testAbortSignalPropagation(scenario);
        break;
      case 'resource-cleanup-on-cancel':
        await this.testResourceCleanupOnCancel(scenario);
        break;
      case 'memory-leak-prevention':
        await this.testMemoryLeakPrevention(scenario);
        break;
      case 'circuit-breaker-timeout-interaction':
        await this.testCircuitBreakerTimeoutInteraction(scenario);
        break;
      case 'streaming-timeout-backpressure':
        await this.testStreamingTimeoutBackpressure(scenario);
        break;
      case 'nested-timeout-contexts':
        await this.testNestedTimeoutContexts(scenario);
        break;
      case 'timeout-accuracy-validation':
        await this.testTimeoutAccuracyValidation(scenario);
        break;
      default:
        throw new Error(`Unknown scenario: ${scenario.name}`);
    }
  }

  /**
   * Test immediate timeout (edge case: 0ms timeout)
   */
  private async testImmediateTimeout(_scenario: TestScenario): Promise<void> {
    const { promise } = globalTimeoutManager.createTimeout<void>(0, {
      name: 'immediate-timeout-test',
    });

    await promise; // Should throw timeout error immediately
  }

  /**
   * Test multiple concurrent timeouts with different durations
   */
  private async testConcurrentTimeouts(_scenario: TestScenario): Promise<void> {
    const timeouts = [
      globalTimeoutManager.createTimeout<string>(100, { name: 'concurrent-1' }),
      globalTimeoutManager.createTimeout<string>(200, { name: 'concurrent-2' }),
      globalTimeoutManager.createTimeout<string>(300, { name: 'concurrent-3' }),
      globalTimeoutManager.createTimeout<string>(400, { name: 'concurrent-4' }),
      globalTimeoutManager.createTimeout<string>(500, { name: 'concurrent-5' }),
    ];

    // All should timeout since we're not resolving them
    const results = await Promise.allSettled(timeouts.map(t => t.promise));

    // Verify all rejected with timeout
    for (const result of results) {
      if (result.status !== 'rejected' || !result.reason.message.includes('timed out')) {
        throw new Error('Expected all timeouts to be rejected with timeout error');
      }
    }
  }

  /**
   * Test timeout chain (timeout triggering another timeout)
   */
  private async testTimeoutChain(_scenario: TestScenario): Promise<void> {
    const firstTimeout = globalTimeoutManager.createTimeout<void>(100, {
      name: 'chain-first',
      onTimeout: () => {
        // Trigger second timeout on first timeout
        const _secondTimeout = globalTimeoutManager.createTimeout<void>(50, {
          name: 'chain-second',
        });
        // Don't await - let it timeout independently
      },
    });

    await firstTimeout.promise; // Should timeout and trigger second
  }

  /**
   * Test abort signal propagation through nested operations
   */
  private async testAbortSignalPropagation(_scenario: TestScenario): Promise<void> {
    const controller = new AbortController();

    const operationPromise = this.simulateNestedAbortableOperation(controller.signal);

    // Cancel after 150ms
    setTimeout(() => controller.abort('Test cancellation'), 150);

    await operationPromise; // Should be cancelled
  }

  /**
   * Test resource cleanup when operations are cancelled
   */
  private async testResourceCleanupOnCancel(_scenario: TestScenario): Promise<void> {
    const resources: any[] = [];
    const resourceTracker = new Set<string>();

    const operation = globalTimeoutManager.createTimeout<void>(1000, {
      name: 'resource-cleanup-test',
      onCleanup: () => {
        // Simulate resource cleanup
        resources.forEach((resource, index) => {
          resourceTracker.add(`cleaned-${index}`);
        });
      },
    });

    // Create some mock resources
    for (let i = 0; i < 10; i++) {
      resources.push({ id: i, data: new Array(1000).fill(i) });
    }

    // Cancel after 100ms
    setTimeout(() => operation.abort('Resource cleanup test'), 100);

    try {
      await operation.promise;
    } catch (error: unknown) {
      // Expected cancellation
      const typedError = error instanceof Error ? error : new Error(String(error));
      if (!typedError.message.includes('Resource cleanup test')) {
        throw typedError;
      }
    }

    // Verify cleanup occurred
    if (resourceTracker.size !== 10) {
      throw new Error(`Resource cleanup incomplete: ${resourceTracker.size}/10`);
    }
  }

  /**
   * Test memory leak prevention in timeout scenarios
   */
  private async testMemoryLeakPrevention(_scenario: TestScenario): Promise<void> {
    const initialMemory = process.memoryUsage().heapUsed;
    const operations: any[] = [];

    // Create many short-lived timeout operations
    for (let i = 0; i < 1000; i++) {
      const operation = globalTimeoutManager.createTimeout<void>(10 + (i % 100), {
        name: `leak-test-${i}`,
        context: { testData: new Array(100).fill(i) },
      });

      operations.push(operation);

      // Let some operations complete, cancel others
      if (i % 3 === 0) {
        operation.abort('Memory leak test cleanup');
      }
    }

    // Wait for operations to complete/timeout
    await Promise.allSettled(operations.map(op => op.promise.catch(() => null)));

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Allow up to 10MB increase (should be much less with proper cleanup)
    if (memoryIncrease > 10 * 1024 * 1024) {
      throw new Error(`Memory leak detected: ${MemoryUtils.formatBytes(memoryIncrease)} increase`);
    }
  }

  /**
   * Test interaction between circuit breakers and timeouts
   */
  private async testCircuitBreakerTimeoutInteraction(_scenario: TestScenario): Promise<void> {
    const testOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 200)); // Slow operation
      return 'success';
    };

    // Test with circuit breaker that has shorter timeout than operation
    const result = await circuitBreakerManager.withCircuitBreaker(
      'timeout-test-breaker',
      testOperation,
      [],
      {
        timeout: 100, // Shorter than operation duration
        failureThreshold: 1,
      },
    );

    if (result.success) {
      throw new Error('Expected circuit breaker to timeout');
    }

    if (!result.error?.message.includes('timeout') && !result.error?.message.includes('open')) {
      throw new Error(`Expected timeout error, got: ${result.error?.message}`);
    }
  }

  /**
   * Test streaming operations with timeout and backpressure
   */
  private async testStreamingTimeoutBackpressure(_scenario: TestScenario): Promise<void> {
    // This would integrate with the streaming system from earlier
    const items = Array.from({ length: 100 }, (_, i) => i);
    let processedCount = 0;

    const processor = async (item: number, _index: number, signal: AbortSignal) => {
      // Simulate slow processing
      await new Promise(resolve => setTimeout(resolve, 50));

      if (signal.aborted) {
        throw new Error('Operation aborted');
      }

      processedCount++;
      return item * 2;
    };

    const timeout = globalTimeoutManager.createTimeout<void>(300, {
      name: 'streaming-timeout-test',
    });

    try {
      // Start processing with timeout
      const processingPromise = (async () => {
        for (let i = 0; i < items.length; i++) {
          await processor(
            items[i],
            i,
            timeout.operation.abortSignal || new AbortController().signal,
          );
        }
      })();

      await Promise.race([processingPromise, timeout.promise]);
    } catch (error: unknown) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      if (!typedError.message.includes('timed out')) {
        throw typedError;
      }
    }

    // Should have processed some but not all items
    if (processedCount === 0 || processedCount >= 100) {
      throw new Error(`Unexpected processed count: ${processedCount}`);
    }
  }

  /**
   * Test nested timeout contexts
   */
  private async testNestedTimeoutContexts(_scenario: TestScenario): Promise<void> {
    const outerTimeout = globalTimeoutManager.createTimeout<void>(500, {
      name: 'outer-context',
    });

    try {
      // Nested operation with shorter timeout
      await globalTimeoutManager.wrapWithTimeout(
        this.simulateWork(300), // Work takes 300ms
        200, // But inner timeout is 200ms
        { name: 'inner-context' },
      );

      // Should not reach here
      throw new Error('Expected inner timeout to trigger');
    } catch (error: unknown) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      if (!typedError.message.includes('timed out')) {
        throw typedError;
      }
      // Expected inner timeout
    }

    outerTimeout.cleanup();
  }

  /**
   * Test timeout accuracy validation
   */
  private async testTimeoutAccuracyValidation(_scenario: TestScenario): Promise<void> {
    const timeouts = [50, 100, 200, 500];
    const results: Array<{ expected: number; actual: number; error: number }> = [];

    for (const expectedTimeout of timeouts) {
      const startTime = Date.now();

      try {
        const { promise } = globalTimeoutManager.createTimeout<void>(expectedTimeout, {
          name: `accuracy-test-${expectedTimeout}`,
        });

        await promise;
      } catch (_error: unknown) {
        const actualTimeout = Date.now() - startTime;
        const error_margin = Math.abs(actualTimeout - expectedTimeout);

        results.push({
          expected: expectedTimeout,
          actual: actualTimeout,
          error: error_margin,
        });
      }
    }

    // Check accuracy (allow 10% margin of error)
    for (const result of results) {
      const errorPercent = (result.error / result.expected) * 100;
      if (errorPercent > 10) {
        throw new Error(
          `Timeout accuracy error: expected ${result.expected}ms, got ${result.actual}ms (${errorPercent.toFixed(1)}% error)`,
        );
      }
    }
  }

  /**
   * Simulate nested abortable operation
   */
  private async simulateNestedAbortableOperation(signal: AbortSignal): Promise<void> {
    await this.simulateAbortableWork(100, signal);
    await this.simulateAbortableWork(100, signal);
    await this.simulateAbortableWork(100, signal);
  }

  /**
   * Simulate abortable work
   */
  private async simulateAbortableWork(duration: number, signal: AbortSignal): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Simulate work that takes specified duration
   */
  private async simulateWork(duration: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Wait for cleanup operations to complete
   */
  private async waitForCleanup(): Promise<void> {
    // Give time for async cleanup operations
    await new Promise(resolve => setTimeout(resolve, 50));

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Verify resource cleanup occurred
   */
  private verifyResourceCleanup(): boolean {
    // Check timeout manager stats
    const timeoutStats = globalTimeoutManager.getStats();

    // Should have no active operations after cleanup
    return timeoutStats.activeOperations === 0;
  }

  /**
   * Analyze suite results and generate summary
   */
  private analyzeSuiteResults(_leakSummary: any): TestSuiteResult['summary'] {
    const memoryLeaksDetected = this.results.filter(r => r.memoryLeaked).length;
    const resourceLeaksDetected = this.results.filter(r => !r.resourcesCleanedUp).length;

    // Simple performance regression detection
    const performanceRegressions = this.results.filter(r => {
      const expectedDuration = r.scenario.includes('immediate') ? 10 : 1000;
      return r.duration > expectedDuration * 2; // 2x expected duration
    }).length;

    // Calculate timeout accuracy
    const accuracyResults = this.results.filter(
      r => r.scenario.includes('accuracy') || r.scenario.includes('timeout'),
    );
    const timeoutAccuracy =
      accuracyResults.length > 0
        ? (accuracyResults.filter(r => r.outcome !== 'error').length / accuracyResults.length) * 100
        : 100;

    return {
      memoryLeaksDetected,
      resourceLeaksDetected,
      performanceRegressions,
      timeoutAccuracy,
    };
  }

  /**
   * Setup default test scenarios
   */
  private setupDefaultScenarios(): void {
    this.scenarios.push(
      {
        name: 'immediate-timeout',
        description: 'Test immediate timeout (0ms)',
        timeout: 0,
        expectedOutcome: 'timeout',
      },
      {
        name: 'concurrent-timeouts',
        description: 'Test multiple concurrent timeouts',
        timeout: 1000,
        expectedOutcome: 'timeout',
      },
      {
        name: 'timeout-chain',
        description: 'Test timeout chain reactions',
        timeout: 200,
        expectedOutcome: 'timeout',
      },
      {
        name: 'abort-signal-propagation',
        description: 'Test abort signal propagation',
        timeout: 500,
        expectedOutcome: 'cancel',
      },
      {
        name: 'resource-cleanup-on-cancel',
        description: 'Test resource cleanup on cancellation',
        timeout: 1000,
        expectedOutcome: 'cancel',
      },
      {
        name: 'memory-leak-prevention',
        description: 'Test memory leak prevention',
        timeout: 2000,
        expectedOutcome: 'success',
      },
      {
        name: 'circuit-breaker-timeout-interaction',
        description: 'Test circuit breaker and timeout interaction',
        timeout: 500,
        expectedOutcome: 'timeout',
      },
      {
        name: 'streaming-timeout-backpressure',
        description: 'Test streaming with timeout and backpressure',
        timeout: 1000,
        expectedOutcome: 'timeout',
      },
      {
        name: 'nested-timeout-contexts',
        description: 'Test nested timeout contexts',
        timeout: 1000,
        expectedOutcome: 'timeout',
      },
      {
        name: 'timeout-accuracy-validation',
        description: 'Test timeout accuracy',
        timeout: 2000,
        expectedOutcome: 'success',
      },
    );
  }
}

/**
 * Memory leak tracker for testing
 */
class MemoryLeakTracker {
  private initialMemory = 0;
  private peakMemory = 0;
  private monitoringInterval?: NodeJS.Timeout;

  async start(): Promise<void> {
    await globalMemoryMonitor.start();
    this.initialMemory = process.memoryUsage().heapUsed;
    this.peakMemory = this.initialMemory;

    this.monitoringInterval = setInterval(() => {
      const current = process.memoryUsage().heapUsed;
      if (current > this.peakMemory) {
        this.peakMemory = current;
      }
    }, 100);
  }

  async stop(): Promise<{
    initialMemory: number;
    finalMemory: number;
    peakMemory: number;
    leaked: boolean;
  }> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Force cleanup and GC
    if (global.gc) {
      global.gc();
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const finalMemory = process.memoryUsage().heapUsed;
    const leaked = finalMemory - this.initialMemory > 5 * 1024 * 1024; // 5MB threshold

    return {
      initialMemory: this.initialMemory,
      finalMemory,
      peakMemory: this.peakMemory,
      leaked,
    };
  }
}

/**
 * Global edge case test executor
 */
const globalEdgeCaseTestExecutor = new EdgeCaseTestExecutor();

/**
 * Run all edge case tests
 */
async function runEdgeCaseTests(): Promise<TestSuiteResult> {
  return await globalEdgeCaseTestExecutor.executeAll();
}

/**
 * Utility functions for edge case testing
 */
export namespace EdgeCaseTestUtils {
  /**
   * Create a test scenario with timeout
   */
  export function createTimeoutScenario(
    name: string,
    timeoutMs: number,
    _operation: () => Promise<any>,
  ): TestScenario {
    return {
      name,
      description: `Test ${name} with ${timeoutMs}ms timeout`,
      timeout: timeoutMs,
      expectedOutcome: 'timeout',
      setup: async () => {
        // Setup can be customized per scenario
      },
      cleanup: async () => {
        // Cleanup resources
      },
      verification: async result => {
        return (
          result.outcome === 'timeout' &&
          result.duration >= timeoutMs * 0.8 &&
          result.duration <= timeoutMs * 1.2
        );
      },
    };
  }

  /**
   * Create a test scenario for cancellation
   */
  export function createCancellationScenario(
    name: string,
    cancelAfterMs: number,
    _operation: (signal: AbortSignal) => Promise<any>,
  ): TestScenario {
    return {
      name,
      description: `Test ${name} with cancellation after ${cancelAfterMs}ms`,
      timeout: cancelAfterMs * 2,
      expectedOutcome: 'cancel',
      verification: async result => {
        return (
          result.outcome === 'cancel' &&
          result.duration >= cancelAfterMs * 0.8 &&
          result.duration <= cancelAfterMs * 1.2
        );
      },
    };
  }

  /**
   * Verify no resource leaks occurred
   */
  export async function verifyNoResourceLeaks(): Promise<boolean> {
    const timeoutStats = globalTimeoutManager.getStats();
    const memoryStats = globalMemoryMonitor.getCurrentMetrics();

    return (
      timeoutStats.activeOperations === 0 &&
      (memoryStats?.memoryPressure === 'low' || memoryStats?.memoryPressure === 'medium')
    );
  }

  /**
   * Generate stress test scenarios
   */
  export function generateStressTestScenarios(count: number): TestScenario[] {
    const scenarios: TestScenario[] = [];

    for (let i = 0; i < count; i++) {
      scenarios.push({
        name: `stress-test-${i}`,
        description: `Stress test scenario ${i}`,
        timeout: 100 + (i % 500),
        expectedOutcome: Math.random() > 0.5 ? 'timeout' : 'cancel',
      });
    }

    return scenarios;
  }
}

/**
 * Edge case test decorator
 */
function EdgeCaseTest(scenario: TestScenario) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value as T;

    descriptor.value = async function (...args: any[]) {
      // Add scenario to global executor
      globalEdgeCaseTestExecutor.addScenario({
        ...scenario,
        name: scenario.name || `${target.constructor.name}.${propertyName}`,
      });

      return await method.apply(this, args);
    };

    return descriptor;
  };
}
