/**
 * Database Test Utils - Centralized DRY Testing Utilities
 *
 * Provides specialized utilities for database testing including assertions,
 * performance testing, validation, and error handling.
 *
 * Based on the successful DRY patterns from packages/orchestration.
 */

import { expect, vi } from 'vitest';

/**
 * Database assertion utilities
 * Standardizes database entity validation across all tests
 */
export class DatabaseAssertionUtils {
  /**
   * Assert that a database entity has all required properties
   */
  static assertDatabaseEntity(entity: any, expectedProperties: string[] = []) {
    expect(entity).toBeDefined();
    expect(entity).toBeTypeOf('object');
    expect(entity).not.toBeNull();

    // Standard properties all database entities should have
    const standardProperties = ['id'];
    const timestampProperties = ['createdAt', 'updatedAt'];

    // Check standard properties
    standardProperties.forEach(prop => {
      expect(entity).toHaveProperty(prop);
      expect(entity[prop]).toBeDefined();
    });

    // Check timestamp properties if they exist
    timestampProperties.forEach(prop => {
      if (entity[prop]) {
        expect(entity[prop]).toBeInstanceOf(Date);
      }
    });

    // Check expected properties
    expectedProperties.forEach(prop => {
      expect(entity).toHaveProperty(prop);
    });
  }

  /**
   * Assert Prisma operation was called correctly
   */
  static assertPrismaOperation(
    mockClient: any,
    model: string,
    operation: string,
    expectedArgs?: any,
  ) {
    expect(mockClient[model]).toBeDefined();
    expect(mockClient[model][operation]).toBeDefined();
    expect(mockClient[model][operation]).toHaveBeenCalled();

    if (expectedArgs) {
      expect(mockClient[model][operation]).toHaveBeenCalledWith(
        expect.objectContaining(expectedArgs),
      );
    }
  }

  /**
   * Assert seed operation results
   */
  static assertSeedOperation(
    mockClient: any,
    entities: string[],
    options: {
      shouldCreate?: boolean;
      shouldUpdate?: boolean;
      shouldSkip?: boolean;
    } = {},
  ) {
    const { shouldCreate = true, shouldUpdate = false, shouldSkip = false } = options;

    entities.forEach(entity => {
      expect(mockClient[entity]).toBeDefined();

      if (shouldCreate) {
        expect(mockClient[entity].create).toHaveBeenCalled();
      }

      if (shouldUpdate) {
        expect(mockClient[entity].update).toHaveBeenCalled();
      }

      if (shouldSkip) {
        expect(mockClient[entity].create).not.toHaveBeenCalled();
        expect(mockClient[entity].update).not.toHaveBeenCalled();
      }
    });
  }

  /**
   * Assert brand entity structure
   */
  static assertBrand(brand: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(brand, [
      'name',
      'slug',
      'type',
      'status',
      ...expectedProperties,
    ]);

    expect(brand.name).toBeTypeOf('string');
    expect(brand.slug).toBeTypeOf('string');
    expect(['LABEL', 'RETAILER', 'MARKETPLACE']).toContain(brand.type);
    expect(['DRAFT', 'PUBLISHED', 'ARCHIVED']).toContain(brand.status);
  }

  /**
   * Assert product entity structure
   */
  static assertProduct(product: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(product, [
      'name',
      'slug',
      'status',
      'type',
      ...expectedProperties,
    ]);

    expect(product.name).toBeTypeOf('string');
    expect(product.slug).toBeTypeOf('string');
    expect(['DRAFT', 'ACTIVE', 'DISCONTINUED']).toContain(product.status);
  }

