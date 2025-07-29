/**
 * SEO Test Factory
 *
 * Centralized factory for creating consistent SEO tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for SEO functionality.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * SEO test factory configuration
 */
export interface SEOTestConfig<TResult = any> {
  /** Name of the SEO function being tested */
  functionName: string;
  /** The SEO function to test */
  seoFunction: (...args: any[]) => TResult;
  /** Test scenarios to generate */
  scenarios: SEOTestScenario<TResult>[];
}

/**
 * Test scenario definition
 */
export interface SEOTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Arguments to pass to the SEO function */
  args: any[];
  /** Expected result validation */
  validate: (result: TResult) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
  /** Expected error message if shouldThrow is true */
  expectedError?: string;
}

/**
 * Creates a complete test suite for an SEO function
 */
export function createSEOTestSuite<TResult = any>(config: SEOTestConfig<TResult>) {
  const { functionName, seoFunction, scenarios } = config;

  return describe(`${functionName} SEO function`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSEOEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, description, args, validate, shouldThrow, expectedError }) => {
      test(`${name} - ${description}`, () => {
        if (shouldThrow) {
          expect(() => seoFunction(...args)).toThrow(expectedError || '');
        } else {
          const result = seoFunction(...args);

          // Basic validation
          expect(result).toBeDefined();

          // Custom validation
          validate(result);
        }
      });
    });

    // Standard validation tests
    test('should return defined result', () => {
      const result = seoFunction({});
      expect(result).toBeDefined();
    });

    test('should handle basic metadata', () => {
      const result = seoFunction({
        title: 'Test Page',
        description: 'Test description',
      });
      expect(result).toBeDefined();
      expect((result as any).title).toBeDefined();
      expect((result as any).description).toBeDefined();
    });
  });
}

/**
 * Metadata test factory configuration
 */
export interface MetadataTestConfig<TResult = any> {
  /** Name of the metadata function being tested */
  functionName: string;
  /** Path to import the function from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: MetadataTestScenario<TResult>[];
}

/**
 * Metadata test scenario definition
 */
export interface MetadataTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Environment to set (development/production) */
  environment?: 'development' | 'production' | 'test';
  /** Environment variables to set */
  envVars?: Record<string, string>;
  /** Input data for the metadata function */
  input: any;
  /** Expected properties in the result */
  expectedProperties?: Record<string, any>;
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
}

/**
 * Creates a complete test suite for metadata functions
 */
export function createMetadataTestSuite<TResult = any>(config: MetadataTestConfig<TResult>) {
  const { functionName, importPath, scenarios } = config;

  return describe(`${functionName} metadata function`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSEOEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(
      ({
        name,
        environment,
        envVars,
        input,
        expectedProperties,
        customAssertions,
        shouldThrow,
      }) => {
        test(`should ${name}`, async () => {
          // Set environment
          const originalEnv = process.env.NODE_ENV;
          if (environment) {
            (process.env as any).NODE_ENV = environment;
          }

          // Set environment variables
          const originalVars: Record<string, string | undefined> = {};
          if (envVars) {
            Object.entries(envVars).forEach(([key, value]) => {
              originalVars[key] = process.env[key];
              process.env[key] = value;
            });
          }

          try {
            const module = await import(importPath);
            const fn = module[functionName] || module.default;

            if (shouldThrow) {
              expect(() => fn(input)).toThrow();
              return;
            }

            const result = fn(input);

            if (expectedProperties) {
              expect(result).toMatchObject(expectedProperties);
            }

            if (customAssertions) {
              customAssertions(result);
            }
          } finally {
            // Restore environment
            (process.env as any).NODE_ENV = originalEnv;
            Object.entries(originalVars).forEach(([key, value]) => {
              if (value === undefined) {
                delete process.env[key];
              } else {
                process.env[key] = value;
              }
            });
          }
        });
      },
    );
  });
}

/**
 * Component test factory configuration
 */
export interface ComponentTestConfig<TResult = any> {
  /** Name of the component being tested */
  componentName: string;
  /** Path to import the component from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: ComponentTestScenario<TResult>[];
}

/**
 * Component test scenario definition
 */
export interface ComponentTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Props to pass to the component */
  props: any;
  /** Expected elements to find in rendered output */
  expectedElements?: string[];
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
  /** Whether the component should render without throwing */
  shouldRender?: boolean;
}

/**
 * Creates a complete test suite for SEO components
 */
