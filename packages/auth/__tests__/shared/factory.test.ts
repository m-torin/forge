/**
 * Tests for shared factory functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock observability
const mockLogWarn = vi.fn();
vi.mock('@repo/observability/shared-env', () => ({
  logWarn: mockLogWarn,
}));

describe('shared factory functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTypedAuthConfig', () => {
    it('should create config with default features', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
      });

      expect(config).toEqual({
        database: 'test-db',
        features: {
          advancedMiddleware: true,
          admin: false,
          apiKeys: true,
          impersonation: false,
          magicLink: false,
          organizationInvitations: true,
          organizations: true,
          passkeys: false,
          serviceToService: true,
          sessionCaching: true,
          teams: true,
          twoFactor: false,
        },
      });
    });

    it('should merge custom features with defaults', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
        features: {
          admin: true,
          twoFactor: true,
          magicLink: true,
        },
      });

      expect(config.features).toEqual({
        advancedMiddleware: true,
        admin: true, // Custom override
        apiKeys: true,
        impersonation: false,
        magicLink: true, // Custom override
        organizationInvitations: true,
        organizations: true,
        passkeys: false,
        serviceToService: true,
        sessionCaching: true,
        teams: true,
        twoFactor: true, // Custom override
      });
    });

    it('should override default features completely', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
        features: {
          advancedMiddleware: false,
          admin: false,
          apiKeys: false,
          impersonation: false,
          magicLink: false,
          organizationInvitations: false,
          organizations: false,
          passkeys: false,
          serviceToService: false,
          sessionCaching: false,
          teams: false,
          twoFactor: false,
        },
      });

      // All features should be false due to override
      Object.values(config.features).forEach(feature => {
        expect(feature).toBe(false);
      });
    });

    it('should preserve other config properties', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
        rateLimit: {
          window: 60,
          max: 100,
        } as any,
        customProperty: 'test-value' as any,
      });

      expect(config.database).toBe('test-db');
      expect(config.rateLimit).toEqual({ window: 60, max: 100 });
      expect((config as any).customProperty).toBe('test-value');
    });
  });

  describe('TypedAuthRegistry', () => {
    const mockConfig = {
      database: 'test-db' as any,
      features: {
        advancedMiddleware: true,
        admin: false,
        apiKeys: true,
        impersonation: false,
        magicLink: false,
        organizationInvitations: true,
        organizations: true,
        passkeys: false,
        serviceToService: true,
        sessionCaching: true,
        teams: true,
        twoFactor: false,
      },
    };

    it('should initialize with config', async () => {
      const factoryModule = await import('@/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);

      expect(registry).toBeInstanceOf(factoryModule.TypedAuthRegistry);
    });

    it('should provide methods based on enabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);
      const methods = registry.getMethods();

      expect(methods).toBeDefined();
      expect(typeof methods).toBe('object');
    });

    it('should provide middleware based on configuration', async () => {
      const factoryModule = await import('@/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);
      const middleware = registry.getMiddleware();

      expect(middleware).toBeDefined();
      expect(middleware.createAuthMiddleware).toBeDefined();
    });

    it('should include advanced middleware when enabled', async () => {
      const factoryModule = await import('@/shared/factory');

      const configWithAdvanced = {
        ...mockConfig,
        features: {
          ...mockConfig.features,
          advancedMiddleware: true,
        },
      };

      const registry = new factoryModule.TypedAuthRegistry(configWithAdvanced);
      const middleware = registry.getMiddleware();

      expect(middleware.createAdvancedMiddleware).toBeDefined();
      expect(middleware.createApiMiddleware).toBeDefined();
      expect(middleware.createNodeMiddleware).toBeDefined();
      expect(middleware.createWebMiddleware).toBeDefined();
    });

    it('should not include advanced middleware when disabled', async () => {
      const factoryModule = await import('@/shared/factory');

      const configWithoutAdvanced = {
        ...mockConfig,
        features: {
          ...mockConfig.features,
          advancedMiddleware: false,
        },
      };

      const registry = new factoryModule.TypedAuthRegistry(configWithoutAdvanced);
      const middleware = registry.getMiddleware();

      expect(middleware.createAdvancedMiddleware).toBeUndefined();
      expect(middleware.createApiMiddleware).toBeUndefined();
      expect(middleware.createNodeMiddleware).toBeUndefined();
      expect(middleware.createWebMiddleware).toBeUndefined();
    });

    it('should check if features are enabled', async () => {
      const factoryModule = await import('@/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);

      expect(registry.isFeatureEnabled('apiKeys')).toBe(true);
      expect(registry.isFeatureEnabled('teams')).toBe(true);
      expect(registry.isFeatureEnabled('admin')).toBe(false);
      expect(registry.isFeatureEnabled('twoFactor')).toBe(false);
    });

    it('should provide plugin configuration', async () => {
      const factoryModule = await import('@/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);
      const pluginConfig = registry.getPluginConfig();

      expect(pluginConfig).toEqual({
        admin: false,
        apiKeys: true,
        impersonation: false,
        magicLink: false,
        organizations: true,
        passkeys: false,
        sessionCaching: true,
        teams: true,
        twoFactor: false,
      });
    });
  });

  describe('hasFeature', () => {
    const testConfig = {
      database: 'test' as any,
      features: {
        apiKeys: true,
        teams: false,
        organizations: true,
        admin: false,
      } as any,
    };

    it('should return true for enabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      expect(factoryModule.hasFeature(testConfig, 'apiKeys')).toBe(true);
      expect(factoryModule.hasFeature(testConfig, 'organizations')).toBe(true);
    });

    it('should return false for disabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      expect(factoryModule.hasFeature(testConfig, 'teams')).toBe(false);
      expect(factoryModule.hasFeature(testConfig, 'admin')).toBe(false);
    });

    it('should work as type guard', async () => {
      const factoryModule = await import('@/shared/factory');

      if (factoryModule.hasFeature(testConfig, 'apiKeys')) {
        // TypeScript should narrow the type here
        expect(testConfig.features.apiKeys).toBe(true);
      }
    });
  });

  describe('withFeature', () => {
    const testConfig = {
      database: 'test' as any,
      features: {
        apiKeys: true,
        teams: false,
      } as any,
    };

    it('should execute callback for enabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const callback = vi.fn(() => 'result');

      const result = factoryModule.withFeature(testConfig, 'apiKeys', callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should not execute callback for disabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const callback = vi.fn(() => 'result');

      const result = factoryModule.withFeature(testConfig, 'teams', callback);

      expect(callback).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return callback result for enabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const result = factoryModule.withFeature(testConfig, 'apiKeys', () => ({ data: 'test' }));

      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('conditionalImport', () => {
    it('should import when condition is true', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockImport = vi.fn().mockResolvedValue({ exported: 'value' });

      const result = await factoryModule.conditionalImport(true, mockImport);

      expect(mockImport).toHaveBeenCalled();
      expect(result).toEqual({ exported: 'value' });
    });

    it('should not import when condition is false', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockImport = vi.fn().mockResolvedValue({ exported: 'value' });

      const result = await factoryModule.conditionalImport(false, mockImport);

      expect(mockImport).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle import errors gracefully', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));

      const result = await factoryModule.conditionalImport(true, mockImport);

      expect(mockImport).toHaveBeenCalled();
      expect(mockLogWarn).toHaveBeenCalledWith('Failed to conditionally import module', {
        error: 'Import failed',
      });
      expect(result).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockImport = vi.fn().mockRejectedValue('string error');

      const result = await factoryModule.conditionalImport(true, mockImport);

      expect(mockLogWarn).toHaveBeenCalledWith('Failed to conditionally import module', {
        error: 'string error',
      });
      expect(result).toBeNull();
    });
  });

  describe('callIfEnabled', () => {
    const testConfig = {
      database: 'test' as any,
      features: {
        apiKeys: true,
        teams: false,
      } as any,
    };

    it('should call method for enabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockMethod = vi.fn((a: string, b: number) => `${a}-${b}`);

      const result = factoryModule.callIfEnabled(testConfig, 'apiKeys', mockMethod, 'test', 123);

      expect(mockMethod).toHaveBeenCalledWith('test', 123);
      expect(result).toBe('test-123');
    });

    it('should not call method for disabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockMethod = vi.fn((a: string, b: number) => `${a}-${b}`);

      const result = factoryModule.callIfEnabled(testConfig, 'teams', mockMethod, 'test', 123);

      expect(mockMethod).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle methods with no arguments', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockMethod = vi.fn(() => 'no-args');

      const result = factoryModule.callIfEnabled(testConfig, 'apiKeys', mockMethod);

      expect(mockMethod).toHaveBeenCalledWith();
      expect(result).toBe('no-args');
    });

    it('should handle methods with complex return types', async () => {
      const factoryModule = await import('@/shared/factory');

      const mockMethod = vi.fn(() => ({ complex: { nested: 'object' } }));

      const result = factoryModule.callIfEnabled(testConfig, 'apiKeys', mockMethod);

      expect(result).toEqual({ complex: { nested: 'object' } });
    });
  });

  describe('createFeatureProxy', () => {
    const testConfig = {
      database: 'test' as any,
      features: {
        apiKeys: true,
        teams: true,
        organizations: true,
        impersonation: false,
      } as any,
    };

    const mockImplementations = {
      validateApiKey: vi.fn(),
      createApiKey: vi.fn(),
      listApiKeys: vi.fn(),
      revokeApiKey: vi.fn(),
      createTeam: vi.fn(),
      inviteToTeam: vi.fn(),
      removeFromTeam: vi.fn(),
      updateTeamRole: vi.fn(),
      getCurrentOrganization: vi.fn(),
      getOrganizationBySlug: vi.fn(),
      switchOrganization: vi.fn(),
      checkPermission: vi.fn(),
      startImpersonation: vi.fn(),
      stopImpersonation: vi.fn(),
      getImpersonationContext: vi.fn(),
    };

    it('should return methods for enabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const proxy = factoryModule.createFeatureProxy(testConfig, mockImplementations);

      expect(proxy.validateApiKey).toBe(mockImplementations.validateApiKey);
      expect(proxy.createApiKey).toBe(mockImplementations.createApiKey);
      expect(proxy.createTeam).toBe(mockImplementations.createTeam);
      expect(proxy.getCurrentOrganization).toBe(mockImplementations.getCurrentOrganization);
    });

    it('should return undefined for disabled features', async () => {
      const factoryModule = await import('@/shared/factory');

      const proxy = factoryModule.createFeatureProxy(testConfig, mockImplementations);

      expect(proxy.startImpersonation).toBeUndefined();
      expect(proxy.stopImpersonation).toBeUndefined();
      expect(proxy.getImpersonationContext).toBeUndefined();
    });

    it('should return methods for features without requirements', async () => {
      const factoryModule = await import('@/shared/factory');

      const implementationsWithCustom = {
        ...mockImplementations,
        customMethod: vi.fn(),
      };

      const proxy = factoryModule.createFeatureProxy(testConfig, implementationsWithCustom);

      // Methods not in the feature map should be available
      expect((proxy as any).customMethod).toBe(implementationsWithCustom.customMethod);
    });

    it('should handle API key related methods correctly', async () => {
      const factoryModule = await import('@/shared/factory');

      const configWithoutApiKeys = {
        ...testConfig,
        features: {
          ...testConfig.features,
          apiKeys: false,
        },
      };

      const proxy = factoryModule.createFeatureProxy(configWithoutApiKeys, mockImplementations);

      expect(proxy.validateApiKey).toBeUndefined();
      expect(proxy.createApiKey).toBeUndefined();
      expect(proxy.listApiKeys).toBeUndefined();
      expect(proxy.revokeApiKey).toBeUndefined();
    });

    it('should handle team related methods correctly', async () => {
      const factoryModule = await import('@/shared/factory');

      const configWithoutTeams = {
        ...testConfig,
        features: {
          ...testConfig.features,
          teams: false,
        },
      };

      const proxy = factoryModule.createFeatureProxy(configWithoutTeams, mockImplementations);

      expect(proxy.createTeam).toBeUndefined();
      expect(proxy.inviteToTeam).toBeUndefined();
      expect(proxy.removeFromTeam).toBeUndefined();
      expect(proxy.updateTeamRole).toBeUndefined();
    });

    it('should handle organization related methods correctly', async () => {
      const factoryModule = await import('@/shared/factory');

      const configWithoutOrgs = {
        ...testConfig,
        features: {
          ...testConfig.features,
          organizations: false,
        },
      };

      const proxy = factoryModule.createFeatureProxy(configWithoutOrgs, mockImplementations);

      expect(proxy.getCurrentOrganization).toBeUndefined();
      expect(proxy.getOrganizationBySlug).toBeUndefined();
      expect(proxy.switchOrganization).toBeUndefined();
      expect(proxy.checkPermission).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty config', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({});

      expect(config.features).toBeDefined();
      expect(typeof config.features).toBe('object');
    });

    it('should handle undefined features in config', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test' as any,
        features: undefined as any,
      });

      expect(config.features).toBeDefined();
    });

    it('should handle partial feature configuration', async () => {
      const factoryModule = await import('@/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        features: {
          apiKeys: false,
          // Only provide one feature
        },
      });

      expect(config.features.apiKeys).toBe(false);
      expect(config.features.teams).toBe(true); // Should have default
    });

    it('should handle registry with minimal config', async () => {
      const factoryModule = await import('@/shared/factory');

      const minimalConfig = {
        database: 'test' as any,
        features: {
          advancedMiddleware: false,
          admin: false,
          apiKeys: false,
          impersonation: false,
          magicLink: false,
          organizationInvitations: false,
          organizations: false,
          passkeys: false,
          serviceToService: false,
          sessionCaching: false,
          teams: false,
          twoFactor: false,
        },
      };

      const registry = new factoryModule.TypedAuthRegistry(minimalConfig);

      expect(registry.getMethods()).toBeDefined();
      expect(registry.getMiddleware()).toBeDefined();
    });
  });
});
