/**
 * Next.js Analytics Integration
 * Comprehensive analytics solution for Next.js 15 with App Router support
 */

// Client-side exports
export {
  NextJSClientAnalyticsManager,
  createNextJSClientAnalytics,
  createPostHogConfigWithBootstrap,
  getAnalyticsScriptProps,
  type NextJSClientAnalyticsConfig,
} from './client';

// Server-side exports
export {
  NextJSServerAnalyticsManager,
  createNextJSServerAnalytics,
  createNextJSServerAnalyticsWithBootstrap,
  getPostHogBootstrapDataOnServer,
  type NextJSServerAnalyticsConfig,
} from './server';

// React Server Component exports
export {
  ServerAnalyticsProvider,
  getServerBootstrapData,
  identifyServerUser,
  identifyUserAction,
  trackEventAction,
  trackServerEvent,
  trackServerPageView,
  withServerPageTracking,
} from './rsc';

// App Router specific exports
export {
  AnalyticsProvider as ClientAnalyticsProvider,
  TrackedButton,
  TrackedLink,
  resetAnalytics,
  useAnalytics,
  useAnalyticsConsent,
  useEcommerceTracking,
  useFormTracking,
  useIdentifyUser,
  usePageTracking,
  useTrackEvent,
  withViewTracking,
} from './app-router';

// Middleware exports
export {
  composeMiddleware,
  conditionalAnalyticsMiddleware,
  createAnalyticsMiddleware,
  createAnalyticsMiddlewareConfig,
  getAnalyticsContextFromHeaders,
  getDistinctIdFromHeaders,
  type AnalyticsMiddlewareConfig,
} from './middleware';

// Re-export types
export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsProvider,
  ProviderConfig,
  TrackingOptions,
} from '../shared/types/types';

export type { BootstrapData, PostHogConfig } from '../shared/types/posthog-types';

// Export utilities
export {
  createBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from '../shared/utils/posthog-bootstrap';
