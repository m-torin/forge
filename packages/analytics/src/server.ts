/**
 * Server exports for Node.js environments (non-Next.js)
 */

// Export core server functions
export { createServerAnalytics, createServerAnalyticsUninitialized } from './server/manager';

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

// Export configuration utilities
export {
  PROVIDER_REQUIREMENTS,
  createConfigBuilder,
  getAnalyticsConfig,
  validateConfig,
} from './shared/utils/config';

// Export validation utilities
export {
  debugConfig,
  validateAnalyticsConfig,
  validateConfigOrThrow,
  validateProvider,
} from './shared/utils/validation';

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
} from './shared/utils/posthog-bootstrap';

// Export types
export type * from './types';
