/**
 * ES2022+ test patterns and utilities
 * Demonstrates modern JavaScript/TypeScript features for test consistency
 */

// ============================================================================
// ES2022+ FEATURES DEMO AND UTILITIES
// ============================================================================

/**
 * Class field declarations (ES2022)
 * Use for test setup and configuration
 */
export class TestDataBuilder {
  // Private fields (ES2022)
  #baseProduct = {
    product_id: 'test-product-123',
    name: 'Test Product',
    price: 99.99,
  };

  // Static block (ES2022) - for one-time initialization
  static {
    console.log('TestDataBuilder initialized');
  }

  // Method with optional chaining and nullish coalescing
  buildProduct(overrides?: Record<string, any>) {
    return {
      ...this.#baseProduct,
      brand: overrides?.brand ?? 'Default Brand',
      // Nullish coalescing assignment (ES2022)
      category: overrides?.category ?? 'Default Category',
      ...overrides,
    };
  }

  // Top-level await support (ES2022) - for async test setup
  async getAsyncTestData() {
    // Simulate async data fetching
    await new Promise(resolve => setTimeout(resolve, 1));
    return this.buildProduct();
  }

  // Error.cause support (ES2022)
  validateProduct(product: any) {
    try {
      if (!product.product_id) {
        throw new Error('Missing product_id');
      }
      return true;
    } catch (error) {
      throw new Error('Product validation failed', {
        cause: error,
      });
    }
  }
}

/**
 * Modern async iteration patterns
 */
export async function* generateTestProducts(count: number) {
  for (let i = 0; i < count; i++) {
    // Yield each product asynchronously
    yield await Promise.resolve({
      product_id: `product-${i}`,
      name: `Product ${i}`,
      price: 10 + i,
    });
  }
}

/**
 * Object.hasOwn() usage (ES2022)
 * Safer alternative to Object.prototype.hasOwnProperty
 */
export function validateObjectProperties(obj: Record<string, any>, requiredKeys: string[]) {
  return requiredKeys.every(key => Object.hasOwn(obj, key));
}

/**
 * Array.at() method usage (ES2022)
 * More intuitive array access
 */
export function getTestProduct(products: any[], index: number) {
  // Use at() for negative indexing support
  return products.at(index);
}

/**
 * RegExp match indices (ES2022)
 * Enhanced regex matching with position information
 */
export function validateEmailFormat(email: string) {
  const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/d;
  const match = email.match(emailRegex);

  if (match?.indices) {
    return {
      isValid: true,
      username: email.slice(...match.indices[1]),
      domain: email.slice(...match.indices[2]),
    };
  }

  return { isValid: false };
}

// ============================================================================
// MODERN TEST UTILITIES WITH ES2022+ FEATURES
// ============================================================================

/**
 * Modern test assertion helper using ES2022 features
 */
export class ModernTestAssertions {
  // Private field for storing test context
  #testContext = new Map<string, any>();

  // Static initialization
  static {
    // Configure global test settings
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).TEST_MODE = true;
    }
  }

  // Store test context with nullish coalescing
  setContext(key: string, value: any) {
    this.#testContext.set(key, value ?? null);
  }

  // Retrieve context with optional chaining
  getContext(key: string) {
    return this.#testContext.get(key);
  }

  // Modern assertion with detailed error reporting
  assertProductValid(product: any, required: string[] = ['product_id', 'name']) {
    const missing = required.filter(key => !Object.hasOwn(product, key));

    if (missing.length > 0) {
      throw new Error(`Product validation failed: missing ${missing.join(', ')}`, {
        cause: { missing, product },
      });
    }
  }

  // Async validation with top-level await patterns
  async validateAsync(validator: () => Promise<boolean>, timeout = 5000) {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), timeout);
    });

    try {
      return await Promise.race([validator(), timeoutPromise]);
    } catch (error) {
      throw new Error('Async validation failed', { cause: error });
    }
  }
}

/**
 * Modern array processing with ES2022 features
 */
export function processTestData<T>(
  items: T[],
  processor: (item: T, index: number) => T | null,
): T[] {
  return (
    items
      .map(processor)
      // Use Array.prototype.at() for modern array access
      .filter((item): item is T => item !== null)
  );
}

/**
 * Modern object manipulation utilities
 */
export function createTestObject(base: Record<string, any>, overrides: Record<string, any> = {}) {
  const result = { ...base };

  // Use Object.hasOwn for safer property checking
  for (const [key, value] of Object.entries(overrides)) {
    if (Object.hasOwn(overrides, key)) {
      // Nullish coalescing assignment
      result[key] ??= value;
    }
  }

  return result;
}

/**
 * Modern error handling with Error.cause
 */
export function wrapTestError(operation: string, originalError: unknown) {
  return new Error(`Test operation '${operation}' failed`, { cause: originalError });
}

/**
 * Template for modern test patterns
 */
export const testPatterns = {
  // Async generator for batch testing
  async *batchTest<T>(items: T[], batchSize: number, processor: (batch: T[]) => Promise<any>) {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      yield await processor(batch);
    }
  },

  // Modern timeout handling
  withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });

    return Promise.race([promise, timeout]);
  },

  // Safe property access
  safeGet(obj: any, path: string, defaultValue: any = undefined) {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  },

  // Modern array utilities
  arrayUtils: {
    // Use at() for negative indexing
    last<T>(arr: T[]): T | undefined {
      return arr.at(-1);
    },

    first<T>(arr: T[]): T | undefined {
      return arr.at(0);
    },

    nth<T>(arr: T[], index: number): T | undefined {
      return arr.at(index);
    },
  },
};

/**
 * ES2022 WeakRef usage for memory-efficient test data caching
 */
export class TestDataCache {
  #cache = new Map<string, WeakRef<any>>();
  #registry = new FinalizationRegistry((key: string) => {
    this.#cache.delete(key);
  });

  set(key: string, value: any) {
    const ref = new WeakRef(value);
    this.#cache.set(key, ref);
    this.#registry.register(value, key);
  }

  get(key: string) {
    const ref = this.#cache.get(key);
    const value = ref?.deref();

    if (value === undefined) {
      this.#cache.delete(key);
    }

    return value;
  }

  has(key: string): boolean {
    const ref = this.#cache.get(key);
    const value = ref?.deref();

    if (value === undefined) {
      this.#cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export instance for global use
export const testDataCache = new TestDataCache();
