/**
 * @fileoverview Enhanced TypeScript definitions for testing utilities across the QA package.
 *
 * This module provides comprehensive type definitions that improve type safety
 * and developer experience when working with the @repo/qa testing utilities.
 */

import type { Mock } from 'vitest';

// Re-export commonly used Vitest types for convenience
export type { ExpectStatic, Mock, MockInstance } from 'vitest';
export type { InlineConfig, UserConfig } from 'vitest/config';

/**
 * Enhanced type definitions for mock functions with better inference
 */
export type EnhancedMock<T extends (...args: any[]) => any = (...args: any[]) => any> = Mock<T> & {
  /** Human-readable name for debugging */
  mockName?: string;
  /** Custom metadata for testing scenarios */
  metadata?: Record<string, unknown>;
};

/**
 * Database client mock structure with comprehensive CRUD operations
 */
export interface DatabaseMockClient {
  [modelName: string]: {
    // Basic CRUD operations
    create: Mock<[data: { data: Record<string, unknown> }], Promise<Record<string, unknown>>>;
    update: Mock<
      [params: { where: Record<string, unknown>; data: Record<string, unknown> }],
      Promise<Record<string, unknown>>
    >;
    delete: Mock<[params: { where: Record<string, unknown> }], Promise<Record<string, unknown>>>;
    upsert: Mock<
      [
        params: {
          where: Record<string, unknown>;
          create: Record<string, unknown>;
          update: Record<string, unknown>;
        },
      ],
      Promise<Record<string, unknown>>
    >;

    // Query operations
    findUnique: Mock<
      [params: { where: Record<string, unknown> }],
      Promise<Record<string, unknown> | null>
    >;
    findFirst: Mock<
      [params?: { where?: Record<string, unknown> }],
      Promise<Record<string, unknown> | null>
    >;
    findMany: Mock<
      [params?: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }],
      Promise<Record<string, unknown>[]>
    >;

    // Batch operations
    createMany?: Mock<[params: { data: Record<string, unknown>[] }], Promise<{ count: number }>>;
    updateMany?: Mock<
      [params: { where?: Record<string, unknown>; data: Record<string, unknown> }],
      Promise<{ count: number }>
    >;
    deleteMany?: Mock<[params: { where?: Record<string, unknown> }], Promise<{ count: number }>>;

    // Aggregation operations
    count?: Mock<[params?: { where?: Record<string, unknown> }], Promise<number>>;
    aggregate?: Mock<[params: Record<string, unknown>], Promise<Record<string, unknown>>>;
    groupBy?: Mock<[params: Record<string, unknown>], Promise<Record<string, unknown>[]>>;

    // Additional methods can be added as needed
    [method: string]: Mock | undefined;
  };

  // Global operations
  $transaction?: Mock<[operations: unknown[]], Promise<unknown[]>>;
  $connect?: Mock<[], Promise<void>>;
  $disconnect?: Mock<[], Promise<void>>;
  $executeRaw?: Mock<[query: string, ...values: unknown[]], Promise<number>>;
  $queryRaw?: Mock<[query: string, ...values: unknown[]], Promise<unknown[]>>;
}

/**
 * Redis mock client interface with comprehensive Redis operations
 */
export interface RedisMockClient {
  // String operations
  get: Mock<[key: string], Promise<string | null>>;
  set: Mock<[key: string, value: string, options?: { ex?: number; px?: number }], Promise<string>>;
  del: Mock<[...keys: string[]], Promise<number>>;
  exists: Mock<[...keys: string[]], Promise<number>>;
  expire: Mock<[key: string, seconds: number], Promise<number>>;
  ttl: Mock<[key: string], Promise<number>>;
  incr: Mock<[key: string], Promise<number>>;
  decr: Mock<[key: string], Promise<number>>;

  // Hash operations
  hget: Mock<[key: string, field: string], Promise<string | null>>;
  hset: Mock<[key: string, field: string, value: string], Promise<number>>;
  hdel: Mock<[key: string, ...fields: string[]], Promise<number>>;
  hgetall: Mock<[key: string], Promise<Record<string, string>>>;

  // List operations
  lpush: Mock<[key: string, ...values: string[]], Promise<number>>;
  rpush: Mock<[key: string, ...values: string[]], Promise<number>>;
  lpop: Mock<[key: string], Promise<string | null>>;
  rpop: Mock<[key: string], Promise<string | null>>;
  lrange: Mock<[key: string, start: number, stop: number], Promise<string[]>>;

  // Set operations
  sadd: Mock<[key: string, ...members: string[]], Promise<number>>;
  srem: Mock<[key: string, ...members: string[]], Promise<number>>;
  smembers: Mock<[key: string], Promise<string[]>>;

