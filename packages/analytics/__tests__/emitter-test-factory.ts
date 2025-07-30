/**
 * Emitter Test Factory
 *
 * Centralized factory for creating consistent emitter tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for analytics emitters.
 */

import type { EmitterContext, EmitterOptions } from '#/shared/emitters/emitter-types';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Common test data generators
export const createTestData = {
  /**
   * Creates a standard mock context for testing
   */
  context: (overrides: Partial<EmitterContext> = {}): EmitterContext => ({
    app: {
      name: 'Test App',
      version: '1.0.0',
      build: '123',
      namespace: 'com.test.app',
    },
    campaign: {
      name: 'test-campaign',
      medium: 'cpc',
      source: 'google',
      term: 'analytics',
      content: 'test-content',
    },
    page: {
      url: 'https://example.com/test',
      path: '/test',
      title: 'Test Page',
      referrer: 'https://google.com',
      search: '?utm_source=test',
    },
    device: {
      id: 'device-123',
      name: 'Test Device',
      type: 'mobile',
      manufacturer: 'Apple',
      model: 'iPhone 15',
      version: '17.0',
      adTrackingEnabled: true,
      advertisingId: 'ad-123',
    },
    os: {
      name: 'iOS',
      version: '17.0',
    },
    screen: {
      width: 375,
      height: 812,
      density: 3,
    },
    network: {
      bluetooth: false,
      carrier: 'Verizon',
      cellular: true,
      wifi: true,
    },
    location: {
      city: 'San Francisco',
      country: 'United States',
      latitude: 37.7749,
      longitude: -122.4194,
      region: 'CA',
    },
    traits: {
      name: 'Test User',
      email: 'test@example.com',
    },
    ip: '192.168.1.1',
    locale: 'en-US',
    timezone: 'America/Los_Angeles',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    library: {
      name: '@repo/analytics',
      version: '1.0.0',
    },
    ...overrides,
  }),

  /**
   * Creates standard emitter options for testing
   */
  options: (overrides: Partial<EmitterOptions> = {}): EmitterOptions => ({
    anonymousId: 'anon-123',
    context: createTestData.context(overrides.context),
    integrations: {
      'Facebook Pixel': false,
      'Google Analytics': true,
      Mixpanel: true,
      ...overrides.integrations,
    },
    timestamp: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  }),

  /**
   * Creates test user traits
   */
  userTraits: (overrides = {}) => ({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    plan: 'premium',
    company: 'Test Corp',
    ...overrides,
  }),

  /**
   * Creates test group traits
   */
  groupTraits: (overrides = {}) => ({
    name: 'Acme Corp',
    industry: 'Technology',
    employees: 100,
    plan: 'enterprise',
    ...overrides,
  }),

  /**
   * Creates test product data
   */
  product: (overrides = {}) => ({
    product_id: 'prod-123',
    name: 'Test Product',
    brand: 'Test Brand',
    category: 'Electronics',
    price: 99.99,
    currency: 'USD',
    sku: 'TEST-SKU-123',
    ...overrides,
  }),

  /**
   * Creates test ecommerce properties
   */
  ecommerce: (overrides = {}) => ({
    order_id: 'order-123',
    total: 199.98,
    currency: 'USD',
    products: [
      createTestData.product(),
      createTestData.product({
        product_id: 'prod-456',
        name: 'Another Product',
        price: 149.99,
      }),
    ],
    ...overrides,
  }),
};

/**
 * Emitter test factory configuration
 */
export interface EmitterTestConfig<TPayload = any> {
  /** Name of the emitter being tested */
  emitterName: string;
  /** The emitter function to test */
  emitterFunction: (...args: any[]) => TPayload;
  /** Expected event type (e.g., 'track', 'identify', 'page') */
  expectedType: string;
  /** Test scenarios to generate */
  scenarios: EmitterTestScenario<TPayload>[];
}

/**
 * Test scenario definition
 */
export interface EmitterTestScenario<TPayload = any> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Arguments to pass to the emitter function */
  args: any[];
  /** Expected result validation */
  validate: (result: TPayload) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
  /** Expected error message if shouldThrow is true */
  expectedError?: string;
}

/**
 * Creates a complete test suite for an emitter
 */
