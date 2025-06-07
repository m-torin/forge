import { describe, expect, it } from 'vitest';

import {
  isValidEmail,
  isValidUrl,
  validateConfig,
  validateLogLevel,
  validateProvider,
} from '../../../shared/utils/validation';

import type {
  LogLevel,
  ObservabilityConfig,
  ObservabilityProvider,
} from '../../../shared/types/types';

describe('Validation Utilities', () => {
  describe('validateLogLevel', () => {
    it('should validate correct log levels', () => {
      const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

      validLevels.forEach((level) => {
        expect(() => validateLogLevel(level)).not.toThrow();
      });
    });

    it('should throw for invalid log levels', () => {
      const invalidLevels = ['trace', 'fatal', 'verbose', 'warning', ''];

      invalidLevels.forEach((level) => {
        expect(() => validateLogLevel(level as LogLevel)).toThrow('Invalid log level');
      });
    });

    it('should throw for non-string values', () => {
      expect(() => validateLogLevel(null as any)).toThrow();
      expect(() => validateLogLevel(undefined as any)).toThrow();
      expect(() => validateLogLevel(123 as any)).toThrow();
      expect(() => validateLogLevel({} as any)).toThrow();
    });
  });

  describe('validateProvider', () => {
    it('should validate provider with required methods', () => {
      const validProvider: ObservabilityProvider = {
        identify: async () => {},
        captureException: async () => {},
        flush: async () => {},
        isEnabled: () => true,
        log: async () => {},
        setContext: async () => {},
      };

      expect(() => validateProvider(validProvider)).not.toThrow();
    });

    it('should throw for missing log method', () => {
      const provider = {
        identify: async () => {},
        captureException: async () => {},
        flush: async () => {},
        isEnabled: () => true,
        setContext: async () => {},
      } as any;

      expect(() => validateProvider(provider)).toThrow('Provider must implement log method');
    });

    it('should throw for missing captureException method', () => {
      const provider = {
        identify: async () => {},
        flush: async () => {},
        isEnabled: () => true,
        log: async () => {},
        setContext: async () => {},
      } as any;

      expect(() => validateProvider(provider)).toThrow(
        'Provider must implement captureException method',
      );
    });

    it('should throw for non-function methods', () => {
      const provider = {
        identify: async () => {},
        captureException: async () => {},
        flush: async () => {},
        isEnabled: () => true,
        log: 'not a function',
        setContext: async () => {},
      } as any;

      expect(() => validateProvider(provider)).toThrow('Provider must implement log method');
    });

    it('should throw for null or undefined provider', () => {
      expect(() => validateProvider(null as any)).toThrow('Provider cannot be null or undefined');
      expect(() => validateProvider(undefined as any)).toThrow(
        'Provider cannot be null or undefined',
      );
    });

    it('should throw for non-object provider', () => {
      expect(() => validateProvider('string' as any)).toThrow('Provider must be an object');
      expect(() => validateProvider(123 as any)).toThrow('Provider must be an object');
    });
  });

  describe('validateConfig', () => {
    it('should validate minimal config', () => {
      const config: ObservabilityConfig = {
        providers: [],
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate config with all options', () => {
      const config: ObservabilityConfig = {
        providers: [],
        defaultLogLevel: 'info',
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

    it('should throw for non-string environment values', () => {
      const config = {
        providers: [],
        enabledEnvironments: ['production', 123, 'staging'],
      } as any;

      expect(() => validateConfig(config)).toThrow('All environments must be strings');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://sub.domain.com/path',
        'https://example.com:8080/path?query=value',
        'https://192.168.1.1',
        'http://example.com/#hash',
      ];

      validUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not a url',
        'ftp://example.com',
        'example.com',
        '//example.com',
        'http://',
        'https://',
        '',
        'javascript:alert(1)',
      ];

      invalidUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(false);
      });
    });

    it('should handle non-string values', () => {
      expect(isValidUrl(null as any)).toBe(false);
      expect(isValidUrl(undefined as any)).toBe(false);
      expect(isValidUrl(123 as any)).toBe(false);
      expect(isValidUrl({} as any)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.co.uk',
        'test123@sub.domain.com',
        'a@b.c',
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@@example.com',
        'user@example',
        'user @example.com',
        'user@exam ple.com',
        '',
        'user@.com',
        '.user@example.com',
        'user.@example.com',
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should handle non-string values', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail({} as any)).toBe(false);
    });
  });
});
