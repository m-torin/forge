/**
 * Integration tests for auth shared module
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock better-auth to avoid external dependencies
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(config => ({
    api: {
      signIn: { email: vi.fn() },
      signUp: { email: vi.fn() },
      signOut: vi.fn(),
    },
    handler: vi.fn(),
    $Infer: {} as any,
  })),
}));

vi.mock('better-auth/plugins/organization', () => ({
  organization: vi.fn(() => ({})),
}));

vi.mock('better-auth/plugins/two-factor', () => ({
  twoFactor: vi.fn(() => ({})),
}));

// Mock other better-auth plugins
vi.mock('better-auth/plugins/api-key', () => ({
  apiKey: vi.fn(() => ({})),
}));

vi.mock('better-auth/plugins/admin', () => ({
  admin: vi.fn(() => ({})),
}));

// Mock env functions
vi.mock('../../env', () => ({
  safeServerEnv: () => ({
    BETTER_AUTH_SECRET: 'test-secret',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    BETTER_AUTH_URL: 'http://localhost:3000',
  }),
  safeClientEnv: () => ({
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
  }),
}));

// Mock database connection
vi.mock('@repo/database/prisma/server/next', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
  });

  describe('auth factory creation', () => {
    test('should create auth factory with basic configuration', async () => {
      // Import after mocks are set up
      const { createAuthFactory } = await import('#/shared/factory');

      const factory = createAuthFactory();

      expect(factory).toBeDefined();
      expect(typeof factory).toBe('object');
    });

    test('should handle different configuration options', async () => {
      const { createAuthFactory } = await import('#/shared/factory');

      const customConfig = {
        enableAdmin: true,
        enableOrganizations: true,
        enableTwoFactor: false,
      };

      const factory = createAuthFactory(customConfig);

      expect(factory).toBeDefined();
    });
  });

  describe('auth configuration integration', () => {
    test('should integrate with config module', async () => {
      const { createAuthConfig } = await import('#/shared/config');
      const { createAuthFactory } = await import('#/shared/factory');

      const config = createAuthConfig();
      const factory = createAuthFactory({
        enableAdmin: config.features?.admin,
        enableOrganizations: config.features?.organizations,
      });

      expect(factory).toBeDefined();
      expect(config.features?.admin).toBeTruthy();
      expect(config.features?.organizations).toBeTruthy();
    });
  });

  describe('error handling', () => {
    test('should handle missing configuration gracefully', async () => {
      // Mock env to return undefined values
      vi.doMock('../../env', () => ({
        safeServerEnv: () => ({}),
        safeClientEnv: () => ({}),
      }));

      const { createAuthFactory } = await import('#/shared/factory');

      // Should not throw with missing config
      expect(() => createAuthFactory()).not.toThrow();
    });
  });

  describe('types integration', () => {
    test('should work with TypeScript types', async () => {
      const { createAuthFactory } = await import('#/shared/factory');

      const factory = createAuthFactory();

      // Test that the factory has expected structure
      expect(factory).toHaveProperty('api');
      expect(factory).toHaveProperty('handler');
    });
  });
});
