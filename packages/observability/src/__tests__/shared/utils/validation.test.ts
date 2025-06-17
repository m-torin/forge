import { describe, expect, it, vi } from 'vitest';

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

describe('Validation Utilities', () => {
  describe('validateObservabilityConfig', () => {
    it('should validate empty providers', () => {
      const config: ObservabilityConfig = {
        providers: {},
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Sentry config', () => {
      const config: ObservabilityConfig = {
        providers: {
          sentry: {
            dsn: 'https://key@sentry.io/123',
          },
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require DSN for Sentry', () => {
      const config: ObservabilityConfig = {
        providers: {
          sentry: {},
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        provider: 'sentry',
        field: 'dsn',
        message: 'Sentry DSN is required',
      });
    });

    it('should require service name for OpenTelemetry', () => {
      const config: ObservabilityConfig = {
        providers: {
          opentelemetry: {},
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        provider: 'opentelemetry',
        field: 'serviceName',
        message: 'Service name is required for OpenTelemetry',
      });
    });

    it('should validate console provider without required fields', () => {
      const config: ObservabilityConfig = {
        providers: {
          console: {},
        },
      };

      const result = validateObservabilityConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateProvider', () => {
    it('should validate provider with required methods', () => {
      const validProvider = {
        name: 'test',
        captureException: async () => {},
        captureMessage: async () => {},
        initialize: async () => {},
        log: async () => {},
      };

      expect(() => validateProvider(validProvider)).not.toThrow();
    });

    it('should throw for missing log method', () => {
      const provider = {
        name: 'test',
        captureException: async () => {},
        captureMessage: async () => {},
        initialize: async () => {},
      };

      expect(() => validateProvider(provider)).toThrow('Provider must implement log method');
    });

    it('should throw for missing captureException method', () => {
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

    it('should throw for null provider', () => {
      expect(() => validateProvider(null)).toThrow('Provider cannot be null or undefined');
    });

    it('should throw for undefined provider', () => {
      expect(() => validateProvider(undefined)).toThrow('Provider cannot be null or undefined');
    });

    it('should throw for non-object provider', () => {
      expect(() => validateProvider('string' as any)).toThrow('Provider must be an object');
      expect(() => validateProvider(123 as any)).toThrow('Provider must be an object');
    });
  });

  describe('validateConfig', () => {
    it('should validate minimal config', () => {
      const config = {
        providers: [],
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate config with all options', () => {
      const config = {
        providers: [],
        defaultLogLevel: 'info' as LogLevel,
        enableConsoleInDev: true,
        enabledEnvironments: ['production', 'staging'],
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw for invalid default log level', () => {
      const config = {
        providers: [],
        defaultLogLevel: 'invalid',
      } as any;

      expect(() => validateConfig(config)).toThrow('Invalid log level');
    });

    it('should throw for non-array providers', () => {
      const config = {
        providers: 'not an array',
      } as any;

      expect(() => validateConfig(config)).toThrow('Providers must be an array');
    });

    it('should throw for non-boolean enableConsoleInDev', () => {
      const config = {
        providers: [],
        enableConsoleInDev: 'true',
      } as any;

      expect(() => validateConfig(config)).toThrow('enableConsoleInDev must be a boolean');
    });

    it('should throw for non-array enabledEnvironments', () => {
      const config = {
        providers: [],
        enabledEnvironments: 'production',
      } as any;

      expect(() => validateConfig(config)).toThrow('enabledEnvironments must be an array');
    });

    it('should throw for non-string environments', () => {
      const config = {
        providers: [],
        enabledEnvironments: ['production', 123],
      } as any;

      expect(() => validateConfig(config)).toThrow('All environments must be strings');
    });

    it('should throw for missing config', () => {
      expect(() => validateConfig(null)).toThrow('Configuration is required');
      expect(() => validateConfig(undefined)).toThrow('Configuration is required');
    });
  });

  describe('validateLogLevel', () => {
    it('should validate all valid levels', () => {
      const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      for (const level of validLevels) {
        expect(() => validateLogLevel(level)).not.toThrow();
      }
    });

    it('should throw for invalid level', () => {
      expect(() => validateLogLevel('invalid' as any)).toThrow('Invalid log level: invalid');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      expect(isValidEmail('123@456.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@example .com')).toBe(false);
      expect(isValidEmail('.user@example.com')).toBe(false);
      expect(isValidEmail('user.@example.com')).toBe(false);
      expect(isValidEmail('user@.example.com')).toBe(false);
      expect(isValidEmail('user@example.com.')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail({} as any)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
      expect(isValidUrl('https://user:pass@example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false); // Only HTTP/HTTPS allowed
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(isValidUrl(null as any)).toBe(false);
      expect(isValidUrl(undefined as any)).toBe(false);
      expect(isValidUrl(123 as any)).toBe(false);
      expect(isValidUrl({} as any)).toBe(false);
    });
  });

  describe('validateProviderConfig', () => {
    it('should validate unknown providers', () => {
      const errors = validateProviderConfig('custom', { apiKey: 'test' });
      expect(errors).toHaveLength(0);
    });

    it('should validate pino provider', () => {
      const errors = validateProviderConfig('pino', {});
      expect(errors).toHaveLength(0);
    });

    it('should validate winston provider', () => {
      const errors = validateProviderConfig('winston', {});
      expect(errors).toHaveLength(0);
    });
  });

  describe('debugConfig', () => {
    it('should log valid config', () => {
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

    it('should log config errors', () => {
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
