/**
 * @fileoverview Common test patterns and utilities to reduce duplication across test files.
 *
 * This module provides reusable test patterns that are commonly used
 * across the database package and other tests in the monorepo.
 *
 * @example
 * ```ts
 * import { databaseAssertions, testDataGenerators } from '@repo/qa/vitest/utils/test-patterns';
 *
 * // Use in your tests
 * databaseAssertions.expectCrudCalls(mockClient, ['User', 'Post']);
 * const user = testDataGenerators.generateUser({ email: 'test@example.com' });
 * ```
 *
 * @note vi is not imported here to avoid Vitest context issues during build.
 * Test files should import vi directly and pass it to functions that need it.
 */

// Enhanced type definitions for better type safety
export interface DatabaseClient {
  [model: string]: {
    create: { mock: { calls: unknown[][] }; mockResolvedValue: (value: unknown) => void };
    update: { mock: { calls: unknown[][] }; mockResolvedValue: (value: unknown) => void };
    delete: { mock: { calls: unknown[][] }; mockRejectedValue: (error: Error) => void };
    findUnique: { mock: { calls: unknown[][] }; mockResolvedValue: (value: unknown) => void };
    findFirst: { mock: { calls: unknown[][] }; mockResolvedValue: (value: unknown) => void };
    findMany: { mock: { calls: unknown[][] }; mockResolvedValue: (value: unknown) => void };
    createMany?: { mock: { calls: unknown[][] }; mockResolvedValue: (value: unknown) => void };
    [method: string]: unknown;
  };
}

export interface TestDataOverrides {
  [key: string]: unknown;
}

export interface RelationshipDefinition {
  child: string;
  parent: string;
  foreignKey: string;
}

export interface MockScenarioOptions {
  /** Models to apply the scenario to */
  models?: string[];
  /** Custom error message for error scenarios */
  errorMessage?: string;
  /** Custom data for existing data scenarios */
  existingData?: Record<string, unknown>;
}

/**
 * Common test assertions for database operations with enhanced type safety.
 *
 * @description Provides standardized assertions for database testing scenarios
 * including CRUD operations, relationships, logging, and data validation.
 */