  /**
   * Assert user entity structure
   */
  static assertUser(user: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(user, ['name', 'email', ...expectedProperties]);

    expect(user.name).toBeTypeOf('string');
    expect(user.email).toBeTypeOf('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  /**
   * Assert organization entity structure
   */
  static assertOrganization(organization: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(organization, [
      'name',
      'slug',
      ...expectedProperties,
    ]);

    expect(organization.name).toBeTypeOf('string');
    expect(organization.slug).toBeTypeOf('string');
  }

  /**
   * Assert order entity structure
   */
  static assertOrder(order: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(order, [
      'orderNumber',
      'status',
      'total',
      'currency',
      ...expectedProperties,
    ]);

    expect(order.orderNumber).toBeTypeOf('string');
    expect(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).toContain(order.status);
    expect(order.total).toBeTypeOf('number');
    expect(order.currency).toBeTypeOf('string');
  }

  /**
   * Assert address entity structure
   */
  static assertAddress(address: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(address, [
      'type',
      'street1',
      'city',
      'country',
      ...expectedProperties,
    ]);

    expect(['SHIPPING', 'BILLING', 'RESIDENTIAL', 'BUSINESS']).toContain(address.type);
    expect(address.street1).toBeTypeOf('string');
    expect(address.city).toBeTypeOf('string');
    expect(address.country).toBeTypeOf('string');
  }

  /**
   * Assert media entity structure
   */
  static assertMedia(media: any, expectedProperties: string[] = []) {
    DatabaseAssertionUtils.assertDatabaseEntity(media, [
      'url',
      'type',
      'filename',
      'mimeType',
      ...expectedProperties,
    ]);

    expect(media.url).toBeTypeOf('string');
    expect(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO']).toContain(media.type);
    expect(media.filename).toBeTypeOf('string');
    expect(media.mimeType).toBeTypeOf('string');
  }
}

/**
 * Database performance testing utilities
 * Provides consistent performance testing across database operations
 */
export class DatabasePerformanceUtils {
  /**
   * Test performance of a database operation
   */
  static async testOperationPerformance<T>(
    operation: () => Promise<T>,
    maxDuration: number = 1000,
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await operation();
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(maxDuration);

    return { result, duration };
  }

  /**
   * Benchmark database operations with multiple runs
   */
  static async benchmark<T>(
    operation: () => Promise<T>,
    runs: number = 3,
  ): Promise<{
    results: T[];
    durations: number[];
    average: number;
    min: number;
    max: number;
  }> {
    const results: T[] = [];
    const durations: number[] = [];

    for (let i = 0; i < runs; i++) {
      const startTime = Date.now();
      const result = await operation();
      const endTime = Date.now();
      const duration = endTime - startTime;

      results.push(result);
      durations.push(duration);
    }

    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      results,
      durations,
      average,
      min,
      max,
    };
  }

  /**
   * Test concurrent database operations
   */
  static async testConcurrency<T>(
    operationFactory: () => () => Promise<T>,
    concurrency: number = 3,
  ): Promise<{
    results: T[];
    totalDuration: number;
    maxDuration: number;
  }> {
    const startTime = Date.now();

    const operations = Array.from({ length: concurrency }, operationFactory);
    const results = await Promise.all(operations.map(op => op()));

    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    const maxDuration = Math.max(totalDuration / concurrency, 100);

    expect(totalDuration).toBeLessThan(maxDuration * concurrency);

    return {
      results,
      totalDuration,
      maxDuration,
    };
  }
}

/**
 * Database validation utilities
 * Provides consistent validation testing patterns
 */
export class DatabaseValidationUtils {
  /**
   * Test field validation
   */
  static testFieldValidation(
    entity: any,
    field: string,
    validValues: any[],
    invalidValues: any[] = [],
  ) {
    // Test valid values
    validValues.forEach(value => {
      const testEntity = { ...entity, [field]: value };
      expect(() => DatabaseValidationUtils.validateEntity(testEntity, field)).not.toThrow();
    });

    // Test invalid values
    invalidValues.forEach(value => {
      const testEntity = { ...entity, [field]: value };
      expect(() => DatabaseValidationUtils.validateEntity(testEntity, field)).toThrow();
    });
  }

  /**
   * Validate entity structure
   */
  static validateEntity(entity: any, requiredFields: string | string[]) {
    const fields = Array.isArray(requiredFields) ? requiredFields : [requiredFields];

    fields.forEach(field => {
      if (!entity.hasOwnProperty(field)) {
        throw new Error(`Missing required field: ${field}`);
      }

      if (entity[field] === null || entity[field] === undefined) {
        throw new Error(`Field ${field} cannot be null or undefined`);
      }
    });
  }

  /**
   * Test data type validation
   */
  static testDataTypes(entity: any, typeMap: Record<string, string>) {
    Object.entries(typeMap).forEach(([field, expectedType]) => {
      expect(entity).toHaveProperty(field);
      expect(typeof entity[field]).toBe(expectedType);
    });
  }

  /**
   * Test enum validation
   */
  static testEnumValidation(entity: any, field: string, validEnumValues: string[]) {
    expect(entity).toHaveProperty(field);
    expect(validEnumValues).toContain(entity[field]);
  }
}

/**
 * Database error handling utilities
 * Provides consistent error testing patterns
 */
export class DatabaseErrorUtils {
  /**
   * Test error scenarios
   */
  static async testErrorScenarios(
    scenarios: Record<string, () => Promise<any>>,
    expectedErrors: Record<string, string | RegExp>,
  ) {
    for (const [scenarioName, scenarioFn] of Object.entries(scenarios)) {
      try {
        await scenarioFn();
        throw new Error(`Expected ${scenarioName} to throw an error`);
      } catch (error) {
        const expectedError = expectedErrors[scenarioName];
        if (expectedError) {
          if (typeof expectedError === 'string') {
            expect(error.message).toContain(expectedError);
          } else {
            expect(error.message).toMatch(expectedError);
          }
        }
      }
    }
  }

  /**
   * Test specific error types
   */
  static async expectError(operation: () => Promise<any>, expectedErrorMessage: string | RegExp) {
    try {
      await operation();
      throw new Error('Expected operation to throw an error');
    } catch (error) {
      if (typeof expectedErrorMessage === 'string') {
        expect(error.message).toContain(expectedErrorMessage);
      } else {
        expect(error.message).toMatch(expectedErrorMessage);
      }
    }
  }

  /**
   * Test graceful error handling
   */
  static async testGracefulError(operation: () => Promise<any>, fallbackValue?: any) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Should handle error gracefully and return fallback
      expect(fallbackValue).toBeDefined();
      return fallbackValue;
    }
  }
}

