/**
 * Specialized utilities for testing seed functions
 *
 * These utilities are specifically designed for testing database seeding
 * functions and provide common patterns used across seed tests.
 */

import { databaseAssertions, mockScenarios, testDataGenerators } from './test-patterns';

/**
 * Configuration for seed function tests
 */
export interface SeedTestConfig {
  /**
   * Models that should be created during seeding
   */
  expectedModels: string[];

  /**
   * Models that should be checked for existing data
   */
  checkModels?: string[];

  /**
   * Whether to test error scenarios
   */
  includeErrorTests?: boolean;

  /**
   * Whether to test existing data scenarios
   */
  includeExistingDataTests?: boolean;

  /**
   * Whether to test logging
   */
  includeLoggingTests?: boolean;

  /**
   * Whether to test concurrent execution
   */
  includeConcurrencyTests?: boolean;
}

/**
 * Create a standardized test suite for seed functions
 */
export function createSeedTestSuite(
  seedFunction: () => Promise<void>,
  mockClient: any,
  config: SeedTestConfig,
) {
  const {
    expectedModels,
    checkModels = expectedModels,
    includeErrorTests = true,
    includeExistingDataTests = true,
    includeLoggingTests = true,
    includeConcurrencyTests = true,
  } = config;

  return {
    /**
     * Test that seed function creates expected models
     */
    testBasicSeeding: async () => {
      mockScenarios.success(mockClient, expectedModels);
      await seedFunction();
      databaseAssertions.expectCrudCalls(mockClient, expectedModels);
    },

    /**
     * Test that seed function handles errors gracefully
     */
    testErrorHandling: includeErrorTests
      ? async () => {
          mockScenarios.error(mockClient, expectedModels, 'Seed error');
          await expect(seedFunction()).resolves.toBeUndefined();
          databaseAssertions.expectErrorHandling();
        }
      : undefined,

    /**
     * Test that seed function skips existing data
     */
    testExistingData: includeExistingDataTests
      ? async () => {
          const existingData = checkModels.reduce(
            (acc, model) => {
              acc[model] = testDataGenerators.generateCommonData(model, {
                name: `Existing ${model}`,
              });
              return acc;
            },
            {} as Record<string, any>,
          );

          mockScenarios.existingData(mockClient, existingData);
          await seedFunction();

          // Should not create new data for existing models
          checkModels.forEach(model => {
            expect(mockClient[model].create).not.toHaveBeenCalled();
          });
        }
      : undefined,

    /**
     * Test that seed function logs progress
     */
    testLogging: includeLoggingTests
      ? async () => {
          mockScenarios.success(mockClient, expectedModels);
          await seedFunction();
          databaseAssertions.expectLogging();
        }
      : undefined,

    /**
     * Test that seed function handles concurrent execution
     */
    testConcurrentExecution: includeConcurrencyTests
      ? async () => {
          mockScenarios.success(mockClient, expectedModels);

          const promises = Array.from({ length: 3 }, () => seedFunction());
          await Promise.all(promises);

          expectedModels.forEach(model => {
            expect(mockClient[model].create).toHaveBeenCalledTimes(3);
          });
        }
      : undefined,

    /**
     * Test partial seeding failures
     */
    testPartialFailure: async () => {
      const failingModels = expectedModels.slice(0, Math.ceil(expectedModels.length / 2));
      const successModels = expectedModels.slice(Math.ceil(expectedModels.length / 2));

      mockScenarios.partialFailure(mockClient, failingModels, successModels);
      await expect(seedFunction()).resolves.toBeUndefined();

      // Should still attempt to create successful models
      successModels.forEach(model => {
        expect(mockClient[model].create).toHaveBeenCalledWith();
      });

      databaseAssertions.expectErrorHandling();
    },

    /**
     * Test data structure validation
     */
    testDataStructure: (model: string, expectedFields: string[]) => async () => {
      mockScenarios.success(mockClient, [model]);
      await seedFunction();
      databaseAssertions.expectModelCreation(mockClient, model, expectedFields);
    },

    /**
     * Test relationship creation
     */
    testRelationships:
      (
        relationships: Array<{
          child: string;
          parent: string;
          foreignKey: string;
        }>,
      ) =>
      async () => {
        const allModels = [
          ...new Set([...relationships.map(r => r.child), ...relationships.map(r => r.parent)]),
        ];

        mockScenarios.success(mockClient, allModels);
        await seedFunction();
        databaseAssertions.expectRelationships(mockClient, relationships);
      },
  };
}

/**
 * Common seed test patterns
 */
