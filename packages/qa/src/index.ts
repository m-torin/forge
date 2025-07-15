/**
 * @fileoverview QA package with centralized testing utilities and mocks.
 *
 * The @repo/qa package provides comprehensive testing infrastructure for the entire monorepo,
 * including Vitest configurations, mock implementations, test patterns, and utility functions.
 *
 * @example
 * ```ts
 * // Import Vitest configurations
 * import { createReactConfig } from '@repo/qa/vitest/configs';
 *
 * // Import mock utilities
 * import { setupVitestUpstashMocks } from '@repo/qa/vitest/mocks';
 *
 * // Import test patterns
 * import { databaseAssertions, testDataGenerators } from '@repo/qa';
 * ```
 *
 * @version 1.0.0
 * @author Monorepo Team
 */

// Export enhanced TypeScript definitions for better development experience
export * from './shared/types/testing';

// === CORE EXPORTS ===
// Re-export vitest mocks and utilities for easy access
export * from './vitest/mocks/index';

// === DATABASE TESTING ===
// Export database-specific utilities and configs
export * from './vitest/mocks/internal/database';
export * from './vitest/mocks/internal/email';
export * from './vitest/mocks/internal/prisma-with-enums';
export * from './vitest/utils/prisma-test-setup';

// === TEST PATTERNS & UTILITIES ===
// Export comprehensive test patterns and utilities
export * from './vitest/utils/database';
export * from './vitest/utils/mock-manager';
export * from './vitest/utils/test-patterns';

// === SHARED UTILITIES ===
// Export shared utilities for cross-framework compatibility
export * from './shared';

// === PERFORMANCE & MONITORING ===
// Note: Advanced features like performance monitoring are available
// via direct imports from specific modules for tree-shaking benefits

/**
 * @namespace QA
 * @description Main namespace for all QA utilities and types
 *
 * @example
 * ```ts
 * import type { QA } from '@repo/qa';
 *
 * const mockClient: QA.DatabaseClient = createMockPrismaClient();
 * ```
 */
export namespace QA {
  // Re-export key types from testing namespace
  export type DatabaseClient = import('./shared/types/testing').Testing.DatabaseClient;
  export type RedisClient = import('./shared/types/testing').Testing.RedisClient;
  export type AuthClient = import('./shared/types/testing').Testing.AuthClient;
  export type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> =
    import('./shared/types/testing').Testing.Mock<T>;
  export type ScenarioConfig = import('./shared/types/testing').Testing.ScenarioConfig;
  export type PerformanceConfig = import('./shared/types/testing').Testing.PerformanceConfig;
}

// === VERSION INFORMATION ===
/**
 * Package version information for debugging and compatibility checking
 */
export const QA_VERSION = '1.0.0';
export const SUPPORTED_VITEST_VERSION = '^3.0.0';
export const SUPPORTED_NODE_VERSION = '>=18.0.0';

/**
 * Feature flags for conditional functionality
 */
export const FEATURES = {
  PERFORMANCE_MONITORING: true,
  ENHANCED_ERROR_REPORTING: true,
  MEMORY_LEAK_DETECTION: true,
  AUTOMATIC_CLEANUP: true,
} as const;

/**
 * Quick start utilities for common testing scenarios
 */
export const quickStart = {
  /**
   * Set up a complete testing environment with all common mocks
   * @example
   * ```ts
   * // In your test setup file
   * import { quickStart } from '@repo/qa';
   *
   * quickStart.setupFullEnvironment();
   * ```
   */
  setupFullEnvironment: async () => {
    // Dynamic imports for better tree-shaking
    const { setupVitestUpstashMocks } = await import('./vitest/mocks/providers/upstash/redis');
    const { setupBetterAuthMocks } = await import('./vitest/mocks/providers/better-auth');

    return {
      redis: setupVitestUpstashMocks(),
      auth: setupBetterAuthMocks(),
    };
  },

  /**
   * Clean up all registered mocks and reset testing state
   */
  cleanupAll: async () => {
    const { mockManager } = await import('./vitest/utils/mock-manager');
    const { resetAllMocks } = await import('./vitest/mocks');

    mockManager.cleanup({ resetAll: true });
    await resetAllMocks();
  },
} as const;
