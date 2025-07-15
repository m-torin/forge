/**
 * Client exports for browser environments (non-Next.js)
 */

// Export core client functions
export { createClientAnalytics, createClientAnalyticsUninitialized } from './client/manager';

// Export all emitters - these are the preferred way to track events
export {
  // Emitter utilities
  ContextBuilder,
  EventBatch,
  PayloadBuilder,
  alias,
  createAnonymousSession,
  createUserSession,
  // Ecommerce emitters namespace
  ecommerce,
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
  PROVIDER_REQUIREMENTS,
  createConfigBuilder,
  getAnalyticsConfig,
  validateConfig,
} from './shared/utils/config-client';

// Export client-safe validation utilities
export { validateAnalyticsConfig, validateProvider } from './shared/utils/validation-client';

// Export manager utilities
export {
  AnalyticsManager as AnalyticsManagerClass,
  createAnalyticsManager,
} from './shared/utils/manager';

// Export PostHog utilities
export {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from './shared/utils/posthog-bootstrap';

// Export types
export type * from './types';
