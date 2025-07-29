/**
 * Feature Flags Test Factory
 *
 * Centralized factory for creating consistent feature flag tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for feature flag adapters.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { featureFlagTestData } from './test-data-generators';
import { createDecideParams } from './test-utils';

// Common test interfaces
export interface AdapterTestConfig<TAdapter = any> {
  /** Name of the adapter being tested */
  adapterName: string;
  /** Factory function to create the adapter */
  adapterFactory: (...args: any[]) => TAdapter;
  /** Test scenarios to generate */
  scenarios: AdapterTestScenario<TAdapter>[];
  /** Optional setup function */
  setup?: () => void | Promise<void>;
  /** Optional teardown function */
  teardown?: () => void | Promise<void>;
}

export interface AdapterTestScenario<TAdapter = any> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Setup function for this scenario */
  setup?: () => void | Promise<void>;
  /** Test function */
  test: (adapter: TAdapter) => void | Promise<void>;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
  /** Expected error message if shouldThrow is true */
  expectedError?: string;
}

export interface MockAdapterContext {
  /** Mock client (EdgeConfig, PostHog, etc.) */
  mockClient: any;
  /** Mock environment variables */
  mockEnv: any;
  /** Mock observability */
  mockObservability: any;
}

/**
 * Creates a complete test suite for a feature flag adapter
 */
export function createAdapterTestSuite<TAdapter = any>(config: AdapterTestConfig<TAdapter>) {
  const { adapterName, adapterFactory, scenarios, setup, teardown } = config;

  return describe(`${adapterName} adapter`, () => {
    // Standard setup
    beforeEach(async () => {
      vi.clearAllMocks();
      if (setup) {
        await setup();
      }
    });

    // Generate test scenarios
    scenarios.forEach(
      ({
        name,
        description,
        setup: scenarioSetup,
        test: scenarioTest,
        shouldThrow,
        expectedError,
      }) => {
        test(`${name} - ${description}`, async () => {
          if (scenarioSetup) {
            await scenarioSetup();
          }

          if (shouldThrow) {
            if (expectedError) {
              await expect(async () => {
                const adapter = adapterFactory();
                await scenarioTest(adapter);
              }).rejects.toThrow(expectedError);
            } else {
              await expect(async () => {
                const adapter = adapterFactory();
                await scenarioTest(adapter);
              }).rejects.toThrow();
            }
          } else {
            const adapter = adapterFactory();
            await scenarioTest(adapter);
          }
        });
      },
    );

    // Standard validation tests
    test('should create adapter instance', () => {
      const adapter = adapterFactory();
      expect(adapter).toBeDefined();
      expect(typeof adapter).toBe('function');
    });

    test('should have correct adapter structure', () => {
      const adapter = adapterFactory();
      const instance = (adapter as any)();

      expect(instance).toBeDefined();
      expect(typeof instance).toBe('object');
      expect(instance).toHaveProperty('decide');
      expect(typeof instance.decide).toBe('function');
    });

    // Cleanup
    if (teardown) {
      afterEach(async () => {
        await teardown();
      });
    }
  });
}

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates basic adapter functionality scenarios
   */
  basic: <T>(adapterName: string) => ({
    name: 'basic functionality',
    description: `should create ${adapterName} adapter with basic functionality`,
    test: async (adapter: T) => {
      const instance = (adapter as any)();
      expect(instance).toBeDefined();
      expect(instance.decide).toBeDefined();
      expect(typeof instance.decide).toBe('function');
    },
  }),

  /**
   * Creates flag resolution scenarios
   */
  flagResolution: <T>(adapterName: string, mockData: any) => ({
    name: 'flag resolution',
    description: `should resolve flags correctly for ${adapterName}`,
    test: async (adapter: T) => {
      const instance = (adapter as any)();
      const result = await instance.decide(createDecideParams({ key: 'test-flag' }));
      expect(result).toBeDefined();
    },
  }),

  /**
   * Creates error handling scenarios
   */
  errorHandling: <T>(adapterName: string, errorMessage: string) => ({
    name: 'error handling',
    description: `should handle errors gracefully for ${adapterName}`,
    test: async (adapter: T) => {
      const instance = (adapter as any)();
      await expect(instance.decide(createDecideParams({ key: 'error-flag' }))).rejects.toThrow(
        errorMessage,
      );
    },
    shouldThrow: true,
    expectedError: errorMessage,
  }),

  /**
   * Creates edge case scenarios
   */
  edgeCases: <T>(adapterName: string) => ({
    name: 'edge cases',
    description: `should handle edge cases for ${adapterName}`,
    test: async (adapter: T) => {
      const instance = (adapter as any)();

      // Test with empty flag key
      const emptyResult = await instance.decide(createDecideParams({ key: '' }));
      expect(emptyResult).toBeUndefined();

      // Test with very long flag key
      const longKey = 'a'.repeat(1000);
      const longResult = await instance.decide(createDecideParams({ key: longKey }));
      expect(longResult).toBeUndefined();
    },
  }),

  /**
   * Creates configuration scenarios
   */
  configuration: <T>(adapterName: string, configOptions: any) => ({
    name: 'configuration',
    description: `should handle configuration options for ${adapterName}`,
    test: async (adapter: T) => {
      const instance = (adapter as any)();
      expect(instance.config).toBeDefined();
      if (configOptions) {
        expect(instance.config).toMatchObject(configOptions);
      }
    },
  }),

  /**
   * Creates performance scenarios
   */
  performance: <T>(adapterName: string, maxDuration: number = 100) => ({
    name: 'performance',
    description: `should perform efficiently for ${adapterName} (< ${maxDuration}ms)`,
    test: async (adapter: T) => {
      const instance = (adapter as any)();
      const start = performance.now();

      await instance.decide(createDecideParams({ key: 'performance-test' }));

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(maxDuration);
    },
  }),
};

