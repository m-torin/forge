/**
 * Client exports for browser environments (non-Next.js)
 */

// Export core client functions
export { createClientAnalytics, createClientAnalyticsUninitialized } from './client/manager';

// Export all emitters - these are the preferred way to track events
export {
  alias,
  // Emitter utilities
  ContextBuilder,
  createAnonymousSession,
  createUserSession,
  // Ecommerce emitters namespace
  ecommerce,
  EventBatch,
  group,
  // Core Segment.io spec emitters
  identify,
  isAliasPayload,
  isGroupPayload,
  isIdentifyPayload,
  isPagePayload,
  // Type guards
  isTrackPayload,
  page,
  PayloadBuilder,
  screen,
  track,
  withMetadata,
  withUTM,
} from './shared/emitters';

// Export adapter utilities
export {
  createEmitterProcessor,
  // Emitter processing utilities
  processEmitterPayload,
  trackEcommerceEvent,
} from './shared/utils/emitter-adapter';

// Export client-safe configuration utilities
export {
  createConfigBuilder,
  getAnalyticsConfig,
  PROVIDER_REQUIREMENTS,
  validateConfig,
} from './shared/utils/config-client';

// Export client-safe validation utilities
export { validateAnalyticsConfig, validateProvider } from './shared/utils/validation-client';

// Export manager utilities
export { createAnalyticsManager } from './shared/utils/manager';
export { AnalyticsManager as AnalyticsManagerClass } from './shared/utils/manager';

// Export PostHog utilities
export {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from './shared/utils/posthog-bootstrap';

// Export types
export type * from './types';
