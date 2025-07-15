/**
 * Internationalization Test Setup
 *
 * Centralized test environment setup for all internationalization tests.
 * Provides consistent mocking and configuration across all test files.
 */

import { beforeEach, expect, vi } from 'vitest';
import { mockFactories } from './i18n-test-factory';

// ================================================================================================
// GLOBAL MOCKS
// ================================================================================================

// Mock Next.js modules
vi.mock('next/navigation', () => mockFactories.createNextJsMocks()['next/navigation']);
vi.mock('next/link', () => mockFactories.createNextJsMocks()['next/link']);
vi.mock('next/headers', () => mockFactories.createNextJsMocks()['next/headers']);

// Mock middleware dependencies
vi.mock(
  '@formatjs/intl-localematcher',
  () => mockFactories.createMiddlewareMocks()['@formatjs/intl-localematcher'],
);
vi.mock('negotiator', () => mockFactories.createMiddlewareMocks().negotiator);
vi.mock(
  'next-international/middleware',
  () => mockFactories.createMiddlewareMocks()['next-international/middleware'],
);

// Mock dictionary files
vi.mock('../src/dictionaries/en.json', () => ({
  default: mockFactories.createDictionaryMocks()['en.json'],
}));
vi.mock('../src/dictionaries/fr.json', () => ({
  default: mockFactories.createDictionaryMocks()['fr.json'],
}));
vi.mock('../src/dictionaries/es.json', () => ({
  default: mockFactories.createDictionaryMocks()['es.json'],
}));
vi.mock('../src/dictionaries/pt.json', () => ({
  default: mockFactories.createDictionaryMocks()['pt.json'],
}));
vi.mock('../src/dictionaries/de.json', () => ({
  default: mockFactories.createDictionaryMocks()['de.json'],
}));

// Mock languine configuration
vi.mock('../languine.json', () => ({
  default: mockFactories.createConfigurationMocks()['languine.json'],
}));

// Mock observability (used in dictionary-loader)
vi.mock('@repo/observability', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

// ================================================================================================
// GLOBAL SETUP
// ================================================================================================

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Reset any global state
  if (typeof window !== 'undefined') {
    // Reset any browser-specific state
    localStorage.clear();
    sessionStorage.clear();
  }
});

// ================================================================================================
// GLOBAL TEST UTILITIES
// ================================================================================================

/**
 * Global test utilities available in all test files
 */
declare global {
  var testUtils: {
    /**
     * Creates a mock request object for middleware testing
     */
    createMockRequest: (options?: {
      acceptLanguage?: string;
      pathname?: string;
      headers?: Record<string, string>;
    }) => any;

    /**
     * Creates a mock dictionary for testing
     */
    createMockDictionary: (locale?: string, overrides?: any) => any;

    /**
     * Creates a mock locale configuration
     */
    createMockConfig: (overrides?: any) => any;

    /**
     * Waits for async operations to complete
     */
    waitForAsync: () => Promise<void>;

    /**
     * Measures execution time of a function
     */
    measureTime: <T>(fn: () => T) => { result: T; duration: number };
  };
}

// Implement global test utilities
globalThis.testUtils = {
  createMockRequest: (options = {}) => ({
    headers: {
      'accept-language': options.acceptLanguage || 'en-US,en;q=0.9',
      ...options.headers,
    },
    nextUrl: {
      pathname: options.pathname || '/',
    },
    method: 'GET',
    url: `https://example.com${options.pathname || '/'}`,
  }),

  createMockDictionary: (locale = 'en', overrides = {}) => {
    const dictionaries = mockFactories.createDictionaryMocks();
    return {
      ...(dictionaries as any)[`${locale}.json`],
      ...overrides,
    };
  },

  createMockConfig: (overrides = {}) => ({
    ...mockFactories.createConfigurationMocks()['languine.json'],
    ...overrides,
  }),

  waitForAsync: async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  },

  measureTime: <T>(fn: () => T) => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    return { result, duration };
  },
};

// ================================================================================================
// CUSTOM MATCHERS
// ================================================================================================

// Extend Jest/Vitest matchers if needed
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidLocale(): T;
    toBeValidDictionary(): T;
    toHaveTranslation(key: string): T;
  }
}

// Add custom matchers
expect.extend({
  toBeValidLocale(received: string) {
    const validLocales = ['en', 'fr', 'es', 'pt', 'de'];
    const pass = validLocales.includes(received);

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid locale`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to be a valid locale (one of: ${validLocales.join(', ')})`,
        pass: false,
      };
    }
  },

  toBeValidDictionary(received: any) {
    const pass =
      typeof received === 'object' &&
      received !== null &&
      !Array.isArray(received) &&
      Object.keys(received).length > 0;

    if (pass) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid dictionary`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to be a valid dictionary object`,
        pass: false,
      };
    }
  },

  toHaveTranslation(received: any, key: string) {
    const keys = key.split('.');
    let current = received;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return {
          message: () => `Expected dictionary to have translation for key "${key}"`,
          pass: false,
        };
      }
    }

    const pass = typeof current === 'string' && current.length > 0;

    if (pass) {
      return {
        message: () => `Expected dictionary not to have translation for key "${key}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected dictionary to have translation for key "${key}"`,
        pass: false,
      };
    }
  },
});

// ================================================================================================
// ENVIRONMENT SETUP
// ================================================================================================

// Set up test environment variables
(process.env as any).NODE_ENV = 'test';

// Mock browser APIs if needed
if (typeof window === 'undefined') {
  Object.defineProperty(global, 'window', {
    value: {
      location: {
        href: 'https://example.com/',
        pathname: '/',
        search: '',
        hash: '',
      },
      navigator: {
        language: 'en-US',
        languages: ['en-US', 'en'],
      },
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
    },
    writable: true,
  });
}

// ================================================================================================
// CONSOLE SETUP
// ================================================================================================

// Suppress console warnings in tests unless explicitly testing them
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // Only show warnings that are test-related
  if (args.some(arg => typeof arg === 'string' && arg.includes('test'))) {
    originalWarn.apply(console, args);
  }
};

console.error = (...args) => {
  // Only show errors that are test-related
  if (args.some(arg => typeof arg === 'string' && arg.includes('test'))) {
    originalError.apply(console, args);
  }
};

// ================================================================================================
// CLEANUP
// ================================================================================================

// Global cleanup function
export function cleanupTests() {
  vi.clearAllMocks();

  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }

  // Reset console
  console.warn = originalWarn;
  console.error = originalError;
}

// Export test utilities for convenience
export * from './i18n-test-data';
export { mockFactories } from './i18n-test-factory';