/**
 * Database mock utilities
 * Provides helpers for mock management and setup
 */
export class DatabaseMockUtils {
  /**
   * Set up Prisma mocks for specific scenario
   */
  static setupPrismaMocksForScenario(mockClient: any, scenario: 'empty' | 'populated' | 'error') {
    switch (scenario) {
      case 'empty':
        Object.keys(mockClient).forEach(model => {
          if (mockClient[model]?.findMany) {
            mockClient[model].findMany.mockResolvedValue([]);
            mockClient[model].findUnique.mockResolvedValue(null);
            mockClient[model].findFirst.mockResolvedValue(null);
            mockClient[model].count.mockResolvedValue(0);
          }
        });
        break;

      case 'populated':
        Object.keys(mockClient).forEach(model => {
          if (mockClient[model]?.findMany) {
            mockClient[model].findMany.mockResolvedValue([
              { id: `${model}-1`, name: `Test ${model} 1` },
              { id: `${model}-2`, name: `Test ${model} 2` },
            ]);
            mockClient[model].findUnique.mockResolvedValue({
              id: `${model}-test`,
              name: `Test ${model}`,
            });
            mockClient[model].count.mockResolvedValue(2);
          }
        });
        break;

      case 'error':
        Object.keys(mockClient).forEach(model => {
          if (mockClient[model]?.create) {
            mockClient[model].create.mockRejectedValue(new Error(`${model} error`));
            mockClient[model].update.mockRejectedValue(new Error(`${model} error`));
            mockClient[model].delete.mockRejectedValue(new Error(`${model} error`));
          }
        });
        break;
    }
  }