export const databaseAssertions = {
  /**
   * Assert that basic CRUD operations were called.
   *
   * @param mockClient - The mocked database client
   * @param models - Array of model names to check
   *
   * @example
   * ```ts
   * databaseAssertions.expectCrudCalls(mockPrisma, ['User', 'Post']);
   * ```
   */
  expectCrudCalls: (mockClient: DatabaseClient, models: string[]): void => {
    if (!mockClient || !Array.isArray(models)) {
      throw new Error('Invalid parameters: mockClient and models array required');
    }

    models.forEach(model => {
      if (!mockClient[model]) {
        throw new Error(`Model '${model}' not found in mock client`);
      }
      expect(mockClient[model].create).toHaveBeenCalledWith();
    });
  },

  /**
   * Assert that specific models were created with correct data structure.
   *
   * @param mockClient - The mocked database client
   * @param model - Model name to check
   * @param expectedFields - Array of field names that should be present
   *
   * @example
   * ```ts
   * databaseAssertions.expectModelCreation(
   *   mockPrisma,
   *   'User',
   *   ['email', 'name', 'createdAt']
   * );
   * ```
   */
  expectModelCreation: (
    mockClient: DatabaseClient,
    model: string,
    expectedFields: string[],
  ): void => {
    if (!mockClient[model]) {
      throw new Error(`Model '${model}' not found in mock client`);
    }

    const calls = mockClient[model].create.mock.calls;
    if (calls.length === 0) {
      throw new Error(`No create calls found for model '${model}'`);
    }

    const createCall = calls[0]?.[0] as { data?: Record<string, unknown> };
    if (!createCall) {
      throw new Error(`Invalid create call structure for model '${model}'`);
    }

    expect(createCall).toHaveProperty('data');

    if (!createCall.data) {
      throw new Error(`Create call data is missing for model '${model}'`);
    }

    expectedFields.forEach(field => {
      expect(createCall.data).toHaveProperty(field);
    });
  },

  /**
   * Assert that relationships were created correctly.
   *
   * @param mockClient - The mocked database client
   * @param relationships - Array of relationship definitions to validate
   *
   * @example
   * ```ts
   * databaseAssertions.expectRelationships(mockPrisma, [
   *   { child: 'Post', parent: 'User', foreignKey: 'userId' }
   * ]);
   * ```
   */
  expectRelationships: (
    mockClient: DatabaseClient,
    relationships: RelationshipDefinition[],
  ): void => {
    if (!Array.isArray(relationships)) {
      throw new Error('Relationships must be an array');
    }

    relationships.forEach(({ child, parent, foreignKey }) => {
      if (!mockClient[child] || !mockClient[parent]) {
        throw new Error(`Models '${child}' or '${parent}' not found in mock client`);
      }

      const childCalls = mockClient[child].create.mock.calls;
      const parentCalls = mockClient[parent].create.mock.calls;

      if (childCalls.length === 0 || parentCalls.length === 0) {
        throw new Error(`Missing create calls for relationship ${parent} -> ${child}`);
      }

      const childCall = childCalls[0]?.[0] as { data?: Record<string, unknown> };
      const parentCall = parentCalls[0]?.[0] as { data?: Record<string, unknown> };

      if (!childCall?.data || !parentCall?.data) {
        throw new Error(`Invalid call structure for relationship ${parent} -> ${child}`);
      }

      expect(childCall.data[foreignKey]).toBe(parentCall.data.id);
    });
  },

  /**
   * Assert that console logging occurred during operation
   */
  expectLogging: () => {
    expect(console.log).toHaveBeenCalledWith();
  },

  /**
   * Assert that error handling was called
   */
  expectErrorHandling: () => {
    expect(console.error).toHaveBeenCalledWith();
  },

  /**
   * Assert that an object has the expected structure/properties
   */
  expectDataStructure: (obj: any, expectedFields: string[]) => {
    expectedFields.forEach(field => {
      expect(obj).toHaveProperty(field);
    });
  },

  /**
   * Assert that a string is a valid email format
   */
  expectValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(email)).toBeTruthy();
  },

  /**
   * Assert that mock calls were made correctly for specific operations.
   *
   * @param mockClient - The mocked database client
   * @param expectedCalls - Array of model names to check
   * @param operation - Database operation to verify (create, update, delete, etc.)
   *
   * @example
   * ```ts
   * databaseAssertions.expectMockCalls(mockPrisma, ['User', 'Post'], 'create');
   * ```
   */
  expectMockCalls: (
    mockClient: DatabaseClient,
    expectedCalls: string[],
    operation: string,
  ): void => {
    if (!Array.isArray(expectedCalls) || typeof operation !== 'string') {
      throw new Error('Invalid parameters: expectedCalls must be array, operation must be string');
    }

    expectedCalls.forEach(modelName => {
      const model = mockClient[modelName];
      if (!model) {
        throw new Error(`Model '${modelName}' not found in mock client`);
      }

      const operationMock = model[operation] as { mock?: { calls: unknown[][] } } | undefined;
      if (!operationMock) {
        throw new Error(`Operation '${operation}' not found for model '${modelName}'`);
      }

      expect(operationMock).toHaveBeenCalledWith();
    });
  },
};

/**
 * Common test data generators for different data types with enhanced type safety.
 *
 * @description Provides consistent test data factories for common entities
 * used across the monorepo testing scenarios.
 */
