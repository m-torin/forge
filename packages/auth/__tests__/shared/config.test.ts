/**
 * Configuration tests
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createAuthConfig } from '../../src/shared/config';

// Mock the env module
vi.mock('../../env', () => {
  let mockEnv = {
    BETTER_AUTH_SECRET: 'test-secret',
    AUTH_SECRET: undefined,
    DATABASE_URL: 'postgresql://localhost:5432/test',
    BETTER_AUTH_URL: undefined,
    TRUSTED_ORIGINS: 'http://localhost:3000',
    GITHUB_CLIENT_ID: '',
    GITHUB_CLIENT_SECRET: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    AUTH_FEATURES_ADMIN: 'true',
    AUTH_FEATURES_API_KEYS: 'true',
    AUTH_FEATURES_ORGANIZATIONS: 'true',
    AUTH_FEATURES_MAGIC_LINKS: 'true',
    AUTH_FEATURES_TWO_FACTOR: 'true',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
  };

  return {
    env: mockEnv,
    envError: null,
    safeEnv: () => mockEnv,
    setMockEnv: (newEnv: any) => {
      mockEnv = { ...mockEnv, ...newEnv };
    },
  };
});

// Import the mock setter
const { setMockEnv } = await import('../../env');

describe('auth Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('createAuthConfig', () => {
    test('should create default configuration with minimal environment', () => {
      // Set minimal required environment
      (process.env as any).NODE_ENV = 'development';

      // Mock the env module to return development defaults
      setMockEnv({
        BETTER_AUTH_SECRET: 'development-secret',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_APP_NAME: 'App',
        AUTH_FEATURES_ADMIN: 'true',
        AUTH_FEATURES_API_KEYS: 'true',
        AUTH_FEATURES_ORGANIZATIONS: 'true',
        AUTH_FEATURES_MAGIC_LINKS: 'true',
        AUTH_FEATURES_TWO_FACTOR: 'true',
      });

      const config = createAuthConfig();

      expect(config).toMatchObject({
        middleware: {
          enableApiMiddleware: true,
          enableNodeMiddleware: true,
          enableWebMiddleware: true,
          publicPaths: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'],
          redirectTo: '/sign-in',
          requireAuthentication: false,
        },
        apiKeys: {
          defaultPermissions: ['read'],
          enableServiceAuth: true,
          expirationDays: 90,
          rateLimiting: {
            enabled: true,
            requestsPerMinute: 100,
          },
        },
        appUrl: 'http://localhost:3000',
        databaseUrl: 'postgresql://localhost:5432/dev',
        features: {
          advancedMiddleware: true,
          admin: true,
          apiKeys: true,
          impersonation: true,
          magicLink: true,
          organizationInvitations: true,
          organizations: true,
          passkeys: true,
          serviceToService: true,
          sessionCaching: true,
          teams: true,
          twoFactor: true,
        },
        secret: 'development-secret',
        teams: {
          defaultPermissions: ['read'],
          enableInvitations: true,
          maxTeamsPerOrganization: 10,
        },
      });
    });

    test('should include GitHub provider when credentials are provided', () => {
      setMockEnv({
        BETTER_AUTH_SECRET: 'test-secret',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-client-secret',
      });

      const config = createAuthConfig();

      expect(config.providers).toHaveProperty('github');
      expect(config.providers.github).toStrictEqual({
        clientId: 'github-client-id',
        clientSecret: 'github-client-secret',
      });
    });

    test('should include Google provider when credentials are provided', () => {
      setMockEnv({
        BETTER_AUTH_SECRET: 'test-secret',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
      });

      const config = createAuthConfig();

      expect(config.providers).toHaveProperty('google');
      expect(config.providers.google).toStrictEqual({
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
      });
    });

    test('should include both providers when both sets of credentials are provided', () => {
      setMockEnv({
        BETTER_AUTH_SECRET: 'test-secret',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-client-secret',
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
      });

      const config = createAuthConfig();

      expect(config.providers).toHaveProperty('github');
      expect(config.providers).toHaveProperty('google');
    });

    test('should use custom URLs when provided', () => {
      setMockEnv({
        NEXT_PUBLIC_APP_URL: 'https://example.com',
        DATABASE_URL: 'postgresql://custom-host:5432/custom-db',
        BETTER_AUTH_SECRET: 'custom-secret',
      });

      const config = createAuthConfig();

      expect(config.appUrl).toBe('https://example.com');
      expect(config.databaseUrl).toBe('postgresql://custom-host:5432/custom-db');
      expect(config.secret).toBe('custom-secret');
    });

    test('should not include providers when only partial credentials are provided', () => {
      setMockEnv({
        BETTER_AUTH_SECRET: 'test-secret',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: '', // Missing GITHUB_CLIENT_SECRET
        GOOGLE_CLIENT_ID: '', // Missing GOOGLE_CLIENT_ID
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
      });

      const config = createAuthConfig();

      expect(config.providers).not.toHaveProperty('github');
      expect(config.providers).not.toHaveProperty('google');
    });

    test('should handle production environment requirements', () => {
      (process.env as any).NODE_ENV = 'production';
      setMockEnv({
        BETTER_AUTH_SECRET: 'production-secret',
        DATABASE_URL: 'postgresql://prod-host:5432/prod-db',
        NEXT_PUBLIC_APP_URL: 'https://production.com',
      });

      const config = createAuthConfig();

      expect(config.secret).toBe('production-secret');
      expect(config.databaseUrl).toBe('postgresql://prod-host:5432/prod-db');
      expect(config.appUrl).toBe('https://production.com');
    });
  });

  describe('configuration validation', () => {
    beforeEach(() => {
      // Set up default mock env for validation tests
      setMockEnv({
        BETTER_AUTH_SECRET: 'test-secret',
        DATABASE_URL: 'postgresql://localhost:5432/dev',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      });
    });

    test('should have all required feature flags', () => {
      const config = createAuthConfig();

      const requiredFeatures = [
        'admin',
        'apiKeys',
        'magicLink',
        'organizations',
        'passkeys',
        'twoFactor',
        'teams',
        'advancedMiddleware',
        'serviceToService',
        'impersonation',
        'organizationInvitations',
        'sessionCaching',
      ];

      requiredFeatures.forEach(feature => {
        expect(config.features).toHaveProperty(feature);
        expect(typeof config.features[feature as keyof typeof config.features]).toBe('boolean');
      });
    });

    test('should have valid middleware configuration', () => {
      const config = createAuthConfig();

      expect(config.middleware?.redirectTo).toBe('/sign-in');
      expect(Array.isArray(config.middleware?.publicPaths)).toBeTruthy();
      expect(config.middleware?.publicPaths).toContain('/sign-in');
      expect(config.middleware?.publicPaths).toContain('/sign-up');
    });

    test('should have valid API keys configuration', () => {
      const config = createAuthConfig();

      expect(config.apiKeys?.enableServiceAuth).toBeTruthy();
      expect(Array.isArray(config.apiKeys?.defaultPermissions)).toBeTruthy();
      expect(config.apiKeys?.expirationDays).toBe(90);
      expect(config.apiKeys?.rateLimiting?.enabled).toBeTruthy();
      expect(config.apiKeys?.rateLimiting?.requestsPerMinute).toBe(100);
    });

    test('should have valid teams configuration', () => {
      const config = createAuthConfig();

      expect(config.teams?.enableInvitations).toBeTruthy();
      expect(Array.isArray(config.teams?.defaultPermissions)).toBeTruthy();
      expect(config.teams?.maxTeamsPerOrganization).toBe(10);
    });
  });
});
