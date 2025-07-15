import { vi, type MockedFunction } from 'vitest';

/**
 * Database Test Patterns - DRY utilities for database testing
 *
 * This module provides standardized patterns for database tests to eliminate
 * repetitive setup, teardown, mocking, and assertion patterns found across
 * all database test files.
 */

export interface DatabaseTestConfig {
  enums?: Record<string, any>;
  importPaths?: string[];
  includeErrorClasses?: boolean;
  suppressConsole?: boolean;
  enableEnvironmentMocking?: boolean;
}

export interface PrismaClientMock {
  [model: string]: any;
  $transaction?: MockedFunction<any>;
  $disconnect?: MockedFunction<any>;
}

/**
 * Creates a standardized database test suite with common patterns
 */
export function createAdvancedDatabaseTestSuite(config: DatabaseTestConfig = {}) {
  const { suppressConsole = true, enableEnvironmentMocking = false } = config;

  // Console suppression utilities
  const consoleUtils = {
    suppressLogs: suppressConsole
      ? () => {
          vi.spyOn(console, 'log').mockImplementation(() => {});
          vi.spyOn(console, 'error').mockImplementation(() => {});
          vi.spyOn(console, 'warn').mockImplementation(() => {});
          vi.spyOn(console, 'info').mockImplementation(() => {});
        }
      : () => {},

    restoreLogs: () => {
      vi.restoreAllMocks();
    },
  };

  // Environment utilities
  const environmentUtils = {
    mockRandom: (seed: number = 0.5) => {
      const originalRandom = Math.random;
      vi.spyOn(Math, 'random').mockImplementation(() => seed);
      return () => {
        Math.random = originalRandom;
      };
    },

    mockDateNow: (timestamp: number) => {
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => timestamp);
      return () => {
        Date.now = originalNow;
      };
    },

    mockEnvironment: (vars: Record<string, string>) => {
      const originalEnv = { ...process.env };
      Object.assign(process.env, vars);
      return () => {
        process.env = originalEnv;
      };
    },
  };

  // Prisma client mock factory
  const createStandardPrismaClientMock = (models: string[] = []): PrismaClientMock => {
    const mockClient: any = {
      $disconnect: vi.fn().mockResolvedValue(undefined),
      $transaction: vi.fn(callback => callback(mockClient)),
    };

    // Create standard CRUD operations for each model
    models.forEach(model => {
      mockClient[model] = {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: `${model}-id` }),
        update: vi.fn().mockResolvedValue({ id: `${model}-id` }),
        upsert: vi.fn().mockResolvedValue({ id: `${model}-id` }),
        delete: vi.fn().mockResolvedValue({ id: `${model}-id` }),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        count: vi.fn().mockResolvedValue(0),
        aggregate: vi.fn().mockResolvedValue({}),
        groupBy: vi.fn().mockResolvedValue([]),
      };
    });

    return mockClient;
  };

  // Standard mock reset functionality
  const resetPrismaClientMock = (mockClient: PrismaClientMock) => {
    vi.clearAllMocks();

    Object.keys(mockClient).forEach(model => {
      if (mockClient[model]?.findUnique) {
        mockClient[model].findUnique?.mockResolvedValue(null);
        mockClient[model].findFirst?.mockResolvedValue(null);
        mockClient[model].findMany?.mockResolvedValue([]);
        mockClient[model].create?.mockResolvedValue({ id: `${model}-id` });
        mockClient[model].update?.mockResolvedValue({ id: `${model}-id` });
        mockClient[model].createMany?.mockResolvedValue({ count: 0 });
        mockClient[model].count?.mockResolvedValue(0);
      }
    });
  };

  // Standard setup and teardown patterns
  const setupTestSuite = (mockClient: PrismaClientMock) => {
    return {
      beforeEach: () => {
        resetPrismaClientMock(mockClient);
        consoleUtils.suppressLogs();
      },

      afterEach: () => {
        consoleUtils.restoreLogs();
        vi.clearAllMocks();
      },
    };
  };

  return {
    consoleUtils,
    environmentUtils,
    createStandardPrismaClientMock,
    resetPrismaClientMock,
    setupTestSuite,
  };
}

/**
 * Common database assertion patterns
 */
