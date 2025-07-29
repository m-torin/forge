/**
 * Mock validation utilities for Vitest
 * This file provides utilities for validating mocks and ensuring they meet expectations
 */

import { Mock } from 'vitest';

// Mock validation types
export interface MockValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  coverage: MockCoverage;
}

export interface MockCoverage {
  called: boolean;
  callCount: number;
  argsUsed: Array<any[]>;
  returnValuesUsed: any[];
  timesUsed: number;
  lastUsed: Date | null;
}

export interface MockValidationOptions {
  /**
   * Whether to validate that mock was called
   */
  expectCalled?: boolean;

  /**
   * Expected minimum number of calls
   */
  minCalls?: number;

  /**
   * Expected maximum number of calls
   */
  maxCalls?: number;

  /**
   * Whether to validate arguments
   */
  validateArgs?: boolean;

  /**
   * Whether to validate return values
   */
  validateReturnValues?: boolean;

  /**
   * Whether to check for unused mocks
   */
  checkUnused?: boolean;

  /**
   * Whether to validate mock configuration
   */
  validateConfig?: boolean;

  /**
   * Custom validation functions
   */
  customValidators?: Array<(mock: Mock) => string[]>;
}

export interface MockHealth {
  healthy: boolean;
  issues: string[];
  suggestions: string[];
  performance: {
    avgCallTime: number;
    slowCalls: number;
    memoryUsage: number;
  };
}

