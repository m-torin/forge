/**
 * Server-side Next.js analytics exports
 * Complete Next.js 15 integration for server components, API routes, and middleware
 * 
 * @example
 * ```typescript
 * import { 
 *   createNextJSServerAnalytics,
 *   trackServerEvent,
 *   getServerFeatureFlag,
 *   createAnalyticsMiddleware
 * } from '@repo/analytics/server/next';
 * 
 * // Server component
 * export default async function Page() {
 *   await trackServerEvent('Page Viewed', { path: '/home' });
 *   const showFeature = await getServerFeatureFlag('new-feature', cookies());
 *   return <div>{showFeature && <NewFeature />}</div>;
 * }
 * 
 * // Middleware
 * export const middleware = createAnalyticsMiddleware({
 *   providers: { segment: { writeKey: process.env.SEGMENT_WRITE_KEY } }
 * });
 * ```
 */

// ============================================================================
// CORE SERVER ANALYTICS (re-export everything from server)
// ============================================================================

// Re-export everything from server for convenience
export * from './server';

// ============================================================================
// REACT SERVER COMPONENTS
// ============================================================================

export {
  // Server component tracking functions
  trackServerEvent,
  identifyServerUser,
  trackServerPageView,
  
  // Server Actions support
  trackEventAction,
  identifyUserAction,
  
  // Context management for RSCs
  ServerAnalyticsProvider,
  withServerPageTracking,
  createServerFeatureFlags,
  
  // Server-side feature flag functions
  getServerFeatureFlag,
  isServerFeatureEnabled,
  getAllServerFeatureFlags,
  getServerBootstrapData
} from './next/rsc';

// ============================================================================
// NEXT.JS SERVER ANALYTICS MANAGER
// ============================================================================

export {
  // Next.js server analytics manager
  NextJSServerAnalyticsManager,
  createNextJSServerAnalytics,
  createNextJSServerAnalyticsWithBootstrap
} from './next/server';

export type {
  NextJSServerAnalyticsConfig
} from './next/server';

// ============================================================================
// POSTHOG SERVER-SIDE FEATURE FLAGS
// ============================================================================

export {
  // Server-side feature flag functions
  isFeatureEnabledOnServer,
  getFeatureFlagOnServer,
  getAllFeatureFlagsOnServer,
  getPostHogBootstrapDataOnServer
} from './next/server';

// PostHog server utilities (from next-utils)
export {
  createPostHogServerClient,
  getOrGenerateDistinctId,
  getPostHogBootstrapData,
  createPostHogConfig,
  createPostHogSuspenseData,
  createPostHogMiddleware,
  getCompleteBootstrapData,
  // Enhanced feature flag utilities
  getFeatureFlagWithFallback,
  getFeatureFlagVariant,
  trackFeatureFlagExposure,
  getMultipleFeatureFlags
} from './shared/utils/posthog-next-utils';

// ============================================================================
// FEATURE FLAGS FOR NEXT.JS SERVER
// ============================================================================

// Import feature flag functions for convenience exports
import {
  evaluateFlag,
  trackFlagExposure,
  createFlagContext,
  createFeatureFlagManager,
  createTypedFeatureFlags,
  commonFlags
} from './shared/feature-flags';
import {
  getFeatureFlagWithFallback,
  getFeatureFlagVariant
} from './shared/utils/posthog-next-utils';

// Server-side feature flag helpers optimized for Next.js RSC
export const nextServerFlags = {
  // Server-side flag evaluation with cookies integration
  evaluate: async (key: string, defaultValue: any, cookies?: any) => {
    // This would integrate with PostHog server client and cookies
    return defaultValue; // Placeholder
  },
  
  // Batch server-side flag evaluation
  evaluateBatch: async (flags: string[], cookies?: any) => {
    // This would integrate with PostHog server batch evaluation
    return {}; // Placeholder
  },
  
  // PostHog server integration helpers
  posthog: {
    evaluate: evaluateFlag,
    track: trackFlagExposure,
    context: createFlagContext,
    withCookies: (cookies: any) => ({
      evaluate: (key: string, defaultValue: any) => getFeatureFlagWithFallback(key, cookies, process.env.NEXT_PUBLIC_POSTHOG_KEY || '', { defaultValue }),
      variant: (key: string) => getFeatureFlagVariant(key, cookies, process.env.NEXT_PUBLIC_POSTHOG_KEY || '')
    })
  }
};

