/**
 * Next.js client exports
 */

'use client';

// Export Next.js specific analytics manager
export {
  createNextJSClientAnalytics,
  createNextJSClientAnalyticsUninitialized,
} from './client/next/manager';

// Export Next.js hooks
export {
  useAnalytics,
  usePageTracking,
  useTrackEvent,
  useIdentifyUser,
  resetAnalytics,
} from './client/next/hooks';

// Export Next.js components
export {
  AnalyticsProvider,
  TrackedButton,
  TrackedLink,
  withViewTracking,
} from './client/next/components';

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

// Validation utilities removed - validation should happen on the server side only
// This follows the four-file export pattern to avoid importing server-only dependencies

// Export PostHog utilities
export {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from './shared/utils/posthog-bootstrap';

// Export types
export type * from './types';
