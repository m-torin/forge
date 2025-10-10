/**
 * Shared exports for both client and server environments
 * Contains types, utilities, and emitters that work universally
 */

// Export all types
export type {
  AnalyticsConfig,
  AnalyticsContext,
  // Core types
  AnalyticsProvider,
  ProviderConfig,
  ProviderFactory,
  ProviderRegistry,
  TrackingOptions,
} from './types/types';

// Export provider-specific types
export type {
  // Segment types
  SegmentConfig,
  SegmentOptions,
} from './types/segment-types';

export type {
  BootstrapData,
  EnhancedPostHogProvider,
  ExperimentInfo,
  // PostHog types
  PostHogConfig,
  PostHogCookie,
  PostHogOptions,
} from './types/posthog-types';

export type {
  // Vercel types
  VercelConfig,
  VercelOptions,
} from './types/vercel-types';

export type {
  // Console types
  ConsoleConfig,
  ConsoleOptions,
  LogLevel,
} from './types/console-types';

// Export emitter types
export type {
  AnalyticsEmitter,
  EmitterAliasPayload,
  EmitterBasePayload,
  EmitterConfig,
  EmitterContext,
  EmitterEventProperties,
  EmitterGroupPayload,
  EmitterGroupTraits,
  EmitterIdentifyPayload,
  EmitterIntegrations,
  EmitterOptions,
  EmitterPagePayload,
  EmitterPayload,
  EmitterScreenPayload,
  EmitterTrackPayload,
  EmitterUserTraits,
} from './emitters/emitter-types';

// Export all emitters
export * from './emitters';

// Export utilities
export {
  PROVIDER_REQUIREMENTS,
  createConfigBuilder,
  // Configuration
  getAnalyticsConfig,
  validateConfig,
} from './utils/config';

export type { ConfigBuilder, ConfigRequirements } from './utils/config';

// Export Node 22+ enhanced features
export {
  AdvancedEventBatcher,
  Node22AnalyticsManager,
  createNode22AnalyticsManager,
  node22Analytics,
} from './node22-features';

export {
  debugConfig,
  // Validation
  validateAnalyticsConfig,
  validateConfigOrThrow,
  validateProvider,
} from './utils/validation';

export type { ValidationError, ValidationResult } from './utils/validation';

export {
  // Manager
  createAnalyticsManager,
} from './utils/manager';

export { AnalyticsManager as AnalyticsManagerClass } from './utils/manager';

export {
  createBootstrapData,
  createMinimalBootstrapData,
  // PostHog utilities
  generateDistinctId,
  getCachedBootstrapData,
  getDistinctIdFromCookies,
  setCachedBootstrapData,
} from './utils/posthog-bootstrap';

export {
  createPostHogConfig,
  // PostHog Next.js utilities
  createPostHogServerClient,
  getCompleteBootstrapData,
} from './utils/posthog-next-utils';

export {
  createEmitterProcessor,
  processAliasPayload,
  // Emitter adapter utilities
  processEmitterPayload,
  processGroupPayload,
  processIdentifyPayload,
  processPagePayload,
  processTrackPayload,
  trackEcommerceEvent,
} from './utils/emitter-adapter';

// Export console provider (works in both environments)
export { ConsoleProvider } from './providers/console-provider';
