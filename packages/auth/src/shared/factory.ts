/**
 * Type-safe auth factory with conditional feature support
 */

import { logWarn } from '@repo/observability/shared-env';
import type {
  AuthConfig,
  ConditionalAuthMethods,
  ConditionalMiddleware,
  ConditionalPluginConfig,
  ValidateConfig,
} from './types';

/**
 * Type-safe auth configuration factory
 */
export function createTypedAuthConfig<T extends Partial<AuthConfig>>(config: T): ValidateConfig<T> {
  // Provide defaults for required features
  const defaultFeatures: AuthConfig['features'] = {
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
  };

  return {
    ...config,
    features: {
      ...defaultFeatures,
      ...config.features,
    },
  } as ValidateConfig<T>;
}

/**
 * Type-safe method registry for conditional features
 */
export class TypedAuthRegistry<TConfig extends AuthConfig> {
  private config: TConfig;
  private methods: Partial<ConditionalAuthMethods<TConfig>> = {};
  private middleware: Partial<ConditionalMiddleware<TConfig>> = {};

  constructor(config: TConfig) {
    this.config = config;
    this.initializeMethods();
    this.initializeMiddleware();
  }

  private initializeMethods() {
    // Only initialize methods for enabled features
    if (this.config.features.teams) {
      this.methods = {
        ...this.methods,
        // Team methods would be dynamically imported and registered here
      };
    }

    if (this.config.features.apiKeys) {
      this.methods = {
        ...this.methods,
        // API key methods would be dynamically imported and registered here
      };
    }

    if (this.config.features.organizations) {
      this.methods = {
        ...this.methods,
        // Organization methods would be dynamically imported and registered here
      };
    }

    if (this.config.features.impersonation) {
      this.methods = {
        ...this.methods,
        // Impersonation methods would be dynamically imported and registered here
      };
    }
  }

  private initializeMiddleware() {
    // Always include basic middleware
    this.middleware = {
      createAuthMiddleware: {} as any, // Would be imported dynamically
    } as Partial<ConditionalMiddleware<TConfig>>;

    // Only include advanced middleware if enabled
    if (this.config.features.advancedMiddleware) {
      this.middleware = {
        ...this.middleware,
        createAdvancedMiddleware: {} as any,
        createApiMiddleware: {} as any,
        createNodeMiddleware: {} as any,
        createWebMiddleware: {} as any,
      };
    }
  }

  /**
   * Get methods available based on configuration
   */
  getMethods(): Partial<ConditionalAuthMethods<TConfig>> {
    return this.methods;
  }

  /**
   * Get middleware available based on configuration
   */
  getMiddleware(): Partial<ConditionalMiddleware<TConfig>> {
    return this.middleware;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled<K extends keyof TConfig['features']>(feature: K): boolean {
    return Boolean((this.config.features as any)[feature]);
  }

  /**
   * Get plugin configuration based on enabled features
   */
  getPluginConfig(): ConditionalPluginConfig<TConfig> {
    return {
      admin: this.config.features.admin as any,
      apiKeys: this.config.features.apiKeys as any,
      impersonation: this.config.features.impersonation as any,
      magicLink: this.config.features.magicLink as any,
      organizations: this.config.features.organizations as any,
      passkeys: this.config.features.passkeys as any,
      sessionCaching: this.config.features.sessionCaching as any,
      teams: this.config.features.teams as any,
      twoFactor: this.config.features.twoFactor as any,
    };
  }
}

/**
 * Type guard to check if a specific feature is enabled
 */
export function hasFeature<TConfig extends AuthConfig, TFeature extends keyof TConfig['features']>(
  config: TConfig,
  feature: TFeature,
): config is TConfig & { features: Record<TFeature, true> } {
  return Boolean((config.features as any)[feature]) === true;
}

/**
 * Type-safe feature flag checker
 */
export function withFeature<
  TConfig extends AuthConfig,
  TFeature extends keyof TConfig['features'],
  TResult,
>(config: TConfig, feature: TFeature, callback: () => TResult): TResult | undefined {
  if (hasFeature(config, feature)) {
    return callback();
  }
  return undefined;
}

/**
 * Conditional import helper for feature-based loading
 */
export async function conditionalImport<T>(
  condition: boolean,
  importFn: () => Promise<T>,
): Promise<T | null> {
  if (condition) {
    try {
      return await importFn();
    } catch (error) {
      logWarn('Failed to conditionally import module', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
  return null;
}

/**
 * Type-safe method caller with feature checking
 */
export function callIfEnabled<
  TConfig extends AuthConfig,
  TFeature extends keyof TConfig['features'],
  TArgs extends any[],
  TResult,
>(
  config: TConfig,
  feature: TFeature,
  method: (...args: TArgs) => TResult,
  ...args: TArgs
): TResult | undefined {
  if (hasFeature(config, feature)) {
    return method(...args);
  }
  return undefined;
}

/**
 * Create a feature-aware proxy that only exposes enabled functionality
 */
export function createFeatureProxy<TConfig extends AuthConfig>(
  config: TConfig,
  implementations: Record<string, any>,
): ConditionalAuthMethods<TConfig> {
  return new Proxy({} as ConditionalAuthMethods<TConfig>, {
    get(target, prop: string) {
      // Check if the property requires a specific feature
      const featureMap: Record<string, keyof TConfig['features']> = {
        validateApiKey: 'apiKeys',
        checkPermission: 'organizations',
        createApiKey: 'apiKeys',
        createTeam: 'teams',
        getCurrentOrganization: 'organizations',
        getImpersonationContext: 'impersonation',
        getOrganizationBySlug: 'organizations',
        inviteToTeam: 'teams',
        listApiKeys: 'apiKeys',
        removeFromTeam: 'teams',
        revokeApiKey: 'apiKeys',
        startImpersonation: 'impersonation',
        stopImpersonation: 'impersonation',
        switchOrganization: 'organizations',
        updateTeamRole: 'teams',
      };

      const requiredFeature = featureMap[prop];

      // If no feature requirement or feature is enabled, return the implementation
      if (!requiredFeature || Boolean((config.features as any)[requiredFeature])) {
        return implementations[prop];
      }

      // Return undefined for disabled features
      return undefined;
    },
  });
}
