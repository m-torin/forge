/**
 * Server-side analytics exports
 * Complete analytics solution for server/Node.js environments
 * 
 * @example
 * ```typescript
 * import { createServerAnalytics, track, ecommerce } from '@repo/analytics/server';
 * 
 * const analytics = await createServerAnalytics({
 *   providers: {
 *     segment: { writeKey: 'xxx' },
 *     posthog: { apiKey: 'yyy' }
 *   }
 * });
 * 
 * // Preferred: Use emitters
 * await analytics.emit(track('API Called', { endpoint: '/users' }));
 * await analytics.emit(ecommerce.orderCompleted({ order_id: '123' }));
 * ```
 */

import { SegmentServerProvider } from './server/providers/segment-server';
import { PostHogServerProvider } from './server/providers/posthog-server';
import { VercelServerProvider } from './server/providers/vercel-server';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createAnalyticsManager } from './shared/utils/manager';
import type { AnalyticsConfig, ProviderRegistry, AnalyticsManager } from './shared/types/types';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  segment: (config) => new SegmentServerProvider(config),
  posthog: (config) => new PostHogServerProvider(config),
  vercel: (config) => new VercelServerProvider(config),
  console: (config) => new ConsoleProvider(config)
};

// ============================================================================
// CORE ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Create and initialize a server analytics instance
 * This is the primary way to create analytics for server-side applications
 */
export async function createServerAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const manager = createAnalyticsManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a server analytics instance without initializing
 * Useful when you need to control initialization timing
 */
export function createServerAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, SERVER_PROVIDERS);
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
  BootstrapData,
  EnhancedPostHogProvider
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

// PostHog server utilities
export {
  generateDistinctId,
  getDistinctIdFromCookies,
  createBootstrapData,
  createMinimalBootstrapData
} from './shared/utils/posthog-bootstrap';

export {
  createPostHogServerClient,
  isFeatureEnabled,
  getFeatureFlag,
  getAllFeatureFlags,
  getCompleteBootstrapData,
  createPostHogConfig
} from './shared/utils/posthog-next-utils';

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

// Feature flag helpers for server-side
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