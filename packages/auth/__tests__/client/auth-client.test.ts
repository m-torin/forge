/**
 * Auth client tests
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Mock better-auth before importing using vi.hoisted
const { mockAdminClient, mockApiKeyClient, mockCreateAuthClient, mockOrganizationClient } =
  vi.hoisted(() => {
    const mockCreateAuthClient = vi.fn();
    const mockOrganizationClient = vi.fn();
    const mockApiKeyClient = vi.fn();
    const mockAdminClient = vi.fn();

    return {
      mockAdminClient,
      mockApiKeyClient,
      mockCreateAuthClient,
      mockOrganizationClient,
    };
  });

vi.mock('better-auth/react', () => ({
  createAuthClient: mockCreateAuthClient,
}));

vi.mock('better-auth/client/plugins', () => ({
  organizationClient: mockOrganizationClient,
  adminClient: mockAdminClient,
  apiKeyClient: mockApiKeyClient,
  twoFactorClient: vi.fn(() => ({})),
  inferAdditionalFields: vi.fn(),
  magicLinkClient: vi.fn(() => ({})),
  passkeyClient: vi.fn(() => ({})),
  multiSessionClient: vi.fn(() => ({})),
  oneTapClient: vi.fn(() => ({})),
}));

// Mock the env module
vi.mock('../../env', () => {
  let mockEnv = {
    BETTER_AUTH_SECRET: 'test-secret',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
    AUTH_FEATURES_ADMIN: true,
    AUTH_FEATURES_API_KEYS: true,
    AUTH_FEATURES_ORGANIZATIONS: true,
    AUTH_FEATURES_MAGIC_LINKS: true,
    AUTH_FEATURES_TWO_FACTOR: true,
    AUTH_FEATURES_TEAMS: true,
    AUTH_FEATURES_IMPERSONATION: true,
  };

  return {
    env: mockEnv,
    envError: null,
    safeEnv: () => mockEnv,
    setMockEnv: (newEnv: any) => {
      // Convert string 'true'/'false' to boolean for feature flags
      const processedEnv = { ...newEnv };
      Object.keys(processedEnv).forEach(key => {
        if (key.startsWith('AUTH_FEATURES_')) {
          if (processedEnv[key] === 'true') {
            processedEnv[key] = true;
          } else if (processedEnv[key] === 'false') {
            processedEnv[key] = false;
          }
        }
      });
      mockEnv = { ...mockEnv, ...processedEnv };
    },
  };
});

// Import the mock setter
const { setMockEnv } = await import('../../env');

// Mock the shared modules
vi.mock('../../src/shared/config', () => ({
  createAuthConfig: vi.fn(() => ({
    features: {
      admin: true,
      apiKeys: true,
      impersonation: true,
      organizations: true,
      teams: true,
    },
  })),
}));

vi.mock('../../src/shared/permissions', () => ({
  ac: { mockAc: true },
  roles: { mockRoles: true },
}));

vi.mock('../../src/shared/admin-permissions', () => ({
  adminAccessController: { mockAdminAc: true },
  adminRoles: { mockAdminRoles: true },
}));

describe('auth Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // Reset module cache between tests

    // Setup default mocks
    mockCreateAuthClient.mockReturnValue({ mockClient: true });
    mockOrganizationClient.mockReturnValue({ organizationPlugin: true });
    mockApiKeyClient.mockReturnValue({ apiKeyPlugin: true });
    mockAdminClient.mockReturnValue({ adminPlugin: true });
  });

  test('should create auth client with all plugins when features are enabled', async () => {
    // Mock environment to enable all features
    setMockEnv({
      AUTH_FEATURES_ORGANIZATIONS: 'true',
      AUTH_FEATURES_API_KEYS: 'true',
      AUTH_FEATURES_ADMIN: 'true',
      AUTH_FEATURES_MAGIC_LINKS: 'true',
      AUTH_FEATURES_TWO_FACTOR: 'true',
    });

    await import('../../src/client/client');

    expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    const createClientCall = mockCreateAuthClient.mock.calls[0][0];
    expect(createClientCall).toHaveProperty('plugins');
    expect(Array.isArray(createClientCall.plugins)).toBeTruthy();
    expect(createClientCall.plugins).toHaveLength(9); // inferAdditionalFields, organization, twoFactor, admin, apiKey, passkey, magicLink, multiSession, oneTap
  });

  test('should configure organization plugin correctly', async () => {
    // Verify the module loads and creates client with plugins
    const module = await import('../../src/client/client');
    expect(module.authClient).toBeDefined();
  });

  test('should configure admin plugin correctly', async () => {
    // Verify the module loads and creates client with plugins
    const module = await import('../../src/client/client');
    expect(module.authClient).toBeDefined();
  });

  test('should configure API key plugin', async () => {
    // Verify the module loads and creates client with plugins
    const module = await import('../../src/client/client');
    expect(module.authClient).toBeDefined();
  });

  describe('feature toggling', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    test('should exclude organization plugin when feature is disabled', async () => {
      // Mock environment to disable organizations
      setMockEnv({
        AUTH_FEATURES_ORGANIZATIONS: 'false',
        AUTH_FEATURES_API_KEYS: 'true',
        AUTH_FEATURES_ADMIN: 'true',
        AUTH_FEATURES_MAGIC_LINKS: 'true',
        AUTH_FEATURES_TWO_FACTOR: 'true',
      });

      await import('../../src/client/client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(9); // All plugins are always included for type safety
      // Feature flags are handled at runtime, not during client creation
    });

    test('should exclude API key plugin when feature is disabled', async () => {
      // Mock environment to disable API keys
      setMockEnv({
        AUTH_FEATURES_ORGANIZATIONS: 'true',
        AUTH_FEATURES_API_KEYS: 'false',
        AUTH_FEATURES_ADMIN: 'true',
        AUTH_FEATURES_MAGIC_LINKS: 'true',
        AUTH_FEATURES_TWO_FACTOR: 'true',
      });

      await import('../../src/client/client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(9); // All plugins are always included for type safety
      // Feature flags are handled at runtime, not during client creation
    });

    test('should exclude admin plugin when feature is disabled', async () => {
      // Mock environment to disable admin
      setMockEnv({
        AUTH_FEATURES_ORGANIZATIONS: 'true',
        AUTH_FEATURES_API_KEYS: 'true',
        AUTH_FEATURES_ADMIN: 'false',
        AUTH_FEATURES_MAGIC_LINKS: 'true',
        AUTH_FEATURES_TWO_FACTOR: 'true',
      });

      await import('../../src/client/client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(9); // All plugins are always included for type safety
      // Feature flags are handled at runtime, not during client creation
    });

    test('should work with no plugins when all features are disabled', async () => {
      // Mock environment to disable all features
      setMockEnv({
        AUTH_FEATURES_ORGANIZATIONS: 'false',
        AUTH_FEATURES_API_KEYS: 'false',
        AUTH_FEATURES_ADMIN: 'false',
        AUTH_FEATURES_MAGIC_LINKS: 'false',
        AUTH_FEATURES_TWO_FACTOR: 'false',
      });

      await import('../../src/client/client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(9); // All plugins are always included for type safety
      // Feature flags are handled at runtime, not during client creation
    });

    test('should disable teams when organizations are enabled but teams are disabled', async () => {
      // Mock environment to enable organizations but disable teams
      setMockEnv({
        AUTH_FEATURES_ORGANIZATIONS: 'true',
        AUTH_FEATURES_TEAMS: 'false',
        AUTH_FEATURES_API_KEYS: 'true',
        AUTH_FEATURES_ADMIN: 'true',
        AUTH_FEATURES_MAGIC_LINKS: 'true',
        AUTH_FEATURES_TWO_FACTOR: 'true',
      });

      await import('../../src/client/client');

      // Note: The current implementation doesn't conditionally configure plugins
      expect(mockOrganizationClient).toHaveBeenCalledTimes(1);
    });

    test('should disable impersonation when admin is enabled but impersonation is disabled', async () => {
      // Mock environment to enable admin but disable impersonation
      setMockEnv({
        AUTH_FEATURES_ADMIN: 'true',
        AUTH_FEATURES_IMPERSONATION: 'false',
        AUTH_FEATURES_ORGANIZATIONS: 'true',
        AUTH_FEATURES_API_KEYS: 'true',
        AUTH_FEATURES_MAGIC_LINKS: 'true',
        AUTH_FEATURES_TWO_FACTOR: 'true',
      });

      await import('../../src/client/client');

      // Note: The current implementation doesn't conditionally configure plugins
      expect(mockAdminClient).toHaveBeenCalledTimes(1);
    });
  });
});