export const testDataGenerators = {
  /**
   * Generate test data with common fields.
   *
   * @param type - Type identifier for the data
   * @param overrides - Custom field overrides
   * @returns Test data object with common fields
   *
   * @example
   * ```ts
   * const data = testDataGenerators.generateCommonData('user', { name: 'John' });
   * ```
   */
  generateCommonData: (
    type: string,
    overrides: TestDataOverrides = {},
  ): Record<string, unknown> => ({
    id: `${type}-test-id`,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }),

  /**
   * Generate user test data with realistic defaults.
   *
   * @param overrides - Custom field overrides
   * @returns User test data object
   *
   * @example
   * ```ts
   * const user = testDataGenerators.generateUser({
   *   email: 'custom@example.com',
   *   name: 'Custom User'
   * });
   * ```
   */
  generateUser: (overrides: TestDataOverrides = {}): Record<string, unknown> => ({
    id: 'user-test-id',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: new Date('2024-01-01T00:00:00.000Z'),
    image: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }),

  /**
   * Generate brand test data
   */
  generateBrand: (overrides: Record<string, any> = {}) => ({
    id: 'brand-test-id',
    name: 'Test Brand',
    slug: 'test-brand',
    type: 'LABEL',
    status: 'PUBLISHED',
    parentId: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  }),

  /**
   * Generate product test data
   */
  generateProduct: (overrides: Record<string, any> = {}) => ({
    id: 'product-test-id',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    price: 99.99,
    brandId: 'brand-test-id',
    status: 'PUBLISHED',
    type: 'SIMPLE',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  }),

  /**
   * Generate order test data
   */
  generateOrder: (overrides: Record<string, any> = {}) => ({
    id: 'order-test-id',
    userId: 'user-test-id',
    status: 'PENDING',
    total: 199.98,
    subtotal: 199.98,
    tax: 0,
    shipping: 0,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }),
};

/**
 * Common mock scenarios for different test cases with enhanced flexibility.
 *
 * @description Provides pre-configured mock scenarios for common testing
 * patterns including success, error, and data existence scenarios.
 */
