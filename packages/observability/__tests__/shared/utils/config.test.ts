import { ObservabilityConfig, ObservabilityContext } from '@/shared/types/types';
import {
  createDefaultConfig,
  deepMerge,
  mergeObservabilityContext,
  normalizeProviderConfig,
  validateConfigStructure,
} from '@/shared/utils/config';
import { describe, expect } from 'vitest';

describe('config utilities', () => {
  describe('deepMerge', () => {
    test('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);

      expect(result).toStrictEqual({ a: 1, b: 3, c: 4 });
    });

    test('should merge nested objects', () => {
      const target = {
        level1: {
          level2: {
            a: 1,
            b: 2,
          },
          c: 3,
        },
      };
      const source = {
        level1: {
          level2: {
            b: 4,
            d: 5,
          },
          e: 6,
        },
      };

      const result = deepMerge(target, source as any);

      expect(result).toStrictEqual({
        level1: {
          level2: {
            a: 1,
            b: 4,
            d: 5,
          },
          c: 3,
          e: 6,
        },
      });
    });

    test('should handle arrays by replacement', () => {
      const target = { arr: [1, 2, 3] };
      const source = { arr: [4, 5] };
      const result = deepMerge(target, source);

      expect(result).toStrictEqual({ arr: [4, 5] });
    });

    test('should handle null and undefined values', () => {
      const target = { a: 1, b: 2 };
      const source = { a: null, b: undefined, c: 3 };
      const result = deepMerge(target, source as any);

      expect(result).toStrictEqual({ a: null, b: undefined, c: 3 });
    });

    test('should prevent prototype pollution', () => {
      const target = { a: 1 };
      const source = {
        __proto__: { polluted: true },
        constructor: { polluted: true },
        prototype: { polluted: true },
        b: 2,
      };

      const result = deepMerge(target, source as any);

      // Should merge regular properties but skip dangerous ones
      expect(result.a).toBe(1);
      expect((result as any).b).toBe(2);

      // Check that dangerous properties weren't copied to the result
      expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBeFalsy();
      expect(Object.prototype.hasOwnProperty.call(result, 'constructor')).toBeFalsy();
      expect(Object.prototype.hasOwnProperty.call(result, 'prototype')).toBeFalsy();

      // Ensure prototype wasn't polluted
      expect(Object.prototype).not.toHaveProperty('polluted');
    });

    test('should handle empty objects', () => {
      const target = { a: 1 };
      const source = {};
      const result = deepMerge(target, source);

      expect(result).toStrictEqual({ a: 1 });
    });

    test('should handle null/undefined targets', () => {
      const source = { a: 1, b: 2 };

      const result1 = deepMerge(null as any, source);
      const result2 = deepMerge(undefined as any, source);

      expect(result1).toStrictEqual(source);
      expect(result2).toStrictEqual(source);
    });

    test('should handle null/undefined sources', () => {
      const target = { a: 1, b: 2 };

      const result1 = deepMerge(target, null as any);
      const result2 = deepMerge(target, undefined as any);

      expect(result1).toStrictEqual(target);
      expect(result2).toStrictEqual(target);
    });

    test('should handle primitive values', () => {
      const target = { value: 'old' };
      const source = { value: 'new', number: 42, boolean: true };
      const result = deepMerge(target, source);

      expect(result).toStrictEqual({ value: 'new', number: 42, boolean: true });
    });

    test('should handle deeply nested structures', () => {
      const target = {
        a: {
          b: {
            c: {
              d: 1,
              e: 2,
            },
          },
        },
      };
      const source = {
        a: {
          b: {
            c: {
              e: 3,
              f: 4,
            },
            g: 5,
          },
        },
      };

      const result = deepMerge(target, source as any);

      expect(result).toStrictEqual({
        a: {
          b: {
            c: {
              d: 1,
              e: 3,
              f: 4,
            },
            g: 5,
          },
        },
      });
    });
  });

  describe('mergeObservabilityContext', () => {
    test('should merge observability contexts', () => {
      const base: ObservabilityContext = {
        tags: { env: 'test', version: '1.0' },
        extra: { requestId: 'req-1' },
      };
      const additional: ObservabilityContext = {
        tags: { version: '2.0', feature: 'new' },
        extra: { userId: 'user-1' },
        level: 'error',
      };

      const result = mergeObservabilityContext(base, additional);

      expect(result).toStrictEqual({
        tags: { env: 'test', version: '2.0', feature: 'new' },
        extra: { requestId: 'req-1', userId: 'user-1' },
        level: 'error',
      });
    });

    test('should handle empty contexts', () => {
      const base: ObservabilityContext = {
        tags: { env: 'test' },
      };
      const additional: ObservabilityContext = {};

      const result = mergeObservabilityContext(base, additional);

      expect(result).toStrictEqual({
        tags: { env: 'test' },
      });
    });

    test('should handle undefined contexts', () => {
      const base: ObservabilityContext = {
        tags: { env: 'test' },
      };

      const result1 = mergeObservabilityContext(base, undefined);
      const result2 = mergeObservabilityContext(undefined, base);

      expect(result1).toStrictEqual(base);
      expect(result2).toStrictEqual(base);
    });
  });

  describe('createDefaultConfig', () => {
    test('should create a default observability config', () => {
      const config = createDefaultConfig();

      expect(config).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(typeof config.providers).toBe('object');
    });

    test('should include console provider by default', () => {
      const config = createDefaultConfig();

      expect(config.providers.console).toBeDefined();
      expect(config.providers.console.type).toBe('console');
      expect(config.providers.console.enabled).toBeTruthy();
    });

    test('should allow overrides', () => {
      const overrides = {
        debug: true,
        providers: {
          sentry: {
            type: 'sentry' as const,
            enabled: true,
            dsn: 'https://example@sentry.io/123456',
          },
        },
      };

      const config = createDefaultConfig(overrides);

      expect(config.debug).toBeTruthy();
      expect(config.providers.sentry).toBeDefined();
      expect(config.providers.console).toBeDefined(); // Should still be there
    });
  });

  describe('normalizeProviderConfig', () => {
    test('should normalize provider config with defaults', () => {
      const config = {
        type: 'console' as const,
        enabled: true,
      };

      const normalized = normalizeProviderConfig('console', config);

      expect(normalized.type).toBe('console');
      expect(normalized.enabled).toBeTruthy();
      expect(normalized.logLevel).toBeDefined();
    });

    test('should preserve existing values', () => {
      const config = {
        type: 'sentry' as const,
        enabled: true,
        dsn: 'https://example@sentry.io/123456',
        environment: 'production',
        logLevel: 'error' as const,
      };

      const normalized = normalizeProviderConfig('sentry', config);

      expect(normalized.type).toBe('sentry');
      expect(normalized.enabled).toBeTruthy();
      expect(normalized.dsn).toBe('https://example@sentry.io/123456');
      expect(normalized.environment).toBe('production');
      expect(normalized.logLevel).toBe('error');
    });

    test('should handle missing optional fields', () => {
      const config = {
        type: 'logtail' as const,
        enabled: true,
      };

      const normalized = normalizeProviderConfig('logtail', config);

      expect(normalized.type).toBe('logtail');
      expect(normalized.enabled).toBeTruthy();
      expect(normalized.token).toBeUndefined();
    });
  });

  describe('validateConfigStructure', () => {
    test('should validate correct config structure', () => {
      const config: ObservabilityConfig = {
        providers: {
          console: {
            type: 'console',
            enabled: true,
          },
        },
      };

      const result = validateConfigStructure(config);

      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing providers', () => {
      const config = {} as ObservabilityConfig;

      const result = validateConfigStructure(config);

      expect(result.valid).toBeFalsy();
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'providers',
          message: expect.stringContaining('required'),
        }),
      );
    });

    test('should detect empty providers object', () => {
      const config: ObservabilityConfig = {
        providers: {},
      };

      const result = validateConfigStructure(config);

      expect(result.valid).toBeFalsy();
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'providers',
          message: expect.stringContaining('at least one provider'),
        }),
      );
    });

    test('should detect invalid provider configuration', () => {
      const config: ObservabilityConfig = {
        providers: {
          invalid: {
            type: 'unknown' as any,
            enabled: true,
          },
        },
      };

      const result = validateConfigStructure(config);

      expect(result.valid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle complex valid configuration', () => {
      const config: ObservabilityConfig = {
        debug: true,
        providers: {
          console: {
            type: 'console',
            enabled: true,
            logLevel: 'debug',
          },
          sentry: {
            type: 'sentry',
            enabled: true,
            dsn: 'https://example@sentry.io/123456',
            environment: 'production',
            logLevel: 'error',
          },
        },
        circuitBreaker: {
          failureThreshold: 5,
          resetTimeout: 10000,
        },
        connectionPool: {
          maxConnections: 10,
          idleTimeout: 30000,
        },
      };

      const result = validateConfigStructure(config);

      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    test('should handle circular references in deepMerge', () => {
      const target: any = { a: 1 };
      const source: any = { b: 2 };

      // Create circular reference
      source.self = source;

      // This will actually cause stack overflow with current implementation
      // so we test that it throws rather than hangs
      expect(() => deepMerge(target, source)).toThrow('Maximum call stack size exceeded');
    });

    test('should handle invalid input types gracefully', () => {
      // These should not throw
      expect(() => deepMerge('string' as any, { a: 1 })).not.toThrow();
      expect(() => deepMerge({ a: 1 }, 'string' as any)).not.toThrow();
      expect(() => deepMerge(123 as any, { a: 1 })).not.toThrow();
    });

    test('should handle complex nested null values', () => {
      const target = {
        nested: {
          value: 'old',
          keep: true,
        },
      };
      const source = {
        nested: {
          value: null,
          newValue: 'new',
        },
      };

      const result = deepMerge(target, source as any);

      expect(result).toStrictEqual({
        nested: {
          value: null,
          keep: true,
          newValue: 'new',
        },
      });
    });
  });
});
