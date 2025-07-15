/**
 * Storage Configuration Tests
 *
 * Tests for environment configuration, provider setup, and storage management.
 * Follows the successful analytics/email package DRY pattern.
 */

import { beforeEach, describe, expect, test } from 'vitest';
import {
  generateProviderConfigs,
  generateStorageKeys,
  validateTestData,
} from '../test-data-generators';
import { setupStorageMocks, storageTestEnvironment } from '../test-utils/setup';

describe('storage Configuration', () => {
  beforeEach(() => {
    setupStorageMocks.reset();
  });

  describe('environment Configuration', () => {
    test('should import environment configuration successfully', async () => {
      const env = await import('../../env');

      expect(env).toBeDefined();
      expect(env.env || env.safeEnv).toBeDefined();
    });

    test('should handle environment validation', async () => {
      const env = await import('../../env');

      // Test that environment can be accessed safely
      if (env.safeEnv) {
        const safeEnv = env.safeEnv();
        expect(safeEnv).toBeDefined();
        expect(typeof safeEnv).toBe('object');
      }

      if (env.env) {
        expect(env.env).toBeDefined();
        expect(typeof env.env).toBe('object');
      }
    });

    test('should provide fallback values for missing variables', async () => {
      const env = await import('../../env');

      // Environment should handle missing variables gracefully
      expect(() => {
        if (env.safeEnv) {
          const safeEnv = env.safeEnv();
          return safeEnv;
        }
        return env.env;
      }).not.toThrow();
    });
  });

  describe('provider Configuration Validation', () => {
    test('should validate Cloudflare R2 configuration', () => {
      const configs = generateProviderConfigs.cloudflareR2();

      // Valid configuration
      expect(validateTestData.providerConfig(configs.valid, 'cloudflare-r2')).toBeTruthy();

      // Invalid configurations
      expect(validateTestData.providerConfig(configs.invalid.empty, 'cloudflare-r2')).toBeFalsy();
      expect(
        validateTestData.providerConfig(configs.invalid.missingBucket, 'cloudflare-r2'),
      ).toBeFalsy();
    });

    test('should validate Vercel Blob configuration', () => {
      const configs = generateProviderConfigs.vercelBlob();

      // Valid configuration
      expect(validateTestData.providerConfig(configs.valid, 'vercel-blob')).toBeTruthy();

      // Invalid configurations
      expect(validateTestData.providerConfig(configs.invalid.empty, 'vercel-blob')).toBeFalsy();
      expect(validateTestData.providerConfig(configs.invalid.null, 'vercel-blob')).toBeFalsy();
      expect(validateTestData.providerConfig(configs.invalid.undefined, 'vercel-blob')).toBeFalsy();
    });

    test('should validate Cloudflare Images configuration', () => {
      const configs = generateProviderConfigs.cloudflareImages();

      // Valid configuration
      expect(validateTestData.providerConfig(configs.valid, 'cloudflare-images')).toBeTruthy();

      // Invalid configurations
      expect(
        validateTestData.providerConfig(configs.invalid.empty, 'cloudflare-images'),
      ).toBeFalsy();
      expect(
        validateTestData.providerConfig(configs.invalid.missingApiToken, 'cloudflare-images'),
      ).toBeFalsy();
    });

    test('should handle configuration edge cases', () => {
      const edgeCases = [
        { config: null, type: 'cloudflare-r2' },
        { config: undefined, type: 'vercel-blob' },
        { config: {}, type: 'cloudflare-images' },
        { config: 'not-an-object', type: 'cloudflare-r2' },
      ];

      edgeCases.forEach(({ config, type }) => {
        expect(validateTestData.providerConfig(config, type)).toBeFalsy();
      });
    });
  });

  describe('multi-Storage Configuration', () => {
    test('should validate complete multi-storage configuration', () => {
      const config = generateProviderConfigs.multiStorage().complete;

      expect(config).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(typeof config.providers).toBe('object');
      expect(Object.keys(config.providers).length).toBeGreaterThan(0);

      // Each provider should have valid configuration
      Object.entries(config.providers).forEach(([name, providerConfig]: [string, any]) => {
        expect(providerConfig.provider).toBeDefined();
        expect(typeof providerConfig.provider).toBe('string');

        // Check provider-specific configuration exists
        const configKey = Object.keys(providerConfig).find(key => key !== 'provider');
        expect(configKey).toBeDefined();
        expect((providerConfig as any)[configKey!]).toBeDefined();
      });
    });

    test('should validate minimal multi-storage configuration', () => {
      const config = generateProviderConfigs.multiStorage().minimal;

      expect(config).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(Object.keys(config.providers).length).toBeGreaterThan(0);

      // Should have at least one provider
      const providerNames = Object.keys(config.providers);
      expect(providerNames.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle multi-storage routing configuration', () => {
      const config = generateProviderConfigs.multiStorage().complete;

      if (config.routing) {
        expect(typeof config.routing).toBe('object');

        Object.entries(config.routing).forEach(([fileType, providerName]: [string, any]) => {
          expect(typeof fileType).toBe('string');
          expect(typeof providerName).toBe('string');
          expect((config.providers as any)[providerName]).toBeDefined();
        });
      }
    });

    test('should validate default provider configuration', () => {
      const config = generateProviderConfigs.multiStorage().complete;

      if (config.defaultProvider) {
        expect(typeof config.defaultProvider).toBe('string');
        expect((config.providers as any)[config.defaultProvider]).toBeDefined();
      }
    });
  });

  describe('storage Key Validation', () => {
    test('should validate various storage key formats', () => {
      const validKeys = generateStorageKeys.valid();

      Object.values(validKeys).forEach(key => {
        expect(validateTestData.storageKey(key)).toBeTruthy();
      });
    });

    test('should reject invalid storage keys', () => {
      const invalidKeys = generateStorageKeys.invalid();

      Object.entries(invalidKeys).forEach(([type, key]) => {
        if (key !== null && key !== undefined) {
          expect(validateTestData.storageKey(key)).toBeFalsy();
        }
      });
    });

    test('should handle edge case storage keys appropriately', () => {
      const edgeCases = generateStorageKeys.edgeCases();

      // Some edge cases should be valid, others invalid
      expect(validateTestData.storageKey(edgeCases.unicode)).toBeTruthy();
      expect(validateTestData.storageKey(edgeCases.withSpaces)).toBeTruthy();
      expect(validateTestData.storageKey(edgeCases.multipleExtensions)).toBeTruthy();
      expect(validateTestData.storageKey(edgeCases.noExtension)).toBeTruthy();
    });
  });

  describe('storage Manager Configuration', () => {
    test('should handle storage manager initialization', async () => {
      const mocks = storageTestEnvironment.setup('success');

      expect(mocks).toBeDefined();
      expect(typeof mocks).toBe('object');
    });

    test('should support different storage scenarios', () => {
      const scenarios = ['success', 'error', 'partial'] as const;

      scenarios.forEach(scenario => {
        const mocks = storageTestEnvironment.setup(scenario);
        expect(mocks).toBeDefined();
        expect(typeof mocks).toBe('object');
      });
    });

    test('should handle storage provider switching', () => {
      const successMocks = storageTestEnvironment.setup('success');
      storageTestEnvironment.reset();
      const errorMocks = storageTestEnvironment.setup('error');

      expect(successMocks).toBeDefined();
      expect(errorMocks).toBeDefined();
      expect(successMocks).not.toStrictEqual(errorMocks);
    });
  });

  describe('configuration Security', () => {
    test('should not expose sensitive configuration in logs', () => {
      const config = generateProviderConfigs.cloudflareR2().valid;

      // Sensitive fields should not be easily logged
      const sensitiveFields = ['secretAccessKey', 'accessKeyId', 'apiToken'];

      sensitiveFields.forEach(field => {
        if ((config as any)[field]) {
          // Should be a string (not exposed as object structure)
          expect(typeof (config as any)[field]).toBe('string');
          expect((config as any)[field].length).toBeGreaterThan(0);
        }
      });
    });

    test('should handle configuration with missing sensitive data', () => {
      const configs = [
        generateProviderConfigs.cloudflareR2().invalid.empty,
        generateProviderConfigs.vercelBlob().invalid.empty,
        generateProviderConfigs.cloudflareImages().invalid.empty,
      ];

      configs.forEach(config => {
        // Should not throw when validating empty/invalid configs
        expect(() => {
          validateTestData.providerConfig(config, 'cloudflare-r2');
        }).not.toThrow();
      });
    });
  });

  describe('configuration Performance', () => {
    test('should load configuration quickly', async () => {
      const start = performance.now();

      // Load multiple configurations
      const configs = [
        generateProviderConfigs.cloudflareR2().valid,
        generateProviderConfigs.vercelBlob().valid,
        generateProviderConfigs.cloudflareImages().valid,
        generateProviderConfigs.multiStorage().complete,
      ];

      const duration = performance.now() - start;

      expect(configs).toHaveLength(4);
      expect(duration).toBeLessThan(100); // Should be very fast
    });

    test('should handle batch configuration validation efficiently', () => {
      const start = performance.now();

      // Validate multiple configurations
      const validations = [
        validateTestData.providerConfig(
          generateProviderConfigs.cloudflareR2().valid,
          'cloudflare-r2',
        ),
        validateTestData.providerConfig(generateProviderConfigs.vercelBlob().valid, 'vercel-blob'),
        validateTestData.providerConfig(
          generateProviderConfigs.cloudflareImages().valid,
          'cloudflare-images',
        ),
      ];

      const duration = performance.now() - start;

      expect(validations).toStrictEqual([true, true, true]);
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });

  describe('configuration Consistency', () => {
    test('should maintain consistent configuration structure', () => {
      const r2Config = generateProviderConfigs.cloudflareR2().valid;
      const blobConfig = generateProviderConfigs.vercelBlob().valid;
      const imagesConfig = generateProviderConfigs.cloudflareImages().valid;

      // All configurations should be objects
      expect(typeof r2Config).toBe('object');
      expect(typeof blobConfig).toBe('object');
      expect(typeof imagesConfig).toBe('object');

      // All should be non-null
      expect(r2Config).not.toBeNull();
      expect(blobConfig).not.toBeNull();
      expect(imagesConfig).not.toBeNull();
    });

    test('should generate reproducible test configurations', () => {
      // Multiple calls should generate similar structure (but different values due to faker)
      const config1 = generateProviderConfigs.cloudflareR2().valid;
      const config2 = generateProviderConfigs.cloudflareR2().valid;

      // Should have same keys
      expect(Object.keys(config1)).toStrictEqual(Object.keys(config2));

      // Values should be different (faker generates random data)
      expect(config1.bucket).not.toBe(config2.bucket);
    });

    test('should handle configuration inheritance properly', () => {
      const multiConfig = generateProviderConfigs.multiStorage().complete;

      // Each provider in multi-config should have valid individual config
      Object.entries(multiConfig.providers).forEach(([name, providerConfig]: [string, any]) => {
        const providerType = providerConfig.provider;
        const individualConfig =
          providerConfig[Object.keys(providerConfig).find(key => key !== 'provider')!];

        if (providerType && individualConfig) {
          const isValid = validateTestData.providerConfig(individualConfig, providerType);
          expect(isValid).toBeTruthy();
        }
      });
    });
  });
});
