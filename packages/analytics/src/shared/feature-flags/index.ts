/**
 * Standardized Feature Flags Package
 * Vendor-agnostic feature flag management with emitter-first API
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Manager and provider interfaces
export { StandardFeatureFlagManager, MemoryFlagCache } from './manager';
export type {
  FeatureFlagManager,
  FeatureFlagProvider,
  FlagConfig,
  FlagContext,
  FlagEvaluationResult,
  FlagEvaluationOptions,
  FlagValue,
  FlagCache,
  CacheConfig,
  FeatureFlagError,
  FlagMetrics,
  FlagDebugInfo,
  FlagEvaluationReason
} from './types';

// Emitters and payload types
export {
  evaluateFlag,
  trackFlagExposure,
  updateFlagContext,
  evaluateFlagBatch,
  createTypedFlagEmitters,
  trackExperimentEnrollment,
  trackExperimentConversion,
  trackFlagStatusChange,
  trackFlagRuleChange,
  FlagContextBuilder,
  createFlagContext,
  isFlagEvaluationPayload,
  isFlagExposurePayload,
  isFlagContextPayload,
  isExperimentEnrollmentPayload,
  isExperimentConversionPayload,
  validateFlagContext,
  mergeFlagContexts
} from './emitters';

export type {
  FeatureFlagPayload,
  FlagEvaluationPayload,
  FlagExposurePayload,
  FlagContextPayload,
  FlagBatchEvaluationPayload,
  ExperimentEnrollmentPayload,
  ExperimentConversionPayload,
  FlagStatusPayload,
  FlagRuleChangePayload
} from './emitters';

// Provider implementations
export { PostHogFlagProvider } from '../providers/posthog-flags';
export { LocalFlagProvider } from '../providers/local-flags';
export type {
  LocalFlagDefinition,
  LocalFlagRule,
  LocalFlagCondition,
  LocalFlagOperator
} from '../providers/local-flags';

// Type utilities
export type {
  TypedFlag,
  TypedFlagMap,
  ExperimentConfig,
  ExperimentVariant,
  ExperimentPrerequisite,
  ExperimentResult
} from './types';

export { defineFlag } from './types';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import type { 
  FlagConfig, 
  FeatureFlagManager, 
  TypedFlagMap, 
  FlagEvaluationOptions 
} from './types';
import { StandardFeatureFlagManager, MemoryFlagCache } from './manager';
import { createTypedFlagEmitters } from './emitters';

/**
 * Create a feature flag manager with default configuration
 */
export function createFeatureFlagManager(options?: {
  providers?: FlagConfig[];
  cache?: boolean;
  cacheTTL?: number;
  debug?: boolean;
  primaryProvider?: string;
}): StandardFeatureFlagManager {
  let cache;
  
  if (options?.cache !== false) {
    cache = new MemoryFlagCache({
      enabled: true,
      ttl: options?.cacheTTL || 5 * 60 * 1000, // 5 minutes default
      strategy: 'ttl'
    });
  }

  const manager = new StandardFeatureFlagManager({
    cache,
    debug: options?.debug,
    primaryProvider: options?.primaryProvider
  });

  // Add providers if specified
  if (options?.providers) {
    Promise.all(
      options.providers.map(config => manager.addProvider(config))
    ).catch(error => {
      console.error('Failed to add feature flag providers:', error);
    });
  }

  return manager;
}

/**
 * Create a typed feature flag system
 */
export function createTypedFeatureFlags<T extends Record<string, any>>(
  flags: TypedFlagMap<T>,
  manager: FeatureFlagManager
) {
  const emitters = createTypedFlagEmitters(flags);

  return {
    // Flag evaluation
    async get<K extends keyof T>(
      key: K,
      options?: FlagEvaluationOptions
    ): Promise<T[K]> {
      const flag = flags[key];
      const result = await manager.getFlag(flag.key, flag.defaultValue, options);
      return result.value as T[K];
    },

    async getAll(options?: FlagEvaluationOptions): Promise<Partial<T>> {
      const flagKeys = Object.values(flags).map(f => f.key);
      const batchResult = await manager.getAllFlags(options);
      
      const result: Partial<T> = {};
      Object.entries(flags).forEach(([typedKey, flag]) => {
        const flagResult = batchResult[flag.key];
        if (flagResult) {
          result[typedKey as keyof T] = flagResult.value as T[keyof T];
        }
      });
      
      return result;
    },

    async isEnabled<K extends keyof T>(
      key: K,
      options?: FlagEvaluationOptions
    ): Promise<boolean> {
      const result = await this.get(key, options);
      return Boolean(result);
    },

    // Emitters
    emitters,

    // Flag definitions
    flags,

    // Manager access
    manager
  };
}

/**
 * Environment-specific flag configuration
 */
export function createEnvironmentConfig(environment: 'development' | 'staging' | 'production'): FlagConfig[] {
  const configs: FlagConfig[] = [];

  switch (environment) {
    case 'development':
      // Use local provider with development defaults
      configs.push({
        provider: 'local',
        options: {
          flags: {
            'debug-mode': true,
            'verbose-logging': true,
            'mock-apis': true,
            'skip-auth': false
          }
        }
      });
      break;

    case 'staging':
      // Use PostHog with staging environment
      configs.push({
        provider: 'posthog',
        options: {
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_STAGING_KEY,
          apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          environment: 'staging'
        }
      });
      break;

    case 'production':
      // Use PostHog with production environment
      configs.push({
        provider: 'posthog',
        options: {
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
          apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          environment: 'production'
        }
      });
      break;
  }

  return configs;
}

/**
 * Common flag patterns for web applications
 */
export const commonFlags = {
  // UI/UX flags
  newDesign: {
    key: 'new-design',
    defaultValue: false,
    description: 'Enable new design system',
    type: 'boolean'
  },
  
  betaFeatures: {
    key: 'beta-features',
    defaultValue: false,
    description: 'Enable beta features',
    type: 'boolean'
  },
  
  // Performance flags
  lazyLoading: {
    key: 'lazy-loading',
    defaultValue: true,
    description: 'Enable lazy loading for images',
    type: 'boolean'
  },
  
  // Feature rollout flags
  newCheckout: {
    key: 'new-checkout',
    defaultValue: false,
    description: 'Enable new checkout flow',
    type: 'boolean'
  },
  
  // A/B testing flags
  ctaVariant: {
    key: 'cta-variant',
    defaultValue: 'control',
    description: 'CTA button variant',
    type: 'string',
    variants: ['control', 'variant-a', 'variant-b']
  },
  
  // Configuration flags
  maxItems: {
    key: 'max-items-per-page',
    defaultValue: 20,
    description: 'Maximum items per page',
    type: 'number'
  },
  
  // Integration flags
  analyticsProvider: {
    key: 'analytics-provider',
    defaultValue: 'posthog',
    description: 'Primary analytics provider',
    type: 'string',
    variants: ['posthog', 'mixpanel', 'amplitude']
  }
} as const;

export type CommonFlags = typeof commonFlags;