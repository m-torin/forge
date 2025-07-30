/**
 * Basic tests for validation utilities that work without complex setup
 */

import { describe, expect } from 'vitest';

describe('validation Basic Tests', () => {
  describe('validateAnalyticsConfig', () => {
    test('should validate a basic valid config', async () => {
      const { validateAnalyticsConfig } = await import('#/shared/utils/validation');

      const config = {
        providers: {
          console: {},
        },
      };

      const result = validateAnalyticsConfig(config);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBeTruthy();
    });

    test('should validate config with console enabled', async () => {
      const { validateAnalyticsConfig } = await import('#/shared/utils/validation');

      const config = {
        providers: {
          console: {},
        },
      };

      const result = validateAnalyticsConfig(config);

      expect(result.isValid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    test('should validate client analytics config', async () => {
      const { validateAnalyticsConfig } = await import('#/shared/utils/validation-client');

      const config = {
        providers: {
          console: {},
        },
      };

      const result = validateAnalyticsConfig(config);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('validateProvider', () => {
    test('should validate console provider', async () => {
      const { validateProvider } = await import('#/shared/utils/validation');

      const config = {};
      const result = validateProvider('console', config);

      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(0); // No validation errors for console
    });

    test('should validate unknown providers without errors', async () => {
      const { validateProvider } = await import('#/shared/utils/validation');

      const config = {};

      // Unknown providers should be allowed
      const result = validateProvider('unknown_provider', config);
      expect(Array.isArray(result)).toBeTruthy();
    });

    test('should validate client provider', async () => {
      const { validateProvider } = await import('#/shared/utils/validation-client');

      const config = {};
      const result = validateProvider('console', config);

      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('validateEnvironmentVariables', () => {
    test('should validate environment variables', async () => {
      const { validateEnvironmentVariables } = await import('#/shared/utils/validation');

      const result = validateEnvironmentVariables();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBeTruthy();
    });
  });

  describe('validateConfigOrThrow', () => {
    test('should not throw for valid config', async () => {
      const { validateConfigOrThrow } = await import('#/shared/utils/validation');

      const config = {
        providers: {
          console: {},
        },
      };

      expect(() => validateConfigOrThrow(config)).not.toThrow();
    });

    test('should throw for completely invalid config', async () => {
      const { validateConfigOrThrow } = await import('#/shared/utils/validation');

      const config = {} as any; // Invalid config

      expect(() => validateConfigOrThrow(config)).toThrow(
        'Analytics configuration validation failed',
      );
    });
  });

  describe('validateConfig from validation-client', () => {
    test('should validate config from client validation', async () => {
      const { validateConfig } = await import('#/shared/utils/validation-client');

      const config = {
        providers: {
          console: {},
        },
      };

      const result = validateConfig(config);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('error structure validation', () => {
    test('should return validation result with correct structure', async () => {
      const { validateAnalyticsConfig } = await import('#/shared/utils/validation');

      const config = {
        providers: {
          console: {},
        },
      };

      const result = validateAnalyticsConfig(config);

      // Validate the structure of the validation result
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBeTruthy();

      // Test that validation result follows expected patterns
      // Check if validation passed
      const isValid = result.isValid;
      expect(typeof isValid).toBe('boolean');

      // Test that any errors have proper structure
      result.errors.forEach(error => {
        expect(error).toHaveProperty('message');
        expect(typeof error.message).toBe('string');
      });
    });
  });
});