// Re-export feature flag system for Next.js server
export const flagsServer = {
  manager: createFeatureFlagManager,
  typed: createTypedFeatureFlags,
  context: createFlagContext,
  evaluate: evaluateFlag,
  track: trackFlagExposure,
  common: commonFlags,
  nextjs: nextServerFlags
};

// ============================================================================
// MIDDLEWARE INTEGRATION
// ============================================================================

export {
  // Analytics middleware for edge runtime
  createAnalyticsMiddleware
} from './next/middleware';

export type {
  // Middleware types
  AnalyticsMiddlewareConfig
} from './next/middleware';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

export type {
  // Next.js specific types that actually exist
  AnalyticsEvent,
  PageViewEvent,
  ProductViewEvent,
  AddToCartEvent,
  CheckoutEvent,
  PurchaseEvent,
  FormStartEvent,
  FormSubmitEvent,
  FormErrorEvent,
  AnalyticsMiddlewareContext,
  TrackedComponentProps,
  UseAnalyticsReturn,
  UseFeatureFlagsReturn,
  AnalyticsProviderProps,
  EventProperties,
  EventName,
  TypedTrackFunction
} from './next/types.d';

// ============================================================================
// USAGE EXAMPLES & PATTERNS
// ============================================================================

/**
 * Example usage patterns for server-side Next.js analytics
 * 
 * @example Server component tracking
 * ```typescript
 * import { trackServerEvent, getServerFeatureFlag } from '@repo/analytics/server/next';
 * import { cookies } from 'next/headers';
 * 
 * export default async function HomePage() {
 *   // Track page view
 *   await trackServerEvent('Page Viewed', {
 *     path: '/home',
 *     title: 'Home Page'
 *   });
 *   
 *   // Check feature flag
 *   const showBeta = await getServerFeatureFlag('beta-feature', cookies());
 *   
 *   return (
 *     <div>
 *       <h1>Welcome</h1>
 *       {showBeta && <BetaFeature />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example API route tracking
 * ```typescript
 * import { createServerAnalytics, track } from '@repo/analytics/server/next';
 * 
 * const analytics = await createServerAnalytics({
 *   providers: {
 *     segment: { writeKey: process.env.SEGMENT_WRITE_KEY }
 *   }
 * });
 * 
 * export async function POST(request: Request) {
 *   await analytics.emit(track('API Called', {
 *     endpoint: '/api/users',
 *     method: 'POST'
 *   }));
 *   
 *   // Handle request...
 * }
 * ```
 * 
 * @example Server Actions
 * ```typescript
 * 'use server';
 * import { trackServerAction } from '@repo/analytics/server/next';
 * 
 * export async function submitForm(formData: FormData) {
 *   await trackServerAction('Form Submitted', {
 *     form_id: 'contact',
 *     email: formData.get('email')
 *   });
 *   
 *   // Process form...
 * }
 * ```
 * 
 * @example Middleware setup
 * ```typescript
 * // middleware.ts
 * import { createAnalyticsMiddleware } from '@repo/analytics/server/next';
 * 
 * export const middleware = createAnalyticsMiddleware({
 *   providers: {
 *     segment: { writeKey: process.env.SEGMENT_WRITE_KEY }
 *   },
 *   matchers: ['/api/*', '/app/*'],
 *   exclude: ['/api/health'],
 *   extractUserId: (request) => request.headers.get('x-user-id'),
 *   extractContext: (request) => ({
 *     ip: request.ip,
 *     country: request.geo?.country
 *   })
 * });
 * 
 * export const config = {
 *   matcher: ['/((?!_next/static|favicon.ico).*)']
 * };
 * ```
 */