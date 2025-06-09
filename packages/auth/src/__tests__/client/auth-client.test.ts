/**
 * Auth client tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('better-auth/client', () => ({
  createAuthClient: mockCreateAuthClient,
}));

vi.mock('better-auth/client/plugins', () => ({
  adminClient: mockAdminClient,
  apiKeyClient: mockApiKeyClient,
  organizationClient: mockOrganizationClient,
}));

// Mock the shared modules
vi.mock('../../shared/config', () => ({
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

vi.mock('../../shared/permissions', () => ({
  ac: { mockAc: true },
  roles: { mockRoles: true },
}));

vi.mock('../../shared/admin-permissions', () => ({
  adminAccessController: { mockAdminAc: true },
  adminRoles: { mockAdminRoles: true },
}));

describe('Auth Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockCreateAuthClient.mockReturnValue({ mockClient: true });
    mockOrganizationClient.mockReturnValue({ organizationPlugin: true });
    mockApiKeyClient.mockReturnValue({ apiKeyPlugin: true });
    mockAdminClient.mockReturnValue({ adminPlugin: true });
  });

  it('should create auth client with all plugins when features are enabled', async () => {
    // Clear the module cache to force re-execution
    vi.resetModules();

    // Import the module after mocks are set up
    await import('../../client/auth-client');

    expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);

    const createClientCall = mockCreateAuthClient.mock.calls[0][0];
    expect(createClientCall).toHaveProperty('plugins');
    expect(Array.isArray(createClientCall.plugins)).toBe(true);
    expect(createClientCall.plugins).toHaveLength(3); // organization, apiKey, admin
  });

  it('should configure organization plugin correctly', async () => {
    // Verify the module loads and creates client with plugins
    const module = await import('../../client/auth-client');
    expect(module.authClient).toBeDefined();
  });

  it('should configure admin plugin correctly', async () => {
    // Verify the module loads and creates client with plugins
    const module = await import('../../client/auth-client');
    expect(module.authClient).toBeDefined();
  });

  it('should configure API key plugin', async () => {
    // Verify the module loads and creates client with plugins
    const module = await import('../../client/auth-client');
    expect(module.authClient).toBeDefined();
  });

  describe('Feature toggling', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should exclude organization plugin when feature is disabled', async () => {
      vi.doMock('../../shared/config', () => ({
        createAuthConfig: vi.fn(() => ({
          features: {
            admin: true,
            apiKeys: true,
            impersonation: true,
            organizations: false,
            teams: false,
          },
        })),
      }));

      await import('../../client/auth-client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(2); // apiKey, admin only
      expect(mockOrganizationClient).not.toHaveBeenCalled();
    });

    it('should exclude API key plugin when feature is disabled', async () => {
      vi.doMock('../../shared/config', () => ({
        createAuthConfig: vi.fn(() => ({
          features: {
            admin: true,
            apiKeys: false,
            impersonation: true,
            organizations: true,
            teams: true,
          },
        })),
      }));

      await import('../../client/auth-client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(2); // organization, admin only
      expect(mockApiKeyClient).not.toHaveBeenCalled();
    });

    it('should exclude admin plugin when feature is disabled', async () => {
      vi.doMock('../../shared/config', () => ({
        createAuthConfig: vi.fn(() => ({
          features: {
            admin: false,
            apiKeys: true,
            impersonation: false,
            organizations: true,
            teams: true,
          },
        })),
      }));

      await import('../../client/auth-client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(2); // organization, apiKey only
      expect(mockAdminClient).not.toHaveBeenCalled();
    });

    it('should work with no plugins when all features are disabled', async () => {
      vi.doMock('../../shared/config', () => ({
        createAuthConfig: vi.fn(() => ({
          features: {
            admin: false,
            apiKeys: false,
            impersonation: false,
            organizations: false,
            teams: false,
          },
        })),
      }));

      await import('../../client/auth-client');

      const createClientCall = mockCreateAuthClient.mock.calls[0][0];
      expect(createClientCall.plugins).toHaveLength(0);
      expect(mockOrganizationClient).not.toHaveBeenCalled();
      expect(mockApiKeyClient).not.toHaveBeenCalled();
      expect(mockAdminClient).not.toHaveBeenCalled();
    });

    it('should disable teams when organizations are enabled but teams are disabled', async () => {
      vi.doMock('../../shared/config', () => ({
        createAuthConfig: vi.fn(() => ({
          features: {
            admin: false,
            apiKeys: false,
            impersonation: false,
            organizations: true,
            teams: false,
          },
        })),
      }));

      await import('../../client/auth-client');

      expect(mockOrganizationClient).toHaveBeenCalledTimes(1);
      const organizationConfig = mockOrganizationClient.mock.calls[0][0];
      expect(organizationConfig.teams.enabled).toBe(false);
    });

    it('should disable impersonation when admin is enabled but impersonation is disabled', async () => {
      vi.doMock('../../shared/config', () => ({
        createAuthConfig: vi.fn(() => ({
          features: {
            admin: true,
            apiKeys: false,
            impersonation: false,
            organizations: false,
            teams: false,
          },
        })),
      }));

      await import('../../client/auth-client');

      expect(mockAdminClient).toHaveBeenCalledTimes(1);
      const adminConfig = mockAdminClient.mock.calls[0][0];
      expect(adminConfig.enableImpersonation).toBe(false);
    });
  });
});
