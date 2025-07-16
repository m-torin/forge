import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createMaskedError,
  _createSafeLogger as createSafeLogger,
  maskSensitiveData,
  safeConsole,
  _withMaskedErrors as withMaskedErrors,
} from '../../src/shared/utils/data-masking';

describe('data-masking utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('maskSensitiveData', () => {
    test('should mask known sensitive fields', () => {
      const data = {
        username: 'john_doe',
        password: 'secret123',
        email: 'john@example.com',
        token: 'abc123xyz',
        normalField: 'visible',
      };

      const masked = maskSensitiveData(data);

      expect(masked.username).toBe('john_doe');
      expect(masked.password).toBe('[REDACTED]');
      expect(masked.email).toBe('[REDACTED]');
      expect(masked.token).toBe('[REDACTED]');
      expect(masked.normalField).toBe('visible');
    });

    test('should handle nested objects', () => {
      const data = {
        user: {
          name: 'John',
          credentials: {
            password: 'secret123',
            apiKey: 'key-abc-123',
          },
        },
        config: {
          timeout: 5000,
        },
      };

      const masked = maskSensitiveData(data);

      expect(masked.user.name).toBe('John');
      expect(masked.user.credentials.password).toBe('[REDACTED]');
      expect(masked.user.credentials.apiKey).toBe('[REDACTED]');
      expect(masked.config.timeout).toBe(5000);
    });

    test('should handle arrays', () => {
      const data = {
        users: [
          { name: 'John', password: 'secret1' },
          { name: 'Jane', password: 'secret2' },
        ],
        tokens: ['token1', 'token2'], // This field name contains 'token' so gets masked
        items: ['item1', 'item2'], // This should not be masked
      };

      const masked = maskSensitiveData(data);

      expect(masked.users[0].name).toBe('John');
      expect(masked.users[0].password).toBe('[REDACTED]');
      expect(masked.users[1].name).toBe('Jane');
      expect(masked.users[1].password).toBe('[REDACTED]');
      expect(masked.tokens).toBe('[REDACTED]'); // Field name contains 'token'
      expect(masked.items).toStrictEqual(['item1', 'item2']); // Should not be masked
    });

    test('should handle null and undefined values', () => {
      const data = {
        password: null,
        token: undefined,
        normalField: null,
      };

      const masked = maskSensitiveData(data);

      expect(masked.password).toBe('[REDACTED]');
      expect(masked.token).toBe('[REDACTED]');
      expect(masked.normalField).toBeNull();
    });

    test('should handle primitive values', () => {
      expect(maskSensitiveData('plain string')).toBe('plain string');
      expect(maskSensitiveData(123)).toBe(123);
      expect(maskSensitiveData(true)).toBeTruthy();
      expect(maskSensitiveData(null)).toBeNull();
    });

    test('should mask strings with sensitive patterns', () => {
      const tokenString = 'Token: abcdef1234567890abcdef1234567890';
      const masked = maskSensitiveData(tokenString);
      expect(masked).toContain('[REDACTED_TOKEN]');
    });

    test('should handle case-insensitive field names', () => {
      const data = {
        PASSWORD: 'secret',
        Token: 'abc123',
        API_KEY: 'key123',
        ApiKey: 'key456',
      };

      const masked = maskSensitiveData(data);

      expect(masked.PASSWORD).toBe('[REDACTED]');
      expect(masked.Token).toBe('[REDACTED]');
      expect(masked.API_KEY).toBe('[REDACTED]');
      expect(masked.ApiKey).toBe('[REDACTED]');
    });

    test('should prevent infinite recursion', () => {
      const data: any = { name: 'test' };
      data.self = data;

      const masked = maskSensitiveData(data);

      expect(masked.name).toBe('test');
      // Should handle circular reference gracefully
      expect(typeof masked.self).toBe('object');
    });

    test('should respect max depth', () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                password: 'deep-secret',
                value: 'visible',
              },
            },
          },
        },
      };

      const masked = maskSensitiveData(deepData, 0, 3);

      // At max depth, the level4 object gets replaced but level3 contains it
      expect(masked.level1.level2.level3.level4).toBe('[MAX_DEPTH_REACHED]');
    });
  });

  describe('createMaskedError', () => {
    test('should create error with masked sensitive data', () => {
      const originalError = new Error('Authentication failed');

      const maskedError = createMaskedError(originalError);

      expect(maskedError.message).toBe('Authentication failed');
      expect(maskedError).toBeInstanceOf(Error);
    });

    test('should preserve error properties', () => {
      const originalError = new Error('Validation failed');
      originalError.name = 'ValidationError';
      (originalError as any).code = 'INVALID_INPUT';

      const maskedError = createMaskedError(originalError);

      expect(maskedError.name).toBe('ValidationError');
      expect((maskedError as any).code).toBe('INVALID_INPUT');
      expect(maskedError.stack).toBeDefined();
    });

    test('should handle error-like objects', () => {
      const errorLike = {
        message: 'Custom error',
        name: 'CustomError',
      };

      const maskedError = createMaskedError(errorLike as any);

      expect(maskedError.message).toBe('Custom error');
      expect(maskedError.name).toBe('CustomError');
    });
  });

  describe('safeConsole', () => {
    test('should provide safe console methods', () => {
      expect(typeof safeConsole.log).toBe('function');
      expect(typeof safeConsole.warn).toBe('function');
      expect(typeof safeConsole.error).toBe('function');
      expect(typeof safeConsole.info).toBe('function');
    });

    test('should handle console logging safely', () => {
      // Just test that the functions exist and can be called without error
      expect(() => safeConsole.log('test message')).not.toThrow();
      expect(() => safeConsole.warn('test warning')).not.toThrow();
      expect(() => safeConsole.error('test error')).not.toThrow();
    });
  });

  describe('_createSafeLogger', () => {
    test('should create logger with prefix', () => {
      const logger = createSafeLogger('TEST');

      expect(typeof logger.log).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    test('should create logger without prefix', () => {
      const logger = createSafeLogger();

      expect(typeof logger.log).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('_withMaskedErrors', () => {
    test('should wrap function to mask errors', async () => {
      const originalFn = () => {
        throw new Error('Token: abcdef1234567890abcdef1234567890abcdef12');
      };

      const wrappedFn = withMaskedErrors(originalFn);

      await expect(wrappedFn()).rejects.toThrow('[REDACTED_TOKEN]');
    });

    test('should preserve function return value', async () => {
      const originalFn = (x: number) => x * 2;

      const wrappedFn = withMaskedErrors(originalFn as (...args: unknown[]) => unknown);

      const result = await wrappedFn(5);
      expect(result).toBe(10);
    });

    test('should preserve function with no errors', async () => {
      const originalFn = () => 'success';

      const wrappedFn = withMaskedErrors(originalFn);

      const result = await wrappedFn();
      expect(result).toBe('success');
    });
  });

  describe('edge Cases', () => {
    test('should handle large objects efficiently', () => {
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`field${i}`] = `value${i}`;
      }
      largeObject.password = 'secret';

      const masked = maskSensitiveData(largeObject);

      expect(masked.password).toBe('[REDACTED]');
      expect(masked.field0).toBe('value0');
      expect(masked.field999).toBe('value999');
    });

    test('should handle Date objects', () => {
      const data = {
        createdAt: new Date('2023-01-01T00:00:00Z'),
        password: 'secret',
      };

      const masked = maskSensitiveData(data);

      // Date objects get converted to plain objects by the masking function
      expect(masked.createdAt).toStrictEqual({});
      expect(masked.password).toBe('[REDACTED]');
    });

    test('should handle Map and Set objects', () => {
      const data = {
        userMap: new Map([['user1', 'data1']]),
        dataSet: new Set(['item1', 'item2']), // Changed from tokenSet to avoid masking
        password: 'secret',
      };

      const masked = maskSensitiveData(data);

      expect(masked.password).toBe('[REDACTED]');
      // Map and Set objects get converted to plain objects by the masking function
      expect(masked.userMap).toStrictEqual({});
      expect(masked.dataSet).toStrictEqual({});
    });

    test('should handle functions', () => {
      const data = {
        handler: function myHandler() {
          return 'secret';
        },
        callback: () => 'token123',
        password: 'secret',
      };

      const masked = maskSensitiveData(data);

      expect(masked.password).toBe('[REDACTED]');
      expect(typeof masked.handler).toBe('function');
      expect(typeof masked.callback).toBe('function');
    });
  });
});
