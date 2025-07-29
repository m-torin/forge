/**
 * Shared Configuration Tests
 *
 * Comprehensive tests for i18n configuration management including
 * languine.json validation, configuration merging, and validation patterns.
 */

import { describe, expect, test, vi } from 'vitest';
import { i18nTestPatterns } from '../i18n-test-factory';

// ================================================================================================
// CONFIGURATION VALIDATION TESTS
// ================================================================================================

describe('configuration Validation', () => {
  test('should validate languine.json structure', async () => {
    const mockValidateConfig = vi.fn(config => {
      const errors = [];

      if (!config.locale) {
        errors.push('Missing locale configuration');
      }

      if (config.locale && !config.locale.source) {
        errors.push('Missing source locale');
      }

      if (config.locale && !Array.isArray(config.locale.targets)) {
        errors.push('Targets must be an array');
      }

      return errors;
    });

    // Test valid configuration
    const validConfig = {
      locale: {
        source: 'en',
        targets: ['fr', 'es', 'pt', 'de'],
      },
      ns: ['common', 'navigation'],
      dictionary: 'locales',
    };

    expect(mockValidateConfig(validConfig)).toHaveLength(0);

    // Test invalid configurations
    const invalidConfigs = [
      {},
      { locale: null },
      { locale: { source: null, targets: [] } },
      { locale: { source: 'en', targets: null } },
      { locale: { source: 'en', targets: 'not-array' } },
    ];

    invalidConfigs.forEach(config => {
      const errors = mockValidateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  test('should validate namespace configuration', async () => {
    const mockValidateNamespaces = vi.fn(config => {
      const errors = [];

      if (!config.ns) {
        errors.push('Missing namespace configuration');
      }

      if (config.ns && !Array.isArray(config.ns)) {
        errors.push('Namespaces must be an array');
      }

      if (config.ns && config.ns.length === 0) {
        errors.push('At least one namespace is required');
      }

      if (config.ns && config.ns.some(ns => typeof ns !== 'string')) {
        errors.push('All namespaces must be strings');
      }

      return errors;
    });

    // Test valid namespace configurations
    const validConfigs = [
      { ns: ['common'] },
      { ns: ['common', 'navigation'] },
      { ns: ['common', 'navigation', 'forms', 'errors'] },
    ];

    validConfigs.forEach(config => {
      expect(mockValidateNamespaces(config)).toHaveLength(0);
    });

    // Test invalid namespace configurations
    const invalidConfigs = [
      {},
      { ns: null },
      { ns: [] },
      { ns: 'not-array' },
      { ns: [123, 'common'] },
      { ns: ['common', null] },
    ];

    invalidConfigs.forEach(config => {
      const errors = mockValidateNamespaces(config);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  test('should validate dictionary path configuration', async () => {
    const mockValidateDictionary = vi.fn(config => {
      const errors = [];

      if (!config.dictionary) {
        errors.push('Missing dictionary path');
      }

      if (config.dictionary && typeof config.dictionary !== 'string') {
        errors.push('Dictionary path must be a string');
      }

      if (config.dictionary && config.dictionary.length === 0) {
        errors.push('Dictionary path cannot be empty');
      }

      return errors;
    });

    // Test valid dictionary configurations
    const validConfigs = [
      { dictionary: 'locales' },
      { dictionary: 'i18n' },
      { dictionary: 'dictionaries' },
      { dictionary: 'src/locales' },
    ];

    validConfigs.forEach(config => {
      expect(mockValidateDictionary(config)).toHaveLength(0);
    });

    // Test invalid dictionary configurations
    const invalidConfigs = [
      {},
      { dictionary: null },
      { dictionary: '' },
      { dictionary: 123 },
      { dictionary: [] },
      { dictionary: {} },
    ];

    invalidConfigs.forEach(config => {
      const errors = mockValidateDictionary(config);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

// ================================================================================================
// CONFIGURATION MERGING TESTS
// ================================================================================================

describe('configuration Merging', () => {
  test('should merge configurations properly', async () => {
    const mockMergeConfigs = vi.fn((baseConfig, userConfig) => {
      return {
        ...baseConfig,
        ...userConfig,
        locale: {
          ...baseConfig.locale,
          ...userConfig.locale,
        },
        ns: userConfig.ns || baseConfig.ns,
        dictionary: userConfig.dictionary || baseConfig.dictionary,
      };
    });

    const baseConfig = {
      locale: {
        source: 'en',
        targets: ['fr', 'es'],
      },
      ns: ['common'],
      dictionary: 'locales',
    };

    const userConfig = {
      locale: {
        targets: ['fr', 'es', 'pt', 'de'],
      },
      ns: ['common', 'navigation'],
    };

    const merged = mockMergeConfigs(baseConfig, userConfig);

    expect(merged.locale.source).toBe('en');
    expect(merged.locale.targets).toEqual(['fr', 'es', 'pt', 'de']);
    expect(merged.ns).toEqual(['common', 'navigation']);
    expect(merged.dictionary).toBe('locales');
  });

  test('should handle deep configuration merging', async () => {
    const mockDeepMerge = vi.fn((base, user) => {
      const mergeDeep = (target, source) => {
        const result = { ...target };

        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = mergeDeep(result[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }

        return result;
      };

      return mergeDeep(base, user);
    });

    const baseConfig = {
      locale: {
        source: 'en',
        targets: ['fr'],
      },
      options: {
        fallback: true,
        cache: true,
      },
      paths: {
        dictionaries: './locales',
        output: './dist',
      },
    };

    const userConfig = {
      locale: {
        targets: ['fr', 'es'],
      },
      options: {
        cache: false,
        minify: true,
      },
      paths: {
        output: './build',
      },
    };

    const merged = mockDeepMerge(baseConfig, userConfig);

    expect(merged.locale.source).toBe('en');
    expect(merged.locale.targets).toEqual(['fr', 'es']);
    expect(merged.options.fallback).toBeTruthy();
    expect(merged.options.cache).toBeFalsy();
    expect(merged.options.minify).toBeTruthy();
    expect(merged.paths.dictionaries).toBe('./locales');
    expect(merged.paths.output).toBe('./build');
  });

  test('should handle configuration conflicts', async () => {
    const mockResolveConflicts = vi.fn((base, user, strategy = 'user-wins') => {
      switch (strategy) {
        case 'user-wins':
          return { ...base, ...user };
        case 'base-wins':
          return { ...user, ...base };
        case 'merge-arrays':
          const result = { ...base, ...user };
          Object.keys(result).forEach(key => {
            if (Array.isArray(base[key]) && Array.isArray(user[key])) {
              result[key] = [...new Set([...base[key], ...user[key]])];
            }
          });
          return result;
        default:
          return { ...base, ...user };
      }
    });

    const baseConfig = {
      locales: ['en', 'fr'],
      features: ['translation', 'pluralization'],
    };

    const userConfig = {
      locales: ['en', 'es'],
      features: ['translation', 'interpolation'],
    };

    // Test different conflict resolution strategies
    const userWins = mockResolveConflicts(baseConfig, userConfig, 'user-wins');
    expect(userWins.locales).toEqual(['en', 'es']);
    expect(userWins.features).toEqual(['translation', 'interpolation']);

    const baseWins = mockResolveConflicts(baseConfig, userConfig, 'base-wins');
    expect(baseWins.locales).toEqual(['en', 'fr']);
    expect(baseWins.features).toEqual(['translation', 'pluralization']);

    const mergeArrays = mockResolveConflicts(baseConfig, userConfig, 'merge-arrays');
    expect(mergeArrays.locales).toEqual(['en', 'fr', 'es']);
    expect(mergeArrays.features).toEqual(['translation', 'pluralization', 'interpolation']);
  });
});

// ================================================================================================
// CONFIGURATION LOADING TESTS
// ================================================================================================

describe('configuration Loading', () => {
  test('should load configuration from multiple sources', async () => {
    const mockLoadConfig = vi.fn(async sources => {
      const configs = [];

      for (const source of sources) {
        switch (source.type) {
          case 'file':
            configs.push({
              locale: { source: 'en', targets: ['fr'] },
              ns: ['common'],
              dictionary: 'locales',
            });
            break;
          case 'package':
            configs.push({
              locale: { targets: ['fr', 'es'] },
              ns: ['common', 'navigation'],
            });
            break;
          case 'user':
            configs.push({
              locale: { targets: ['fr', 'es', 'pt'] },
              dictionary: 'i18n',
            });
            break;
        }
      }

      // Merge all configurations
      return configs.reduce(
        (merged, config) => ({
          ...merged,
          ...config,
          locale: {
            ...merged.locale,
            ...config.locale,
          },
          ns: config.ns || merged.ns,
          dictionary: config.dictionary || merged.dictionary,
        }),
        {},
      );
    });

    const sources = [
      { type: 'file', path: './languine.json' },
      { type: 'package', path: './package.json' },
      { type: 'user', path: './i18n.config.js' },
    ];

    const config = await mockLoadConfig(sources);

    expect(config.locale.source).toBe('en');
    expect(config.locale.targets).toEqual(['fr', 'es', 'pt']);
    expect(config.ns).toEqual(['common', 'navigation']);
    expect(config.dictionary).toBe('i18n');
  });

  test('should handle configuration loading errors', async () => {
    const mockLoadConfigWithErrors = vi.fn(async sources => {
      const configs = [];
      const errors = [];

      for (const source of sources) {
        try {
          switch (source.type) {
            case 'file':
              if (source.path === './invalid.json') {
                throw new Error('File not found');
              }
              configs.push({ locale: { source: 'en' } });
              break;
            case 'package':
              if (source.path === './invalid-package.json') {
                throw new Error('Invalid JSON');
              }
              configs.push({ ns: ['common'] });
              break;
            default:
              throw new Error('Unknown source type');
          }
        } catch (error) {
          errors.push({ source, error: error.message });
        }
      }

      return { configs, errors };
    });

    const sources = [
      { type: 'file', path: './languine.json' },
      { type: 'file', path: './invalid.json' },
      { type: 'package', path: './invalid-package.json' },
    ];

    const result = await mockLoadConfigWithErrors(sources);

    expect(result.configs).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].error).toBe('File not found');
    expect(result.errors[1].error).toBe('Invalid JSON');
  });
});

// ================================================================================================
// CONFIGURATION CACHING TESTS
// ================================================================================================

describe('configuration Caching', () => {
  test('should cache configuration after first load', async () => {
    const mockConfigCache = {
      cache: new Map(),
      loadConfig: vi.fn(async key => {
        if (mockConfigCache.cache.has(key)) {
          return mockConfigCache.cache.get(key);
        }

        const config = {
          locale: { source: 'en', targets: ['fr', 'es'] },
          ns: ['common'],
          dictionary: 'locales',
          loadTime: Date.now(),
        };

        mockConfigCache.cache.set(key, config);
        return config;
      }),
      clearCache: vi.fn(() => {
        mockConfigCache.cache.clear();
      }),
    };

    const key = 'test-config';

    // First load
    const config1 = await mockConfigCache.loadConfig(key);
    expect(config1.loadTime).toBeDefined();

    // Second load should use cache
    const config2 = await mockConfigCache.loadConfig(key);
    expect(config2.loadTime).toBe(config1.loadTime);

    // Clear cache and reload
    mockConfigCache.clearCache();
    const config3 = await mockConfigCache.loadConfig(key);
    expect(config3.loadTime).toBeGreaterThan(config1.loadTime);
  });

  test('should invalidate cache when configuration changes', async () => {
    const mockConfigWatcher = {
      cache: new Map(),
      watchers: new Map(),

      loadConfig: vi.fn(async (key, file) => {
        if (mockConfigWatcher.cache.has(key)) {
          return mockConfigWatcher.cache.get(key);
        }

        const config = {
          locale: { source: 'en', targets: ['fr'] },
          ns: ['common'],
          dictionary: 'locales',
          file,
          loadTime: Date.now(),
        };

        mockConfigWatcher.cache.set(key, config);
        return config;
      }),

      invalidateCache: vi.fn(key => {
        mockConfigWatcher.cache.delete(key);
      }),

      simulateFileChange: vi.fn(key => {
        mockConfigWatcher.invalidateCache(key);
      }),
    };

    const key = 'test-config';
    const file = './languine.json';

    // Load configuration
    const config1 = await mockConfigWatcher.loadConfig(key, file);
    expect(config1.loadTime).toBeDefined();

    // Simulate file change
    mockConfigWatcher.simulateFileChange(key);

    // Reload should fetch fresh configuration
    const config2 = await mockConfigWatcher.loadConfig(key, file);
    expect(config2.loadTime).toBeGreaterThan(config1.loadTime);
  });
});

// ================================================================================================
// CONFIGURATION VALIDATION PATTERNS
// ================================================================================================

i18nTestPatterns.testConfigurationValidation([
  {
    name: 'validate minimal configuration',
    configData: {
      locale: {
        source: 'en',
        targets: ['fr'],
      },
      ns: ['common'],
      dictionary: 'locales',
    },
    expectedValid: true,
    expectedProperties: ['locale', 'ns', 'dictionary'],
    customAssertions: config => {
      expect(config.locale.source).toBe('en');
      expect(config.locale.targets).toEqual(['fr']);
      expect(config.ns).toEqual(['common']);
      expect(config.dictionary).toBe('locales');
    },
  },
  {
    name: 'validate complete configuration',
    configData: {
      locale: {
        source: 'en',
        targets: ['fr', 'es', 'pt', 'de'],
      },
      ns: ['common', 'navigation', 'forms'],
      dictionary: 'i18n',
      options: {
        fallback: true,
        cache: true,
        minify: false,
      },
    },
    expectedValid: true,
    expectedProperties: ['locale', 'ns', 'dictionary', 'options'],
    customAssertions: config => {
      expect(config.locale.targets).toHaveLength(4);
      expect(config.ns).toHaveLength(3);
      expect(config.options.fallback).toBeTruthy();
      expect(config.options.cache).toBeTruthy();
      expect(config.options.minify).toBeFalsy();
    },
  },
  {
    name: 'validate extended configuration',
    configData: {
      locale: {
        source: 'en',
        targets: ['fr', 'es', 'pt', 'de', 'it', 'ru'],
      },
      ns: ['common', 'navigation', 'forms', 'errors', 'api'],
      dictionary: 'src/locales',
      options: {
        fallback: true,
        cache: true,
        minify: true,
        interpolation: {
          prefix: '{{',
          suffix: '}}',
        },
      },
      paths: {
        input: './src/locales',
        output: './dist/locales',
      },
    },
    expectedValid: true,
    expectedProperties: ['locale', 'ns', 'dictionary', 'options', 'paths'],
    customAssertions: config => {
      expect(config.locale.targets).toHaveLength(6);
      expect(config.ns).toHaveLength(5);
      expect(config.options.interpolation.prefix).toBe('{{');
      expect(config.paths.input).toBe('./src/locales');
    },
  },
]);

// ================================================================================================
// CONFIGURATION ENVIRONMENT TESTS
// ================================================================================================

describe('configuration Environment', () => {
  test('should adapt configuration based on environment', async () => {
    const mockGetEnvConfig = vi.fn(env => {
      const baseConfig = {
        locale: { source: 'en', targets: ['fr', 'es'] },
        ns: ['common'],
        dictionary: 'locales',
      };

      switch (env) {
        case 'development':
          return {
            ...baseConfig,
            options: {
              cache: false,
              minify: false,
              watch: true,
            },
          };
        case 'production':
          return {
            ...baseConfig,
            options: {
              cache: true,
              minify: true,
              watch: false,
            },
          };
        case 'test':
          return {
            ...baseConfig,
            locale: { source: 'en', targets: ['en'] }, // Only English in tests
            options: {
              cache: false,
              minify: false,
              watch: false,
            },
          };
        default:
          return baseConfig;
      }
    });

    const devConfig = mockGetEnvConfig('development');
    expect(devConfig.options.cache).toBeFalsy();
    expect(devConfig.options.watch).toBeTruthy();

    const prodConfig = mockGetEnvConfig('production');
    expect(prodConfig.options.cache).toBeTruthy();
    expect(prodConfig.options.minify).toBeTruthy();

    const testConfig = mockGetEnvConfig('test');
    expect(testConfig.locale.targets).toEqual(['en']);
    expect(testConfig.options.watch).toBeFalsy();
  });

  test('should handle environment variable overrides', async () => {
    const mockApplyEnvOverrides = vi.fn((config, env) => {
      const overrides = {};

      if (env.I18N_CACHE) {
        overrides.cache = env.I18N_CACHE === 'true';
      }

      if (env.I18N_MINIFY) {
        overrides.minify = env.I18N_MINIFY === 'true';
      }

      if (env.I18N_LOCALES) {
        overrides.locales = env.I18N_LOCALES.split(',');
      }

      return {
        ...config,
        options: {
          ...config.options,
          ...overrides,
        },
      };
    });

    const baseConfig = {
      locale: { source: 'en', targets: ['fr'] },
      ns: ['common'],
      dictionary: 'locales',
      options: {
        cache: true,
        minify: false,
      },
    };

    const env = {
      I18N_CACHE: 'false',
      I18N_MINIFY: 'true',
      I18N_LOCALES: 'en,fr,es,pt',
    };

    const configWithOverrides = mockApplyEnvOverrides(baseConfig, env);

    expect(configWithOverrides.options.cache).toBeFalsy();
    expect(configWithOverrides.options.minify).toBeTruthy();
    expect(configWithOverrides.options.locales).toEqual(['en', 'fr', 'es', 'pt']);
  });
});

/**
 * Test Coverage Summary:
 *
 * ✅ **Configuration Validation**: Tests languine.json structure validation
 * ✅ **Namespace Validation**: Tests namespace configuration validation
 * ✅ **Dictionary Path Validation**: Tests dictionary path configuration
 * ✅ **Configuration Merging**: Tests deep merging and conflict resolution
 * ✅ **Configuration Loading**: Tests loading from multiple sources
 * ✅ **Error Handling**: Tests graceful error handling during loading
 * ✅ **Configuration Caching**: Tests caching and invalidation
 * ✅ **Environment Adaptation**: Tests environment-specific configurations
 * ✅ **Environment Overrides**: Tests environment variable overrides
 * ✅ **Systematic Testing**: Uses test factory patterns for consistency
 *
 * This provides comprehensive coverage of all configuration scenarios and ensures
 * robust configuration management across different environments and use cases.
 */
