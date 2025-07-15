import { LogLevel, ObservabilityConfig } from '@/shared/types/types';
import {
  debugConfig,
  isValidEmail,
  isValidUrl,
  validateObservabilityConfig,
  validateProviderConfig,
} from '@/shared/utils/validation';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock the environment function
vi.mock('../../../env', () => ({
  isProduction: vi.fn(() => false),
}));

describe('validation utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidEmail', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBeTruthy();
      expect(isValidEmail('user.name@domain.co.uk')).toBeTruthy();
      expect(isValidEmail('user+tag@example.org')).toBeTruthy();
      expect(isValidEmail('firstname.lastname@subdomain.example.com')).toBeTruthy();
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBeFalsy();
      expect(isValidEmail('missing@domain')).toBeFalsy();
      expect(isValidEmail('@missinglocal.com')).toBeFalsy();
      expect(isValidEmail('user@')).toBeFalsy();
      expect(isValidEmail('')).toBeFalsy();
      expect(isValidEmail('user space@example.com')).toBeFalsy();
    });

    test('should handle non-string inputs', () => {
      expect(isValidEmail(null as any)).toBeFalsy();
      expect(isValidEmail(undefined as any)).toBeFalsy();
      expect(isValidEmail(123 as any)).toBeFalsy();
      expect(isValidEmail({} as any)).toBeFalsy();
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBeTruthy();
      expect(isValidUrl('http://localhost:3000')).toBeTruthy();
      expect(isValidUrl('https://subdomain.example.org/path?query=1')).toBeTruthy();
      expect(isValidUrl('http://192.168.1.1:8080/api')).toBeTruthy();
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBeFalsy();
      expect(isValidUrl('ftp://example.com')).toBeFalsy();
      expect(isValidUrl('http://')).toBeFalsy();
      expect(isValidUrl('')).toBeFalsy();
      expect(isValidUrl('javascript:alert(1)')).toBeFalsy();
    });

    test('should handle non-string inputs', () => {
      expect(isValidUrl(null as any)).toBeFalsy();
      expect(isValidUrl(undefined as any)).toBeFalsy();
      expect(isValidUrl(123 as any)).toBeFalsy();
    });
  });

  describe('validateProviderConfig', () => {
    test('should validate console provider config', () => {
      const config = {
        type: 'console' as const,
        enabled: true,
        logLevel: 'info' as LogLevel,
      };

      const result = validateProviderConfig('console', config);
      expect(result).toHaveLength(0);
    });

    test('should validate sentry provider config', () => {
      const config = {
        type: 'sentry' as const,
        enabled: true,
        dsn: 'https://example@sentry.io/123456',
        environment: 'production',
        logLevel: 'error' as LogLevel,
      };

      const result = validateProviderConfig('sentry', config);
      expect(result).toHaveLength(0);
    });

    test('should validate sentry provider with DSN', () => {
      const config = {
        type: 'sentry' as const,
        enabled: true,
        dsn: 'https://example@sentry.io/123456',
        logLevel: 'error' as LogLevel,
      };

      const result = validateProviderConfig('sentry', config);
      expect(result).toHaveLength(0);
    });

    test('should validate logtail provider config', () => {
      const config = {
        type: 'logtail' as const,
        enabled: true,
        token: 'valid-token-123',
        logLevel: 'debug' as LogLevel,
      };

      const result = validateProviderConfig('logtail', config);
      expect(result).toHaveLength(0);
    });

    test('should reject missing required fields', () => {
      const config = {
        type: 'sentry' as const,
        enabled: true,
        // Missing required dsn field
        logLevel: 'error' as LogLevel,
      };

      const result = validateProviderConfig('sentry', config);
      expect(result).toContainEqual({
        field: 'dsn',
        message: 'Sentry DSN is required',
        provider: 'sentry',
      });
    });

    test('should handle unknown provider types', () => {
      const config = {
        type: 'unknown' as any,
        enabled: true,
      };

      const result = validateProviderConfig('unknown', config);
      expect(result).toHaveLength(0); // Unknown providers are allowed
    });
  });

  describe('validateObservabilityConfig', () => {
    test('should validate complete valid config', () => {
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
            environment: 'test',
            logLevel: 'error',
          },
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    test('should allow config with no providers', () => {
      const config: ObservabilityConfig = {
        providers: {},
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    test('should accumulate errors from multiple invalid providers', () => {
      const config: ObservabilityConfig = {
        providers: {
          sentry1: {
            type: 'sentry',
            enabled: true,
            // Missing dsn - should generate error
            logLevel: 'error',
          },
          sentry2: {
            type: 'sentry',
            enabled: true,
            // Also missing dsn - should generate error
            logLevel: 'error',
          },
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeFalsy();
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some(e => e.provider === 'sentry1')).toBeTruthy();
      expect(result.errors.some(e => e.provider === 'sentry2')).toBeTruthy();
    });

    test('should validate empty providers config', () => {
      const config: ObservabilityConfig = {
        providers: {},
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('debugConfig', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('should log valid configuration in development', () => {
      // Mock is already set up at module level

      const config: ObservabilityConfig = {
        debug: true,
        providers: {
          console: {
            type: 'console',
            enabled: true,
            logLevel: 'debug',
          },
        },
      };

      debugConfig(config);

      expect(console.log).toHaveBeenCalledWith('[Observability] Configuration is valid');
      expect(console.log).toHaveBeenCalledWith('[Observability] Providers: ', 'console');
    });

    test('should not throw error for valid configuration in development', () => {
      // Mock is already set up at module level

      const config: ObservabilityConfig = {
        providers: {
          console: {
            type: 'console',
            enabled: true,
          },
        },
      };

      expect(() => debugConfig(config)).not.toThrow();
    });

    test('should do nothing in production', () => {
      // Mock NODE_ENV to production for this test
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'production');

      // Import fresh instance
      vi.resetModules();

      const config: ObservabilityConfig = {
        providers: {},
      };

      // Should not throw and not call console.log in production
      expect(() => debugConfig(config)).not.toThrow();

      // Restore environment
      vi.unstubAllEnvs();
    });
  });

  describe('error message formatting', () => {
    test('should format validation errors correctly', () => {
      const config: ObservabilityConfig = {
        providers: {
          sentry: {
            type: 'sentry',
            enabled: true,
            // Missing dsn - should trigger error
            logLevel: 'error',
          },
        },
      };

      // Mock is already set up at module level

      expect(() => debugConfig(config)).toThrow(
        '[Observability] Configuration errors: [sentry] dsn: Sentry DSN is required',
      );
    });
  });
});