/**
 * Edge Config specific test scenarios
 */
export const createEdgeConfigScenarios = {
  /**
   * Creates scenarios for Edge Config adapter
   */
  standardScenarios: (mockClient: any) => [
    {
      name: 'valid response',
      description: 'should return flag value from Edge Config',
      setup: () => {
        mockClient.get.mockResolvedValue(featureFlagTestData.edgeConfig.responses.valid);
      },
      test: async (adapter: any) => {
        const instance = adapter();
        const result = await instance.decide(createDecideParams({ key: 'boolean-flag' }));
        expect(result).toBeTruthy();
      },
    },

    {
      name: 'null response',
      description: 'should handle null response from Edge Config',
      setup: () => {
        mockClient.get.mockResolvedValue(null);
      },
      test: async (adapter: any) => {
        const instance = adapter();
        const result = await instance.decide(createDecideParams({ key: 'test-flag' }));
        expect(result).toBeUndefined();
      },
    },

    {
      name: 'invalid response',
      description: 'should handle invalid response from Edge Config',
      setup: () => {
        mockClient.get.mockResolvedValue('not-an-object');
      },
      test: async (adapter: any) => {
        const instance = adapter();
        const result = await instance.decide(createDecideParams({ key: 'test-flag' }));
        expect(result).toBeUndefined();
      },
    },

    {
      name: 'client error',
      description: 'should propagate client errors',
      setup: () => {
        mockClient.get.mockRejectedValue(new Error('Edge Config error'));
      },
      test: async (adapter: any) => {
        const instance = adapter();
        await expect(instance.decide(createDecideParams({ key: 'test-flag' }))).rejects.toThrow(
          'Edge Config error',
        );
      },
      shouldThrow: true,
      expectedError: 'Edge Config error',
    },

    {
      name: 'non-existent flag',
      description: 'should return undefined for non-existent flag',
      setup: () => {
        mockClient.get.mockResolvedValue({ 'other-flag': true });
      },
      test: async (adapter: any) => {
        const instance = adapter();
        const result = await instance.decide(createDecideParams({ key: 'non-existent-flag' }));
        expect(result).toBeUndefined();
      },
    },
  ],

  /**
   * Creates provider data scenarios
   */
  providerDataScenarios: (mockClient: any) => [
    {
      name: 'boolean flags',
      description: 'should transform boolean flags correctly',
      setup: () => {
        mockClient.get.mockResolvedValue({ 'boolean-flag': true });
      },
      test: async (getProviderData: any) => {
        const result = await getProviderData();
        expect(result.flags).toStrictEqual([
          {
            key: 'boolean-flag',
            options: [
              { label: 'Enabled', value: true },
              { label: 'Disabled', value: false },
            ],
          },
        ]);
      },
    },

    {
      name: 'variant flags',
      description: 'should transform variant flags correctly',
      setup: () => {
        mockClient.get.mockResolvedValue({ 'variant-flag': 'variant-a' });
      },
      test: async (getProviderData: any) => {
        const result = await getProviderData();
        expect(result.flags).toStrictEqual([
          {
            key: 'variant-flag',
            options: [
              { label: 'Control', value: 'control' },
              { label: 'Variant A', value: 'variant-a' },
              { label: 'Variant B', value: 'variant-b' },
            ],
          },
        ]);
      },
    },

    {
      name: 'object flags',
      description: 'should transform object flags correctly',
      setup: () => {
        const objectValue = { config: 'value' };
        mockClient.get.mockResolvedValue({ 'object-flag': objectValue });
      },
      test: async (getProviderData: any) => {
        const result = await getProviderData();
        expect(result.flags).toHaveLength(1);
        expect(result.flags[0]).toMatchObject({
          key: 'object-flag',
          options: [{ label: 'Custom Config', value: { config: 'value' } }],
        });
      },
    },
  ],
};

