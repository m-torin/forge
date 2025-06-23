/**
 * Configuration tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAuthConfig } from '../../src/shared/config';

describe('Auth Configuration', () => {
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
    it('should create default configuration with minimal environment', () => {
      // Set minimal required environment
      (process.env as any).NODE_ENV = 'development';
      delete process.env.BETTER_AUTH_SECRET;
      delete process.env.DATABASE_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;

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

    it('should include GitHub provider when credentials are provided', () => {
      process.env.GITHUB_CLIENT_ID = 'github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'github-client-secret';

      const config = createAuthConfig();

      expect(config.providers).toHaveProperty('github');
      expect(config.providers.github).toEqual({
        clientId: 'github-client-id',
        clientSecret: 'github-client-secret',
      });
    });

    it('should include Google provider when credentials are provided', () => {
      process.env.GOOGLE_CLIENT_ID = 'google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';

      const config = createAuthConfig();

      expect(config.providers).toHaveProperty('google');
      expect(config.providers.google).toEqual({
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
      });
    });

    it('should include both providers when both sets of credentials are provided', () => {
      process.env.GITHUB_CLIENT_ID = 'github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'github-client-secret';
      process.env.GOOGLE_CLIENT_ID = 'google-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';

      const config = createAuthConfig();

      expect(config.providers).toHaveProperty('github');
      expect(config.providers).toHaveProperty('google');
    });

    it('should use custom URLs when provided', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
      process.env.DATABASE_URL = 'postgresql://custom-host:5432/custom-db';
      process.env.BETTER_AUTH_SECRET = 'custom-secret';

      const config = createAuthConfig();

      expect(config.appUrl).toBe('https://example.com');
      expect(config.databaseUrl).toBe('postgresql://custom-host:5432/custom-db');
      expect(config.secret).toBe('custom-secret');
    });

    it('should not include providers when only partial credentials are provided', () => {
      process.env.GITHUB_CLIENT_ID = 'github-client-id';
      // Missing GITHUB_CLIENT_SECRET
      process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
      // Missing GOOGLE_CLIENT_ID

      const config = createAuthConfig();

      expect(config.providers).not.toHaveProperty('github');
      expect(config.providers).not.toHaveProperty('google');
    });

    it('should handle production environment requirements', () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.BETTER_AUTH_SECRET = 'production-secret';
      process.env.DATABASE_URL = 'postgresql://prod-host:5432/prod-db';
      process.env.NEXT_PUBLIC_APP_URL = 'https://production.com';

      const config = createAuthConfig();

      expect(config.secret).toBe('production-secret');
      expect(config.databaseUrl).toBe('postgresql://prod-host:5432/prod-db');
      expect(config.appUrl).toBe('https://production.com');
    });
  });

  describe('Configuration validation', () => {
    it('should have all required feature flags', () => {
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

      requiredFeatures.forEach((feature) => {
        expect(config.features).toHaveProperty(feature);
        expect(typeof config.features[feature as keyof typeof config.features]).toBe('boolean');
      });
    });

    it('should have valid middleware configuration', () => {
      const config = createAuthConfig();

      expect(config.middleware?.redirectTo).toBe('/sign-in');
      expect(Array.isArray(config.middleware?.publicPaths)).toBe(true);
      expect(config.middleware?.publicPaths).toContain('/sign-in');
      expect(config.middleware?.publicPaths).toContain('/sign-up');
    });

    it('should have valid API keys configuration', () => {
      const config = createAuthConfig();

      expect(config.apiKeys?.enableServiceAuth).toBe(true);
      expect(Array.isArray(config.apiKeys?.defaultPermissions)).toBe(true);
      expect(config.apiKeys?.expirationDays).toBe(90);
      expect(config.apiKeys?.rateLimiting?.enabled).toBe(true);
      expect(config.apiKeys?.rateLimiting?.requestsPerMinute).toBe(100);
    });

    it('should have valid teams configuration', () => {
      const config = createAuthConfig();

      expect(config.teams?.enableInvitations).toBe(true);
      expect(Array.isArray(config.teams?.defaultPermissions)).toBe(true);
      expect(config.teams?.maxTeamsPerOrganization).toBe(10);
    });
  });
});
