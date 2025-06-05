/**
 * Next.js Analytics Integration
 * Comprehensive analytics solution for Next.js 15 with App Router support
 */

// Client-side exports
export {
  createNextJSClientAnalytics,
  NextJSClientAnalyticsManager,
  type NextJSClientAnalyticsConfig,
  getAnalyticsScriptProps,
  createPostHogConfigWithBootstrap
} from './client';

// Server-side exports
export {
  createNextJSServerAnalytics,
  NextJSServerAnalyticsManager,
  type NextJSServerAnalyticsConfig,
  isFeatureEnabledOnServer,
  getFeatureFlagOnServer,
  getAllFeatureFlagsOnServer,
  getPostHogBootstrapDataOnServer,
  createNextJSServerAnalyticsWithBootstrap
} from './server';

// React Server Component exports
export {
  trackServerEvent,
  identifyServerUser,
  trackServerPageView,
  getServerFeatureFlag,
  isServerFeatureEnabled,
  getAllServerFeatureFlags,
  getServerBootstrapData,
  ServerAnalyticsProvider,
  withServerPageTracking,
  createServerFeatureFlags,
  trackEventAction,
  identifyUserAction
} from './rsc';

// App Router specific exports
export {
  useAnalytics,
  usePageTracking,
  useTrackEvent,
  useIdentifyUser,
  useFeatureFlag,
  useFeatureFlags,
  useAnalyticsConsent,
  AnalyticsProvider as ClientAnalyticsProvider,
  withViewTracking,
  TrackedButton,
  TrackedLink,
  useFormTracking,
  useEcommerceTracking,
  resetAnalytics
} from './app-router';

// Middleware exports
export {
  createAnalyticsMiddleware,
  createAnalyticsMiddlewareConfig,
  getAnalyticsContextFromHeaders,
  getDistinctIdFromHeaders,
  conditionalAnalyticsMiddleware,
  composeMiddleware,
  type AnalyticsMiddlewareConfig
} from './middleware';

// Re-export types
export type {
  AnalyticsConfig,
  AnalyticsProvider,
  TrackingOptions,
  ProviderConfig,
  AnalyticsContext
} from '../shared/types/types';

export type {
  BootstrapData,
  FeatureFlags,
  FeatureFlagPayload,
  PostHogConfig
} from '../shared/types/posthog-types';

// Export utilities
export {
  generateDistinctId,
  getDistinctIdFromCookies,
  createBootstrapData
} from '../shared/utils/posthog-bootstrap';