/**
 * PostHog specific test scenarios
 */
export const createPostHogScenarios = {
  /**
   * Creates scenarios for PostHog adapter
   */
  standardScenarios: (mockClient: any) => [
    {
      name: 'valid response',
      description: 'should return flag value from PostHog',
      setup: () => {
        mockClient.getFeatureFlag.mockResolvedValue(true);
      },
      test: async (adapter: any) => {
        const instance = adapter();
        const result = await instance.decide(createDecideParams({ key: 'test-flag' }));
        expect(result).toBeTruthy();
      },
    },

    {
      name: 'undefined response',
      description: 'should handle undefined response from PostHog',
      setup: () => {
        mockClient.getFeatureFlag.mockResolvedValue(undefined);
      },
      test: async (adapter: any) => {
        const instance = adapter();
        const result = await instance.decide(createDecideParams({ key: 'test-flag' }));
        expect(result).toBeUndefined();
      },
    },

    {
      name: 'client error',
      description: 'should propagate client errors',
      setup: () => {
        mockClient.getFeatureFlag.mockRejectedValue(new Error('PostHog error'));
      },
      test: async (adapter: any) => {
        const instance = adapter();
        await expect(instance.decide(createDecideParams({ key: 'test-flag' }))).rejects.toThrow(
          'PostHog error',
        );
      },
      shouldThrow: true,
      expectedError: 'PostHog error',
    },

    {
      name: 'all flags',
      description: 'should return all feature flags',
      setup: () => {
        mockClient.getAllFlags.mockResolvedValue(featureFlagTestData.posthog.responses.allFlags);
      },
      test: async (adapter: any) => {
        const instance = adapter();
        if (instance.getAllFlags) {
          const result = await instance.getAllFlags();
          expect(result).toStrictEqual(featureFlagTestData.posthog.responses.allFlags);
        }
      },
    },
  ],
};

/**
 * Client hook specific test scenarios
 */