  /**
   * Create mock data for relationship testing
   */
  static createRelatedMockData(entityType: string, relationshipTypes: string[]) {
    const mockData: any = {
      [entityType]: { id: `${entityType}-test`, name: `Test ${entityType}` },
    };

    relationshipTypes.forEach(relType => {
      mockData[relType] = { id: `${relType}-test`, name: `Test ${relType}` };
    });

    return mockData;
  }

  /**
   * Set up transaction mocks
   */
  static setupTransactionMocks(mockClient: any) {
    mockClient.$transaction.mockImplementation(async (operations: any) => {
      if (Array.isArray(operations)) {
        return operations.map((_, index) => ({ id: `transaction-result-${index}` }));
      }
      if (typeof operations === 'function') {
        return operations(mockClient);
      }
      return { id: 'transaction-result' };
    });
  }

  /**
   * Verify mock call patterns
   */
  static verifyMockCallPattern(mockFn: any, expectedCalls: number, expectedArgs?: any[]) {
    expect(mockFn).toHaveBeenCalledTimes(expectedCalls);

    if (expectedArgs) {
      expectedArgs.forEach((args, index) => {
        expect(mockFn).toHaveBeenNthCalledWith(index + 1, args);
      });
    }
  }
}

/**
 * Database data utilities
 * Provides helpers for test data management
 */
export class DatabaseDataUtils {
  /**
   * Create realistic test relationships
   */
  static createTestRelationships(primary: any, relationships: Record<string, any[]>) {
    const result = { ...primary };

    Object.entries(relationships).forEach(([relationName, relatedEntities]) => {
      result[relationName] = relatedEntities.map(entity => ({
        ...entity,
        [`${primary.id || 'primary'}Id`]: primary.id,
      }));
    });

    return result;
  }

  /**
   * Generate bulk test data
   */
  static generateBulkTestData<T>(generator: (index: number) => T, count: number): T[] {
    return Array.from({ length: count }, (_, index) => generator(index));
  }

  /**
   * Create test data with consistent IDs
   */
  static createConsistentTestData(entityType: string, count: number = 3) {
    return Array.from({ length: count }, (_, index) => ({
      id: `${entityType}-${index + 1}`,
      name: `Test ${entityType} ${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  /**
   * Merge test data with overrides
   */
  static mergeTestData<T>(baseData: T, overrides: Partial<T>): T {
    return {
      ...baseData,
      ...overrides,
    };
  }
}

/**
 * Database test cleanup utilities
 * Provides consistent cleanup patterns
 */
export class DatabaseCleanupUtils {
  /**
   * Reset all mocks to default state
   */
  static resetAllMocks() {
    vi.clearAllMocks();
  }

  /**
   * Clean up test data
   */
  static cleanupTestData(testData: Record<string, any>) {
    Object.keys(testData).forEach(key => {
      delete testData[key];
    });
  }

  /**
   * Restore original implementations
   */
  static restoreOriginalImplementations() {
    vi.restoreAllMocks();
  }

  /**
   * Clear all console spies
   */
  static clearConsoleMocks() {
    vi.mocked(console.log)?.mockClear?.();
    vi.mocked(console.error)?.mockClear?.();
    vi.mocked(console.warn)?.mockClear?.();
    vi.mocked(console.info)?.mockClear?.();
  }
}

/**
 * Consolidated test utilities
 * Main export combining all utility classes
 */
export const DatabaseTestUtils = {
  assertions: DatabaseAssertionUtils,
  performance: DatabasePerformanceUtils,
  validation: DatabaseValidationUtils,
  errors: DatabaseErrorUtils,
  mocks: DatabaseMockUtils,
  data: DatabaseDataUtils,
  cleanup: DatabaseCleanupUtils,
};
