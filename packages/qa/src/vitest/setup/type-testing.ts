/**
 * Type testing setup for Vitest
 * This file provides setup and utilities for TypeScript type testing
 */

// Import type testing utilities
import { afterEach, beforeEach, vi } from 'vitest';
import { CONSOLE_PRESETS, setupConsoleSuppression } from '../utils/console';

// Setup type testing environment
beforeEach(() => {
  // Mock console to reduce noise during type tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});

  // Set environment variables for type testing
  process.env.NODE_ENV = 'test';
  process.env.VITEST_TYPE_TESTING = 'true';

  // Mock global types that might interfere with type tests
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('Request', vi.fn());
  vi.stubGlobal('Response', vi.fn());
  vi.stubGlobal('Headers', vi.fn());
});

afterEach(() => {
  // Restore all mocks
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Apply type testing console suppression
setupConsoleSuppression(CONSOLE_PRESETS.typescript);

// Global type testing utilities
declare global {
  var typeTestUtils: {
    mockTypeOnly<T>(): T;
    createTypeFactory<T>(factory: () => T): () => T;
    expectTypeError<T>(fn: () => T): void;
    expectNoTypeError<T>(fn: () => T): void;
    createDummyValue<T>(): T;
    isBuildTimeTypeTest(): boolean;
    isRuntimeTypeTest(): boolean;
  };
}

// Type testing utilities
globalThis.typeTestUtils = {
  /**
   * Creates a type-only mock (no runtime implementation)
   */
  mockTypeOnly<T>(): T {
    return {} as T;
  },

  /**
   * Creates a type factory for consistent type testing
   */
  createTypeFactory<T>(factory: () => T): () => T {
    return factory;
  },

  /**
   * Expects a type error to occur (for negative testing)
   */
  expectTypeError<T>(fn: () => T): void {
    try {
      fn();
      // If we get here, the type error didn't occur
      throw new Error('Expected type error but none occurred');
    } catch (error) {
      // Type error occurred as expected
      if (error instanceof TypeError) {
        return;
      }
      throw error;
    }
  },

  /**
   * Expects no type error to occur (for positive testing)
   */
  expectNoTypeError<T>(fn: () => T): void {
    try {
      fn();
      // If we get here, no type error occurred as expected
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Unexpected type error: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Creates a dummy value for type testing
   */
  createDummyValue<T>(): T {
    return {} as T;
  },

  /**
   * Checks if running in build-time type test mode
   */
  isBuildTimeTypeTest(): boolean {
    return process.env.VITEST_TYPE_TESTING === 'true';
  },

  /**
   * Checks if running in runtime type test mode
   */
  isRuntimeTypeTest(): boolean {
    return !this.isBuildTimeTypeTest();
  },
};

// Type testing helpers for common patterns
const typeTestingHelpers = {
  /**
   * Create a type-safe mock for interfaces
   */
  mockInterface<T>(): T {
    return {} as T;
  },

  /**
   * Create a type-safe mock for classes
   */
  mockClass<T extends new (...args: any[]) => any>(constructor: T): InstanceType<T> {
    return {} as InstanceType<T>;
  },

  /**
   * Create a type-safe mock for functions
   */
  mockFunction<T extends (...args: any[]) => any>(): T {
    return (() => {}) as T;
  },

  /**
   * Create a type-safe mock for async functions
   */
  mockAsyncFunction<T extends (...args: any[]) => Promise<any>>(): T {
    return (async () => {}) as T;
  },

  /**
   * Create a type-safe mock for generators
   */
  mockGenerator<T extends (...args: any[]) => Generator<any, any, any>>(): T {
    return function* () {} as T;
  },

  /**
   * Create a type-safe mock for async generators
   */
  mockAsyncGenerator<T extends (...args: any[]) => AsyncGenerator<any, any, any>>(): T {
    return async function* () {} as T;
  },

  /**
   * Create a partial mock with required properties
   */
  mockPartial<T>(partial: Partial<T>): T {
    return partial as T;
  },

  /**
   * Create a mock with only specific properties
   */
  mockPick<T, K extends keyof T>(obj: Pick<T, K>): T {
    return obj as T;
  },

  /**
   * Create a mock omitting specific properties
   */
  mockOmit<T, K extends keyof T>(obj: Omit<T, K>): T {
    return obj as T;
  },

  /**
   * Create a mock with readonly properties
   */
  mockReadonly<T>(obj: Readonly<T>): T {
    return obj as T;
  },

  /**
   * Create a mock with optional properties
   */
  mockOptional<T>(obj: Partial<T>): T {
    return obj as T;
  },

  /**
   * Create a mock with required properties
   */
  mockRequired<T>(obj: Required<T>): T {
    return obj as T;
  },

  /**
   * Create a mock for union types
   */
  mockUnion<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for intersection types
   */
  mockIntersection<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for conditional types
   */
  mockConditional<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for mapped types
   */
  mockMapped<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for generic types
   */
  mockGeneric<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for utility types
   */
  mockUtility<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for template literal types
   */
  mockTemplateLiteral<T extends string>(): T {
    return '' as T;
  },

  /**
   * Create a mock for branded types
   */
  mockBranded<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for nominal types
   */
  mockNominal<T>(): T {
    return {} as T;
  },

  /**
   * Create a mock for opaque types
   */
  mockOpaque<T>(): T {
    return {} as T;
  },
};

// Common type testing patterns
const commonTypePatterns = {
  /**
   * API Response pattern
   */
  ApiResponse: {
    success: true,
    data: {},
    error: null,
  },

  /**
   * Database Model pattern
   */
  DatabaseModel: {
    id: 'string',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },

  /**
   * React Component Props pattern
   */
  ReactProps: {
    children: null,
    className: 'string',
    style: {},
    'data-testid': 'string',
  },

  /**
   * Server Action pattern
   */
  ServerAction: {
    success: true,
    data: null,
    error: null,
  },

  /**
   * Environment Config pattern
   */
  EnvConfig: {
    server: {},
    client: {},
    runtimeEnv: {},
  },

  /**
   * Form Data pattern
   */
  FormData: {
    values: {},
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
  },

  /**
   * Auth User pattern
   */
  AuthUser: {
    id: 'string',
    email: 'string',
    name: 'string',
    image: null,
    emailVerified: new Date(),
  },

  /**
   * Pagination pattern
   */
  Pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },

  /**
   * Error pattern
   */
  Error: {
    message: 'string',
    code: 'string',
    stack: 'string',
    cause: null,
  },

  /**
   * Config pattern
   */
  Config: {
    env: 'test',
    debug: false,
    version: 'string',
    features: {},
  },
};

// Export utilities for tests
export const {} = globalThis.typeTestUtils;
export * from '../utils/type-testing';
export { commonTypePatterns, typeTestingHelpers };
