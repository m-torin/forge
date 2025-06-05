/**
 * Shared exports for both client and server environments
 * Contains types, utilities, and emitters that work universally
 */

// Export all types
export type {
  // Core types
  AnalyticsProvider,
  AnalyticsConfig,
  ProviderConfig,
  ProviderRegistry,
  ProviderFactory,
  TrackingOptions,
  AnalyticsContext
} from './types/types';

// Export provider-specific types
export type {
  // Segment types
  SegmentConfig,
  SegmentOptions
} from './types/segment-types';

export type {
  // PostHog types
  PostHogConfig,
  PostHogOptions,
  FeatureFlags,
  FeatureFlagPayload,
  BootstrapData,
  PostHogCookie,
  ExperimentInfo,
  EnhancedPostHogProvider
} from './types/posthog-types';

export type {
  // Vercel types
  VercelConfig,
  VercelOptions
} from './types/vercel-types';

export type {
  // Console types
  ConsoleConfig,
  ConsoleOptions,
  LogLevel
} from './types/console-types';

// Export emitter types
export type {
  EmitterOptions,
  EmitterContext,
  EmitterIntegrations,
  EmitterBasePayload,
  EmitterIdentifyPayload,
  EmitterTrackPayload,
  EmitterPagePayload,
  EmitterScreenPayload,
  EmitterGroupPayload,
  EmitterAliasPayload,
  EmitterPayload,
  EmitterUserTraits,
  EmitterEventProperties,
  EmitterGroupTraits,
  AnalyticsEmitter,
  EmitterConfig
} from './emitters/emitter-types';

// Export all emitters
export * from './emitters';

// Export utilities
export {
  // Configuration
  getAnalyticsConfig,
  createConfigBuilder,
  validateConfig,
  PROVIDER_REQUIREMENTS
} from './utils/config';

export type {
  ConfigBuilder,
  ConfigRequirements
} from './utils/config';

export {
  // Validation
  validateAnalyticsConfig,
  validateProvider,
  validateConfigOrThrow,
  debugConfig
} from './utils/validation';

export type {
  ValidationError,
  ValidationResult
} from './utils/validation';

export {
  // Manager
  createAnalyticsManager
} from './utils/manager';

export { AnalyticsManager as AnalyticsManagerClass } from './utils/manager';

export {
  // PostHog utilities
  generateDistinctId,
  getDistinctIdFromCookies,
  createBootstrapData,
  getCachedBootstrapData,
  setCachedBootstrapData,
  createMinimalBootstrapData
} from './utils/posthog-bootstrap';

export {
  // PostHog Next.js utilities
  createPostHogServerClient,
  isFeatureEnabled,
  getFeatureFlag,
  getAllFeatureFlags,
  getCompleteBootstrapData,
  createPostHogConfig
} from './utils/posthog-next-utils';

export {
  // Emitter adapter utilities
  processEmitterPayload,
  processIdentifyPayload,
  processTrackPayload,
  processPagePayload,
  processGroupPayload,
  processAliasPayload,
  createEmitterProcessor,
  trackEcommerceEvent
} from './utils/emitter-adapter';

// Export console provider (works in both environments)
export { ConsoleProvider } from './providers/console-provider';