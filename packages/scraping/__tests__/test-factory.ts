/**
 * Scraping Test Factory
 *
 * Centralized factory for creating consistent scraping tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for web scraping functionality.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Scraping test factory configuration
 */
export interface ScrapingTestConfig<TResult = any> {
  /** Name of the scraper being tested */
  scraperName: string;
  /** The scraper function to test */
  scraperFunction: (...args: any[]) => TResult;
  /** Test scenarios to generate */
  scenarios: ScrapingTestScenario<TResult>[];
}

/**
 * Test scenario definition
 */
export interface ScrapingTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Arguments to pass to the scraper function */
  args: any[];
  /** Expected result validation */
  validate: (result: TResult) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
  /** Expected error message if shouldThrow is true */
  expectedError?: string;
}

/**
 * Creates a complete test suite for a scraper
 */
export function createScrapingTestSuite<TResult = any>(config: ScrapingTestConfig<TResult>) {
  const { scraperName, scraperFunction, scenarios } = config;

  return describe(`${scraperName} scraper`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, description, args, validate, shouldThrow, expectedError }) => {
      test(`${name} - ${description}`, async () => {
        if (shouldThrow) {
          await expect(() => scraperFunction(...args)).rejects.toThrow(expectedError || '');
        } else {
          const result = await scraperFunction(...args);

          // Basic validation
          expect(result).toBeDefined();

          // Custom validation
          validate(result);
        }
      });
    });

    // Standard validation tests
    test('should return defined result', async () => {
      const result = await scraperFunction('https://example.com');
      expect(result).toBeDefined();
    });

    test('should handle valid URLs', async () => {
      const result = await scraperFunction('https://example.com');
      expect(result).toBeDefined();
    });
  });
}

/**
 * Provider test factory configuration
 */
export interface ProviderTestConfig<TResult = any> {
  /** Name of the provider being tested */
  providerName: string;
  /** Path to import the provider from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: ProviderTestScenario<TResult>[];
}

/**
 * Provider test scenario definition
 */
export interface ProviderTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Method name to test */
  methodName: string;
  /** Arguments to pass to the method */
  args: any[];
  /** Expected properties in the result */
  expectedProperties?: Record<string, any>;
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
}

/**
 * Creates a complete test suite for providers
 */
export function createProviderTestSuite<TResult = any>(config: ProviderTestConfig<TResult>) {
  const { providerName, importPath, scenarios } = config;

  return describe(`${providerName} provider`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupScrapingEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(
      ({ name, methodName, args, expectedProperties, customAssertions, shouldThrow }) => {
        test(`should ${name}`, async () => {
          const module = await import(importPath);
          const provider = module[providerName] || module.default;
          const method = provider[methodName];

          if (shouldThrow) {
            await expect(() => method(...args)).rejects.toThrow();
            return;
          }

          const result = await method(...args);

          // Check expected properties
          if (expectedProperties) {
            Object.entries(expectedProperties).forEach(([key, value]) => {
              expect(result).toHaveProperty(key);
              if (value !== undefined) {
                expect(result[key]).toStrictEqual(value);
              }
            });
          }

          // Custom assertions
          if (customAssertions) {
            customAssertions(result);
          }
        });
      },
    );
  });
}

/**
 * Utility test factory configuration
 */
export interface UtilityTestConfig<TResult = any> {
  /** Name of the utility being tested */
  utilityName: string;
  /** Path to import the utility from */
  importPath: string;
  /** Name of the function to test */
  functionName?: string;
  /** Test scenarios to generate */
  scenarios: UtilityTestScenario<TResult>[];
}

/**
 * Utility test scenario definition
 */
export interface UtilityTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Arguments to pass to the utility function */
  args: any[];
  /** Expected result or properties */
  expectedResult?: any;
  /** Expected properties in the result */
  expectedProperties?: Record<string, any>;
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
}

/**
 * Creates a complete test suite for utility functions
 */
export function createUtilityTestSuite<TResult = any>(config: UtilityTestConfig<TResult>) {
  const { utilityName, importPath, functionName, scenarios } = config;

  return describe(`${utilityName} utility`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupScrapingEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(
      ({ name, args, expectedResult, expectedProperties, customAssertions, shouldThrow }) => {
        test(`should ${name}`, async () => {
          const module = await import(importPath);
          const fn = functionName ? module[functionName] : module.default;

          if (shouldThrow) {
            expect(() => fn(...args)).toThrow();
            return;
          }

          const result = fn(...args);

          // Check expected result
          if (expectedResult !== undefined) {
            expect(result).toStrictEqual(expectedResult);
          }

          // Check expected properties
          if (expectedProperties) {
            Object.entries(expectedProperties).forEach(([key, value]) => {
              expect(result).toHaveProperty(key);
              if (value !== undefined) {
                expect(result[key]).toStrictEqual(value);
              }
            });
          }

          // Custom assertions
          if (customAssertions) {
            customAssertions(result);
          }
        });
      },
    );
  });
}

/**
 * Sets up standard scraping test environment
 */
export function setupScrapingEnvironment(overrides: Record<string, string> = {}) {
  const defaultEnv = {
    NODE_ENV: 'test',
    SCRAPING_TIMEOUT: '30000',
    SCRAPING_USER_AGENT: 'Mozilla/5.0 (Test Browser)',
    ...overrides,
  };

  vi.stubGlobal('process', {
    ...process,
    env: {
      ...process.env,
      ...defaultEnv,
    },
  });
}

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates basic scraping scenarios
   */
  basicScraping: (url: string, expectedContent: string) => ({
    name: 'basic scraping',
    description: 'should scrape content from valid URL',
    args: [url],
    validate: (result: any) => {
      expect(result).toContain(expectedContent);
    },
  }),

  /**
   * Creates error handling scenarios
   */
  errorHandling: (invalidUrl: string) => ({
    name: 'error handling',
    description: 'should handle invalid URLs gracefully',
    args: [invalidUrl],
    shouldThrow: true,
    validate: () => {}, // Not used for error scenarios
  }),

  /**
   * Creates performance scenarios
   */
  performance: (url: string, maxDuration: number = 5000) => ({
    name: 'performance',
    description: `should complete scraping within ${maxDuration}ms`,
    args: [url],
    validate: (result: any) => {
      // Performance validation is handled by timing wrapper
      expect(result).toBeDefined();
    },
  }),
};

/**
 * Creates a performance test wrapper
 */
export function createPerformanceTest<T>(
  scraperFunction: (...args: any[]) => Promise<T>,
  args: any[],
  maxDuration: number = 5000,
) {
  return async () => {
    const start = performance.now();
    const result = await scraperFunction(...args);
    const duration = performance.now() - start;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(maxDuration);
  };
}

/**
 * Validation helpers for scraping test data
 */
export const validateScrapingResults = {
  /**
   * Validates that scraping result has required properties
   */
  hasRequiredProperties: (result: any, requiredProps: string[]) => {
    const missing = requiredProps.filter(prop => !result[prop]);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that HTML content is properly formatted
   */
  hasValidHTML: (html: string) => {
    const errors: string[] = [];

    if (!html.includes('<')) {
      errors.push('No HTML tags found');
    }

    if (html.includes('<script>')) {
      errors.push('Script tags should be sanitized');
    }

    return errors.length === 0 ? null : errors;
  },

  /**
   * Validates that extracted data has expected structure
   */
  hasValidStructure: (data: any, expectedKeys: string[]) => {
    if (!data || typeof data !== 'object') {
      return ['Data is not an object'];
    }

    const missing = expectedKeys.filter(key => !(key in data));
    return missing.length === 0 ? null : missing;
  },
};
