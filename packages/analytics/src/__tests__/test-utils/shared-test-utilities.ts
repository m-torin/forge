/**
 * Shared test utilities for analytics emitter tests
 * Reduces code duplication and provides consistent test patterns
 */

import { vi } from 'vitest';
import type {
  BaseProductProperties,
  CartProperties,
  OrderProperties,
  CouponProperties,
  EcommerceEventProperties,
} from '../../shared/emitters/ecommerce/types';
import type { EmitterOptions } from '../../shared/emitters/emitter-types';

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Creates consistent mock for trackEcommerce function
 */
export function createTrackEcommerceMock() {
  return vi.fn((eventSpec, options) => ({
    event: eventSpec.name,
    properties: eventSpec.properties,
    context: { category: 'ecommerce' },
    options,
  }));
}

/**
 * Standard mock setup for all ecommerce emitter tests
 */
export function setupEcommerceMocks() {
  return {
    trackEcommerce: createTrackEcommerceMock(),
  };
}

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Creates base product properties for testing
 */
export function createBaseProduct(overrides: Partial<BaseProductProperties> = {}): BaseProductProperties {
  return {
    product_id: 'test-product-123',
    sku: 'SKU-123',
    category: 'Test Category',
    name: 'Test Product',
    brand: 'Test Brand',
    variant: 'Test Variant',
    price: 99.99,
    quantity: 1,
    coupon: 'TEST10',
    position: 1,
    url: 'https://example.com/product',
    image_url: 'https://example.com/product.jpg',
    ...overrides,
  };
}

/**
 * Creates extended product with additional properties
 */
export function createExtendedProduct(overrides: Partial<BaseProductProperties & Record<string, any>> = {}) {
  return {
    ...createBaseProduct(),
    custom_field: 'custom_value',
    tags: ['test', 'product'],
    rating: 4.5,
    review_count: 100,
    ...overrides,
  };
}

/**
 * Creates cart properties for testing
 */
export function createCartProperties(overrides: Partial<CartProperties> = {}): CartProperties {
  return {
    cart_id: 'cart-123',
    products: [createBaseProduct()],
    cart_total: 99.99,
    cart_size: 1,
    currency: 'USD',
    ...overrides,
  };
}

/**
 * Creates order properties for testing
 */
export function createOrderProperties(overrides: Partial<OrderProperties> = {}): OrderProperties {
  return {
    order_id: 'order-123',
    checkout_id: 'checkout-123',
    total: 109.98,
    revenue: 99.99,
    shipping: 9.99,
    tax: 10.00,
    discount: 5.00,
    coupon: 'SAVE5',
    currency: 'USD',
    products: [createBaseProduct(), createBaseProduct({ product_id: 'test-product-456' })],
    ...overrides,
  };
}

/**
 * Creates coupon properties for testing
 */
export function createCouponProperties(overrides: Partial<CouponProperties> = {}): CouponProperties {
  return {
    order_id: 'order-123',
    cart_id: 'cart-123',
    coupon_id: 'SAVE10',
    coupon_name: 'Save 10% Off',
    discount: 10.00,
    reason: 'First time customer discount',
    ...overrides,
  };
}

/**
 * Creates emitter options for testing
 */