  // Sorted set operations
  zadd: Mock<[key: string, ...scoreMembers: { score: number; member: string }[]], Promise<number>>;
  zrange: Mock<
    [key: string, start: number, stop: number, options?: { withScores?: boolean }],
    Promise<string[] | { member: string; score: number }[]>
  >;
  zrem: Mock<[key: string, ...members: string[]], Promise<number>>;

  // Utility operations
  ping: Mock<[message?: string], Promise<string>>;
  flushall: Mock<[], Promise<string>>;
  keys: Mock<[pattern: string], Promise<string[]>>;
  scan: Mock<
    [cursor: number, options?: { match?: string; count?: number }],
    Promise<[number, string[]]>
  >;

  // Pipeline operations
  pipeline: Mock<
    [],
    {
      set: Mock<[key: string, value: string], Pipeline>;
      get: Mock<[key: string], Pipeline>;
      exec: Mock<[], Promise<unknown[]>>;
    }
  >;

  // Internal testing helpers
  _clear?: Mock<[], void>;
  _getStorage?: Mock<
    [],
    {
      get: (key: string) => unknown;
      set: (key: string, value: unknown) => void;
      delete: (key: string) => boolean;
      clear: () => void;
    }
  >;
}

/**
 * Pipeline interface for Redis batch operations
 */
export interface Pipeline {
  set: Mock<[key: string, value: string], Pipeline>;
  get: Mock<[key: string], Pipeline>;
  del: Mock<[...keys: string[]], Pipeline>;
  incr: Mock<[key: string], Pipeline>;
  exec: Mock<[], Promise<unknown[]>>;
}

/**
 * Authentication mock client interface
 */
export interface AuthMockClient {
  // Authentication operations
  signIn: {
    email: Mock<
      [credentials: { email: string; password: string }],
      Promise<{ user: Record<string, unknown>; session: Record<string, unknown> }>
    >;
    social: Mock<[provider: string, redirectUrl?: string], Promise<{ url: string }>>;
  };
  signUp: {
    email: Mock<
      [credentials: { email: string; password: string; name?: string }],
      Promise<{ user: Record<string, unknown>; session: Record<string, unknown> }>
    >;
  };
  signOut: Mock<[], Promise<void>>;
  getSession: Mock<[], Promise<Record<string, unknown> | null>>;

  // User management
  updateUser: Mock<[data: Record<string, unknown>], Promise<Record<string, unknown>>>;
  changePassword: Mock<[oldPassword: string, newPassword: string], Promise<void>>;

  // Organization management
  organization: {
    create: Mock<[data: Record<string, unknown>], Promise<Record<string, unknown>>>;
    update: Mock<[id: string, data: Record<string, unknown>], Promise<Record<string, unknown>>>;
    delete: Mock<[id: string], Promise<void>>;
    list: Mock<[], Promise<Record<string, unknown>[]>>;
    setActive: Mock<[id: string], Promise<void>>;
    getActive: Mock<[], Promise<Record<string, unknown> | null>>;
  };

  // React hooks
  useAuth: Mock<
    [],
    { data: Record<string, unknown> | null; isPending: boolean; error: Error | null }
  >;
  useSession: Mock<
    [],
    { data: Record<string, unknown> | null; isPending: boolean; error: Error | null }
  >;
}

/**
 * Test scenario configuration for different testing patterns
 */
export interface TestScenarioConfig {
  /** Scenario name for debugging */
  name: string;
  /** Setup function to prepare the scenario */
  setup: () => void | Promise<void>;
  /** Cleanup function to reset after scenario */
  cleanup?: () => void | Promise<void>;
  /** Expected outcomes for validation */
  expectations?: {
    shouldSucceed?: boolean;
    shouldThrow?: boolean | string | RegExp;
    shouldReturn?: unknown;
    shouldCall?: Array<{ mock: Mock; times?: number; with?: unknown[] }>;
  };
}

/**
 * Mock factory configuration for creating standardized mocks
 */
export interface MockFactoryConfig<T = unknown> {
  /** Default return value or factory function */
  defaultValue?: T | (() => T);
  /** Mock implementation function */
  implementation?: (...args: unknown[]) => T;
  /** Metadata to attach to the mock */
  metadata?: Record<string, unknown>;
  /** Whether to track call history */
  trackCalls?: boolean;
  /** Maximum number of calls to track (for memory management) */
  maxCallHistory?: number;
}

/**
 * Performance testing utilities for measuring test execution
 */
