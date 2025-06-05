/**
 * Next.js Analytics Integration
 * Comprehensive analytics solution for Next.js 15 with App Router support
 */

// Client-side exports
export {
  createNextJSClientAnalytics,
  createPostHogConfigWithBootstrap,
  getAnalyticsScriptProps,
  type NextJSClientAnalyticsConfig,
  NextJSClientAnalyticsManager,
} from './client';

// Server-side exports
export {
  createNextJSServerAnalytics,
  createNextJSServerAnalyticsWithBootstrap,
  getAllFeatureFlagsOnServer,
  getFeatureFlagOnServer,
  getPostHogBootstrapDataOnServer,
  isFeatureEnabledOnServer,
  type NextJSServerAnalyticsConfig,
  NextJSServerAnalyticsManager,
} from './server';

// React Server Component exports
export {
  createServerFeatureFlags,
  getAllServerFeatureFlags,
  getServerBootstrapData,
  getServerFeatureFlag,
  identifyServerUser,
  identifyUserAction,
  isServerFeatureEnabled,
  ServerAnalyticsProvider,
  trackEventAction,
  trackServerEvent,
  trackServerPageView,
  withServerPageTracking,
} from './rsc';

// App Router specific exports
export {
  AnalyticsProvider as ClientAnalyticsProvider,
  resetAnalytics,
  TrackedButton,
  TrackedLink,
  useAnalytics,
  useAnalyticsConsent,
  useEcommerceTracking,
  useFeatureFlag,
  useFeatureFlags,
  useFormTracking,
  useIdentifyUser,
  usePageTracking,
  useTrackEvent,
  withViewTracking,
} from './app-router';

// Middleware exports
export {
  type AnalyticsMiddlewareConfig,
  composeMiddleware,
  conditionalAnalyticsMiddleware,
  createAnalyticsMiddleware,
  createAnalyticsMiddlewareConfig,
  getAnalyticsContextFromHeaders,
  getDistinctIdFromHeaders,
} from './middleware';

// Re-export types
export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsProvider,
  ProviderConfig,
  TrackingOptions,
} from '../shared/types/types';

export type {
  BootstrapData,
  FeatureFlagPayload,
  FeatureFlags,
  PostHogConfig,
} from '../shared/types/posthog-types';

// Export utilities
export {
  createBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from '../shared/utils/posthog-bootstrap';
