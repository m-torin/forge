/**
 * Tests for shared factory functionality
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Mock observability
const mockLogWarn = vi.fn();
vi.mock('@repo/observability', () => ({
  logWarn: mockLogWarn,
}));

describe('shared factory functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTypedAuthConfig', () => {
    test('should create config with default features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
      });

      expect(config).toStrictEqual({
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

    test('should merge custom features with defaults', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
        features: {
          admin: true,
          twoFactor: true,
          magicLink: true,
        },
      });

      expect(config.features).toStrictEqual({
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

    test('should override default features completely', async () => {
      const factoryModule = await import('../../src/shared/factory');

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
        expect(feature).toBeFalsy();
      });
    });

    test('should preserve other config properties', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test-db' as any,
        rateLimit: {
          window: 60,
          max: 100,
        } as any,
        customProperty: 'test-value' as any,
      });

      expect(config.database).toBe('test-db');
      expect(config.rateLimit).toStrictEqual({ window: 60, max: 100 });
      expect((config as any).customProperty).toBe('test-value');
    });
  });

  describe('typedAuthRegistry', () => {
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

    test('should initialize with config', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);

      expect(registry).toBeInstanceOf(factoryModule.TypedAuthRegistry);
    });

    test('should provide methods based on enabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);
      const methods = registry.getMethods();

      expect(methods).toBeDefined();
      expect(typeof methods).toBe('object');
    });

    test('should provide middleware based on configuration', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);
      const middleware = registry.getMiddleware();

      expect(middleware).toBeDefined();
      expect(middleware.createAuthMiddleware).toBeDefined();
    });

    test('should include advanced middleware when enabled', async () => {
      const factoryModule = await import('../../src/shared/factory');

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

    test('should not include advanced middleware when disabled', async () => {
      const factoryModule = await import('../../src/shared/factory');

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

    test('should check if features are enabled', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);

      expect(registry.isFeatureEnabled('apiKeys')).toBeTruthy();
      expect(registry.isFeatureEnabled('teams')).toBeTruthy();
      expect(registry.isFeatureEnabled('admin')).toBeFalsy();
      expect(registry.isFeatureEnabled('twoFactor')).toBeFalsy();
    });

    test('should provide plugin configuration', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const registry = new factoryModule.TypedAuthRegistry(mockConfig);
      const pluginConfig = registry.getPluginConfig();

      expect(pluginConfig).toStrictEqual({
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

    test('should return true for enabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      expect(factoryModule.hasFeature(testConfig, 'apiKeys')).toBeTruthy();
      expect(factoryModule.hasFeature(testConfig, 'organizations')).toBeTruthy();
    });

    test('should return false for disabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      expect(factoryModule.hasFeature(testConfig, 'teams')).toBeFalsy();
      expect(factoryModule.hasFeature(testConfig, 'admin')).toBeFalsy();
    });

    test('should work as type guard', async () => {
      const factoryModule = await import('../../src/shared/factory');

      // Test the hasFeature function
      const hasApiKeys = factoryModule.hasFeature(testConfig, 'apiKeys');
      expect(hasApiKeys).toBeDefined();
      expect(typeof hasApiKeys).toBe('boolean');

      // Test the actual feature check without conditional logic
      expect(factoryModule.hasFeature(testConfig, 'apiKeys')).toBeTruthy();
      expect(testConfig.features.apiKeys).toBeTruthy();
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

    test('should execute callback for enabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const callback = vi.fn(() => 'result');

      const result = factoryModule.withFeature(testConfig, 'apiKeys', callback);

      expect(callback).toHaveBeenCalledWith();
      expect(result).toBe('result');
    });

    test('should not execute callback for disabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const callback = vi.fn(() => 'result');

      const result = factoryModule.withFeature(testConfig, 'teams', callback);

      expect(callback).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('should return callback result for enabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const result = factoryModule.withFeature(testConfig, 'apiKeys', () => ({ data: 'test' }));

      expect(result).toStrictEqual({ data: 'test' });
    });
  });

  describe('conditionalImport', () => {
    test('should import when condition is true', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockImport = vi.fn().mockResolvedValue({ exported: 'value' });

      const result = await factoryModule.conditionalImport(true, mockImport);

      expect(mockImport).toHaveBeenCalledWith();
      expect(result).toStrictEqual({ exported: 'value' });
    });

    test('should not import when condition is false', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockImport = vi.fn().mockResolvedValue({ exported: 'value' });

      const result = await factoryModule.conditionalImport(false, mockImport);

      expect(mockImport).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should handle import errors gracefully', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));

      const result = await factoryModule.conditionalImport(true, mockImport);

      expect(mockImport).toHaveBeenCalledWith();
      expect(mockLogWarn).toHaveBeenCalledWith('Failed to conditionally import module', {
        error: 'Import failed',
      });
      expect(result).toBeNull();
    });

    test('should handle non-Error exceptions', async () => {
      const factoryModule = await import('../../src/shared/factory');

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

    test('should call method for enabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockMethod = vi.fn((a: string, b: number) => `${a}-${b}`);

      const result = factoryModule.callIfEnabled(testConfig, 'apiKeys', mockMethod, 'test', 123);

      expect(mockMethod).toHaveBeenCalledWith('test', 123);
      expect(result).toBe('test-123');
    });

    test('should not call method for disabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockMethod = vi.fn((a: string, b: number) => `${a}-${b}`);

      const result = factoryModule.callIfEnabled(testConfig, 'teams', mockMethod, 'test', 123);

      expect(mockMethod).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('should handle methods with no arguments', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockMethod = vi.fn(() => 'no-args');

      const result = factoryModule.callIfEnabled(testConfig, 'apiKeys', mockMethod);

      expect(mockMethod).toHaveBeenCalledWith();
      expect(result).toBe('no-args');
    });

    test('should handle methods with complex return types', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const mockMethod = vi.fn(() => ({ complex: { nested: 'object' } }));

      const result = factoryModule.callIfEnabled(testConfig, 'apiKeys', mockMethod);

      expect(result).toStrictEqual({ complex: { nested: 'object' } });
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

    test('should return methods for enabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const proxy = factoryModule.createFeatureProxy(testConfig, mockImplementations);

      expect(proxy.validateApiKey).toBe(mockImplementations.validateApiKey);
      expect(proxy.createApiKey).toBe(mockImplementations.createApiKey);
      expect(proxy.createTeam).toBe(mockImplementations.createTeam);
      expect(proxy.getCurrentOrganization).toBe(mockImplementations.getCurrentOrganization);
    });

    test('should return undefined for disabled features', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const proxy = factoryModule.createFeatureProxy(testConfig, mockImplementations);

      expect(proxy.startImpersonation).toBeUndefined();
      expect(proxy.stopImpersonation).toBeUndefined();
      expect(proxy.getImpersonationContext).toBeUndefined();
    });

    test('should return methods for features without requirements', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const implementationsWithCustom = {
        ...mockImplementations,
        customMethod: vi.fn(),
      };

      const proxy = factoryModule.createFeatureProxy(testConfig, implementationsWithCustom);

      // Methods not in the feature map should be available
      expect((proxy as any).customMethod).toBe(implementationsWithCustom.customMethod);
    });

    test('should handle API key related methods correctly', async () => {
      const factoryModule = await import('../../src/shared/factory');

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

    test('should handle team related methods correctly', async () => {
      const factoryModule = await import('../../src/shared/factory');

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

    test('should handle organization related methods correctly', async () => {
      const factoryModule = await import('../../src/shared/factory');

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
    test('should handle empty config', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const config = factoryModule.createTypedAuthConfig({});

      expect(config.features).toBeDefined();
      expect(typeof config.features).toBe('object');
    });

    test('should handle undefined features in config', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        database: 'test' as any,
        features: undefined as any,
      });

      expect(config.features).toBeDefined();
    });

    test('should handle partial feature configuration', async () => {
      const factoryModule = await import('../../src/shared/factory');

      const config = factoryModule.createTypedAuthConfig({
        features: {
          apiKeys: false,
          // Only provide one feature
        },
      });

      expect((config as any).features.apiKeys).toBeFalsy();
      expect((config as any).features.teams).toBeTruthy(); // Should have default
    });

    test('should handle registry with minimal config', async () => {
      const factoryModule = await import('../../src/shared/factory');

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
