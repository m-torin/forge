/**
 * Standardized Feature Flags Package
 * Vendor-agnostic feature flag management with emitter-first API
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Manager and provider interfaces
// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import { createTypedFlagEmitters } from './emitters';
import { MemoryFlagCache, StandardFeatureFlagManager } from './manager';

import type { FeatureFlagManager, FlagConfig, FlagEvaluationOptions, TypedFlagMap } from './types';

export { MemoryFlagCache, StandardFeatureFlagManager } from './manager';
export type {
  CacheConfig,
  FeatureFlagError,
  FeatureFlagManager,
  FeatureFlagProvider,
  FlagCache,
  FlagConfig,
  FlagContext,
  FlagDebugInfo,
  FlagEvaluationOptions,
  FlagEvaluationReason,
  FlagEvaluationResult,
  FlagMetrics,
  FlagValue,
} from './types';

// Emitters and payload types
export {
  createFlagContext,
  createTypedFlagEmitters,
  evaluateFlag,
  evaluateFlagBatch,
  FlagContextBuilder,
  isExperimentConversionPayload,
  isExperimentEnrollmentPayload,
  isFlagContextPayload,
  isFlagEvaluationPayload,
  isFlagExposurePayload,
  mergeFlagContexts,
  trackExperimentConversion,
  trackExperimentEnrollment,
  trackFlagExposure,
  trackFlagRuleChange,
  trackFlagStatusChange,
  updateFlagContext,
  validateFlagContext,
} from './emitters';

export type {
  ExperimentConversionPayload,
  ExperimentEnrollmentPayload,
  FeatureFlagPayload,
  FlagBatchEvaluationPayload,
  FlagContextPayload,
  FlagEvaluationPayload,
  FlagExposurePayload,
  FlagRuleChangePayload,
  FlagStatusPayload,
} from './emitters';

// Provider implementations
export { PostHogFlagProvider } from '../providers/posthog-flags';
export { LocalFlagProvider } from '../providers/local-flags';
export type {
  LocalFlagCondition,
  LocalFlagDefinition,
  LocalFlagOperator,
  LocalFlagRule,
} from '../providers/local-flags';

// Type utilities
export type {
  ExperimentConfig,
  ExperimentPrerequisite,
  ExperimentResult,
  ExperimentVariant,
  TypedFlag,
  TypedFlagMap,
} from './types';

export { defineFlag } from './types';

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
      strategy: 'ttl',
      ttl: options?.cacheTTL || 5 * 60 * 1000, // 5 minutes default
    });
  }

  const manager = new StandardFeatureFlagManager({
    primaryProvider: options?.primaryProvider,
    cache,
    debug: options?.debug,
  });

  // Add providers if specified
  if (options?.providers) {
    Promise.all(options.providers.map((config) => manager.addProvider(config))).catch((error) => {
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
  manager: FeatureFlagManager,
) {
  const emitters = createTypedFlagEmitters(flags);

  return {
    // Flag evaluation
    async get<K extends keyof T>(key: K, options?: FlagEvaluationOptions): Promise<T[K]> {
      const flag = flags[key];
      const result = await manager.getFlag(flag.key, flag.defaultValue, options);
      return result.value as T[K];
    },

    async getAll(options?: FlagEvaluationOptions): Promise<Partial<T>> {
      const flagKeys = Object.values(flags).map((f) => f.key);
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

    async isEnabled<K extends keyof T>(key: K, options?: FlagEvaluationOptions): Promise<boolean> {
      const result = await this.get(key, options);
      return Boolean(result);
    },

    // Emitters
    emitters,

    // Flag definitions
    flags,

    // Manager access
    manager,
  };
}

/**
 * Environment-specific flag configuration
 */
export function createEnvironmentConfig(
  environment: 'development' | 'staging' | 'production',
): FlagConfig[] {
  const configs: FlagConfig[] = [];

  switch (environment) {
    case 'development':
      // Use local provider with development defaults
      configs.push({
        provider: 'local',
        options: {
          flags: {
            'debug-mode': true,
            'mock-apis': true,
            'skip-auth': false,
            'verbose-logging': true,
          },
        },
      });
      break;

    case 'staging':
      // Use PostHog with staging environment
      configs.push({
        provider: 'posthog',
        options: {
          apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_STAGING_KEY,
          environment: 'staging',
        },
      });
      break;

    case 'production':
      // Use PostHog with production environment
      configs.push({
        provider: 'posthog',
        options: {
          apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
          environment: 'production',
        },
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
    type: 'boolean',
    defaultValue: false,
    description: 'Enable new design system',
    key: 'new-design',
  },

  betaFeatures: {
    type: 'boolean',
    defaultValue: false,
    description: 'Enable beta features',
    key: 'beta-features',
  },

  // Performance flags
  lazyLoading: {
    type: 'boolean',
    defaultValue: true,
    description: 'Enable lazy loading for images',
    key: 'lazy-loading',
  },

  // Feature rollout flags
  newCheckout: {
    type: 'boolean',
    defaultValue: false,
    description: 'Enable new checkout flow',
    key: 'new-checkout',
  },

  // A/B testing flags
  ctaVariant: {
    type: 'string',
    defaultValue: 'control',
    description: 'CTA button variant',
    key: 'cta-variant',
    variants: ['control', 'variant-a', 'variant-b'],
  },

  // Configuration flags
  maxItems: {
    type: 'number',
    defaultValue: 20,
    description: 'Maximum items per page',
    key: 'max-items-per-page',
  },

  // Integration flags
  analyticsProvider: {
    type: 'string',
    defaultValue: 'posthog',
    description: 'Primary analytics provider',
    key: 'analytics-provider',
    variants: ['posthog', 'mixpanel', 'amplitude'],
  },
} as const;

export type CommonFlags = typeof commonFlags;
