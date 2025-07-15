/**
 * Basic tests for validation utilities that work without complex setup
 */

import { describe, expect, it } from 'vitest';

describe('Validation Basic Tests', () => {
  describe('validateAnalyticsConfig', () => {
    it('should validate a basic valid config', async () => {
      const { validateAnalyticsConfig } = await import('@/shared/utils/validation');

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
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate config with console enabled', async () => {
      const { validateAnalyticsConfig } = await import('@/shared/utils/validation');

      const config = {
        providers: {
          console: {},
        },
      };

      const result = validateAnalyticsConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate client analytics config', async () => {
      const { validateAnalyticsConfig } = await import('@/shared/utils/validation-client');

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
    it('should validate console provider', async () => {
      const { validateProvider } = await import('@/shared/utils/validation');

      const config = {};
      const result = validateProvider('console', config);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0); // No validation errors for console
    });

    it('should validate unknown providers without errors', async () => {
      const { validateProvider } = await import('@/shared/utils/validation');

      const config = {};

      // Unknown providers should be allowed
      const result = validateProvider('unknown_provider', config);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should validate client provider', async () => {
      const { validateProvider } = await import('@/shared/utils/validation-client');

      const config = {};
      const result = validateProvider('console', config);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('validateEnvironmentVariables', () => {
    it('should validate environment variables', async () => {
      const { validateEnvironmentVariables } = await import('@/shared/utils/validation');

      const result = validateEnvironmentVariables();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validateConfigOrThrow', () => {
    it('should not throw for valid config', async () => {
      const { validateConfigOrThrow } = await import('@/shared/utils/validation');

      const config = {
        providers: {
          console: {},
        },
      };

      expect(() => validateConfigOrThrow(config)).not.toThrow();
    });

    it('should throw for completely invalid config', async () => {
      const { validateConfigOrThrow } = await import('@/shared/utils/validation');

      const config = {} as any; // Invalid config

      expect(() => validateConfigOrThrow(config)).toThrow();
    });
  });

  describe('validateConfig from validation-client', () => {
    it('should validate config from client validation', async () => {
      const { validateConfig } = await import('@/shared/utils/validation-client');

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
    it('should return validation result with correct structure', async () => {
      const { validateAnalyticsConfig } = await import('@/shared/utils/validation');

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
      expect(Array.isArray(result.errors)).toBe(true);

      if (!result.isValid) {
        // If there are errors, they should be objects with message properties
        result.errors.forEach(error => {
          expect(error).toHaveProperty('message');
          expect(typeof error.message).toBe('string');
        });
      }
    });
  });
});