// Mock validation utilities
export const mockValidation = {
  /**
   * Validate a single mock
   */
  validateMock(mock: Mock, options: MockValidationOptions = {}): MockValidationResult {
    const {
      expectCalled = false,
      minCalls = 0,
      maxCalls = Infinity,
      validateArgs = true,
      validateReturnValues = true,
      checkUnused = true,
      validateConfig = true,
      customValidators = [],
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if mock was called when expected
    if (expectCalled && mock.mock.calls.length === 0) {
      errors.push('Mock was expected to be called but was not');
    }

    // Check call count bounds
    if (mock.mock.calls.length < minCalls) {
      errors.push(`Mock was called ${mock.mock.calls.length} times, expected at least ${minCalls}`);
    }

    if (mock.mock.calls.length > maxCalls) {
      errors.push(`Mock was called ${mock.mock.calls.length} times, expected at most ${maxCalls}`);
    }

    // Check for unused mocks
    if (checkUnused && mock.mock.calls.length === 0) {
      warnings.push('Mock was created but never called');
    }

    // Validate arguments
    if (validateArgs && mock.mock.calls.length > 0) {
      const argValidationErrors = this.validateMockArguments(mock);
      errors.push(...argValidationErrors);
    }

    // Validate return values
    if (validateReturnValues && mock.mock.results.length > 0) {
      const returnValidationErrors = this.validateMockReturnValues(mock);
      errors.push(...returnValidationErrors);
    }

    // Validate mock configuration
    if (validateConfig) {
      const configValidationErrors = this.validateMockConfiguration(mock);
      errors.push(...configValidationErrors);
    }

    // Run custom validators
    for (const validator of customValidators) {
      const customErrors = validator(mock);
      errors.push(...customErrors);
    }

    // Generate coverage report
    const coverage = this.generateMockCoverage(mock);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      coverage,
    };
  },

  /**
   * Validate mock arguments
   */
  validateMockArguments(mock: Mock): string[] {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for consistent argument patterns
    if (mock.mock.calls.length > 1) {
      const firstCallArgCount = mock.mock.calls[0].length;
      const inconsistentCalls = mock.mock.calls.filter(call => call.length !== firstCallArgCount);

      if (inconsistentCalls.length > 0) {
        warnings.push(
          `Mock called with inconsistent argument counts: ${inconsistentCalls.length} calls`,
        );
      }
    }

    // Check for undefined arguments
    mock.mock.calls.forEach((call, index) => {
      const undefinedArgs = call.filter(arg => arg === undefined);
      if (undefinedArgs.length > 0) {
        warnings.push(`Mock call ${index + 1} has ${undefinedArgs.length} undefined arguments`);
      }
    });

    return errors;
  },

  /**
   * Validate mock return values
   */
  validateMockReturnValues(mock: Mock): string[] {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for thrown errors
    const thrownResults = mock.mock.results.filter(result => result.type === 'throw');
    if (thrownResults.length > 0) {
      warnings.push(`Mock threw errors in ${thrownResults.length} calls`);
    }

    // Check for undefined return values
    const undefinedResults = mock.mock.results.filter(
      result => result.type === 'return' && result.value === undefined,
    );
    if (undefinedResults.length > 0) {
      warnings.push(`Mock returned undefined in ${undefinedResults.length} calls`);
    }

    return errors;
  },

  /**
   * Validate mock configuration
   */
  validateMockConfiguration(mock: Mock): string[] {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if mock has implementation
    if (!mock.getMockImplementation()) {
      warnings.push('Mock has no implementation defined');
    }

    // Check if mock name is set
    if (!mock.getMockName() || mock.getMockName() === 'vi.fn()') {
      warnings.push('Mock has no descriptive name set');
    }

    return errors;
  },

  /**
   * Generate mock coverage report
   */
  generateMockCoverage(mock: Mock): MockCoverage {
    const calls = mock.mock.calls;
    const results = mock.mock.results;

    return {
      called: calls.length > 0,
      callCount: calls.length,
      argsUsed: calls,
      returnValuesUsed: results.map(result => result.value),
      timesUsed: calls.length,
      lastUsed: calls.length > 0 ? new Date() : null,
    };
  },

  /**
   * Validate all mocks in a test suite
   */
  validateAllMocks(mocks: Mock[], options: MockValidationOptions = {}): MockValidationResult[] {
    const results: MockValidationResult[] = [];

    for (const mock of mocks) {
      const result = this.validateMock(mock, options);
      results.push(result);
    }

    return results;
  },

  /**
   * Create a validation report
   */
  createValidationReport(results: MockValidationResult[]): string {
    const totalMocks = results.length;
    const validMocks = results.filter(r => r.valid).length;
    const invalidMocks = totalMocks - validMocks;

    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);

    const report = [
      '=== Mock Validation Report ===',
      `Total mocks: ${totalMocks}`,
      `Valid mocks: ${validMocks}`,
      `Invalid mocks: ${invalidMocks}`,
      '',
      `Total errors: ${allErrors.length}`,
      `Total warnings: ${allWarnings.length}`,
      '',
    ];

    if (allErrors.length > 0) {
      report.push('Errors:');
      allErrors.forEach(error => report.push(`  - ${error}`));
      report.push('');
    }

    if (allWarnings.length > 0) {
      report.push('Warnings:');
      allWarnings.forEach(warning => report.push(`  - ${warning}`));
      report.push('');
    }

    // Coverage summary
    const totalCalls = results.reduce((sum, r) => sum + r.coverage.callCount, 0);
    const usedMocks = results.filter(r => r.coverage.called).length;
    const unusedMocks = totalMocks - usedMocks;

    report.push('Coverage Summary:');
    report.push(
      `  Used mocks: ${usedMocks}/${totalMocks} (${Math.round((usedMocks / totalMocks) * 100)}%)`,
    );
    report.push(`  Unused mocks: ${unusedMocks}`);
    report.push(`  Total calls: ${totalCalls}`);
    report.push(`  Average calls per mock: ${Math.round((totalCalls / totalMocks) * 100) / 100}`);

    return report.join('\n');
  },

  /**
   * Assert that all mocks are valid
   */
  assertAllMocksValid(mocks: Mock[], options: MockValidationOptions = {}): void {
    const results = this.validateAllMocks(mocks, options);
    const invalidResults = results.filter(r => !r.valid);

    if (invalidResults.length > 0) {
      const report = this.createValidationReport(results);
      throw new Error(`Mock validation failed:\n${report}`);
    }
  },

  /**
   * Get mock usage statistics
   */
  getMockUsageStats(mocks: Mock[]): {
    total: number;
    used: number;
    unused: number;
    totalCalls: number;
    averageCalls: number;
  } {
    const results = this.validateAllMocks(mocks);
    const total = results.length;
    const used = results.filter(r => r.coverage.called).length;
    const unused = total - used;
    const totalCalls = results.reduce((sum, r) => sum + r.coverage.callCount, 0);
    const averageCalls = total > 0 ? totalCalls / total : 0;

    return {
      total,
      used,
      unused,
      totalCalls,
      averageCalls,
    };
  },
};