export const createClientHookScenarios = {
  /**
   * Creates scenarios for client hooks
   */
  standardScenarios: (mockAdapter: any) => [
    {
      name: 'feature flag enabled',
      description: 'should return true when flag is enabled',
      setup: () => {
        mockAdapter.isEnabled.mockResolvedValue(true);
      },
      test: async (hookResult: any) => {
        expect(hookResult.current).toBeTruthy();
        expect(mockAdapter.isEnabled).toHaveBeenCalledWith('test-flag');
      },
    },

    {
      name: 'feature flag disabled',
      description: 'should return false when flag is disabled',
      setup: () => {
        mockAdapter.isEnabled.mockResolvedValue(false);
      },
      test: async (hookResult: any) => {
        expect(hookResult.current).toBeFalsy();
        expect(mockAdapter.isEnabled).toHaveBeenCalledWith('test-flag');
      },
    },

    {
      name: 'flag payload',
      description: 'should return flag payload',
      setup: () => {
        const payload = { variant: 'a', config: { theme: 'dark' } };
        mockAdapter.getFlag.mockResolvedValue(payload);
      },
      test: async (hookResult: any) => {
        expect(hookResult.current).toStrictEqual({ variant: 'a', config: { theme: 'dark' } });
        expect(mockAdapter.getFlag).toHaveBeenCalledWith('test-flag', undefined);
      },
    },

    {
      name: 'adapter error',
      description: 'should handle adapter errors gracefully',
      setup: () => {
        mockAdapter.isEnabled.mockRejectedValue(new Error('Adapter error'));
      },
      test: async (hookResult: any) => {
        // Hook should not throw, but should handle error gracefully
        expect(hookResult.current).toBeFalsy(); // Default fallback
      },
    },
  ],
};

/**
 * Performance test utilities
 */
export const createPerformanceTests = {
  /**
   * Creates a performance test for adapter operations
   */
  adapterPerformance: <T>(
    adapterFactory: () => T,
    operation: (adapter: T) => Promise<any>,
    maxDuration: number = 100,
  ) => ({
    name: 'adapter performance',
    description: `should perform adapter operations efficiently (< ${maxDuration}ms)`,
    test: async () => {
      const adapter = adapterFactory();
      const start = performance.now();

      await operation(adapter);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(maxDuration);
    },
  }),

  /**
   * Creates a batch performance test
   */
  batchPerformance: <T>(
    adapterFactory: () => T,
    operation: (adapter: T) => Promise<any>,
    batchSize: number = 100,
    maxDuration: number = 1000,
  ) => ({
    name: 'batch performance',
    description: `should handle batch operations efficiently (${batchSize} operations < ${maxDuration}ms)`,
    test: async () => {
      const adapter = adapterFactory();
      const start = performance.now();

      const promises = Array.from({ length: batchSize }, () => operation(adapter));
      await Promise.all(promises);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(maxDuration);
    },
  }),
};

/**
 * Validation utilities for test results
 */
export const validateTestResults = {
  /**
   * Validates adapter structure
   */
  validateAdapterStructure: (adapter: any) => {
    expect(adapter).toBeDefined();
    expect(typeof adapter).toBe('function');

    const instance = adapter();
    expect(instance).toBeDefined();
    expect(typeof instance).toBe('object');
    expect(instance).toHaveProperty('decide');
    expect(typeof instance.decide).toBe('function');

    if (instance.origin) {
      expect(typeof instance.origin).toBe('object');
      expect(instance.origin).toHaveProperty('provider');
    }
  },

  /**
   * Validates flag decision result
   */
  validateFlagDecision: (result: any, expectedType?: string) => {
    if (result !== undefined) {
      if (expectedType) {
        expect(typeof result).toBe(expectedType);
      }
    }
  },

  /**
   * Validates provider data structure
   */
  validateProviderData: (data: any) => {
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('provider');
    expect(data).toHaveProperty('flags');
    expect(Array.isArray(data.flags)).toBeTruthy();

    data.flags.forEach((flag: any) => {
      expect(flag).toHaveProperty('key');
      expect(flag).toHaveProperty('options');
      expect(Array.isArray(flag.options)).toBeTruthy();

      flag.options.forEach((option: any) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
      });
    });
  },

  /**
   * Validates hook result structure
   */
  validateHookResult: (result: any) => {
    expect(result).toBeDefined();
    expect(result).toHaveProperty('current');
  },
};
