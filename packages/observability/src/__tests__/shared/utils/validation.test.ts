import { describe, expect, vi } from 'vitest';

import { LogLevel, ObservabilityConfig } from '../../../shared/types/types';
import {
  debugConfig,
  isValidEmail,
  isValidUrl,
  validateConfig,
  validateLogLevel,
  validateObservabilityConfig,
  validateProvider,
  validateProviderConfig,
} from '../../../shared/utils/validation';

describe('validation Utilities', () => {
  describe('validateObservabilityConfig', () => {
    test('should validate empty providers', () => {
      const config: ObservabilityConfig = {
        providers: {},
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    test('should validate Sentry config', () => {
      const config: ObservabilityConfig = {
        providers: {
          sentry: {
            dsn: 'https://key@sentry.io/123',
          },
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    test('should require DSN for Sentry', () => {
      const config: ObservabilityConfig = {
        providers: {
          sentry: {},
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeFalsy();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        provider: 'sentry',
        field: 'dsn',
        message: 'Sentry DSN is required',
      });
    });

    test('should require service name for OpenTelemetry', () => {
      const config: ObservabilityConfig = {
        providers: {
          opentelemetry: {},
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeFalsy();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        provider: 'opentelemetry',
        field: 'serviceName',
        message: 'Service name is required for OpenTelemetry',
      });
    });

    test('should validate console provider without required fields', () => {
      const config: ObservabilityConfig = {
        providers: {
          console: {},
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateProvider', () => {
    test('should validate provider with required methods', () => {
      const validProvider = {
        name: 'test',
        captureException: async () => {},
        captureMessage: async () => {},
        initialize: async () => {},
        log: async () => {},
      };

      expect(() => validateProvider(validProvider)).not.toThrow();
    });

    test('should throw for missing log method', () => {
      const provider = {
        name: 'test',
        captureException: async () => {},
        captureMessage: async () => {},
        initialize: async () => {},
      };

      expect(() => validateProvider(provider)).toThrow('Provider must implement log method');
    });

    test('should throw for missing captureException method', () => {
      const provider = {
        name: 'test',
        captureMessage: async () => {},
        initialize: async () => {},
        log: async () => {},
      };

      expect(() => validateProvider(provider)).toThrow(
        'Provider must implement captureException method',
      );
    });

    test('should throw for null provider', () => {
      expect(() => validateProvider(null)).toThrow('Provider cannot be null or undefined');
    });

    test('should throw for undefined provider', () => {
      expect(() => validateProvider(undefined)).toThrow('Provider cannot be null or undefined');
    });

    test('should throw for non-object provider', () => {
      expect(() => validateProvider('string' as any)).toThrow('Provider must be an object');
      expect(() => validateProvider(123 as any)).toThrow('Provider must be an object');
    });
  });

  describe('validateConfig', () => {
    test('should validate minimal config', () => {
      const config = {
        providers: [],
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    test('should validate config with all options', () => {
      const config = {
        providers: [],
        defaultLogLevel: 'info' as LogLevel,
        enableConsoleInDev: true,
        enabledEnvironments: ['production', 'staging'],
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    test('should throw for invalid default log level', () => {
      const config = {
        providers: [],
        defaultLogLevel: 'invalid',
      } as any;

      expect(() => validateConfig(config)).toThrow('Invalid log level');
    });

    test('should throw for non-array providers', () => {
      const config = {
        providers: 'not an array',
      } as any;

      expect(() => validateConfig(config)).toThrow('Providers must be an array');
    });

    test('should throw for non-boolean enableConsoleInDev', () => {
      const config = {
        providers: [],
        enableConsoleInDev: 'true',
      } as any;

      expect(() => validateConfig(config)).toThrow('enableConsoleInDev must be a boolean');
    });

    test('should throw for non-array enabledEnvironments', () => {
      const config = {
        providers: [],
        enabledEnvironments: 'production',
      } as any;

      expect(() => validateConfig(config)).toThrow('enabledEnvironments must be an array');
    });

    test('should throw for non-string environments', () => {
      const config = {
        providers: [],
        enabledEnvironments: ['production', 123],
      } as any;

      expect(() => validateConfig(config)).toThrow('All environments must be strings');
    });

    test('should throw for missing config', () => {
      expect(() => validateConfig(null)).toThrow('Configuration is required');
      expect(() => validateConfig(undefined)).toThrow('Configuration is required');
    });
  });

  describe('validateLogLevel', () => {
    test('should validate all valid levels', () => {
      const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      for (const level of validLevels) {
        expect(() => validateLogLevel(level)).not.toThrow();
      }
    });

    test('should throw for invalid level', () => {
      expect(() => validateLogLevel('invalid' as any)).toThrow('Invalid log level: invalid');
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBeTruthy();
      expect(isValidEmail('user.name@domain.co.uk')).toBeTruthy();
      expect(isValidEmail('user+tag@example.org')).toBeTruthy();
      expect(isValidEmail('123@456.com')).toBeTruthy();
    });

    test('should reject invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBeFalsy();
      expect(isValidEmail('@example.com')).toBeFalsy();
      expect(isValidEmail('user@')).toBeFalsy();
      expect(isValidEmail('user@.com')).toBeFalsy();
      expect(isValidEmail('user@domain')).toBeFalsy();
      expect(isValidEmail('user @example.com')).toBeFalsy();
      expect(isValidEmail('user@example .com')).toBeFalsy();
      expect(isValidEmail('.user@example.com')).toBeFalsy();
      expect(isValidEmail('user.@example.com')).toBeFalsy();
      expect(isValidEmail('user@.example.com')).toBeFalsy();
      expect(isValidEmail('user@example.com.')).toBeFalsy();
    });

    test('should reject non-string inputs', () => {
      expect(isValidEmail(null as any)).toBeFalsy();
      expect(isValidEmail(undefined as any)).toBeFalsy();
      expect(isValidEmail(123 as any)).toBeFalsy();
      expect(isValidEmail({} as any)).toBeFalsy();
    });
  });

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('http://example.com')).toBeTruthy();
      expect(isValidUrl('https://example.com')).toBeTruthy();
      expect(isValidUrl('https://subdomain.example.com')).toBeTruthy();
      expect(isValidUrl('https://example.com/path')).toBeTruthy();
      expect(isValidUrl('https://example.com/path?query=value')).toBeTruthy();
      expect(isValidUrl('https://example.com:8080')).toBeTruthy();
      expect(isValidUrl('https://user:pass@example.com')).toBeTruthy();
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBeFalsy();
      expect(isValidUrl('ftp://example.com')).toBeFalsy(); // Only HTTP/HTTPS allowed
      expect(isValidUrl('javascript:alert(1)')).toBeFalsy();
      expect(isValidUrl('//example.com')).toBeFalsy();
      expect(isValidUrl('example.com')).toBeFalsy();
    });

    test('should reject non-string inputs', () => {
      expect(isValidUrl(null as any)).toBeFalsy();
      expect(isValidUrl(undefined as any)).toBeFalsy();
      expect(isValidUrl(123 as any)).toBeFalsy();
      expect(isValidUrl({} as any)).toBeFalsy();
    });
  });

  describe('validateProviderConfig', () => {
    test('should validate unknown providers', () => {
      const errors = validateProviderConfig('custom', { apiKey: 'test' });
      expect(errors).toHaveLength(0);
    });

    test('should validate pino provider', () => {
      const errors = validateProviderConfig('pino', {});
      expect(errors).toHaveLength(0);
    });

    test('should validate winston provider', () => {
      const errors = validateProviderConfig('winston', {});
      expect(errors).toHaveLength(0);
    });
  });

  describe('debugConfig', () => {
    test('should log valid config', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const config: ObservabilityConfig = {
        providers: {
          console: {},
          sentry: { dsn: 'https://test@sentry.io/123' },
        },
      };

      debugConfig(config);

      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Configuration is valid');
      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Providers: ', 'console, sentry');

      consoleSpy.mockRestore();
    });

    test('should log config errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const config: ObservabilityConfig = {
        providers: {
          sentry: {}, // Missing DSN
        },
      };

      debugConfig(config);

      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Configuration errors:');
      expect(consoleSpy).toHaveBeenCalledWith('  [sentry] dsn: Sentry DSN is required');

      consoleSpy.mockRestore();
    });
  });
});