export const seedTestPatterns = {
  /**
   * Test that creates all required entities
   */
  basicSeedTest: (seedFunction: () => Promise<void>, mockClient: any, models: string[]) => ({
    name: 'creates all required entities',
    test: async () => {
      mockScenarios.success(mockClient, models);
      await seedFunction();
      databaseAssertions.expectCrudCalls(mockClient, models);
    },
  }),

  /**
   * Test that skips existing data
   */
  skipExistingTest: (
    seedFunction: () => Promise<void>,
    mockClient: any,
    model: string,
    existingData: any,
  ) => ({
    name: `skips existing ${model}`,
    test: async () => {
      mockClient[model].findUnique.mockResolvedValue(existingData);
      mockClient[model].findFirst.mockResolvedValue(existingData);
      await seedFunction();
      expect(mockClient[model].create).not.toHaveBeenCalled();
    },
  }),

  /**
   * Test error handling
   */
  errorHandlingTest: (
    seedFunction: () => Promise<void>,
    mockClient: any,
    model: string,
    errorMessage = 'Test error',
  ) => ({
    name: `handles ${model} creation errors`,
    test: async () => {
      mockClient[model].create.mockRejectedValue(new Error(errorMessage));
      await expect(seedFunction()).resolves.toBeUndefined();
      databaseAssertions.expectErrorHandling();
    },
  }),

  /**
   * Test data validation
   */
  dataValidationTest: (
    seedFunction: () => Promise<void>,
    mockClient: any,
    model: string,
    requiredFields: string[],
  ) => ({
    name: `creates ${model} with correct data structure`,
    test: async () => {
      mockScenarios.success(mockClient, [model]);
      await seedFunction();
      databaseAssertions.expectModelCreation(mockClient, model, requiredFields);
    },
  }),
};

/**
 * Create a comprehensive test description for seed functions
 */
export function describeSeedFunction(
  functionName: string,
  seedFunction: () => Promise<void>,
  mockClient: any,
  config: SeedTestConfig,
) {
  const suite = createSeedTestSuite(seedFunction, mockClient, config);

  return {
    description: `${functionName}`,
    tests: [
      {
        name: 'creates all required entities',
        test: suite.testBasicSeeding,
      },
      ...(suite.testErrorHandling
        ? [
            {
              name: 'handles errors gracefully',
              test: suite.testErrorHandling,
            },
          ]
        : []),
      ...(suite.testExistingData
        ? [
            {
              name: 'skips existing data',
              test: suite.testExistingData,
            },
          ]
        : []),
      ...(suite.testLogging
        ? [
            {
              name: 'logs progress during seeding',
              test: suite.testLogging,
            },
          ]
        : []),
      ...(suite.testConcurrentExecution
        ? [
            {
              name: 'handles concurrent execution safely',
              test: suite.testConcurrentExecution,
            },
          ]
        : []),
      {
        name: 'handles partial seeding failures',
        test: suite.testPartialFailure,
      },
    ],
    utilities: {
      testDataStructure: suite.testDataStructure,
      testRelationships: suite.testRelationships,
    },
  };
}

/**
 * Common seed function expectations
 */
export const seedExpectations = {
  /**
   * Basic CRUD expectations for auth seeding
   */
  auth: {
    models: ['user', 'organization', 'member', 'account', 'apiKey'],
    relationships: [
      { child: 'member', parent: 'user', foreignKey: 'userId' },
      { child: 'member', parent: 'organization', foreignKey: 'organizationId' },
      { child: 'account', parent: 'user', foreignKey: 'userId' },
    ],
    userFields: ['name', 'email', 'emailVerified', 'image'],
    organizationFields: ['name', 'slug', 'image'],
    memberFields: ['role', 'userId', 'organizationId'],
    accountFields: ['type', 'provider', 'providerAccountId', 'userId'],
    apiKeyFields: ['name', 'key', 'permissions'],
  },

  /**
   * Basic CRUD expectations for product seeding
   */
  products: {
    models: ['brand', 'product', 'collection', 'category', 'media'],
    relationships: [
      { child: 'product', parent: 'brand', foreignKey: 'brandId' },
      { child: 'product', parent: 'category', foreignKey: 'categoryId' },
    ],
    brandFields: ['name', 'slug', 'type', 'status'],
    productFields: ['name', 'slug', 'description', 'price', 'brandId', 'status', 'type'],
    collectionFields: ['name', 'slug', 'description'],
    categoryFields: ['name', 'slug', 'parentId'],
  },

  /**
   * Basic CRUD expectations for ecommerce seeding
   */
  ecommerce: {
    models: ['user', 'order', 'cart', 'review', 'registry'],
    relationships: [
      { child: 'order', parent: 'user', foreignKey: 'userId' },
      { child: 'cart', parent: 'user', foreignKey: 'userId' },
      { child: 'review', parent: 'user', foreignKey: 'userId' },
      { child: 'registry', parent: 'user', foreignKey: 'userId' },
    ],
    orderFields: ['userId', 'status', 'total', 'subtotal'],
    cartFields: ['userId', 'items'],
    reviewFields: ['userId', 'productId', 'rating', 'comment'],
    registryFields: ['userId', 'name', 'type', 'isPublic'],
  },
};
