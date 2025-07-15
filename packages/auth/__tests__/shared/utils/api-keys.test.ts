/**
 * Tests for shared API key utilities
 */

import { describe, expect, it } from 'vitest';

describe('API key utilities', () => {
  describe('maskApiKey', () => {
    it('should mask a normal API key', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const apiKey = 'ak_live_1234567890abcdef1234567890abcdef';
      const masked = apiKeysModule.maskApiKey(apiKey);

      expect(masked).toBe('ak_live_****************************cdef');
      expect(masked).toContain('ak_live_');
      expect(masked).toContain('cdef');
      expect(masked).toContain('*');
    });

    it('should handle short API keys', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const shortKey = 'short';
      const masked = apiKeysModule.maskApiKey(shortKey);

      expect(masked).toBe('****');
    });

    it('should handle empty API key', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const masked = apiKeysModule.maskApiKey('');

      expect(masked).toBe('****');
    });

    it('should handle API key with exactly 12 characters', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const key12 = '123456789012';
      const masked = apiKeysModule.maskApiKey(key12);

      expect(masked).toBe('123456789012');
      expect(masked.length).toBe(12);
    });

    it('should handle API key with 13 characters', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const key13 = '1234567890123';
      const masked = apiKeysModule.maskApiKey(key13);

      expect(masked).toBe('12345678*0123');
      expect(masked.length).toBe(13);
    });

    it('should handle very long API key', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const longKey = 'ak_live_' + 'a'.repeat(50) + '1234';
      const masked = apiKeysModule.maskApiKey(longKey);

      expect(masked.startsWith('ak_live_')).toBe(true);
      expect(masked.endsWith('1234')).toBe(true);
      expect(masked).toContain('*');
      expect(masked.length).toBe(longKey.length);
    });

    it('should preserve original API key structure', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const apiKey = 'sk_test_1234567890abcdef';
      const masked = apiKeysModule.maskApiKey(apiKey);

      expect(masked.startsWith('sk_test_')).toBe(true);
      expect(masked.endsWith('cdef')).toBe(true);
    });
  });

  describe('generateApiKeyName', () => {
    it('should generate a valid API key name', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const name = apiKeysModule.generateApiKeyName();

      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
      expect(name).toMatch(/\w+ \w+ \d+/);
    });

    it('should generate different names on multiple calls', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const names = new Set();
      for (let i = 0; i < 50; i++) {
        names.add(apiKeysModule.generateApiKeyName());
      }

      // Should generate multiple unique names due to randomness
      expect(names.size).toBeGreaterThan(10);
    });

    it('should follow expected format', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const name = apiKeysModule.generateApiKeyName();
      const parts = name.split(' ');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^[A-Z][a-z]+$/); // Adjective
      expect(parts[1]).toMatch(/^[A-Z][a-z]+$/); // Noun
      expect(parts[2]).toMatch(/^\d+$/); // Number
    });

    it('should use predefined word lists', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const validAdjectives = ['Quick', 'Secure', 'Fast', 'Smart', 'Auto', 'Main', 'Test', 'Dev'];
      const validNouns = ['Access', 'Key', 'Token', 'Auth', 'API', 'Service', 'Client', 'App'];

      const name = apiKeysModule.generateApiKeyName();
      const parts = name.split(' ');

      expect(validAdjectives).toContain(parts[0]);
      expect(validNouns).toContain(parts[1]);
      expect(parseInt(parts[2])).toBeGreaterThanOrEqual(0);
      expect(parseInt(parts[2])).toBeLessThan(1000);
    });

    it('should generate names with different suffixes', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

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
    it('should return false for undefined expiration', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const isExpired = apiKeysModule.isApiKeyExpired(undefined);

      expect(isExpired).toBe(false);
    });

    it('should return false for future expiration date', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const isExpired = apiKeysModule.isApiKeyExpired(futureDate);

      expect(isExpired).toBe(false);
    });

    it('should return true for past expiration date', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const isExpired = apiKeysModule.isApiKeyExpired(pastDate);

      expect(isExpired).toBe(true);
    });

    it('should return true for current time or past', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const isExpired = apiKeysModule.isApiKeyExpired(pastDate);

      expect(isExpired).toBe(true);
    });

    it('should handle very old dates', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const veryOldDate = new Date('2020-01-01');
      const isExpired = apiKeysModule.isApiKeyExpired(veryOldDate);

      expect(isExpired).toBe(true);
    });

    it('should handle far future dates', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const farFutureDate = new Date('2030-12-31');
      const isExpired = apiKeysModule.isApiKeyExpired(farFutureDate);

      expect(isExpired).toBe(false);
    });

    it('should work with Date objects vs timestamps', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const pastTimestamp = Date.now() - 1000; // 1 second ago
      const pastDate = new Date(pastTimestamp);
      const isExpired = apiKeysModule.isApiKeyExpired(pastDate);

      expect(isExpired).toBe(true);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return expired false for undefined expiration', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const result = apiKeysModule.getTimeUntilExpiration(undefined);

      expect(result).toStrictEqual({ expired: false });
    });

    it('should return expired true for past date', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = apiKeysModule.getTimeUntilExpiration(pastDate);

      expect(result.expired).toBe(true);
      expect(result.days).toBeUndefined();
    });

    it('should calculate time until expiration for future date', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const futureDate = new Date(Date.now() + 25 * 60 * 60 * 1000); // ~1 day
      const result = apiKeysModule.getTimeUntilExpiration(futureDate);

      expect(result.expired).toBe(false);
      expect(result.days).toBeDefined();
      expect(result.hours).toBeDefined();
      expect(result.minutes).toBeDefined();
    });
  });

  describe('formatPermissionsForDisplay', () => {
    it('should format permissions correctly', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const permissions = ['users:read', 'posts:write', 'admin:delete'];
      const formatted = apiKeysModule.formatPermissionsForDisplay(permissions);

      expect(formatted).toStrictEqual(['admin: delete', 'posts: write', 'users: read']);
    });

    it('should handle empty permissions array', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const formatted = apiKeysModule.formatPermissionsForDisplay([]);

      expect(formatted).toStrictEqual([]);
    });
  });

  describe('groupPermissionsByResource', () => {
    it('should group permissions by resource', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const permissions = ['users:read', 'users:write', 'posts:read', 'admin:delete'];
      const grouped = apiKeysModule.groupPermissionsByResource(permissions);

      expect(grouped).toStrictEqual({
        users: ['read', 'write'],
        posts: ['read'],
        admin: ['delete'],
      });
    });

    it('should handle empty permissions array', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const grouped = apiKeysModule.groupPermissionsByResource([]);

      expect(grouped).toStrictEqual({});
    });
  });

  describe('isValidApiKeyFormat', () => {
    it('should validate correct API key format', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const validKey = 'ak_live_1234567890abcdef1234567890abcdef';
      const isValid = apiKeysModule.isValidApiKeyFormat(validKey);

      expect(isValid).toBe(true);
    });

    it('should reject short API keys', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const shortKey = 'short';
      const isValid = apiKeysModule.isValidApiKeyFormat(shortKey);

      expect(isValid).toBe(false);
    });

    it('should reject empty or null values', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      expect(apiKeysModule.isValidApiKeyFormat('')).toBe(false);
      // @ts-expect-error - testing null input
      expect(apiKeysModule.isValidApiKeyFormat(null)).toBe(false);
      // @ts-expect-error - testing undefined input
      expect(apiKeysModule.isValidApiKeyFormat(undefined)).toBe(false);
    });

    it('should reject keys with invalid characters', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const invalidKey = 'ak_live_1234567890abcdef@#$%^&*()';
      const isValid = apiKeysModule.isValidApiKeyFormat(invalidKey);

      expect(isValid).toBe(false);
    });

    it('should accept keys with underscores and hyphens', async () => {
      const apiKeysModule = await import('@/shared/utils/api-keys');

      const validKey = 'ak_live-1234567890_abcdef-1234567890';
      const isValid = apiKeysModule.isValidApiKeyFormat(validKey);

      expect(isValid).toBe(true);
    });
  });
});
