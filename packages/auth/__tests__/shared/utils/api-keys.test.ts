/**
 * Tests for shared API key utilities
 */

import { describe, expect } from 'vitest';

describe('aPI key utilities', () => {
  describe('maskApiKey', () => {
    test('should mask a normal API key', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const apiKey = 'ak_live_1234567890abcdef1234567890abcdef';
      const masked = apiKeysModule.maskApiKey(apiKey);

      expect(masked).toBe('ak_live_****************************cdef');
      expect(masked).toContain('ak_live_');
      expect(masked).toContain('cdef');
      expect(masked).toContain('*');
    });

    test('should handle short API keys', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const shortKey = 'short';
      const masked = apiKeysModule.maskApiKey(shortKey);

      expect(masked).toBe('****');
    });

    test('should handle empty API key', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const masked = apiKeysModule.maskApiKey('');

      expect(masked).toBe('****');
    });

    test('should handle API key with exactly 12 characters', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const key12 = '123456789012';
      const masked = apiKeysModule.maskApiKey(key12);

      expect(masked).toBe('123456789012');
      expect(masked).toHaveLength(12);
    });

    test('should handle API key with 13 characters', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const key13 = '1234567890123';
      const masked = apiKeysModule.maskApiKey(key13);

      expect(masked).toBe('12345678*0123');
      expect(masked).toHaveLength(13);
    });

    test('should handle very long API key', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const longKey = 'ak_live_' + 'a'.repeat(50) + '1234';
      const masked = apiKeysModule.maskApiKey(longKey);

      expect(masked.startsWith('ak_live_')).toBeTruthy();
      expect(masked.endsWith('1234')).toBeTruthy();
      expect(masked).toContain('*');
      expect(masked).toHaveLength(longKey.length);
    });

    test('should preserve original API key structure', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const apiKey = 'sk_test_1234567890abcdef';
      const masked = apiKeysModule.maskApiKey(apiKey);

      expect(masked.startsWith('sk_test_')).toBeTruthy();
      expect(masked.endsWith('cdef')).toBeTruthy();
    });
  });

  describe('generateApiKeyName', () => {
    test('should generate a valid API key name', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const name = apiKeysModule.generateApiKeyName();

      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
      expect(name).toMatch(/\w+ \w+ \d+/);
    });

    test('should generate different names on multiple calls', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const names = new Set();
      for (let i = 0; i < 50; i++) {
        names.add(apiKeysModule.generateApiKeyName());
      }

      // Should generate multiple unique names due to randomness
      expect(names.size).toBeGreaterThan(10);
    });

    test('should follow expected format', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const name = apiKeysModule.generateApiKeyName();
      const parts = name.split(' ');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^[A-Z][a-z]+$/); // Adjective
      expect(parts[1]).toMatch(/^[A-Z][a-z]+$/); // Noun
      expect(parts[2]).toMatch(/^\d+$/); // Number
    });

    test('should use predefined word lists', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const validAdjectives = ['Quick', 'Secure', 'Fast', 'Smart', 'Auto', 'Main', 'Test', 'Dev'];
      const validNouns = ['Access', 'Key', 'Token', 'Auth', 'API', 'Service', 'Client', 'App'];

      const name = apiKeysModule.generateApiKeyName();
      const parts = name.split(' ');

      expect(validAdjectives).toContain(parts[0]);
      expect(validNouns).toContain(parts[1]);
      expect(parseInt(parts[2])).toBeGreaterThanOrEqual(0);
      expect(parseInt(parts[2])).toBeLessThan(1000);
    });

    test('should generate names with different suffixes', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const suffixes = new Set();
      for (let i = 0; i < 20; i++) {
        const name = apiKeysModule.generateApiKeyName();
        const suffix = name.split(' ')[2];
        suffixes.add(suffix);
      }

      // Should have some variety in suffixes
      expect(suffixes.size).toBeGreaterThan(1);
    });
  });

  describe('isApiKeyExpired', () => {
    test('should return false for undefined expiration', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const isExpired = apiKeysModule.isApiKeyExpired(undefined);

      expect(isExpired).toBeFalsy();
    });

    test('should return false for future expiration date', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const isExpired = apiKeysModule.isApiKeyExpired(futureDate);

      expect(isExpired).toBeFalsy();
    });

    test('should return true for past expiration date', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const isExpired = apiKeysModule.isApiKeyExpired(pastDate);

      expect(isExpired).toBeTruthy();
    });

    test('should return true for current time or past', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const isExpired = apiKeysModule.isApiKeyExpired(pastDate);

      expect(isExpired).toBeTruthy();
    });

    test('should handle very old dates', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const veryOldDate = new Date('2020-01-01');
      const isExpired = apiKeysModule.isApiKeyExpired(veryOldDate);

      expect(isExpired).toBeTruthy();
    });

    test('should handle far future dates', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const farFutureDate = new Date('2030-12-31');
      const isExpired = apiKeysModule.isApiKeyExpired(farFutureDate);

      expect(isExpired).toBeFalsy();
    });

    test('should work with Date objects vs timestamps', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const pastTimestamp = Date.now() - 1000; // 1 second ago
      const pastDate = new Date(pastTimestamp);
      const isExpired = apiKeysModule.isApiKeyExpired(pastDate);

      expect(isExpired).toBeTruthy();
    });
  });

  describe('getTimeUntilExpiration', () => {
    test('should return expired false for undefined expiration', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const result = apiKeysModule.getTimeUntilExpiration(undefined);

      expect(result).toStrictEqual({ expired: false });
    });

    test('should return expired true for past date', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = apiKeysModule.getTimeUntilExpiration(pastDate);

      expect(result.expired).toBeTruthy();
      expect(result.days).toBeUndefined();
    });

    test('should calculate time until expiration for future date', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const futureDate = new Date(Date.now() + 25 * 60 * 60 * 1000); // ~1 day
      const result = apiKeysModule.getTimeUntilExpiration(futureDate);

      expect(result.expired).toBeFalsy();
      expect(result.days).toBeDefined();
      expect(result.hours).toBeDefined();
      expect(result.minutes).toBeDefined();
    });
  });

  describe('formatPermissionsForDisplay', () => {
    test('should format permissions correctly', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const permissions = ['users:read', 'posts:write', 'admin:delete'];
      const formatted = apiKeysModule.formatPermissionsForDisplay(permissions);

      expect(formatted).toStrictEqual(['admin: delete', 'posts: write', 'users: read']);
    });

    test('should handle empty permissions array', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const formatted = apiKeysModule.formatPermissionsForDisplay([]);

      expect(formatted).toStrictEqual([]);
    });
  });

  describe('groupPermissionsByResource', () => {
    test('should group permissions by resource', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const permissions = ['users:read', 'users:write', 'posts:read', 'admin:delete'];
      const grouped = apiKeysModule.groupPermissionsByResource(permissions);

      expect(grouped).toStrictEqual({
        users: ['read', 'write'],
        posts: ['read'],
        admin: ['delete'],
      });
    });

    test('should handle empty permissions array', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const grouped = apiKeysModule.groupPermissionsByResource([]);

      expect(grouped).toStrictEqual({});
    });
  });

  describe('isValidApiKeyFormat', () => {
    test('should validate correct API key format', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const validKey = 'ak_live_1234567890abcdef1234567890abcdef';
      const isValid = apiKeysModule.isValidApiKeyFormat(validKey);

      expect(isValid).toBeTruthy();
    });

    test('should reject short API keys', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const shortKey = 'short';
      const isValid = apiKeysModule.isValidApiKeyFormat(shortKey);

      expect(isValid).toBeFalsy();
    });

    test('should reject empty or null values', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      expect(apiKeysModule.isValidApiKeyFormat('')).toBeFalsy();
      // @ts-expect-error - testing null input
      expect(apiKeysModule.isValidApiKeyFormat(null)).toBeFalsy();
      // @ts-expect-error - testing undefined input
      expect(apiKeysModule.isValidApiKeyFormat(undefined)).toBeFalsy();
    });

    test('should reject keys with invalid characters', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const invalidKey = 'ak_live_1234567890abcdef@#$%^&*()';
      const isValid = apiKeysModule.isValidApiKeyFormat(invalidKey);

      expect(isValid).toBeFalsy();
    });

    test('should accept keys with underscores and hyphens', async () => {
      const apiKeysModule = await import('#/shared/utils/api-keys');

      const validKey = 'ak_live-1234567890_abcdef-1234567890';
      const isValid = apiKeysModule.isValidApiKeyFormat(validKey);

      expect(isValid).toBeTruthy();
    });
  });
});