export function createComponentTestSuite<TResult = any>(config: ComponentTestConfig<TResult>) {
  const { componentName, importPath, scenarios } = config;

  return describe(`${componentName} component`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSEOEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(
      ({ name, props, expectedElements, customAssertions, shouldRender = true }) => {
        test(`should ${name}`, async () => {
          const module = await import(importPath);
          const Component = module[componentName] || module.default;

          if (shouldRender) {
            expect(() => Component(props)).not.toThrow();
          }

          if (customAssertions) {
            const result = Component(props);
            customAssertions(result);
          }
        });
      },
    );
  });
}

/**
 * Structured data test factory configuration
 */
export interface StructuredDataTestConfig<TResult = any> {
  /** Name of the structured data function being tested */
  functionName: string;
  /** Path to import the function from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: StructuredDataTestScenario<TResult>[];
}

/**
 * Structured data test scenario definition
 */
export interface StructuredDataTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Input data for the structured data function */
  input: any;
  /** Expected @type value */
  expectedType: string;
  /** Expected properties in the result */
  expectedProperties?: Record<string, any>;
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
}

/**
 * Creates a complete test suite for structured data functions
 */
export function createStructuredDataTestSuite<TResult = any>(
  config: StructuredDataTestConfig<TResult>,
) {
  const { functionName, importPath, scenarios } = config;

  return describe(`${functionName} structured data`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSEOEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, input, expectedType, expectedProperties, customAssertions }) => {
      test(`should ${name}`, async () => {
        const module = await import(importPath);
        const fn = module[functionName] || module.default;

        const result = fn(input);

        // Check schema.org context and type
        expect(result).toHaveProperty('@context', 'https://schema.org');
        expect(result).toHaveProperty('@type', expectedType);

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
    });
  });
}

/**
 * Sets up standard SEO test environment
 */
export function setupSEOEnvironment(overrides: Record<string, string> = {}) {
  const defaultEnv = {
    NODE_ENV: 'development',
    VERCEL_PROJECT_PRODUCTION_URL: 'example.com',
    NEXT_PUBLIC_URL: 'https://test.com',
    NEXT_PUBLIC_SITE_NAME: 'Test Site',
    NEXT_PUBLIC_SITE_DESCRIPTION: 'A test site for SEO testing',
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
   * Creates basic metadata scenarios
   */
  basicMetadata: (title: string, description: string) => ({
    name: 'create basic metadata',
    description: 'should create metadata with title and description',
    args: [{ title, description }],
    validate: (result: any) => {
      expect(result.title).toContain(title);
      expect(result.description).toBe(description);
    },
  }),

  /**
   * Creates metadata with image scenarios
   */
  metadataWithImage: (title: string, description: string, image: string) => ({
    name: 'create metadata with image',
    description: 'should create metadata with OpenGraph image',
    args: [{ title, description, image }],
    validate: (result: any) => {
      expect(result.openGraph?.images).toBeDefined();
      expect(result.openGraph?.images?.[0]?.url).toBe(image);
    },
  }),

  /**
   * Creates structured data scenarios
   */
  structuredData: (type: string, input: any, expectedType: string) => ({
    name: `create ${type} schema`,
    description: `should create valid ${type} structured data`,
    args: [input],
    validate: (result: any) => {
      expect(result['@type']).toBe(expectedType);
      expect(result['@context']).toBe('https://schema.org');
    },
  }),
};

/**
 * Validation helpers for SEO test data
 */
export const validateSEOResults = {
  /**
   * Validates that metadata has required SEO properties
   */
  hasRequiredSEOProperties: (metadata: any) => {
    const required = ['title', 'description'];
    const missing = required.filter(prop => !metadata[prop]);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that structured data has proper schema.org format
   */
  hasValidSchemaOrg: (data: any) => {
    const errors: string[] = [];

    if (!data['@context'] || data['@context'] !== 'https://schema.org') {
      errors.push('Missing or invalid @context');
    }

    if (!data['@type']) {
      errors.push('Missing @type');
    }

    return errors.length === 0 ? null : errors;
  },

  /**
   * Validates that OpenGraph data is properly formatted
   */
  hasValidOpenGraph: (metadata: any) => {
    if (!metadata.openGraph) return ['No OpenGraph data'];

    const errors: string[] = [];
    const og = metadata.openGraph;

    if (!og.title) errors.push('Missing OpenGraph title');
    if (!og.description) errors.push('Missing OpenGraph description');

    return errors.length === 0 ? null : errors;
  },

  /**
   * Validates that Twitter Card data is properly formatted
   */
  hasValidTwitterCard: (metadata: any) => {
    if (!metadata.twitter) return ['No Twitter Card data'];

    const errors: string[] = [];
    const twitter = metadata.twitter;

    if (!twitter.card) errors.push('Missing Twitter card type');

    return errors.length === 0 ? null : errors;
  },
};