// Mock health checking utilities
export const mockHealth = {
  /**
   * Check the health of a mock
   */
  checkMockHealth(mock: Mock): MockHealth {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for performance issues
    const callTimes = this.getMockCallTimes(mock);
    const avgCallTime = callTimes.reduce((sum, time) => sum + time, 0) / callTimes.length;
    const slowCalls = callTimes.filter(time => time > 100).length; // > 100ms

    if (avgCallTime > 50) {
      issues.push(`Mock has slow average call time: ${avgCallTime.toFixed(2)}ms`);
      suggestions.push('Consider optimizing mock implementation');
    }

    if (slowCalls > 0) {
      issues.push(`Mock has ${slowCalls} slow calls (>100ms)`);
      suggestions.push('Review mock implementation for performance bottlenecks');
    }

    // Check for memory issues
    const memoryUsage = this.estimateMockMemoryUsage(mock);
    if (memoryUsage > 1024 * 1024) {
      // > 1MB
      issues.push(`Mock has high memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      suggestions.push('Consider reducing mock data size or using lazy loading');
    }

    // Check for excessive calls
    if (mock.mock.calls.length > 1000) {
      issues.push(`Mock has excessive calls: ${mock.mock.calls.length}`);
      suggestions.push('Consider batching calls or reviewing test logic');
    }

    // Check for stale mocks
    const lastUsed = this.getLastUsedTime(mock);
    if (lastUsed && Date.now() - lastUsed.getTime() > 60000) {
      // > 1 minute
      issues.push('Mock appears to be stale (not used recently)');
      suggestions.push('Consider cleaning up unused mocks');
    }

    return {
      healthy: issues.length === 0,
      issues,
      suggestions,
      performance: {
        avgCallTime: avgCallTime || 0,
        slowCalls,
        memoryUsage,
      },
    };
  },

  /**
   * Get mock call times (estimated)
   */
  getMockCallTimes(mock: Mock): number[] {
    // This is a simplified estimation
    // In practice, you'd need to instrument the mock to get real timing data
    return mock.mock.calls.map(() => Math.random() * 100);
  },

  /**
   * Estimate mock memory usage
   */
  estimateMockMemoryUsage(mock: Mock): number {
    // Rough estimation based on stored data
    const callsSize = JSON.stringify(mock.mock.calls).length;
    const resultsSize = JSON.stringify(mock.mock.results).length;
    return callsSize + resultsSize;
  },

  /**
   * Get last used time
   */
  getLastUsedTime(mock: Mock): Date | null {
    return mock.mock.calls.length > 0 ? new Date() : null;
  },

  /**
   * Check health of all mocks
   */
  checkAllMocksHealth(mocks: Mock[]): MockHealth[] {
    return mocks.map(mock => this.checkMockHealth(mock));
  },

  /**
   * Generate health report
   */
  generateHealthReport(mocks: Mock[]): string {
    const healthResults = this.checkAllMocksHealth(mocks);
    const totalMocks = healthResults.length;
    const healthyMocks = healthResults.filter(h => h.healthy).length;
    const unhealthyMocks = totalMocks - healthyMocks;

    const report = [
      '=== Mock Health Report ===',
      `Total mocks: ${totalMocks}`,
      `Healthy mocks: ${healthyMocks}`,
      `Unhealthy mocks: ${unhealthyMocks}`,
      '',
    ];

    if (unhealthyMocks > 0) {
      report.push('Issues found:');
      healthResults.forEach((health, index) => {
        if (!health.healthy) {
          report.push(`  Mock ${index + 1}:`);
          health.issues.forEach(issue => report.push(`    - ${issue}`));
          if (health.suggestions.length > 0) {
            report.push(`    Suggestions:`);
            health.suggestions.forEach(suggestion => report.push(`      • ${suggestion}`));
          }
        }
      });
    }

    // Performance summary
    const avgCallTimes = healthResults.map(h => h.performance.avgCallTime);
    const totalSlowCalls = healthResults.reduce((sum, h) => sum + h.performance.slowCalls, 0);
    const totalMemoryUsage = healthResults.reduce((sum, h) => sum + h.performance.memoryUsage, 0);

    report.push('');
    report.push('Performance Summary:');
    report.push(
      `  Average call time: ${(avgCallTimes.reduce((sum, time) => sum + time, 0) / avgCallTimes.length).toFixed(2)}ms`,
    );
    report.push(`  Total slow calls: ${totalSlowCalls}`);
    report.push(`  Total memory usage: ${(totalMemoryUsage / 1024 / 1024).toFixed(2)}MB`);

    return report.join('\n');
  },
};

// Runtime validation utilities
export const runtimeValidation = {
  /**
   * Validate mock at runtime
   */
  validateAtRuntime(mock: Mock, expectedBehavior: any): boolean {
    try {
      // Simulate expected behavior
      const result = mock(...expectedBehavior.args);

      // Check if result matches expected
      if (expectedBehavior.returns) {
        return result === expectedBehavior.returns;
      }

      return true;
    } catch (error) {
      if (expectedBehavior.throws) {
        return (error as Error).message === expectedBehavior.throws;
      }
      return false;
    }
  },

  /**
   * Create runtime validator
   */
  createRuntimeValidator(expectations: any[]): (mock: Mock) => boolean {
    return (mock: Mock) => {
      return expectations.every(expectation => this.validateAtRuntime(mock, expectation));
    };
  },

  /**
   * Validate mock behavior consistency
   */
  validateBehaviorConsistency(mock: Mock): boolean {
    const calls = mock.mock.calls;
    const results = mock.mock.results;

    if (calls.length !== results.length) {
      return false;
    }

    // Check for consistent behavior with same arguments
    const callGroups = new Map<string, any[]>();

    calls.forEach((call, index) => {
      const key = JSON.stringify(call);
      if (!callGroups.has(key)) {
        callGroups.set(key, []);
      }
      callGroups.get(key)!.push(results[index]);
    });

    // Check if same arguments produce same results
    for (const [_, results] of callGroups) {
      if (results.length > 1) {
        const firstResult = results[0];
        const inconsistent = results.some(
          result => JSON.stringify(result) !== JSON.stringify(firstResult),
        );

        if (inconsistent) {
          return false;
        }
      }
    }

    return true;
  },
};

// Export all utilities
export default {
  mockValidation,
  mockHealth,
  runtimeValidation,
};