export interface PerformanceTestConfig {
  /** Test name for reporting */
  name: string;
  /** Function to measure */
  testFunction: () => void | Promise<void>;
  /** Number of iterations to run */
  iterations?: number;
  /** Whether to warm up before measuring */
  warmup?: boolean;
  /** Expected maximum execution time in milliseconds */
  maxExecutionTime?: number;
  /** Whether to collect garbage between iterations */
  collectGarbage?: boolean;
}

/**
 * Test data generation configuration with validation
 */
export interface TestDataConfig<T = Record<string, unknown>> {
  /** Base data template */
  template: T;
  /** Fields that are required and cannot be overridden */
  requiredFields?: Array<keyof T>;
  /** Validation schema for generated data */
  validator?: (data: T) => boolean | string;
  /** Factory functions for complex fields */
  factories?: Partial<Record<keyof T, () => T[keyof T]>>;
  /** Default overrides to apply */
  defaults?: Partial<T>;
}

/**
 * Mock validation utilities for ensuring mock correctness
 */
export interface MockValidationResult {
  /** Whether the mock passed validation */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Performance metrics */
  metrics: {
    totalCalls: number;
    averageExecutionTime: number;
    memoryUsage: number;
  };
}

/**
 * Test environment configuration with type safety
 */
export interface TestEnvironmentConfig {
  /** Environment name */
  name: string;
  /** Setup function for the environment */
  setup: () => void | Promise<void>;
  /** Teardown function for cleanup */
  teardown: () => void | Promise<void>;
  /** Environment variables to set */
  envVars?: Record<string, string>;
  /** Mock configurations for this environment */
  mocks?: Record<string, MockFactoryConfig>;
  /** Whether this environment supports parallel execution */
  supportsParallel?: boolean;
}

/**
 * Utility type for extracting mock function signatures
 */
export type MockOf<T> = T extends (...args: infer P) => infer R
  ? Mock<P, R>
  : T extends Record<string, any>
    ? { [K in keyof T]: MockOf<T[K]> }
    : Mock;

/**
 * Utility type for creating partial mocks of objects
 */
export type PartialMock<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? MockOf<T[K]>
    : T[K] extends Record<string, any>
      ? PartialMock<T[K]>
      : T[K];
};

/**
 * Test assertion helpers with enhanced type safety
 */
export interface AssertionHelpers {
  /** Assert that a mock was called with specific arguments */
  expectCalledWith<T extends Mock>(mock: T, ...args: Parameters<T>): void;
  /** Assert that a mock was called a specific number of times */
  expectCallCount<T extends Mock>(mock: T, count: number): void;
  /** Assert that multiple mocks were called in a specific order */
  expectCallOrder(mocks: Mock[]): void;
  /** Assert that a mock returns a specific value */
  expectReturns<T extends Mock>(mock: T, value: ReturnType<T>): void;
  /** Assert that a mock throws a specific error */
  expectThrows<T extends Mock>(mock: T, error: Error | string | RegExp): void;
}

/**
 * Global test configuration with comprehensive options
 */
export interface GlobalTestConfig {
  /** Default timeout for all tests */
  defaultTimeout?: number;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Maximum memory usage before triggering cleanup */
  memoryThreshold?: number;
  /** Default mock configurations */
  defaultMocks?: Record<string, MockFactoryConfig>;
  /** Global setup and teardown functions */
  hooks?: {
    beforeAll?: () => void | Promise<void>;
    afterAll?: () => void | Promise<void>;
    beforeEach?: () => void | Promise<void>;
    afterEach?: () => void | Promise<void>;
  };
  /** Custom assertion helpers */
  assertions?: AssertionHelpers;
}

/**
 * Utility types for better type inference in tests
 */
export type TestFunction = () => void | Promise<void>;
export type TestHook = () => void | Promise<void>;
export type TestDescribe = (name: string, fn: () => void) => void;
export type TestIt = (name: string, fn: TestFunction, timeout?: number) => void;

/**
 * Export a namespace with all testing types for easy imports
 */
export namespace Testing {
  export type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> = EnhancedMock<T>;
  export type DatabaseClient = DatabaseMockClient;
  export type RedisClient = RedisMockClient;
  export type AuthClient = AuthMockClient;
  export type ScenarioConfig = TestScenarioConfig;
  export type FactoryConfig<T = unknown> = MockFactoryConfig<T>;
  export type PerformanceConfig = PerformanceTestConfig;
  export type DataConfig<T = Record<string, unknown>> = TestDataConfig<T>;
  export type ValidationResult = MockValidationResult;
  export type EnvironmentConfig = TestEnvironmentConfig;
  export type GlobalConfig = GlobalTestConfig;
}