export const advancedDatabaseAssertions = {
  // Verify data structure has required fields
  expectDataStructure: (result: any, requiredFields: string[]) => {
    requiredFields.forEach(field => {
      expect(result).toHaveProperty(field);
      expect(result[field]).toBeDefined();
    });
  },

  // Verify mock was called for specific models
  expectMockCalls: (
    mockClient: PrismaClientMock,
    models: string[],
    operation: string = 'create',
  ) => {
    models.forEach(model => {
      expect(mockClient[model]?.[operation]).toHaveBeenCalledWith();
    });
  },

  // Verify mocks were NOT called for specific models
  expectMockNotCalled: (
    mockClient: PrismaClientMock,
    models: string[],
    operation: string = 'create',
  ) => {
    models.forEach(model => {
      expect(mockClient[model]?.[operation]).not.toHaveBeenCalled();
    });
  },

  // Verify error handling and console output
  expectErrorHandling: () => {
    expect(console.error).toHaveBeenCalledWith();
  },

  // Verify unique IDs across multiple create calls
  expectUniqueIds: (calls: any[], idField: string = 'id') => {
    const ids = calls.map(call => call.data?.[idField]).filter(Boolean);
    const uniqueCount = new Set(ids).size;
    return { uniqueCount, totalCount: ids.length, areUnique: uniqueCount === ids.length };
  },

  // Verify valid email format
  expectValidEmail: (email: string) => {
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  },

  // Verify valid slug format
  expectValidSlug: (slug: string) => {
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  },

  // Verify enum values
  expectValidEnum: (value: any, validValues: any[]) => {
    expect(validValues).toContain(value);
  },

  // Verify array uniqueness
  expectArrayUniqueness: (array: any[], field?: string, threshold: number = 0.8) => {
    const values = field ? array.map(item => item[field]) : array;
    const uniqueCount = new Set(values).size;
    const expectedMin = Math.floor(values.length * threshold);
    return { uniqueCount, expectedMin, meetsThreshold: uniqueCount >= expectedMin };
  },

  // Verify timestamp consistency
  expectTimestampConsistency: (calls: any[], maxDiff: number = 1000) => {
    if (calls.length < 2) return { isConsistent: true, timeDiff: 0 };

    const timestamps = calls
      .map(call => call.data?.createdAt)
      .filter(Boolean)
      .map(date => new Date(date).getTime());

    if (timestamps.length < 2) return { isConsistent: true, timeDiff: 0 };

    const timeDiff = Math.abs(timestamps[0] - timestamps[1]);
    return { isConsistent: timeDiff < maxDiff, timeDiff, maxDiff };
  },
};

/**
 * Test data generators for common database entities
 */
export const advancedTestDataGenerators = {
  generateUser: (overrides: Partial<any> = {}) => ({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
    name: `Test User ${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: new Date(),
    ...overrides,
  }),

  generateOrganization: (overrides: Partial<any> = {}) => ({
    id: `org-${Math.random().toString(36).substr(2, 9)}`,
    name: `Test Organization ${Math.random().toString(36).substr(2, 5)}`,
    slug: `test-org-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  generateTestData: (type: string, count: number = 1, overrides: Partial<any> = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `${type}-${index + 1}`,
      name: `Test ${type} ${index + 1}`,
      ...overrides,
    }));
  },
};

/**
 * Mock scenario patterns for common database testing scenarios
 */
export const advancedMockScenarios = {
  // Test individual entity creation errors
  testEntityErrors: async (
    mockClient: PrismaClientMock,
    entities: string[],
    testFunction: () => Promise<void>,
  ) => {
    for (const entity of entities) {
      if (mockClient[entity]?.create) {
        mockClient[entity].create!.mockRejectedValue(new Error(`${entity} create failed`));

        await testFunction();

        // Reset for next iteration
        mockClient[entity].create!.mockResolvedValue({ id: `${entity}-id` });
        vi.clearAllMocks();
      }
    }
  },

  // Test concurrent execution
  testConcurrentExecution: async (testFunction: () => Promise<void>, times: number = 3) => {
    const promises = Array.from({ length: times }, () => testFunction());
    await Promise.all(promises);
  },

  // Test partial failures
  testPartialFailures: async (
    mockClient: PrismaClientMock,
    failingEntities: string[],
    successEntities: string[],
    testFunction: () => Promise<void>,
  ) => {
    // Mock failures for specific entities
    failingEntities.forEach(entity => {
      if (mockClient[entity]?.create) {
        mockClient[entity].create!.mockRejectedValue(new Error(`${entity} failed`));
      }
    });

    await testFunction();

    // Return data for test to verify
    return {
      failingEntities,
      successEntities,
      mockClient,
    };
  },

  // Test timeout scenarios
  testTimeoutScenario: async (
    mockClient: PrismaClientMock,
    operation: string,
    model: string,
    delay: number = 100,
  ) => {
    if (mockClient[model]?.[operation]) {
      mockClient[model][operation]!.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), delay)),
      );
    }
  },
};

/**
 * Pre-configured test case patterns with standardized names
 */
export const advancedTestCasePatterns = {
  dataStructure: {
    name: 'has correct data structure',
    test: (fn: () => void) => fn(),
  },

  errorHandling: {
    name: 'handles errors gracefully',
    test: (fn: () => void) => fn(),
  },

  edgeCases: {
    name: 'handles edge cases correctly',
    test: (fn: () => void) => fn(),
  },

  uniqueness: {
    name: 'ensures data uniqueness',
    test: (fn: () => void) => fn(),
  },

  validation: {
    name: 'validates data formats correctly',
    test: (fn: () => void) => fn(),
  },

  concurrency: {
    name: 'handles concurrent execution safely',
    test: (fn: () => void) => fn(),
  },

  partialFailures: {
    name: 'handles partial failures gracefully',
    test: (fn: () => void) => fn(),
  },

  performance: {
    name: 'performs within acceptable limits',
    test: (fn: () => void) => fn(),
  },
};
