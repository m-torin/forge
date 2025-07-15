/**
 * Enhanced Prisma mock utilities that support generated enums re-export pattern
 *
 * This utility allows packages to mock Prisma functions while preserving
 * real generated enum values for type safety and consistency.
 */

import { vi } from 'vitest';
import { createMockPrismaClient } from './database';

// Static mock paths that need to be mocked at module level
const COMMON_PRISMA_PATHS = [
  '#/prisma-generated/client',
  '../prisma-generated/client',
  '../../../../prisma-generated/client',
  '@prisma/client',
];

// Create a shared mock object that will be populated by setupPrismaWithEnums
let sharedMockObject: any = {
  PrismaClient: vi.fn(),
  Prisma: {},
};

// Mock all common paths at module level (these are hoisted)
// We need to use direct vi.mock calls to avoid hoisting issues
vi.mock('#/prisma-generated/client', () => sharedMockObject);
vi.mock('../prisma-generated/client', () => sharedMockObject);
vi.mock('../../../../prisma-generated/client', () => sharedMockObject);
vi.mock('@prisma/client', () => sharedMockObject);

/**
 * Configuration for setting up Prisma mocks with enum re-export support
 */
export interface PrismaWithEnumsConfig<TEnums = Record<string, any>> {
  /**
   * Generated enums to re-export through the mock
   * These should be imported from the real generated client
   */
  enums: TEnums;

  /**
   * Import paths to mock for comprehensive coverage
   * Defaults to common paths if not provided
   */
  importPaths?: string[];

  /**
   * Options for the underlying Prisma client mock
   */
  mockOptions?: Parameters<typeof createMockPrismaClient>[0];

  /**
   * Whether to include Prisma error classes (default: true)
   */
  includeErrorClasses?: boolean;
}

/**
 * Create comprehensive Prisma mocks with enum re-export support
 *
 * This function sets up mocks for multiple import paths while preserving
 * real enum values, solving the core challenge of needing mocked functions
 * with real enum types.
 *
 * @example
 * ```typescript
 * // In test setup file
 * import { BrandType, ContentStatus } from '../prisma-generated/client';
 * import { setupPrismaWithEnums } from '@repo/qa/vitest/mocks/internal/prisma-with-enums';
 *
 * setupPrismaWithEnums({
 *   enums: { BrandType, ContentStatus },
 *   importPaths: ['#/prisma-generated/client', '../prisma-generated/client']
 * });
 * ```
 */
export function setupPrismaWithEnums<TEnums extends Record<string, any>>(
  config: PrismaWithEnumsConfig<TEnums>,
): ReturnType<typeof createMockPrismaClient> {
  const {
    enums,
    importPaths = [
      '#/prisma-generated/client',
      '../prisma-generated/client',
      '../../../../prisma-generated/client',
      '@prisma/client',
    ],
    mockOptions = {},
    includeErrorClasses = true,
  } = config;

  // Create the mock client instance
  const mockClient = createMockPrismaClient(mockOptions);

  // Create mock constructor
  const MockPrismaClient = vi.fn(() => mockClient);

  // Base mock object with client and enums
  const baseMockObject = {
    PrismaClient: MockPrismaClient,
    ...enums,
  };

  // Add Prisma error classes if requested
  const fullMockObject = includeErrorClasses
    ? {
        ...baseMockObject,
        Prisma: {
          PrismaClientKnownRequestError: class extends Error {
            constructor(
              message: string,
              public code: string,
            ) {
              super(message);
              this.name = 'PrismaClientKnownRequestError';
            }
          },
          PrismaClientUnknownRequestError: class extends Error {
            constructor(message: string) {
              super(message);
              this.name = 'PrismaClientUnknownRequestError';
            }
          },
          PrismaClientValidationError: class extends Error {
            constructor(message: string) {
              super(message);
              this.name = 'PrismaClientValidationError';
            }
          },
        },
      }
    : baseMockObject;

  // Update the shared mock object with the configured values
  Object.assign(sharedMockObject, fullMockObject);

  // Mock any additional custom paths that weren't in the common list
  const additionalPaths = importPaths.filter(path => !COMMON_PRISMA_PATHS.includes(path));
  if (additionalPaths.length > 0) {
    console.warn(
      `Additional Prisma paths cannot be mocked dynamically: ${additionalPaths.join(', ')}`,
    );
  }

  return mockClient;
}

/**
 * Common console mock utilities for test setup
 */
export const consoleTestUtils = {
  /**
   * Mock console methods to suppress output during tests
   */
  suppressConsole: () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  },

  /**
   * Restore console methods
   */
  restoreConsole: () => {
    vi.restoreAllMocks();
  },
};

/**
 * Standard test lifecycle utilities
 */
export const testLifecycleUtils = {
  /**
   * Standard beforeEach setup for Prisma tests
   */
  setupPrismaTest: (mockClient: ReturnType<typeof createMockPrismaClient>) => {
    // Suppress console output
    consoleTestUtils.suppressConsole();

    // Set default mock behaviors
    Object.keys(mockClient).forEach(model => {
      if (mockClient[model]?.findUnique) {
        mockClient[model].findUnique.mockResolvedValue(null);
        mockClient[model].findFirst.mockResolvedValue(null);
        mockClient[model].findMany.mockResolvedValue([]);
        mockClient[model].create.mockResolvedValue({ id: `${model}-id` });
        mockClient[model].update.mockResolvedValue({ id: `${model}-id` });
        mockClient[model].createMany?.mockResolvedValue({});
      }
    });
  },

  /**
   * Standard afterEach cleanup for Prisma tests
   */
  cleanupPrismaTest: () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  },
};

/**
 * Convenience function for complete test setup with enums
 *
 * This combines enum setup, console mocking, and standard mock behaviors
 * into a single call for common use cases.
 */
export function createPrismaTestSuite<TEnums extends Record<string, any>>(
  config: PrismaWithEnumsConfig<TEnums>,
) {
  const mockClient = setupPrismaWithEnums(config);

  return {
    mockClient,
    beforeEach: () => testLifecycleUtils.setupPrismaTest(mockClient),
    afterEach: testLifecycleUtils.cleanupPrismaTest,
    utils: {
      console: consoleTestUtils,
      lifecycle: testLifecycleUtils,
    },
  };
}