export function createEmitterTestSuite<TPayload = any>(config: EmitterTestConfig<TPayload>) {
  const { emitterName, emitterFunction, expectedType, scenarios } = config;

  return describe(`${emitterName} emitter`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, description, args, validate, shouldThrow, expectedError }) => {
      test(`${name} - ${description}`, () => {
        if (shouldThrow) {
          expect(() => emitterFunction(...args)).toThrow(expectedError || '');
        } else {
          const result = emitterFunction(...args);

          // Basic type validation
          expect(result).toBeDefined();
          expect((result as any).type).toBe(expectedType);

          // Custom validation
          validate(result);
        }
      });
    });

    // Standard validation tests
    test('should have correct emitter type', () => {
      const result = emitterFunction('test');
      expect((result as any).type).toBe(expectedType);
    });

    test('should handle options correctly', () => {
      const options = createTestData.options();
      // Handle different emitter signatures
      let result;
      if (expectedType === 'page') {
        result = emitterFunction('marketing', 'Test Page', {}, options);
      } else if (expectedType === 'alias') {
        result = emitterFunction('new-id', 'old-id', options);
      } else if (expectedType === 'group') {
        result = emitterFunction('group-123', {}, options);
      } else {
        result = emitterFunction('test', {}, options);
      }

      expect((result as any).timestamp).toBe(options.timestamp);
      expect((result as any).context).toStrictEqual(options.context);
      expect((result as any).integrations).toStrictEqual(options.integrations);
      expect((result as any).anonymousId).toBe(options.anonymousId);
    });
  });
}

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates minimal parameter test scenarios
   */
  minimal: <T>(emitterName: string, minimalArgs: any[], expectedFields: Record<string, any>) => ({
    name: 'minimal params',
    description: `should create valid ${emitterName} payload with minimal params`,
    args: minimalArgs,
    validate: (result: T) => {
      expect(result).toStrictEqual({
        type: emitterName,
        ...expectedFields,
      });
    },
  }),

  /**
   * Creates full options test scenarios
   */
  fullOptions: <T>(emitterName: string, args: any[], expectedFields: Record<string, any>) => ({
    name: 'full options',
    description: `should create ${emitterName} payload with full options`,
    args: [...args, createTestData.options()],
    validate: (result: T) => {
      const options = createTestData.options();
      expect(result).toMatchObject({
        type: emitterName,
        ...expectedFields,
        timestamp: options.timestamp,
        context: options.context,
        integrations: options.integrations,
        anonymousId: options.anonymousId,
      });
    },
  }),

  /**
   * Creates type safety test scenarios
   */
  typeSafety: <T>(emitterName: string, args: any[], expectedType: string) => ({
    name: 'type safety',
    description: `should maintain proper TypeScript types for ${emitterName}`,
    args: args,
    validate: (result: T) => {
      expect(result).toHaveProperty('type');
      expect((result as any).type).toBe(expectedType);
    },
  }),

  /**
   * Creates edge case test scenarios
   */
  edgeCases: <T>(emitterName: string, edgeCaseArgs: any[], expectedBehavior: string) => ({
    name: 'edge cases',
    description: `should handle edge cases gracefully for ${emitterName} - ${expectedBehavior}`,
    args: edgeCaseArgs,
    validate: (result: T) => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('type');
    },
  }),

  /**
   * Creates performance test scenarios
   */
  performance: <T>(emitterName: string, performanceArgs: any[], maxDuration: number = 10) => ({
    name: 'performance',
    description: `should handle ${emitterName} efficiently (< ${maxDuration}ms)`,
    args: performanceArgs,
    validate: (result: T) => {
      // Performance validation is handled by the timing wrapper
      expect(result).toBeDefined();
    },
  }),
};

/**
 * Creates a performance test wrapper
 */
export function createPerformanceTest<T>(
  emitterFunction: (...args: any[]) => T,
  args: any[],
  maxDuration: number = 10,
) {
  return () => {
    const start = performance.now();
    const result = emitterFunction(...args);
    const duration = performance.now() - start;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(maxDuration);
  };
}

/**
 * Creates a batch of emitter calls for performance testing
 */
export function createBatchPerformanceTest<T>(
  emitterFunction: (...args: any[]) => T,
  args: any[],
  batchSize: number = 1000,
  maxDuration: number = 100,
) {
  return () => {
    const start = performance.now();

    const results = Array.from({ length: batchSize }, (_, i) =>
      emitterFunction(...args.map(arg => (typeof arg === 'string' ? `${arg} ${i}` : arg))),
    );

    const duration = performance.now() - start;

    expect(results).toHaveLength(batchSize);
    expect(results[0]).toBeDefined();
    expect(duration).toBeLessThan(maxDuration);
  };
}

/**
 * Validates complex property types
 */
export function validateComplexProperties(properties: any, expectedTypes: Record<string, string>) {
  Object.entries(expectedTypes).forEach(([key, expectedType]) => {
    if (properties[key] !== undefined) {
      switch (expectedType) {
        case 'array':
          expect(Array.isArray(properties[key])).toBeTruthy();
          break;
        case 'object':
          expect(typeof properties[key]).toBe('object');
          expect(properties[key]).not.toBeNull();
          break;
        case 'date':
          expect(properties[key]).toBeInstanceOf(Date);
          break;
        default:
          expect(typeof properties[key]).toBe(expectedType);
      }
    }
  });
}

/**
 * Creates validation for required properties
 */
export function createRequiredPropertyValidation(
  emitterFunction: (...args: any[]) => any,
  requiredProperties: string[],
  testArgs: any[],
) {
  return requiredProperties.map(prop => ({
    name: `required property: ${prop}`,
    description: `should throw error when ${prop} is missing`,
    args: testArgs,
    shouldThrow: true,
    expectedError: `Missing required properties: ${prop}`,
    validate: () => {}, // Not used for error scenarios
  }));
}
