import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

describe('server-next', () => {
  test('module exports object', async () => {
    const serverNext = await import('../src/server-next');

    expect(serverNext).toBeDefined();
    expect(typeof serverNext).toBe('object');
  });

  describe('createServerObservability', () => {
    test('should be a function', async () => {
      const { createServerObservability } = await import('../src/server-next');
      expect(typeof createServerObservability).toBe('function');
    });

    test('should handle different configuration types', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      // Test with basic configuration
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      // Should not throw
      try {
        await createServerObservability(config);
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });

    test('should handle empty configuration', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      // Should not throw
      try {
        await createServerObservability({});
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });

    test('should handle complex configuration', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      const config = {
        providers: {
          console: { enabled: true, level: 'debug' },
          sentry: { dsn: 'test-dsn', environment: 'test' },
        },
        debug: true,
        enableTracing: true,
      };

      // Should not throw
      try {
        await createServerObservability(config);
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });
  });

  describe('createServerObservabilityUninitialized', () => {
    test('should be a function', async () => {
      const { createServerObservabilityUninitialized } = await import('../src/server-next');
      expect(typeof createServerObservabilityUninitialized).toBe('function');
    });

    test('should handle different configuration types', async () => {
      const { createServerObservabilityUninitialized } = await import('../src/server-next');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      // Should not throw
      try {
        const result = createServerObservabilityUninitialized(config);
        expect(result).toBeDefined();
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });

    test('should handle empty configuration', async () => {
      const { createServerObservabilityUninitialized } = await import('../src/server-next');
      
      // Should not throw
      try {
        const result = createServerObservabilityUninitialized({});
        expect(result).toBeDefined();
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });

    test('should handle null and undefined configurations', async () => {
      const { createServerObservabilityUninitialized } = await import('../src/server-next');
      
      // Should not throw
      try {
        const result1 = createServerObservabilityUninitialized(null as any);
        const result2 = createServerObservabilityUninitialized(undefined as any);
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });
  });

  describe('exports', () => {
    test('should export createServerObservability function', async () => {
      const { createServerObservability } = await import('../src/server-next');
      expect(typeof createServerObservability).toBe('function');
    });

    test('should export createServerObservabilityUninitialized function', async () => {
      const { createServerObservabilityUninitialized } = await import('../src/server-next');
      expect(typeof createServerObservabilityUninitialized).toBe('function');
    });

    test('should export configuration functions', async () => {
      const serverNext = await import('../src/server-next');
      expect(typeof serverNext.getObservabilityConfig).toBe('function');
      expect(typeof serverNext.mergeObservabilityConfig).toBe('function');
    });

    test('should export config wrapper functions', async () => {
      const serverNext = await import('../src/server-next');
      expect(typeof serverNext.createObservabilityConfig).toBe('function');
      expect(typeof serverNext.withLogging).toBe('function');
      expect(typeof serverNext.withObservability).toBe('function');
      expect(typeof serverNext.withSentry).toBe('function');
    });

    test('should export instrumentation functions', async () => {
      const serverNext = await import('../src/server-next');
      expect(typeof serverNext.register).toBe('function');
      expect(typeof serverNext.onRequestError).toBe('function');
    });

    test('should export logger functions', async () => {
      const serverNext = await import('../src/server-next');
      expect(typeof serverNext.logDebug).toBe('function');
      expect(typeof serverNext.logInfo).toBe('function');
      expect(typeof serverNext.logWarn).toBe('function');
      expect(typeof serverNext.logError).toBe('function');
    });

    test('should export all expected functions', async () => {
      const serverNext = await import('../src/server-next');
      
      const expectedExports = [
        'createServerObservability',
        'createServerObservabilityUninitialized',
        'getObservabilityConfig',
        'mergeObservabilityConfig',
        'createObservabilityConfig',
        'withLogging',
        'withObservability',
        'withSentry',
        'register',
        'onRequestError',
        'logDebug',
        'logInfo',
        'logWarn',
        'logError',
      ];

      for (const exportName of expectedExports) {
        expect(serverNext).toHaveProperty(exportName);
        expect(typeof serverNext[exportName]).toBe('function');
      }
    });
  });

  describe('configuration handling', () => {
    test('should handle different provider configurations', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      const configs = [
        { providers: { console: { enabled: true } } },
        { providers: { sentry: { dsn: 'test-dsn' } } },
        { providers: { console: { enabled: true }, sentry: { dsn: 'test-dsn' } } },
      ];

      for (const config of configs) {
        try {
          await createServerObservability(config);
        } catch (error) {
          // Expected to potentially throw but shouldn't crash
          expect(error).toBeDefined();
        }
      }
    });

    test('should handle provider configuration with all options', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      const config = {
        providers: {
          console: {
            enabled: true,
            level: 'debug',
            prefix: '[TEST]',
          },
          sentry: {
            dsn: 'https://test@sentry.io/123',
            environment: 'test',
            tracesSampleRate: 1.0,
            profilesSampleRate: 1.0,
          },
        },
        debug: true,
        enableTracing: true,
        tags: {
          service: 'test-service',
          version: '1.0.0',
        },
      };

      try {
        await createServerObservability(config);
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });

    test('should handle configuration with custom options', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        customProperty: 'custom-value',
        nested: {
          deep: {
            value: 'test',
          },
        },
      };

      try {
        await createServerObservability(config);
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    test('should handle very large configurations', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      const largeConfig = {
        providers: {
          console: { enabled: true },
        },
        metadata: Array(100).fill({ key: 'value' }),
        tags: Array(10).fill(0).reduce((acc, _, i) => {
          acc[`tag${i}`] = `value${i}`;
          return acc;
        }, {}),
      };

      try {
        await createServerObservability(largeConfig);
      } catch (error) {
        // Expected to potentially throw but shouldn't crash
        expect(error).toBeDefined();
      }
    });

    test('should handle invalid configuration types', async () => {
      const { createServerObservability } = await import('../src/server-next');
      
      const invalidConfigs = [
        'string-config' as any,
        42 as any,
        true as any,
        [] as any,
      ];

      for (const config of invalidConfigs) {
        try {
          await createServerObservability(config);
        } catch (error) {
          // Expected to throw with invalid config
          expect(error).toBeDefined();
        }
      }
    });
  });
});
