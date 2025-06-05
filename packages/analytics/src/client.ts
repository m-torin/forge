/**
 * Client-side analytics exports
 * Complete analytics solution for browser/client environments
 * 
 * @example
 * ```typescript
 * import { createClientAnalytics, track, ecommerce } from '@repo/analytics/client';
 * 
 * const analytics = await createClientAnalytics({
 *   providers: {
 *     segment: { writeKey: 'xxx' },
 *     posthog: { apiKey: 'yyy' }
 *   }
 * });
 * 
 * // Preferred: Use emitters
 * await analytics.emit(track('Button Clicked', { color: 'blue' }));
 * await analytics.emit(ecommerce.productViewed({ product_id: '123' }));
 * ```
 */

import { SegmentClientProvider } from './client/providers/segment-client';
import { PostHogClientProvider } from './client/providers/posthog-client';
import { VercelClientProvider } from './client/providers/vercel-client';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createAnalyticsManager } from './shared/utils/manager';
import type { AnalyticsConfig, ProviderRegistry, AnalyticsManager } from './shared/types/types';

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  segment: (config) => new SegmentClientProvider(config),
  posthog: (config) => new PostHogClientProvider(config),
  vercel: (config) => new VercelClientProvider(config),
  console: (config) => new ConsoleProvider(config)
};

// ============================================================================
// CORE ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Create and initialize a client analytics instance
 * This is the primary way to create analytics for client-side applications
 */
export async function createClientAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const manager = createAnalyticsManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a client analytics instance without initializing
 * Useful when you need to control initialization timing
 */
export function createClientAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, CLIENT_PROVIDERS);
}

// ============================================================================
// EMITTERS - PRIMARY INTERFACE
// ============================================================================

// Export all core emitters - these are the preferred way to track events
export {
  // Core Segment.io spec emitters
  identify,
  track,
  page,
  screen,
  group,
  alias,
  
  // Emitter utilities
  ContextBuilder,
  PayloadBuilder,
  EventBatch,
  createUserSession,
  createAnonymousSession,
  withMetadata,
  withUTM,
  
  // Type guards
  isTrackPayload,
  isIdentifyPayload,
  isPagePayload,
  isGroupPayload,
  isAliasPayload,
  
  // Ecommerce emitters namespace
  ecommerce
} from './shared/emitters';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export {
  // Emitter processing utilities
  processEmitterPayload,
  createEmitterProcessor,
  trackEcommerceEvent
} from './shared/utils/emitter-adapter';

// ============================================================================
// TYPES
// ============================================================================

// Core analytics types
export type { 
  AnalyticsConfig, 
  TrackingOptions, 
  ProviderConfig,
  AnalyticsProvider,
  AnalyticsContext,
  AnalyticsManager 
} from './shared/types/types';

// Emitter types
export type {
  EmitterOptions,
  EmitterContext,
  EmitterPayload,
  EmitterIdentifyPayload,
  EmitterTrackPayload,
  EmitterPagePayload,
  EmitterGroupPayload,
  EmitterAliasPayload
} from './shared/emitters/emitter-types';

// Provider-specific types
export type {
  SegmentConfig,
  SegmentOptions
} from './shared/types/segment-types';

export type {
  PostHogConfig,
  PostHogOptions,
  BootstrapData
} from './shared/types/posthog-types';

export type {
  VercelConfig,
  VercelOptions
} from './shared/types/vercel-types';

export type {
  ConsoleConfig,
  ConsoleOptions
} from './shared/types/console-types';

// Ecommerce types
export type {
  EcommerceEventSpec,
  BaseProductProperties,
  ExtendedProductProperties,
  CartProperties,
  OrderProperties
} from './shared/emitters/ecommerce/types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export { 
  getAnalyticsConfig, 
  createConfigBuilder, 
  validateConfig,
  PROVIDER_REQUIREMENTS 
} from './shared/utils/config';

export type {
  ConfigBuilder,
  ConfigRequirements
} from './shared/utils/config';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export { 
  validateAnalyticsConfig, 
  validateProvider,
  validateConfigOrThrow,
  debugConfig 
} from './shared/utils/validation';

export type {
  ValidationError,
  ValidationResult
} from './shared/utils/validation';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Manager utilities
export { createAnalyticsManager } from './shared/utils/manager';
export { AnalyticsManager as AnalyticsManagerClass } from './shared/utils/manager';

// PostHog utilities
export {
  generateDistinctId,
  getDistinctIdFromCookies,
  createBootstrapData,
  createMinimalBootstrapData
} from './shared/utils/posthog-bootstrap';

// ============================================================================
// FEATURE FLAGS
// ============================================================================

// Core feature flag exports
export {
  StandardFeatureFlagManager,
  MemoryFlagCache,
  createFeatureFlagManager,
  createTypedFeatureFlags,
  createEnvironmentConfig,
  commonFlags
} from './shared/feature-flags';

// Feature flag types
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
  FlagEvaluationReason,
  TypedFlag,
  TypedFlagMap,
  CommonFlags
} from './shared/feature-flags';

// Feature flag emitters
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
} from './shared/feature-flags';

// Feature flag providers
export { PostHogFlagProvider } from './shared/feature-flags';
export { LocalFlagProvider } from './shared/feature-flags';
export type {
  LocalFlagDefinition,
  LocalFlagRule,
  LocalFlagCondition,
  LocalFlagOperator
} from './shared/feature-flags';

// Feature flag payload types
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
} from './shared/feature-flags';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Import feature flag functions for convenience exports
import {
  evaluateFlag,
  trackFlagExposure,
  updateFlagContext,
  evaluateFlagBatch,
  createFeatureFlagManager,
  createTypedFeatureFlags,
  createFlagContext,
  commonFlags
} from './shared/feature-flags';

// Feature flag helpers for client-side
export const flag = {
  evaluate: evaluateFlag,
  track: trackFlagExposure,
  updateContext: updateFlagContext,
  batch: evaluateFlagBatch
};

// Feature flags default utilities
export const flags = {
  manager: createFeatureFlagManager,
  typed: createTypedFeatureFlags,
  context: createFlagContext,
  evaluate: evaluateFlag,
  track: trackFlagExposure,
  common: commonFlags
};