export const mockScenarios = {
  /**
   * Setup successful operation scenario for database operations.
   *
   * @param mockClient - The mocked database client
   * @param models - Array of model names to configure
   *
   * @example
   * ```ts
   * mockScenarios.success(mockPrisma, ['User', 'Post']);
   * ```
   */
  success: (mockClient: DatabaseClient, models: string[] = []): void => {
    models.forEach(model => {
      if (mockClient[model]) {
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
   * Setup error scenario for testing error handling.
   *
   * @param mockClient - The mocked database client
   * @param models - Array of model names to configure with errors
   * @param errorMessage - Custom error message to use
   *
   * @example
   * ```ts
   * mockScenarios.error(mockPrisma, ['User'], 'Database connection failed');
   * ```
   */
  error: (mockClient: DatabaseClient, models: string[], errorMessage = 'Test error'): void => {
    models.forEach(model => {
      if (mockClient[model]) {
        Object.keys(mockClient[model]).forEach(method => {
          const mockMethod = mockClient[model][method];
          if (mockMethod && typeof mockMethod === 'object' && 'mockRejectedValue' in mockMethod) {
            (mockMethod as any).mockRejectedValue(new Error(errorMessage));
          }
        });
      }
    });
  },

  /**
   * Setup existing data scenario for testing data conflicts.
   *
   * @param mockClient - The mocked database client
   * @param existingData - Map of model names to existing data
   *
   * @example
   * ```ts
   * mockScenarios.existingData(mockPrisma, {
   *   User: { id: '1', email: 'existing@example.com' }
   * });
   * ```
   */
  existingData: (mockClient: DatabaseClient, existingData: Record<string, unknown>): void => {
    Object.entries(existingData).forEach(([model, data]) => {
      if (mockClient[model]) {
        mockClient[model].findUnique.mockResolvedValue(data);
        mockClient[model].findFirst.mockResolvedValue(data);
        mockClient[model].findMany.mockResolvedValue([data]);
      }
    });
  },

  /**
   * Setup partial failure scenario
   */
  partialFailure: (mockClient: any, failingModels: string[], successModels: string[]) => {
    // Setup failures
    mockScenarios.error(mockClient, failingModels);
    // Setup successes
    mockScenarios.success(mockClient, successModels);
  },

  /**
   * Test entity errors for multiple models with proper error isolation.
   *
   * @param mockClient - The mocked database client
   * @param entities - Array of entity names to configure with errors
   * @param testFunction - Async test function to execute
   *
   * @example
   * ```ts
   * await mockScenarios.testEntityErrors(
   *   mockPrisma,
   *   ['User', 'Post'],
   *   async () => await myDatabaseFunction()
   * );
   * ```
   */
  testEntityErrors: async (
    mockClient: DatabaseClient,
    entities: string[],
    testFunction: () => Promise<void>,
  ): Promise<void> => {
    // Validate inputs
    if (!Array.isArray(entities)) {
      throw new Error('Entities must be an array');
    }

    if (typeof testFunction !== 'function') {
      throw new Error('Test function must be a function');
    }

    // Setup error scenarios for each entity
    entities.forEach(entity => {
      const model = mockClient[entity];
      if (!model) {
        throw new Error(`Entity '${entity}' not found in mock client`);
      }

      Object.keys(model).forEach(method => {
        const mockMethod = model[method] as { mockRejectedValue?: (error: Error) => void };
        if (mockMethod && typeof mockMethod.mockRejectedValue === 'function') {
          mockMethod.mockRejectedValue(new Error(`${entity} error`));
        }
      });
    });

    // Execute test function - expect should be called by the test itself
    await testFunction();
  },

  /**
   * Test concurrent execution with configurable concurrency level.
   *
   * @param testFunction - Async function to execute concurrently
   * @param concurrency - Number of concurrent executions (default: 5, max: 20)
   * @returns Array of results from all executions
   *
   * @example
   * ```ts
   * const results = await mockScenarios.testConcurrentExecution(
   *   async () => await myAsyncFunction(),
   *   3
   * );
   * ```
   */
  testConcurrentExecution: async <T>(
    testFunction: () => Promise<T>,
    concurrency: number = 5,
  ): Promise<T[]> => {
    // Validate inputs
    if (typeof testFunction !== 'function') {
      throw new Error('Test function must be a function');
    }

    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 20) {
      throw new Error('Concurrency must be an integer between 1 and 20');
    }

    const promises = Array.from({ length: concurrency }, () => testFunction());
    const results = await Promise.all(promises);

    // Return results for test to verify
    return results;
  },
};

/**
 * Utilities for test environment setup
 */
export const environmentUtils = {
  /**
   * Setup environment variables for tests
   */
  setupEnv: (envVars: Record<string, string>) => {
    const originalEnv = { ...process.env };
    Object.assign(process.env, envVars);
    return () => {
      process.env = originalEnv;
    };
  },

  /**
   * Mock Math.random for deterministic tests
   */
  mockRandom: (vi: any, value = 0.5) => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(value);
    return () => spy.mockRestore();
  },

  /**
   * Mock Date.now for consistent timestamps
   */
  mockDateNow: (vi: any, timestamp = new Date('2024-01-01T00:00:00.000Z').getTime()) => {
    const spy = vi.spyOn(Date, 'now').mockReturnValue(timestamp);
    return () => spy.mockRestore();
  },
};

/**
 * Common test cases patterns
 */
export const testCasePatterns = {
  /**
   * Test basic functionality
   */
  basicFunctionality: {
    name: 'executes basic functionality correctly',
    description: 'Tests that the function performs its primary operation without errors',
  },

  /**
   * Test error handling
   */
  errorHandling: {
    name: 'handles errors gracefully',
    description: 'Tests that the function properly handles and logs errors',
  },

  /**
   * Test with existing data
   */
  existingData: {
    name: 'skips creation when data already exists',
    description:
      'Tests that the function checks for existing data and skips creation appropriately',
  },

  /**
   * Test data structure validation
   */
  dataStructure: {
    name: 'creates data with correct structure',
    description: 'Tests that created data contains all required fields',
  },

  /**
   * Test relationships
   */
  relationships: {
    name: 'creates proper relationships between entities',
    description: 'Tests that foreign key relationships are established correctly',
  },

  /**
   * Test concurrent execution
   */
  concurrentExecution: {
    name: 'handles concurrent execution safely',
    description:
      'Tests that the function works correctly when called multiple times simultaneously',
  },

  /**
   * Test logging
   */
  logging: {
    name: 'logs progress during execution',
    description: 'Tests that appropriate logging occurs during function execution',
  },

  /**
   * Test edge cases
   */
  edgeCases: {
    name: 'handles edge cases appropriately',
    description: 'Tests boundary conditions and unusual input scenarios',
  },
};

/**
 * Generate standard test suite for a function
 */
export function generateStandardTestSuite(
  functionName: string,
  testFunction: () => Promise<void>,
  mockClient: any,
  options: {
    models?: string[];
    includeErrorHandling?: boolean;
    includeExistingData?: boolean;
    includeConcurrency?: boolean;
    includeLogging?: boolean;
  } = {},
) {
  const {
    models = [],
    includeErrorHandling = true,
    includeExistingData = true,
    includeConcurrency = true,
    includeLogging = true,
  } = options;

  const testSuite = [];

  // Basic functionality test
  testSuite.push({
    name: testCasePatterns.basicFunctionality.name,
    test: async () => {
      mockScenarios.success(mockClient, models);
      await testFunction();
      if (models.length > 0) {
        databaseAssertions.expectCrudCalls(mockClient, models);
      }
    },
  });

  // Error handling test
  if (includeErrorHandling) {
    testSuite.push({
      name: testCasePatterns.errorHandling.name,
      test: async () => {
        mockScenarios.error(mockClient, models);
        await expect(testFunction()).resolves.toBeUndefined();
        databaseAssertions.expectErrorHandling();
      },
    });
  }

  // Existing data test
  if (includeExistingData && models.length > 0) {
    testSuite.push({
      name: testCasePatterns.existingData.name,
      test: async () => {
        const existingData = models.reduce(
          (acc, model) => {
            acc[model] = { id: `existing-${model}` };
            return acc;
          },
          {} as Record<string, any>,
        );

        mockScenarios.existingData(mockClient, existingData);
        await testFunction();

        models.forEach(model => {
          expect(mockClient[model].create).not.toHaveBeenCalled();
        });
      },
    });
  }

  // Concurrent execution test
  if (includeConcurrency) {
    testSuite.push({
      name: testCasePatterns.concurrentExecution.name,
      test: async () => {
        mockScenarios.success(mockClient, models);

        const promises = Array.from({ length: 3 }, () => testFunction());
        await Promise.all(promises);

        if (models.length > 0) {
          models.forEach(model => {
            expect(mockClient[model].create).toHaveBeenCalledTimes(3);
          });
        }
      },
    });
  }

  // Logging test
  if (includeLogging) {
    testSuite.push({
      name: testCasePatterns.logging.name,
      test: async () => {
        mockScenarios.success(mockClient, models);
        await testFunction();
        databaseAssertions.expectLogging();
      },
    });
  }

  return testSuite;
}

// ================================================================================================
// OBSERVABILITY-SPECIFIC DRY PATTERNS
// ================================================================================================

/**
 * Common observability test assertions
 */
export const observabilityAssertions = {
  /**
   * Assert that a plugin was initialized correctly
   */
  expectPluginInitialization: (mockClient: any, pluginName: string) => {
    expect(mockClient.init || mockClient.initialize).toHaveBeenCalledWith();
  },

  /**
   * Assert that error capture was called with correct parameters
   */
  expectErrorCapture: (mockClient: any, error: any, context?: any) => {
    expect(mockClient.captureException).toHaveBeenCalledWith(error, context);
  },

  /**
   * Assert that message capture was called with correct parameters
   */
  expectMessageCapture: (mockClient: any, message: string, level?: string, context?: any) => {
    const logMethod = level === 'warning' ? 'warn' : level;
    if (logMethod && mockClient[logMethod]) {
      expect(mockClient[logMethod]).toHaveBeenCalledWith(message, expect.any(Object));
    } else {
      expect(mockClient.captureMessage).toHaveBeenCalledWith(message, level);
    }
  },

  /**
   * Assert that user was set correctly
   */
  expectUserSet: (mockClient: any, user: any) => {
    expect(mockClient.setUser).toHaveBeenCalledWith(user);
  },

  /**
   * Assert that breadcrumb was added
   */
  expectBreadcrumbAdded: (mockClient: any, breadcrumb: any) => {
    expect(mockClient.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
  },

  /**
   * Assert that flush was called
   */
  expectFlush: (mockClient: any) => {
    expect(mockClient.flush).toHaveBeenCalledWith();
  },

  /**
   * Assert that shutdown was called
   */
  expectShutdown: (mockClient: any) => {
    expect(mockClient.close || mockClient.shutdown || mockClient.dispose).toHaveBeenCalledWith();
  },

  /**
   * Assert that scope was used correctly
   */
  expectScopeUsage: (mockClient: any, callback?: any) => {
    expect(mockClient.withScope).toHaveBeenCalledWith();
    if (callback) {
      expect(mockClient.withScope).toHaveBeenCalledWith(callback);
    }
  },
};

/**
 * Common observability test scenarios
 */
export const observabilityScenarios = {
  /**
   * Test plugin lifecycle (initialization, operation, shutdown)
   */
  testPluginLifecycle: (
    pluginName: string,
    createPlugin: () => any,
    mockSetup: any,
    options: {
      includeInitialization?: boolean;
      includeShutdown?: boolean;
      includeErrorHandling?: boolean;
    } = {},
  ) => {
    const {
      includeInitialization = true,
      includeShutdown = true,
      includeErrorHandling = true,
    } = options;

    const tests = [];

    if (includeInitialization) {
      tests.push({
        name: `${pluginName} should initialize correctly`,
        test: async () => {
          const plugin = createPlugin();
          mockSetup.scenarios.success();

          if (plugin.initialize) {
            await plugin.initialize();
            observabilityAssertions.expectPluginInitialization(mockSetup.mockClient, pluginName);
          }
        },
      });

      if (includeErrorHandling) {
        tests.push({
          name: `${pluginName} should handle initialization errors`,
          test: async () => {
            const plugin = createPlugin();
            mockSetup.scenarios.initError?.();

            if (plugin.initialize) {
              await plugin.initialize();
              expect(plugin.enabled).toBeFalsy();
            }
          },
        });
      }
    }

    if (includeShutdown) {
      tests.push({
        name: `${pluginName} should shutdown correctly`,
        test: async () => {
          const plugin = createPlugin();
          mockSetup.scenarios.success();

          if (plugin.initialize) {
            await plugin.initialize();
          }

          if (plugin.shutdown) {
            await plugin.shutdown();
            observabilityAssertions.expectShutdown(mockSetup.mockClient);
          }
        },
      });
    }

    return tests;
  },

  /**
   * Test error capture scenarios
   */
  testErrorCapture: (
    pluginName: string,
    createPlugin: () => any,
    mockSetup: any,
    errorScenarios: Array<{
      name: string;
      error: any;
      context?: any;
      expectation?: (mockClient: any, error: any, context?: any) => void;
    }>,
  ) => {
    return errorScenarios.map(scenario => ({
      name: `${pluginName} should capture ${scenario.name}`,
      test: async () => {
        const plugin = createPlugin();
        mockSetup.scenarios.success();

        if (plugin.initialize) {
          await plugin.initialize();
        }

        plugin.captureException(scenario.error, scenario.context);

        if (scenario.expectation) {
          scenario.expectation(mockSetup.mockClient, scenario.error, scenario.context);
        } else {
          observabilityAssertions.expectErrorCapture(
            mockSetup.mockClient,
            scenario.error,
            scenario.context,
          );
        }
      },
    }));
  },

  /**
   * Test message capture scenarios
   */
  testMessageCapture: (
    pluginName: string,
    createPlugin: () => any,
    mockSetup: any,
    messageScenarios: Array<{
      name: string;
      message: string;
      level?: string;
      context?: any;
      expectation?: (mockClient: any, message: string, level?: string, context?: any) => void;
    }>,
  ) => {
    return messageScenarios.map(scenario => ({
      name: `${pluginName} should capture ${scenario.name}`,
      test: async () => {
        const plugin = createPlugin();
        mockSetup.scenarios.success();

        if (plugin.initialize) {
          await plugin.initialize();
        }

        plugin.captureMessage(scenario.message, scenario.level, scenario.context);

        if (scenario.expectation) {
          scenario.expectation(
            mockSetup.mockClient,
            scenario.message,
            scenario.level,
            scenario.context,
          );
        } else {
          observabilityAssertions.expectMessageCapture(
            mockSetup.mockClient,
            scenario.message,
            scenario.level,
            scenario.context,
          );
        }
      },
    }));
  },

  /**
   * Test user management scenarios
   */
  testUserManagement: (
    pluginName: string,
    createPlugin: () => any,
    mockSetup: any,
    userScenarios: Array<{
      name: string;
      user: any;
      expectation?: (mockClient: any, user: any) => void;
    }>,
  ) => {
    return userScenarios.map(scenario => ({
      name: `${pluginName} should handle ${scenario.name}`,
      test: async () => {
        const plugin = createPlugin();
        mockSetup.scenarios.success();

        if (plugin.initialize) {
          await plugin.initialize();
        }

        plugin.setUser(scenario.user);

        if (scenario.expectation) {
          scenario.expectation(mockSetup.mockClient, scenario.user);
        } else {
          observabilityAssertions.expectUserSet(mockSetup.mockClient, scenario.user);
        }
      },
    }));
  },

  /**
   * Test integration workflows
   */
  testIntegrationWorkflow: (
    pluginName: string,
    createPlugin: () => any,
    mockSetup: any,
    workflowSteps: Array<{
      name: string;
      action: (plugin: any) => Promise<void> | void;
      expectation: (mockClient: any, plugin: any) => void;
    }>,
  ) => {
    return [
      {
        name: `${pluginName} should handle complex integration workflow`,
        test: async () => {
          const plugin = createPlugin();
          mockSetup.scenarios.success();

          if (plugin.initialize) {
            await plugin.initialize();
          }

          for (const step of workflowSteps) {
            await step.action(plugin);
            step.expectation(mockSetup.mockClient, plugin);
          }
        },
      },
    ];
  },
};

/**
 * Standard observability test data generators
 */
export const observabilityTestData = {
  /**
   * Generate standard error objects
   */
  error: (message = 'Test error') => new Error(message),

  /**
   * Generate standard context objects
   */
  context: (overrides = {}) => ({
    extra: { key: 'value' },
    tags: { component: 'test' },
    user: { id: '123' },
    ...overrides,
  }),

  /**
   * Generate standard user objects
   */
  user: (overrides = {}) => ({
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  }),

  /**
   * Generate standard breadcrumb objects
   */
  breadcrumb: (overrides = {}) => ({
    message: 'Test breadcrumb',
    level: 'info' as const,
    timestamp: Date.now() / 1000,
    ...overrides,
  }),

  /**
   * Generate standard message scenarios
   */
  messageScenarios: () => [
    { name: 'info message', message: 'Test info message', level: 'info' },
    { name: 'debug message', message: 'Test debug message', level: 'debug' },
    { name: 'warning message', message: 'Test warning message', level: 'warning' },
    { name: 'error message', message: 'Test error message', level: 'error' },
  ],

  /**
   * Generate standard error scenarios
   */
  errorScenarios: () => [
    { name: 'standard error', error: new Error('Standard error') },
    { name: 'string error', error: 'String error' },
    {
      name: 'error with context',
      error: new Error('Context error'),
      context: { extra: { key: 'value' } },
    },
  ],

  /**
   * Generate standard user scenarios
   */
  userScenarios: () => [
    { name: 'valid user', user: { id: '123', email: 'test@example.com', name: 'Test User' } },
    { name: 'null user', user: null },
    { name: 'minimal user', user: { id: '456' } },
  ],
};

/**
 * Factory function to create observability test utilities with vi pre-bound
 * This provides a convenient way to use the utilities in test files
 */
export function createObservabilityTestUtils(vi: any) {
  return {
    // All scenarios work as-is since they don't use vi directly
    scenarios: observabilityScenarios,

    // All assertions work as-is since they only use expect()
    assertions: observabilityAssertions,

    // All test data generators work as-is
    testData: observabilityTestData,

    // Environment utils with vi pre-bound
    environmentUtils: {
      ...environmentUtils,
      mockRandom: (value = 0.5) => environmentUtils.mockRandom(vi, value),
      mockDateNow: (timestamp = new Date('2024-01-01T00:00:00.000Z').getTime()) =>
        environmentUtils.mockDateNow(vi, timestamp),
    },
  };
}