export function createEmitterOptions(overrides: Partial<EmitterOptions> = {}): EmitterOptions {
  return {
    timestamp: new Date().toISOString(),
    anonymousId: 'anon-123',
    userId: 'user-456',
    groupId: 'group-789',
    context: {
      userAgent: 'Test User Agent',
      ip: '192.168.1.1',
      library: { name: 'test-analytics', version: '1.0.0' },
    },
    integrations: { all: true },
    ...overrides,
  };
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Validates standard ecommerce event structure
 */
export function validateEcommerceEvent(
  result: any,
  expectedEvent: string,
  expectedProperties: any,
  expectedOptions?: any
) {
  expect(result).toEqual({
    event: expectedEvent,
    properties: expectedProperties,
    context: { category: 'ecommerce' },
    options: expectedOptions,
  });
}

/**
 * Validates that properties contain required fields
 */
export function validateRequiredProperties(
  properties: Record<string, any>,
  requiredFields: string[]
) {
  requiredFields.forEach(field => {
    expect(properties).toHaveProperty(field);
    expect(properties[field]).toBeDefined();
  });
}

/**
 * Validates normalized product structure
 */
export function validateNormalizedProduct(product: BaseProductProperties) {
  expect(product).toHaveProperty('product_id');
  expect(typeof product.product_id).toBe('string');
  expect(product.product_id.length).toBeGreaterThan(0);
}

/**
 * Validates currency format
 */
export function validateCurrency(currency: string) {
  expect(currency).toMatch(/^[A-Z]{3}$/);
}

/**
 * Validates numeric value is valid
 */
export function validateNumericValue(value: number, allowZero = true) {
  expect(typeof value).toBe('number');
  expect(isNaN(value)).toBe(false);
  if (!allowZero) {
    expect(value).toBeGreaterThan(0);
  }
}

// ============================================================================
// TEST SCENARIO GENERATORS
// ============================================================================

/**
 * Generates test scenarios for required property validation
 */
export function generateRequiredPropertyTests<T>(
  emitterFunction: (props: T) => any,
  baseProperties: T,
  requiredFields: (keyof T)[]
) {
  return requiredFields.map(field => ({
    field: String(field),
    test: () => {
      const invalidProps = { ...baseProperties };
      delete invalidProps[field];
      expect(() => emitterFunction(invalidProps)).toThrow();
    },
  }));
}

/**
 * Generates test scenarios for optional property handling
 */
export function generateOptionalPropertyTests<T>(
  emitterFunction: (props: T) => any,
  baseProperties: T,
  optionalFields: (keyof T)[]
) {
  return optionalFields.map(field => ({
    field: String(field),
    test: () => {
      const propsWithoutField = { ...baseProperties };
      delete propsWithoutField[field];
      expect(() => emitterFunction(propsWithoutField)).not.toThrow();
    },
  }));
}

/**
 * Generates edge case test data
 */
export function generateEdgeCaseData() {
  return {
    emptyString: '',
    nullValue: null,
    undefinedValue: undefined,
    zeroNumber: 0,
    negativeNumber: -1,
    veryLargeNumber: Number.MAX_SAFE_INTEGER,
    emptyArray: [],
    emptyObject: {},
    specialChars: '!@#$%^&*()',
    unicodeString: '🛒🛍️💳',
    longString: 'a'.repeat(1000),
  };
}

// ============================================================================
// PROPERTY TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transforms product data to different naming conventions for testing
 */
export function transformProductNaming(product: BaseProductProperties) {
  return {
    // Test different ID field names
    withProductId: { ...product, productId: product.product_id },
    withId: { ...product, id: product.product_id },
    
    // Test different field variations
    withVariations: {
      ...product,
      SKU: product.sku,
      title: product.name,
      productName: product.name,
      manufacturer: product.brand,
      variation: product.variant,
      couponCode: product.coupon,
      coupon_code: product.coupon,
      link: product.url,
      product_url: product.url,
      imageUrl: product.image_url,
      image: product.image_url,
    },
  };
}

/**
 * Creates invalid property variations for negative testing
 */
export function createInvalidVariations<T>(baseProps: T) {
  return {
    missingRequired: Object.keys(baseProps as any).reduce((acc, key) => {
      const props = { ...baseProps };
      delete (props as any)[key];
      return { ...acc, [`missing_${key}`]: props };
    }, {}),
    
    nullValues: Object.keys(baseProps as any).reduce((acc, key) => {
      const props = { ...baseProps, [key]: null };
      return { ...acc, [`null_${key}`]: props };
    }, {}),
    
    emptyStrings: Object.keys(baseProps as any).reduce((acc, key) => {
      if (typeof (baseProps as any)[key] === 'string') {
        const props = { ...baseProps, [key]: '' };
        return { ...acc, [`empty_${key}`]: props };
      }
      return acc;
    }, {}),
  };
}

// ============================================================================
// PERFORMANCE TEST HELPERS
// ============================================================================

/**
 * Measures execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => T | Promise<T>,
  iterations = 1000
): Promise<{ result: T; averageTime: number; totalTime: number }> {
  const start = performance.now();
  let result: T;
  
  for (let i = 0; i < iterations; i++) {
    result = await fn();
  }
  
  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;
  
  return {
    result: result!,
    averageTime,
    totalTime,
  };
}

/**
 * Validates performance benchmarks
 */
export function validatePerformance(
  averageTime: number,
  maxAllowedTime = 1, // 1ms default
  operation = 'operation'
) {
  expect(averageTime).toBeLessThan(maxAllowedTime);
  if (averageTime > maxAllowedTime * 0.8) {
    console.warn(`Performance warning: ${operation} took ${averageTime.toFixed(2)}ms (threshold: ${maxAllowedTime}ms)`);
  }
}